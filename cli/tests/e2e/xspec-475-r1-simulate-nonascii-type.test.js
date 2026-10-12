/**
 * E2E: `uds simulate -s commit-message` judges a Traditional Chinese commit message by the option file the
 * project installed (dev-platform XSPEC-475 R1, and the user's 2026-10-12 decision on its OQ1).
 *
 * The report (Windows, beta.9): under the traditional-chinese option the simulator failed EVERY message, even the
 * option file's own examples. The header pattern only accepted an ASCII type, while the option file's type list was
 * Chinese (新增, 修正, ...). The decision on OQ1 (甲): the traditional-chinese option now means an ENGLISH type with a
 * Traditional Chinese subject (`feat(user): 新增部門端點`), the same types as the english option; a Chinese type is
 * not allowed any more. R1 itself still holds, whatever a project's option files list: the judge reads any letters
 * as a type and then asks the option files, and the scope-lowercase rule applies only to letters that have a case.
 *
 * Every test runs the real CLI (`uds init`, `uds simulate`) in a throwaway project and reads back the exit code and
 * the printed verdict.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/utils/commit-message-judge.js   const HEADER = /^(?<type>\p{L}[\p{L}\p{N}-]*)...      (a non-ASCII type is read as a type)
 *   cli/src/utils/commit-message-judge.js   !scopeRule.test(withUncasedLettersAsLowercase(scope))  (a Chinese scope is not "not lowercase")
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync, existsSync, cpSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec475-r1');
afterAll(() => h.cleanup());

let template = null;
/** A project initialised with the traditional-chinese option (a real `uds init`), shared by the tests. */
function traditionalChineseProject() {
  if (!template) {
    template = (async () => {
      const dir = h.makeDir('tc-template');
      const init = await h.runCli(['init', '--yes', '--output-lang', 'traditional-chinese', '--skills-location', 'project'], dir);
      if (init.code !== 0) throw new Error(`fixture: uds init failed (${init.code}): ${init.stdout}\n${init.stderr}`);
      return dir;
    })();
  }
  return template.then((tpl) => {
    const dir = h.makeDir('tc-project');
    cpSync(tpl, dir, { recursive: true, verbatimSymlinks: true });
    return dir;
  });
}

const simulate = (dir, message) => h.runCli(['simulate', '-s', 'commit-message', '-i', message], dir);

it('uds simulate under the traditional-chinese option passes an English type with a Chinese subject and a Chinese scope, and every example the option file gives (XSPEC-475 R1)', async () => {
  const dir = await traditionalChineseProject();
  const optionFile = join(dir, '.standards', 'options', 'traditional-chinese.ai.yaml');
  expect(existsSync(optionFile), 'fixture: the init installed the traditional-chinese option file').toBe(true);
  const option = yaml.load(readFileSync(optionFile, 'utf-8'));
  expect(option.types.length, 'fixture: the option file lists types').toBeGreaterThan(5);

  // The messages from the decision of 2026-10-12.
  for (const message of ['feat(api): 新增部門端點', 'fix(認證): 修正登入逾時', 'feat(user-profile): 新增部門端點', 'fix: 處理空值回應']) {
    const run = await simulate(dir, message);
    expect(run.code, `${message}\n${run.stdout}${run.stderr}`).toBe(0);
    expect(run.stdout, message).toMatch(/Simulation Passed/);
  }

  // The option file's own examples, each one run through the CLI: none may be judged non-compliant.
  const examples = option.types.map((t) => t.example).filter(Boolean);
  expect(examples.length, 'fixture: the option file gives examples').toBeGreaterThan(5);
  for (const example of examples) {
    const run = await simulate(dir, example);
    expect(run.code, `the option file's own example "${example}"\n${run.stdout}${run.stderr}`).toBe(0);
  }
});

it('uds simulate under the traditional-chinese option fails a Chinese type and says the type must be English, and still enforces a lowercase scope where letters have a case (XSPEC-475 R1)', async () => {
  const dir = await traditionalChineseProject();

  const chineseType = await simulate(dir, '新增(認證): 加入 OAuth2 登入');
  expect(chineseType.code, chineseType.stdout + chineseType.stderr).toBe(1);
  expect(chineseType.stdout).toMatch(/Type "新增" is not one of: feat, fix/);
  expect(chineseType.stdout, 'it tells the person what to write instead').toMatch(/type must be an English word from that list/);
  expect(chineseType.stdout, 'a verdict about the type, not "the header is not in the form"').not.toMatch(/not in the form/);

  // A scope with a capital still breaks scope-lowercase, in English letters and in a mixed scope.
  for (const [message, scope] of [['feat(Auth): 加入登入', 'Auth'], ['feat(API-認證): 加入登入', 'API-認證']]) {
    const run = await simulate(dir, message);
    expect(run.code, `${message}\n${run.stdout}${run.stderr}`).toBe(1);
    expect(run.stdout, message).toContain(`Scope "${scope}" breaks rule scope-lowercase`);
  }
  // An empty scope is still refused.
  const empty = await simulate(dir, 'feat(): 加入登入');
  expect(empty.code, empty.stdout).toBe(1);
  expect(empty.stdout).toContain('breaks rule scope-lowercase');
});

it('uds simulate accepts a Chinese type that an installed option file allows, and the option file\'s own example for it (XSPEC-475 R1, whatever the option files list)', async () => {
  const dir = await traditionalChineseProject();
  const custom = {
    id: 'team-zh',
    meta: { parent: 'commit-message', version: '1.0.0' },
    types: [{ type: '新增', description: 'new feature', example: '新增(認證): 加入 OAuth2 登入' }]
  };
  writeFileSync(join(dir, '.standards', 'options', 'team-zh.ai.yaml'), yaml.dump(custom));

  const example = await simulate(dir, custom.types[0].example);
  expect(example.code, example.stdout + example.stderr).toBe(0);
  expect(example.stdout).toMatch(/Simulation Passed/);

  const json = await h.runCli(['simulate', '-s', 'commit-message', '-i', '新增: 加入 OAuth2 登入', '--json'], dir);
  expect(json.code, json.stdout).toBe(0);
  expect(JSON.parse(json.stdout)).toMatchObject({ status: 'pass', success: true });

  // A word the option files do not list is still refused, in any script.
  const unknown = await simulate(dir, '亂寫(認證): 加入 OAuth2 登入');
  expect(unknown.code, unknown.stdout).toBe(1);
  expect(unknown.stdout).toMatch(/Type "亂寫" is not one of/);
});
