# [SPEC-SELFDIAG-001] Feature: Standards Self-Diagnosis System

- **Status**: Approved
- **Created**: 2026-03-29
- **Author**: AI-assisted
- **Priority**: High
- **Scope**: partial (Health Score/Scheduled/Integration 為 universal，Effectiveness Protocol 為 partial)

## Overview

讓 UDS 從「被動標準框架」升級為「能自我診斷的標準框架」。透過 6 項改進建立雙向回饋迴路：標準向下流動（UDS → DevAP → VibeOps），效果向上回饋（VibeOps → DevAP → UDS）。

## Motivation

### 問題陳述

1. **只有 issue list，沒有量化指標** — 現有 `uds audit` 產出 health/pattern/friction 三層診斷，但 maintainer 無法一眼判斷「整體好不好」，也無法追蹤改善趨勢
2. **所有檢查都是人工觸發** — 17 個 check 腳本 + 19 步 pre-release 檢查，但沒有持續監控機制
3. **跨工具整合無驗證** — 支援 13 個 AI 工具但改動 core 時無法驗證所有工具產出的正確性
4. **Context-aware hook 無學習能力** — fire-and-forget，不知道哪些 trigger 有盲區
5. **三套產品無向上回饋** — UDS 不知道哪些標準在 DevAP/VibeOps 實際使用中有效
6. **跨產品標準版本可能 drift** — DevAP/VibeOps 的 `.standards/` 版本可能落後

### 與現有能力的關係

| 現有能力 | 本規格擴展 |
|---------|-----------|
| `health-checker.js` (6 項檢查) | → 4 維度量化評分 + 趨勢追蹤 |
| `pattern-analyzer.js` (commit 分析) | → 整合進 Coverage 維度 |
| `friction-detector.js` (修改偵測) | → 整合進 Consistency 維度 |
| `check-*.sh` (17 個腳本) | → 排程自動執行 + 退化自動通知 |
| `inject-standards.js` (context-aware) | → 加入統計記錄 + 分析迴路 |
| `uds audit --report` (GitHub issue) | → 自動化回饋匯總 |

---

## Requirements

### REQ-1: Health Score 量化評分系統

系統 SHALL 提供 `uds audit --score` 指令，產出多維度量化健康評分。支援兩種模式：
- **Self 模式**（`--self`）：在 UDS repo 本身執行，使用 git 歷史和完整檔案結構
- **消費者模式**（預設）：在已安裝 UDS 的專案中執行，使用 manifest 時間戳和已安裝檔案

#### Scenario: 在 UDS repo 中執行 self 模式
- **GIVEN** 使用者在 UDS repo 根目錄中
- **WHEN** 執行 `uds audit --score --self`
- **THEN** 使用 git 歷史計算 Freshness，檢查 core/ai/skills/scripts/translations 計算 Completeness，產出 0-100 分數與 4 個維度分數

#### Scenario: 在消費者專案中執行
- **GIVEN** 使用者在已初始化 UDS 的消費者專案中
- **WHEN** 執行 `uds audit --score`
- **THEN** 使用 manifest 的 installedAt/upstream.version 計算 Freshness，檢查已安裝的 .standards/ 檔案計算其他維度

#### Scenario: JSON 格式輸出
- **GIVEN** 使用者執行 `uds audit --score --format json`
- **WHEN** 指令執行完畢
- **THEN** 產出結構化 JSON，包含 `score`、`dimensions`、`details`、`mode` 欄位

#### Scenario: CI 模式
- **GIVEN** CI 環境需要判斷健康狀態
- **WHEN** 執行 `uds audit --score --ci --threshold 75`
- **THEN** 分數 >= 閾值時 exit 0，低於閾值時 exit 1，只輸出分數

#### Scenario: 未初始化專案
- **GIVEN** 使用者在未初始化 UDS 的專案中
- **WHEN** 執行 `uds audit --score`
- **THEN** 顯示 ERROR 並建議執行 `uds init`

#### Scenario: Manifest 損壞時 graceful failure
- **GIVEN** `.standards/manifest.json` 存在但內容損壞
- **WHEN** 執行 `uds audit --score`
- **THEN** 顯示 ERROR 訊息說明 manifest 無法解析，建議執行 `uds update`，exit code 為 1

### REQ-2: 四維度評分計算

系統 SHALL 依據以下 4 個維度計算健康分數，每個維度 0-100 分。

#### REQ-2.1: Completeness（完整度，權重 25%）

系統 SHALL 檢查每個已安裝標準的生態系完整性。

#### Scenario: Self 模式計算完整度
- **GIVEN** 在 UDS repo 中使用 `--self` 模式
- **WHEN** 系統檢查每個標準的 core .md、ai .yaml、對應 skill、check script、翻譯
- **THEN** 依據各項目的存在比率計算完整度分數（5 項子指標）

#### Scenario: 消費者模式計算完整度
- **GIVEN** 在消費者專案中執行
- **WHEN** 系統檢查 `.standards/` 中每個檔案是否存在且完整
- **THEN** 依據 manifest 中已宣告標準 vs 實際存在檔案的比率計算完整度分數

#### REQ-2.2: Freshness（新鮮度，權重 25%）

系統 SHALL 依據標準檔案的更新狀態計算新鮮度。

#### Scenario: Self 模式計算新鮮度
- **GIVEN** 在 UDS repo 中使用 `--self` 模式
- **WHEN** 系統讀取每個標準的 git 最後修改時間
- **THEN** 依據時間分級計分：<30 天=100、30-90 天=75、90-180 天=50、>180 天=25

#### Scenario: 消費者模式計算新鮮度
- **GIVEN** 在消費者專案中執行
- **WHEN** 系統讀取 manifest 的 `upstream.version` 和 `upstream.installed` 時間戳
- **THEN** 比對 npm registry 的最新版本，計算版本落差分數

#### REQ-2.3: Consistency（一致性，權重 30%）

系統 SHALL 檢查標準間的同步狀態。

#### Scenario: 計算一致性
- **GIVEN** 專案有 core、ai yaml、翻譯等多層標準
- **WHEN** 系統檢查各層間的同步狀態
- **THEN** 依據同步比率計算一致性分數（core↔yaml 同步、翻譯同步、manifest 完整性）

#### REQ-2.4: Coverage（覆蓋度，權重 20%）

系統 SHALL 檢查標準的驗證覆蓋率。

#### Scenario: 計算覆蓋度
- **GIVEN** 專案有已安裝的標準
- **WHEN** 系統檢查每個標準是否有對應的驗證腳本和測試
- **THEN** 依據覆蓋比率計算覆蓋度分數

### REQ-3: 趨勢追蹤

系統 SHALL 支援健康分數的歷史趨勢追蹤。

#### Scenario: 儲存評分快照
- **GIVEN** 使用者執行 `uds audit --health-score --save`
- **WHEN** 評分計算完成
- **THEN** 將評分結果存入 `.uds/health-scores/YYYY-MM-DD.json`

#### Scenario: 顯示趨勢
- **GIVEN** `.uds/health-scores/` 目錄中有多份歷史快照
- **WHEN** 使用者執行 `uds audit --health-score --trend`
- **THEN** 顯示分數變化趨勢（ASCII 折線圖或表格）

#### Scenario: 偵測退化
- **GIVEN** 最新分數比上次下降超過 5 分
- **WHEN** 趨勢分析完成
- **THEN** 輸出退化警告，列出下降最多的維度

---

### REQ-4: 排程自我診斷

系統 SHALL 提供 GitHub Actions 排程工作流程，定期執行健康檢查。

#### Scenario: 每週自動執行
- **GIVEN** `.github/workflows/scheduled-health.yml` 已設定
- **WHEN** 每週一 09:00 UTC 觸發
- **THEN** 執行 health score 計算 + dependency audit + 外部連結檢查

#### Scenario: 分數退化自動開 Issue
- **GIVEN** 健康分數低於閾值（預設 75）或比上週下降超過 5 分
- **WHEN** 排程執行完成
- **THEN** 自動在 GitHub 建立 Issue，標記 `auto-detected` 和 `standards-health`

#### Scenario: 手動觸發
- **GIVEN** 開發者想手動執行健康檢查
- **WHEN** 使用 `workflow_dispatch` 觸發
- **THEN** 執行完整診斷流程並產出報告

### REQ-5: 外部參考檢查

系統 SHALL 偵測標準中的過期外部參考。

#### Scenario: 偵測失效連結
- **GIVEN** 標準檔案中包含外部 URL
- **WHEN** 系統檢查這些 URL 的可達性（並行上限 5、超時 10 秒、結果快取 7 天）
- **THEN** 回報不可達的 URL，標記為 `link-rot`

#### Scenario: 偵測過期版本引用
- **GIVEN** 標準中引用了特定技術版本（如 Node.js 18、OWASP 2023）
- **WHEN** 系統比對已知的最新版本
- **THEN** 標記過期的版本引用

#### Scenario: 無網路環境
- **GIVEN** 執行環境無法存取外部網路
- **WHEN** 系統嘗試檢查 URL 可達性
- **THEN** 產出離線警告，跳過 URL 檢查，只執行版本引用的靜態比對

---

### REQ-6: Integration Smoke Tests

系統 SHALL 提供跨 AI 工具的整合冒煙測試。

#### Scenario: 驗證工具產出格式
- **GIVEN** UDS 支援的所有 13 個 AI 工具
- **WHEN** 執行 `uds init` 模擬安裝（每個工具獨立的 temp 目錄）
- **THEN** 每個工具的產出檔案格式正確且包含標準引用

#### Scenario: Snapshot 比對
- **GIVEN** 之前記錄的工具產出快照
- **WHEN** 程式碼變更後重新執行測試
- **THEN** 產出與快照一致，或明確標記差異需要更新快照

#### Scenario: 技能對應驗證
- **GIVEN** 使用者安裝了技能
- **WHEN** 執行整合測試
- **THEN** 每個工具的技能檔案存在且內容有效（不含 undefined 或空白）

---

### REQ-7: Context-Aware Hook 學習迴路

系統 SHALL 在 context-aware loading hook 中記錄觸發統計並提供分析。

#### Scenario: 記錄觸發統計
- **GIVEN** `inject-standards.js` hook 被觸發
- **WHEN** hook 完成標準匹配
- **THEN** 將觸發記錄追加至 `.uds/hook-stats.jsonl`（timestamp、matched count、matched standard IDs），不記錄完整 prompt 內容或檔案路徑

#### Scenario: 統計記錄 opt-out
- **GIVEN** 使用者不希望記錄觸發統計
- **WHEN** 在 `.uds/config.json` 設定 `"hookStats": false`
- **THEN** hook 正常運作但不寫入統計檔案

#### Scenario: 磁碟空間不足時不影響 hook
- **GIVEN** `.uds/hook-stats.jsonl` 寫入失敗（磁碟滿、權限不足等）
- **WHEN** hook 被觸發
- **THEN** hook 正常完成標準注入，統計寫入失敗被靜默忽略

#### Scenario: 分析觸發盲區
- **GIVEN** `.uds/hook-stats.jsonl` 中有足夠的歷史記錄（>50 筆）
- **WHEN** 使用者執行 `node scripts/analyze-hook-stats.mjs`
- **THEN** 列出從未被命中的標準、零命中 prompt 的常見關鍵字、過度命中的 prompt

#### Scenario: 產出改進建議
- **GIVEN** 分析完成且偵測到盲區
- **WHEN** 系統產出報告
- **THEN** 包含具體的 trigger 詞新增/修改建議

---

### REQ-8: Standards Effectiveness Protocol

系統 SHALL 定義跨產品的標準效果回饋 JSON Schema。

#### Scenario: Schema 定義
- **GIVEN** UDS 需要從 DevAP/VibeOps 接收標準效果資料
- **WHEN** 消費者（DevAP/VibeOps）產出 effectiveness report
- **THEN** 報告符合 `specs/standards-effectiveness-schema.json` 的 JSON Schema

#### Scenario: 匯總分析
- **GIVEN** 多份 effectiveness report 存在於指定目錄
- **WHEN** 使用者執行 `node scripts/aggregate-effectiveness.mjs <dir>`
- **THEN** 產出跨報告的匯總摘要：每個標準的使用率、遵循率、摩擦率、品質影響

#### Scenario: 未覆蓋議題偵測
- **GIVEN** 多份 report 中的 `unmatched_issues` 欄位
- **WHEN** 同一個議題在 3+ 份報告中重複出現
- **THEN** 標記為「建議新增標準」的候選項

---

### REQ-9: 跨產品版本對齊

系統 SHALL 在 release 時產出版本清單，供消費者偵測版本漂移。

#### Scenario: Release 時產出 version-manifest
- **GIVEN** UDS 執行 release 流程
- **WHEN** 版本更新完成
- **THEN** 產出 `.standards/version-manifest.json`，包含 `uds_version`、`standards_hash`、`compatibility`

#### Scenario: 消費者版本檢查
- **GIVEN** DevAP/VibeOps 的 CI 中安裝了 UDS 標準
- **WHEN** CI 執行 `check-uds-version-drift` 步驟
- **THEN** 比對本地 manifest 與 npm registry 最新版本，drift > 1 minor version 時發出 warning

---

## Acceptance Criteria

| AC | 條件 | 驗證方式 |
|----|------|---------|
| AC-1 | `uds audit --score` 產出 0-100 分數與 4 維度明細（支援 self 和消費者模式） | 單元測試 + 手動驗證 |
| AC-2 | `--format json` 產出結構化 JSON（含 `mode` 欄位區分模式） | 單元測試 |
| AC-3 | `--save` 將快照存入 `.uds/health-scores/` | 單元測試 |
| AC-4 | `--trend` 顯示歷史趨勢 | 手動驗證 |
| AC-5 | `--ci --threshold N` 以 exit code 反映健康狀態 | 單元測試 |
| AC-6 | `scheduled-health.yml` 每週執行並自動開 Issue | CI 驗證 |
| AC-7 | `check-external-references.mjs` 偵測失效連結和過期版本（含離線 fallback） | 單元測試 |
| AC-8 | Integration smoke tests 覆蓋全部 13 個 AI 工具 | 測試執行 |
| AC-9 | Hook 統計記錄寫入 `.uds/hook-stats.jsonl`（支援 opt-out） | 單元測試 |
| AC-10 | Hook 寫入失敗時不影響標準注入功能 | 單元測試 |
| AC-11 | `analyze-hook-stats.mjs` 產出盲區分析報告 | 手動驗證 |
| AC-12 | `standards-effectiveness-schema.json` 通過 JSON Schema 驗證 | Schema 測試 |
| AC-13 | `aggregate-effectiveness.mjs` 匯總多份報告 | 單元測試 |
| AC-14 | Release 時產出 `version-manifest.json` | Release 流程驗證 |
| AC-15 | Manifest 損壞時 graceful failure（exit 1 + 可讀錯誤訊息） | 單元測試 |
| AC-16 | 所有新增程式碼有對應測試，覆蓋率不下降 | `npm run test:quick` |

---

## Technical Design

### 架構概覽

```
CLI Layer (uds audit --score [--self])
├─ health-scorer.js          ← 新增：4 維度計算引擎
├─ health-checker.js         ← 現有：安裝完整性檢查
├─ pattern-analyzer.js       ← 現有：模式偵測
└─ friction-detector.js      ← 現有：摩擦偵測

CI Layer (.github/workflows/)
├─ scheduled-health.yml      ← 新增：排程自我診斷
└─ ci.yml                    ← 現有：PR 驗證

Scripts Layer (scripts/)
├─ check-external-references.mjs  ← 新增：外部參考檢查
├─ analyze-hook-stats.mjs         ← 新增：Hook 統計分析
└─ aggregate-effectiveness.mjs    ← 新增：效果匯總

Schema Layer (specs/)
└─ standards-effectiveness-schema.json  ← 新增：跨產品 schema

Hook Layer (scripts/hooks/)
└─ inject-standards.js       ← 修改：加入統計記錄

Test Layer (cli/tests/)
├─ unit/utils/health-scorer.test.js     ← 新增
├─ integration/tool-outputs.test.js     ← 新增
└─ commands/audit-utils.test.js         ← 擴展
```

### 檔案異動清單

| 操作 | 檔案 | 說明 |
|------|------|------|
| 新增 | `cli/src/utils/health-scorer.js` | 4 維度評分引擎 |
| 新增 | `cli/tests/unit/utils/health-scorer.test.js` | 評分引擎測試 |
| 新增 | `cli/tests/integration/tool-outputs.test.js` | 整合冒煙測試 |
| 新增 | `.github/workflows/scheduled-health.yml` | 排程工作流程 |
| 新增 | `scripts/check-external-references.mjs` | 外部參考檢查 |
| 新增 | `scripts/analyze-hook-stats.mjs` | Hook 統計分析 |
| 新增 | `scripts/aggregate-effectiveness.mjs` | 效果匯總 |
| 新增 | `specs/standards-effectiveness-schema.json` | 跨產品 schema |
| 修改 | `cli/src/commands/audit.js` | 加入 `--score`、`--self`、`--save`、`--trend`、`--ci`、`--threshold` |
| 修改 | `cli/bin/uds.js` | 註冊新 options |
| 修改 | `scripts/hooks/inject-standards.js` | 加入統計記錄 |
| 修改 | `cli/tests/commands/audit-utils.test.js` | 擴展測試 |

### 資料格式

#### Health Score Output (JSON)

```json
{
  "mode": "self",
  "score": 82,
  "dimensions": {
    "completeness": { "score": 90, "details": { "core_md": 51, "ai_yaml": 49, "skills": 35, "checks": 12, "translations": 48, "total": 53 } },
    "freshness": { "score": 75, "details": { "recent_30d": 28, "aging_90d": 15, "stale_180d": 7, "outdated": 3, "outdated_list": ["..."] } },
    "consistency": { "score": 85, "details": { "core_yaml_sync": 49, "translation_sync": 46, "manifest_valid": true, "total_checkable": 51 } },
    "coverage": { "score": 70, "details": { "has_check_script": 12, "has_tests": 35, "total": 53 } }
  },
  "trend": { "previous_score": 80, "change": 2, "direction": "up" },
  "timestamp": "2026-03-29T10:00:00Z"
}
```

#### Hook Stats Entry (JSONL)

```json
{"timestamp":"2026-03-29T10:00:00Z","prompt_length":120,"matched_standards":["testing","commit-message"],"matched_count":2,"total_available":53}
```

---

## Test Plan

### 單元測試

- [ ] `health-scorer.js` — calculateCompleteness / calculateFreshness / calculateConsistency / calculateCoverage / weightedAverage
- [ ] `health-scorer.js` — runHealthScore 整合所有維度
- [ ] `health-scorer.js` — saveScoreSnapshot / loadTrend
- [ ] `health-scorer.js` — 邊界條件：空 manifest、無 git 歷史、無翻譯目錄

### 整合測試

- [ ] `tool-outputs.test.js` — 至少 6 個 AI 工具的 `uds init` 產出格式驗證
- [ ] `audit-utils.test.js` — `--health-score` flag 與現有 audit 流程整合

### 腳本測試

- [ ] `check-external-references.mjs` — URL 可達性 + 版本過期偵測
- [ ] `analyze-hook-stats.mjs` — 盲區分析 + 建議產出
- [ ] `aggregate-effectiveness.mjs` — 多報告匯總

### CI 驗證

- [ ] `scheduled-health.yml` — `workflow_dispatch` 手動觸發一次確認流程

---

## Implementation Phases

| Phase | 內容 | 估計 |
|-------|------|------|
| Phase 1 | REQ-1~3: Health Score 系統 | Week 1-2 |
| Phase 1 | REQ-4~5: Scheduled Self-Diagnosis | Week 1-2 |
| Phase 1 | REQ-6: Integration Smoke Tests | Week 1-2 |
| Phase 2 | REQ-7: Hook 學習迴路 | Week 3 |
| Phase 2 | REQ-8: Standards Effectiveness Protocol | Week 3 |
| Phase 3 | REQ-9: 跨產品版本對齊 | Week 4 |

---

## Cross-Product Impact

| 產品 | 需要的變更 | 機制 |
|------|-----------|------|
| DevAP | ExecutionReport 附帶 standards_effectiveness | GitHub Issue |
| DevAP | CI 加入 check-uds-version-drift | GitHub Issue |
| VibeOps | Evaluator 附帶 standards_effectiveness | GitHub Issue |
| VibeOps | CI 加入 check-uds-version-drift | GitHub Issue |

---

## Out of Scope

| 項目 | 原因 |
|------|------|
| AI 自動修改標準內容 | 標準需要人工審核，AI 只建議不決定 |
| 即時 telemetry 收集 | 開源 CLI 有隱私顧慮 |
| 標準自動 deprecate | 影響太大，需人工判斷 |
| 跨 repo PR 自動合併 | 風險太高 |
