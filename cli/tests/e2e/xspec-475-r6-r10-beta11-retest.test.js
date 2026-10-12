/**
 * E2E: what the beta.11 retest on Windows still found (dev-platform XSPEC-475 R6 to R10).
 *
 *   R6   one plain `uds update --apply` leaves the manifest's skills/commands version and names in step with the
 *        files it rewrote, so `uds check` stops calling them out of date (it used to need a second `--skills`).
 *   R7   `uds simulate -s commit-message` after a CLI upgrade and before `uds update --apply`: an installed option
 *        file older than the one the CLI ships no longer gives the opposite verdict silently.
 *   R8   `uds spec list` reads a status written on the same line as another field (`**規格**: … ｜ **狀態**: Draft`).
 *   R9   `uds update --plan`, `uds check` and `uds audit --friction` name the recommended core standards that are not
 *        installed, each with its install command; they are never installed by the old `uds update --yes` path.
 *   R10  secret-management-standards 1.1.0 points REQ-003 at PSG-1 to PSG-3 of pipeline-security-gates.
 *
 * Every test runs the real CLI in a throwaway project and reads files and printed lines back.
 *
 * Wires that make these red when cut (one line of source each):
 *   R6   cli/src/reconciler/plan-executor.js     recordInstalledSet(manifest, 'skills', installResult); // wire:apply-records-skills
 *        cli/src/reconciler/plan-executor.js     recordInstalledSet(manifest, 'commands', installResult); // wire:apply-records-commands (XSPEC-475 R6)
 *        cli/src/reconciler/plan-executor.js     alignRecordedVersions(updatedManifest); // wire:apply-aligns-versions
 *        cli/src/commands/update.js              const aligned = current ? alignRecordedVersions(current).changed : false; // wire:up-to-date-aligns-versions
 *   R7   cli/src/utils/standard-validator.js     const outcome = judgeCommitMessage(..., shippedRoot: getRepoRoot() }); // wire:simulate-shipped-root
 *        cli/src/utils/commit-message-judge.js   if (compareVersions(doc.meta.version, shipped?.meta?.version) < 0) { // [mutation-anchor:installed-option-older]
 *   R8   cli/src/utils/sdd-header.js             const inPiece = LINE_FIELD(name).exec(piece); // [mutation-anchor:same-line-fields]
 *        cli/src/commands/spec.js                ... .map((spec) => spec.status.length + 1)); // [mutation-anchor:status-width]
 *   R9   cli/src/utils/available-standards.js    const recommended = notOffered.filter((n) => n.addable && n.recommended); // [mutation-anchor:recommended-core]
 *   R10  ai/standards/secret-management-standards.ai.yaml   - pipeline-security-gates
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec475-r6-r10');
afterAll(() => h.cleanup());

const readManifest = (dir) => JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'));
const writeManifest = (dir, m) => writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(m, null, 2));
const out = (run) => `${run.stdout}${run.stderr}`;

async function initialised(args = ['init', '-y', '--skills-location', 'project', '--format', 'ai'], { before = () => {} } = {}) {
  const dir = h.makeDir('proj');
  before(dir);
  const run = await h.runCli(args, dir);
  expect(run.code, `fixture: init\n${out(run)}`).toBe(0);
  return dir;
}

// ── R6 ──────────────────────────────────────────────────────────────────────

it('uds update --apply run once leaves skills and commands recorded at the shipped version with every name, and uds check stops reporting them as out of date (XSPEC-475 R6)', async () => {
  // A Claude Code + Cursor project: skills in .claude/skills, slash commands in .cursor/commands.
  const dir = await initialised(undefined, { before: (d) => { mkdirSync(join(d, '.claude'), { recursive: true }); writeFileSync(join(d, '.cursorrules'), '# mine\n'); } });
  const fresh = readManifest(dir);
  const shipped = { skills: fresh.skills.version, commands: fresh.commands.version };
  expect(shipped.skills, 'fixture: init recorded a skills version').toBeTruthy();
  expect(fresh.commands.names.length, 'fixture: commands are installed').toBeGreaterThan(10);

  // Age it the way a 6.11.0 project looks: older recorded versions, one skill and one command gone from disk and from the records.
  const aged = readManifest(dir);
  aged.skills.version = '6.11.0';
  aged.commands.version = '6.11.0';
  aged.skills.names = aged.skills.names.filter((n) => n !== 'comprehension-ladder');
  aged.commands.names = aged.commands.names.filter((n) => n !== 'audit');
  for (const key of Object.keys(aged.skillHashes)) if (key.includes('/comprehension-ladder/')) delete aged.skillHashes[key];
  for (const key of Object.keys(aged.commandHashes)) if (key.endsWith('/audit.md')) delete aged.commandHashes[key];
  writeManifest(dir, aged);
  rmSync(join(dir, '.claude', 'skills', 'comprehension-ladder'), { recursive: true, force: true });
  rmSync(join(dir, '.cursor', 'commands', 'audit.md'), { force: true });

  const before = await h.runCli(['check'], dir);
  expect(out(before), 'control: before the apply, check reports the old version').toMatch(/Commands: v6\.11\.0/);

  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);

  // Read back: the files are there again, and the manifest says so.
  expect(existsSync(join(dir, '.claude', 'skills', 'comprehension-ladder', 'SKILL.md'))).toBe(true);
  expect(existsSync(join(dir, '.cursor', 'commands', 'audit.md'))).toBe(true);
  const after = readManifest(dir);
  expect(after.skills.version).toBe(shipped.skills);
  expect(after.commands.version).toBe(shipped.commands);
  expect(after.skills.names, 'the skill that was added back is named').toContain('comprehension-ladder');
  expect(after.commands.names, 'the command that was added back is named').toContain('audit');

  const check = await h.runCli(['check'], dir);
  expect(out(check), 'no second `--skills` needed').not.toMatch(/(Commands|Skills): v[\d.]+(-[\w.]+)? → v/);
});

it('uds update --apply on a project with nothing to rewrite says it is up to date and records the shipped skills version (XSPEC-475 R6)', async () => {
  const dir = await initialised(undefined, { before: (d) => mkdirSync(join(d, '.claude'), { recursive: true }) });
  // A fresh init still has integration-file blocks the first apply migrates; after it the project is current.
  expect((await h.runCli(['update', '--apply', '--yes', '--offline'], dir)).code).toBe(0);
  const fresh = readManifest(dir);
  const aged = readManifest(dir);
  aged.skills.version = '6.11.0';
  writeManifest(dir, aged);
  expect(readManifest(dir).skills.version, 'control: the record is old').toBe('6.11.0');

  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(apply.stdout).toContain('Everything is up to date');
  expect(readManifest(dir).skills.version).toBe(fresh.skills.version);
});

it('uds update --apply whose plan holds no skill or command file still records the shipped version for both, so check has nothing to report (XSPEC-475 R6)', async () => {
  // A Claude Code + Cursor project: the plan of a fresh one holds only integration-file blocks to migrate, no skill or command action.
  const dir = await initialised(undefined, { before: (d) => { mkdirSync(join(d, '.claude'), { recursive: true }); writeFileSync(join(d, '.cursorrules'), '# mine\n'); } });
  const fresh = readManifest(dir);
  const aged = readManifest(dir);
  aged.skills.version = '6.11.0';
  aged.commands.version = '6.11.0';
  writeManifest(dir, aged);
  expect(out(await h.runCli(['check'], dir)), 'control: check reports the old version').toMatch(/Commands: v6\.11\.0/);

  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(apply.stdout, 'fixture: the plan has no skill or command file action').not.toMatch(/\.cursor\/commands|\.claude\/skills/);
  const after = readManifest(dir);
  expect(after.skills.version).toBe(fresh.skills.version);
  expect(after.commands.version).toBe(fresh.commands.version);
  expect(out(await h.runCli(['check'], dir))).not.toMatch(/(Commands|Skills): v[\d.]+(-[\w.]+)? → v/);
});

// ── R7 ──────────────────────────────────────────────────────────────────────

/** The traditional-chinese option file as 6.14.0-beta.8 and earlier installed it: Chinese types, version 1.0.0. */
const OLD_OPTION = {
  id: 'traditional-chinese',
  meta: { parent: 'commit-message', version: '1.0.0' },
  types: ['新增', '修正', '重構', '文件', '樣式', '測試', '效能', '建置', '整合', '維護', '回退', '安全'].map((type) => ({ type, description: type }))
};

it('uds simulate with an installed option file older than the one the CLI ships judges by the current rules, says so and points at uds update --apply, and stops saying so after the update (XSPEC-475 R7)', async () => {
  const dir = await initialised(['init', '-y', '--output-lang', 'traditional-chinese', '--skills-location', 'none']);
  const optionFile = join(dir, '.standards', 'options', 'traditional-chinese.ai.yaml');
  writeFileSync(optionFile, yaml.dump(OLD_OPTION)); // the project as it is after a CLI upgrade and before `uds update --apply`

  const english = await h.runCli(['simulate', '-s', 'commit-message', '-i', 'feat(user): 新增部門端點'], dir);
  expect(english.code, out(english)).toBe(0);
  expect(english.stdout).not.toMatch(/Type "feat" is not one of/);
  expect(english.stdout).toContain('The installed option file "traditional-chinese" is version 1.0.0, older than the 2.0.0 this CLI ships');
  expect(english.stdout).toContain('Run `uds update --apply`');

  const chinese = await h.runCli(['simulate', '-s', 'commit-message', '-i', '新增(認證): 加入 OAuth2 登入'], dir);
  expect(chinese.code, out(chinese)).toBe(1);
  expect(chinese.stdout).toMatch(/Type "新增" is not one of: feat/);
  expect(chinese.stdout).toContain('Run `uds update --apply`');

  // The update brings the file up; from then on the verdict is the same and nothing is flagged.
  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(yaml.load(readFileSync(optionFile, 'utf-8')).meta.version).toBe('2.0.0');
  const again = await h.runCli(['simulate', '-s', 'commit-message', '-i', 'feat(user): 新增部門端點'], dir);
  expect(again.code, out(again)).toBe(0);
  expect(again.stdout).not.toContain('older than');
});

it('uds simulate keeps an installed option file that is as new as the shipped one, even when the team edited its types (XSPEC-475 R7)', async () => {
  const dir = await initialised(['init', '-y', '--output-lang', 'traditional-chinese', '--skills-location', 'none']);
  const optionFile = join(dir, '.standards', 'options', 'traditional-chinese.ai.yaml');
  const mine = yaml.load(readFileSync(optionFile, 'utf-8'));
  mine.types.push({ type: 'wip', description: 'work in progress', example: 'wip(api): 草稿' });
  writeFileSync(optionFile, yaml.dump(mine));

  const run = await h.runCli(['simulate', '-s', 'commit-message', '-i', 'wip(api): 草稿'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(run.stdout, 'same version: the installed file stands, nothing is flagged').not.toContain('older than');
});

// ── R8 ──────────────────────────────────────────────────────────────────────

it('uds spec list reads a status written on the same line as another field, with a full-width or half-width bar, and keeps the column width when a header cannot be read (XSPEC-475 R8)', async () => {
  const dir = h.makeDir('r8');
  mkdirSync(join(dir, 'specs'), { recursive: true });
  const specs = {
    'SPEC-002-acceptance-tests.md': '# [SPEC-002] 驗收測試\n\n> **規格**: SPEC-002 ｜ **狀態**: Draft（驗收中）\n> **建立日期**: 2026-10-12\n',
    'SPEC-003-halfwidth.md': '# 半形分隔\n\n**規格**: SPEC-003 | **狀態**: Approved\n',
    'SPEC-004-status-first.md': '# 狀態在前\n\n**狀態**: Archived ｜ **規格**: SPEC-004\n',
    'SPEC-005-english.md': '# Same line English\n\n- **Spec**: SPEC-005 | **Status**: Active\n',
    'SPEC-006-bare.md': '# 沒有表頭\n\n只有內文。\n'
  };
  for (const [name, text] of Object.entries(specs)) writeFileSync(join(dir, 'specs', name), text);

  const list = await h.runCli(['spec', 'list'], dir);
  expect(list.code, out(list)).toBe(0);
  const row = (id) => (list.stdout.split('\n').find((l) => l.startsWith(id)) || '').slice(35);
  expect(row('SPEC-002-acceptance-tests'), 'full-width bar').toMatch(/^draft\s/);
  expect(row('SPEC-003-halfwidth'), 'half-width bar').toMatch(/^approved\s/);
  expect(row('SPEC-004-status-first'), 'status before the other field').toMatch(/^archived\s/);
  expect(row('SPEC-005-english'), 'English names').toMatch(/^active\s/);
  expect(row('SPEC-006-bare'), 'unreadable: said so').toMatch(/^format: SDD \(status not parsed\)\s/);

  // The sentence for the one that could not be read does not widen the column of the others: status is 12 wide, type follows.
  expect(row('SPEC-002-acceptance-tests').startsWith(`${'draft'.padEnd(12)}-`), 'the Status column is still 12 wide').toBe(true);
  const rule = list.stdout.split('\n').find((l) => /^─+$/.test(l));
  expect(rule.length, 'and so is the rule under it').toBe(70);
});

// ── R9 ──────────────────────────────────────────────────────────────────────

it('uds update --plan, uds check and uds audit --friction name the recommended core standards that are not installed with their install command, and the old update path does not install them (XSPEC-475 R9)', async () => {
  const dir = await initialised(['init', '-y', '--skills-location', 'none']);
  expect(existsSync(join(dir, '.standards', 'pipeline-security-gates.ai.yaml')), 'fixture: not installed').toBe(false);

  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan.code, out(plan)).toBe(0);
  expect(plan.stdout).toContain('Recommended core standards, not installed (2)');
  for (const id of ['turn-completion-integrity', 'pipeline-security-gates']) {
    expect(plan.stdout, id).toContain(`uds update --apply --add-standard ${id}`);
  }
  expect(plan.stdout, 'the count line stays, as a total').toMatch(/Not listed above: 9\d more standard\(s\) in categories `uds init` never installs \(core \d+/);
  expect(plan.stdout.split('\n').filter((l) => /^\s+uds update --apply --add-standard /.test(l)).length, 'only the recommended ones are listed, not every core standard').toBe(2);

  const check = await h.runCli(['check'], dir);
  expect(check.stdout).toMatch(/2 recommended core standard\(s\) not installed \(turn-completion-integrity, pipeline-security-gates\)/);

  const friction = await h.runCli(['audit', '--friction'], dir);
  expect(friction.stdout).toContain('2 recommended core standard(s) not installed');
  expect(friction.stdout).toContain('uds update --apply --add-standard pipeline-security-gates');

  // Listing is not installing: the old path installs what `offered` holds and nothing else.
  const old = await h.runCli(['update', '--yes', '--offline'], dir);
  expect(old.code, out(old)).toBe(0);
  expect(existsSync(join(dir, '.standards', 'pipeline-security-gates.ai.yaml'))).toBe(false);
  expect(existsSync(join(dir, '.standards', 'turn-completion-integrity.ai.yaml'))).toBe(false);

  // The command it prints works, and the standard then leaves the list.
  const add = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'pipeline-security-gates'], dir);
  expect(add.code, out(add)).toBe(0);
  expect(existsSync(join(dir, '.standards', 'pipeline-security-gates.ai.yaml'))).toBe(true);
  const after = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(after.stdout).toContain('Recommended core standards, not installed (1)');
  expect(after.stdout).not.toContain('--add-standard pipeline-security-gates');
});

// ── R10 ─────────────────────────────────────────────────────────────────────

it('secret-management-standards installed with --add-standard is 1.1.0 and REQ-003 points at PSG-1 to PSG-3 of pipeline-security-gates (XSPEC-475 R10)', async () => {
  const dir = await initialised(['init', '-y', '--skills-location', 'none']);
  const add = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'secret-management-standards'], dir);
  expect(add.code, out(add)).toBe(0);

  const file = join(dir, '.standards', 'secret-management-standards.ai.yaml');
  expect(existsSync(file), readdirSync(join(dir, '.standards')).join(',')).toBe(true);
  const std = yaml.load(readFileSync(file, 'utf-8'));
  expect(std.version).toBe('1.1.0');
  const req3 = std.requirements?.find((r) => r.id === 'REQ-003') ?? Object.values(std).flat().find((r) => r && r.id === 'REQ-003');
  expect(req3, 'REQ-003 is in the installed standard').toBeTruthy();
  for (const rule of ['PSG-1', 'PSG-2', 'PSG-3', 'pipeline-security-gates']) {
    expect(req3.description, rule).toContain(rule);
  }
  expect(req3.references).toContain('pipeline-security-gates');
});
