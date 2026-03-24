---
source: ../../../../skills/commands/audit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] UDS health check and feedback system, diagnose installation integrity and detect development patterns"
allowed-tools: Read, Grep, Glob, Bash(git log:*, uds audit:*)
argument-hint: "[--health | --patterns | --friction | --report]"
---

# 審計助手

UDS 健康檢查與回饋系統——診斷安裝完整性與偵測開發模式。

## 工作流程

```
DIAGNOSE ──► ANALYZE ──► REPORT
```

## 使用方式

- `/audit` - 執行完整審計
- `/audit --health` - 安裝健康檢查
- `/audit --patterns` - 偵測開發模式
- `/audit --friction` - 識別摩擦點
- `/audit --report` - 生成完整報告

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/audit` | 執行完整審計（health + patterns + friction） |
| `/audit --health` | 僅檢查 UDS 安裝完整性 |
| `/audit --patterns` | 僅偵測開發模式 |
| `/audit --friction` | 僅識別摩擦點 |
| `/audit --report` | 生成完整報告（含建議） |

### Interaction Script | 互動腳本

1. 依模式執行對應的診斷
2. 收集分析結果
3. 生成報告

**決策：健康狀態**
- IF ERROR 級問題 → 建議執行 `uds init` 或 `uds check --restore`
- IF WARNING 級問題 → 列出建議，使用者自行決定
- IF 全部 OK → 展示健康摘要

🛑 **STOP**: 報告展示後等待使用者決定

### Stop Points | 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 報告展示後 | 使用者決定採取行動 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| UDS 未安裝 | 建議執行 `uds init` |
| `.standards/` 目錄不存在 | 告知 UDS 標準未安裝 |

## 參考

- 完整標準：[audit-assistant](../audit-assistant/SKILL.md)
