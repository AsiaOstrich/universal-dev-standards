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
 * Files and directories under `.agents/` that Antigravity (agy) owns.
 *
 * 🔴 Detection used to be `.agents/AGENTS.md` alone (2026-09-08). That file is one
 * of the things agy reads but a project can use agy for a long time without ever
 * creating it, so `uds init --with-hooks` in such a project never wired the hook
 * (found 2026-09-29 installing 6.14.0-beta.1 into a fresh project).
 *
 * The markers below come from the agy 1.2.12 binary (`strings`: the literal path
 * templates `.agents/rules/`, `.agents/workflows/`, `.agents/plugins/`,
 * `.agents/hooks.json`, `.agents/skills.json`, `.agents/agents/`) and from
 * antigravity.google/docs/hooks (project hooks live at `.agents/hooks.json`;
 * "Rules" and "Workflows" are documented Antigravity concepts). Chosen: the ones
 * documented or carried by the tool itself whose NAME is agy's — not the generic
 * `agents/` or `skills.json`.
 *
 * ⚠️ `.agents/skills/` is NOT a marker. Codex reads project skills from the same
 * `.agents/skills/` (measured 2026-09-08: only that arm made Codex see the
 * skills), so a directory that both tools share cannot say which one is in use.
 * A repo with root AGENTS.md plus `.agents/skills/` is Codex and must stay Codex.
 *
 * ⚠️ `.agents/hooks.json` is also the file `uds` itself writes for agy. Detecting
 * on it is self-referential: after an install it proves the install happened, not
 * that the adopter uses agy. It is kept because a hooks.json that someone else
 * (the adopter, another tool) put there is real evidence, and because dropping it
 * would make a re-run of the installer stop seeing the project it just wired.
 *
 * Not used: `~/.gemini/projects.json` lists the projects agy has opened. It is the
 * tool's own registry and a strong signal, but it lives in the user's home, is
 * machine-local, and would make the same repository detect differently on two
 * machines. Detection stays a function of the project directory.
 */
export const ANTIGRAVITY_MARKERS = ['AGENTS.md', 'hooks.json', 'rules', 'workflows', 'plugins'];

/**
 * @param {string} projectPath
 * @returns {boolean} true when `.agents/` carries something Antigravity owns
 */
export function detectAntigravity(projectPath) {
  const dir = join(projectPath, '.agents');
  if (!existsSync(dir)) return false;
  return ANTIGRAVITY_MARKERS.some((m) => existsSync(join(dir, m)));
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
    // Antigravity never read INSTRUCTIONS.md.
    // Measured 2026-09-08 with two positive controls in the same run: tokens planted in `AGENTS.md` and `.agents/AGENTS.md` both came back with correct attribution; the one in INSTRUCTIONS.md did not.
    // `.agents/AGENTS.md` is used rather than the repo root so it does not collide with Codex/OpenCode, which both target root AGENTS.md.
    // See detectAntigravity() for the wider marker set and for what is deliberately NOT one.
    antigravity: detectAntigravity(projectPath),
    // 🔴 Roo Code had a full entry in the path table (`.roo/skills/`, tier "complete"
    // in REGISTRY.json) and NO line here, so `uds init` could never install for it —
    // however correct those paths were. Found by `check:install-paths`, which walks
    // the path table instead of naming tools; nothing else was looking.
    //
    // Markers are the ones Roo Code's own docs name, not a guess from the tool name:
    //   `.roo/rules/`  — "Workspace-wide rules", the current directory-based method
    //   `.roorules`    — the legacy single-file fallback, still read
    // (roocodeinc.github.io/Roo-Code/features/custom-instructions, read 2026-09-08)
    // `.roo` is matched rather than `.roo/rules` because Roo also uses `.roo/skills/`
    // and `.roo/rules-{mode}/`; the directory is what marks the tool.
    //
    // ⚠️ Deliberately NOT `.clinerules`. REGISTRY.json lists it under Roo Code as
    // legacy backward-compat, and it is also Cline's own marker — detecting on it
    // would make the two tools indistinguishable.
    'roo-code': existsSync(join(projectPath, '.roo')) ||
                existsSync(join(projectPath, '.roorules')),
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
