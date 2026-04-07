/**
 * Spec Split Command - Assisted spec splitting with dependency tracking
 *
 * Helps split large specs into smaller ones while maintaining
 * depends_on references between them.
 *
 * @module commands/spec-split
 */

import chalk from 'chalk';
import { checkbox, confirm as inquirerConfirm } from '@inquirer/prompts';
import { MicroSpec } from '../vibe/micro-spec.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Extract acceptance criteria from spec markdown
 * @param {string} content - Spec markdown content
 * @returns {Array<{id: string, text: string, line: number}>}
 */
export function extractACs(content) {
  const lines = content.split('\n');
  const acs = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^-\s*\[[ x]\]\s*(AC-\d+:?\s*.+)/i);
    if (match) {
      acs.push({ id: match[1].split(':')[0].trim(), text: match[1], line: i });
    }
  }
  return acs;
}

/**
 * Add depends_on reference to spec content
 * @param {string} content - Spec markdown content
 * @param {string} targetId - Target spec ID
 * @returns {string} Updated content
 */
export function addDependsOn(content, targetId) {
  if (content.includes('**Depends On**:')) {
    return content.replace(
      /\*\*Depends On\*\*:\s*(.*)/,
      (match, existing) => {
        const current = existing.trim();
        if (current === 'none' || current === '') return `**Depends On**: ${targetId}`;
        return `**Depends On**: ${current}, ${targetId}`;
      }
    );
  }
  // Insert after **Type** line
  return content.replace(
    /(\*\*Type\*\*:.*\n)/,
    `$1**Depends On**: ${targetId}\n`
  );
}

/**
 * Execute the spec split command
 * @param {string} id - Spec ID to split
 * @param {Object} options - Command options
 */
export async function specSplitCommand(id, options = {}) {
  const microSpec = new MicroSpec({ cwd: process.cwd(), output: options.output });
  const spec = microSpec.get(id);

  if (!spec) {
    console.log(chalk.red(`Error: Spec ${id} not found`));
    process.exit(1);
    return;
  }

  // Read raw markdown
  const specPath = join(microSpec.specsDir, `${id}.md`);
  const content = readFileSync(specPath, 'utf-8');
  const acs = extractACs(content);

  if (acs.length < 2) {
    console.log(chalk.yellow(`Spec ${id} has ${acs.length} AC(s) — too few to split.`));
    return;
  }

  console.log(chalk.bold(`\nSplitting ${id} (${acs.length} ACs found):\n`));
  for (const ac of acs) {
    console.log(`  ${chalk.cyan(ac.id)}: ${ac.text.substring(ac.id.length + 1).trim()}`);
  }
  console.log();

  // Interactive selection: which ACs to move to new spec
  const toMove = await checkbox({
    message: 'Select ACs to move to a NEW spec (remaining stay in original):',
    choices: acs.map(ac => ({
      name: `${ac.id}: ${ac.text.substring(ac.id.length + 1).trim().substring(0, 60)}`,
      value: ac.id,
    })),
  });

  if (toMove.length === 0 || toMove.length === acs.length) {
    console.log(chalk.yellow('Must select some (but not all) ACs to move. Aborting.'));
    return;
  }

  const proceed = await inquirerConfirm({
    message: `Split ${id}: keep ${acs.length - toMove.length} ACs, move ${toMove.length} ACs to new spec?`,
    default: true,
  });

  if (!proceed) {
    console.log(chalk.gray('Split cancelled.'));
    return;
  }

  // Backup original
  const backupDir = join(microSpec.specsDir, '.backup');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  copyFileSync(specPath, join(backupDir, `${id}-pre-split.md`));

  // Generate new spec ID
  const newId = microSpec.generateId(spec.title + ' (part 2)');

  // Split content: remove moved ACs from original, create new spec with them
  const movedSet = new Set(toMove);
  const lines = content.split('\n');
  const originalLines = [];
  const movedACLines = [];

  for (let i = 0; i < lines.length; i++) {
    const acMatch = acs.find(ac => ac.line === i);
    if (acMatch && movedSet.has(acMatch.id)) {
      movedACLines.push(lines[i]);
    } else {
      originalLines.push(lines[i]);
    }
  }

  // Update original spec: add depends_on to new spec
  const originalContent = originalLines.join('\n');
  const updatedOriginal = addDependsOn(originalContent, newId);
  writeFileSync(specPath, updatedOriginal, 'utf-8');

  // Create new spec with moved ACs
  const newSpec = {
    ...spec,
    id: newId,
    title: `${spec.title} (split)`,
    dependsOn: [id],
    status: spec.status,
    createdAt: new Date().toISOString(),
  };
  const newContent = microSpec.toMarkdown(newSpec);
  const newSpecPath = join(microSpec.specsDir, `${newId}.md`);
  // Replace the AC section with moved ACs
  const acSection = movedACLines.join('\n');
  const finalContent = newContent.replace(
    /\*\*Acceptance\*\*:[\s\S]*?(?=\n\*\*|$)/,
    `**Acceptance**:\n${acSection}`
  );
  writeFileSync(newSpecPath, finalContent, 'utf-8');

  console.log(chalk.green('\nSplit complete:'));
  console.log(`  ${chalk.cyan(id)} — ${acs.length - toMove.length} ACs (updated)`);
  console.log(`  ${chalk.cyan(newId)} — ${toMove.length} ACs (new)`);
  console.log(`  ${chalk.gray(`Backup: ${join(backupDir, `${id}-pre-split.md`)}`)}`);
  console.log(`  ${chalk.gray('Both specs have mutual depends_on references.')}\n`);
}
