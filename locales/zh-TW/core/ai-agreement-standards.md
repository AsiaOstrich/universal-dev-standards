---
source: ../../../core/ai-agreement-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 9238a5b53f4e
status: current
---

# AI 協議標準

> **語言**: [English](../../../core/ai-agreement-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-29
**適用性**: 所有 AI 輔助開發工作階段
**範圍**: 通用 (universal)
**業界標準**: ISO 12207 §6.1
**參考資料**: [iso.org](https://www.iso.org/standard/63712.html)
**ISO 12207 對應**: 協議程序 (6.1)

---

## 目的

本標準將人類（獲取方）與 AI（供應方）之間的互動形式化為可驗證的協議。在「Vibe Coding」中，提示詞上下文作為管控 AI 行為與交付成果的法律合約。

---

## 1. 上下文合約 (The Context Contract)

每個 AI 工作階段必須以清晰的上下文合約開始。這通常透過系統提示詞檔案（例如 `CLAUDE.md`、`.cursorrules`）來實作。

### 1.1 合約組成要素

一份有效的上下文合約必須定義：

| 組成要素 | 說明 | 範例 |
|----------|------|------|
| **角色定義** | 代表使用者 vs. AI 的身分 | 「你是一位資深後端工程師...」 |
| **工作範圍** | 操作邊界 | 「只修改 `src/utils/` 中的檔案。不要動到 `config/`。」 |
| **約束法則** | 不可協商的規則 | 「絕不硬編碼機密資訊。一律使用 TypeScript。」 |
| **驗收條件** | 完成的定義 | 「程式碼必須通過 `npm test` 與 `npm run lint`。」 |

---

## 2. 需求提案標準 (RFP)

複雜任務應結構化為「RFP」（需求提案書），而非單純的對話訊息。

### 2.1 RFP 提示詞結構

當請求複雜功能或重構時，請使用此結構：

```markdown
# Objective
[One-line summary of the task]

# Context & Constraints
- **Current State**: [Describe existing code/architecture]
- **Target State**: [Describe desired outcome]
- **Constraints**: [e.g., "Must use library X", "Max complexity N"]

# Input Data
[List relevant files or paste JSON schemas]

# Deliverable Requirements
1. [Requirement A]
2. [Requirement B]

# Verification Plan
- [ ] [Test case 1]
- [ ] [Test case 2]
```

---

## 3. 交付驗收 (Supply Acceptance)

### 3.1 AI 自我驗證
在輸出程式碼之前，AI（供應方）必須對照上下文合約驗證自身輸出：
- 此程式碼是否違反任何約束法則？
- 是否符合所有驗收條件？

### 3.2 人工簽核
使用者（獲取方）在套用「交付物」（AI 輸出）之前，必須嚴格審查：
- **審查**：閱讀程式碼（不要盲目信任）。
- **驗證**：執行驗證計畫。
- **接受**：僅在驗證通過後才 commit 變更。

---

## 相關標準

- [Anti-Hallucination Protocol](anti-hallucination.md)
- [Requirement Engineering](requirement-engineering.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-29 | 初始版本，對應至 ISO 12207 協議程序 |
