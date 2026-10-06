/**
 * The scanners UDS ships (templates/gates/check-anti-fake-tests.mjs, check-stubs.mjs) run in
 * an adopter's project with no UDS code beside them, so the table that says "what is a test
 * file, what is code" is COPIED into each of them from cli/src/utils/test-policy.js — and the
 * engine that reads source text is copied between the two. Three copies of one table drift.
 * (XSPEC-444 R2 / R5)
 *
 * This test makes drift a failure instead of a surprise:
 *   1. the shared policy block is byte-identical in all three files;
 *   2. the shared engine block is byte-identical in both scanners;
 *   3. a corpus of paths classifies the same through all three, and the defaults are equal.
 * (The control arm proves the comparison can fail: it must fire on a copy with one byte changed.)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { DEFAULT_POLICY, classifyPath } from '../../../src/utils/test-policy.js';
import * as anti from '../../../../templates/gates/check-anti-fake-tests.mjs';
import * as stubs from '../../../../templates/gates/check-stubs.mjs';

const REPO = resolve(import.meta.dirname, '../../../..');
const read = (rel) => readFileSync(join(REPO, rel), 'utf8');
const between = (text, begin, end) => {
  const a = text.indexOf(begin);
  const b = text.indexOf(end);
  if (a === -1 || b === -1 || b < a) return null;
  return text.slice(a, b + end.length);
};
const POLICY_BEGIN = '// ---- BEGIN SHARED POLICY';
const POLICY_END = '// ---- END SHARED POLICY ----';
const ENGINE_BEGIN = '// ---- BEGIN SHARED ENGINE';
const ENGINE_END = '// ---- END SHARED ENGINE ----';

const source = read('cli/src/utils/test-policy.js');
const antiText = read('templates/gates/check-anti-fake-tests.mjs');
const stubsText = read('templates/gates/check-stubs.mjs');

describe('shared blocks do not drift between the CLI and the two shipped scanners', () => {
  it('the policy block exists in all three files', () => {
    for (const [name, text] of [['test-policy.js', source], ['check-anti-fake-tests.mjs', antiText], ['check-stubs.mjs', stubsText]]) {
      expect(between(text, POLICY_BEGIN, POLICY_END), `${name} has the shared policy block`).not.toBeNull();
    }
  });
  it('the policy block is byte-identical in all three files', () => {
    const a = between(source, POLICY_BEGIN, POLICY_END);
    expect(between(antiText, POLICY_BEGIN, POLICY_END), 'check-anti-fake-tests.mjs differs from cli/src/utils/test-policy.js — re-copy the block').toBe(a);
    expect(between(stubsText, POLICY_BEGIN, POLICY_END), 'check-stubs.mjs differs from cli/src/utils/test-policy.js — re-copy the block').toBe(a);
  });
  it('the engine block is byte-identical in both scanners', () => {
    const a = between(antiText, ENGINE_BEGIN, ENGINE_END);
    expect(a).not.toBeNull();
    expect(between(stubsText, ENGINE_BEGIN, ENGINE_END), 'the two scanners carry different engines — re-copy the block').toBe(a);
  });
  it('control: the comparison fires on a copy with one byte changed', () => {
    const a = between(source, POLICY_BEGIN, POLICY_END);
    const tampered = between(source.replace("'e2e'", "'e2f'"), POLICY_BEGIN, POLICY_END);
    expect(tampered).not.toBe(a);
  });
  it('the defaults are deep-equal, and the classification agrees on a corpus', () => {
    expect(JSON.parse(JSON.stringify(anti.DEFAULT_POLICY))).toEqual(JSON.parse(JSON.stringify(DEFAULT_POLICY)));
    expect(JSON.parse(JSON.stringify(stubs.DEFAULT_POLICY))).toEqual(JSON.parse(JSON.stringify(DEFAULT_POLICY)));
    const corpus = [
      'src/a.ts', 'src/a.test.ts', 'tests/x.py', 'pkg/u_test.go', 'README.md', 'node_modules/a/b.js', 'lib/x.zig', '.eslintrc.js',
      'spec/u_spec.rb', 'src/test/java/UserTest.java', 'Dockerfile', 'tests/fixtures/a.json', 'a.min.js', 'docs/x.js', 'scripts/deploy.sh'
    ];
    for (const p of corpus) {
      const want = classifyPath(p, DEFAULT_POLICY);
      expect(anti.classifyPath(p, anti.DEFAULT_POLICY), `anti: ${p}`).toEqual(want);
      expect(stubs.classifyPath(p, stubs.DEFAULT_POLICY), `stubs: ${p}`).toEqual(want);
    }
  });
});
