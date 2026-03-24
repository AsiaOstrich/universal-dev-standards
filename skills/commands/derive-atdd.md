---
description: [UDS] Derive ATDD acceptance tests from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-atdd — Derive ATDD Acceptance Tests | 推演 ATDD 驗收測試

Derive ATDD acceptance test tables from an approved SDD specification document.

從已核准的 SDD 規格文件推演 ATDD 驗收測試表格。

## Workflow | 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate acceptance.md ──► Review
```

1. **Read** the SDD spec and extract acceptance criteria
2. **Map** each AC to an acceptance test table (Given-When-Then columns)
3. **Generate** `acceptance.md` with test data and expected results
4. **Output** derivation summary

## Output Format | 輸出格式

```markdown
# Acceptance Tests: SPEC-001

## AC-1: [Description]

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | [precondition] | [action] | [expected] | ⬜ |
| 2 | [precondition] | [action] | [expected] | ⬜ |
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-atdd specs/SPEC-001.md` | Derive ATDD from specific spec | 從特定規格推演 ATDD |
| `/derive-atdd` | Interactive — ask for spec file | 互動式 — 詢問規格檔案 |

> **Note**: BDD scenarios already serve as executable acceptance tests. `/derive-atdd` is for specialized manual testing workflows.

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/derive-atdd` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-atdd <spec-file>` | 直接從指定 spec 推演 ATDD 表格 |

### Interaction Script | 互動腳本

1. 讀取 spec，擷取所有 AC
2. 將每個 AC 映射為驗收測試表格（Given-When-Then 欄位）
3. 為每個 AC 生成多筆測試資料（正向 + 反向 + 邊界值）
4. 展示生成的 `acceptance.md` 內容

🛑 **STOP**: 展示表格後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 驗收測試表格生成後 | 確認內容正確並寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| AC 缺乏具體的輸入/輸出描述 | 標記 `[TODO: needs test data]`，繼續其餘 AC |
| Spec 無 AC | 告知並引導修改 spec |

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
