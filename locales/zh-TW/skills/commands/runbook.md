---
source: ../../../../skills/commands/runbook.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: 204f37312d01
status: current
description: "[UDS] 引導 Runbook 建立、維護、演練和覆蓋率報告"
---

---
description: "[UDS] 引導 Runbook 建立、維護、演練和覆蓋率報告"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[create | drill | coverage] [alert name | 告警名稱]"
---

# Runbook 助手

詳見 [SKILL.md](../runbook-assistant/SKILL.md)。

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/runbook` | 詢問目標告警或服務，進入 runbook 導覽選單 |
| `/runbook create` | 啟動 runbook 建立流程 |
| `/runbook create <alert>` | 針對指定告警直接建立 runbook |
| `/runbook drill` | 啟動 runbook 演練模擬流程 |
| `/runbook coverage` | 產生 runbook 覆蓋率報告 |

### Interaction Script | 互動腳本

1. 確認操作模式（建立 / 演練 / 覆蓋率）
2. 依模式執行對應流程，收集必要資訊
3. 輸出 runbook 草稿或報告

**決策：建立模式**
- IF 告警名稱已提供 → 直接填入模板並產生草稿
- IF 告警名稱未提供 → 詢問告警名稱、嚴重程度、負責團隊

**決策：演練模式**
- 逐步模擬告警觸發情境，確認執行步驟可行性
- IF 步驟有疑義 → 停止並請使用者確認或修正

🛑 **STOP**: runbook 草稿產生後等待使用者審查與修正

### Stop Points | 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 草稿產生後 | 使用者審查並確認內容正確 |
| 演練每個關鍵步驟後 | 使用者確認步驟可執行 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 告警名稱不明確 | 請使用者提供告警名稱或描述觸發條件 |
| 無現有 runbook 可演練 | 提示先執行 `create` 建立 runbook |
