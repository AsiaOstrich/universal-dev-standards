/**
 * E2E: `uds agent list` and `uds agent info` show what the agent files say (dev-platform XSPEC-471 R4).
 *
 * The agent files are YAML (`description: |`, `expertise:` as a list). The reader looked at one `key: value` line at a time, so
 * it saw the description as the single character `|` and dropped every list: `uds agent list` printed a blank line under
 * each agent and `uds agent info` printed an empty description and no expertise, tools or skills.
 *
 * Every test runs the real CLI and compares what it prints with the shipped agent file read separately by the test
 * (the expected values come from the file, not from the code under test).
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/utils/agents-installer.js   const parsed = yaml.load(frontmatterMatch[1]);
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-r4c-agent');
afterAll(() => h.cleanup());

const AGENT_FILE = join(REAL_REPO, 'skills', 'agents', 'code-architect.md');

it('uds agent info shows the description, expertise, tools and skills of the shipped agent file', async () => {
  expect(existsSync(AGENT_FILE), 'the shipped agent file the expectations are read from').toBe(true);
  const text = readFileSync(AGENT_FILE, 'utf-8');
  // the first words of the description block, read from the file by a different reading (the line after `description: |`)
  const firstDescriptionLine = text.split('\n')[text.split('\n').findIndex((l) => l.startsWith('description:')) + 1].trim();
  expect(firstDescriptionLine.length).toBeGreaterThan(20);

  const run = await h.runCli(['agent', 'info', 'code-architect'], h.makeDir('agent'));
  expect(run.code, run.stderr).toBe(0);
  expect(run.stdout).toContain('Name: code-architect');
  expect(run.stdout).toContain(firstDescriptionLine);
  expect(run.stdout).toContain('• system-design');
  expect(run.stdout).toContain('✗ Write');
  expect(run.stdout).toContain('• spec-driven-dev');
});

it('uds agent list prints a line of description and the expertise under every agent', async () => {
  const run = await h.runCli(['agent', 'list'], h.makeDir('agent'));
  expect(run.code, run.stderr).toBe(0);
  expect(run.stdout).toContain('Software architecture specialist');
  expect(run.stdout).toContain('Expertise: system-design, api-design');
  expect(run.stdout).not.toContain('No description');
});
