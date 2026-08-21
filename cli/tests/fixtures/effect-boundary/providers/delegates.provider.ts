// Synthetic fixture for XSPEC-383 R8. Role: a REAL implementation that holds no
// boundary call of its own and delegates to a helper.
//
// This member exists to prove the gate walks the CALL GRAPH rather than looking
// at one file. A per-file check would judge this RED, and that false positive is
// exactly what would get the whole gate switched off in week two.
import { postJson } from './support/http-client';

import type { ProvisionResult } from './writes-files.provider';

export async function provision(name: string): Promise<ProvisionResult> {
  const res = await postJson('/provision', { name });
  return { ok: res.accepted, accessUrl: res.url };
}
