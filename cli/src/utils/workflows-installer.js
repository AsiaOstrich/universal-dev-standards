/**
 * Workflows Installer
 *
 * Provides installation and management of workflow definitions
 * across all supported AI coding assistants.
 *
 * v1.1.0 - Added RLM context strategy support and parallel-agents step type
 *
 * @version 1.1.0
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import {
  getAgentConfig,
  getWorkflowsDirForAgent,
  getWorkflowsSupportedAgents
} from '../config/ai-agent-paths.js';
import { computeFileHash } from './hasher.js';

// Get the CLI package root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = join(__dirname, '..', '..');
const BUNDLED_DIR = join(CLI_ROOT, 'bundled');

/**
 * Get the Workflows source directory.
 * Prioritizes bundled directory (npm install), falls back to development path.
 * @returns {string} Path to workflows source directory
 */
function getWorkflowsSourceDir() {
  const bundledPath = join(BUNDLED_DIR, 'skills', 'claude-code', 'workflows');
  if (existsSync(bundledPath)) {
    return bundledPath;
  }
  // Development environment fallback
  return join(CLI_ROOT, '..', 'skills', 'claude-code', 'workflows');
}

const WORKFLOWS_LOCAL_DIR = getWorkflowsSourceDir();

/**
 * Get list of available workflow names from local directory
 * @returns {string[]} Array of workflow names (without .workflow.yaml extension)
 */
export function getAvailableWorkflowNames() {
  if (!existsSync(WORKFLOWS_LOCAL_DIR)) {
    return [];
  }

  const NON_WORKFLOW_ITEMS = ['README.md', '.DS_Store', '.manifest.json'];

  try {
    return readdirSync(WORKFLOWS_LOCAL_DIR)
      .filter(file => {
        if (NON_WORKFLOW_ITEMS.includes(file)) return false;
        if (!file.endsWith('.workflow.yaml')) return false;
        const itemPath = join(WORKFLOWS_LOCAL_DIR, file);
        return statSync(itemPath).isFile();
      })
      .map(file => basename(file, '.workflow.yaml'));
  } catch {
    return [];
  }
}

/**
 * Get workflow definition content
 * @param {string} workflowName - Workflow name (without extension)
 * @returns {string|null} Workflow content or null if not found
 */
export function getWorkflowContent(workflowName) {
  const sourcePath = join(WORKFLOWS_LOCAL_DIR, `${workflowName}.workflow.yaml`);
  if (!existsSync(sourcePath)) {
    return null;
  }
  return readFileSync(sourcePath, 'utf-8');
}

/**
 * Parse workflow YAML to extract metadata
 * @param {string} content - Workflow YAML content
 * @returns {Object} Parsed workflow object
 */
export function parseWorkflow(content) {
  try {
    return yaml.load(content) || {};
  } catch {
    return {};
  }
}

/**
 * Valid step types for workflow validation
 */
const VALID_STEP_TYPES = ['agent', 'manual', 'conditional', 'parallel-agents'];

/**
 * Valid context modes for RLM-aware steps
 */
const VALID_CONTEXT_MODES = ['minimal', 'focused', 'full'];

/**
 * Valid merge strategies for parallel-agents steps
 */
const VALID_MERGE_STRATEGIES = ['aggregate', 'sequential', 'summary'];

/**
 * Valid context inheritance modes
 */
const VALID_CONTEXT_INHERITANCE = ['full', 'selective', 'summary'];

/**
 * Validate a workflow definition
 * @param {Object} workflow - Parsed workflow object
 * @returns {Object} Validation result { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateWorkflow(workflow) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!workflow.name) {
    errors.push('Missing required field: name');
  }
  if (!workflow.version) {
    errors.push('Missing required field: version');
  }
  if (!workflow.steps || !Array.isArray(workflow.steps)) {
    errors.push('Missing or invalid field: steps (must be an array)');
  }

  // Validate steps
  if (workflow.steps && Array.isArray(workflow.steps)) {
    workflow.steps.forEach((step, index) => {
      const stepId = step.id || `step[${index}]`;

      // Required step fields
      if (!step.id) {
        warnings.push(`Step ${index}: missing 'id' field`);
      }
      if (!step.type) {
        errors.push(`Step ${stepId}: missing required 'type' field`);
      } else if (!VALID_STEP_TYPES.includes(step.type)) {
        errors.push(`Step ${stepId}: invalid type '${step.type}'. Valid types: ${VALID_STEP_TYPES.join(', ')}`);
      }

      // Type-specific validation
      if (step.type === 'agent' || step.type === 'parallel-agents') {
        if (!step.agent) {
          errors.push(`Step ${stepId}: type '${step.type}' requires 'agent' field`);
        }
      }

      // Parallel-agents specific validation
      if (step.type === 'parallel-agents') {
        if (!step.foreach) {
          errors.push(`Step ${stepId}: parallel-agents requires 'foreach' field`);
        }
        if (step['context-mode'] && !VALID_CONTEXT_MODES.includes(step['context-mode'])) {
          errors.push(`Step ${stepId}: invalid context-mode '${step['context-mode']}'. Valid modes: ${VALID_CONTEXT_MODES.join(', ')}`);
        }
        if (step['merge-strategy'] && !VALID_MERGE_STRATEGIES.includes(step['merge-strategy'])) {
          errors.push(`Step ${stepId}: invalid merge-strategy '${step['merge-strategy']}'. Valid strategies: ${VALID_MERGE_STRATEGIES.join(', ')}`);
        }
      }

      // Context mode validation for any step
      if (step['context-mode'] && !VALID_CONTEXT_MODES.includes(step['context-mode'])) {
        errors.push(`Step ${stepId}: invalid context-mode '${step['context-mode']}'`);
      }
    });
  }

  // Validate context-strategy if present
  if (workflow['context-strategy']) {
    const cs = workflow['context-strategy'];
    if (cs['context-inheritance'] && !VALID_CONTEXT_INHERITANCE.includes(cs['context-inheritance'])) {
      errors.push(`context-strategy: invalid context-inheritance '${cs['context-inheritance']}'. Valid modes: ${VALID_CONTEXT_INHERITANCE.join(', ')}`);
    }
    if (cs['max-context-per-step'] && typeof cs['max-context-per-step'] !== 'number') {
      warnings.push('context-strategy: max-context-per-step should be a number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Extract RLM features used in a workflow
 * @param {Object} workflow - Parsed workflow object
 * @returns {Object} Features used { hasRlm, hasParallelAgents, contextModes, mergeStrategies }
 */
export function getWorkflowFeatures(workflow) {
  const features = {
    hasRlm: false,
    hasParallelAgents: false,
    contextModes: new Set(),
    mergeStrategies: new Set(),
    stepTypes: new Set(),
    agents: new Set()
  };

  // Check context-strategy
  if (workflow['context-strategy']) {
    features.hasRlm = workflow['context-strategy']['enable-rlm'] === true;
  }

  // Analyze steps
  if (workflow.steps && Array.isArray(workflow.steps)) {
    for (const step of workflow.steps) {
      if (step.type) {
        features.stepTypes.add(step.type);
      }

      if (step.type === 'parallel-agents') {
        features.hasParallelAgents = true;
      }

      if (step['context-mode']) {
        features.contextModes.add(step['context-mode']);
      }

      if (step['merge-strategy']) {
        features.mergeStrategies.add(step['merge-strategy']);
      }

      if (step.agent) {
        features.agents.add(step.agent);
      }
    }
  }

  // Convert Sets to Arrays for easier consumption
  return {
    hasRlm: features.hasRlm,
    hasParallelAgents: features.hasParallelAgents,
    contextModes: Array.from(features.contextModes),
    mergeStrategies: Array.from(features.mergeStrategies),
    stepTypes: Array.from(features.stepTypes),
    agents: Array.from(features.agents)
  };
}

/**
 * Get workflow summary for display
 * @param {string} workflowName - Workflow name
 * @returns {Object|null} Workflow summary or null if not found
 */
export function getWorkflowSummary(workflowName) {
  const content = getWorkflowContent(workflowName);
  if (!content) {
    return null;
  }

  const workflow = parseWorkflow(content);
  if (!workflow.name) {
    return null;
  }

  const features = getWorkflowFeatures(workflow);
  const validation = validateWorkflow(workflow);

  return {
    name: workflow.name,
    version: workflow.version || '0.0.0',
    description: workflow.description || '',
    stepCount: workflow.steps?.length || 0,
    category: workflow.metadata?.category || 'general',
    difficulty: workflow.metadata?.difficulty || 'unknown',
    features,
    validation: {
      valid: validation.valid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length
    }
  };
}

/**
 * Install workflows for a specific AI tool
 * @param {string} aiTool - AI tool identifier (e.g., 'claude-code', 'opencode')
 * @param {string} level - 'user' or 'project'
 * @param {string[]} workflowNames - Array of workflow names to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object} Installation result
 */
export async function installWorkflowsForTool(aiTool, level, workflowNames = null, projectPath = null) {
  const config = getAgentConfig(aiTool);
  const supportedTools = getWorkflowsSupportedAgents();

  if (!config || !supportedTools.includes(aiTool)) {
    return {
      success: false,
      aiTool,
      level,
      error: `AI tool '${aiTool}' does not support workflows installation`,
      installed: [],
      errors: []
    };
  }

  // Get target directory
  const targetDir = getWorkflowsDirForAgent(aiTool, level, projectPath);
  if (!targetDir) {
    return {
      success: false,
      aiTool,
      level,
      error: `Could not determine target directory for ${aiTool} at ${level} level`,
      installed: [],
      errors: []
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Get workflows to install
  const availableWorkflows = getAvailableWorkflowNames();
  const toInstall = workflowNames || availableWorkflows;

  const results = {
    success: true,
    aiTool,
    level,
    targetDir,
    installed: [],
    errors: [],
    fileHashes: {}
  };

  for (const workflowName of toInstall) {
    const result = installSingleWorkflow(workflowName, targetDir);
    if (result.success) {
      results.installed.push(workflowName);
    } else {
      results.errors.push({ workflow: workflowName, error: result.error });
      results.success = false;
    }
  }

  // Write manifest
  if (results.installed.length > 0) {
    writeWorkflowsManifest(aiTool, level, targetDir, results.installed);

    // Compute file hashes for tracking
    const now = new Date().toISOString();
    for (const workflowName of results.installed) {
      const filePath = join(targetDir, `${workflowName}.workflow.yaml`);
      const hashInfo = computeFileHash(filePath);
      if (hashInfo) {
        results.fileHashes[`${aiTool}/${workflowName}.workflow.yaml`] = {
          ...hashInfo,
          installedAt: now
        };
      }
    }
  }

  return results;
}

/**
 * Install a single workflow to target directory
 * @param {string} workflowName - Workflow name (without extension)
 * @param {string} targetDir - Target directory
 * @returns {Object} Result
 */
function installSingleWorkflow(workflowName, targetDir) {
  const sourcePath = join(WORKFLOWS_LOCAL_DIR, `${workflowName}.workflow.yaml`);
  const targetPath = join(targetDir, `${workflowName}.workflow.yaml`);

  if (!existsSync(sourcePath)) {
    return {
      success: false,
      workflow: workflowName,
      error: `Workflow not found: ${workflowName}`
    };
  }

  try {
    const content = readFileSync(sourcePath, 'utf-8');
    writeFileSync(targetPath, content);
    return { success: true, workflow: workflowName, path: targetPath };
  } catch (error) {
    return {
      success: false,
      workflow: workflowName,
      error: error.message
    };
  }
}

/**
 * Write workflows manifest
 * @param {string} aiTool - AI tool identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} targetDir - Target directory
 * @param {string[]} workflows - List of installed workflows
 */
function writeWorkflowsManifest(aiTool, level, targetDir, workflows) {
  const manifestPath = join(targetDir, '.manifest.json');
  const { version } = JSON.parse(
    readFileSync(join(CLI_ROOT, 'package.json'), 'utf-8')
  );

  const manifest = {
    version,
    source: 'universal-dev-standards',
    type: 'workflows',
    aiTool,
    level,
    workflows,
    installedDate: new Date().toISOString().split('T')[0]
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Get installed workflows info for an AI tool
 * @param {string} aiTool - AI tool identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object|null} Installed workflows info or null
 */
export function getInstalledWorkflowsForTool(aiTool, level = 'project', projectPath = null) {
  const targetDir = getWorkflowsDirForAgent(aiTool, level, projectPath);
  if (!targetDir || !existsSync(targetDir)) {
    return null;
  }

  const manifestPath = join(targetDir, '.manifest.json');

  // Count workflow files
  let workflowFiles = [];
  try {
    workflowFiles = readdirSync(targetDir)
      .filter(f => f.endsWith('.workflow.yaml'));
  } catch {
    return null;
  }

  if (workflowFiles.length === 0) {
    return null;
  }

  const getWorkflowName = (filename) => basename(filename, '.workflow.yaml');

  if (!existsSync(manifestPath)) {
    return {
      installed: true,
      count: workflowFiles.length,
      workflows: workflowFiles.map(getWorkflowName),
      version: null,
      aiTool,
      level,
      path: targetDir
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      count: workflowFiles.length,
      workflows: manifest.workflows || workflowFiles.map(getWorkflowName),
      version: manifest.version || null,
      aiTool,
      level,
      path: targetDir,
      installedDate: manifest.installedDate || null
    };
  } catch {
    return {
      installed: true,
      count: workflowFiles.length,
      workflows: workflowFiles.map(getWorkflowName),
      version: null,
      aiTool,
      level,
      path: targetDir
    };
  }
}

/**
 * Install workflows to multiple AI tools at once
 * @param {Array<{agent: string, level: string}>} installations - Array of installation targets
 * @param {string[]} workflowNames - Workflows to install (null = all)
 * @param {string} projectPath - Project root path
 * @returns {Object} Combined results
 */
export async function installWorkflowsToMultipleTools(installations, workflowNames = null, projectPath = null) {
  const results = {
    success: true,
    installations: [],
    totalInstalled: 0,
    totalErrors: 0,
    allFileHashes: {}
  };

  for (const { agent, level } of installations) {
    const result = await installWorkflowsForTool(agent, level, workflowNames, projectPath);
    results.installations.push(result);

    if (!result.success) {
      results.success = false;
    }
    results.totalInstalled += result.installed.length;
    results.totalErrors += result.errors.length;

    // Merge file hashes from this installation
    if (result.fileHashes) {
      Object.assign(results.allFileHashes, result.fileHashes);
    }
  }

  return results;
}

export default {
  installWorkflowsForTool,
  getInstalledWorkflowsForTool,
  installWorkflowsToMultipleTools,
  getAvailableWorkflowNames,
  getWorkflowContent,
  parseWorkflow,
  validateWorkflow,
  getWorkflowFeatures,
  getWorkflowSummary
};
