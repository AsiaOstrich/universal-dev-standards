import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const manifestPath = path.join(ROOT_DIR, 'uds-manifest.json');
const coreDir = path.join(ROOT_DIR, 'core');
const skillsDir = path.join(ROOT_DIR, 'skills');

async function syncManifest() {
  console.log('🔄 Syncing UDS Manifest...');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest not found at:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

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

  // 3. Write back to manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest synced. Standards: ${manifest.stats.core_standards}, Skills: ${manifest.stats.skills}`);
}

syncManifest().catch(console.error);
