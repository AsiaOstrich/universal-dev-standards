// Synthetic fixture for XSPEC-383 R8 / R7-b. Role: does nothing AND SAYS SO.
//
// This must be LEGAL. If the gate had no legal way to say "not built yet", the
// motive chain is: gate blocks the new provider → somebody adds an allowlist →
// the allowlist rots. Giving honest non-implementation a legal exit removes the
// allowlist's reason to exist.
//
// The contract is two static conditions, both visible in this file:
//   1. the literal NOT_IMPLEMENTED appears (or @uds-effect-not-implemented)
//   2. no success-shaped return literal appears anywhere in the file
import type { ProvisionResult } from './writes-files.provider';

export function provision(_name: string): ProvisionResult {
  return { ok: false, code: 'NOT_IMPLEMENTED' };
}
