---
source: ../../../core/recovery-recipe-registry.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: d6c8e8e176b4
status: current
---

# 恢復食譜註冊表標準

> **語言**: [English](../../../core/recovery-recipe-registry.md) | 繁體中文

> **來源**: XSPEC-046 | **借鑑自**: ultraworkers/claw-code ROADMAP Phase 3 Recovery Recipes
> **依賴**: failure-source-taxonomy（XSPEC-045）

## 概述

恢復食譜註冊表將分散的恢復邏輯（Fix Loop、Circuit Breaker、Guardian 自動修復、Staging 重試）統一為可外部化、以 YAML 配置的 Recipe 格式。每個 Recipe 以 `failureSource`（XSPEC-045）作為匹配鍵，選擇對應的恢復策略，並定義升級路徑（escalation）。無匹配 Recipe 時，系統 fallback 到現有行為（向後相容）。

## 6 個恢復策略

| 策略 | 描述 | 最適合 |
|------|------|--------|
| `fix_loop` | 注入結構化錯誤回饋並重試任務 | compilation, test_failure |
| `circuit_breaker` | 三態斷路器（XSPEC-036），連續失敗後開路 | tool_failure, prompt_delivery |
| `rebase_and_retry` | 執行 git rebase 同步基底分支後重試 | branch_divergence |
| `model_switch` | 切換至備用模型後重試 | model_degradation, prompt_delivery |
| `degraded_mode` | 以降級模式繼續執行（跳過品質驗證、以部分結果繼續） | resource_exhaustion, model_degradation |
| `human_checkpoint` | 暫停執行，等待人工介入 | policy_violation, branch_divergence |

## Recipe 格式

```yaml
id: RR-001                          # RR-NNN format, required
name: "Fix Loop for Compilation"    # required
match:
  failure_source: compilation       # FailureSource, required
  severity: [high, medium]          # optional, empty = match all
strategy: fix_loop                  # RecoveryStrategy, required
config:                             # optional, overrides strategy defaults
  max_attempts: 3
  budget_usd: 0.50
escalation:                         # required
  on_exhaust: human_checkpoint      # must not reference self
  message: "..."                    # optional notification message
```

## 預設 Recipe（RR-001 ~ RR-005）

| ID | 觸發條件 | 策略 | 升級路徑 |
|----|----------|------|----------|
| RR-001 | compilation | fix_loop（3 次, $0.50） | human_checkpoint |
| RR-002 | test_failure | fix_loop（3 次, $0.50） | human_checkpoint |
| RR-003 | model_degradation | model_switch（2 次） | degraded_mode |
| RR-004 | branch_divergence | rebase_and_retry（1 次） | human_checkpoint |
| RR-005 | resource_exhaustion | degraded_mode | human_checkpoint |

## 指引

- 每個 Recovery Recipe 必須有唯一 ID（RR-NNN 格式）
- `match.failure_source` 必須是 failure-source-taxonomy 中定義的 8 類之一
- `escalation.on_exhaust` 必須定義——禁止無限循環（escalation 不得指向自身）
- 無匹配 Recipe 時，系統必須 fallback 到現有預設行為（不得拋出錯誤）
- 使用者自訂 Recipe 優先於內建 Recipe（`failureSource` 相同時，使用者配置先匹配）
- Recipe config 格式錯誤時 fallback 到策略預設值（不中斷執行）

## 適用情境

- Orchestrator（採用層）在 fix loop 前選擇恢復策略
- Pipeline Runner（採用層）以註冊表查詢處理 `agent:error`
- 自訂 `recovery-recipes.yaml` 以在專案層級覆寫 recipe
- 遙測追蹤恢復策略的成效

## 參考資料

- AI 最佳化版本：[ai/standards/recovery-recipe-registry.ai.yaml](../../../ai/standards/recovery-recipe-registry.ai.yaml)
- XSPEC-046：跨專案規格
- 依賴：Failure Source Taxonomy（XSPEC-045）
- 借鑑自：[ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) ROADMAP Phase 3 Recovery Recipes


**Scope**: universal
