import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { exec } from 'child_process';
import util from 'util';
import { pathToFileURL } from 'node:url';
import { readManifest } from './copier.js';

const execAsync = util.promisify(exec);

export class StandardValidator {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.standardsDir = path.join(projectPath, '.standards');
  }

  /**
   * Validate a specific standard by ID
   * @param {string} standardId - The ID of the standard (e.g., 'project-structure')
   * @returns {Promise<Object>} Validation result { success: boolean, message: string, details: any }
   */
  async validate(standardId) {
    // 1. Find the standard file
    const standardFile = this.findStandardFile(standardId);
    if (!standardFile) {
      return {
        success: false,
        message: `Standard '${standardId}' is not installed in this project.`
      };
    }

    // 2. Parse the standard
    let standardConfig;
    try {
      const content = fs.readFileSync(standardFile, 'utf-8');
      standardConfig = yaml.load(content);
    } catch (e) {
      return {
        success: false,
        message: `Failed to parse standard file: ${e.message}`
      };
    }

    // 3. Check for physical_spec
    // Support both root-level (legacy v2 draft) and standard-level (v2 spec) physical_spec?
    // Spec says: { standard: ..., physical_spec: ... } at root.
    if (!standardConfig.physical_spec) {
      return {
        success: true,
        message: `Standard '${standardId}' does not have a Physical Spec defined. Skipped validation.`, 
        skipped: true
      };
    }

    const { type, validator, schema } = standardConfig.physical_spec;

    // 4. Execute Validation Logic based on type
    try {
      switch (type) {
        case 'filesystem_schema':
          return await this.validateFilesystem(schema, validator);
        case 'json_schema':
          return { success: false, message: 'JSON Schema validation not yet implemented' };
        case 'script_file':
          return await this.executeScriptValidator(validator, standardConfig);
        default:
           // If a generic command validator is present, use it
           if (validator && validator.command) {
             return await this.runCommandValidator(validator);
           }
           return { success: false, message: `Unknown physical spec type: ${type}` };
      }
    } catch (error) {
       return {
         success: false,
         message: `Validation execution failed: ${error.message}`
       };
    }
  }

  /**
   * Check if a filename potentially matches the requested standardId
   * @param {string} basename - File basename (without extension)
   * @param {string} standardId - Requested standard ID
   * @returns {boolean} True if potential match
   */
  _isPotentialMatch(basename, standardId) {
    // Clean basename: remove .ai suffix if present
    const cleanBasename = basename.endsWith('.ai')
      ? basename.slice(0, -3)
      : basename;

    // 1. Exact match
    if (cleanBasename === standardId) {
      return true;
    }

    // 2. Suffix-removed match: e.g., "security" matches "security-standards"
    const suffixes = ['-standards', '-guide'];
    for (const suffix of suffixes) {
      if (cleanBasename.endsWith(suffix)) {
        const withoutSuffix = cleanBasename.slice(0, -suffix.length);
        if (withoutSuffix === standardId) {
          return true;
        }
      }
    }

    // 3. Prefix match: basename starts with standardId followed by dash
    if (cleanBasename.startsWith(`${standardId}-`)) {
      return true;
    }

    return false;
  }

  /**
   * Verify if the file's internal standard.id matches the requested ID
   * @param {string} filePath - Full path to the standard file
   * @param {string} standardId - Requested standard ID
   * @returns {boolean} True if internal ID matches
   */
  _verifyInternalId(filePath, standardId) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(content);

      // Check standard.id field (Ground Truth)
      if (data && data.standard && data.standard.id === standardId) {
        return true;
      }

      // Also accept if no internal ID is defined (backward compatibility)
      // In this case, rely on filename matching
      if (!data || !data.standard || !data.standard.id) {
        return true;
      }

      return false;
    } catch {
      // If file cannot be parsed, rely on filename matching
      return true;
    }
  }

  findStandardFile(standardId) {
    // 1. Try to locate via manifest first (Smart ID Resolution)
    const manifest = readManifest(this.projectPath);
    if (manifest) {
      // Combine standards and extensions arrays for searching
      const allFiles = [
        ...(Array.isArray(manifest.standards) ? manifest.standards : []),
        ...(Array.isArray(manifest.extensions) ? manifest.extensions.filter(e => typeof e === 'string') : [])
      ];

      for (const filePath of allFiles) {
        const basename = path.basename(filePath, path.extname(filePath));

        // Check if this file is a potential match
        if (this._isPotentialMatch(basename, standardId)) {
          const fullPath = path.join(this.projectPath, filePath);

          if (fs.existsSync(fullPath)) {
            // Verify via internal standard.id (Ground Truth)
            if (this._verifyInternalId(fullPath, standardId)) {
              return fullPath;
            }
          }
        }
      }
    }

    // 2. Fallback: direct name check in .standards/ directory
    // Try exact match first
    const exactAiPath = path.join(this.standardsDir, `${standardId}.ai.yaml`);
    if (fs.existsSync(exactAiPath)) return exactAiPath;

    // Try with common suffixes
    const suffixes = ['-standards', '-guide'];
    for (const suffix of suffixes) {
      const suffixedPath = path.join(this.standardsDir, `${standardId}${suffix}.ai.yaml`);
      if (fs.existsSync(suffixedPath)) {
        if (this._verifyInternalId(suffixedPath, standardId)) {
          return suffixedPath;
        }
      }
    }

    // Try .md (less likely to have physical spec, but possible in hybrid future)
    const mdPath = path.join(this.standardsDir, `${standardId}.md`);
    if (fs.existsSync(mdPath)) return mdPath;

    return null;
  }

  async runCommandValidator(validator) {
    const { command, rule } = validator;
    try {
      const { stdout } = await execAsync(command, { cwd: this.projectPath });
      return {
        success: true,
        message: `Passed rule: ${rule}`,
        details: stdout.trim()
      };
    } catch (e) {
      return {
        success: false,
        message: `Failed rule: ${rule}`,
        details: e.message + (e.stderr ? `\nStderr: ${e.stderr}` : '')
      };
    }
  }

  async validateFilesystem(schema, validator) {
    // If validator command is provided, use it primarily
    if (validator && validator.command) {
      return await this.runCommandValidator(validator);
    }

    // Native Node.js validation for cross-platform stability
    const missing = [];
    
    // Check required directories
    if (schema && schema.root && schema.root.required) {
      for (const dir of schema.root.required) {
        if (!fs.existsSync(path.join(this.projectPath, dir))) {
          missing.push(dir);
        }
      }
    } else if (!schema) {
       return { success: false, message: 'No filesystem schema defined' };
    }
    
    if (missing.length > 0) {
      return {
        success: false,
        message: `Missing required directories: ${missing.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: 'Project structure matches required schema.'
    };
  }

  async executeScriptValidator(validatorConfig, standardConfig) {
    const { script_path } = validatorConfig;
    if (!script_path) throw new Error('Missing script_path for script_file validator');

    // Resolve script path
    let fullScriptPath = path.join(this.standardsDir, 'validators', script_path);
    if (!fs.existsSync(fullScriptPath)) {
      fullScriptPath = path.join(this.projectPath, script_path);
    }

    if (!fs.existsSync(fullScriptPath)) {
      throw new Error(`Validator script not found: ${fullScriptPath}`);
    }

    try {
      // Dynamic import
      const module = await import(pathToFileURL(fullScriptPath).href);
      if (typeof module.validate !== 'function') {
        throw new Error('Validator script must export a validate() function');
      }

      return await module.validate({
        projectPath: this.projectPath,
        config: standardConfig
      });
    } catch (e) {
      return {
        success: false,
        message: `Script execution error: ${e.message}`,
        details: e.stack
      };
    }
  }

  /**
   * Validate spec file effective line count against size thresholds.
   * Excludes YAML frontmatter (--- to ---) and fenced code blocks (``` to ```).
   * @param {string} specFilePath - Absolute path to the spec file
   * @param {Object} [options] - Optional thresholds
   * @param {number} [options.targetLines=300] - Warning threshold
   * @param {number} [options.hardCapLines=400] - Fail threshold
   * @returns {{ effectiveLines: number, status: 'pass'|'warn'|'fail', message: string }}
   */
  validateSpecSize(specFilePath, options = {}) {
    const targetLines = options.targetLines ?? 300;
    const hardCapLines = options.hardCapLines ?? 400;

    const content = fs.readFileSync(specFilePath, 'utf-8');
    if (content.trim() === '') {
      return { effectiveLines: 0, status: 'pass', message: 'Spec within target: 0 lines' };
    }
    const allLines = content.split('\n');

    let effectiveLines = 0;
    let inFrontmatter = false;
    let frontmatterSeen = false;
    let inCodeBlock = false;

    for (const line of allLines) {
      const trimmed = line.trim();

      // YAML frontmatter: first --- opens, second --- closes
      if (trimmed === '---' && !frontmatterSeen) {
        inFrontmatter = !inFrontmatter;
        if (!inFrontmatter) frontmatterSeen = true;
        continue;
      }
      if (inFrontmatter) continue;

      // Fenced code blocks: ``` toggles
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      effectiveLines++;
    }

    let status;
    let message;
    if (effectiveLines > hardCapLines) {
      status = 'fail';
      message = `Spec exceeds hard cap: ${effectiveLines} lines (hard cap: ${hardCapLines})`;
    } else if (effectiveLines > targetLines) {
      status = 'warn';
      message = `Spec exceeds target: ${effectiveLines} lines (target: ${targetLines})`;
    } else {
      status = 'pass';
      message = `Spec within target: ${effectiveLines} lines`;
    }

    return { effectiveLines, status, message };
  }

  /**
   * Compute spec quality score based on heuristic checklist
   * @param {Object} spec - Parsed spec object
   * @param {string} [specMode] - 'standard' (10 items) or 'boost' (25 items)
   * @returns {{ score: number, maxScore: number, items: Array<{id: number, description: string, passed: boolean}> }}
   */
  computeSpecScore(spec, specMode) {
    const mode = specMode || spec.specMode || 'standard';
    const items = this._getStandardChecklist(spec);

    if (mode === 'boost') {
      items.push(...this._getBoostChecklist(spec));
    }

    const score = items.filter(i => i.passed).length;
    return { score, maxScore: items.length, items };
  }

  /** @private Standard mode checklist (10 items) */
  _getStandardChecklist(spec) {
    return [
      { id: 1, description: 'Background and motivation are clear', passed: !!(spec.intent && spec.intent.length > 10) },
      { id: 2, description: 'Goals are measurable', passed: Array.isArray(spec.acceptance) && spec.acceptance.length > 0 },
      { id: 3, description: 'Non-goals are explicit', passed: !!(spec.notes && spec.notes.length > 0 && spec.notes !== '') },
      { id: 4, description: 'Risks identified with mitigations', passed: Array.isArray(spec.risks) && spec.risks.length > 0 },
      { id: 5, description: 'Impact scope assessed', passed: !!(spec.scope && spec.scope !== 'general') },
      { id: 6, description: 'Requirements are specific and splittable', passed: Array.isArray(spec.acceptance) && spec.acceptance.length >= 2 },
      { id: 7, description: 'Boundary conditions identified', passed: Array.isArray(spec.edgeCases) && spec.edgeCases.length > 0 },
      { id: 8, description: 'Technical solution is concrete', passed: !!(spec.scope && spec.scope.includes('/')) },
      { id: 9, description: 'Dependencies are clear', passed: Array.isArray(spec.dependsOn) },
      { id: 10, description: 'No blocking open questions', passed: !Array.isArray(spec.openQuestions) || spec.openQuestions.length === 0 },
    ];
  }

  /** @private Boost mode additional checklist (15 items, IDs 11-25) */
  _getBoostChecklist(spec) {
    return [
      { id: 11, description: 'All user stories have clear acceptance criteria', passed: Array.isArray(spec.userStories) && spec.userStories.length > 0 },
      { id: 12, description: 'Functional requirements cover all user stories', passed: Array.isArray(spec.acceptance) && spec.acceptance.length >= (spec.userStories || []).length },
      { id: 13, description: 'Non-functional requirements defined', passed: Array.isArray(spec.nonFunctionalRequirements) && spec.nonFunctionalRequirements.length > 0 },
      { id: 14, description: 'Edge cases identified and documented', passed: Array.isArray(spec.edgeCases) && spec.edgeCases.length > 0 },
      { id: 15, description: 'Data model changes described', passed: !!(spec.dataModelChanges) },
      { id: 16, description: 'Spec aligns with proposal goals', passed: !!(spec.motivation && spec.motivation.length > 10) },
      { id: 17, description: 'User stories cover all proposal goals', passed: Array.isArray(spec.userStories) && spec.userStories.length > 0 },
      { id: 18, description: 'Acceptance criteria are testable', passed: Array.isArray(spec.acceptance) && spec.acceptance.some(a => /AC-\d/.test(a)) },
      { id: 19, description: 'No contradicting requirements', passed: true }, // Heuristic: assume no contradictions
      { id: 20, description: 'Dependencies are clear', passed: Array.isArray(spec.dependsOn) },
      { id: 21, description: 'Task granularity is reasonable', passed: Array.isArray(spec.tasks) && spec.tasks.length > 0 },
      { id: 22, description: 'Dependencies are correct', passed: Array.isArray(spec.dependsOn) },
      { id: 23, description: 'Parallel tasks marked correctly', passed: Array.isArray(spec.tasks) && spec.tasks.length >= 2 },
      { id: 24, description: 'File paths specified', passed: Array.isArray(spec.tasks) && spec.tasks.some(t => t.filePath) },
      { id: 25, description: 'Checkpoints are reasonable', passed: !!(spec.confirmed) },
    ];
  }

  /**
   * Run a simulation to predict compliance with a standard
   * @param {string} standardId - Standard ID
   * @param {string} input - Input to test (e.g. commit message)
   * @returns {Promise<Object>} Simulation result
   */
  async simulate(standardId, input) {
    const standardFile = this.findStandardFile(standardId);
    if (!standardFile) {
      return { success: false, message: `Standard '${standardId}' not found.` };
    }

    let standardConfig;
    try {
      standardConfig = yaml.load(fs.readFileSync(standardFile, 'utf-8'));
    } catch (e) {
      return { success: false, message: `Failed to parse standard: ${e.message}` };
    }

    if (!standardConfig.physical_spec || !standardConfig.physical_spec.simulator) {
      return { 
        success: false, 
        message: `Standard '${standardId}' does not support simulation (no 'simulator' spec defined).` 
      };
    }

    const { command } = standardConfig.physical_spec.simulator;
    
    // Sanitization: Escape double quotes to prevent breaking the echo command
    // This is a basic implementation. For production, consider using spawn with stdin stream.
    const sanitizedInput = input.replace(/"/g, '\\"');
    const finalCommand = command.replace('{input}', sanitizedInput);

    try {
      const { stdout } = await execAsync(finalCommand, { cwd: this.projectPath });
      return {
        success: true,
        message: 'Simulation passed',
        details: stdout.trim()
      };
    } catch (e) {
      return {
        success: false,
        message: 'Simulation failed',
        details: e.message + (e.stdout ? `\nOutput: ${e.stdout}` : '')
      };
    }
  }
}
