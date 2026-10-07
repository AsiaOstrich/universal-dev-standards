/**
 * E2E: the standard text of XSPEC-460 and XSPEC-461, read back from every place it lives
 * (dev-platform XSPEC-460 R3, R5 and R6).
 *
 * R3 is a requirement about where a record is kept, which a check cannot decide, so it has no wire to cut. What guards it
 * is this reading: the requirement and its reason are in the English text, the zh-TW translation and the .ai.yaml, the
 * reference check says it does not decide it, and a copy of each text with the requirement taken out makes the same
 * reading fail (the mutation block at the end), so the reading is not one that passes on anything.
 * R5 is two short boundary sections, in the English text, the .ai.yaml, and the translations that exist. R6 is
 * the version and the five-place agreement of the standard, then the two repository sync checks run as real processes.
 *
 * What would make it red: dropping OWT-027 to OWT-029 from any text, a version left behind in any place, a zh-TW source_hash
 * that is not the current hash of the English source, a self-adoption copy that differs from ai/standards/, a boundary
 * section missing from a memory standard, a CHANGELOG language without the entry, or a sync script that exits non-zero.
 */

import { it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { spawnSync, execFileSync } from 'child_process';
import { REAL_REPO } from '../utils/staged-cli-harness.js';

const read = (rel) => readFileSync(join(REAL_REPO, rel), 'utf8');
const sh = (script, args = []) => {
  const r = spawnSync('bash', [join(REAL_REPO, 'scripts', script), ...args], { cwd: REAL_REPO, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

/** What the three texts of open-work-tracking must say about where cross-project work is recorded. Returns the problems found. */
function locationProblems({ core, zh, ai }) {
  const problems = [];
  if (!/\*\*OWT-029\*\* \|[^\n]*version control[^\n]*not held only in a personal AI-tool memory[^\n]*\| warning \|/.test(core)) problems.push('core: OWT-029 row');
  if (!/\*\*OWT-029\*\* \|[^\n]*受版本控制[^\n]*不得只放在個人的 AI 工具記憶[^\n]*\| warning \|/.test(zh)) problems.push('zh-TW: OWT-029 row');
  if (!/- id: OWT-029\n\s+rule: [^\n]*受版本控制[^\n]*不得只放在個人的 AI 工具記憶[^\n]*\n\s+severity: warning/.test(ai)) problems.push('ai.yaml: OWT-029 rule');
  if (!/The reference check does not decide where a carrier is kept/.test(core)) problems.push('core: the check does not decide location');
  if (!/gives a check no named carrier to decide a relation over \(OWT-014\)/.test(core)) problems.push('core: the reason');
  if (!/record_location: [^\n]*檢查不判定/.test(ai)) problems.push('ai.yaml: record_location says the check does not decide');
  return problems;
}

it('open-work-tracking requires cross-project work to be recorded in a version-controlled repository every involved session can read, not only in a personal AI-tool memory, says why, and says the check does not decide it; removing that from any text turns this reading red (XSPEC-460 R3)', () => {
  const texts = { core: read('core/open-work-tracking.md'), zh: read('locales/zh-TW/core/open-work-tracking.md'), ai: read('ai/standards/open-work-tracking.ai.yaml') };
  expect(locationProblems(texts)).toEqual([]);

  // the check really does not look at where a carrier is kept: no output of the waiting command mentions OWT-029
  const cli = read('cli/src/utils/open-work-tracking.mjs');
  expect(cli.replace(/\/\/ implements[^\n]*/g, '')).not.toMatch(/'OWT-029'|"OWT-029"/);

  // the mutations: the reading must fail for each
  const without = (key, from, to) => ({ ...texts, [key]: texts[key].replace(from, to) });
  const mutants = [
    ['the English row is gone', without('core', /\| \*\*OWT-029\*\* \|[^\n]*\n/, '')],
    ['the row no longer says a personal AI-tool memory is not enough', without('core', 'not held only in a personal AI-tool memory', 'held anywhere')],
    ['the zh-TW row is gone', without('zh', /\| \*\*OWT-029\*\* \|[^\n]*\n/, '')],
    ['the .ai.yaml rule is gone', without('ai', /    - id: OWT-029\n(?:      [^\n]*\n)+/, '')],
    ['the check is said to decide it', without('core', 'The reference check does not decide where a carrier is kept', 'The reference check decides it')],
    ['the reason is gone', without('core', 'gives a check no named carrier to decide a relation over (OWT-014)', 'is unreliable')],
  ];
  for (const [what, mutated] of mutants) {
    expect(mutated, `${what}: the mutation must change the text`).not.toEqual(texts);
    expect(locationProblems(mutated).length, `${what}: the reading must notice`).toBeGreaterThan(0);
  }
}, 60000);

it('developer-memory and project-context-memory each carry a short Boundary section in the English text, the .ai.yaml and the translations that exist, at version 1.2.1, and both sync checks exit 0 (XSPEC-460 R5)', () => {
  for (const id of ['developer-memory', 'project-context-memory']) {
    const core = read(`core/${id}.md`);
    const ai = read(`ai/standards/${id}.ai.yaml`);
    expect(core, id).toMatch(/\*\*Version\*\*: 1\.2\.1/);
    expect(ai, id).toMatch(/version: "1\.2\.1"/);
    expect(core, id).toMatch(/## Boundary: What This Standard Does Not Hold/);
    expect(core, id).toMatch(/Personal, cross-project, identifiable facts/);
    expect(core, id).toMatch(/\(who owns what, how to reach a particular environment\)/);
    expect(core, id).toMatch(/Coordination between projects/);
    expect(core, id).toMatch(/\[Open Work Tracking\]\(open-work-tracking\.md\) \(OWT-027–OWT-029\)/);
    expect(core, id).toMatch(/\| 1\.2\.1 \| 2026-10-07 \| Added: a Boundary section/);
    expect(ai, id).toMatch(/boundary:\n    not_held_here:\n      - what: "個人、跨專案、可識別的資訊（誰負責什麼、怎麼連到某個環境）"\n        belongs_in: "使用者自己的 AI 工具記憶"/);
    expect(ai, id).toMatch(/belongs_in: "open-work-tracking（OWT-027～OWT-029）"/);
    expect(read(`.standards/${id}.ai.yaml`), `${id}: self-adoption copy is byte-identical`).toBe(ai);
    // the translations that exist (they were already behind, and still are; only this section was added)
    for (const [dir, heading, who] of [['zh-TW', '## 邊界：本標準不放什麼', '個人、跨專案、可識別的資訊'], ['zh-CN', '## 边界：本标准不放什么', '个人、跨项目、可识别的信息']]) {
      const t = read(`locales/${dir}/core/${id}.md`);
      expect(t, `${dir} ${id}`).toContain(heading);
      expect(t, `${dir} ${id}`).toContain(who);
      expect(t, `${dir} ${id}`).toContain('open-work-tracking.md');
    }
  }
  const standards = sh('check-standards-sync.sh');
  expect(standards.status, standards.out).toBe(0);
  expect(standards.out).toMatch(/All standards are consistent/);
  const translations = sh('check-translation-sync.sh', ['zh-TW']);
  expect(translations.status, translations.out).toBe(0);
}, 120000);

it('open-work-tracking 1.3.0 carries OWT-027 to OWT-029 at version 1.3.0 in the English text, the zh-TW translation with a current source_hash, the .ai.yaml, the registry and the self-adoption copy, names the entry in three CHANGELOGs, and both sync checks exit 0 (XSPEC-460 R6)', () => {
  const core = read('core/open-work-tracking.md');
  const zh = read('locales/zh-TW/core/open-work-tracking.md');
  const ai = read('ai/standards/open-work-tracking.ai.yaml');
  const registry = JSON.parse(read('cli/standards-registry.json'));

  for (const id of ['OWT-027', 'OWT-028', 'OWT-029']) {
    expect(core, `${id} in core`).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|.*\\| warning \\|`));
    expect(zh, `${id} in zh-TW`).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|.*\\| warning \\|`));
    expect(ai, `${id} in .ai.yaml`).toMatch(new RegExp(`- id: ${id}\\n\\s+rule: .*\\n\\s+severity: warning\\n\\s+severity_rationale:`));
  }
  // the version moved on to 1.4.0 (XSPEC-464): the text of 1.3.0 is all still there, and that the version is the same 1.4.0 in every
  // place is read back by the XSPEC-464 R4 test
  expect(core).toMatch(/\*\*Version\*\*: 1\.4\.0/);
  expect(zh).toMatch(/source_version: 1\.4\.0\ntranslation_version: 1\.4\.0/);
  expect(ai).toMatch(/version: "1\.4\.0"/);
  const hash = execFileSync('git', ['hash-object', 'core/open-work-tracking.md'], { cwd: REAL_REPO, encoding: 'utf8' }).trim().slice(0, 12);
  expect(zh, 'zh-TW source_hash is the hash of the English source').toMatch(new RegExp(`source_hash: ${hash}\\n`));
  expect(read('.standards/open-work-tracking.ai.yaml'), 'self-adoption copy is byte-identical').toBe(ai);

  const entry = registry.standards.find((s) => s.id === 'open-work-tracking');
  expect(entry.description).toMatch(/a wait may name an object in another project by its logical name, with a project this machine cannot see counted apart/);

  // the wording that matters, in all three places that state it
  expect(core).toMatch(/not visible from here/);
  expect(core).toMatch(/\*\*not visible from here\*\*, which means the other project is not on this machine/);
  expect(zh).toMatch(/\*\*從這裡看不到\*\*/);
  expect(ai).toMatch(/not_visible_from_here: "這台機器看不到該專案/);
  expect(core).toMatch(/`待辦` or `TODO` is read only once the adopting project declares that word/);
  expect(ai).toMatch(/deliberately_absent: \["待辦", "後續", "Next", "TODO", "Action", "接下來"\]/);
  expect(ai).toMatch(/built_in_additions: \["glab", "dotnet"\]/);

  for (const [file, needle] of [['CHANGELOG.md', 'open-work-tracking` 1.3.0'], ['locales/zh-TW/CHANGELOG.md', 'open-work-tracking` 1.3.0'], ['locales/zh-CN/CHANGELOG.md', 'open-work-tracking` 1.3.0']]) {
    const log = read(file);
    expect(log, file).toContain(needle);
    expect(log, file).toContain('XSPEC-460');
    expect(log, file).toContain('XSPEC-461');
    expect(log, file).toContain('OWT-029');
  }

  const standards = sh('check-standards-sync.sh');
  expect(standards.status, standards.out).toBe(0);
  const translations = sh('check-translation-sync.sh', ['zh-TW']);
  expect(translations.status, translations.out).toBe(0);
  expect(translations.out, 'the zh-TW translation of this standard is not listed as drifted or outdated').not.toMatch(/open-work-tracking/);
}, 120000);
