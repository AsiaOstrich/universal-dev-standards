---
source: skills/dev-methodology/runtime.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Methodology Runtime 指南

> **語言**: [English](../../../../skills/dev-methodology/runtime.md) | 繁體中文

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

**版本**: 1.0.0
**最後更新**: 2026-01-12

---

## 總覽

本文件定義 AI 助理在某個開發 methodology 啟用時應有的行為。它提供 phase 追蹤、checkpoint 處理及使用者互動的指引。

---

## AI 行為規格

### 1. Context 感知

當某個 methodology 啟用時，AI 應該：

- **始終知道目前的 phase**
- **在回應中顯示 phase 指示器**
- **建議符合該 phase 的動作**

#### Phase 狀態顯示

在相關回應的開頭加入 methodology 狀態：

```
┌────────────────────────────────────────────────┐
│ 📋 Methodology: TDD                             │
│ 📍 Phase: 🔴 RED (writing failing test)         │
│ ⏱️  Duration: 3 minutes                         │
└────────────────────────────────────────────────┘
```

### 2. 主動指引

根據目前的 phase 提供符合 context 的建議：

```markdown
**Current Phase: 🔴 RED (TDD)**

You're writing a failing test for: user login validation

**Next step**: Write a test that describes the expected behavior.

Would you like me to:
1. Generate a test skeleton
2. Show TDD best practices for this scenario
3. Continue with your manual approach
```

### 3. Phase 轉換偵測

監控那些代表 phase 轉換的條件：

| Signal | Transition |
|--------|------------|
| Test 執行失敗 | RED → ready for GREEN |
| 所有 test 通過 | GREEN → ready for REFACTOR |
| 使用者確認 refactor 完成 | REFACTOR → next cycle or DONE |
| 時間超過 phase duration | 顯示提醒 |
| 偵測到 Git commit | 重置 phase 計時器 |

### 4. Checkpoint 行為

當 checkpoint 條件觸發時，顯示 checkpoint 通知：

```
┌────────────────────────────────────────────────┐
│ 🔔 Methodology Checkpoint                       │
├────────────────────────────────────────────────┤
│ GREEN phase completed                          │
│                                                │
│ Checklist Status:                              │
│   ✅ Minimum code written                      │
│   ✅ Test passes                               │
│   ✅ All other tests pass                      │
│   ⬜ (Optional) Consider edge cases            │
│                                                │
│ Change Statistics:                             │
│   - Files: 3                                   │
│   - Added: 45 lines                            │
│   - Deleted: 2 lines                           │
│                                                │
│ Suggested commit:                              │
│   test(auth): add email validation test        │
│   feat(auth): implement email validation       │
│                                                │
│ Options:                                       │
│   [1] Commit now (show git commands)           │
│   [2] Continue to REFACTOR phase               │
│   [3] View detailed changes                    │
└────────────────────────────────────────────────┘
```

### 5. Skip 追蹤

追蹤連續的 skip 並適當地警告：

| Skip Count | Action |
|------------|--------|
| 1-2 | 不採取動作，記錄 skip |
| 3 | 警告通知 |
| 4+ | 強烈警告，建議 commit |

#### Skip 警告顯示

```
┌────────────────────────────────────────────────┐
│ ⚠️ Skip Warning                                 │
├────────────────────────────────────────────────┤
│ You have skipped check-in 3 times consecutively│
│                                                │
│ Current accumulated changes:                   │
│   - Files: 8                                   │
│   - Added: 320 lines                           │
│   - Deleted: 45 lines                          │
│                                                │
│ Recommendation: Commit your changes now to     │
│ avoid losing work and maintain atomic commits. │
│                                                │
│ [1] Commit now  [2] Skip anyway  [3] View diff │
└────────────────────────────────────────────────┘
```

---

## Methodology 偵測

### 自動偵測

AI 應從以下來源偵測 methodology context：

1. **Manifest 配置**
   ```json
   // .standards/manifest.json
   { "methodology": { "active": "tdd" } }
   ```

2. **關鍵字偵測**
   - "Let's use TDD for this"
   - "Write a failing test first"
   - "Given-When-Then"
   - "Create a spec for this change"

3. **命令呼叫**
   - `/tdd`, `/bdd`, `/sdd`, `/atdd`
   - `/methodology switch <id>`

### 載入 Methodology 定義

```
Methodology Loading Priority:
1. Custom: .standards/methodologies/{id}.methodology.yaml
2. Built-in: methodologies/{id}.methodology.yaml
3. Fallback: Generic phase-less workflow
```

---

## Checklist 管理

### 顯示格式

```markdown
### Phase Checklist

**Required:**
- [ ] Test describes expected behavior
- [x] Test name is clear
- [ ] Test follows AAA pattern

**Optional:**
- [ ] Consider edge cases
```

### 追蹤

- 根據使用者動作與程式碼分析更新 checklist 項目
- 若 required 項目未完成則阻擋 phase 轉換（strict mode）
- 記錄完成狀態以供稽核軌跡使用

---

## 整合點

### 與 Git 整合

- 偵測 commit 以重置 phase 計時器
- 根據 methodology 建議 commit message
- 自動納入 spec/story 參照

### 與 Test Runner 整合

- 偵測 test 通過/失敗以觸發 phase 轉換
- 回報與目前 phase 相關的 test 覆蓋率

### 與 Code Review 整合

- 加入 methodology 專屬的 review 檢查
- 在 PR 描述中參照啟用中的 methodology

---

## 錯誤處理

### 找不到 Methodology

```
⚠️ Methodology 'custom-workflow' not found.

Available methodologies:
- tdd (built-in)
- bdd (built-in)
- sdd (built-in)
- atdd (built-in)

Use `/methodology list` to see all options.
```

### 無效的 Phase 轉換

```
⚠️ Cannot transition from RED to REFACTOR.

TDD requires: RED → GREEN → REFACTOR

Current phase: RED
Valid next phases: GREEN

Complete the RED phase checklist first.
```

---

## 效能考量

- 首次載入後快取 methodology 定義
- 僅在 manifest 變更時才重新載入
- 最小化 checkpoint 頻率以避免打斷
- 批次執行 git status 檢查

---

## 在地化（Localization）

所有面向使用者的文字都應使用適當的語言欄位：

```yaml
# If user's locale is zh-TW
name: nameZh || name
description: descriptionZh || description
prompt: promptZh || prompt
```

---

## 6. Prerequisite 檢查 / Prerequisite Checking

在執行任何 slash 命令之前，請遵循定義於
[`prerequisite-check.md`](../../../../skills/dev-methodology/prerequisite-check.md) 的 prerequisite 檢查協議。

**Priority**: 此檢查會在 phase 追蹤與 methodology 偵測之前執行。

**與 Phase 追蹤的整合**：
- 若使用者處於啟用中的 methodology session，使用該 methodology 的 phase
  序列作為主要的 prerequisite 來源
- 若無啟用中的 methodology，使用 [`workflow-prerequisites.yaml`](../../../../methodologies/workflow-prerequisites.yaml) 作為 fallback
- 若多個 workflow 都包含該命令，只需滿足其中一個即可

**Reference**: 完整的演算法、evidence 偵測規則及使用者提示模板，請參閱 [`prerequisite-check.md`](../../../../skills/dev-methodology/prerequisite-check.md)。

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-02-12 | 新增 §6 Prerequisite Checking 整合 |
| 1.0.0 | 2026-01-12 | Initial runtime specification |
