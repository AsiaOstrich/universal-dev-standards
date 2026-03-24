---
source: ../../../../skills/commands/migrate.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide code migration, framework upgrades and technology modernization"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:*)
argument-hint: "[migration target or framework | 遷移目標或框架]"
---

# 遷移助手

引導程式碼遷移、框架升級與技術現代化。

## 工作流程

```
ASSESS ──► PLAN ──► PREPARE ──► MIGRATE ──► VERIFY ──► CLEANUP
```

## 使用方式

- `/migrate` - 開始互動式遷移指南
- `/migrate --assess` - 評估遷移範圍和風險
- `/migrate "Vue 2 to 3"` - 遷移指定框架
- `/migrate --deps` - 相依套件升級分析
- `/migrate --rollback` - 回滾策略規劃

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/migrate` | 詢問遷移目標，進入 ASSESS |
| `/migrate --assess` | 直接執行範圍和風險評估 |
| `/migrate "target"` | 以指定目標進入 ASSESS |
| `/migrate --deps` | 僅分析相依套件升級 |
| `/migrate --rollback` | 規劃回滾策略 |

### Interaction Script | 互動腳本

#### ASSESS 階段
1. 分析現有程式碼和相依性
2. 評估風險矩陣（breaking changes、資料遷移、API 變更）
3. 展示評估報告

🛑 **STOP**: 評估報告後等待使用者決定是否繼續

#### PLAN 階段
1. 制定遷移計畫（分階段步驟）
2. 定義回滾策略

🛑 **STOP**: 計畫確認後等待使用者確認

#### MIGRATE 階段
1. 逐步執行遷移
2. 每個步驟後驗證

🛑 **STOP**: 每個主要步驟完成後等待確認

#### VERIFY 階段
1. 執行測試確認遷移成功
2. 生成驗證報告

### Stop Points | 停止點

| 階段 | 停止點 | 等待內容 |
|------|--------|---------|
| ASSESS | 評估報告後 | 決定是否繼續 |
| PLAN | 計畫制定後 | 確認計畫 |
| MIGRATE | 每個主要步驟後 | 確認繼續 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 遷移步驟失敗 | 建議回滾到上一個檢查點 |
| 相依性衝突 | 列出衝突，建議解決方案 |
| 測試失敗 | 報告失敗，建議修復後重試 |

## 參考

- 完整標準：[migration-assistant](../migration-assistant/SKILL.md)
