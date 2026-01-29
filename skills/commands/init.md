---
description: [UDS] Initialize development standards in current project
allowed-tools: Read, Bash(uds init:*), Bash(npx:*)
argument-hint: "[--level N | --yes]"
---

# Initialize Standards | 初始化標準

Initialize Universal Development Standards in the current project.

在當前專案初始化 Universal Development Standards。

## Interactive Mode (Default) | 互動模式（預設）

When invoked without `--yes`, use AskUserQuestion to gather user preferences before executing.

當不帶 `--yes` 執行時，使用 AskUserQuestion 詢問用戶偏好後再執行。

### Step 1: Detect Project | 步驟 1：偵測專案

First, CLI automatically detects project characteristics:
- Languages (JavaScript, TypeScript, Python, Go, etc.)
- Frameworks (React, Vue, Express, etc.)
- AI Tools (Claude Code, Cursor, Copilot, etc.)

首先，CLI 會自動偵測專案特性。

### Step 2: Ask AI Tools Selection | 步驟 2：詢問 AI 工具選擇

Use AskUserQuestion with multiSelect to ask which AI tools to configure:

使用 AskUserQuestion（多選）詢問要配置哪些 AI 工具：

| AI Tool | Integration File | Skills Support | Commands Support |
|---------|-----------------|----------------|------------------|
| **Claude Code** | `CLAUDE.md` | ✅ | ❌ |
| **Cursor** | `.cursorrules` | ✅ | ❌ |
| **Windsurf** | `.windsurfrules` | ✅ | ❌ |
| **Cline** | `.clinerules` | ✅ | ❌ |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ | ✅ |
| **OpenCode** | `AGENTS.md` | ✅ | ✅ |
| **Gemini CLI** | `GEMINI.md` | ✅ | ✅ |
| **Codex** | `AGENTS.md` | ✅ | ❌ |
| **Antigravity** | `INSTRUCTIONS.md` | ✅ | ❌ |

Pre-select tools detected in the environment. Note: Codex and OpenCode share `AGENTS.md`.

預選環境中偵測到的工具。注意：Codex 和 OpenCode 共用 `AGENTS.md`。

### Step 3: Ask Skills Installation | 步驟 3：詢問 Skills 安裝

For tools that support Skills, use **Smart Grouping** strategy based on tool count.

對於支援 Skills 的工具，根據工具數量使用**智能分組**策略。

**IMPORTANT: AskUserQuestion has a 4-option limit.** Use smart grouping to handle this.

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

#### Strategy A: 1-2 Tools → Combined Question | 策略 A：1-2 個工具 → 合併詢問

**Example (Claude Code only):**
```
Question: "Skills 要安裝到哪裡？"
Options:
1. Plugin Marketplace (建議) - 自動更新，易於管理
2. User Level (~/.claude/skills/) - 所有專案共用
3. Project Level (.claude/skills/) - 僅此專案
4. 跳過 - 不安裝 Skills
```

**Example (Claude Code + OpenCode):**
```
Question: "Skills 要安裝到哪裡？"
Options:
1. Plugin Marketplace + OpenCode Project Level (建議)
2. 全部 User Level - 所有專案共用
3. 全部 Project Level - 僅此專案
4. 跳過 - 不安裝 Skills
```

#### Strategy B: 3+ Tools → Two-Stage Question | 策略 B：3+ 個工具 → 兩階段詢問

**Stage 1: Ask unified or individual**
```
Question: "您選擇了 3 個以上的 AI 工具，Skills 安裝層級要如何設定？"
Options:
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Skills
```

**Stage 2a: If unified → ask level once**
```
Question: "所有 Skills 要安裝到哪個層級？"
Options:
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```
Note: Claude Code uses Plugin Marketplace by default; only other tools use selected level.

**Stage 2b: If individual → per-tool questions**
Ask each tool separately (see Strategy A examples).

### Step 4: Ask Commands Installation | 步驟 4：詢問 Commands 安裝

For tools that support Commands (OpenCode, Copilot, Gemini CLI), use **Smart Grouping** strategy.

對於支援 Commands 的工具，使用**智能分組**策略。

**IMPORTANT: AskUserQuestion has a 4-option limit.** Use smart grouping to handle this.

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

#### Strategy A: 1-2 Tools → Combined Question | 策略 A：1-2 個工具 → 合併詢問

**Example (OpenCode only):**
```
Question: "Commands 要安裝到哪裡？"
Options:
1. User Level (~/.config/opencode/command/) - 所有專案共用
2. Project Level (.opencode/command/) - 僅此專案 (建議)
3. 跳過 - 使用 Skills 即可
```

**Example (OpenCode + Copilot):**
```
Question: "Commands 要安裝到哪裡？"
Options:
1. 全部 User Level - 所有專案共用
2. 全部 Project Level (建議) - 僅此專案
3. 跳過 - 使用 Skills 即可
```

#### Strategy B: 3+ Tools → Two-Stage Question | 策略 B：3+ 個工具 → 兩階段詢問

**Stage 1: Ask unified or individual**
```
Question: "您選擇了多個支援 Commands 的 AI 工具，安裝層級要如何設定？"
Options:
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Commands
```

**Stage 2a: If unified → ask level once**
```
Question: "所有 Commands 要安裝到哪個層級？"
Options:
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```

**Stage 2b: If individual → per-tool questions**
Ask each tool separately (see Strategy A examples).

### Step 5: Ask Standards Scope | 步驟 5：詢問標準範圍

Use AskUserQuestion (only shown if Skills are installed):

使用 AskUserQuestion（僅在安裝 Skills 時顯示）：

| Option | Description |
|--------|-------------|
| **Lean (Recommended)** | Reference docs only, Skills provide real-time task guidance |
| **Complete** | Install all standard files, independent of Skills |

### Step 6: Ask Adoption Level | 步驟 6：詢問採用層級

Use AskUserQuestion:

使用 AskUserQuestion：

| Option | Description |
|--------|-------------|
| **Level 1: Starter** | 6 core standards: commit, anti-hallucination, checkin, etc. |
| **Level 2: Professional (Recommended)** | Adds testing, Git workflow, error handling - 12 total |
| **Level 3: Complete** | Includes versioning, logging, SDD - all 16 standards |

### Step 7: Ask Standards Format | 步驟 7：詢問標準格式

Use AskUserQuestion:

| Option | Description |
|--------|-------------|
| **AI (Compact)** | Optimized for AI consumption (Recommended) |
| **Human (Detailed)** | Readable format for humans |
| **Both** | Generate both formats |

### Step 8: Ask Standard Options | 步驟 8：詢問標準選項

Based on adoption level, ask for:
- **Git Workflow**: github-flow, gitflow, trunk-based
- **Merge Strategy**: squash, merge, rebase
- **Commit Language**: english, traditional-chinese, bilingual
- **Test Levels**: unit-testing, integration-testing, e2e-testing

### Step 9: Ask Language Extensions | 步驟 9：詢問語言擴展

If languages detected, ask whether to include language-specific standards:
- C# Style Guide
- PHP Style Guide
- etc.

### Step 10: Ask Framework Extensions | 步驟 10：詢問框架擴展

If frameworks detected, ask whether to include framework-specific patterns:
- Fat-Free Patterns
- etc.

### Step 11: Ask Locale | 步驟 11：詢問地區設定

Use AskUserQuestion:

| Option | Description |
|--------|-------------|
| **English (Default)** | English documentation |
| **Traditional Chinese** | 繁體中文文件 |

### Step 12: Ask Content Mode | 步驟 12：詢問內容模式

Use AskUserQuestion for integration file content:

使用 AskUserQuestion 設定整合檔案內容：

| Option | Description |
|--------|-------------|
| **Standard (Recommended)** | Summary + task mapping, AI knows when to read which standard |
| **Full Embed** | Embed all rules, AI can use immediately but larger file |
| **Minimal** | File references only, best with Skills |

### Step 13: Confirm and Execute | 步驟 13：確認並執行

Show configuration summary and confirm before executing.

After confirmation, CLI executes all installations in one operation:
- Copies standards to `.standards/`
- Generates integration files
- Installs Skills (if selected)
- Installs Commands (if selected)
- Creates `manifest.json`

## Quick Mode | 快速模式

When invoked with `--yes` or specific options, skip interactive questions:

```bash
/init --yes                    # Use all defaults
/init --level 2 --yes          # Specific level with defaults
/init --skills-location none   # No Skills installation
/init --content-mode standard  # Specific content mode
```

## Options Reference | 選項參考

| Option | Description | 說明 |
|--------|-------------|------|
| `--yes`, `-y` | Non-interactive mode | 非互動模式 |
| `--level N` | Adoption level (1, 2, or 3) | 採用層級 |
| `--skills-location` | marketplace, user, project, or none | Skills 位置 |
| `--content-mode` | standard, full, or minimal | 內容模式 |
| `--format` | ai, human, or both | 格式 |
| `-E`, `--experimental` | Enable experimental features (methodology) | 啟用實驗性功能 |

See `uds init --help` for all options.

## Adoption Levels | 採用層級

| Level | Name | Standards Count | Description | 說明 |
|-------|------|-----------------|-------------|------|
| 1 | Starter | 6 | Core standards for small projects | 核心標準（小型專案） |
| 2 | Professional | 12 | Adds testing, Git workflow, error handling | 團隊專業品質標準 |
| 3 | Complete | 16 | All 16 standards including SDD | 完整的 16 項標準 |

## What Gets Installed | 安裝內容

- `.standards/` directory with core standards
- Integration files (`CLAUDE.md`, `.cursorrules`, etc.)
- Skills (via Plugin Marketplace or local installation)
- Commands (for supported AI tools)
- `manifest.json` for tracking installation

## Reference | 參考

- CLI documentation: `uds init --help`
- Adoption guide: [ADOPTION-GUIDE.md](../../adoption/ADOPTION-GUIDE.md)
- Check command: [/check](./check.md)
- Update command: [/update](./update.md)
