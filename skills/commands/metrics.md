---
description: "[UDS] Track development metrics, code quality indicators and project health"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git log:*)
argument-hint: "[metric type or module | 指標類型或模組]"
---

# Metrics Dashboard Assistant | 指標儀表板助手

Track development metrics, code quality indicators and project health.

追蹤開發指標、程式碼品質指示器與專案健康狀態。

## Workflow | 工作流程

```
COLLECT ──► ANALYZE ──► REPORT ──► TREND
```

## Usage | 使用方式

- `/metrics` - Run full metrics analysis
- `/metrics --quality` - Code quality metrics only
- `/metrics --debt` - Technical debt analysis
- `/metrics --test` - Test metrics only
- `/metrics src/` - Analyze specific module

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/metrics` | 執行全面指標分析 |
| `/metrics --quality` | 僅分析程式碼品質指標 |
| `/metrics --debt` | 僅分析技術債 |
| `/metrics --test` | 僅分析測試指標 |
| `/metrics <path>` | 分析指定模組 |

### Interaction Script | 互動腳本

1. 偵測專案結構和可用工具
2. 收集指標資料（git log、測試覆蓋率、程式碼複雜度）
3. 分析趨勢和異常
4. 生成報告

🛑 **STOP**: 報告展示後等待使用者決定是否採取行動

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 報告展示後 | 使用者決定後續行動 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無法執行覆蓋率工具 | 跳過該指標，報告可用的其他指標 |
| git 歷史不足以分析趨勢 | 僅報告當前快照，標記趨勢為 N/A |

## Reference | 參考

- Full standard: [metrics-dashboard-assistant](../metrics-dashboard-assistant/SKILL.md)
