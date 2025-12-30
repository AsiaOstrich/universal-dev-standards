import chalk from 'chalk';
import {
  getAllStandards,
  getStandardsByLevel,
  getStandardsByCategory,
  getLevelInfo,
  getCategoryInfo,
  getRepositoryInfo
} from '../utils/registry.js';

/**
 * List command - displays available standards
 * @param {Object} options - Command options
 */
export function listCommand(options) {
  const { level, category } = options;

  console.log();
  console.log(chalk.bold('Universal Development Standards'));
  console.log(chalk.gray('─'.repeat(50)));

  const repoInfo = getRepositoryInfo();
  console.log(chalk.gray(`Version: ${repoInfo.standards.version}`));
  console.log();

  let standards;

  if (level) {
    const levelNum = parseInt(level, 10);
    if (![1, 2, 3].includes(levelNum)) {
      console.log(chalk.red('Error: Level must be 1, 2, or 3'));
      process.exit(1);
    }
    standards = getStandardsByLevel(levelNum);
    const levelInfo = getLevelInfo(levelNum);
    console.log(chalk.cyan(`Showing Level ${levelNum}: ${levelInfo.name} (${levelInfo.nameZh})`));
    console.log(chalk.gray(levelInfo.description));
    console.log();
  } else if (category) {
    const categoryInfo = getCategoryInfo(category);
    if (!categoryInfo) {
      console.log(chalk.red(`Error: Unknown category '${category}'`));
      console.log(chalk.gray('Valid categories: skill, reference, extension, integration, template'));
      process.exit(1);
    }
    standards = getStandardsByCategory(category);
    console.log(chalk.cyan(`Category: ${categoryInfo.name}`));
    console.log(chalk.gray(categoryInfo.description));
    console.log();
  } else {
    standards = getAllStandards();
  }

  // Group by category
  const grouped = {};
  for (const std of standards) {
    if (!grouped[std.category]) {
      grouped[std.category] = [];
    }
    grouped[std.category].push(std);
  }

  // Display each category
  const categoryOrder = ['skill', 'reference', 'extension', 'integration', 'template'];

  for (const cat of categoryOrder) {
    if (!grouped[cat] || grouped[cat].length === 0) continue;

    const catInfo = getCategoryInfo(cat);
    console.log(chalk.yellow.bold(`${catInfo.name} (${grouped[cat].length})`));

    for (const std of grouped[cat]) {
      const levelBadge = chalk.gray(`[L${std.level}]`);
      const name = std.skillName
        ? chalk.green(`${std.name}`) + chalk.gray(` → ${std.skillName}`)
        : chalk.white(std.name);

      console.log(`  ${levelBadge} ${name}`);
      // Handle source being an object with human/ai paths
      const sourceDisplay = typeof std.source === 'object'
        ? std.source.human || std.source.ai
        : std.source;
      console.log(chalk.gray(`       ${sourceDisplay}`));

      if (std.applicability) {
        console.log(chalk.gray(`       Applies to: ${std.applicability}`));
      }
    }
    console.log();
  }

  // Summary
  console.log(chalk.gray('─'.repeat(50)));
  const skillCount = standards.filter(s => s.skillName).length;
  const refCount = standards.filter(s => !s.skillName).length;
  console.log(chalk.gray(`Total: ${standards.length} standards (${skillCount} with Skills, ${refCount} reference-only)`));
  console.log();
  console.log(chalk.gray('Run `uds init` to adopt standards in your project.'));
  console.log(chalk.gray('See: https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md'));
}
