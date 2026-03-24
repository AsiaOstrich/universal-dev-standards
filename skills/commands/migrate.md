---
description: "[UDS] Guide code migration, framework upgrades and technology modernization"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:*)
argument-hint: "[migration target or framework | 遷移目標或框架]"
---

# Migration Assistant | 遷移助手

Guide code migration, framework upgrades and technology modernization.

引導程式碼遷移、框架升級與技術現代化。

## Workflow | 工作流程

```
ASSESS ──► PLAN ──► PREPARE ──► MIGRATE ──► VERIFY ──► CLEANUP
```

## Usage | 使用方式

- `/migrate` - Start interactive migration guide
- `/migrate --assess` - Assess migration scope and risk
- `/migrate "Vue 2 to 3"` - Migrate specific framework
- `/migrate --deps` - Dependency upgrade analysis
- `/migrate --rollback` - Rollback strategy planning

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/migrate` | 詢問遷移目標，進入 ASSESS |
| `/migrate --assess` | 直接執行範圍和風險評估 |
| `/migrate "target"` | 以指定目標進入 ASSESS |
| `/migrate --deps` | 僅分析相依套件升級 |
| `/migrate --rollback` | 規劃回滾策略 |

### Interaction Script | 互動腳本

#### ASSESS Phase
1. 分析現有程式碼和相依性
2. 評估風險矩陣（breaking changes、資料遷移、API 變更）
3. 展示評估報告

🛑 **STOP**: 評估報告後等待使用者決定是否繼續

#### PLAN Phase
1. 制定遷移計畫（分階段步驟）
2. 定義回滾策略

🛑 **STOP**: 計畫確認後等待使用者確認

#### MIGRATE Phase
1. 逐步執行遷移
2. 每個步驟後驗證

🛑 **STOP**: 每個主要步驟完成後等待確認

#### VERIFY Phase
1. 執行測試確認遷移成功
2. 生成驗證報告

### Stop Points | 停止點

| Phase | Stop Point | 等待內容 |
|-------|-----------|---------|
| ASSESS | 評估報告後 | 決定是否繼續 |
| PLAN | 計畫制定後 | 確認計畫 |
| MIGRATE | 每個主要步驟後 | 確認繼續 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 遷移步驟失敗 | 建議回滾到上一個檢查點 |
| 相依性衝突 | 列出衝突，建議解決方案 |
| 測試失敗 | 報告失敗，建議修復後重試 |

## Reference | 參考

- Full standard: [migration-assistant](../migration-assistant/SKILL.md)
