---
source: ../../../../skills/migration-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: "[UDS] 引導程式碼遷移、框架升級與技術現代化"
name: migrate
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:*)
scope: universal
argument-hint: "[migration target or framework | 遷移目標或框架]"
---

# 遷移助手

> **語言**: [English](../../../../skills/migration-assistant/SKILL.md) | 繁體中文

引導系統性程式碼遷移、框架升級與技術現代化。

## 使用方式

| 命令 | 用途 |
|------|------|
| `/migrate` | 啟動互動式遷移引導 |
| `/migrate --assess` | 僅風險評估 |
| `/migrate "Vue 2 to 3"` | 引導特定遷移 |
| `/migrate --deps` | 依賴升級分析 |
| `/migrate --rollback` | 規劃回滾策略 |

## 遷移類型

| 類型 | 範例 | 風險 |
|------|------|------|
| **框架升級** | React 17→18, Vue 2→3 | 中高 |
| **語言遷移** | JS→TS, Python 2→3 | 高 |
| **API 版本** | REST v1→v2, GraphQL 更新 | 中 |
| **資料庫遷移** | MySQL→PostgreSQL | 極高 |
| **建構工具** | Webpack→Vite | 低中 |
| **套件管理器** | npm→pnpm | 低 |

## 風險評估矩陣

| | 低影響 | 中影響 | 高影響 |
|---|--------|--------|--------|
| **低複雜度** | 安全（直接進行） | 謹慎 | 仔細規劃 |
| **中複雜度** | 謹慎 | 規劃 + 測試 | 分階段發布 |
| **高複雜度** | 規劃 + 測試 | 分階段發布 | 完整 SDD 規格 |

## 工作流程

1. **評估** - 評估現狀、識別破壞性變更
2. **規劃** - 建立含依賴關係的遷移清單
3. **準備** - 設定 codemods、相容層、功能旗標
4. **遷移** - 分階段執行遷移並測試
5. **驗證** - 執行完整測試套件、檢查回歸
6. **清理** - 移除相容層、舊依賴

## 回滾策略

| 方式 | 使用時機 |
|------|---------|
| **Git revert** | 小型、原子性變更 |
| **功能旗標** | 需要逐步發布 |
| **雙運行** | 關鍵系統、零停機 |
| **分支凍結** | 一次性完整遷移 |

## 下一步引導

`/migrate` 完成後，AI 助手應建議：

> **遷移分析完成。建議下一步：**
> - 執行 `/reverse` 深入理解現有程式碼
> - 執行 `/testing` 確保遷移後測試通過
> - 執行 `/commit` 提交遷移變更

## 參考

- 核心規範：[refactoring-standards.md](../../../../core/refactoring-standards.md)
