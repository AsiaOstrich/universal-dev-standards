# Changelog | 變更日誌

All notable changes to this project will be documented in this file.
本專案的所有重要變更都將記錄在此檔案中。

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).
格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [Unreleased]

## [3.3.0-beta.3] - 2026-01-07

### Fixed | 修復
- **CLI**: Add `tdd-assistant` to standards-registry.json
  **CLI**：將 `tdd-assistant` 新增至 standards-registry.json
  - Add skill files list and standard entry for TDD
    新增 TDD 的技能檔案列表和標準項目
  - `uds skills` now correctly shows 15/15 skills
    `uds skills` 現在正確顯示 15/15 個技能

## [3.3.0-beta.2] - 2026-01-07

### Added | 新增
- **Core**: Add Test-Driven Development (TDD) standard
  **Core**：新增測試驅動開發 (TDD) 標準
  - New `core/test-driven-development.md` covering Red-Green-Refactor cycle, FIRST principles, TDD vs BDD vs ATDD
    新增 `core/test-driven-development.md` 涵蓋 Red-Green-Refactor 循環、FIRST 原則、TDD vs BDD vs ATDD
  - SDD + TDD integration workflow guidance
    SDD + TDD 整合工作流程指引
  - ML testing boundaries (model accuracy vs data engineering)
    ML 測試邊界（模型準確度 vs 資料工程）
  - Golden Master Testing for legacy systems
    遺留系統的 Golden Master 測試
- **Skills**: Add `tdd-assistant` skill for Claude Code (skill #15)
  **Skills**：為 Claude Code 新增 `tdd-assistant` 技能（第 15 個技能）
  - `skills/claude-code/tdd-assistant/SKILL.md` - TDD workflow guidance
    `skills/claude-code/tdd-assistant/SKILL.md` - TDD 工作流程指引
  - `skills/claude-code/tdd-assistant/tdd-workflow.md` - Step-by-step TDD process
    `skills/claude-code/tdd-assistant/tdd-workflow.md` - 逐步 TDD 流程
  - `skills/claude-code/tdd-assistant/language-examples.md` - 6 language examples (JS/TS, Python, C#, Go, Java, Ruby)
    `skills/claude-code/tdd-assistant/language-examples.md` - 6 種語言範例
  - Complete zh-TW translations for all TDD files
    所有 TDD 檔案的完整繁體中文翻譯

### Changed | 變更
- **Core Standards**: Update cross-references in related standards
  **核心標準**：更新相關標準中的交叉引用
  - `spec-driven-development.md` - Add TDD integration reference
    `spec-driven-development.md` - 新增 TDD 整合引用
  - `testing-standards.md` - Add TDD cross-reference
    `testing-standards.md` - 新增 TDD 交叉引用
  - `test-completeness-dimensions.md` - Add TDD cross-reference
    `test-completeness-dimensions.md` - 新增 TDD 交叉引用
- **Release Workflow**: Expand pre-release checklist with comprehensive file verification
  **發布流程**：擴展預發布檢查清單，加入完整的檔案驗證
  - Add Version Files Checklist with all version-related files
    新增版本檔案檢查清單，涵蓋所有版本相關檔案
  - Rename to Documentation Verification Checklist with accuracy verification
    重新命名為文件驗證檢查清單，加入正確性驗證
  - Add Content Accuracy Verification section with grep commands
    新增內容正確性驗證區塊，包含 grep 指令
  - Use `locales/*` pattern for all locale files
    使用 `locales/*` 萬用字元涵蓋所有語言版本

## [3.2.2] - 2026-01-06

### Added | 新增
- **CLI**: Add `uds skills` command to list installed Claude Code skills
  **CLI**：新增 `uds skills` 指令列出已安裝的 Claude Code skills
  - Shows installations from Plugin Marketplace, user-level, and project-level
    顯示來自 Plugin Marketplace、使用者層級和專案層級的安裝
  - Displays version, path, and skill count for each installation
    顯示每個安裝的版本、路徑和 skill 數量
  - Warns about deprecated manual installations
    對已棄用的手動安裝顯示警告
- **CLI**: Improve Skills update instructions based on installation location
  **CLI**：根據安裝位置改善 Skills 更新指示

### Deprecated | 棄用
- **Skills**: Manual installation via `install.sh` / `install.ps1` is now deprecated
  **Skills**：透過 `install.sh` / `install.ps1` 手動安裝現已棄用
  - Recommended: Use Plugin Marketplace for automatic updates
    建議：使用 Plugin Marketplace 以獲得自動更新
  - Scripts will show deprecation warning and prompt for confirmation
    腳本將顯示棄用警告並要求確認
  - Will be removed in a future major version
    將在未來的主要版本中移除

### Changed | 變更
- **CLI**: `uds update` now shows deprecation warning for manual Skills installations
  **CLI**：`uds update` 現在對手動安裝的 Skills 顯示棄用警告
  - Recommends migration to Plugin Marketplace
    建議遷移至 Plugin Marketplace
- **Skills**: Update README.md to mark manual installation as deprecated
  **Skills**：更新 README.md 將手動安裝標記為棄用

### Fixed | 修復
- **CLI**: Update standards-registry version to 3.2.2
  **CLI**：更新標準註冊表版本至 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### Added | 新增
- **CLI**: Improve Skills update instructions based on installation location
  **CLI**：根據安裝位置改善 Skills 更新指示
  - Marketplace: Guide to update via Plugin Marketplace UI
    Marketplace：透過 Plugin Marketplace UI 更新的指引
  - User-level: `cd ~/.claude/skills/... && git pull`
    使用者層級：`cd ~/.claude/skills/... && git pull`
  - Project-level: `cd .claude/skills/... && git pull`
    專案層級：`cd .claude/skills/... && git pull`

### Fixed | 修復
- **CLI**: Update standards-registry version to 3.2.2
  **CLI**：更新標準註冊表版本至 3.2.2
  - Enables `uds update` to detect new versions for existing projects
    讓 `uds update` 能偵測現有專案的新版本

## [3.2.2-beta.1] - 2026-01-05

### Added | 新增
- **Skills**: Add Release Workflow Guide for comprehensive release process
  **Skills**：新增發布流程指南，提供完整的發布流程
  - New `skills/claude-code/release-standards/release-workflow.md` with step-by-step release instructions
    新增 `skills/claude-code/release-standards/release-workflow.md` 包含逐步發布指示
  - Covers beta, alpha, rc, and stable release workflows
    涵蓋 beta、alpha、rc 和穩定版發布工作流程
  - Includes npm dist-tag strategy, troubleshooting, and AI assistant guidelines
    包含 npm dist-tag 策略、疑難排解和 AI 助理指南
  - Add Release Process section in CLAUDE.md for AI assistants
    在 CLAUDE.md 中新增發布流程章節供 AI 助理參考
- **CLI**: Add conversation language setting to AI tool integrations
  **CLI**：為 AI 工具整合新增對話語言設定
  - All AI tool integration files now include conversation language directive
    所有 AI 工具整合檔案現在都包含對話語言指示
  - Supports English, Traditional Chinese, and Bilingual modes
    支援英文、繁體中文和雙語模式
  - Generates CLAUDE.md for Claude Code users with language setting
    為 Claude Code 使用者生成包含語言設定的 CLAUDE.md
- **CLI**: Add comprehensive tests for prompts and utils modules
  **CLI**：為 prompts 和 utils 模組新增完整測試
  - Test coverage improved from 42.78% to 72.7%
    測試覆蓋率從 42.78% 提升至 72.7%
  - Total tests increased from 94 to 210
    總測試數從 94 增加至 210

### Fixed | 修復
- **CLI**: Only prompt Skills when Claude Code is the only selected AI tool
  **CLI**：僅在 Claude Code 是唯一選擇的 AI 工具時才詢問 Skills
  - Fixes bug where selecting multiple AI tools with Skills could cause other tools to miss full standards
    修復選擇多個 AI 工具與 Skills 時可能導致其他工具遺漏完整標準的問題
- **CI/CD**: Fix npm publish workflow to correctly tag beta/alpha/rc versions
  **CI/CD**：修復 npm 發布工作流程，正確標記 beta/alpha/rc 版本
  - Add automatic version detection in `.github/workflows/publish.yml`
    在 `.github/workflows/publish.yml` 中新增自動版本偵測
  - Beta versions now publish with `@beta` tag instead of `@latest`
    Beta 版本現在使用 `@beta` 標籤而非 `@latest`
  - Users can now install beta versions with `npm install -g universal-dev-standards@beta`
    使用者現在可以使用 `npm install -g universal-dev-standards@beta` 安裝 beta 版本

### Changed | 變更
- **Core Standards**: Add industry reference standards to 5 core documents
  **核心規範**：為 5 個核心標準新增業界參考標準
  - `error-code-standards.md` v1.0.0 → v1.1.0: RFC 7807, RFC 9457, HTTP Status Codes
  - `logging-standards.md` v1.0.0 → v1.1.0: OWASP Logging, RFC 5424, OpenTelemetry, 12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0: SWEBOK v4.0 Ch.10 (Software Quality)
  - `checkin-standards.md` v1.2.5 → v1.3.0: SWEBOK v4.0 Ch.6 (Configuration Management)
  - `spec-driven-development.md` v1.1.0 → v1.2.0: IEEE 830-1998, SWEBOK v4.0 Ch.1 (Requirements)
- **Testing Standards**: Add SWEBOK v4.0 reference and new sections
  **測試標準**：新增 SWEBOK v4.0 參考和新章節
  - `testing-standards.md` v2.0.0 → v2.1.0: Testing Fundamentals, Test-Related Measures, Pairwise/Data Flow Testing
- **Documentation**: Update MAINTENANCE.md with npm dist-tag strategy
  **文件**：更新 MAINTENANCE.md 加入 npm dist-tag 策略
  - Add dist-tag table for different version patterns
    新增不同版本模式的 dist-tag 表格
  - Add manual tag correction commands
    新增手動修正標籤的指令說明

## [3.2.1-beta.1] - 2026-01-02

### Added | 新增
- **CLI**: Add Plugin Marketplace support to Skills installation flow
  **CLI**：在 Skills 安裝流程中新增 Plugin Marketplace 支援
  - New "Plugin Marketplace (推薦)" option in Skills installation prompt
    在 Skills 安裝提示中新增「Plugin Marketplace (推薦)」選項
  - CLI tracks marketplace-installed Skills in manifest without attempting local installation
    CLI 在 manifest 中追蹤透過 marketplace 安裝的 Skills,不嘗試本地安裝
  - `uds check` command now displays marketplace installation status
    `uds check` 指令現在會顯示 marketplace 安裝狀態

### Fixed | 修復
- **CLI**: Fix wildcard path handling in standards registry causing 404 errors
  **CLI**：修復 standards registry 中通配符路徑處理導致 404 錯誤
  - Replace `templates/requirement-*.md` wildcard with explicit file paths
    將 `templates/requirement-*.md` 通配符替換為明確檔案路徑
  - Add explicit entries for requirement-checklist.md, requirement-template.md, requirement-document-template.md
    為 requirement-checklist.md、requirement-template.md、requirement-document-template.md 新增明確條目
- **CLI**: Fix process hanging after `uds init`, `uds configure`, and `uds update` commands
  **CLI**：修復 `uds init`、`uds configure` 和 `uds update` 指令執行後程式未退出的問題
  - Add explicit `process.exit(0)` to prevent inquirer readline interface from blocking termination
    新增明確的 `process.exit(0)` 以防止 inquirer readline interface 阻擋程式終止

## [3.2.0] - 2026-01-02

### Added | 新增
- **Claude Code Plugin Marketplace Support**: Enable distribution via Plugin Marketplace
  **Claude Code Plugin Marketplace 支援**：啟用透過 Plugin Marketplace 分發
  - Add `.claude-plugin/plugin.json` - Plugin manifest with metadata
    新增 `.claude-plugin/plugin.json` - Plugin manifest 配置
  - Add `.claude-plugin/marketplace.json` - Marketplace configuration for plugin distribution
    新增 `.claude-plugin/marketplace.json` - Marketplace 分發配置
  - Add `.claude-plugin/README.md` - Plugin documentation and maintenance guide
    新增 `.claude-plugin/README.md` - Plugin 文檔和維護指南
  - Update `skills/claude-code/README.md` with Method 1: Marketplace Installation (Recommended)
    更新 `skills/claude-code/README.md` 新增方法 1：Marketplace 安裝（推薦）

### Benefits | 優點
- Users can install all 14 skills with a single command: `/plugin install universal-dev-standards@universal-dev-standards`
  使用者可以用單一指令安裝所有 14 個技能：`/plugin install universal-dev-standards@universal-dev-standards`
- Automatic updates when new versions are released
  新版本發布時自動更新
- Better discoverability through Claude Code marketplace
  透過 Claude Code marketplace 提升可發現性
- Maintains backward compatibility with script installation (Method 2 and 3)
  保持與腳本安裝的向後相容性（方法 2 和 3）

### Changed | 變更
- Add conversation language requirement (Traditional Chinese) to `CLAUDE.md` for AI assistants
  在 `CLAUDE.md` 新增 AI 助手對話語言要求（繁體中文）

### Fixed | 修復
- Fix CLI version reading to use `package.json` instead of hardcoded value
  修復 CLI 版本讀取，改用 `package.json` 而非硬編碼值

## [3.1.0] - 2025-12-30

### Added | 新增
- **Simplified Chinese (zh-CN) Translation**: Complete localization for Simplified Chinese users
  **簡體中文 (zh-CN) 翻譯**：為簡體中文使用者提供完整本地化
  - Add `locales/zh-CN/README.md` - Full README translation
    新增 `locales/zh-CN/README.md` - 完整 README 翻譯
  - Add `locales/zh-CN/CLAUDE.md` - Project guidelines translation
    新增 `locales/zh-CN/CLAUDE.md` - 專案指南翻譯
  - Add `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows guide translation
    新增 `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows 指南翻譯
- Add language switcher links across all README versions (EN, zh-TW, zh-CN)
  在所有 README 版本中新增語言切換連結（EN, zh-TW, zh-CN）

- **Full Windows Support**: Complete cross-platform compatibility for Windows users
  **完整 Windows 支援**：為 Windows 使用者提供完整的跨平台相容性
  - Add `.gitattributes` for consistent line endings across platforms
    新增 `.gitattributes` 確保跨平台換行符一致性
  - Add `scripts/check-translation-sync.ps1` - PowerShell version of translation checker
    新增 `scripts/check-translation-sync.ps1` - 翻譯檢查器 PowerShell 版本
  - Add `skills/claude-code/install.ps1` - PowerShell version of skills installer
    新增 `skills/claude-code/install.ps1` - Skills 安裝器 PowerShell 版本
  - Add `scripts/setup-husky.js` - Cross-platform Husky setup script
    新增 `scripts/setup-husky.js` - 跨平台 Husky 設定腳本
  - Add `docs/WINDOWS-GUIDE.md` - Comprehensive Windows development guide
    新增 `docs/WINDOWS-GUIDE.md` - 完整的 Windows 開發指南
- **5 New Claude Code Skills**: Expand skill library from 9 to 14 skills
  **5 個新 Claude Code 技能**：技能庫從 9 個擴充至 14 個
  - `spec-driven-dev` - SDD workflow guidance (triggers: spec, proposal, 提案)
    `spec-driven-dev` - SDD 工作流程指引（觸發詞：spec, proposal, 提案）
  - `test-coverage-assistant` - 7-dimension test completeness framework (triggers: test coverage, dimensions, 測試覆蓋)
    `test-coverage-assistant` - 7 維度測試完整性框架（觸發詞：test coverage, dimensions, 測試覆蓋）
  - `changelog-guide` - Changelog writing standards (triggers: changelog, release notes, 變更日誌)
    `changelog-guide` - 變更日誌撰寫標準（觸發詞：changelog, release notes, 變更日誌）
  - `error-code-guide` - Error code design patterns (triggers: error code, 錯誤碼)
    `error-code-guide` - 錯誤碼設計模式（觸發詞：error code, 錯誤碼）
  - `logging-guide` - Structured logging standards (triggers: logging, log level, 日誌)
    `logging-guide` - 結構化日誌標準（觸發詞：logging, log level, 日誌）
- Add **Hybrid Standards** category to `STATIC-DYNAMIC-GUIDE.md` - Standards with both static and dynamic components
  新增**雙重性質標準**分類至 `STATIC-DYNAMIC-GUIDE.md` - 同時具有靜態和動態元件的標準
- Add **Dynamic vs Static Classification** section to `MAINTENANCE.md` - Guidelines for categorizing standards
  新增**動態 vs 靜態分類**章節至 `MAINTENANCE.md` - 標準分類指南
- Add `checkin-standards` core rules to `CLAUDE.md` as static standard
  將 `checkin-standards` 核心規則加入 `CLAUDE.md` 作為靜態標準
- Add complete zh-TW translations for all 5 new skills (10 files total)
  新增 5 個新技能的完整繁體中文翻譯（共 10 個檔案）

### Changed | 變更
- Update `cli/package.json` prepare script to use cross-platform `setup-husky.js`
  更新 `cli/package.json` 的 prepare 腳本使用跨平台 `setup-husky.js`
- Update `README.md`, `cli/README.md`, `CLAUDE.md` with Windows installation instructions
  更新 `README.md`、`cli/README.md`、`CLAUDE.md` 添加 Windows 安裝說明
- Update `STATIC-DYNAMIC-GUIDE.md` to v1.1.0 - Introduce Hybrid Standards concept, update to 14 skills
  更新 `STATIC-DYNAMIC-GUIDE.md` 至 v1.1.0 - 引入雙重性質標準概念，更新至 14 個技能
- Update `MAINTENANCE.md` - Add cross-reference to `STATIC-DYNAMIC-GUIDE.md`, expand Workflow 4 with classification checklist
  更新 `MAINTENANCE.md` - 新增 `STATIC-DYNAMIC-GUIDE.md` 交叉引用，擴展 Workflow 4 分類檢查清單
- Update skills table in `MAINTENANCE.md` from 9 to 14 skills (35 skill files + 10 shared/README = 45 files)
  更新 `MAINTENANCE.md` 技能表格從 9 個擴充至 14 個（35 個技能檔案 + 10 個共用/README = 45 個檔案）
- Sync zh-TW translations for `MAINTENANCE.md` and `STATIC-DYNAMIC-GUIDE.md`
  同步 `MAINTENANCE.md` 和 `STATIC-DYNAMIC-GUIDE.md` 的繁體中文翻譯

## [3.0.0] - 2025-12-30

### Added | 新增
- **AI-Optimized Standards Architecture**: Add dual-format support with `.ai.yaml` files
  **AI 優化標準架構**：新增 `.ai.yaml` 雙格式支援
- Add `ai/standards/` directory with 15 AI-optimized standard files
  新增 `ai/standards/` 目錄，包含 15 個 AI 優化標準檔案
- Add `ai/options/` directory with language-specific and workflow options
  新增 `ai/options/` 目錄，包含語言特定和工作流程選項
- Add `MAINTENANCE.md` - Project maintenance guide with file structure overview
  新增 `MAINTENANCE.md` - 專案維護指南與檔案結構概覽
- Add `ai/MAINTENANCE.md` - AI standards maintenance workflow guide
  新增 `ai/MAINTENANCE.md` - AI 標準維護工作流程指南
- Add `STANDARDS-MAPPING.md` - Standards to skills mapping matrix
  新增 `STANDARDS-MAPPING.md` - 標準與技能對應矩陣
- Add 6 new AI-optimized standards:
  新增 6 個 AI 優化標準：
  - `anti-hallucination.ai.yaml` - AI collaboration standards
    `anti-hallucination.ai.yaml` - AI 協作標準
  - `checkin-standards.ai.yaml` - Code check-in standards
    `checkin-standards.ai.yaml` - 程式碼簽入標準
  - `documentation-writing-standards.ai.yaml` - Documentation writing guide
    `documentation-writing-standards.ai.yaml` - 文件撰寫指南
  - `spec-driven-development.ai.yaml` - SDD workflow
    `spec-driven-development.ai.yaml` - SDD 工作流程
  - `test-completeness-dimensions.ai.yaml` - 7-dimension test framework
    `test-completeness-dimensions.ai.yaml` - 7 維度測試框架
  - `versioning.ai.yaml` - Semantic versioning standards
    `versioning.ai.yaml` - 語義化版本標準
- Add complete zh-TW translations for all new standards and skills (78 files total)
  新增所有新標準和技能的完整繁體中文翻譯（共 78 個檔案）

### Changed | 變更
- Standardize version format in core standards to `**Version**: x.x.x`
  統一核心標準的版本格式為 `**Version**: x.x.x`
- Add `source` field to all zh-TW translation YAML front matter for sync tracking
  為所有 zh-TW 翻譯的 YAML front matter 新增 `source` 欄位以追蹤同步
- Update translation sync script with improved validation
  更新翻譯同步腳本，改進驗證功能

### Fixed | 修正
- Fix version format inconsistency in `core/error-code-standards.md` and `core/logging-standards.md`
  修正 `core/error-code-standards.md` 和 `core/logging-standards.md` 的版本格式不一致
- Fix source paths in zh-TW skills translations
  修正 zh-TW 技能翻譯中的來源路徑

## [2.3.0] - 2025-12-25

### Added | 新增
- **Multilingual Support**: Add `locales/` directory structure for internationalization
  **多語言支援**：新增 `locales/` 目錄結構用於國際化
- Add Traditional Chinese (zh-TW) translations for all documentation (44 files)
  新增所有文件的繁體中文 (zh-TW) 翻譯（44 個檔案）
  - `locales/zh-TW/core/` - 13 core standard translations
    `locales/zh-TW/core/` - 13 個核心規範翻譯
  - `locales/zh-TW/skills/claude-code/` - 25 skill file translations
    `locales/zh-TW/skills/claude-code/` - 25 個 skill 檔案翻譯
  - `locales/zh-TW/adoption/` - 5 adoption guide translations
    `locales/zh-TW/adoption/` - 5 個採用指南翻譯
  - `locales/zh-TW/README.md` - Complete Chinese README
    `locales/zh-TW/README.md` - 完整的中文 README
- Add language switcher to all English documentation files
  為所有英文文件新增語言切換器
- Add `scripts/check-translation-sync.sh` - Translation synchronization checker
  新增 `scripts/check-translation-sync.sh` - 翻譯同步檢查腳本
- Add Static vs Dynamic standards classification to Skills documentation
  為 Skills 文件新增靜態與動態規範分類說明
- Add `templates/CLAUDE.md.template` - Ready-to-use template for static standards
  新增 `templates/CLAUDE.md.template` - 靜態規範整合範本
- Add `adoption/STATIC-DYNAMIC-GUIDE.md` - Detailed classification guide
  新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 詳細分類指南

### Changed | 變更
- Separate bilingual content into dedicated language files (~50% token reduction for AI tools)
  將雙語內容分離到專用語言檔案（AI 工具減少約 50% token 消耗）
- English versions now contain English-only content with language switcher
  英文版本現在僅包含英文內容並帶有語言切換器
- Update `skills/claude-code/README.md` - Add Static vs Dynamic section with trigger keywords
  更新 `skills/claude-code/README.md` - 新增靜態與動態區塊及觸發關鍵字

## [2.2.0] - 2025-12-24

### Added | 新增
- Add standard sections to all Skills documentation (23 files)
  為所有 Skills 文件新增標準區段（23 個檔案）
  - 8 SKILL.md files: Added Purpose, Related Standards, Version History, License sections
    8 個 SKILL.md 檔案：新增目的、相關標準、版本歷史、授權區段
  - 15 supporting docs: Added bilingual titles, metadata, and standard sections
    15 個支援文件：新增雙語標題、metadata 及標準區段

### Changed | 變更
- Align Skills documentation format with Core standards
  統一 Skills 文件格式與 Core 標準
- Add cross-references between Skills and Core documents
  新增 Skills 與 Core 文件之間的交叉引用

## [2.1.0] - 2025-12-24

### Added | 新增
- **Integrated Skills**: Merge `universal-dev-skills` into `skills/` directory
  **整合 Skills**：將 `universal-dev-skills` 合併至 `skills/` 目錄
- Add `skills/claude-code/` - All Claude Code Skills now included in main repo
  新增 `skills/claude-code/` - 所有 Claude Code Skills 現已包含在主儲存庫中
- Add `skills/_shared/` - Shared templates for multi-AI tool support
  新增 `skills/_shared/` - 用於多 AI 工具支援的共享模板
- Add placeholder directories for future AI tools: `skills/cursor/`, `skills/windsurf/`, `skills/cline/`, `skills/copilot/`
  為未來 AI 工具新增佔位目錄：`skills/cursor/`、`skills/windsurf/`、`skills/cline/`、`skills/copilot/`

### Changed | 變更
- CLI now installs skills from local `skills/claude-code/` instead of fetching from remote repository
  CLI 現在從本地 `skills/claude-code/` 安裝技能，而非從遠端儲存庫獲取
- Update `standards-registry.json` to reflect integrated skills architecture
  更新 `standards-registry.json` 以反映整合的 skills 架構

### Migration Guide | 遷移指南
- If you previously used `universal-dev-skills` separately, you can now use the skills included in this repo
  如果您之前單獨使用 `universal-dev-skills`，現在可以使用本儲存庫中包含的 skills
- Run `cd skills/claude-code && ./install.sh` to reinstall skills from the integrated location
  執行 `cd skills/claude-code && ./install.sh` 從整合位置重新安裝 skills

## [2.0.0] - 2025-12-24

### Changed | 變更

**BREAKING CHANGE**: Project renamed from `universal-doc-standards` to `universal-dev-standards`

專案從 `universal-doc-standards` 更名為 `universal-dev-standards`

This reflects the project's expanded scope covering all development standards, not just documentation.

這反映了專案擴展的範圍，涵蓋所有開發標準，而不僅僅是文件。

#### Migration Guide | 遷移指南

- Re-clone from the new repository: `git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
  從新的儲存庫重新 clone：`git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- Re-run `npm link` in the CLI directory if using global installation
  如果使用全域安裝，請在 CLI 目錄重新執行 `npm link`
- Use `npx universal-dev-standards` instead of `npx universal-doc-standards`
  使用 `npx universal-dev-standards` 取代 `npx universal-doc-standards`
- The `uds` command remains unchanged
  `uds` 命令保持不變

### Added | 新增
- Add `extensions/languages/php-style.md` - PHP 8.1+ coding style guide based on PSR-12
  新增 `extensions/languages/php-style.md` - 基於 PSR-12 的 PHP 8.1+ 編碼風格指南
- Add `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ development patterns
  新增 `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ 開發模式

## [1.3.1] - 2025-12-19

### Added | 新增
- Add Mock Limitations section to `testing-standards.md` - Guidelines for when mocks require integration tests
  新增 Mock 限制章節至 `testing-standards.md` - Mock 需要整合測試的指南
- Add Test Data Management patterns to `testing-standards.md` - Distinct identifiers and composite key guidelines
  新增測試資料管理模式至 `testing-standards.md` - 識別碼區分與複合鍵指南
- Add "When Integration Tests Are Required" table to `testing-standards.md` - 6 scenarios requiring integration tests
  新增「何時需要整合測試」表格至 `testing-standards.md` - 6 種必須整合測試的情境

## [1.3.0] - 2025-12-16

### Added | 新增
- Add `changelog-standards.md` - Comprehensive changelog writing guide
  新增 `changelog-standards.md` - 完整的變更日誌撰寫指南
- Add decision tree and selection matrix to `git-workflow.md` for workflow strategy selection
  新增決策樹和選擇矩陣至 `git-workflow.md`，協助工作流程策略選擇
- Add language selection guide to `commit-message-guide.md` for choosing commit message language
  新增語言選擇指南至 `commit-message-guide.md`，協助選擇提交訊息語言

### Changed | 變更
- Update `versioning.md` - Add cross-reference to changelog-standards.md
  更新 `versioning.md` - 新增交叉引用至 changelog-standards.md
- Update `git-workflow.md` - Add CHANGELOG update guidance in release preparation
  更新 `git-workflow.md` - 在發布準備中新增 CHANGELOG 更新指南
- Update `zh-tw.md` - Add terminology for Changelog, Release Notes, Breaking Change, Deprecate, Semantic Versioning
  更新 `zh-tw.md` - 新增術語：變更日誌、發布說明、破壞性變更、棄用、語義化版本
- Update `changelog-standards.md` - Align exclusion rules with versioning.md, add cross-reference
  更新 `changelog-standards.md` - 與 versioning.md 統一排除規則，新增交叉引用
- Update `checkin-standards.md` - Clarify CHANGELOG updates apply to user-facing changes only
  更新 `checkin-standards.md` - 釐清 CHANGELOG 更新僅適用於使用者可感知的變更
- Update `code-review-checklist.md` - Align CHANGELOG section with changelog-standards.md
  更新 `code-review-checklist.md` - 與 changelog-standards.md 統一 CHANGELOG 區段

### Fixed | 修正
- Fix inconsistent header format in `commit-message-guide.md` and `documentation-writing-standards.md`
  修正 `commit-message-guide.md` 和 `documentation-writing-standards.md` 標頭格式不一致問題
- Standardize cross-references to use markdown link format instead of backticks
  統一交叉引用使用 markdown 連結格式而非反引號

## [1.2.0] - 2025-12-11

### Added | 新增
- Add `project-structure.md` - Project directory conventions
  新增 `project-structure.md` - 專案目錄結構規範
- Add Physical DFD layer to `documentation-structure.md`
  在 `documentation-structure.md` 新增實體 DFD 層

### Changed | 變更
- Update `documentation-structure.md` - Clarify flows/diagrams separation, improve file naming conventions
  更新 `documentation-structure.md` - 釐清流程/圖表分離，改進檔案命名規範
- Update `checkin-standards.md` - Add directory hygiene guidelines
  更新 `checkin-standards.md` - 新增目錄衛生指南
- Improve universality by replacing project-specific examples with generic placeholders
  改進通用性，將專案特定範例替換為通用佔位符

## [1.1.0] - 2025-12-05

### Added | 新增
- Add `testing-standards.md` - Comprehensive testing pyramid (UT/IT/ST/E2E)
  新增 `testing-standards.md` - 完整測試金字塔標準（單元/整合/系統/端對端測試）
- Add `documentation-writing-standards.md` - Documentation content requirements
  新增 `documentation-writing-standards.md` - 文件內容需求標準

### Changed | 變更
- Update `anti-hallucination.md` - Enhance source attribution guidelines
  更新 `anti-hallucination.md` - 強化出處標示指南
- Update `zh-tw.md` - Sync with commit-message-guide.md v1.2.0
  更新 `zh-tw.md` - 與 commit-message-guide.md v1.2.0 同步

## [1.0.0] - 2025-11-12

### Added | 新增
- Initial release with core standards
  初始發布，包含核心標準
- Core standards: `anti-hallucination.md`, `checkin-standards.md`, `commit-message-guide.md`, `git-workflow.md`, `code-review-checklist.md`, `versioning.md`, `documentation-structure.md`
  核心標準：反幻覺、簽入標準、提交訊息指南、Git 工作流程、程式碼審查檢查清單、版本標準、文件結構
- Extensions: `csharp-style.md`, `zh-tw.md`
  擴充：C# 風格指南、繁體中文本地化
- Templates: Requirement document templates
  範本：需求文件範本
- Integrations: OpenSpec framework
  整合：OpenSpec 框架

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
