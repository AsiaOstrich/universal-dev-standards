import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPPORTED_FRAMEWORKS = [
  // JavaScript/TypeScript
  'playwright', 'cypress', 'vitest', 'webdriverio',
  // Python
  'pytest-playwright', 'selenium-python', 'robot-framework', 'behave',
  // Java
  'selenium-java', 'playwright-java', 'gauge',
  // Go
  'chromedp', 'rod',
  // C#
  'playwright-dotnet', 'selenium-dotnet',
  // Ruby
  'capybara', 'watir',
];

/**
 * Detect E2E testing frameworks in the project
 * @param {string} projectPath - Path to the project
 * @returns {{ detected: string[], promptRequired: boolean, options?: string[] }}
 */
export function detectE2eFramework(projectPath) {
  const detected = [];

  // Python ecosystem detection
  const pythonFiles = ['requirements.txt', 'pyproject.toml'];
  for (const pyFile of pythonFiles) {
    const pyPath = join(projectPath, pyFile);
    if (existsSync(pyPath)) {
      try {
        const content = readFileSync(pyPath, 'utf-8');
        if (content.includes('pytest-playwright')) detected.push('pytest-playwright');
        if (content.includes('selenium')) detected.push('selenium-python');
        if (content.includes('robotframework')) detected.push('robot-framework');
        if (content.includes('behave')) detected.push('behave');
      } catch {
        // Ignore read errors
      }
      break;
    }
  }

  // Go ecosystem detection
  const goModPath = join(projectPath, 'go.mod');
  if (existsSync(goModPath)) {
    try {
      const content = readFileSync(goModPath, 'utf-8');
      if (content.includes('chromedp')) detected.push('chromedp');
      if (content.includes('/rod')) detected.push('rod');
    } catch {
      // Ignore read errors
    }
  }

  // Java ecosystem detection
  for (const javaFile of ['pom.xml', 'build.gradle']) {
    const javaPath = join(projectPath, javaFile);
    if (existsSync(javaPath)) {
      try {
        const content = readFileSync(javaPath, 'utf-8');
        if (content.includes('selenium')) detected.push('selenium-java');
        if (content.includes('playwright')) detected.push('playwright-java');
        if (content.includes('gauge')) detected.push('gauge');
      } catch {
        // Ignore read errors
      }
      break;
    }
  }

  // Ruby ecosystem detection
  const gemfilePath = join(projectPath, 'Gemfile');
  if (existsSync(gemfilePath)) {
    try {
      const content = readFileSync(gemfilePath, 'utf-8');
      if (content.includes('capybara')) detected.push('capybara');
      if (content.includes('watir')) detected.push('watir');
    } catch {
      // Ignore read errors
    }
  }

  // JavaScript/TypeScript ecosystem detection
  const packagePath = join(projectPath, 'package.json');
  if (existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['@playwright/test']) {
        detected.push('playwright');
      }

      if (deps['cypress'] && hasCypressConfig(projectPath)) {
        detected.push('cypress');
      }

      if (deps['vitest'] && hasE2eDirectory(projectPath)) {
        detected.push('vitest');
      }
    } catch {
      // Ignore parse errors
    }
  }

  const promptRequired = detected.length === 0 || detected.length > 1;

  return {
    detected,
    promptRequired,
    ...(detected.length === 0 ? { options: SUPPORTED_FRAMEWORKS } : {})
  };
}

function hasCypressConfig(projectPath) {
  return ['cypress.config.js', 'cypress.config.ts', 'cypress.config.mjs', 'cypress.config.cjs']
    .some(f => existsSync(join(projectPath, f)));
}

function hasE2eDirectory(projectPath) {
  const candidates = ['tests/e2e', 'test/e2e', 'e2e'];
  return candidates.some(d => {
    const dirPath = join(projectPath, d);
    try {
      return existsSync(dirPath) && readdirSync(dirPath) !== undefined;
    } catch {
      return false;
    }
  });
}
