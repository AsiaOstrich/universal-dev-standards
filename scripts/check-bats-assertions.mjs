#!/usr/bin/env node
/**
 * check-bats-assertions.mjs — find .bats assertions that can pass silently.
 *
 * Why this exists
 * ---------------
 * bats runs every test body under `set -e`. Three statement shapes do NOT make a
 * failing assertion abort the test, and two of them depend on the bash version:
 *
 *   [[ … ]]   bash 3.2 (macOS /bin/bash) does not trigger errexit when it is false.
 *             bash >= 4.1 (Linux CI) does. A test that is red on CI is green on
 *             every Mac. (bump-version.bats #16/#17 hid for exactly this reason.)
 *   (( … ))   same family as `[[ … ]]` on bash 3.2.
 *   ! cmd     errexit never fires on a negated command in ANY bash version, so
 *             `! grep -q x file` in the middle of a test asserts nothing.
 *
 * A bare one of these is only caught when it is the very last line of the test
 * (the function's return status carries it) — a position dependence that breaks
 * the moment someone appends a line. So this check is position-free: every such
 * statement is reported, wherever it sits.
 *
 * Fix the report by writing the assertion so it fails under every bash:
 *   [[ … ]] || false            (also `(( … )) || false`)
 *   run ! cmd                   (needs `bats_require_minimum_version 1.5.0`)
 *
 * Usage
 *   node scripts/check-bats-assertions.mjs               # scan tests/**\/*.bats (not tests/bats/)
 *   node scripts/check-bats-assertions.mjs a.bats b.bats # scan the given files
 *   node scripts/check-bats-assertions.mjs --self-test   # red/green samples for the scanner itself
 *
 * Exit: 0 clean, 1 findings (or self-test failure), 2 usage / unreadable input.
 *
 * Known limits (deliberate): `[[ x ]] && cmd` is treated as a guard, not an
 * assertion, and is not reported; only statements inside `@test` / function
 * bodies are scanned (file top level runs at load time, not under errexit).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BARE_COMMAND = /^(\[\[|\(\(|!(?=\s|$))/;
const LEADING_KEYWORD = /^(?:then|else|do)\b\s*/;
const BODY_OPEN = /^(?:@test\b.*|function\s+\S+.*|[A-Za-z_][A-Za-z0-9_]*\s*\(\)\s*)\{\s*$/;
const BODY_CLOSE = /^\}\s*$/;

/**
 * Walks one physical line, keeping quote / substitution state in `stack` (it
 * carries across lines, so multi-line quoted strings are opaque). Returns the
 * top-level pieces of the line: [{ text, op }] where `op` is the operator that
 * FOLLOWS the piece (';', '&&', '||' or '' at end of line).
 */
function splitTopLevel(line, stack) {
  const pieces = [];
  let cur = '';
  let inDoubleBracket = false;
  const top = () => stack[stack.length - 1];
  const push = (text, op) => {
    pieces.push({ text: text.trim(), op });
    cur = '';
  };
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const next = line[i + 1];
    const t = top();
    if (t === 'S') {
      cur += c;
      if (c === "'") stack.pop();
      continue;
    }
    if (c === '\\') {
      cur += c + (next ?? '');
      i++;
      continue;
    }
    if (t === 'D') {
      cur += c;
      if (c === '"') stack.pop();
      else if (c === '$' && next === '(') {
        cur += next;
        i++;
        stack.push('P');
      }
      continue;
    }
    // Code level (stack empty) or inside a $( ) / ( ) substitution.
    if (c === "'") { stack.push('S'); cur += c; continue; }
    if (c === '"') { stack.push('D'); cur += c; continue; }
    if (c === '`') {
      const end = line.indexOf('`', i + 1);
      const stop = end === -1 ? line.length - 1 : end;
      cur += line.slice(i, stop + 1);
      i = stop;
      continue;
    }
    if (c === '(') { stack.push('P'); cur += c; continue; }
    if (c === ')') { if (t === 'P') stack.pop(); cur += c; continue; }
    if (stack.length > 0) { cur += c; continue; }
    // Code level only from here.
    if (c === '#' && (cur === '' || /\s$/.test(cur))) break;
    if (inDoubleBracket) {
      cur += c;
      if (c === ']' && next === ']' && /\s$/.test(cur.slice(0, -1)) && /^(?:\s|;|&|\||\)|$)/.test(line.slice(i + 2))) {
        cur += next;
        i++;
        inDoubleBracket = false;
      }
      continue;
    }
    if (c === '[' && next === '[' && /^\[\[\s/.test(line.slice(i)) && cur.trim() === '') {
      inDoubleBracket = true;
      cur += '[[';
      i++;
      continue;
    }
    if (c === '[' && next === '[' && /^\[\[\s/.test(line.slice(i)) && /(?:^|\s)(?:if|elif|while|until|then|else|do)\s*$/.test(cur)) {
      // `[[` in condition position of a compound command: keep it opaque so its
      // inner `||` / `&&` do not split the statement.
      inDoubleBracket = true;
      cur += '[[';
      i++;
      continue;
    }
    if (c === '&' && next === '&') { push(cur, '&&'); i++; continue; }
    if (c === '|' && next === '|') { push(cur, '||'); i++; continue; }
    if (c === ';' && next !== ';') { push(cur, ';'); continue; }
    cur += c;
  }
  if (cur.trim() !== '' || pieces.length === 0) pieces.push({ text: cur.trim(), op: '' });
  return pieces;
}

/** Findings for one file's text: [{ line, text }]. */
function scanText(source) {
  const findings = [];
  const lines = source.split('\n');
  const stack = [];
  let inBody = false;
  let heredocEnd = null;
  let continuation = false;
  for (let n = 0; n < lines.length; n++) {
    const raw = lines[n];
    if (heredocEnd !== null) {
      if (raw.trim() === heredocEnd) heredocEnd = null;
      continue;
    }
    const startsClean = stack.length === 0 && !continuation;
    if (startsClean) {
      if (!inBody && BODY_OPEN.test(raw)) { inBody = true; continue; }
      if (inBody && BODY_CLOSE.test(raw)) { inBody = false; continue; }
    }
    const pieces = splitTopLevel(raw, stack);
    continuation = stack.length === 0 && /\\\s*$/.test(raw);
    const hd = raw.match(/<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/);
    if (hd && !/<<</.test(raw)) heredocEnd = hd[2];
    if (!inBody || !startsClean) continue;
    // Walk the pieces; a `;` ends a list, && / || continue it.
    let list = [];
    const flush = () => {
      if (list.length === 0) return;
      const last = list[list.length - 1].replace(LEADING_KEYWORD, '');
      if (BARE_COMMAND.test(last)) {
        findings.push({ line: n + 1, text: list.join(' ').replace(/\s+/g, ' ') });
      }
      list = [];
    };
    for (const p of pieces) {
      if (p.text !== '') list.push(p.text);
      if (p.op === ';' || p.op === '') flush();
    }
    flush();
  }
  return findings;
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      if (full === path.join(REPO_ROOT, 'tests', 'bats')) continue; // bats-core submodule
      walk(full, out);
    } else if (entry.name.endsWith('.bats')) {
      out.push(full);
    }
  }
}

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ADVICE =
  'passes silently on some bash versions — append `|| false` (for [[ ]] / (( ))) or use `run ! cmd` (for `! cmd`)';

// ── self-test ────────────────────────────────────────────────────────────────
// Each sample is a whole .bats text and the line numbers the scanner must report.
const SAMPLES = [
  { name: 'RED  bare [[ in the middle of a test', expect: [3], src: '@test "t" {\n  run true\n  [[ "$output" == *"x"* ]]\n  true\n}\n' },
  { name: 'RED  bare [[ as the last line (position-free)', expect: [3], src: '@test "t" {\n  run true\n  [[ "$output" == *"x"* ]]\n}\n' },
  { name: 'RED  bare ! cmd', expect: [2], src: '@test "t" {\n  ! grep -q x "$F"\n  true\n}\n' },
  { name: 'RED  bare (( ))', expect: [2], src: '@test "t" {\n  (( n > 3 ))\n  true\n}\n' },
  { name: 'RED  [[ a ]] || [[ b ]] (both bare)', expect: [2], src: '@test "t" {\n  [[ "$o" =~ "a" ]] || [[ "$o" =~ "b" ]]\n  true\n}\n' },
  { name: 'RED  [[ a ]] && [[ b ]]', expect: [2], src: '@test "t" {\n  [[ -n "$a" ]] && [[ -n "$b" ]]\n  true\n}\n' },
  { name: 'RED  inside a helper function', expect: [2], src: 'check_it() {\n  [[ "$output" == *"x"* ]]\n  true\n}\n' },
  { name: 'RED  after `then` on one line', expect: [2], src: '@test "t" {\n  if true; then [[ -n "$a" ]]; fi\n}\n' },
  { name: 'RED  after a multi-line quoted string', expect: [4], src: '@test "t" {\n  run bash -c \'echo a\n  echo b\'\n  [[ "$output" == *"b"* ]]\n}\n' },
  { name: 'GREEN [[ … ]] || false', expect: [], src: '@test "t" {\n  [[ "$o" == *"x"* ]] || false\n  true\n}\n' },
  { name: 'GREEN [[ … ]] || return 1', expect: [], src: '@test "t" {\n  [[ "$o" == *"x"* ]] || return 1\n  true\n}\n' },
  { name: 'GREEN [[ a ]] || [[ b ]] || false', expect: [], src: '@test "t" {\n  [[ "$o" =~ "a" ]] || [[ "$o" =~ "b" ]] || false\n  true\n}\n' },
  { name: 'GREEN || inside [[ ]] is not a list operator', expect: [], src: '@test "t" {\n  [[ "$o" == *"a"* || "$o" == *"b"* ]] || false\n  true\n}\n' },
  { name: 'GREEN run ! cmd', expect: [], src: '@test "t" {\n  run ! grep -q x "$F"\n  true\n}\n' },
  { name: 'GREEN if [[ ]] / if ! cmd conditions', expect: [], src: '@test "t" {\n  if [[ -n "$a" ]]; then true; fi\n  if ! grep -q x f; then true; fi\n  while [[ -z "$a" ]]; do break; done\n}\n' },
  { name: 'GREEN single-bracket [ ] (errexit fires on every bash)', expect: [], src: '@test "t" {\n  [ "$status" -eq 0 ]\n  [ -f "$F" ]\n  true\n}\n' },
  { name: 'GREEN sed regex with \\[[ inside quotes', expect: [], src: 'strip() {\n  printf \'%s\' "$1" | sed -E "s/\\[[0-9;]*m//g"\n}\n' },
  { name: 'GREEN commented-out assertion', expect: [], src: '@test "t" {\n  # [[ "$o" == *"x"* ]]\n  true\n}\n' },
  { name: 'GREEN heredoc body that looks like an assertion', expect: [], src: '@test "t" {\n  cat > "$F" <<EOF\n[[ "$o" == *"x"* ]]\n! grep nothing\nEOF\n  true\n}\n' },
  { name: 'GREEN line inside a multi-line string', expect: [], src: '@test "t" {\n  printf \'a\n[[ b ]]\n! c\n\' > "$F"\n  true\n}\n' },
  { name: 'GREEN file top level is not a test body', expect: [], src: '[[ -n "$X" ]]\n! true\n@test "t" {\n  true\n}\n' },
  { name: 'GREEN [[ ]] && guard is a guard, not an assertion', expect: [], src: '@test "t" {\n  [[ -n "$a" ]] && export B=1\n  true\n}\n' },
];

function selfTest() {
  let failed = 0;
  for (const s of SAMPLES) {
    const got = scanText(s.src).map((f) => f.line);
    const ok = JSON.stringify(got) === JSON.stringify(s.expect);
    if (!ok) failed++;
    console.log(`${ok ? '  ok  ' : ' FAIL '} ${s.name}${ok ? '' : `  (expected lines [${s.expect}], got [${got}])`}`);
  }
  const reds = SAMPLES.filter((s) => s.expect.length > 0).length;
  console.log(`self-test: ${SAMPLES.length - failed}/${SAMPLES.length} samples behave as declared (${reds} red, ${SAMPLES.length - reds} green)`);
  return failed === 0 ? 0 : 1;
}

function main(argv) {
  if (argv.includes('--self-test')) return selfTest();
  const unknown = argv.filter((a) => a.startsWith('-'));
  if (unknown.length > 0) {
    console.error(`unknown option: ${unknown.join(' ')}\nusage: check-bats-assertions.mjs [--self-test] [file.bats ...]`);
    return 2;
  }
  let files = argv;
  if (files.length === 0) {
    const testsDir = path.join(REPO_ROOT, 'tests');
    if (!fs.existsSync(testsDir)) {
      console.error(`cannot find ${testsDir}`);
      return 2;
    }
    files = [];
    walk(testsDir, files);
    files.sort();
  }
  if (files.length === 0) {
    // A scan over nothing would report "clean" about a tree it never looked at.
    console.error('no .bats files found — refusing to report a clean result over an empty scan');
    return 2;
  }
  let total = 0;
  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch (e) {
      console.error(`cannot read ${file}: ${e.message}`);
      return 2;
    }
    for (const f of scanText(src)) {
      total++;
      const rel = path.relative(process.cwd(), file) || file;
      console.log(`${rel}:${f.line}: bare \`${f.text.slice(0, 90)}\` ${ADVICE}`);
    }
  }
  if (total > 0) {
    console.error(`\ncheck-bats-assertions: ${total} bare assertion(s) in ${files.length} file(s)`);
    return 1;
  }
  console.log(`check-bats-assertions: ${files.length} .bats file(s) scanned, no bare assertions`);
  return 0;
}

process.exit(main(process.argv.slice(2)));
