/**
 * AI Context Command
 *
 * CLI commands for managing .ai-context.yaml configuration files.
 * Helps projects configure AI-friendly architecture settings.
 *
 * @version 1.0.0
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import * as yaml from 'js-yaml';

/**
 * AI Context init command - generate .ai-context.yaml
 */
export async function aiContextInitCommand(options) {
  const projectPath = process.cwd();
  const configPath = join(projectPath, '.ai-context.yaml');

  console.log();
  console.log(chalk.bold('🤖 AI Context Configuration Generator'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // Check if already exists
  if (existsSync(configPath) && !options.force) {
    console.log(chalk.yellow('⚠️  .ai-context.yaml already exists.'));
    console.log(chalk.gray('   Use --force to overwrite.'));
    console.log();
    return;
  }

  // Auto-detect project info
  const projectInfo = detectProjectInfo(projectPath);

  let config;

  if (options.yes) {
    // Non-interactive mode
    config = generateConfig(projectInfo, projectPath);
  } else {
    // Interactive mode
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: projectInfo.name
      },
      {
        type: 'list',
        name: 'type',
        message: 'Project type:',
        choices: ['web-app', 'library', 'cli', 'api', 'monorepo', 'mobile', 'other'],
        default: projectInfo.type
      },
      {
        type: 'list',
        name: 'language',
        message: 'Primary language:',
        choices: ['typescript', 'javascript', 'python', 'go', 'rust', 'java', 'other'],
        default: projectInfo.language
      },
      {
        type: 'list',
        name: 'architecture',
        message: 'Architecture type:',
        choices: ['layered', 'microservices', 'modular', 'monolith', 'event-driven'],
        default: 'layered'
      },
      {
        type: 'confirm',
        name: 'scanModules',
        message: 'Scan for modules automatically?',
        default: true
      }
    ]);

    config = generateConfig({
      ...projectInfo,
      ...answers
    }, projectPath, answers.scanModules);
  }

  // Write configuration
  const yamlContent = generateYamlWithComments(config);
  writeFileSync(configPath, yamlContent);

  console.log();
  console.log(chalk.green('✅ Created .ai-context.yaml'));
  console.log(chalk.gray(`   ${configPath}`));
  console.log();

  // Show summary
  console.log(chalk.bold('Configuration Summary:'));
  console.log(`  Project: ${chalk.cyan(config.project.name)}`);
  console.log(`  Type: ${chalk.cyan(config.project.type)}`);
  console.log(`  Language: ${chalk.cyan(config.project['primary-language'])}`);
  console.log(`  Modules: ${chalk.cyan(config.modules?.length || 0)} detected`);
  console.log();

  if (config.modules?.length > 0) {
    console.log(chalk.bold('Detected Modules:'));
    for (const mod of config.modules) {
      console.log(`  • ${chalk.cyan(mod.name)} - ${chalk.gray(mod.path)}`);
    }
    console.log();
  }

  console.log(chalk.gray('Next steps:'));
  console.log(chalk.gray('  1. Review and customize .ai-context.yaml'));
  console.log(chalk.gray('  2. Add module descriptions'));
  console.log(chalk.gray('  3. Create QUICK-REF.md files for key modules'));
  console.log();
}

/**
 * AI Context validate command - validate configuration
 */
export async function aiContextValidateCommand(options) {
  const projectPath = process.cwd();
  const configPath = join(projectPath, '.ai-context.yaml');

  console.log();
  console.log(chalk.bold('🔍 Validating .ai-context.yaml'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  if (!existsSync(configPath)) {
    console.log(chalk.red('❌ .ai-context.yaml not found.'));
    console.log(chalk.gray('   Run `uds ai-context init` to create one.'));
    console.log();
    return;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const config = yaml.load(content);

    const errors = [];
    const warnings = [];

    // Validate required fields
    if (!config.version) warnings.push('Missing version field');
    if (!config.project) errors.push('Missing project section');
    if (!config.project?.name) errors.push('Missing project.name');
    if (!config.project?.type) warnings.push('Missing project.type');

    // Validate modules
    if (config.modules && Array.isArray(config.modules)) {
      for (let i = 0; i < config.modules.length; i++) {
        const mod = config.modules[i];
        if (!mod.name) errors.push(`Module ${i}: missing name`);
        if (!mod.path) errors.push(`Module ${i}: missing path`);

        // Check if path exists
        if (mod.path) {
          const fullPath = join(projectPath, mod.path);
          if (!existsSync(fullPath)) {
            warnings.push(`Module ${mod.name}: path does not exist (${mod.path})`);
          }
        }
      }
    }

    // Validate documentation references
    if (config.documentation) {
      const docFields = ['quick-ref', 'detailed', 'examples'];
      for (const field of docFields) {
        if (config.documentation[field]) {
          const docPath = join(projectPath, config.documentation[field]);
          if (!existsSync(docPath)) {
            warnings.push(`Documentation ${field}: path does not exist (${config.documentation[field]})`);
          }
        }
      }
    }

    // Validate context-strategy
    if (config['context-strategy']) {
      const cs = config['context-strategy'];
      if (cs['max-chunk-size'] && typeof cs['max-chunk-size'] !== 'number') {
        errors.push('context-strategy.max-chunk-size must be a number');
      }
      const validPatterns = ['hierarchical', 'parallel', 'sequential'];
      if (cs['analysis-pattern'] && !validPatterns.includes(cs['analysis-pattern'])) {
        errors.push(`context-strategy.analysis-pattern must be one of: ${validPatterns.join(', ')}`);
      }
    }

    // Report results
    if (errors.length === 0 && warnings.length === 0) {
      console.log(chalk.green('✅ Configuration is valid!'));
    } else {
      if (errors.length > 0) {
        console.log(chalk.red(`❌ ${errors.length} error(s):`));
        for (const err of errors) {
          console.log(chalk.red(`   • ${err}`));
        }
      }
      if (warnings.length > 0) {
        console.log(chalk.yellow(`⚠️  ${warnings.length} warning(s):`));
        for (const warn of warnings) {
          console.log(chalk.yellow(`   • ${warn}`));
        }
      }
    }

    console.log();

    // Show configuration summary
    if (options.verbose) {
      console.log(chalk.bold('Configuration:'));
      console.log(chalk.gray(yaml.dump(config)));
    }

  } catch (error) {
    console.log(chalk.red(`❌ Invalid YAML: ${error.message}`));
    console.log();
  }
}

/**
 * AI Context graph command - show dependency graph
 */
export async function aiContextGraphCommand(options) {
  const projectPath = process.cwd();
  const configPath = join(projectPath, '.ai-context.yaml');

  console.log();
  console.log(chalk.bold('📊 Module Dependency Graph'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  if (!existsSync(configPath)) {
    console.log(chalk.red('❌ .ai-context.yaml not found.'));
    console.log(chalk.gray('   Run `uds ai-context init` to create one.'));
    console.log();
    return;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const config = yaml.load(content);

    if (!config.modules || config.modules.length === 0) {
      console.log(chalk.yellow('⚠️  No modules defined in configuration.'));
      console.log();
      return;
    }

    // Build dependency map
    const modules = config.modules;
    const moduleNames = new Set(modules.map(m => m.name));

    // Text representation
    console.log(chalk.bold('Modules:'));
    for (const mod of modules) {
      const priorityIcon = getPriorityIcon(mod.priority);
      const deps = mod.dependencies || [];
      const validDeps = deps.filter(d => moduleNames.has(d));
      const invalidDeps = deps.filter(d => !moduleNames.has(d));

      console.log(`  ${priorityIcon} ${chalk.cyan(mod.name)}`);
      console.log(`    Path: ${chalk.gray(mod.path)}`);
      if (mod.description) {
        console.log(`    Desc: ${chalk.gray(mod.description)}`);
      }
      if (validDeps.length > 0) {
        console.log(`    Deps: ${validDeps.map(d => chalk.blue(d)).join(', ')}`);
      }
      if (invalidDeps.length > 0) {
        console.log(`    ${chalk.yellow('Unknown deps:')} ${invalidDeps.join(', ')}`);
      }
      console.log();
    }

    // Mermaid diagram
    if (options.mermaid) {
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.bold('Mermaid Diagram:'));
      console.log();
      console.log('```mermaid');
      console.log('graph TD');
      for (const mod of modules) {
        const deps = (mod.dependencies || []).filter(d => moduleNames.has(d));
        if (deps.length === 0) {
          console.log(`    ${mod.name}[${mod.name}]`);
        } else {
          for (const dep of deps) {
            console.log(`    ${mod.name}[${mod.name}] --> ${dep}[${dep}]`);
          }
        }
      }
      console.log('```');
      console.log();
    }

  } catch (error) {
    console.log(chalk.red(`❌ Error: ${error.message}`));
    console.log();
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Detect project information from common config files
 */
function detectProjectInfo(projectPath) {
  const info = {
    name: basename(projectPath),
    type: 'web-app',
    language: 'typescript'
  };

  // Check package.json
  const pkgPath = join(projectPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      info.name = pkg.name || info.name;

      // Detect type from scripts
      if (pkg.bin) info.type = 'cli';
      else if (pkg.main && !pkg.scripts?.start) info.type = 'library';

      // Detect language
      if (pkg.devDependencies?.typescript || pkg.dependencies?.typescript) {
        info.language = 'typescript';
      } else {
        info.language = 'javascript';
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check pyproject.toml
  const pyPath = join(projectPath, 'pyproject.toml');
  if (existsSync(pyPath)) {
    info.language = 'python';
    try {
      const content = readFileSync(pyPath, 'utf-8');
      const nameMatch = content.match(/name\s*=\s*["']([^"']+)["']/);
      if (nameMatch) info.name = nameMatch[1];
    } catch {
      // Ignore
    }
  }

  // Check go.mod
  const goPath = join(projectPath, 'go.mod');
  if (existsSync(goPath)) {
    info.language = 'go';
  }

  // Check Cargo.toml
  const cargoPath = join(projectPath, 'Cargo.toml');
  if (existsSync(cargoPath)) {
    info.language = 'rust';
  }

  return info;
}

/**
 * Scan for modules in the project
 */
function scanForModules(projectPath, language) {
  const modules = [];
  const srcDirs = ['src', 'lib', 'app', 'packages'];
  const ignoreDirs = ['node_modules', '__pycache__', '.git', 'dist', 'build', '.venv', 'vendor'];

  for (const srcDir of srcDirs) {
    const srcPath = join(projectPath, srcDir);
    if (!existsSync(srcPath)) continue;

    try {
      const items = readdirSync(srcPath, { withFileTypes: true });
      for (const item of items) {
        if (!item.isDirectory()) continue;
        if (ignoreDirs.includes(item.name)) continue;
        if (item.name.startsWith('.')) continue;

        const modPath = join(srcDir, item.name);
        const fullPath = join(projectPath, modPath);

        // Look for entry point
        const entryFile = findEntryFile(fullPath, language);

        modules.push({
          name: item.name,
          path: modPath + '/',
          entry: entryFile || 'index.ts',
          description: `${item.name} module`,
          dependencies: [],
          priority: 'medium'
        });
      }
    } catch {
      // Ignore scan errors
    }
  }

  return modules;
}

/**
 * Find entry file for a module
 */
function findEntryFile(modulePath, language) {
  const entryFiles = {
    typescript: ['index.ts', 'index.tsx', 'main.ts'],
    javascript: ['index.js', 'index.jsx', 'main.js'],
    python: ['__init__.py', 'main.py'],
    go: ['main.go'],
    rust: ['lib.rs', 'main.rs']
  };

  const candidates = entryFiles[language] || entryFiles.typescript;

  for (const file of candidates) {
    if (existsSync(join(modulePath, file))) {
      return file;
    }
  }

  return null;
}

/**
 * Generate configuration object
 */
function generateConfig(info, projectPath, scanModules = true) {
  const config = {
    version: '1.0.0',
    project: {
      name: info.name,
      type: info.type,
      'primary-language': info.language,
      description: `${info.name} project`
    },
    modules: scanModules ? scanForModules(projectPath, info.language) : [],
    'analysis-hints': {
      'entry-points': detectEntryPoints(projectPath, info.language),
      'ignore-patterns': getDefaultIgnorePatterns(info.language),
      'architecture-type': info.architecture || 'layered'
    },
    documentation: {
      'quick-ref': 'docs/QUICK-REF.md',
      detailed: 'README.md',
      examples: 'docs/examples/'
    },
    'context-strategy': {
      'max-chunk-size': 50000,
      overlap: 500,
      'analysis-pattern': 'hierarchical',
      'enable-rlm': true
    }
  };

  return config;
}

/**
 * Detect entry points
 */
function detectEntryPoints(projectPath, language) {
  const entryPoints = [];
  const candidates = {
    typescript: ['src/index.ts', 'src/main.ts', 'index.ts'],
    javascript: ['src/index.js', 'src/main.js', 'index.js'],
    python: ['src/main.py', 'main.py', 'app.py'],
    go: ['main.go', 'cmd/main.go'],
    rust: ['src/main.rs', 'src/lib.rs']
  };

  const files = candidates[language] || candidates.typescript;

  for (const file of files) {
    if (existsSync(join(projectPath, file))) {
      entryPoints.push(file);
    }
  }

  return entryPoints.length > 0 ? entryPoints : files.slice(0, 2);
}

/**
 * Get default ignore patterns for language
 */
function getDefaultIgnorePatterns(language) {
  const common = ['.git', 'coverage', '*.log'];

  const patterns = {
    typescript: ['node_modules', 'dist', 'build', '*.test.ts', '*.spec.ts'],
    javascript: ['node_modules', 'dist', 'build', '*.test.js', '*.spec.js'],
    python: ['__pycache__', '.venv', 'venv', '*.pyc', '.pytest_cache'],
    go: ['vendor'],
    rust: ['target']
  };

  return [...common, ...(patterns[language] || patterns.typescript)];
}

/**
 * Generate YAML with helpful comments
 */
function generateYamlWithComments(config) {
  const header = `# ============================================================
# .ai-context.yaml - AI Context Configuration
# ============================================================
# This file helps AI assistants understand your project structure
# and optimize their analysis and code generation.
#
# Reference: https://github.com/AsiaOstrich/universal-dev-standards
# Standard: core/ai-friendly-architecture.md
# ============================================================

`;

  return header + yaml.dump(config, {
    indent: 2,
    lineWidth: 80,
    quotingType: '"',
    forceQuotes: false
  });
}

/**
 * Get priority icon
 */
function getPriorityIcon(priority) {
  const icons = {
    high: chalk.red('●'),
    medium: chalk.yellow('●'),
    low: chalk.gray('●')
  };
  return icons[priority] || icons.medium;
}

export default {
  aiContextInitCommand,
  aiContextValidateCommand,
  aiContextGraphCommand
};
