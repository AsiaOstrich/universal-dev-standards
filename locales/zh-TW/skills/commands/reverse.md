---
source: ../../../../skills/commands/reverse.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: reverse
description: [UDS] Reverse engineer code to Specs, BDD, or TDD coverage.
argument-hint: "[spec|bdd|tdd] <input> [--output <file>]"
---

# 反向工程

> **Language**: [English](../../../../skills/commands/reverse.md) | 繁體中文

將現有程式碼或測試反向工程為規格和場景。

## 用法

```bash
/reverse [subcommand] <input> [options]
```

### 子命令

| 子命令 | 輸入 | 輸出 | 說明 |
|--------|------|------|------|
| `spec` | 程式碼檔案/目錄 | `SPEC-XXX.md` | 從程式碼建立 SDD 規格 |
| `bdd` | `SPEC-XXX.md` | `.feature` | 將規格 AC 轉為 Gherkin |
| `tdd` | `.feature` | 覆蓋報告 | 分析 feature 的 TDD 覆蓋率 |

### 選項

| 選項 | 說明 |
|------|------|
| `--output` | 輸出檔案路徑 |
| `--include-tests` | 在分析中包含測試檔案（用於 `spec`）|
| `--review` | 產生後觸發審查 |

## 工作流程

### 1. Code to Spec（舊版程式碼復原）
```bash
/reverse spec src/auth/ --output specs/SPEC-AUTH.md
```
分析程式碼邏輯以建立功能規格。

### 2. Spec to BDD（場景產生）
```bash
/reverse bdd specs/SPEC-AUTH.md --output features/auth.feature
```
將規格中的驗收標準轉換為 Gherkin 場景。

### 3. BDD to TDD（覆蓋分析）
```bash
/reverse tdd features/auth.feature
```
檢查 feature 檔案中的場景是否有對應的單元測試。

## 防幻覺

*   **確定性標記**：在輸出中使用 `[Confirmed]`、`[Inferred]`、`[Unknown]` 標記。
*   **來源標註**：為所有反向推導的邏輯標註 `file:line`。

## 參考

*   [反向工程技能](../reverse-engineer/SKILL.md)
*   [核心規範](../../core/reverse-engineering-standards.md)
