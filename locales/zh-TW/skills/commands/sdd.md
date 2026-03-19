---
source: ../../../../skills/commands/sdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Create or review specification documents for Spec-Driven Development
allowed-tools: Read, Write, Grep, Glob, Bash(git:*), Bash(npm test:*)
argument-hint: "[create|review|approve|implement|verify] [spec name or file | 規格名稱或檔案]"
---

# 規格驅動開發助手

> **Language**: [English](../../../../skills/commands/sdd.md) | 繁體中文

建立、審查、核准、實作和驗證規格文件 — 完整 SDD 生命週期管理。

## 前置檢查

在執行任何 SDD 階段前，AI 助手必須執行以下適用的檢查。如果檢查失敗，停止並引導使用者到正確的階段。

### 階段閘門矩陣

| 目標階段 | 前置檢查 | 失敗時 |
|---------|---------|--------|
| `discuss` | 無（入口點） | — |
| `create` | `ls docs/specs/` → 檢查是否有孤兒規格 | 警告，建議先關閉孤兒規格 |
| `review` | 規格檔案存在且狀態 = `Draft` | → 引導至 `/sdd create` |
| `approve` | 規格檔案存在且狀態 = `Review` | → 引導至 `/sdd review` |
| `implement` | 1. `ls docs/specs/SPEC-*.md` → 至少有一個規格 | → 引導至 `/sdd create` |
| | 2. 規格狀態 = `Approved`（檢查規格中的 `status:` 欄位） | → 引導至 `/sdd approve` |
| | 3. 檢查 `.workflow-state/` 是否有活躍的 SDD 狀態 | 如果存在則恢復 |
| `verify` | 1. 規格狀態 = `Implemented` 或有實作 commits | → 引導至 `/sdd implement` |
| | 2. 所有 AC 都有程式碼 + 測試參考 | → 列出未完成的 AC |

### 檢查指令

```bash
# 檢查現有規格
ls docs/specs/SPEC-*.md 2>/dev/null

# 檢查規格狀態（grep status 欄位）
grep -m1 "^status:" docs/specs/SPEC-XXX.md

# 檢查活躍的工作流程狀態
ls .workflow-state/sdd-*.yaml 2>/dev/null

# 檢查 AC 實作狀態
grep -E "^- \[(x|X)\]" docs/specs/SPEC-XXX.md
```

### 執行行為

- **模式：`enforce`**（預設） — 阻斷階段轉換，顯示引導
- **模式：`suggest`** — 顯示警告但允許覆蓋
- **模式：`off`** — 無檢查

檢查專案配置：`.uds/config.yaml` → `workflow.enforcement_mode`

---

## SDD 工作流程

```
/sdd discuss ──► /sdd create ──► /sdd review ──► /sdd approve ──► /sdd implement ──► /sdd verify
```

### 階段 0.5：Discuss — 捕捉灰色地帶

在撰寫規格前，進行結構化討論以解決模糊之處。

**討論檢查清單：**
- [ ] 灰色地帶已識別並列出
- [ ] 範圍已鎖定（範圍內/外）
- [ ] 必讀參考已收集（read_first 清單）
- [ ] 已檢查既有決策（.project-context/）
- [ ] 問題基於實際程式碼，非猜測

**範圍鎖定規則**：討論中發現的新功能歸類為**延後**，另行追蹤。不擴大當前範圍。

**產出**：一份 `read_first` 清單和範圍定義，作為建立階段的輸入。

### 階段 1：Create — 撰寫規格

定義需求、技術設計、驗收標準和測試計畫。

**孤兒檢查**：建立新規格前，檢查是否有未關閉的孤兒規格。考慮先關閉或歸檔它們。

### 階段 2：Review — 審查驗證

與利害關係人檢查完整性、一致性和可行性。

### 階段 3：Approve — 核准

在開始實作前取得利害關係人核准。將規格狀態從 Draft/Review 更新為 Approved。

**核准檢查清單：**
- [ ] 所有審查意見已處理
- [ ] 需求完整且無歧義
- [ ] 驗收標準可測試
- [ ] 技術設計可行
- [ ] 測試計畫涵蓋所有 AC

**核准元資料：**
```yaml
status: Approved
approved-date: YYYY-MM-DD
approved-by: [approver]
```

### 階段 4：Implement — 實作

依照已核准規格開發，追蹤每個 AC 的實作進度。

**針對每個 AC 追蹤：**
- [ ] 程式碼已實作
- [ ] 單元測試已撰寫
- [ ] 測試通過

**每 AC 一個 Commit：**

建議每個驗收標準一個 commit 以提升追蹤性。緊耦合的 AC 可合併。

**建議 commit 格式：**
```
feat(<scope>): implement AC-N — <description>

Implements acceptance criteria AC-N from SPEC-XXX.
See: docs/specs/SPEC-XXX.md#AC-N

Refs: SPEC-XXX, AC-N
```

### 階段 5：Verify — 驗證

確保實作符合規格、所有測試通過、AC 已滿足。產生驗證報告。

**驗證報告輸出：**
```markdown
# Verification Report: SPEC-XXX

## Summary
- Status: PASS / FAIL
- Date: YYYY-MM-DD

## AC Coverage
| AC | Implementation | Test | Status |
|----|---------------|------|--------|
| AC-1 | src/auth.js:42 | tests/auth.test.js:15 | PASS |

## Deviation Report | 偏差報告
| Type | Description | Justification |
|------|-------------|---------------|
| Added | Rate limiting on login endpoint | Security requirement discovered during implementation |
| Modified | AC-3 uses JWT instead of session tokens | Team decision (see PRJ-2026-0042) |
| Omitted | AC-5 social login | Deferred to SPEC-XXX-v2 |
```

**偏差類別：**
- **Added**：規格中未列出的功能
- **Modified**：與規格不同的功能
- **Omitted**：未實作的規格需求

重大偏差必須記錄為 `.project-context/` 中的 `decision` 類型條目。

**驗證迴圈上限：**

驗證階段上限為 **3 次迭代**。3 次失敗後，停止並選擇：

1. 審查規格是否有歧義 — AC 是否不夠清楚？
2. 重新思考實作方案 — 嘗試不同的方法
3. 升級處理至利害關係人

迭代次數記錄在 `.workflow-state/` 中。

**追蹤矩陣（建議）：**

產生 REQ → AC → Test → Implementation → Commit 追蹤矩陣：

```markdown
| REQ-ID | AC | Test | Implementation | Commit |
|--------|-----|------|----------------|--------|
| REQ-001 | AC-1 | auth.test.js:15 | auth.js:42 | abc1234 |
| REQ-002 | AC-2 | auth.test.js:30 | auth.js:67 | def5678 |
```

空欄位標記為 `[INCOMPLETE]`。

## 增強工作流程

### 階段 0：範圍評估（新增）

在建立規格前，先評估變更範圍：

**Q1：範圍**
- [ ] 專案專用（僅 CLAUDE.md）
- [ ] 通用規則（Core Standard）

**Q2：互動**
- [ ] 需要 AI 互動 → 建立 Skill
- [ ] 靜態規則

**Q3：觸發**
- [ ] 使用者觸發 → 建立命令
- [ ] AI 自動應用

**記錄在規格元資料中：**
```yaml
scope: universal|project|utility
sync-to:
  - core-standard: pending|complete|N/A
  - skill: pending|complete|N/A
  - command: pending|complete|N/A
  - translations: pending|complete|N/A
```

### 階段 6：同步驗證（新增）

實作後，驗證所有同步目標：

- [ ] Core Standard 已建立/更新（若為 universal）
- [ ] Skill 已建立/更新（若為 interactive）
- [ ] Command 已建立/更新（若為 user-triggered）
- [ ] 翻譯已同步

## 規格狀態

| 狀態 | 說明 |
|------|------|
| Draft | 草稿中 |
| Review | 審查中 |
| Approved | 已核准 |
| Implemented | 已實作 |
| Archived | 已歸檔 |

## 驗收標準格式

所有新的驗收標準**必須**使用 Given/When/Then (GWT) 格式：

```
Given [precondition],
When [action],
Then [expected outcome].
```

**範例：**
- `Given a logged-in user, When they click 'Export', Then a CSV file is downloaded`
- `Given an empty cart, When the user adds an item, Then the cart count shows 1`

**好處：**
- 支援透過 `/derive-bdd` 進行結構化 BDD 推導
- 減少驗收標準的模糊性
- 與測試場景一對一對應

**注意**：現有規格不需要回溯更新為 GWT 格式。

## Session 分界建議

對於長時間的 SDD 工作流程，建議在自然階段邊界開啟新的 AI session 以防止上下文退化：

| 分界 | 之前的階段 | 之後的階段 |
|------|-----------|-----------|
| 1 | Create + Review | Implement |
| 2 | Implement | Verify |
| 3 | Verify | Archive |

使用 `workflow-state` 檔案和 `.project-context/` 在 session 間持久化狀態。這是建議而非強制要求。

## 規格文件結構

```markdown
# Feature: [Feature Name]

## Overview
Brief description of the feature.

## Requirements
- REQ-001: [Requirement description]
- REQ-002: [Requirement description]

## Technical Design
### Architecture
[Design details]

### API Changes
[API specifications]

### Database Changes
[Schema changes]

## Acceptance Criteria
- AC-1: Given [precondition], When [action], Then [expected outcome]
- AC-2: Given [precondition], When [action], Then [expected outcome]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]

## Rollout Plan
[Deployment strategy]
```

## 使用方式

| 指令 | 用途 |
|------|------|
| `/sdd` | 互動式規格建立精靈 |
| `/sdd discuss` | 啟動功能討論階段 |
| `/sdd discuss auth-flow` | 討論特定功能 |
| `/sdd auth-flow` | 為特定功能建立規格 |
| `/sdd create auth-flow` | 明確指定建立階段 |
| `/sdd review` | 審查現有規格 |
| `/sdd review specs/SPEC-001.md` | 審查指定規格 |
| `/sdd approve` | 列出待核准規格 |
| `/sdd approve specs/SPEC-001.md` | 核准指定規格 |
| `/sdd implement` | 列出已核准規格 |
| `/sdd implement specs/SPEC-001.md` | 追蹤指定規格的實作 |
| `/sdd verify` | 列出已實作規格 |
| `/sdd verify specs/SPEC-001.md` | 驗證指定規格的實作 |
| `/sdd --evaluate` | 僅執行範圍評估 |
| `/sdd --sync-check` | 檢查同步狀態 |

## 典型 SDD 工作流程

```bash
/sdd discuss user-authentication      # 階段 0.5：討論灰色地帶
/sdd user-authentication              # 階段 1：建立規格
/sdd review specs/SPEC-001.md         # 階段 2：審查
/sdd approve specs/SPEC-001.md        # 階段 3：核准
/derive-all specs/SPEC-001.md         # 產生測試結構
/sdd implement specs/SPEC-001.md      # 階段 4：追蹤實作
/sdd verify specs/SPEC-001.md         # 階段 5：驗證（最多 3 次迭代）
```

## 同步檢查清單範本

在每個規格中包含：

```markdown
## Sync Checklist

### From Core Standard
- [ ] Skill created/updated?
- [ ] Command created?
- [ ] Translations synced?

### From Skill
- [ ] Core Standard exists? (or marked as [Scope: Utility])
- [ ] Command created?
- [ ] Translations synced?

### From Command
- [ ] Skill documentation updated?
- [ ] Translations synced?
```

## 參考

- 完整標準：[spec-driven-dev](../spec-driven-dev/SKILL.md)
- 核心規範：[spec-driven-development.md](../../core/spec-driven-development.md)
