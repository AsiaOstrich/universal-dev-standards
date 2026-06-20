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

  // 3. Write back to manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest synced. Standards: ${manifest.stats.core_standards}, Skills: ${manifest.stats.skills}, Slash Commands: ${manifest.stats.slash_commands}`);
}

syncManifest().catch(console.error);
