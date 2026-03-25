---
source: ../../../../skills/metrics-dashboard-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: "[UDS] 追蹤開發指標、程式碼品質指示器與專案健康狀態"
name: metrics
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:log)
scope: universal
argument-hint: "[metric type or module | 指標類型或模組]"
---

# 開發指標助手

> **語言**: [English](../../../../skills/metrics-dashboard-assistant/SKILL.md) | 繁體中文

追蹤開發指標、程式碼品質指示器，以及專案隨時間的健康狀態。

## 使用方式

| 命令 | 用途 |
|------|------|
| `/metrics` | 執行完整專案健康檢查 |
| `/metrics --quality` | 僅程式碼品質指標 |
| `/metrics --debt` | 技術債摘要 |
| `/metrics --test` | 測試健康指標 |
| `/metrics src/` | 限定特定模組範圍 |

## 指標類別

| 類別 | 指標說明 |
|------|----------|
| **程式碼品質** | 複雜度、重複率、lint 警告 |
| **測試健康** | 覆蓋率 %、通過率、不穩定測試數 |
| **提交品質** | 大小、頻率、格式合規 |
| **債務追蹤** | TODO/FIXME 數量、問題存在時間 |
| **依賴健康** | 過時套件、漏洞數量 |

## 快速健康分數

健康分數為加權組合：

| 因素 | 權重 | 理想值 |
|------|------|--------|
| 測試覆蓋率 | 30% | >= 80% |
| Lint 通過率 | 20% | 100% |
| TODO/FIXME 密度 | 15% | < 每千行 1 個 |
| 建構成功率 | 20% | 100% |
| 依賴新鮮度 | 15% | < 3 個月 |

**分數 = sum(因素分數 * 權重)**

## 工作流程

1. **收集** - 從工具與 git 歷史收集原始指標
2. **分析** - 與閾值及歷史趨勢比較
3. **報告** - 產生含可行動重點的摘要
4. **趨勢** - 顯示方向（改善 / 衰退 / 穩定）

## 下一步引導

`/metrics` 完成後，AI 助手應建議：

> **指標分析完成。建議下一步：**
> - 執行 `/refactor` 處理高複雜度模組
> - 執行 `/coverage` 改善低覆蓋率區域
> - 執行 `/audit` 檢視安全與依賴問題
