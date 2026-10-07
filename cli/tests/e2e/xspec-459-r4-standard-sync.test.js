/**
 * E2E: open-work-tracking 1.2.0 reads the same in every place it lives (dev-platform XSPEC-459 R4).
 *
 * The standard lives in five places: `core/open-work-tracking.md` (English, the source), its zh-TW translation,
 * `ai/standards/open-work-tracking.ai.yaml`, `cli/standards-registry.json`, and the self-adoption copy under
 * `.standards/`. This test reads each back, then runs the two repository sync checks as real processes and reads
 * their exit codes and output. It is the only R-level test here with no JavaScript wire to cut: what it guards is
 * the agreement of files, not a call.
 *
 * What would make it red: dropping one of OWT-020 to OWT-026 from any of the three texts, leaving the version at 1.1.0
 * anywhere, a zh-TW `source_hash` that is not the current hash of the English source, a self-adoption copy that differs
 * from `ai/standards/`, a rewritten "hand-written state file" row that lost its exception, or a sync script that exits
 * non-zero.
 */

import { it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { REAL_REPO } from '../utils/staged-cli-harness.js';

const read = (rel) => readFileSync(join(REAL_REPO, rel), 'utf8');
const sh = (script, args = []) => {
  const r = spawnSync('bash', [join(REAL_REPO, 'scripts', script), ...args], { cwd: REAL_REPO, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

it('open-work-tracking carries OWT-020 to OWT-026 in the English text, the zh-TW translation, the .ai.yaml, the registry and the self-adoption copy, and both sync checks exit 0 (XSPEC-459 R4)', () => {
  const core = read('core/open-work-tracking.md');
  const zh = read('locales/zh-TW/core/open-work-tracking.md');
  const ai = read('ai/standards/open-work-tracking.ai.yaml');
  const registry = JSON.parse(read('cli/standards-registry.json'));

  for (const id of ['OWT-020', 'OWT-021', 'OWT-022', 'OWT-023', 'OWT-024', 'OWT-025', 'OWT-026']) {
    expect(core, `${id} in core`).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|.*\\| warning \\|`));
    expect(zh, `${id} in zh-TW`).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|.*\\| warning \\|`));
    expect(ai, `${id} in .ai.yaml`).toMatch(new RegExp(`- id: ${id}\\n\\s+rule: .*\\n\\s+severity: warning\\n\\s+severity_rationale:`));
  }

  // the version moved on to 1.3.0 (XSPEC-460/461); that it is the same 1.3.0 everywhere is read back by the XSPEC-460 R6 test
  expect(core).toMatch(/\*\*Version\*\*: 1\.3\.0/);
  expect(zh).toMatch(/source_version: 1\.3\.0\ntranslation_version: 1\.3\.0/);
  expect(ai).toMatch(/version: "1\.3\.0"/);
  expect(read('.standards/open-work-tracking.ai.yaml'), 'self-adoption copy is byte-identical').toBe(ai);

  const entry = registry.standards.find((s) => s.id === 'open-work-tracking');
  expect(entry.source).toEqual({ human: 'core/open-work-tracking.md', ai: 'ai/standards/open-work-tracking.ai.yaml' });
  expect(entry.description).toMatch(/waiting item says whether it was asked yet/);

  // the rewritten row names the exception in all three, and keeps refusing the general case
  expect(core).toMatch(/hand-written state file as the source of truth for any state a reliable source already determines/);
  expect(core).toMatch(/Since 1\.2\.0 there is one narrow exception \(OWT-023–OWT-026\)/);
  expect(zh).toMatch(/自 1\.2\.0 起有一個窄例外（OWT-023–OWT-026）/);
  expect(ai).toMatch(/what: "以手寫狀態檔作為任何「已有可靠來源可決定」之狀態的真相"/);

  // the severity and calibration are said in the text, not only in the code
  expect(core).toMatch(/exit 1 on any violation, `warning` included/);
  expect(ai).toMatch(/added_in_1_2_0:[\s\S]*uncalibrated_per_owt_016/);

  // the sync checks: real processes, exit code and the line about this standard read back
  const standards = sh('check-standards-sync.sh');
  expect(standards.status, standards.out).toBe(0);
  expect(standards.out).toMatch(/All standards are consistent/);
  const translations = sh('check-translation-sync.sh', ['zh-TW']);
  expect(translations.status, translations.out).toBe(0);
  expect(translations.out, 'the zh-TW translation of this standard is not listed as drifted or outdated').not.toMatch(/open-work-tracking/);
}, 120000); // the two sync scripts walk every standard; under a loaded full run 30 s was not enough (seen once)
