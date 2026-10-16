---
source: ../../CLAUDE.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: a1de69c3a838
status: current
---

# Universal Development Standards - 專案規範

本文件定義 Universal Development Standards 專案本身的開發標準。作為一個提供開發標準給其他專案的框架，我們實踐自己所倡導的理念（「吃自己的狗糧」）。

## 專案概述

Universal Development Standards 是一個語言無關、框架無關的開發標準框架。它提供：

- **核心標準** (`core/`)：70+ 個基礎開發標準
- **AI 技能** (`skills/`)：用於 AI 輔助開發的 Claude Code 技能
- **CLI 工具** (`cli/`)：用於採用標準的 Node.js CLI
- **整合** (`integrations/`)：各種 AI 工具的設定
- **本地化** (`locales/`)：多語言支援（英文、繁體中文）

## 技術堆疊

| 元件 | 技術 | 版本 |
|-----------|------------|---------|
| 執行環境 | Node.js | >= 18.0.0 |
| 模組系統 | ES Modules | - |
| 測試 | Vitest | ^4.0.16 |
| 程式碼檢查 | ESLint | ^8.56.0 |
| CLI 框架 | Commander.js | ^12.1.0 |
| 互動式提示 | Inquirer.js | ^9.2.12 |

## 開發標準

> **核心標準使用規則**：
> 驗證標準、檢查程式碼或執行任務時，**優先**閱讀 `core/` 中的精簡規則（例如 `core/testing-standards.md`）。
> **僅**在明確要求教育內容、詳細說明或教學課程時，才閱讀 `core/guides/` 或 `methodologies/guides/`。
> 這可確保 token 效率與聚焦的上下文。

> **單一事實來源優先順序（僅限來源儲存庫）**：
> 在此 UDS 來源儲存庫中，`core/*.md` 是**即時的單一事實來源**。
> `<!-- UDS:STANDARDS:START -->` 區塊內的 `.standards/*.ai.yaml` 檔案是由 `npx universal-dev-standards install/update` 維護的**採用者 dogfooding 快照**——根據 DEC-044，`uds update` 無法在來源儲存庫中執行，因此此快照會落後於 `core/`。
> 當兩者分歧時，**一律優先採用 `core/`**。從此儲存庫 CWD 啟動的 Subagents 必須將 `core/*.md` 視為具權威性。

### 1. Commit 訊息格式

遵循 `core/commit-message-guide.md` 中定義的 Conventional Commits 規範：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**類型：**
- `feat`：新功能或標準
- `fix`：錯誤修復或修正
- `docs`：文件更新
- `chore`：維護任務
- `test`：測試相關變更
- `refactor`：程式碼重構
- `style`：格式變更

**範例：**
```bash
feat(core): add new testing completeness dimensions
docs(skills): update Claude Code skill documentation
fix(cli): resolve path resolution issue on Windows
chore(i18n): sync translations with source files
```

### 2. 分支策略

遵循 `core/git-workflow.md` 中定義的 Git 工作流程：

| 分支 | 用途 |
|--------|---------|
| `main` | 穩定、生產就緒的發布版本 |
| `feature/*` | 新功能與增強 |
| `fix/*` | 錯誤修復 |
| `docs/*` | 文件更新 |
| `chore/*` | 維護任務 |

### 3. 程式碼風格

**JavaScript：**
- 字串使用單引號
- 語句以分號結尾
- 使用 ES Module 語法（`import`/`export`）
- 遵循 `cli/.eslintrc.json` 中的 ESLint 設定

**Markdown：**
- 使用 ATX 風格標題（`#`、`##`、`###`）
- 標題前後包含空行
- 使用指定語言的圍欄式程式碼區塊

### 4. 測試要求

- 所有 CLI 功能必須有對應的測試
- 提交前執行測試：`npm test`（在 `cli/` 目錄）
- 執行程式碼檢查：`npm run lint`（在 `cli/` 目錄）
- 測試覆蓋率報告：`npm run test:coverage`

### 5. 翻譯同步

修改核心標準時：
1. 先更新英文來源檔案
2. 同步變更至 `locales/zh-TW/` 目錄
3. 執行翻譯檢查：`./scripts/check-translation-sync.sh`

## 快速指令

### macOS / Linux

```bash
# CLI development (run from cli/ directory)
cd cli
npm install          # Install dependencies
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run test:coverage # Generate coverage report

# Translation sync check (run from root)
./scripts/check-translation-sync.sh

# Version sync check (run from root)
./scripts/check-version-sync.sh

# Standards consistency check (run from root)
./scripts/check-standards-sync.sh

# Pre-release check (run all checks at once)
./scripts/pre-release-check.sh

# Local CLI testing
node cli/bin/uds.js list
node cli/bin/uds.js init --help

# Health score (self-diagnosis)
node cli/bin/uds.js audit --score --self
node cli/bin/uds.js audit --score --self --format json

# External reference check
node scripts/check-external-references.mjs

# Hook statistics analysis (requires opt-in: .uds/config.json {"hookStats": true})
node scripts/analyze-hook-stats.mjs
```

### Windows (PowerShell)

```powershell
# CLI development (run from cli\ directory)
cd cli
npm install          # Install dependencies
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run test:coverage # Generate coverage report

# Translation sync check (run from root)
.\scripts\check-translation-sync.ps1

# Version sync check (run from root)
.\scripts\check-version-sync.ps1

# Standards consistency check (run from root)
.\scripts\check-standards-sync.ps1

# Pre-release check (run all checks at once)
.\scripts\pre-release-check.ps1

# Local CLI testing
node cli\bin\uds.js list
node cli\bin\uds.js init --help
```

### Windows (Git Bash)

```bash
# Same commands as macOS / Linux work in Git Bash
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
./scripts/check-standards-sync.sh
./scripts/pre-release-check.sh
```

## Testing Workflow / 測試工作流程

### When to Run Tests / 何時執行測試

| 時機 | 指令 | 目的 |
|------|------|------|
| 開發期間 | `npm run test:watch` | 即時回饋 |
| 提交前 | 自動執行（git hook） | 防止迴歸 |
| PR 前 | `./scripts/pre-release-check.sh` | 完整驗證 |
| CI/CD | 自動執行（GitHub Actions） | 持續整合 |

### Git Hooks (Automatic) / Git Hooks（自動執行）

Pre-commit hook（`cli/.husky/pre-commit`）會自動執行：
- `npm run test:unit` - 僅單元測試，排除 E2E（快速，< 5 秒）
- `eslint --fix` - 透過 lint-staged 自動修正程式碼風格
- `check-standards-sync.sh` - 若修改了 core/*.md 檔案
- `check-cli-docs-sync.sh` - 若修改了 cli/bin/*.js 檔案

> **注意**：若有任何檢查失敗，commit 將會中止。

### Manual Testing Commands / 手動測試指令

```bash
# In cli/ directory
npm test              # Run all tests once
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
npm run lint          # Check code style
```

### AI Assistant Testing Guidelines / AI 助手測試指南

> **重要**：本節為 AI 助手（Claude Code 等）提供在此專案中如何高效率執行測試的指引。

**Test Suite Characteristics / 測試套件特性：**
- 完整測試套件：跨 30+ 個檔案約 1,000 個測試（單元測試 + E2E）
- 單元測試：執行時間 < 10 秒
- E2E 測試：約 6 分鐘（產生 CLI 子行程）
- 完整套件執行時間：約 6 分鐘

**🚀 Recommended AI Agent Commands / 推薦的 AI Agent 指令：**

| 情境 | 指令 | 執行時間 |
|------|------|----------|
| **快速開發** | `cd cli && npm run test:quick` | < 6 秒（864 個測試） |
| **測試發現** | `cd cli && npm run test:discover` | < 1 秒 |
| **僅限單元測試** | `cd cli && npm run test:unit` | < 3 秒 |
| **排除 E2E 測試** | `cd cli && npm run test:fast` | < 5 秒 |
| **特定變更** | `npm test -- tests/unit/core/ tests/commands/` | < 2 秒 |

**📋 Test Discovery Tool / 測試發現工具：**
```bash
# Discover all tests and get execution commands
cd cli && npm run test:discover

# Show commands for different scenarios
cd cli && node scripts/test-discovery.mjs commands development
```

**⚠️ Avoid / 避免：**
- 使用 `--reporter=summary` 或自訂 reporter（相容性問題）
- 未先確認目前工作目錄就執行測試

**✅ Best Practice / 最佳實踐：**
```bash
# ✅ Recommended: Quick development testing
cd cli && npm run test:quick

# ✅ Good: Test specific modules
npm test -- tests/commands/ai-context.test.js tests/unit/utils/workflows-installer.test.js

# ✅ Good: Use test discovery for targeted testing
cd cli && npm run test:discover

# ✅ Full test suite is now fast enough to run directly
cd cli && npm test  # ~6 minutes
```

### Test Certificate System (Optional) / 測試憑證系統（可選）

測試憑證系統可用於進階工作流程，但由於完整測試套件執行速度很快（約 6 分鐘），因此在發布前檢查中預設不使用。

**Commands / 指令：**
```bash
# Generate certificate after passing tests (optional)
cd cli && npm run test:with-cert

# Verify existing certificate
cd cli && npm run test:verify
```

> **注意**：發布前檢查（`pre-release-check.sh`）一律執行完整的測試套件。如有需要，憑證系統可用於自訂的 CI/CD 工作流程。

## 程式碼簽入標準（強制執行）

每一次 commit 在提交之前都必須通過這些品質關卡：

### 核心理念

每個 commit 都應該：
- ✅ 是一個完整的工作邏輯單元
- ✅ 讓程式碼庫保持在可正常運作的狀態
- ✅ 可被還原且不破壞功能
- ✅ 包含其自有的測試（針對新功能）

### 強制檢查清單

在每一次 commit 之前，請確認：

1. **建置驗證**
   - [ ] 程式碼編譯成功（零錯誤）
   - [ ] 所有相依性均已滿足

2. **測試驗證**
   - [ ] 所有現有測試均通過（100% 通過率）
   - [ ] 新程式碼具有對應的測試
   - [ ] 測試覆蓋率未降低

3. **程式碼品質**
   - [ ] 符合程式碼撰寫標準
   - [ ] 無寫死的機密資訊（密碼、API 金鑰）
   - [ ] 無安全性弱點

4. **文件**
   - [ ] API 文件已更新（若適用）
   - [ ] CHANGELOG 僅在發布前更新，而非每個 commit 更新（遵循 [changelog-standards.md](core/changelog-standards.md)）

5. **工作流程合規**
   - [ ] 分支命名正確（`feature/`、`fix/`、`docs/`、`chore/`）
   - [ ] Commit 訊息遵循 Conventional Commits 規範
   - [ ] 與目標分支保持同步

### ❌ 絕不可提交的情況

- 建置有錯誤
- 測試失敗
- 功能未完成且會破壞現有功能
- 關鍵邏輯包含 WIP/TODO 註解
- 包含除錯程式碼（console.log、print 陳述式）
- 包含被註解掉的程式碼區塊

### 快速驗證指令

```bash
# In cli/ directory
npm run lint         # Check code style
npm test             # Run all tests
npm run build        # Verify build (if applicable)
```

### 參考資料

完整的簽入標準請參閱 [core/checkin-standards.md](core/checkin-standards.md)

---

## AI 協作指南

在此專案中使用 AI 助手（Claude Code、Cursor 等）時：

### Conversation Language / 對話語言

- **所有與 AI 助手的對話皆應以繁體中文進行**
- AI 助手應以繁體中文回覆使用者的問題與請求

### 應該做的：
- 參考 `core/` 中的現有標準以保持一致性
- 文件遵循雙語格式（英文 + 繁體中文）
- 修改核心規範後檢查翻譯同步
- 提交前執行測試與程式碼檢查（linting）

### 不應該做的：
- 未遵循現有範本結構建立新標準
- 修改翻譯檔案卻未更新原始檔案
- 跳過 PR 的程式碼審查檢查清單
- 在核心規範中引入特定語言或特定框架的內容
- 未先閱讀程式碼就對其做出斷言（參見反幻覺規範）
- 未先執行測試就提交程式碼

### 專案特定脈絡：
- 本專案使用 ES Modules（非 CommonJS）
- 所有核心規範應保持語言／框架無關
- 需要雙語文件（英文為主，zh-TW 翻譯）
- CLI 工具是主要程式碼元件；大部分內容為 Markdown

### BDD/TDD Output Directories / BDD/TDD 輸出目錄

從 SDD 規格產生 BDD 與 TDD 檔案時：

| 類型 | 目錄 | 說明 |
|------|-----------|-------------|
| BDD Features | `tests/features/` | Gherkin .feature 檔案 |
| TDD Unit Tests | `cli/tests/unit/` | Vitest 單元測試 |
| SDD Specs | `docs/specs/` | 規格文件 |

**BDD Feature 檔案格式：**
- 包含 `@SPEC-XXX` 與 `@AC-N` 標籤以利追蹤
- 包含 `# [Source: path:AC-N]` 註解以註明來源出處
- 每個 AC 一個 Scenario（1:1 對應）

**TDD 測試檔案格式：**
- 巢狀 describe：SPEC 層級 → AC 層級
- AAA 模式註解（Arrange-Act-Assert）
- 使用 `[TODO]` 標記作為實作預留位置

### Anti-Hallucination Standards / 反幻覺規範

在此專案中工作時，AI 助手必須遵循 [core/anti-hallucination.md](core/anti-hallucination.md)：

| 要求 | 說明 |
|-------------|-------------|
| **以證據為基礎（Evidence-Based）** | 僅分析已明確閱讀的內容 |
| **標明來源出處（Source Attribution）** | 使用 `[Source: Code]`、`[Source: Docs]` 標籤並附帶 file:line 參照 |
| **確定性分級（Certainty Classification）** | 使用 `[Confirmed]`、`[Inferred]`、`[Assumption]`、`[Unknown]` 標籤 |
| **提供建議（Recommendations）** | 提供選項時務必包含建議選項與理由 |
| **禁止捏造（No Fabrication）** | 絕不可在未經查證的情況下捏造 API、設定或需求 |

### Code Review Standards / 程式碼審查規範

審查程式碼或 PR 時，遵循 [core/code-review-checklist.md](core/code-review-checklist.md)：

**審查清單類別：**
1. 功能性（Functionality）- 是否能正確運作？
2. 設計與架構（Design & Architecture）- 是否遵循專案模式？
3. 程式碼品質（Code Quality）- 簡潔、DRY、SOLID？
4. 可讀性（Readability）- 是否易於理解？
5. 測試（Testing）- 覆蓋率是否充足？
6. 安全性（Security）- 是否無漏洞？
7. 效能（Performance）- 是否具備效率？
8. 錯誤處理（Error Handling）- 是否妥善處理？
9. 文件（Documentation）- 是否已更新？
10. 相依套件（Dependencies）- 是否有充分理由？

**評論前綴：**

| 前綴 | 意義 |
|--------|---------|
| ❗ BLOCKING | 合併前必須修復 |
| ⚠️ IMPORTANT | 應予以修復 |
| 💡 SUGGESTION | 有則更好（選用） |
| ❓ QUESTION | 需要釐清 |

### Testing Standards / 測試規範

關於測試要求，遵循 [core/testing-standards.md](core/testing-standards.md)：

**測試金字塔（預設比例）：**

| 層級 | 比例 | 用途 |
|-------|-------|---------|
| 單元測試（UT） | 70% | 測試個別函式／方法 |
| 整合測試（IT） | 20% | 測試元件間的互動 |
| 端對端測試（E2E） | 10% | 測試使用者工作流程 |

**關鍵要求：**
- 所有新功能必須有對應的測試
- 提交前執行測試
- 維持或提高測試覆蓋率
- 使用具描述性的測試名稱，遵循 `should_[expected]_when_[condition]` 模式

### Standards Compliance Reference / 規範合規參考

| 任務 | 必須遵循 | 參考 |
|------|-------------|-----------|
| 程式碼分析 | 反幻覺規範 | [core/anti-hallucination.md](core/anti-hallucination.md) |
| PR 審查 | 程式碼審查清單 | [core/code-review-checklist.md](core/code-review-checklist.md) |
| 新增功能 | 測試規範 | [core/testing-standards.md](core/testing-standards.md) |
| 任何提交 | 提交規範 | [core/checkin-standards.md](core/checkin-standards.md) |
| 新功能設計 | 規格驅動開發 | [core/spec-driven-development.md](core/spec-driven-development.md) |
| 新增／修改 Core↔Skill | /sdd + 同步檢查 | 參見下方的「Core↔Skill 同步規則」 |
| 回溯規格追蹤 | /sdd-retro | 參見下方的「規格追蹤」 |
| 撰寫 AI 指令 | AI 指令規範 | [core/ai-instruction-standards.md](core/ai-instruction-standards.md) |
| 撰寫文件 | 文件撰寫規範 | [core/documentation-writing-standards.md](core/documentation-writing-standards.md) |
| 適用於 AI 的專案架構 | AI 友善架構 | [core/ai-friendly-architecture.md](core/ai-friendly-architecture.md) |
| 標準載入策略 | 上下文感知載入 | [core/context-aware-loading.md](core/context-aware-loading.md) |
| 跨工作階段狀態 | 專案上下文記憶 | [core/project-context-memory.md](core/project-context-memory.md) |

---

## 採用層整合策略

UDS 定位為**純標準庫**（Standards Definition Library）。它定義「該做什麼」，並透過 `.standards/` 由任意採用層（Adapters / Pipelines / Agents / IDE）讀取與執行。UDS 本身**不綁定**任何特定下游產品、不提供 runtime、不指定授權模式。

```
UDS（標準定義；MIT + CC BY 4.0）──→ 採用層（任意 Adapter / Pipeline / Agent / IDE）
```

### UDS 的角色

1. **標準來源**：UDS 定義 70+ 項標準供任意採用層消費
2. **工具無關**：UDS 支援 12+ 種 AI 工具與一般 CI / IDE 整合
3. **授權獨立**：UDS 採 MIT + CC BY 4.0；採用層的授權選擇與 UDS 無關

### 標準如何流向採用層

| 流向 | 機制 | 說明 |
|------|------|------|
| UDS → 採用層 | `.standards/` copy-once | 採用層透過 `uds init` 安裝標準，於 Quality Gate / Agent prompt / IDE rule 中讀取 |
| UDS → CI 整合 | `.standards/` 引用 | CI / pre-commit hook 讀取對應 `.ai.yaml` 進行驗證 |
| UDS → 採用層 bridges | 例如 TestPolicy 格式 | 採用層在 UDS 之上建立特定 bridge（如 test-governance → TestPolicy）|

### 對 UDS 開發的影響

- 新增/修改標準時，需考慮**通用採用場景**（不假設特定下游產品的內部結構）
- 標準格式需保持中性、可攜（不嵌入採用層的實作細節）
- 標準的 scope 標記（universal/partial/uds-specific）影響可攜性

---

<!-- UDS:STANDARDS:START -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx universal-dev-standards install' or 'npx universal-dev-standards update' to modify. -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx universal-dev-standards install' or 'npx universal-dev-standards update' to modify. -->
## Commit 訊息語言
以**雙語**格式（英文 + 繁體中文）撰寫 commit 訊息。
格式：`<type>(<scope>): <English>. <中文>.`
內文必須為雙語：英文在前 → 空行 → 中文在後。絕不可在單一段落中混合語言。

## 規範遵循指示

**MUST follow**（每次都要遵守）：
| 任務 | 規範 | 時機 |
|------|----------|------|
| 撰寫 commit | [commit-message.ai.yaml](../../.standards/commit-message.ai.yaml) | 每次 commit |
| 專案脈絡 | [project-context-memory.ai.yaml](../../.standards/project-context-memory.ai.yaml) | 規劃與編寫程式碼 |

**SHOULD follow**（相關任務時參考）：
| 任務 | 規範 | 時機 |
|------|----------|------|
| Git 工作流程 | [git-workflow.ai.yaml](../../.standards/git-workflow.ai.yaml) | 分支／合併決策 |
| 撰寫測試 | [testing.ai.yaml](../../.standards/testing.ai.yaml) | 建立測試時 |
| 開發者記憶 | [developer-memory.ai.yaml](../../.standards/developer-memory.ai.yaml) | 一律遵守（通訊協定） |

## 已安裝標準索引

本專案採用 UDS 標準。所有規範位於 `.standards/`：

### 核心（55 個標準）
- `anti-hallucination.ai.yaml` - anti-hallucination.ai.yaml
- `ai-friendly-architecture.ai.yaml` - ai-friendly-architecture.ai.yaml
- `commit-message.ai.yaml` - 提交訊息格式
- `english.ai.yaml` - english.ai.yaml
- `checkin-standards.ai.yaml` - checkin-standards.ai.yaml
- `spec-driven-development.ai.yaml` - spec-driven-development.ai.yaml
- `code-review.ai.yaml` - code-review.ai.yaml
- `git-workflow.ai.yaml` - Git 工作流程
- `github-flow.ai.yaml` - github-flow.ai.yaml
- `squash-merge.ai.yaml` - squash-merge.ai.yaml
- `versioning.ai.yaml` - versioning.ai.yaml
- `changelog.ai.yaml` - changelog.ai.yaml
- `testing.ai.yaml` - 測試標準
- `unit-testing.ai.yaml` - unit-testing.ai.yaml
- `integration-testing.ai.yaml` - integration-testing.ai.yaml
- `documentation-structure.ai.yaml` - documentation-structure.ai.yaml
- `documentation-writing-standards.ai.yaml` - documentation-writing-standards.ai.yaml
- `ai-instruction-standards.ai.yaml` - ai-instruction-standards.ai.yaml
- `project-structure.ai.yaml` - project-structure.ai.yaml
- `error-codes.ai.yaml` - error-codes.ai.yaml
- `logging.ai.yaml` - logging.ai.yaml
- `test-completeness-dimensions.ai.yaml` - test-completeness-dimensions.ai.yaml
- `test-driven-development.ai.yaml` - test-driven-development.ai.yaml
- `behavior-driven-development.ai.yaml` - behavior-driven-development.ai.yaml
- `acceptance-test-driven-development.ai.yaml` - acceptance-test-driven-development.ai.yaml
- `reverse-engineering-standards.ai.yaml` - reverse-engineering-standards.ai.yaml
- `forward-derivation-standards.ai.yaml` - forward-derivation-standards.ai.yaml
- `ai-agreement-standards.ai.yaml` - ai-agreement-standards.ai.yaml
- `virtual-organization-standards.ai.yaml` - virtual-organization-standards.ai.yaml
- `refactoring-standards.ai.yaml` - refactoring-standards.ai.yaml
- `requirement-engineering.ai.yaml` - requirement-engineering.ai.yaml
- `security-standards.ai.yaml` - security-standards.ai.yaml
- `performance-standards.ai.yaml` - performance-standards.ai.yaml
- `accessibility-standards.ai.yaml` - accessibility-standards.ai.yaml
- `requirement-checklist.md` - requirement-checklist.md
- `requirement-template.md` - requirement-template.md
- `requirement-document-template.md` - requirement-document-template.md
- `deployment-standards.ai.yaml` - deployment-standards.ai.yaml
- `developer-memory.ai.yaml` - 開發者持久記憶
- `project-context-memory.ai.yaml` - 專案情境記憶
- `context-aware-loading.ai.yaml` - context-aware-loading.ai.yaml
- `test-governance.ai.yaml` - test-governance.ai.yaml
- `structured-task-definition.ai.yaml` - structured-task-definition.ai.yaml
- `acceptance-criteria-traceability.ai.yaml` - acceptance-criteria-traceability.ai.yaml
- `api-design-standards.ai.yaml` - api-design-standards.ai.yaml
- `database-standards.ai.yaml` - database-standards.ai.yaml
- `systematic-debugging.ai.yaml` - systematic-debugging.ai.yaml
- `model-selection.ai.yaml` - model-selection.ai.yaml
- `git-worktree.ai.yaml` - git-worktree.ai.yaml
- `verification-evidence.ai.yaml` - verification-evidence.ai.yaml
- `ai-command-behavior.ai.yaml` - ai-command-behavior.ai.yaml
- `ai-response-navigation.ai.yaml` - ai-response-navigation.ai.yaml
- `documentation-lifecycle.ai.yaml` - documentation-lifecycle.ai.yaml
- `adr-standards.ai.yaml` - adr-standards.ai.yaml
- `retrospective-standards.ai.yaml` - retrospective-standards.ai.yaml
- `dual-phase-output.ai.yaml` - 雙階段 LLM 輸出標準（<analysis> 丟棄 + <summary> 保留）
- `circuit-breaker.ai.yaml` - 通用斷路器（三態 CLOSED/HALF_OPEN/OPEN，防 API 雪崩）
- `token-budget.ai.yaml` - Token 閾值四區模型（安全/警告/危險/阻塞）
- `security-decision.ai.yaml` - 安全決策鐵律（deny > ask > allow 優先級仲裁）
- `capability-declaration.ai.yaml` - Fail-Closed 能力聲明（工具/Adapter 預設不安全）
<!-- UDS:STANDARDS:END -->

---

## 修改後驗證

**重要**：完成以下任何修改後，AI 助手必須驗證所有相關檔案均已更新（具體細節請參閱以下章節）。完整的維護工作流程在 AsiaOstrich dev-platform 規劃中心內部追蹤（`cross-project/ops/uds-operation.md`）。

| 修改類型 | 關鍵檢查項目 |
|---|---|
| 新增／修改核心標準 | 更新 registry、翻譯、Related Standards 章節 |
| 新增／修改 Skill | 更新 skillFiles 對應、Skill 數量測試 |
| 新增／修改 AI 工具整合 | 更新 ai-agent-paths.js、CLAUDE.md 整合清單 |
| 準備發布 | 執行 bump-version.mjs、更新 CHANGELOG、驗證同步腳本 |
| 任何多檔案變更 | 執行 check-standards-sync.sh + check-translation-sync.sh |
| 新增／修改安裝指令 | 跨平台指令同步（見下文） |

### 快速驗證（所有變更）

在進行任何修改後，請執行：
```bash
# Run all checks at once (recommended)
./scripts/pre-release-check.sh

# Or run individual checks:
./scripts/check-standards-sync.sh
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
./scripts/check-ai-agent-sync.sh
./scripts/check-spec-sync.sh        # Core↔Skill sync
./scripts/check-scope-sync.sh       # Scope universality check
./scripts/check-docs-integrity.sh   # Documentation integrity
./scripts/check-orphan-specs.sh     # Orphan spec detection
npx tsx scripts/check-ai-behavior-sync.ts # AI Agent Behavior coverage
cd cli && npm test && npm run lint
```

> **AI Agent 同步檢查 SOP**：AI Agent 同步 SOP 在 dev-platform 規劃中心內部維護（`cross-project/ops/uds-ai-agent-sync-sop.md`）。

### Core↔Skill 同步規則（UDS 專用）

> ⚠️ 本節為 UDS 專案專用。UDS 專案維護 Core Standard、Skill 與 Command 之間的雙向關係。

#### 同步架構

```
Core Standard ◄──────────► Skill ◄──────────► Command
      │                       │                   │
      └───────────────────────┴───────────────────┘
                          ▼
                    Translations
```

#### 同步矩陣

| 變更來源 | 必須評估同步至 |
|---|---|
| Core Standard | → Skill、Command、AI YAML、Translations |
| Skill | → Core Standard（若適用）、Command、Translations |
| Command | → Skill、Translations |

#### Core↔Skill 對應

| 類別 | 說明 | 範例 |
|---|---|---|
| **Has Core Standard** | Skill 實作了 Core Standard | `commit-standards` ↔ `commit-message-guide.md` |
| **Utility Skill** | 不需要 Core Standard（工具／產生器） | `docs-generator`、`code-formatter` |
| **Static Skill** | 僅供參考，無互動 | 僅連結至標準的 Skill |

#### 強制 /sdd 工作流程

**以下任何變更均必須先使用 `/sdd`：**

1. **新增功能**
   - 新增 Core Standard
   - 新增 Skill
   - 新增 Slash Command

2. **修改功能**
   - 修改 Core Standard 內容
   - 修改 Skill 行為
   - 修改 Command 功能

3. **移除功能**
   - 移除標準
   - 移除 Skill／Command

**例外情況（可跳過 /sdd）：**
- 錯字修正
- 格式變更
- 純翻譯更新
- 緊急熱修復（必須事後補寫文件記錄）

#### 同步檢查腳本

**macOS / Linux:**
```bash
./scripts/check-spec-sync.sh
```

**Windows PowerShell:**
```powershell
.\scripts\check-spec-sync.ps1
```

預期輸出：
```
✓ commit-standards ↔ core/commit-message-guide.md
✓ testing-guide ↔ core/testing-standards.md
⚠ docs-generator (utility, no core standard required)
✓ All Skills synced with Core Standards
```

### Spec 追蹤

三種機制確保 spec 可追蹤性：

1. **`/commit` spec 評估** —— 對於 `feat`/`fix` commit，AI 會建議建立或連結 spec。詳情請參閱 [`skills/commands/commit.md`](skills/commands/commit.md)。
2. **`/sdd-retro`** —— 為未追蹤的 commit（例如緊急熱修復）事後補建 spec。詳情請參閱 [`skills/commands/sdd-retro.md`](skills/commands/sdd-retro.md)。
3. **孤立 spec 偵測** —— `check-orphan-specs.sh` 會標記停滯在非終止狀態的 spec。已作為步驟 15 整合至 `pre-release-check.sh`（僅發出警告）。

### Scope 通用性標記系統

所有 Core Standard 與 Skill 皆標記有 `scope` 欄位，用以表示其通用性：

| Scope | 說明 | 用法 |
|---|---|---|
| `universal` | 完全通用，任何專案皆可使用 | 可直接採用 |
| `partial` | 概念通用但包含 UDS 專用細節 | 採用前請先檢視 |
| `uds-specific` | UDS 專案專用工具或工作流程 | 僅供內部使用 |

#### 分布統計

**目前分布：**
- **Core Standards**：14 個 universal（61%）、7 個 partial（30%）、2 個 uds-specific（9%）
- **Skills**：12 個 universal（48%）、10 個 partial（40%）、3 個 uds-specific（12%）

#### 標記位置

- **Skills**：位於 `SKILL.md` 的 YAML frontmatter 中
  ```yaml
  ---
  name: skill-name
  scope: universal
  description: ...
  ---
  ```

- **Core Standards**：位於 Markdown metadata 中
  ```markdown
  **Applicability**: All software projects
  **Scope**: universal
  ```

#### 範圍檢查腳本

**macOS / Linux:**
```bash
./scripts/check-scope-sync.sh
```

**Windows PowerShell:**
```powershell
.\scripts\check-scope-sync.ps1
```

### 跨平台指令同步（UDS 專用）

> ⚠️ 本節為 UDS 專案專用。並非所有專案都需要維護包含跨平台指令的雙語翻譯。

#### 何時檢查

修改這些 UDS 專案檔案後，請驗證跨平台指令同步：
- 採用指南（`adoption/`）
- Skill 安裝說明（`skills/*/README.md`）
- 維護指南（`ai/MAINTENANCE.md`）
- 檢查清單（`adoption/checklists/`）

#### 需要同步的檔案

有 33 個檔案需要維護跨平台指令：
- 英文來源：11 個檔案
- zh-TW 翻譯：11 個檔案
- zh-CN 翻譯：11 個檔案

#### 標準指令對照

| Bash | PowerShell | 用途 |
|---|---|---|
| `cp file dest/` | `Copy-Item file dest\` | 複製檔案 |
| `cp -r dir/ dest/` | `Copy-Item -Recurse dir\ dest\` | 遞迴複製 |
| `mkdir -p dir` | `New-Item -ItemType Directory -Force -Path dir` | 建立目錄 |
| `~/` | `$env:USERPROFILE\` | 使用者目錄 |
| `./script.sh` | `.\script.ps1` | 執行腳本 |

#### 標籤慣例

針對特定平台的程式碼區塊請使用以下標籤：
- `**macOS / Linux:**` 後接 bash 程式碼區塊
- `**Windows PowerShell:**` 後接 powershell 程式碼區塊

---

## 發布流程

準備發布或協助版本管理時：

### 參考文件

- **完整發布工作流程**：[skills/release-standards/release-workflow.md](skills/release-standards/release-workflow.md)
- **語意化版本控制**：[skills/release-standards/semantic-versioning.md](skills/release-standards/semantic-versioning.md)
- **版本控制標準**：[core/versioning.md](core/versioning.md)
- **CHANGELOG 格式**：[skills/release-standards/changelog-format.md](skills/release-standards/changelog-format.md)

### AI 助手的關鍵要點

1. **絕不手動執行 `npm publish`**：GitHub Actions 會自動處理此操作
2. **版本偵測完全自動**：`.github/workflows/publish.yml` 會偵測版本類型並使用正確的 npm 標籤
3. **務必遵循檢查清單**：release-workflow.md 中的預發布檢查
4. **CHANGELOG 優先**：建立發布前先更新 CHANGELOG.md

### 發布類型

| 類型 | 版本模式 | npm 標籤 | 自動偵測 |
|------|----------------|---------|---------------|
| Stable | `X.Y.Z` | `@latest` | ✅ 是 |
| Beta | `X.Y.Z-beta.N` | `@beta` | ✅ 是 |
| Alpha | `X.Y.Z-alpha.N` | `@alpha` | ✅ 是 |
| RC | `X.Y.Z-rc.N` | `@rc` | ✅ 是 |

### AI 助手工作流程

當使用者要求準備發布時：

1. **詢問發布類型**：beta、alpha、rc 或 stable
2. **執行預發布檢查**：測試、程式碼檢查（linting）、git 狀態
3. **執行 `bump-version.mjs`** — 以不可分割的方式（atomically）更新所有版本檔案（請參閱下方的 UDS 特定章節）
4. **更新 CHANGELOG.md**（英文 + zh-TW + zh-CN）：遵循 release-workflow.md 中的格式
5. **提交、標記、推送**：`git add -A && git commit && git tag vX.Y.Z && git push origin main vX.Y.Z`
6. **建立 GitHub Release**：使用 `gh release create` 指令

> ⚠️ **絕不要手動更新個別版本檔案**。請一律使用 `node scripts/bump-version.mjs`（或其 macOS/Linux 包裝指令檔 `scripts/bump-version.sh`），以避免遺漏檔案。

### UDS 專案特定發布步驟

> ⚠️ **重要**：本節包含 UDS 特定需求，除了標準發布工作流程外**必須**嚴格遵守。

#### 步驟 0：執行 bump-version.mjs（強制）

**請一律使用版本升級指令檔** — 它會以不可分割的方式（atomically）更新所有檔案並執行驗證：

```bash
# Cross-platform (macOS / Linux / Windows) — the only copy of the bump logic
node scripts/bump-version.mjs 5.2.0-beta.1   # Pre-release
node scripts/bump-version.mjs 5.2.0          # Stable

# macOS / Linux convenience wrapper (thin exec into the .mjs above):
./scripts/bump-version.sh 5.2.0-beta.1
./scripts/bump-version.sh 5.2.0

# After bump-version.mjs:
# → Update CHANGELOG.md (EN + zh-TW + zh-CN) manually
# → git add -A && git commit -m "chore(release): X.Y.Z"
# → git tag vX.Y.Z && git push origin main vX.Y.Z
```

此指令檔會自動處理以下檔案：

| 檔案 | 欄位 | Alpha/Beta/RC | 穩定版 |
|------|-------|---------------|--------|
| `cli/package.json` | `"version"` | ✅ 自動 | ✅ 自動 |
| `cli/package-lock.json` | `"version"` + `packages[""].version` | ✅ 自動 | ✅ 自動 |
| `cli/standards-registry.json` | `"version"` (3 處) | ✅ 自動 | ✅ 自動 |
| `uds-manifest.json` | `"version"` + `"last_updated"` | ✅ 自動 | ✅ 自動 |
| `README.md` | `**Version**:` | ✅ 自動 | ✅ 自動 |
| `locales/zh-TW/README.md` | `**版本**:` | ✅ 自動 | ✅ 自動 |
| `locales/zh-CN/README.md` | `**版本**:` | ✅ 自動 | ✅ 自動 |
| `locales/zh-TW/CHANGELOG.md` | frontmatter | ✅ 自動 | ✅ 自動 |
| `locales/zh-CN/CHANGELOG.md` | frontmatter | ✅ 自動 | ✅ 自動 |
| `.claude-plugin/plugin.json` | `"version"` | ❌ 略過 | ✅ 自動 |
| `.claude-plugin/marketplace.json` | `"version"` | ❌ 略過 | ✅ 自動 |

> **Marketplace 版本策略**：`.claude-plugin/` 檔案僅在穩定版本發布時更新。這樣可以防止 beta/alpha 版本自動推播給 Claude Plugin Marketplace 使用者。Marketplace 使用者將只會收到穩定版本。

#### 預發布驗證指令檔

```bash
# macOS / Linux
./scripts/pre-release-check.sh

# Windows PowerShell
.\scripts\pre-release-check.ps1
```

這會執行 19 項檢查，包括：
1. Git 工作目錄狀態
2. 版本同步（`check-version-sync.sh`）
3. 標準同步（`check-standards-sync.sh`）
4. 翻譯同步（`check-translation-sync.sh`）
5-11. CLI-docs、docs、AI agent、使用文件、spec、scope、指令同步檢查
12. 文件完整性（`check-docs-integrity.sh`）
13. Skill 後續步驟同步（`check-skill-next-steps-sync.sh`）
14. 程式碼檢查（Linting）
15. 孤立規格偵測（`check-orphan-specs.sh`）
16. AI Agent 行為涵蓋率（`check-ai-behavior-sync.ts`）
17. 工作流程合規性
18. 單元測試
19. E2E 測試（Bug 回歸）

#### 翻譯同步（穩定版本）

對於穩定版本，請確保翻譯已同步：
```bash
./scripts/check-translation-sync.sh      # zh-TW
./scripts/check-translation-sync.sh zh-CN # zh-CN
```

#### UDS 三階段發布工作流程（Alpha→Beta→Stable）

> **附註**：此工作流程專屬於 UDS 專案。通用發布工作流程（請參閱 `release-workflow.md`）採用較簡單的 Beta→Stable 模式，適用於大多數專案。

**工作流程理念**：先定版本，再驗證。在測試前指派版本號，以確保驗證目標對準確切的發布版本。

**階段概述：**

| 階段 | 版本模式 | npm 標籤 | 目的 |
|-------|-----------------|---------|---------|
| 階段 1：Alpha | `X.Y.Z-alpha.N` | `@alpha` | 內部驗證、預發布檢查 |
| 階段 2：Beta | `X.Y.Z-beta.N` | `@beta` | 公開測試、搶先體驗者回饋 |
| 階段 3：Stable | `X.Y.Z` | `@latest` | 生產環境發布 |

**詳細步驟：**

**階段 1：Alpha 發布（內部）**
1. 更新版本至 alpha：`npm version X.Y.Z-alpha.1 --no-git-tag-version`
2. 僅更新 CLI 版本檔案（2 個檔案）：
   - `cli/package.json`
   - `cli/standards-registry.json`
3. **請勿更新** `.claude-plugin/` 檔案（保留先前的穩定版本）
4. 執行預發布檢查：`./scripts/pre-release-check.sh`
5. 使用 alpha 說明更新 CHANGELOG
6. 提交：`chore(release): X.Y.Z-alpha.1`
7. 建立標籤：`vX.Y.Z-alpha.1`
8. 推送並建立 GitHub Release（標記為預發布版本）

**階段 2：Beta 發布（公開測試）**
1. Alpha 驗證通過後，更新至 beta：`npm version X.Y.Z-beta.1 --no-git-tag-version`
2. 僅更新 CLI 版本檔案（2 個檔案）：
   - `cli/package.json`
   - `cli/standards-registry.json`
3. **請勿更新** `.claude-plugin/` 檔案（保留先前的穩定版本）
4. 執行完整測試套件
5. 使用 beta 說明更新 CHANGELOG
6. 提交：`chore(release): X.Y.Z-beta.1`
7. 建立標籤：`vX.Y.Z-beta.1`
8. 推送並建立 GitHub Release（標記為預發布版本）
9. 向搶先體驗者公佈以收集回饋

**階段 3：Stable 發布（正式環境）**
1. Beta 測試完成後，更新至 stable：`npm version X.Y.Z --no-git-tag-version`
2. 更新**所有**版本檔案（5 個檔案）：
   - `cli/package.json`
   - `cli/standards-registry.json`
   - `.claude-plugin/plugin.json` ← 在此處更新 Marketplace
   - `.claude-plugin/marketplace.json` ← 在此處更新 Marketplace
   - `README.md`
3. 定稿 CHANGELOG（移除 beta 警告，加入穩定版說明）
4. 同步翻譯：`./scripts/check-translation-sync.sh`
5. 執行最終預發布檢查
6. 提交：`chore(release): X.Y.Z`
7. 建立標籤：`vX.Y.Z`
8. 推送並建立 GitHub Release
9. 驗證 npm 發布：`npm view universal-dev-standards dist-tags`

**何時使用此工作流程：**
- 包含重大變更（breaking changes）的主要版本發布
- 需要大量測試的功能
- 需要搶先體驗者驗證的發布

**何時略過 Alpha（僅 Beta→Stable）：**
- 修補版本發布（僅錯誤修復）
- 風險較低的次要版本發布
- 緊急安全性修復

### 互動範例

```
User: "我想發布 beta 版本"

AI:
我會協助你準備 beta 版本發布。

首先，讓我執行預發布檢查：
1. ✅ 執行測試
2. ✅ 執行 linting
3. ✅ 檢查 git 狀態

請提供以下資訊：
1. 版本號是多少？（例如：3.2.2-beta.1）
2. 主要包含哪些變更？

確認後，我會：
1. 更新 cli/package.json 版本號
2. 更新 CHANGELOG.md
3. 建立 git tag (vX.Y.Z-beta.N)
4. 提交並推送變更
5. 提供建立 GitHub Release 的步驟

**重要**：建立 GitHub Release 後，GitHub Actions 會自動：
- 偵測版本類型（beta）
- 發布到 npm 並標記為 @beta
- 無需手動執行 npm publish
```

---

## 檔案結構參考

```
universal-dev-standards/
├── core/                  # Core standards (71 files)
├── skills/                # AI tool skills
│   └── claude-code/       # Claude Code skills (26 skills)
├── cli/                   # Node.js CLI tool
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   └── package.json       # Dependencies
├── locales/               # Translations
│   └── zh-TW/             # Traditional Chinese
├── integrations/          # AI tool configurations
├── templates/             # Document templates
├── adoption/              # Adoption guides
└── scripts/               # Maintenance scripts
```

## 貢獻

詳細的貢獻指南請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 授權

- 文件（Markdown）：CC BY 4.0
- 程式碼（JavaScript）：MIT


## Available UDS Slash Commands | UDS 可用命令

> Auto-generated index for SPEC-INTSYNC-001 sync compliance. The authoritative descriptions live in `skills/commands/*.md` and `skills/commands/COMMAND-INDEX.json`.

> 為 SPEC-INTSYNC-001 同步合規自動產生的索引。權威描述位於 `skills/commands/*.md` 與 `COMMAND-INDEX.json`。

### core

- `/commit`
- `/code-review`
- `/sdd`
- `/check`
- `/init`
- `/update`
- `/config`

### testing

- `/tdd`
- `/bdd`
- `/atdd`
- `/e2e`
- `/coverage`
- `/ac-coverage`
- `/derive`
- `/derive-bdd`
- `/derive-tdd`
- `/derive-atdd`
- `/derive-all`
- `/journey-test`

### quality

- `/checkin`
- `/refactor`
- `/scan`
- `/security`
- `/reverse`
- `/reverse-sdd`
- `/reverse-bdd`
- `/reverse-tdd`

### docs

- `/docs`
- `/docgen`
- `/changelog`
- `/requirement`
- `/brainstorm`
- `/sdd-retro`
- `/pr`

### ops

- `/observability`
- `/slo`
- `/runbook`
- `/incident`
- `/metrics`
- `/durable`
- `/ci-cd`

### methodology

- `/methodology`
- `/dev-workflow`
- `/discover`
- `/release`
- `/audit`
- `/migrate`
- `/skill-builder`

### reference

- `/database`
- `/api-design`
