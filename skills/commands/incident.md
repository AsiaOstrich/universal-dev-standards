---
description: "[UDS] Guide incident response, root cause analysis and post-mortem documentation"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[incident description or severity | 事故描述或嚴重程度]"
---

# Incident Response Assistant | 事故回應助手

Guide incident response, root cause analysis and post-mortem documentation.

引導事故回應、根因分析和事後檢討文件撰寫。

## Workflow | 工作流程

```
DETECT ──► TRIAGE ──► MITIGATE ──► RESOLVE ──► POST-MORTEM
```

## Usage | 使用方式

- `/incident` - Start interactive incident response
- `/incident "API 500 errors"` - Respond to specific incident
- `/incident --post-mortem` - Write post-mortem for resolved incident
- `/incident --sev1` - Start SEV1 response protocol

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/incident` | 詢問事故描述和嚴重程度，進入 DETECT |
| `/incident "description"` | 以描述為起點，進入 TRIAGE |
| `/incident --post-mortem` | 直接進入 POST-MORTEM 階段 |
| `/incident --sev1` | 啟動 SEV1 緊急回應協議 |

### Interaction Script | 互動腳本

#### DETECT / TRIAGE
1. 收集事故症狀和影響範圍
2. 評估嚴重程度（SEV1-4）

**Decision: 嚴重程度**
- IF SEV1/SEV2 → 立即列出緊急行動清單，建議通知相關人員
- IF SEV3/SEV4 → 按標準流程排查

🛑 **STOP**: 嚴重程度評估後等待使用者確認

#### MITIGATE
1. 建議即時緩解措施
2. 追蹤緩解狀態

#### RESOLVE
1. 引導根因分析（5 Whys）
2. 建議修復方案

🛑 **STOP**: 修復方案確認後等待使用者確認實施

#### POST-MORTEM
1. 收集時間線、根因、影響
2. 生成事後檢討文件

🛑 **STOP**: 文件生成後等待使用者確認寫入

### Stop Points | 停止點

| Phase | Stop Point | 等待內容 |
|-------|-----------|---------|
| TRIAGE | 嚴重程度評估後 | 確認分級 |
| RESOLVE | 修復方案提出後 | 確認實施 |
| POST-MORTEM | 文件生成後 | 確認寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無法判斷嚴重程度 | 列出分級標準，請使用者選擇 |
| 缺乏足夠症狀資訊 | 引導收集更多資訊（日誌、監控、錯誤訊息） |

## Reference | 參考

- Full standard: [incident-response-assistant](../incident-response-assistant/SKILL.md)
