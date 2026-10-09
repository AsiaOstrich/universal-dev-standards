#!/usr/bin/env node
/**
 * check-stable-gate — would `scripts/bump-version.mjs <x.y.z>` be allowed? Looks, changes nothing (dev-platform XSPEC-471 R5).
 *
 * Usage: node scripts/beta-acceptance/check-stable-gate.mjs <x.y.z>
 *
 * It runs the same gate `bump-version.mjs` runs in front of a stable version (rules: lib/stable-gate.mjs, README.md in this folder)
 * and prints the same list. Use it to see what is still missing after fetching the reports of a preview.
 *
 * Exit codes: 0 the gate would pass; 1 it would refuse (the reasons are printed); 2 bad arguments (a version with a pre-release mark
 * is not gated, so asking about one is a mistake, not a pass).
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateStableGate, formatGate, isStableVersion } from './lib/stable-gate.mjs';

const target = process.argv[2];
if (!target || !isStableVersion(target)) {
  console.error('Usage: node scripts/beta-acceptance/check-stable-gate.mjs <x.y.z>   (a version with no pre-release mark)');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const result = evaluateStableGate({ root, target });
console.log(formatGate(result, target));
process.exit(result.ok ? 0 : 1);
