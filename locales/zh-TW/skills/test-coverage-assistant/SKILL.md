---
source: ../../../../skills/test-coverage-assistant/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-02-10
status: current
description: |
  多維度分析測試覆蓋率並提供可執行的建議。
  使用時機：分析覆蓋率、識別測試缺口、制定測試策略。
  關鍵字：coverage, test, analysis, dimension, 覆蓋率, 測試, 分析, 維度。
---

# 測試覆蓋率助手

> **語言**: [English](../../../../skills/test-coverage-assistant/SKILL.md) | 繁體中文

多維度分析測試覆蓋率並提供可執行的建議。

## 覆蓋率維度

| 維度 | 測量內容 | Dimension | What it Measures |
|------|----------|-----------|------------------|
| **行覆蓋率** | 執行的程式碼行數 | Line | Lines of code executed |
| **分支覆蓋率** | 決策路徑覆蓋 | Branch | Decision paths taken |
| **函式覆蓋率** | 呼叫的函數 | Function | Functions called |
| **陳述式覆蓋率** | 執行的陳述式 | Statement | Statements executed |

## 八維度框架

1. **程式碼覆蓋率** - 行、分支、函式
2. **需求覆蓋率** - 所有需求都有對應測試
3. **風險覆蓋率** - 高風險區域優先測試
4. **整合覆蓋率** - 元件互動路徑
5. **邊界案例覆蓋率** - 邊界條件測試
6. **錯誤覆蓋率** - 錯誤處理路徑驗證
7. **權限覆蓋率** - 存取控制場景
8. **AI 生成品質** - AI 生成測試的有效性

## 覆蓋率目標

| 等級 | 覆蓋率 | 適用場景 | Use Case |
|------|--------|----------|----------|
| 最低要求 | 60% | 遺留程式碼 | Legacy code |
| 標準 | 80% | 大多數專案 | Most projects |
| 高標準 | 90% | 關鍵系統 | Critical systems |
| 嚴格 | 95%+ | 安全關鍵 | Safety-critical |

## 工作流程

1. **執行覆蓋率工具** - 產生覆蓋率報告
2. **分析缺口** - 識別未測試的區域
3. **排定優先順序** - 依風險和重要性排序
4. **建議測試** - 提出具體的測試建議
5. **追蹤進度** - 持續監控覆蓋率變化

## 使用方式

- `/coverage` - 執行完整覆蓋率分析
- `/coverage src/auth` - 分析特定模組
- `/coverage --recommend` - 取得測試建議

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[test-completeness-dimensions.md](../../../../core/test-completeness-dimensions.md)
