import chalk from 'chalk';
import {
  getAllStandards,
  getStandardsByCategory,
  getCategoryInfo,
  getRepositoryInfo
} from '../utils/registry.js';
import { readManifest, isInitialized } from '../utils/copier.js';
import { t, getLanguage, setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';

/**
 * The order the listing shows its categories in. A category the registry holds standards for but that is not named
 * here is still listed (after these, under its own key): the "Total" line counts every standard in the registry, so a
 * category that was left out of the display used to make the total larger than the list (82 of 163 standards were
 * counted and never shown, and `--category core` was refused as unknown).
 */
const CATEGORY_ORDER = ['skill', 'reference', 'core', 'testing', 'security', 'deployment', 'operations', 'extension', 'integration', 'template'];

/**
 * List command - displays available standards
 * @param {Object} options - Command options
 */
export function listCommand(options) {
  const { category } = options;
  const projectPath = process.cwd();

  // Set UI language based on project's display_language if initialized
  // Only override if user didn't explicitly set --ui-lang flag
  if (!isLanguageExplicitlySet() && isInitialized(projectPath)) {
    const manifest = readManifest(projectPath);
    if (manifest?.options?.display_language) {
      const uiLang = manifest.options.display_language;
      setLanguage(uiLang);
    }
  }

  // Now get localized messages
  const msg = t().commands.list;
  const common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

  const repoInfo = getRepositoryInfo();
  console.log(chalk.gray(`${common.version}: ${repoInfo.standards.version}`));
  console.log();

  let standards;

  if (category !== undefined) {
    const categoryInfo = getCategoryInfo(category);
    if (!categoryInfo) {
      console.log(chalk.red(`${msg.errorUnknownCategory} '${category}'`));
      const valid = CATEGORY_ORDER.filter((c) => getCategoryInfo(c));
      console.log(chalk.gray(`${msg.validCategories} ${valid.join(', ')}`));
      process.exit(1);
    }
    standards = getStandardsByCategory(category);
    console.log(chalk.cyan(`${msg.category}: ${categoryInfo.name}`));
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
  const categoryOrder = [...CATEGORY_ORDER, ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c))];

  for (const cat of categoryOrder) {
    if (!grouped[cat] || grouped[cat].length === 0) continue;

    const catInfo = getCategoryInfo(cat);
    console.log(chalk.yellow.bold(`${catInfo?.name ?? cat} (${grouped[cat].length})`));

    for (const std of grouped[cat]) {
      const name = std.skillName
        ? chalk.green(`${std.name}`) + chalk.gray(` → ${std.skillName}`)
        : chalk.white(std.name);

      console.log(`  ${name}`);
      // Handle source being an object with human/ai paths
      const sourceDisplay = typeof std.source === 'object'
        ? std.source.human || std.source.ai
        : std.source;
      console.log(chalk.gray(`       ${sourceDisplay}`));

      if (std.applicability) {
        console.log(chalk.gray(`       ${msg.appliesTo}: ${std.applicability}`));
      }
    }
    console.log();
  }

  // Summary
  console.log(chalk.gray('─'.repeat(50)));
  const skillCount = standards.filter(s => s.skillName).length;
  const refCount = standards.filter(s => !s.skillName).length;
  console.log(chalk.gray(`${common.total}: ${standards.length} ${msg.totalSummary} (${skillCount} ${msg.withSkills}, ${refCount} ${msg.referenceOnly})`));
  console.log();
  console.log(chalk.gray(msg.runInitHint));
  console.log(chalk.gray(msg.seeGuide));
}
