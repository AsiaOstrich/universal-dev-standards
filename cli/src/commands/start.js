/**
 * UDS Start Command — Mission 任務啟動
 *
 * 啟動一個具名任務（Mission）並設定任務意圖。
 *
 * @deprecated XSPEC-095 (2026-04-28): Runtime relocated to adoption layer.
 *   The orchestration logic is adoption-layer responsibility:
 *   adoption layers must implement equivalent mission start commands
 *   in their own toolchain.
 *
 *   棄用理由：UDS 專注於活動定義；流程編排由採用層承擔（XSPEC-086 /
 *   DEC-049 — orchestration runtime moved to adoption layer 2026-04-28）。
 *   UDS 5.x 仍維持本命令可用（向後相容），UDS 6.0.0 將移除。
 *   建議遷移：實作於採用層工具鏈。
 */
import chalk from 'chalk';
import { select, input, confirm as inquirerConfirm } from '@inquirer/prompts';
import { MissionManager, MissionType, MissionState } from '../missions/MissionManager.js';
import { msg } from '../i18n/messages.js';

/**
 * Get localized message with fallback
 */
function t(key, fallback) {
  return msg(key) || fallback;
}

/**
 * Mission type display names and descriptions
 */
const MISSION_INFO = {
  [MissionType.GENESIS]: {
    name: 'Genesis (Greenfield)',
    description: 'Create a new project from scratch',
    emoji: '🌱'
  },
  [MissionType.RENOVATE]: {
    name: 'Renovate (Refactor)',
    description: 'Refactor and improve existing code',
    emoji: '🔧'
  },
  [MissionType.MEDIC]: {
    name: 'Medic (Debug)',
    description: 'Debug and fix issues',
    emoji: '🩺'
  },
  [MissionType.EXODUS]: {
    name: 'Exodus (Migration)',
    description: 'Migrate to new technology/framework',
    emoji: '🚀'
  },
  [MissionType.GUARDIAN]: {
    name: 'Guardian (Security)',
    description: 'Security audit and compliance check',
    emoji: '🛡️'
  }
};

/**
 * Handle start command - create a new mission
 * @param {string} missionType - Mission type
 * @param {string} intent - Natural language intent
 * @param {Object} options - Command options
 */
export async function startCommand(missionType, intent, options) {
  const manager = new MissionManager();

  // Check for existing mission
  const current = manager.getCurrent();
  if (current && !manager.isTerminalState(current.state)) {
    console.log(chalk.yellow(t('mission.activeExists', 'An active mission already exists:')));
    console.log('');
    displayMissionStatus(current);
    console.log('');

    if (!options.yes) {
      const action = await select({
        message: t('mission.existingAction', 'What would you like to do?'),
        choices: [
          { name: t('mission.resume', 'Resume existing mission'), value: 'resume' },
          { name: t('mission.cancel', 'Cancel existing and start new'), value: 'cancel' },
          { name: t('mission.abort', 'Abort (do nothing)'), value: 'abort' }
        ]
      });

      if (action === 'abort') {
        console.log(chalk.gray(t('mission.aborted', 'Operation cancelled.')));
        return;
      }

      if (action === 'resume') {
        console.log(chalk.cyan(t('mission.resuming', 'Resuming existing mission...')));
        displayMissionDetails(current, manager);
        return;
      }

      if (action === 'cancel') {
        manager.cancel('Cancelled to start new mission');
        console.log(chalk.gray(t('mission.previousCancelled', 'Previous mission cancelled.')));
      }
    } else {
      // With --yes flag, cancel existing and proceed
      manager.cancel('Cancelled to start new mission (--yes flag)');
    }
  }

  // If no type provided, prompt for selection
  let selectedType = missionType;
  if (!selectedType) {
    const type = await select({
      message: t('mission.selectType', 'Select mission type:'),
      choices: Object.entries(MISSION_INFO).map(([key, info]) => ({
        name: `${info.emoji} ${info.name}\n     ${chalk.gray(info.description)}`,
        value: key,
        short: info.name
      }))
    });
    selectedType = type;
  }

  // If no intent provided, prompt for it
  let missionIntent = intent;
  if (!missionIntent) {
    const userIntent = await input({
      message: t('mission.enterIntent', 'Describe your goal:'),
      validate: (val) => val.trim().length > 0 || t('mission.intentRequired', 'Intent is required')
    });
    missionIntent = userIntent;
  }

  try {
    // Create the mission
    const mission = manager.create(selectedType, missionIntent);
    const info = MISSION_INFO[selectedType];

    console.log('');
    console.log(chalk.green(`${info.emoji} ${t('mission.created', 'Mission created!')}`));
    console.log('');
    console.log(chalk.bold(`Mission: ${mission.id}`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  ${chalk.cyan('Type')}: ${info.name}`);
    console.log(`  ${chalk.cyan('Intent')}: ${missionIntent}`);
    console.log(`  ${chalk.cyan('State')}: ${chalk.yellow(mission.state)}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log('');

    // Show workflow config
    const workflowConfig = manager.getWorkflowConfig(selectedType);
    if (workflowConfig) {
      console.log(chalk.bold(t('mission.suggestedWorkflow', 'Suggested workflow:')));
      workflowConfig.steps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });
      console.log('');
    }

    // Show next steps
    console.log(chalk.gray(t('mission.nextSteps', 'Next steps:')));
    console.log(chalk.gray(`  • ${t('mission.useSpecCreate', 'Create specs:')} uds spec create "<feature>"`));
    console.log(chalk.gray(`  • ${t('mission.useStatus', 'Check status:')} uds mission status`));
    console.log(chalk.gray(`  • ${t('mission.usePause', 'Pause mission:')} uds mission pause`));

    // Transition to planning
    if (!options.skipPlanning) {
      manager.transition(MissionState.PLANNING, { reason: 'Mission started' });
      console.log('');
      console.log(chalk.cyan(t('mission.planningPhase', 'Mission is now in planning phase.')));
    }

  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exitCode = 1;
  }
}

/**
 * Handle mission status command
 */
export async function missionStatusCommand() {
  const manager = new MissionManager();
  const status = manager.getStatus();

  if (!status.active) {
    console.log(chalk.gray(t('mission.noActive', 'No active mission.')));
    console.log(chalk.gray(t('mission.startHint', 'Start one with: uds start <type> "<intent>"')));
    return;
  }

  const mission = manager.getCurrent();
  displayMissionDetails(mission, manager);
}

/**
 * Handle mission pause command
 * @param {Object} options - Command options
 */
export async function missionPauseCommand(options) {
  const manager = new MissionManager();
  const current = manager.getCurrent();

  if (!current) {
    console.log(chalk.gray(t('mission.noActive', 'No active mission to pause.')));
    return;
  }

  try {
    const mission = manager.pause(options.reason || '');
    console.log(chalk.yellow(t('mission.paused', 'Mission paused.')));
    console.log(`  ID: ${mission.id}`);
    console.log(`  State: ${chalk.yellow(mission.state)}`);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

/**
 * Handle mission resume command
 */
export async function missionResumeCommand() {
  const manager = new MissionManager();
  const current = manager.getCurrent();

  if (!current) {
    console.log(chalk.gray(t('mission.noActive', 'No active mission to resume.')));
    return;
  }

  try {
    const mission = manager.resume();
    console.log(chalk.green(t('mission.resumed', 'Mission resumed!')));
    displayMissionStatus(mission);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

/**
 * Handle mission cancel command
 * @param {Object} options - Command options
 */
export async function missionCancelCommand(options) {
  const manager = new MissionManager();
  const current = manager.getCurrent();

  if (!current) {
    console.log(chalk.gray(t('mission.noActive', 'No active mission to cancel.')));
    return;
  }

  if (!options.yes) {
    const confirmed = await inquirerConfirm({
      message: t('mission.confirmCancel', `Cancel mission "${current.id}"?`),
      default: false
    });

    if (!confirmed) {
      console.log(chalk.gray(t('mission.cancelAborted', 'Operation cancelled.')));
      return;
    }
  }

  try {
    const mission = manager.cancel(options.reason || 'User cancelled');
    console.log(chalk.red(t('mission.cancelled', 'Mission cancelled.')));
    console.log(`  ID: ${mission.id}`);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

/**
 * Handle mission list command
 * @param {Object} options - Command options
 */
export async function missionListCommand(options) {
  const manager = new MissionManager();
  const missions = manager.list({
    type: options.type,
    state: options.state
  });

  if (missions.length === 0) {
    console.log(chalk.gray(t('mission.noMissions', 'No missions found.')));
    return;
  }

  console.log(chalk.bold(t('mission.listTitle', 'Missions:')));
  console.log('');

  for (const mission of missions) {
    const info = MISSION_INFO[mission.type] || { emoji: '📋', name: mission.type };
    const currentMark = mission.isCurrent ? chalk.green(' (current)') : '';
    const stateColor = getStateColor(mission.state);

    console.log(`${info.emoji} ${chalk.bold(mission.id)}${currentMark}`);
    console.log(`   Type: ${info.name}`);
    console.log(`   State: ${stateColor(mission.state)}`);
    console.log(`   Intent: ${mission.intent.substring(0, 60)}${mission.intent.length > 60 ? '...' : ''}`);
    console.log(`   Created: ${new Date(mission.createdAt).toLocaleDateString()}`);
    console.log('');
  }
}

/**
 * Display mission status summary
 */
function displayMissionStatus(mission) {
  const info = MISSION_INFO[mission.type] || { emoji: '📋', name: mission.type };
  const stateColor = getStateColor(mission.state);

  console.log(`${info.emoji} ${chalk.bold(mission.id)}`);
  console.log(`   State: ${stateColor(mission.state)}`);
  console.log(`   Intent: ${mission.intent}`);
}

/**
 * Display detailed mission information
 */
function displayMissionDetails(mission, _manager) {
  const info = MISSION_INFO[mission.type] || { emoji: '📋', name: mission.type };
  const stateColor = getStateColor(mission.state);

  console.log('');
  console.log(chalk.bold(`${info.emoji} Mission: ${mission.id}`));
  console.log(chalk.gray('═'.repeat(50)));
  console.log(`  ${chalk.cyan('Type')}: ${info.name}`);
  console.log(`  ${chalk.cyan('State')}: ${stateColor(mission.state)}`);
  console.log(`  ${chalk.cyan('Intent')}: ${mission.intent}`);
  console.log(`  ${chalk.cyan('Created')}: ${new Date(mission.createdAt).toLocaleString()}`);
  console.log(`  ${chalk.cyan('Updated')}: ${new Date(mission.updatedAt).toLocaleString()}`);

  if (mission.steps.length > 0) {
    console.log('');
    console.log(chalk.bold('  Steps:'));
    mission.steps.forEach((step) => {
      const statusIcon = step.status === 'completed' ? '✓' :
        step.status === 'in_progress' ? '→' :
          step.status === 'failed' ? '✗' : '○';
      const statusColor = step.status === 'completed' ? chalk.green :
        step.status === 'failed' ? chalk.red : chalk.gray;
      console.log(`    ${statusColor(statusIcon)} ${step.description || step.id}`);
    });
  }

  if (mission.specs.length > 0) {
    console.log('');
    console.log(chalk.bold('  Linked Specs:'));
    mission.specs.forEach(specId => {
      console.log(`    • ${specId}`);
    });
  }

  console.log(chalk.gray('═'.repeat(50)));
}

/**
 * Get chalk color function for mission state
 */
function getStateColor(state) {
  switch (state) {
    case MissionState.COMPLETED:
      return chalk.green;
    case MissionState.CANCELLED:
      return chalk.red;
    case MissionState.PAUSED:
      return chalk.yellow;
    case MissionState.IN_PROGRESS:
      return chalk.cyan;
    default:
      return chalk.white;
  }
}
