/**
 * E2E: four small faults from the Windows consumer report on beta.9 (dev-platform XSPEC-475 R5).
 *
 *   (a) `uds spec list` reads a Chinese status field: `| 狀態 | Approved |` and `> **狀態**: Draft`.
 *   (b) `uds open-work next-action` reads a slash command (`/work`) as a command, not as the absolute path `/work`.
 *   (c) `uds run` warns, in a dry run and before a real run, when YAML cut a command short inside a quote at a space and `#`
 *       (a genuine trailing comment is not reported, and the dropped text is never printed).
 *   (d) `uds uninstall` removes the `.claude/` folder it leaves empty, and keeps one that holds anything else.
 *
 * Every test runs the real CLI in a throwaway project and reads the printed table, counts, command, files or folders back.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   (a) cli/src/utils/sdd-header.js              return { title, status: read('Status|狀態'), type: read('Type|類型') };
 *   (b) cli/src/utils/open-work-tracking.mjs     if (SLASH_COMMAND.test(t)) return null; // [mutation-anchor:slash-command-not-path]
 *   (c) cli/src/commands/run-intent.js           const cutLine = resolved.source === 'uds.project.yaml' ? truncatedYamlValueLine(...) : null; // wire:run-truncated-value
 *       cli/src/core/project-config.js           return endsInsideQuote(command) ? n + 1 : null; // [mutation-anchor:cut-inside-quote]
 *   (d) cli/src/uninstallers/skills-uninstaller.js   if (gone && !isUserLevel) removeEmptyParentInside(dir, projectPath);
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec475-r5');
afterAll(() => h.cleanup());

const fwd = (p) => p.replace(/\\/g, '/');
/** The row of `uds spec list` for one spec id: the text after the id. */
const rowOf = (stdout, id) => (stdout.split('\n').find((l) => l.startsWith(id)) || '').slice(id.length).trim();

// ── (a) spec list ───────────────────────────────────────────────────────────

it('uds spec list reads the status of a spec that writes it in Chinese, as a header table row and as a bold field line (XSPEC-475 R5a)', async () => {
  const dir = h.makeDir('r5a');
  mkdirSync(join(dir, 'specs'), { recursive: true });
  const specs = {
    'SPEC-010-table.md': ['# 部門介面規格', '', '| 欄位 | 值 |', '|------|----|', '| 狀態 | Approved (2026-10-12) |', '| 作者 | 某人 |', '', '## 概述', '', '內文。', ''].join('\n'),
    'SPEC-011-bold.md': ['# [SPEC-011] 登入規格', '', '> **狀態**: Draft（2026-10-12 建立）', '> **建立日期**: 2026-10-12', ''].join('\n'),
    'SPEC-012-bullet.md': '# 清單規格\n\n- **狀態**: Archived\n- **類型**: Feature\n',
    // Nothing in the header says a status: still reported as not parsed, never as a default.
    'SPEC-013-bare.md': '# 沒有表頭\n\n只有內文。\n'
  };
  for (const [name, text] of Object.entries(specs)) writeFileSync(join(dir, 'specs', name), text);

  const list = await h.runCli(['spec', 'list'], dir);
  expect(list.code, list.stdout + list.stderr).toBe(0);
  expect(rowOf(list.stdout, 'SPEC-010-table')).toMatch(/^approved\s+-\s+部門介面規格/);
  expect(rowOf(list.stdout, 'SPEC-011-bold')).toMatch(/^draft\s+-\s+\[SPEC-011\] 登入規格/);
  expect(rowOf(list.stdout, 'SPEC-012-bullet')).toMatch(/^archived\s+feature\s+清單規格/);
  expect(rowOf(list.stdout, 'SPEC-013-bare')).toMatch(/^format: SDD \(status not parsed\)\s+-\s+沒有表頭/);

  // The column is not stretched for specs that were read: only the bare one says "not parsed".
  expect(list.stdout.split('\n').filter((l) => l.includes('status not parsed')).length).toBe(1);

  // The status is usable as a filter, which reads it the same way.
  const drafts = await h.runCli(['spec', 'list', '--status', 'draft'], dir);
  expect(drafts.code, drafts.stdout + drafts.stderr).toBe(0);
  expect(drafts.stdout).toContain('SPEC-011-bold');
  expect(drafts.stdout).not.toContain('SPEC-010-table');
});

// ── (b) next-action reads a slash command ───────────────────────────────────

it('uds open-work next-action counts /work as a named command that is never looked up, not as a missing path (XSPEC-475 R5b)', async () => {
  const dir = h.makeDir('r5b');
  const carrier = [
    '| 事項 | 下一步 |',
    '|---|---|',
    '| 看全部工作 | `/work` |',
    '| 看全部工作 2 | 呼叫 /work 看清單 |',
    '| 做規格 | `/sdd create login` |',
    ''
  ].join('\n');
  writeFileSync(join(dir, 'w.md'), carrier);

  const run = await h.runCli(['open-work', 'next-action', 'w.md', '--root', dir], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toMatch(/named-resolved=0 named-unresolved=3 unnamed=0/);
  expect(run.stdout, 'a command is never looked up, so none of them is a missing path').toMatch(/path-missing=0 not-resolvable=3/);

  // Control: a path that really is a path is still looked up, and reported missing when it is not there.
  writeFileSync(join(dir, 'p.md'), '| 事項 | 下一步 |\n|---|---|\n| 改檔 | 編輯 `scripts/not-there.mjs` |\n');
  const path = await h.runCli(['open-work', 'next-action', 'p.md', '--root', dir], dir);
  expect(path.stdout).toMatch(/path-missing=1 not-resolvable=0/);
});

// ── (c) run warns about a YAML comment that dropped text ────────────────────

/** A project whose uds.project.yaml has the given `commands:` lines, plus a probe that records its arguments. */
function runProject(commandLines) {
  const dir = h.makeDir('r5c');
  const probe = join(dir, 'probe.js');
  const out = join(dir, 'received.json');
  writeFileSync(probe, "require('fs').writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)));\n");
  const lines = commandLines.map((l) => l.replaceAll('<probe>', fwd(probe)).replaceAll('<out>', fwd(out)));
  writeFileSync(join(dir, 'uds.project.yaml'), ['version: "1"', 'commands:', ...lines.map((l) => '  ' + l), ''].join('\n'));
  return { dir, out };
}

it('uds run --dry-run and uds run warn, before anything runs, that YAML cut an unquoted command short inside a quote at a space and #, without printing the dropped text (XSPEC-475 R5c)', async () => {
  // The case of the report: valid YAML that ends at `node ... "quoted`, where the shell would have kept the `#`.
  const { dir, out } = runProject(['build: node "<probe>" "<out>" "quoted # kept"']);

  const dry = await h.runCli(['run', 'build', '--dry-run'], dir);
  expect(dry.code, dry.stdout + dry.stderr).toBe(0);
  expect(dry.stdout).toContain('uds.project.yaml 第 3 行：build 的值在「空白加 #」處被 YAML 截斷，留下的指令引號不成對');
  expect(dry.stdout, 'it says what to do about it').toContain('請用引號包住整個值');
  expect(dry.stdout, 'the dropped text is not repeated').not.toContain('kept');
  expect(dry.stdout.indexOf('被 YAML 截斷'), 'the warning comes before the dry-run notice').toBeLessThan(dry.stdout.indexOf('dry-run mode'));
  expect(existsSync(out), 'a dry run runs nothing').toBe(false);

  const real = await h.runCli(['run', 'build'], dir);
  // The real run warns too, and the warning comes after the command shown and before anything the command prints.
  expect(real.stdout, 'the real run warns too').toContain('被 YAML 截斷，留下的指令引號不成對');
  expect(real.stdout.indexOf('被 YAML 截斷'), 'after the command line').toBeGreaterThan(real.stdout.indexOf('$ node'));
});

it('uds run --dry-run and uds run do not warn about a genuine trailing comment, and the comment text appears nowhere in the output (XSPEC-475 R5c)', async () => {
  // The case of the beta.6 acceptance step beta6-run-dry-run: a comment after a complete command is supported.
  const { dir, out } = runProject(['test: node "<probe>" "<out>" Tests.csproj  # 90 tests pass']);

  const dry = await h.runCli(['run', 'test', '--dry-run'], dir);
  expect(dry.code, dry.stdout + dry.stderr).toBe(0);
  expect(dry.stdout).toContain('Tests.csproj');
  expect(dry.stdout, 'no warning for a comment').not.toContain('被 YAML 截斷');
  expect(dry.stdout, 'the comment text is not printed').not.toContain('90 tests pass');

  const real = await h.runCli(['run', 'test'], dir);
  expect(real.code, real.stdout + real.stderr).toBe(0);
  expect(real.stdout).not.toContain('被 YAML 截斷');
  expect(real.stdout).not.toContain('90 tests pass');
  expect(JSON.parse(readFileSync(out, 'utf-8')), 'the command that ran is the one without the comment').toEqual(['Tests.csproj']);
});

it('uds run says nothing when the value is quoted in YAML or has no space before the # (XSPEC-475 R5c)', async () => {
  const { dir, out } = runProject([
    `lint: 'node "<probe>" "<out>" "issue #12 fixed"'`,
    'test: node "<probe>" "<out>" a#b'
  ]);
  for (const intent of ['lint', 'test']) {
    const run = await h.runCli(['run', intent], dir);
    expect(run.code, `${intent}\n${run.stdout}${run.stderr}`).toBe(0);
    expect(run.stdout, intent).not.toContain('被 YAML 截斷');
  }
  expect(JSON.parse(readFileSync(out, 'utf-8'))).toEqual(['a#b']);
});

// ── (d) uninstall leaves no empty .claude/ ──────────────────────────────────

it('uds uninstall removes the .claude/ folder it leaves empty, and keeps one that holds something else (XSPEC-475 R5d)', async () => {
  const bare = h.makeDir('r5d');
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project'], bare);
  expect(init.code, init.stdout + init.stderr).toBe(0);
  expect(existsSync(join(bare, '.claude', 'skills')), 'fixture: init put the skills under .claude/').toBe(true);

  const un = await h.runCli(['uninstall', '--yes'], bare);
  expect(un.code, un.stdout + un.stderr).toBe(0);
  expect(existsSync(join(bare, '.claude', 'skills')), 'control: the skills are gone').toBe(false);
  expect(existsSync(join(bare, '.claude')), 'no empty .claude/ is left').toBe(false);

  // A .claude/ that holds the person's own file stays, with the file.
  const used = h.makeDir('r5d-used');
  const init2 = await h.runCli(['init', '--yes', '--skills-location', 'project'], used);
  expect(init2.code, init2.stdout + init2.stderr).toBe(0);
  writeFileSync(join(used, '.claude', 'settings.local.json'), '{"mine": true}\n');
  const un2 = await h.runCli(['uninstall', '--yes'], used);
  expect(un2.code, un2.stdout + un2.stderr).toBe(0);
  expect(readdirSync(join(used, '.claude')), 'only the person\'s own file is left in it').toEqual(['settings.local.json']);
  expect(readFileSync(join(used, '.claude', 'settings.local.json'), 'utf-8')).toBe('{"mine": true}\n');
});
