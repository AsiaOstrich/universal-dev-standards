#!/usr/bin/env node
/**
 * UDS Hook: Commit Message Format Validator
 *
 * Validates commit messages against Conventional Commits format.
 * Exit code: 0 = valid, 1 = invalid
 *
 * Two callers, two contracts:
 *   - git hook / CLI:  node validate-commit-msg.mjs "feat(scope): msg"
 *                      or a raw message on stdin. Exit 1 when invalid.
 *   - Claude Code PreToolUse(Bash): the hook payload arrives as JSON on stdin.
 *                      Exit 2 blocks the tool call; anything that is not a
 *                      `git commit` carrying its message on the command line
 *                      (-m, -am, -mmsg, --message=msg, several -m) is none of
 *                      this hook's business: -F, -C, --amend --no-edit, the
 *                      editor, --fixup/--squash and shell-computed messages
 *                      ($MSG, $(...)) are allowed because the text is not there
 *                      to judge. The heredoc form is judged by its body.
 *
 * 🔴 It was registered on UserPromptSubmit and read stdin as a raw commit
 * message, so in an adopter's session it ran on EVERY prompt, failed to parse
 * the hook payload as Conventional Commits, and exited 1 every time. Found by
 * check-hook-delivery.ts, which executes each installed hook rather than
 * checking that the file exists.
 *
 * Performance target: < 500ms
 *
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md (REQ-1)
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Used only when the project has no commit-message option file: the Conventional Commits set. Same list `uds simulate
 * -s commit-message` falls back to (FALLBACK_TYPES in cli/src/utils/commit-message-judge.js).
 */
const FALLBACK_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert',
];

/**
 * The commit types the project allows: those listed by the commit-message option files installed in
 * `.standards/options/` (a file whose `meta.parent` is `commit-message`), or the fallback set when there are none.
 *
 * XSPEC-482 R12: this was a fixed list that lacked `security`, so `uds simulate` (which reads these same files) passed
 * `security(auth): rotate keys` and this hook refused it. The two now read one source. The hook has no YAML parser
 * to lean on (it runs in the adopter's project with no dependencies), so it reads the two things it needs line by line:
 * the `parent:` of the `meta:` block and the `- type:` entries under `types:`.
 *
 * @param {string} [root] - the project root; defaults to $CLAUDE_PROJECT_DIR or the working directory
 * @returns {string[]}
 */
export function allowedTypes(root = process.env.CLAUDE_PROJECT_DIR || process.cwd()) {
  const found = new Set();
  const optionsDir = join(root, '.standards', 'options');
  for (const dir of [optionsDir, join(optionsDir, 'commit-message')]) {
    if (!existsSync(dir)) continue;
    let names = [];
    try { names = readdirSync(dir).filter((n) => n.endsWith('.ai.yaml')); } catch { continue; }
    for (const name of names) {
      let text = '';
      try { text = readFileSync(join(dir, name), 'utf-8').replace(/\r\n/g, '\n'); } catch { continue; }
      if (!/^\s+parent:\s*["']?commit-message["']?\s*$/m.test(text)) continue;
      const lines = text.split('\n');
      const start = lines.findIndex((l) => /^types:\s*$/.test(l));
      if (start === -1) continue;
      for (let i = start + 1; i < lines.length; i++) {
        if (/^\S/.test(lines[i]) && !lines[i].startsWith('#')) break; // next top-level key
        const m = /^\s*-\s+type:\s*["']?([^"'#\s][^"'#]*?)["']?\s*(?:#.*)?$/.exec(lines[i]);
        if (m) found.add(m[1]);
      }
    }
  }
  return found.size > 0 ? [...found] : FALLBACK_TYPES;
}

const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Validate a commit message against Conventional Commits format.
 * @param {string} msg - The commit message to validate
 * @param {string[]} [types] - the allowed types (default: the project's, see allowedTypes)
 * @returns {boolean} true if valid
 */
export function validateCommitMessage(msg, types = allowedTypes()) {
  if (!msg || typeof msg !== 'string') return false;
  // `type(scope)!: subject`: scope and the breaking-change mark are optional, as in `uds simulate`.
  const pattern = new RegExp(`^(${types.map(escapeRe).join('|')})(\\(.+\\))?!?:\\s.+`, 'u');
  return pattern.test(msg.trim());
}

// CLI mode.
function complain(msg) {
  console.error(`❌ Invalid commit message format: "${msg}"`);
  console.error(`   Expected: <type>(<scope>): <subject>`);
  console.error(`   Valid types: ${allowedTypes().join(', ')}`);
}

/**
 * `git commit -m "$(cat <<'EOF' ... EOF)"`, the form Claude Code itself writes most often. Group 2 is the quote of
 * the delimiter (empty = unquoted, so the shell would still expand `$` in the body), group 4 is the body.
 */
const HEREDOC_SUBSTITUTION = /^\$\(\s*cat\s+<<(-?)\s*(['"]?)(\w+)\2[ \t]*\n([\s\S]*?)\n[ \t]*\3[ \t]*\n?\s*\)/;

/**
 * Split a shell command line into segments (at `&&`, `||`, `;`, `|` and newline that are NOT inside quotes) of
 * words, resolving quotes and backslashes the way a POSIX shell does. A word carries `dynamic: true` when the
 * shell would compute part of it (`$VAR`, `$(...)`, backticks), because then its text is not what git receives.
 *
 * Splitting before honouring quotes was the bug behind three false blocks: a message containing `;` or `&&`,
 * and the `$(cat <<'EOF' ...)` form, whose newlines cut the command in the middle of the message.
 *
 * @param {string} command
 * @returns {{ text: string, dynamic: boolean }[][] | null} null when the quoting is unbalanced
 */
function tokenize(command) {
  const n = command.length;
  const segments = [];
  let words = [];
  let text = '';
  let started = false;   // a word is in progress (so `""` is an empty word, not nothing)
  let dynamic = false;
  const add = (s) => { text += s; started = true; };
  const endWord = () => {
    if (started) words.push({ text, dynamic });
    text = ''; started = false; dynamic = false;
  };
  const endSegment = () => {
    endWord();
    if (words.length > 0) segments.push(words);
    words = [];
  };

  /** `(` at i ... matching `)`: index just after it, or -1. Honours quotes and backslashes inside. */
  const skipParens = (i) => {
    let depth = 0;
    for (let j = i; j < n; j++) {
      const ch = command[j];
      if (ch === '\\') j++;
      else if (ch === "'") { j = command.indexOf("'", j + 1); if (j < 0) return -1; }
      else if (ch === '"') {
        for (j++; j < n && command[j] !== '"'; j++) if (command[j] === '\\') j++;
        if (j >= n) return -1;
      } else if (ch === '(') depth++;
      else if (ch === ')' && --depth === 0) return j + 1;
    }
    return -1;
  };

  /** A `$` or backtick at i. Returns the index after the expansion, or -1 when it never closes. */
  const expansion = (i, inDouble) => {
    const ch = command[i];
    started = true;
    if (ch === '`') {
      for (let j = i + 1; j < n; j++) {
        if (command[j] === '\\') j++;
        else if (command[j] === '`') { dynamic = true; return j + 1; }
      }
      return -1;
    }
    const next = command[i + 1];
    if (next === '(') { dynamic = true; return skipParens(i + 1); }
    if (next === '{') {
      const j = command.indexOf('}', i + 2);
      dynamic = true;
      return j < 0 ? -1 : j + 1;
    }
    if (!inDouble && next === "'") {            // $'...' (ANSI-C quoting)
      let j = i + 2;
      let out = '';
      for (; j < n && command[j] !== "'"; j++) {
        if (command[j] === '\\' && j + 1 < n) {
          j++;
          out += ({ n: '\n', t: '\t', r: '\r' })[command[j]] ?? command[j];
        } else out += command[j];
      }
      if (j >= n) return -1;
      add(out);
      return j + 1;
    }
    if (next !== undefined && /[A-Za-z0-9_@*#?!$-]/.test(next)) {
      dynamic = true;
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_]/.test(command[j])) j++;
      return j === i + 1 ? i + 2 : j;           // `$?`, `$$`, `$1`: one character
    }
    add('$');                                   // a lone `$` is just a dollar sign
    return i + 1;
  };

  /** After an opening `"` at i - 1. Returns the index after the closing quote, or -1. */
  const doubleQuoted = (i) => {
    started = true;
    const heredoc = HEREDOC_SUBSTITUTION.exec(command.slice(i));
    if (heredoc && command[i + heredoc[0].length] === '"') {
      const body = heredoc[1] === '-' ? heredoc[4].replace(/^\t+/gm, '') : heredoc[4];
      add(body);
      if (heredoc[2] === '' && /[$`]/.test(body)) dynamic = true;
      return i + heredoc[0].length + 1;
    }
    while (i < n) {
      const ch = command[i];
      if (ch === '"') return i + 1;
      if (ch === '\\') {
        const next = command[i + 1];
        if (next !== undefined && '$`"\\\n'.includes(next)) { if (next !== '\n') add(next); i += 2; }
        else { add('\\'); i++; }
      } else if (ch === '$' || ch === '`') {
        i = expansion(i, true);
        if (i < 0) return -1;
      } else { add(ch); i++; }
    }
    return -1;
  };

  let i = 0;
  while (i < n) {
    const ch = command[i];
    if (ch === ' ' || ch === '\t' || ch === '\r') { endWord(); i++; }
    else if (ch === '\n' || ch === ';' || ch === '|') { endSegment(); i++; }
    else if (ch === '&' && command[i + 1] === '&') { endSegment(); i += 2; }
    else if (ch === '\\') {
      if (command[i + 1] === '\n') i += 2;      // line continuation
      else if (i + 1 < n) { add(command[i + 1]); i += 2; }
      else i++;
    } else if (ch === "'") {
      const j = command.indexOf("'", i + 1);
      if (j < 0) return null;
      add(command.slice(i + 1, j));
      i = j + 1;
    } else if (ch === '"') {
      i = doubleQuoted(i + 1);
      if (i < 0) return null;
    } else if (ch === '$' || ch === '`') {
      i = expansion(i, false);
      if (i < 0) return null;
    } else { add(ch); i++; }
  }
  endSegment();
  return segments;
}

/** `git` options that take the next word as their value when written without `=`. */
const GIT_GLOBAL_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--super-prefix', '--config-env', '--attr-source']);

/** Short `git commit` options whose value is the rest of the cluster, or the next word when the cluster ends there. */
const COMMIT_SHORT_WITH_VALUE = 'mFCct';
/** Short options that take an optional value only when attached (`-S<keyid>`, `-u<mode>`): the rest of the cluster. */
const COMMIT_SHORT_OPTIONAL_VALUE = 'Su';

/** Long `git commit` options that take a value (`--opt=v` or `--opt v`). */
const COMMIT_LONG_WITH_VALUE = new Set([
  'message', 'file', 'author', 'date', 'template', 'trailer', 'cleanup', 'reuse-message', 'reedit-message',
  'fixup', 'squash', 'pathspec-from-file', 'unified', 'inter-hunk-context',
]);
/** The long `git commit` options without a value; with the above, the set git resolves unique abbreviations in. */
const COMMIT_LONG_FLAGS = [
  'all', 'patch', 'reset-author', 'short', 'branch', 'porcelain', 'long', 'null', 'signoff', 'no-signoff', 'verify',
  'no-verify', 'edit', 'no-edit', 'amend', 'post-rewrite', 'no-post-rewrite', 'include', 'only', 'interactive',
  'dry-run', 'status', 'no-status', 'untracked-files', 'verbose', 'no-verbose', 'quiet', 'gpg-sign', 'no-gpg-sign',
  'allow-empty', 'allow-empty-message', 'pathspec-file-nul',
];
const COMMIT_LONG_ALL = [...COMMIT_LONG_WITH_VALUE, ...COMMIT_LONG_FLAGS];

/** git accepts any unambiguous prefix of a long option (`--mess=x` is `--message=x`). */
function resolveLong(name) {
  if (COMMIT_LONG_ALL.includes(name)) return name;
  const candidates = COMMIT_LONG_ALL.filter((o) => o.startsWith(name));
  return candidates.length === 1 ? candidates[0] : name;
}

/**
 * The message a single `git commit` word list carries on its command line, as git would assemble it, or null.
 *
 * Mirrors git's own option parsing: `-m` is found anywhere in a cluster of short flags (`-am`, `-vam`), its value is
 * the rest of the cluster (`-mmsg`, `-m"msg"`) or the next word, `--message[=]` and its unambiguous abbreviations
 * work too, and each `-m` is a paragraph of the message (joined by a blank line). Options that take a value
 * (`--author x`, `-C HEAD`) are skipped as a pair so their value is not mistaken for anything else.
 *
 * null (nothing to judge) when:
 *  - there is no `-m` (`-F file`, `-C <commit>`, `--amend`, `--no-edit`, the editor): the text is not in the command;
 *  - `--fixup`/`--squash` is given: git writes its own `fixup! ...` subject and the `-m` text becomes the body;
 *  - the message is computed by the shell (`-m "$MSG"`, `$(...)`): its text is not known yet.
 */
function messageOfCommit(args) {
  const messages = [];
  let judgeable = true;
  const take = (word) => { messages.push(word.text); if (word.dynamic) judgeable = false; };

  for (let i = 0; i < args.length; i++) {
    const word = args[i].text;
    if (word === '--') break;                     // what follows is a pathspec
    if (word.startsWith('--')) {
      const eq = word.indexOf('=');
      const name = resolveLong(eq < 0 ? word.slice(2) : word.slice(2, eq));
      if (name === 'fixup' || name === 'squash') judgeable = false;
      if (!COMMIT_LONG_WITH_VALUE.has(name)) continue;
      if (eq >= 0) {
        if (name === 'message') take({ text: word.slice(eq + 1), dynamic: args[i].dynamic });
      } else if (i + 1 < args.length) {
        i++;
        if (name === 'message') take(args[i]);
      }
    } else if (/^-[^-]/.test(word)) {
      for (let k = 1; k < word.length; k++) {
        const flag = word[k];
        if (COMMIT_SHORT_OPTIONAL_VALUE.includes(flag)) break;
        if (!COMMIT_SHORT_WITH_VALUE.includes(flag)) continue;
        const rest = word.slice(k + 1);
        let value = { text: rest, dynamic: args[i].dynamic };
        if (rest === '' && i + 1 < args.length) value = args[++i];
        else if (rest === '') break;               // `-m` with nothing after it: git would fail
        if (flag === 'm') take(value);
        break;
      }
    }
  }
  return messages.length > 0 && judgeable ? messages.join('\n\n') : null;
}

/**
 * The `git commit` word lists in a command line, one per commit: the command must BE a git commit, not merely
 * mention one (`echo "git commit -m fake"` is an echo). Leading `VAR=value` words and git's global options
 * (`git -C /tmp/repo commit`) may come before it.
 */
function commitsIn(command) {
  const segments = typeof command === 'string' ? tokenize(command) : null;
  if (!segments) return [];
  const commits = [];
  for (const words of segments) {
    let i = 0;
    while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i].text)) i++;
    if (words[i]?.text !== 'git') continue;
    for (i++; i < words.length && words[i].text.startsWith('-'); i++) {
      if (GIT_GLOBAL_WITH_VALUE.has(words[i].text)) i++;
    }
    if (words[i]?.text === 'commit') commits.push(words.slice(i + 1));
  }
  return commits;
}

/**
 * Every commit message the command line itself carries, one per `git commit` in the command that has one to judge
 * (`git add . && git commit -am "x" && git commit -m "y"` gives two). See messageOfCommit for what is left out.
 *
 * @param {unknown} command - the Bash tool command
 * @returns {string[]}
 */
export function commitMessagesFrom(command) {
  return commitsIn(command).map(messageOfCommit).filter((m) => m !== null);
}

/**
 * The message of the first `git commit` in the command that carries one, or null when there is nothing to judge.
 * Kept for callers that want a single message; the hook itself judges all of them (commitMessagesFrom).
 */
export function commitMessageFrom(command) {
  return commitMessagesFrom(command)[0] ?? null;
}

if (process.argv[1] && process.argv[1].endsWith('validate-commit-msg.mjs')) {
  const arg = process.argv[2];
  if (arg) {
    if (validateCommitMessage(arg)) process.exit(0);
    complain(arg);
    process.exit(1);
  } else {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      const raw = data.trim();
      if (!raw) process.exit(0);

      let payload = null;
      try { payload = JSON.parse(raw); } catch { /* not a hook payload */ }

      if (payload && typeof payload === 'object') {
        // Claude Code PreToolUse. Silence unless this really is a commit.
        const bad = commitMessagesFrom(payload?.tool_input?.command).find((m) => !validateCommitMessage(m));
        if (bad === undefined) process.exit(0);
        complain(bad);
        process.exit(2);          // 2 is what blocks a tool call
      }

      // Legacy: a raw commit message piped in by a git hook.
      if (validateCommitMessage(raw)) process.exit(0);
      complain(raw);
      process.exit(1);
    });
  }
}
