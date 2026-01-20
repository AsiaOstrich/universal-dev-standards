import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, basename } from 'path';
import { getLanguageRules } from '../prompts/integrations.js';
import { computeIntegrationBlockHash } from './hasher.js';

/**
 * Marker block constants for different file formats
 */
const MARKERS = {
  markdown: {
    start: '<!-- UDS:STANDARDS:START -->',
    end: '<!-- UDS:STANDARDS:END -->'
  },
  plaintext: {
    start: '# === UDS:STANDARDS:START ===',
    end: '# === UDS:STANDARDS:END ==='
  }
};

/**
 * Tool file mappings - maps tool names to their integration file paths
 */
const TOOL_FILES = {
  cursor: '.cursorrules',
  windsurf: '.windsurfrules',
  cline: '.clinerules',
  copilot: '.github/copilot-instructions.md',
  antigravity: 'INSTRUCTIONS.md',
  'claude-code': 'CLAUDE.md',
  codex: 'AGENTS.md',
  'gemini-cli': 'GEMINI.md',
  opencode: 'AGENTS.md'  // Shares file with codex
};

/**
 * Tool format mappings - determines if tool uses markdown or plaintext format
 */
const TOOL_FORMATS = {
  cursor: 'plaintext',
  windsurf: 'plaintext',
  cline: 'plaintext',
  copilot: 'markdown',
  antigravity: 'markdown',
  'claude-code': 'markdown',
  codex: 'markdown',
  'gemini-cli': 'markdown',
  opencode: 'markdown'
};

/**
 * Mapping from standard filename to task description
 */
const STANDARD_TASK_MAPPING = {
  'anti-hallucination.md': { task: 'AI collaboration', when: 'Always', priority: 'MUST' },
  'commit-message.ai.yaml': { task: 'Writing commits', when: 'Every commit', priority: 'MUST' },
  'checkin-standards.md': { task: 'Committing code', when: 'Every commit', priority: 'MUST' },
  'logging-standards.md': { task: 'Adding logging', when: 'When writing logs', priority: 'SHOULD' },
  'error-code-standards.md': { task: 'Error handling', when: 'When defining errors', priority: 'SHOULD' },
  'testing.ai.yaml': { task: 'Writing tests', when: 'When creating tests', priority: 'SHOULD' },
  'versioning.md': { task: 'Version bumping', when: 'When releasing', priority: 'SHOULD' },
  'changelog-standards.md': { task: 'Updating changelog', when: 'Before releases', priority: 'SHOULD' },
  'code-review-checklist.md': { task: 'Code review', when: 'During PR review', priority: 'SHOULD' },
  'spec-driven-development.md': { task: 'Feature development', when: 'When SDD tool present', priority: 'SHOULD' },
  'test-completeness-dimensions.md': { task: 'Test coverage', when: 'When evaluating tests', priority: 'SHOULD' },
  'git-workflow.ai.yaml': { task: 'Git workflow', when: 'Branch/merge decisions', priority: 'SHOULD' }
};

/**
 * Standard descriptions for index generation
 */
const STANDARD_DESCRIPTIONS = {
  'anti-hallucination.md': 'AI 協作防幻覺規範',
  'commit-message.ai.yaml': '提交訊息格式',
  'checkin-standards.md': '程式碼簽入檢查',
  'logging-standards.md': '日誌記錄標準',
  'error-code-standards.md': '錯誤碼標準',
  'testing.ai.yaml': '測試標準',
  'versioning.md': '語意化版本',
  'changelog-standards.md': '變更日誌標準',
  'code-review-checklist.md': '程式碼審查清單',
  'spec-driven-development.md': '規格驅動開發',
  'test-completeness-dimensions.md': '測試完整性維度',
  'git-workflow.ai.yaml': 'Git 工作流程',
  'zh-tw.md': '繁體中文本地化'
};

/**
 * Commit type templates for different commit_language options
 * These are used to generate dynamic commit standards based on user's language preference
 */
const COMMIT_TYPE_TEMPLATES = {
  english: {
    types: [
      { type: 'feat', description: 'New feature', example: 'feat(auth): add OAuth2 login' },
      { type: 'fix', description: 'Bug fix', example: 'fix(api): handle null response' },
      { type: 'docs', description: 'Documentation', example: 'docs(readme): update setup guide' },
      { type: 'style', description: 'Formatting', example: 'style(lint): fix indentation' },
      { type: 'refactor', description: 'Code restructure', example: 'refactor(user): extract validation' },
      { type: 'test', description: 'Tests', example: 'test(cart): add checkout tests' },
      { type: 'chore', description: 'Maintenance', example: 'chore(deps): update packages' },
      { type: 'perf', description: 'Performance', example: 'perf(query): optimize database' },
      { type: 'ci', description: 'CI/CD changes', example: 'ci(github): add deploy workflow' }
    ],
    format: '<type>(<scope>): <subject>',
    formatNote: 'English types for maximum tool compatibility'
  },
  'traditional-chinese': {
    types: [
      { type: '功能', english: 'feat', description: '新功能', example: '功能(認證): 新增 OAuth2 登入' },
      { type: '修正', english: 'fix', description: '錯誤修正', example: '修正(api): 處理空值回應' },
      { type: '文件', english: 'docs', description: '文件更新', example: '文件(readme): 更新安裝指南' },
      { type: '樣式', english: 'style', description: '格式調整', example: '樣式(lint): 修正縮排' },
      { type: '重構', english: 'refactor', description: '程式碼重構', example: '重構(user): 抽取驗證邏輯' },
      { type: '測試', english: 'test', description: '測試相關', example: '測試(cart): 新增結帳測試' },
      { type: '雜項', english: 'chore', description: '維護任務', example: '雜項(deps): 更新套件' },
      { type: '效能', english: 'perf', description: '效能改善', example: '效能(query): 優化資料庫查詢' },
      { type: '整合', english: 'ci', description: '持續整合', example: '整合(github): 新增部署流程' }
    ],
    format: '<類型>(<範圍>): <主旨>',
    formatNote: '類型使用中文，範圍可使用英文或中文'
  },
  bilingual: {
    types: [
      { type: 'feat', description_en: 'New feature', description_zh: '新功能', example: 'feat(auth): Add login form. 新增登入表單.' },
      { type: 'fix', description_en: 'Bug fix', description_zh: '錯誤修正', example: 'fix(api): Fix null pointer. 修正空指標.' },
      { type: 'docs', description_en: 'Documentation', description_zh: '文件更新', example: 'docs(readme): Update guide. 更新指南.' },
      { type: 'style', description_en: 'Formatting', description_zh: '格式調整', example: 'style(lint): Fix indent. 修正縮排.' },
      { type: 'refactor', description_en: 'Code restructure', description_zh: '程式碼重構', example: 'refactor(user): Extract logic. 抽取邏輯.' },
      { type: 'test', description_en: 'Tests', description_zh: '測試相關', example: 'test(cart): Add tests. 新增測試.' },
      { type: 'chore', description_en: 'Maintenance', description_zh: '維護任務', example: 'chore(deps): Update deps. 更新套件.' },
      { type: 'perf', description_en: 'Performance', description_zh: '效能改善', example: 'perf(query): Optimize DB. 優化資料庫.' },
      { type: 'ci', description_en: 'CI/CD changes', description_zh: '持續整合', example: 'ci(github): Add deploy. 新增部署.' }
    ],
    format: '<type>(<scope>): <English subject>. <Chinese subject>.',
    formatNote: 'English types for tool compatibility, bilingual subjects for clarity'
  }
};

/**
 * Generate commit types table based on commit_language
 * @param {string} commitLanguage - The commit language: 'english', 'traditional-chinese', or 'bilingual'
 * @param {string} format - Output format: 'markdown' or 'plaintext'
 * @returns {string} Formatted commit types section
 */
function generateCommitTypesTable(commitLanguage, format = 'markdown') {
  const template = COMMIT_TYPE_TEMPLATES[commitLanguage] || COMMIT_TYPE_TEMPLATES.english;
  const lines = [];

  if (format === 'markdown') {
    if (commitLanguage === 'traditional-chinese') {
      lines.push('| 類型 | 英文對照 | 說明 | 範例 |');
      lines.push('|------|----------|------|------|');
      for (const t of template.types) {
        lines.push(`| \`${t.type}\` | ${t.english} | ${t.description} | ${t.example} |`);
      }
    } else if (commitLanguage === 'bilingual') {
      lines.push('| Type | EN Description | 中文說明 | Example |');
      lines.push('|------|----------------|----------|---------|');
      for (const t of template.types) {
        lines.push(`| \`${t.type}\` | ${t.description_en} | ${t.description_zh} | ${t.example} |`);
      }
    } else {
      // English (default)
      lines.push('| Type | Description | Example |');
      lines.push('|------|-------------|---------|');
      for (const t of template.types) {
        lines.push(`| \`${t.type}\` | ${t.description} | ${t.example} |`);
      }
    }
  } else {
    // Plaintext format
    if (commitLanguage === 'traditional-chinese') {
      for (const t of template.types) {
        lines.push(`- ${t.type} (${t.english}): ${t.description}`);
      }
    } else if (commitLanguage === 'bilingual') {
      for (const t of template.types) {
        lines.push(`- ${t.type}: ${t.description_en} / ${t.description_zh}`);
      }
    } else {
      for (const t of template.types) {
        lines.push(`- ${t.type}: ${t.description}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate dynamic commit standards template based on commit_language
 * @param {string} commitLanguage - The commit language option: 'english', 'traditional-chinese', or 'bilingual'
 * @param {string} detailLevel - Detail level: 'minimal', 'standard', or 'comprehensive'
 * @returns {string} Generated commit standards content
 */
function generateCommitStandardsContent(commitLanguage, detailLevel = 'standard') {
  const template = COMMIT_TYPE_TEMPLATES[commitLanguage] || COMMIT_TYPE_TEMPLATES.english;

  if (detailLevel === 'minimal') {
    if (commitLanguage === 'traditional-chinese') {
      return `## 提交標準
- 格式: \`${template.format}\`
- ${template.formatNote}
- 主題保持在 72 字元內`;
    } else if (commitLanguage === 'bilingual') {
      return `## Commit Standards | 提交標準
- Format: \`${template.format}\`
- ${template.formatNote}
- Keep subject under 72 characters | 主題保持在 72 字元內`;
    } else {
      return `## Commit Standards
- Format: \`${template.format}\`
- ${template.formatNote}
- Keep subject under 72 characters`;
    }
  }

  if (detailLevel === 'standard') {
    const typesTable = generateCommitTypesTable(commitLanguage, 'markdown');

    if (commitLanguage === 'traditional-chinese') {
      return `## 提交訊息標準
參考: .standards/commit-message-guide.md, .standards/options/traditional-chinese.ai.yaml

### 格式
\`\`\`
${template.format}

<本文>

<頁腳>
\`\`\`

### 類型
${typesTable}

### 規則
- 主題行: 最多 72 字元
- 使用祈使語氣
- 本文: 說明做了什麼及為什麼，而非如何做`;
    } else if (commitLanguage === 'bilingual') {
      return `## Commit Message Standards | 提交訊息標準
Reference: .standards/commit-message-guide.md, .standards/options/bilingual.ai.yaml

### Format | 格式
\`\`\`
${template.format}

<English body>

<Chinese body>

<footer>
\`\`\`

### Types | 類型
${typesTable}

### Rules | 規則
- Subject line: max 72 characters | 主題行: 最多 72 字元
- Use imperative mood | 使用祈使語氣
- Body: explain WHAT and WHY | 本文: 說明做了什麼及為什麼`;
    } else {
      return `## Commit Message Standards
Reference: .standards/commit-message-guide.md

### Format
\`\`\`
${template.format}

<body>

<footer>
\`\`\`

### Types
${typesTable}

### Rules
- Subject line: max 72 characters
- Use imperative mood: "add" not "added"
- Body: explain WHAT and WHY, not HOW`;
    }
  }

  // Comprehensive level
  const typesTable = generateCommitTypesTable(commitLanguage, 'markdown');

  if (commitLanguage === 'traditional-chinese') {
    return `## 提交訊息標準
參考: .standards/commit-message-guide.md, .standards/options/traditional-chinese.ai.yaml

### 格式結構
\`\`\`
${template.format}

<本文>

<頁腳>
\`\`\`

**注意**: ${template.formatNote}

### 提交類型
${typesTable}

### 主題行規則
- 最多 72 字元
- 使用祈使語氣
- 結尾不加句點
- 首字母大寫

### 本文指引
- 每行 72 字元換行
- 說明做了什麼及為什麼，而非如何做
- 與主題以空行分隔

### 頁腳格式
- 破壞性變更: \`破壞性變更: 說明\`
- Issue 引用: \`關閉 #123\`, \`修正 #456\`
- 共同作者: \`Co-authored-by: Name <email>\``;
  } else if (commitLanguage === 'bilingual') {
    return `## Commit Message Standards | 提交訊息標準
Reference: .standards/commit-message-guide.md, .standards/options/bilingual.ai.yaml

### Format Structure | 格式結構
\`\`\`
${template.format}

<English body>

<Chinese body / 中文本文>

<footer>
\`\`\`

**Note**: ${template.formatNote}

### Commit Types | 提交類型
${typesTable}

### Subject Line Rules | 主題行規則
- Maximum 72 characters | 最多 72 字元
- Use imperative mood | 使用祈使語氣
- No period at the end | 結尾不加句點
- Include both EN and ZH subjects | 包含英文和中文主旨

### Body Guidelines | 本文指引
- Wrap at 72 characters | 每行 72 字元換行
- Explain WHAT and WHY | 說明做了什麼及為什麼
- Write English first, then Chinese | 先英文後中文

### Footer Format | 頁腳格式
- Breaking changes: \`BREAKING CHANGE: description\`
- Issue references: \`Fixes #123\`, \`Closes #456\`
- Co-authors: \`Co-authored-by: Name <email>\``;
  } else {
    return `## Commit Message Standards
Reference: .standards/commit-message-guide.md

### Format Structure
\`\`\`
${template.format}

<body>

<footer>
\`\`\`

### Commit Types
${typesTable}

### Subject Line Rules
- Maximum 72 characters
- Use imperative mood: "add" not "added"
- No period at the end
- Capitalize first letter

### Body Guidelines
- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Separate from subject with blank line

### Footer Format
- Breaking changes: \`BREAKING CHANGE: description\`
- Issue references: \`Fixes #123\`, \`Closes #456\`
- Co-authors: \`Co-authored-by: Name <email>\``;
  }
}

/**
 * Rule templates for different categories
 */
const RULE_TEMPLATES = {
  'spec-driven-development': {
    minimal: {
      en: `## Spec-Driven Development (SDD) Priority
- When SDD tools (OpenSpec, Spec Kit) are installed, use their slash commands first
- Commands like \`/openspec\` or \`/spec\` take priority over manual file editing`,
      'zh-tw': `## 規格驅動開發 (SDD) 優先
- 當 SDD 工具（OpenSpec、Spec Kit）已安裝時，優先使用其斜線命令
- \`/openspec\` 或 \`/spec\` 等命令優先於手動編輯檔案`
    },
    standard: {
      en: `## Spec-Driven Development (SDD) Priority
Reference: .standards/spec-driven-development.md

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like \`/openspec\` or \`/spec\`), you MUST prioritize using these commands over manual file editing.

**Detection**:
- OpenSpec: Check for \`openspec/\` directory or \`openspec.json\`
- Spec Kit: Check for \`specs/\` directory or \`.speckit\` configuration

**Rationale**:
- **Consistency**: Tools ensure spec structure follows strict schemas
- **Traceability**: Commands handle logging, IDs, and linking automatically
- **Safety**: Tools have built-in validation preventing invalid states`,
      'zh-tw': `## 規格驅動開發 (SDD) 優先
參考: .standards/spec-driven-development.md

**規則**：當專案整合了 SDD 工具（如 OpenSpec、Spec Kit 等）並提供特定命令（如 \`/openspec\` 或 \`/spec\` 斜線命令）時，你必須優先使用這些命令，而非手動編輯檔案。

**偵測方式**:
- OpenSpec: 檢查 \`openspec/\` 目錄或 \`openspec.json\`
- Spec Kit: 檢查 \`specs/\` 目錄或 \`.speckit\` 設定

**原因**:
- **一致性**: 工具確保規格結構遵循嚴格的 schema
- **可追蹤性**: 命令自動處理日誌、ID 和連結
- **安全性**: 工具有內建驗證防止無效狀態`
    },
    comprehensive: {
      en: `## Spec-Driven Development (SDD) Priority
Reference: .standards/spec-driven-development.md

### Core Principle
When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like \`/openspec\` or \`/spec\`), you MUST prioritize using these commands over manual file editing.

### SDD Tool Detection
Before making changes that require specifications, check if SDD tools are present:

| Tool | Detection Method | Primary Command |
|------|------------------|-----------------|
| OpenSpec | \`openspec/\` directory or \`openspec.json\` | \`/openspec proposal\` |
| Spec Kit | \`specs/\` directory or \`.speckit\` config | \`/spec create\` |

### Why Prioritize SDD Commands
1. **Consistency**: Tools ensure spec structure follows strict schemas
2. **Traceability**: Commands handle logging, IDs, and linking automatically
3. **Safety**: Tools have built-in validation preventing invalid states
4. **Workflow Integration**: Commands integrate with approval and review workflows

### SDD Workflow
\`\`\`
Proposal → Review → Implementation → Verification → Archive
\`\`\`

### Command Priority Examples
- ✅ Use \`/openspec proposal "Add Login"\` instead of manually creating \`changes/add-login/proposal.md\`
- ✅ Use \`/spec create "New Feature"\` instead of manually creating \`specs/SPEC-XXX.md\`

### Exceptions
SDD commands may be skipped for:
- Critical hotfixes (restore service immediately, document later)
- Trivial changes (typos, comments, formatting)
- Bug fixes (restore intended behavior)`,
      'zh-tw': `## 規格驅動開發 (SDD) 優先
參考: .standards/spec-driven-development.md

### 核心原則
當專案整合了 SDD 工具（如 OpenSpec、Spec Kit 等）並提供特定命令（如 \`/openspec\` 或 \`/spec\` 斜線命令）時，你必須優先使用這些命令，而非手動編輯檔案。

### SDD 工具偵測
在進行需要規格的變更前，檢查是否有 SDD 工具:

| 工具 | 偵測方式 | 主要命令 |
|------|----------|----------|
| OpenSpec | \`openspec/\` 目錄或 \`openspec.json\` | \`/openspec proposal\` |
| Spec Kit | \`specs/\` 目錄或 \`.speckit\` 設定 | \`/spec create\` |

### 為何優先使用 SDD 命令
1. **一致性**: 工具確保規格結構遵循嚴格的 schema
2. **可追蹤性**: 命令自動處理日誌、ID 和連結
3. **安全性**: 工具有內建驗證防止無效狀態
4. **工作流程整合**: 命令與審核和審查流程整合

### SDD 工作流程
\`\`\`
提案 → 審查 → 實作 → 驗證 → 歸檔
\`\`\`

### 命令優先範例
- ✅ 使用 \`/openspec proposal "新增登入"\` 而非手動建立 \`changes/add-login/proposal.md\`
- ✅ 使用 \`/spec create "新功能"\` 而非手動建立 \`specs/SPEC-XXX.md\`

### 例外情況
以下情況可跳過 SDD 命令:
- 緊急修復（立即恢復服務，稍後記錄）
- 微小變更（錯字、註解、格式）
- 錯誤修復（恢復預期行為）`
    }
  },

  'anti-hallucination': {
    minimal: {
      en: `## Anti-Hallucination Protocol
- Read files before analyzing them
- Cite sources: [Source: Code] path/file:line
- Use certainty tags: [Confirmed], [Inferred], [Assumption], [Unknown]
- Always provide a recommended option when presenting choices`,
      'zh-tw': `## 反幻覺協議
- 分析前必須先讀取檔案
- 引用來源: [Source: Code] path/file:line
- 使用確定性標籤: [確認], [推斷], [假設], [未知]
- 提供選項時務必標明建議選項`
    },
    standard: {
      en: `## Anti-Hallucination Protocol
Reference: .standards/anti-hallucination.md

### Evidence-Based Analysis
1. **File Reading**: You must read files before analyzing them.
2. **No Guessing**: Do not guess APIs, class names, or library versions.
3. **Explicit Uncertainty**: If you haven't seen the code, state "I need to read [file] to confirm".

### Source Attribution
- Every factual claim about the code must cite sources.
- Format: \`[Source: Code] path/to/file:line\`
- External docs: \`[Source: External] http://url (Accessed: Date)\`

### Certainty Classification
Use tags to indicate confidence:
- \`[Confirmed]\` - Verified from code/docs
- \`[Inferred]\` - Logical deduction from evidence
- \`[Assumption]\` - Reasonable guess, needs verification
- \`[Unknown]\` - Cannot determine

### Recommendations
When presenting options, YOU MUST explicitly state a "Recommended" choice with reasoning.`,
      'zh-tw': `## 反幻覺協議
參考: .standards/anti-hallucination.md

### 實證分析
1. **讀取檔案**: 分析前必須先讀取檔案
2. **禁止猜測**: 不得猜測 API、類別名稱或函式庫版本
3. **明確不確定性**: 若未看過程式碼，需說明「我需要讀取 [檔案] 來確認」

### 來源標註
- 關於程式碼的每項事實陳述必須引用來源
- 格式: \`[Source: Code] path/to/file:line\`
- 外部文件: \`[Source: External] http://url (存取日期: Date)\`

### 確定性分類
使用標籤表示信心程度:
- \`[確認]\` - 已從程式碼/文件驗證
- \`[推斷]\` - 從證據邏輯推導
- \`[假設]\` - 合理猜測，需驗證
- \`[未知]\` - 無法確定

### 建議
提供選項時，必須明確標明「建議」選項並說明理由。`
    },
    comprehensive: {
      en: `## Anti-Hallucination Protocol
Reference: .standards/anti-hallucination.md

### Core Principle
You are an AI assistant that prioritizes accuracy over confidence. Never fabricate information.

### Evidence-Based Analysis
1. **File Reading Requirement**
   - You MUST read files before analyzing them
   - Do not guess APIs, class names, or library versions
   - If you haven't seen the code, state "I need to read [file] to confirm"
   - When referencing files, use exact paths from the project

2. **Source Attribution Requirements**
   - Every factual claim about the code must cite sources
   - Code references: \`[Source: Code] path/to/file:line\`
   - External documentation: \`[Source: External] http://url (Accessed: Date)\`
   - Multiple sources: List all relevant sources

3. **Certainty Classification System**
   Use these tags to indicate confidence level:

   | Tag | Meaning | When to Use |
   |-----|---------|-------------|
   | \`[Confirmed]\` | Verified from code/docs | Direct evidence exists |
   | \`[Inferred]\` | Logical deduction | Evidence supports conclusion |
   | \`[Assumption]\` | Reasonable guess | Needs verification |
   | \`[Unknown]\` | Cannot determine | Insufficient information |

4. **Recommendation Protocol**
   When presenting options:
   - ALWAYS identify a "Recommended" choice
   - Explain the reasoning for the recommendation
   - List trade-offs of alternatives
   - Consider project context and constraints

### Error Correction
If you realize you made an incorrect statement:
1. Immediately acknowledge the error
2. Provide the corrected information with sources
3. Explain what led to the initial mistake`,
      'zh-tw': `## 反幻覺協議
參考: .standards/anti-hallucination.md

### 核心原則
您是一個優先重視準確性而非自信的 AI 助手。絕不捏造資訊。

### 實證分析
1. **讀取檔案要求**
   - 分析前必須先讀取檔案
   - 不得猜測 API、類別名稱或函式庫版本
   - 若未看過程式碼，需說明「我需要讀取 [檔案] 來確認」
   - 引用檔案時使用專案中的確切路徑

2. **來源標註要求**
   - 關於程式碼的每項事實陳述必須引用來源
   - 程式碼引用: \`[Source: Code] path/to/file:line\`
   - 外部文件: \`[Source: External] http://url (存取日期: Date)\`
   - 多個來源: 列出所有相關來源

3. **確定性分類系統**
   使用這些標籤表示信心程度:

   | 標籤 | 意義 | 使用時機 |
   |------|------|----------|
   | \`[確認]\` | 已從程式碼/文件驗證 | 有直接證據 |
   | \`[推斷]\` | 邏輯推導 | 證據支持結論 |
   | \`[假設]\` | 合理猜測 | 需要驗證 |
   | \`[未知]\` | 無法確定 | 資訊不足 |

4. **建議協議**
   提供選項時:
   - 務必標明「建議」選項
   - 解釋建議的理由
   - 列出替代方案的利弊
   - 考慮專案背景和限制

### 錯誤更正
如果發現自己做出錯誤陳述:
1. 立即承認錯誤
2. 提供附帶來源的更正資訊
3. 解釋導致初始錯誤的原因`
    }
  },

  'commit-standards': {
    minimal: {
      en: `## Commit Standards
- Format: \`<type>(<scope>): <subject>\`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep subject under 72 characters`,
      'zh-tw': `## 提交標準
- 格式: \`<type>(<scope>): <subject>\`
- 類型: feat, fix, docs, style, refactor, test, chore
- 主題保持在 72 字元內`
    },
    standard: {
      en: `## Commit Message Standards
Reference: .standards/commit-message-guide.md

### Format
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Types
- \`feat\`: New feature
- \`fix\`: Bug fix
- \`docs\`: Documentation only
- \`style\`: Formatting (no code change)
- \`refactor\`: Code restructuring
- \`test\`: Adding/updating tests
- \`chore\`: Maintenance tasks

### Rules
- Subject line: max 72 characters
- Use imperative mood: "add" not "added"
- Body: explain what and why, not how`,
      'zh-tw': `## 提交訊息標準
參考: .standards/commit-message-guide.md

### 格式
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### 類型
- \`feat\`: 新功能
- \`fix\`: 錯誤修復
- \`docs\`: 僅文件更新
- \`style\`: 格式調整（無程式碼變更）
- \`refactor\`: 程式碼重構
- \`test\`: 新增/更新測試
- \`chore\`: 維護任務

### 規則
- 主題行: 最多 72 字元
- 使用祈使語氣: 「add」而非「added」
- 本文: 說明做了什麼及為什麼，而非如何做`
    },
    comprehensive: {
      en: `## Commit Message Standards
Reference: .standards/commit-message-guide.md

### Format Structure
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Commit Types
| Type | Description | Example |
|------|-------------|---------|
| \`feat\` | New feature | feat(auth): add OAuth2 login |
| \`fix\` | Bug fix | fix(api): handle null response |
| \`docs\` | Documentation | docs(readme): update setup guide |
| \`style\` | Formatting | style(lint): fix indentation |
| \`refactor\` | Code restructure | refactor(user): extract validation |
| \`test\` | Tests | test(cart): add checkout tests |
| \`chore\` | Maintenance | chore(deps): update packages |
| \`perf\` | Performance | perf(query): optimize database |
| \`ci\` | CI/CD changes | ci(github): add deploy workflow |

### Subject Line Rules
- Maximum 72 characters
- Use imperative mood: "add" not "added"
- No period at the end
- Capitalize first letter

### Body Guidelines
- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Separate from subject with blank line

### Footer Format
- Breaking changes: \`BREAKING CHANGE: description\`
- Issue references: \`Fixes #123\`, \`Closes #456\`
- Co-authors: \`Co-authored-by: Name <email>\``,
      'zh-tw': `## 提交訊息標準
參考: .standards/commit-message-guide.md

### 格式結構
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### 提交類型
| 類型 | 說明 | 範例 |
|------|------|------|
| \`feat\` | 新功能 | feat(auth): 新增 OAuth2 登入 |
| \`fix\` | 錯誤修復 | fix(api): 處理空值回應 |
| \`docs\` | 文件更新 | docs(readme): 更新安裝指南 |
| \`style\` | 格式調整 | style(lint): 修正縮排 |
| \`refactor\` | 程式碼重構 | refactor(user): 抽取驗證邏輯 |
| \`test\` | 測試相關 | test(cart): 新增結帳測試 |
| \`chore\` | 維護任務 | chore(deps): 更新套件 |
| \`perf\` | 效能改善 | perf(query): 優化資料庫查詢 |
| \`ci\` | CI/CD 變更 | ci(github): 新增部署流程 |

### 主題行規則
- 最多 72 字元
- 使用祈使語氣: 「add」而非「added」
- 結尾不加句點
- 首字母大寫

### 本文指引
- 每行 72 字元換行
- 說明做了什麼及為什麼，而非如何做
- 與主題以空行分隔

### 頁腳格式
- 破壞性變更: \`BREAKING CHANGE: 說明\`
- Issue 引用: \`Fixes #123\`, \`Closes #456\`
- 共同作者: \`Co-authored-by: Name <email>\``
    }
  },

  'code-review': {
    minimal: {
      en: `## Code Review Checklist
Before committing, verify:
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No hardcoded secrets
- [ ] Changes are focused and complete`,
      'zh-tw': `## 程式碼審查清單
提交前確認:
- [ ] 程式碼編譯無錯誤
- [ ] 所有測試通過
- [ ] 無寫死的密鑰
- [ ] 變更專注且完整`
    },
    standard: {
      en: `## Code Review Checklist
Reference: .standards/checkin-standards.md

### Before Every Commit
1. **Build Verification**
   - [ ] Code compiles successfully
   - [ ] All dependencies satisfied

2. **Test Verification**
   - [ ] All existing tests pass
   - [ ] New code has tests
   - [ ] Test coverage not decreased

3. **Code Quality**
   - [ ] Follows coding standards
   - [ ] No hardcoded secrets
   - [ ] No security vulnerabilities

4. **Documentation**
   - [ ] API docs updated (if applicable)
   - [ ] CHANGELOG updated for user-facing changes

### Never Commit When
- Build has errors
- Tests are failing
- Contains debugging code (console.log, etc.)`,
      'zh-tw': `## 程式碼審查清單
參考: .standards/checkin-standards.md

### 每次提交前
1. **建置驗證**
   - [ ] 程式碼編譯成功
   - [ ] 所有相依套件已滿足

2. **測試驗證**
   - [ ] 所有現有測試通過
   - [ ] 新程式碼有對應測試
   - [ ] 測試覆蓋率未下降

3. **程式碼品質**
   - [ ] 遵循編碼標準
   - [ ] 無寫死的密鑰
   - [ ] 無安全漏洞

4. **文件**
   - [ ] API 文件已更新（如適用）
   - [ ] 使用者可見變更已更新 CHANGELOG

### 禁止提交情況
- 建置有錯誤
- 測試失敗
- 包含除錯程式碼（console.log 等）`
    },
    comprehensive: {
      en: `## Code Review Checklist
Reference: .standards/checkin-standards.md

### Core Philosophy
Every commit should:
- ✅ Be a complete logical unit of work
- ✅ Leave the codebase in a working state
- ✅ Be reversible without breaking functionality
- ✅ Contain its own tests (for new features)

### Mandatory Verification Checklist

#### 1. Build Verification
- [ ] Code compiles successfully (zero errors)
- [ ] All dependencies satisfied
- [ ] No new compiler warnings introduced

#### 2. Test Verification
- [ ] All existing tests pass (100% pass rate)
- [ ] New code has corresponding tests
- [ ] Test coverage not decreased
- [ ] Edge cases considered

#### 3. Code Quality
- [ ] Follows project coding standards
- [ ] No hardcoded secrets (passwords, API keys)
- [ ] No security vulnerabilities (OWASP Top 10)
- [ ] Proper error handling
- [ ] No duplicate code

#### 4. Documentation
- [ ] API documentation updated (if applicable)
- [ ] CHANGELOG updated for user-facing changes
- [ ] Comments for complex logic
- [ ] README updated if needed

#### 5. Workflow Compliance
- [ ] Branch naming correct
- [ ] Commit message follows format
- [ ] Synchronized with target branch

### ❌ Never Commit When
- Build has errors
- Tests are failing
- Feature is incomplete and would break functionality
- Contains WIP/TODO comments for critical logic
- Contains debugging code
- Contains commented-out code blocks

### Quick Verification Commands
\`\`\`bash
npm run lint       # Check code style
npm test           # Run all tests
npm run build      # Verify build
\`\`\``,
      'zh-tw': `## 程式碼審查清單
參考: .standards/checkin-standards.md

### 核心理念
每次提交應該:
- ✅ 是完整的邏輯工作單元
- ✅ 讓程式碼庫保持可運作狀態
- ✅ 可回滾而不破壞功能
- ✅ 包含自己的測試（針對新功能）

### 強制驗證清單

#### 1. 建置驗證
- [ ] 程式碼編譯成功（零錯誤）
- [ ] 所有相依套件已滿足
- [ ] 無新增編譯器警告

#### 2. 測試驗證
- [ ] 所有現有測試通過（100% 通過率）
- [ ] 新程式碼有對應測試
- [ ] 測試覆蓋率未下降
- [ ] 已考慮邊界情況

#### 3. 程式碼品質
- [ ] 遵循專案編碼標準
- [ ] 無寫死的密鑰（密碼、API 金鑰）
- [ ] 無安全漏洞（OWASP Top 10）
- [ ] 適當的錯誤處理
- [ ] 無重複程式碼

#### 4. 文件
- [ ] API 文件已更新（如適用）
- [ ] 使用者可見變更已更新 CHANGELOG
- [ ] 複雜邏輯有註解
- [ ] 如需要已更新 README

#### 5. 工作流程合規
- [ ] 分支命名正確
- [ ] 提交訊息遵循格式
- [ ] 已與目標分支同步

### ❌ 禁止提交情況
- 建置有錯誤
- 測試失敗
- 功能不完整且會破壞功能
- 關鍵邏輯包含 WIP/TODO 註解
- 包含除錯程式碼
- 包含被註解的程式碼區塊

### 快速驗證指令
\`\`\`bash
npm run lint       # 檢查程式碼風格
npm test           # 執行所有測試
npm run build      # 驗證建置
\`\`\``
    }
  },

  'testing': {
    minimal: {
      en: `## Testing Standards
- Unit tests: 70% coverage
- Integration tests: 20%
- E2E tests: 10%
- Run tests before committing`,
      'zh-tw': `## 測試標準
- 單元測試: 70% 覆蓋率
- 整合測試: 20%
- E2E 測試: 10%
- 提交前執行測試`
    },
    standard: {
      en: `## Testing Standards
Reference: .standards/testing-standards.md

### Test Pyramid Distribution
- Unit Tests: 70% (base)
- Integration Tests: 20%
- E2E/System Tests: 10% (top)

### Test Requirements
1. All new features must have tests
2. Bug fixes should include regression tests
3. Critical paths require E2E coverage

### Naming Convention
\`\`\`
test_[method]_[scenario]_[expected]
\`\`\`

### Before Committing
- All tests must pass
- Coverage should not decrease`,
      'zh-tw': `## 測試標準
參考: .standards/testing-standards.md

### 測試金字塔分佈
- 單元測試: 70%（基底）
- 整合測試: 20%
- E2E/系統測試: 10%（頂端）

### 測試要求
1. 所有新功能必須有測試
2. 錯誤修復應包含回歸測試
3. 關鍵路徑需要 E2E 覆蓋

### 命名慣例
\`\`\`
test_[方法]_[情境]_[預期結果]
\`\`\`

### 提交前
- 所有測試必須通過
- 覆蓋率不應下降`
    },
    comprehensive: {
      en: `## Testing Standards
Reference: .standards/testing-standards.md

### Test Pyramid
\`\`\`
        /\\
       /  \\        E2E (10%)
      /    \\       System tests, UI tests
     /──────\\
    /        \\     Integration (20%)
   /          \\    API tests, DB tests
  /────────────\\
 /              \\  Unit (70%)
/________________\\ Pure logic, fast feedback
\`\`\`

### Test Levels
| Level | Coverage | Focus |
|-------|----------|-------|
| Unit | 70% | Individual functions/methods |
| Integration | 20% | Component interactions |
| E2E | 10% | User workflows |

### Test Requirements by Feature Type
- **New Feature**: Unit + Integration tests required
- **Bug Fix**: Regression test required
- **Refactor**: Existing tests must pass
- **Critical Path**: E2E test required

### Naming Convention
\`\`\`
// Format: test_[method]_[scenario]_[expected]
test_calculateTotal_withDiscount_returnsDiscountedPrice()
test_login_invalidCredentials_throwsAuthError()
\`\`\`

### Test Quality Checklist
- [ ] Tests are independent (no shared state)
- [ ] Tests are deterministic (no flaky tests)
- [ ] Tests have clear assertions
- [ ] Edge cases are covered
- [ ] Error scenarios are tested`,
      'zh-tw': `## 測試標準
參考: .standards/testing-standards.md

### 測試金字塔
\`\`\`
        /\\
       /  \\        E2E (10%)
      /    \\       系統測試、UI 測試
     /──────\\
    /        \\     整合測試 (20%)
   /          \\    API 測試、DB 測試
  /────────────\\
 /              \\  單元測試 (70%)
/________________\\ 純邏輯、快速回饋
\`\`\`

### 測試層級
| 層級 | 覆蓋率 | 重點 |
|------|--------|------|
| 單元 | 70% | 個別函式/方法 |
| 整合 | 20% | 元件互動 |
| E2E | 10% | 使用者流程 |

### 依功能類型的測試要求
- **新功能**: 需要單元 + 整合測試
- **錯誤修復**: 需要回歸測試
- **重構**: 現有測試必須通過
- **關鍵路徑**: 需要 E2E 測試

### 命名慣例
\`\`\`
// 格式: test_[方法]_[情境]_[預期結果]
test_calculateTotal_withDiscount_returnsDiscountedPrice()
test_login_invalidCredentials_throwsAuthError()
\`\`\`

### 測試品質清單
- [ ] 測試獨立（無共享狀態）
- [ ] 測試確定性（無不穩定測試）
- [ ] 測試有明確斷言
- [ ] 涵蓋邊界情況
- [ ] 測試錯誤情境`
    }
  },

  'documentation': {
    minimal: {
      en: `## Documentation Standards
- Every public API needs docs
- README must have: Install, Usage, Examples
- Keep docs in sync with code`,
      'zh-tw': `## 文件標準
- 每個公開 API 需要文件
- README 必須有: 安裝、使用、範例
- 保持文件與程式碼同步`
    },
    standard: {
      en: `## Documentation Standards
Reference: .standards/documentation-guide.md

### README Requirements
1. Project name and description
2. Installation instructions
3. Quick start / Usage examples
4. Configuration options
5. Contributing guidelines

### API Documentation
- All public functions documented
- Include parameters, return types
- Provide usage examples

### Keep in Sync
- Update docs with code changes
- Review docs during code review`,
      'zh-tw': `## 文件標準
參考: .standards/documentation-guide.md

### README 要求
1. 專案名稱和描述
2. 安裝說明
3. 快速開始 / 使用範例
4. 配置選項
5. 貢獻指南

### API 文件
- 所有公開函式有文件
- 包含參數、回傳類型
- 提供使用範例

### 保持同步
- 隨程式碼變更更新文件
- 在程式碼審查時審查文件`
    },
    comprehensive: {
      en: `## Documentation Standards
Reference: .standards/documentation-guide.md

### README Structure
\`\`\`markdown
# Project Name

Brief description of what the project does.

## Features
- Feature 1
- Feature 2

## Installation
\\\`\\\`\\\`bash
npm install project-name
\\\`\\\`\\\`

## Quick Start
\\\`\\\`\\\`javascript
// Example code
\\\`\\\`\\\`

## Configuration
| Option | Default | Description |
|--------|---------|-------------|
| opt1   | value   | What it does |

## API Reference
[Link to full API docs]

## Contributing
[Link to CONTRIBUTING.md]

## License
[License type]
\`\`\`

### API Documentation Format
\`\`\`javascript
/**
 * Brief description of the function
 *
 * @param {string} param1 - Description of param1
 * @param {Object} options - Configuration options
 * @param {boolean} options.flag - What this flag does
 * @returns {Promise<Result>} Description of return value
 * @throws {Error} When something goes wrong
 * @example
 * const result = await myFunction('value', { flag: true });
 */
\`\`\`

### Documentation Checklist
- [ ] README is complete and accurate
- [ ] All public APIs documented
- [ ] Examples are working
- [ ] CHANGELOG is up to date
- [ ] No broken links`,
      'zh-tw': `## 文件標準
參考: .standards/documentation-guide.md

### README 結構
\`\`\`markdown
# 專案名稱

專案功能的簡短描述。

## 功能特色
- 功能 1
- 功能 2

## 安裝
\\\`\\\`\\\`bash
npm install project-name
\\\`\\\`\\\`

## 快速開始
\\\`\\\`\\\`javascript
// 範例程式碼
\\\`\\\`\\\`

## 配置
| 選項 | 預設值 | 說明 |
|------|--------|------|
| opt1 | value  | 用途 |

## API 參考
[完整 API 文件連結]

## 貢獻
[CONTRIBUTING.md 連結]

## 授權
[授權類型]
\`\`\`

### API 文件格式
\`\`\`javascript
/**
 * 函式的簡短說明
 *
 * @param {string} param1 - param1 的說明
 * @param {Object} options - 配置選項
 * @param {boolean} options.flag - 此旗標的用途
 * @returns {Promise<Result>} 回傳值說明
 * @throws {Error} 發生錯誤時
 * @example
 * const result = await myFunction('value', { flag: true });
 */
\`\`\`

### 文件清單
- [ ] README 完整且準確
- [ ] 所有公開 API 有文件
- [ ] 範例可正常運作
- [ ] CHANGELOG 已更新
- [ ] 無失效連結`
    }
  },

  'git-workflow': {
    minimal: {
      en: `## Git Workflow
- Branch format: type/description
- Types: feature/, fix/, docs/, chore/
- Always create PR for review`,
      'zh-tw': `## Git 工作流程
- 分支格式: type/description
- 類型: feature/, fix/, docs/, chore/
- 務必建立 PR 審查`
    },
    standard: {
      en: `## Git Workflow
Reference: .standards/git-workflow.md

### Branch Naming
\`\`\`
<type>/<ticket>-<description>
\`\`\`
Examples:
- feature/PROJ-123-add-login
- fix/PROJ-456-null-pointer
- docs/update-readme

### Branch Types
| Prefix | Purpose |
|--------|---------|
| feature/ | New features |
| fix/ | Bug fixes |
| docs/ | Documentation |
| chore/ | Maintenance |
| refactor/ | Code restructure |

### Workflow
1. Create branch from main
2. Commit with conventional messages
3. Push and create PR
4. Get review approval
5. Squash merge to main`,
      'zh-tw': `## Git 工作流程
參考: .standards/git-workflow.md

### 分支命名
\`\`\`
<type>/<ticket>-<description>
\`\`\`
範例:
- feature/PROJ-123-add-login
- fix/PROJ-456-null-pointer
- docs/update-readme

### 分支類型
| 前綴 | 用途 |
|------|------|
| feature/ | 新功能 |
| fix/ | 錯誤修復 |
| docs/ | 文件更新 |
| chore/ | 維護任務 |
| refactor/ | 程式碼重構 |

### 工作流程
1. 從 main 建立分支
2. 使用規範格式提交
3. 推送並建立 PR
4. 獲得審查核准
5. Squash merge 到 main`
    },
    comprehensive: {
      en: `## Git Workflow Standards
Reference: .standards/git-workflow.md

### Branch Strategy: GitHub Flow
\`\`\`
main ────────────────────────────────────>
         \\         /
          feature ─
\`\`\`

### Branch Naming Convention
\`\`\`
<type>/<ticket-id>-<short-description>
\`\`\`

| Type | Purpose | Example |
|------|---------|---------|
| feature/ | New functionality | feature/PROJ-123-user-auth |
| fix/ | Bug fixes | fix/PROJ-456-login-crash |
| docs/ | Documentation | docs/api-reference |
| chore/ | Maintenance | chore/update-deps |
| refactor/ | Code improvement | refactor/user-service |
| test/ | Test additions | test/auth-coverage |

### Pull Request Process
1. **Create Branch**
   \`\`\`bash
   git checkout -b feature/PROJ-123-description
   \`\`\`

2. **Make Commits**
   - Follow conventional commit format
   - Keep commits atomic and focused

3. **Push & Create PR**
   \`\`\`bash
   git push -u origin feature/PROJ-123-description
   \`\`\`

4. **PR Requirements**
   - Descriptive title
   - Link to issue/ticket
   - Summary of changes
   - Test instructions

5. **Review & Merge**
   - At least 1 approval required
   - All CI checks must pass
   - Squash merge preferred

### Protected Branch Rules
- Direct commits to main blocked
- PR required for all changes
- Status checks must pass`,
      'zh-tw': `## Git 工作流程標準
參考: .standards/git-workflow.md

### 分支策略: GitHub Flow
\`\`\`
main ────────────────────────────────────>
         \\         /
          feature ─
\`\`\`

### 分支命名慣例
\`\`\`
<type>/<ticket-id>-<short-description>
\`\`\`

| 類型 | 用途 | 範例 |
|------|------|------|
| feature/ | 新功能 | feature/PROJ-123-user-auth |
| fix/ | 錯誤修復 | fix/PROJ-456-login-crash |
| docs/ | 文件更新 | docs/api-reference |
| chore/ | 維護任務 | chore/update-deps |
| refactor/ | 程式碼改進 | refactor/user-service |
| test/ | 新增測試 | test/auth-coverage |

### Pull Request 流程
1. **建立分支**
   \`\`\`bash
   git checkout -b feature/PROJ-123-description
   \`\`\`

2. **進行提交**
   - 遵循規範提交格式
   - 保持提交原子性和專注

3. **推送並建立 PR**
   \`\`\`bash
   git push -u origin feature/PROJ-123-description
   \`\`\`

4. **PR 要求**
   - 描述性標題
   - 連結到 issue/ticket
   - 變更摘要
   - 測試說明

5. **審查與合併**
   - 至少需要 1 個核准
   - 所有 CI 檢查必須通過
   - 建議使用 Squash merge

### 受保護分支規則
- 禁止直接提交到 main
- 所有變更需要 PR
- 狀態檢查必須通過`
    }
  },

  'error-handling': {
    minimal: {
      en: `## Error Handling
- Use structured error codes
- Log errors with context
- Never expose internal errors to users`,
      'zh-tw': `## 錯誤處理
- 使用結構化錯誤碼
- 記錄錯誤時包含上下文
- 永不向使用者暴露內部錯誤`
    },
    standard: {
      en: `## Error Handling Standards

### Error Code Format
\`\`\`
E[CATEGORY][NUMBER]
\`\`\`
Example: EAUTH001, EDATA002

### Logging Requirements
- Include timestamp, level, message
- Add context: user ID, request ID
- Structured format (JSON preferred)

### Error Response
- User-friendly message
- Error code for debugging
- No stack traces in production`,
      'zh-tw': `## 錯誤處理標準

### 錯誤碼格式
\`\`\`
E[CATEGORY][NUMBER]
\`\`\`
範例: EAUTH001, EDATA002

### 日誌要求
- 包含時間戳記、層級、訊息
- 加入上下文: 使用者 ID、請求 ID
- 結構化格式（建議 JSON）

### 錯誤回應
- 使用者友善的訊息
- 供除錯的錯誤碼
- 生產環境不顯示堆疊追蹤`
    },
    comprehensive: {
      en: `## Error Handling Standards
Reference: .standards/error-code-standards.md, .standards/logging-standards.md

### Error Code System
\`\`\`
E[CATEGORY][SUBCATEGORY][NUMBER]
\`\`\`

| Category | Code Range | Description |
|----------|------------|-------------|
| AUTH | EAUTH001-099 | Authentication errors |
| DATA | EDATA001-099 | Data validation errors |
| SYS | ESYS001-099 | System errors |
| NET | ENET001-099 | Network errors |
| BIZ | EBIZ001-099 | Business logic errors |

### Error Object Structure
\`\`\`javascript
{
  code: "EAUTH001",
  message: "User-friendly message",
  details: "Technical details (dev only)",
  timestamp: "ISO-8601",
  requestId: "uuid"
}
\`\`\`

### Logging Standards
\`\`\`javascript
// Structured log format
{
  timestamp: "2024-01-15T10:30:00Z",
  level: "error",
  message: "Authentication failed",
  context: {
    userId: "user-123",
    requestId: "req-456",
    action: "login"
  },
  error: {
    code: "EAUTH001",
    stack: "..." // dev only
  }
}
\`\`\`

### Log Levels
| Level | Usage |
|-------|-------|
| error | Failures requiring action |
| warn | Potential issues |
| info | Significant events |
| debug | Development details |

### Security Rules
- Never log passwords or tokens
- Mask PII in logs
- No stack traces in production responses`,
      'zh-tw': `## 錯誤處理標準
參考: .standards/error-code-standards.md, .standards/logging-standards.md

### 錯誤碼系統
\`\`\`
E[CATEGORY][SUBCATEGORY][NUMBER]
\`\`\`

| 類別 | 代碼範圍 | 說明 |
|------|----------|------|
| AUTH | EAUTH001-099 | 認證錯誤 |
| DATA | EDATA001-099 | 資料驗證錯誤 |
| SYS | ESYS001-099 | 系統錯誤 |
| NET | ENET001-099 | 網路錯誤 |
| BIZ | EBIZ001-099 | 商業邏輯錯誤 |

### 錯誤物件結構
\`\`\`javascript
{
  code: "EAUTH001",
  message: "使用者友善訊息",
  details: "技術細節（僅開發環境）",
  timestamp: "ISO-8601",
  requestId: "uuid"
}
\`\`\`

### 日誌標準
\`\`\`javascript
// 結構化日誌格式
{
  timestamp: "2024-01-15T10:30:00Z",
  level: "error",
  message: "認證失敗",
  context: {
    userId: "user-123",
    requestId: "req-456",
    action: "login"
  },
  error: {
    code: "EAUTH001",
    stack: "..." // 僅開發環境
  }
}
\`\`\`

### 日誌層級
| 層級 | 用途 |
|------|------|
| error | 需要處理的失敗 |
| warn | 潛在問題 |
| info | 重要事件 |
| debug | 開發細節 |

### 安全規則
- 永不記錄密碼或令牌
- 在日誌中遮蔽個人資料
- 生產環境回應不包含堆疊追蹤`
    }
  },

  'project-structure': {
    minimal: {
      en: `## Project Structure
- src/ for source code
- tests/ for test files
- docs/ for documentation
- Keep related files together`,
      'zh-tw': `## 專案結構
- src/ 放原始碼
- tests/ 放測試檔案
- docs/ 放文件
- 相關檔案放在一起`
    },
    standard: {
      en: `## Project Structure Standards

### Standard Layout
\`\`\`
project/
├── src/           # Source code
├── tests/         # Test files
├── docs/          # Documentation
├── config/        # Configuration
├── scripts/       # Build/utility scripts
└── .standards/    # Project standards
\`\`\`

### Principles
- Group by feature, not by type
- Keep related code close
- Flat is better than nested
- Consistent naming conventions`,
      'zh-tw': `## 專案結構標準

### 標準配置
\`\`\`
project/
├── src/           # 原始碼
├── tests/         # 測試檔案
├── docs/          # 文件
├── config/        # 配置
├── scripts/       # 建置/工具腳本
└── .standards/    # 專案標準
\`\`\`

### 原則
- 依功能分組，非依類型
- 相關程式碼放在一起
- 扁平優於巢狀
- 一致的命名慣例`
    },
    comprehensive: {
      en: `## Project Structure Standards
Reference: .standards/project-structure.md

### Universal Layout
\`\`\`
project/
├── src/                # Source code
│   ├── components/     # Reusable components
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── types/          # Type definitions
├── tests/              # Test files
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── docs/               # Documentation
├── config/             # Configuration files
├── scripts/            # Build/utility scripts
├── .standards/         # Project standards
├── .github/            # GitHub workflows
├── README.md
├── CHANGELOG.md
└── package.json        # (or equivalent)
\`\`\`

### Organization Principles

#### 1. Feature-Based Organization
\`\`\`
src/
├── auth/
│   ├── components/
│   ├── services/
│   └── types/
├── users/
│   ├── components/
│   ├── services/
│   └── types/
\`\`\`

#### 2. Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | user-service.js |
| Classes | PascalCase | UserService |
| Functions | camelCase | getUser() |
| Constants | UPPER_SNAKE | MAX_RETRIES |

#### 3. File Size Guidelines
- Components: < 300 lines
- Modules: < 500 lines
- Split when exceeding limits

### Anti-Patterns to Avoid
- Deep nesting (> 4 levels)
- Circular dependencies
- Mixed concerns in one file
- Inconsistent naming`,
      'zh-tw': `## 專案結構標準
參考: .standards/project-structure.md

### 通用配置
\`\`\`
project/
├── src/                # 原始碼
│   ├── components/     # 可重用元件
│   ├── services/       # 商業邏輯
│   ├── utils/          # 工具函式
│   └── types/          # 類型定義
├── tests/              # 測試檔案
│   ├── unit/           # 單元測試
│   └── integration/    # 整合測試
├── docs/               # 文件
├── config/             # 配置檔案
├── scripts/            # 建置/工具腳本
├── .standards/         # 專案標準
├── .github/            # GitHub 工作流程
├── README.md
├── CHANGELOG.md
└── package.json        # (或同等檔案)
\`\`\`

### 組織原則

#### 1. 依功能組織
\`\`\`
src/
├── auth/
│   ├── components/
│   ├── services/
│   └── types/
├── users/
│   ├── components/
│   ├── services/
│   └── types/
\`\`\`

#### 2. 命名慣例
| 類型 | 慣例 | 範例 |
|------|------|------|
| 檔案 | kebab-case | user-service.js |
| 類別 | PascalCase | UserService |
| 函式 | camelCase | getUser() |
| 常數 | UPPER_SNAKE | MAX_RETRIES |

#### 3. 檔案大小指引
- 元件: < 300 行
- 模組: < 500 行
- 超過時進行拆分

### 避免的反模式
- 過深巢狀（> 4 層）
- 循環相依
- 單一檔案混合關注點
- 不一致的命名`
    }
  }
};

/**
 * Tool-specific file headers
 */
const TOOL_HEADERS = {
  cursor: {
    en: `# Cursor Rules
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# Cursor 規則
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

您是專業的軟體工程助手。請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# Cursor Rules | Cursor 規則
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.
您是專業的軟體工程助手。請遵循以下專案標準。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  },
  windsurf: {
    en: `# Windsurf Rules
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# Windsurf 規則
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

您是專業的軟體工程助手。請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# Windsurf Rules | Windsurf 規則
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.
您是專業的軟體工程助手。請遵循以下專案標準。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  },
  cline: {
    en: `# Cline Rules
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# Cline 規則
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

您是專業的軟體工程助手。請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# Cline Rules | Cline 規則
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.
您是專業的軟體工程助手。請遵循以下專案標準。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  },
  copilot: {
    en: `# GitHub Copilot Instructions
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# GitHub Copilot 說明
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

您是專業的軟體工程助手。請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# GitHub Copilot Instructions | GitHub Copilot 說明
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.
您是專業的軟體工程助手。請遵循以下專案標準。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  },
  antigravity: {
    en: `# Antigravity System Instructions
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

Recommended system instructions for Google Antigravity (Gemini Advanced Agent).
Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# Antigravity 系統指令
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

Google Antigravity (Gemini Advanced Agent) 的推薦系統指令。
請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# Antigravity System Instructions | Antigravity 系統指令
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

Recommended system instructions for Google Antigravity (Gemini Advanced Agent).
Google Antigravity (Gemini Advanced Agent) 的推薦系統指令。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  },
  'claude-code': {
    en: `# Project Guidelines for Claude Code
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# Claude Code 專案指南
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。
AI 助手應以繁體中文回覆使用者的問題與請求。`,
    bilingual: `# Project Guidelines for Claude Code | Claude Code 專案指南
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。
AI 助手應以繁體中文回覆使用者的問題與請求。`
  },
  codex: {
    en: `# AGENTS.md - OpenAI Codex CLI Rules
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# AGENTS.md - OpenAI Codex CLI 規則
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

您是專業的軟體工程助手。請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# AGENTS.md - OpenAI Codex CLI Rules | OpenAI Codex CLI 規則
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.
您是專業的軟體工程助手。請遵循以下專案標準。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  },
  'gemini-cli': {
    en: `# GEMINI.md - Gemini CLI Rules
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant powered by Gemini. Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# GEMINI.md - Gemini CLI 規則
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

您是由 Gemini 驅動的專業軟體工程助手。請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# GEMINI.md - Gemini CLI Rules | Gemini CLI 規則
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant powered by Gemini. Follow these project standards.
您是由 Gemini 驅動的專業軟體工程助手。請遵循以下專案標準。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  },
  opencode: {
    en: `# AGENTS.md - OpenCode Rules
# Generated by Universal Dev Standards CLI
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.

## Conversation Language
All responses should be in **English**.`,
    'zh-tw': `# AGENTS.md - OpenCode 規則
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

您是專業的軟體工程助手。請遵循以下專案標準。

## 對話語言 / Conversation Language
所有回覆必須使用**繁體中文 (Traditional Chinese)**。`,
    bilingual: `# AGENTS.md - OpenCode Rules | OpenCode 規則
# Generated by Universal Dev Standards CLI
# 由 Universal Dev Standards CLI 生成
# https://github.com/AsiaOstrich/universal-dev-standards

You are an expert software engineer assistant. Follow these project standards.
您是專業的軟體工程助手。請遵循以下專案標準。

## Conversation Language / 對話語言
All responses should be in **Traditional Chinese (繁體中文)**, with technical terms in English where appropriate.
所有回覆必須使用**繁體中文**，技術術語可保留英文。`
  }
};

/**
 * Generate minimal standards reference for minimal content mode
 * @param {string[]} installedStandards - List of installed standard file paths
 * @param {string} format - Output format: 'markdown' or 'plaintext'
 * @param {string} language - Language: 'en', 'zh-tw', or 'bilingual'
 * @returns {string} Generated minimal reference
 */
export function generateMinimalStandardsReference(installedStandards, format, language = 'zh-tw') {
  if (!installedStandards || installedStandards.length === 0) {
    return '';
  }

  const coreStandards = [];
  const optionStandards = [];

  // Separate core standards from options
  for (const standardPath of installedStandards) {
    const filename = basename(standardPath);
    const isOption = standardPath.includes('/options/') || standardPath.includes('\\options\\');

    if (isOption) {
      optionStandards.push({ filename, path: standardPath });
    } else {
      coreStandards.push({ filename, path: standardPath });
    }
  }

  const sections = [];

  if (format === 'markdown') {
    sections.push(language === 'en'
      ? '## Standards Reference'
      : '## 規範文件參考');
    sections.push('');
    sections.push(language === 'en'
      ? '**IMPORTANT**: When performing related tasks, you MUST read and follow the standards in `.standards/`:'
      : '**重要**：執行相關任務時，務必讀取並遵循 `.standards/` 目錄下的對應規範：');
    sections.push('');

    if (coreStandards.length > 0) {
      sections.push(language === 'en' ? '**Core Standards:**' : '**核心規範：**');
      for (const std of coreStandards) {
        sections.push(`- \`.standards/${std.filename}\``);
      }
      sections.push('');
    }

    if (optionStandards.length > 0) {
      sections.push(language === 'en' ? '**Options:**' : '**選項：**');
      for (const std of optionStandards) {
        sections.push(`- \`.standards/options/${std.filename}\``);
      }
      sections.push('');
    }
  } else {
    // Plaintext format
    sections.push(language === 'en'
      ? '## Standards Reference'
      : '## 規範文件參考');
    sections.push('');
    sections.push(language === 'en'
      ? 'IMPORTANT: When performing related tasks, read and follow the standards in .standards/:'
      : '重要：執行相關任務時，務必讀取並遵循 .standards/ 目錄下的對應規範：');
    sections.push('');

    for (const std of coreStandards) {
      sections.push(`- .standards/${std.filename}`);
    }

    if (optionStandards.length > 0) {
      sections.push('');
      sections.push(language === 'en' ? 'Options:' : '選項：');
      for (const std of optionStandards) {
        sections.push(`- .standards/options/${std.filename}`);
      }
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generate integration file content
 * @param {Object} config - Integration configuration
 * @returns {string} Generated content
 */
export function generateIntegrationContent(config) {
  const {
    tool,
    categories = [],
    languages = [],
    exclusions = [],
    customRules = [],
    detailLevel = 'standard',
    language = 'en',
    // New fields for enhanced standards compliance
    installedStandards = [],
    contentMode = 'minimal',
    level = 2,
    // Commit language option for dynamic commit standards generation
    commitLanguage = 'english'
  } = config;

  const sections = [];
  const format = TOOL_FORMATS[tool] || 'markdown';

  // Add header
  const header = TOOL_HEADERS[tool]?.[language] || TOOL_HEADERS[tool]?.en || '';
  sections.push(header);
  sections.push('\n---\n');

  // Add rule sections based on selected categories (core rules - always included)
  for (const categoryId of categories) {
    // Special handling for commit-standards: use dynamic generation based on commitLanguage
    if (categoryId === 'commit-standards') {
      const commitContent = generateCommitStandardsContent(commitLanguage, detailLevel);
      sections.push(commitContent);
      sections.push('\n---\n');
      continue;
    }

    const template = RULE_TEMPLATES[categoryId];
    if (template && template[detailLevel]) {
      if (language === 'bilingual') {
        sections.push(template[detailLevel].en);
        sections.push('\n');
        sections.push(template[detailLevel]['zh-tw']);
      } else {
        sections.push(template[detailLevel][language] || template[detailLevel].en);
      }
      sections.push('\n---\n');
    }
  }

  // Add standards reference/compliance instructions (based on contentMode)
  // ALL modes should reference installed standards, just with different detail levels
  if (installedStandards.length > 0) {
    let standardsContent = '';

    if (contentMode === 'minimal') {
      // Minimal mode: simple reference list
      standardsContent = generateMinimalStandardsReference(
        installedStandards,
        format,
        language
      );
    } else {
      // Index/Full mode: detailed compliance instructions + index
      const complianceInstructions = generateComplianceInstructions(
        installedStandards,
        contentMode,
        format,
        language
      );

      const standardsIndex = generateStandardsIndex(
        installedStandards,
        format,
        language,
        level
      );

      standardsContent = complianceInstructions + '\n\n' + standardsIndex;
    }

    // Wrap with markers for future updates
    const markedContent = wrapWithMarkers(standardsContent, format);
    sections.push(markedContent);
    sections.push('\n---\n');
  }

  // Add language-specific rules
  const langRules = getLanguageRules();
  for (const lang of languages) {
    if (langRules[lang]) {
      sections.push(`## ${langRules[lang].name} Guidelines`);
      sections.push(langRules[lang].rules.map(r => `- ${r}`).join('\n'));
      sections.push('\n');
    }
  }

  // Add custom rules
  if (customRules.length > 0) {
    sections.push('## Project-Specific Rules');
    sections.push(customRules.map(r => `- ${r}`).join('\n'));
    sections.push('\n');
  }

  // Add exclusions
  if (exclusions.length > 0) {
    sections.push('## Exclusions');
    sections.push('The following patterns/files are excluded from these rules:');
    sections.push(exclusions.map(e => `- ${e}`).join('\n'));
    sections.push('\n');
  }

  return sections.join('\n').trim() + '\n';
}

/**
 * Merge existing rules with new rules
 * @param {string} existingContent - Existing file content
 * @param {string} newContent - New content to merge
 * @param {string} strategy - Merge strategy ('append', 'merge', 'overwrite')
 * @returns {string} Merged content
 */
export function mergeRules(existingContent, newContent, strategy) {
  if (strategy === 'overwrite') {
    return newContent;
  }

  if (strategy === 'keep') {
    return existingContent;
  }

  if (strategy === 'append') {
    return existingContent.trim() + '\n\n---\n\n# Added by Universal Dev Standards\n\n' + newContent;
  }

  // 'merge' strategy - try to avoid duplicates
  const existingSections = new Set(
    existingContent.match(/^## .+$/gm)?.map(s => s.toLowerCase()) || []
  );

  const newSections = newContent.split(/(?=^## )/m);
  const filteredSections = newSections.filter(section => {
    const header = section.match(/^## .+$/m)?.[0]?.toLowerCase();
    return !header || !existingSections.has(header);
  });

  if (filteredSections.length === 0) {
    return existingContent;
  }

  return existingContent.trim() + '\n\n---\n\n# Added by Universal Dev Standards\n\n' + filteredSections.join('\n');
}

/**
 * Write integration file
 * @param {string} tool - Tool name
 * @param {Object} config - Integration configuration
 * @param {string} projectPath - Project root path
 * @returns {Object} Result with success status
 */
export function writeIntegrationFile(tool, config, projectPath) {
  const fileName = TOOL_FILES[tool];
  if (!fileName) {
    return { success: false, error: `Unknown tool: ${tool}` };
  }

  const filePath = join(projectPath, fileName);
  const dirPath = dirname(filePath);

  // Ensure directory exists
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  try {
    let content = generateIntegrationContent({ ...config, tool });

    // Handle merge if file exists
    if (existsSync(filePath) && config.mergeStrategy) {
      const existingContent = readFileSync(filePath, 'utf-8');
      content = mergeRules(existingContent, content, config.mergeStrategy);
    }

    writeFileSync(filePath, content);

    // Compute block hash for tracking UDS content separately from user content
    const blockHashInfo = computeIntegrationBlockHash(filePath);

    return {
      success: true,
      path: fileName, // Return relative path for consistency
      absolutePath: filePath,
      blockHashInfo // Contains: blockHash, blockSize, fullHash, fullSize
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if integration file exists
 * @param {string} tool - Tool name
 * @param {string} projectPath - Project root path
 * @returns {boolean} True if file exists
 */
export function integrationFileExists(tool, projectPath) {
  const fileName = TOOL_FILES[tool];
  return fileName && existsSync(join(projectPath, fileName));
}

/**
 * Generate compliance instructions section based on installed standards
 * @param {string[]} installedStandards - List of installed standard file paths
 * @param {string} mode - Content mode: 'full', 'index', or 'minimal'
 * @param {string} format - Output format: 'markdown' or 'plaintext'
 * @param {string} language - Language: 'en', 'zh-tw', or 'bilingual'
 * @returns {string} Generated compliance instructions
 */
export function generateComplianceInstructions(installedStandards, mode, format, language = 'zh-tw') {
  if (mode === 'minimal' || !installedStandards || installedStandards.length === 0) {
    return '';
  }

  const mustFollow = [];
  const shouldFollow = [];

  // Categorize standards by priority
  for (const standardPath of installedStandards) {
    const filename = basename(standardPath);
    const mapping = STANDARD_TASK_MAPPING[filename];
    if (mapping) {
      const entry = {
        task: mapping.task,
        standard: `.standards/${filename}`,
        when: mapping.when,
        filename
      };
      if (mapping.priority === 'MUST') {
        mustFollow.push(entry);
      } else {
        shouldFollow.push(entry);
      }
    }
  }

  const sections = [];

  if (format === 'markdown') {
    sections.push('## Standards Compliance Instructions');
    sections.push('');

    if (mustFollow.length > 0) {
      sections.push(language === 'en'
        ? '**MUST follow** (always required):'
        : '**MUST follow** (每次都要遵守):');
      sections.push('| Task | Standard | When |');
      sections.push('|------|----------|------|');
      for (const entry of mustFollow) {
        sections.push(`| ${entry.task} | [${entry.filename}](${entry.standard}) | ${entry.when} |`);
      }
      sections.push('');
    }

    if (shouldFollow.length > 0) {
      sections.push(language === 'en'
        ? '**SHOULD follow** (when relevant):'
        : '**SHOULD follow** (相關任務時參考):');
      sections.push('| Task | Standard | When |');
      sections.push('|------|----------|------|');
      for (const entry of shouldFollow) {
        sections.push(`| ${entry.task} | [${entry.filename}](${entry.standard}) | ${entry.when} |`);
      }
      sections.push('');
    }
  } else {
    // Plaintext format
    sections.push('## Standards Compliance Instructions');
    sections.push('');

    if (mustFollow.length > 0) {
      sections.push(language === 'en'
        ? 'MUST follow (always required):'
        : 'MUST follow (每次都要遵守):');
      for (const entry of mustFollow) {
        sections.push(`- ${entry.task}: Read ${entry.standard} ${entry.when.toLowerCase()}`);
      }
      sections.push('');
    }

    if (shouldFollow.length > 0) {
      sections.push(language === 'en'
        ? 'SHOULD follow (when relevant):'
        : 'SHOULD follow (相關任務時參考):');
      for (const entry of shouldFollow) {
        sections.push(`- ${entry.task}: Reference ${entry.standard}`);
      }
      sections.push('');
    }
  }

  return sections.join('\n');
}

/**
 * Generate standards index section
 * @param {string[]} installedStandards - List of installed standard file paths
 * @param {string} format - Output format: 'markdown' or 'plaintext'
 * @param {string} language - Language: 'en', 'zh-tw', or 'bilingual'
 * @param {number} level - Adoption level (1, 2, or 3)
 * @returns {string} Generated standards index
 */
export function generateStandardsIndex(installedStandards, format, language = 'zh-tw', level = 2) {
  if (!installedStandards || installedStandards.length === 0) {
    return '';
  }

  const coreStandards = [];
  const optionStandards = [];

  // Separate core standards from options
  for (const standardPath of installedStandards) {
    const filename = basename(standardPath);
    const isOption = standardPath.includes('/options/') || standardPath.includes('\\options\\');
    const description = STANDARD_DESCRIPTIONS[filename] || filename;

    if (isOption) {
      optionStandards.push({ filename, description, path: standardPath });
    } else {
      coreStandards.push({ filename, description, path: standardPath });
    }
  }

  const sections = [];

  if (format === 'markdown') {
    sections.push('## Installed Standards Index');
    sections.push('');
    sections.push(language === 'en'
      ? `This project has adopted **Level ${level}** standards. All standards are in \`.standards/\`:`
      : `本專案採用 **Level ${level}** 標準。所有規範位於 \`.standards/\`：`);
    sections.push('');

    if (coreStandards.length > 0) {
      sections.push(`### Core (${coreStandards.length} standards)`);
      for (const std of coreStandards) {
        sections.push(`- \`${std.filename}\` - ${std.description}`);
      }
      sections.push('');
    }

    if (optionStandards.length > 0) {
      sections.push('### Options');
      for (const std of optionStandards) {
        sections.push(`- \`options/${std.filename}\` - ${std.description}`);
      }
      sections.push('');
    }
  } else {
    // Plaintext format
    sections.push('## Installed Standards Index');
    sections.push('');
    sections.push(language === 'en'
      ? `Level ${level} standards installed in .standards/:`
      : `Level ${level} 標準已安裝於 .standards/：`);
    sections.push('');

    for (const std of coreStandards) {
      sections.push(`- ${std.filename} - ${std.description}`);
    }

    if (optionStandards.length > 0) {
      sections.push('');
      sections.push('Options:');
      for (const std of optionStandards) {
        sections.push(`- options/${std.filename} - ${std.description}`);
      }
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Wrap content with UDS marker blocks
 * @param {string} content - Content to wrap
 * @param {string} format - Output format: 'markdown' or 'plaintext'
 * @returns {string} Content wrapped with markers
 */
export function wrapWithMarkers(content, format) {
  const markers = MARKERS[format] || MARKERS.markdown;
  return `${markers.start}\n${content}\n${markers.end}`;
}

/**
 * Extract content between UDS markers
 * @param {string} fileContent - Full file content
 * @param {string} format - Output format: 'markdown' or 'plaintext'
 * @returns {Object} Object with before, content, and after parts
 */
export function extractMarkedContent(fileContent, format) {
  const markers = MARKERS[format] || MARKERS.markdown;
  const startIdx = fileContent.indexOf(markers.start);
  const endIdx = fileContent.indexOf(markers.end);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return { before: fileContent, content: '', after: '' };
  }

  return {
    before: fileContent.substring(0, startIdx),
    content: fileContent.substring(startIdx + markers.start.length, endIdx).trim(),
    after: fileContent.substring(endIdx + markers.end.length)
  };
}

/**
 * Update marked section in file while preserving user content
 * @param {string} existingContent - Existing file content
 * @param {string} newMarkedContent - New content for marked section
 * @param {string} format - Output format: 'markdown' or 'plaintext'
 * @returns {string} Updated file content
 */
export function updateMarkedSection(existingContent, newMarkedContent, format) {
  const markers = MARKERS[format] || MARKERS.markdown;
  const startIdx = existingContent.indexOf(markers.start);
  const endIdx = existingContent.indexOf(markers.end);

  if (startIdx === -1 || endIdx === -1) {
    // No existing markers, append new content
    return existingContent.trim() + '\n\n' + wrapWithMarkers(newMarkedContent, format) + '\n';
  }

  // Replace existing marked section
  const before = existingContent.substring(0, startIdx);
  const after = existingContent.substring(endIdx + markers.end.length);

  return before + wrapWithMarkers(newMarkedContent, format) + after;
}

/**
 * Get tool file path
 * @param {string} tool - Tool name
 * @returns {string|null} File path or null if unknown tool
 */
export function getToolFilePath(tool) {
  return TOOL_FILES[tool] || null;
}

/**
 * Get tool format type
 * @param {string} tool - Tool name
 * @returns {string} Format type: 'markdown' or 'plaintext'
 */
export function getToolFormat(tool) {
  return TOOL_FORMATS[tool] || 'markdown';
}

/**
 * Get all supported tools
 * @returns {string[]} Array of tool names
 */
export function getSupportedTools() {
  return Object.keys(TOOL_FILES);
}

/**
 * Check if two tools share the same file
 * @param {string} tool1 - First tool name
 * @param {string} tool2 - Second tool name
 * @returns {boolean} True if tools share the same file
 */
export function toolsShareFile(tool1, tool2) {
  return TOOL_FILES[tool1] && TOOL_FILES[tool1] === TOOL_FILES[tool2];
}
