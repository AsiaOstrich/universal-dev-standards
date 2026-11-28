---
source: ../../../../skills/commands/security.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-11-28
source_hash: ae491efb5c26
status: current
---

---
description: "[UDS] 引導安全審查和漏洞評估，遵循 OWASP 標準"
allowed-tools: Read, Grep, Glob, Bash(uds security check-findings:*)
argument-hint: "[module or file to audit | 要審計的模組或檔案]"
---

# 安全助手

引導安全審查和漏洞評估，遵循 OWASP 標準。

## 工作流程

```
SCOPE ──► SCAN ──► VERIFY ──► ANALYZE ──► REPORT
```

## 使用方式

- `/security` - 開始互動式安全審查
- `/security src/auth` - 審查指定模組
- `/security --owasp` - 聚焦 OWASP Top 10 審查

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/security` | 詢問審查範圍，進入 SCOPE |
| `/security <path>` | 直接審查指定路徑 |
| `/security --owasp` | 聚焦 OWASP Top 10 審查 |

### Interaction Script | 互動腳本

1. 確認審查範圍
2. 掃描程式碼，識別潛在漏洞
3. 驗證：每個候選發現交給沒有參與發現的驗證者，要求它試圖推翻；結果為 confirmed／unverified／refuted。沒有獨立驗證者時，發現維持 unverified，不得自己確認自己的發現
4. 只對 confirmed 的發現依嚴重程度分類（Critical / High / Medium / Low）；unverified 與 refuted 不帶嚴重度
5. 生成結構化安全審查報告，交出前執行 `uds security check-findings <報告檔>`（結束碼 1 = 修正後才能交出；2 = 無法判斷，不算通過）
6. 審查只能以 `all_verified` 或 `incomplete`（並寫明原因）結束

**決策：發現嚴重漏洞**（僅限 confirmed）
- IF Critical → 立即標記，建議優先修復
- IF High → 標記為重要，建議盡快修復
- ELSE → 列入報告，建議排程修復

🛑 **STOP**: 報告展示後等待使用者決定

### Stop Points | 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 安全報告展示後 | 使用者決定修復優先順序 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 目標路徑不存在 | 列出可用路徑 |
| 程式碼過大無法全面掃描 | 建議聚焦高風險區域（auth、input handling、API） |
| `uds security check-findings` 回報違反契約 | 依逐筆訊息修正報告後重跑，不要原樣交出 |
| 無法啟動獨立驗證者 | 發現維持 unverified，審查以 incomplete 結束並寫明原因 |

## 參考

- 完整標準：[security-assistant](../security-assistant/SKILL.md)
- 核心指南：[security-standards](../../core/security-standards.md)
