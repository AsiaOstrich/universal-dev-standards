---
description: "[UDS] Guide security review and vulnerability assessment following OWASP standards"
allowed-tools: Read, Grep, Glob
argument-hint: "[module or file to audit | 要審計的模組或檔案]"
---

# Security Assistant | 安全助手

Guide security review and vulnerability assessment following OWASP standards.

引導安全審查和漏洞評估，遵循 OWASP 標準。

## Workflow | 工作流程

```
SCOPE ──► SCAN ──► ANALYZE ──► REPORT
```

## Usage | 使用方式

- `/security` - Start interactive security review
- `/security src/auth` - Review specific module
- `/security --owasp` - OWASP Top 10 focused review

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/security` | 詢問審查範圍，進入 SCOPE |
| `/security <path>` | 直接審查指定路徑 |
| `/security --owasp` | 聚焦 OWASP Top 10 審查 |

### Interaction Script | 互動腳本

1. 確認審查範圍
2. 掃描程式碼，識別潛在漏洞
3. 依嚴重程度分類（Critical / High / Medium / Low）
4. 生成安全審查報告

**Decision: 發現嚴重漏洞**
- IF Critical → 立即標記，建議優先修復
- IF High → 標記為重要，建議盡快修復
- ELSE → 列入報告，建議排程修復

🛑 **STOP**: 報告展示後等待使用者決定

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 安全報告展示後 | 使用者決定修復優先順序 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 目標路徑不存在 | 列出可用路徑 |
| 程式碼過大無法全面掃描 | 建議聚焦高風險區域（auth、input handling、API） |

## Reference | 參考

- Full standard: [security-assistant](../security-assistant/SKILL.md)
- Core guide: [security-standards](../../core/security-standards.md)
