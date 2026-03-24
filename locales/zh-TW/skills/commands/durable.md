---
source: ../../../../skills/commands/durable.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide workflow failure recovery with checkpoints, retries and rollback strategies"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[workflow name or failure context | 工作流名稱或失敗情境]"
---

# 持久執行助手

引導工作流程故障恢復，包含檢查點、重試與回滾策略。

## 工作流程

```
DETECT ──► DIAGNOSE ──► RECOVER ──► VERIFY ──► CONTINUE
```

## 使用方式

- `/durable` - 開始互動式故障恢復
- `/durable --checkpoint` - 設計檢查點策略
- `/durable --retry` - 設計重試策略
- `/durable --rollback` - 規劃回滾策略
- `/durable <workflow>` - 分析指定工作流程

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/durable` | 詢問工作流程或失敗情境，進入 DETECT |
| `/durable --checkpoint` | 直接進入檢查點策略設計 |
| `/durable --retry` | 直接進入重試策略設計 |
| `/durable --rollback` | 直接進入回滾策略規劃 |
| `/durable <workflow>` | 分析指定工作流程 |

### Interaction Script | 互動腳本

#### DETECT / DIAGNOSE 階段
1. 分析工作流程結構和失敗點
2. 識別需要持久化的狀態

**決策：故障類型**
- IF 暫時性故障（網路、超時） → 建議重試策略（exponential backoff）
- IF 資料不一致 → 建議檢查點 + 補償交易
- IF 不可逆失敗 → 建議回滾策略

🛑 **STOP**: 診斷結果展示後等待使用者確認策略方向

#### RECOVER 階段
1. 設計選定的恢復策略
2. 展示策略細節和程式碼建議

🛑 **STOP**: 策略設計後等待使用者確認

#### VERIFY 階段
1. 建議驗證步驟確認恢復成功

### Stop Points | 停止點

| 階段 | 停止點 | 等待內容 |
|------|--------|---------|
| DIAGNOSE | 診斷結果後 | 確認策略方向 |
| RECOVER | 策略設計後 | 確認實施 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無法識別工作流程模式 | 詢問使用者描述工作流程步驟 |
| 多種故障類型並存 | 逐一分析，建議組合策略 |

## 參考

- 完整標準：[durable-execution-assistant](../durable-execution-assistant/SKILL.md)
