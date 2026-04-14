/**
 * Command Router — resolves an intent to an executable command
 * Priority: uds.project.yaml → Makefile/justfile/taskfile → ecosystem detection → guide
 * XSPEC-029
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { loadProjectConfig, getCommand } from './project-config.js';

// Ecosystem defaults (from XSPEC-028)
const ECOSYSTEM_DEFAULTS = {
  node:        { test: 'npm test', lint: 'npm run lint', build: 'npm run build', security: 'npm audit' },
  python:      { test: 'python -m pytest', lint: 'python -m ruff check .', build: 'python -m build', security: 'pip-audit' },
  go:          { test: 'go test ./...', lint: 'go vet ./...', build: 'go build ./...', security: 'govulncheck ./...' },
  java_maven:  { test: 'mvn test', lint: 'mvn checkstyle:check', build: 'mvn package', security: 'mvn dependency-check:check' },
  java_gradle: { test: './gradlew test', lint: './gradlew checkstyleMain', build: './gradlew build', security: './gradlew dependencyCheckAnalyze' },
  rust:        { test: 'cargo test', lint: 'cargo clippy', build: 'cargo build', security: 'cargo audit' },
  ruby:        { test: 'bundle exec rspec', lint: 'bundle exec rubocop', build: 'gem build *.gemspec', security: 'bundle audit' },
};

/**
 * Detect the project ecosystem from manifest files.
 * Returns an ecosystem key or 'unknown'.
 */
function detectEcosystem(projectPath) {
  const has = (f) => existsSync(join(projectPath, f));
  if (has('package.json'))                          return 'node';
  if (has('requirements.txt') || has('pyproject.toml') || has('setup.py')) return 'python';
  if (has('go.mod'))                                return 'go';
  if (has('pom.xml'))                               return 'java_maven';
  if (has('build.gradle') || has('build.gradle.kts')) return 'java_gradle';
  if (has('Cargo.toml'))                            return 'rust';
  if (has('Gemfile'))                               return 'ruby';
  return 'unknown';
}

/**
 * Check if a Makefile (or justfile/taskfile) has a target for the given intent.
 */
function findConventionRunner(projectPath, intent) {
  const has = (f) => existsSync(join(projectPath, f));

  if (has('Makefile')) {
    const content = readFileSync(join(projectPath, 'Makefile'), 'utf8');
    const pattern = new RegExp(`^${intent}\\s*:`, 'm');
    if (pattern.test(content)) return `make ${intent}`;
  }
  if (has('justfile') || has('.justfile')) {
    const file = has('justfile') ? 'justfile' : '.justfile';
    const content = readFileSync(join(projectPath, file), 'utf8');
    const pattern = new RegExp(`^${intent}\\s*:`, 'm');
    if (pattern.test(content)) return `just ${intent}`;
  }
  if (has('Taskfile.yml') || has('taskfile.yml')) {
    return `task ${intent}`;
  }
  return null;
}

/**
 * Resolve a command intent to an executable command string.
 * Returns { command, source } where source describes which layer resolved it.
 * Returns null if unresolvable (caller should trigger configure guidance).
 */
export function resolveCommand(intent, projectPath = '.') {
  // Layer 1: uds.project.yaml
  // loadProjectConfig throws on invalid config — let it propagate to caller
  const config = loadProjectConfig(projectPath);
  const cmd = getCommand(config, intent);
  if (cmd) return { command: cmd, source: 'uds.project.yaml' };

  // Layer 2: Convention task runners (Makefile / justfile / taskfile)
  const conventionCmd = findConventionRunner(projectPath, intent);
  if (conventionCmd) return { command: conventionCmd, source: 'convention-runner' };

  // Layer 3: Ecosystem detection fallback
  const ecosystem = detectEcosystem(projectPath);
  if (ecosystem !== 'unknown') {
    const cmd = ECOSYSTEM_DEFAULTS[ecosystem]?.[intent];
    if (cmd) return { command: cmd, source: `ecosystem-fallback:${ecosystem}` };
  }

  // Layer 4: Unresolvable
  return null;
}
