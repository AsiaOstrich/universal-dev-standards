/**
 * E2E: `uds update --add-standard <id>` installs a standard the project lacks (dev-platform XSPEC-458 R3).
 *
 * The dangerous part is not copying the file. The reconciler treats a file under `.standards/` that the manifest
 * does not list as surplus and DELETES it, so an install that forgets the manifest is undone by the next
 * `--apply`. These tests therefore read back the file, the manifest, a second `--plan`, a second `--apply`, the
 * `uds check` verdict and the state after one `--rollback`.
 *
 * Every test spawns the real CLI in a throwaway project built from the manifest a real UDS 6.11.0 wrote
 * (tests/fixtures/upgrade-from-6.11.0).
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/src/commands/update.js   const request = resolveAddStandardRequest(manifest, addStandardIds);   (the ids are judged, then handed on)
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';
import { makeUpgradeProject, idsInAvailableSection, planCounts } from '../utils/xspec-458.js';

const h = createHarness('xspec458-r3');
afterAll(() => h.cleanup());

const MANIFEST = (dir) => join(dir, '.standards', 'manifest.json');
const readManifest = (dir) => JSON.parse(readFileSync(MANIFEST(dir), 'utf-8'));
const sha = (buf) => `sha256:${createHash('sha256').update(buf).digest('hex')}`;
const backups = (dir) => (existsSync(join(dir, '.uds-backups'))
  ? readdirSync(join(dir, '.uds-backups'), { withFileTypes: true }).filter((e) => e.isDirectory()).length
  : 0);
const listed = (m, id) => m.standards.some((s) => s === id || s.endsWith(`/${id}.ai.yaml`));

it('uds update --add-standard open-work-tracking: --plan adds one create and writes nothing; --apply installs the file and records it in the manifest; --plan is then clean, --apply keeps it, check passes; one --rollback removes it (XSPEC-458 R3)', async () => {
  const dir = makeUpgradeProject(h);
  const file = join(dir, '.standards', 'open-work-tracking.ai.yaml');
  const manifestBefore = readFileSync(MANIFEST(dir));

  // 1. The plan with the flag has exactly one more create than the plan without it, and writes nothing.
  const without = await h.runCli(['update', '--plan', '--offline'], dir);
  const withFlag = await h.runCli(['update', '--plan', '--offline', '--add-standard', 'open-work-tracking'], dir);
  expect(withFlag.code, withFlag.stdout + withFlag.stderr).toBe(0);
  const a = planCounts(without.stdout);
  const b = planCounts(withFlag.stdout);
  expect(b).toEqual({ ...a, Create: a.Create + 1 });
  expect(withFlag.stdout).toContain('+ .standards/open-work-tracking.ai.yaml');
  expect(withFlag.stdout, 'the hint names the same flag, so "apply exactly these changes" is true').toContain('uds update --apply --add-standard open-work-tracking');
  expect(idsInAvailableSection(withFlag.stdout), 'what was chosen is no longer "available"').not.toContain('open-work-tracking');
  expect(existsSync(file)).toBe(false);
  expect(readFileSync(MANIFEST(dir)).equals(manifestBefore), '--plan left the manifest byte for byte').toBe(true);

  // 2. --apply installs it and records it.
  const apply = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'open-work-tracking'], dir);
  expect(apply.code, apply.stdout + apply.stderr).toBe(0);
  expect(apply.stdout).toContain('Reconciliation complete');
  expect(existsSync(file), 'the file is there').toBe(true);
  expect(readFileSync(file).equals(readFileSync(join(REAL_REPO, 'ai', 'standards', 'open-work-tracking.ai.yaml'))), 'and is what UDS ships').toBe(true);
  const manifest = readManifest(dir);
  expect(listed(manifest, 'open-work-tracking'), 'manifest.standards lists it').toBe(true);
  expect(manifest.fileHashes['.standards/open-work-tracking.ai.yaml']?.hash, 'with the hash of the file on disk').toBe(sha(readFileSync(file)));
  expect(backups(dir), 'one backup was taken').toBe(1);

  // 3. Idempotent: a second plan has nothing to do, a second apply does not delete it, check agrees.
  const plan2 = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan2.stdout, 'second --plan is empty').toContain('No changes needed');
  expect(idsInAvailableSection(plan2.stdout)).toEqual([]);
  const apply2 = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply2.code, apply2.stdout + apply2.stderr).toBe(0);
  expect(existsSync(file), 'a later --apply without the flag does not treat it as surplus').toBe(true);
  const check = await h.runCli(['check', '--ci', '--offline'], dir);
  expect(check.code, check.stdout + check.stderr).toBe(0);
  expect(check.stdout).toContain('Project is compliant with standards');
  expect(check.stdout, 'and check counts the file as installed').toContain('Upstream standards not installed: none');

  // 4. One --rollback takes it out again: file gone, manifest as it was before the flag was used.
  const rollback = await h.runCli(['update', '--rollback', '--yes'], dir);
  expect(rollback.code, rollback.stdout + rollback.stderr).toBe(0);
  expect(rollback.stdout).toContain('Rollback successful');
  expect(existsSync(file), 'rollback removed the file').toBe(false);
  expect(readFileSync(MANIFEST(dir)).equals(manifestBefore), 'the manifest is back byte for byte as it was before --add-standard').toBe(true);
  const back = readManifest(dir);
  expect(listed(back, 'open-work-tracking'), 'and the manifest no longer lists it').toBe(false);
  const after = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(idsInAvailableSection(after.stdout), 'so it is available again').toContain('open-work-tracking');
});

it('uds update --apply --add-standard with a standard that is not in the manifest does not get deleted as surplus: the file survives the next --apply (XSPEC-458 R3)', async () => {
  // The failure this guards: install the file but forget the manifest. The next --apply would delete it.
  const dir = makeUpgradeProject(h);
  const file = join(dir, '.standards', 'open-work-tracking.ai.yaml');
  const first = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'open-work-tracking'], dir);
  expect(first.code, first.stdout + first.stderr).toBe(0);
  expect(existsSync(file)).toBe(true);
  // Make the plan large on purpose (age a file) so the second apply really runs the executor with deletes in view.
  const aged = join(dir, '.standards', 'checkin-standards.ai.yaml');
  writeFileSync(aged, '# older edition (XSPEC-458 R3 test)\n' + readFileSync(aged, 'utf-8'));
  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan.stdout, 'the plan never proposes to delete what was chosen').not.toMatch(/- .*open-work-tracking/);
  const second = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(second.code, second.stdout + second.stderr).toBe(0);
  expect(existsSync(file), 'still there after a plain --apply').toBe(true);
  expect(listed(readManifest(dir), 'open-work-tracking')).toBe(true);
});

it('uds update --add-standard refuses what it cannot install: an unknown id exits 1 and lists the closest ids, a language/locale entry is refused, and neither writes anything (XSPEC-458 R3)', async () => {
  const dir = makeUpgradeProject(h);
  const manifestBefore = readFileSync(MANIFEST(dir));

  const unknown = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'open-work-trackng'], dir);
  expect(unknown.code, 'a typo is an error, never ignored').toBe(1);
  expect(unknown.stdout).toContain('Unknown standard id "open-work-trackng"');
  expect(unknown.stdout, 'it names the id that was meant').toContain('open-work-tracking');

  const unknownWithGood = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'open-work-tracking', '--add-standard', 'no-such-standard'], dir);
  expect(unknownWithGood.code, 'one bad id stops the whole run').toBe(1);
  expect(existsSync(join(dir, '.standards', 'open-work-tracking.ai.yaml')), 'and the good one was not installed behind its back').toBe(false);

  const locale = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'zh-tw-locale'], dir);
  expect(locale.code).toBe(1);
  expect(locale.stdout).toMatch(/"zh-tw-locale" is a extension entry|"zh-tw-locale" is a .*extension.*entry/);

  const noMode = await h.runCli(['update', '--offline', '--add-standard', 'open-work-tracking'], dir);
  expect(noMode.code, '--add-standard without --plan/--apply would be taken and not used').toBe(1);
  expect(noMode.stdout).toContain('--add-standard needs --plan or --apply');

  expect(readFileSync(MANIFEST(dir)).equals(manifestBefore), 'nothing above wrote the manifest').toBe(true);
  expect(backups(dir), 'nor took a backup').toBe(0);
});

it('uds update --add-standard with an id that is already installed says so, changes nothing and exits 0 (XSPEC-458 R3)', async () => {
  const dir = makeUpgradeProject(h);
  const manifestBefore = readFileSync(MANIFEST(dir));
  const run = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'deferred-item-exit'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('"deferred-item-exit" is already installed');
  expect(run.stdout).toContain('Nothing was changed');
  expect(readFileSync(MANIFEST(dir)).equals(manifestBefore)).toBe(true);
  expect(backups(dir)).toBe(0);
});

it('uds update --apply --add-standard repeated, including a core standard that uds init never installs: both are installed and recorded, and one --rollback removes both (XSPEC-458 R3)', async () => {
  const dir = makeUpgradeProject(h);
  const ids = ['open-work-tracking', 'turn-completion-integrity']; // reference + core
  const files = ids.map((id) => join(dir, '.standards', `${id}.ai.yaml`));
  const args = ['update', '--apply', '--yes', '--offline', ...ids.flatMap((id) => ['--add-standard', id])];

  const apply = await h.runCli(args, dir);
  expect(apply.code, apply.stdout + apply.stderr).toBe(0);
  for (const f of files) expect(existsSync(f), f).toBe(true);
  const manifest = readManifest(dir);
  for (const id of ids) expect(listed(manifest, id), `${id} is in the manifest`).toBe(true);

  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan.stdout).toContain('No changes needed');
  const again = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(again.code).toBe(0);
  for (const f of files) expect(existsSync(f), `${f} survives a plain --apply`).toBe(true);

  const rollback = await h.runCli(['update', '--rollback', '--yes'], dir);
  expect(rollback.code, rollback.stdout + rollback.stderr).toBe(0);
  for (const f of files) expect(existsSync(f), `${f} is gone after one rollback`).toBe(false);
});

it('uds update --apply --add-standard for a standard that has option files installs the standard and the option files its manifest selects, as uds init does (XSPEC-458 R3)', async () => {
  // git-workflow has selectable options (workflow, merge strategy). Take it, and its option files, out of the
  // project; the manifest still selects github-flow / squash-merge, which is what init uses to choose the files.
  const dir = makeUpgradeProject(h);
  const m = readManifest(dir);
  expect(m.options.workflow, 'control: the manifest selects a workflow').toBeTruthy();
  m.standards = m.standards.filter((s) => !s.includes('git-workflow') && !s.includes('/options/git-workflow/'));
  for (const key of Object.keys(m.fileHashes)) {
    if (key.includes('git-workflow') || key.endsWith('/github-flow.ai.yaml') || key.endsWith('/squash-merge.ai.yaml')) delete m.fileHashes[key];
  }
  writeFileSync(MANIFEST(dir), JSON.stringify(m, null, 2));
  rmSync(join(dir, '.standards', 'git-workflow.ai.yaml'));
  rmSync(join(dir, '.standards', 'options', 'github-flow.ai.yaml'));
  rmSync(join(dir, '.standards', 'options', 'squash-merge.ai.yaml'));

  const listedBefore = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(idsInAvailableSection(listedBefore.stdout), 'control: git-workflow is now available').toContain('git-workflow');

  const apply = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'git-workflow'], dir);
  expect(apply.code, apply.stdout + apply.stderr).toBe(0);
  expect(existsSync(join(dir, '.standards', 'git-workflow.ai.yaml'))).toBe(true);
  expect(existsSync(join(dir, '.standards', 'options', 'github-flow.ai.yaml')), 'the selected workflow option file').toBe(true);
  expect(existsSync(join(dir, '.standards', 'options', 'squash-merge.ai.yaml')), 'the selected merge-strategy option file').toBe(true);
  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan.stdout).toContain('No changes needed');
});
