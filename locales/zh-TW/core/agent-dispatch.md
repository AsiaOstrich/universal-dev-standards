---
source: ../../../core/agent-dispatch.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: d18ca22786b3
status: current
---

# 代理派遣與並行協調

> **語言**: [English](../../../core/agent-dispatch.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-20
**適用性**: 使用多代理編排的 AI 輔助開發
**範圍**: 通用 (Universal)
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — dispatching-parallel-agents、subagent-driven-development (MIT)

---

## 目的

定義 AI 子代理的並行派遣、工作協調與狀態回報標準。本標準確保高效並行化的同時，防止檔案衝突與整合失敗。

定義 AI 子代理的並行派遣、工作協調與狀態回報標準。確保高效並行化的同時，防止檔案衝突與整合失敗。

---

## 術語表

| 術語 | 定義 |
|------|------|
| 子代理 (Sub-agent) | 由編排器產生的 AI 代理，負責處理特定任務 |
| 獨立域 (Independent Domain) | 與其他任務無共享可變狀態的任務範圍 |
| 狀態協定 (Status Protocol) | 子代理必須回報的標準化回傳狀態 |
| 檔案衝突 (File Conflict) | 多個代理同時修改同一檔案的情況 |

---

## 核心原則 — 先獨立再並行

> **在並行派遣代理之前，必須驗證其任務域是獨立的（無共享可變狀態）。**

派遣前必須識別獨立域 — 無共享可變狀態才可並行。

---

## Prompt 設計原則

每個子代理的 prompt 必須遵循三項原則：

### 1. 聚焦（Focused）

每個代理只處理單一問題域。不要混合無關任務。

每個代理只處理單一問題域，不混合無關任務。

### 2. 自足（Self-contained）

Prompt 包含執行所需的完整上下文。代理不應需要額外提問或搜尋補充資訊。

Prompt 包含執行所需的完整上下文，代理不需要額外提問或搜尋。

### 3. 明確輸出（Specific Output）

明確定義代理回報結果時應使用的格式。

明確定義期望的回報格式。

---

## 狀態協定

每個子代理在完成時必須回報以下四種狀態之一：

| 狀態 | 說明 | 編排器動作 |
|------|------|------------|
| `DONE` | 任務成功完成 | 繼續執行下一個任務 |
| `DONE_WITH_CONCERNS` | 已完成但有需記錄的疑慮 | 記錄疑慮，繼續執行 |
| `NEEDS_CONTEXT` | 需要更多上下文才能完成 | 注入上下文，重新派遣（非單純重試） |
| `BLOCKED` | 無法完成，需要向上呈報 | 升級模型層級或拆分任務 |

### 狀態決策流程

```
Agent completes work
  ├── All acceptance criteria met? → DONE
  ├── Criteria met but concerns exist? → DONE_WITH_CONCERNS
  ├── Missing information to proceed? → NEEDS_CONTEXT
  └── Fundamentally unable to complete? → BLOCKED
```

---

## 衝突偵測

當並行代理回傳時，編排器必須：

1. **檢查檔案衝突** — 是否有多個代理修改了同一個檔案？
2. **執行完整測試套件** — 在合併所有變更後驗證整合狀況
3. **解決衝突** — 自動解決或標記供人工審查

```
Agent A (modifies: src/auth.ts, src/auth.test.ts)  ─┐
                                                      ├─→ Conflict check → Integration test
Agent B (modifies: src/api.ts, src/api.test.ts)     ─┘
```

---

## 規則

| ID | 觸發條件 | 動作 | 優先級 |
|----|----------|------|--------|
| AD-001 | 多個代理編輯同一檔案 | 標記衝突，要求合併解決 | 嚴重 (Critical) |
| AD-002 | 代理回報 BLOCKED | 升級模型層級並重試一次 | 高 (High) |
| AD-003 | 所有並行代理完成 | 執行完整測試套件以驗證整合 | 高 (High) |

---

## 範例

### 良好：並行獨立任務

```yaml
# Two agents working on independent modules
Agent 1:
  task: "Add rate limiting to /api/users endpoint"
  files: [src/api/users.ts, src/api/users.test.ts]

Agent 2:
  task: "Add caching to /api/products endpoint"
  files: [src/api/products.ts, src/api/products.test.ts]

# No shared files → safe to parallelize
```

### 不良：並行相依任務

```yaml
# Two agents modifying shared state
Agent 1:
  task: "Refactor database connection pool"
  files: [src/db.ts]  # ⚠️ shared file

Agent 2:
  task: "Add connection retry logic"
  files: [src/db.ts]  # ⚠️ conflict!
```

---

## 參考資料

- **Superpowers**: [dispatching-parallel-agents](https://github.com/obra/superpowers)、[subagent-driven-development](https://github.com/obra/superpowers) (MIT)
- **MapReduce**: 概念性並行執行模型
- **Actor Model**: 獨立代理通訊模式
