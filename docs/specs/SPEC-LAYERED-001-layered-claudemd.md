# [SPEC-LAYERED-001] Feature: 分層 CLAUDE.md — Context-aware Loading

- **Status**: Implemented
- **Created**: 2026-04-01
- **Issue**: #63
- **Phase**: harness-engineering Phase 2
- **Scope**: uds-specific
- **Depends-on**: SPEC-HOOKS-001 (Implemented)

## Overview

擴展 `uds init` 生成分層 CLAUDE.md 結構，根層只放核心標準摘要，子目錄放對應 domain 的標準全文。將 context token 消耗減少 80-90%。

## Motivation

目前 `uds init` 生成單一 CLAUDE.md，將所有標準內容放在根目錄。對於大型專案（50+ 標準），這會消耗大量 context token。Claude Code 支援子目錄 CLAUDE.md 機制——只有進入該目錄時才載入內容。利用此特性可大幅降低 token 消耗，同時保持標準覆蓋率。

## Requirements

### REQ-1: 標準→目錄映射

系統 SHALL 提供 `directory-mapper.js` 模組，定義標準到專案子目錄的映射關係。

#### Scenario: 資料庫標準映射

- **GIVEN** 專案包含 `src/database/` 目錄
- **WHEN** directory-mapper 掃描專案結構
- **THEN** `database-standards` 映射到 `src/database/`

#### Scenario: 測試標準映射

- **GIVEN** 專案包含 `tests/` 目錄
- **WHEN** directory-mapper 掃描專案結構
- **THEN** `testing` 相關標準映射到 `tests/`

#### Scenario: API 標準映射

- **GIVEN** 專案包含 `src/api/` 或 `src/routes/` 目錄
- **WHEN** directory-mapper 掃描專案結構
- **THEN** `api-design-standards` 映射到該目錄

#### Scenario: 無匹配目錄的標準

- **GIVEN** 某標準沒有匹配的子目錄
- **WHEN** directory-mapper 完成掃描
- **THEN** 該標準歸入根目錄 CLAUDE.md

### REQ-2: 分層 CLAUDE.md 生成

系統 SHALL 提供 `layered-claudemd.js` 生成器，掃描專案目錄並生成子目錄 CLAUDE.md。

#### Scenario: 生成子目錄 CLAUDE.md

- **GIVEN** directory-mapper 已完成映射
- **WHEN** 執行分層生成
- **THEN** 每個匹配的子目錄產生一個 CLAUDE.md，包含對應 domain 的標準全文

#### Scenario: 根目錄 CLAUDE.md 為摘要

- **GIVEN** 使用 layered 模式
- **WHEN** 生成根目錄 CLAUDE.md
- **THEN** 只包含 always-on 標準摘要，不包含 domain-specific 全文

#### Scenario: UDS 標記區塊隔離

- **GIVEN** 生成的子目錄 CLAUDE.md
- **WHEN** 檢查其內容
- **THEN** UDS 生成的內容包裹在 `<!-- UDS:STANDARDS:BEGIN -->` / `<!-- UDS:STANDARDS:END -->` 標記中

### REQ-3: Init 命令 --content-layout 選項

系統 SHALL 在 `uds init` 新增 `--content-layout` 選項，支援 `flat`（預設）和 `layered` 兩種模式。

#### Scenario: layered 模式初始化

- **GIVEN** 使用者執行 `uds init --content-layout layered -y`
- **WHEN** 初始化流程完成
- **THEN** 生成分層 CLAUDE.md 結構

#### Scenario: flat 模式為預設

- **GIVEN** 使用者執行 `uds init -y`（不指定 content-layout）
- **WHEN** 初始化流程完成
- **THEN** 使用既有的單一 CLAUDE.md 模式

#### Scenario: 無子目錄 fallback

- **GIVEN** 專案無可匹配的子目錄
- **WHEN** 使用 layered 模式
- **THEN** 自動降級為 flat 模式，並輸出提示

### REQ-4: Update 命令保留自訂內容

系統 SHALL 在 `uds update` 時保留使用者在子目錄 CLAUDE.md 中的自訂內容。

#### Scenario: 更新不覆蓋自訂內容

- **GIVEN** 使用者在 `tests/CLAUDE.md` 的 UDS 標記外新增了自訂內容
- **WHEN** 執行 `uds update`
- **THEN** UDS 標記內的內容被更新，標記外的自訂內容被保留

#### Scenario: 新增子目錄時追加 CLAUDE.md

- **GIVEN** 使用者在 update 前新增了 `src/api/` 目錄
- **WHEN** 執行 `uds update`
- **THEN** 自動在 `src/api/` 生成新的 CLAUDE.md

## Acceptance Criteria

| AC | 說明 | REQ |
|----|------|-----|
| AC-1 | 有 `src/database/` 的專案執行 `uds init --content-layout layered` 後，`src/database/CLAUDE.md` 包含 database-standards | REQ-1, REQ-2 |
| AC-2 | `tests/CLAUDE.md` 包含 testing 相關標準 | REQ-1, REQ-2 |
| AC-3 | 根目錄 CLAUDE.md 只包含 always-on 標準摘要 | REQ-2 |
| AC-4 | `uds update` 不覆蓋使用者在子目錄 CLAUDE.md 中的自訂內容 | REQ-4 |
| AC-5 | 無子目錄的專案仍正常運作（fallback to flat mode） | REQ-3 |

## Technical Design

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `cli/src/utils/directory-mapper.js` | 標準→目錄映射模組 |
| `cli/src/generators/layered-claudemd.js` | 分層 CLAUDE.md 生成器 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `cli/src/installers/integration-installer.js` | 支援 `contentMode: "layered"` |
| `cli/src/commands/init.js` | 新增 `--content-layout flat\|layered` 選項 |
| `cli/bin/uds.js` | 註冊 `--content-layout` option |
| `cli/src/commands/update.js` | 保留使用者自訂的子目錄 CLAUDE.md 內容 |

### 標準→目錄預設映射

```javascript
const DEFAULT_MAPPINGS = {
  'database-standards': ['**/database/', '**/db/', '**/models/'],
  'testing': ['**/tests/', '**/test/', '**/__tests__/'],
  'api-design-standards': ['**/api/', '**/routes/', '**/endpoints/'],
  'security-standards': ['**/auth/', '**/security/'],
  'logging': ['**/logging/', '**/logger/'],
  'deployment-standards': ['**/deploy/', '**/infra/', '**/.github/'],
  'containerization-standards': ['**/docker/', '**/containers/'],
};
```

### UDS 標記區塊格式

```markdown
<!-- UDS:STANDARDS:BEGIN -->
[UDS 生成的標準內容]
<!-- UDS:STANDARDS:END -->

[使用者自訂內容（update 時保留）]
```

### 既有架構整合

- 複用 `generateIntegrationContent()` 的三種 contentMode（minimal/index/full）
- 根目錄使用 `minimal` mode，子目錄使用 `full` mode
- 複用 `UDS_MARKERS` 常數（`cli/src/core/constants.js`）
- 複用 `wrapWithMarkers()` 函式

## Test Plan

- [ ] `directory-mapper.js` 單元測試（各種目錄結構映射）
- [ ] `layered-claudemd.js` 單元測試（生成/fallback/UDS 標記）
- [ ] `init.js` 整合測試（--content-layout flag）
- [ ] `update.js` 整合測試（保留自訂內容）
- [ ] 無子目錄 fallback 測試

## Dependencies

- **依賴**: SPEC-HOOKS-001 (Implemented) — hooks-installer 模式可複用
- **被依賴**: Issue #64 (Phase 3 Standards-as-Hooks 編譯器)
