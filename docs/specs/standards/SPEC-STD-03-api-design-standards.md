# [SPEC-STD-03] API Design Standards — 新增核心標準

## Status: Implemented
## Created: 2026-03-18 (retroactive)
## Implemented: 2026-03-18

---

## Summary

新增 API Design Standards 核心標準，填補 UDS 在 API 設計領域的覆蓋缺口。涵蓋 REST、GraphQL、gRPC 三種 API 範式的設計原則、版本控制、分頁、認證、Rate Limiting、錯誤處理等。

## Motivation

- UDS 39 個核心標準中，API 設計是業界最基本的 SE 實踐之一，但完全缺失
- 幾乎所有軟體專案都需要 API（REST/GraphQL/gRPC），屬於 P0 優先級缺口
- 已有 Error Code Standards 和 Security Standards，但缺少統一的 API 設計指導

## Scope

| 面向 | 包含 |
|------|------|
| REST 設計原則 | 資源命名、HTTP 動詞、狀態碼、URL 結構 |
| 版本控制策略 | URL path / Header / Query 決策矩陣 |
| 分頁與篩選 | Cursor-based vs Offset、排序、欄位選擇 |
| 認證模式 | OAuth2、API Key、JWT Bearer 決策矩陣 |
| Rate Limiting | 標頭、429 回應、Retry-After |
| 錯誤回應格式 | RFC 7807 Problem Details |
| GraphQL | Schema 設計、Relay connections、錯誤處理 |
| gRPC | Proto 慣例、服務命名、錯誤碼映射 |
| API 文件 | OpenAPI 規範需求 |
| 安全考量 | HTTPS、CORS、輸入驗證 |

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `core/api-design-standards.md` | Created | 英文主版本（938 行） |
| `.standards/api-design-standards.ai.yaml` | Created | AI 最佳化 YAML（192 行） |
| `ai/standards/api-design-standards.ai.yaml` | Created | ai/ 目錄副本 |
| `locales/zh-TW/core/api-design-standards.md` | Created | 繁體中文翻譯 |
| `cli/standards-registry.json` | Modified | 新增 registry 登錄 |
| `.standards/manifest.json` | Modified | 新增 manifest 項目 |
| `CLAUDE.md` | Modified | 標準計數 47→49 |

## Acceptance Criteria

- [x] AC-1: Given the core standards collection, When api-design-standards.md is added, Then it follows the standard template format (Version, Scope, Industry Standards, References, sections, Quick Reference Card, Version History, License).
- [x] AC-2: Given the new standard, When scope is evaluated, Then it is marked as `universal` (applicable to all software projects).
- [x] AC-3: Given the standard content, When reviewed, Then it covers REST, GraphQL, and gRPC paradigms with decision matrices and code examples.
- [x] AC-4: Given the AI-optimized version, When created, Then it contains structured rules, quick_reference tables, and meta information.
- [x] AC-5: Given the zh-TW translation, When synced, Then the frontmatter reflects source_version=1.0.0 and status=current.
- [x] AC-6: Given all sync scripts, When `check-standards-sync.sh` and `check-translation-sync.sh` are run, Then all checks pass.

## Industry Standards Referenced

- OpenAPI 3.x
- JSON:API 1.1
- Google API Design Guide
- RFC 7231 (HTTP Semantics)
- RFC 7807 (Problem Details)
