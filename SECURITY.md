# Security Policy
# 安全政策

## Supported Versions | 支援的版本

<!-- UDS_SUPPORTED_VERSIONS_START -->
| Version | Supported | 支援狀態 |
|---------|-----------|--------|
| 5.1.0-beta.5 | ✅ Pre-release | 預發布版本 |
| 5.0.0 | ✅ Latest stable | 最新正式版 |
| < 5.0.0 | ❌ End of life | 已終止支援 |
<!-- UDS_SUPPORTED_VERSIONS_END -->

> **Note**: Only the latest stable release and the current pre-release branch receive security updates.
>
> **說明**：僅最新正式版與當前預發布分支會收到安全更新。

---

## Reporting a Vulnerability | 回報漏洞

### How to Report | 如何回報

**DO NOT** open a public GitHub issue for security vulnerabilities.

**請勿**以公開 GitHub issue 回報安全漏洞。

Instead, please report security vulnerabilities through one of these channels:

請透過以下管道回報安全漏洞：

1. **GitHub Security Advisories** (Recommended | 推薦)
   - Go to [Security Advisories](https://github.com/AsiaOstrich/universal-dev-standards/security/advisories/new)
   - This ensures the report is private and tracked

2. **GitHub Private Vulnerability Reporting**
   - Go to [Report a Vulnerability](https://github.com/AsiaOstrich/universal-dev-standards/security)
   - Follow the guided reporting process

### What to Include | 回報內容

Please include the following information:

請包含以下資訊：

- **Description** | **描述**: A clear description of the vulnerability
- **Steps to Reproduce** | **重現步驟**: Detailed steps to reproduce the issue
- **Impact** | **影響範圍**: What an attacker could achieve
- **Affected Versions** | **受影響版本**: Which versions are affected
- **Suggested Fix** | **建議修復方式**: If you have a suggestion (optional)

### Response Timeline | 回應時間

| Action | Timeline | 時間 |
|--------|----------|------|
| Acknowledgment | Within 48 hours | 48 小時內 |
| Initial assessment | Within 7 days | 7 天內 |
| Fix release (critical) | Within 14 days | 14 天內 |
| Fix release (non-critical) | Next scheduled release | 下次排程發布 |

---

## Security Scope | 安全範疇

### In Scope | 在範疇內

| Component | Description | 說明 |
|-----------|-------------|------|
| CLI Tool (`cli/`) | Command injection, path traversal, dependency vulnerabilities | 指令注入、路徑穿越、依賴漏洞 |
| Standards Content (`core/`) | Guidance that could lead to insecure implementations | 可能導致不安全實作的指引 |
| GitHub Actions (`.github/workflows/`) | Workflow injection, secret exposure | 工作流程注入、機密洩漏 |

### Out of Scope | 不在範疇內

- Vulnerabilities in third-party dependencies (report to upstream maintainers)
- Issues in user projects that adopt UDS standards
- Social engineering attacks

- 第三方依賴的漏洞（請回報給上游維護者）
- 採用 UDS 標準的使用者專案中的問題
- 社交工程攻擊

---

## Disclosure Policy | 揭露政策

We follow **Coordinated Disclosure**:

我們遵循**協調揭露**原則：

1. Reporter submits vulnerability privately | 回報者私下提交漏洞
2. We acknowledge and assess | 我們確認並評估
3. We develop and test a fix | 我們開發並測試修復
4. We release the fix | 我們發布修復
5. We publicly disclose the vulnerability (with credit to reporter) | 我們公開揭露漏洞（附上回報者致謝）

We will credit reporters in the release notes unless they prefer to remain anonymous.

除非回報者希望匿名，否則我們會在發布說明中致謝。

---

## Best Practices for Users | 使用者安全建議

When using UDS in your projects:

在您的專案中使用 UDS 時：

- Keep UDS CLI updated to the latest version | 保持 UDS CLI 為最新版本
- Review standards before adopting (especially `security-standards.md`) | 採用前審閱標準（特別是 `security-standards.md`）
- Run `npm audit` regularly on your projects | 定期對專案執行 `npm audit`
- Follow the security standards defined in `core/security-standards.md` | 遵循 `core/security-standards.md` 定義的安全標準
