---
source: ../../../../skills/security-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: "[UDS] 引導安全審查和漏洞評估，遵循 OWASP 標準"
name: security
allowed-tools: Read, Grep, Glob
scope: universal
argument-hint: "[module or file to audit | 要審計的模組或檔案]"
---

# 安全審計助手

> **語言**: [English](../../../../skills/security-assistant/SKILL.md) | 繁體中文

引導系統化的安全審查，遵循 OWASP Top 10 和業界最佳實踐。

## 快速檢查清單 — OWASP Top 10 預防

| ID | 風險 | 預防措施 |
|----|------|----------|
| A01 | 存取控制失效 | 最小權限原則，預設拒絕 |
| A02 | 加密失敗 | 使用強加密演算法，保護金鑰 |
| A03 | 注入攻擊 | 參數化查詢、輸入驗證 |
| A04 | 不安全設計 | 威脅建模、安全設計模式 |
| A05 | 安全配置錯誤 | 強化預設值、最小權限 |
| A06 | 易受攻擊的元件 | 追蹤相依套件、定期修補 |
| A07 | 認證失敗 | 多因素認證、強密碼策略 |
| A08 | 資料完整性失敗 | 驗證簽章、使用可信來源 |
| A09 | 日誌記錄失敗 | 記錄安全事件、監控告警 |
| A10 | SSRF | 驗證 URL、限制對外流量 |

## 安全審查工作流程

```
SCOPE ──► SCAN ──► ANALYZE ──► REPORT
```

### 1. Scope — 定義審計範圍
識別目標模組、資料流和信任邊界。

### 2. Scan — 識別漏洞
檢查程式碼的 OWASP Top 10 模式、檢查相依套件、檢視配置。

### 3. Analyze — 評估風險
依嚴重程度（Critical/High/Medium/Low）和可利用性分類。

### 4. Report — 記錄發現
產出可行動的發現報告，附帶修復建議。

## 嚴重程度分類

| 等級 | 標準 |
|------|------|
| **Critical** | 遠端程式碼執行、資料洩漏 |
| **High** | 認證繞過、權限提升 |
| **Medium** | 資訊洩漏、CSRF |
| **Low** | 缺少 Header、冗長錯誤訊息 |

## 使用方式

- `/security` - 完整安全審查
- `/security src/auth` - 審計特定模組
- `/security --owasp` - OWASP Top 10 重點審查

## 下一步引導

`/security` 完成後，AI 助手應建議：

> **安全審查完成。建議下一步：**
> - 執行 `/checkin` 確認修復符合提交規範
> - 執行 `/review` 進行程式碼審查
> - 執行 `/commit` 提交安全修復
> - 檢查相依套件更新 → `npm audit` 或 `pip audit`

## 參考

- 核心規範：[security-standards.md](../../../../core/security-standards.md)
