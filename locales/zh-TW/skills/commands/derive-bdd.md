---
source: ../../../../skills/commands/derive-bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Derive BDD Gherkin scenarios from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# 推演 BDD 場景

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
@SPEC-001
Feature: [Feature Name]

  @AC-1
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

## 參考

- 父指令：[/derive](../forward-derivation/SKILL.md)
- 核心規範：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
