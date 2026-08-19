/**
 * Quickstart Command - Interactive workflow guide
 *
 * Reduces cognitive load by guiding users to common workflow paths.
 *
 * ⚠️ Every `cmd` that starts with `uds ` MUST be a command this CLI actually
 * registers, with flags it actually accepts. This is the one place whose entire
 * job is "find the right commands quickly", so a wrong entry here does the exact
 * opposite of what the command exists for.
 *
 * 2026-08-19: four entries pointed at things that do not exist — `uds lint`
 * (twice), `uds sync` (twice, one of them the sole content of a whole
 * workflow), `uds check --spec-size`, and `uds spec create --boost`. Verify with
 * `uds <cmd> --definitely-not-a-real-flag` and look for "unknown command";
 * `uds <cmd> --help` is NOT a valid check — commander prints the general help
 * for an unknown command instead of erroring, so --help reports every name as
 * valid.
 *
 * @module commands/quickstart
 */

import chalk from 'chalk';
import { select } from '@inquirer/prompts';

export const WORKFLOWS = [
  {
    name: 'Quick Spec → Implement (Micro-Spec)',
    description: 'Lightweight spec for simple features/fixes',
    steps: [
      { cmd: 'uds spec create "your feature"', desc: 'Create micro-spec from intent' },
      { cmd: 'uds spec confirm SPEC-XXX', desc: 'Confirm spec for implementation' },
      { cmd: '# Implement in your editor', desc: 'Write code following the spec' },
      { cmd: 'uds spec archive SPEC-XXX', desc: 'Archive completed spec' },
    ],
  },
  {
    name: 'Full SDD Spec Flow (Boost)',
    description: 'Complete spec-driven development for complex features',
    steps: [
      { cmd: '# Use the /sdd skill', desc: 'Full spec lifecycle with review (see `uds spec --help`)' },
      { cmd: 'uds spec create "your feature" --scope fullstack', desc: 'Create the spec, scoped' },
      { cmd: 'uds spec confirm SPEC-XXX', desc: 'Confirm after review' },
      { cmd: '# Implement with /derive → /tdd', desc: 'Use forward derivation and TDD' },
    ],
  },
  {
    name: 'Test-Driven Development (TDD)',
    description: 'Red-Green-Refactor cycle',
    steps: [
      { cmd: '# Drive TDD with the /tdd skill', desc: 'Red-Green-Refactor from your AI assistant' },
      { cmd: '# Write failing test (RED)', desc: 'Define expected behavior' },
      { cmd: '# Make it pass (GREEN)', desc: 'Minimal implementation' },
      { cmd: '# Improve (REFACTOR)', desc: 'Clean up without breaking tests' },
    ],
  },
  {
    name: 'Check Project Health',
    description: 'Audit standards compliance and spec quality',
    steps: [
      { cmd: 'uds check', desc: 'Check standards file integrity' },
      { cmd: 'uds check --i18n', desc: 'Run i18n lint rules across canonical + locale variants' },
      { cmd: 'uds audit', desc: 'Deep health diagnosis' },
    ],
  },
];

/**
 * Execute the quickstart command
 */
export async function quickstartCommand() {
  console.log(chalk.bold('\nUDS Quickstart Guide\n'));
  console.log(chalk.gray('Select a workflow to see the recommended commands:\n'));

  const choices = WORKFLOWS.map((w, i) => ({
    name: `${w.name}`,
    value: i,
    description: w.description,
  }));

  const selected = await select({
    message: 'Which workflow do you want to follow?',
    choices,
  });

  const workflow = WORKFLOWS[selected];
  console.log(chalk.bold(`\n${workflow.name}\n`));
  console.log(chalk.gray(`${workflow.description}\n`));

  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    console.log(`  ${chalk.cyan(`${i + 1}.`)} ${chalk.yellow(step.cmd)}`);
    console.log(`     ${chalk.gray(step.desc)}\n`);
  }

  console.log(chalk.gray('Tip: Run each command in order. Use "uds quickstart" anytime to see this guide again.\n'));
}
