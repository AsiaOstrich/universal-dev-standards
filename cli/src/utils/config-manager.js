import { ConfigLoader } from './config-loader.js';
import { ConfigMerger } from './config-merger.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export class ConfigManager {
  constructor(cwd = process.cwd()) {
    this.loader = new ConfigLoader(cwd);
    this.config = {};
    this.initialized = false;
  }

  /**
   * Initialize and merge all configurations
   */
  init() {
    const globalConfig = this.loader.loadGlobal();
    const projectConfig = this.loader.loadProject();

    // Built-in defaults
    const defaults = {
      ui: {
        language: 'en',
        emoji: true
      },
      hitl: {
        threshold: 2
      },
      'vibe-coding': {
        enabled: false
      }
    };

    // Merge: Defaults <- Global <- Project
    this.config = ConfigMerger.merge(defaults, globalConfig);
    this.config = ConfigMerger.merge(this.config, projectConfig);
    
    this.initialized = true;
    return this.config;
  }

  /**
   * Get a configuration value using dot notation
   * @param {string} keyPath - e.g. 'ui.language'
   * @param {*} defaultValue
   */
  get(keyPath, defaultValue) {
    if (!this.initialized) this.init();

    const parts = keyPath.split('.');
    let current = this.config;

    for (const part of parts) {
      if (current === null || typeof current !== 'object' || !(part in current)) {
        return defaultValue;
      }
      current = current[part];
    }

    return current !== undefined ? current : defaultValue;
  }

  /**
   * Set a configuration value and persist to disk
   * @param {string} keyPath 
   * @param {*} value 
   * @param {string} scope - 'global' or 'project'
   */
  set(keyPath, value, scope = 'project') {
    if (!this.initialized) this.init();

    const parts = keyPath.split('.');
    const filePath = scope === 'global' ? this.loader.globalPath : this.loader.projectPath;
    
    // Load existing file content to preserve other settings
    let fileContent = {};
    if (fs.existsSync(filePath)) {
      try {
        fileContent = yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
      } catch (e) {
        fileContent = {};
      }
    }

    // Update value in fileContent object
    let current = fileContent;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) current[part] = {};
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;

    // Persist to disk
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, yaml.dump(fileContent), 'utf8');

    // Re-initialize to update in-memory config
    this.init();
  }
}

// Singleton instance for the CLI
export const config = new ConfigManager();
