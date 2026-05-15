/**
 * generate-skill-index.ts
 *
 * Generates docs/user/SKILLS-INDEX.md and docs/user/COMMANDS-INDEX.md
 * from uds-manifest.json + skills/SKILL.md frontmatter.
 *
 * Run: npm run docs:generate-index
 * Check: npm run docs:check-index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ──────────────────────────────────────────────
// Tier assignments (source: skills/README.md §Skill Tiers)
// Updated: 2026-05-16
// ──────────────────────────────────────────────
const TIER1_SKILLS = new Set([
  'commit-standards', 'push', 'git-workflow-guide', 'tdd-assistant', 'bdd-assistant',
  'testing-guide', 'code-review-assistant', 'refactoring-assistant', 'requirement-assistant',
  'spec-driven-dev', 'adr-assistant', 'dev-workflow-guide', 'checkin-assistant',
  // Skills added after README tier list (inferred from usage):
  'orchestrate', 'plan',
]);

const TIER3_SKILLS = new Set([
  'incident-response-assistant', 'observability-assistant', 'slo-assistant',
  'runbook-assistant', 'retrospective-assistant', 'durable-execution-assistant',
  'metrics-dashboard-assistant', 'migration-assistant', 'security-scan-assistant',
  'brainstorm-assistant', 'skill-builder', 'ai-collaboration-standards',
]);

// Category override for manifest "uncategorized" entries (inferred from skill purpose)
const CATEGORY_OVERRIDE: Record<string, string> = {
  'push':                    'quality',
  'orchestrate':             'automation',
  'plan':                    'automation',
  'sweep':                   'quality',
  'ac-coverage':             'testing',
  'audit-assistant':         'governance',
  'dev-workflow-guide':      'governance',
  'ac-coverage-assistant':   'testing',
  'ai-collaboration-standards': 'governance',
  'dev-methodology':         'governance',
  'pr-automation-assistant': 'quality',
  'security-assistant':      'security',
  'security-scan-assistant': 'security',
  'e2e-assistant':           'testing',
  'journey-test-assistant':  'testing',
  'observability-assistant': 'operations',
  'process-automation':      'automation',
  'runbook-assistant':       'operations',
  'slo-assistant':           'operations',
  'durable-execution-assistant': 'operations',
  'incident-response-assistant': 'operations',
  'metrics-dashboard-assistant': 'operations',
  'migration-assistant':     'operations',
  'project-discovery':       'governance',
  'spec-derivation':         'development',
};

// Trigger phrases for "觸發時機速查" table (when-to-use quick reference)
const WHEN_TO_USE: Array<{ scenario: string; skill: string; command: string }> = [
  { scenario: '建立新功能規格',           skill: 'spec-driven-dev',         command: '/sdd' },
  { scenario: '撰寫/推送 git commit',    skill: 'commit-standards',         command: '/commit' },
  { scenario: '安全推送到遠端',           skill: 'push',                    command: '/push' },
  { scenario: '測試驅動開發（TDD）',      skill: 'tdd-assistant',           command: '/tdd' },
  { scenario: '行為驅動開發（BDD）',      skill: 'bdd-assistant',           command: '/bdd' },
  { scenario: '驗收測試驅動（ATDD）',     skill: 'atdd-assistant',          command: '/atdd' },
  { scenario: '建立架構決策紀錄',         skill: 'adr-assistant',            command: '/adr' },
  { scenario: '程式碼審查',              skill: 'code-review-assistant',    command: '/review' },
  { scenario: '重構決策',               skill: 'refactoring-assistant',    command: '/refactor' },
  { scenario: '撰寫使用者故事/需求',      skill: 'requirement-assistant',   command: '/requirement' },
  { scenario: '設計 API',              skill: 'api-design-assistant',     command: '/api-design' },
  { scenario: '資料庫設計/遷移',         skill: 'database-assistant',      command: '/database' },
  { scenario: '規劃並執行多任務計畫',     skill: 'plan + orchestrate',      command: '/plan / /orchestrate' },
  { scenario: '掃描清理 debug 殘留',     skill: 'sweep',                   command: '/sweep' },
  { scenario: '追蹤 AC 與測試覆蓋',      skill: 'ac-coverage',             command: '/ac-coverage' },
  { scenario: 'Git 分支策略',           skill: 'git-workflow-guide',       command: '/git-workflow' },
  { scenario: '安全審查（OWASP）',       skill: 'security-assistant',      command: '/security' },
  { scenario: '部署腳本',              skill: 'deploy-assistant',          command: '/deploy' },
  { scenario: 'CI/CD 管線設計',         skill: 'ci-cd-assistant',          command: '/ci-cd' },
  { scenario: '查詢開發工作流程指引',     skill: 'dev-workflow-guide',      command: '/dev-workflow' },
  { scenario: '日誌實作標準',           skill: 'logging-guide',            command: '/logging' },
  { scenario: '錯誤碼設計',            skill: 'error-code-guide',         command: '/error-code' },
];

interface Skill {
  id: string;
  command: string;
  category: string;
  description: string;
  tier: 1 | 2 | 3;
}

function readSkillFrontmatter(skillId: string): { name: string; description: string } {
  const skillPath = path.join(ROOT, 'skills', skillId, 'SKILL.md');
  if (!fs.existsSync(skillPath)) return { name: skillId, description: '' };

  const content = fs.readFileSync(skillPath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { name: skillId, description: '' };

  const frontmatter = match[1];
  const lines = frontmatter.split('\n');

  let name = skillId;
  let description = '';
  let inDescBlock = false;
  let descLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inDescBlock) {
      // In a YAML block scalar: collect lines that start with spaces or are empty
      if (line.startsWith(' ') || line === '') {
        descLines.push(line.trim());
      } else {
        inDescBlock = false;
        // Fall through to check this line as a new key
      }
    }
    if (!inDescBlock) {
      if (line.startsWith('name:')) {
        name = line.replace(/^name:\s*/, '').trim();
      } else if (line.match(/^description:\s*\|/)) {
        inDescBlock = true;
        descLines = [];
      } else if (line.startsWith('description:')) {
        // Inline description
        let desc = line.replace(/^description:\s*/, '').trim();
        desc = desc.replace(/^"/, '').replace(/"$/, '');
        description = desc.replace(/^\[UDS\]\s*/, '');
      }
    }
  }

  if (descLines.length > 0) {
    // Take first non-empty line of the block
    const first = descLines.find(l => l.trim() !== '') ?? '';
    description = first.replace(/^\[UDS\]\s*/, '').replace(/\s*\|.*$/, '').trim();
  } else {
    description = description.replace(/\s*\|.*$/, '').trim();
  }

  return { name, description };
}

function loadSkills(): Skill[] {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'uds-manifest.json'), 'utf8'));
  const manifestMap = new Map<string, { command: string; category: string }>(
    manifest.skills.map((s: { id: string; command: string; category: string }) => [s.id, s])
  );

  const skills: Skill[] = [];
  const skillsDir = path.join(ROOT, 'skills');
  const entries = fs.readdirSync(skillsDir);

  for (const entry of entries) {
    const skillMdPath = path.join(skillsDir, entry, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;

    const { name, description } = readSkillFrontmatter(entry);
    const manifestData = manifestMap.get(entry);
    const rawCategory = manifestData?.category ?? 'uncategorized';
    const category = rawCategory === 'uncategorized'
      ? (CATEGORY_OVERRIDE[entry] ?? 'uncategorized')
      : rawCategory;

    // Command: prefer SKILL.md name (more accurate), manifest as fallback
    const command = `/${name}`;

    const tier: 1 | 2 | 3 = TIER1_SKILLS.has(entry) ? 1 : TIER3_SKILLS.has(entry) ? 3 : 2;

    skills.push({ id: entry, command, category, description, tier });
  }

  return skills.sort((a, b) => a.id.localeCompare(b.id));
}

function generateSkillsIndex(skills: Skill[]): string {
  const buildDate = new Date().toISOString().slice(0, 10);
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'uds-manifest.json'), 'utf8'));
  const version = manifest.version ?? 'unknown';

  const tier1 = skills.filter(s => s.tier === 1).sort((a, b) => a.id.localeCompare(b.id));
  const tier2 = skills.filter(s => s.tier === 2).sort((a, b) => a.id.localeCompare(b.id));
  const tier3 = skills.filter(s => s.tier === 3).sort((a, b) => a.id.localeCompare(b.id));

  // Group by category for "By Category" section
  const byCategory = new Map<string, Skill[]>();
  for (const s of [...skills].sort((a, b) => a.id.localeCompare(b.id))) {
    const cat = s.category === 'uncategorized' ? 'other' : s.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(s);
  }

  const skillRow = (s: Skill) =>
    `| \`${s.id}\` | \`${s.command}\` | ${s.description || '—'} |`;

  const tierTable = (list: Skill[]) =>
    ['| Skill | Command | Description |',
     '|-------|---------|-------------|',
     ...list.map(skillRow)].join('\n');

  const catTable = (list: Skill[]) =>
    ['| Skill | Command | Tier | Description |',
     '|-------|---------|------|-------------|',
     ...list.map(s => `| \`${s.id}\` | \`${s.command}\` | T${s.tier} | ${s.description || '—'} |`)].join('\n');

  const whenToUseRows = WHEN_TO_USE.map(w =>
    `| ${w.scenario} | \`${w.skill}\` | \`${w.command}\` |`
  ).join('\n');

  const categoryOrder = ['development', 'quality', 'testing', 'governance', 'documentation', 'automation', 'operations', 'security', 'other'];
  const categorySections = categoryOrder
    .filter(c => byCategory.has(c))
    .map(c => {
      const label = c.charAt(0).toUpperCase() + c.slice(1);
      return `### ${label}\n\n${catTable(byCategory.get(c)!)}`;
    })
    .join('\n\n');

  return `# UDS Skills Index

> **Auto-generated** — do not edit manually.
> Run \`npm run docs:generate-index\` to update.
> Last regenerated: ${buildDate} | UDS v${version} | ${skills.length} skills

Use skills by typing their command in Claude Code (e.g., \`/sdd\`, \`/tdd\`, \`/commit\`).
Skills not in Tier 1 are always callable via \`/<name>\` even if not listed in the context menu.

---

## By Tier (DEC-061)

Tiers control how much context budget is spent on skill descriptions in Claude Code.
See [skill-budget-tuning.md](../skill-budget-tuning.md) for customization.

### Tier 1 — Core (${tier1.length} skills · daily use · always listed)

${tierTable(tier1)}

### Tier 2 — Advanced (${tier2.length} skills · weekly use · listed by default)

${tierTable(tier2)}

### Tier 3 — Specialist (${tier3.length} skills · event-driven · name-only by default)

> Tier 3 skills save context budget by showing only the skill name in listings.
> They remain fully callable via \`/<name>\`.

${tierTable(tier3)}

---

## By Category

${categorySections}

---

## 觸發時機速查 (When to Use)

| 我想做... | Skill | Command |
|----------|-------|---------|
${whenToUseRows}

---

## Related

- [COMMANDS-INDEX.md](COMMANDS-INDEX.md) — all slash commands alphabetically
- [GETTING-STARTED.md](GETTING-STARTED.md) — first-time setup
- [FAQ.md](FAQ.md) — common questions
- [skill-budget-tuning.md](../skill-budget-tuning.md) — customize Tier 3 visibility
`;
}

function generateCommandsIndex(skills: Skill[]): string {
  const buildDate = new Date().toISOString().slice(0, 10);
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'uds-manifest.json'), 'utf8'));
  const version = manifest.version ?? 'unknown';

  // Deduplicate commands (some skills share a command)
  const commandMap = new Map<string, Skill[]>();
  for (const s of skills) {
    if (!commandMap.has(s.command)) commandMap.set(s.command, []);
    commandMap.get(s.command)!.push(s);
  }

  const sorted = [...commandMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  const rows = sorted.map(([cmd, skillList]) => {
    const skillIds = skillList.map(s => `\`${s.id}\``).join(', ');
    const desc = skillList[0].description || '—';
    const tiers = [...new Set(skillList.map(s => `T${s.tier}`))].join('/');
    return `| \`${cmd}\` | ${skillIds} | ${tiers} | ${desc} |`;
  }).join('\n');

  return `# UDS Commands Index

> **Auto-generated** — do not edit manually.
> Run \`npm run docs:generate-index\` to update.
> Last regenerated: ${buildDate} | UDS v${version} | ${sorted.length} unique commands

Type any command in Claude Code to activate the corresponding skill.
Commands not visible in the menu are still callable — Claude Code loads skills on demand.

---

## All Commands (alphabetical)

| Command | Skill | Tier | Description |
|---------|-------|------|-------------|
${rows}

---

## By Category

See [SKILLS-INDEX.md](SKILLS-INDEX.md#by-category) for skills grouped by category.

---

## Related

- [SKILLS-INDEX.md](SKILLS-INDEX.md) — skills by Tier and Category
- [GETTING-STARTED.md](GETTING-STARTED.md) — first-time setup
`;
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
const skills = loadSkills();

const userDocsDir = path.join(ROOT, 'docs', 'user');
if (!fs.existsSync(userDocsDir)) fs.mkdirSync(userDocsDir, { recursive: true });

const skillsIndexPath = path.join(userDocsDir, 'SKILLS-INDEX.md');
const commandsIndexPath = path.join(userDocsDir, 'COMMANDS-INDEX.md');

fs.writeFileSync(skillsIndexPath, generateSkillsIndex(skills), 'utf8');
fs.writeFileSync(commandsIndexPath, generateCommandsIndex(skills), 'utf8');

console.log(`✅ Generated docs/user/SKILLS-INDEX.md (${skills.length} skills)`);
console.log(`✅ Generated docs/user/COMMANDS-INDEX.md`);
