/**
 * E2E: the smaller findings of the beta.12 retests (dev-platform XSPEC-482 R9, R12, R13 and R14).
 *
 *   R9    `uds check --json` printed the human text unless `--standard` or `--i18n` came with it.
 *   R12   the Claude hook `validate-commit-msg.mjs` kept a fixed list of commit types (no `security`) while
 *         `uds simulate` reads the installed option files, so the two gave opposite verdicts on `security(auth): ...`.
 *   R13   `uds init --output-lang` took any word (`klingon`, `simplified-chinese`) and installed nothing for it; a
 *         Simplified Chinese project that chose bilingual commits got Traditional sentences in CLAUDE.md and
 *         "English + 繁體中文" as the instruction, and the prompts of the uds.project.yaml step stayed English.
 *   R14   (a) `release verify` said "git tag points to" and compared HEAD; (b) `uds release` printed Traditional
 *         Chinese in every language; (c) the MCP server had no `ping` and answered a failed tool with a JSON-RPC error;
 *         (e) `UDS_NO_UPDATE_CHECK=1` did not stop `uds check` from asking npm; (f) a terminal with no width left the
 *         spinner in an endless erase loop; (g) `uds audit --report` sent the report without showing it.
 *
 * Every test runs the real CLI in a throwaway project. Interactive prompts are typed by the harness (a pipe) or, where
 * a real terminal is the point (f, g), on a pseudo-terminal (tests/utils/pty-run.py).
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   R9   cli/src/commands/check.js                  await checkAsJson(options); // wire:check-json-prints-json
 *   R12  scripts/hooks/validate-commit-msg.mjs      export function allowedTypes(...)  (the hook reads the option files)
 *   R13  cli/src/commands/init.js                   if (!valid.includes(options.outputLang)) { // wire:init-validates-output-lang
 *        cli/src/utils/integration-generator.js     return [...].includes(display) ? display : fromOutput; // wire:integration-language-zh-cn
 *   R14  cli/src/mcp/server.js                      return { jsonrpc: '2.0', id, result: {} }; // wire:mcp-ping
 *        cli/src/mcp/server.js                      isError: true, // wire:mcp-tool-error-is-a-result
 *        cli/src/commands/check.js                  const offline = options.offline || ... // wire:check-honours-no-update-check
 *        cli/src/utils/spinner.js                   ... { isEnabled: false } : {}; // wire:spinner-off-without-width
 *        cli/src/commands/audit.js                  message: msg.confirmSend || ... // wire:audit-report-confirms
 */

import { it, expect, afterAll } from 'vitest';
import { spawn } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { generateReleaseConfig } from '../../src/utils/release-config.js';
import { createHarness } from '../utils/staged-cli-harness.js';
import { out, typist, DOWN, ENTER, gitEnv, runProgram, runInPty, ptyAvailable } from '../utils/xspec-482.js';

const h = createHarness('xspec482-small');
afterAll(() => h.cleanup());
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf-8');

// ── R9 ──────────────────────────────────────────────────────────────────────

it('uds check --json prints one JSON document and nothing else, with compliant true on a fresh project (XSPEC-482 R9)', async () => {
  const dir = await h.newProject();
  const run = await h.runCli(['check', '--json', '--offline'], dir);
  expect(run.code, out(run)).toBe(0);
  const doc = JSON.parse(run.stdout); // throws if anything but JSON was printed
  expect(doc).toMatchObject({ success: true, initialized: true, completed: true, compliant: true });
  expect(doc.files.unchanged).toBeGreaterThan(50);
  expect(doc.files.modified).toEqual([]);
}, 240000);

it('uds check --json names the edited file, and ends with 1 only under --ci, as the text mode does (XSPEC-482 R9)', async () => {
  const dir = await h.newProject();
  writeFileSync(join(dir, '.standards', 'testing.ai.yaml'), `${read(dir, '.standards/testing.ai.yaml')}\n# edited\n`);

  const plain = await h.runCli(['check', '--json', '--offline'], dir);
  const doc = JSON.parse(plain.stdout);
  expect(doc).toMatchObject({ success: false, compliant: false });
  expect(doc.files.modified).toEqual(['.standards/testing.ai.yaml']);
  expect(plain.code).toBe(0);

  const ci = await h.runCli(['check', '--json', '--offline', '--ci'], dir);
  expect(JSON.parse(ci.stdout).compliant).toBe(false);
  expect(ci.code).toBe(1);
}, 240000);

it('uds check --json in a folder that was never initialised still prints JSON, saying so (XSPEC-482 R9)', async () => {
  const dir = h.makeDir('bare');
  const run = await h.runCli(['check', '--json', '--offline'], dir);
  const doc = JSON.parse(run.stdout);
  expect(doc).toMatchObject({ success: false, initialized: false, completed: false });
}, 120000);

// ── R12 ─────────────────────────────────────────────────────────────────────

const MESSAGES = ['security(auth): rotate keys', 'feat(api): add endpoint', 'fix: handle null', 'feat!: drop the old flag', 'bogus(x): nothing', 'Feat: capital', 'chore(deps): bump'];

async function hookAndSimulateAgree(outputLang) {
  const dir = h.makeDir(`parity-${outputLang}`);
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project', '--with-hooks', '--output-lang', outputLang], dir);
  expect(init.code, out(init)).toBe(0);
  const hook = join(dir, 'scripts', 'hooks', 'validate-commit-msg.mjs');
  expect(existsSync(hook), 'fixture: the hook script is installed').toBe(true);
  const env = gitEnv(h.makeDir('hook-home'));

  const verdicts = [];
  for (const message of MESSAGES) {
    const sim = await h.runCli(['simulate', '-s', 'commit-message', '-i', message], dir);
    // Claude Code runs the hook with the project as its working directory and hands it the command as JSON.
    const payload = JSON.stringify({ tool_input: { command: `git commit -m "${message}"` } });
    const hookRun = runProgram(process.execPath, [hook], dir, env, { input: payload });
    verdicts.push({ message, simulate: sim.code === 0, hook: hookRun.code === 0 });
  }
  return verdicts;
}

for (const outputLang of ['english', 'traditional-chinese', 'bilingual']) {
  it(`the commit-message hook and uds simulate give the same verdict on every message under --output-lang ${outputLang}, including a security(...) one (XSPEC-482 R12)`, async () => {
    const verdicts = await hookAndSimulateAgree(outputLang);
    for (const v of verdicts) expect(v.hook, `${v.message}: hook ${v.hook} vs simulate ${v.simulate}`).toBe(v.simulate);
    // Control: the comparison is not trivially "everything passes" or "everything fails".
    expect(verdicts.some((v) => v.simulate)).toBe(true);
    expect(verdicts.some((v) => !v.simulate)).toBe(true);
    expect(verdicts.find((v) => v.message.startsWith('security')), 'security is a type of the shipped option files').toMatchObject({ simulate: true, hook: true });
  }, 300000);
}

// ── R13 ─────────────────────────────────────────────────────────────────────

it('uds init --output-lang with a value that has no option file exits 1, lists the values there are, and writes nothing (XSPEC-482 R13)', async () => {
  for (const bad of ['klingon', 'simplified-chinese']) {
    const dir = h.makeDir('badlang');
    const run = await h.runCli(['init', '--yes', '--output-lang', bad], dir);
    expect(run.code, out(run)).toBe(1);
    expect(out(run)).toContain(`Unsupported --output-lang "${bad}". Supported: english, traditional-chinese, bilingual.`);
    expect(existsSync(join(dir, '.standards')), `${bad}: nothing was installed`).toBe(false);
  }
  // Control: the three that exist are accepted.
  const dir = h.makeDir('goodlang');
  expect((await h.runCli(['init', '--yes', '--output-lang', 'bilingual', '--skills-location', 'project'], dir)).code).toBe(0);
}, 240000);

/** Characters whose Traditional form differs from the Simplified one - taken from the words of the index block and the directive. */
const TRADITIONAL_ONLY = /[這區塊標準規範檔選項專案讀內實請執錄對應務並與為個條說會讓設計還開關閉數據資訊類態處理動檢驗證許權限員戶網頁連結階統計後環變體簡擇覽預覆兩層驗須參節點寫從頭錯誤敗]/;

for (const file of ['CLAUDE.md', 'AGENTS.md']) {
  it(`interactive uds init in Simplified Chinese with bilingual commits writes ${file} without Traditional sentences and tells the AI "English + 简体中文" (XSPEC-482 R13)`, async () => {
    const dir = h.makeDir('zhcn-bilingual');
    mkdirSync(join(dir, '.claude'), { recursive: true });
    const answers = { 'Select display language': DOWN + DOWN + ENTER, '选择产出语言': DOWN + DOWN + ENTER };
    // the Simplified screens are answered once the first (English) question has switched the language
    const run = await h.runCli(['init'], dir, { ui: null, drive: typist(answers), idleMs: 900 });
    expect(run.code, out(run)).toBe(0);

    const text = read(dir, file);
    // CLAUDE.md carries the commit-language instruction; the universal AGENTS.md summary does not.
    if (file === 'CLAUDE.md') expect(text, 'the instruction names the language the user chose').toContain('英文 + 简体中文');
    expect(text).not.toContain('繁體中文');
    expect(text, 'the index disclosure is Simplified').toContain('这个区块是索引，不是标准本文');
    const traditional = text.split('\n').filter((l) => TRADITIONAL_ONLY.test(l));
    expect(traditional, `Traditional-only characters in ${file}`).toEqual([]);
    // The prompts of the uds.project.yaml step were asked in Simplified Chinese too.
    expect(out(run)).toContain('要创建 uds.project.yaml（项目命令契约）吗？');
    expect(out(run)).not.toContain('Create uds.project.yaml');
  }, 240000);
}

it('the same checks find Traditional sentences in a Traditional Chinese project (control: the character test is not blind)', async () => {
  const dir = h.makeDir('zhtw-control');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const run = await h.runCli(['init', '--yes', '--locale', 'zh-tw', '--output-lang', 'bilingual', '--skills-location', 'project'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(read(dir, 'CLAUDE.md').split('\n').filter((l) => TRADITIONAL_ONLY.test(l)).length).toBeGreaterThan(3);
  expect(read(dir, 'CLAUDE.md')).toContain('英文 + 繁體中文');
}, 240000);

it('uds update on a Simplified Chinese project keeps CLAUDE.md in Simplified Chinese instead of falling back to the bilingual heading (XSPEC-482 R13)', async () => {
  const dir = h.makeDir('zhcn-update');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  expect((await h.runCli(['init', '--yes', '--locale', 'zh-cn', '--output-lang', 'bilingual', '--skills-location', 'project'], dir)).code).toBe(0);
  const before = read(dir, 'CLAUDE.md');
  // Force a rewrite of the block from the manifest (the path `uds update` takes), then compare.
  writeFileSync(join(dir, 'CLAUDE.md'), before.replace(/<!-- UDS:STANDARDS:START -->[\s\S]*<!-- UDS:STANDARDS:END -->/, '<!-- UDS:STANDARDS:START -->\nold\n<!-- UDS:STANDARDS:END -->'));
  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  const after = read(dir, 'CLAUDE.md');
  expect(after).toContain('英文 + 简体中文');
  expect(after.split('\n').filter((l) => TRADITIONAL_ONLY.test(l))).toEqual([]);
}, 240000);

// ── R14 (a) and (b): uds release ────────────────────────────────────────────

function releaseProject() {
  const dir = h.makeDir('release');
  mkdirSync(join(dir, '.standards'), { recursive: true });
  writeFileSync(join(dir, '.standards', 'release-config.yaml'), yaml.dump(generateReleaseConfig('manual')));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'acme', version: '1.2.0-rc.1' }));
  return dir;
}

it('uds release verify names what the manifest commit was compared with: the current HEAD, not a tag (XSPEC-482 R14a)', async () => {
  const dir = releaseProject();
  expect((await h.runCli(['release', 'manifest'], dir)).code).toBe(0);
  const manifest = JSON.parse(read(dir, 'build-manifest.json'));
  manifest.commit = 'deadbee';
  writeFileSync(join(dir, 'build-manifest.json'), JSON.stringify(manifest));
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.code).toBe(1);
  expect(out(run)).toMatch(/commit mismatch: manifest has "deadbee", the current HEAD is "/);
  expect(out(run)).not.toContain('git tag points to');
}, 120000);

it('uds release prints English under --ui-lang en, Simplified Chinese under zh-cn, Traditional under zh-tw, and follows the project\'s display language when none is given (XSPEC-482 R14b)', async () => {
  const dir = releaseProject();
  const en = await h.runCli(['release', 'promote', '1.2.0'], dir, { ui: 'en' });
  expect(out(en)).toContain('This command records no promotion and creates no Git tag');
  expect(out(en)).not.toMatch(/[一-鿿]/);
  const cn = await h.runCli(['release', 'promote', '1.2.0'], dir, { ui: 'zh-cn' });
  expect(out(cn)).toContain('这个命令不会创建晋升记录，也不会创建 Git tag');
  const tw = await h.runCli(['release', 'promote', '1.2.0'], dir, { ui: 'zh-tw' });
  expect(out(tw)).toContain('這個指令不會建立晉升紀錄，也不會建立 Git tag');

  // No --ui-lang: the display language the project recorded decides.
  const project = h.makeDir('release-zhcn');
  expect((await h.runCli(['init', '--yes', '--locale', 'zh-cn', '--skills-location', 'project'], project)).code).toBe(0);
  mkdirSync(join(project, '.standards'), { recursive: true });
  writeFileSync(join(project, '.standards', 'release-config.yaml'), yaml.dump(generateReleaseConfig('manual')));
  writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'acme', version: '1.2.0-rc.1' }));
  const auto = await h.runCli(['release', 'promote', '1.2.0'], project, { ui: null });
  expect(out(auto)).toContain('这个命令不会创建晋升记录');
}, 240000);

// ── R14 (c): the MCP server ─────────────────────────────────────────────────

/** Start `uds mcp serve`, send each request as a line, close stdin, and return the parsed responses. */
function mcpSession(cwd, requests) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [h.cliPath(), 'mcp', 'serve'], { cwd, env: gitEnv(h.makeDir('mcp-home')), stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    const timer = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error(`mcp serve did not finish: ${stdout}`)); }, 60000);
    proc.on('close', () => {
      clearTimeout(timer);
      resolve(stdout.split('\n').filter(Boolean).map((l) => JSON.parse(l)));
    });
    for (const r of requests) proc.stdin.write(`${JSON.stringify(r)}\n`);
    proc.stdin.end();
  });
}

it('the MCP server answers ping with an empty result, and a tool that fails answers with an isError result carrying the reason, not a JSON-RPC error (XSPEC-482 R14c)', async () => {
  const dir = h.makeDir('mcp');
  const missing = join(dir, 'no-such-DESIGN.md');
  const responses = await mcpSession(dir, [
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} },
    { jsonrpc: '2.0', id: 2, method: 'ping' },
    { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'validate_design_token', arguments: { design_md_path: missing } } },
    { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_design_standards', arguments: {} } },
    { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'no_such_tool', arguments: {} } },
    { jsonrpc: '2.0', id: 6, method: 'does/not/exist' }
  ]);
  const byId = Object.fromEntries(responses.map((r) => [r.id, r]));
  expect(byId[2]).toEqual({ jsonrpc: '2.0', id: 2, result: {} });
  expect(byId[3].error, 'a failed tool is not a protocol error').toBeUndefined();
  expect(byId[3].result.isError).toBe(true);
  expect(byId[3].result.content[0].text).toContain('ENOENT');
  expect(byId[3].result.content[0].text).toContain('no-such-DESIGN.md');
  // Control: a tool that works carries no isError, and unknown methods and tools are still protocol errors.
  expect(byId[4].result.isError).toBeUndefined();
  expect(byId[4].result.content[0].text.length).toBeGreaterThan(100);
  expect(byId[5].error.code).toBe(-32601);
  expect(byId[6].error.code).toBe(-32601);
}, 120000);

// ── R14 (e): the update-check switch ────────────────────────────────────────

it('uds check with UDS_NO_UPDATE_CHECK=1 makes no network request and writes no ~/.uds/update-check.json; without it, it does ask npm (XSPEC-482 R14e)', async () => {
  const dir = await h.newProject();
  const quietHome = h.makeDir('quiet-home');
  const quiet = await h.runCli(['check'], dir, { env: { UDS_NO_UPDATE_CHECK: '1', HOME: quietHome, USERPROFILE: quietHome } });
  expect(quiet.code, out(quiet)).toBe(0);
  expect(quiet.netLog, 'no request to the registry').toEqual([]);
  expect(existsSync(join(quietHome, '.uds', 'update-check.json'))).toBe(false);

  // Control: the harness really would have seen a request (it blocks and logs the URL).
  const askingHome = h.makeDir('asking-home');
  const asking = await h.runCli(['check'], dir, { env: { UDS_NO_UPDATE_CHECK: '', HOME: askingHome, USERPROFILE: askingHome } });
  expect(asking.netLog.some((u) => /registry\.npmjs\.org/.test(u)), `requests: ${asking.netLog.join(', ')}`).toBe(true);
}, 240000);

// ── R14 (f): a terminal with no width ───────────────────────────────────────

it('a command that shows a spinner finishes on a terminal that reports a width of 0, and on a normal one (XSPEC-482 R14f)', async (ctx) => {
  if (!ptyAvailable()) ctx.skip(); // needs python3 and a POSIX pty
  const dir = await h.newProject();
  const env = { ...gitEnv(h.makeDir('pty-home')), FORCE_COLOR: '0' };
  const run = (cols) => runInPty({ cmd: [process.execPath, h.cliPath(), '--ui-lang', 'en', 'update', '--plan', '--offline'], cwd: dir, env, cols, rows: 24, timeout: 25 });

  const normal = run(80);
  expect(normal.timedOut, 'control: an 80-column terminal finishes').toBe(false);
  expect(normal.code).toBe(0);

  const noWidth = run(0);
  expect(noWidth.timedOut, 'a terminal of width 0 does not trap the spinner in its erase loop').toBe(false);
  expect(noWidth.code).toBe(0);
  expect(noWidth.out).toContain('No changes needed');
}, 120000);

// ── R14 (g): audit --report shows what it sends ─────────────────────────────

/** A project with one audit finding and a stand-in `gh` that records what it is asked to create. */
async function auditProject() {
  const dir = await h.newProject();
  writeFileSync(join(dir, '.standards', 'testing.ai.yaml'), `${read(dir, '.standards/testing.ai.yaml')}\n# edited\n`);
  const bin = h.makeDir('fake-bin');
  const log = join(bin, 'gh.log');
  const gh = join(bin, 'gh');
  writeFileSync(gh, `#!/bin/sh\necho "$@" >> "${log}"\ncase "$1 $2" in "auth status") exit 0;; esac\necho "https://example.invalid/issues/1"\n`);
  chmodSync(gh, 0o755);
  const env = { ...gitEnv(h.makeDir('audit-home')), PATH: `${bin}:${process.env.PATH}` };
  return { dir, log, env };
}
const askedGh = (log) => (existsSync(log) ? readFileSync(log, 'utf-8') : '');

it('uds audit --report shows the whole report and asks before sending it; "no" sends nothing, "yes" sends exactly the text it showed (XSPEC-482 R14g)', async (ctx) => {
  if (!ptyAvailable()) ctx.skip();
  const declined = await auditProject();
  const cmd = [process.execPath, h.cliPath(), '--ui-lang', 'en', 'audit', '--report'];
  const common = { cmd, cwd: declined.dir, env: declined.env, cols: 140, rows: 40, timeout: 40 };
  // checkbox: Enter keeps everything selected; comments: Enter leaves them empty; confirm: n
  const no = runInPty({ ...common, script: [
    { expect: 'Select findings to submit', send: '\r' },
    { expect: 'Additional comments', send: '\r' },
    { expect: 'Send this report as a public issue', send: 'n\r' }
  ] });
  expect(no.timedOut, no.out).toBe(false);
  expect(no.unanswered, `every prompt was reached: ${no.out}`).toEqual([]);
  expect(no.out).toContain('This is the report that will be sent:');
  expect(no.out).toContain('Title: [Audit]');
  expect(no.out).toContain('testing.ai.yaml');
  expect(no.out).toContain('Not sent. Nothing was submitted.');
  expect(askedGh(declined.log), 'gh was not asked to create anything').not.toContain('issue create');

  const accepted = await auditProject();
  const yes = runInPty({ ...common, cwd: accepted.dir, env: accepted.env, script: [
    { expect: 'Select findings to submit', send: '\r' },
    { expect: 'Additional comments', send: '\r' },
    { expect: 'Send this report as a public issue', send: 'y\r' }
  ] });
  expect(yes.timedOut, yes.out).toBe(false);
  expect(yes.out).toContain('Issue created: https://example.invalid/issues/1');
  const asked = askedGh(accepted.log);
  expect(asked, 'gh was asked to create the issue').toContain('issue create');
  expect(asked).toContain('--title [Audit]');
  // what was sent is what was shown: the body's first lines are on the screen before the question
  expect(yes.out.indexOf('UDS Audit Feedback')).toBeLessThan(yes.out.indexOf('Send this report as a public issue'));
}, 240000);

it('uds audit --report --yes still sends without asking (CI and scripts keep working) (XSPEC-482 R14g, control)', async (ctx) => {
  if (!ptyAvailable()) ctx.skip();
  const p = await auditProject();
  const run = runInPty({ cmd: [process.execPath, h.cliPath(), '--ui-lang', 'en', 'audit', '--report', '--yes'], cwd: p.dir, env: p.env, cols: 140, rows: 40, timeout: 40 });
  expect(run.timedOut, run.out).toBe(false);
  expect(run.out).not.toContain('Send this report as a public issue');
  expect(run.out).toContain('Issue created: https://example.invalid/issues/1');
  expect(askedGh(p.log)).toContain('issue create');
}, 120000);
