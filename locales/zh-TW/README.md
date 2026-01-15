---
source: ../../README.md
source_version: 3.5.0
translation_version: 3.5.0
last_synced: 2026-01-15
status: current
---

# 通用開發規範

> **Language**: [English](../../README.md) | 繁體中文 | [简体中文](../zh-CN/README.md)

**版本**: 3.5.0-beta.13
**最後更新**: 2026-01-13
**授權**: [雙重授權](../../LICENSE) (CC BY 4.0 + MIT)

> **🧪 Beta 注意事項**: 此版本包含實驗性功能，API 在正式版發布前可能會有變動。
> 如需穩定版本：`npm install universal-dev-standards@3.4.2`

### 功能可用性

| 功能 | 穩定版 (3.4.2) | Beta 版 (3.5.x) |
|------|:--------------:|:---------------:|
| **核心規範** (16 個檔案) | ✅ | ✅ |
| **Claude Code Skills** (15 個技能) | ✅ | ✅ |
| **CLI 工具** (`uds init`, `check`, `update`) | ✅ | ✅ |
| Hash-based 完整性檢查 | ✅ | ✅ |
| Plugin Marketplace 支援 | ✅ | ✅ |
| **方法論系統** | ❌ | ✅ 🧪 |
| `/methodology` 命令 | ❌ | ✅ 🧪 |
| `/bdd` 命令 | ❌ | ✅ 🧪 |
| TDD/BDD/SDD/ATDD 工作流程 | ❌ | ✅ 🧪 |

> 🧪 = 實驗性功能，API 可能會變動

---

## 目的

此儲存庫提供**與語言無關、與框架無關、與領域無關**的軟體專案文件標準。這些標準確保各種技術堆疊的一致性、品質和可維護性。

---

## 快速開始

### 透過 npm 安裝（推薦）

```bash
# 全域安裝
npm install -g universal-dev-standards

# 初始化您的專案
uds init
```

### 或使用 npx（免安裝）

```bash
npx universal-dev-standards init
```

### 手動設定

複製必要規範到您的專案：

```bash
cp core/anti-hallucination.md your-project/.standards/
cp core/checkin-standards.md your-project/.standards/
cp core/commit-message-guide.md your-project/.standards/
```

> **重要**：僅複製規範檔案並不會啟用 AI 輔助功能。您還必須在 AI 工具的配置檔案中引用這些規範（如 `CLAUDE.md`、`.cursorrules`）。建議使用 `uds init` 進行自動配置。

### AI 工具擴充（選用）

安裝 UDS 後，可選擇為您偏好的工具啟用 AI 輔助功能：

| AI 工具 | 配置檔案 | Skills | Commands |
|---------|----------|:------:|:--------:|
| Claude Code | `uds init` → `CLAUDE.md` | ✅ Marketplace / 檔案 | 內建 |
| OpenCode | `uds init` → `AGENTS.md` | ✅ `.opencode/skill/` | ✅ `.opencode/command/` |
| Cline | `uds init` → `.clinerules` | ✅ `.cline/skills/` | - |
| Roo Code | `uds init` → `.roorules` | ✅ `.roo/skills/` | ✅ `.roo/commands/` |
| OpenAI Codex | `uds init` → `AGENTS.md` | ✅ `.codex/skills/` | - |
| GitHub Copilot | `uds init` → `copilot-instructions.md` | ✅ `.github/skills/` | ✅ `.github/prompts/` |
| Windsurf | `uds init` → `.windsurfrules` | ✅ `.windsurf/skills/` | - |
| Gemini CLI | `uds init` → `GEMINI.md` | ✅ `.gemini/skills/` | ✅ `.gemini/commands/` (TOML) |
| Cursor | `uds init` → `.cursorrules` | ❌ 僅 Rules | - |
| Google Antigravity | `uds init` → `INSTRUCTIONS.md` | - | - |

> **v3.5.0 新功能**：`uds init` 支援多 Agent Skills 安裝。可同時選擇多個 agents 安裝 Skills。Gemini CLI 命令會自動轉換為 TOML 格式。

---

## 安裝方式

### CLI 工具（主要安裝）

CLI 工具是在專案中採用 UDS 的主要方式。

**npm（推薦）**
```bash
npm install -g universal-dev-standards
uds init    # 互動式初始化
uds check   # 檢查採用狀態
uds update  # 更新至最新版本
uds skills  # 列出已安裝的技能
```

**npx（免安裝）**
```bash
npx universal-dev-standards init
```

**Beta 版本（最新功能）**
```bash
# 全域安裝 beta 版
npm install -g universal-dev-standards@beta

# 或安裝特定版本
npm install -g universal-dev-standards@3.5.0-beta.13

# 或透過 npx
npx universal-dev-standards@beta init
```

> **注意**：Beta 版本包含實驗性功能，例如方法論系統（`/methodology`、`/bdd`）。詳見[功能可用性](#功能可用性)。

**克隆並連結（開發用）**

macOS / Linux：
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

Windows (PowerShell)：
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli; npm install; npm link
```

請參閱 [CLI README](../../cli/README.md) 了解詳細使用方法、[Windows 指南](docs/WINDOWS-GUIDE.md) 獲得 Windows 特定說明，以及[作業流程](docs/OPERATION-WORKFLOW.md)了解專案維護與開發流程。

---

### AI 工具配置

每個 AI 工具使用配置檔案來定義專案特定規則。`uds init` 會自動產生這些檔案：

| 工具 | 配置檔案 | 位置 |
|------|----------|------|
| Claude Code | `CLAUDE.md` | 專案根目錄 |
| OpenCode | `AGENTS.md` | 專案根目錄 |
| OpenAI Codex | `AGENTS.md` | 專案根目錄 |
| Cursor | `.cursorrules` | 專案根目錄 |
| Windsurf | `.windsurfrules` | 專案根目錄 |
| Cline | `.clinerules` | 專案根目錄 |
| GitHub Copilot | `copilot-instructions.md` | `.github/` |
| Google Antigravity | `INSTRUCTIONS.md` | 專案根目錄 |
| Gemini CLI | `GEMINI.md` | 專案根目錄 |

或從 `integrations/` 目錄手動複製。

---

### Agent Skills 安裝

Agent Skills 是增強 AI 輔助開發的互動式指令（`/commit`、`/tdd`、`/review` 等）。Skills 遵循 [Agent Skills 標準](https://agentskills.io)，可跨多個 AI 工具使用。

**包含的技能（15 個）：** ai-collaboration-standards、changelog-guide、code-review-assistant、commit-standards、documentation-guide、error-code-guide、git-workflow-guide、logging-guide、project-structure-guide、release-standards、requirement-assistant、spec-driven-dev、tdd-assistant、test-coverage-assistant、testing-guide

#### 支援的工具

| 工具 | Skills 支援 | 推薦方式 |
|------|------------|----------|
| Claude Code | ✅ 完整 | Plugin Marketplace |
| OpenCode | ✅ 完整 | UDS CLI |
| （更多工具即將支援） | - | - |

#### 方法一：Claude Code Plugin Marketplace

Claude Code 用戶可透過 Plugin Marketplace 最簡單地安裝：

```bash
/plugin install universal-dev-standards@asia-ostrich
```

**優點：**
- 單一指令安裝
- 新版本發布時自動更新
- 所有 15 個技能立即載入

**從 v3.2.x 遷移？** 如果您使用舊的 marketplace 名稱：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

#### 方法二：UDS CLI（推薦用於 OpenCode）

OpenCode 和其他工具，請使用 UDS CLI：

```bash
# 全域安裝 UDS CLI
npm install -g universal-dev-standards

# 初始化專案 - 選擇您的 AI 工具
uds init

# Skills 會安裝到 .claude/skills/
# OpenCode 會自動偵測此路徑 ✅
```

使用 `uds check` 驗證安裝狀態和 skills 相容性。

#### 方法三：手動安裝

克隆並直接複製 skills：

macOS / Linux：
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git /tmp/uds
cp -r /tmp/uds/skills/claude-code/* ~/.claude/skills/    # 全域
# 或：cp -r /tmp/uds/skills/claude-code/* .claude/skills/  # 專案
rm -rf /tmp/uds
```

Windows (PowerShell)：
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git $env:TEMP\uds
Copy-Item -Recurse $env:TEMP\uds\skills\claude-code\* $env:USERPROFILE\.claude\skills\
Remove-Item -Recurse $env:TEMP\uds
```

#### 社群 Marketplace

從社群平台發現和安裝 skills：

- **[n-skills](https://github.com/numman-ali/n-skills)** - 精選 marketplace，支援 Claude Code、OpenCode、Cursor 等
- **[claude-plugins.dev](https://claude-plugins.dev/skills)** - 從 GitHub 自動索引的技能發現
- **[agentskills.io](https://agentskills.io)** - 官方 Agent Skills 規範

#### 腳本安裝（已棄用）

> ⚠️ 腳本安裝正在逐步淘汰。請改用 Plugin Marketplace 或 UDS CLI。

macOS / Linux：
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/skills/claude-code && ./install.sh
```

Windows (PowerShell)：
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\skills\claude-code; .\install.ps1
```

---

### 多 AI 工具支援

| AI 工具 | 狀態 | 路徑 | 平台測試 |
|---------|------|------|----------|
| Claude Code | ✅ 完成 | `skills/claude-code/` | macOS ✅ |
| OpenCode | 🧪 測試中 | `integrations/opencode/` | macOS 🧪 |
| GitHub Copilot | 🧪 測試中 | `integrations/github-copilot/` | macOS 🧪 |
| Cursor | ⏳ 規劃中 | `integrations/cursor/` | - |
| Windsurf | ⏳ 規劃中 | `integrations/windsurf/` | - |
| Cline | ⏳ 規劃中 | `integrations/cline/` | - |
| Google Antigravity | ⏳ 規劃中 | `integrations/google-antigravity/` | - |
| OpenAI Codex | ⏳ 規劃中 | `integrations/codex/` | - |
| Gemini CLI | ⏳ 規劃中 | `integrations/gemini-cli/` | - |

### 平台支援

| 平台 | CLI 工具 | Skills | 備註 |
|------|----------|--------|------|
| **macOS** | ✅ 已測試 | ✅ 已測試 | 主要開發平台 |
| **Linux** | ⚠️ 未測試 | ⚠️ 未測試 | 預期可運作（基於 Node.js） |
| **Windows** | ⚠️ 未測試 | ⚠️ 未測試 | 提供 PowerShell 腳本 |

> **注意**：UDS CLI 基於 Node.js，應可在所有平台運作。平台測試指的是在該作業系統上與 AI 工具搭配使用的功能驗證。詳細狀態請參閱 [AI Agent 規劃](docs/AI-AGENT-ROADMAP.md)。

---

## 核心原則

1. **通用適用性** - 標準適用於任何程式語言、框架或領域
2. **模組化設計** - 選擇與您專案相關的標準
3. **可擴充架構** - 可使用語言特定、框架特定或領域特定規則進行擴充
4. **基於證據** - 標準源自業界最佳實務與實際驗證
5. **自包含** - 每個標準都可獨立使用，無需依賴其他標準

---

## 內容概覽

```
universal-dev-standards/
├── core/                    # 核心通用標準（16 個檔案）
├── ai/                      # AI 優化標準（.ai.yaml）
├── options/                 # 人類可讀選項指南
├── skills/                  # AI 工具技能（Claude Code 等）
├── extensions/              # 語言/框架/領域特定
├── templates/               # 文件範本
├── integrations/            # 工具設定
├── cli/                     # CLI 工具（uds 指令）
├── locales/                 # 翻譯（zh-TW、zh-CN）
└── adoption/                # 採用指南
```

請參閱下方的[詳細目錄結構](#詳細目錄結構)。

---

## 規範等級

### 等級 1：必要（最小可行標準）

**每個專案必須具備**：
- `anti-hallucination.md` - AI 協作指南
- `checkin-standards.md` - 提交前的品質門檻
- `commit-message-guide.md` - 標準化的 commit 格式
- `spec-driven-development.md` - 規格驅動開發標準

**預估設定時間**：30 分鐘

---

### 等級 2：推薦（專業品質）

**包含等級 1 +**：
- `git-workflow.md` - 分支策略
- `code-review-checklist.md` - 審查指南
- `versioning.md` - 版本管理
- `changelog-standards.md` - 變更日誌撰寫指南
- `testing-standards.md` - 測試金字塔（UT/IT/ST/E2E）
- 語言特定的風格指南（例如 `csharp-style.md`）

**預估設定時間**：2 小時

---

### 等級 3：全面（企業級）

**包含等級 2 +**：
- `documentation-structure.md` - 文件組織
- 框架特定標準（例如 `dotnet.md`）
- 領域特定標準（例如 `fintech.md`）
- OpenSpec 整合用於規格驅動開發
- 完整範本套件

**預估設定時間**：1-2 天

---

## AI 優化標準

### 雙格式架構

| 格式 | 位置 | 使用場景 | Token 使用量 |
|------|------|----------|--------------|
| **人類可讀** | `core/`、`options/` | 文件、入職、參考 | 標準 |
| **AI 優化** | `ai/` | AI 助手、自動化、CLAUDE.md | 減少約 80% |

### 使用 AI 優化標準

```yaml
# 在 CLAUDE.md 或系統提示中引用
standards:
  source: ai/standards/
  options:
    workflow: ai/options/git-workflow/github-flow.ai.yaml
    commit_language: ai/options/commit-message/english.ai.yaml
```

### 可用選項

| 類別 | 選項 |
|------|------|
| **Git 工作流** | `github-flow`、`gitflow`、`trunk-based`、`squash-merge`、`merge-commit`、`rebase-ff` |
| **Commit 語言** | `english`、`traditional-chinese`、`bilingual` |
| **測試層級** | `unit`、`integration`、`system`、`e2e` |
| **專案結構** | `nodejs`、`python`、`dotnet`、`java`、`go` |

---

## 規範涵蓋範圍

| 規範 | Skill 可用 | 採用方式 |
|------|-----------|----------|
| anti-hallucination.md | ai-collaboration-standards | 安裝 Skill |
| commit-message-guide.md | commit-standards | 安裝 Skill |
| code-review-checklist.md | code-review-assistant | 安裝 Skill |
| git-workflow.md | git-workflow-guide | 安裝 Skill |
| versioning.md + changelog-standards.md | release-standards | 安裝 Skill |
| testing-standards.md | testing-guide | 安裝 Skill |
| documentation-structure.md | documentation-guide | 安裝 Skill |
| requirement templates | requirement-assistant | 安裝 Skill |
| error-code-standards.md | error-code-guide | 安裝 Skill |
| logging-standards.md | logging-guide | 安裝 Skill |
| test-driven-development.md | tdd-assistant | 安裝 Skill |
| test-completeness-dimensions.md | test-coverage-assistant | 安裝 Skill |
| **checkin-standards.md** | - | 複製到專案 |
| **spec-driven-development.md** | - | 複製到專案 |
| **project-structure.md** | - | 複製到專案 |
| **documentation-writing-standards.md** | - | 複製到專案 |

> **重要**：對於有 Skill 的規範，使用 Skill 或複製原始文件 — **擇一即可**。

請參閱 [採用指南](adoption/ADOPTION-GUIDE.md) 獲得完整指導。

---

## 自訂指南

### 自訂內容要寫在哪裡

| 自訂類型 | 檔案 | 位置 |
|---------|------|------|
| AI 工具規則與排除 | `CLAUDE.md`、`.cursorrules` 等 | 專案根目錄 |
| 專案標準覆寫 | `PROJECT-STANDARDS.md` | 專案根目錄 |
| 複製的核心規範 | `docs/standards/` | 您的專案 |

### 調整規範

1. **語言選擇**：英文、繁體中文、簡體中文 commit 類型
2. **工具設定**：`npm run build`、`dotnet build`、`mvn package`
3. **閾值調整**：測試覆蓋率 80%、最大方法長度 50 行
4. **範圍定義**：為您的模組定義允許的 commit 範圍

### 排除標準

1. **在 `uds init` 時**：互動式選擇需要的標準
2. **選擇性採用**：只複製特定檔案
3. **AI 工具排除**：在 `CLAUDE.md` 或 `.cursorrules` 中新增排除模式
4. **專案層級覆寫**：建立 `PROJECT-STANDARDS.md` 記錄偏差

---

## 多語言支援

### Commit 訊息語言範例

**英文**：
```
feat(auth): Add OAuth2 support
fix(api): Resolve memory leak
```

**繁體中文**：
```
新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏
```

**簡體中文**：
```
新增(认证): 实现 OAuth2 支持
修正(API): 解决内存泄漏
```

---

## 工具整合

### Git Hooks

```bash
npm install --save-dev @commitlint/{cli,config-conventional} husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

### CI/CD 整合

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx commitlint --from HEAD~1 --to HEAD --verbose
      - run: npm run build
      - run: npm test -- --coverage
      - run: npm run lint
```

### OpenSpec 整合

```bash
cp -r integrations/openspec/ your-project/openspec/
mkdir -p your-project/.claude/commands/
cp integrations/openspec/commands/* your-project/.claude/commands/
```

---

## 範例

### 範例 1：.NET Web API 專案

```
核心規範：anti-hallucination.md、checkin-standards.md、commit-message-guide.md、git-workflow.md（GitFlow）
擴充：languages/csharp-style.md、frameworks/dotnet.md
範本：CLAUDE.md（為 .NET 自訂）、README.md、CONTRIBUTING.md
```

### 範例 2：React SPA 專案

```
核心規範：anti-hallucination.md、checkin-standards.md、commit-message-guide.md、git-workflow.md（GitHub Flow）
擴充：languages/typescript-style.md、frameworks/react.md
工具：ESLint + Prettier、Husky + commitlint、Jest + React Testing Library
```

### 範例 3：Python ML 專案

```
核心規範：anti-hallucination.md、checkin-standards.md、commit-message-guide.md、git-workflow.md（主幹開發）
擴充：languages/python-style.md、domains/machine-learning.md
工具：Black、pylint、pytest、mypy
```

---

## 貢獻

### 如何貢獻

1. **建議改善**：開啟 issue 描述問題和建議的解決方案
2. **新增範例**：提交您如何應用這些標準的範例
3. **擴展標準**：貢獻新的語言/框架/領域擴充
4. **翻譯**：協助將標準翻譯成其他語言

### 貢獻指南

所有貢獻必須：
- 維持語言/框架/領域無關性（對於核心規範）
- 在至少 2 個不同情境中包含範例
- 遵循現有的文件結構
- 以 CC BY 4.0 授權

---

## 延伸閱讀

### 相關標準與框架

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

### 書籍與文章

- **The Art of Readable Code** by Boswell & Foucher
- **Clean Code** by Robert C. Martin
- **The Pragmatic Programmer** by Hunt & Thomas
- **Accelerate** by Forsgren, Humble, and Kim

---

## 版本歷史

| 版本 | 日期 | 重點 |
|------|------|------|
| 3.2.2 | 2026-01-06 | 新增 `uds skills` 指令；棄用手動安裝腳本 |
| 3.2.0 | 2026-01-02 | Plugin Marketplace 支援；CLI 增強 |
| 3.0.0 | 2025-12-30 | 完整 Windows 支援；AI 優化標準；npm 發布 |

請參閱 [CHANGELOG.md](CHANGELOG.md) 獲得完整版本歷史。

---

## 授權

| 組件 | 授權 |
|------|------|
| 文件（`core/`、`extensions/`、`templates/` 等）| [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| CLI 工具（`cli/`）| [MIT](../../cli/LICENSE) |

兩種授權都是寬鬆型授權，允許商業使用、修改與再發布。請參閱 [LICENSE](../../LICENSE) 獲取完整詳情。

---

## 社群

- **Issues**：回報錯誤或建議改善
- **Discussions**：分享您如何使用這些標準
- **Examples**：提交您的專案作為範例

---

## 採用標準檢查清單

- [ ] 選擇安裝方式（Marketplace / npm / 手動）
- [ ] 執行 `uds init` 或複製核心規範
- [ ] 視需要新增語言/框架擴充
- [ ] 在 CONTRIBUTING.md 中設定專案特定設定
- [ ] 設定 Git hooks（commitlint, pre-commit）
- [ ] 在 CI/CD 中整合品質門檻
- [ ] 對團隊進行標準培訓
- [ ] 建立遵循標準的第一個 commit

---

**準備好提升專案品質了嗎？** 從上方的快速開始開始！

---

**由開源社群用愛維護**

---

## 詳細目錄結構

```
universal-dev-standards/
├── core/                                  # 核心通用標準（16 個檔案）
│   ├── anti-hallucination.md             # AI 協作指南
│   ├── changelog-standards.md            # 變更日誌撰寫指南
│   ├── checkin-standards.md              # 程式碼簽入品質門檻
│   ├── code-review-checklist.md          # 程式碼審查指南
│   ├── commit-message-guide.md           # Commit 訊息規範
│   ├── documentation-structure.md        # 文件組織
│   ├── documentation-writing-standards.md # 文件撰寫指南
│   ├── error-code-standards.md           # 錯誤碼規範
│   ├── git-workflow.md                   # Git 分支策略
│   ├── logging-standards.md              # 日誌標準
│   ├── project-structure.md              # 專案目錄規範
│   ├── spec-driven-development.md        # SDD 方法論與標準
│   ├── test-completeness-dimensions.md   # 測試完整度維度
│   ├── test-driven-development.md        # TDD 方法論
│   ├── testing-standards.md              # 測試標準（UT/IT/ST/E2E）
│   └── versioning.md                     # 語意化版本控制指南
│
├── ai/                             # AI 優化標準（v2.3.0）
│   ├── standards/                 # Token 高效 YAML 格式（減少約 80%）
│   │   ├── git-workflow.ai.yaml
│   │   ├── commit-message.ai.yaml
│   │   ├── testing.ai.yaml
│   │   └── ...
│   └── options/                   # 可配置選項
│       ├── git-workflow/          # github-flow、gitflow、trunk-based 等
│       ├── commit-message/        # english、traditional-chinese、bilingual
│       ├── testing/               # unit、integration、system、e2e
│       └── project-structure/     # nodejs、python、dotnet、java、go
│
├── options/                        # 人類可讀選項指南
│   ├── git-workflow/              # 詳細工作流程文件
│   ├── commit-message/            # Commit 語言指南
│   ├── testing/                   # 測試層級指南
│   └── project-structure/         # 語言特定專案結構
│
├── skills/                         # AI 工具技能（v2.1.0）
│   ├── claude-code/               # Claude Code Skills（15 個技能）
│   ├── cursor/                    # Cursor Rules（規劃中）
│   ├── windsurf/                  # Windsurf Rules（規劃中）
│   ├── cline/                     # Cline Rules（規劃中）
│   ├── copilot/                   # GitHub Copilot（規劃中）
│   └── _shared/                   # 共享範本
│
├── extensions/                     # 選用擴充
│   ├── languages/                 # 語言特定標準
│   │   ├── csharp-style.md        # C# 編碼規範
│   │   └── php-style.md           # PHP 8.1+ 風格指南
│   ├── frameworks/                # 框架特定標準
│   │   └── fat-free-patterns.md   # Fat-Free Framework 模式
│   ├── locales/                   # 地區特定標準
│   │   └── zh-tw.md               # 繁體中文
│   └── domains/                   # 領域特定標準
│       └── （即將推出）
│
├── templates/                      # 專案文件範本
│   ├── requirement-*.md           # 需求範本
│   └── migration-template.md      # 遷移計畫範本
│
├── integrations/                   # 工具設定檔
│   ├── cline/                     # Cline .clinerules
│   ├── cursor/                    # Cursor .cursorrules
│   ├── github-copilot/            # Copilot 指示
│   ├── google-antigravity/        # Antigravity 整合
│   ├── windsurf/                  # Windsurf .windsurfrules
│   └── openspec/                  # OpenSpec 框架
│
├── cli/                           # CLI 工具
│   └── （uds 指令）
│
├── locales/                       # 翻譯
│   ├── zh-TW/                     # 繁體中文
│   └── zh-CN/                     # 簡體中文
│
└── adoption/                       # 採用指南
    └── ADOPTION-GUIDE.md
```
