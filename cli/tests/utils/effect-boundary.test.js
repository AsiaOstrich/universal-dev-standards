/**
 * effect-boundary — XSPEC-383 R8
 *
 * What these tests cover that `--self-test` does not:
 *
 * The self-test runs the whole gate end-to-end over the synthetic corpus and
 * proves it goes green, red, and 2. It never exercises the BASELINE, because
 * this repo's baseline is deliberately empty (UDS declares no effect family of
 * its own). A baseline nothing runs is a suppression mechanism nobody has ever
 * seen fire — and this repo has already shipped one of those (the docs/ grep in
 * MIGRATION-v6.md that was never run).
 *
 * So: baseline parsing, suppression, expiry, and the malformed-baseline exit-2
 * path are pinned here, plus the pure predicates the whole judgement rests on.
 */

import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

import {
  analyseEffectBoundary,
  formatReport,
  parseBaselineTsv,
  baselineKey,
  classifyHonesty,
  extractDomains,
  extractSpecifiers,
  detectBoundaryHits,
  deriveBoundarySurface,
  verifyProbeIsWorking,
  globToRegExp,
  stripComments,
  resolveOwnedDomains
} from '../../src/utils/effect-boundary.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '../fixtures/effect-boundary');
const RED_CONFIG = join(FIXTURES, 'effect-boundary.json');

const EMPTY_PKG = { boundary: new Set(), inert: new Set() };

function runRed(baseline = { entries: [], errors: [] }, today) {
  const config = JSON.parse(readFileSync(RED_CONFIG, 'utf8'));
  const result = analyseEffectBoundary({ projectPath: FIXTURES, config });
  return { result, ...formatReport(result, baseline, today) };
}

describe('boundary surface is derived from the runtime, not hand-written', () => {
  it('expands every family rule to at least one real builtin', () => {
    const s = deriveBoundarySurface();
    expect(s.modules.size).toBeGreaterThan(0);
    for (const f of s.familyStats) {
      // A rule that expands to zero is a rule that has expired, or never worked.
      expect(f.matched, `family rule '${f.id}' matched nothing`).toBeGreaterThan(0);
    }
  });

  it('includes both bare and node:-prefixed forms, derived rather than listed', () => {
    const s = deriveBoundarySurface();
    expect(s.modules.has('fs')).toBe(true);
    expect(s.modules.has('node:fs')).toBe(true);
    // Subpaths come from walking builtinModules, so new ones need no code change
    expect(s.modules.has('fs/promises')).toBe(true);
  });

  it('does not treat node:module as a boundary — createRequire is not an effect', () => {
    // The first draft classified `module` as the native-addon family root, which
    // would have made every file using createRequire (including this repo's own
    // audit.js) look like it reaches outside the process. A green light out of
    // thin air is the one direction this gate must never fail in.
    const s = deriveBoundarySurface();
    expect(s.modules.has('node:module')).toBe(false);
  });
});

describe('probe self-verification', () => {
  it('passes on a healthy detector', () => {
    const s = deriveBoundarySurface();
    expect(verifyProbeIsWorking(s, EMPTY_PKG).ok).toBe(true);
  });

  it('fails when the detector can see no boundary at all', () => {
    const s = deriveBoundarySurface();
    const broken = { ...s, modules: new Set(), moduleFamily: new Map(), globals: [] };
    expect(verifyProbeIsWorking(broken, EMPTY_PKG).ok).toBe(false);
  });

  it('fails when the detector claims a hit for everything', () => {
    const s = deriveBoundarySurface();
    // A detector whose global pattern matches any character reports a hit on the
    // known-pure control. Without the negative arm this passes silently and the
    // whole family goes green.
    const overEager = { ...s, globals: [{ id: 'always', why: 'test', pattern: /[\s\S]/ }] };
    const r = verifyProbeIsWorking(overEager, EMPTY_PKG);
    expect(r.ok).toBe(false);
    expect(r.lines.join('\n')).toContain('control (negative)');
  });
});

describe('type-only imports are not call-graph edges', () => {
  it('skips `import type` and fully type-qualified named imports', () => {
    const { specs } = extractSpecifiers(
      'import type { A } from \'./a\';\nimport { type B, type C } from \'./b\';\n'
    );
    expect(specs.every((s) => s.typeOnly)).toBe(true);
  });

  it('keeps a mixed import — it has a value binding, so it really is an edge', () => {
    const { specs } = extractSpecifiers('import { type B, doWork } from \'./b\';');
    expect(specs).toEqual([{ spec: './b', typeOnly: false }]);
  });

  it('counts no boundary hit for a type-only import of node:fs', () => {
    const s = deriveBoundarySurface();
    const d = detectBoundaryHits('import type { Stats } from \'node:fs\';', s, EMPTY_PKG);
    expect(d.hits).toHaveLength(0);
    expect(d.typeOnlySkipped).toBe(1);
  });
});

describe('comment stripping keeps strings intact', () => {
  it('does not eat the // inside a URL literal', () => {
    expect(stripComments('const u = \'https://example.com/x\'; // note')).toContain('https://example.com/x');
  });

  it('removes a JSDoc example that would otherwise fake a boundary hit', () => {
    const src = '/** @example import fs from \'node:fs\' */\nexport const x = 1;';
    const s = deriveBoundarySurface();
    expect(detectBoundaryHits(src, s, EMPTY_PKG).hits).toHaveLength(0);
  });
});

describe('R7-b honest non-implementation', () => {
  it('is exempt when it declares NOT_IMPLEMENTED and never claims success', () => {
    const h = classifyHonesty('return { ok: false, code: \'NOT_IMPLEMENTED\' };');
    expect(h.declaresNotImplemented).toBe(true);
    expect(h.claimsSuccess).toBe(false);
  });

  it('is not exempt when the marker sits next to a success-shaped return', () => {
    const h = classifyHonesty('const U = \'NOT_IMPLEMENTED\';\nreturn { ok: true };');
    expect(h.declaresNotImplemented).toBe(true);
    expect(h.claimsSuccess).toBe(true);
  });

  it('accepts the comment-form marker', () => {
    expect(classifyHonesty('// @uds-effect-not-implemented\nreturn null;').declaresNotImplemented).toBe(true);
  });
});

describe('R7-c domain extraction', () => {
  it('folds template interpolation and keeps the literal registrable part', () => {
    const d = extractDomains('const u = `https://${region}.api.acme.example/v1`;');
    expect(d).toHaveLength(1);
    expect(d[0].registrable).toBe('acme.example');
    expect(d[0].decidable).toBe(true);
  });

  it('folds `+` concatenation the same way', () => {
    const d = extractDomains('const u = \'https://\' + tenant + \'.acme.example\';');
    expect(d[0].registrable).toBe('acme.example');
  });

  it('marks it undecidable when the registrable part itself is built at runtime', () => {
    const d = extractDomains('const u = `https://api.${tld}`;');
    expect(d[0].decidable).toBe(false);
  });

  it('ignores domains in comments — a comment cannot produce a runtime request', () => {
    expect(extractDomains('// see https://docs.acme.example/guide')).toHaveLength(0);
  });
});

describe('owned-domain list resolution', () => {
  it('reads a file source and ignores its own comment prose', () => {
    const r = resolveOwnedDomains({ source: 'file', path: 'owned-domains.txt' }, FIXTURES);
    expect(r.ok).toBe(true);
    // The fixture file's header explains itself in prose containing dotted words.
    // Splitting the whole file on whitespace would turn that prose into "owned
    // domains" — a allowlist poisoned by its own documentation.
    expect(r.domains).toEqual(['uds-effect-boundary.test']);
  });

  it('reports failure — not an empty list — when the file is missing', () => {
    const r = resolveOwnedDomains({ source: 'file', path: 'nope.txt' }, FIXTURES);
    expect(r.ok).toBe(false);
  });

  it('reports failure when the env source is set but empty', () => {
    process.env.UDS_TEST_OWNED_DOMAINS = '   ';
    const r = resolveOwnedDomains({ source: 'env', var: 'UDS_TEST_OWNED_DOMAINS' }, FIXTURES);
    delete process.env.UDS_TEST_OWNED_DOMAINS;
    expect(r.ok).toBe(false);
  });
});

describe('glob matching', () => {
  it('lets **/ match zero directories', () => {
    expect(globToRegExp('providers/**/*.ts').test('providers/a.ts')).toBe(true);
    expect(globToRegExp('providers/**/*.ts').test('providers/x/a.ts')).toBe(true);
  });

  it('does not let a single * cross a directory separator', () => {
    expect(globToRegExp('providers/*.ts').test('providers/x/a.ts')).toBe(false);
  });
});

describe('baseline (TSV, one expiry per row)', () => {
  const today = '2026-08-21';
  const hollow = 'providers/shape-d/hollow.provider.ts';
  const abuse = 'providers/shape-d/exemption-abuse.provider.ts';

  it('parses a well-formed row', () => {
    const { entries, errors } = parseBaselineTsv(
      '# comment\n\nproviders\tsrc/a.ts\tRED\t2099-01-01\tdeferred, tracked in XSPEC-999\n'
    );
    expect(errors).toEqual([]);
    expect(entries).toHaveLength(1);
    expect(entries[0].expires).toBe('2099-01-01');
  });

  it('rejects a row with the wrong column count', () => {
    const { errors } = parseBaselineTsv('providers\tsrc/a.ts\tRED\t2099-01-01\n');
    expect(errors).toHaveLength(1);
  });

  it('rejects a row whose expiry is not a date — an entry with no clock never expires', () => {
    const { errors } = parseBaselineTsv('providers\tsrc/a.ts\tRED\tsomeday\treason\n');
    expect(errors[0]).toContain('never expires');
  });

  it('suppresses a known finding while it is still within its expiry', () => {
    const baseline = parseBaselineTsv(
      `providers\t${hollow}\tRED\t2099-01-01\tknown\nproviders\t${abuse}\tRED\t2099-01-01\tknown\n`
    );
    const { exitCode, lines } = runRed(baseline, today);
    expect(exitCode).toBe(0);
    expect(lines.join('\n')).toContain('2 known finding(s) suppressed by the baseline');
  });

  it('goes red again once the row expires', () => {
    const baseline = parseBaselineTsv(
      `providers\t${hollow}\tRED\t2020-01-01\tknown\nproviders\t${abuse}\tRED\t2099-01-01\tknown\n`
    );
    const { exitCode, lines } = runRed(baseline, today);
    expect(exitCode).toBe(1);
    expect(lines.join('\n')).toContain('expired 2020-01-01');
  });

  it('refuses to report at all when the baseline file is malformed', () => {
    // A broken baseline is not "no baseline". Reading it as empty would silently
    // re-raise every suppressed finding, or — worse, in the other direction —
    // let a typo'd row look like a valid suppression.
    const { exitCode, lines } = runRed(parseBaselineTsv('providers\tbroken-row\n'), today);
    expect(exitCode).toBe(2);
    expect(lines.join('\n')).toContain('does not parse');
  });

  it('keys on family and member together', () => {
    expect(baselineKey('a', 'b')).not.toBe(baselineKey('a\tb', ''));
  });
});

describe('end-to-end verdicts over the synthetic corpus', () => {
  it('judges the corpus as expected and exits 1', () => {
    const { result, exitCode } = runRed();
    const byFile = Object.fromEntries(
      result.families.flatMap((f) => f.members).map((m) => [m.file, m.verdict])
    );
    expect(byFile['providers/writes-files.provider.ts']).toBe('GREEN');
    expect(byFile['providers/runs-process.provider.ts']).toBe('GREEN');
    expect(byFile['providers/delegates.provider.ts']).toBe('GREEN');
    expect(byFile['providers/honest.provider.ts']).toBe('EXEMPT-HONEST');
    expect(byFile['providers/shape-d/hollow.provider.ts']).toBe('RED');
    expect(byFile['providers/shape-d/exemption-abuse.provider.ts']).toBe('RED');
    expect(exitCode).toBe(1);
  });

  it('reports its denominator, not just its findings', () => {
    const { result } = runRed();
    expect(result.totalMembers).toBe(6);
    expect(result.totalExcluded).toBe(2);
    expect(result.walked).toBeGreaterThan(result.totalMembers);
  });

  it('exits 2 rather than 0 when a family resolves to no members', () => {
    const config = JSON.parse(readFileSync(join(FIXTURES, 'effect-boundary.empty.json'), 'utf8'));
    const result = analyseEffectBoundary({ projectPath: FIXTURES, config });
    expect(formatReport(result, { entries: [], errors: [] }).exitCode).toBe(2);
  });

  it('surfaces an unclassifiable dependency instead of scoring it as zero-effect', () => {
    const s = deriveBoundarySurface();
    const d = detectBoundaryHits('import { go } from \'mystery-sdk\';\nexport const x = () => go();', s, EMPTY_PKG);
    expect(d.hits).toHaveLength(0);
    expect(d.unknownPackages).toEqual(['mystery-sdk']);
  });

  it('honours an adopter-declared boundary package', () => {
    const s = deriveBoundarySurface();
    const pkg = { boundary: new Set(['mystery-sdk']), inert: new Set() };
    const d = detectBoundaryHits('import { go } from \'mystery-sdk\';', s, pkg);
    expect(d.hits).toHaveLength(1);
    expect(d.unknownPackages).toHaveLength(0);
  });
});
