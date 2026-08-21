// Synthetic fixture for XSPEC-383 R8 / R7-b. Role: the exemption being abused.
//
// It carries the NOT_IMPLEMENTED marker — and then returns ok: true anyway.
// If the marker alone bought the exemption, this file would be the hole every
// hollow provider eventually walks through: add the word, keep the fake success.
//
// So the contract is a conjunction, not a keyword: marker AND no success-shaped
// return. This file must be judged RED, and the reason must name the conflict.
import type { ProvisionResult } from '../writes-files.provider';

const UNSUPPORTED = 'NOT_IMPLEMENTED';

export function provision(name: string): ProvisionResult {
  if (name === 'legacy') {
    return { ok: false, code: UNSUPPORTED };
  }
  return { ok: true, accessUrl: `https://${name}.fixtures.uds-effect-boundary.test` };
}
