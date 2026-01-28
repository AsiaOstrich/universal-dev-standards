import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

export class ConfigLoader {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.globalPath = path.join(os.homedir(), '.udsrc');
    this.projectPath = path.join(this.cwd, '.uds', 'config.yaml');
  }

  /**
   * Load global configuration from ~/.udsrc
   * @returns {Object}
   */
  loadGlobal() {
    return this._loadFile(this.globalPath);
  }

  /**
   * Load project configuration from ./.uds/config.yaml
   * @returns {Object}
   */
  loadProject() {
    return this._loadFile(this.projectPath);
  }

  /**
   * Internal helper to load and parse YAML/JSON
   * @private
   */
  _loadFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // js-yaml handles both JSON and YAML
      return yaml.load(content) || {};
    } catch (error) {
      console.warn(`Warning: Failed to load config at ${filePath}: ${error.message}`);
      return {};
    }
  }
}
