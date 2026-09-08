# [SPEC-HOOKS-001] Feature: 核心標準 Hook 實作

- **Status**: Archived
- **Created**: 2026-04-01
- **Issue**: #62
- **Phase**: harness-engineering Phase 1
- **Scope**: uds-specific

## Overview

為 commit-message、security-standards、logging 三個核心標準新增可自動執行的 hook 腳本，並擴展 `uds init` 流程支援 hook 安裝配置。

## Motivation

目前 UDS 標準僅透過 context-aware loading 被動載入 AI 對話。Hook 機制可主動攔截不合規行為（如格式錯誤的 commit message、危險命令），從「建議」升級為「強制執行」。此為 Phase 2（分層 CLAUDE.md）和 Phase 3（Standards-as-Hooks 編譯器）的基礎。

## Requirements

### REQ-1: Commit Message 驗證 Hook

系統 SHALL 提供 commit message 格式驗證腳本，攔截不符合 Conventional Commits 格式的提交。

#### Scenario: 合規的 commit message 通過驗證

- **GIVEN** 使用者輸入 `feat(core): add hook support`
- **WHEN** 執行 `validate-commit-msg.mjs`
- **THEN** 腳本以 exit code 0 結束

#### Scenario: 不合規的 commit message 被攔截

- **GIVEN** 使用者輸入 `bad message`
- **WHEN** 執行 `validate-commit-msg.mjs`
- **THEN** 腳本以 exit code 1 結束，並輸出錯誤提示

#### Scenario: 支援的 commit type 清單

- **GIVEN** 標準 type 清單：feat, fix, docs, chore, test, refactor, style, perf, ci, build, revert
- **WHEN** 驗證包含任一合法 type 的 commit message
- **THEN** 驗證通過

### REQ-2: 危險命令偵測 Hook

系統 SHALL 提供危險 shell 命令偵測腳本，攔截可能造成破壞的操作模式。

#### Scenario: 偵測強制刪除命令

- **GIVEN** 使用者的 shell 命令包含 `rm -rf /` 或 `format` 等危險模式
- **WHEN** 執行 `check-dangerous-cmd.mjs`
- **THEN** 腳本以 exit code 1 結束，輸出警告訊息

#### Scenario: 安全命令通過

- **GIVEN** 使用者的 shell 命令為 `ls -la` 或 `npm test`
- **WHEN** 執行 `check-dangerous-cmd.mjs`
- **THEN** 腳本以 exit code 0 結束

### REQ-3: 結構化日誌檢查 Hook

系統 SHALL 提供結構化日誌格式檢查腳本，檢查程式碼是否遵循 logging 標準。

#### Scenario: 檢查非結構化日誌呼叫

- **GIVEN** 程式碼中包含 `console.log("debug info")` 等非結構化日誌
- **WHEN** 執行 `check-logging-standard.mjs`
- **THEN** 腳本以 exit code 1 結束，提示使用結構化日誌

#### Scenario: 結構化日誌通過檢查

- **GIVEN** 程式碼使用符合標準的結構化日誌（如 JSON 格式 logger）
- **WHEN** 執行 `check-logging-standard.mjs`
- **THEN** 腳本以 exit code 0 結束

### REQ-4: Hook 安裝模組

系統 SHALL 提供 `hooks-installer.js` 模組，負責複製 hook 腳本並生成/合併 `.claude/settings.json`。

#### Scenario: 首次安裝 — 無既有 settings.json

- **GIVEN** 目標專案不存在 `.claude/settings.json`
- **WHEN** 執行 hook 安裝
- **THEN** 建立新的 `.claude/settings.json`，包含三個 hook 配置

#### Scenario: 合併安裝 — 既有 settings.json

- **GIVEN** 目標專案已存在 `.claude/settings.json`，含有使用者自訂設定
- **WHEN** 執行 hook 安裝
- **THEN** 合併 hook 配置至既有檔案，不覆蓋使用者自訂設定

#### Scenario: 冪等性

- **GIVEN** hook 已安裝過一次
- **WHEN** 再次執行 hook 安裝
- **THEN** 不產生重複的 hook 配置

### REQ-5: Init 命令整合

系統 SHALL 在 `uds init` 新增 `--with-hooks` flag，支援安裝 hook 配置。

#### Scenario: 使用 --with-hooks 初始化

- **GIVEN** 使用者執行 `uds init --with-hooks -y`
- **WHEN** 初始化流程完成
- **THEN** 生成正確的 `.claude/settings.json`，包含三個 hook 配置

#### Scenario: 不使用 --with-hooks（預設行為）

- **GIVEN** 使用者執行 `uds init -y`（不含 --with-hooks）
- **WHEN** 初始化流程完成
- **THEN** 不安裝 hook 配置

### REQ-6: Hook 統計記錄

系統 SHALL 擴展 `hook-stats.js`，支援記錄新的 hook 類型統計。

#### Scenario: 記錄 hook 執行統計

- **GIVEN** hookStats 已啟用（`.uds/config.json` 設定 `hookStats: true`）
- **WHEN** 任一 hook 腳本執行完畢
- **THEN** `appendHookStat()` 正確記錄 `hook_type` 欄位（`commit-msg` | `security` | `logging`）

### REQ-7: 標準 YAML 擴展

系統 SHALL 為 commit-message、security-standards、logging 三個 `.ai.yaml` 標準新增 `enforcement` 區塊。

#### Scenario: enforcement 區塊結構

- **GIVEN** 標準 YAML 檔案
- **WHEN** 讀取 `enforcement` 區塊
- **THEN** 包含 `hook_script`（腳本路徑）、`trigger`（觸發事件類型）、`severity`（嚴重等級）

## Acceptance Criteria

| AC | 說明 | REQ |
|----|------|-----|
| AC-1 | `uds init --with-hooks -y` 在測試專案生成正確的 `.claude/settings.json` | REQ-4, REQ-5 |
| AC-2 | commit message 驗證 hook 正確攔截不合規的 commit（exit 1） | REQ-1 |
| AC-3 | 危險命令偵測 hook 攔截危險操作模式 | REQ-2 |
| AC-4 | `hook-stats.js` 正確記錄新 hook 類型的統計 | REQ-6 |
| AC-5 | `npm test` 全套通過 | 全部 |

## Technical Design

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `scripts/hooks/validate-commit-msg.mjs` | Commit message 格式驗證 |
| `scripts/hooks/check-dangerous-cmd.mjs` | 危險 shell 命令攔截 |
| `scripts/hooks/check-logging-standard.mjs` | 結構化日誌格式檢查 |
| `cli/src/installers/hooks-installer.js` | Hook 安裝模組 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `cli/src/commands/init.js` | 新增 `--with-hooks` flag |
| `cli/src/installers/integration-installer.js` | 新增 hooks 安裝呼叫 |
| `scripts/hooks/inject-standards.mjs` | `domainTriggerMap` 新增 `enforcement` domain |
| `cli/src/utils/hook-stats.js` | `appendHookStat()` 新增 `hook_type` 欄位 |
| `.standards/commit-message.ai.yaml` | 新增 `enforcement` 區塊 |
| `.standards/security-standards.ai.yaml` | 新增 `enforcement` 區塊 |
| `.standards/logging.ai.yaml` | 新增 `enforcement` 區塊 |

### 效能約束

- 每個 hook 腳本執行延遲 MUST < 500ms
- Hook 錯誤不得阻塞 Claude Code 工作流程（非強制 hook 應 exit 0）

### settings.json 合併策略

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": ["node scripts/hooks/check-dangerous-cmd.mjs"]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": ["node scripts/hooks/check-logging-standard.mjs"]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": ["node scripts/hooks/validate-commit-msg.mjs"]
      }
    ]
  }
}
```

> **合併邏輯**：讀取既有 settings.json → deep merge hooks 陣列 → 依 hook script path 去重 → 寫回

## Test Plan

- [ ] `validate-commit-msg.mjs` 單元測試（合規/不合規/邊界案例）
- [ ] `check-dangerous-cmd.mjs` 單元測試（危險/安全命令模式）
- [ ] `check-logging-standard.mjs` 單元測試（結構化/非結構化日誌）
- [ ] `hooks-installer.js` 單元測試（首次安裝/合併/冪等）
- [ ] `init.js` 整合測試（--with-hooks flag）
- [ ] `hook-stats.js` 單元測試（新 hook_type 欄位）
- [ ] 效能測試（hook 執行 < 500ms）

## Dependencies

- **依賴**: 無
- **被依賴**: Issue #63 (Phase 2), Issue #64 (Phase 3), Issue #65 (Phase 3)

---

## REQ-8: 交付（2026-09-08 補，因為前七項全部成立而採用者一支也跑不到）

四個缺陷**同時存在**，每一個都靜默，而「檔案在不在」在四個裡面全都是 true：

| # | 缺陷 | 採用者看到的 | 怎麼量到的 |
|---|---|---|---|
| 1 | hook 條目寫成裸字串 | 安裝成功、settings.json 合法、**永不執行** | 同一次執行同一個事件裡並排兩臂：物件跑了、裸字串沒跑 |
| 2 | `scripts/hooks` 不在 npm 套件裡 | 複製 0 支腳本，仍回報 `installed: true` | `npm pack --dry-run` 只列出安裝器自己 |
| 3 | hook 是 ESM `.js` | 宣告 `"type":"commonjs"` 的專案**六支全部 SyntaxError**；沒宣告 type 的每回合往 stderr 噴警告 | 三種 package.json 各裝一次並實際執行 |
| 4 | commit 驗證掛在 `UserPromptSubmit` | **每打一句話就跑一次**，把那句話當 commit message 驗、exit 1 | 閘門執行安裝後的 hook，空輸入即現形 |

### 交付要求

- **R8-1** hook 條目必須是 `{ "type": "command", "command": … }`；`matcher` 必須是字串。
- **R8-2** hook 腳本副檔名必須是 `.mjs`。採用者的 `package.json` 不歸我們管，而 `.js` 的語意由它決定。
- **R8-3** 事件與腳本清單必須從標準的 `enforcement:` 區塊**走訪**，不得列舉在安裝器裡。
- **R8-4** 閘門必須**執行**裝好的每一支 hook，不是檢查它存在——四個缺陷裡「檔案在」全都是真的。

驗證：`npx tsx scripts/check-hook-delivery.ts [--with-pack]`（接在 pre-commit）。
四個缺陷各自放回去實測，閘門都會變紅。
