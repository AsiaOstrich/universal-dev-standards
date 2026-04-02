import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPPORTED_FRAMEWORKS = ['playwright', 'cypress', 'vitest'];

/**
 * Detect E2E testing frameworks in the project
 * @param {string} projectPath - Path to the project
 * @returns {{ detected: string[], promptRequired: boolean, options?: string[] }}
 */
export function detectE2eFramework(projectPath) {
  const detected = [];

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
