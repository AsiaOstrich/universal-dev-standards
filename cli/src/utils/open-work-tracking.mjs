#!/usr/bin/env node
/**
 * Open-work-tracking reference checks for OWT-017 / OWT-018 / OWT-019.
 * open-work-tracking 1.1.0 參考判定程序（OWT-017／018／019）。
 * // implements DEC-122-L1
 *
 * ── Where this lives, and why there is exactly one copy ─────────────────────
 * This file is the ONE body of the rules. Two front doors call it and neither
 * holds a copy:
 *   uds open-work <next-action|revision|separation|self-test> ...
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
 * ── Three checks ────────────────────────────────────────────────────────────
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
 *
 * ── UNCALIBRATED (OWT-016) ──────────────────────────────────────────────────
 * Everything in VOCAB, COMMANDS, EXTENSIONS, DEFAULT_ID_PATTERN and
 * ID_PREFIX_DENYLIST is an initial judgment. None of it was measured against
 * real usage. Adopters should pass their own identifier pattern
 * (--id-pattern) and read the heading vocabulary as a starting point.
 *
 * Exit codes: 0 no violation · 1 violation · 2 cannot decide (no structure
 * found, a next-action table row could not be read, git failed, or this
 * script's own self-test arms failed). 2 is NOT a pass.
 *
 * Usage (`uds` from the npm package, or the repo shim; same arguments):
 *   uds open-work next-action <file...> [--root DIR] [--id-pattern RE]
 *   uds open-work revision --file PATH --base GIT_REV
 *   uds open-work revision --before FILE --after FILE
 *   uds open-work separation <file...>
 *   uds open-work self-test
 *   node scripts/check-open-work-tracking.mjs next-action <file...> ...   (repo clone)
 *   node scripts/check-open-work-tracking.mjs --self-test
 */

import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Vocabulary (UNCALIBRATED, OWT-016) ───────────────────────────────────────

export const VOCAB = {
  revision: /revision|change[\s-]?log|amendment|history|修訂|變更紀錄|變更記錄|修改紀錄|修改記錄|異動/i,
  // ONE list of "next action" words. It is read three ways and there is no second copy:
  // a heading (classifyHeading), a table column header (extractNextActions) and an inline
  // label ("Next action: ...", built from .source below). Keep it free of capture groups:
  // the label regex embeds it and reads its own group 1.
  // 回來要做什麼 ("what to do when you come back") is the header the dev-platform worklog's
  // main table actually uses (DEC-122 H2 baseline carrier); that file describes the column as
  // 下一動 in prose but the header text drifted. Added because a header outside this list is
  // invisible to the check, which is the failure DEC-122 measured. Adopter-specific and
  // UNCALIBRATED (OWT-016); an adopter whose header differs adds its own word here.
  nextAction: /next[\s-]?(?:action|step)s?|下一步|下一動|回來要做什麼/i,
  progress: /\bprogress\b|\bstate\b|\bblockers?\b|\bblocked\b|進度|現況|卡在/i,
  intent: /acceptance|criteria|\brequirements?\b|\bgoals?\b|objectives?|constraints?|驗收|需求|目標|限制/i,
  // revision-table columns / labelled list fields
  colChange: /what|change|改了什麼|修改|變更|內容/i,
  colApprover: /approv|核可|核准|批准|同意|確認者/i,
  colReason: /reason|why|理由|原因|為什麼/i,
};

const LABELS = [
  ['change', /(?:what(?:\s+changed)?|changed?|改了什麼|修改|變更)\s*[:：]/gi],
  ['approver', /(?:approved\s+by|approver|approval|核可者|核可|核准|批准)\s*[:：]/gi],
  ['reason', /(?:reason|why|理由|原因|為什麼)\s*[:：]/gi],
];

const NO_APPROVER = /^(?:|-+|—|–|n\/?a|none|tbd|pending|unknown|\?+|無|未核可|待定|待核可|尚未)$/i;
const EMPTY_FIELD = /^(?:|-+|—|–|n\/?a|none|無|done|完成|已完成|✅)$/i;

// Words that make `word arg` read as a command in prose. Deliberately excludes
// common English words (go, make, sh): "go through the list" is not a command.
export const COMMANDS = [
  'npm', 'npx', 'pnpm', 'yarn', 'node', 'tsx', 'git', 'gh', 'bash', 'python', 'python3',
  'pytest', 'vitest', 'docker', 'cargo', 'uds', 'egr',
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
function classifyHeading(h) {
  if (VOCAB.revision.test(h)) return 'revision';
  if (VOCAB.nextAction.test(h)) return 'nextAction';
  if (VOCAB.progress.test(h)) return 'progress';
  if (VOCAB.intent.test(h)) return 'intent';
  return null;
}

/**
 * Annotate every line with the class of its innermost classified ancestor
 * heading. Front matter and fenced blocks keep their text but are flagged.
 */
export function parseDoc(md) {
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
        const entry = { level, heading: h[2], cls: classifyHeading(h[2]) };
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

export function checkSeparation(carriers) {
  const res = { walked: carriers.length, recognised: 0, violations: [] };
  for (const c of carriers) {
    const lines = parseDoc(c.content);
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
  const commands = [...COMMANDS, ...(opts.extraCommands || [])];
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
  const cmdRe = new RegExp(`(?:^|[^\\w-])(${commands.join('|')})\\s+([-@\\w./:]+)`, 'g');
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
  return {
    status: resolved ? 'named-resolved' : 'named-unresolved',
    kinds,
    resolution: root ? 'attempted (paths only)' : 'not attempted (no --root)',
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
export function extractNextActions(md) {
  const lines = parseDoc(md);
  const items = [];
  const ragged = [];
  let fields = 0;
  const tableIdx = new Set();
  const headerIdx = new Set();
  const tables = findTables(lines);

  for (const t of tables) {
    // every header cell in the shared vocabulary is a next-action column (usually exactly one)
    const cols = t.header.map((c, n) => (VOCAB.nextAction.test(c) ? n : -1)).filter((n) => n >= 0); // [mutation-anchor:table-header]
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
  const labelRe = new RegExp(`(?:\\*\\*|__)?(?:${VOCAB.nextAction.source})(?:\\*\\*|__)?\\s*[:：]\\s*(.+)$`, 'i');
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
  const res = { walked: 0, empty: 0, counts: { 'named-resolved': 0, 'named-unresolved': 0, unnamed: 0 }, violations: [], detail: [], noFieldCarriers: [], undecidable: [] };
  for (const c of carriers) {
    const { fields, items, ragged } = extractNextActions(c.content);
    for (const g of ragged) res.undecidable.push({ path: c.path, ...g });
    if (fields === 0 && ragged.length === 0) { res.noFieldCarriers.push(c.path); continue; }
    for (const it of items) {
      const text = it.text.replace(/\*\*|__/g, '').trim();
      if (EMPTY_FIELD.test(text)) { res.empty++; continue; }
      res.walked++;
      const r = classifyNextAction(text, opts);
      res.counts[r.status]++;
      res.detail.push({ path: c.path, where: it.where, text, ...r });
      if (r.status === 'unnamed') res.violations.push({ rule: 'OWT-019', path: c.path, where: it.where, text });
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

  return { ok: failures.length === 0, failures };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const COVERAGE_NOTE = 'COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.';
const UNCALIBRATED_NOTE = 'UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.';

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
      const root = flag('--root') ?? process.cwd();
      const idPattern = flag('--id-pattern');
      const files = args;
      if (!files.length) { say('[owt] next-action: no files given'); return finish(2); }
      const res = checkNextActions(files.map(readCarrier), { root, idPattern });
      say(`[owt] OWT-019 walked ${res.walked} next-action field(s) in ${files.length} carrier(s); ${res.empty} empty/done field(s) not evaluated; ${res.noFieldCarriers.length} carrier(s) had no next-action field`);
      say(`[owt]   named-resolved=${res.counts['named-resolved']} named-unresolved=${res.counts['named-unresolved']} unnamed=${res.counts.unnamed} undecidable-table-rows=${res.undecidable.length}`);
      for (const d of res.detail) say(`[owt]   ${d.status.padEnd(16)} ${d.path} ${d.where}: ${d.text.slice(0, 80)}${d.kinds.length ? '  <- ' + d.kinds.map((k) => `${k.kind}:${k.value}`).join(', ') : ''}`);
      for (const v of res.violations) say(`[owt] VIOLATION OWT-019: ${v.path} ${v.where} names no file path, test name, command or requirement identifier: "${v.text.slice(0, 80)}"`);
      for (const u of res.undecidable) say(`[owt] UNDECIDABLE: ${u.path} ${u.where} has ${u.cells} cell(s) but its header has ${u.expected}; the next-action cell cannot be located, so the row is neither judged nor counted as empty`);
      say(`[owt] ${COVERAGE_NOTE}`);
      say(`[owt] ${UNCALIBRATED_NOTE}`);
      if (res.walked + res.empty === 0) { say('[owt] CANNOT DECIDE: no next-action field found in any carrier (walked 0). Exit 2 is not a pass.'); return finish(2); }
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
      const files = args;
      if (!files.length) { say('[owt] separation: no files given'); return finish(2); }
      const r = checkSeparation(files.map(readCarrier));
      say(`[owt] OWT-017 walked ${r.walked} carrier(s); ${r.recognised} had a recognised intent or progress section`);
      for (const v of r.violations) say(`[owt] VIOLATION OWT-017: ${v.path} holds intent (${v.intent.join(', ')}) and progress (${v.progress.join(', ')}) in one carrier`);
      say(`[owt] ${UNCALIBRATED_NOTE}`);
      if (r.recognised === 0) { say('[owt] CANNOT DECIDE: no carrier had a recognised intent or progress heading. Exit 2 is not a pass.'); return finish(2); }
      return finish(r.violations.length ? 1 : 0);
    }
    // The repo shim (its own `--self-test` flag) is named FIRST on purpose: cli/scripts/check-command-existence.mjs
    // reads a `uds <...>` string up to the closing quote, so a `--self-test` written AFTER `uds open-work`
    // is judged as a flag of the `uds open-work` command, which has none (it is the subcommand `self-test`).
    say('[owt] usage: node scripts/check-open-work-tracking.mjs ... | --self-test   (or from the npm package: uds open-work next-action|revision|separation|self-test ...)');
    return finish(2);
  } catch (e) {
    say(`[owt] CANNOT DECIDE: ${e.message.split('\n')[0]}`);
    return finish(2);
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
