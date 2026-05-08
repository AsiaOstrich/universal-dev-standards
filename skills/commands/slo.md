---
description: "[UDS] Guide SLI selection, SLO setting, and Error Budget management"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[create | review | budget] [service name | 服務名稱]"
---

# SLO Assistant | SLO 助手

See [SKILL.md](../slo-assistant/SKILL.md) for full documentation.

詳見 [SKILL.md](../slo-assistant/SKILL.md)。

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/slo` | 詢問目標服務，進入 SLO 設計導覽 |
| `/slo create` | 啟動新 SLO 建立流程 |
| `/slo create <service>` | 針對指定服務直接啟動 SLO 建立 |
| `/slo review` | 審查現有 SLO 設定合理性 |
| `/slo budget` | 查看 Error Budget 消耗狀況與建議 |

### Interaction Script | 互動腳本

1. 確認操作模式（建立 / 審查 / Error Budget）
2. 依模式引導使用者完成 SLI 選擇、目標設定或現況分析
3. 輸出 SLO 定義草稿或 Error Budget 報告

**Decision: 建立模式**
- 引導選擇 SLI 類型（Availability / Latency / Quality）
- 詢問目標值（如 99.9%）與測量窗口（rolling 28d）
- IF 目標值過高（>99.99%）→ 警告工程成本，建議先設較保守目標

**Decision: Error Budget 模式**
- IF budget 剩餘 < 10% → 建議暫停非必要發布
- IF budget 已燒盡 → 提示凍結發布，優先處理可靠性

🛑 **STOP**: SLO 草稿完成後等待使用者確認目標值與告警閾值

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| SLI 選擇完成後 | 使用者確認選定的可靠性指標 |
| SLO 草稿產生後 | 使用者審查目標值與告警設定 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 服務無監控資料 | 建議先導入基礎 metrics，再設定 SLO |
| 目標值格式錯誤 | 提示正確格式（如 `99.9%` 或 `0.999`） |
