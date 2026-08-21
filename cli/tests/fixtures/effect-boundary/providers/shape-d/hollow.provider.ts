// Synthetic fixture for XSPEC-383 R8. Role: SHAPE D — the specimen this whole
// gate exists for.
//
// It is reachable, it is called, it runs, it returns a success-shaped value that
// satisfies ProvisionResult exactly, and it touches nothing outside this process.
// A unit test asserting `result.ok === true` passes. The type checker is happy.
// R3's reachability gate is happy, because it asks who calls this file, and
// somebody does.
//
// The gate must judge this RED.
import { join } from 'node:path';

import type { ProvisionResult } from '../writes-files.provider';

export function provision(name: string): ProvisionResult {
  const slug = join(name, 'latest');
  return { ok: true, accessUrl: `https://${slug}.fixtures.uds-effect-boundary.test` };
}
