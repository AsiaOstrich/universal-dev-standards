// Synthetic fixture for XSPEC-383 R8. Written for this repo; not derived from
// any adopter's source. Never compiled or executed — the gate reads it as text.
//
// Role: a REAL implementation. Touches the filesystem directly.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ProvisionResult {
  ok: boolean;
  accessUrl?: string;
  code?: string;
}

export function provision(name: string, body: string): ProvisionResult {
  const dir = join('/tmp', 'uds-effect-fixture');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.txt`), body, 'utf8');
  return { ok: true, accessUrl: `https://${name}.fixtures.uds-effect-boundary.test/artifacts` };
}
