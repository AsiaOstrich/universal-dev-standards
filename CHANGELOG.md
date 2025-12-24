# Changelog | 變更日誌

All notable changes to this project will be documented in this file.
本專案的所有重要變更都將記錄在此檔案中。

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).
格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [Unreleased] | 未發布

### Added | 新增
- Add Static vs Dynamic standards classification to Skills documentation
  為 Skills 文件新增靜態與動態規範分類說明
- Add `templates/CLAUDE.md.template` - Ready-to-use template for static standards
  新增 `templates/CLAUDE.md.template` - 靜態規範整合範本
- Add `adoption/STATIC-DYNAMIC-GUIDE.md` - Detailed classification guide
  新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 詳細分類指南

### Changed | 變更
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

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
