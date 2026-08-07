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
import { render } from '../../src/commands/deps.js';

/** chalk keeps colour on in some CI shells; match on the text, not the escapes. */
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');

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
 * `view <name> versions dist-tags --json` to resolve, then
 * `view <name>@<version> --json` for the manifest that decides whether the
 * package is native. `manifests` supplies the second; anything absent is
 * treated as a plain JavaScript package.
 *
 * A `table` entry may be an array of versions (no dist-tags — the registry
 * shape for a package that has never tagged anything but `latest`), or an
 * object `{ versions, 'dist-tags' }` when a test needs the tag to matter.
 */
function fakeNpm(table, manifests = {}) {
  return async (args) => {
    const wantsResolution = args.includes('versions');

    if (wantsResolution) {
      const entry = table[args[1]];
      if (!entry) return { code: 1, stdout: '', stderr: 'npm error code E404\nnpm error 404 Not Found' };
      const body = Array.isArray(entry) || typeof entry === 'string' ? { versions: entry } : entry;
      return { code: 0, stdout: JSON.stringify(body), stderr: '' };
    }

    const spec = args[1];
    const name = spec.slice(0, spec.lastIndexOf('@'));
    return { code: 0, stdout: JSON.stringify(manifests[name] ?? {}), stderr: '' };
  };
}

/**
 * A root package.json with workspaces, each workspace's own manifest, and a
 * lockfile whose entries may sit at the root or nested under a workspace —
 * which is the arrangement npm actually produces, and the reason a single
 * lookup path under-reports.
 */
function workspaceFixture({ root, workspaces, hoisted = {}, nested = {} }) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-deps-ws-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify(root, null, 2));
  for (const [rel, pkg] of Object.entries(workspaces)) {
    mkdirSync(join(dir, ...rel.split('/')), { recursive: true });
    writeFileSync(join(dir, ...rel.split('/'), 'package.json'), JSON.stringify(pkg, null, 2));
  }
  const packages = {};
  for (const [name, version] of Object.entries(hoisted)) packages[`node_modules/${name}`] = { version };
  for (const [key, version] of Object.entries(nested)) packages[key] = { version };
  writeFileSync(join(dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages }, null, 2));
  return dir;
}

describe('measureResolutionDrift — npm workspaces', () => {
  // A repository declaring its shipped front-end in a workspace and its server
  // at the root has two manifests. Reading only the root reported 34 of 47
  // declared dependencies for one real project and called it "34 checked" —
  // a clean subset presented as the whole, which is the failure this module
  // exists to detect, performed by the module.
  it('examines workspace manifests as well as the root', async () => {
    const dir = workspaceFixture({
      root: { name: 'server', workspaces: ['packages/ui'], dependencies: { fastify: '^5.0.0' } },
      workspaces: { 'packages/ui': { name: '@app/ui', dependencies: { react: '^19.0.0' } } },
      hoisted: { fastify: '5.0.0', react: '19.0.0' },
    });
    try {
      const r = await measureResolutionDrift(dir, {
        run: fakeNpm({ fastify: ['5.0.0'], react: ['19.0.0', '19.2.0'] }),
      });
      expect(r.examined).toBe(2);
      expect(r.workspaces).toEqual(['packages/ui']);
      expect(r.drifted.map((d) => d.name)).toEqual(['react']);
      // Which manifest to edit is part of the finding, not context.
      expect(r.drifted[0].workspaceDir).toBe('packages/ui');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('finds a lockfile entry nested under the workspace, not only the hoisted one', async () => {
    // npm hoists what it can and nests the rest. Checking `node_modules/<name>`
    // alone reports the nested ones as "not present in package-lock.json" —
    // a fabricated unknown, which reads as a finding and trains people to skim.
    const dir = workspaceFixture({
      root: { name: 'server', workspaces: ['packages/ui'], dependencies: {} },
      workspaces: { 'packages/ui': { name: '@app/ui', dependencies: { left: '^1.0.0' } } },
      nested: { 'packages/ui/node_modules/left': '1.0.0' },
    });
    try {
      const r = await measureResolutionDrift(dir, { run: fakeNpm({ left: ['1.0.0', '1.3.0'] }) });
      expect(r.unverifiable).toHaveLength(0);
      expect(r.drifted[0]).toMatchObject({ name: 'left', locked: '1.0.0', resolved: '1.3.0' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not query the registry for a sibling workspace', async () => {
    // `@app/ui` is a file link, not a published package. Asking npm about it
    // returns 404, which would be recorded as unverifiable — an unknown this
    // tool invented, which is worse than one it failed to resolve.
    const asked = [];
    const run = async (args) => {
      asked.push(args[1]);
      if (args.includes('versions')) {
        const table = { left: ['1.0.0'] };
        const entry = table[args[1]];
        if (!entry) return { code: 1, stdout: '', stderr: 'npm error code E404' };
        return { code: 0, stdout: JSON.stringify({ versions: entry }), stderr: '' };
      }
      return { code: 0, stdout: '{}', stderr: '' };
    };
    const dir = workspaceFixture({
      root: { name: 'server', workspaces: ['packages/ui'], dependencies: { '@app/ui': '^1.0.0', left: '^1.0.0' } },
      workspaces: { 'packages/ui': { name: '@app/ui', dependencies: {} } },
      hoisted: { left: '1.0.0' },
    });
    try {
      const r = await measureResolutionDrift(dir, { run });
      expect(asked).not.toContain('@app/ui');
      expect(r.examined).toBe(1);
      expect(r.unverifiable).toHaveLength(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports no workspaces rather than pretending there were none to look at', async () => {
    // `workspaces: []` and "this field is absent" are the same result here, but
    // the field is reported either way so a reader can tell the scope of the
    // count from the count itself.
    const dir = fixture({ name: 'plain', dependencies: { left: '^1.0.0' } }, { left: '1.0.0' });
    try {
      const r = await measureResolutionDrift(dir, { run: fakeNpm({ left: ['1.0.0'] }) });
      expect(r.workspaces).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('refuses a glob it does not fully understand instead of matching less', async () => {
    // A pattern that silently matches a subset puts workspaces outside the
    // denominator without saying so — the same defect in a new place.
    const dir = workspaceFixture({
      root: { name: 'server', workspaces: ['packages/*/lib'], dependencies: {} },
      workspaces: {},
    });
    try {
      await expect(measureResolutionDrift(dir, { run: fakeNpm({}) })).rejects.toThrow(/unsupported workspaces pattern/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('measureResolutionDrift', () => {
  // Measured on 2026-08-07: `@anthropic-ai/claude-agent-sdk` published
  // latest=0.3.223 and next=0.3.224, both plain semver, both satisfying ^0.3.
  // Taking the maximum satisfying version named 0.3.224; a real
  // `npm install …@^0.3` installs 0.3.223, because npm-pick-manifest prefers
  // the latest tag whenever it satisfies. The column exists to say what an
  // install receives, so reporting the higher number was not a near miss — it
  // was the one kind of wrong answer this module is built to catch, produced
  // by the module itself.
  it('prefers the latest dist-tag over a higher version published under another tag', async () => {
    const dir = fixture({ name: 'p', dependencies: { sdk: '^0.3' } }, { sdk: '0.3.143' });
    try {
      const r = await measureResolutionDrift(dir, {
        run: fakeNpm({
          sdk: { versions: ['0.3.143', '0.3.223', '0.3.224'], 'dist-tags': { latest: '0.3.223', next: '0.3.224' } },
        }),
      });
      expect(r.drifted).toHaveLength(1);
      expect(r.drifted[0].resolved).toBe('0.3.223');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('falls back to the highest satisfying version when latest is outside the range', async () => {
    // A project pinned to an older major still gets a truthful answer: latest
    // does not satisfy, so npm would take the maximum inside the range.
    const dir = fixture({ name: 'p', dependencies: { lib: '^1.0.0' } }, { lib: '1.0.0' });
    try {
      const r = await measureResolutionDrift(dir, {
        run: fakeNpm({
          lib: { versions: ['1.0.0', '1.4.2', '2.0.0'], 'dist-tags': { latest: '2.0.0' } },
        }),
      });
      expect(r.drifted).toHaveLength(1);
      expect(r.drifted[0].resolved).toBe('1.4.2');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

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
        // Resolution succeeds; only the manifest lookup fails, which is what
        // this test is about.
        if (args.includes('versions')) return { code: 0, stdout: JSON.stringify({ versions: ['1.0.0'] }), stderr: '' };
        return { code: 1, stdout: '', stderr: 'npm error E500' };
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

describe('the report does not assert a distribution channel it cannot know', () => {
  // The first version of this output said only "consumers resolve the range
  // themselves, because a published package does not ship a lockfile". That
  // is plainly false for a product distributed as a container image built
  // with `npm ci` — its users get the pinned column exactly. The standard
  // this command implements scopes itself to published artifacts; the command
  // did not. These assertions exist because nothing else held the wording in
  // place, so the narrower claim could come back without a single test going
  // red.
  const drifted = {
    packageName: 'demo',
    root: '/tmp/demo',
    examined: 2,
    hasLockfile: true,
    drifted: [{ name: 'left-pad', range: '^1.0.0', locked: '1.0.0', resolved: '1.3.0' }],
    unverifiable: [],
    unpinnedNative: [],
    consistent: 1,
    clean: false,
  };

  it('states the published-package reading', () => {
    const out = stripAnsi(render(drifted));
    expect(out).toMatch(/If you publish this package, that column reaches nobody/);
    expect(out).toMatch(/consumers resolve the ranges themselves/);
  });

  it('labels the third column neutrally, because "users get" is false for some channels', () => {
    const out = stripAnsi(render(drifted));
    expect(out).toMatch(/tested=1\.0\.0\s+resolves=1\.3\.0/);
    expect(out).not.toMatch(/users get=/);
  });

  it('states the ships-its-own-lockfile reading too', () => {
    const out = stripAnsi(render(drifted));
    expect(out).toMatch(/container image/);
    expect(out).toMatch(/next lockfile\s+regeneration pulls in/);
  });

  it('says nothing about consumers when there is no drift to explain', () => {
    const out = stripAnsi(render({ ...drifted, drifted: [], consistent: 2, clean: true }));
    expect(out).not.toMatch(/consumers resolve/);
  });

  // 6.3.2 fixed the explanation and the column label, then left the summary
  // heading above them reading `1 shipped ≠ tested`. For an artifact that
  // ships its own lockfile, shipped IS tested, so the heading said the
  // opposite of the truth — in yellow, one line above the dim correction.
  // The heading is the line a reader skims; the correction is the line they
  // skip. Naming the two columns keeps it a statement about the measurement
  // rather than a conclusion about who received it.
  it('heads the drift section with the two columns, not with who received them', () => {
    const out = stripAnsi(render(drifted));
    expect(out).toMatch(/1 tested ≠ resolves:/);
    expect(out).not.toMatch(/shipped ≠ tested/);
  });
});
