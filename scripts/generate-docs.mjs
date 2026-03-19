import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const manifestPath = path.join(ROOT_DIR, 'uds-manifest.json');
const packageJsonPath = path.join(ROOT_DIR, 'cli', 'package.json');
const readmeFiles = [
  path.join(ROOT_DIR, 'README.md'),
  path.join(ROOT_DIR, 'locales/zh-TW/README.md'),
  path.join(ROOT_DIR, 'locales/zh-CN/README.md')
];

function generateStatsTable(manifest, lang = 'en') {
  const t = {
    en: { cat: 'Category', count: 'Count', desc: 'Description', core: 'Core Standards', guidelines: 'Universal development guidelines', skills: 'AI Skills', interactive: 'Interactive skills', slash: 'Slash Commands', quick: 'Quick actions', cli: 'CLI Commands' },
    zh: { cat: '類別', count: '數量', desc: '說明', core: '核心標準', guidelines: '通用開發準則', skills: 'AI Skills', interactive: '互動式技能', slash: '斜線命令', quick: '快速操作', cli: 'CLI 指令' },
    cn: { cat: '类别', count: '数量', desc: '说明', core: '核心标准', guidelines: '通用开发准则', skills: 'AI Skills', interactive: '互动式技能', slash: '斜线命令', quick: '快速操作', cli: 'CLI 命令' }
  }[lang] || t.en;

  return `
| ${t.cat} | ${t.count} | ${t.desc} |
|----------|-------|-------------|
| **${t.core}** | ${manifest.stats.core_standards} | ${t.guidelines} |
| **${t.skills}** | ${manifest.stats.skills} | ${t.interactive} |
| **${t.slash}** | ${manifest.stats.slash_commands} | ${t.quick} |
| **${t.cli}** | 6 | list, init, configure, check, update, skills |`.trim();
}

function syncReadmeVersions(version) {
  console.log('📦 Syncing README versions...');
  const today = new Date().toISOString().slice(0, 10);

  // Determine pre-release label
  let preReleaseLabel = '';
  if (version.includes('-')) {
    preReleaseLabel = ' (Pre-release)';
  }

  // Pattern: **Version**: X.Y.Z ... | **Released**: ... | ...
  // Pattern: **版本**: X.Y.Z ... | **發布日期**: ... | ...
  // Pattern: **版本**: X.Y.Z ... | **发布日期**: ... | ...
  const patterns = [
    { regex: /(\*\*Version\*\*:\s*)[^\|]+(\|\s*\*\*Released\*\*:\s*)[^\|]+/, replacement: `$1${version}${preReleaseLabel} $2${today} ` },
    { regex: /(\*\*版本\*\*:\s*)[^\|]+(\|\s*\*\*發布日期\*\*:\s*)[^\|]+/, replacement: `$1${version}${preReleaseLabel} $2${today} ` },
    { regex: /(\*\*版本\*\*:\s*)[^\|]+(\|\s*\*\*发布日期\*\*:\s*)[^\|]+/, replacement: `$1${version}${preReleaseLabel} $2${today} ` }
  ];

  readmeFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = path.relative(ROOT_DIR, filePath);
    let updated = false;

    for (const { regex, replacement } of patterns) {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        updated = true;
        break;
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Version synced in: ${relPath} → ${version}`);
    }
  });
}

async function injectDocs() {
  console.log('📝 Injecting data into documentation...');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Sync README version lines from package.json
  syncReadmeVersions(packageJson.version);

  readmeFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let lang = 'en';
    if (filePath.includes('zh-TW')) lang = 'zh';
    if (filePath.includes('zh-CN')) lang = 'cn';

    // Inject Stats Table
    const statsTable = generateStatsTable(manifest, lang);
    const regex = /<!-- UDS_STATS_TABLE_START -->[\s\S]*?<!-- UDS_STATS_TABLE_END -->/g;

    if (content.match(regex)) {
      content = content.replace(regex, `<!-- UDS_STATS_TABLE_START -->
${statsTable}
<!-- UDS_STATS_TABLE_END -->`);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Injected stats into: ${path.relative(ROOT_DIR, filePath)}`);
    } else {
      console.warn(`⚠️ Placeholder not found in: ${path.relative(ROOT_DIR, filePath)}`);
    }
  });
}

injectDocs().catch(console.error);
