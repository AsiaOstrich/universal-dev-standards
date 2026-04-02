# [SPEC-FLOW-001] Feature: 自訂 SDLC 流程引擎 — Flow Template YAML 與 Flow Engine

- **Status**: Archived
- **Created**: 2026-04-02
- **Implemented**: 2026-04-02
- **Archived**: 2026-04-02
- **Commits**: b495d48, 3ba89a3, 8e839d7, fc2a9fe, cc80ae7, ec82256, b591af0
- **Scope**: partial (概念 universal，但 CLI 實作為 UDS 工具)
- **Depends-on**: 無（新功能）

## Overview

讓使用者能以 YAML 定義自訂開發流程，將 UDS 的 48+ 個命令/活動作為積木自由編排。系統提供預設流程（SDD、TDD、BDD）作為基底，使用者可繼承並客製化，同時透過可插拔的品質閘門保障底線。

## Motivation

UDS 已定義 78 個標準和 48+ 個命令，但僅提供 SDD 和 Double-Loop TDD 兩個固定流程。不同團隊和組織的 SDLC 流程差異極大：

1. **小型敏捷團隊**：可能跳過 formal spec review，直接 TDD
2. **金融/醫療合規團隊**：需要在每個階段加入 security scan 和 audit trail
3. **DevOps 成熟團隊**：trunk-based，不需要 PR 流程
4. **混合型團隊**：前期用 SDD，後期用 TDD cycle

現有的 `/methodology` 機制是實驗性的，僅支援 methodology-level 的切換，無法在 stage/step 層級客製化。本 spec 建立完整的 Flow Engine 架構，讓 UDS 從「標準庫」升級為「流程引擎」。

## Requirements

### REQ-1: Flow YAML Schema

系統 SHALL 定義 `.uds/flows/{name}.flow.yaml` 的 schema，支援 stages → steps → gates 三層結構。

#### Scenario: 解析合法的 Flow YAML

- **GIVEN** 使用者建立 `.uds/flows/my-flow.flow.yaml`，內容包含合法的 `id`、`stages` 結構
- **WHEN** Flow Engine 載入該檔案
- **THEN** 成功解析並回傳 Flow 物件，包含所有 stages、steps 和 gates

#### Scenario: 驗證 Flow YAML 必填欄位

- **GIVEN** Flow YAML 缺少 `id` 或 `stages` 必填欄位
- **WHEN** Flow Engine 嘗試載入
- **THEN** 回報具體缺少的欄位名稱和位置

#### Scenario: 驗證命令引用

- **GIVEN** Flow YAML 中 step 引用 `command: /nonexistent`
- **WHEN** Flow Engine 驗證
- **THEN** 回報「命令 /nonexistent 不存在」並列出可用命令清單

#### Scenario: 支援命名條件

- **GIVEN** step 定義 `when: scope_includes_api`（命名條件）
- **WHEN** 當前變更不涉及 API
- **THEN** 該 step 被標記為 skipped，不影響流程進行

#### Scenario: 支援屬性比對條件

- **GIVEN** step 定義 `when: { scope: "includes api", files_changed: "**/*.controller.js" }`
- **WHEN** 當前變更不符合任一條件
- **THEN** 該 step 被標記為 skipped，不影響流程進行

### REQ-2: 預設流程轉換

系統 SHALL 將現有 SDD、TDD、BDD 流程以 Flow YAML 格式表達為內建流程。

#### Scenario: SDD 流程轉換

- **GIVEN** SDD 流程定義（Discuss→Proposal→Review→Implementation→Verification→Archive）
- **WHEN** 以 Flow YAML 格式表達
- **THEN** 產生的 `sdd.flow.yaml` 包含 6 個 stages，每個 stage 的 steps 和 gates 與現行行為一致

#### Scenario: TDD 循環流程

- **GIVEN** TDD 流程（Red→Green→Refactor→repeat）
- **WHEN** 以 Flow YAML 格式表達
- **THEN** 正確表達循環特性，`refactor` stage 完成後可選擇回到 `red` 或結束

#### Scenario: BDD 流程轉換

- **GIVEN** BDD 流程（Discovery→Formulation→Automation→Living Docs）
- **WHEN** 以 Flow YAML 格式表達
- **THEN** 每個 phase 包含對應的 checklist items 作為 gate 條件

#### Scenario: 內建流程可被列出

- **GIVEN** 系統啟動
- **WHEN** 查詢可用流程
- **THEN** SDD、TDD、BDD 顯示為 `[built-in]`，且可被 `extends` 引用

### REQ-3: Flow Inheritance

系統 SHALL 支援 `extends` 語法，讓自訂流程繼承預設或其他流程並進行覆寫。

#### Scenario: 繼承預設流程

- **GIVEN** 自訂流程 YAML 包含 `extends: sdd`
- **WHEN** Flow Engine 解析
- **THEN** 繼承 SDD 的所有 stages、steps 和 gates

#### Scenario: 覆寫 stage 的 steps

- **GIVEN** 繼承流程使用 `overrides` 在 `derive` stage 新增 `/security` step
- **WHEN** Flow Engine 合併
- **THEN** `derive` stage 包含原有的 steps 加上新增的 `/security`

#### Scenario: 覆寫 gate 閾值

- **GIVEN** 繼承流程使用 `overrides` 將 coverage gate threshold 從 80 改為 90
- **WHEN** 執行到該 gate
- **THEN** 使用覆寫後的 threshold 90 進行檢查

#### Scenario: 插入新 stage

- **GIVEN** 使用 `insert: [{ after: design, stage: { id: security-review, ... } }]`
- **WHEN** Flow Engine 組裝最終流程
- **THEN** `security-review` stage 出現在 `design` 之後、下一個原始 stage 之前

#### Scenario: 移除步驟

- **GIVEN** 使用 `remove_steps` 移除 `/pr` 命令
- **WHEN** Flow Engine 組裝
- **THEN** `/pr` 不出現在任何 stage 的 steps 中

#### Scenario: 多層繼承

- **GIVEN** 組織流程 `extends: sdd`，團隊流程 `extends: org-flow`
- **WHEN** Flow Engine 解析團隊流程
- **THEN** 最終流程為 SDD → 組織覆寫 → 團隊覆寫的合併結果

### REQ-4: 可插拔品質閘門

系統 SHALL 支援獨立定義品質閘門（`.uds/gates/{name}.gate.yaml`），可在流程中引用。

#### Scenario: 定義獨立閘門

- **GIVEN** 使用者建立 `.uds/gates/security-gate.gate.yaml`，定義 checks 和 on_failure
- **WHEN** 流程中以 `ref: security-gate` 引用
- **THEN** 閘門邏輯被正確載入並在該 stage 結束時執行

#### Scenario: Blocking 閘門阻止進行

- **GIVEN** 閘門 `type: blocking`，檢查未通過
- **WHEN** 嘗試進入下一個 stage
- **THEN** 阻止轉換，顯示失敗原因和 `on_failure.suggest` 中的建議命令

#### Scenario: Warning 閘門允許繼續

- **GIVEN** 閘門 `type: warning`，檢查未通過
- **WHEN** 嘗試進入下一個 stage
- **THEN** 顯示警告訊息，詢問使用者是否繼續

#### Scenario: 行內閘門定義

- **GIVEN** 流程中直接定義 `type: inline` 閘門（而非引用外部檔案）
- **WHEN** 執行到該 gate
- **THEN** 正確執行行內定義的檢查邏輯

#### Scenario: 不可移除閘門

- **GIVEN** 閘門定義 `removable: false`
- **WHEN** 繼承流程嘗試移除該閘門
- **THEN** 驗證失敗並回報「此閘門為強制要求，不可移除」

### REQ-5: Flow 狀態持久化

系統 SHALL 將流程執行狀態持久化至 `.workflow-state/`，支援跨 session 恢復。

#### Scenario: 自動儲存狀態

- **GIVEN** 使用者完成一個 stage
- **WHEN** 進入下一個 stage
- **THEN** 狀態檔案 `.workflow-state/flow-{id}.yaml` 更新 `current_phase` 和 `phases_completed`

#### Scenario: 恢復中斷的流程

- **GIVEN** 上次 session 中斷在 `design` stage
- **WHEN** 使用者重新啟動流程
- **THEN** 提示「偵測到未完成的流程 '{name}'（停在 design），是否繼續？」

#### Scenario: 過期流程警告

- **GIVEN** 流程狀態超過 7 天未更新
- **WHEN** 嘗試恢復
- **THEN** 顯示「此流程已超過 7 天未更新」警告，允許使用者選擇繼續或放棄

#### Scenario: 狀態格式相容

- **GIVEN** Flow Engine 產生的狀態檔案
- **WHEN** 與現有 workflow-state-protocol 比較
- **THEN** 格式完全相容（包含 workflow、spec_id、current_phase、status、updated、phases_completed）

### REQ-6: Flow CLI 命令

系統 SHALL 提供 `uds flow` 子命令用於管理自訂流程。

#### Scenario: 互動式建立流程

- **GIVEN** 執行 `uds flow create`
- **WHEN** 進入互動模式
- **THEN** 引導使用者選擇 base flow（或從零開始）、新增/排序 stages、設定 gates，最終產生 `.uds/flows/{name}.flow.yaml`

#### Scenario: 列出可用流程

- **GIVEN** 執行 `uds flow list`
- **WHEN** 專案有內建和自訂流程
- **THEN** 列出所有流程，標注 `[built-in]` 或 `[custom]`，顯示 stages 數量和 extends 來源

#### Scenario: 驗證流程

- **GIVEN** 執行 `uds flow validate my-flow`
- **WHEN** 流程定義有邏輯問題（循環依賴、引用不存在的命令、stage ID 重複）
- **THEN** 回報所有錯誤和警告，附修正建議

#### Scenario: 比較兩個流程

- **GIVEN** 執行 `uds flow diff sdd my-flow`
- **WHEN** 兩個流程有差異
- **THEN** 顯示 stages/steps/gates 的新增、移除、修改清單

### REQ-7: Flow Export / Import

系統 SHALL 提供 `uds flow export` 和 `uds flow import` 命令，將流程打包為可分享的 bundle 格式。

#### Scenario: 匯出流程 bundle

- **GIVEN** 執行 `uds flow export my-flow -o my-flow.bundle.yaml`
- **WHEN** 流程引用了外部 gate 定義
- **THEN** 產生的 bundle 包含 flow 定義和所有被引用的 gate 定義，形成自包含的單一檔案

#### Scenario: 匯入流程 bundle

- **GIVEN** 執行 `uds flow import my-flow.bundle.yaml`
- **WHEN** bundle 格式合法
- **THEN** flow 安裝至 `.uds/flows/`，gates 安裝至 `.uds/gates/`，且不覆寫已存在的同名檔案（除非加 `--force`）

#### Scenario: 匯入衝突處理

- **GIVEN** 執行 `uds flow import` 且 `.uds/flows/` 已有同名流程
- **WHEN** 未使用 `--force` flag
- **THEN** 提示衝突並詢問使用者是否覆寫、重新命名或取消

#### Scenario: Bundle 驗證

- **GIVEN** 匯入一個 bundle
- **WHEN** bundle 中的 flow 使用 `extends` 引用不存在的 base flow
- **THEN** 回報錯誤「base flow '{id}' 不存在，請先安裝」

## Acceptance Criteria

| AC | 說明 | REQ | 範圍 |
|----|------|-----|------|
| AC-1 | Flow YAML 能被解析和驗證（schema 正確性） | REQ-1 | UDS |
| AC-2 | 引用不存在的命令時回報錯誤 | REQ-1 | UDS |
| AC-3 | SDD/TDD/BDD 預設流程以 Flow YAML 表達 | REQ-2 | UDS |
| AC-4 | `extends` 繼承機制正確合併 stages/steps/gates | REQ-3 | UDS |
| AC-5 | `overrides`/`insert`/`remove_steps` 操作正確 | REQ-3 | UDS |
| AC-6 | 多層繼承正確解析 | REQ-3 | UDS |
| AC-7 | 獨立閘門定義可被引用和執行 | REQ-4 | UDS |
| AC-8 | Blocking/Warning 閘門行為正確 | REQ-4 | UDS |
| AC-9 | 不可移除閘門無法被覆寫移除 | REQ-4 | UDS |
| AC-10 | 流程狀態正確持久化並可恢復 | REQ-5 | UDS |
| AC-11 | 狀態格式與 workflow-state-protocol 相容 | REQ-5 | UDS |
| AC-12 | `uds flow create` 互動式建立流程 | REQ-6 | UDS |
| AC-13 | `uds flow list` 列出所有流程 | REQ-6 | UDS |
| AC-14 | `uds flow validate` 檢查流程定義 | REQ-6 | UDS |
| AC-15 | `uds flow diff` 比較兩個流程 | REQ-6 | UDS |
| AC-16 | `uds flow export` 匯出包含 gates 的 bundle | REQ-7 | UDS |
| AC-17 | `uds flow import` 匯入 bundle 並處理衝突 | REQ-7 | UDS |

## Technical Design

### 目錄架構與職責分離

```
.standards/                    # UDS 管控（uds update 管理，不放使用者自訂）
├── flows/                     # 內建預設流程（隨 uds update 更新）
│   ├── sdd.flow.yaml
│   ├── tdd.flow.yaml
│   └── bdd.flow.yaml
└── *.ai.yaml                  # 標準檔案

.uds/                          # 使用者管控（uds update 不觸及，安全）
├── flows/                     # 自訂流程定義
│   ├── my-team.flow.yaml
│   └── org-standard.flow.yaml
├── gates/                     # 自訂閘門定義
│   ├── security-gate.gate.yaml
│   └── coverage-gate.gate.yaml
└── config.yaml                # 現有配置
```

**設計決策**：自訂檔案一律放 `.uds/`，因為 `uds update` 會掃描 `.standards/` 並**刪除未追蹤的檔案**。`.uds/` 在 init/update 期間完全不被觸及，保障使用者自訂不被破壞。

**解析優先順序**：`.uds/flows/`（使用者自訂，最高優先）→ `.standards/flows/`（內建預設）

### Flow YAML Schema

```yaml
# .uds/flows/{name}.flow.yaml
id: string                    # 必填，唯一識別碼（kebab-case）
name: string                  # 必填，人可讀名稱
version: string               # 選填，語義版本號
extends: string               # 選填，繼承的 base flow ID
description: string           # 選填，流程說明
source:                       # 選填（預留擴展，Phase 1 不實作）
  type: string                # local | git | registry
  url: string                 # 來源 URL

stages:                       # 必填（除非使用 extends）
  - id: string                # 必填，stage 唯一識別碼
    name: string              # 必填，stage 顯示名稱
    steps:                    # 必填，至少一個 step
      - command: string       # 必填，UDS 命令（如 /sdd, /tdd）
        required: boolean     # 選填，預設 true
        when: string | object # 選填，條件（見下方「條件語法」）
        after: string         # 選填（用於 insert），在哪個 step 之後
    gates:                    # 選填
      - type: string          # blocking | warning | info
        ref: string           # 引用外部 gate 定義
        run: string           # 行內檢查命令
        expect: string        # 預期結果（exit_code_0, no_findings, etc.）
        threshold: number     # 數值閾值（如 coverage %）
        artifact: string      # 期望存在的檔案 glob pattern
        timeout: number       # 選填，秒（覆寫全域預設）
    loop: boolean             # 選填，此 stage 可循環（如 TDD Red-Green-Refactor）

overrides:                    # 選填（僅與 extends 搭配）
  - stage: string             # 要覆寫的 stage ID
    add_steps: [...]          # 新增 steps
    remove_steps: [...]       # 移除 steps
    modify_gates: [...]       # 修改 gates

insert:                       # 選填（僅與 extends 搭配）
  - after: string             # 在哪個 stage 之後插入
    stage: { ... }            # 新的 stage 定義

config:                       # 選填
  enforcement: string         # enforce | suggest | off（預設 suggest）
  allow_skip_optional: bool   # 是否允許跳過 required: false 的 step（預設 true）
  state_persistence: bool     # 是否啟用狀態持久化（預設 true）
  gate_timeout: number        # Gate 預設 timeout 秒數（預設 30，上限 600）
```

### 條件語法（`when` 欄位）

與現有 methodology 的 `condition` 字串模式一致，採用兩級語法：

```yaml
# Level 1：命名條件（字串，與現有 methodology triggers 風格一致）
when: scope_includes_api

# Level 2：屬性比對（物件，所有條件需同時滿足 AND 語義）
when:
  scope: "includes api"
  files_changed: "**/*.controller.js"
```

**可用的命名條件**（內建）：

| 條件名稱 | 說明 |
|----------|------|
| `scope_includes_api` | 變更範圍涉及 API |
| `scope_includes_database` | 變更範圍涉及資料庫 |
| `scope_includes_frontend` | 變更範圍涉及前端 |
| `has_spec` | 已有對應的 spec 文件 |
| `has_tests` | 已有對應的測試 |
| `is_hotfix` | 標記為 hotfix |

**屬性比對運算子**：

| 運算子 | 範例 | 說明 |
|--------|------|------|
| `includes` | `scope: "includes api"` | 包含關鍵字 |
| `matches` | `files_changed: "**/*.test.js"` | glob 匹配 |
| `equals` | `branch_type: "equals feature"` | 完全相等 |

> **擴展性**：如 Level 1 + Level 2 不夠用，Phase 2 可考慮引入 CEL (Common Expression Language)，但目前避免引入 JS eval 的安全風險。

### Gate YAML Schema

```yaml
# .uds/gates/{name}.gate.yaml
id: string                    # 必填，唯一識別碼
name: string                  # 必填，閘門名稱
type: string                  # blocking | warning | info
removable: boolean            # 選填，預設 true
checks:                       # 必填，至少一個 check
  - run: string               # 執行的命令
    expect: string            # 預期結果
    timeout: number           # 選填，秒（預設 30，上限 600）
on_failure:                   # 選填
  message: string             # 失敗訊息
  suggest: [string]           # 建議執行的命令
```

**Timeout 策略**：
- 預設 30 秒（對 lint/format 類檢查足夠）
- 可在 gate 定義或 flow config 中覆寫
- 上限 600 秒（10 分鐘），防止意外掛起
- 超時視同失敗，顯示 timeout 錯誤

### Export/Import Bundle 格式

```yaml
# my-flow.bundle.yaml
bundle_version: "1.0"
exported_at: "2026-04-02T10:00:00Z"
exported_from: "project-name"

flow:
  id: my-team-flow
  name: "我的團隊流程"
  extends: sdd
  stages:
    - id: plan
      name: "規劃"
      steps:
        - command: /brainstorm
          required: false
      # ...

gates:
  - id: security-gate
    name: "安全閘門"
    type: blocking
    checks:
      - run: "npm audit --audit-level=high"
        expect: exit_code_0
        timeout: 60
```

**匯出行為**：打包 flow 定義 + 所有被 `ref:` 引用的 gate 定義，形成自包含 bundle。
**匯入行為**：解壓到 `.uds/flows/` 和 `.uds/gates/`，同名衝突時提示使用者。

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `cli/src/flow/flow-parser.js` | Flow YAML 解析器 |
| `cli/src/flow/flow-validator.js` | Flow 驗證器（schema + 邏輯檢查） |
| `cli/src/flow/flow-engine.js` | Flow 執行引擎（狀態機 + gate 檢查） |
| `cli/src/flow/flow-inheritance.js` | 繼承與合併邏輯 |
| `cli/src/flow/gate-loader.js` | Gate 定義載入器 |
| `cli/src/flow/flow-bundler.js` | Export/Import bundle 打包與解壓 |
| `cli/src/flow/condition-evaluator.js` | `when` 條件評估器 |
| `cli/src/commands/flow.js` | `uds flow` CLI 命令 |
| `.standards/flows/sdd.flow.yaml` | SDD 內建預設流程 |
| `.standards/flows/tdd.flow.yaml` | TDD 內建預設流程 |
| `.standards/flows/bdd.flow.yaml` | BDD 內建預設流程 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `cli/bin/uds.js` | 註冊 `flow` 子命令 |
| `cli/src/utils/workflow-state.js` | 擴展支援 flow 狀態格式 |

### 架構圖

```
使用者
  │
  ▼
┌────────────────────┐
│   uds flow CLI     │  create / list / validate / diff / run / export / import
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐     ┌────────────────────┐
│    Flow Parser     │────►│   Flow Validator   │
│  (YAML → Object)   │     │  (Schema + Logic)  │
└─────────┬──────────┘     └────────────────────┘
          │
          ▼
┌────────────────────┐     ┌────────────────────┐
│  Flow Inheritance  │────►│    Gate Loader     │
│  (extends/merge)   │     │  (.gate.yaml)      │
└─────────┬──────────┘     └─────────┬──────────┘
          │                          │
          ▼                          ▼
┌──────────────────────────────────────────────┐
│               Flow Engine                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  State   │ │  Runner  │ │  Gate Check  │ │
│  │ Machine  │ │ (Steps)  │ │  (Execute)   │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌──────────────────────────┐  │
│  │Condition │ │      Flow Bundler        │  │
│  │Evaluator │ │  (Export / Import)        │  │
│  └──────────┘ └──────────────────────────┘  │
└──────────────────┬───────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│.uds/     │ │.standards│ │.workflow-    │
│ flows/   │ │ /flows/  │ │ state/       │
│ gates/   │ │(built-in)│ │ flow-{id}    │
│(custom)  │ │          │ │ .yaml        │
└──────────┘ └──────────┘ └──────────────┘
  使用者管控    UDS 管控     狀態持久化
```

### `/methodology` 整合策略

採用**漸進取代**（Phase-in Replacement），確保共存期間不受 `uds update` 影響：

| 階段 | 策略 | 說明 |
|------|------|------|
| Phase 1-3 | **共存** | Flow Engine 獨立開發於 `.uds/flows/`；`/methodology` 維持不動 |
| Phase 4 | **橋接** | 提供 `uds flow migrate-methodology` 將 `*.methodology.yaml` 轉為 `*.flow.yaml` |
| Phase 5 | **委託** | `/methodology` 內部委託給 Flow Engine，對外 API 不變 |
| Phase 6 | **退役** | `/methodology` 標記 deprecated，引導使用者用 `uds flow` |

> **安全保證**：因為自訂流程放在 `.uds/`（`uds update` 不觸及），整個共存和遷移過程中使用者的自訂流程不會被破壞。

## Assumptions & Open Questions

### Assumptions

| # | Assumption | Impact Scope | Verification Method | Status |
|---|-----------|--------------|---------------------|--------|
| A1 | `when` 條件使用命名條件 + 屬性比對兩級語法，不引入 JS eval | REQ-1 AC-1 | Prototype 驗證 | Verified (Q1 決議) |
| A2 | `/methodology` 採漸進取代策略：共存→橋接→委託→退役 | REQ-2 | 架構審查 | Verified (Q2 決議) |
| A3 | Gate 的 `run` 命令在使用者本機執行，安全性由使用者自行負責 | REQ-4 AC-7 | 文件說明 | Unverified |
| A4 | 多層繼承深度限制為 5 層，避免過度複雜 | REQ-3 AC-6 | 實作時加入限制 | Unverified |
| A5 | 自訂檔案放 `.uds/`（使用者管控），內建放 `.standards/`（UDS 管控），避免 `uds update` 破壞 | REQ-1~7 | 程式碼驗證 | Verified (Q2 調查) |
| A6 | Gate timeout 預設 30 秒，上限 600 秒 | REQ-4 AC-7 | 實作時設定 | Verified (Q4 決議) |

### Resolved Questions

| # | Question | Decision | Date |
|---|---------|----------|------|
| Q1 | `when` 條件表達式的語法應多複雜？ | 採用命名條件 + 簡單屬性比對（Level 1 + Level 2），不用 JS eval。如不夠用 Phase 2 考慮 CEL。 | 2026-04-02 |
| Q2 | Flow Engine 與現有 `/methodology` 的整合策略？ | 漸進取代：Phase 1-3 共存、Phase 4 橋接、Phase 5 委託、Phase 6 退役。自訂檔案放 `.uds/` 避免 `uds update` 破壞。 | 2026-04-02 |
| Q3 | 是否需要 `uds flow export` 匯出功能？ | 需要。本 spec 新增 REQ-7 實作 export/import bundle。Marketplace 另開 SPEC-FLOW-003。 | 2026-04-02 |
| Q4 | Gate `run` 命令的 timeout 機制？ | 預設 30 秒，可覆寫，上限 600 秒（10 分鐘）。超時視同失敗。 | 2026-04-02 |

### Open Questions

| # | Question | Affected AC | Owner | Deadline |
|---|---------|------------|-------|----------|
| Q5 | Flow Marketplace 的 registry 後端選型？（npm registry / GitHub releases / 自建） | 未來 SPEC-FLOW-003 | TBD | TBD |
| Q6 | `uds update` 是否需要支援更新 `.standards/flows/` 內建流程？如何不影響使用者的 extends 鏈？ | AC-3 | TBD | Phase 2 |

## Test Plan

- [ ] Flow Parser 單元測試（合法/不合法 YAML、必填欄位缺失）
- [ ] Flow Validator 單元測試（命令引用檢查、stage ID 唯一性、循環依賴偵測）
- [ ] Condition Evaluator 單元測試（命名條件、屬性比對、未知條件處理）
- [ ] Flow Inheritance 單元測試（extends、overrides、insert、remove_steps、多層繼承、深度限制）
- [ ] Gate Loader 單元測試（外部引用、行內定義、blocking/warning 行為、timeout）
- [ ] Flow Bundler 單元測試（export 打包、import 解壓、衝突處理、bundle 驗證）
- [ ] Flow Engine 整合測試（完整流程執行、gate 阻止、狀態持久化、session 恢復）
- [ ] Flow CLI 測試（create 互動模式、list 輸出、validate 錯誤報告、diff 比較、export/import）
- [ ] 預設流程轉換驗證（SDD/TDD/BDD 行為一致性）
- [ ] 目錄安全測試（確認 `.uds/flows/` 在 `uds update` 後不被影響）

## Dependencies

- **依賴**: workflow-state-protocol（狀態格式相容）
- **被依賴**: 無（新功能，不影響現有功能）
- **相關**: methodology-system（漸進取代，見 Integration Strategy）
- **後續**: SPEC-FLOW-003 Flow Marketplace（匯出匯入的延伸）

## Implementation Phases

| Phase | 內容 | AC 覆蓋 |
|-------|------|---------|
| Phase 1 | Flow YAML Schema + Parser + Validator + Condition Evaluator | AC-1, AC-2, AC-14 |
| Phase 2 | 預設流程轉換（SDD/TDD/BDD → `.standards/flows/`） | AC-3 |
| Phase 3 | Flow Inheritance（extends/overrides/insert） | AC-4, AC-5, AC-6 |
| Phase 4 | Gate Plugin（獨立定義 + 引用 + blocking/warning + timeout） | AC-7, AC-8, AC-9 |
| Phase 5 | Flow Engine（狀態機 + 持久化 + 恢復） | AC-10, AC-11 |
| Phase 6 | Flow CLI（create/list/validate/diff） | AC-12, AC-13, AC-15 |
| Phase 7 | Flow Export/Import（bundle 打包 + 解壓 + 衝突處理） | AC-16, AC-17 |
