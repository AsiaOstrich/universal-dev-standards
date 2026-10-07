#!/usr/bin/env node
/**
 * Open-work-tracking reference checks for OWT-017 … OWT-028.
 * open-work-tracking 1.3.0 參考判定程序（OWT-017～028）。
 * // implements DEC-122-L1
 * // implements XSPEC-459
 * // implements XSPEC-460
 * // implements XSPEC-461
 *
 * ── Where this lives, and why there is exactly one copy ─────────────────────
 * This file is the ONE body of the rules. Two front doors call it and neither
 * holds a copy:
 *   uds open-work <next-action|revision|separation|waiting|observations|self-test> ...
 *       cli/src/commands/open-work.js, shipped in the npm package (`cli/src`
 *       is in package.json `files`), so an adopter can run it without a clone.
 *   node scripts/check-open-work-tracking.mjs ...
 *       a three-line shim in the UDS repository, kept so the documented repo
 *       invocation keeps working.
 * It used to live only in `scripts/`, which the npm package does not contain,
 * and 6.14.0-beta.1 therefore shipped a reference check no adopter could run.
 * A second copy under `cli/` would have fixed that and started a second set of
 * rules that drift from the first; a bundling step (prepack copies) would have
 * left the source tree unable to run it. Living under `cli/src/` costs neither.
 *
 * ── What this is, and what it is not ────────────────────────────────────────
 * core/open-work-tracking.md says UDS ships no gate. This script is NOT a gate
 * and is not wired into pre-release-check.sh: UDS has no open-work carrier of
 * its own for it to check. It is the reference decision procedure the standard
 * offers as OWT-015 evidence — an adopter can run it against their own
 * carriers, or reimplement it. It has been observed to fail against violating
 * samples (see cli/tests/unit/scripts/open-work-tracking-intent-and-next-
 * action.test.js, which mutates this file's source to prove it).
 *
 * Self-contained on purpose (node builtins only): the mutation tests copy this
 * file to a temp directory and edit its text, which only works if it imports
 * nothing relative. The `.mjs` extension is part of that: a copy in a bare temp
 * directory has no package.json, and only `.mjs` is read as an ES module there.
 *
 * ── Five checks ─────────────────────────────────────────────────────────────
 *   next-action   OWT-019  every "next action" field names a file path, test
 *                          name, command or requirement identifier.
 *                          Three outcomes, never one green:
 *                            named-resolved   an object was found (a path exists)
 *                            named-unresolved an object is named but not found
 *                                             (legitimate when the next action
 *                                             is to create it), or resolution
 *                                             could not apply (command, test
 *                                             name, identifier)
 *                            unnamed          VIOLATION — the only failure
 *                          A field is read in three shapes, all through the one
 *                          VOCAB.nextAction list: a heading section, an inline
 *                          "Next action: ..." label, and EVERY ROW of a table column whose
 *                          header is in that list (each report carries the line and the
 *                          row's first cell, so it can be found).
 *                          Not evaluated, counted: an empty cell, `-`, `—`, `n/a`, `none`,
 *                          `done`. OWT-019 is NOT violated by them: it judges a next action
 *                          that was written; "no next action written" is another failure
 *                          this check does not decide (a finished item has none either).
 *                          Undecidable, listed: a table row whose cell count differs from its
 *                          header (a stray or missing `|`). It is neither judged nor read as
 *                          empty. A violation elsewhere still exits 1; otherwise the exit is 2,
 *                          because "no violation found" would then cover only part of the field.
 *   revision      OWT-018  the acceptance/goal/constraint sections changed
 *                          between two versions of a carrier; a NEW revision
 *                          record (change, approver, reason) must exist. No
 *                          record, or an incomplete one -> violation. A record
 *                          whose approver is empty, and an edit with no record
 *                          at all, are LISTED for the hand-back (OWT-007). The
 *                          listing never changes the exit code (OWT-008).
 *   separation    OWT-017  no single carrier holds both an intent section and
 *                          a progress / next-action section.
 *   waiting       OWT-020  a waiting item says which of two states it is in:
 *                          not-yet-asked or asked-awaiting. A waiting item that is
 *                          neither is named one by one, never folded into a total.
 *                 OWT-021  not-yet-asked names the draft or action (a path, command,
 *                          test name or identifier; the OWT-019 recognisers).
 *                 OWT-022  asked-awaiting carries asked-at (a dated day), what it
 *                          waits for and what event releases it (OWT-002).
 *   observations  OWT-023  a hand-written row about an external fact the assistant
 *                          cannot observe carries observed-by, observed-at (a dated
 *                          day, not in the future) and a value of yes, no or unknown.
 *                 OWT-024  unknown is counted apart and never complete; a row marked
 *                          done while unknown is a violation.
 *                 OWT-025  the age of every observation is shown; one older than the
 *                          threshold is reported as stale, counted apart, never confirmed.
 *                 OWT-026  the exception does not reach a subject that version control,
 *                          a spec marker or a CI result determines (OWT-003 stands).
 *                 Time is injected (`--now`, `--stale-after`), never read inside a rule.
 *
 * ── What none of them can decide (stated, not implied) ──────────────────────
 *   - Whether a revision record honestly describes the diff (OWT-014: that is
 *     a claim about meaning, not a relation over artefacts). The check decides
 *     that the intent changed, that a new record exists, that it is complete,
 *     and whether its approver is filled in — nothing more.
 *   - Whether a named object is the RIGHT object.
 *   - Recognising "this string is a path / command / test name / identifier"
 *     is pattern matching, so its coverage is UNKNOWN (OWT-011). An unrecognised
 *     format is reported as unnamed, and a clean pass never means "every next
 *     action is specific".
 *   - Prose revision notes ("2026-09-29 amended R1") are not structural records.
 *     Only table rows and list items inside a section whose heading is a
 *     revision heading are read.
 *   - Whether an observation is TRUE, or still true now (OWT-014). `observations`
 *     decides that the fields exist, are well formed and how old the stamp is. A
 *     stamp says who saw it and when, never that it still holds.
 *   - A waiting item written in words VOCAB_STATE does not hold is read as "other",
 *     not as waiting; a table with neither an observed-by nor an observed-at column
 *     is not an observation carrier. A clean pass covers only what was recognised.
 *
 * ── UNCALIBRATED (OWT-016) ──────────────────────────────────────────────────
 * Everything in VOCAB, VOCAB_STATE, DEFAULT_STALE_AFTER_DAYS, COMMANDS, EXTENSIONS,
 * DEFAULT_ID_PATTERN and ID_PREFIX_DENYLIST is an initial judgment. None of it was measured against
 * real usage. Adopters should pass their own identifier pattern
 * (--id-pattern) and read the heading vocabulary as a starting point.
 *
 * Exit codes: 0 no violation · 1 violation · 2 cannot decide (no structure
 * found, a next-action table row could not be read, git failed, or this
 * script's own self-test arms failed). 2 is NOT a pass.
 *
 * Usage (`uds` from the npm package, or the repo shim; same arguments):
 *   uds open-work next-action <file...> [--root DIR] [--id-pattern RE] [--next-action-word WORD ...]
 *   uds open-work revision --file PATH --base GIT_REV
 *   uds open-work revision --before FILE --after FILE
 *   uds open-work separation <file...> [--next-action-word WORD ...]
 *   uds open-work waiting <file...> [--root DIR] [--root NAME=DIR ...] [--id-pattern RE] [--now YYYY-MM-DD]
 *   uds open-work observations <file...> [--now YYYY-MM-DD] [--stale-after DAYS]
 *   uds open-work self-test
 *   node scripts/check-open-work-tracking.mjs next-action <file...> ...   (repo clone)
 *   node scripts/check-open-work-tracking.mjs --self-test
 */

import { readFileSync, existsSync, realpathSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, dirname, join, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Vocabulary (UNCALIBRATED, OWT-016) ───────────────────────────────────────

// ONE list of "next action" words (461 R1). It is read three ways and there is no second copy:
// a heading (classifyHeading), a table column header (extractNextActions) and an inline
// label ("Next action: ...", built from the same source). Each entry is [regex source, text shown to a
// reader who asks which words are recognised]. Keep the sources free of capture groups: the
// label regex embeds them and reads its own group 1.
//
// 回來要做什麼 ("what to do when you come back") is the header the dev-platform worklog's
// main table actually uses (DEC-122 H2 baseline carrier); that file describes the column as
// 下一動 in prose but the header text drifted. Added because a header outside this list is
// invisible to the check, which is the failure DEC-122 measured. 下一個動作, 下一個步驟 and
// 接下來要做什麼 (461 R1) mean "next action" and nothing wider.
//
// What is deliberately NOT here, and is pinned by a regression test: 待辦, 後續, Next, TODO,
// Action, and a bare 接下來. They also head columns that are not the next action (a backlog, a
// follow-up list, a "next release"), and reading those as next actions would let a violation hide
// behind a column that was never one. An adopter whose carrier uses one of them declares it
// (--next-action-word, or open_work.next_action_words in uds.project.yaml).
//
// Adopter-specific and UNCALIBRATED (OWT-016).
export const NEXT_ACTION_WORDS = [
  ['next[\\s-]?(?:action|step)s?', 'next action, next step (also "next-action", "next steps")'],
  ['下一步', '下一步'],
  ['下一動', '下一動'],
  ['回來要做什麼', '回來要做什麼'],
  ['下一個動作', '下一個動作'],
  ['下一個步驟', '下一個步驟'],
  ['接下來要做什麼', '接下來要做什麼'],
];

export const VOCAB = {
  revision: /revision|change[\s-]?log|amendment|history|修訂|變更紀錄|變更記錄|修改紀錄|修改記錄|異動/i,
  nextAction: new RegExp(NEXT_ACTION_WORDS.map(([source]) => source).join('|'), 'i'),
  progress: /\bprogress\b|\bstate\b|\bblockers?\b|\bblocked\b|進度|現況|卡在/i,
  intent: /acceptance|criteria|\brequirements?\b|\bgoals?\b|objectives?|constraints?|驗收|需求|目標|限制/i,
  // revision-table columns / labelled list fields
  colChange: /what|change|改了什麼|修改|變更|內容/i,
  colApprover: /approv|核可|核准|批准|同意|確認者/i,
  colReason: /reason|why|理由|原因|為什麼/i,
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');

/**
 * Words an adopter declares (461 R2), as plain text: not a regular expression (a `.` or `(` in a word is
 * that character), case-insensitive, matched as a substring like the built-in ones. A blank word is
 * REFUSED, never dropped: an empty alternative matches every header and would turn the check green.
 * @returns {{words:string[], error:string|null}}
 */
export function normaliseDeclaredWords(raw = []) {
  const words = [];
  for (const w of raw) {
    const word = typeof w === 'string' ? w.replace(/\s+/g, ' ').trim() : '';
    if (!word) return { words: [], error: 'a declared next-action word is empty or blank; it would match every header, so it is refused (give the exact word, for example --next-action-word 待辦)' }; // [mutation-anchor:blank-word-refused]
    if (!words.some((x) => x.toLowerCase() === word.toLowerCase())) words.push(word);
  }
  return { words, error: null };
}

/**
 * Program names an adopter declares (461 R5), under the same rules as the next-action words: plain text, never a
 * pattern, and a blank one is refused. A command is one program name, so a word with a space in it could never
 * match the first word of a command and is refused as well, with the reason, instead of being accepted and inert.
 * @returns {{words:string[], error:string|null}}
 */
export function normaliseDeclaredCommands(raw = []) {
  const words = [];
  for (const w of raw) {
    const word = typeof w === 'string' ? w.trim() : '';
    if (!word) return { words: [], error: 'a declared command word is empty or blank; it would read every sentence as a command, so it is refused (give the program name, for example --command-word kubectl)' }; // [mutation-anchor:blank-command-refused]
    if (/\s/.test(word)) return { words: [], error: `a declared command word is one program name, and "${word}" has a space in it, so it could never match; give the program name alone (for example --command-word kubectl)` };
    if (!words.includes(word) && !COMMANDS.includes(word)) words.push(word);
  }
  return { words, error: null };
}

/** The one recognition pattern: the built-in list, plus the declared words when there are any. */
export function nextActionRegExp(words = []) {
  if (!words.length) return VOCAB.nextAction;
  return new RegExp(`${VOCAB.nextAction.source}|${words.map(escapeRegExp).join('|')}`, 'i'); // [mutation-anchor:declared-merged]
}

const LABELS = [
  ['change', /(?:what(?:\s+changed)?|changed?|改了什麼|修改|變更)\s*[:：]/gi],
  ['approver', /(?:approved\s+by|approver|approval|核可者|核可|核准|批准)\s*[:：]/gi],
  ['reason', /(?:reason|why|理由|原因|為什麼)\s*[:：]/gi],
];

const NO_APPROVER = /^(?:|-+|—|–|n\/?a|none|tbd|pending|unknown|\?+|無|未核可|待定|待核可|尚未)$/i;
const EMPTY_FIELD = /^(?:|-+|—|–|n\/?a|none|無|done|完成|已完成|✅)$/i;

// Words that make `word arg` read as a command in prose. Deliberately excludes
// common English words (go, make, sh): "go through the list" is not a command.
// glab and dotnet (461 R5) are here because a user's carriers named them (`glab mr merge 486`, a .NET
// project); every other tool is declared by the adopter (--command-word, or open_work.command_words).
// A command is matched as an exact program name, case-sensitively, as the built-in ones are.
export const COMMANDS = [
  'npm', 'npx', 'pnpm', 'yarn', 'node', 'tsx', 'git', 'gh', 'glab', 'bash', 'python', 'python3',
  'pytest', 'vitest', 'docker', 'cargo', 'dotnet', 'uds', 'egr',
];

export const EXTENSIONS = [
  'md', 'mdx', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'py', 'sh', 'bash', 'zsh', 'yaml', 'yml',
  'json', 'jsonc', 'tsv', 'csv', 'toml', 'sql', 'css', 'scss', 'html', 'txt', 'rb', 'go', 'rs',
  'java', 'kt', 'swift', 'lock', 'env', 'conf', 'ini', 'xml', 'svg', 'plist',
];

export const DEFAULT_ID_PATTERN = '\\b[A-Z][A-Z0-9]{1,9}-\\d{1,6}\\b|\\b(?:R|OQ|AC)\\d{1,3}\\b';
export const ID_PREFIX_DENYLIST = ['UTF', 'SHA', 'ISO', 'GPT', 'RFC', 'CRC', 'AES', 'RSA', 'TLS', 'MD', 'HTTP'];

// ── Markdown structure walk ──────────────────────────────────────────────────

/** @returns {string|null} */
function classifyHeading(h, nextRe = VOCAB.nextAction) {
  if (VOCAB.revision.test(h)) return 'revision';
  if (nextRe.test(h)) return 'nextAction';
  if (VOCAB.progress.test(h)) return 'progress';
  if (VOCAB.intent.test(h)) return 'intent';
  return null;
}

/**
 * Annotate every line with the class of its innermost classified ancestor
 * heading. Front matter and fenced blocks keep their text but are flagged.
 */
export function parseDoc(md, nextRe = VOCAB.nextAction) {
  const raw = md.split(/\r?\n/);
  const lines = [];
  const stack = [];
  let inFence = false;
  let fenceMark = '';
  let i = 0;
  let inFront = false;
  if (raw[0] && raw[0].trim() === '---') {
    inFront = true;
    i = 1;
    lines.push({ text: raw[0], cls: null, owner: null, front: true });
  }
  for (; i < raw.length; i++) {
    const text = raw[i];
    if (inFront) {
      lines.push({ text, cls: null, owner: null, front: true });
      if (text.trim() === '---') inFront = false;
      continue;
    }
    const fence = /^\s*(```|~~~)/.exec(text);
    if (fence) {
      if (!inFence) { inFence = true; fenceMark = fence[1]; } else if (fence[1] === fenceMark) { inFence = false; }
      const own = innermost(stack);
      lines.push({ text, cls: own ? own.cls : null, owner: own, fence: true });
      continue;
    }
    if (!inFence) {
      const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(text);
      if (h) {
        const level = h[1].length;
        while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
        const entry = { level, heading: h[2], cls: classifyHeading(h[2], nextRe) };
        stack.push(entry);
        const own = innermost(stack);
        lines.push({ text, cls: own ? own.cls : null, owner: own, heading: entry });
        continue;
      }
    }
    const own = innermost(stack);
    lines.push({ text, cls: own ? own.cls : null, owner: own, inFence });
  }
  return lines;
}

function innermost(stack) {
  for (let k = stack.length - 1; k >= 0; k--) if (stack[k].cls) return stack[k];
  return null;
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** A table line may sit inside a Markdown blockquote ("> | a | b |"): drop the quote marker. */
const unquote = (line) => line.replace(/^\s*(?:>\s?)+/, '');

/** Index of the closing backtick run of exactly `n` backticks at or after `from`, or -1. */
function closingRun(t, from, n) {
  let j = from;
  while (j < t.length) {
    if (t[j] !== '`') { j++; continue; }
    let m = 0;
    while (t[j + m] === '`') m++;
    if (m === n) return j;
    j += m;
  }
  return -1;
}

/**
 * Split one table row into cells. A `|` does NOT split a cell when it is escaped (`\|`) or
 * sits inside a code span that closes on the same line. The second rule is deliberately
 * looser than GFM (which splits inside code unless escaped): a hand-written note such as
 * `tar -tzf \| grep` or `a|b` in backticks means one cell, and splitting it would shift
 * every later column and misread the next-action cell. An unclosed backtick is literal.
 */
function splitRow(line) {
  let t = unquote(line).trim();
  if (t.startsWith('|')) t = t.slice(1);
  const cells = [];
  let cur = '';
  let lastDelim = false;
  let i = 0;
  while (i < t.length) {
    const ch = t[i];
    lastDelim = false;
    if (ch === '\\' && t[i + 1] === '|') { cur += '|'; i += 2; continue; }
    if (ch === '`') {
      let n = 0;
      while (t[i + n] === '`') n++;
      const close = closingRun(t, i + n, n);
      if (close !== -1) { cur += t.slice(i, close + n).replace(/\\\|/g, '|'); i = close + n; continue; }
      cur += '`'.repeat(n);
      i += n;
      continue;
    }
    if (ch === '|') { cells.push(cur); cur = ''; lastDelim = true; i++; continue; }
    cur += ch;
    i++;
  }
  if (!lastDelim) cells.push(cur); // a trailing unescaped `|` closes the row; it opens no cell
  return cells.map(norm);
}

const isSepRow = (line) => /^\s*\|?[\s:|-]+\|?\s*$/.test(unquote(line)) && /-/.test(line);

/** Tables among annotated lines: [{header, rows:[{cells, idx}]}] */
function findTables(lines) {
  const tables = [];
  let k = 0;
  while (k < lines.length) {
    const l = lines[k];
    if (!l.inFence && !l.fence && !l.front && unquote(l.text).trim().startsWith('|') && k + 1 < lines.length
      && isSepRow(lines[k + 1].text) && unquote(lines[k + 1].text).trim().startsWith('|')) {
      const header = splitRow(l.text);
      const rows = [];
      let j = k + 2;
      while (j < lines.length && unquote(lines[j].text).trim().startsWith('|')) {
        rows.push({ cells: splitRow(lines[j].text), idx: j });
        j++;
      }
      tables.push({ header, rows, headerIdx: k });
      k = j;
    } else {
      k++;
    }
  }
  return tables;
}

// ── OWT-018: intent sections and revision records ────────────────────────────

/** Map "<heading>#<n>" -> normalised body, for sections classed as intent. */
export function intentSections(md) {
  const map = new Map();
  const seen = new Map();
  const bodies = new Map();
  for (const l of parseDoc(md)) {
    if (l.cls !== 'intent' || !l.owner || l.heading === l.owner) continue;
    if (!bodies.has(l.owner)) {
      const n = (seen.get(l.owner.heading) || 0) + 1;
      seen.set(l.owner.heading, n);
      bodies.set(l.owner, `${l.owner.heading}#${n}`);
      map.set(bodies.get(l.owner), []);
    }
    const t = norm(l.text);
    if (t) map.get(bodies.get(l.owner)).push(t);
  }
  // An intent heading with no body lines still exists as a (empty) section.
  for (const l of parseDoc(md)) {
    if (l.heading && l.heading.cls === 'intent' && !bodies.has(l.heading)) {
      const n = (seen.get(l.heading.heading) || 0) + 1;
      seen.set(l.heading.heading, n);
      bodies.set(l.heading, `${l.heading.heading}#${n}`);
      map.set(bodies.get(l.heading), []);
    }
  }
  const out = new Map();
  for (const [k, v] of map) out.set(k, v.join('\n'));
  return out;
}

function parseLabelled(text) {
  const t = text.replace(/\*\*|__/g, '');
  const hits = [];
  for (const [kind, re] of LABELS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(t)) !== null) hits.push({ kind, start: m.index, end: m.index + m[0].length });
  }
  hits.sort((a, b) => a.start - b.start);
  const out = { change: '', approver: '', reason: '' };
  if (!hits.length) { out.change = norm(t); return out; }
  for (let h = 0; h < hits.length; h++) {
    const next = hits[h + 1] ? hits[h + 1].start : t.length;
    const val = norm(t.slice(hits[h].end, next)).replace(/[;；,，|]+$/, '').trim();
    if (!out[hits[h].kind]) out[hits[h].kind] = val;
  }
  return out;
}

/** Revision records: table rows and list items inside revision-class sections. */
export function revisionEntries(md) {
  const lines = parseDoc(md);
  const entries = [];
  const revLines = lines.map((l) => l.cls === 'revision' && !l.heading && !l.front);
  // tables
  const tableLineIdx = new Set();
  for (const t of findTables(lines)) {
    if (!revLines[t.headerIdx]) continue;
    const ci = t.header.findIndex((c) => VOCAB.colChange.test(c));
    const ai = t.header.findIndex((c) => VOCAB.colApprover.test(c));
    const ri = t.header.findIndex((c) => VOCAB.colReason.test(c));
    tableLineIdx.add(t.headerIdx); tableLineIdx.add(t.headerIdx + 1);
    for (const r of t.rows) {
      tableLineIdx.add(r.idx);
      const others = r.cells.filter((_, n) => n !== ai && n !== ri);
      entries.push({
        key: norm(r.cells.join('|')).toLowerCase(),
        change: ci >= 0 ? (r.cells[ci] || '') : norm(others.join(' ')),
        approver: ai >= 0 ? (r.cells[ai] || '') : '',
        reason: ri >= 0 ? (r.cells[ri] || '') : '',
      });
    }
  }
  // list items
  let cur = null;
  const flush = () => {
    if (cur !== null) {
      const f = parseLabelled(cur);
      entries.push({ key: norm(cur).toLowerCase(), ...f });
    }
    cur = null;
  };
  lines.forEach((l, idx) => {
    if (!revLines[idx] || l.inFence || l.fence || tableLineIdx.has(idx)) { if (!revLines[idx]) flush(); return; }
    const li = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(l.text);
    if (li) { flush(); cur = li[1]; } else if (cur !== null && /^\s+\S/.test(l.text)) { cur += ' ' + l.text.trim(); } else { flush(); }
  });
  flush();
  return entries;
}

/**
 * OWT-018. before === null means the carrier did not exist in the baseline.
 * @returns {{status:string, changedSections:string[], newEntries:object[], violations:object[], handBack:object[]}}
 */
export function checkIntentRevision({ before, after, path = '(carrier)' }) {
  const res = { status: '', path, changedSections: [], newEntries: [], violations: [], handBack: [] };
  const a = intentSections(after);
  if (before === null) { res.status = 'no-baseline'; return res; }
  const b = intentSections(before);
  if (a.size === 0 && b.size === 0) { res.status = 'undecidable'; return res; }
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) if (a.get(k) !== b.get(k)) res.changedSections.push(k.replace(/#\d+$/, ''));
  res.changedSections = [...new Set(res.changedSections)];
  const intentChanged = res.changedSections.length > 0; // [mutation-anchor:intent-changed]
  if (!intentChanged) { res.status = 'unchanged'; return res; }
  const beforeKeys = new Set(revisionEntries(before).map((e) => e.key));
  res.newEntries = revisionEntries(after).filter((e) => !beforeKeys.has(e.key));
  if (res.newEntries.length === 0) {
    res.status = 'changed-no-record';
    res.violations.push({ rule: 'OWT-018', why: 'intent changed and no new revision record exists', sections: res.changedSections });
    res.handBack.push({ rule: 'OWT-018', why: 'no approver: there is no revision record at all', sections: res.changedSections });
    return res;
  }
  res.status = 'changed-recorded';
  for (const e of res.newEntries) {
    if (!e.change || !e.reason) {
      res.violations.push({ rule: 'OWT-018', why: 'revision record is incomplete (needs what changed and why)', entry: e.key });
    }
    const hasApprover = !NO_APPROVER.test(e.approver.trim()); // [mutation-anchor:has-approver]
    if (!hasApprover) {
      res.handBack.push({ rule: 'OWT-018', why: 'revision record has no approver', sections: res.changedSections, entry: e.key });
    }
  }
  return res;
}

// ── OWT-017: carrier separation ──────────────────────────────────────────────

export function checkSeparation(carriers, opts = {}) {
  const res = { walked: carriers.length, recognised: 0, violations: [] };
  const nextRe = nextActionRegExp(opts.words);
  for (const c of carriers) {
    const lines = parseDoc(c.content, nextRe);
    const intent = new Set();
    const progress = new Set();
    for (const l of lines) {
      if (!l.heading) continue;
      if (l.heading.cls === 'intent') intent.add(l.heading.heading);
      if (l.heading.cls === 'progress' || l.heading.cls === 'nextAction') progress.add(l.heading.heading);
    }
    if (intent.size || progress.size) res.recognised++;
    const both = intent.size > 0 && progress.size > 0; // [mutation-anchor:separation-both]
    if (both) {
      res.violations.push({ rule: 'OWT-017', path: c.path, intent: [...intent], progress: [...progress] });
    }
  }
  return res;
}

// ── OWT-019: next-action naming ──────────────────────────────────────────────

const stripPunct = (s) => s.replace(/^[("'「『“]+|[)"'」』”.,;:!?、。，；：）]+$/g, '');

function pathLike(tok, inCode) {
  const t = stripPunct(tok).replace(/:\d+(?::\d+)?$/, '');
  if (!t || /\s/.test(t) || /^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return null;
  const segs = t.split('/');
  const last = segs[segs.length - 1];
  const ext = /\.([A-Za-z0-9]+)$/.exec(last);
  const hasExt = !!ext && EXTENSIONS.includes(ext[1].toLowerCase()) && last.length > ext[0].length;
  const slashes = segs.length - 1;
  const leading = /^(?:\.{1,2}\/|~\/|\/)./.test(t);
  if (inCode) return (slashes >= 1 || hasExt) && /^[\w@./~-]+$/.test(t) ? t : null;
  if (/^[\w@./~-]+$/.test(t) && (hasExt || leading || slashes >= 2)) return t;
  return null;
}

/**
 * @returns {{status:string, kinds:{kind:string,value:string}[], resolution:string}}
 */
export function classifyNextAction(text, opts = {}) {
  const idRe = new RegExp(opts.idPattern || DEFAULT_ID_PATTERN, 'g');
  const commands = [...COMMANDS, ...(opts.extraCommands || [])]; // [mutation-anchor:extra-commands]
  const kinds = [];
  const push = (kind, value) => { if (!kinds.some((k) => k.kind === kind && k.value === value)) kinds.push({ kind, value }); };
  const idOk = (v) => !ID_PREFIX_DENYLIST.includes(v.split('-')[0]);

  // 1) inline code spans: the author marked these as literal names
  const prose = text.replace(/`([^`]+)`/g, (_, c) => {
    const code = c.trim();
    const first = code.split(/\s+/)[0].replace(/^\$\s*/, '');
    if (pathLike(code, true)) push('path', pathLike(code, true)); // [mutation-anchor:kind-path]
    else if (commands.includes(first) || /^\.{1,2}\//.test(first)) push('command', code); // [mutation-anchor:kind-command]
    else if (/\.(?:test|spec)\.[cm]?[jt]sx?|(?:^|[\s/])test_\w+|::/.test(code)) push('test', code); // [mutation-anchor:kind-test]
    else {
      idRe.lastIndex = 0;
      const m = idRe.exec(code);
      if (m && idOk(m[0])) push('id', m[0]);
    }
    return ' ';
  });

  // 2) prose
  for (const tok of prose.split(/\s+/)) {
    const p = pathLike(tok, false);
    if (p) push('path', p);
  }
  const cmdRe = new RegExp(`(?:^|[^\\w-])(${commands.map(escapeRegExp).join('|')})\\s+([-@\\w./:]+)`, 'g');
  let m;
  while ((m = cmdRe.exec(prose)) !== null) push('command', `${m[1]} ${m[2]}`);
  const testRe = /(?:test|測試)\s*[「"“']([^」"”']{6,})[」"”']/gi;
  while ((m = testRe.exec(prose)) !== null) push('test', m[1]);
  idRe.lastIndex = 0;
  while ((m = idRe.exec(prose)) !== null) if (idOk(m[0])) push('id', m[0]); // [mutation-anchor:kind-id]

  const named = kinds.length > 0; // [mutation-anchor:named]
  if (!named) return { status: 'unnamed', kinds, resolution: 'n/a' };
  const root = opts.root;
  let resolved = false;
  if (root) {
    for (const k of kinds) {
      if (k.kind !== 'path') continue;
      const rel = k.value.replace(/^\.\//, '');
      if (existsSync(isAbsolute(rel) ? rel : join(root, rel))) resolved = true;
    }
  }
  // Only a PATH is ever looked up. A command, a test name or a requirement identifier is checked for being NAMED and
  // can never be resolved, so a named-unresolved row is one of two different things (461 R6): a path that was looked
  // up and is not there, or something that is never looked up. The status stays named-unresolved for both.
  const lookedUp = !!root && kinds.some((k) => k.kind === 'path');
  return {
    status: resolved ? 'named-resolved' : 'named-unresolved',
    kinds,
    resolution: root ? 'attempted (paths only)' : 'not attempted (no --root)',
    unresolved: resolved ? null : (lookedUp ? 'path-missing' : 'not-resolvable'), // [mutation-anchor:unresolved-split]
  };
}

const clip = (s, n) => (s.length > n ? `${s.slice(0, n)}…` : s);

/**
 * Find "next action" fields in a carrier. Three shapes are read, all through the ONE
 * vocabulary VOCAB.nextAction: a heading section, an inline label, and a table column whose
 * HEADER is in that vocabulary (every row of that column is one field).
 *
 * A table row whose cell count differs from the header's is returned in `ragged`, not in
 * `items`: after a stray or missing `|` the next-action cell cannot be told from its
 * neighbour, and reading an absent cell as "empty" would turn a broken row into a quiet
 * "no next action written". It is neither judged nor dropped: the caller counts and lists it.
 * @returns {{fields:number, items:{text:string,where:string}[], ragged:{where:string,cells:number,expected:number}[]}}
 */
export function extractNextActions(md, words = []) {
  const nextRe = nextActionRegExp(words);
  const lines = parseDoc(md, nextRe);
  const items = [];
  const ragged = [];
  let fields = 0;
  const tableIdx = new Set();
  const headerIdx = new Set();
  const tables = findTables(lines);

  for (const t of tables) {
    // every header cell in the shared vocabulary is a next-action column (usually exactly one)
    const cols = t.header.map((c, n) => (nextRe.test(c) ? n : -1)).filter((n) => n >= 0); // [mutation-anchor:table-header]
    const hasCol = cols.length > 0;
    tableIdx.add(t.headerIdx); tableIdx.add(t.headerIdx + 1); headerIdx.add(t.headerIdx);
    t.rows.forEach((r) => tableIdx.add(r.idx));
    if (hasCol) {
      for (const r of t.rows) {
        const who = `row "${clip(r.cells[0].replace(/\*\*|__/g, ''), 40)}"`;
        if (r.cells.length !== t.header.length) {
          ragged.push({ idx: r.idx, where: `table row (line ${r.idx + 1}, ${who})`, cells: r.cells.length, expected: t.header.length });
          continue;
        }
        for (const col of cols) {
          fields++;
          items.push({ text: r.cells[col], where: `table column "${t.header[col]}" (line ${r.idx + 1}, ${who})` });
        }
      }
    }
    // rows inside a nextAction-class section are handled by the section walk below
    t.hasNextActionColumn = hasCol;
  }

  // inline labelled  "**Next action**: ..." (outside tables that have their own column)
  const labelRe = new RegExp(`(?:\\*\\*|__)?(?:${nextRe.source})(?:\\*\\*|__)?\\s*[:：]\\s*(.+)$`, 'i');
  const colTableRows = new Set();
  // Only rows read through the column are exempt from the label scan. A ragged row was not
  // read, so an inline "Next action: ..." inside it must still be seen (else it goes dark).
  const raggedIdx = new Set(ragged.map((g) => g.idx));
  for (const t of tables) if (t.hasNextActionColumn) t.rows.forEach((r) => { if (!raggedIdx.has(r.idx)) colTableRows.add(r.idx); });
  lines.forEach((l, idx) => {
    if (l.front || l.fence || l.inFence || l.heading || l.cls === 'nextAction' || colTableRows.has(idx)) return;
    // a label inside a table row reads to the end of the row, not into its closing pipe
    const m = labelRe.exec(unquote(l.text).trim().startsWith('|') ? l.text.replace(/\s*\|\s*$/, '') : l.text);
    if (m && !/^\s*$/.test(m[1])) { fields++; items.push({ text: m[1], where: `label (line ${idx + 1})` }); }
  });

  // heading sections classed nextAction
  const byOwner = new Map();
  lines.forEach((l, idx) => {
    if (l.front || l.cls !== 'nextAction' || !l.owner || l.owner.cls !== 'nextAction') return;
    if (l.heading) { if (!byOwner.has(l.owner)) byOwner.set(l.owner, []); return; }
    if (!byOwner.has(l.owner)) byOwner.set(l.owner, []);
    byOwner.get(l.owner).push({ l, idx });
  });
  for (const [owner, body] of byOwner) {
    const sec = [];
    let cur = null;
    let fenceBuf = false;
    const flush = () => { if (cur !== null && norm(cur)) sec.push(norm(cur)); cur = null; };
    for (const { l, idx } of body) {
      if (l.fence) { fenceBuf = !fenceBuf; continue; }
      if (l.inFence) { if (norm(l.text)) cur = (cur ?? '') + ` \`${norm(l.text)}\``; continue; }
      if (tableIdx.has(idx)) {
        if (isSepRow(l.text) || headerIdx.has(idx) || colTableRows.has(idx)) continue;
        sec.push(norm(splitRow(l.text).join(' ')));
        continue;
      }
      const li = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(l.text);
      if (li) { flush(); cur = li[1]; } else if (!norm(l.text)) { flush(); } else { cur = (cur === null ? '' : cur + ' ') + l.text.trim(); }
    }
    flush();
    // a section whose only content is a table that has its own next-action column
    // was already counted through that column; it is not an empty field
    if (sec.length === 0 && body.some(({ idx }) => colTableRows.has(idx))) continue;
    fields++;
    if (sec.length === 0) items.push({ text: '', where: `section "${owner.heading}" (empty)` });
    for (const s of sec) items.push({ text: s, where: `section "${owner.heading}"` });
  }
  return { fields, items, ragged };
}

export function checkNextActions(carriers, opts = {}) {
  const res = { walked: 0, empty: 0, counts: { 'named-resolved': 0, 'named-unresolved': 0, unnamed: 0 }, unresolvedSplit: { 'path-missing': 0, 'not-resolvable': 0 }, violations: [], detail: [], noFieldCarriers: [], undecidable: [] };
  for (const c of carriers) {
    const { fields, items, ragged } = extractNextActions(c.content, opts.words);
    for (const g of ragged) res.undecidable.push({ path: c.path, ...g });
    if (fields === 0 && ragged.length === 0) { res.noFieldCarriers.push(c.path); continue; }
    for (const it of items) {
      const text = it.text.replace(/\*\*|__/g, '').trim();
      if (EMPTY_FIELD.test(text)) { res.empty++; continue; }
      res.walked++;
      const r = classifyNextAction(text, opts);
      res.counts[r.status]++;
      if (r.unresolved) res.unresolvedSplit[r.unresolved]++;
      res.detail.push({ path: c.path, where: it.where, text, ...r });
      if (r.status === 'unnamed') res.violations.push({ rule: 'OWT-019', path: c.path, where: it.where, text });
    }
  }
  return res;
}

// ── 461 R6: say what "resolved" resolved ─────────────────────────────────────
// `named-resolved`, `named-unresolved` and `unnamed` do not say against WHAT a path was looked up, and
// `named-unresolved` reads as a failure although it also holds every command, test name and requirement
// identifier, which are never looked up at all. These lines are ADDED after the counts line; nothing 1.1.0
// printed is changed or moved (the frozen capture is compared with these lines taken out).

/** Is this file inside a git working tree? Asked of git, never worked out from the path. */
function insideGitRepo(file) {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: dirname(resolve(file)), stdio: ['ignore', 'pipe', 'ignore'] });
    return true;
  } catch { return false; }
}

/** The one sentence that says where a lookup starts and where that came from, for a path (next-action) and for a project (waiting) alike. */
export function lookupSentence(what, dir, source) {
  return `${what} is looked up under ${resolve(dir)} (${source})`;
}

/**
 * @param {{root:string, rootGiven:boolean, carriers:{path:string}[], split:{'path-missing':number,'not-resolvable':number}, unresolved:number, commands:string[]}} a
 * @returns {string[]} lines, without the `[owt] ` prefix
 */
export function explainResolution({ root, rootGiven, carriers, split, unresolved, commands = [] }) {
  const out = [];
  out.push(`  of the named-unresolved (${unresolved}): path-missing=${split['path-missing']} not-resolvable=${split['not-resolvable']}`);
  out.push(`RESOLUTION: ${lookupSentence('a path', root, rootGiven ? 'from --root' : 'the current directory: no --root was given')}. Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.`); // [mutation-anchor:resolution-line]
  if (!rootGiven) {
    for (const c of carriers) {
      if (!insideGitRepo(c.path)) { out.push(`RESOLUTION: ${c.path} is outside any git repository, so its paths are resolved against ${resolve(root)}, not against where the file is; pass --root to say where its paths start`); break; } // [mutation-anchor:outside-repo]
    }
  }
  if (commands.length) out.push(`RESOLUTION: read as commands in addition to the built-in list: ${commands.join(', ')}`);
  return out;
}

// ── 461 R3: when no carrier has a next-action field, say what each one showed ─
// Exit 2 ("cannot decide") says nothing about WHY. A reader cannot tell "this carrier writes the
// column in words the list does not hold" from "this carrier has no next-action field at all", and
// those two call for opposite actions (declare a word; or nothing). This reads the same structure the
// check read (headings and table headers) and says what it saw.

/** How many headings and table headers are listed per carrier before "and N more". About 20, on purpose. */
export const DIAGNOSTIC_LIST_LIMIT = 20;

/** The headings and table headers a carrier shows, each distinct text once with how many times it occurs. */
export function describeCarrier(md) {
  const lines = parseDoc(md);
  const count = (list) => {
    const seen = new Map();
    for (const t of list) { const k = norm(t); if (k) seen.set(k, (seen.get(k) || 0) + 1); }
    return [...seen].map(([text, n]) => ({ text, n }));
  };
  const tables = findTables(lines);
  return {
    tables: tables.length,
    headers: count(tables.flatMap((t) => t.header)),
    headings: count(lines.filter((l) => l.heading).map((l) => l.heading.heading)),
  };
}

/**
 * The lines printed after "no next-action field found". Pure: carriers and declared words in, text out.
 * `rowsUnreadable` lists the paths whose next-action column was found but whose rows could not be read.
 * @returns {string[]}
 */
export function explainNoNextActionField(carriers, words = [], rowsUnreadable = []) {
  const out = [];
  const quoted = (list) => list.map((x) => `"${x.text}"${x.n > 1 ? ` (x${x.n})` : ''}`).join(', ');
  out.push('WHY: no carrier had a next-action field. What each one showed:');
  for (const c of carriers) {
    const d = describeCarrier(c.content);
    const unreadable = rowsUnreadable.includes(c.path);
    let verdict;
    if (unreadable) verdict = 'has a next-action column, but its table rows could not be read (see UNDECIDABLE above)';
    else if (d.tables > 0) verdict = `has ${d.tables} table(s), but no table header matches a recognised word; if one of them is your next-action column, declare its word`;
    else if (d.headings.length > 0) verdict = 'has no table, and no heading matches a recognised word; if one of these headings is your next-action section, declare its word';
    else verdict = 'has no table and no heading to read; this carrier may have no next-action field at all, and no word would change that';
    out.push(`  ${c.path}: ${verdict}`);
    let budget = DIAGNOSTIC_LIST_LIMIT;
    const show = (label, list) => {
      if (!list.length) return;
      const shown = list.slice(0, Math.max(budget, 0));
      budget -= shown.length;
      out.push(`    ${label} (${list.length} distinct): ${quoted(shown)}${list.length > shown.length ? `, and ${list.length - shown.length} more` : ''}`); // [mutation-anchor:diagnostic-list]
    };
    show('table headers', d.headers);
    show('headings', d.headings);
  }
  out.push(`WORDS RECOGNISED (a heading, a table header or an inline "word: ..." label that contains one of these, any case): built in: ${NEXT_ACTION_WORDS.map(([, shown]) => shown).join(' | ')}`);
  out.push(words.length ? `  declared by you: ${words.join(' | ')}` : '  declared by you: none');
  out.push('TO ADD A WORD: pass --next-action-word <word> (repeat it for several), or list it under open_work: next_action_words: in uds.project.yaml. It is plain text, not a pattern, and it is added to the same list for headings, table headers and labels.');
  return out;
}

// ── OWT-020 … OWT-026: two states before a reply, and observed facts ─────────
// open-work-tracking 1.2.0 (dev-platform XSPEC-459). Everything here is UNCALIBRATED (OWT-016):
// the state words, the field names and the "derivable subject" list are initial judgments in
// English and Chinese. A carrier whose words differ is not read, which is reported (coverage
// unknown, OWT-011), never read as clean.

export const VOCAB_STATE = {
  // header / label vocabulary: which structural field is which
  roles: {
    status: /\bstatus\b|\bstate\b|狀態/i,
    askedAt: /asked[\s-]?(?:at|on|date)|(?:詢問|發問|送出|寄出|已問)(?:時間|日期)|問於/i,
    awaiting: /\bwait(?:ing)?[\s-]?(?:for|on)\b|\bawaiting\b|\bblocked[\s-]?on\b|等什麼|等待(?:對象|什麼|內容)|等誰/i,
    release: /\brelease\b|\bunblock|解除|放行/i,
    draft: /\bdraft\b|\bto[\s-]?send\b|草稿|待送出|待問/i,
    observedBy: /observed[\s-]?by|seen[\s-]?by|觀察者|誰看到|觀察人/i,
    observedAt: /observed[\s-]?(?:at|on|date)|seen[\s-]?(?:at|on)|觀察(?:時間|日期)|何時看到/i,
    value: /^(?:value|observed[\s-]?value|result|觀察值|觀察結果|值|結果)$/i,
    subject: /^(?:fact|subject|observation|observed[\s-]?fact|事實|觀察項目|觀察對象|事項)$/i,
  },
  notYetAsked: /not[\s-]*(?:yet[\s-]*)?(?:asked|sent)|\bunasked\b|\bunsent\b|還沒問|尚未(?:詢問|送出|提問|發問|問)|未(?:詢問|送出|提問|問)|還沒送出|待問|待送出/i,
  askedAwaiting: /\b(?:asked|sent)[\s,;&—–-]*(?:and[\s-]*)?(?:awaiting|waiting)\b|已(?:問|詢問|送出|寄出|發問)/i,
  waiting: /\b(?:waiting|awaiting|blocked[\s-]*on|on[\s-]*hold|pending)\b|等待|等候|待回覆|待回應|卡在/i,
  // The WHOLE cell must be a done word: "done except X" and "尚未完成" are not done.
  done: /^[\s\p{P}\p{S}]*(?:done|completed?|closed|resolved|已完成|已結案|完成|結案|✅)[\s\p{P}\p{S}]*$/iu,
  // The value domain of an observed fact. `unknown` is a real value, never a blank.
  yes: /^(?:yes|y|true|是|有)$/i,
  no: /^(?:no|n|false|否|沒有)$/i,
  unknown: /^(?:unknown|\?|未知|不明|看不到|無法確認|unobserved)$/i,
  // Subjects that version control, a spec marker or a CI result already determine (OWT-003 stands).
  derivable: /\b(?:merged|pushed|committed|tagged)\b|\bci\b|\bcontinuous integration\b|\b(?:tests?|build)\s+(?:pass(?:ed|ing)?|green)\b|\bspec\s+(?:status|marker)\b|已合併|已推送|已提交|CI\s*(?:通過|綠|狀態)|測試通過|建置通過|規格(?:狀態|標記)/i,
};

/** Default age (days) past which an observation is reported as stale. An initial judgment, UNCALIBRATED (OWT-016). */
export const DEFAULT_STALE_AFTER_DAYS = 7;

const BLANK_FIELD = /^(?:|-+|—|–|n\/?a|none|tbd|\?+|無|待定|未知|unknown)$/i;
const stripMd = (s) => s.replace(/\*\*|__|`/g, '').trim();

const rolesOf = (header) => Object.entries(VOCAB_STATE.roles).filter(([, re]) => re.test(header)).map(([role]) => role);

// inline labels in a list item: "status: not-yet-asked; draft: drafts/q.md"
const LABEL_WORDS = [
  ['status', /(?:status|state|狀態)/],
  ['askedAt', /(?:asked[\s-]?(?:at|on)|(?:詢問|發問|送出|寄出)(?:時間|日期))/],
  ['awaiting', /(?:waiting[\s-]?(?:for|on)|awaiting|等什麼|等待對象|等誰)/],
  ['release', /(?:release|unblock(?:ed)?[\s-]?(?:by|when)|解除條件|解除)/],
  ['draft', /(?:draft|to[\s-]?send|草稿|待送出)/],
  ['observedBy', /(?:observed[\s-]?by|seen[\s-]?by|觀察者)/],
  ['observedAt', /(?:observed[\s-]?(?:at|on)|seen[\s-]?(?:at|on)|觀察時間|觀察日期)/],
  ['value', /(?:observed[\s-]?value|value|觀察值|觀察結果)/],
  ['subject', /(?:fact|subject|事實|觀察項目)/],
];

function parseRoleLabels(text) {
  const hits = [];
  for (const [role, word] of LABEL_WORDS) {
    const re = new RegExp(`(?:^|[;；,，|(（]\\s*|\\s)(${word.source})[\\w\\s-]{0,12}[:：]`, 'gi');
    let m;
    while ((m = re.exec(text)) !== null) {
      const start = m.index + m[0].indexOf(m[1]);
      hits.push({ role, start, end: m.index + m[0].length });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const kept = [];
  for (const h of hits) if (!kept.length || h.start >= kept[kept.length - 1].end) kept.push(h);
  const f = {};
  const fr = {}; // the same values with their Markdown kept: a `code span` is how a command or a test name is told from prose
  kept.forEach((h, i) => {
    const next = kept[i + 1] ? kept[i + 1].start : text.length;
    const val = stripMd(text.slice(h.end, next)).replace(/[;；,，|]+$/, '').trim();
    if (f[h.role] === undefined) { f[h.role] = val; fr[h.role] = text.slice(h.end, next).replace(/[;；,，|]+$/, '').trim(); }
  });
  const title = stripMd(text.slice(0, kept.length ? kept[0].start : text.length)).replace(/[\s;；,，|—–:：-]+$/, '').trim();
  return { f, fr, title };
}

/**
 * The structural records a carrier holds for these checks: every row of a table that has a
 * recognised field column, and every top-level list item (with its indented lines) that carries
 * recognised labels. A table row whose cell count differs from its header is returned in
 * `ragged`, never read as empty (same rule as the next-action table).
 * @returns {{records:object[], ragged:object[]}}
 */
export function extractRecords(md) {
  const lines = parseDoc(md);
  const records = [];
  const ragged = [];
  const inTable = new Set();
  for (const t of findTables(lines)) {
    inTable.add(t.headerIdx); inTable.add(t.headerIdx + 1);
    t.rows.forEach((r) => inTable.add(r.idx));
    const roles = t.header.map(rolesOf);
    const columns = new Set(roles.flat());
    if (!columns.size) continue;
    for (const r of t.rows) {
      const title = stripMd(r.cells[0] || '');
      const where = `table row (line ${r.idx + 1}, row "${clip(title, 40)}")`;
      if (r.cells.length !== t.header.length) { ragged.push({ idx: r.idx, where, cells: r.cells.length, expected: t.header.length, columns }); continue; }
      const f = {};
      const fr = {};
      roles.forEach((rs, n) => rs.forEach((role) => { if (f[role] === undefined) { f[role] = stripMd(r.cells[n]); fr[role] = r.cells[n]; } }));
      records.push({ where, title, f, fr, columns });
    }
  }
  let cur = null;
  const flush = () => {
    if (cur) {
      const text = cur.parts.join(' ; ');
      const { f, fr, title } = parseRoleLabels(text);
      if (Object.keys(f).length) {
        records.push({ where: `list item (line ${cur.idx + 1}, "${clip(title || stripMd(cur.parts[0]), 40)}")`, title: title || stripMd(cur.parts[0]), f, fr, columns: new Set(Object.keys(f)) });
      }
    }
    cur = null;
  };
  lines.forEach((l, idx) => {
    if (l.front || l.fence || l.inFence || l.heading || inTable.has(idx)) { flush(); return; }
    const li = /^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/.exec(l.text);
    if (li && li[1].length === 0) { flush(); cur = { idx, parts: [li[2]] }; } else if (cur && /^\s+\S/.test(l.text)) cur.parts.push(l.text.trim().replace(/^(?:[-*+]|\d+[.)])\s+/, '')); else flush();
  });
  flush();
  return { records, ragged };
}

const DATE_IN_TEXT = /(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/;

/** A calendar day (UTC ms) from the first date in the text, or null. The year is required; the time of day is ignored. */
export function parseDay(text) {
  const m = DATE_IN_TEXT.exec(text || '');
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return t;
}

const DAY_MS = 86400000;
const dayString = (t) => new Date(t).toISOString().slice(0, 10);
export const todayUtc = () => { const n = new Date(); return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()); };

/** The structural state of a record's status field. */
export function classifyState(statusText) {
  const t = stripMd(statusText || '');
  if (VOCAB_STATE.done.test(t)) return 'done';
  if (VOCAB_STATE.notYetAsked.test(t)) return 'not-yet-asked';
  if (VOCAB_STATE.askedAwaiting.test(t)) return 'asked-awaiting';
  if (VOCAB_STATE.waiting.test(t)) return 'waiting-unspecified';
  return 'other';
}

/** `{value:'yes'|'no'|'unknown'}` or `{value:null}` for anything outside the domain, including blank. */
export function classifyValue(text) {
  const t = stripMd(text || '').replace(/[.。]+$/, '');
  if (VOCAB_STATE.yes.test(t)) return 'yes';
  if (VOCAB_STATE.no.test(t)) return 'no';
  if (VOCAB_STATE.unknown.test(t)) return 'unknown';
  return null;
}

const ageDays = (now, day) => Math.floor((now - day) / DAY_MS);

// ── OWT-027 / OWT-028: a release condition that names an object in another project ──
// open-work-tracking 1.3.0 (dev-platform XSPEC-460). Local only: it reads files and git tags on THIS
// machine and opens no network connection. The names, the machine-specific path prefixes and the
// kinds it can resolve are an initial judgment (OWT-016).
//
// A project is named by a LOGICAL name (`uds`, `vibeops`), never by a directory: a directory is
// machine-specific (it leaks a user name and is wrong on the next machine), and two readers of one
// carrier must mean the same project by one name. Where a name lives on this machine is supplied
// outside the carrier (`--root NAME=DIR`, or `open_work.projects` in uds.project.yaml).

export const PROJECT_NAME = /^[a-z][a-z0-9_-]{1,31}$/;
const URL_SCHEMES = new Set(['http', 'https', 'ftp', 'file', 'ssh', 'git', 'mailto', 'tel', 'data', 'javascript', 'ws', 'wss']);
// <name>:<object>. The name is lower-case and at least two characters (so `C:\` is never a project); the
// object is one token, or a `code span` for a command or a test name. Not inside a word, a path or a URL.
const REF_RE = /(?<![\w./@:\\-])([a-z][a-z0-9_-]{1,31}):(?!\/\/)(`[^`\n]+`|[^\s`|;,，；、()（）[\]{}<>"']+)/g;
// A machine-specific absolute path: a home or volume prefix, a drive letter, `~/`, a UNC share, a file: URL.
const MACHINE_PATH = /(?:^|[\s"'`(=:])(?:\/(?:Users|home|root|Volumes|mnt|private|var|opt|srv|tmp|etc)\/|[A-Za-z]:[\\/]|~[\\/]|\\\\[\w.$-]+\\)|file:\/\//i;
const TAG_NAME = /^[A-Za-z0-9][\w.+-]*$/;

const isAbsoluteObject = (o) => /^(?:\/|~[\\/]|[A-Za-z]:[\\/]|\\\\)/.test(o);
const leavesProject = (o) => /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(o);

/** @returns {{kind:'path'|'tag'|'id'|'command'|'test'|'object'|'absolute'|'outside', value:string}} */
export function classifyObject(raw, idPattern = DEFAULT_ID_PATTERN, extraCommands = []) {
  const code = raw.startsWith('`');
  let obj = code ? raw.slice(1, -1).trim() : raw.replace(/[.:!?]+$/, '');
  if (!obj) return { kind: 'object', value: raw };
  if (isAbsoluteObject(obj)) return { kind: 'absolute', value: obj };
  if (leavesProject(obj)) return { kind: 'outside', value: obj };
  const idFull = new RegExp(`^(?:${idPattern})$`);
  const idOk = (v) => idFull.test(v) && !ID_PREFIX_DENYLIST.includes(v.split('-')[0]);
  if (code) {
    const first = obj.split(/\s+/)[0].replace(/^\$\s*/, '');
    if (pathLike(obj, true)) return { kind: 'path', value: obj };
    if (COMMANDS.includes(first) || extraCommands.includes(first)) return { kind: 'command', value: obj };
    if (/\.(?:test|spec)\.[cm]?[jt]sx?|(?:^|[\s/])test_\w+|::/.test(obj)) return { kind: 'test', value: obj };
    if (idOk(obj)) return { kind: 'id', value: obj };
    return { kind: 'object', value: obj };
  }
  if (pathLike(obj, true)) return { kind: 'path', value: obj };
  if (idOk(obj)) return { kind: 'id', value: obj };
  if (TAG_NAME.test(obj)) return { kind: 'tag', value: obj };
  return { kind: 'object', value: obj };
}

/** Every `<project>:<object>` in a piece of text. */
export function findReferences(text, idPattern, extraCommands = []) {
  const refs = [];
  REF_RE.lastIndex = 0;
  let m;
  while ((m = REF_RE.exec(text || '')) !== null) {
    if (URL_SCHEMES.has(m[1])) continue;
    const obj = classifyObject(m[2], idPattern, extraCommands);
    if (!refs.some((r) => r.name === m[1] && r.value === obj.value)) refs.push({ name: m[1], ...obj });
  }
  return refs;
}

/**
 * `--root` values for `waiting`. A value that looks like NAME=DIR (a name, then `=`, with no path separator
 * before the `=`) says where project NAME lives; any other value is the single directory relative paths are
 * resolved against, exactly as before. Directories are resolved against the current directory.
 * @returns {{plain:string|undefined, named:Map<string,string>, error:string|null}}
 */
export function parseRootOptions(values) {
  const named = new Map();
  let plain;
  for (const v of values) {
    if (typeof v !== 'string' || v === '') return { plain: undefined, named, error: '--root needs a directory, or NAME=DIR' };
    const m = /^([^\s/\\=]+)=(.*)$/s.exec(v);
    if (!m) {
      if (plain !== undefined) return { plain: undefined, named, error: `--root DIR was given more than once ("${plain}" and "${v}"); give one directory, and NAME=DIR for each other project` };
      plain = v;
      continue;
    }
    if (!PROJECT_NAME.test(m[1])) return { plain: undefined, named, error: `--root ${v}: the project name "${m[1]}" is not a logical name (lower-case letters, digits, "-" and "_", starting with a letter, 2 to 32 characters)` };
    if (m[2].trim() === '') return { plain: undefined, named, error: `--root ${m[1]}=: the directory is empty` };
    const dir = resolve(m[2]);
    if (named.has(m[1]) && named.get(m[1]) !== dir) return { plain: undefined, named, error: `--root names project "${m[1]}" twice with different directories` };
    named.set(m[1], dir);
  }
  return { plain, named, error: null };
}

/** What can be observed on this machine. Injected in the self-test, so a rule never reads the disk by itself. */
export const REAL_ENV = {
  dirExists: (d) => { try { return statSync(d).isDirectory(); } catch { return false; } },
  pathExists: (p) => existsSync(p),
  // 'present' | 'absent' | 'unreadable' (not a git repository, git missing, or git failed): never a guess
  tagState: (dir, tag) => {
    const env = { ...process.env };
    for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES']) delete env[k];
    const r = spawnSync('git', ['-C', dir, 'show-ref', '--verify', '--quiet', `refs/tags/${tag}`], { stdio: 'ignore', env });
    if (r.error || r.status === null) return 'unreadable';
    if (r.status === 0) return 'present';
    if (r.status === 1) return 'absent';
    return 'unreadable';
  },
};

const OBSERVABLE = { path: 'machine-observable', tag: 'machine-observable' };

/**
 * OWT-028: where does the other project stand? Four answers, never folded into one:
 *   released          the object exists there now (a path on disk, a version-control tag)
 *   not-yet-released  the project is visible and the object is not there
 *   not-visible       this machine cannot see the project, so nothing is known — NOT released, NOT zero
 *   needs-a-person    the project is visible but this kind of object (a test name, a command, a spec or
 *                     requirement identifier) has nothing here that can be read; a person confirms it
 * @param {Map<string,string>} projects logical name -> directory on this machine
 */
export function resolveReference(ref, projects, env = REAL_ENV) {
  const dir = projects.get(ref.name);
  if (dir === undefined) return { status: 'not-visible', why: `no directory on this machine is declared for project "${ref.name}" (--root ${ref.name}=DIR)` }; // [mutation-anchor:not-visible]
  if (!env.dirExists(dir)) return { status: 'not-visible', why: `the directory declared for project "${ref.name}" does not exist on this machine` };
  if (ref.kind === 'path') return env.pathExists(join(dir, ref.value.replace(/^\.\//, ''))) ? { status: 'released', why: 'the path exists there' } : { status: 'not-yet-released', why: 'the path does not exist there'}; // [mutation-anchor:path-exists]
  if (ref.kind === 'tag') {
    const t = env.tagState(dir, ref.value);
    if (t === 'unreadable') return { status: 'not-visible', why: `the tags of project "${ref.name}" cannot be read here (not a git repository, or git failed)` };
    return t === 'present' ? { status: 'released', why: 'the tag exists there' } : { status: 'not-yet-released', why: 'the tag does not exist there' }; // [mutation-anchor:tag-present]
  }
  return { status: 'needs-a-person', why: `a ${ref.kind === 'id' ? 'requirement or specification identifier' : ref.kind === 'object' ? 'free-form object' : ref.kind} in another project has nothing this check can read` }; // [mutation-anchor:needs-a-person]
}

/**
 * OWT-020 / OWT-021 / OWT-022. Reads every record that has a status field (OWT-010: a structural
 * field, never prose). `now` is a UTC day (ms); inject it, never read the clock inside a rule.
 */
export function checkWaiting(carriers, opts = {}) {
  const now = opts.now ?? todayUtc();
  const projects = opts.projects ?? new Map();
  const env = opts.env ?? REAL_ENV;
  const res = {
    walked: 0, counts: { 'not-yet-asked': 0, 'asked-awaiting': 0, 'waiting-unspecified': 0, 'waiting-cross-project': 0, done: 0, other: 0 },
    cross: { found: 0, counts: { released: 0, 'not-yet-released': 0, 'not-visible': 0, 'needs-a-person': 0 }, items: [] },
    violations: [], detail: [], ragged: [], noStateCarriers: [],
  };
  for (const c of carriers) {
    const { records, ragged } = extractRecords(c.content);
    for (const g of ragged) if (g.columns.has('status')) res.ragged.push({ path: c.path, ...g });
    const withStatus = records.filter((r) => r.f.status !== undefined);
    if (!withStatus.length) { res.noStateCarriers.push(c.path); continue; }
    for (const r of withStatus) {
      res.walked++;
      let state = classifyState(r.f.status);
      const at = { path: c.path, where: r.where };
      const bad = (rule, why) => res.violations.push({ rule, ...at, why });
      const note = [];
      // OWT-027 / OWT-028: a release condition (or what it waits for) that names an object in another project
      const waitingNow = state === 'not-yet-asked' || state === 'asked-awaiting' || state === 'waiting-unspecified';
      const conditionText = [r.fr.release, r.fr.awaiting].filter((x) => x !== undefined && x !== '').join(' ; ');
      const refs = waitingNow ? findReferences(conditionText, opts.idPattern, opts.extraCommands) : [];
      if (waitingNow && (MACHINE_PATH.test(conditionText) || refs.some((x) => x.kind === 'absolute'))) { // [mutation-anchor:machine-path]
        bad('OWT-027', `names a machine-specific absolute path in what it waits for or its release ("${clip(conditionText, 60)}"): name the other project by its logical name, <name>:<path inside it>, and keep the directory out of the carrier`);
      }
      for (const x of refs) {
        if (x.kind === 'outside') { bad('OWT-027', `names "${x.name}:${x.value}", a path that leaves project "${x.name}"; give a path inside it`); continue; }
        if (x.kind === 'absolute') continue; // already a violation above
        const got = resolveReference(x, projects, env);
        res.cross.found++;
        res.cross.counts[got.status]++;
        res.cross.items.push({ ...at, name: x.name, object: x.value, kind: x.kind, observable: OBSERVABLE[x.kind] ?? 'needs a person', ...got });
      }
      // An item that waits for an observable event in another project has no request to have "asked":
      // OWT-020's two states are about a reply, and this is not one. It is counted on its own line.
      if (state === 'waiting-unspecified' && refs.some((x) => x.kind !== 'absolute' && x.kind !== 'outside')) state = 'waiting-cross-project'; // [mutation-anchor:cross-project-exempt]
      res.counts[state]++;
      const unspecified = state === 'waiting-unspecified'; // [mutation-anchor:waiting-unspecified]
      if (unspecified) bad('OWT-020', 'is waiting but does not say whether it has been asked (neither not-yet-asked nor asked-awaiting)');
      if (state === 'not-yet-asked') {
        const named = classifyNextAction(`${r.f.draft ?? ''} ${r.f.status}`, { root: opts.root, idPattern: opts.idPattern, extraCommands: opts.extraCommands }).status !== 'unnamed'; // [mutation-anchor:not-yet-asked-names]
        if (!named) bad('OWT-021', 'is not-yet-asked but names no draft or action: no file path, command, test name or requirement identifier');
      }
      if (state === 'asked-awaiting') {
        const day = parseDay(r.f.askedAt);
        if (day === null) bad('OWT-022', r.f.askedAt === undefined || BLANK_FIELD.test(r.f.askedAt ?? '') ? 'is asked-awaiting but has no asked-at' : `has an asked-at that is not a date with a year: "${clip(r.f.askedAt, 40)}"`); // [mutation-anchor:asked-at-required]
        else if (day > now) bad('OWT-022', `has an asked-at (${dayString(day)}) later than today (${dayString(now)})`);
        else note.push(`asked ${ageDays(now, day)}d ago`);
        const hasWhat = r.f.awaiting !== undefined && !BLANK_FIELD.test(r.f.awaiting);
        const hasRelease = r.f.release !== undefined && !BLANK_FIELD.test(r.f.release);
        if (!(hasWhat && hasRelease)) bad('OWT-022', `is asked-awaiting but does not state ${!hasWhat && !hasRelease ? 'what it waits for and what event releases it' : !hasWhat ? 'what it waits for' : 'what event releases it'} (OWT-002)`); // [mutation-anchor:asked-release-required]
      }
      res.detail.push({ ...at, state, text: r.title, note: note.join(', ') });
    }
  }
  return res;
}

/**
 * OWT-023 / OWT-024 / OWT-025 / OWT-026. Reads every record of a table or list item that carries an
 * observed-by or observed-at field. It decides that the fields exist, are well formed, and how old
 * the stamp is. It cannot decide that the observation is true, or that it still is (OWT-014).
 */
export function checkObservations(carriers, opts = {}) {
  const now = opts.now ?? todayUtc();
  const staleAfter = opts.staleAfterDays ?? DEFAULT_STALE_AFTER_DAYS;
  const res = {
    walked: 0, now, staleAfter, counts: { yes: 0, no: 0, unknown: 0, invalid: 0 }, stale: [], unknown: [], confirmed: 0,
    violations: [], detail: [], ragged: [], noObservationCarriers: [],
  };
  for (const c of carriers) {
    const { records, ragged } = extractRecords(c.content);
    for (const g of ragged) if (g.columns.has('observedBy') || g.columns.has('observedAt')) res.ragged.push({ path: c.path, ...g });
    const obs = records.filter((r) => r.columns.has('observedBy') || r.columns.has('observedAt'));
    if (!obs.length) { res.noObservationCarriers.push(c.path); continue; }
    for (const r of obs) {
      res.walked++;
      const at = { path: c.path, where: r.where };
      const bad = (rule, why) => res.violations.push({ rule, ...at, why });
      let wellFormed = true;
      const fail = (rule, why) => { wellFormed = false; bad(rule, why); };
      const by = r.f.observedBy;
      if (by === undefined || BLANK_FIELD.test(by)) fail('OWT-023', 'has no observed-by: who or what saw this is not recorded'); // [mutation-anchor:observed-by-required]
      const day = parseDay(r.f.observedAt);
      let age = null;
      if (day === null) fail('OWT-023', r.f.observedAt === undefined || BLANK_FIELD.test(r.f.observedAt) ? 'has no observed-at: when it was seen is not recorded' : `has an observed-at that is not a date with a year: "${clip(r.f.observedAt, 40)}"`); // [mutation-anchor:observed-at-required]
      else if (day > now) fail('OWT-023', `has an observed-at (${dayString(day)}) later than today (${dayString(now)})`);
      else age = ageDays(now, day);
      const value = classifyValue(r.f.value);
      if (value === null) fail('OWT-023', `has no value of yes, no or unknown${r.f.value ? ` (found "${clip(r.f.value, 30)}")` : ''}`); // [mutation-anchor:value-domain]
      const subject = r.f.subject ?? r.title;
      if (VOCAB_STATE.derivable.test(subject)) fail('OWT-026', `is a hand-written observation of "${clip(subject, 50)}", which version control, a spec marker or a CI result determines (OWT-003 stands)`); // [mutation-anchor:derivable]
      if (value === null) res.counts.invalid++; else res.counts[value]++;
      const isStale = age !== null && age > staleAfter; // [mutation-anchor:stale]
      const claimsDone = r.f.status !== undefined && classifyState(r.f.status) === 'done';
      if (value === 'unknown') {
        res.unknown.push({ ...at, text: r.title });
        if (claimsDone) bad('OWT-024', 'is marked done while its observation is unknown: unknown never counts as complete'); // [mutation-anchor:unknown-not-done]
      }
      if (isStale) res.stale.push({ ...at, text: r.title, age, claimsDone });
      const confirmed = wellFormed && value === 'yes' && !isStale; // [mutation-anchor:confirmed]
      if (confirmed) res.confirmed++;
      res.detail.push({ ...at, text: r.title, value: value ?? '?', age, by: by ?? '', observedAt: r.f.observedAt ?? '' });
    }
  }
  return res;
}

// ── Self-test arms (the main path runs these first; a broken checker is exit 2) ─

export function runSelfTest() {
  const failures = [];
  const expect = (name, cond) => { if (!cond) failures.push(name); };

  // OWT-019
  expect('D2 violating: verb-only is unnamed', classifyNextAction('Continue implementation', {}).status === 'unnamed');
  expect('D2 violating: vague sentence is unnamed', classifyNextAction('handle the rest of the items and clean up', {}).status === 'unnamed');
  expect('D2 clean: path', classifyNextAction('edit scripts/foo.mjs', {}).status !== 'unnamed');
  expect('D2 clean: command', classifyNextAction('run `npm test` again', {}).status !== 'unnamed');
  expect('D2 clean: identifier', classifyNextAction('finish XSPEC-436 R1', {}).status !== 'unnamed');
  expect('D2 clean: test name', classifyNextAction('make the test "a next action that names nothing is reported" pass', {}).status !== 'unnamed');

  // OWT-019, table columns: the header decides which column is read, never the position
  const tbl = extractNextActions('| item | state | Next action |\n|---|---|---|\n| a | open | keep going |\n');
  expect('D2 clean: only the header-named column is a next-action field', tbl.fields === 1 && tbl.items[0].text === 'keep going');
  expect('D2 clean: a table without such a header has no next-action field', extractNextActions('| item | state |\n|---|---|\n| a | open |\n').fields === 0);

  // OWT-018
  const spec = (ac, rev) => `# S\n\n## Acceptance criteria\n\n${ac}\n\n## Revisions\n\n${rev}\n`;
  const table = (rows) => `| Change | Approver | Reason |\n|---|---|---|\n${rows}`;
  const r0 = checkIntentRevision({ before: spec('- A', table('')), after: spec('- A\n- B', table('')) });
  expect('D1 violating: changed, no record -> violation', r0.violations.length === 1 && r0.handBack.length === 1);
  const r1 = checkIntentRevision({ before: spec('- A', table('')), after: spec('- A\n- B', table('| added B | | scope grew |\n')) });
  expect('D1 violating: record without approver -> hand-back only', r1.violations.length === 0 && r1.handBack.length === 1);
  const r2 = checkIntentRevision({ before: spec('- A', table('')), after: spec('- A\n- B', table('| added B | albert | scope grew |\n')) });
  expect('D1 clean: recorded and approved', r2.violations.length === 0 && r2.handBack.length === 0 && r2.status === 'changed-recorded');
  const r3 = checkIntentRevision({ before: spec('- A', table('')), after: spec('- A', table('')) });
  expect('D1 clean: unchanged', r3.status === 'unchanged');

  // OWT-017
  const both = checkSeparation([{ path: 'x.md', content: '# X\n## Acceptance criteria\n- a\n## Next action\n- b\n' }]);
  expect('D1 violating: one carrier holds both', both.violations.length === 1);
  const apart = checkSeparation([
    { path: 'spec.md', content: '# X\n## Acceptance criteria\n- a\n' },
    { path: 'log.md', content: '# L\n## Next action\n- b\n' },
  ]);
  expect('D1 clean: carriers apart', apart.violations.length === 0 && apart.recognised === 2);

  // OWT-020 … OWT-026 (1.2.0): every check has a sample built to violate it and one built to satisfy it.
  const NOW = Date.UTC(2026, 9, 7);
  const wtab = (rows) => `| item | status | draft | asked-at | waiting for | release |\n|---|---|---|---|---|---|\n${rows}`;
  const waiting = (rows) => checkWaiting([{ path: 'w.md', content: wtab(rows) }], { now: NOW });
  const ruleOf = (res, rule) => res.violations.filter((v) => v.rule === rule).length;
  const w0 = waiting('| ask legal | waiting | | | | |\n');
  expect('OWT-020 violating: a waiting item that does not say whether it was asked', ruleOf(w0, 'OWT-020') === 1 && w0.counts['waiting-unspecified'] === 1);
  const w1 = waiting('| ask legal | not-yet-asked | drafts/legal.md | | | |\n| ask vendor | 已問、等回覆 | | 2026-10-01 | the quote | the reply arrives |\n');
  expect('OWT-020 clean: both named states, in English and in Chinese', w1.violations.length === 0 && w1.counts['not-yet-asked'] === 1 && w1.counts['asked-awaiting'] === 1);
  expect('OWT-021 violating: not-yet-asked names no draft or action', ruleOf(waiting('| ask legal | not-yet-asked | an email | | | |\n'), 'OWT-021') === 1);
  expect('OWT-021 clean: not-yet-asked names a path', ruleOf(waiting('| ask legal | not-yet-asked | `drafts/legal.md` | | | |\n'), 'OWT-021') === 0);
  expect('OWT-022 violating: asked-awaiting has no asked-at', ruleOf(waiting('| q | asked-awaiting | | | the quote | the reply arrives |\n'), 'OWT-022') === 1);
  expect('OWT-022 violating: asked-awaiting does not say what releases it (OWT-002)', ruleOf(waiting('| q | asked-awaiting | | 2026-10-01 | the quote | |\n'), 'OWT-022') === 1);
  expect('OWT-022 clean: asked-awaiting with asked-at, what it waits for and its release', ruleOf(waiting('| q | asked-awaiting | | 2026-10-01 | the quote | the reply arrives |\n'), 'OWT-022') === 0);
  expect('OWT-020 clean: a done item is not waiting', waiting('| q | done | | | | |\n').violations.length === 0);

  const otab = (rows) => `| fact | status | observed-by | observed-at | value |\n|---|---|---|---|---|\n${rows}`;
  const obs = (rows, o = {}) => checkObservations([{ path: 'o.md', content: otab(rows) }], { now: NOW, ...o });
  expect('OWT-023 violating: an observation with no observed-by', ruleOf(obs('| mail sent | open | | 2026-10-05 | yes |\n'), 'OWT-023') === 1);
  expect('OWT-023 violating: an observation with no observed-at', ruleOf(obs('| mail sent | open | albert | | yes |\n'), 'OWT-023') === 1);
  expect('OWT-023 violating: a value outside yes, no, unknown', ruleOf(obs('| mail sent | open | albert | 2026-10-05 | maybe |\n'), 'OWT-023') === 1);
  const o1 = obs('| mail sent | open | albert | 2026-10-05 | yes |\n');
  expect('OWT-023 clean: observed-by, observed-at and a value; its age is computed', o1.violations.length === 0 && o1.detail[0].age === 2 && o1.confirmed === 1);
  const o2 = obs('| approved | done | albert | 2026-10-05 | unknown |\n');
  expect('OWT-024 violating: unknown marked done', ruleOf(o2, 'OWT-024') === 1);
  expect('OWT-024 violating: unknown is counted apart and never confirmed', o2.counts.unknown === 1 && o2.unknown.length === 1 && o2.confirmed === 0);
  expect('OWT-024 clean: unknown not marked done is listed, not a violation', ruleOf(obs('| approved | open | albert | 2026-10-05 | unknown |\n'), 'OWT-024') === 0);
  const o3 = obs('| mail sent | open | albert | 2026-09-01 | yes |\n');
  expect('OWT-025 violating: an observation older than the threshold is stale and not confirmed', o3.stale.length === 1 && o3.confirmed === 0);
  expect('OWT-025 clean: a fresh observation is not stale', o1.stale.length === 0);
  expect('OWT-025 clean: the threshold is injectable', obs('| mail sent | open | albert | 2026-09-01 | yes |\n', { staleAfterDays: 60 }).stale.length === 0);
  expect('OWT-026 violating: a hand-written observation of something version control determines', ruleOf(obs('| PR merged | open | albert | 2026-10-05 | yes |\n'), 'OWT-026') === 1);
  expect('OWT-026 clean: an external fact the assistant cannot see', ruleOf(obs('| legal replied | open | albert | 2026-10-05 | yes |\n'), 'OWT-026') === 0);

  // OWT-027 / OWT-028 (1.3.0): a release condition naming an object in another project. The disk and git are
  // replaced by a fake environment, so the arms never touch either (the checker runs them before every command).
  const FAKE_DIR = join('/fake', 'other');
  const fakeEnv = {
    dirExists: (d) => d === FAKE_DIR,
    pathExists: (p) => p === join(FAKE_DIR, 'docs', 'a.md'),
    tagState: (_d, tag) => (tag === 'v1.0.0' ? 'present' : 'absent'),
  };
  const known = new Map([['other', FAKE_DIR]]);
  const cross = (release, projects = known, extra = '') => checkWaiting([{ path: 'x.md', content: wtab(`| wait for other | waiting | | | ${extra} | ${release} |\n`) }], { now: NOW, projects, env: fakeEnv });
  expect('OWT-027 violating: a release condition holding a machine-specific absolute path', ruleOf(cross('/Users/someone/work/other/docs/a.md'), 'OWT-027') === 1);
  expect('OWT-027 violating: an object that leaves the other project', ruleOf(cross('other:../secret.md'), 'OWT-027') === 1);
  expect('OWT-027 clean: a logical project name and an object inside it', ruleOf(cross('other:v1.0.0'), 'OWT-027') === 0);
  expect('OWT-027 violating: a drive letter is an absolute path, not a project name', ruleOf(cross('C:\\work\\other\\a.md'), 'OWT-027') === 1 && cross('C:\\work\\other\\a.md').cross.found === 0);
  expect('OWT-027 clean: a URL is not a project reference', cross('see https://example.com/a').cross.found === 0 && ruleOf(cross('see https://example.com/a'), 'OWT-027') === 0);
  expect('OWT-028 clean: a tag that exists there is released, in a project this machine can see', cross('other:v1.0.0').cross.counts.released === 1);
  expect('OWT-028 clean: a path that exists there is released', cross('other:docs/a.md').cross.counts.released === 1);
  expect('OWT-028 violating: a tag that is not there is not released', cross('other:v2.0.0').cross.counts['not-yet-released'] === 1 && cross('other:v2.0.0').cross.counts.released === 0);
  expect('OWT-028 violating: a path that is not there is not released', cross('other:docs/b.md').cross.counts['not-yet-released'] === 1);
  const unseen = cross('stranger:v1.0.0');
  expect('OWT-028 violating: a project this machine cannot see is counted apart, never released and never zero', unseen.cross.counts['not-visible'] === 1 && unseen.cross.counts.released === 0 && unseen.cross.found === 1);
  const person = cross('other:XSPEC-123');
  expect('OWT-028 violating: an identifier in another project needs a person and is never released', person.cross.counts['needs-a-person'] === 1 && person.cross.counts.released === 0);
  expect('OWT-028 clean: an unseen project is still listed with its reason', unseen.cross.items[0].status === 'not-visible' && /stranger/.test(unseen.cross.items[0].why));
  expect('OWT-020 clean: a waiting item that waits for another project is not asked about a reply', cross('other:v1.0.0').violations.length === 0 && cross('other:v1.0.0').counts['waiting-cross-project'] === 1);
  expect('OWT-020 violating: a plain waiting item is still named', ruleOf(waiting('| ask board | waiting | | | | |\n'), 'OWT-020') === 1);
  expect('OWT-027 clean: --root NAME=DIR and a plain --root are told apart', (() => { const r = parseRootOptions(['other=/fake/other', '/somewhere']); return r.error === null && r.plain === '/somewhere' && r.named.get('other') === resolve('/fake/other'); })());
  expect('OWT-027 violating: a project name that is not a logical name is refused', parseRootOptions(['Other=/x']).error !== null && parseRootOptions(['a', 'b']).error !== null);

  // 461 R5 (1.3.0): a command the adopter declares is read by next-action AND by waiting; glab and dotnet are built in.
  expect('461 R5 clean: glab and dotnet are built-in commands', classifyNextAction('run `glab mr merge 486`', {}).status !== 'unnamed' && classifyNextAction('run `dotnet test X.csproj`', {}).status !== 'unnamed');
  expect('461 R5 violating: a program that was not declared is not a command', classifyNextAction('run `kubectl apply -f x.yaml`', {}).status === 'unnamed' && classifyNextAction('then go build it, make test, sh run', {}).status === 'unnamed');
  expect('461 R5 clean: a declared command is read by next-action', classifyNextAction('run `kubectl apply -f x.yaml`', { extraCommands: ['kubectl'] }).status !== 'unnamed');
  const kubeRow = '| ask ops | not-yet-asked | kubectl rollout restart | | | |\n';
  expect('461 R5 violating: waiting does not know an undeclared command, so the draft names nothing', ruleOf(waiting(kubeRow), 'OWT-021') === 1);
  expect('461 R5 clean: the same row under waiting names a draft once the command is declared', ruleOf(checkWaiting([{ path: 'k.md', content: wtab(kubeRow) }], { now: NOW, extraCommands: ['kubectl'] }), 'OWT-021') === 0);
  expect('461 R5 violating: a blank or spaced command word is refused', normaliseDeclaredCommands(['']).error !== null && normaliseDeclaredCommands(['git lfs']).error !== null && normaliseDeclaredCommands(['kubectl']).error === null);
  expect('461 R5 clean: a declared command is plain text, not a pattern', classifyNextAction('run `a.b x`', { extraCommands: ['a.b'] }).status !== 'unnamed' && classifyNextAction('run aXb now', { extraCommands: ['a.b'] }).status === 'unnamed');

  // 461 R6 (1.3.0): named-unresolved says whether a path was looked up and missing, or nothing was looked up
  const split = checkNextActions([{ path: 'n.md', content: '| item | Next action |\n|---|---|\n| a | `glab mr merge 486` |\n| b | edit src/none.js |\n| c | finish XSPEC-12 |\n' }], { root: '/fake/root' });
  expect('461 R6 clean: a command and an identifier are not-resolvable, a path that is not there is path-missing, and they sum to named-unresolved', split.unresolvedSplit['not-resolvable'] === 2 && split.unresolvedSplit['path-missing'] === 1 && split.counts['named-unresolved'] === 3);
  expect('461 R6 violating: without a root nothing is looked up, so a path is not-resolvable too', checkNextActions([{ path: 'n.md', content: '| item | Next action |\n|---|---|\n| b | edit src/none.js |\n' }], {}).unresolvedSplit['not-resolvable'] === 1);
  const explained = explainResolution({ root: '/fake/root', rootGiven: false, carriers: [], split: { 'path-missing': 1, 'not-resolvable': 2 }, unresolved: 3 }).join('\n');
  expect('461 R6 clean: the resolution lines say the root, where it came from, and that only a path is looked up', /looked up under \/fake\/root \(the current directory: no --root was given\)/.test(explained) && /Only a PATH is looked up/.test(explained) && /path-missing=1 not-resolvable=2/.test(explained) && /from --root/.test(explainResolution({ root: '/r', rootGiven: true, carriers: [], split, unresolved: 3 }).join('\n')));

  // 461 (1.3.0): the one next-action list, the words an adopter declares, and the exit-2 explanation.
  const table461 = (h) => `| item | state | ${h} |\n|---|---|---|\n| a | open | edit scripts/foo.mjs |\n`;
  expect('461 R1 clean: 下一個動作, 下一個步驟 and 接下來要做什麼 are read by default', ['下一個動作', '下一個步驟', '接下來要做什麼'].every((h) => extractNextActions(table461(h)).fields === 1));
  expect('461 R1 violating: 待辦 is not read unless declared (the list is not widened)', extractNextActions(table461('待辦')).fields === 0 && extractNextActions(table461('Next')).fields === 0 && extractNextActions(table461('接下來')).fields === 0);
  expect('461 R2 clean: a declared word is read as a table header, a heading and an inline label, from one list', extractNextActions(table461('待辦'), ['待辦']).fields === 1 && extractNextActions('## 待辦\n- edit scripts/foo.mjs\n', ['待辦']).fields === 1 && extractNextActions('待辦: edit scripts/foo.mjs\n', ['待辦']).fields === 1);
  expect('461 R2 violating: the same carrier without the declaration is not read', extractNextActions('## 待辦\n- edit scripts/foo.mjs\n').fields === 0);
  expect('461 R2 clean: a declared word is plain text, any case, never a pattern', extractNextActions(table461('To.Do'), ['to.do']).fields === 1 && extractNextActions(table461('ToXDo'), ['to.do']).fields === 0);
  expect('461 R2 violating: a blank declared word is refused, not dropped', normaliseDeclaredWords(['']).error !== null && normaliseDeclaredWords(['  ']).error !== null && normaliseDeclaredWords(['待辦']).error === null);
  const why = explainNoNextActionField([{ path: 'w.md', content: table461('待辦') }], ['後續']).join('\n');
  expect('461 R3 clean: exit-2 text names the headers the carrier showed, the words recognised and how to add one', /"待辦"/.test(why) && /"state"/.test(why) && /built in:/.test(why) && /declared by you: 後續/.test(why) && /--next-action-word/.test(why));
  expect('461 R3 clean: a carrier with a table and one with nothing to read are told apart', /has 1 table\(s\), but no table header matches/.test(why) && /no table and no heading to read/.test(explainNoNextActionField([{ path: 'n.md', content: 'just words\n' }]).join('\n')));

  return { ok: failures.length === 0, failures };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const COVERAGE_NOTE = 'COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.';
const UNCALIBRATED_NOTE = 'UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.';
const UNCALIBRATED_STATE_NOTE = 'UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.';

function readCarrier(p) {
  return { path: p, content: readFileSync(p, 'utf8') };
}

function gitShowBase(file, rev) {
  const abs = resolve(file);
  const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const top = git(['rev-parse', '--show-toplevel'], dirname(abs)).trim();
  git(['rev-parse', '--verify', `${rev}^{commit}`], top);
  // Ask git for the path, never compute it from two filesystem paths: on Windows the
  // temp directory can carry an 8.3 short name (RUNNER~1) that realpathSync does not
  // expand while git reports the long name, so relative() walks out of the repo and
  // `git show` fails, which this tool reports as "undecidable" (exit 2) rather than a
  // verdict. git computes the prefix from the same cwd it will read from.
  const prefix = git(['rev-parse', '--show-prefix'], dirname(abs)).trim();
  const rel = `${prefix}${basename(abs)}`;
  const listed = git(['ls-tree', rev, '--', rel], top).trim();
  if (!listed) return null; // absent at that revision: a new file, not an error
  return git(['show', `${rev}:${rel}`], top);
}

export function main(argv, io = { log: console.log, err: console.error }) {
  const out = [];
  const say = (s) => out.push(s);
  const args = [...argv];
  const flag = (name) => {
    const i = args.indexOf(name);
    if (i === -1) return undefined;
    const v = args[i + 1];
    args.splice(i, 2);
    return v;
  };
  // every occurrence of a repeatable option, in order; a missing value is kept as undefined so the caller can refuse it
  const flagAll = (name) => {
    const values = [];
    let i;
    while ((i = args.indexOf(name)) !== -1) { values.push(args[i + 1]); args.splice(i, 2); }
    return values;
  };
  const finish = (code) => { for (const l of out) (code === 2 ? io.err : io.log)(l); return code; };

  const selfTest = runSelfTest();
  if (args[0] === '--self-test') {
    say(selfTest.ok ? '[owt] self-test: OK' : `[owt] self-test FAILED: ${selfTest.failures.join('; ')}`);
    return finish(selfTest.ok ? 0 : 2);
  }
  if (!selfTest.ok) {
    say(`[owt] CANNOT DECIDE: this checker's own self-test arms failed (${selfTest.failures.join('; ')}). A checker that fails its own arms is not evidence of anything. Exit 2 is not a pass.`);
    return finish(2);
  }

  const cmd = args.shift();
  try {
    if (cmd === 'next-action') {
      const rootArg = flag('--root');
      const root = rootArg ?? process.cwd();
      const idPattern = flag('--id-pattern');
      const declared = normaliseDeclaredWords(flagAll('--next-action-word'));
      if (declared.error) { say(`[owt] next-action: ${declared.error}`); return finish(2); }
      const commandsDeclared = normaliseDeclaredCommands(flagAll('--command-word'));
      if (commandsDeclared.error) { say(`[owt] next-action: ${commandsDeclared.error}`); return finish(2); }
      const files = args;
      if (!files.length) { say('[owt] next-action: no files given'); return finish(2); }
      const carriers = files.map(readCarrier);
      const res = checkNextActions(carriers, { root, idPattern, words: declared.words, extraCommands: commandsDeclared.words });
      say(`[owt] OWT-019 walked ${res.walked} next-action field(s) in ${files.length} carrier(s); ${res.empty} empty/done field(s) not evaluated; ${res.noFieldCarriers.length} carrier(s) had no next-action field`);
      say(`[owt]   named-resolved=${res.counts['named-resolved']} named-unresolved=${res.counts['named-unresolved']} unnamed=${res.counts.unnamed} undecidable-table-rows=${res.undecidable.length}`);
      // 461 R6: the lines below are additions; every line above and below them is what 1.1.0 printed.
      for (const l of explainResolution({ root, rootGiven: rootArg !== undefined, carriers, split: res.unresolvedSplit, unresolved: res.counts['named-unresolved'], commands: commandsDeclared.words })) say(`[owt] ${l}`);
      for (const d of res.detail) say(`[owt]   ${d.status.padEnd(16)} ${d.path} ${d.where}: ${d.text.slice(0, 80)}${d.kinds.length ? '  <- ' + d.kinds.map((k) => `${k.kind}:${k.value}`).join(', ') : ''}`);
      for (const v of res.violations) say(`[owt] VIOLATION OWT-019: ${v.path} ${v.where} names no file path, test name, command or requirement identifier: "${v.text.slice(0, 80)}"`);
      for (const u of res.undecidable) say(`[owt] UNDECIDABLE: ${u.path} ${u.where} has ${u.cells} cell(s) but its header has ${u.expected}; the next-action cell cannot be located, so the row is neither judged nor counted as empty`);
      say(`[owt] ${COVERAGE_NOTE}`);
      say(`[owt] ${UNCALIBRATED_NOTE}`);
      if (res.walked + res.empty === 0) {
        say('[owt] CANNOT DECIDE: no next-action field found in any carrier (walked 0). Exit 2 is not a pass.');
        for (const l of explainNoNextActionField(carriers, declared.words, res.undecidable.map((u) => u.path))) say(`[owt] ${l}`);
        return finish(2);
      }
      // A violation is a definite answer whatever else is unreadable. Absent one, a row we could
      // not read means "no violation found" is not "no violation": exit 2, never a green 0.
      if (!res.violations.length && res.undecidable.length) { say(`[owt] CANNOT DECIDE: ${res.undecidable.length} table row(s) could not be read (see UNDECIDABLE above), so a clean result would cover only part of the field. Exit 2 is not a pass.`); return finish(2); }
      return finish(res.violations.length ? 1 : 0);
    }
    if (cmd === 'revision') {
      const file = flag('--file');
      const base = flag('--base');
      const beforeF = flag('--before');
      const afterF = flag('--after');
      let before; let after; let path;
      if (file && base) { path = file; after = readFileSync(file, 'utf8'); before = gitShowBase(file, base); } else if (beforeF && afterF) { path = afterF; before = readFileSync(beforeF, 'utf8'); after = readFileSync(afterF, 'utf8'); } else { say('[owt] revision: give --file PATH --base REV, or --before FILE --after FILE'); return finish(2); }
      const r = checkIntentRevision({ before, after, path });
      say(`[owt] OWT-018 ${path}: ${r.status}${r.changedSections.length ? ` (changed: ${r.changedSections.join(', ')})` : ''}`);
      if (r.status === 'no-baseline') say('[owt]   the carrier did not exist in the baseline; there is nothing to compare');
      if (r.status === 'undecidable') { say('[owt] CANNOT DECIDE: no acceptance/goal/constraint section found in either version, so the check cannot see the intent. Exit 2 is not a pass.'); say(`[owt] ${UNCALIBRATED_NOTE}`); return finish(2); }
      for (const v of r.violations) say(`[owt] VIOLATION ${v.rule}: ${v.why}${v.sections ? ` [${v.sections.join(', ')}]` : ''}${v.entry ? ` <${v.entry.slice(0, 60)}>` : ''}`);
      if (r.handBack.length) {
        say('[owt] HAND-BACK (OWT-018 -> OWT-007) — list these when control returns to a human; this listing never blocks (OWT-008):');
        for (const h of r.handBack) say(`[owt]   edit to ${h.sections ? h.sections.join(', ') : 'intent'} in ${path}: ${h.why}`);
      }
      say('[owt] LIMIT: the check decides that intent changed, that a NEW record exists, that it is complete and whether an approver is filled in. It cannot decide that the record describes the change honestly (OWT-014).');
      say(`[owt] ${UNCALIBRATED_NOTE}`);
      return finish(r.violations.length ? 1 : 0);
    }
    if (cmd === 'separation') {
      const declared = normaliseDeclaredWords(flagAll('--next-action-word'));
      if (declared.error) { say(`[owt] separation: ${declared.error}`); return finish(2); }
      const files = args;
      if (!files.length) { say('[owt] separation: no files given'); return finish(2); }
      const r = checkSeparation(files.map(readCarrier), { words: declared.words });
      say(`[owt] OWT-017 walked ${r.walked} carrier(s); ${r.recognised} had a recognised intent or progress section`);
      for (const v of r.violations) say(`[owt] VIOLATION OWT-017: ${v.path} holds intent (${v.intent.join(', ')}) and progress (${v.progress.join(', ')}) in one carrier`);
      say(`[owt] ${UNCALIBRATED_NOTE}`);
      if (r.recognised === 0) { say('[owt] CANNOT DECIDE: no carrier had a recognised intent or progress heading. Exit 2 is not a pass.'); return finish(2); }
      return finish(r.violations.length ? 1 : 0);
    }
    if (cmd === 'waiting' || cmd === 'observations') {
      const nowArg = flag('--now');
      const now = nowArg === undefined ? todayUtc() : parseDay(nowArg);
      if (now === null) { say(`[owt] ${cmd}: --now must be a date with a year (YYYY-MM-DD), got "${nowArg}"`); return finish(2); }
      const staleArg = cmd === 'observations' ? flag('--stale-after') : undefined;
      const staleAfterDays = staleArg === undefined ? undefined : Number(staleArg);
      if (staleAfterDays !== undefined && (!Number.isFinite(staleAfterDays) || staleAfterDays < 0)) { say(`[owt] observations: --stale-after must be a number of days, got "${staleArg}"`); return finish(2); }
      let root;
      const projects = new Map();
      if (cmd === 'waiting') {
        // `--root DIR` (one, as before) says what relative paths are resolved against; `--root NAME=DIR`
        // (repeatable) says where another project lives on this machine (OWT-027 / OWT-028).
        const given = parseRootOptions(flagAll('--root'));
        if (given.error) { say(`[owt] waiting: ${given.error}`); return finish(2); }
        root = given.plain ?? process.cwd();
        for (const [name, dir] of given.named) projects.set(name, dir);
      }
      const idPattern = cmd === 'waiting' ? flag('--id-pattern') : undefined;
      const commandsDeclared = cmd === 'waiting' ? normaliseDeclaredCommands(flagAll('--command-word')) : { words: [], error: null };
      if (commandsDeclared.error) { say(`[owt] waiting: ${commandsDeclared.error}`); return finish(2); }
      const files = args;
      if (!files.length) { say(`[owt] ${cmd}: no files given`); return finish(2); }
      const carriers = files.map(readCarrier);
      if (cmd === 'waiting') {
        const res = checkWaiting(carriers, { now, root, idPattern, projects, extraCommands: commandsDeclared.words });
        say(`[owt] OWT-020/021/022 walked ${res.walked} record(s) with a status field in ${carriers.length} carrier(s) (today ${dayString(now)}); ${res.noStateCarriers.length} carrier(s) had none`);
        say(`[owt]   not-yet-asked=${res.counts['not-yet-asked']} asked-awaiting=${res.counts['asked-awaiting']} waiting-unspecified=${res.counts['waiting-unspecified']} done=${res.counts.done} other=${res.counts.other}${res.counts['waiting-cross-project'] ? ` waiting-cross-project=${res.counts['waiting-cross-project']}` : ''} undecidable-table-rows=${res.ragged.length}`);
        for (const d of res.detail) say(`[owt]   ${d.state.padEnd(20)} ${d.path} ${d.where}: ${d.text.slice(0, 60)}${d.note ? `  (${d.note})` : ''}`);
        if (res.cross.found > 0) {
          const k = res.cross.counts;
          say(`[owt] OWT-027/028 ${res.cross.found} release condition(s) name an object in another project (looked up on this machine only; no network): released=${k.released} not-yet-released=${k['not-yet-released']} not-visible-from-here=${k['not-visible']} needs-a-person=${k['needs-a-person']}`);
          const label = { released: 'RELEASED', 'not-yet-released': 'NOT YET RELEASED', 'not-visible': 'NOT VISIBLE FROM HERE', 'needs-a-person': 'NEEDS A PERSON' };
          for (const x of res.cross.items) say(`[owt]   ${label[x.status].padEnd(21)} ${x.name}:${x.object} (${x.kind}, ${x.observable}) ${x.path} ${x.where}: ${x.why}`);
          for (const name of [...new Set(res.cross.items.map((x) => x.name))]) if (projects.has(name)) say(`[owt] RESOLUTION: ${lookupSentence(`project "${name}"`, projects.get(name), 'from --root NAME=DIR or open_work.projects')}. Only a path or a version-control tag is looked up; nothing leaves this machine.`);
          say('[owt] NOT VISIBLE FROM HERE is counted apart: it is not released and it is not zero. NEEDS A PERSON is counted apart and is never released. RELEASED says the object exists there now, never that it is the right object (OWT-014).');
        }
        for (const v of res.violations) say(`[owt] VIOLATION ${v.rule}: ${v.path} ${v.where} ${v.why}`);
        for (const u of res.ragged) say(`[owt] UNDECIDABLE: ${u.path} ${u.where} has ${u.cells} cell(s) but its header has ${u.expected}; the status cell cannot be located, so the row is neither judged nor counted as empty`);
        say('[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.');
        say('[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.');
        say(`[owt] ${UNCALIBRATED_STATE_NOTE}`);
        if (res.walked === 0) { say('[owt] CANNOT DECIDE: no record with a status field in any carrier (walked 0). Exit 2 is not a pass.'); return finish(2); }
        if (!res.violations.length && res.ragged.length) { say(`[owt] CANNOT DECIDE: ${res.ragged.length} table row(s) could not be read (see UNDECIDABLE above), so a clean result would cover only part of the field. Exit 2 is not a pass.`); return finish(2); }
        return finish(res.violations.length ? 1 : 0);
      }
      const res = checkObservations(carriers, { now, staleAfterDays });
      say(`[owt] OWT-023/024/025/026 walked ${res.walked} observation(s) in ${carriers.length} carrier(s) (today ${dayString(now)}); stale after ${res.staleAfter} day(s) (${staleArg === undefined ? 'default, ' : ''}UNCALIBRATED); ${res.noObservationCarriers.length} carrier(s) had none`);
      say(`[owt]   yes=${res.counts.yes} no=${res.counts.no} unknown=${res.counts.unknown} invalid=${res.counts.invalid} | stale=${res.stale.length} | confirmed=${res.confirmed} (yes, well formed, not stale) | undecidable-table-rows=${res.ragged.length}`);
      for (const d of res.detail) say(`[owt]   value=${d.value} age=${d.age === null ? '?' : `${d.age}d`} by=${d.by || '?'} at=${d.observedAt || '?'}  ${d.path} ${d.where}: ${d.text.slice(0, 60)}`);
      for (const u of res.unknown) say(`[owt] UNKNOWN (counted apart, never complete): ${u.path} ${u.where}: ${u.text.slice(0, 60)}`);
      for (const s of res.stale) say(`[owt] STALE (observed ${s.age}d ago, older than ${res.staleAfter}d; counted apart, not confirmed${s.claimsDone ? '; the item claims done on this observation' : ''}): ${s.path} ${s.where}: ${s.text.slice(0, 60)}`);
      for (const v of res.violations) say(`[owt] VIOLATION ${v.rule}: ${v.path} ${v.where} ${v.why}`);
      for (const u of res.ragged) say(`[owt] UNDECIDABLE: ${u.path} ${u.where} has ${u.cells} cell(s) but its header has ${u.expected}; the row is neither judged nor counted as empty`);
      say('[owt] LIMIT: the check decides that the fields exist, are well formed, and how old the stamp is. It cannot decide that an observation is true, or that it is still true now (OWT-014): a stamp says who saw it and when, never that it still holds.');
      say('[owt] COVERAGE UNKNOWN (OWT-011): a table is read as an observation carrier only if it has an observed-by or observed-at column (or a list item such a label); the "derivable subject" test is a short word list. A clean pass does not mean no hand-written fact is unstamped or derivable.');
      say(`[owt] ${UNCALIBRATED_STATE_NOTE}`);
      if (res.walked === 0) { say('[owt] CANNOT DECIDE: no observation record (no observed-by / observed-at field) in any carrier (walked 0). Exit 2 is not a pass.'); return finish(2); }
      if (!res.violations.length && res.ragged.length) { say(`[owt] CANNOT DECIDE: ${res.ragged.length} table row(s) could not be read (see UNDECIDABLE above), so a clean result would cover only part of the field. Exit 2 is not a pass.`); return finish(2); }
      return finish(res.violations.length ? 1 : 0);
    }
    // The repo shim (its own `--self-test` flag) is named FIRST on purpose: cli/scripts/check-command-existence.mjs
    // reads a `uds <...>` string up to the closing quote, so a `--self-test` written AFTER `uds open-work`
    // is judged as a flag of the `uds open-work` command, which has none (it is the subcommand `self-test`).
    say('[owt] usage: node scripts/check-open-work-tracking.mjs ... | --self-test   (or from the npm package: uds open-work next-action|revision|separation|waiting|observations|self-test ...)');
    return finish(2);
  } catch (e) {
    say(`[owt] CANNOT DECIDE: ${e.message.split('\n')[0]}`);
    return finish(2);
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
