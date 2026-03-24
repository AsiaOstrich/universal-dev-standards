---
source: ../../../../skills/security-scan-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: "[UDS] 引導自動化安全掃描、相依套件審計和機密偵測"
name: scan
allowed-tools: Read, Grep, Glob, Bash(npm:audit, npx:*)
scope: universal
argument-hint: "[scan type or target | 掃描類型或目標]"
---

# 安全掃描助手

> **語言**: [English](../../../../skills/security-scan-assistant/SKILL.md) | 繁體中文

自動化相依套件、機密資訊和授權合規的安全掃描。

## 掃描類型

| 類型 | 工具範例 | 用途 |
|------|----------|------|
| **相依套件審計** | npm audit, pip-audit, Snyk | 檢測已知 CVE |
| **機密偵測** | gitleaks, trufflehog | 偵測洩漏的憑證 |
| **授權合規** | license-checker, SPDX | 驗證開源授權相容性 |
| **SAST** | Semgrep, CodeQL | 靜態分析程式碼模式 |

## 工具整合

| 工具 | 指令 | 範圍 |
|------|------|------|
| npm audit | `npm audit --json` | Node.js 相依套件 |
| Snyk | `npx snyk test` | 多語言相依套件 |
| Trivy | `trivy fs .` | 檔案系統與容器 |
| gitleaks | `gitleaks detect` | Git 歷史機密 |
| SPDX | `npx spdx-tool` | 授權 SBOM 產出 |

## 嚴重程度分類與 SLA

| 嚴重程度 | SLA | 標準 |
|----------|-----|------|
| **Critical** | 24 小時 | 遠端執行、認證繞過、資料外洩 |
| **High** | 72 小時 | 權限提升、SQL 注入 |
| **Medium** | 2 週 | XSS、CSRF、資訊洩漏 |
| **Low** | 下個 Sprint | 缺少 Header、冗長錯誤訊息 |

## 工作流程

```
SCAN ──► TRIAGE ──► PRIORITIZE ──► FIX ──► VERIFY
```

## 使用方式

- `/scan` - 完整掃描（相依套件 + 機密 + 授權）
- `/scan --deps` - 僅相依套件審計
- `/scan --secrets` - 僅機密偵測
- `/scan --license` - 授權合規檢查

## 下一步引導

`/scan` 完成後，AI 助手應建議：

> **掃描完成。建議下一步：**
> - 執行 `/security` 深入安全審查
> - 執行 `/checkin` 確認修復符合提交規範
> - 執行 `/commit` 提交安全修復
> - 更新相依套件 → `npm update` 或 `pip install --upgrade`

## 參考

- 核心規範：[security-standards.md](../../../../core/security-standards.md)
