# SuperSpec 功能借鑒 — UDS Phase 4 Implementation Spec

**狀態**: Draft
**建立日期**: 2026-04-07
**跨專案參考**: XSPEC-006 Phase 4A/C/D（dev-platform/cross-project/specs/）

> **本文件為自足規格**，包含所有實作所需的完整變更描述。
> 不需要讀取 dev-platform 的文件即可進行開發。

---

## 摘要

為 UDS CLI 新增 4 項收尾功能：

| # | 功能 | 類型 |
|---|------|------|
| 4A | Archive Enhancement（index.json + search） | 修改現有 |
| 4C | `uds quickstart` 互動式導覽 | 新增指令 |
| 4D | `uds spec split` 輔助拆分 | 新增指令 |

---

## 4A. Archive Enhancement

### 要修改的檔案

#### 4A-1. `cli/src/vibe/micro-spec.js`

修改 `archive()` 方法（line 499-518），在 `renameSync` 之後新增 index.json 更新：

```javascript
archive(id) {
  const sourcePath = join(this.specsDir, `${id}.md`);
  if (!existsSync(sourcePath)) {
    return false;
  }

  this.ensureDirectories();
  const destPath = join(this.archiveDir, `${id}.md`);

  // Update status before archiving
  const spec = this.get(id);
  spec.status = SpecStatus.ARCHIVED;
  spec.updatedAt = new Date().toISOString();
  const markdown = this.toMarkdown(spec);
  writeFileSync(sourcePath, markdown, 'utf-8');

  // Move to archive
  renameSync(sourcePath, destPath);

  // ── 新增：更新 archive index ──
  this._updateArchiveIndex(spec);

  return true;
}

/**
 * Update archive index.json with archived spec metadata
 * @param {Object} spec - The archived spec object
 */
_updateArchiveIndex(spec) {
  const indexPath = join(this.archiveDir, 'index.json');
  let index = [];
  if (existsSync(indexPath)) {
    try {
      index = JSON.parse(readFileSync(indexPath, 'utf-8'));
    } catch {
      index = [];
    }
  }
  index.push({
    id: spec.id,
    title: spec.title,
    type: spec.type,
    archived_at: new Date().toISOString(),
    scope: spec.scope || 'general',
  });
  writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}
```

需要在檔案頂部新增 `readFileSync` import（如果尚未有的話）。目前已有 `writeFileSync`, `existsSync`, `renameSync` from `node:fs`。確認 `readFileSync` 也在 import 中。

#### 4A-2. `cli/src/commands/spec.js`

新增 `specSearchCommand` function：

```javascript
/**
 * Execute the spec search command
 * @param {string} query - Search query string
 * @param {Object} options - Command options
 */
export async function specSearchCommand(query, options = {}) {
  if (!query) {
    console.log(chalk.red('Error: Search query is required'));
    process.exit(1);
  }

  const microSpec = new MicroSpec({ cwd: process.cwd(), output: options.output });
  const results = [];
  const queryLower = query.toLowerCase();

  // Search in archive index
  const indexPath = join(microSpec.archiveDir, 'index.json');
  if (existsSync(indexPath)) {
    try {
      const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
      for (const entry of index) {
        if (
          entry.id.toLowerCase().includes(queryLower) ||
          entry.title.toLowerCase().includes(queryLower)
        ) {
          results.push({ ...entry, source: 'archive' });
        }
      }
    } catch { /* ignore parse errors */ }
  }

  // Also search active specs
  if (!options.archived) {
    const specs = microSpec.list();
    for (const spec of specs) {
      if (
        spec.id.toLowerCase().includes(queryLower) ||
        spec.title.toLowerCase().includes(queryLower) ||
        (spec.intent && spec.intent.toLowerCase().includes(queryLower))
      ) {
        results.push({ id: spec.id, title: spec.title, type: spec.type, source: 'active', status: spec.status });
      }
    }
  }

  if (results.length === 0) {
    console.log(chalk.yellow(`No specs found matching "${query}"`));
    return;
  }

  console.log(chalk.bold(`\nFound ${results.length} spec(s) matching "${query}":\n`));
  for (const r of results) {
    const badge = r.source === 'archive' ? chalk.gray('[archived]') : chalk.green(`[${r.status}]`);
    console.log(`  ${chalk.cyan(r.id)} ${badge} ${r.title}`);
  }
  console.log();
}
```

在 `uds.js` 中註冊（參考現有 spec 子指令）：

```javascript
spec
  .command('search <query>')
  .description('Search specs by title or content')
  .option('--archived', 'Search only archived specs')
  .option('-o, --output <dir>', 'Specs directory')
  .action(specSearchCommand);
```

需要在 spec.js 頂部新增 `readFileSync` 和 `existsSync` 的 import，以及 `join` from `node:path`。

---

## 4C. `uds quickstart` 導覽指令

### 新增檔案

#### 4C-1. `cli/src/commands/quickstart.js`

```javascript
/**
 * Quickstart Command - Interactive workflow guide
 *
 * Reduces cognitive load of 22 CLI + 47 Skills by guiding users
 * to the most common workflow paths.
 *
 * Inspired by SuperSpec's 15-command simplicity.
 *
 * @module commands/quickstart
 */

import chalk from 'chalk';
import { select } from '@inquirer/prompts';

const WORKFLOWS = [
  {
    name: 'Quick Spec → Implement (Micro-Spec)',
    description: 'Lightweight spec for simple features/fixes',
    steps: [
      { cmd: 'uds spec create "your feature"', desc: 'Create micro-spec from intent' },
      { cmd: 'uds spec confirm SPEC-XXX', desc: 'Confirm spec for implementation' },
      { cmd: '# Implement in your editor', desc: 'Write code following the spec' },
      { cmd: 'uds spec archive SPEC-XXX', desc: 'Archive completed spec' },
    ],
  },
  {
    name: 'Full SDD Spec Flow (Boost)',
    description: 'Complete spec-driven development for complex features',
    steps: [
      { cmd: 'uds spec create "your feature" --boost', desc: 'Create full SDD spec with design sections' },
      { cmd: 'uds lint', desc: 'Validate spec quality and cross-references' },
      { cmd: 'uds spec confirm SPEC-XXX', desc: 'Confirm after review' },
      { cmd: '# Implement with /derive → /tdd', desc: 'Use forward derivation and TDD' },
      { cmd: 'uds sync', desc: 'Export context for session resume' },
    ],
  },
  {
    name: 'Test-Driven Development (TDD)',
    description: 'Red-Green-Refactor cycle',
    steps: [
      { cmd: 'uds workflow execute tdd', desc: 'Start TDD workflow' },
      { cmd: '# Write failing test (RED)', desc: 'Define expected behavior' },
      { cmd: '# Make it pass (GREEN)', desc: 'Minimal implementation' },
      { cmd: '# Improve (REFACTOR)', desc: 'Clean up without breaking tests' },
    ],
  },
  {
    name: 'Check Project Health',
    description: 'Audit standards compliance and spec quality',
    steps: [
      { cmd: 'uds check', desc: 'Check standards file integrity' },
      { cmd: 'uds check --spec-size', desc: 'Check spec sizes against limits' },
      { cmd: 'uds lint', desc: 'Lint specs for AC coverage and dependency validity' },
      { cmd: 'uds audit', desc: 'Deep health diagnosis' },
    ],
  },
  {
    name: 'Resume Previous Work',
    description: 'Restore context from a previous session',
    steps: [
      { cmd: 'uds sync', desc: 'Generate context.md from git diff + workflow state' },
      { cmd: 'cat .workflow-state/context.md', desc: 'Read context in new session' },
      { cmd: 'uds workflow status', desc: 'Check workflow execution status' },
    ],
  },
];

/**
 * Execute the quickstart command
 */
export async function quickstartCommand() {
  console.log(chalk.bold('\n🚀 UDS Quickstart Guide\n'));
  console.log(chalk.gray('Select a workflow to see the recommended commands:\n'));

  const choices = WORKFLOWS.map((w, i) => ({
    name: `${w.name}`,
    value: i,
    description: w.description,
  }));

  const selected = await select({
    message: 'Which workflow do you want to follow?',
    choices,
  });

  const workflow = WORKFLOWS[selected];
  console.log(chalk.bold(`\n${workflow.name}\n`));
  console.log(chalk.gray(`${workflow.description}\n`));

  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    console.log(`  ${chalk.cyan(`${i + 1}.`)} ${chalk.yellow(step.cmd)}`);
    console.log(`     ${chalk.gray(step.desc)}\n`);
  }

  console.log(chalk.gray('Tip: Run each command in order. Use "uds quickstart" anytime to see this guide again.\n'));
}
```

在 `uds.js` 中註冊：

```javascript
import { quickstartCommand } from './commands/quickstart.js';

program
  .command('quickstart')
  .description('Interactive workflow guide — find the right commands quickly')
  .action(quickstartCommand);
```

---

## 4D. `uds spec split` 輔助拆分

### 新增檔案

#### 4D-1. `cli/src/commands/spec-split.js`

```javascript
/**
 * Spec Split Command - Assisted spec splitting with dependency tracking
 *
 * Helps split large specs into smaller ones while maintaining
 * depends_on references between them.
 *
 * @module commands/spec-split
 */

import chalk from 'chalk';
import { checkbox, confirm as inquirerConfirm } from '@inquirer/prompts';
import { MicroSpec } from '../vibe/micro-spec.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * Extract acceptance criteria from spec markdown
 * @param {string} content - Spec markdown content
 * @returns {Array<{id: string, text: string, line: number}>}
 */
function extractACs(content) {
  const lines = content.split('\n');
  const acs = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^-\s*\[[ x]\]\s*(AC-\d+:?\s*.+)/i);
    if (match) {
      acs.push({ id: match[1].split(':')[0].trim(), text: match[1], line: i });
    }
  }
  return acs;
}

/**
 * Execute the spec split command
 * @param {string} id - Spec ID to split
 * @param {Object} options - Command options
 */
export async function specSplitCommand(id, options = {}) {
  const microSpec = new MicroSpec({ cwd: process.cwd(), output: options.output });
  const spec = microSpec.get(id);

  if (!spec) {
    console.log(chalk.red(`Error: Spec ${id} not found`));
    process.exit(1);
  }

  // Read raw markdown
  const specPath = join(microSpec.specsDir, `${id}.md`);
  const content = readFileSync(specPath, 'utf-8');
  const acs = extractACs(content);

  if (acs.length < 2) {
    console.log(chalk.yellow(`Spec ${id} has ${acs.length} AC(s) — too few to split.`));
    return;
  }

  console.log(chalk.bold(`\nSplitting ${id} (${acs.length} ACs found):\n`));
  for (const ac of acs) {
    console.log(`  ${chalk.cyan(ac.id)}: ${ac.text.substring(ac.id.length + 1).trim()}`);
  }
  console.log();

  // Interactive selection: which ACs to move to new spec
  const toMove = await checkbox({
    message: 'Select ACs to move to a NEW spec (remaining stay in original):',
    choices: acs.map(ac => ({
      name: `${ac.id}: ${ac.text.substring(ac.id.length + 1).trim().substring(0, 60)}`,
      value: ac.id,
    })),
  });

  if (toMove.length === 0 || toMove.length === acs.length) {
    console.log(chalk.yellow('Must select some (but not all) ACs to move. Aborting.'));
    return;
  }

  const proceed = await inquirerConfirm({
    message: `Split ${id}: keep ${acs.length - toMove.length} ACs, move ${toMove.length} ACs to new spec?`,
    default: true,
  });

  if (!proceed) {
    console.log(chalk.gray('Split cancelled.'));
    return;
  }

  // Backup original
  const backupDir = join(microSpec.specsDir, '.backup');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  copyFileSync(specPath, join(backupDir, `${id}-pre-split.md`));

  // Generate new spec ID
  const newId = microSpec.generateId(spec.title + ' (part 2)');

  // Split content: remove moved ACs from original, create new spec with them
  const movedSet = new Set(toMove);
  const lines = content.split('\n');
  const originalLines = [];
  const movedACLines = [];

  for (let i = 0; i < lines.length; i++) {
    const acMatch = acs.find(ac => ac.line === i);
    if (acMatch && movedSet.has(acMatch.id)) {
      movedACLines.push(lines[i]);
    } else {
      originalLines.push(lines[i]);
    }
  }

  // Update original spec: add depends_on to new spec
  const originalContent = originalLines.join('\n');
  const updatedOriginal = addDependsOn(originalContent, newId);
  writeFileSync(specPath, updatedOriginal, 'utf-8');

  // Create new spec with moved ACs
  const newSpec = {
    ...spec,
    id: newId,
    title: `${spec.title} (split)`,
    dependsOn: [id],
    status: spec.status,
    createdAt: new Date().toISOString(),
  };
  const newContent = microSpec.toMarkdown(newSpec);
  // Replace the AC section with moved ACs
  const newSpecPath = join(microSpec.specsDir, `${newId}.md`);
  const acSection = movedACLines.join('\n');
  const finalContent = newContent.replace(
    /\*\*Acceptance\*\*:[\s\S]*?(?=\n\*\*|$)/,
    `**Acceptance**:\n${acSection}`
  );
  writeFileSync(newSpecPath, finalContent, 'utf-8');

  console.log(chalk.green(`\n✅ Split complete:`));
  console.log(`  ${chalk.cyan(id)} — ${acs.length - toMove.length} ACs (updated)`);
  console.log(`  ${chalk.cyan(newId)} — ${toMove.length} ACs (new)`);
  console.log(`  ${chalk.gray(`Backup: ${join(backupDir, `${id}-pre-split.md`)}`)}`);
  console.log(`  ${chalk.gray(`Both specs have mutual depends_on references.`)}\n`);
}

/**
 * Add depends_on reference to spec content
 */
function addDependsOn(content, targetId) {
  // If depends_on line exists, append; otherwise add after Type line
  if (content.includes('**Depends On**:')) {
    return content.replace(
      /\*\*Depends On\*\*:\s*(.*)/,
      (match, existing) => {
        const current = existing.trim();
        if (current === 'none' || current === '') return `**Depends On**: ${targetId}`;
        return `**Depends On**: ${current}, ${targetId}`;
      }
    );
  }
  // Insert after **Type** line
  return content.replace(
    /(\*\*Type\*\*:.*\n)/,
    `$1**Depends On**: ${targetId}\n`
  );
}
```

在 `uds.js` 中註冊：

```javascript
import { specSplitCommand } from './commands/spec-split.js';

spec
  .command('split <id>')
  .description('Split a large spec into two with mutual depends_on references')
  .option('-o, --output <dir>', 'Specs directory')
  .action(specSplitCommand);
```

---

## Acceptance Criteria

- [ ] AC-1: `uds spec archive SPEC-XXX` 後，`specs/archive/index.json` 包含該 spec 的 metadata
- [ ] AC-2: `uds spec search "query"` 搜尋 active + archived specs，輸出匹配結果
- [ ] AC-3: `uds spec search "query" --archived` 只搜尋 archived specs
- [ ] AC-4: `uds quickstart` 顯示互動式選單，選擇後列出工作流步驟
- [ ] AC-5: `uds spec split SPEC-XXX` 互動式選擇 ACs 後，產生兩個 spec + mutual depends_on
- [ ] AC-6: Split 時備份原始 spec 到 `specs/.backup/`
- [ ] AC-7: 所有現有測試仍通過

---

## 測試計畫

### Unit Tests

| 測試目標 | 測試檔案 | 方式 |
|---------|---------|------|
| `_updateArchiveIndex()` | `cli/src/vibe/__tests__/micro-spec.test.js` | Mock archive dir，驗證 index.json 寫入 |
| `specSearchCommand()` | `cli/src/commands/__tests__/spec.test.js` | Mock index.json + specs list |
| `extractACs()` | `cli/src/commands/__tests__/spec-split.test.js` | 各種 AC 格式的 markdown |
| `specSplitCommand()` | `cli/src/commands/__tests__/spec-split.test.js` | Mock spec + 驗證拆分結果 |

### Integration Test

```bash
# Archive + search
uds spec create "test feature" --yes
uds spec archive SPEC-XXX
cat specs/archive/index.json          # 驗證 index 寫入
uds spec search "test"                # 驗證搜尋結果

# Quickstart
uds quickstart                        # 互動式驗證

# Split（需有含 2+ ACs 的 spec）
uds spec create "complex feature" --boost --yes
uds spec split SPEC-XXX               # 互動式拆分
ls specs/                             # 驗證兩個 spec 存在
cat specs/.backup/                    # 驗證備份
```

---

## 實作順序建議

```
4A Archive Enhancement
  → _updateArchiveIndex() in micro-spec.js
  → specSearchCommand() in spec.js
  → 註冊到 uds.js

4C Quickstart
  → quickstart.js 新增
  → 註冊到 uds.js

4D Spec Split
  → spec-split.js 新增
  → 註冊到 uds.js
```
