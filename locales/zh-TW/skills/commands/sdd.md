---
source: ../../../../skills/commands/sdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: 3e985d7d90bd
---

---
description: [UDS] 建立或審查規格驅動開發的規格文件
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

## AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 | AI 行為 |
|------|---------|---------|
| `/sdd` | 1. 檢查 `docs/specs/` 是否有進行中的 spec 2. **有進行中的 spec** → 顯示狀態摘要，問使用者要繼續哪個還是新建 3. **無進行中的 spec** → 問使用者想做什麼功能，進入 discuss | 檢查進行中的規格；顯示狀態或開始 discuss |
| `/sdd <feature-name>` | 進入 **discuss** 階段（以 feature-name 為主題） | 針對該功能進入 discuss 階段 |
| `/sdd <phase>` | 進入指定 phase，執行 Pre-Flight Check。無指定 spec 時，列出該 phase 可操作的 spec 清單 | 進入指定階段，列出符合條件的規格 |
| `/sdd <phase> <spec-file>` | 進入指定 phase，對指定 spec 執行 Pre-Flight Check 後開始 | 針對指定規格進入該階段 |
| `/sdd --evaluate` | 僅執行 Scope Evaluation（Phase 0），輸出範圍評估結果 | 僅執行範圍評估 |
| `/sdd --sync-check` | 僅執行同步檢查，輸出同步狀態 | 僅執行同步檢查 |

### 互動腳本

#### 階段 0.5：Discuss

1. 讀取相關程式碼和文件，建立對現狀的理解
2. 列出識別到的灰色地帶（ambiguities），以編號問題呈現
3. 逐一與使用者討論，收斂答案
4. 鎖定範圍（In Scope / Out of Scope / Deferred）

**決策：灰色地帶解決程度**
- IF 所有問題都有明確答案 → 輸出 scope summary，建議進入 create
- IF 仍有未解問題 → 列出剩餘問題，問使用者是否接受風險繼續
- IF 使用者說「先這樣」 → 記錄未解問題為 `[OPEN]`，允許進入 create

**產出格式：**
```markdown
### Discuss Summary
**Feature**: [name]
**In Scope**: [list]
**Out of Scope**: [list]
**Deferred**: [list]
**Open Questions**: [list or "None"]
**read_first**: [file list]
```

🛑 **STOP**: 顯示 Discuss Summary 後等待使用者確認進入 create

#### 階段 1：Create

1. 基於 discuss 結論和 read_first 檔案，撰寫完整 spec
2. 使用 Spec Document Structure 模板
3. 所有 AC 使用 Given/When/Then 格式
4. 為 spec 指定 ID（查看 `docs/specs/` 目錄決定下一個編號）
5. 撰寫 Test Plan
6. 填寫 Assumptions & Open Questions（必填），使用 `[Assumption]`/`[Need Confirmation]` 標籤
7. IF spec 有 >3 ACs → 建議建立 `.ac.yaml` sidecar（參考 `specs/schemas/acceptance-criteria.schema.yaml`）
8. IF spec 定義 API/data flow → 建議填寫 I/O Contract 章節
9. IF spec 涉及 AI Agent 行為 → 填寫 AI Agent Behavior 章節

**決策：Spec 放置位置**
- IF 是 CLI 相關 → `docs/specs/cli/`
- IF 是 Core Standard 相關 → `docs/specs/standards/`
- IF 是 Skill 相關 → `docs/specs/skills/`
- IF 是架構相關 → `docs/specs/architecture/`
- IF 是跨元件 → `docs/specs/system/`
- ELSE → `docs/specs/`

🛑 **STOP**: 撰寫完 spec 後展示內容，等待使用者確認再寫入檔案

#### 階段 2：Review

1. 讀取指定 spec 檔案
2. 逐項檢查以下維度：

| 檢查維度 | 檢查內容 |
|----------|---------|
| Requirements 完整性 | 所有 REQ 都有 Scenario |
| AC 可測試性 | 每個 AC 都是 Given/When/Then 格式 |
| AC 覆蓋率 | 每個 REQ 至少有一個 AC 對應 |
| Technical Design 可行性 | 設計不依賴不存在的 API/工具 |
| Test Plan 對應 | Test Plan 涵蓋所有 AC |
| 範圍一致性 | 沒有超出 discuss 鎖定的範圍 |
| 無歧義 | 沒有模糊用語（「等等」「適當地」） |
| 假設標記完整性 | 所有假設都有 `[Assumption]` 標籤和驗證方式 |
| 待釐清追蹤 | 所有 `[Need Confirmation]` 項目有負責人和期限 |

3. 輸出 Review 結果表格
4. 更新 spec status 為 `Review`

**決策：Review 結果**
- IF 全部通過 → 建議進入 approve
- IF 有 blocking issue → 列出問題，建議修改後重新 review
- IF 只有 suggestion → 列出建議，使用者可選擇修改或直接 approve

🛑 **STOP**: 顯示 review 結果後等待使用者決定

#### 階段 3：Approve

1. 讀取 spec，確認 status = `Review`
2. 逐項展示 Approval Checklist（5 項），標記通過/未通過
3. 等待使用者確認核准

**決策：Approval 結果**
- IF 使用者確認核准 → 更新 spec metadata（status, approved-date, approved-by）
- IF 使用者拒絕 → 記錄原因，建議回到 review 或 create

🛑 **STOP**: 展示 checklist 結果後等待使用者明確說「核准」或「approved」

#### 階段 4：Implement

1. 讀取 approved spec，列出所有 AC
2. 產出實作計畫：每個 AC 要改哪些檔案、預估複雜度
3. 等待使用者確認計畫

🛑 **STOP**: 顯示實作計畫後等待使用者確認

4. 逐 AC 實作：
   a. 撰寫程式碼
   b. 撰寫對應測試
   c. 執行測試確認通過
   d. 更新 spec 中的 AC checkbox

**決策：Commit 節奏**
- IF AC 之間相互獨立 → 每完成一個 AC 就提示可以 commit
- IF AC 之間緊耦合 → 合併完成後一起提示 commit
- 不自動執行 git commit — 僅提示使用者

**決策：測試失敗**
- IF 測試失敗 → 修復後重新測試，最多重試 3 次
- IF 3 次仍失敗 → 🛑 STOP，報告問題，等待使用者指導

🛑 **STOP**: 每個獨立 AC 完成後暫停，展示進度，等待使用者確認繼續

#### 階段 5：Verify

1. 讀取 spec，列出所有 AC
2. 對每個 AC 收集證據：
   - 程式碼位置（file:line）
   - 測試位置（file:line）
   - 測試結果（執行測試）
3. 檢查是否有偏差（Added / Modified / Omitted）
4. 產生 Verification Report

**決策：驗證結果**
- IF 全部 PASS → 更新 spec status 為 `Implemented`，建議歸檔
- IF 有 FAIL → 列出失敗項目，建議回到 implement 修復
- IF 迭代次數 ≥ 3 → 🛑 STOP，強制升級（review spec / rethink / escalate）

🛑 **STOP**: 顯示 Verification Report 後等待使用者決定下一步

#### 階段 6：Archive

1. 確認 spec status = `Implemented` 且 verify 通過
2. 連結相關 commit/PR
3. 更新 spec status 為 `Archived`

🛑 **STOP**: 確認歸檔前等待使用者確認

### 停止點總覽

| 階段 | 停止點 | 等待內容 |
|------|--------|---------|
| discuss | Discuss Summary 輸出後 | 確認進入 create |
| create | Spec 撰寫完成後 | 確認寫入檔案 |
| review | Review 結果輸出後 | 決定修改或進入 approve |
| approve | Checklist 展示後 | 明確核准 |
| implement | 實作計畫展示後 | 確認開始實作 |
| implement | 每個獨立 AC 完成後 | 確認繼續下一個 |
| verify | Verification Report 輸出後 | 決定歸檔或修復 |
| archive | 歸檔前 | 確認歸檔 |

### 錯誤處理

| 錯誤條件 | AI 動作 | AI 行為 |
|----------|---------|---------|
| Pre-Flight Check 失敗 | 說明哪個條件未滿足，引導到正確的 phase | 說明失敗原因，引導至正確階段 |
| Spec 檔案不存在 | 列出可用的 spec 檔案，或建議 `/sdd create` | 列出可用規格或建議建立 |
| Spec status 不符合目標 phase | 顯示當前 status，說明需要先完成哪個 phase | 顯示當前狀態，說明需先完成的階段 |
| `docs/specs/` 目錄不存在 | 自動建立目錄，繼續流程 | 自動建立目錄 |
| 使用者提供的 feature name 與現有 spec 重複 | 顯示現有 spec，問使用者是要繼續還是新建 | 顯示現有規格，詢問繼續或新建 |
| 實作中測試反覆失敗（>3 次） | 停止自動修復，報告問題，等待使用者指導 | 停止自動修復，回報問題，等待指導 |
| 非預期狀態（無法判斷正確行為） | 停止並詢問使用者，不猜測 | 停止並詢問，絕不猜測 |

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
- [ ] 所有 [Assumption] 標籤已解決（已驗證或已失效）
- [ ] 所有 [Need Confirmation] 項目已回答

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

| 狀態 | Description | 說明 |
|------|-------------|------|
| Draft | Work in progress | 草稿中 |
| Review | Under review | 審查中 |
| Approved | Ready for implementation | 已核准 |
| Implemented | Code complete | 已實作 |
| Archived | Completed or deprecated | 已歸檔 |

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

## Input/Output Contract (Optional) / 輸入輸出合約（可選）

### Input Contract
| Field | Type | Required | Source | Description |
|-------|------|----------|--------|-------------|

### Output Contract
| Field | Type | Guarantee | Consumer | Description |
|-------|------|-----------|----------|-------------|

## Assumptions & Open Questions / 假設與待釐清

### Assumptions / 假設
| # | Assumption | Impact Scope | Verification Method | Status |
|---|-----------|--------------|---------------------|--------|
| A1 | [Assumption] description | AC-N | How to verify | Unverified/Verified/Invalid |

### Open Questions / 待釐清
| # | Question | Affected AC | Owner | Deadline |
|---|---------|------------|-------|----------|

## AI Agent Behavior (Optional) / AI Agent 行為（可選）

### Role & Responsibilities / 角色與職責
### Processing Rules / 處理規則
| # | Rule | Priority |
|---|------|----------|

### Quality Checks (Self-Validation) / 品質檢查（自我驗證）
- [ ] [Check item]

### Constraints / 限制與約束
- Must not [behavior]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]

## Rollout Plan
[Deployment strategy]
```

## 使用方式

| 指令 | Purpose | 用途 |
|------|---------|------|
| `/sdd` | Interactive spec creation wizard | 互動式規格建立精靈 |
| `/sdd discuss` | Start discuss phase for a feature | 啟動功能討論階段 |
| `/sdd discuss auth-flow` | Discuss specific feature | 討論特定功能 |
| `/sdd auth-flow` | Create spec for specific feature | 為特定功能建立規格 |
| `/sdd create auth-flow` | Explicit create phase | 明確指定建立階段 |
| `/sdd review` | Review existing specs | 審查現有規格 |
| `/sdd review specs/SPEC-001.md` | Review specific spec | 審查指定規格 |
| `/sdd approve` | List specs pending approval | 列出待核准規格 |
| `/sdd approve specs/SPEC-001.md` | Approve specific spec | 核准指定規格 |
| `/sdd implement` | List approved specs | 列出已核准規格 |
| `/sdd implement specs/SPEC-001.md` | Track implementation for spec | 追蹤指定規格的實作 |
| `/sdd verify` | List implemented specs | 列出已實作規格 |
| `/sdd verify specs/SPEC-001.md` | Verify implementation for spec | 驗證指定規格的實作 |
| `/sdd --evaluate` | Run scope evaluation only | 僅執行範圍評估 |
| `/sdd --sync-check` | Check sync status | 檢查同步狀態 |

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
