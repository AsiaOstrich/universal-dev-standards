#!/usr/bin/env node
/**
 * UDS Hook: Dangerous Command Detection
 *
 * Detects destructive shell commands and blocks the tool call.
 *
 * Exit code: 0 = allow, 2 = dangerous (blocks the tool call).
 * Claude Code blocks a PreToolUse call ONLY on exit 2; any other non-zero code
 * is a non-blocking hook error and the command still runs.
 *
 * Input, in order of preference:
 *   1. Claude Code PreToolUse payload on stdin:
 *        {"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"..."}}
 *      Only `tool_input.command` is inspected, never the other fields.
 *   2. A raw command line on stdin when stdin is not a JSON object.
 *   3. A command line as argv[2].
 *
 * Usage: echo '{"tool_input":{"command":"rm -rf /"}}' | node check-dangerous-cmd.mjs
 *    or: node check-dangerous-cmd.mjs "rm -rf /"
 *
 * Performance target: < 500ms
 *
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md (REQ-2)
 */

const BLOCK_EXIT_CODE = 2;

// Where `rm -r` is never what the user meant: the filesystem root or the home directory.
// `/`, `//`, `/*`, `~`, `~/`, `~/*`, `$HOME`, `${HOME}`, `$HOME/`, `$HOME/*`. Not `/tmp/x`, not `~/proj`.
const ROOT_OR_HOME = /^(?:\/+\*?|(?:~|\$HOME|\$\{HOME\})(?:\/+\*?)?)$/;

// Words after which the real command follows (`sudo -u root rm ...`, `bash -c "rm ..."`, `then rm ...`).
const WRAPPERS = new Set([
  'sudo', 'doas', 'env', 'command', 'builtin', 'exec', 'nohup', 'time', 'nice', 'ionice', 'timeout',
  'bash', 'sh', 'zsh', 'dash', 'ksh', 'eval',
  'then', 'do', 'else', 'elif', 'if', 'while', 'until', '!', '{',
]);

const baseName = (word) => word.slice(word.lastIndexOf('/') + 1);
const unquote = (word) => word.replace(/^["'`]+|["'`]+$/g, '');

/** Split a command line into simple commands, each a list of unquoted words. */
function simpleCommands(cmd) {
  return cmd
    .split(/[;&|\n()`]+/)
    .map((segment) => segment.split(/\s+/).map(unquote).filter(Boolean))
    .filter((words) => words.length > 0);
}

/**
 * Index of the real command word in a simple command, or -1.
 * The command is the first word, or the first word after a run of wrappers.
 * `echo rm -rf /` and `git commit -m "rm -rf /"` have no `rm` command, so they never reach here.
 */
function commandIndex(words, name) {
  let i = 0;
  while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) i++; // VAR=value prefix
  if (i >= words.length) return -1;
  if (matches(words[i], name)) return i;
  if (!WRAPPERS.has(words[i])) return -1;
  for (let j = i + 1; j < words.length; j++) {
    if (matches(words[j], name)) return j;
  }
  return -1;
}

const matches = (word, name) => (typeof name === 'string' ? baseName(word) === name : name.test(baseName(word)));

function partition(args) {
  const flags = [];
  const operands = [];
  let optionsEnded = false;
  for (const arg of args) {
    if (!optionsEnded && arg === '--') optionsEnded = true;
    else if (!optionsEnded && arg.startsWith('-') && arg.length > 1) flags.push(arg);
    else operands.push(arg);
  }
  return { flags, operands };
}

const isRecursive = (flags) =>
  flags.some((f) => f === '--recursive' || (!f.startsWith('--') && /[rR]/.test(f)));

const RULES = [
  {
    name: 'rm-recursive-root-or-home',
    test: (words) => {
      const at = commandIndex(words, 'rm');
      if (at < 0) return false;
      const { flags, operands } = partition(words.slice(at + 1));
      return isRecursive(flags) && operands.some((t) => ROOT_OR_HOME.test(t));
    },
  },
  {
    name: 'mkfs',
    test: (words) => commandIndex(words, /^mkfs(?:\..+)?$/) >= 0,
  },
  {
    name: 'dd-to-device',
    test: (words) => {
      const at = commandIndex(words, 'dd');
      if (at < 0) return false;
      return words.slice(at + 1).some((w) => /^of=\/dev\//.test(w) && !/^of=\/dev\/(?:null|zero|stdout|stderr|tty|fd\/)/.test(w));
    },
  },
  {
    name: 'format-drive',
    test: (words) => {
      const at = commandIndex(words, /^format(?:\.com|\.exe)?$/i);
      return at >= 0 && words.slice(at + 1).some((w) => /^[a-zA-Z]:/.test(w));
    },
  },
  {
    name: 'chmod-recursive-777-root',
    test: (words) => {
      const at = commandIndex(words, 'chmod');
      if (at < 0) return false;
      const { flags, operands } = partition(words.slice(at + 1));
      const recursive = flags.some((f) => f === '--recursive' || (!f.startsWith('--') && /R/.test(f)));
      const wideOpen = operands.some((o) => /^(?:0?777|[ugoa]*\+rwx)$/.test(o));
      return recursive && wideOpen && operands.some((t) => ROOT_OR_HOME.test(t));
    },
  },
];

// Matched on the whole command line, not per word: they are syntax, not a command word.
const WHOLE_LINE_RULES = [
  { name: 'redirect-to-disk', pattern: />\s*\/dev\/(?:sd[a-z]|hd[a-z]|vd[a-z]|xvd[a-z]|nvme\d+n\d+|r?disk\d+)/ },
  { name: 'fork-bomb', pattern: /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/ },
];

/**
 * Name of the first dangerous rule the command trips, or null.
 * @param {string} cmd - The shell command to check
 * @returns {string|null}
 */
export function findDangerousRule(cmd) {
  if (!cmd || typeof cmd !== 'string') return null;
  for (const rule of WHOLE_LINE_RULES) {
    if (rule.pattern.test(cmd)) return rule.name;
  }
  for (const words of simpleCommands(cmd)) {
    for (const rule of RULES) {
      if (rule.test(words)) return rule.name;
    }
  }
  return null;
}

/**
 * Check if a command matches dangerous patterns.
 * @param {string} cmd - The shell command to check
 * @returns {boolean} true if dangerous
 */
export function isDangerousCommand(cmd) {
  return findDangerousRule(cmd) !== null;
}

/**
 * The command to check, from stdin text. A Claude Code payload yields only
 * `tool_input.command` (null when it has none); anything else is a raw command line.
 * @param {string} raw
 * @returns {string|null}
 */
export function commandFromInput(raw) {
  let payload;
  try { payload = JSON.parse(raw); } catch { return raw; }
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return raw;
  const command = payload.tool_input?.command;
  return typeof command === 'string' ? command : null;
}

function verdict(cmd) {
  const rule = findDangerousRule(cmd);
  if (rule === null) process.exit(0);
  console.error(`Blocked by UDS security standard (rule: ${rule}): ${cmd}`);
  process.exit(BLOCK_EXIT_CODE);
}

// CLI mode
if (process.argv[1] && process.argv[1].endsWith('check-dangerous-cmd.mjs')) {
  const input = process.argv[2];
  if (input) {
    verdict(input);
  } else {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      const raw = data.trim();
      if (!raw) process.exit(0);
      verdict(commandFromInput(raw));
    });
  }
}
