#!/usr/bin/env node
/**
 * UDS Hook-Based Standard Injection
 * Claude Code UserPromptSubmit hook that reads the user's prompt,
 * matches it against manifest.json domain triggers, and outputs
 * matching standard file paths as additional context.
 *
 * Usage: Configured as a Claude Code hook in .claude/settings.json
 *
 * Performance target: < 500ms
 * Error handling: failures are non-blocking (exit 0 with empty output)
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function findManifest(cwd) {
  const paths = [
    join(cwd, '.standards', 'manifest.json'),
    join(cwd, 'manifest.json'),
  ];
  for (const p of paths) {
    try {
      return JSON.parse(readFileSync(p, 'utf-8'));
    } catch {
      // continue
    }
  }
  return null;
}

function matchDomains(prompt, manifest) {
  const matched = new Set();
  const promptLower = prompt.toLowerCase();

  const allDomains = { ...(manifest.domains || {}) };

  // Add custom domains from extensions
  for (const ext of manifest.extensions || []) {
    if (ext.type === 'custom-domain' && ext.domain && ext.triggers) {
      allDomains[ext.domain] = {
        _triggers: ext.triggers,
        _standards: ext.standards || [],
        _isCustom: true,
      };
    }
  }

  for (const [domainName, domainValue] of Object.entries(allDomains)) {
    if (domainName === 'always-on') continue;

    // Get triggers: from ai.yaml structure or custom domain
    let triggers = [];
    if (domainValue._isCustom) {
      triggers = domainValue._triggers;
    } else {
      // Built-in domains don't store triggers in manifest.json,
      // use the domain name and known command patterns
      const domainTriggerMap = {
        testing: ['test', 'coverage', '/tdd', '/bdd', '/atdd', '/coverage', '.test.', '.spec.'],
        specification: ['/sdd', '/spec', '/derive', '/reverse', '/requirement', 'docs/specs/'],
        quality: ['/review', '/refactor', '/check', 'code review', 'pull request', 'security', 'performance'],
        documentation: ['/docs', '/changelog', '/generate-docs', 'readme', 'changelog', 'documentation'],
        workflow: ['/release', '/commit', 'branch', 'merge', 'release', 'deploy', 'version'],
        architecture: ['architecture', 'project setup', 'error handling', 'logging', 'project structure'],
      };
      triggers = domainTriggerMap[domainName] || [domainName];
    }

    for (const trigger of triggers) {
      const triggerLower = trigger.toLowerCase();
      if (triggerLower.startsWith('/')) {
        // Slash command match
        if (promptLower.includes(triggerLower)) {
          if (domainValue._isCustom) {
            domainValue._standards.forEach(s => matched.add(s));
          } else if (Array.isArray(domainValue)) {
            domainValue.forEach(s => matched.add(s));
          }
          break;
        }
      } else if (triggerLower.includes('*')) {
        // File pattern — check if prompt mentions matching files
        const pattern = triggerLower.replace(/\*/g, '');
        if (promptLower.includes(pattern)) {
          if (domainValue._isCustom) {
            domainValue._standards.forEach(s => matched.add(s));
          } else if (Array.isArray(domainValue)) {
            domainValue.forEach(s => matched.add(s));
          }
          break;
        }
      } else {
        // Keyword match
        if (promptLower.includes(triggerLower)) {
          if (domainValue._isCustom) {
            domainValue._standards.forEach(s => matched.add(s));
          } else if (Array.isArray(domainValue)) {
            domainValue.forEach(s => matched.add(s));
          }
          break;
        }
      }
    }
  }

  return [...matched];
}

async function main() {
  try {
    // Read stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const input = JSON.parse(Buffer.concat(chunks).toString());

    const prompt = input.prompt || '';
    const cwd = input.cwd || process.cwd();

    if (!prompt) {
      process.exit(0);
    }

    const manifest = findManifest(cwd);
    if (!manifest) {
      process.exit(0);
    }

    const matchedStandards = matchDomains(prompt, manifest);

    // Record hook stats (silent, non-blocking)
    try {
      const configPath = join(cwd, '.uds', 'config.json');
      let statsEnabled = true;
      try {
        if (existsSync(configPath)) {
          const config = JSON.parse(readFileSync(configPath, 'utf-8'));
          if (config.hookStats === false) statsEnabled = false;
        }
      } catch { /* default enabled */ }

      if (statsEnabled) {
        const statsDir = join(cwd, '.uds');
        if (!existsSync(statsDir)) mkdirSync(statsDir, { recursive: true });
        const statsPath = join(statsDir, 'hook-stats.jsonl');
        const record = JSON.stringify({
          timestamp: new Date().toISOString(),
          matched_standards: matchedStandards.map(s => s.replace(/.*\//, '').replace('.ai.yaml', '')),
          matched_count: matchedStandards.length,
          total_available: Object.keys(manifest.domains || {}).length,
          prompt_length: prompt.length
        });
        appendFileSync(statsPath, record + '\n');
      }
    } catch { /* silent failure — never block hook */ }

    if (matchedStandards.length === 0) {
      process.exit(0);
    }

    // Output as additional context
    const context = [
      '[UDS Context-Aware Loading] Matched standards for this prompt:',
      ...matchedStandards.map(s => `  - ${s}`),
      '',
      'Load these standards if not already in context.',
    ].join('\n');

    process.stdout.write(context);
    process.exit(0);
  } catch {
    // Non-blocking: exit 0 on any error
    process.exit(0);
  }
}

main();
