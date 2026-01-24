# [INIT-01] Project Detection Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: INIT-01

---

## Summary

This specification defines the project detection module (`detector.js`) which analyzes a project's structure to automatically detect languages, frameworks, AI tools, and other characteristics for intelligent defaults during initialization.

---

## Motivation

Automatic detection provides:
1. **Better UX**: Pre-select relevant options for users
2. **Accuracy**: Detect actual tech stack from project files
3. **Convenience**: Reduce manual configuration steps
4. **Awareness**: Show existing AI tool configurations

---

## Detailed Design

### Module Location

```
cli/src/utils/detector.js
```

---

## Detection Categories

### 1. Language Detection

| Language | Detection Method | Indicator Files |
|----------|-----------------|-----------------|
| JavaScript | File extension | `*.js`, `*.mjs`, `*.cjs` |
| TypeScript | File extension + config | `*.ts`, `*.tsx`, `tsconfig.json` |
| Python | File extension + config | `*.py`, `requirements.txt`, `pyproject.toml` |
| Go | File extension + config | `*.go`, `go.mod` |
| Rust | File extension + config | `*.rs`, `Cargo.toml` |
| Java | File extension + config | `*.java`, `pom.xml`, `build.gradle` |
| C# | File extension + config | `*.cs`, `*.csproj` |
| Ruby | File extension + config | `*.rb`, `Gemfile` |
| PHP | File extension + config | `*.php`, `composer.json` |
| Swift | File extension + config | `*.swift`, `Package.swift` |
| Kotlin | File extension + config | `*.kt`, `*.kts` |
| Scala | File extension + config | `*.scala`, `build.sbt` |
| Elixir | File extension + config | `*.ex`, `*.exs`, `mix.exs` |
| Clojure | File extension + config | `*.clj`, `deps.edn` |

### 2. Framework Detection

| Framework | Detection Method | Indicator |
|-----------|-----------------|-----------|
| React | package.json | `react` dependency |
| Vue | package.json | `vue` dependency |
| Angular | package.json | `@angular/core` dependency |
| Svelte | package.json | `svelte` dependency |
| Next.js | package.json | `next` dependency |
| Express | package.json | `express` dependency |
| NestJS | package.json | `@nestjs/core` dependency |
| Django | requirements.txt | `django` or `Django` |
| Flask | requirements.txt | `flask` or `Flask` |
| FastAPI | requirements.txt | `fastapi` |
| Rails | Gemfile | `rails` gem |
| Spring | pom.xml/build.gradle | `spring-boot` |

### 3. AI Tool Detection

| AI Tool | Detection Method | Indicator Files |
|---------|-----------------|-----------------|
| Claude Code | File presence | `CLAUDE.md`, `.claude/` |
| Cursor | File presence | `.cursorrules`, `.cursor/` |
| Windsurf | File presence | `.windsurfrules` |
| Cline | File presence | `.clinerules`, `.cline/` |
| GitHub Copilot | File presence | `.github/copilot-instructions.md` |
| OpenCode | File presence | `.opencode/` |
| Aider | File presence | `.aider/CONVENTIONS.md`, `.aiderignore` |
| Roo | File presence | `.roo/` |
| Antigravity | File presence | `.antigravity/` |

### 4. CI/CD Detection

| Platform | Detection Method | Indicator |
|----------|-----------------|-----------|
| GitHub Actions | Directory presence | `.github/workflows/` |
| GitLab CI | File presence | `.gitlab-ci.yml` |
| CircleCI | File presence | `.circleci/config.yml` |
| Travis CI | File presence | `.travis.yml` |
| Jenkins | File presence | `Jenkinsfile` |
| Azure Pipelines | File presence | `azure-pipelines.yml` |

### 5. Package Manager Detection

| Manager | Detection Method | Indicator |
|---------|-----------------|-----------|
| npm | File presence | `package-lock.json` |
| yarn | File presence | `yarn.lock` |
| pnpm | File presence | `pnpm-lock.yaml` |
| pip | File presence | `requirements.txt` |
| poetry | File presence | `poetry.lock` |
| cargo | File presence | `Cargo.lock` |
| go mod | File presence | `go.sum` |

---

## API Specification

### detectAll

Main entry point for project detection.

```typescript
/**
 * Detect all project characteristics
 *
 * @param projectPath - Absolute path to project root
 * @returns DetectionResult - All detected characteristics
 */
function detectAll(projectPath: string): DetectionResult;

interface DetectionResult {
  /** Detected programming languages */
  languages: Language[];

  /** Detected frameworks */
  frameworks: Framework[];

  /** Detected AI tools (existing configurations) */
  aiTools: AIToolName[];

  /** Detected CI/CD platforms */
  cicd: CICDPlatform[];

  /** Detected package managers */
  packageManagers: PackageManager[];

  /** Whether project has existing UDS installation */
  hasUDS: boolean;

  /** Raw detection metadata */
  raw: {
    hasPackageJson: boolean;
    hasRequirementsTxt: boolean;
    hasGoMod: boolean;
    hasCargoToml: boolean;
    // ... other raw indicators
  };
}

type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'csharp'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'scala'
  | 'elixir'
  | 'clojure';

type Framework =
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'nextjs'
  | 'express'
  | 'nestjs'
  | 'django'
  | 'flask'
  | 'fastapi'
  | 'rails'
  | 'spring';

type AIToolName =
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'cline'
  | 'copilot'
  | 'opencode'
  | 'aider'
  | 'roo'
  | 'antigravity';

type CICDPlatform =
  | 'github-actions'
  | 'gitlab-ci'
  | 'circleci'
  | 'travis'
  | 'jenkins'
  | 'azure-pipelines';

type PackageManager =
  | 'npm'
  | 'yarn'
  | 'pnpm'
  | 'pip'
  | 'poetry'
  | 'cargo'
  | 'gomod';
```

### Individual Detection Functions

```typescript
/**
 * Detect programming languages used in project
 */
function detectLanguages(projectPath: string): Language[];

/**
 * Detect frameworks based on dependencies
 */
function detectFrameworks(projectPath: string): Framework[];

/**
 * Detect existing AI tool configurations
 */
function detectAITools(projectPath: string): AIToolName[];

/**
 * Detect CI/CD platforms
 */
function detectCICD(projectPath: string): CICDPlatform[];

/**
 * Detect package managers
 */
function detectPackageManagers(projectPath: string): PackageManager[];
```

---

## Detection Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Project Detection Flow                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Input: projectPath                                                         │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 1: File Scanning                                               │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                      │   │
│   │   1. Check for config files                                          │   │
│   │      ├── package.json                                                │   │
│   │      ├── tsconfig.json                                               │   │
│   │      ├── requirements.txt / pyproject.toml                           │   │
│   │      ├── go.mod                                                      │   │
│   │      ├── Cargo.toml                                                  │   │
│   │      └── ... other config files                                      │   │
│   │                                                                      │   │
│   │   2. Check for AI tool files                                         │   │
│   │      ├── CLAUDE.md                                                   │   │
│   │      ├── .cursorrules                                                │   │
│   │      ├── .github/copilot-instructions.md                             │   │
│   │      └── ... other AI tool files                                     │   │
│   │                                                                      │   │
│   │   3. Check for CI/CD files                                           │   │
│   │      ├── .github/workflows/                                          │   │
│   │      ├── .gitlab-ci.yml                                              │   │
│   │      └── ... other CI files                                          │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 2: Dependency Analysis                                         │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                      │   │
│   │   1. Parse package.json (if exists)                                  │   │
│   │      └── Extract dependencies and devDependencies                    │   │
│   │                                                                      │   │
│   │   2. Parse requirements.txt (if exists)                              │   │
│   │      └── Extract Python packages                                     │   │
│   │                                                                      │   │
│   │   3. Parse other package manifests                                   │   │
│   │      └── Cargo.toml, go.mod, Gemfile, etc.                          │   │
│   │                                                                      │   │
│   │   4. Match dependencies to frameworks                                │   │
│   │      └── react → React, vue → Vue, etc.                             │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 3: Result Aggregation                                          │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                      │   │
│   │   Compile DetectionResult:                                           │   │
│   │   {                                                                  │   │
│   │     languages: ['typescript', 'javascript'],                         │   │
│   │     frameworks: ['react', 'express'],                                │   │
│   │     aiTools: ['claude-code', 'cursor'],                              │   │
│   │     cicd: ['github-actions'],                                        │   │
│   │     packageManagers: ['npm'],                                        │   │
│   │     hasUDS: false,                                                   │   │
│   │     raw: { hasPackageJson: true, ... }                               │   │
│   │   }                                                                  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### Language Detection Logic

```javascript
function detectLanguages(projectPath) {
  const languages = new Set();

  // Check for TypeScript
  if (
    fs.existsSync(path.join(projectPath, 'tsconfig.json')) ||
    globSync('**/*.ts', { cwd: projectPath, maxDepth: 3 }).length > 0
  ) {
    languages.add('typescript');
    languages.add('javascript'); // TypeScript implies JavaScript
  }

  // Check for JavaScript (if not already added via TypeScript)
  if (
    fs.existsSync(path.join(projectPath, 'package.json')) ||
    globSync('**/*.js', { cwd: projectPath, maxDepth: 3 }).length > 0
  ) {
    languages.add('javascript');
  }

  // Check for Python
  if (
    fs.existsSync(path.join(projectPath, 'requirements.txt')) ||
    fs.existsSync(path.join(projectPath, 'pyproject.toml')) ||
    globSync('**/*.py', { cwd: projectPath, maxDepth: 3 }).length > 0
  ) {
    languages.add('python');
  }

  // ... similar checks for other languages

  return Array.from(languages);
}
```

### Framework Detection Logic

```javascript
function detectFrameworks(projectPath) {
  const frameworks = new Set();
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    // Node.js frameworks
    if (allDeps.react) frameworks.add('react');
    if (allDeps.vue) frameworks.add('vue');
    if (allDeps['@angular/core']) frameworks.add('angular');
    if (allDeps.svelte) frameworks.add('svelte');
    if (allDeps.next) frameworks.add('nextjs');
    if (allDeps.express) frameworks.add('express');
    if (allDeps['@nestjs/core']) frameworks.add('nestjs');
  }

  // Python frameworks
  const requirementsPath = path.join(projectPath, 'requirements.txt');
  if (fs.existsSync(requirementsPath)) {
    const requirements = fs.readFileSync(requirementsPath, 'utf-8').toLowerCase();
    if (requirements.includes('django')) frameworks.add('django');
    if (requirements.includes('flask')) frameworks.add('flask');
    if (requirements.includes('fastapi')) frameworks.add('fastapi');
  }

  return Array.from(frameworks);
}
```

### AI Tool Detection Logic

```javascript
const AI_TOOL_INDICATORS = {
  'claude-code': ['CLAUDE.md', '.claude/'],
  'cursor': ['.cursorrules', '.cursor/'],
  'windsurf': ['.windsurfrules'],
  'cline': ['.clinerules', '.cline/'],
  'copilot': ['.github/copilot-instructions.md'],
  'opencode': ['.opencode/'],
  'aider': ['.aider/CONVENTIONS.md', '.aiderignore'],
  'roo': ['.roo/'],
  'antigravity': ['.antigravity/']
};

function detectAITools(projectPath) {
  const detected = [];

  for (const [tool, indicators] of Object.entries(AI_TOOL_INDICATORS)) {
    for (const indicator of indicators) {
      const checkPath = path.join(projectPath, indicator);
      if (fs.existsSync(checkPath)) {
        detected.push(tool);
        break; // Found one indicator, no need to check others
      }
    }
  }

  return detected;
}
```

---

## Edge Cases

### Empty Project

```javascript
// Project with no recognizable files
detectAll('/empty/project');
// Returns:
// {
//   languages: [],
//   frameworks: [],
//   aiTools: [],
//   cicd: [],
//   packageManagers: [],
//   hasUDS: false,
//   raw: { ... all false }
// }
```

### Monorepo Detection

```javascript
// For monorepos, detect at root level only (shallow scan)
// Deep scanning could be slow and produce too many results
function detectLanguages(projectPath) {
  // maxDepth: 3 limits scanning depth
  globSync('**/*.ts', { cwd: projectPath, maxDepth: 3 });
}
```

### Permission Errors

```javascript
// Handle permission errors gracefully
function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.warn(`Warning: Cannot read ${filePath} (permission denied)`);
      return null;
    }
    throw error;
  }
}
```

### Invalid JSON

```javascript
// Handle malformed package.json
function safeParseJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Invalid JSON in ${filePath}`);
    return null;
  }
}
```

---

## Performance Considerations

### Caching

```javascript
// Cache detection results for repeated calls
const detectionCache = new Map();

function detectAllCached(projectPath) {
  const cacheKey = projectPath;
  if (detectionCache.has(cacheKey)) {
    return detectionCache.get(cacheKey);
  }

  const result = detectAll(projectPath);
  detectionCache.set(cacheKey, result);
  return result;
}
```

### Depth Limiting

```javascript
// Limit file scanning depth to avoid performance issues
const MAX_SCAN_DEPTH = 3;
const MAX_FILES_TO_SCAN = 1000;
```

---

## Acceptance Criteria

- [ ] Detects all 14 supported languages
- [ ] Detects all 12 supported frameworks
- [ ] Detects all 9 AI tools
- [ ] Handles empty/minimal projects gracefully
- [ ] Handles permission errors without crashing
- [ ] Handles malformed config files gracefully
- [ ] Completes detection within reasonable time (<5 seconds)
- [ ] Returns consistent result format

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| `fs` | File system access |
| `path` | Path handling |
| `glob` | File pattern matching |

---

## Related Specifications

- [INIT-00 Init Overview](00-init-overview.md) - Parent specification
- [INIT-02 Configuration Flow](02-configuration-flow.md) - Uses detection results

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
