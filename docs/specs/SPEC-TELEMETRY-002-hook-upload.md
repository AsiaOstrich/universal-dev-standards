# [SPEC-TELEMETRY-002] Feature: Hook 執行結果遠端遙測上傳（Opt-in）

- **Status**: Approved
- **Created**: 2026-04-10
- **Depends-on**: SPEC-TELEMETRY-001 (Archived — 本地記錄已實作)
- **Scope**: uds-specific
- **Phase**: harness-engineering Phase 4

## Overview

擴充 `.uds/config.json`，加入三個遙測上傳欄位（`telemetryUpload`、`telemetryServer`、`telemetryApiKey`）。當使用者明確 opt-in 後，`telemetry-wrapper.js` 在每次 hook 執行完成（pass 或 fail）後，將結果 payload 上傳至遠端遙測伺服器。預設完全關閉，零數據離開本機。

## Motivation

SPEC-TELEMETRY-001 已實作本地 `.standards/telemetry.jsonl` 記錄。本 spec 增加遠端上傳能力，讓 AsiaOstrich 可收集匿名 hook 健康度數據，了解各項標準的 pass/fail 分佈，以改善標準品質。

隱私設計原則：
1. 預設關閉（雙重守衛：`telemetryUpload=true` + `telemetryApiKey≠""`）
2. Payload 不含原始碼、檔案路徑、使用者名稱
3. `user_id` 使用 SHA256(hostname+platform+arch) 的前 16 字元（不可逆匿名化）

## Requirements

### REQ-1: Config 擴充

`.uds/config.json` SHALL 支援三個新欄位，且與現有 `hookStats` 完全共存。

#### Scenario: 讀取 telemetryUpload 預設值

- **GIVEN** `.uds/config.json` 不存在
- **WHEN** 讀取 `telemetryUpload`
- **THEN** 回傳 `false`（預設關閉）

#### Scenario: 讀取 telemetryUpload=true

- **GIVEN** `.uds/config.json` 包含 `{ "telemetryUpload": true, "telemetryApiKey": "key123" }`
- **WHEN** 讀取設定
- **THEN** `telemetryUpload` 為 `true`，`telemetryApiKey` 為 `"key123"`

#### Scenario: 讀取 telemetryApiKey 預設值

- **GIVEN** `.uds/config.json` 存在但無 `telemetryApiKey`
- **WHEN** 讀取 `telemetryApiKey`
- **THEN** 回傳 `""` 或 `undefined`（視同 disabled）

### REQ-2: 雙重守衛（Double Guard）

系統 SHALL 實作雙重守衛：只有 `telemetryUpload === true` 且 `telemetryApiKey` 非空字串時，才執行上傳。

#### Scenario: telemetryUpload=false 時不上傳（AC-1）

- **GIVEN** `.uds/config.json` 包含 `{ "telemetryUpload": false }`
- **WHEN** hook 執行完成
- **THEN** 不發出任何 HTTP 請求，`TelemetryUploader.upload` 未被呼叫

#### Scenario: telemetryApiKey="" 時不上傳（AC-5）

- **GIVEN** `.uds/config.json` 包含 `{ "telemetryUpload": true, "telemetryApiKey": "" }`
- **WHEN** hook 執行完成
- **THEN** 不發出任何 HTTP 請求（空 apiKey 視同 disabled）

#### Scenario: 雙重守衛通過時上傳（AC-2）

- **GIVEN** `.uds/config.json` 包含 `{ "telemetryUpload": true, "telemetryApiKey": "valid-key" }`
- **WHEN** hook 執行完成
- **THEN** `TelemetryUploader.upload` 被呼叫一次，payload 格式正確

### REQ-3: Payload 隱私保護

上傳的 payload SHALL 不含原始碼、檔案路徑、使用者名稱等可識別個人資訊（AC-3）。

#### Scenario: Payload 結構符合規格

- **GIVEN** hook `validate-commit-msg` 執行成功，耗時 85ms
- **WHEN** 上傳 payload
- **THEN** payload 包含且僅包含：
  - `project`: 專案名稱（非路徑）
  - `event_type`: hook 類型（如 `"UserPromptSubmit"`）
  - `standard_id`: 標準 ID（如 `"commit-message"`）
  - `pass`: 布林值
  - `duration_ms`: 數字
  - `user_id`: SHA256 匿名 ID（16 hex chars）

#### Scenario: Payload 不含敏感資訊

- **GIVEN** 執行環境包含使用者家目錄路徑
- **WHEN** 建立並上傳 payload
- **THEN** payload 不含 `/Users/`、`/home/`、使用者名稱等路徑片段

### REQ-4: 伺服器失敗不阻斷 Hook（AC-4）

上傳失敗（HTTP 5xx、timeout、網路中斷）SHALL 被靜默捕捉，hook 正常以原始 exit code 完成。

#### Scenario: 伺服器回傳 500

- **GIVEN** 遙測伺服器回應 HTTP 500
- **WHEN** 上傳函式呼叫
- **THEN** 函式靜默解決（不 throw），hook exit code 不受影響

#### Scenario: 網路超時

- **GIVEN** 遙測伺服器無回應（timeout）
- **WHEN** 上傳函式呼叫
- **THEN** 函式靜默解決，hook 正常完成

## Acceptance Criteria

| AC | 說明 | REQ |
|----|------|-----|
| AC-1 | `telemetryUpload=false`（預設）時，零 HTTP 請求 | REQ-2 |
| AC-2 | `telemetryUpload=true` + `telemetryApiKey` 非空時，hook 結果上傳 | REQ-2 |
| AC-3 | Payload 不含原始碼、檔案路徑、使用者名稱 | REQ-3 |
| AC-4 | 伺服器不可用時，hook 正常完成，不影響 CI | REQ-4 |
| AC-5 | `telemetryApiKey=""` 時視同 disabled，不上傳 | REQ-2 |

## Technical Design

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `cli/src/utils/telemetry-uploader.js` | 雙重守衛 + payload 建立 + SDK 包裝 |
| `cli/tests/unit/utils/telemetry-uploader.test.js` | AC-1 ~ AC-5 測試 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `scripts/hooks/telemetry-wrapper.js` | 呼叫 `uploadHookTelemetry()` 於本地記錄後 |
| `package.json` (root) | 加入 `@asiaostrich/telemetry-client` dependency |
| `cli/package.json` | 加入 `@asiaostrich/telemetry-client` dependency |

### Config 結構

```json
{
  "hookStats": true,
  "telemetryUpload": false,
  "telemetryServer": "https://asiaostrich-telemetry-server.asiaostrich-telemetry.workers.dev",
  "telemetryApiKey": ""
}
```

### Payload 結構

```json
{
  "project": "universal-dev-standards",
  "event_type": "UserPromptSubmit",
  "standard_id": "commit-message",
  "pass": true,
  "duration_ms": 85,
  "user_id": "a1b2c3d4e5f6a7b8"
}
```

### user_id 生成

```javascript
import { createHash } from 'crypto';
import { hostname, platform, arch } from 'os';

function getAnonymousUserId() {
  const raw = `${hostname()}:${platform()}:${arch()}`;
  return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}
```

### SDK 整合

使用 `@asiaostrich/telemetry-client`：
- `TelemetryUploader` — HTTP 上傳 + offline queue
- `redactObject` — 自動移除敏感欄位

## Test Plan

- [x] `cli/tests/unit/utils/telemetry-uploader.test.js` — AC-1 ~ AC-5 單元測試
- [ ] 手動驗證：`telemetryUpload=true` + 真實 API key 上傳至 staging server

## Dependencies

- **依賴**: SPEC-TELEMETRY-001 (本地記錄已完成)
- **SDK**: `@asiaostrich/telemetry-client@0.1.0`
- **被依賴**: 無
