#!/usr/bin/env node
/**
 * Open-work-tracking reference checks for OWT-017 … OWT-026.
 * open-work-tracking 1.2.0 參考判定程序（OWT-017～026）。
 * // implements DEC-122-L1
 * // implements XSPEC-459
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
 *   uds open-work next-action <file...> [--root DIR] [--id-pattern RE]
 *   uds open-work revision --file PATH --base GIT_REV
 *   uds open-work revision --before FILE --after FILE
 *   uds open-work separation <file...>
 *   uds open-work waiting <file...> [--root DIR] [--id-pattern RE] [--now YYYY-MM-DD]
 *   uds open-work observations <file...> [--now YYYY-MM-DD] [--stale-after DAYS]
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
  kept.forEach((h, i) => {
    const next = kept[i + 1] ? kept[i + 1].start : text.length;
    const val = stripMd(text.slice(h.end, next)).replace(/[;；,，|]+$/, '').trim();
    if (f[h.role] === undefined) f[h.role] = val;
  });
  const title = stripMd(text.slice(0, kept.length ? kept[0].start : text.length)).replace(/[\s;；,，|—–:：-]+$/, '').trim();
  return { f, title };
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
      roles.forEach((rs, n) => rs.forEach((role) => { if (f[role] === undefined) f[role] = stripMd(r.cells[n]); }));
      records.push({ where, title, f, columns });
    }
  }
  let cur = null;
  const flush = () => {
    if (cur) {
      const text = cur.parts.join(' ; ');
      const { f, title } = parseRoleLabels(text);
      if (Object.keys(f).length) {
        records.push({ where: `list item (line ${cur.idx + 1}, "${clip(title || stripMd(cur.parts[0]), 40)}")`, title: title || stripMd(cur.parts[0]), f, columns: new Set(Object.keys(f)) });
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

/**
 * OWT-020 / OWT-021 / OWT-022. Reads every record that has a status field (OWT-010: a structural
 * field, never prose). `now` is a UTC day (ms); inject it, never read the clock inside a rule.
 */
export function checkWaiting(carriers, opts = {}) {
  const now = opts.now ?? todayUtc();
  const res = {
    walked: 0, counts: { 'not-yet-asked': 0, 'asked-awaiting': 0, 'waiting-unspecified': 0, done: 0, other: 0 },
    violations: [], detail: [], ragged: [], noStateCarriers: [],
  };
  for (const c of carriers) {
    const { records, ragged } = extractRecords(c.content);
    for (const g of ragged) if (g.columns.has('status')) res.ragged.push({ path: c.path, ...g });
    const withStatus = records.filter((r) => r.f.status !== undefined);
    if (!withStatus.length) { res.noStateCarriers.push(c.path); continue; }
    for (const r of withStatus) {
      res.walked++;
      const state = classifyState(r.f.status);
      res.counts[state]++;
      const at = { path: c.path, where: r.where };
      const bad = (rule, why) => res.violations.push({ rule, ...at, why });
      const note = [];
      const unspecified = state === 'waiting-unspecified'; // [mutation-anchor:waiting-unspecified]
      if (unspecified) bad('OWT-020', 'is waiting but does not say whether it has been asked (neither not-yet-asked nor asked-awaiting)');
      if (state === 'not-yet-asked') {
        const named = classifyNextAction(`${r.f.draft ?? ''} ${r.f.status}`, { root: opts.root, idPattern: opts.idPattern }).status !== 'unnamed'; // [mutation-anchor:not-yet-asked-names]
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
    if (cmd === 'waiting' || cmd === 'observations') {
      const nowArg = flag('--now');
      const now = nowArg === undefined ? todayUtc() : parseDay(nowArg);
      if (now === null) { say(`[owt] ${cmd}: --now must be a date with a year (YYYY-MM-DD), got "${nowArg}"`); return finish(2); }
      const staleArg = cmd === 'observations' ? flag('--stale-after') : undefined;
      const staleAfterDays = staleArg === undefined ? undefined : Number(staleArg);
      if (staleAfterDays !== undefined && (!Number.isFinite(staleAfterDays) || staleAfterDays < 0)) { say(`[owt] observations: --stale-after must be a number of days, got "${staleArg}"`); return finish(2); }
      const root = cmd === 'waiting' ? (flag('--root') ?? process.cwd()) : undefined;
      const idPattern = cmd === 'waiting' ? flag('--id-pattern') : undefined;
      const files = args;
      if (!files.length) { say(`[owt] ${cmd}: no files given`); return finish(2); }
      const carriers = files.map(readCarrier);
      if (cmd === 'waiting') {
        const res = checkWaiting(carriers, { now, root, idPattern });
        say(`[owt] OWT-020/021/022 walked ${res.walked} record(s) with a status field in ${carriers.length} carrier(s) (today ${dayString(now)}); ${res.noStateCarriers.length} carrier(s) had none`);
        say(`[owt]   not-yet-asked=${res.counts['not-yet-asked']} asked-awaiting=${res.counts['asked-awaiting']} waiting-unspecified=${res.counts['waiting-unspecified']} done=${res.counts.done} other=${res.counts.other} undecidable-table-rows=${res.ragged.length}`);
        for (const d of res.detail) say(`[owt]   ${d.state.padEnd(20)} ${d.path} ${d.where}: ${d.text.slice(0, 60)}${d.note ? `  (${d.note})` : ''}`);
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
