---
name: security
scope: universal
description: |
  Guide security review and vulnerability assessment following OWASP standards.
  Use when: security audit, vulnerability check, secure coding review, threat modeling.
  Keywords: security, OWASP, vulnerability, authentication, authorization, 安全, 漏洞, 認證.
allowed-tools: Read, Grep, Glob
argument-hint: "[module or file to audit | 要審計的模組或檔案]"
---

# Security Assistant | 安全審計助手

Guide systematic security reviews following OWASP Top 10 and industry best practices.

引導系統化的安全審查，遵循 OWASP Top 10 和業界最佳實踐。

## Quick Checklist — OWASP Top 10 Prevention | 快速檢查清單

| ID | Risk | Prevention | 預防措施 |
|----|------|------------|----------|
| A01 | Broken Access Control | Enforce least privilege, deny by default | 最小權限原則，預設拒絕 |
| A02 | Cryptographic Failures | Use strong algorithms, protect keys | 使用強加密演算法，保護金鑰 |
| A03 | Injection | Parameterized queries, input validation | 參數化查詢、輸入驗證 |
| A04 | Insecure Design | Threat modeling, secure design patterns | 威脅建模、安全設計模式 |
| A05 | Security Misconfiguration | Hardened defaults, minimal permissions | 強化預設值、最小權限 |
| A06 | Vulnerable Components | Track dependencies, patch regularly | 追蹤相依套件、定期修補 |
| A07 | Auth Failures | MFA, strong password policies | 多因素認證、強密碼策略 |
| A08 | Data Integrity Failures | Verify signatures, use trusted sources | 驗證簽章、使用可信來源 |
| A09 | Logging Failures | Log security events, monitor alerts | 記錄安全事件、監控告警 |
| A10 | SSRF | Validate URLs, restrict outbound traffic | 驗證 URL、限制對外流量 |

## Security Review Workflow | 安全審查工作流程

```
SCOPE ──► SCAN ──► ANALYZE ──► REPORT
```

### 1. Scope — Define Audit Boundary | 定義審計範圍
Identify target modules, data flows, and trust boundaries.

識別目標模組、資料流和信任邊界。

### 2. Scan — Identify Vulnerabilities | 識別漏洞
Review code for OWASP Top 10 patterns, check dependencies, inspect configurations.

檢查程式碼的 OWASP Top 10 模式、檢查相依套件、檢視配置。

### 3. Analyze — Assess Risk | 評估風險
Classify findings by severity (Critical/High/Medium/Low) and exploitability.

依嚴重程度（Critical/High/Medium/Low）和可利用性分類。

### 4. Report — Document Findings | 記錄發現
Produce actionable findings with remediation recommendations.

產出可行動的發現報告，附帶修復建議。

## Severity Classification | 嚴重程度分類

| Level | Criteria | 標準 |
|-------|----------|------|
| **Critical** | Remote code execution, data breach | 遠端程式碼執行、資料洩漏 |
| **High** | Authentication bypass, privilege escalation | 認證繞過、權限提升 |
| **Medium** | Information disclosure, CSRF | 資訊洩漏、CSRF |
| **Low** | Missing headers, verbose errors | 缺少 Header、冗長錯誤訊息 |

## Usage | 使用方式

```
/security                - Full security review of current project | 完整安全審查
/security src/auth       - Audit specific module | 審計特定模組
/security --owasp        - OWASP Top 10 focused review | OWASP Top 10 重點審查
```

## Next Steps Guidance | 下一步引導

After `/security` completes, the AI assistant should suggest:

> **安全審查完成。建議下一步 / Security review complete. Suggested next steps:**
> - 執行 `/checkin` 確認修復符合提交規範 — Verify fixes meet check-in standards
> - 執行 `/review` 進行程式碼審查 — Run code review on security fixes
> - 執行 `/commit` 提交安全修復 — Commit security fixes
> - 檢查相依套件更新 → `npm audit` 或 `pip audit` — Check dependency updates

## Reference | 參考

- Core standard: [security-standards.md](../../core/security-standards.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-23 | Initial release | 初始版本 |

## License | 授權

CC BY 4.0 — Documentation content
