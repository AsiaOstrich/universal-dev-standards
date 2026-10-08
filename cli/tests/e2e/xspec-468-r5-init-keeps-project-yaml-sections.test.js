/**
 * E2E: when `uds init` rewrites the commands of an existing uds.project.yaml, every other section of the file
 * stays exactly as it was (dev-platform XSPEC-468 R5).
 *
 * The problem: the command-contract step of `uds init` asked "Overwrite existing uds.project.yaml?" and, on
 * yes, wrote the whole file again from the four command answers. `open_work:` (the place an adopter declares
 * what `uds open-work` needs, XSPEC-460/461), `custom:`, comments and anything else the wizard does not ask
 * about were gone, and the question did not say so.
 *
 * Every test spawns the real `uds init` in a throwaway project and types the answers a person would type
 * (the harness answers when the CLI has been quiet, i.e. is waiting for a key), then reads the file back.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/flows/init-flow.js   await promptProjectContractStep(projectPath);
 * Mutation done by hand (not a cut line), seen red: the merge call replaced by the old whole-file rewrite
 * (`generateProjectConfigYaml(commands)` for an existing file) - the byte-for-byte test goes red.
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness, stripAnsi } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec468-r5');
afterAll(() => h.cleanup());

/**
 * Text with the terminal codes and ALL whitespace removed. A question printed by the prompt library is wrapped
 * at the terminal width (even in the middle of a word) and redrawn with cursor codes, so a sentence is not
 * found as written; compared this way it is found wherever the wrap fell.
 */
const squash = (text) => stripAnsi(text).replace(/\s+/g, '');
const screenHas = (run, sentence) => squash(run.stdout).includes(squash(sentence));

const ORIGINAL = [
  'version: "1"',
  '',
  '# Declared for uds open-work. Do not reformat: the dates below are read by a person.',
  'open_work:',
  '  roots:',
  '    dev-platform: ../dev-platform   # sibling checkout',
  '    "vibeops":   ../vibeops',
  '  next_action_words:',
  '    - promote',
  '    - 下一步',
  '',
  'commands:',
  '  test: old-test   # replaced by the wizard',
  '  deploy: ./deploy.sh',
  '',
  'custom:',
  '  smoke: ./smoke.sh',
  ''
].join('\n');

/** The whole text from the first line of `open_work:` up to (not including) `commands:`. */
const openWorkBlock = (text) => text.slice(text.indexOf('# Declared for uds open-work'), text.indexOf('commands:'));
const customBlock = (text) => text.slice(text.indexOf('custom:'));

/**
 * What a person types: yes to the optional contract step, yes to updating the existing file (the default
 * answer is no), a test and a lint command, Enter (blank) for the rest. Every other prompt gets Enter.
 */
function typist(answers = {}) {
  const seen = new Set();
  return (screen) => {
    for (const [pattern, reply] of Object.entries(answers)) {
      // Each question is answered once: the screen of the next question starts after our reply.
      if (screen.includes(pattern) && !seen.has(pattern)) {
        seen.add(pattern);
        return reply;
      }
    }
    return '\r';
  };
}

async function initWithProjectYaml(text, answers) {
  const dir = h.makeDir('project-yaml');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  if (text !== null) writeFileSync(join(dir, 'uds.project.yaml'), text);
  const run = await h.runCli(['init'], dir, { drive: typist(answers), idleMs: 900 });
  return { dir, run, file: join(dir, 'uds.project.yaml') };
}

it('uds init that updates an existing uds.project.yaml writes the new commands and keeps the open_work section byte for byte (XSPEC-468 R5)', async () => {
  const { run, file } = await initWithProjectYaml(ORIGINAL, {
    'Update the commands': 'y\r',
    'test command': 'npm run my-test\r',
    'lint command': 'npm run my-lint\r'
  });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const after = readFileSync(file, 'utf-8');

  // The new commands are in.
  expect(after).toContain('  test: npm run my-test\n');
  expect(after).toContain('  lint: npm run my-lint\n');
  expect(after).not.toContain('old-test');
  // Everything the wizard does not ask about is exactly as it was: open_work with its comments and odd
  // spacing, a command the wizard has no question for, and the custom section.
  expect(openWorkBlock(after)).toBe(openWorkBlock(ORIGINAL));
  expect(after).toContain('  deploy: ./deploy.sh\n');
  expect(customBlock(after)).toBe(customBlock(ORIGINAL));
  expect(after.startsWith('version: "1"\n\n# Declared for uds open-work.')).toBe(true);
  expect(screenHas(run, 'uds.project.yaml updated (other sections kept as they were)'), run.stdout).toBe(true);
}, 180000);

it('uds init names the sections that stay before asking whether to update an existing uds.project.yaml, and the default answer is no (XSPEC-468 R5)', async () => {
  // Answer nothing special: every question gets Enter, so the default of the update question is what is read back.
  const { run, file } = await initWithProjectYaml(ORIGINAL, {});
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(screenHas(run, 'Update the commands (test, lint, build, security) in the existing uds.project.yaml?'), run.stdout).toBe(true);
  expect(screenHas(run, 'These sections are kept exactly as they are: version, open_work, custom.'), run.stdout).toBe(true);
  // Enter = no: the file is untouched.
  expect(readFileSync(file, 'utf-8')).toBe(ORIGINAL);
  expect(screenHas(run, 'Skipped — keeping existing uds.project.yaml'), run.stdout).toBe(true);
}, 180000);

it('uds init that updates a uds.project.yaml with no commands section adds one and keeps every other section byte for byte (XSPEC-468 R5)', async () => {
  const text = 'version: "1"\nopen_work:\n  roots:\n    a: ../a\n';
  const { run, file } = await initWithProjectYaml(text, {
    'Update the commands': 'y\r',
    'test command': 'make test\r'
  });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const after = readFileSync(file, 'utf-8');
  expect(after.startsWith(text)).toBe(true);
  expect(after).toContain('commands:\n  test: make test\n');
}, 180000);

it('uds init asks to replace the whole file, and says nothing can be kept, when uds.project.yaml is not readable YAML (XSPEC-468 R5)', async () => {
  const broken = 'version: "1"\nopen_work: [unclosed\n  roots: {\n';
  const { run, file } = await initWithProjectYaml(broken, {});
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(screenHas(run, 'The existing uds.project.yaml cannot be read as YAML, so none of its content can be kept. Replace the whole file?'), run.stdout).toBe(true);
  // Default answer no: the unreadable file is left as it is.
  expect(readFileSync(file, 'utf-8')).toBe(broken);
}, 180000);

it('uds init creates uds.project.yaml from the answers when there is none, as before (XSPEC-468 R5)', async () => {
  const { run, file } = await initWithProjectYaml(null, {
    'test command': 'make test\r'
  });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const after = readFileSync(file, 'utf-8');
  expect(after).toBe('version: "1"\n\ncommands:\n  test: make test\n');
  expect(screenHas(run, 'uds.project.yaml created'), run.stdout).toBe(true);
}, 180000);
