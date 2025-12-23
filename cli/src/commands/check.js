import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { readManifest, isInitialized } from '../utils/copier.js';
import {
  getStandardsByLevel,
  getLevelInfo,
  getRepositoryInfo
} from '../utils/registry.js';

/**
 * Check command - verify adoption status
 */
export function checkCommand() {
  const projectPath = process.cwd();

  console.log();
  console.log(chalk.bold('Universal Documentation Standards - Check'));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red('✗ Standards not initialized in this project.'));
    console.log(chalk.gray('  Run `uds init` to initialize.'));
    console.log();
    return;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red('✗ Could not read manifest file.'));
    console.log(chalk.gray('  The .standards/manifest.json may be corrupted.'));
    console.log();
    return;
  }

  // Display adoption info
  const levelInfo = getLevelInfo(manifest.level);
  const repoInfo = getRepositoryInfo();

  console.log(chalk.green('✓ Standards initialized'));
  console.log();
  console.log(chalk.cyan('Adoption Status:'));
  console.log(chalk.gray(`  Level: ${manifest.level} - ${levelInfo.name} (${levelInfo.nameZh})`));
  console.log(chalk.gray(`  Installed: ${manifest.upstream.installed}`));
  console.log(chalk.gray(`  Version: ${manifest.upstream.version}`));
  console.log();

  // Check for updates
  if (manifest.upstream.version !== repoInfo.standards.version) {
    console.log(chalk.yellow(`⚠ Update available: ${manifest.upstream.version} → ${repoInfo.standards.version}`));
    console.log(chalk.gray('  Run `uds update` to update.'));
    console.log();
  }

  // Check file integrity
  console.log(chalk.cyan('File Integrity:'));

  let missingCount = 0;
  let presentCount = 0;

  // Check standards
  for (const std of manifest.standards) {
    const filePath = join(projectPath, '.standards', std.split('/').pop());
    if (existsSync(filePath)) {
      presentCount++;
    } else {
      missingCount++;
      console.log(chalk.red(`  ✗ Missing: .standards/${std.split('/').pop()}`));
    }
  }

  // Check extensions
  for (const ext of manifest.extensions) {
    const filePath = join(projectPath, '.standards', ext.split('/').pop());
    if (existsSync(filePath)) {
      presentCount++;
    } else {
      missingCount++;
      console.log(chalk.red(`  ✗ Missing: .standards/${ext.split('/').pop()}`));
    }
  }

  // Check integrations
  for (const int of manifest.integrations) {
    const filePath = join(projectPath, int);
    if (existsSync(filePath)) {
      presentCount++;
    } else {
      missingCount++;
      console.log(chalk.red(`  ✗ Missing: ${int}`));
    }
  }

  if (missingCount === 0) {
    console.log(chalk.green(`  ✓ All ${presentCount} files present`));
  } else {
    console.log(chalk.yellow(`  ${presentCount} present, ${missingCount} missing`));
  }
  console.log();

  // Skills status
  console.log(chalk.cyan('Skills Status:'));
  if (manifest.skills.installed) {
    const skillsDir = join(process.env.HOME || '', '.claude', 'skills');
    const hasGlobalSkills = existsSync(skillsDir);
    const hasProjectSkills = existsSync(join(projectPath, '.claude', 'skills'));

    if (hasGlobalSkills || hasProjectSkills) {
      console.log(chalk.green('  ✓ Claude Code Skills installed'));
      if (hasGlobalSkills) console.log(chalk.gray('    Global: ~/.claude/skills/'));
      if (hasProjectSkills) console.log(chalk.gray('    Project: .claude/skills/'));
    } else {
      console.log(chalk.yellow('  ⚠ Skills marked as installed but not found'));
      console.log(chalk.gray('    Run: git clone https://github.com/AsiaOstrich/universal-dev-skills.git'));
      console.log(chalk.gray('          cd universal-dev-skills && ./install.sh'));
    }
  } else {
    console.log(chalk.gray('  Skills not installed (using reference documents only)'));
  }
  console.log();

  // Coverage report
  console.log(chalk.cyan('Coverage Summary:'));
  const expectedStandards = getStandardsByLevel(manifest.level);
  const skillStandards = expectedStandards.filter(s => s.skillName);
  const refStandards = expectedStandards.filter(s => !s.skillName);

  console.log(chalk.gray(`  Level ${manifest.level} requires ${expectedStandards.length} standards:`));
  console.log(chalk.gray(`    ${skillStandards.length} with Skills (interactive AI assistance)`));
  console.log(chalk.gray(`    ${refStandards.length} reference documents`));

  const coveredBySkills = manifest.skills.installed ? skillStandards.length : 0;
  const coveredByDocs = manifest.standards.length;
  const totalCovered = coveredBySkills + coveredByDocs;

  console.log(chalk.gray(`  Your coverage:`));
  console.log(chalk.gray(`    ${coveredBySkills} via Skills`));
  console.log(chalk.gray(`    ${coveredByDocs} via copied documents`));
  console.log();

  // Final status
  if (missingCount === 0 && (manifest.skills.installed || !manifest.skills.installed)) {
    console.log(chalk.green('✓ Project is compliant with standards'));
  } else {
    console.log(chalk.yellow('⚠ Some issues detected. Review above for details.'));
  }
  console.log();
}
