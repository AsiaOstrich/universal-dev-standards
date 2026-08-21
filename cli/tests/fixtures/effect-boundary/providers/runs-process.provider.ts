// Synthetic fixture for XSPEC-383 R8. Role: a REAL implementation that starts
// another OS process. This is also the CANARY specimen — `--self-test` removes
// its boundary call and asserts the gate turns red.
import { spawnSync } from 'node:child_process';

import type { ProvisionResult } from './writes-files.provider';

export function provision(name: string): ProvisionResult {
  const r = spawnSync('printf', ['%s', name], { encoding: 'utf8' });
  if (r.status !== 0) {
    return { ok: false, code: 'SPAWN_FAILED' };
  }
  return { ok: true, accessUrl: `https://${name}.fixtures.uds-effect-boundary.test/runs` };
}
