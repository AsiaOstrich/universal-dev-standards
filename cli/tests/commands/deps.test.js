/**
 * Shipped dependency resolution integrity. // implements XSPEC-366 R1
 *
 * The registry lookup is injected, so these test the comparison and the
 * failure handling rather than npm. What npm does was measured separately and
 * is pinned by the fixtures below: a range matching one version yields a JSON
 * string, a range matching several yields a JSON **array in publish order**,
 * and both a missing package and a range with no match exit non-zero.
 */

import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { measureResolutionDrift } from '../../src/utils/dependency-resolution.js';

/** Build a throwaway package/lock pair and return its directory. */
function fixture(pkg, lockVersions) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-deps-'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  if (lockVersions) {
    const packages = {};
    for (const [name, version] of Object.entries(lockVersions)) {
      packages[`node_modules/${name}`] = { version };
    }
    writeFileSync(join(dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages }, null, 2));
  }
  return dir;
}

/**
 * A fake `npm view` driven by a name → result table.
 *
 * Answers two shapes, because the real code makes two calls per dependency:
 * `view <name>@<range> version --json` to resolve, then
 * `view <name>@<version> --json` for the manifest that decides whether the
 * package is native. `manifests` supplies the second; anything absent is
 * treated as a plain JavaScript package.
 */
function fakeNpm(table, manifests = {}) {
  return async (args) => {
    const spec = args[1];
    const name = spec.slice(0, spec.lastIndexOf('@'));
    const wantsManifest = !args.includes('version');

    if (wantsManifest) {
      return { code: 0, stdout: JSON.stringify(manifests[name] ?? {}), stderr: '' };
    }
    const entry = table[name];
    if (!entry) return { code: 1, stdout: '', stderr: 'npm error code E404\nnpm error 404 Not Found' };
    return { code: 0, stdout: JSON.stringify(entry), stderr: '' };
  };
}

describe('measureResolutionDrift', () => {
  it('reports a dependency whose range resolves past the locked version', async () => {
    // The shape of the real incident: a caret spanning an API break, npm
    // taking the newest match, the lockfile pinning the working one.
    const dir = fixture(
      { name: 'p', dependencies: { 'tree-sitter-c-sharp': '^0.23.1' } },
      { 'tree-sitter-c-sharp': '0.23.1' }
    );
    try {
      const r = await measureResolutionDrift(dir, {
        run: fakeNpm({ 'tree-sitter-c-sharp': ['0.23.0', '0.23.1', '0.23.5'] }),
      });
      expect(r.drifted).toHaveLength(1);
      expect(r.drifted[0]).toMatchObject({
        name: 'tree-sitter-c-sharp',
        locked: '0.23.1',
        resolved: '0.23.5',
      });
      expect(r.clean).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('says nothing about a dependency that resolves to exactly what is tested', async () => {
    // The delta is the output. A dependency in agreement must not appear —
    // otherwise the two rows that matter drown in the twenty-six that did not.
    const dir = fixture({ name: 'p', dependencies: { chalk: '^5.0.0' } }, { chalk: '5.6.2' });
    try {
      const r = await measureResolutionDrift(dir, { run: fakeNpm({ chalk: '5.6.2' }) });
      expect(r.drifted).toEqual([]);
      expect(r.unverifiable).toEqual([]);
      expect(r.consistent).toBe(1);
      expect(r.clean).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('takes the highest satisfying version, not the last one npm listed', async () => {
    // npm lists in publish order. A 1.0.9 backport released after 1.2.0 comes
    // last while being lower, so "take the final element" would report a
    // confident wrong answer — the exact failure mode this tool exists to find.
    const dir = fixture({ name: 'p', dependencies: { thing: '^1.0.0' } }, { thing: '1.0.0' });
    try {
      const r = await measureResolutionDrift(dir, {
        run: fakeNpm({ thing: ['1.0.0', '1.2.0', '1.0.9'] }),
      });
      expect(r.drifted[0].resolved).toBe('1.2.0');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  describe('a lookup that could not be answered is never reported as agreement', () => {
    it('records a failed registry lookup as unverifiable, not consistent', async () => {
      const dir = fixture(
        { name: 'p', dependencies: { chalk: '^5.0.0', ghost: '^1.0.0' } },
        { chalk: '5.6.2', ghost: '1.0.0' }
      );
      try {
        const r = await measureResolutionDrift(dir, { run: fakeNpm({ chalk: '5.6.2' }) });
        expect(r.unverifiable).toHaveLength(1);
        expect(r.unverifiable[0].name).toBe('ghost');
        expect(r.unverifiable[0].error).toMatch(/E404|404/);
        // The one that did resolve is still counted correctly...
        expect(r.consistent).toBe(1);
        // ...and the run as a whole is not clean, so the caller fails.
        expect(r.clean).toBe(false);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it('treats a dependency missing from the lockfile as unknown, not fine', async () => {
      // There is nothing to compare against. Counting it as agreement would
      // turn "no evidence" into "evidence of no problem".
      const dir = fixture({ name: 'p', dependencies: { chalk: '^5.0.0' } }, {});
      try {
        const r = await measureResolutionDrift(dir, { run: fakeNpm({ chalk: '5.6.2' }) });
        expect(r.unverifiable).toHaveLength(1);
        expect(r.unverifiable[0].locked).toBeNull();
        expect(r.clean).toBe(false);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it('does not go quiet when there is no lockfile at all', async () => {
      const dir = fixture({ name: 'p', dependencies: { chalk: '^5.0.0' } }, null);
      try {
        const r = await measureResolutionDrift(dir, { run: fakeNpm({ chalk: '5.6.2' }) });
        expect(r.hasLockfile).toBe(false);
        expect(r.clean).toBe(false);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  it('examines optionalDependencies — they install for consumers too', async () => {
    // engramgraph's Dart grammar is an optional dependency and was the subject
    // of the incident next door; excluding them would leave a real gap.
    const dir = fixture(
      { name: 'p', optionalDependencies: { opt: '^1.0.0' } },
      { opt: '1.0.0' }
    );
    try {
      const r = await measureResolutionDrift(dir, { run: fakeNpm({ opt: ['1.0.0', '1.4.0'] }) });
      expect(r.examined).toBe(1);
      expect(r.drifted[0]).toMatchObject({ name: 'opt', kind: 'optionalDependencies' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ignores devDependencies — consumers never install them', async () => {
    const dir = fixture(
      { name: 'p', dependencies: { chalk: '^5.0.0' }, devDependencies: { vitest: '^1.0.0' } },
      { chalk: '5.6.2', vitest: '1.0.0' }
    );
    try {
      const r = await measureResolutionDrift(dir, { run: fakeNpm({ chalk: '5.6.2' }) });
      expect(r.examined).toBe(1);
      expect(r.clean).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports the denominator, so "no drift" cannot be confused with "nothing checked"', async () => {
    const dir = fixture({ name: 'p', dependencies: {} }, {});
    try {
      const r = await measureResolutionDrift(dir, { run: fakeNpm({}) });
      expect(r.examined).toBe(0);
      // Zero dependencies is genuinely clean, but the count has to travel with
      // the verdict — a bare "clean" over an empty set reads as reassurance.
      expect(r.clean).toBe(true);
      expect(r.consistent).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  describe('native dependencies behind a range (R2)', () => {
    const NATIVE = { scripts: { install: 'node-gyp rebuild' }, dependencies: { 'node-addon-api': '^7.0.0' } };

    it('flags a native dependency declared with a caret, even with no drift', async () => {
      // The VibeOps tree-sitter case: the range matches exactly one published
      // version today, so nothing drifts — and the exposure is total the
      // moment upstream publishes again.
      const dir = fixture({ name: 'p', dependencies: { 'tree-sitter': '^0.22.4' } }, { 'tree-sitter': '0.22.4' });
      try {
        const r = await measureResolutionDrift(dir, {
          run: fakeNpm({ 'tree-sitter': '0.22.4' }, { 'tree-sitter': NATIVE }),
        });
        expect(r.drifted).toEqual([]);
        expect(r.unpinnedNative).toHaveLength(1);
        expect(r.unpinnedNative[0].name).toBe('tree-sitter');
        expect(r.clean).toBe(false);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it('accepts a native dependency pinned to an exact version', async () => {
      const dir = fixture({ name: 'p', dependencies: { 'tree-sitter': '0.22.4' } }, { 'tree-sitter': '0.22.4' });
      try {
        const r = await measureResolutionDrift(dir, {
          run: fakeNpm({ 'tree-sitter': '0.22.4' }, { 'tree-sitter': NATIVE }),
        });
        expect(r.unpinnedNative).toEqual([]);
        expect(r.clean).toBe(true);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it('leaves pure JavaScript dependencies alone', async () => {
      // Flagging every caret would make the check unusable and train people to
      // ignore it. Only native packages are held to the stricter rule.
      const dir = fixture({ name: 'p', dependencies: { chalk: '^5.0.0' } }, { chalk: '5.6.2' });
      try {
        const r = await measureResolutionDrift(dir, {
          run: fakeNpm({ chalk: '5.6.2' }, { chalk: { scripts: { test: 'ava' } } }),
        });
        expect(r.unpinnedNative).toEqual([]);
        expect(r.clean).toBe(true);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it('detects a native package by its build dependency alone', async () => {
      // better-sqlite3 13.x dropped its install script while staying native.
      // A detector keyed only on install scripts would silently stop flagging
      // it, so the build-dependency signal has to stand on its own.
      const dir = fixture({ name: 'p', dependencies: { 'better-sqlite3': '^12.8.0' } }, { 'better-sqlite3': '12.8.0' });
      try {
        const r = await measureResolutionDrift(dir, {
          run: fakeNpm(
            { 'better-sqlite3': '12.8.0' },
            { 'better-sqlite3': { scripts: { test: 'mocha' }, dependencies: { 'prebuild-install': '^7.1.1' } } }
          ),
        });
        expect(r.unpinnedNative).toHaveLength(1);
        expect(r.unpinnedNative[0].native.reasons.join()).toMatch(/prebuild-install/);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it('treats a manifest it cannot read as unknown, not as "not native"', async () => {
      // Silence here would read as "this one is fine", which is the shape the
      // whole module exists to refuse.
      const dir = fixture({ name: 'p', dependencies: { thing: '^1.0.0' } }, { thing: '1.0.0' });
      const run = async (args) => {
        if (!args.includes('version')) return { code: 1, stdout: '', stderr: 'npm error E500' };
        return { code: 0, stdout: JSON.stringify('1.0.0'), stderr: '' };
      };
      try {
        const r = await measureResolutionDrift(dir, { run });
        expect(r.unverifiable).toHaveLength(1);
        expect(r.unverifiable[0].error).toMatch(/could not classify/);
        expect(r.clean).toBe(false);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  it('fails loudly when there is no package.json to read', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'uds-deps-empty-'));
    try {
      await expect(measureResolutionDrift(dir, { run: fakeNpm({}) })).rejects.toThrow(/package\.json/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
