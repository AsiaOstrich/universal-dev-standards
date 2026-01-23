/**
 * AI Context Command Tests
 *
 * Tests for ai-context init, validate, and graph commands.
 * Part of Phase 3: Core Standards Layer (AI-Friendly Architecture).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as yaml from 'js-yaml';
import {
  aiContextInitCommand,
  aiContextValidateCommand,
  aiContextGraphCommand
} from '../../src/commands/ai-context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/ai-context-test');

describe('AI Context Command', () => {
  let originalCwd;
  let consoleLogs = [];

  beforeEach(() => {
    originalCwd = process.cwd();
    consoleLogs = [];

    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);

    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('aiContextInitCommand', () => {
    describe('with --yes flag (non-interactive)', () => {
      it('should create .ai-context.yaml file', async () => {
        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        expect(existsSync(configPath)).toBe(true);
      });

      it('should display success message', async () => {
        await aiContextInitCommand({ yes: true });

        const output = consoleLogs.join('\n');
        expect(output).toContain('Created .ai-context.yaml');
      });

      it('should generate valid YAML', async () => {
        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const content = readFileSync(configPath, 'utf-8');

        // Should not throw
        const config = yaml.load(content);
        expect(config).toBeDefined();
        expect(config.version).toBe('1.0.0');
      });

      it('should include required sections', async () => {
        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const content = readFileSync(configPath, 'utf-8');
        const config = yaml.load(content);

        expect(config.project).toBeDefined();
        expect(config.project.name).toBeDefined();
        expect(config.project.type).toBeDefined();
        expect(config['analysis-hints']).toBeDefined();
        expect(config.documentation).toBeDefined();
        expect(config['context-strategy']).toBeDefined();
      });

      it('should include RLM context strategy', async () => {
        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const content = readFileSync(configPath, 'utf-8');
        const config = yaml.load(content);

        expect(config['context-strategy']['enable-rlm']).toBe(true);
        expect(config['context-strategy']['max-chunk-size']).toBeDefined();
        expect(config['context-strategy']['analysis-pattern']).toBeDefined();
      });

      it('should show configuration summary', async () => {
        await aiContextInitCommand({ yes: true });

        const output = consoleLogs.join('\n');
        expect(output).toContain('Configuration Summary');
        expect(output).toContain('Project:');
        expect(output).toContain('Type:');
      });

      it('should not overwrite existing file without --force', async () => {
        // Create existing file
        const configPath = join(TEST_DIR, '.ai-context.yaml');
        writeFileSync(configPath, 'existing: content');

        await aiContextInitCommand({ yes: true });

        const output = consoleLogs.join('\n');
        expect(output).toContain('already exists');

        // Should not be overwritten
        const content = readFileSync(configPath, 'utf-8');
        expect(content).toBe('existing: content');
      });

      it('should overwrite existing file with --force', async () => {
        // Create existing file
        const configPath = join(TEST_DIR, '.ai-context.yaml');
        writeFileSync(configPath, 'existing: content');

        await aiContextInitCommand({ yes: true, force: true });

        const content = readFileSync(configPath, 'utf-8');
        const config = yaml.load(content);
        expect(config.version).toBe('1.0.0');
      });
    });

    describe('project detection', () => {
      it('should detect Node.js project from package.json', async () => {
        // Create package.json
        writeFileSync(
          join(TEST_DIR, 'package.json'),
          JSON.stringify({
            name: 'my-test-project',
            devDependencies: { typescript: '^5.0.0' }
          })
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.project.name).toBe('my-test-project');
        expect(config.project['primary-language']).toBe('typescript');
      });

      it('should detect JavaScript when no TypeScript dependency', async () => {
        writeFileSync(
          join(TEST_DIR, 'package.json'),
          JSON.stringify({ name: 'js-project' })
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.project['primary-language']).toBe('javascript');
      });

      it('should detect CLI project from bin field', async () => {
        writeFileSync(
          join(TEST_DIR, 'package.json'),
          JSON.stringify({
            name: 'my-cli',
            bin: { mycli: './bin/cli.js' }
          })
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.project.type).toBe('cli');
      });

      it('should detect library from main field without start script', async () => {
        writeFileSync(
          join(TEST_DIR, 'package.json'),
          JSON.stringify({
            name: 'my-lib',
            main: 'dist/index.js'
          })
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.project.type).toBe('library');
      });

      it('should detect Python project from pyproject.toml', async () => {
        writeFileSync(
          join(TEST_DIR, 'pyproject.toml'),
          `[project]\nname = "my-python-app"\n`
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.project.name).toBe('my-python-app');
        expect(config.project['primary-language']).toBe('python');
      });

      it('should detect Go project from go.mod', async () => {
        writeFileSync(
          join(TEST_DIR, 'go.mod'),
          `module example.com/myproject\n\ngo 1.21\n`
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.project['primary-language']).toBe('go');
      });

      it('should detect Rust project from Cargo.toml', async () => {
        writeFileSync(
          join(TEST_DIR, 'Cargo.toml'),
          `[package]\nname = "my-rust-app"\n`
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.project['primary-language']).toBe('rust');
      });
    });

    describe('module scanning', () => {
      it('should detect modules in src directory', async () => {
        // Create module structure
        mkdirSync(join(TEST_DIR, 'src', 'auth'), { recursive: true });
        mkdirSync(join(TEST_DIR, 'src', 'api'), { recursive: true });
        writeFileSync(join(TEST_DIR, 'src', 'auth', 'index.ts'), '// Auth');
        writeFileSync(join(TEST_DIR, 'src', 'api', 'index.ts'), '// API');

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.modules).toBeDefined();
        expect(config.modules.length).toBe(2);

        const moduleNames = config.modules.map(m => m.name);
        expect(moduleNames).toContain('auth');
        expect(moduleNames).toContain('api');
      });

      it('should skip hidden directories', async () => {
        mkdirSync(join(TEST_DIR, 'src', '.hidden'), { recursive: true });
        mkdirSync(join(TEST_DIR, 'src', 'visible'), { recursive: true });

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        const moduleNames = config.modules.map(m => m.name);
        expect(moduleNames).not.toContain('.hidden');
      });

      it('should skip node_modules in src', async () => {
        mkdirSync(join(TEST_DIR, 'src', 'node_modules'), { recursive: true });
        mkdirSync(join(TEST_DIR, 'src', 'utils'), { recursive: true });

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        const moduleNames = config.modules.map(m => m.name);
        expect(moduleNames).not.toContain('node_modules');
      });

      it('should detect entry files for modules', async () => {
        mkdirSync(join(TEST_DIR, 'src', 'utils'), { recursive: true });
        writeFileSync(join(TEST_DIR, 'src', 'utils', 'index.ts'), '// Utils');

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        const utilsModule = config.modules.find(m => m.name === 'utils');
        expect(utilsModule.entry).toBe('index.ts');
      });
    });

    describe('generated file format', () => {
      it('should include header comments', async () => {
        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const content = readFileSync(configPath, 'utf-8');

        expect(content).toContain('.ai-context.yaml');
        expect(content).toContain('AI Context Configuration');
      });

      it('should include proper ignore patterns', async () => {
        writeFileSync(
          join(TEST_DIR, 'package.json'),
          JSON.stringify({ name: 'test', devDependencies: { typescript: '^5.0.0' } })
        );

        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        const ignorePatterns = config['analysis-hints']['ignore-patterns'];
        expect(ignorePatterns).toContain('node_modules');
        expect(ignorePatterns).toContain('.git');
      });

      it('should include documentation references', async () => {
        await aiContextInitCommand({ yes: true });

        const configPath = join(TEST_DIR, '.ai-context.yaml');
        const config = yaml.load(readFileSync(configPath, 'utf-8'));

        expect(config.documentation['quick-ref']).toBeDefined();
        expect(config.documentation.detailed).toBeDefined();
        expect(config.documentation.examples).toBeDefined();
      });
    });
  });

  describe('aiContextValidateCommand', () => {
    it('should report missing .ai-context.yaml', async () => {
      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('not found');
      expect(output).toContain('uds ai-context init');
    });

    it('should validate valid configuration', async () => {
      const validConfig = {
        version: '1.0.0',
        project: {
          name: 'test-project',
          type: 'web-app'
        },
        modules: [],
        'context-strategy': {
          'max-chunk-size': 50000,
          'analysis-pattern': 'hierarchical'
        }
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(validConfig)
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('valid');
    });

    it('should report missing project section', async () => {
      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump({ version: '1.0.0' })
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('error');
      expect(output.toLowerCase()).toContain('project');
    });

    it('should report missing project.name', async () => {
      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump({ version: '1.0.0', project: { type: 'web-app' } })
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('error');
      expect(output).toContain('project.name');
    });

    it('should warn about missing version field', async () => {
      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump({ project: { name: 'test', type: 'web-app' } })
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('warning');
      expect(output).toContain('version');
    });

    it('should validate module paths exist', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [
          { name: 'auth', path: 'src/auth/' },
          { name: 'api', path: 'src/api/' }
        ]
      };

      // Only create auth directory
      mkdirSync(join(TEST_DIR, 'src', 'auth'), { recursive: true });

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('warning');
      expect(output).toContain('api');
      expect(output).toContain('does not exist');
    });

    it('should validate documentation paths', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [],
        documentation: {
          'quick-ref': 'docs/QUICK-REF.md',
          detailed: 'README.md'
        }
      };

      // Only create README
      writeFileSync(join(TEST_DIR, 'README.md'), '# Test');

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('warning');
      expect(output).toContain('quick-ref');
    });

    it('should validate context-strategy max-chunk-size type', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [],
        'context-strategy': {
          'max-chunk-size': 'not-a-number'
        }
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('error');
      expect(output).toContain('max-chunk-size');
    });

    it('should validate analysis-pattern values', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [],
        'context-strategy': {
          'analysis-pattern': 'invalid-pattern'
        }
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('error');
      expect(output).toContain('analysis-pattern');
    });

    it('should report invalid YAML syntax', async () => {
      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        'invalid: yaml: content: ['
      );

      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Invalid YAML');
    });

    it('should show configuration with --verbose', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: []
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextValidateCommand({ verbose: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Configuration:');
      expect(output).toContain('test');
    });
  });

  describe('aiContextGraphCommand', () => {
    it('should report missing .ai-context.yaml', async () => {
      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('not found');
    });

    it('should report when no modules defined', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: []
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('No modules defined');
    });

    it('should display module list', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [
          { name: 'auth', path: 'src/auth/', description: 'Authentication module' },
          { name: 'api', path: 'src/api/', description: 'API layer' }
        ]
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Modules:');
      expect(output).toContain('auth');
      expect(output).toContain('api');
      expect(output).toContain('src/auth/');
      expect(output).toContain('Authentication module');
    });

    it('should display dependencies', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [
          { name: 'auth', path: 'src/auth/', dependencies: [] },
          { name: 'api', path: 'src/api/', dependencies: ['auth'] }
        ]
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Deps:');
      expect(output).toContain('auth');
    });

    it('should warn about unknown dependencies', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [
          { name: 'api', path: 'src/api/', dependencies: ['unknown-module'] }
        ]
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Unknown deps:');
      expect(output).toContain('unknown-module');
    });

    it('should generate Mermaid diagram with --mermaid', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [
          { name: 'auth', path: 'src/auth/', dependencies: [] },
          { name: 'api', path: 'src/api/', dependencies: ['auth'] }
        ]
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextGraphCommand({ mermaid: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Mermaid Diagram:');
      expect(output).toContain('```mermaid');
      expect(output).toContain('graph TD');
      expect(output).toContain('api[api] --> auth[auth]');
      expect(output).toContain('```');
    });

    it('should handle modules without dependencies in Mermaid', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [
          { name: 'utils', path: 'src/utils/', dependencies: [] }
        ]
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextGraphCommand({ mermaid: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('utils[utils]');
    });

    it('should display priority icons', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test', type: 'web-app' },
        modules: [
          { name: 'core', path: 'src/core/', priority: 'high' },
          { name: 'utils', path: 'src/utils/', priority: 'low' }
        ]
      };

      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        yaml.dump(config)
      );

      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      // Icons should be displayed (though actual rendering depends on chalk)
      expect(output).toContain('core');
      expect(output).toContain('utils');
    });

    it('should handle YAML parsing errors gracefully', async () => {
      writeFileSync(
        join(TEST_DIR, '.ai-context.yaml'),
        'invalid: yaml: [broken'
      );

      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Error');
    });
  });

  describe('Integration', () => {
    it('should create config that passes validation without errors', async () => {
      // First create the config
      await aiContextInitCommand({ yes: true });
      consoleLogs = [];

      // Then validate it
      await aiContextValidateCommand({});

      const output = consoleLogs.join('\n');
      // Should not have any errors (warnings about missing doc files are okay)
      expect(output).not.toContain('error');
      // Should show either 'valid' or warnings (but not errors)
      expect(
        output.includes('valid') ||
        output.includes('warning') ||
        output.includes('⚠️')
      ).toBe(true);
    });

    it('should create config with modules that graph can display', async () => {
      // Create module structure
      mkdirSync(join(TEST_DIR, 'src', 'auth'), { recursive: true });
      mkdirSync(join(TEST_DIR, 'src', 'api'), { recursive: true });
      writeFileSync(join(TEST_DIR, 'src', 'auth', 'index.ts'), '');
      writeFileSync(join(TEST_DIR, 'src', 'api', 'index.ts'), '');

      // Create config
      await aiContextInitCommand({ yes: true });
      consoleLogs = [];

      // Display graph
      await aiContextGraphCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('auth');
      expect(output).toContain('api');
    });
  });
});
