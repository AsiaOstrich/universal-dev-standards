#!/usr/bin/env node

/**
 * Usage Documentation Generator
 * 使用說明文件產生器
 *
 * Generates comprehensive usage documentation from project sources:
 * - FEATURE-REFERENCE.md: Complete feature documentation
 * - CHEATSHEET.md: Single-page quick reference
 *
 * Supports multiple languages: en, zh-TW, zh-CN
 *
 * Usage:
 *   node scripts/generate-usage-docs.mjs              # Generate all
 *   node scripts/generate-usage-docs.mjs --lang en    # English only
 *   node scripts/generate-usage-docs.mjs --cheatsheet # Cheatsheet only
 *   node scripts/generate-usage-docs.mjs --check      # Check if update needed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = '') {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log();
  log(`━━━ ${title} ━━━`, COLORS.cyan + COLORS.bold);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    lang: args.find((a) => a.startsWith('--lang='))?.split('=')[1] || null,
    cheatsheetOnly: args.includes('--cheatsheet'),
    referenceOnly: args.includes('--reference'),
    check: args.includes('--check'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

// Load YAML configuration (simple parser for our use case)
function loadConfig() {
  const configPath = path.join(ROOT_DIR, '.usage-docs.yaml');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  // Simple YAML parsing for our structured config
  // For production, consider using js-yaml package
  return parseSimpleYaml(content);
}

// Simple YAML parser for structured config
function parseSimpleYaml(content) {
  // This is a simplified parser - for complex YAML, use js-yaml
  // Parses the specific structure of .usage-docs.yaml

  const config = {
    version: '1.0',
    output: {
      directory: 'docs/',
      formats: ['reference', 'cheatsheet'],
      languages: ['en'], // Default: English only
      paths: {},
    },
    templates: {
      reference: { title: {} },
      cheatsheet: { title: {} },
    },
    sources: {
      cli: { enabled: true },
      skills: { enabled: true },
      commands: { enabled: true },
      agents: { enabled: true },
      workflows: { enabled: true },
      standards: { enabled: true },
      scripts: { enabled: true },
      templates: { enabled: true },
    },
  };

  const lines = content.split('\n');
  let currentSection = null;
  let currentSubSection = null;
  let currentSubSubSection = null;
  let inLanguagesArray = false;
  let inPathsObject = false;
  let inTitleObject = false;
  let currentTemplate = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Count leading spaces for indentation level
    const indent = line.match(/^(\s*)/)[1].length;

    // Top-level sections (no indent)
    if (indent === 0 && trimmed.endsWith(':')) {
      currentSection = trimmed.slice(0, -1);
      currentSubSection = null;
      currentSubSubSection = null;
      inLanguagesArray = false;
      inPathsObject = false;
      inTitleObject = false;
      currentTemplate = null;
      continue;
    }

    // Handle output section
    if (currentSection === 'output') {
      // languages array (check trimmed content)
      if (trimmed.trim() === 'languages:') {
        inLanguagesArray = true;
        inPathsObject = false;
        config.output.languages = []; // Reset to empty, will populate from config
        continue;
      }

      // paths object
      if (trimmed.trim() === 'paths:') {
        inPathsObject = true;
        inLanguagesArray = false;
        continue;
      }

      // Parse languages array items
      if (inLanguagesArray && trimmed.trim().startsWith('- ')) {
        let lang = trimmed.trim().slice(2).trim();
        // Remove inline comments (e.g., "en  # English (primary)" -> "en")
        const commentIdx = lang.indexOf('#');
        if (commentIdx > 0) {
          lang = lang.substring(0, commentIdx).trim();
        }
        lang = lang.replace(/["']/g, '');
        // Skip if empty or is a comment
        if (lang && !lang.startsWith('#')) {
          config.output.languages.push(lang);
        }
        continue;
      }

      // Parse paths object items
      if (inPathsObject && trimmed.includes(':')) {
        const match = trimmed.match(/^([^:]+):\s*["']?([^"'#]+)["']?\s*(?:#.*)?$/);
        if (match) {
          const key = match[1].trim().replace(/["']/g, '');
          let value = match[2].trim();
          // Remove inline comments
          const commentIdx = value.indexOf('#');
          if (commentIdx > 0) {
            value = value.substring(0, commentIdx).trim();
          }
          config.output.paths[key] = value;
        }
        continue;
      }

      // Reset when hitting other subsections
      if (indent <= 2 && trimmed.endsWith(':') && !trimmed.startsWith('-')) {
        inLanguagesArray = false;
        inPathsObject = false;
      }
    }

    // Handle templates section
    if (currentSection === 'templates') {
      // reference or cheatsheet subsection
      if (indent === 2 && trimmed.trim().endsWith(':')) {
        currentTemplate = trimmed.trim().slice(0, -1);
        inTitleObject = false;
        continue;
      }

      // title subsection
      if (trimmed.trim() === 'title:') {
        inTitleObject = true;
        continue;
      }

      // Parse title translations
      if (inTitleObject && currentTemplate && trimmed.includes(':')) {
        const match = trimmed.match(/^([^:]+):\s*["']?(.+?)["']?\s*$/);
        if (match) {
          const lang = match[1].trim().replace(/["']/g, '');
          const title = match[2].trim().replace(/["']/g, '');
          if (config.templates[currentTemplate]) {
            config.templates[currentTemplate].title[lang] = title;
          }
        }
        continue;
      }

      // Reset when hitting other subsections
      if (indent <= 4 && trimmed.endsWith(':') && !trimmed.includes('title')) {
        inTitleObject = false;
      }
    }
  }

  // If no languages parsed, default to English
  if (config.output.languages.length === 0) {
    config.output.languages = ['en'];
  }

  // If no paths parsed, use defaults based on languages
  if (Object.keys(config.output.paths).length === 0) {
    for (const lang of config.output.languages) {
      config.output.paths[lang] =
        lang === 'en' ? 'docs/' : `locales/${lang}/docs/`;
    }
  }

  return config;
}

// Extract YAML frontmatter from markdown file
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: null, body: content };

  const frontmatterStr = match[1];
  const frontmatter = {};

  // Parse simple YAML frontmatter
  const lines = frontmatterStr.split('\n');
  let currentKey = null;
  let multilineValue = [];
  let inMultiline = false;

  for (const line of lines) {
    if (inMultiline) {
      if (line.startsWith('  ')) {
        multilineValue.push(line.trim());
        continue;
      } else {
        frontmatter[currentKey] = multilineValue.join('\n');
        inMultiline = false;
        multilineValue = [];
      }
    }

    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();

      if (value === '|') {
        inMultiline = true;
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Array value
        frontmatter[currentKey] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim());
      } else if (value) {
        frontmatter[currentKey] = value;
      }
    }
  }

  if (inMultiline && multilineValue.length > 0) {
    frontmatter[currentKey] = multilineValue.join('\n');
  }

  const body = content.slice(match[0].length).trim();
  return { frontmatter, body };
}

// Extract first heading and purpose from markdown
function extractDocInfo(content) {
  const { frontmatter, body } = extractFrontmatter(content);

  // Get title from first H1
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : null;

  // Get purpose section
  const purposeMatch = body.match(
    /##\s*Purpose\s*\n\n?([\s\S]*?)(?=\n##|\n---|\$)/i
  );
  const purpose = purposeMatch ? purposeMatch[1].trim().split('\n')[0] : null;

  return { frontmatter, title, purpose };
}

// Scan CLI commands from uds.js
async function scanCliCommands() {
  const commands = [];
  const seenCommands = new Set();

  try {
    const udsPath = path.join(ROOT_DIR, 'cli/bin/uds.js');
    const content = fs.readFileSync(udsPath, 'utf-8');

    // Define main commands structure (based on uds.js analysis)
    const mainCommands = [
      { name: 'list', desc: 'List available standards' },
      { name: 'init', desc: 'Initialize standards in current project' },
      { name: 'configure', desc: 'Modify options for initialized project', alias: 'config' },
      { name: 'check', desc: 'Check adoption status of current project' },
      { name: 'update', desc: 'Update standards to latest version' },
      { name: 'skills', desc: 'List installed Claude Code skills' },
      { name: 'agent', desc: 'Manage UDS agents (list, install, info)' },
      { name: 'workflow', desc: 'Manage UDS workflows (list, install, info, execute, status)' },
      { name: 'ai-context', desc: 'Manage AI context configuration (init, validate, graph)' },
    ];

    for (const cmd of mainCommands) {
      if (!seenCommands.has(cmd.name)) {
        seenCommands.add(cmd.name);
        commands.push({
          name: cmd.name,
          description: cmd.desc,
          alias: cmd.alias || null,
          options: [],
        });
      }
    }

    // Extract options from uds.js for main commands
    const optionBlocks = content.split(/program\s*\n?\s*\.command/);
    for (const block of optionBlocks) {
      const cmdMatch = block.match(/^\(['"](\w+)['"]\)/);
      if (!cmdMatch) continue;

      const cmdName = cmdMatch[1];
      const existing = commands.find((c) => c.name === cmdName);
      if (!existing) continue;

      const optionMatches = block.matchAll(
        /\.option\(['"](-\w,\s*)?--(\w[\w-]*)[^'"]*['"],\s*['"]([^'"]+)['"]/g
      );
      for (const optMatch of optionMatches) {
        existing.options.push({
          short: optMatch[1]?.replace(',', '').trim() || '',
          long: optMatch[2],
          description: optMatch[3],
        });
      }
    }
  } catch (error) {
    log(`  Warning: Could not scan CLI commands: ${error.message}`, COLORS.yellow);
  }

  return commands;
}

// Scan skills from SKILL.md files
async function scanSkills() {
  const skills = [];
  const skillsDir = path.join(ROOT_DIR, 'skills/claude-code');

  if (!fs.existsSync(skillsDir)) return skills;

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (['commands', 'agents', 'workflows'].includes(entry.name)) continue;

    const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;

    try {
      const content = fs.readFileSync(skillPath, 'utf-8');
      const { frontmatter, title, purpose } = extractDocInfo(content);

      skills.push({
        id: entry.name,
        name: frontmatter?.name || entry.name,
        description:
          frontmatter?.description?.split('\n')[0] || purpose || title || '',
        path: `skills/claude-code/${entry.name}/SKILL.md`,
      });
    } catch (error) {
      log(`  Warning: Could not parse ${skillPath}: ${error.message}`, COLORS.yellow);
    }
  }

  return skills;
}

// Scan slash commands
async function scanCommands() {
  const commands = [];
  const commandsDir = path.join(ROOT_DIR, 'skills/claude-code/commands');

  if (!fs.existsSync(commandsDir)) return commands;

  const files = fs.readdirSync(commandsDir).filter((f) => {
    return (
      f.endsWith('.md') && f !== 'README.md' && f !== 'COMMAND-FAMILY-OVERVIEW.md'
    );
  });

  for (const file of files) {
    const filePath = path.join(commandsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, title } = extractDocInfo(content);

      const cmdName = file.replace('.md', '');
      commands.push({
        name: `/${cmdName}`,
        description: frontmatter?.description?.split('\n')[0] || title || '',
        'allowed-tools': frontmatter?.['allowed-tools'] || '',
        'argument-hint': frontmatter?.['argument-hint'] || '',
        path: `skills/claude-code/commands/${file}`,
      });
    } catch (error) {
      log(`  Warning: Could not parse ${filePath}: ${error.message}`, COLORS.yellow);
    }
  }

  return commands;
}

// Scan agents
async function scanAgents() {
  const agents = [];
  const agentsDir = path.join(ROOT_DIR, 'skills/claude-code/agents');

  if (!fs.existsSync(agentsDir)) return agents;

  const files = fs
    .readdirSync(agentsDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md');

  for (const file of files) {
    const filePath = path.join(agentsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, title, purpose } = extractDocInfo(content);

      agents.push({
        id: file.replace('.md', ''),
        name: frontmatter?.name || file.replace('.md', ''),
        description:
          frontmatter?.description?.split('\n')[0] || purpose || title || '',
        role: frontmatter?.role || '',
        expertise: frontmatter?.expertise || [],
        path: `skills/claude-code/agents/${file}`,
      });
    } catch (error) {
      log(`  Warning: Could not parse ${filePath}: ${error.message}`, COLORS.yellow);
    }
  }

  return agents;
}

// Scan workflows
async function scanWorkflows() {
  const workflows = [];
  const workflowsDir = path.join(ROOT_DIR, 'skills/claude-code/workflows');

  if (!fs.existsSync(workflowsDir)) return workflows;

  const files = fs
    .readdirSync(workflowsDir)
    .filter((f) => (f.endsWith('.md') || f.endsWith('.yaml')) && f !== 'README.md');

  for (const file of files) {
    const filePath = path.join(workflowsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      if (file.endsWith('.yaml')) {
        // Parse YAML workflow
        const nameMatch = content.match(/^name:\s*(.+)$/m);

        // Handle multiline YAML description
        let description = '';
        const descBlockMatch = content.match(/^description:\s*\|\s*\n([\s\S]*?)(?=\n\w+:|$)/m);
        if (descBlockMatch) {
          // Get first line of multiline description
          const lines = descBlockMatch[1].split('\n').filter((l) => l.trim());
          description = lines[0]?.trim() || '';
        } else {
          // Single line description
          const descMatch = content.match(/^description:\s*(.+)$/m);
          description = descMatch?.[1]?.trim() || '';
        }

        // Get from header comment if no description
        if (!description) {
          const headerMatch = content.match(/^#\s*(.+)$/m);
          description = headerMatch?.[1] || '';
        }

        workflows.push({
          id: file.replace('.workflow.yaml', '').replace('.yaml', ''),
          name: nameMatch?.[1] || file.replace('.workflow.yaml', ''),
          description: description,
          path: `skills/claude-code/workflows/${file}`,
        });
      } else {
        const { frontmatter, title, purpose } = extractDocInfo(content);
        workflows.push({
          id: file.replace('.md', ''),
          name: frontmatter?.name || title || file.replace('.md', ''),
          description: frontmatter?.description || purpose || '',
          path: `skills/claude-code/workflows/${file}`,
        });
      }
    } catch (error) {
      log(`  Warning: Could not parse ${filePath}: ${error.message}`, COLORS.yellow);
    }
  }

  return workflows;
}

// Scan core standards
async function scanStandards() {
  const standards = [];
  const coreDir = path.join(ROOT_DIR, 'core');

  if (!fs.existsSync(coreDir)) return standards;

  const files = fs.readdirSync(coreDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(coreDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { title, purpose } = extractDocInfo(content);

      // Extract version from content
      const versionMatch = content.match(/\*\*Version\*\*:\s*([^\n]+)/);

      standards.push({
        id: file.replace('.md', ''),
        name: title || file.replace('.md', '').replace(/-/g, ' '),
        description: purpose || '',
        version: versionMatch?.[1]?.trim() || '',
        path: `core/${file}`,
      });
    } catch (error) {
      log(`  Warning: Could not parse ${filePath}: ${error.message}`, COLORS.yellow);
    }
  }

  return standards;
}

// Scan scripts
async function scanScripts() {
  const scripts = [];
  const scriptsDir = path.join(ROOT_DIR, 'scripts');

  if (!fs.existsSync(scriptsDir)) return scripts;

  const files = fs.readdirSync(scriptsDir).filter((f) => {
    return (
      (f.endsWith('.sh') || f.endsWith('.ps1') || f.endsWith('.mjs')) &&
      f !== 'generate-usage-docs.mjs'
    );
  });

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract description from header comment
      let description = '';
      if (file.endsWith('.sh')) {
        // Look for description line in bash comments
        const lines = content.split('\n');
        for (const line of lines.slice(0, 20)) {
          // Skip shebang, empty comments, and set commands
          if (line.startsWith('#!')) continue;
          if (line === '#') continue;
          if (line.match(/^#\s*set\s/)) continue;
          if (line.match(/^#\s*$/)) continue;
          // Get first meaningful comment
          const match = line.match(/^#\s*(.+)$/);
          if (match && match[1].length > 5 && !match[1].startsWith('Usage')) {
            description = match[1].trim();
            break;
          }
        }
      } else if (file.endsWith('.mjs')) {
        // Look for JSDoc or first comment
        const docMatch = content.match(/\/\*\*\s*\n?\s*\*?\s*(.+?)[\n*]/);
        if (docMatch) {
          description = docMatch[1].trim();
        }
      } else if (file.endsWith('.ps1')) {
        // Look for .SYNOPSIS in PowerShell help
        const synopsisMatch = content.match(/\.SYNOPSIS\s*\n\s*(.+)/i);
        if (synopsisMatch) {
          description = synopsisMatch[1].trim();
        } else {
          // Fallback to first comment block
          const commentMatch = content.match(/<#\s*\n?([\s\S]*?)#>/);
          if (commentMatch) {
            const firstLine = commentMatch[1].trim().split('\n')[0];
            if (firstLine && !firstLine.startsWith('.')) {
              description = firstLine;
            }
          }
        }
      }

      // Create human-readable description from filename if not found
      if (!description) {
        description = file
          .replace(/\.(sh|ps1|mjs)$/, '')
          .replace(/^check-/, 'Check ')
          .replace(/^pre-/, 'Pre-')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      scripts.push({
        name: file,
        description: description,
        path: `scripts/${file}`,
      });
    } catch (error) {
      log(`  Warning: Could not parse ${filePath}: ${error.message}`, COLORS.yellow);
    }
  }

  return scripts;
}

// Helper: Get title with fallback
function getTitleWithFallback(configTitles, defaultTitle, lang) {
  // Priority: config[lang] → config.en → default
  if (configTitles && configTitles[lang]) {
    return configTitles[lang];
  }
  if (configTitles && configTitles.en) {
    return configTitles.en;
  }
  if (configTitles && Object.keys(configTitles).length > 0) {
    return configTitles[Object.keys(configTitles)[0]];
  }
  return defaultTitle;
}

// Generate FEATURE-REFERENCE.md content
function generateReference(data, lang = 'en', config = null) {
  // Default titles (built-in support for en, zh-TW, zh-CN)
  const defaultTitles = {
    en: {
      main: 'UDS Feature Reference',
      subtitle: 'Universal Development Standards - Complete Feature Documentation',
      toc: 'Table of Contents',
      cli: 'CLI Commands',
      commands: 'Slash Commands',
      skills: 'Skills',
      agents: 'Agents',
      workflows: 'Workflows',
      standards: 'Core Standards',
      scripts: 'Scripts',
      description: 'Description',
      options: 'Options',
      usage: 'Usage',
      role: 'Role',
      version: 'Version',
    },
    'zh-TW': {
      main: 'UDS 功能參考手冊',
      subtitle: 'Universal Development Standards - 完整功能文件',
      toc: '目錄',
      cli: 'CLI 指令',
      commands: '斜線命令',
      skills: '技能',
      agents: '代理',
      workflows: '工作流程',
      standards: '核心規範',
      scripts: '腳本',
      description: '說明',
      options: '選項',
      usage: '用法',
      role: '角色',
      version: '版本',
    },
    'zh-CN': {
      main: 'UDS 功能参考手册',
      subtitle: 'Universal Development Standards - 完整功能文档',
      toc: '目录',
      cli: 'CLI 指令',
      commands: '斜线命令',
      skills: '技能',
      agents: '代理',
      workflows: '工作流程',
      standards: '核心规范',
      scripts: '脚本',
      description: '说明',
      options: '选项',
      usage: '用法',
      role: '角色',
      version: '版本',
    },
  };

  // Use configured title if available, otherwise use default
  const t = defaultTitles[lang] || defaultTitles.en;

  // Override main title from config if provided
  const configRefTitle = config?.templates?.reference?.title;
  const mainTitle = getTitleWithFallback(configRefTitle, t.main, lang);

  const now = new Date().toISOString().split('T')[0];

  let md = `# ${mainTitle}\n\n`;
  md += `> ${t.subtitle}\n`;
  md += `> Auto-generated | Last updated: ${now}\n\n`;

  // Language links
  if (lang === 'en') {
    md += `**Language**: English | [繁體中文](../locales/zh-TW/docs/FEATURE-REFERENCE.md) | [简体中文](../locales/zh-CN/docs/FEATURE-REFERENCE.md)\n\n`;
  } else if (lang === 'zh-TW') {
    md += `**Language**: [English](../../../docs/FEATURE-REFERENCE.md) | 繁體中文 | [简体中文](../../zh-CN/docs/FEATURE-REFERENCE.md)\n\n`;
  } else {
    md += `**Language**: [English](../../../docs/FEATURE-REFERENCE.md) | [繁體中文](../../zh-TW/docs/FEATURE-REFERENCE.md) | 简体中文\n\n`;
  }

  md += `---\n\n`;

  // Table of Contents
  md += `## ${t.toc}\n\n`;
  md += `1. [${t.cli}](#cli-commands) (${data.cli.length})\n`;
  md += `2. [${t.commands}](#slash-commands) (${data.commands.length})\n`;
  md += `3. [${t.skills}](#skills) (${data.skills.length})\n`;
  md += `4. [${t.agents}](#agents) (${data.agents.length})\n`;
  md += `5. [${t.workflows}](#workflows) (${data.workflows.length})\n`;
  md += `6. [${t.standards}](#core-standards) (${data.standards.length})\n`;
  md += `7. [${t.scripts}](#scripts) (${data.scripts.length})\n\n`;

  // Summary
  const total =
    data.cli.length +
    data.commands.length +
    data.skills.length +
    data.agents.length +
    data.workflows.length +
    data.standards.length +
    data.scripts.length;
  md += `**Total Features: ${total}**\n\n`;
  md += `---\n\n`;

  // CLI Commands
  md += `## ${t.cli}\n\n`;
  for (const cmd of data.cli) {
    md += `### \`uds ${cmd.name}\`\n\n`;
    md += `**${t.description}**: ${cmd.description}\n\n`;
    if (cmd.options && cmd.options.length > 0) {
      md += `**${t.options}**:\n`;
      md += `| Option | ${t.description} |\n`;
      md += `|--------|-------------|\n`;
      for (const opt of cmd.options) {
        const optStr = opt.short ? `\`${opt.short}, --${opt.long}\`` : `\`--${opt.long}\``;
        md += `| ${optStr} | ${opt.description} |\n`;
      }
      md += `\n`;
    }
  }
  md += `---\n\n`;

  // Slash Commands
  md += `## ${t.commands}\n\n`;
  md += `| Command | ${t.description} |\n`;
  md += `|---------|-------------|\n`;
  for (const cmd of data.commands) {
    const desc = cmd.description.replace(/\|/g, '\\|').split('\n')[0];
    md += `| \`${cmd.name}\` | ${desc} |\n`;
  }
  md += `\n---\n\n`;

  // Skills
  md += `## ${t.skills}\n\n`;
  md += `| Skill | ${t.description} |\n`;
  md += `|-------|-------------|\n`;
  for (const skill of data.skills) {
    const desc = skill.description.replace(/\|/g, '\\|').split('\n')[0];
    md += `| \`${skill.id}\` | ${desc} |\n`;
  }
  md += `\n---\n\n`;

  // Agents
  md += `## ${t.agents}\n\n`;
  md += `| Agent | ${t.role} | ${t.description} |\n`;
  md += `|-------|------|-------------|\n`;
  for (const agent of data.agents) {
    const desc = agent.description.replace(/\|/g, '\\|').split('\n')[0];
    md += `| \`${agent.id}\` | ${agent.role || '-'} | ${desc} |\n`;
  }
  md += `\n---\n\n`;

  // Workflows
  md += `## ${t.workflows}\n\n`;
  if (data.workflows.length > 0) {
    md += `| Workflow | ${t.description} |\n`;
    md += `|----------|-------------|\n`;
    for (const wf of data.workflows) {
      const desc = wf.description.replace(/\|/g, '\\|').split('\n')[0];
      md += `| \`${wf.id}\` | ${desc} |\n`;
    }
  } else {
    md += `*No workflows defined yet.*\n`;
  }
  md += `\n---\n\n`;

  // Core Standards
  md += `## ${t.standards}\n\n`;
  md += `| Standard | ${t.version} | ${t.description} |\n`;
  md += `|----------|---------|-------------|\n`;
  for (const std of data.standards) {
    const desc = std.description.replace(/\|/g, '\\|').split('\n')[0].substring(0, 80);
    md += `| \`${std.id}\` | ${std.version || '-'} | ${desc} |\n`;
  }
  md += `\n---\n\n`;

  // Scripts
  md += `## ${t.scripts}\n\n`;
  md += `| Script | ${t.description} |\n`;
  md += `|--------|-------------|\n`;
  for (const script of data.scripts) {
    const desc = script.description.replace(/\|/g, '\\|');
    md += `| \`${script.name}\` | ${desc} |\n`;
  }
  md += `\n---\n\n`;

  // Footer
  md += `## License\n\n`;
  md += `This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).\n\n`;
  md += `**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)\n`;

  return md;
}

// Generate CHEATSHEET.md content
function generateCheatsheet(data, lang = 'en', config = null) {
  // Default titles (built-in support for en, zh-TW, zh-CN)
  const defaultTitles = {
    en: {
      main: 'UDS Cheatsheet',
      cli: 'CLI Commands',
      commands: 'Slash Commands',
      skills: 'Skills',
      agents: 'Agents',
      workflows: 'Workflows',
      standards: 'Core Standards',
      scripts: 'Scripts',
      description: 'Description',
      role: 'Role',
    },
    'zh-TW': {
      main: 'UDS 速查表',
      cli: 'CLI 指令',
      commands: '斜線命令',
      skills: '技能',
      agents: '代理',
      workflows: '工作流程',
      standards: '核心規範',
      scripts: '腳本',
      description: '說明',
      role: '角色',
    },
    'zh-CN': {
      main: 'UDS 速查表',
      cli: 'CLI 指令',
      commands: '斜线命令',
      skills: '技能',
      agents: '代理',
      workflows: '工作流程',
      standards: '核心规范',
      scripts: '脚本',
      description: '说明',
      role: '角色',
    },
  };

  // Use configured title if available, otherwise use default
  const t = defaultTitles[lang] || defaultTitles.en;

  // Override main title from config if provided
  const configCheatTitle = config?.templates?.cheatsheet?.title;
  const mainTitle = getTitleWithFallback(configCheatTitle, t.main, lang);

  const now = new Date().toISOString().split('T')[0];

  let md = `# ${mainTitle}\n\n`;
  md += `> Quick reference for all UDS features | Last updated: ${now}\n\n`;

  // Language links
  if (lang === 'en') {
    md += `**Language**: English | [繁體中文](../locales/zh-TW/docs/CHEATSHEET.md) | [简体中文](../locales/zh-CN/docs/CHEATSHEET.md)\n\n`;
  } else if (lang === 'zh-TW') {
    md += `**Language**: [English](../../../docs/CHEATSHEET.md) | 繁體中文 | [简体中文](../../zh-CN/docs/CHEATSHEET.md)\n\n`;
  } else {
    md += `**Language**: [English](../../../docs/CHEATSHEET.md) | [繁體中文](../../zh-TW/docs/CHEATSHEET.md) | 简体中文\n\n`;
  }

  md += `---\n\n`;

  // CLI Commands
  md += `## 🛠️ ${t.cli}\n\n`;
  md += `| Command | ${t.description} |\n`;
  md += `|---------|-------------|\n`;
  for (const cmd of data.cli) {
    md += `| \`uds ${cmd.name}\` | ${cmd.description} |\n`;
  }
  md += `\n`;

  // Slash Commands
  md += `## 💬 ${t.commands}\n\n`;
  md += `| Command | ${t.description} |\n`;
  md += `|---------|-------------|\n`;
  for (const cmd of data.commands) {
    const desc = cmd.description.replace(/\|/g, '\\|').split('\n')[0];
    md += `| \`${cmd.name}\` | ${desc} |\n`;
  }
  md += `\n`;

  // Skills
  md += `## 🎯 ${t.skills}\n\n`;
  md += `| Skill | ${t.description} |\n`;
  md += `|-------|-------------|\n`;
  for (const skill of data.skills) {
    const desc = skill.description.replace(/\|/g, '\\|').split('\n')[0].substring(0, 60);
    md += `| \`${skill.id}\` | ${desc} |\n`;
  }
  md += `\n`;

  // Agents
  md += `## 🤖 ${t.agents}\n\n`;
  md += `| Agent | ${t.role} |\n`;
  md += `|-------|------|\n`;
  for (const agent of data.agents) {
    md += `| \`${agent.id}\` | ${agent.role || agent.description.split('\n')[0].substring(0, 40)} |\n`;
  }
  md += `\n`;

  // Workflows
  if (data.workflows.length > 0) {
    md += `## 🔄 ${t.workflows}\n\n`;
    md += `| Workflow | ${t.description} |\n`;
    md += `|----------|-------------|\n`;
    for (const wf of data.workflows) {
      const desc = wf.description.replace(/\|/g, '\\|').split('\n')[0];
      md += `| \`${wf.id}\` | ${desc} |\n`;
    }
    md += `\n`;
  }

  // Core Standards
  md += `## 📚 ${t.standards}\n\n`;
  md += `| Standard | ${t.description} |\n`;
  md += `|----------|-------------|\n`;
  for (const std of data.standards) {
    const desc = std.description.replace(/\|/g, '\\|').split('\n')[0].substring(0, 50);
    md += `| \`${std.id}\` | ${desc || std.name} |\n`;
  }
  md += `\n`;

  // Scripts
  md += `## 📜 ${t.scripts}\n\n`;
  md += `| Script | ${t.description} |\n`;
  md += `|--------|-------------|\n`;
  for (const script of data.scripts) {
    const desc = script.description.replace(/\|/g, '\\|').substring(0, 50);
    md += `| \`${script.name}\` | ${desc} |\n`;
  }
  md += `\n`;

  // Footer
  md += `---\n\n`;
  md += `📖 [Full Reference](FEATURE-REFERENCE.md) | `;
  md += `🔗 [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)\n`;

  return md;
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Main function
async function main() {
  const args = parseArgs();

  if (args.help) {
    console.log(`
Usage Documentation Generator

Usage:
  node scripts/generate-usage-docs.mjs [options]

Options:
  --lang=<lang>     Generate for specific language (en, zh-TW, zh-CN)
  --cheatsheet      Generate cheatsheet only
  --reference       Generate reference only
  --check           Check if update needed (don't write files)
  -v, --verbose     Verbose output
  -h, --help        Show this help

Examples:
  node scripts/generate-usage-docs.mjs              # Generate all
  node scripts/generate-usage-docs.mjs --lang=en    # English only
  node scripts/generate-usage-docs.mjs --cheatsheet # Cheatsheet only
`);
    return;
  }

  log('\n🔍 Usage Documentation Generator', COLORS.bold);
  log('================================\n', COLORS.bold);

  // Load configuration
  logSection('Loading Configuration');
  const config = loadConfig();
  log('  ✓ Configuration loaded', COLORS.green);

  // Scan all sources
  logSection('Scanning Sources');

  log('  Scanning CLI commands...', COLORS.cyan);
  const cli = await scanCliCommands();
  log(`  ✓ Found ${cli.length} CLI commands`, COLORS.green);

  log('  Scanning skills...', COLORS.cyan);
  const skills = await scanSkills();
  log(`  ✓ Found ${skills.length} skills`, COLORS.green);

  log('  Scanning slash commands...', COLORS.cyan);
  const commands = await scanCommands();
  log(`  ✓ Found ${commands.length} slash commands`, COLORS.green);

  log('  Scanning agents...', COLORS.cyan);
  const agents = await scanAgents();
  log(`  ✓ Found ${agents.length} agents`, COLORS.green);

  log('  Scanning workflows...', COLORS.cyan);
  const workflows = await scanWorkflows();
  log(`  ✓ Found ${workflows.length} workflows`, COLORS.green);

  log('  Scanning core standards...', COLORS.cyan);
  const standards = await scanStandards();
  log(`  ✓ Found ${standards.length} core standards`, COLORS.green);

  log('  Scanning scripts...', COLORS.cyan);
  const scripts = await scanScripts();
  log(`  ✓ Found ${scripts.length} scripts`, COLORS.green);

  const data = { cli, skills, commands, agents, workflows, standards, scripts };

  // Calculate total
  const total = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
  log(`\n  📊 Total features: ${total}`, COLORS.bold);

  // Determine languages to generate (from config or command line)
  const configuredLanguages = config.output?.languages || ['en'];
  const languages = args.lang ? [args.lang] : configuredLanguages;

  if (args.verbose) {
    log(`  Languages: ${languages.join(', ')}`, COLORS.cyan);
  }

  // Generate documents
  logSection('Generating Documents');

  for (const lang of languages) {
    // Use configured paths, fallback to default pattern
    const configuredPath = config.output?.paths?.[lang];
    const outputPath = configuredPath
      ? path.join(ROOT_DIR, configuredPath)
      : lang === 'en'
        ? path.join(ROOT_DIR, 'docs')
        : path.join(ROOT_DIR, 'locales', lang, 'docs');

    ensureDir(outputPath);

    // Generate reference
    if (!args.cheatsheetOnly) {
      const refContent = generateReference(data, lang, config);
      const refPath = path.join(outputPath, 'FEATURE-REFERENCE.md');

      if (args.check) {
        const existing = fs.existsSync(refPath)
          ? fs.readFileSync(refPath, 'utf-8')
          : '';
        if (existing !== refContent) {
          log(`  ⚠ ${lang}/FEATURE-REFERENCE.md needs update`, COLORS.yellow);
        } else {
          log(`  ✓ ${lang}/FEATURE-REFERENCE.md is up to date`, COLORS.green);
        }
      } else {
        fs.writeFileSync(refPath, refContent);
        log(`  ✓ Generated ${lang}/FEATURE-REFERENCE.md`, COLORS.green);
      }
    }

    // Generate cheatsheet
    if (!args.referenceOnly) {
      const cheatContent = generateCheatsheet(data, lang, config);
      const cheatPath = path.join(outputPath, 'CHEATSHEET.md');

      if (args.check) {
        const existing = fs.existsSync(cheatPath)
          ? fs.readFileSync(cheatPath, 'utf-8')
          : '';
        if (existing !== cheatContent) {
          log(`  ⚠ ${lang}/CHEATSHEET.md needs update`, COLORS.yellow);
        } else {
          log(`  ✓ ${lang}/CHEATSHEET.md is up to date`, COLORS.green);
        }
      } else {
        fs.writeFileSync(cheatPath, cheatContent);
        log(`  ✓ Generated ${lang}/CHEATSHEET.md`, COLORS.green);
      }
    }
  }

  // Summary
  logSection('Summary');
  log(`  📄 Documents generated for ${languages.length} language(s)`, COLORS.green);
  log(`  📊 Total features documented: ${total}`, COLORS.green);

  if (!args.check) {
    log('\n✅ Documentation generation complete!', COLORS.green + COLORS.bold);
  }

  console.log();
}

main().catch((error) => {
  console.error(`${COLORS.red}Error: ${error.message}${COLORS.reset}`);
  process.exit(1);
});
