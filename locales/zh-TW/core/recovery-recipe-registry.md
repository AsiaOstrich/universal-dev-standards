---
source: ../../../core/recovery-recipe-registry.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 恢復食譜註冊表標準

> **語言**: [English](../../../core/recovery-recipe-registry.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-16
**適用範圍**: 所有 Agent 執行恢復邏輯
**Scope**: universal
**來源**: XSPEC-046（claw-code ROADMAP Phase 3 Recovery Recipes，DEC-035）
**依賴**: failure-source-taxonomy（XSPEC-045）

---

## 目的

恢復食譜註冊表：將分散的恢復邏輯統一為 YAML 可配置的 Recipe，以 `failureSource` 為匹配鍵。

各模組（Fix Loop、Circuit Breaker、Guardian 自動修復、Staging 重試）的恢復邏輯統一為可外部化的 Recovery Recipe 格式。每個 Recipe 透過 `failureSource`（XSPEC-045）匹配觸發條件，選擇對應的恢復策略，並定義升級路徑（escalation）。無匹配 Recipe 時 fallback 到現有行為（向後相容）。

---

## 核心規範

- 每個 Recovery Recipe 必須有唯一 ID（`RR-NNN` 格式）
- `match.failure_source` 必須是 failure-source-taxonomy 中定義的 8 類之一
- `escalation.on_exhaust` 必須定義，不得無限循環（如 escalation 指向自身）
- 無匹配 Recipe 時，系統必須 fallback 到現有預設行為（不得拋出錯誤）
- 使用者自訂 Recipe 優先於內建 Recipe（同 `failureSource` 時，使用者配置的先匹配）
- Recipe config 格式錯誤時 fallback 到策略預設值（不中斷執行）

---

## 6 個內建恢復策略

### `fix_loop`

- **描述**：注入結構化錯誤回饋，重試任務（現有 Fix Loop）
- **預設 config**：`max_attempts: 3`, `budget_usd: 0.50`
- **最適合**：`compilation`, `test_failure`

### `circuit_breaker`

- **描述**：三態斷路器保護（XSPEC-036），連續失敗後開路避免雪崩
- **預設 config**：`failure_threshold: 3`, `cooldown_ms: 30000`
- **最適合**：`tool_failure`, `prompt_delivery`

### `rebase_and_retry`

- **描述**：先執行 git rebase 同步基底分支，再重試任務／迭代
- **預設 config**：`max_attempts: 1`, `base_branch: "main"`
- **最適合**：`branch_divergence`
- **依賴**：XSPEC-047 Branch Drift Detection

### `model_switch`

- **描述**：切換至備用模型後重試
- **預設 config**：`fallback_models: [...]`, `max_attempts: 2`
- **最適合**：`model_degradation`, `prompt_delivery`

### `degraded_mode`

- **描述**：以降級模式繼續執行（如：跳過品質驗證、以部分結果繼續）
- **結果狀態**：`done_with_concerns`
- **最適合**：`resource_exhaustion`, `model_degradation`

### `human_checkpoint`

- **描述**：暫停執行，等待人工介入（提供失敗細節供判斷）
- **最適合**：`policy_violation`, `branch_divergence`
- **備註**：所有其他策略的最終升級路徑

---

## Recipe YAML 格式

```yaml
id: RR-NNN          # 必填，唯一識別符
name: string        # 必填，可讀名稱
match:              # 必填
  failure_source: <FailureSource>   # 必填
  severity: [critical, high, ...]   # 選填；省略表示匹配所有 severity
strategy: <RecoveryStrategy>        # 必填
config: {}                          # 選填；覆蓋策略預設值
escalation:         # 必填
  on_exhaust: <RecoveryStrategy>    # 必填；不得指向自身
  message: string   # 選填；升級時的通知訊息
```

---

## 5 個預設 Recipe

| ID | 名稱 | 匹配條件 | 策略 | 升級路徑 |
|----|------|----------|------|---------|
| `RR-001` | Fix Loop for Compilation Errors | `compilation` | `fix_loop`（3次, $0.50） | `human_checkpoint` |
| `RR-002` | Fix Loop for Test Failures | `test_failure` | `fix_loop`（3次, $0.50） | `human_checkpoint` |
| `RR-003` | Model Switch for Degradation | `model_degradation` | `model_switch`（2次） | `degraded_mode` |
| `RR-004` | Rebase for Branch Divergence | `branch_divergence` | `rebase_and_retry`（1次） | `human_checkpoint`（需人工解決衝突） |
| `RR-005` | Degraded Mode for Resource Exhaustion | `resource_exhaustion` | `degraded_mode` | `human_checkpoint` |

---

## 類型定義

### RecoveryStrategy

```
fix_loop | circuit_breaker | rebase_and_retry | model_switch | degraded_mode | human_checkpoint
```

### RecoveryRecipe

| 欄位 | 類型 | 必填 |
|------|------|------|
| `id` | `string`（RR-NNN 格式） | 是 |
| `name` | `string` | 是 |
| `match.failure_source` | `FailureSource` | 是 |
| `match.severity` | `string[]`（可選） | 否 |
| `strategy` | `RecoveryStrategy` | 是 |
| `config` | `object`（可選） | 否 |
| `escalation.on_exhaust` | `RecoveryStrategy` | 是 |
| `escalation.message` | `string`（可選） | 否 |

---

## 整合點

> 整合指引（informative；具體檔案路徑屬於採用層自訂範圍）。

### 預期呼叫點

- 核心型別模組 — `RecoveryRecipe` / `RecoveryStrategy` type
- recovery-registry 模組 — Registry 實作與預設 recipe
- orchestrator 模組 — fix loop 前查詢 Registry
- recovery-recipes 配置檔 — 預設 recipe 配置（檔名由採用層決定）
