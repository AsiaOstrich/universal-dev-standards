import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { exec } from 'child_process';
import util from 'util';
import { pathToFileURL } from 'node:url';
import { StandardValidator } from './standard-validator.js';

const execAsync = util.promisify(exec);

export class StandardFixer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.validator = new StandardValidator(projectPath);
    this.standardsDir = path.join(projectPath, '.standards');
  }

  /**
   * Attempt to fix a standard violation
   * @param {string} standardId - The ID of the standard
   * @returns {Promise<Object>} Fix result
   */
  async fix(standardId) {
    // 1. Check if already valid
    const preCheck = await this.validator.validate(standardId);
    if (preCheck.success) {
      return { success: true, message: 'Standard is already valid.', status: 'skipped' };
    }

    // 2. Find standard file
    const standardFile = this.validator.findStandardFile(standardId);
    if (!standardFile) {
      return { success: false, message: `Standard '${standardId}' not found.` };
    }

    // 3. Load config
    let standardConfig;
    try {
      standardConfig = yaml.load(fs.readFileSync(standardFile, 'utf-8'));
    } catch (e) {
      return { success: false, message: `Failed to parse standard: ${e.message}` };
    }

    if (!standardConfig.physical_spec || !standardConfig.physical_spec.fixer) {
      return { 
        success: false, 
        message: `Standard '${standardId}' does not have a fixer defined.`,
        status: 'no_fixer'
      };
    }

    const { fixer } = standardConfig.physical_spec;

    // 4. Execute Fixer
    try {
      if (fixer.type === 'command') {
        if (!fixer.command) throw new Error('Fixer type is command but no command provided');
        await execAsync(fixer.command, { cwd: this.projectPath });
      } else if (fixer.type === 'copy_template') {
        await this.executeCopyTemplate(fixer);
      } else if (fixer.type === 'script_file') {
        await this.executeScriptFixer(fixer, standardConfig);
      } else {
        throw new Error(`Unknown fixer type: ${fixer.type}`);
      }
    } catch (e) {
      return { 
        success: false, 
        message: `Fix execution failed: ${e.message}`,
        details: e.stderr || e.stdout || e.stack
      };
    }

    // 5. Verify Fix
    const postCheck = await this.validator.validate(standardId);
    if (postCheck.success) {
      return { success: true, message: 'Fix applied and verified successfully.', status: 'fixed' };
    } else {
      return { 
        success: false, 
        message: 'Fix applied but validation still failed.', 
        details: postCheck.message,
        status: 'partial'
      };
    }
  }

  async executeScriptFixer(fixerConfig, standardConfig) {
    const { script_path } = fixerConfig;
    if (!script_path) throw new Error('Missing script_path for script_file fixer');

    // Resolve script path
    let fullScriptPath = path.join(this.standardsDir, 'fixers', script_path);
    if (!fs.existsSync(fullScriptPath)) {
      fullScriptPath = path.join(this.projectPath, script_path);
    }

    if (!fs.existsSync(fullScriptPath)) {
      throw new Error(`Fixer script not found: ${fullScriptPath}`);
    }

    // Dynamic import
    const module = await import(pathToFileURL(fullScriptPath).href);
    if (typeof module.fix !== 'function') {
      throw new Error('Fixer script must export a fix() function');
    }

    await module.fix({
      projectPath: this.projectPath,
      config: standardConfig
    });
  }

  async executeCopyTemplate(fixer) {
    if (!fixer.template_file || !fixer.destination) {
      throw new Error('Missing template_file or destination for copy_template fixer');
    }

    // Resolve template path
    // Priority: 1. Project .standards/templates/ 2. Absolute/Relative from standards dir
    let templatePath = path.join(this.standardsDir, 'templates', fixer.template_file);
    if (!fs.existsSync(templatePath)) {
        // Fallback: try relative to standard file location? Or just relative to project root?
        templatePath = path.join(this.projectPath, fixer.template_file);
    }
    
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }

    const destPath = path.join(this.projectPath, fixer.destination);
    
    // Ensure dest dir exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(templatePath, destPath);
  }
}
