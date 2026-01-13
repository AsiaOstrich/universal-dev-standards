import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Detect the programming language of the project
 * @param {string} projectPath - Path to the project
 * @returns {Object} Detected languages
 */
export function detectLanguage(projectPath) {
  const detected = {
    csharp: false,
    php: false,
    typescript: false,
    javascript: false,
    python: false
  };

  // Check for C# project files
  if (existsSync(join(projectPath, '*.csproj')) ||
      existsSync(join(projectPath, '*.sln')) ||
      hasFileWithExtension(projectPath, '.csproj') ||
      hasFileWithExtension(projectPath, '.cs')) {
    detected.csharp = true;
  }

  // Check for PHP
  if (existsSync(join(projectPath, 'composer.json')) ||
      hasFileWithExtension(projectPath, '.php')) {
    detected.php = true;
  }

  // Check for TypeScript
  if (existsSync(join(projectPath, 'tsconfig.json')) ||
      hasFileWithExtension(projectPath, '.ts') ||
      hasFileWithExtension(projectPath, '.tsx')) {
    detected.typescript = true;
  }

  // Check for JavaScript
  if (existsSync(join(projectPath, 'package.json')) ||
      hasFileWithExtension(projectPath, '.js') ||
      hasFileWithExtension(projectPath, '.jsx')) {
    detected.javascript = true;
  }

  // Check for Python
  if (existsSync(join(projectPath, 'requirements.txt')) ||
      existsSync(join(projectPath, 'setup.py')) ||
      existsSync(join(projectPath, 'pyproject.toml')) ||
      hasFileWithExtension(projectPath, '.py')) {
    detected.python = true;
  }

  return detected;
}

/**
 * Detect the framework used in the project
 * @param {string} projectPath - Path to the project
 * @returns {Object} Detected frameworks
 */
export function detectFramework(projectPath) {
  const detected = {
    'fat-free': false,
    react: false,
    vue: false,
    angular: false,
    dotnet: false
  };

  // Check for Fat-Free Framework (PHP)
  const composerPath = join(projectPath, 'composer.json');
  if (existsSync(composerPath)) {
    try {
      const composer = JSON.parse(readFileSync(composerPath, 'utf-8'));
      const deps = { ...composer.require, ...composer['require-dev'] };
      if (deps['bcosca/fatfree'] || deps['bcosca/fatfree-core']) {
        detected['fat-free'] = true;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check for React/Vue/Angular
  const packagePath = join(projectPath, 'package.json');
  if (existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['react'] || deps['react-dom']) {
        detected.react = true;
      }
      if (deps['vue']) {
        detected.vue = true;
      }
      if (deps['@angular/core']) {
        detected.angular = true;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check for .NET
  if (hasFileWithExtension(projectPath, '.csproj') ||
      hasFileWithExtension(projectPath, '.sln')) {
    detected.dotnet = true;
  }

  return detected;
}

/**
 * Detect AI tools configured in the project
 * @param {string} projectPath - Path to the project
 * @returns {Object} Detected AI tools
 */
export function detectAITools(projectPath) {
  const hasAgentsMd = existsSync(join(projectPath, 'AGENTS.md'));

  const detected = {
    cursor: existsSync(join(projectPath, '.cursorrules')),
    windsurf: existsSync(join(projectPath, '.windsurfrules')),
    cline: existsSync(join(projectPath, '.clinerules')),
    copilot: existsSync(join(projectPath, '.github', 'copilot-instructions.md')),
    claudeCode: existsSync(join(projectPath, '.claude')) ||
                existsSync(join(projectPath, 'CLAUDE.md')),
    antigravity: existsSync(join(projectPath, 'INSTRUCTIONS.md')),
    codex: hasAgentsMd,
    opencode: hasAgentsMd,
    geminiCli: existsSync(join(projectPath, 'GEMINI.md'))
  };

  return detected;
}

/**
 * Check if any file with the given extension exists in the directory
 * @param {string} dirPath - Directory path
 * @param {string} extension - File extension (with dot)
 * @returns {boolean} True if file exists
 */
function hasFileWithExtension(dirPath, extension) {
  try {
    const files = readdirSync(dirPath);
    return files.some(f => f.endsWith(extension));
  } catch {
    return false;
  }
}

/**
 * Get a summary of all detections
 * @param {string} projectPath - Path to the project
 * @returns {Object} Detection summary
 */
export function detectAll(projectPath) {
  return {
    languages: detectLanguage(projectPath),
    frameworks: detectFramework(projectPath),
    aiTools: detectAITools(projectPath)
  };
}
