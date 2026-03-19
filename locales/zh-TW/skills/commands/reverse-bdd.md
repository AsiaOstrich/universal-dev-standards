---
source: ../../../../skills/commands/reverse-bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Transform SDD acceptance criteria to BDD scenarios
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

## 參考

- 上層指令：[/reverse](../reverse-engineer/SKILL.md)
- 核心規範：[reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
