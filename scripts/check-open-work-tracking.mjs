#!/usr/bin/env node
/**
 * Open-work-tracking reference checks for OWT-017 to OWT-028 — repo entry point.
 * open-work-tracking 1.4.0 參考判定程序的 repo 入口。
 *
 * This file holds NO rules. The one body of them is
 * cli/src/utils/open-work-tracking.mjs, which ships in the npm package and is
 * what `uds open-work <next-action|revision|separation|waiting|observations|self-test>` runs. This
 * shim exists so `node scripts/check-open-work-tracking.mjs ...` keeps working
 * from a clone of the UDS repository, and re-exports the module so the
 * functions stay importable from the old path.
 *
 * Exit codes are the module's: 0 no violation, 1 violation, 2 cannot decide
 * (2 is not a pass). See the header of cli/src/utils/open-work-tracking.mjs.
 */
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { main } from '../cli/src/utils/open-work-tracking.mjs';

export * from '../cli/src/utils/open-work-tracking.mjs';

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
