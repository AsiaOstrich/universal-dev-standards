---
source: ../../../../skills/commands/incident.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide incident response, root cause analysis and post-mortem documentation"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[incident description or severity | 事故描述或嚴重程度]"
---

# 事故回應助手

引導事故回應、根因分析和事後檢討文件撰寫。

## 工作流程

```
DETECT ──► TRIAGE ──► MITIGATE ──► RESOLVE ──► POST-MORTEM
```

## 使用方式

- `/incident` - 開始互動式事故回應
- `/incident "API 500 errors"` - 回應特定事故
- `/incident --post-mortem` - 撰寫已解決事故的事後檢討
- `/incident --sev1` - 啟動 SEV1 回應協議

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/incident` | 詢問事故描述和嚴重程度，進入 DETECT |
| `/incident "description"` | 以描述為起點，進入 TRIAGE |
| `/incident --post-mortem` | 直接進入 POST-MORTEM 階段 |
| `/incident --sev1` | 啟動 SEV1 緊急回應協議 |

### Interaction Script | 互動腳本

#### DETECT / TRIAGE 階段
1. 收集事故症狀和影響範圍
2. 評估嚴重程度（SEV1-4）

**決策：嚴重程度**
- IF SEV1/SEV2 → 立即列出緊急行動清單，建議通知相關人員
- IF SEV3/SEV4 → 按標準流程排查

🛑 **STOP**: 嚴重程度評估後等待使用者確認

#### MITIGATE 階段
1. 建議即時緩解措施
2. 追蹤緩解狀態

#### RESOLVE 階段
1. 引導根因分析（5 Whys）
2. 建議修復方案

🛑 **STOP**: 修復方案確認後等待使用者確認實施

#### POST-MORTEM 階段
1. 收集時間線、根因、影響
2. 生成事後檢討文件

🛑 **STOP**: 文件生成後等待使用者確認寫入

### Stop Points | 停止點

| 階段 | 停止點 | 等待內容 |
|------|--------|---------|
| TRIAGE | 嚴重程度評估後 | 確認分級 |
| RESOLVE | 修復方案提出後 | 確認實施 |
| POST-MORTEM | 文件生成後 | 確認寫入 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無法判斷嚴重程度 | 列出分級標準，請使用者選擇 |
| 缺乏足夠症狀資訊 | 引導收集更多資訊（日誌、監控、錯誤訊息） |

## 參考

- 完整標準：[incident-response-assistant](../incident-response-assistant/SKILL.md)
