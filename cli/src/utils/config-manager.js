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
      },
      updateCheck: {
        enabled: true,
        intervalMs: 86400000  // 24 hours
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

/**
 * Read the adopter-declared install settings from `.uds/install.yaml`.
 *
 * This file is a *declarative* install descriptor (distinct from
 * `.uds/config.yaml` which holds runtime preferences). Adopters use it to
 * pin install-time choices — most importantly `locale:` — so they do not
 * need to pass `--locale` every time they run `uds init`/`uds update`.
 *
 * Locale resolution order (XSPEC-239 §Req-3 / P1-CLI-2 + P1-CLI-3):
 *   CLI `--locale` > install.yaml `locale:` > `UDS_LOCALE` env > LANG > 'en'
 *
 * @param {string} projectPath - Project root path
 * @returns {{locale: string|null, [key: string]: any}} Parsed YAML object, or
 *   an empty object when the file is missing/unreadable. `locale` is always
 *   present (null when not declared) so callers can safely do `.locale`.
 */
export function readInstallYaml(projectPath) {
  if (!projectPath) {
    return { locale: null };
  }

  const filePath = path.join(projectPath, '.uds', 'install.yaml');
  if (!fs.existsSync(filePath)) {
    return { locale: null };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.load(content);
    if (!parsed || typeof parsed !== 'object') {
      return { locale: null };
    }
    return { locale: null, ...parsed };
  } catch (error) {
    console.warn(`Warning: Failed to load .uds/install.yaml: ${error.message}`);
    return { locale: null };
  }
}
