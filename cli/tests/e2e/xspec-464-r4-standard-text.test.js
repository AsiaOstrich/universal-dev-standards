/**
 * E2E: the standard text of XSPEC-464 R4 and XSPEC-465 R2, read back from every place it lives
 * (open-work-tracking 1.4.0: OWT-019 gains a fourth outcome, and the OWT-007 section says who may produce the summary).
 *
 * R4 is a requirement about words kept in step with a behaviour, which a check cannot decide, so it has no wire to cut. What
 * guards it is this reading: the English text, the zh-TW translation, the .ai.yaml, the registry, the self-adoption copy and three
 * CHANGELOGs say the same thing, they agree with what `uds open-work next-action` really prints, and a copy of each text with the
 * statement taken out makes the same reading fail (the mutation blocks), so the reading is not one that passes on anything.
 * XSPEC-465 R2 is a documentation-only subsection: no requirement number, no check; the reading checks that it exists in the
 * three texts, that it says UDS ships no such program, and that it carries no link to a private project's files.
 *
 * What would make it red: the OWT-019 sentence or the fourth outcome missing from any text, the version left at 1.3.0 anywhere, a zh-TW
 * source_hash that is not the current hash of the English source, a self-adoption copy that differs from ai/standards/, a CHANGELOG
 * language without the entry or without the exit-code change, a new OWT number appearing, a private path in the summary subsection,
 * a vendor model identifier in the standard text, or a sync script that exits non-zero.
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync, execFileSync } from 'child_process';
import { REAL_REPO, createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec464-r4');
afterAll(() => h.cleanup());

const read = (rel) => readFileSync(join(REAL_REPO, rel), 'utf8');
const sh = (script, args = []) => {
  const r = spawnSync('bash', [join(REAL_REPO, 'scripts', script), ...args], { cwd: REAL_REPO, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

/** What the three texts of open-work-tracking must say about an item that was asked and is awaiting a reply. Returns the problems found. */
function replyProblems({ core, zh, ai }) {
  const problems = [];
  if (!/\| \*\*OWT-019\*\* \|[^\n]*An item in `asked-awaiting` that satisfies OWT-022 is not judged here: its next step may be the reply it waits for, and OWT-022 judges it[^\n]*\| warning \|/.test(core)) problems.push('core: OWT-019 row');
  if (!/\| \*\*OWT-019\*\* \|[^\n]*處於 `asked-awaiting` 並滿足 OWT-022 的項目不在這裡判定：它的下一步可以就是它等的那個回覆，由 OWT-022 判定[^\n]*\| warning \|/.test(zh)) problems.push('zh-TW: OWT-019 row');
  if (!/- id: OWT-019\n\s+rule: [^\n]*處於 asked-awaiting 並滿足 OWT-022 的項目不在這裡判定[^\n]*\n\s+severity: warning/.test(ai)) problems.push('ai.yaml: OWT-019 rule');
  if (!/\*\*A fourth outcome, for a reply \(1\.4\.0\)\.\*\*/.test(core)) problems.push('core: the fourth outcome (English)');
  if (!/\*\*回覆的第四種結果（1\.4\.0）。\*\*/.test(core) || !/\*\*回覆的第四種結果（1\.4\.0）。\*\*/.test(zh)) problems.push('core and zh-TW: the fourth outcome (Chinese)');
  if (!/It is not a violation\. It is \*\*not counted as named\*\* and \*\*not counted as complete\*\*\. It is listed on its own with its \*\*age\*\*, and one older than the declared threshold is marked \*\*stale\*\*/.test(core)) problems.push('core: not violation, not named, not complete, age, stale');
  if (!/The exemption is not a hiding place: it applies only when the item is `asked-awaiting` \*\*and\*\* OWT-022 finds nothing missing/.test(core)) problems.push('core: the exemption is conditional');
  if (!/The two checks read the item through one function, so they cannot give opposite answers about it/.test(core)) problems.push('core: the two checks cannot disagree');
  if (!/\*\*What this cannot decide:\*\* that the request was really sent, or is still unanswered/.test(core)) problems.push('core: what it cannot decide');
  if (!/這個免除不是藏身處：只有項目是 `asked-awaiting` \*\*而且\*\* OWT-022 找不出缺漏時才適用/.test(zh)) problems.push('zh-TW: the exemption is conditional');
  if (!/兩個檢查以同一個函式讀這個項目，所以不可能對它給出相反的結論/.test(zh)) problems.push('zh-TW: the two checks cannot disagree');
  if (!/\*\*The exit code of `next-action` changes for a carrier that has such rows: a row that used to make it exit 1 as unnamed no longer does\.\*\*/.test(core)) problems.push('core: the exit-code change is said');
  if (!/\*\*對含有這種列的載體，`next-action` 的結束碼會改變/.test(zh)) problems.push('zh-TW: the exit-code change is said');
  if (!/- waiting_on_reply   # 1\.4\.0：/.test(ai)) problems.push('ai.yaml: waiting_on_reply outcome');
  if (!/waiting_on_reply:\n\s+applies_when: [^\n]*OWT-020 與 OWT-022 對它沒有任何違反/.test(ai)) problems.push('ai.yaml: applies_when');
  if (!/invariant: "對任一列：waiting 判為 asked-awaiting 且沒有 OWT-020／OWT-022 違反 ⇔ next-action 判為 waiting-on-reply/.test(ai)) problems.push('ai.yaml: the invariant');
  if (!/exit_code_change: "含這種列的載體，next-action 對該列不再回 1/.test(ai)) problems.push('ai.yaml: the exit-code change');
  if (!/- OWT-019 and OWT-022 meet at one point \(1\.4\.0\)/.test(core) || !/- OWT-019 與 OWT-022 在一點上交會（1\.4\.0）/.test(zh)) problems.push('the relationship line, English and Chinese');
  // no new requirement identifier: 1.4.0 changes how OWT-019 is judged and adds none
  if (/OWT-03\d/.test(core) || /OWT-03\d/.test(ai) || /OWT-03\d/.test(zh)) problems.push('a new OWT number appeared');
  return problems;
}

/** What the three texts must say about who produces the OWT-007 summary (XSPEC-465 R2). */
function summaryProblems({ core, zh, ai }) {
  const problems = [];
  if (!/### The summary can be printed by a program; the full list is fetched on demand/.test(core)) problems.push('core: heading');
  if (!/It does \*\*not\*\* say who produces it or how long it is/.test(core)) problems.push('core: OWT-007 does not say who produces it');
  if (!/\*\*A program prints a short summary when the turn ends\*\*: it is the output of a command run by whatever already sits on the turn-end event, so it costs the model no tokens/.test(core)) problems.push('core: the cheap way');
  if (!/\*\*Or the model writes a complete table into every reply\*\*: that satisfies OWT-007 and is a valid choice, but it is the expensive one, and it is not what this standard requires/.test(core)) problems.push('core: the expensive way is valid and not required');
  if (!/waiting on a person's decision; waiting on an outside party's reply; waiting on CI; due on a fixed date; nobody is looking at it/.test(core)) problems.push('core: the suggested vocabulary');
  if (!/\(a suggestion, not a requirement\)/.test(core)) problems.push('core: the vocabulary is a suggestion');
  if (!/UDS ships no program that produces an OWT-007 summary, and nothing in this standard checks that one exists/.test(core)) problems.push('core: honest note');
  if (!/It adds no requirement number and no check\./.test(core)) problems.push('core: no new requirement or check');
  if (!/\*\*不屬於 UDS 套件，也不保證與它相容\*\*/.test(core) || !/\*\*不屬於 UDS 套件，也不保證與它相容\*\*/.test(zh)) problems.push('core and zh-TW: external example, not part of UDS');
  if (!/### 摘要可以由程式印出，完整版按需取得/.test(zh)) problems.push('zh-TW: heading');
  if (!/UDS 沒有出貨任何產生 OWT-007 摘要的程式，本標準也沒有任何東西檢查這種程式存在/.test(zh)) problems.push('zh-TW: honest note');
  if (!/summary_production:\n\s+owt_007_does_not_say: /.test(ai) || !/honest_note: "UDS 沒有出貨任何產生 OWT-007 摘要的程式/.test(ai)) problems.push('ai.yaml: summary_production');
  // the example is described and not linked: no path into a private project may appear in the standard
  for (const [name, text] of [['core', core], ['zh-TW', zh], ['ai.yaml', ai]]) {
    if (/work-status\.sh|\.claude\/skills\/work|dev-platform/i.test(text)) problems.push(`${name}: names a private project's files`);
  }
  return problems;
}

/**
 * The `## [...]` block of a CHANGELOG that holds `needle`, or null. Which block that is depends on where the version is in its life:
 * `## [Unreleased]` while it is developed, the release heading (`## [6.14.0-beta.7]`, ...) it went out under after that, and a later
 * one after the next release. The entry is meant to be written down in a CHANGELOG, not to be in one particular block of it, so the
 * reading finds the block and then asks for the other two statements in THAT block (a mention of XSPEC-464 in some other release does not count).
 */
function blockHolding(log, needle) {
  return log.split(/^(?=## \[)/m).filter((b) => b.startsWith('## [')).find((b) => b.includes(needle)) ?? null;
}

/** What one CHANGELOG must say about open-work-tracking 1.4.0: the entry, the requirement it answers and the exit-code change, all in the block that holds the entry. */
function changelogProblems(file, log, entryNeedle, changedNeedle) {
  const block = blockHolding(log, entryNeedle);
  if (block === null) return [`${file}: no Unreleased or release block has the 1.4.0 entry`];
  const problems = [];
  if (!block.includes('XSPEC-464')) problems.push(`${file}: the block with the 1.4.0 entry does not name XSPEC-464`);
  if (!block.includes(changedNeedle)) problems.push(`${file}: the block with the 1.4.0 entry does not say the exit code changed`);
  return problems;
}

const CHANGELOGS = [['CHANGELOG.md', 'open-work-tracking` 1.4.0', 'exits 0, not 1'], ['locales/zh-TW/CHANGELOG.md', 'open-work-tracking` 1.4.0', '回 0，不再回 1'], ['locales/zh-CN/CHANGELOG.md', 'open-work-tracking` 1.4.0', '回 0，不再回 1']];

const texts = () => ({ core: read('core/open-work-tracking.md'), zh: read('locales/zh-TW/core/open-work-tracking.md'), ai: read('ai/standards/open-work-tracking.ai.yaml') });

it('open-work-tracking 1.4.0 says in the English text, the zh-TW translation with a current source_hash, the .ai.yaml, the registry and the self-adoption copy that an asked-awaiting item complete under OWT-022 is waiting-on-reply and not judged by OWT-019, names it in three CHANGELOGs with the exit-code change, agrees with what next-action prints, and both sync checks exit 0 (XSPEC-464 R4)', async (ctx) => {
  // needs a POSIX shell (bash runs scripts/check-*.sh); skipped, and counted as skipped, on Windows
  if (process.platform === 'win32') ctx.skip();
  const t = texts();
  expect(replyProblems(t)).toEqual([]);

  // the version is 1.4.0 in every place
  expect(t.core).toMatch(/\*\*Version\*\*: 1\.4\.0/);
  expect(t.zh).toMatch(/source_version: 1\.4\.0\ntranslation_version: 1\.4\.0/);
  expect(t.zh).toMatch(/\*\*版本\*\*: 1\.4\.0/);
  expect(t.ai).toMatch(/\n    version: "1\.4\.0"/);
  const hash = execFileSync('git', ['hash-object', 'core/open-work-tracking.md'], { cwd: REAL_REPO, encoding: 'utf8' }).trim().slice(0, 12);
  expect(t.zh, 'zh-TW source_hash is the hash of the English source').toMatch(new RegExp(`source_hash: ${hash}\n`));
  expect(read('.standards/open-work-tracking.ai.yaml'), 'self-adoption copy is byte-identical').toBe(t.ai);
  const registry = JSON.parse(read('cli/standards-registry.json'));
  const entry = registry.standards.find((s) => s.id === 'open-work-tracking');
  expect(entry.description).toMatch(/an item that was asked and is awaiting a reply is judged by when it was asked and what it waits for, not by what its next step names/);
  expect(entry.description, 'the 1.3.0 wording is still there').toMatch(/a wait may name an object in another project by its logical name, with a project this machine cannot see counted apart/);

  // three CHANGELOGs: the entry, the requirement it answers, and the exit-code change in the Changed section (in Unreleased or in the release it went out in)
  for (const [file, entryNeedle, changedNeedle] of CHANGELOGS) expect(changelogProblems(file, read(file), entryNeedle, changedNeedle)).toEqual([]);

  // what the text says is what the command does: the same row, read both ways
  const dir = h.makeDir('r4-agree');
  writeFileSync(join(dir, 'w.md'), '| item | status | asked-at | waiting for | release | Next action |\n|---|---|---|---|---|---|\n| vendor quote | asked-awaiting | 2026-01-10 | the quote | the quote arrives | wait for the vendor reply |\n');
  const r = await h.runCli(['open-work', 'next-action', 'w.md', '--now', '2026-01-12'], dir);
  expect(r.code, r.stdout + r.stderr).toBe(0);
  expect(r.stdout).toMatch(/waiting-on-reply=1/);
  expect(r.stdout, 'the word the standard uses for the outcome is the word the command prints').toMatch(/WAITING-ON-REPLY 1 row\(s\)/);

  const standards = sh('check-standards-sync.sh');
  expect(standards.status, standards.out).toBe(0);
  expect(standards.out).toMatch(/All standards are consistent/);
  const translations = sh('check-translation-sync.sh', ['zh-TW']);
  expect(translations.status, translations.out).toBe(0);
  expect(translations.out, 'the zh-TW translation of this standard is not listed as drifted or outdated').not.toMatch(/open-work-tracking/);
}, 120000);

it('open-work-tracking: removing the waiting-on-reply statement from any text, or adding a new OWT number, turns the reading of those texts red (XSPEC-464 R4 mutation)', () => {
  const t = texts();
  expect(replyProblems(t)).toEqual([]);
  const without = (key, from, to) => ({ ...t, [key]: t[key].replace(from, to) });
  const mutants = [
    ['the English OWT-019 row loses the exemption', without('core', 'An item in `asked-awaiting` that satisfies OWT-022 is not judged here: its next step may be the reply it waits for, and OWT-022 judges it (when it was asked, what it waits for, what releases it) | warning |', ' | warning |')],
    ['the zh-TW OWT-019 row loses the exemption', without('zh', /處於 `asked-awaiting` 並滿足 OWT-022 的項目不在這裡判定[^\n]*\| warning \|/, '| warning |')],
    ['the .ai.yaml OWT-019 rule loses the exemption', without('ai', '處於 asked-awaiting 並滿足 OWT-022 的項目不在這裡判定：它的下一步可以就是它等的那個回覆，由 OWT-022 判定（何時問的、在等什麼、什麼事件解除它）', '')],
    ['the English text no longer says it is not a violation, not named and not complete', without('core', 'It is **not counted as named** and **not counted as complete**.', 'It is counted.')],
    ['the English text drops the condition on the exemption', without('core', 'it applies only when the item is `asked-awaiting` **and** OWT-022 finds nothing missing', 'it applies to every waiting item')],
    ['the English text no longer says the two checks cannot disagree', without('core', 'so they cannot give opposite answers about it', 'and may differ')],
    ['the English text no longer says what the check cannot decide', without('core', '**What this cannot decide:** that the request was really sent, or is still unanswered', '')],
    ['the English text no longer says the exit code changes', without('core', '**The exit code of `next-action` changes for a carrier that has such rows: a row that used to make it exit 1 as unnamed no longer does.**', '')],
    ['the zh-TW text drops the condition on the exemption', without('zh', '只有項目是 `asked-awaiting` **而且** OWT-022 找不出缺漏時才適用', '所有等待中的項目都適用')],
    ['the .ai.yaml loses the invariant', without('ai', /        invariant: "對任一列[^\n]*\n/, '')],
    ['the .ai.yaml loses the waiting_on_reply outcome', without('ai', /        - waiting_on_reply   #[^\n]*\n/, '')],
    ['the .ai.yaml loses the exit-code change', without('ai', /        exit_code_change: [^\n]*\n/, '')],
    ['a new requirement number is added', without('core', '| **OWT-029** |', '| **OWT-030** | a new thing | warning |\n| **OWT-029** |')],
  ];
  for (const [what, mutated] of mutants) {
    expect(mutated, `${what}: the mutation must change the text`).not.toEqual(t);
    expect(replyProblems(mutated).length, `${what}: the reading must notice`).toBeGreaterThan(0);
  }

  // the CHANGELOG reading, on the real CHANGELOG.md and on the two ways a release rearranges it
  const [file, entryNeedle, changedNeedle] = CHANGELOGS[0];
  const log = read(file);
  expect(changelogProblems(file, log, entryNeedle, changedNeedle), 'control: the real CHANGELOG passes').toEqual([]);
  const withoutLinesHaving = (text, needle) => text.split('\n').filter((l) => !l.includes(needle)).join('\n');
  const linesHaving = (needle) => log.split('\n').filter((l) => l.includes(needle));
  expect(linesHaving(entryNeedle), 'control: the entry is in the real CHANGELOG').not.toHaveLength(0);
  expect(linesHaving(changedNeedle), 'control: the exit-code statement is in the real CHANGELOG').not.toHaveLength(0);
  const logMutants = [
    ['the entry is gone from every block', withoutLinesHaving(log, entryNeedle)],
    ['the exit-code statement is gone', withoutLinesHaving(log, changedNeedle)],
    ['XSPEC-464 is named nowhere', log.replaceAll('XSPEC-464', 'XSPEC-000')],
    // a release moves a block down as a whole; the exit-code statement left behind in the oldest block, with the entry in a newer one, is the half-moved state the reading must refuse
    ['the exit-code statement is in another block than the entry', `${withoutLinesHaving(log, changedNeedle)}\n${linesHaving(changedNeedle).join('\n')}\n`],
  ];
  for (const [what, mutated] of logMutants) {
    expect(mutated, `${what}: the mutation must change the text`).not.toEqual(log);
    expect(changelogProblems(file, mutated, entryNeedle, changedNeedle).length, `${what}: the reading must notice`).toBeGreaterThan(0);
  }
}, 60000);

it('open-work-tracking explains in the English text, the zh-TW translation and the .ai.yaml that the OWT-007 summary can be printed by a program and the full list fetched on demand, adds no requirement number and no check, says UDS ships no such program, and links to no private project (XSPEC-465 R2)', () => {
  const t = texts();
  expect(summaryProblems(t)).toEqual([]);
  // it is an explanation under OWT-007's own section, not a new row of the requirements table
  expect(t.core.indexOf('### The summary can be printed by a program')).toBeGreaterThan(t.core.indexOf('## The checkpoint is a report, not a gate'));
  expect(t.core.indexOf('### The summary can be printed by a program')).toBeLessThan(t.core.indexOf('## Anchors: structure, not wording'));
  expect(t.core.match(/^\| \*\*OWT-\d+\*\* \|/gm)).toHaveLength(29);
  expect(t.zh.match(/^\| \*\*OWT-\d+\*\* \|/gm)).toHaveLength(29);
  // OWT-007 itself is unchanged
  expect(t.core).toMatch(/\| \*\*OWT-007\*\* \| A summary of open work occurs at the point control returns from agent to human — not only at session start, in CI, or when a tracking document happens to be edited \| error \|/);
  // the standard text names no vendor model, which would be a reference waiting to go stale
  for (const [name, text] of [['core', t.core], ['zh-TW', t.zh], ['ai.yaml', t.ai]]) expect(text, name).not.toMatch(/claude-(?:sonnet|opus|haiku)-\d|gpt-\d|gemini-\d/i);

  const without = (key, from, to) => ({ ...t, [key]: t[key].replace(from, to) });
  const mutants = [
    ['the heading is gone', without('core', '### The summary can be printed by a program; the full list is fetched on demand', '### Summary')],
    ['it no longer says OWT-007 is silent about who produces it', without('core', 'It does **not** say who produces it or how long it is', 'It says who produces it')],
    ['the expensive way is called wrong', without('core', 'that satisfies OWT-007 and is a valid choice, but it is the expensive one, and it is not what this standard requires', 'that does not satisfy OWT-007')],
    ['the vocabulary is turned into a requirement', without('core', '(a suggestion, not a requirement)', '(required)')],
    ['the honest note is gone', without('core', 'UDS ships no program that produces an OWT-007 summary, and nothing in this standard checks that one exists', 'UDS ships it')],
    ['it claims to add a requirement', without('core', 'It adds no requirement number and no check.', 'It adds a check.')],
    ['a link to a private project appears', without('core', 'That project\'s files are private, so they are not linked here.', 'See dev-platform/.claude/skills/work/SKILL.md and cross-project/work-status.sh.')],
    ['the zh-TW heading is gone', without('zh', '### 摘要可以由程式印出，完整版按需取得', '### 摘要')],
    ['the zh-TW honest note is gone', without('zh', 'UDS 沒有出貨任何產生 OWT-007 摘要的程式，本標準也沒有任何東西檢查這種程式存在', 'UDS 有出貨')],
    ['the .ai.yaml block is gone', without('ai', /  summary_production:\n(?:    [^\n]*\n)+/, '')],
  ];
  for (const [what, mutated] of mutants) {
    expect(mutated, `${what}: the mutation must change the text`).not.toEqual(t);
    expect(summaryProblems(mutated).length, `${what}: the reading must notice`).toBeGreaterThan(0);
  }
}, 60000);
