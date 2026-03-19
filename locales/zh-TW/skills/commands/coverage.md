---
source: ../../../../skills/commands/coverage.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Analyze test coverage and provide recommendations
allowed-tools: Read, Grep, Glob, Bash(npm run test:coverage:*), Bash(npx:*)
argument-hint: "[file or module to analyze | 要分析的檔案或模組]"
---

# 測試覆蓋率助手

> **Language**: [English](../../../../skills/commands/coverage.md) | 繁體中文

多維度分析測試覆蓋率並提供可執行的建議。

---

## 覆蓋率維度

| 維度 | 測量內容 |
|------|----------|
| **Line** | 執行的行數 |
| **Branch** | 決策路徑 |
| **Function** | 呼叫的函數 |
| **Statement** | 執行的陳述式 |

## 八維度框架

1. **程式碼覆蓋率** - 行數、分支、函數
2. **需求覆蓋率** - 所有需求已測試
3. **風險覆蓋率** - 高風險區域已測試
4. **整合覆蓋率** - 元件互動
5. **邊界情況覆蓋率** - 邊界條件
6. **錯誤覆蓋率** - 錯誤處理路徑
7. **權限覆蓋率** - 存取控制場景
8. **AI 生成品質** - AI 產生測試的有效性

## 工作流程

1. **執行覆蓋率工具** - 產生覆蓋率報告
2. **分析缺口** - 找出未測試的區域
3. **排序優先級** - 依風險和重要性排序
4. **建議測試** - 建議應新增的具體測試
5. **追蹤進度** - 隨時間監控覆蓋率

## 覆蓋率目標

| 等級 | 覆蓋率 | 適用場景 |
|------|--------|----------|
| 最低 | 60% | 舊有程式碼 |
| 標準 | 80% | 大多數專案 |
| 高 | 90% | 關鍵系統 |
| 關鍵 | 95%+ | 安全關鍵系統 |

## 使用方式

- `/coverage` - 執行完整覆蓋率分析
- `/coverage src/auth` - 分析特定模組
- `/coverage --recommend` - 取得測試建議

## AC 覆蓋率（需求層級）

本命令（`/coverage`）分析**程式碼層級**覆蓋率（line/branch/function）。若需**需求層級**覆蓋率 — 追蹤哪些驗收條件（AC）有對應測試 — 請使用 [`/ac-coverage`](./ac-coverage.md)。

| | `/coverage` | `/ac-coverage` |
|-|-------------|----------------|
| **層級** | 程式碼（line/branch/function）| 需求（AC 對測試）|
| **問題** | 「多少程式碼被測試了？」| 「哪些 AC 有測試？」|

## 參考

- 完整標準：[test-coverage-assistant](../test-coverage-assistant/SKILL.md)
- 核心指南：[testing-standards](../../core/testing-standards.md)
- AC 覆蓋率：[/ac-coverage](./ac-coverage.md) — 需求層級追溯
