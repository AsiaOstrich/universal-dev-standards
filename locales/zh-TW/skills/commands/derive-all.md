---
source: ../../../../skills/commands/derive-all.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Derive all test structures (BDD, TDD, ATDD) from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-all — 完整正向推演

> **Language**: [English](../../../../skills/commands/derive-all.md) | 繁體中文

從已核准的 SDD 規格推演所有測試結構（BDD + TDD + 可選 ATDD）。

---

## 工作流程

```
SPEC-XXX.md ──► /derive-bdd ──► /derive-tdd ──► [/derive-atdd] ──► Report
```

1. **解析** SDD 規格並驗證已核准
2. **執行** `/derive-bdd` 產生 Gherkin 場景
3. **執行** `/derive-tdd` 產生測試骨架
4. **可選** 執行 `/derive-atdd` 產生驗收測試表格
5. **產生** `DERIVATION-REPORT.md` 彙總所有輸出

## 輸出檔案

| 檔案 | 內容 |
|------|------|
| `features/SPEC-XXX.feature` | BDD Gherkin 場景 |
| `tests/SPEC-XXX.test.ts` | TDD 測試骨架 |
| `DERIVATION-REPORT.md` | 摘要與統計 |

## 使用方式

| 命令 | 用途 |
|------|------|
| `/derive-all specs/SPEC-001.md` | 從規格完整推演 |
| `/derive-all` | 互動式 — 詢問規格檔案 |

## 典型 SDD 工作流程

```bash
/sdd user-authentication          # 步驟 1：建立規格
/sdd review specs/SPEC-001.md     # 步驟 2：審查
/derive-all specs/SPEC-001.md     # 步驟 3：推演測試
# 步驟 4：實作 — 填入 [TODO] 標記
```

## 參考

- 父命令：[/derive](../forward-derivation/SKILL.md)
- 核心標準：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
- 子命令：[/derive-bdd](./derive-bdd.md)、[/derive-tdd](./derive-tdd.md)、[/derive-atdd](./derive-atdd.md)
