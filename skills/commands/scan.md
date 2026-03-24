---
description: "[UDS] Guide automated security scanning, dependency auditing and secret detection"
allowed-tools: Read, Grep, Glob, Bash(npm:audit, npx:*)
argument-hint: "[scan type or target | 掃描類型或目標]"
---

# Security Scan Assistant | 安全掃描助手

Guide automated security scanning, dependency auditing and secret detection.

引導自動化安全掃描、相依套件審計和機密偵測。

## Workflow | 工作流程

```
SCAN ──► TRIAGE ──► PRIORITIZE ──► FIX ──► VERIFY
```

## Usage | 使用方式

- `/scan` - Run all security scans
- `/scan --deps` - Dependency vulnerability scan
- `/scan --secrets` - Secret detection scan
- `/scan --license` - License compliance check

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/scan` | 執行所有掃描類型 |
| `/scan --deps` | 僅執行相依套件漏洞掃描 |
| `/scan --secrets` | 僅執行機密偵測 |
| `/scan --license` | 僅執行授權合規檢查 |

### Interaction Script | 互動腳本

1. 執行指定類型的掃描
2. 收集結果，依嚴重程度分類
3. 展示分類報告

**Decision: 掃描結果**
- IF 發現 Critical/High → 列出 SLA 修復時限，建議立即處理
- IF 僅 Medium/Low → 列入報告，建議排程處理
- IF 發現機密洩漏 → 立即警告，建議輪換金鑰

🛑 **STOP**: 報告展示後等待使用者決定修復優先順序

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 掃描報告展示後 | 使用者決定修復項目 |
| 修復建議展示後 | 確認套用修復 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 掃描工具未安裝 | 建議安裝（npm audit 通常內建） |
| 無 package.json 或 lock 檔 | 告知無法執行相依掃描 |

## Reference | 參考

- Full standard: [security-scan-assistant](../security-scan-assistant/SKILL.md)
