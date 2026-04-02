import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, basename, join } from 'path';

/**
 * Parse Gherkin feature content and extract scenarios with their steps
 * @param {string} content - Feature file content
 * @returns {{ name: string, steps: string[] }[]}
 */
export function parseFeatureScenarios(content) {
  const scenarios = [];
  const lines = content.split('\n');
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();

    if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
      if (current) scenarios.push(current);
      const name = line.replace(/^Scenario( Outline)?:\s*/, '');
      current = { name, steps: [] };
    } else if (current && /^(Given|When|Then|And|But)\s/.test(line)) {
      current.steps.push(line);
    }
  }

  if (current) scenarios.push(current);
  return scenarios;
}

// Keywords that indicate different test levels
const E2E_KEYWORDS = [
  'user', 'login', 'logged in', 'navigat', 'page', 'click', 'submit',
  'form', 'display', 'screen', 'browser', 'UI', 'dashboard',
  'runs "', 'executes', 'command', 'uds ', 'CLI',
  'checkout', 'cart', 'registration', 'sign up'
];

const INTEGRATION_KEYWORDS = [
  'API', 'database', 'DB', 'request', 'response', 'endpoint',
  'service', 'gateway', 'handler', 'writes to', 'reads from',
  'POST', 'GET', 'PUT', 'DELETE', 'persist', 'calls'
];

const UNIT_KEYWORDS = [
  'sorted', 'calculated', 'formatted', 'parsed', 'validated',
  'result is', 'output', 'returns', 'algorithm', 'compute',
  'string', 'number', 'list', 'array', 'object',
  'true', 'false', 'pattern', 'matches'
];

/**
 * Classify a single scenario into e2e-suitable, unit-suitable, or integration-suitable
 * @param {{ name: string, steps: string[] }} scenario
 * @returns {{ category: string, reason: string }}
 */
export function classifyScenario(scenario) {
  const text = [scenario.name, ...scenario.steps].join(' ').toLowerCase();

  // Score each category
  const e2eScore = scoreKeywords(text, E2E_KEYWORDS);
  const integrationScore = scoreKeywords(text, INTEGRATION_KEYWORDS);
  const unitScore = scoreKeywords(text, UNIT_KEYWORDS);

  // Multi-step flows (4+ steps) lean toward E2E
  const stepBonus = scenario.steps.length >= 4 ? 2 : 0;
  const adjustedE2e = e2eScore + stepBonus;

  if (adjustedE2e > integrationScore && adjustedE2e > unitScore) {
    return {
      category: 'e2e-suitable',
      reason: 'Multi-step user flow or UI interaction detected'
    };
  }

  if (integrationScore > unitScore) {
    return {
      category: 'integration-suitable',
      reason: 'Cross-component interaction without user-facing flow'
    };
  }

  return {
    category: 'unit-suitable',
    reason: 'Pure logic, computation, or single-function behavior'
  };
}

function scoreKeywords(text, keywords) {
  return keywords.reduce((score, kw) => {
    return score + (text.includes(kw.toLowerCase()) ? 1 : 0);
  }, 0);
}

/**
 * Analyze a feature file: parse, classify all scenarios
 * @param {string} filePath - Path to .feature file
 * @returns {{ classifications: object[], message?: string, error?: string, availableFiles?: string[] }}
 */
export function analyzeFeatureFile(filePath) {
  if (!existsSync(filePath)) {
    const dir = dirname(filePath);
    let availableFiles;
    try {
      const files = readdirSync(dir).filter(f => f.endsWith('.feature'));
      if (files.length > 0) {
        availableFiles = files;
      }
    } catch {
      // directory doesn't exist
    }

    return {
      error: `找不到檔案：${filePath}`,
      classifications: [],
      ...(availableFiles ? { availableFiles } : {})
    };
  }

  const content = readFileSync(filePath, 'utf-8');
  const scenarios = parseFeatureScenarios(content);

  if (scenarios.length === 0) {
    return {
      classifications: [],
      message: '此 feature 檔案不包含可分析的 Scenario'
    };
  }

  const classifications = scenarios.map(s => ({
    scenario: s.name,
    ...classifyScenario(s)
  }));

  return { classifications };
}

// ============================================================
// REQ-3: 既有模式分析
// ============================================================

/**
 * Analyze existing E2E test files to extract coding patterns
 * @param {string} e2eDir - Path to E2E test directory
 * @returns {{ imports: string[], helpers: string[], testFramework: string, summary: string, useDefault: boolean }}
 */
export function analyzeExistingPatterns(e2eDir) {
  const empty = { imports: [], helpers: [], testFramework: 'unknown', summary: '', useDefault: true };

  if (!existsSync(e2eDir)) return empty;

  const testFiles = safeReaddir(e2eDir).filter(f => f.endsWith('.test.js') || f.endsWith('.test.ts'));
  if (testFiles.length === 0) return empty;

  const importSources = new Set();
  const helpers = new Set();
  let testFramework = 'unknown';

  for (const file of testFiles) {
    const content = readFileSync(join(e2eDir, file), 'utf-8');

    // Extract import sources (non-framework)
    const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
    for (const m of importMatches) {
      const src = m[1];
      if (!src.includes('vitest') && !src.includes('jest') && !src.includes('mocha')) {
        importSources.add(src);
      }
      if (src.includes('vitest')) testFramework = 'vitest';
      else if (src.includes('jest')) testFramework = 'jest';
    }

    // Extract named imports (helpers)
    const namedImports = content.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](?!vitest|jest)[^'"]+['"]/g);
    for (const m of namedImports) {
      m[1].split(',').map(h => h.trim()).filter(Boolean).forEach(h => helpers.add(h));
    }
  }

  const importList = [...importSources];
  const helperList = [...helpers];

  return {
    imports: importList,
    helpers: helperList,
    testFramework,
    summary: `Found ${testFiles.length} E2E tests using ${testFramework}. Common imports: ${importList.join(', ')}`,
    useDefault: false
  };
}

// ============================================================
// REQ-4: E2E 測試骨架生成
// ============================================================

const SKELETON_TEMPLATES = {
  vitest: {
    header: (specId) => `/**
 * [Generated] E2E tests for ${specId}
 * [TODO] Fill in test implementations
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
`,
    setup: () => `
// [TODO] Setup fixtures and test data
let testDir;

beforeAll(async () => {
  // [TODO] Initialize test fixture (DB seed, temp files, etc.)
});

beforeEach(async () => {
  // [TODO] Reset state before each test
});

afterEach(async () => {
  // [TODO] Cleanup after each test
});
`,
    test: (scenario) => `
  // @${scenario.specId} @${scenario.ac}
  it('${scenario.name}', async () => {
    // Arrange
    // [TODO] Setup test preconditions

    // Act
    // [TODO] Execute the user flow

    // Assert
    // [TODO] Verify expected outcomes
  });
`
  },

  playwright: {
    header: (specId) => `/**
 * [Generated] E2E tests for ${specId}
 * [TODO] Fill in test implementations
 */

import { test, expect } from '@playwright/test';
`,
    setup: () => `
// [TODO] Setup fixtures and test data

test.beforeAll(async () => {
  // [TODO] Initialize test fixture (DB seed, API mock, etc.)
});

test.beforeEach(async ({ page }) => {
  // [TODO] Navigate to starting page
});
`,
    test: (scenario) => `
// @${scenario.specId} @${scenario.ac}
test('${scenario.name}', async ({ page }) => {
  // Arrange
  // [TODO] Setup test preconditions

  // Act
  // [TODO] Execute the user flow

  // Assert
  // [TODO] Verify expected outcomes
});
`
  },

  cypress: {
    header: (specId) => `/**
 * [Generated] E2E tests for ${specId}
 * [TODO] Fill in test implementations
 */
`,
    setup: () => `
// [TODO] Setup fixtures and test data

before(() => {
  // [TODO] Initialize test fixture (DB seed, API mock, etc.)
});

beforeEach(() => {
  // [TODO] Visit starting page
  // cy.visit('/');
});
`,
    test: (scenario) => `
  // @${scenario.specId} @${scenario.ac}
  it('${scenario.name}', () => {
    // Arrange
    // [TODO] Setup test preconditions

    // Act
    // [TODO] Execute the user flow
    // cy.get('[data-testid="..."]').click();

    // Assert
    // [TODO] Verify expected outcomes
    // cy.contains('expected text').should('be.visible');
  });
`
  }
};

/**
 * Generate E2E test skeleton from classified scenarios
 * @param {{ name: string, category: string, specId?: string, ac?: string }[]} scenarios
 * @param {{ framework: string }} options
 * @returns {string}
 */
export function generateE2eSkeleton(scenarios, { framework = 'vitest' } = {}) {
  const template = SKELETON_TEMPLATES[framework] || SKELETON_TEMPLATES.vitest;
  const specId = scenarios[0]?.specId || 'SPEC-XXX';

  let output = template.header(specId);
  output += template.setup();

  if (framework === 'vitest') {
    output += `\ndescribe('E2E: ${specId}', () => {`;
  } else if (framework === 'cypress') {
    output += `\ndescribe('E2E: ${specId}', () => {`;
  }

  for (const s of scenarios) {
    output += template.test(s);
  }

  if (framework === 'vitest' || framework === 'cypress') {
    output += '});\n';
  }

  return output;
}

/**
 * Check if a file path looks like a SDD spec file
 * @param {string} filePath
 * @returns {boolean}
 */
export function isSpecFile(filePath) {
  const name = basename(filePath);
  return name.startsWith('SPEC-') && name.endsWith('.md');
}

// ============================================================
// REQ-5: 覆蓋差距分析
// ============================================================

/**
 * Analyze coverage gap between BDD features and E2E tests
 * @param {string} featuresDir - Path to features directory
 * @param {string} e2eDir - Path to E2E tests directory
 * @returns {{ total: number, covered: number, missing: string[], suggestions: string[] }}
 */
export function analyzeCoverageGap(featuresDir, e2eDir) {
  const featureFiles = safeReaddir(featuresDir).filter(f => f.endsWith('.feature'));
  const e2eFiles = safeReaddir(e2eDir).filter(f => f.includes('.e2e.test.') || f.includes('.e2e.spec.'));

  // Extract spec IDs from e2e test filenames
  const coveredPrefixes = new Set(
    e2eFiles.map(f => f.replace(/\.e2e\.(test|spec)\.(js|ts|mjs)$/, ''))
  );

  const missing = featureFiles.filter(f => {
    const prefix = f.replace(/\.feature$/, '');
    return !coveredPrefixes.has(prefix);
  });

  const suggestions = [];
  if (missing.length > 0) {
    suggestions.push(`${missing.length} feature(s) 缺少 E2E 覆蓋。執行 /ac-coverage-assistant 取得 AC 層級追蹤。`);
  }

  return {
    total: featureFiles.length,
    covered: featureFiles.length - missing.length,
    missing,
    suggestions
  };
}

function safeReaddir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
