/**
 * E2E: open-work-tracking 1.2.0 reads the same in every place it lives (dev-platform XSPEC-459 R4).
 *
 * The standard used to live in five places: `core/open-work-tracking.md` (English, the source), its zh-TW translation,
 * `ai/standards/open-work-tracking.ai.yaml`, `cli/standards-registry.json`, and the self-adoption copy under
 * `.standards/`. Since the downgrade to the optional skill `open-work` (dev-platform XSPEC-427, decision 209甲) it
 * lives in two: the English reference document and its zh-TW translation. The other three are read back as ABSENT
 * (a leftover `.ai.yaml` or registry entry would make `uds init` install a standard that is no longer shipped).
 * This test reads each back, then runs the two repository sync checks as real processes and reads
 * their exit codes and output. It is the only R-level test here with no JavaScript wire to cut: what it guards is
 * the agreement of files, not a call.
 *
 * What would make it red: dropping one of OWT-020 to OWT-026 from any of the three texts, leaving the version at 1.1.0
 * anywhere, a zh-TW `source_hash` that is not the current hash of the English source, a self-adoption copy that differs
 * from `ai/standards/`, a rewritten "hand-written state file" row that lost its exception, or a sync script that exits
 * non-zero.
 */

import { it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { REAL_REPO } from '../utils/staged-cli-harness.js';

const read = (rel) => readFileSync(join(REAL_REPO, rel), 'utf8');
const sh = (script, args = []) => {
  const r = spawnSync('bash', [join(REAL_REPO, 'scripts', script), ...args], { cwd: REAL_REPO, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

it('open-work-tracking carries OWT-020 to OWT-026 in the English text and the zh-TW translation, has no .ai.yaml, registry entry or self-adoption copy any more, and both sync checks exit 0 (XSPEC-459 R4)', (ctx) => {
  // needs a POSIX shell (bash runs scripts/check-*.sh); skipped, and counted as skipped, on Windows
  if (process.platform === 'win32') ctx.skip();
  const core = read('core/open-work-tracking.md');
  const zh = read('locales/zh-TW/core/open-work-tracking.md');
  const registry = JSON.parse(read('cli/standards-registry.json'));

  for (const id of ['OWT-020', 'OWT-021', 'OWT-022', 'OWT-023', 'OWT-024', 'OWT-025', 'OWT-026']) {
    expect(core, `${id} in core`).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|.*\\| warning \\|`));
    expect(zh, `${id} in zh-TW`).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|.*\\| warning \\|`));
  }

  // the version moved on to 1.3.0 (XSPEC-460/461) and then to 1.4.0 (XSPEC-464); that it is the same 1.4.0 everywhere is read back by the XSPEC-464 R4 test
  expect(core).toMatch(/\*\*Version\*\*: 1\.4\.0/);
  expect(zh).toMatch(/source_version: 1\.4\.0\ntranslation_version: 1\.4\.0/);

  // downgraded to the optional skill (XSPEC-427): none of the three places that made it an installed standard remains
  expect(existsSync(join(REAL_REPO, 'ai/standards/open-work-tracking.ai.yaml')), 'no .ai.yaml under ai/standards').toBe(false);
  expect(existsSync(join(REAL_REPO, '.standards/open-work-tracking.ai.yaml')), 'no self-adoption copy').toBe(false);
  expect(registry.standards.find((s) => s.id === 'open-work-tracking'), 'no registry entry').toBeUndefined();

  // the rewritten row names the exception in all three, and keeps refusing the general case
  expect(core).toMatch(/hand-written state file as the source of truth for any state a reliable source already determines/);
  expect(core).toMatch(/Since 1\.2\.0 there is one narrow exception \(OWT-023–OWT-026\)/);
  expect(zh).toMatch(/自 1\.2\.0 起有一個窄例外（OWT-023–OWT-026）/);

  // the severity and calibration are said in the text, not only in the code
  expect(core).toMatch(/exit 1 on any violation, `warning` included/);

  // the sync checks: real processes, exit code and the line about this standard read back
  const standards = sh('check-standards-sync.sh');
  expect(standards.status, standards.out).toBe(0);
  expect(standards.out).toMatch(/All standards are consistent/);
  const translations = sh('check-translation-sync.sh', ['zh-TW']);
  expect(translations.status, translations.out).toBe(0);
  expect(translations.out, 'the zh-TW translation of this standard is not listed as drifted or outdated').not.toMatch(/open-work-tracking/);
}, 120000); // the two sync scripts walk every standard; under a loaded full run 30 s was not enough (seen once)
