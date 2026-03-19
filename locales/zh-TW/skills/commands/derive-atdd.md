---
source: ../../../../skills/commands/derive-atdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Derive ATDD acceptance tests from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-atdd — 推演 ATDD 驗收測試

> **Language**: [English](../../../../skills/commands/derive-atdd.md) | 繁體中文

從已核准的 SDD 規格文件推演 ATDD 驗收測試表格。

---

## 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate acceptance.md ──► Review
```

1. **讀取** SDD 規格並提取驗收條件
2. **映射** 每個 AC 為驗收測試表格（Given-When-Then 欄位）
3. **產生** `acceptance.md`，包含測試資料和預期結果
4. **輸出** 推演摘要

## 輸出格式

```markdown
# Acceptance Tests: SPEC-001

## AC-1: [Description]

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | [precondition] | [action] | [expected] | ⬜ |
| 2 | [precondition] | [action] | [expected] | ⬜ |
```

## 使用方式

| 命令 | 用途 |
|------|------|
| `/derive-atdd specs/SPEC-001.md` | 從特定規格推演 ATDD |
| `/derive-atdd` | 互動式 — 詢問規格檔案 |

> **注意**：BDD 場景已可作為可執行的驗收測試。`/derive-atdd` 適用於專門的手動測試工作流程。

## 參考

- 父命令：[/derive](../forward-derivation/SKILL.md)
- 核心標準：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
