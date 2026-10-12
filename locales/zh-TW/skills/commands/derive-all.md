---
source: ../../../../skills/commands/derive-all.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: df78a557d100
status: current
---

---
description: "[UDS] 從 SDD 規格推演所有測試結構（BDD、TDD、ATDD）"
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

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/derive-all` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-all <spec-file>` | 直接對指定 spec 執行完整推演 |

### 互動腳本

1. 讀取並驗證 spec（status = Approved）
2. 依序執行：`/derive-bdd` → `/derive-tdd` → 詢問是否需要 `/derive-atdd`

**決策：ATDD 推演**
- IF 使用者要求 → 執行 `/derive-atdd`
- ELSE → 跳過 ATDD

🛑 **STOP**：BDD + TDD 推演完成後，詢問是否需要 ATDD 推演

3. 生成 `DERIVATION-REPORT.md` 彙總所有輸出
4. 展示報告摘要

🛑 **STOP**：展示所有生成檔案清單後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 所有推演完成後 | 確認寫入所有檔案 |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|----------|---------|
| Spec status ≠ Approved | 引導到 `/sdd approve` |
| 子命令推演失敗 | 報告哪個推演失敗，已成功的仍保留，詢問是否繼續 |

## 參考

- 父命令：[/derive](../spec-derivation/SKILL.md)
- 核心標準：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
- 子命令：[/derive-bdd](./derive-bdd.md)、[/derive-tdd](./derive-tdd.md)、[/derive-atdd](./derive-atdd.md)
