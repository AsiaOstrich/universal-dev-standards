---
source: ../../../../skills/commands/reverse-bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: ed76cb2e8db5
---

---
description: [UDS] 將 SDD 驗收條件轉換為 BDD 場景
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[spec file or source directory | 規格檔案或原始碼目錄]"
---

# /reverse-bdd — 擷取 BDD 場景

> **Language**: [English](../../../../skills/commands/reverse-bdd.md) | 繁體中文

將現有程式碼或 SDD 驗收條件轉換為 BDD Gherkin 場景。

## 工作流程

```
Source/Spec ──► Analyze Behaviors ──► Generate .feature ──► Review
```

1. **分析**原始碼或規格中的行為模式
2. **擷取**隱含的 Given-When-Then 流程
3. **產生** Gherkin `.feature` 檔案
4. **標記**確定性標籤：`[Confirmed]`、`[Inferred]`

## 輸出格式

```gherkin
# [Source: src/auth/login.js:45]
Feature: User Login [Inferred]

  # [Confirmed] from test/auth.test.js:12
  Scenario: Successful login
    Given a registered user exists
    When they submit valid credentials
    Then they receive an auth token
```

## 使用方式

| 指令 | 用途 |
|------|------|
| `/reverse-bdd src/auth/` | 從 auth 模組擷取 BDD |
| `/reverse-bdd specs/SPEC-001.md` | 將規格 AC 轉為 BDD |

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/reverse-bdd` | 詢問目標（原始碼目錄或 spec 檔案） |
| `/reverse-bdd <path>` | 直接分析指定路徑 |

### 互動腳本

1. 判斷輸入類型（原始碼 or spec）
2. 分析行為模式，擷取隱含的 Given-When-Then 流程
3. 為每個場景標記確定性：`[Confirmed]`、`[Inferred]`
4. 產生 Gherkin `.feature` 檔案（含 `[Source: file:line]` 引用）
5. 展示結果

🛑 **STOP**: 展示 `.feature` 內容後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| `.feature` 產生後 | 確認場景正確並寫入 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 行為模式模糊無法轉為場景 | 標記 `[Assumption]`，列出需人工確認的場景 |
| 目標無可分析的行為邏輯 | 告知並建議檢查是否為正確的檔案 |

## 參考

- 上層指令：[/reverse](../reverse-engineer/SKILL.md)
- 核心規範：[reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
