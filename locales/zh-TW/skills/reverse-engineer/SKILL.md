---
source: ../../../../skills/reverse-engineer/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-02-10
status: current
description: |
  將現有程式碼反向工程為規格文件、BDD 場景或 TDD 覆蓋率報告。
  使用時機：從程式碼提取規格、產生 Gherkin 場景、分析測試覆蓋率。
  關鍵字：reverse engineering, spec, bdd, tdd, 反向工程, 規格, 覆蓋率。
---

# 反向工程助手

> **語言**: [English](../../../../skills/reverse-engineer/SKILL.md) | 繁體中文

將現有程式碼反向工程為規格文件、BDD 場景或 TDD 覆蓋率報告。

## 子命令

| 子命令 | 輸入 | 輸出 | 說明 |
|--------|------|------|------|
| `spec` | 程式碼檔案/目錄 | `SPEC-XXX.md` | 從程式碼提取規格 |
| `bdd` | `SPEC-XXX.md` | `.feature` | 將 AC 轉為 Gherkin |
| `tdd` | `.feature` | 覆蓋率報告 | 分析測試覆蓋率 |

## 工作流程

### spec：程式碼轉規格

1. **掃描** - 讀取原始碼檔案，識別公開 API、資料流和業務邏輯
2. **分類** - 將每個發現標記為 `[Confirmed]`、`[Inferred]` 或 `[Unknown]`
3. **結構化** - 整理為 SDD 規格格式，包含驗收條件
4. **引用來源** - 每個反向結果皆引用 `file:line` 來源參考

### bdd：規格轉 Gherkin

1. **解析** - 讀取 SPEC-XXX.md 並提取驗收條件
2. **轉換** - 將每個 AC 對應為一個 Gherkin Scenario（1:1 對應）
3. **標記** - 加入 `@SPEC-XXX` 和 `@AC-N` 標籤以確保可追溯性
4. **輸出** - 產生 `.feature` 檔案，包含 `# [Source: path:AC-N]` 註解

### tdd：Feature 轉覆蓋率報告

1. **解析** - 讀取 `.feature` 檔案中的場景
2. **搜尋** - 使用 Grep/Glob 尋找對應的測試檔案
3. **對應** - 將場景與現有單元測試進行配對
4. **報告** - 輸出覆蓋率矩陣（已覆蓋 / 缺失 / 部分覆蓋）

## 防幻覺規則

| 規則 | 要求 |
|------|------|
| **確定性標籤** | 所有發現須使用 `[Confirmed]`、`[Inferred]`、`[Unknown]` 標注 |
| **來源引用** | 每項反向結果須引用 `file:line` 來源 |
| **禁止捏造** | 不得捏造程式碼中不存在的 API 或行為 |

## 使用方式

- `/reverse spec src/auth/` - 從 auth 模組提取規格
- `/reverse bdd specs/SPEC-AUTH.md` - 將規格 AC 轉為 Gherkin 場景
- `/reverse tdd features/auth.feature` - 分析 feature 檔案的測試覆蓋率

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[reverse-engineering-standards.md](../../../../core/reverse-engineering-standards.md)
