---
source: ../../../../skills/commands/coverage.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: a670799573a6
status: current
---

---
description: "[UDS] 分析測試覆蓋率並提供建議"
allowed-tools: Read, Grep, Glob, Bash(npm run test:coverage:*), Bash(npx:*)
argument-hint: "[file or module to analyze | 要分析的檔案或模組]"
---

# 測試覆蓋率助手

> **Language**: [English](../../../../skills/commands/coverage.md) | 繁體中文

多維度分析測試覆蓋率並提供可執行的建議。

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

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/coverage` | 偵測測試框架，執行全專案覆蓋率分析 |
| `/coverage <path>` | 僅分析指定模組/路徑 |
| `/coverage --recommend` | 分析後重點輸出測試建議 |

### 互動腳本

1. 偵測專案測試框架和覆蓋率工具
2. 執行覆蓋率報告
3. 解析結果，識別低覆蓋率區域
4. 依風險和重要性排序
5. 提出具體測試建議

**決策：覆蓋率結果**
- IF 覆蓋率 ≥ 目標 → 展示摘要，標記 ✅
- IF 覆蓋率 < 目標但 ≥ 60% → 展示差距，建議優先補測試的區域
- IF 覆蓋率 < 60% → 警告，建議系統性補強計畫

🛑 **STOP**：報告展示後等待使用者決定是否補寫測試

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 覆蓋率報告展示後 | 使用者決定是否補測試 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無測試框架 | 詢問使用者選擇框架 |
| 覆蓋率工具執行失敗 | 報告錯誤，建議手動檢查配置 |
| 指定路徑不存在 | 列出可用路徑 |

## 參考

- 完整標準：[test-coverage-assistant](../test-coverage-assistant/SKILL.md)
- 核心指南：[testing-standards](../../core/testing-standards.md)
- AC 覆蓋率：[/ac-coverage](./ac-coverage.md) — 需求層級追溯
