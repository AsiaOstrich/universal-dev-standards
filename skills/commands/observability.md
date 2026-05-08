---
description: "[UDS] Guide observability setup, metrics design, alerting, and maturity assessment"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[--checklist | --maturity | --alerting | service name | 服務名稱]"
---

# Observability Assistant | 可觀測性助手

See [SKILL.md](../observability-assistant/SKILL.md) for full documentation.

詳見 [SKILL.md](../observability-assistant/SKILL.md)。

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/observability` | 詢問目標服務，進行整體可觀測性評估 |
| `/observability --checklist` | 直接執行可觀測性檢查清單 |
| `/observability --maturity` | 執行成熟度評估並給出改善建議 |
| `/observability --alerting` | 進入告警規則設計與審查流程 |
| `/observability <service>` | 針對指定服務進行可觀測性分析 |

### Interaction Script | 互動腳本

1. 確認目標服務與現有可觀測性工具（Prometheus、Grafana、Datadog 等）
2. 依選定模式執行評估或設計流程
3. 展示現況分析與缺口報告

**Decision: 可觀測性缺口**
- IF 缺少 Metrics → 建議關鍵指標清單（RED/USE method）
- IF 缺少 Tracing → 建議分散式追蹤導入步驟
- IF 缺少 Logging → 建議結構化日誌規範
- IF 告警規則不完整 → 建議補齊 SLO-based alerting

🛑 **STOP**: 缺口分析完成後等待使用者確認優先補齊項目

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 現況評估報告後 | 使用者確認分析正確性 |
| 改善建議展示後 | 使用者決定優先實施項目 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無法識別監控工具 | 詢問工具名稱或改以通用建議進行 |
| 服務不存在或名稱不明 | 請使用者確認服務名稱或列出已知服務 |
