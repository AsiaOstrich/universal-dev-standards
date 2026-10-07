/**
 * E2E: `uds open-work waiting` and a release condition that names an object in another project
 * (dev-platform XSPEC-460 R1 and R2; open-work-tracking 1.3.0, OWT-027 and OWT-028).
 *
 * Projects that depend on each other (A's work waits for something B produces) had no place in the standard.
 * A release condition may now be `<project>:<object>`, where the project is a LOGICAL name (`uds`, `other`) and
 * the carrier holds no directory. Where a name lives on this machine is given outside the carrier, with
 * `--root NAME=DIR`. The check looks that object up on this machine (a path on disk, a version-control tag),
 * and says one of four things for each: released, not yet released, not visible from here, needs a person.
 * Not visible is its own count: it is not released and it is not zero.
 *
 * Each test spawns the real CLI in a throwaway directory next to real git repositories standing in for the
 * other projects, and reads back the counts, the lines and the exit code. It does not need the network, and
 * says so: the harness fails every network call and the test reads its log.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/open-work.js   const rootArgv = rootArguments(options.root, declared.projects); // wire:roots
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...files]); // wire:waiting
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { makeProject, git, WAITING_HEAD, waitsFor } from '../utils/xspec-460.js';

const h = createHarness('xspec460-r1r2');
afterAll(() => h.cleanup());

const run = (dir, files, extra = []) => h.runCli(['open-work', 'waiting', ...files, '--now', '2026-10-07', ...extra], dir);

it('uds open-work waiting reads other:v1.0.0 as released when the tag exists in the other project and as not yet released once the tag is gone, naming projects only by logical name (XSPEC-460 R4)', async () => {
  const dir = h.makeDir('r4-tag');
  const other = makeProject(dir, 'other', { tags: ['v1.0.0'] });
  const text = `# Worklog\n\n${WAITING_HEAD}${waitsFor('wait for other', 'other:v1.0.0')}`;
  writeFileSync(join(dir, 'worklog.md'), text);
  // the carrier names the project and the tag, and no directory of this machine
  expect(text).not.toContain(dir);
  expect(text).not.toMatch(/\/(?:Users|home|tmp|private|var)\//);

  const seen = await run(dir, ['worklog.md'], ['--root', `other=${other}`]);
  const out = seen.stdout + seen.stderr;
  expect(seen.code, out).toBe(0);
  expect(out).toMatch(/released=1 not-yet-released=0 not-visible-from-here=0 needs-a-person=0/);
  expect(out).toMatch(/RELEASED\s+other:v1\.0\.0 \(tag, machine-observable\)/);
  // where it was looked up is said once, in the same RESOLUTION wording next-action uses for its root (XSPEC-461 R6)
  expect(out).toContain(`RESOLUTION: project "other" is looked up under ${other} (from --root NAME=DIR or open_work.projects)`);
  expect(out.split('\n').filter((l) => l.includes(other)), 'the directory appears only on that line').toHaveLength(1);
  expect(seen.netLog, 'no network').toEqual([]);

  git(other, ['tag', '-d', 'v1.0.0']);
  const gone = await run(dir, ['worklog.md'], ['--root', `other=${other}`]);
  const out2 = gone.stdout + gone.stderr;
  expect(gone.code, out2).toBe(0);
  expect(out2).toMatch(/released=0 not-yet-released=1 not-visible-from-here=0 needs-a-person=0/);
  expect(out2).toMatch(/NOT YET RELEASED\s+other:v1\.0\.0/);
  expect(out2, 'no line says RELEASED for it any more').not.toMatch(/\[owt\]   RELEASED /);
});

it('uds open-work waiting reads other:docs/a.md as released when the path exists in the other project, and not yet released when it does not (XSPEC-460 R1)', async () => {
  const dir = h.makeDir('r1-path');
  const other = makeProject(dir, 'other', { files: { 'docs/a.md': '# a\n' } });
  writeFileSync(join(dir, 'w.md'), `${WAITING_HEAD}${waitsFor('wait a', 'other:docs/a.md')}${waitsFor('wait b', 'other:docs/b.md')}`);
  const r = await run(dir, ['w.md'], ['--root', `other=${other}`]);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  expect(out).toMatch(/released=1 not-yet-released=1 not-visible-from-here=0 needs-a-person=0/);
  expect(out).toMatch(/RELEASED\s+other:docs\/a\.md \(path, machine-observable\) w\.md table row \(line 3, row "wait a"\)/);
  expect(out).toMatch(/NOT YET RELEASED\s+other:docs\/b\.md \(path, machine-observable\) w\.md table row \(line 4, row "wait b"\)/);
  // the item that waits for another project is not asked "has this been asked yet": it waits for an event, not a reply
  expect(out).toMatch(/waiting-unspecified=0 [^\n]*waiting-cross-project=2/);
  expect(out).not.toMatch(/VIOLATION/);
});

it('uds open-work waiting counts a project this machine cannot see apart: not released, not not-yet-released, not zero, and still lists it with the reason (XSPEC-460 R2)', async () => {
  const dir = h.makeDir('r2-unseen');
  const notARepo = join(dir, 'plain');
  const other = makeProject(dir, 'other', { tags: ['v1.0.0'] });
  mkdirSync(notARepo, { recursive: true }); // a directory that exists but is not a git repository
  writeFileSync(join(dir, 'w.md'), `${WAITING_HEAD}`
    + waitsFor('wait stranger', 'stranger:v1.0.0')
    + waitsFor('wait gone', 'gone:v1.0.0')
    + waitsFor('wait plain', 'plain:v1.0.0')
    + waitsFor('wait other', 'other:v1.0.0'));
  const r = await run(dir, ['w.md'], ['--root', `other=${other}`, '--root', `gone=${join(dir, 'no-such-directory')}`, '--root', `plain=${notARepo}`]);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  expect(out).toMatch(/4 release condition\(s\) name an object in another project[^\n]*released=1 not-yet-released=0 not-visible-from-here=3 needs-a-person=0/);
  // each unseen one is listed on its own line, with why, and none is released
  expect(out).toMatch(/NOT VISIBLE FROM HERE stranger:v1\.0\.0[^\n]*no directory on this machine is declared for project "stranger"/);
  expect(out).toMatch(/NOT VISIBLE FROM HERE gone:v1\.0\.0[^\n]*the directory declared for project "gone" does not exist on this machine/);
  expect(out).toMatch(/NOT VISIBLE FROM HERE plain:v1\.0\.0[^\n]*cannot be read here \(not a git repository, or git failed\)/);
  expect(out.match(/\[owt\]   RELEASED /g)).toHaveLength(1);
  expect(out).toMatch(/NOT VISIBLE FROM HERE is counted apart: it is not released and it is not zero/);
  // seeing nothing is never a green pass for the item it could not see, and never an exit-1 violation either
  expect(out).not.toMatch(/VIOLATION/);
});

it('uds open-work waiting says a test name, a command or a requirement identifier in another project needs a person, counted apart and never released (XSPEC-460 R2)', async () => {
  const dir = h.makeDir('r2-person');
  const other = makeProject(dir, 'other');
  writeFileSync(join(dir, 'w.md'), `${WAITING_HEAD}`
    + waitsFor('wait spec', 'other:XSPEC-460')
    + waitsFor('wait cmd', 'other:`npm test`')
    + waitsFor('wait test', 'other:`tests/a.test.ts::passes`'));
  const r = await run(dir, ['w.md'], ['--root', `other=${other}`]);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  expect(out).toMatch(/released=0 not-yet-released=0 not-visible-from-here=0 needs-a-person=3/);
  expect(out).toMatch(/NEEDS A PERSON\s+other:XSPEC-460 \(id, needs a person\)/);
  expect(out).toMatch(/NEEDS A PERSON\s+other:npm test \(command, needs a person\)/);
  expect(out).toMatch(/NEEDS A PERSON\s+other:tests\/a\.test\.ts::passes \(test, needs a person\)/);
  expect(out, 'no line says RELEASED').not.toMatch(/\[owt\]   RELEASED /);
});

it('uds open-work waiting rejects a release condition that holds a machine-specific absolute path or leaves the other project, exits 1 for it, and passes the same row written with a logical name (XSPEC-460 R1)', async () => {
  const dir = h.makeDir('r1-abs');
  const other = makeProject(dir, 'other', { files: { 'docs/a.md': '# a\n' } });
  writeFileSync(join(dir, 'bad.md'), `${WAITING_HEAD}`
    + waitsFor('posix home', '/Users/someone/work/other/docs/a.md')
    + waitsFor('windows drive', 'C:\\work\\other\\docs\\a.md')
    + waitsFor('tilde', '~/work/other/docs/a.md')
    + waitsFor('named but absolute', 'other:/Users/someone/work/other/docs/a.md')
    + waitsFor('leaves the project', 'other:../elsewhere/a.md'));
  const bad = await run(dir, ['bad.md'], ['--root', `other=${other}`]);
  const out = bad.stdout + bad.stderr;
  expect(bad.code, out).toBe(1);
  expect(out.match(/VIOLATION OWT-027/g)).toHaveLength(5);
  expect(out).toMatch(/VIOLATION OWT-027: bad\.md table row \(line 3, row "posix home"\) names a machine-specific absolute path/);
  expect(out).toMatch(/VIOLATION OWT-027: bad\.md table row \(line 4, row "windows drive"\)/);
  expect(out).toMatch(/VIOLATION OWT-027: bad\.md table row \(line 6, row "named but absolute"\)/);
  expect(out).toMatch(/VIOLATION OWT-027: bad\.md table row \(line 7, row "leaves the project"\) names "other:\.\.\/elsewhere\/a\.md", a path that leaves project "other"/);

  writeFileSync(join(dir, 'good.md'), `${WAITING_HEAD}${waitsFor('logical', 'other:docs/a.md')}`);
  const good = await run(dir, ['good.md'], ['--root', `other=${other}`]);
  expect(good.code, good.stdout + good.stderr).toBe(0);
  expect(good.stdout).not.toMatch(/VIOLATION/);
});

it('uds open-work waiting does not read a URL, a time or a plain sentence as a project, and leaves a waiting item that names none exactly as it was (XSPEC-460 R1)', async () => {
  const dir = h.makeDir('r1-lookalike');
  writeFileSync(join(dir, 'w.md'), `${WAITING_HEAD}`
    + waitsFor('url', 'see https://example.com/status and mailto:a@b.example')
    + waitsFor('sentence', 'the legal reply arrives; notes: later')
    + waitsFor('asked', 'the quote is attached', 'waiting'));
  const r = await run(dir, ['w.md']);
  const out = r.stdout + r.stderr;
  // no cross-project line at all, and the three plain waiting items are still named by OWT-020 as before
  expect(out).not.toMatch(/OWT-027\/028/);
  expect(out.match(/VIOLATION OWT-020/g)).toHaveLength(3);
  expect(r.code).toBe(1);
});
