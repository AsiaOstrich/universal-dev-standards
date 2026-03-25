# [SPEC-CLI-UPDATE-NOTIFY] Feature: 改善版本更新通知觸發範圍

**Status**: Archived
**Created**: 2026-03-25
**Author**: AI-assisted

## Overview

改善版本更新通知機制，涵蓋兩個層級：

1. **CLI 層**：修復 `uds --version` 不觸發更新檢查的問題，並將觸發策略從白名單改為黑名單
2. **AI Agent 層**：將 `version-check-on-uds-operation` 規則從 `optional` 提升為 `required`，確保 AI 工具啟動後首次使用斜線命令/Skills 時觸發版本檢查，且每次對話僅提醒一次

## Motivation

目前版本更新通知存在三個盲區：

1. **`--version` 不觸發 `postAction`**：Commander.js 的 `.version()` 是內建行為，不經過 action handler
2. **CLI 白名單太窄**：`notifyCommands` 只有 4 個指令（`init`, `list`, `add`, `config`），大量常用指令被排除
3. **AI Agent 層檢查為 optional**：`context-aware-loading.ai.yaml` 中的 `version-check-on-uds-operation` 規則標記為 `optional`，AI agent 可以選擇忽略，導致斜線命令使用者也收不到更新提示

這導致跑 pre-release 版本的使用者無法及時得知穩定版已發布。

## Requirements

### REQ-1: `--version` 觸發更新檢查

系統 SHALL 在使用者執行 `uds --version` 或 `uds -V` 時，檢查是否有新版本可用，並在版本號輸出後顯示更新提示。

#### Scenario: 有新版本時顯示提示
- **GIVEN** 目前安裝版本為 `5.0.0-rc.17`，npm 最新穩定版為 `5.0.0`
- **WHEN** 使用者執行 `uds --version`
- **THEN** 系統輸出版本號 `5.0.0-rc.17`，接著顯示更新提示框

#### Scenario: 已是最新版不顯示提示
- **GIVEN** 目前安裝版本為 `5.0.0`，npm 最新穩定版為 `5.0.0`
- **WHEN** 使用者執行 `uds --version`
- **THEN** 系統只輸出版本號 `5.0.0`，不顯示更新提示

#### Scenario: 離線時不阻塞
- **GIVEN** 無網路連線
- **WHEN** 使用者執行 `uds --version`
- **THEN** 系統正常輸出版本號，不顯示錯誤訊息

### REQ-2: 擴大 CLI 更新通知觸發範圍

系統 SHALL 採用黑名單策略，預設對所有指令觸發更新檢查，僅排除不適合的指令。

#### Scenario: 常用指令觸發更新檢查
- **GIVEN** 有新版本可用
- **WHEN** 使用者執行 `uds check`、`uds audit`、`uds skills` 等指令
- **THEN** 指令完成後顯示更新提示

#### Scenario: 排除的指令不觸發
- **GIVEN** 有新版本可用
- **WHEN** 使用者執行 `uds update`（本身就是更新指令）或 `uds simulate`（需要快速回應）
- **THEN** 不顯示更新提示

### REQ-3: AI Agent 層首次斜線命令/Skills 使用時觸發版本檢查

`context-aware-loading.ai.yaml` 中的 `version-check-on-uds-operation` 規則 SHALL 從 `optional` 提升為 `required`，確保 AI agent 在每次對話中**首次**使用 UDS 斜線命令或 Skills 時執行版本檢查。

#### Scenario: 對話首次使用斜線命令時顯示版本提示
- **GIVEN** AI 工具（如 Claude Code）已啟動，且 UDS 有新版本可用
- **WHEN** 使用者首次執行 `/sdd`、`/tdd`、`/commit` 等 UDS 斜線命令
- **THEN** AI agent 在回應前顯示一行版本提示：「ℹ UDS v{latest} 已發布（目前 v{current}）— 執行 `uds update` 更新」

#### Scenario: 同次對話後續斜線命令不重複提示
- **GIVEN** AI agent 已在本次對話中顯示過版本提示
- **WHEN** 使用者再次執行其他 UDS 斜線命令
- **THEN** 不再顯示版本提示

#### Scenario: npm 不可達時靜默跳過
- **GIVEN** 無網路連線或 npm registry 不可達
- **WHEN** 使用者執行 UDS 斜線命令
- **THEN** AI agent 靜默跳過版本檢查，正常執行斜線命令功能

## Acceptance Criteria

### CLI 層
- **AC-1**: Given 有新版本可用, when 執行 `uds --version`, then 版本號後顯示更新提示
- **AC-2**: Given 有新版本可用, when 執行黑名單以外的任意指令, then 指令完成後顯示更新提示
- **AC-3**: Given 無網路或 `UDS_NO_UPDATE_CHECK=1`, when 執行任何指令, then 不顯示錯誤且不影響正常功能
- **AC-4**: Given 已是最新版, when 執行任何指令, then 不顯示更新提示
- **AC-5**: 更新檢查 SHALL 保持 24 小時節流機制，不增加網路請求頻率

### AI Agent 層
- **AC-6**: Given 有新版本可用, when AI 工具啟動後首次使用 UDS 斜線命令/Skills, then 顯示一行版本提示
- **AC-7**: Given 已在本次對話顯示過版本提示, when 再次使用 UDS 斜線命令/Skills, then 不重複提示
- **AC-8**: Given npm 不可達, when 使用 UDS 斜線命令/Skills, then 靜默跳過不影響功能
- **AC-9**: `version-check-on-uds-operation` 規則的 priority SHALL 從 `optional` 改為 `required`

## Technical Design

### 一、CLI 層

#### 1. 覆寫 `--version` 行為

移除 Commander 的 `.version()` 呼叫，改用自訂邏輯：

```js
program
  .option('-V, --version', 'output the version number')
  .on('option:version', () => {
    console.log(pkg.version);
    maybeCheckForUpdates(pkg.version).then(result => {
      if (result?.shouldNotify) {
        console.log(formatUpdateNotice(result, t()));
      }
      process.exit(0);
    }).catch(() => process.exit(0));
  });
```

#### 2. 反轉為黑名單策略

```js
// Before (白名單)
const notifyCommands = ['init', 'list', 'add', 'config'];
if (!notifyCommands.includes(cmd)) return;

// After (黑名單)
const skipUpdateCheckCommands = ['update', 'simulate', 'fix'];
if (skipUpdateCheckCommands.includes(cmd)) return;
```

黑名單理由：
- `update`：本身就是更新指令，會自己檢查版本
- `simulate`：預測驗證，需快速回應
- `fix`：自動修復，需快速回應

#### 3. 抽取可測試函式

新增 `shouldCheckUpdateForCommand(cmdName)` 到 `update-checker.js`：

```js
const SKIP_UPDATE_CHECK_COMMANDS = ['update', 'simulate', 'fix'];

export function shouldCheckUpdateForCommand(cmdName) {
  return !SKIP_UPDATE_CHECK_COMMANDS.includes(cmdName);
}
```

### 二、AI Agent 層

#### 修改 `context-aware-loading.ai.yaml`

將 `version-check-on-uds-operation` 的 `priority` 從 `optional` 改為 `required`。

同步修改：
- `.standards/context-aware-loading.ai.yaml`
- `ai/standards/context-aware-loading.ai.yaml`

### 影響範圍

| 檔案 | 變更 |
|------|------|
| `cli/bin/uds.js` | 覆寫 `--version` 行為、修改 `postAction` hook |
| `cli/src/utils/update-checker.js` | 新增 `shouldCheckUpdateForCommand()` |
| `ai/standards/context-aware-loading.ai.yaml` | `version-check-on-uds-operation` priority: optional → required |
| `.standards/context-aware-loading.ai.yaml` | 同步上述變更 |
| `cli/tests/unit/utils/update-checker.test.js` | 新增 AC-1, AC-2 測試 |

## Test Plan

### CLI 層
- [ ] 單元測試：`shouldCheckUpdateForCommand` 黑名單指令回傳 false（AC-2）
- [ ] 單元測試：`shouldCheckUpdateForCommand` 非黑名單指令回傳 true（AC-2）
- [ ] 單元測試：`maybeCheckForUpdates` 離線/停用時回傳 null（AC-3，已存在）
- [ ] 單元測試：`maybeCheckForUpdates` 已是最新版時不通知（AC-4，已存在）
- [ ] 單元測試：`shouldThrottle` 24hr 節流機制（AC-5，已存在）
- [ ] E2E 測試：`uds --version` 正常輸出版本號（AC-1）

### AI Agent 層
- [ ] YAML 驗證：`version-check-on-uds-operation` priority 為 `required`（AC-9）
- [ ] 手動驗證：AI 工具首次斜線命令觸發版本檢查（AC-6）
- [ ] 手動驗證：同次對話不重複提示（AC-7）

## Out of Scope

- 修改 `compareVersions` 的版本比較邏輯（目前 rc < stable 已正確）
- 修改 24 小時節流機制
- 新增自動更新功能
- 修改 AI agent 版本檢查的具體步驟（1-6 步不變，僅改 priority）
