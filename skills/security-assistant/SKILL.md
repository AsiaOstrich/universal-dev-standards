---
name: security
scope: universal
description: |
  Guide security review and vulnerability assessment following OWASP standards.
  Use when: security audit, vulnerability check, secure coding review, threat modeling.
  Not for: automated dependency, CVE, and secret scanning — use /scan; handling a breach in progress — use /incident.
  Keywords: security, OWASP, vulnerability, authentication, authorization.
allowed-tools: Read, Grep, Glob, Bash(uds security check-findings:*)
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
SCOPE ──► SCAN ──► VERIFY ──► ANALYZE ──► REPORT
```

### 1. Scope — Define Audit Boundary | 定義審計範圍
Identify target modules, data flows, and trust boundaries.

識別目標模組、資料流和信任邊界。

### 2. Scan — Identify Vulnerabilities | 識別漏洞
Review code for OWASP Top 10 patterns, check dependencies, inspect configurations.

檢查程式碼的 OWASP Top 10 模式、檢查相依套件、檢視配置。

### 3. Verify — Try to Refute Each Finding | 驗證：試圖推翻每個發現
Every candidate finding from Scan goes to a **verifier that did not find it**. A finding judged only by the one who found it has been asserted, not verified ([verification-evidence](../../core/verification-evidence.md) VE-013).

掃描產生的每個候選發現，都交給**沒有參與發現的驗證者**。只由發現者自己裁決的發現，只是被提出，不是被驗證。

- **Who verifies | 誰來驗證**: a fresh agent or sub-agent, or a person, that did not take part in the scan. Give it the claim, the location and the code, **not the finder's reasoning**. Open with a stance such as: *"You did not write this finding. Try to refute it from the source."* 全新的 agent、子代理或人，沒有參與掃描。只給它主張、位置與程式碼，**不給發現者的推理**。以這樣的立場開場：「這不是你寫的發現，試著從原始碼推翻它。」
- **No separate verifier available | 沒有獨立驗證者**: the finding stays `unverified`. Never confirm your own finding. 該發現維持 `unverified`，不得自己確認自己的發現。
- **Three statuses, and only three | 三種狀態**:

| Status | Meaning | 意義 | Severity? |
|--------|---------|------|-----------|
| `confirmed` | The verifier tried to refute it and could not; evidence recorded | 驗證者試圖推翻而失敗，並留下證據 | **Yes — the only status that may carry one** |
| `unverified` | No verifier has decided yet, or the verifier could not decide | 尚無驗證者裁決，或驗證者無法判斷 | **No** |
| `refuted` | The verifier showed the finding does not hold | 驗證者證明該發現不成立 | **No** |

A refuted finding is **kept** with its reason, so the next review does not raise it again under another wording. An unverified finding is never a pass and never an absence.

被推翻的發現**保留**並寫明理由，下次審查才不會換個說法再提一次。待驗證的發現既不算通過，也不算不存在。

### 4. Analyze — Assess Risk | 評估風險
Classify **confirmed** findings by severity (Critical/High/Medium/Low) and exploitability. Findings in any other status are not ranked.

只對**已確認**的發現，依嚴重程度（Critical/High/Medium/Low）和可利用性分類。其他狀態的發現不排序。

### 5. Report — Document Findings | 記錄發現
Produce actionable findings with remediation recommendations, as the structured report below, and run the check before handing it over. The review ends in one of two ways only: **`all_verified`** (no finding left `unverified`), or **`incomplete`** with the reason written down. Never stop halfway without saying so.

產出可行動的發現報告，附帶修復建議，採用下方的結構化格式，並在交出前跑檢查。審查只有兩種結束方式：**`all_verified`**（沒有發現停在 `unverified`），或**`incomplete`** 並寫明原因。不得半途停下而不說明。

## Findings Report Format | 發現報告格式

```json
{
  "scope": "src/auth",
  "completion": "incomplete",
  "incomplete_reason": "F-2 had no separate verifier",
  "findings": [
    { "id": "F-1", "title": "SQL built by string concatenation", "location": "src/auth/login.js:42",
      "discovered_by": "scan", "status": "confirmed", "severity": "high",
      "verified_by": "verifier-1", "evidence": "req.body.user reaches db.exec unescaped",
      "remediation": "Use a parameterized query" },
    { "id": "F-2", "title": "Weak password hash", "location": "src/auth/hash.js:8",
      "discovered_by": "scan", "status": "unverified",
      "pending_reason": "no separate verifier was available" },
    { "id": "F-3", "title": "Reflected XSS", "location": "src/ui/view.js:15",
      "discovered_by": "scan", "status": "refuted",
      "verified_by": "verifier-1", "refutation_reason": "the template escapes this output" }
  ]
}
```

The field contract per status | 各狀態的欄位契約:

- `confirmed`: `severity` (critical / high / medium / low), `verified_by`, `evidence`; `remediation` optional.
- `unverified`: `pending_reason`. **No `severity`.**
- `refuted`: `verified_by`, `refutation_reason`. **No `severity`, no `remediation`.**
- `verified_by` must differ from `discovered_by`. `completion` is `all_verified` or `incomplete`; `incomplete` needs `incomplete_reason`.

**Only a confirmed finding may carry a severity (SF-002).** 只有「已確認」的發現可以帶嚴重度。

### Run the check | 跑檢查

```
uds security check-findings findings.json
uds security check-findings - <<'EOF'   # or pass the report on standard input | 或由標準輸入傳入
{ ...report... }
EOF
```

Exit `0`: the report keeps the contract. Exit `1`: it does not (each violation is named by finding); fix the report before handing it over. Exit `2`: the check could not decide (the file is missing or is not JSON). **2 is not a pass.** The check judges the **shape** of the report. It does not judge whether a finding is true, nor whether the verifier really started without knowing the discovery; that part rests on how you ran Verify.

結束碼 `0`：報告符合契約。`1`：不符合（逐筆點名），修正後才能交出。`2`：檢查無法判斷（檔案不存在或不是 JSON），**2 不算通過**。檢查只判斷報告的**形狀**，不判斷發現是否為真，也不判斷驗證者是否真的不知道發現過程；那一部分取決於你怎麼執行驗證階段。

## Severity Classification | 嚴重程度分類

Applies to `confirmed` findings only. | 只適用於 `confirmed` 的發現。

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
> - 執行 `/checkin` 確認修復符合提交規範 ⭐ **Recommended / 推薦** — Verify fixes meet check-in standards
> - 執行 `/code-review` 進行程式碼審查 — Run code review on security fixes
> - 執行 `/commit` 提交安全修復 — Commit security fixes
> - 檢查相依套件更新 → `npm audit` 或 `pip audit` — Check dependency updates

## Reference | 參考

- Core standard: [security-standards.md](../../core/security-standards.md)
- Who may judge a claim: [verification-evidence.md](../../core/verification-evidence.md) (VE-013 to VE-020)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-23 | Initial release | 初始版本 |
| 1.1.0 | 2026-11-28 | Add the Verify stage (a verifier that did not find it; confirmed / unverified / refuted; only confirmed carries a severity), the structured findings report and `uds security check-findings` | 新增驗證階段（沒有參與發現的驗證者；確認／待驗證／推翻；只有確認可帶嚴重度）、結構化發現報告與 `uds security check-findings` |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/security`](../commands/security.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/security`](../commands/security.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0 — Documentation content
