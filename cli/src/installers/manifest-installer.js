import chalk from 'chalk';
import { getRepositoryInfo } from '../utils/registry.js';
import { writeManifest } from '../core/manifest.js';
import { t } from '../i18n/messages.js';
import { getAgentDisplayName, getSkillsDirForAgent, getCommandsDirForAgent } from '../config/ai-agent-paths.js';

/**
 * Create and write the final manifest file, and display installation summary
 *
 * @param {Object} config - Installation configuration
 * @param {Object} results - Combined results from all installers
 * @param {string} projectPath - Project directory path
 */
export function writeFinalManifest(config, results, projectPath) {
  const msg = t().commands.init;
  const repoInfo = getRepositoryInfo();

  // Construct manifest object
  const manifest = {
    version: '3.3.0',
    upstream: {
      repo: 'AsiaOstrich/universal-dev-standards',
      version: repoInfo.standards.version,
      installed: new Date().toISOString().split('T')[0]
    },
    level: config.level,
    format: config.format,
    standardsScope: config.standardsScope || 'full',
    contentMode: config.contentMode || 'minimal',
    standards: results.standards || [],
    extensions: results.extensions || [],
    integrations: results.integrations || [],
    integrationConfigs: results.manifestIntegrationConfigs || {},
    options: {
      display_language: config.displayLanguage || 'en',
      workflow: config.standardOptions?.workflow || null,
      merge_strategy: config.standardOptions?.merge_strategy || null,
      commit_language: config.standardOptions?.commit_language || null,
      test_levels: config.standardOptions?.test_levels || []
    },
    aiTools: config.aiTools || [],
    skills: {
      installed: config.skillsConfig?.installed || false,
      location: config.skillsConfig?.location || null,
      names: config.skillsConfig?.location === 'marketplace' ? ['all-via-plugin'] : (results.skills || []),
      version: config.skillsConfig?.installed ? repoInfo.skills.version : null,
      installations: config.skillsConfig?.skillsInstallations || []
    },
    commands: {
      installed: config.skillsConfig?.commandsInstallations?.length > 0,
      names: results.commands || [],
      version: config.skillsConfig?.commandsInstallations?.length > 0 ? repoInfo.skills.version : null,
      installations: config.skillsConfig?.commandsInstallations || []
    },
    methodology: config.methodology ? {
      active: config.methodology,
      available: ['tdd', 'bdd', 'sdd', 'atdd'],
      config: {
        checkpointsEnabled: true,
        reminderIntensity: 'suggest',
        skipLimit: 3
      }
    } : null,
    fileHashes: results.fileHashes || {},
    skillHashes: results.skillHashes || {},
    commandHashes: results.commandHashes || {},
    integrationBlockHashes: results.integrationBlockHashes || {}
  };

  // Write file
  writeManifest(manifest, projectPath);

  // --- Display Summary ---
  console.log();
  console.log(chalk.green(msg.initializedSuccess));
  console.log();

  const totalFiles = (results.standards?.length || 0) + (results.extensions?.length || 0) + (results.integrations?.length || 0);
  console.log(chalk.gray(`  ${msg.filesCopied.replace('{count}', totalFiles)}`));

  if (config.skillsConfig?.installed) {
    if (config.skillsConfig.location === 'marketplace') {
      console.log(chalk.gray(`  ${msg.skillsUsingMarketplace}`));
    } else if (results.skills?.length > 0) {
      const skillLocations = config.skillsConfig.skillsInstallations.map(inst => {
        const displayName = getAgentDisplayName(inst.agent);
        const dir = getSkillsDirForAgent(inst.agent, inst.level, projectPath);
        return `${displayName}: ${dir}`;
      }).join(' and ');
      console.log(chalk.gray(`  ${msg.skillsInstalledTo.replace('{count}', results.skills.length).replace('{locations}', skillLocations)}`));
    }
  }

  if (results.commands?.length > 0) {
    const cmdLocations = config.skillsConfig.commandsInstallations.map(item => {
      const agent = typeof item === 'string' ? item : item.agent;
      const level = typeof item === 'string' ? 'project' : (item.level || 'project');
      const displayName = getAgentDisplayName(agent);
      const dir = getCommandsDirForAgent(agent, level, projectPath);
      return `${displayName}: ${dir}`;
    }).join(' and ');

    console.log(chalk.gray(`  ${(msg.commandsInstalledTo || 'Commands ({count}): {locations}').replace('{count}', results.commands.length).replace('{locations}', cmdLocations)}`));
  }
  
  console.log(chalk.gray(`  ${msg.manifestCreated}`));

  if (results.errors?.length > 0) {
    console.log();
    console.log(chalk.yellow(msg.errorsOccurred.replace('{count}', results.errors.length)));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  console.log();
  console.log(chalk.gray(msg.nextSteps));
  console.log(chalk.gray(`  ${msg.reviewDirectory}`));
  console.log(chalk.gray(`  ${msg.addToVcs}`));
  
  if (config.skillsConfig?.installed) {
    const toolNames = config.skillsConfig.skillsInstallations?.length > 0
      ? [...new Set(config.skillsConfig.skillsInstallations.map(inst => getAgentDisplayName(inst.agent)))].join(' / ')
      : 'Claude Code';
    console.log(chalk.gray(`  ${msg.restartAgent.replace('{tools}', toolNames)}`));
    console.log(chalk.gray(`  4. ${msg.runCheck}`));
  } else {
    console.log(chalk.gray(`  3. ${msg.runCheck}`));
  }
  console.log();

  // Exit explicitly
  process.exit(0);
}
