---
source: ../../../../skills/commands/derive-bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 5459d9acd8e8
status: current
---

---
description: "[UDS] 從 SDD 規格推演 BDD Gherkin 場景"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-bdd — 推演 BDD 場景

> **Language**: [English](../../../../skills/commands/derive-bdd.md) | 繁體中文

從已核准的 SDD 規格文件推演 Gherkin `.feature` 檔案。

## 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .feature ──► Review
```

1. **讀取** SDD 規格並萃取驗收條件
2. **對應** 每個 AC 到一個 Gherkin Scenario（1:1）
3. **產生** `.feature` 檔案，包含 `@SPEC-XXX` 和 `@AC-N` 標籤
4. **輸出** 推演摘要

## 輸出格式

```gherkin
Feature: [Feature Name]

  @SPEC-001 @AC-1
  Scenario: [AC-1 description]
    Given [context]
    When [action]
    Then [expected result]
```

## 使用方式

| 指令 | 用途 |
|------|------|
| `/derive-bdd specs/SPEC-001.md` | 從特定規格推演 BDD |
| `/derive-bdd` | 互動式 — 詢問規格檔案 |

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/derive-bdd` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-bdd <spec-file>` | 直接從指定 spec 推演 BDD 場景 |

### 互動腳本

1. 讀取 spec，擷取所有 AC
2. 將每個 AC 映射為一個 Gherkin Scenario（1:1）
3. 加入 `@SPEC-XXX` 和 `@AC-N` 標籤
4. 展示生成的 `.feature` 內容

**決策：輸出位置**
- IF 專案有 `tests/features/` 目錄 → 輸出到該目錄
- IF 專案有 `features/` 目錄 → 輸出到該目錄
- ELSE → 詢問使用者輸出位置

🛑 **STOP**：展示 `.feature` 內容後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| `.feature` 生成後 | 確認內容正確並寫入 |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|----------|---------|
| AC 非 GWT 格式 | 嘗試轉換並標記 `[Derived]`，展示供確認 |
| Spec 無 AC | 告知並引導修改 spec |
| 生成的 Gherkin 語法無效 | 自動修正語法，標記修正處 |

## 參考

- 父指令：[/derive](../spec-derivation/SKILL.md)
- 核心規範：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
