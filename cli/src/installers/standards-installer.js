import chalk from 'chalk';
import ora from 'ora';
import { basename, join } from 'path';
import {
  getStandardsByLevel,
  getStandardSource,
  getOptionSource,
  findOption
} from '../utils/registry.js';
import { copyStandard } from '../utils/copier.js';
import { t } from '../i18n/messages.js';
import { computeFileHash } from '../utils/hasher.js';

// Extension file mappings
export const EXTENSION_MAPPINGS = {
  csharp: 'extensions/languages/csharp-style.md',
  php: 'extensions/languages/php-style.md',
  'fat-free': 'extensions/frameworks/fat-free-patterns.md',
  'zh-tw': 'extensions/locales/zh-tw.md',
  'zh-cn': 'extensions/locales/zh-cn.md'
};

/**
 * Install standards and extensions
 * @param {Object} config - Installation configuration
 * @param {string} projectPath - Project directory path
 * @returns {Promise<Object>} Installation results (standards, extensions, errors, fileHashes)
 */
export async function installStandards(config, projectPath) {
  const msg = t().commands.init;
  const results = {
    standards: [],
    extensions: [],
    errors: [],
    fileHashes: {}
  };

  // Get standards for the selected level
  const standards = getStandardsByLevel(config.level);

  // Determine which standards to copy based on scope
  const standardsToCopy = config.standardsScope === 'minimal'
    ? standards.filter(s => s.category === 'reference')
    : standards.filter(s => s.category === 'reference' || s.category === 'skill');

  // Helper to copy standard with format awareness
  const copyStandardWithFormat = async (std, targetFormat) => {
    const sourcePath = getStandardSource(std, targetFormat);
    const result = await copyStandard(sourcePath, '.standards', projectPath);
    return { ...result, sourcePath };
  };

  // Helper to copy option files
  const copyOptionFiles = async (std, optionCategory, selectedOptionIds, targetFormat) => {
    const copiedOptions = [];
    if (!std.options || !std.options[optionCategory]) return copiedOptions;

    const optionIds = Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds];
    for (const optionId of optionIds) {
      const option = findOption(std, optionCategory, optionId);
      if (option) {
        const sourcePath = getOptionSource(option, targetFormat);
        const result = await copyStandard(sourcePath, '.standards/options', projectPath);
        if (result.success) {
          copiedOptions.push(sourcePath);
        } else {
          results.errors.push(`${sourcePath}: ${result.error}`);
        }
      }
    }
    return copiedOptions;
  };

  // Start copying standards
  const copySpinner = ora(msg.copyingStandards).start();

  // Copy standards based on format
  const formatsToUse = config.format === 'both' ? ['ai', 'human'] : [config.format];

  for (const std of standardsToCopy) {
    for (const targetFormat of formatsToUse) {
      const { success, sourcePath, error } = await copyStandardWithFormat(std, targetFormat);
      if (success) {
        results.standards.push(sourcePath);
      } else {
        results.errors.push(`${sourcePath}: ${error}`);
      }
    }

    // Copy selected options for this standard
    if (std.options) {
      for (const targetFormat of formatsToUse) {
        // Git workflow options
        if (std.id === 'git-workflow') {
          if (config.standardOptions.workflow) {
            const copied = await copyOptionFiles(std, 'workflow', config.standardOptions.workflow, targetFormat);
            results.standards.push(...copied);
          }
          if (config.standardOptions.merge_strategy) {
            const copied = await copyOptionFiles(std, 'merge_strategy', config.standardOptions.merge_strategy, targetFormat);
            results.standards.push(...copied);
          }
        }
        // Commit message options
        if (std.id === 'commit-message' && config.standardOptions.commit_language) {
          const copied = await copyOptionFiles(std, 'commit_language', config.standardOptions.commit_language, targetFormat);
          results.standards.push(...copied);
        }
        // Testing options
        if (std.id === 'testing' && config.standardOptions.test_levels) {
          const copied = await copyOptionFiles(std, 'test_level', config.standardOptions.test_levels, targetFormat);
          results.standards.push(...copied);
        }
      }
    }
  }

  copySpinner.succeed(msg.copiedStandards.replace('{count}', results.standards.length));

  // Copy extensions
  const localeExtension = (config.displayLanguage === 'zh-tw' || config.displayLanguage === 'zh-cn') ? config.displayLanguage : null;

  if (config.languages.length > 0 || config.frameworks.length > 0 || localeExtension) {
    const extSpinner = ora(msg.copyingExtensions).start();

    for (const lang of config.languages) {
      if (EXTENSION_MAPPINGS[lang]) {
        const result = await copyStandard(EXTENSION_MAPPINGS[lang], '.standards', projectPath);
        if (result.success) {
          results.extensions.push(EXTENSION_MAPPINGS[lang]);
        } else {
          results.errors.push(`${EXTENSION_MAPPINGS[lang]}: ${result.error}`);
        }
      }
    }

    for (const fw of config.frameworks) {
      if (EXTENSION_MAPPINGS[fw]) {
        const result = await copyStandard(EXTENSION_MAPPINGS[fw], '.standards', projectPath);
        if (result.success) {
          results.extensions.push(EXTENSION_MAPPINGS[fw]);
        } else {
          results.errors.push(`${EXTENSION_MAPPINGS[fw]}: ${result.error}`);
        }
      }
    }

    // Auto-install locale extension based on display language
    if (localeExtension && EXTENSION_MAPPINGS[localeExtension]) {
      const result = await copyStandard(EXTENSION_MAPPINGS[localeExtension], '.standards', projectPath);
      if (result.success) {
        results.extensions.push(EXTENSION_MAPPINGS[localeExtension]);
      } else {
        results.errors.push(`${EXTENSION_MAPPINGS[localeExtension]}: ${result.error}`);
      }
    }

    extSpinner.succeed(msg.copiedExtensions.replace('{count}', results.extensions.length));
  }

  // Compute file hashes for integrity checking
  const now = new Date().toISOString();

  // Helper to compute and store hash
  const addFileHash = (relativePath) => {
    const fullPath = join(projectPath, relativePath);
    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      results.fileHashes[relativePath] = {
        ...hashInfo,
        installedAt: now
      };
    }
  };

  // Hash standards
  for (const sourcePath of results.standards) {
    const fileName = basename(sourcePath);
    const relativePath = sourcePath.includes('options/')
      ? join('.standards', 'options', fileName)
      : join('.standards', fileName);
    addFileHash(relativePath);
  }

  // Hash extensions
  for (const sourcePath of results.extensions) {
    const fileName = basename(sourcePath);
    const relativePath = join('.standards', fileName);
    addFileHash(relativePath);
  }

  return results;
}
