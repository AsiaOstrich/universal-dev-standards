# Changelog | 變更日誌

All notable changes to this project will be documented in this file.
本專案的所有重要變更都將記錄在此檔案中。

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).
格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [Unreleased] | 未發布

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

[Unreleased]: https://github.com/AsiaOstrich/universal-doc-standards/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/AsiaOstrich/universal-doc-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-doc-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-doc-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-doc-standards/releases/tag/v1.0.0
