/**
 * Quickstart Command - Interactive workflow guide
 *
 * Reduces cognitive load by guiding users to common workflow paths.
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
      { cmd: 'uds spec create "your feature" --boost', desc: 'Create full SDD spec with design sections' },
      { cmd: 'uds lint', desc: 'Validate spec quality and cross-references' },
      { cmd: 'uds spec confirm SPEC-XXX', desc: 'Confirm after review' },
      { cmd: '# Implement with /derive → /tdd', desc: 'Use forward derivation and TDD' },
      { cmd: 'uds sync', desc: 'Export context for session resume' },
    ],
  },
  {
    name: 'Test-Driven Development (TDD)',
    description: 'Red-Green-Refactor cycle',
    steps: [
      { cmd: 'uds workflow execute tdd', desc: 'Start TDD workflow' },
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
      { cmd: 'uds check --spec-size', desc: 'Check spec sizes against limits' },
      { cmd: 'uds lint', desc: 'Lint specs for AC coverage and dependency validity' },
      { cmd: 'uds audit', desc: 'Deep health diagnosis' },
    ],
  },
  {
    name: 'Resume Previous Work',
    description: 'Restore context from a previous session',
    steps: [
      { cmd: 'uds sync', desc: 'Generate context.md from git diff + workflow state' },
      { cmd: 'cat .workflow-state/context.md', desc: 'Read context in new session' },
      { cmd: 'uds workflow status', desc: 'Check workflow execution status' },
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
