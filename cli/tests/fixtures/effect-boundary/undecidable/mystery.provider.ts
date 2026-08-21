// Synthetic fixture for XSPEC-383 R8. Role: the THIRD state.
//
// Zero boundary hits of its own, and its only dependency is an external package
// this engine cannot classify statically. `some-vendor-sdk` might be a network
// client; it might be a pure formatter.
//
// Calling this GREEN is fail-open. Calling it RED is an accusation the evidence
// does not support. So it is UNDECIDABLE, and the run exits 2 — with a stated
// way out: declare the package under packages.boundary or packages.inert.
import { deployIt } from 'some-vendor-sdk';

export function provision(name: string) {
  return deployIt(name);
}
