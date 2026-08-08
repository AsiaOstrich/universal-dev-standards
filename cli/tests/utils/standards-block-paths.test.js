/**
 * Every path the standards block prints must name a file that install puts on
 * disk.
 *
 * Kept out of integration-generator.test.js on purpose: that file mocks `fs`,
 * and the whole point here is to resolve against the real registry.
 *
 * The bug this pins: a manifest's `standards` array is mixed by design — core
 * standards are registry IDs since v3.4.0, option entries stay as their
 * upstream source path because they have no ID. Every consumer ran basename()
 * over both, which is right for a path and a no-op for an ID, and an ID is not
 * a filename. On a real adopter that produced seven dead paths out of seventy
 * in AGENTS.md, immediately under a line reading "you MUST read and follow the
 * standards in `.standards/`". Nothing noticed, because the check that exists
 * to notice had the same defect and was measuring 7 against 7.
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { generateMinimalStandardsReference } from '../../src/utils/integration-generator.js';
import { getAllStandards, getStandardSource } from '../../src/utils/registry.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/** The IDs whose installed filename is not their ID — the cases that broke. */
const MISMATCHED = ['error-code-standards', 'logging-standards', 'ai-agreement'];

function pathsIn(block) {
  return [...block.matchAll(/^- `(\.standards\/[^`]+)`$/gm)].map((m) => m[1]);
}

describe('the standards block prints filenames, not registry IDs', () => {
  it('resolves IDs whose filename differs from the ID', () => {
    const block = generateMinimalStandardsReference(MISMATCHED, 'markdown', 'en', 'ai');
    const paths = pathsIn(block);

    expect(paths).toEqual([
      '.standards/error-codes.ai.yaml',
      '.standards/logging.ai.yaml',
      '.standards/ai-agreement-standards.ai.yaml',
    ]);
    // And specifically not the IDs, which is what it used to emit.
    expect(block).not.toContain('.standards/error-code-standards`');
  });

  it('keeps option entries under options/', () => {
    const block = generateMinimalStandardsReference(
      ['ai/options/testing/unit-testing.ai.yaml'],
      'markdown',
      'en',
      'ai',
    );
    expect(pathsIn(block)).toEqual(['.standards/options/unit-testing.ai.yaml']);
  });

  it('says so instead of printing an entry it cannot resolve', () => {
    // Silence would be worse than the dead path only in one direction: a
    // shorter list and a complete one read identically. So the entry is
    // withheld from the list and reported underneath it.
    const block = generateMinimalStandardsReference(['no-such-standard'], 'markdown', 'en', 'ai');
    expect(pathsIn(block)).toEqual([]);
    expect(block).toContain('no-such-standard');
    expect(block).toMatch(/could not be matched/);
  });

  it('every core standard in the registry resolves to a file that exists', () => {
    // The sweep the original bug needed. Individual cases pin the three that
    // were found; this one fails when a new standard is added whose ID and
    // filename disagree in some way nobody anticipated.
    const core = getAllStandards().filter((s) => s.category === 'reference' || s.category === 'skill');
    expect(core.length).toBeGreaterThan(50); // guard the denominator itself

    // Skill-only standards carry `source: {human: null, ai: null}` — they are
    // delivered as a Skill, not as a file under .standards/, so there is
    // nothing for the block to point at. update.js's checkNewStandards skips
    // them for the same reason. Written out rather than folded into the
    // expected number, because "64 minus something" is the kind of arithmetic
    // that stops being checked once it passes once.
    const withFile = core.filter((s) => getStandardSource(s, 'ai'));
    const skillOnly = core.filter((s) => !getStandardSource(s, 'ai'));
    expect(skillOnly.map((s) => s.id)).toEqual(['project-discovery']);

    const block = generateMinimalStandardsReference(core.map((s) => s.id), 'markdown', 'en', 'ai');

    // The sweep is worthless if the block came back empty, and an empty block
    // passes every assertion below it. Assert the denominator before using it.
    const printed = pathsIn(block);
    expect(printed.length).toBe(withFile.length);
    // And the one it dropped is named, not silently absent.
    expect(block).toContain('project-discovery');

    const missing = [];
    for (const p of printed) {
      // `.standards/x` in a project maps to the repo's source tree here.
      const name = p.replace('.standards/', '');
      const known = core.some((s) => {
        const src = getStandardSource(s, name.endsWith('.ai.yaml') ? 'ai' : 'human');
        return src && src.endsWith(`/${name}`);
      });
      if (!known) missing.push(p);
    }
    expect(missing).toEqual([]);
  });

  it('the repository itself has a source file behind every printed name', () => {
    const core = getAllStandards().filter((s) => s.category === 'reference' || s.category === 'skill');
    const absent = [];
    for (const s of core) {
      const src = getStandardSource(s, 'ai');
      if (src && !existsSync(join(REPO, src))) absent.push(`${s.id} -> ${src}`);
    }
    expect(absent).toEqual([]);
  });
});
