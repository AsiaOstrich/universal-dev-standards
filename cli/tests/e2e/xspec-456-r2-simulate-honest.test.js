/**
 * E2E: `uds simulate` gives an honest verdict and an honest exit code (dev-platform XSPEC-456 R2).
 *
 * The report: `uds simulate -s commit-message` piped the message into `npx commitlint`. In a project without a
 * commitlint config (a .NET project, no package.json) the tool refuses to run and the command printed
 * "Simulation Failed" for a compliant message and a non-compliant one alike; a standard with no simulator at
 * all printed the same words. Nothing had judged anything, and nothing said so.
 *
 * Every test spawns the real CLI in a throwaway project that has no package.json. The harness blocks the
 * network and logs every child process, so "did not call npx" and "did not touch the network" are read from
 * the logs, not assumed.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/utils/standard-validator.js   const outcome = judgeCommitMessage(standardConfig, input, ...);
 *
 * Exit codes: 0 the input complies, 1 it does not, 2 no verdict could be reached (not a pass).
 */

import { it, expect, afterAll } from 'vitest';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec456-r2');
afterAll(() => h.cleanup());

const fwd = (p) => p.replace(/\\/g, '/');
// `chcp 65001` is the CLI's own console setup on Windows; it is not what these tests are about.
const processes = (run) => run.procLog.filter((l) => !/chcp/.test(l));

it('uds simulate -s commit-message passes a compliant message and fails a non-compliant one in a project with no package.json, never calling npx or the network (XSPEC-456 R2)', async () => {
  const dir = await h.newProject();
  expect(existsSync(join(dir, 'package.json')), 'fixture: a project with no package.json').toBe(false);
  expect(existsSync(join(dir, 'commitlint.config.js')), 'fixture: no commitlint config').toBe(false);

  const good = await h.runCli(['simulate', '-s', 'commit-message', '-i', 'feat(api): add dept endpoint'], dir);
  expect(good.code, good.stdout + good.stderr).toBe(0);
  expect(good.stdout).toMatch(/Simulation Passed/);

  const bad = await h.runCli(['simulate', '-s', 'commit-message', '-i', 'add new dept api'], dir);
  expect(bad.code, bad.stdout + bad.stderr).toBe(1);
  expect(bad.stdout).toMatch(/does not comply/);
  expect(bad.stdout, 'it names what is wrong').toMatch(/<type>\(<scope>\): <subject>/);
  expect(bad.stdout, 'a verdict, not a refusal of a tool').not.toMatch(/commitlint|Cannot simulate/);

  // The rules of the standard are what decide, one by one.
  const cases = [
    ['feat(API): add dept endpoint', 1, /Scope "API" breaks rule scope-lowercase/],
    ['wat(api): add dept endpoint', 1, /Type "wat" is not one of/],
    [`fix(api): ${'x'.repeat(80)}`, 1, /breaks rule subject-max-length/],
    ['fix: handle null response', 0, /Simulation Passed/],
    ['feat(api)!: drop the v1 endpoint', 0, /Simulation Passed/]
  ];
  for (const [input, code, text] of cases) {
    const run = await h.runCli(['simulate', '-s', 'commit-message', '-i', input], dir);
    expect(run.code, `${input}\n${run.stdout}${run.stderr}`).toBe(code);
    expect(run.stdout, input).toMatch(text);
  }

  // --json carries the same verdict in a field, not only in the exit code.
  const json = await h.runCli(['simulate', '-s', 'commit-message', '-i', 'add new dept api', '--json'], dir);
  expect(json.code).toBe(1);
  expect(JSON.parse(json.stdout)).toMatchObject({ status: 'fail', success: false });
  const jsonOk = await h.runCli(['simulate', '-s', 'commit-message', '-i', 'feat(api): add dept endpoint', '--json'], dir);
  expect(jsonOk.code).toBe(0);
  expect(JSON.parse(jsonOk.stdout)).toMatchObject({ status: 'pass', success: true });

  // The runs above did not start npx (or anything), and did not try the network.
  for (const run of [good, bad, json, jsonOk]) {
    expect(processes(run), 'child processes started').toEqual([]);
    expect(run.netLog, 'network calls attempted').toEqual([]);
  }
});

it('uds simulate treats the message as data: quotes, $() and backticks in it run nothing and are judged as text (XSPEC-456 R2)', async () => {
  const dir = await h.newProject();
  const marker = join(dir, 'p');
  // Short on purpose: the subject line is limited to 72 characters and this test is about quoting, not length.
  const nasty = `feat(api): "d" $(node -e "require('fs').writeFileSync('p','x')") \`id\``;
  expect(nasty.length).toBeLessThanOrEqual(72);
  const run = await h.runCli(['simulate', '-s', 'commit-message', '-i', nasty], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(existsSync(marker), 'nothing in the message was executed').toBe(false);
  expect(processes(run)).toEqual([]);
});

it('uds simulate on a standard with no simulator exits 2 and says no verdict was reached, instead of a failure that exits 0 (XSPEC-456 R2)', async () => {
  const dir = await h.newProject();

  const run = await h.runCli(['simulate', '-s', 'testing', '-i', 'anything'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(2);
  expect(run.stdout).toMatch(/Cannot simulate: no verdict was reached/);
  expect(run.stdout).toMatch(/does not support simulation/);
  expect(run.stdout, 'it says what can be simulated').toMatch(/can be simulated in this project: commit-message\./);
  expect(run.stdout, 'not reported as a failed input').not.toMatch(/Simulation Failed/);

  const json = await h.runCli(['simulate', '-s', 'testing', '-i', 'anything', '--json'], dir);
  expect(json.code).toBe(2);
  expect(JSON.parse(json.stdout)).toMatchObject({ status: 'cannot-simulate', success: false });

  const missing = await h.runCli(['simulate', '-s', 'no-such-standard-456', '-i', 'anything'], dir);
  expect(missing.code, missing.stdout).toBe(2);
  expect(missing.stdout).toMatch(/not found/);
});

it('uds simulate with a delegated command passes the input as data and reports a tool that is not installed as cannot-simulate, not as a failed input (XSPEC-456 R2)', async (ctx) => {
  // The delegated path hands the input to the command through an environment variable reference. The
  // reference syntax differs on Windows (%VAR%), which this test does not cover: say so instead of passing.
  if (process.platform === 'win32') ctx.skip();

  const dir = await h.newProject();
  const probe = join(dir, 'probe.js');
  const out = join(dir, 'received.json');
  const marker = join(dir, 'pwned.txt');
  writeFileSync(probe, "require('fs').writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3))); process.exit(Number(process.env.PROBE_EXIT || 0));\n");
  const standard = (id, command) => writeFileSync(join(dir, '.standards', `${id}.ai.yaml`), yaml.dump({
    standard: { id },
    physical_spec: { type: 'custom_script', simulator: { type: 'command', command } }
  }));
  standard('echo-probe', `node "${fwd(probe)}" "${fwd(out)}" "{input}"`);
  standard('no-tool', 'uds-no-such-tool-456 "{input}"');

  const nasty = `say "hi" $HOME \`id\` $(node -e "require('fs').writeFileSync('${fwd(marker)}','x')") 'q' \\n done`;
  const run = await h.runCli(['simulate', '-s', 'echo-probe', '-i', nasty], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(JSON.parse(readFileSync(out, 'utf-8')), 'the program received the input byte for byte').toEqual([nasty]);
  expect(existsSync(marker), 'nothing in the input was executed').toBe(false);

  const gone = await h.runCli(['simulate', '-s', 'no-tool', '-i', 'x'], dir);
  expect(gone.code, gone.stdout + gone.stderr).toBe(2);
  expect(gone.stdout).toMatch(/Cannot simulate/);
  expect(gone.stdout).toMatch(/not usable here/);
  expect(gone.stdout).not.toMatch(/Simulation Failed/);
});

it('uds simulate --help names exactly the standards that define a simulator (XSPEC-456 R2)', async () => {
  // The description is written by hand; this is what keeps it from going stale. The truth is read from the
  // standards UDS ships, not from the CLI.
  const dir = h.makeDir('help');
  const standardsDir = join(REAL_REPO, 'ai', 'standards');
  const withSimulator = readdirSync(standardsDir)
    .filter((f) => f.endsWith('.ai.yaml'))
    .filter((f) => yaml.load(readFileSync(join(standardsDir, f), 'utf-8'))?.physical_spec?.simulator)
    .map((f) => yaml.load(readFileSync(join(standardsDir, f), 'utf-8')).standard.id)
    .sort();
  expect(withSimulator.length, 'at least one standard defines a simulator').toBeGreaterThan(0);

  const help = await h.runCli(['simulate', '--help'], dir);
  expect(help.code, help.stdout + help.stderr).toBe(0);
  const flat = help.stdout.replace(/\s+/g, ' ');
  const named = flat.match(/Only ([a-z0-9, -]+) define[s]? a simulator today/);
  expect(named, flat).toBeTruthy();
  expect(named[1].split(',').map((s) => s.trim()).sort()).toEqual(withSimulator);
  expect(flat).toMatch(/Exit 0 = passes, 1 = does not comply, 2 = no verdict/);
});
