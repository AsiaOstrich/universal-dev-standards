/**
 * `uds security check-findings` — the deterministic check of the /security skill's
 * structured report (XSPEC-432 R2, DEC-104-L2).
 *
 * This file holds no rules. The one body of them is `../utils/security-findings.mjs`;
 * this only hands it the argument and sets the exit code: 0 the report keeps the
 * contract, 1 it does not, 2 the check could not decide (2 is not a pass).
 * `process.exitCode` is set rather than calling `process.exit()`, so commander's
 * post-action hook still runs.
 *
 * @module commands/security-findings
 */

import { main } from '../utils/security-findings.mjs';

/** uds security check-findings <file|-> */
export function securityCheckFindingsCommand(file) {
  process.exitCode = main([file]);
}
