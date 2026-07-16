import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const manifestPath = path.join(ROOT_DIR, 'uds-manifest.json');
const packageJsonPath = path.join(ROOT_DIR, 'cli', 'package.json');
const coreDir = path.join(ROOT_DIR, 'core');
const skillsDir = path.join(ROOT_DIR, 'skills');
const cliBinPath = path.join(ROOT_DIR, 'cli', 'bin', 'uds.js');

/**
 * Extract top-level Commander command names registered directly on the
 * `program` (or other named root parameter) instance in the given source
 * text. Only counts the FIRST `.command('name')` call following a bare
 * `<root>` or `const X = <root>` statement start — later `.command()` calls
 * chained in the same statement (e.g. `program.command('hitl').command('check')`)
 * or issued on a previously-captured subcommand variable (e.g.
 * `specCommand.command('create')`) register subcommands, not top-level ones,
 * and are correctly excluded because their statement doesn't start with the
 * root identifier.
 */
function extractTopLevelCommandNames(source, rootIdentifier = 'program') {
  const lines = source.split('\n');
  const names = [];
  let capturing = false;
  const triggerRe = new RegExp(`^const\\s+\\w+\\s*=\\s*${rootIdentifier}$`);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === rootIdentifier || triggerRe.test(line)) {
      capturing = true;
      continue;
    }
    if (capturing) {
      const m = /^\.command\(\s*['"]([^'"\s[<]+)/.exec(line);
      if (m) {
        names.push(m[1]);
        capturing = false; // only the first .command() per statement is top-level
      }
    }
  }
  return names;
}

/**
 * Some commands are registered via a helper function that takes the root
 * `program` instance as its sole argument (e.g. `mcpCommand(program)`)
 * instead of being chained inline in cli/bin/uds.js. Detect calls of the
 * form `fn(program)`, resolve `fn` back to its source file via the import
 * statements at the top of `source`, and recurse into that file (relative to
 * its own `program` parameter) to pick up the commands it registers.
 */
function extractDelegatedCommandNames(source, baseDir) {
  const names = [];
  const importMap = new Map(); // functionName -> resolved file path
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
  let im;
  while ((im = importRe.exec(source)) !== null) {
    const specifiers = im[1].split(',').map(s => s.trim()).filter(Boolean);
    const modPath = im[2];
    if (!modPath.startsWith('.')) continue; // skip external packages
    for (const spec of specifiers) {
      const name = spec.split(/\s+as\s+/).pop().trim();
      importMap.set(name, path.resolve(baseDir, modPath));
    }
  }

  const callRe = /\b(\w+)\(program\)/g;
  let cm;
  while ((cm = callRe.exec(source)) !== null) {
    const fnName = cm[1];
    const filePath = importMap.get(fnName);
    if (!filePath || !fs.existsSync(filePath)) continue;
    const delegatedSource = fs.readFileSync(filePath, 'utf8');
    names.push(...extractTopLevelCommandNames(delegatedSource, 'program'));
  }
  return names;
}

/**
 * Compute the real top-level `uds <command>` list by introspecting Commander
 * registration calls in cli/bin/uds.js, instead of relying on a hand-maintained
 * count. This is what actually drifted (badly) before this fix — see
 * XSPEC docs-drift audit, 2026-07-16.
 */
function getCliCommandNames() {
  const cliBinSource = fs.readFileSync(cliBinPath, 'utf8');
  const inline = extractTopLevelCommandNames(cliBinSource, 'program');
  const delegated = extractDelegatedCommandNames(cliBinSource, path.dirname(cliBinPath));
  return [...new Set([...inline, ...delegated])].sort();
}

async function syncManifest() {
  console.log('🔄 Syncing UDS Manifest...');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest not found at:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // 0. Sync version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = manifest.version;
  manifest.version = packageJson.version;
  if (oldVersion !== packageJson.version) {
    console.log(`📦 Version synced: ${oldVersion} → ${packageJson.version}`);
  }

  // 1. Sync Core Standards
  const coreFiles = fs.readdirSync(coreDir)
    .filter(f => f.endsWith('.md') && !fs.statSync(path.join(coreDir, f)).isDirectory())
    .map(f => f.replace('.md', ''));

  manifest.stats.core_standards = coreFiles.length;
  
  // Cross-check missing in manifest
  coreFiles.forEach(id => {
    if (!manifest.standards.find(s => s.id === id)) {
      console.log(`➕ New standard detected: ${id}. Adding to manifest...`);
      manifest.standards.push({ id, category: "uncategorized", level: 3 });
    }
  });

  // 2. Sync Skills (only directories containing SKILL.md)
  const skillFolders = fs.readdirSync(skillsDir)
    .filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory() && !f.startsWith('_')
      && fs.existsSync(path.join(skillsDir, f, 'SKILL.md')));

  manifest.stats.skills = skillFolders.length;

  skillFolders.forEach(id => {
    if (!manifest.skills.find(s => s.id === id)) {
      console.log(`➕ New skill detected: ${id}. Adding to manifest...`);
      manifest.skills.push({ id, command: "/guide", category: "uncategorized" });
    }
  });

  // 2b. Sync Slash Commands (command-definition files in skills/commands/).
  // Counts actual `/command` definition files; excludes the family overview,
  // the JSON index, README, and templates. This keeps the published
  // slash_commands stat auto-derived so it never drifts when commands change.
  const commandsDir = path.join(skillsDir, 'commands');
  const NON_COMMAND_FILES = ['COMMAND-FAMILY-OVERVIEW.md', 'README.md'];
  const commandFiles = fs.readdirSync(commandsDir)
    .filter(f => f.endsWith('.md') && !NON_COMMAND_FILES.includes(f) && !/TEMPLATE/i.test(f));

  manifest.stats.slash_commands = commandFiles.length;

  // 3. Sync CLI Commands (top-level `uds <command>` list, introspected from
  // cli/bin/uds.js's actual Commander registrations — see getCliCommandNames
  // above). Previously a hardcoded string in scripts/generate-docs.mjs that
  // silently rotted (README said 6 while cli/bin/uds.js registered 21).
  const cliCommandNames = getCliCommandNames();
  manifest.stats.cli_commands = cliCommandNames.length;

  // 4. Write back to manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest synced. Standards: ${manifest.stats.core_standards}, Skills: ${manifest.stats.skills}, Slash Commands: ${manifest.stats.slash_commands}, CLI Commands: ${manifest.stats.cli_commands}`);
}

syncManifest().catch(console.error);
