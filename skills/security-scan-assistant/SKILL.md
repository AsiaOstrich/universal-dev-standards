---
name: scan
scope: universal
description: |
  Guide automated security scanning, dependency auditing, and secret detection.
  Use when: dependency audit, CVE scanning, secret detection, license compliance.
  Keywords: scan, audit, CVE, dependency, secret, SBOM, vulnerability, 掃描, 漏洞.
allowed-tools: Read, Grep, Glob, Bash(npm:audit, npx:*)
argument-hint: "[scan type or target | 掃描類型或目標]"
---

# Security Scan Assistant | 安全掃描助手

Automate security scanning for dependencies, secrets, and license compliance.

自動化相依套件、機密資訊和授權合規的安全掃描。

## Scan Types | 掃描類型

| Type | Tool Examples | Purpose | 用途 |
|------|---------------|---------|------|
| **Dependency audit** | npm audit, pip-audit, Snyk | Find known CVEs in dependencies | 檢測相依套件已知 CVE |
| **Secret detection** | gitleaks, trufflehog | Find leaked credentials in code | 偵測程式碼中洩漏的憑證 |
| **License compliance** | license-checker, SPDX | Verify OSS license compatibility | 驗證開源授權相容性 |
| **SAST** | Semgrep, CodeQL | Static analysis for code patterns | 靜態分析程式碼模式 |

## Tool Integration | 工具整合

| Tool | Command | Scope | 範圍 |
|------|---------|-------|------|
| npm audit | `npm audit --json` | Node.js dependencies | Node.js 相依套件 |
| Snyk | `npx snyk test` | Multi-language deps | 多語言相依套件 |
| Trivy | `trivy fs .` | Filesystem & containers | 檔案系統與容器 |
| gitleaks | `gitleaks detect` | Git history secrets | Git 歷史機密 |
| SPDX | `npx spdx-tool` | License SBOM generation | 授權 SBOM 產出 |

## Severity Classification & SLA | 嚴重程度分類與 SLA

| Severity | SLA | Criteria | 標準 |
|----------|-----|----------|------|
| **Critical** | 24 hours | RCE, auth bypass, data exfil | 遠端執行、認證繞過、資料外洩 |
| **High** | 72 hours | Privilege escalation, SQLi | 權限提升、SQL 注入 |
| **Medium** | 2 weeks | XSS, CSRF, info disclosure | XSS、CSRF、資訊洩漏 |
| **Low** | Next sprint | Missing headers, verbose errors | 缺少 Header、冗長錯誤訊息 |

## Workflow | 工作流程

```
SCAN ──► TRIAGE ──► PRIORITIZE ──► FIX ──► VERIFY
```

1. **Scan** — Run automated scanners on codebase and dependencies
2. **Triage** — Filter false positives, confirm real vulnerabilities
3. **Prioritize** — Rank by severity and exploitability
4. **Fix** — Apply patches, update dependencies, rotate secrets
5. **Verify** — Re-scan to confirm remediation

## Usage | 使用方式

```
/scan                - Full scan (deps + secrets + license) | 完整掃描
/scan --deps         - Dependency audit only | 僅相依套件審計
/scan --secrets      - Secret detection only | 僅機密偵測
/scan --license      - License compliance check | 授權合規檢查
```

## Next Steps Guidance | 下一步引導

After `/scan` completes, the AI assistant should suggest:

> **掃描完成。建議下一步 / Scan complete. Suggested next steps:**
> - 執行 `/security` 深入安全審查 — Run deep security review
> - 執行 `/checkin` 確認修復符合提交規範 — Verify fixes meet check-in standards
> - 執行 `/commit` 提交安全修復 — Commit security fixes
> - 更新相依套件 → `npm update` 或 `pip install --upgrade` — Update dependencies

## Reference | 參考

- Core standard: [security-standards.md](../../core/security-standards.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-23 | Initial release | 初始版本 |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/scan`](../commands/scan.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/scan`](../commands/scan.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0 — Documentation content
