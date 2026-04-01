# [SPEC-COMPILE-001] Feature: Standards-as-Hooks 編譯器 (uds compile)

- **Status**: Archived
- **Created**: 2026-04-01
- **Issue**: #64
- **Phase**: harness-engineering Phase 3
- **Scope**: uds-specific
- **Depends-on**: SPEC-HOOKS-001 (Implemented), SPEC-LAYERED-001 (Implemented)

## Overview

實現 `uds compile --target=claude-code` 命令，將有 `enforcement` 欄位的 `.ai.yaml` 標準自動編譯為 Harness hook 配置，寫入 `.claude/settings.json`。實現「安裝標準 = 啟用強制執行」的零配置合規。

## Motivation

目前 enforcement hooks 透過 `uds init --with-hooks` 手動安裝，hook 配置硬編碼在 `hooks-installer.js` 中。`uds compile` 將此流程自動化——掃描所有已安裝標準的 `enforcement` 區塊，動態生成 hook 配置。未來新增標準只需加上 `enforcement` 欄位，無需修改安裝邏輯。

## Requirements

### REQ-1: 編譯器基類

系統 SHALL 提供 `base-compiler.js` 定義編譯器介面。

#### Scenario: 編譯器介面定義

- **GIVEN** 一組含 `enforcement` 欄位的標準
- **WHEN** 呼叫 `compile(standards)`
- **THEN** 回傳目標平台的 hook 配置物件

#### Scenario: 可擴展性

- **GIVEN** base-compiler 定義的介面
- **WHEN** 新增一個 target（如 cursor）
- **THEN** 只需繼承 base-compiler 並實作 `compile()` 方法

### REQ-2: Claude Code 編譯器

系統 SHALL 提供 `claude-code-compiler.js`，將 enforcement 標準編譯為 `.claude/settings.json` 格式。

#### Scenario: 編譯 3 個 enforcement 標準

- **GIVEN** commit-message、security-standards、logging 三個標準含 enforcement
- **WHEN** 執行 claude-code-compiler
- **THEN** 產出包含 PreToolUse、PostToolUse、UserPromptSubmit 三個 hook event 的配置

#### Scenario: trigger 對應

- **GIVEN** enforcement.trigger 為 `PreToolUse`
- **WHEN** 編譯為 Claude Code 格式
- **THEN** 產出 `hooks.PreToolUse` 陣列中的 hook entry

#### Scenario: 無 enforcement 標準被忽略

- **GIVEN** 一個沒有 `enforcement` 欄位的標準
- **WHEN** 執行編譯
- **THEN** 該標準不出現在產出中

### REQ-3: Compile 命令

系統 SHALL 提供 `uds compile` CLI 命令。

#### Scenario: compile --target=claude-code

- **GIVEN** 專案已安裝 UDS 標準
- **WHEN** 執行 `uds compile --target=claude-code`
- **THEN** 產出正確的 `.claude/settings.json` hook 配置

#### Scenario: compile --dry-run

- **GIVEN** 專案已安裝 UDS 標準
- **WHEN** 執行 `uds compile --target=claude-code --dry-run`
- **THEN** 顯示即將產出的配置但不寫入檔案

#### Scenario: 未初始化的專案

- **GIVEN** 專案未執行 `uds init`
- **WHEN** 執行 `uds compile`
- **THEN** 顯示錯誤提示執行 `uds init`

### REQ-4: 向下相容

系統 SHALL 確保無 `enforcement` 欄位的標準不受影響。

#### Scenario: 既有標準不受影響

- **GIVEN** 78 個標準中只有 3 個有 enforcement
- **WHEN** 執行 compile
- **THEN** 只有 3 個標準被編譯，其餘 75 個忽略

## Acceptance Criteria

| AC | 說明 | REQ |
|----|------|-----|
| AC-1 | `uds compile --target=claude-code` 產出正確的 hooks 配置 | REQ-2, REQ-3 |
| AC-2 | 無 `enforcement` 欄位的標準不受影響 | REQ-4 |
| AC-3 | 產出的 hook 配置格式可被 Claude Code 正確載入 | REQ-2 |
| AC-4 | 支援未來擴展其他 target | REQ-1 |

## Technical Design

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `cli/src/commands/compile.js` | CLI 命令：讀取標準 → 篩選 → 編譯 |
| `cli/src/compilers/base-compiler.js` | 編譯器基類 |
| `cli/src/compilers/claude-code-compiler.js` | Claude Code 目標編譯器 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `cli/bin/uds.js` | 註冊 `compile` 命令 |

### 編譯流程

```
.standards/*.ai.yaml
    │
    ▼  (掃描 enforcement 區塊)
[enforceable standards]
    │
    ▼  (target compiler)
claude-code-compiler.js
    │
    ▼  (merge with existing)
.claude/settings.json
```

### 標準 enforcement 格式（既有）

```yaml
enforcement:
  hook_script: scripts/hooks/validate-commit-msg.js
  trigger: UserPromptSubmit
  severity: error
```

### 編譯產出格式（Claude Code）

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "matcher": "", "hooks": ["node scripts/hooks/validate-commit-msg.js"] }
    ],
    "PreToolUse": [
      { "matcher": "Bash", "hooks": ["node scripts/hooks/check-dangerous-cmd.js"] }
    ],
    "PostToolUse": [
      { "matcher": "Bash", "hooks": ["node scripts/hooks/check-logging-standard.js"] }
    ]
  }
}
```

### Matcher 推導規則

| Trigger | Default Matcher |
|---------|----------------|
| `UserPromptSubmit` | `""` (match all) |
| `PreToolUse` | `"Bash"` |
| `PostToolUse` | `"Bash"` |

## Test Plan

- [ ] `base-compiler.js` 單元測試（介面驗證）
- [ ] `claude-code-compiler.js` 單元測試（3 個 enforcement 標準編譯）
- [ ] `compile.js` 命令測試（--target, --dry-run, 未初始化錯誤）
- [ ] 向下相容測試（無 enforcement 標準忽略）

## Dependencies

- **依賴**: SPEC-HOOKS-001 (enforcement 格式), SPEC-LAYERED-001 (標準格式)
- **被依賴**: Issue #65 (Telemetry)
