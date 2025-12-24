# Universal Development Standards CLI
# 通用開發規範 CLI 工具

CLI tool for adopting Universal Development Standards in your projects.

採用通用開發規範的 CLI 工具，協助您在專案中快速導入標準。

## Installation | 安裝

### Option 1: Clone and Run Locally (Recommended) | 選項一：本地克隆執行（推薦）

```bash
# Clone the repository
git clone https://github.com/AsiaOstrich/universal-dev-standards.git

# Navigate to CLI directory
cd universal-dev-standards/cli

# Install dependencies
npm install

# Run directly
node bin/uds.js list
node bin/uds.js init
```

### Option 2: Global Link (for frequent use) | 選項二：全域連結（適合頻繁使用）

```bash
# In the cli directory
cd universal-dev-standards/cli
npm link

# Now available globally
uds list
uds init
```

### Option 3: npx (when published to npm) | 選項三：npx（發布到 npm 後）

```bash
# Not yet published - use Option 1 or 2 for now
npx universal-dev-standards init
```

## Commands | 命令

### `uds list`

List all available standards. | 列出所有可用的規範。

```bash
# List all standards
uds list

# Filter by level
uds list --level 2

# Filter by category
uds list --category skill
```

**Options | 選項:**
- `-l, --level <1|2|3>` - Filter by adoption level | 按採用等級篩選
- `-c, --category <name>` - Filter by category | 按類別篩選 (skill, reference, extension, integration, template)

### `uds init`

Initialize standards in your project. | 在您的專案中初始化規範。

```bash
# Interactive mode (recommended)
uds init

# Non-interactive with defaults
uds init --yes

# Specify options
uds init --level 2 --lang php --locale zh-tw
```

**Options | 選項:**
- `-l, --level <1|2|3>` - Adoption level | 採用等級 (1=基本, 2=推薦, 3=企業)
- `--lang <language>` - Language extension | 語言延伸 (csharp, php)
- `--framework <name>` - Framework extension | 框架延伸 (fat-free)
- `--locale <locale>` - Locale extension | 地區延伸 (zh-tw)
- `--no-skills` - Skip Claude Code Skills installation prompt | 跳過 Skills 安裝提示
- `-y, --yes` - Use defaults, skip interactive prompts | 使用預設值，跳過互動提示

**What it does | 功能說明:**
1. Detects your project's language and framework
2. Asks which standards to adopt
3. Copies reference documents to `.standards/`
4. Copies AI tool integrations (Cursor, Copilot, etc.)
5. Creates `.standards/manifest.json` for tracking

### `uds check`

Check adoption status of current project. | 檢查當前專案的採用狀態。

```bash
uds check
```

**Output includes | 輸出內容:**
- Installed version and level | 已安裝版本和等級
- File integrity check | 檔案完整性檢查
- Skills installation status | Skills 安裝狀態
- Coverage summary | 涵蓋範圍摘要
- Update availability | 更新可用性

### `uds update`

Update standards to the latest version. | 更新規範到最新版本。

```bash
# Interactive update
uds update

# Skip confirmation
uds update --yes
```

**Options | 選項:**
- `-y, --yes` - Skip confirmation prompts | 跳過確認提示

## Adoption Levels | 採用等級

| Level | Name | Description | 說明 |
|-------|------|-------------|------|
| 1 | Essential | Minimum viable standards | 最低可行標準 |
| 2 | Recommended | Professional quality for teams | 團隊專業品質 |
| 3 | Enterprise | Comprehensive standards | 全面企業標準 |

## Categories | 類別

| Category | Description | 說明 |
|----------|-------------|------|
| `skill` | Standards with Claude Code Skills | 包含 Skills 的規範 |
| `reference` | Reference documents (no Skills) | 參考文件（無 Skills）|
| `extension` | Language/framework-specific | 語言/框架特定 |
| `integration` | AI tool configurations | AI 工具配置 |
| `template` | Document templates | 文件模板 |

## Example Workflow | 範例工作流程

```bash
# 1. Clone and setup CLI (one-time)
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
cd ~

# 2. Navigate to your project
cd my-project

# 3. Initialize standards (interactive)
uds init
# ? Select adoption level: Level 2: Recommended
# ? Detected PHP project. Select style guides: PHP Style Guide
# ? Select AI tool integrations: Cursor, GitHub Copilot
# ? Install Claude Code Skills? Yes

# 4. Review what was created
ls .standards/
# checkin-standards.md
# spec-driven-development.md
# manifest.json

# 5. Check status anytime
uds check

# 6. Update when new version is available
uds update
```

## File Structure | 檔案結構

After initialization, your project will have: | 初始化後，您的專案將包含：

```
your-project/
├── .standards/
│   ├── manifest.json        # Tracks what was installed
│   ├── checkin-standards.md # Reference documents
│   ├── spec-driven-development.md
│   └── (other standards...)
├── .cursorrules             # AI tool integrations
├── .github/
│   └── copilot-instructions.md
└── ...
```

## Manifest File | 清單檔案

The `.standards/manifest.json` tracks your adoption: | `.standards/manifest.json` 追蹤您的採用狀態：

```json
{
  "version": "1.0.0",
  "upstream": {
    "repo": "AsiaOstrich/universal-dev-standards",
    "version": "2.0.0",
    "installed": "2025-12-23"
  },
  "level": 2,
  "standards": ["core/checkin-standards.md", ...],
  "extensions": ["extensions/languages/php-style.md"],
  "integrations": [".cursorrules"],
  "skills": {
    "installed": true,
    "version": "1.1.0"
  }
}
```

## Integration with Claude Code Skills | 與 Claude Code Skills 整合

This CLI works alongside [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills):
此 CLI 與 [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) 配合使用：

- **Skills** provide interactive AI assistance (commit messages, code review, etc.)
- **Skills** 提供互動式 AI 協助（commit 訊息、程式碼審查等）
- **Reference documents** provide guidelines for manual reference
- **參考文件**提供手動參考的指南

**Important | 重要**: For standards with Skills available, use the Skill OR copy the source document — never both.
對於有可用 Skills 的規範，請使用 Skill 或複製來源文件 — 切勿兩者同時使用。

## Related | 相關資源

- [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) - Source repository | 原始碼庫
- [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) - Claude Code Skills
- [Adoption Guide](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md) - Complete guidance | 完整指南

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Bilingual support (English + Chinese) |
| 1.0.0 | 2025-12-23 | Initial CLI documentation |

---

## License | 授權

This project uses a **dual-license** model:
本專案使用**雙授權**模式：

| Content Type | License | 說明 |
|-------------|---------|------|
| Documentation (`*.md`) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 文件 |
| Code (`*.js`, etc.) | [MIT](https://opensource.org/licenses/MIT) | 程式碼 |
