---
name: security-scan-assistant
source: ../../../../skills/security-scan-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-12
source_hash: 731552ef9632
status: current
scope: universal
description: |
  引導自動化安全掃描、相依套件稽核與機密偵測。
  Use when: 相依套件稽核、CVE 掃描、機密偵測、授權條款合規。
  Not for: 人工的威脅建模與安全設計審查——請用 /security；一般的程式碼整潔度——請用 /sweep。
  Keywords: scan, audit, CVE, dependency, secret, SBOM, vulnerability, 掃描, 稽核, 相依套件, 機密偵測.
allowed-tools: Read, Grep, Glob, Bash(npm:audit, npx:*)
argument-hint: "[掃描類型或目標]"
---

# 安全掃描助手

> **語言**: [English](../../../../skills/security-scan-assistant/SKILL.md) | 繁體中文

自動化相依套件、機密資訊和授權合規的安全掃描。

## 掃描類型

| 類型 | 工具範例 | 用途 |
|------|----------|------|
| **相依套件審計** | npm audit, pip-audit, Snyk | 檢測相依套件已知 CVE |
| **機密偵測** | gitleaks, trufflehog | 偵測程式碼中洩漏的憑證 |
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

1. **Scan** — 對程式碼庫與相依套件執行自動化掃描工具
2. **Triage** — 過濾誤報，確認真正的弱點
3. **Prioritize** — 依嚴重程度與可利用性排序
4. **Fix** — 套用修補、更新相依套件、輪替機密
5. **Verify** — 重新掃描以確認已修復

## 使用方式

```
/scan                - 完整掃描（相依套件 + 機密 + 授權）
/scan --deps         - 僅相依套件審計
/scan --secrets      - 僅機密偵測
/scan --license      - 授權合規檢查
```

## 下一步引導

`/scan` 完成後，AI 助手應建議：

> **掃描完成。建議下一步：**
> - 執行 `/security` 深入安全審查 ⭐ **推薦**
> - 執行 `/checkin` 確認修復符合提交規範
> - 執行 `/commit` 提交安全修復
> - 更新相依套件 → `npm update` 或 `pip install --upgrade`

## 參考

- 核心規範：[security-standards.md](../../../../core/security-standards.md)

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-23 | 初始版本 |

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/scan`](../../../../skills/commands/scan.md#ai-agent-behavior--ai-代理行為)

## 授權

CC BY 4.0 — 文件內容
