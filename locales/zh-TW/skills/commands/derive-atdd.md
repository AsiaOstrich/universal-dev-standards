---
source: ../../../../skills/commands/derive-atdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 160981bc6d4d
status: current
---

---
description: "[UDS] 從 SDD 規格推演 ATDD 驗收測試"
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

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/derive-atdd` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-atdd <spec-file>` | 直接從指定 spec 推演 ATDD 表格 |

### 互動腳本

1. 讀取 spec，擷取所有 AC
2. 將每個 AC 映射為驗收測試表格（Given-When-Then 欄位）
3. 為每個 AC 生成多筆測試資料（正向 + 反向 + 邊界值）
4. 展示生成的 `acceptance.md` 內容

🛑 **STOP**：展示表格後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 驗收測試表格生成後 | 確認內容正確並寫入 |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|----------|---------|
| AC 缺乏具體的輸入/輸出描述 | 標記 `[TODO: needs test data]`，繼續其餘 AC |
| Spec 無 AC | 告知並引導修改 spec |

## 參考

- 父命令：[/derive](../spec-derivation/SKILL.md)
- 核心標準：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
