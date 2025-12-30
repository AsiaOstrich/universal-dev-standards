---
source: ../../README.md
source_version: 3.0.0
translation_version: 3.0.0
last_synced: 2025-12-30
status: current
---

# 通用開發規範

> **Language**: [English](../../README.md) | 繁體中文

**版本**: 3.0.0
**最後更新**: 2025-12-30
**授權**: [雙重授權](../../LICENSE) (CC BY 4.0 + MIT)

---

## 📋 目的

此儲存庫提供**與語言無關、與框架無關、與領域無關**的軟體專案文件標準。這些標準確保各種技術堆疊的一致性、品質和可維護性。

---

## 🎯 核心原則

1. **通用適用性** - 標準適用於任何程式語言、框架或領域
2. **模組化設計** - 選擇與您專案相關的標準
3. **可擴充架構** - 可使用語言特定、框架特定或領域特定規則進行擴充
4. **基於證據** - 標準源自業界最佳實務與實際驗證
5. **自包含** - 每個標準都可獨立使用，無需依賴其他標準

---

## 📦 內容概覽

```
universal-dev-standards/
├── core/                           # 核心通用標準
│   ├── anti-hallucination.md      # AI 協作指南
│   ├── checkin-standards.md       # 程式碼簽入品質門檻
│   ├── commit-message-guide.md    # Commit 訊息規範
│   ├── spec-driven-development.md # SDD 方法論與標準
│   ├── git-workflow.md            # Git 分支策略
│   ├── code-review-checklist.md   # 程式碼審查指南
│   ├── documentation-structure.md # 文件組織
│   ├── project-structure.md       # 專案目錄規範
│   ├── versioning.md              # 語意化版本控制指南
│   ├── changelog-standards.md     # 變更日誌撰寫指南
│   └── testing-standards.md       # 測試標準 (UT/IT/ST/E2E)
│
├── skills/                         # ✅ 新增：AI 工具技能 (v2.1.0)
│   ├── claude-code/               # Claude Code Skills
│   ├── cursor/                    # Cursor Rules（規劃中）
│   ├── windsurf/                  # Windsurf Rules（規劃中）
│   ├── cline/                     # Cline Rules（規劃中）
│   ├── copilot/                   # GitHub Copilot（規劃中）
│   └── _shared/                   # 共享範本
│
├── extensions/                     # 選用擴充
│   ├── languages/                 # 語言特定標準
│   ├── frameworks/                # 框架特定標準
│   ├── locales/                   # 地區特定標準
│   └── domains/                   # 領域特定標準
│
├── templates/                      # 專案文件範本
├── integrations/                   # 工具設定檔
├── cli/                           # CLI 工具
└── adoption/                       # 採用指南
```

---

## 🤖 AI 優化標準（v2.3.0 新增）

### 雙格式架構

本專案現在提供兩種格式的標準，適用於不同使用場景：

| 格式 | 位置 | 使用場景 | Token 使用量 |
|------|------|----------|--------------|
| **人類可讀** | `core/`、`options/` | 文件、入職、參考 | 標準 |
| **AI 優化** | `ai/` | AI 助手、自動化、CLAUDE.md | 減少約 80% |

### 使用 AI 優化標準

**用於 AI 助手（Claude、Cursor 等）**：
```yaml
# 在 CLAUDE.md 或系統提示中引用
standards:
  source: ai/standards/
  options:
    workflow: ai/options/git-workflow/github-flow.ai.yaml
    commit_language: ai/options/commit-message/english.ai.yaml
    test_levels:
      - ai/options/testing/unit-testing.ai.yaml
      - ai/options/testing/integration-testing.ai.yaml
```

**使用 CLI 選擇格式**：
```bash
# 使用 AI 格式初始化（推薦用於 AI 輔助專案）
uds init --format ai

# 使用兩種格式初始化
uds init --format both

# 設定特定選項
uds init --workflow github-flow --commit-lang english --test-levels unit,integration
```

### 可用選項

| 類別 | 選項 |
|------|------|
| **Git 工作流** | `github-flow`、`gitflow`、`trunk-based`、`squash-merge`、`merge-commit`、`rebase-ff` |
| **Commit 語言** | `english`、`traditional-chinese`、`bilingual` |
| **測試層級** | `unit`、`integration`、`system`、`e2e` |
| **專案結構** | `nodejs`、`python`、`dotnet`、`java`、`go` |

### 翻譯

AI 優化標準提供以下語言版本：
- 英文：`ai/`
- 繁體中文：`locales/zh-TW/ai/`

---

## 🔗 規範採用

### 搭配 Claude Code 使用（推薦）

Skills 現已整合在本儲存庫中。安裝 Claude Code Skills 獲得互動式 AI 輔助：

**macOS / Linux / Git Bash：**
```bash
# 複製並安裝 skills
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/skills/claude-code
./install.sh
```

**Windows (PowerShell)：**
```powershell
# 複製並安裝 skills
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\skills\claude-code
.\install.ps1
```

### 多 AI 工具支援（即將推出）

我們正在擴展對更多 AI 程式碼助手的支援：

| AI 工具 | 狀態 | 路徑 |
|---------|------|------|
| Claude Code | ✅ 完成 | `skills/claude-code/` |
| Cursor | 🚧 規劃中 | `skills/cursor/` |
| Windsurf | 🚧 規劃中 | `skills/windsurf/` |
| Cline | 🚧 規劃中 | `skills/cline/` |
| GitHub Copilot | 🚧 規劃中 | `skills/copilot/` |

### 規範涵蓋範圍

| 規範 | Skill 可用 | 採用方式 |
|------|-----------|----------|
| anti-hallucination.md | ✅ ai-collaboration-standards | 安裝 Skill |
| commit-message-guide.md | ✅ commit-standards | 安裝 Skill |
| code-review-checklist.md | ✅ code-review-assistant | 安裝 Skill |
| git-workflow.md | ✅ git-workflow-guide | 安裝 Skill |
| versioning.md + changelog-standards.md | ✅ release-standards | 安裝 Skill |
| testing-standards.md | ✅ testing-guide | 安裝 Skill |
| documentation-structure.md | ✅ documentation-guide | 安裝 Skill |
| requirement templates | ✅ requirement-assistant | 安裝 Skill |
| **checkin-standards.md** | ❌ | 複製到專案 |
| **spec-driven-development.md** | ❌ | 複製到專案 |
| **documentation-writing-standards.md** | ❌ | 複製到專案 |
| **project-structure.md** | ❌ | 複製到專案 |
| 語言/框架擴充 | ❌ | 視需要複製 |
| AI 工具整合 | ❌ | 複製到工具位置 |

> **重要**：對於有 Skill 的規範，使用 Skill 或複製原始文件 — **擇一即可，不要兩者都做**。

📖 請參閱 [採用指南](adoption/ADOPTION-GUIDE.md) 獲得完整指導和檢查清單。

### 使用 CLI 工具

**選項一：npm（推薦）**
```bash
# 全域安裝
npm install -g universal-dev-standards

# 在您的專案目錄中
uds init    # 互動式初始化
uds check   # 檢查採用狀態
uds update  # 更新至最新版本
```

**選項二：npx（免安裝）**
```bash
npx universal-dev-standards init
npx universal-dev-standards check
```

**選項三：克隆並連結（開發用）**

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

📖 請參閱 [CLI README](../../cli/README.md) 了解詳細的 CLI 使用方法和所有可用命令。
📖 請參閱 [Windows 指南](docs/WINDOWS-GUIDE.md) 獲得 Windows 特定說明。

---

## 🚀 快速開始

### 步驟 1：選擇核心規範

**最小設定（必要）**：
```bash
# 複製必要規範到您的專案
cp core/anti-hallucination.md your-project/.standards/
cp core/checkin-standards.md your-project/.standards/
cp core/commit-message-guide.md your-project/.standards/
```

**推薦設定**：
```bash
# 複製所有核心規範
cp core/*.md your-project/.standards/
```

---

### 步驟 2：新增語言/框架擴充

**對於 .NET 專案**：
```bash
cp extensions/languages/csharp-style.md your-project/.standards/
cp extensions/frameworks/dotnet.md your-project/.standards/
```

**對於 TypeScript 專案**：
```bash
cp extensions/languages/typescript-style.md your-project/.standards/
```

**對於 Python 專案**：
```bash
cp extensions/languages/python-style.md your-project/.standards/
```

---

### 步驟 3：設定專案特定設定

編輯 `your-project/CONTRIBUTING.md` 或 `your-project/.standards/PROJECT-CONFIG.md`：

```markdown
## 文件標準設定

### Commit 訊息語言
- 類型語言：**英文**（feat, fix, refactor）
- 主旨語言：**英文**

### Git 工作流程
- 策略：**GitFlow**
- 主要分支：`main`, `develop`
- 功能分支前綴：`feature/`
- 熱修復分支前綴：`hotfix/`

### 程式碼品質工具
- Linter：ESLint
- Formatter：Prettier
- 測試框架：Jest
- 最低測試覆蓋率：80%

### 簽入要求
- ✅ 建置必須通過
- ✅ 所有測試必須通過
- ✅ Linter 必須無錯誤
- ✅ 測試覆蓋率 ≥80%
```

---

### 步驟 4（選用）：使用範本

```bash
# 初始化專案文件
cp templates/README.md.template your-project/README.md
cp templates/CONTRIBUTING.md.template your-project/CONTRIBUTING.md
cp templates/CHANGELOG.md.template your-project/CHANGELOG.md

# 替換範本中的佔位符來自訂
# [PROJECT_NAME] → 您的專案名稱
# [DESCRIPTION] → 您的專案描述
# 等等。
```

---

## 📊 規範等級

### 🟢 等級 1：必要（最小可行標準）

**每個專案必須具備**：
- ✅ `anti-hallucination.md` - AI 協作指南
- ✅ `checkin-standards.md` - 提交前的品質門檻
- ✅ `commit-message-guide.md` - 標準化的 commit 格式
- ✅ `spec-driven-development.md` - 規格驅動開發標準

**預估設定時間**：30 分鐘
**推薦對象**：所有專案，特別是 AI 輔助開發

---

### 🟡 等級 2：推薦（專業品質）

**包含等級 1 +**：
- ✅ `git-workflow.md` - 分支策略
- ✅ `code-review-checklist.md` - 審查指南
- ✅ `versioning.md` - 版本管理
- ✅ `changelog-standards.md` - 變更日誌撰寫指南
- ✅ `testing-standards.md` - 測試金字塔（UT/IT/ST/E2E）
- ✅ 語言特定的風格指南（例如 `csharp-style.md`）

**預估設定時間**：2 小時
**推薦對象**：團隊專案、開源專案

---

### 🔵 等級 3：全面（企業級）

**包含等級 2 +**：
- ✅ `documentation-structure.md` - 文件組織
- ✅ 框架特定標準（例如 `dotnet.md`）
- ✅ 領域特定標準（例如 `fintech.md`）
- ✅ OpenSpec 整合用於規格驅動開發
- ✅ 完整範本套件（README、CONTRIBUTING、CHANGELOG、API 文件）

**預估設定時間**：1-2 天
**推薦對象**：企業專案、受監管產業、大型團隊

---

## 🔧 自訂指南

### 自訂內容要寫在哪裡

| 自訂類型 | 檔案 | 位置 |
|---------|------|------|
| AI 工具規則與排除 | `CLAUDE.md`、`.cursorrules`、`.windsurfrules`、`.clinerules` | 專案根目錄 |
| 專案標準覆寫 | `PROJECT-STANDARDS.md` | 專案根目錄 |
| 複製的核心規範 | `docs/standards/` 或自訂位置 | 您的專案 |

### 調整規範以符合專案需求

所有核心規範都包含 **「專案特定自訂」** 區段。可透過以下方式自訂：

1. **語言選擇**
   ```markdown
   ## Commit 訊息語言選擇
   - 英文：feat, fix, refactor
   - 繁體中文：新增, 修正, 重構
   - 西班牙文：característica, corrección, refactorización
   ```

2. **工具設定**
   ```markdown
   ## 建置指令
   ```bash
   npm run build  # Node.js 專案
   dotnet build   # .NET 專案
   mvn package    # Java 專案
   ```
   ```

3. **閾值調整**
   ```markdown
   ## 品質閾值
   - 測試覆蓋率：80%（根據專案成熟度調整）
   - 最大方法長度：50 行（根據語言調整）
   - 最大循環複雜度：10（標準）
   ```

4. **範圍定義**
   ```markdown
   ## 允許的 Commit 範圍
   - auth：認證模組
   - payment：支付處理
   - [在此新增您的模組]
   ```

### 排除標準

不是每個標準都適合每個專案。使用以下方法排除標準：

1. **在 `uds init` 時**：只選擇您需要的標準
   ```bash
   uds init
   # 互動式提示讓您選擇：
   # - 要採用哪些核心標準
   # - 要設定哪些 AI 工具
   # - 要安裝哪些 Skills（或完全跳過）
   ```

2. **選擇性採用**：只複製需要的檔案
   ```bash
   # 不使用完整 init，只複製特定標準
   cp core/commit-message-guide.md your-project/docs/
   cp core/code-review-checklist.md your-project/docs/
   ```

3. **AI 工具整合排除**：在 AI 工具設定檔中指定排除模式

   | AI 工具 | 設定檔 | 位置 |
   |---------|--------|------|
   | Claude Code | `CLAUDE.md` | 專案根目錄 |
   | Cursor | `.cursorrules` | 專案根目錄 |
   | Windsurf | `.windsurfrules` | 專案根目錄 |
   | Cline | `.clinerules` | 專案根目錄 |

   ```markdown
   # 範例：新增至 CLAUDE.md 或 .cursorrules
   ## 排除的標準
   SDD 命令可在以下情況跳過：
   - 微小的 bug 修復（< 5 行）
   - 僅文件變更
   - 設定檔更新
   ```

4. **專案層級覆寫**：在專案根目錄建立 `PROJECT-STANDARDS.md` 記錄偏差
   ```markdown
   # PROJECT-STANDARDS.md（在專案根目錄）

   ## 排除的標準
   - `testing-completeness.md` - 使用舊版測試框架
   - `api-spec.md` - 內部工具，無外部 API

   ## 修改的閾值
   - 測試覆蓋率：60%（舊有程式碼遷移中）
   ```

### 可排除項目

| 類別 | 可排除項目 |
|------|-----------|
| **核心標準** | 13 個標準中的任何一個，根據專案需求 |
| **AI Skills** | 個別 skill 或整個 skill 安裝 |
| **整合** | 特定 AI 工具設定 |
| **範本** | README、CHANGELOG、CONTRIBUTING 範本 |

---

## 🌍 多語言支援

### Commit 訊息語言範例

**英文**：
```
feat(auth): Add OAuth2 support
fix(api): Resolve memory leak
docs(readme): Update installation guide
```

**繁體中文**：
```
新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏
文件(README): 更新安裝指南
```

**西班牙文**：
```
característica(auth): Agregar soporte OAuth2
corrección(api): Resolver fuga de memoria
documentación(readme): Actualizar guía de instalación
```

**日文**：
```
機能(認証): OAuth2サポートを追加
修正(API): メモリリークを解決
文書(README): インストールガイドを更新
```

---

## 🛠️ 工具整合

### Git Hooks

**安裝 commitlint**（Node.js 專案）：
```bash
npm install --save-dev @commitlint/{cli,config-conventional}
npm install --save-dev husky

# 初始化 husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

**設定 commitlint**：
```javascript
// .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'perf', 'build', 'ci', 'chore']
    ]
  }
};
```

---

### CI/CD 整合

**GitHub Actions 範例**：
```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate Commit Messages
        run: npx commitlint --from HEAD~1 --to HEAD --verbose

      - name: Build
        run: npm run build

      - name: Test
        run: npm test -- --coverage

      - name: Lint
        run: npm run lint

      - name: Check Coverage
        run: |
          coverage=$(npx nyc report --reporter=text-summary | grep 'Lines' | awk '{print $3}' | sed 's/%//')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80%"
            exit 1
          fi
```

---

### OpenSpec 整合

對於規格驅動開發，整合 OpenSpec：

```bash
# 複製 OpenSpec 框架
cp -r integrations/openspec/ your-project/openspec/

# 建立 .claude/commands 目錄
mkdir -p your-project/.claude/commands/
cp integrations/openspec/commands/* your-project/.claude/commands/
```

**使用方式**：
```bash
# 提出新變更
/openspec proposal "Add user authentication"

# 套用已批准的規格
/openspec apply specs/auth-feature

# 封存已完成的規格
/openspec archive specs/auth-feature
```

---

## 📚 範例

### 範例 1：.NET Web API 專案

**規範設定**：
```
✅ 核心規範
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md（英文類型）
   - git-workflow.md（GitFlow）

✅ 擴充
   - languages/csharp-style.md
   - frameworks/dotnet.md

✅ 範本
   - CLAUDE.md（為 .NET 自訂）
   - README.md
   - CONTRIBUTING.md
```

請參閱 `examples/dotnet-web-api/` 獲取完整實作。

---

### 範例 2：React SPA 專案

**規範設定**：
```
✅ 核心規範
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md（英文類型）
   - git-workflow.md（GitHub Flow）

✅ 擴充
   - languages/typescript-style.md
   - frameworks/react.md

✅ 工具
   - ESLint + Prettier
   - Husky + commitlint
   - Jest + React Testing Library
```

請參閱 `examples/react-spa/` 獲取完整實作。

---

### 範例 3：Python ML 專案

**規範設定**：
```
✅ 核心規範
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md（英文類型）
   - git-workflow.md（主幹開發）

✅ 擴充
   - languages/python-style.md
   - domains/machine-learning.md

✅ 工具
   - Black（格式化）
   - pylint（Linter）
   - pytest（測試）
   - mypy（型別檢查）
```

請參閱 `examples/python-ml/` 獲取完整實作。

---

## 🤝 貢獻

我們歡迎協助改善這些標準的貢獻！

### 如何貢獻

1. **建議改善**：開啟 issue 描述問題和建議的解決方案
2. **新增範例**：提交您如何應用這些標準的範例
3. **擴展標準**：貢獻新的語言/框架/領域擴充
4. **翻譯**：協助將標準翻譯成其他語言

### 貢獻指南

所有貢獻必須：
- ✅ 維持語言/框架/領域無關性（對於核心規範）
- ✅ 在至少 2 個不同情境中包含範例
- ✅ 遵循現有的文件結構
- ✅ 以 CC BY 4.0 授權

---

## 📖 延伸閱讀

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

## 🔄 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 3.0.0 | 2025-12-30 | 新增：完整 Windows 支援、npm 發布、CLI 增強、5 個新 Skills（共 14 個）|
| 2.3.0 | 2025-12-29 | 新增：AI 優化標準 (`ai/`)、可配置選項 (`options/`)、CLI 格式/選項支援 |
| 2.2.0 | 2025-12-25 | 新增：多語言支援架構、繁體中文翻譯 |
| 1.3.0 | 2025-12-15 | 新增：changelog-standards.md；更新：versioning.md, git-workflow.md（交叉引用）|
| 1.2.0 | 2025-12-11 | 新增：project-structure.md；更新：documentation-structure.md（檔案命名、版本對齊）|
| 1.1.0 | 2025-12-05 | 新增：testing-standards.md (UT/IT/ST/E2E) |
| 1.0.0 | 2025-11-12 | 初始版本，包含核心規範 |

---

## 📄 授權

本專案採用**雙重授權**：

| 組件 | 授權 |
|------|------|
| 文件（`core/`, `extensions/`, `templates/` 等）| [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| CLI 工具（`cli/`）| [MIT](../../cli/LICENSE) |

兩種授權都是寬鬆型授權，允許商業使用、修改與再發布。

請參閱 [LICENSE](../../LICENSE) 獲取完整詳情。

---

## 💬 社群

- **Issues**：回報錯誤或建議改善
- **Discussions**：分享您如何使用這些標準
- **Examples**：提交您的專案作為範例

---

## ✅ 採用標準檢查清單

- [ ] 已複製核心規範到專案
- [ ] 已選擇語言/框架擴充
- [ ] 已在 CONTRIBUTING.md 中設定專案特定設定
- [ ] 已設定 Git hooks（commitlint, pre-commit）
- [ ] 已在 CI/CD 中整合品質門檻
- [ ] 已對團隊進行標準培訓
- [ ] 已更新專案 README 引用標準
- [ ] 已建立遵循標準的第一個 commit

---

**準備好提升專案的文件品質了嗎？**

從今天開始使用等級 1（必要規範）！

---

**由開源社群用 ❤️ 維護**
