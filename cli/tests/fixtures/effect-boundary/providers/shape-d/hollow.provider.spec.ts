// Synthetic fixture for XSPEC-383 R8. Role: the green unit test that proves
// nothing — and the reason `exclude` exists.
//
// This file asserts ok === true against the hollow provider and passes. That is
// the whole point: a passing test is compatible with an implementation that does
// nothing at all, because the assertion and the implementation share one author.
//
// It is excluded from the family by an `exclude` glob, not by a filename list.
import { provision } from './hollow.provider';

it('returns a successful provision result', () => {
  const r = provision('demo');
  expect(r.ok).toBe(true);
});
