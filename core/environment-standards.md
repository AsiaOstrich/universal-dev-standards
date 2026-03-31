# Environment Management Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/environment-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: The Twelve-Factor App, NIST SP 800-123, CIS Benchmarks
**References**: [12factor.net](https://12factor.net/), [NIST](https://csrc.nist.gov/)

---

## Overview

This document defines standards for managing application environments across their lifecycle — from local development to production deployment. It covers environment tiers, configuration management, environment parity, secret handling, and verification procedures.

---

## 1. Environment Tiers

### 1.1 Standard Tiers (MUST)

Every project MUST define at least four standard environment tiers:

| Tier | Purpose | Audience | Data |
|------|---------|----------|------|
| **Local** | Individual developer workstation | Single developer | Synthetic / seed data |
| **Dev** | Shared development and integration | Development team | Synthetic test data |
| **Staging** | Pre-production validation and QA | QA team, stakeholders | Anonymized production-like data |
| **Production** | Live system serving end users | End users | Real user data |

### 1.2 Optional Tiers (MAY)

Projects MAY define additional tiers for specialized needs:

| Tier | Purpose | Lifecycle |
|------|---------|-----------|
| **Preview** | Per-PR ephemeral environment for review | Created on PR open, automatic cleanup on PR merge |
| **Sandbox** | Isolated experimentation environment | On-demand creation, manual or scheduled cleanup |
| **DR** (Disaster Recovery) | Failover environment for business continuity | Always-warm or cold standby, activated on incident |

---

## 2. Configuration Priority Hierarchy

### 2.1 Five-Layer Priority (MUST)

Configuration values MUST be resolved in the following priority order (highest to lowest):

| Priority | Source | Description | Example |
|----------|--------|-------------|---------|
| 1 (Highest) | **環境變數 (Environment Variables)** | Runtime environment variables | `DATABASE_URL=postgres://...` |
| 2 | **命令列參數 (Command-line Arguments)** | CLI flags and arguments | `--port 3000` |
| 3 | **環境配置檔 (Environment Config Files)** | Per-environment config files | `.env.staging`, `config/staging.yaml` |
| 4 | **應用配置檔 (Application Config Files)** | Shared application defaults | `config/default.yaml`, `application.yml` |
| 5 (Lowest) | **硬編碼預設值 (Hardcoded Defaults)** | In-code fallback values | `const PORT = config.port ?? 3000` |

### 2.2 Resolution Rules

- Higher priority sources MUST override lower priority sources
- Missing values at a higher level MUST fall through to the next level
- Applications SHOULD log which configuration source was used at startup (without logging secret values)

---

## 3. Environment Parity

### 3.1 Six Parity Aspects

To minimize "works on my machine" issues, environments MUST maintain parity across the following aspects:

| Aspect | Requirement | Rationale |
|--------|-------------|-----------|
| **技術棧 (Tech Stack)** | **MUST** be identical | Same language versions, frameworks, and runtimes across all tiers |
| **架構拓撲 (Architecture Topology)** | **SHOULD** be identical | Same service topology; deviations MUST be documented |
| **配置結構 (Configuration Structure)** | **MUST** be identical | Same config keys and schema; values differ per environment |
| **資料結構 (Data Structure)** | **MUST** be identical | Same database schema, migrations applied in all tiers |
| **規模 (Scale)** | **MAY** differ | Production may have more replicas, larger instances |
| **資料內容 (Data Content)** | **MUST** differ | Non-production environments MUST use anonymized or synthetic data; never copy raw production data |

### 3.2 Parity Verification

Teams SHOULD automate parity checks as part of CI/CD:

- Schema comparison between Staging and Production
- Infrastructure-as-Code diff reports
- Dependency version audits across tiers

---

## 4. Secret Management

### 4.1 Core Principles

All projects MUST follow these five secret management principles:

#### Principle 1: 不入版控 (No Version Control)

Secrets MUST never be committed to version control. This includes API keys, passwords, tokens, certificates, and connection strings.

#### Principle 2: 範本化 (Template-Based)

Projects MUST provide a `.env.example` template file that documents all required environment variables without actual secret values:

```bash
# .env.example — commit this file
DATABASE_URL=postgres://user:password@localhost:5432/mydb
API_KEY=your-api-key-here
SECRET_KEY=generate-with-openssl-rand-hex-32
```

#### Principle 3: 集中管理 (Centralized Management)

Production secrets SHOULD be stored in a centralized secret manager:

- AWS Secrets Manager / SSM Parameter Store
- HashiCorp Vault
- Azure Key Vault
- Google Cloud Secret Manager
- 1Password / Doppler (for smaller teams)

#### Principle 4: 最小權限 (Least Privilege)

Secret access MUST follow the principle of least privilege:

- Each service gets only the secrets it needs
- Use separate credentials per environment
- Avoid shared service accounts

#### Principle 5: 定期輪替 (Regular Rotation)

Secrets MUST be rotated on a regular schedule:

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| API Keys | Every 90 days |
| Database passwords | Every 90 days |
| TLS certificates | Before expiry (automate with ACME) |
| Service account keys | Every 180 days |

---

## 5. Secret-Related .gitignore Rules

### 5.1 Minimum Required Rules (MUST)

Every project MUST include at least the following patterns in `.gitignore` to prevent accidental secret exposure:

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Certificates and keys
*.pem
*.key

# Cloud credentials
credentials.json
service-account.json
```

### 5.2 Additional Recommended Rules (SHOULD)

```gitignore
# Additional secret patterns
*.p12
*.pfx
*.jks
.env.production
.env.staging
*-secret.yaml
*-secret.json
```

---

## 6. Environment Verification Checklist

### 6.1 Eight Verification Check Categories

Before promoting a deployment to a new environment, teams MUST verify the following eight categories:

| # | Category | Check Items |
|---|----------|-------------|
| 1 | **連接性 (Connectivity)** | Database connections, API endpoints reachable, message queue connectivity, cache availability |
| 2 | **認證 (Authentication)** | SSO/OAuth flows work, API key validity, service-to-service auth, certificate expiry |
| 3 | **資料 (Data)** | Schema migrations applied, seed data loaded, data integrity constraints valid |
| 4 | **監控 (Monitoring)** | Metrics collection active, log aggregation working, alerting rules deployed, dashboards accessible |
| 5 | **安全 (Security)** | TLS configured, CORS policies set, rate limiting active, WAF rules applied |
| 6 | **存取 (Access)** | Team access permissions, deployment credentials, admin console access, VPN connectivity |
| 7 | **備份 (Backup)** | Backup schedule configured, restore procedure tested, retention policy set |
| 8 | **DNS** | Domain records correct, SSL certificates valid, CDN configuration, health check endpoints |

### 6.2 Verification Automation

Teams SHOULD create automated verification scripts (smoke tests) that validate each category:

```bash
# Example: verify-environment.sh
./checks/connectivity.sh   # Test all service endpoints
./checks/auth.sh           # Validate authentication flows
./checks/data.sh           # Run schema validation
./checks/monitoring.sh     # Confirm metrics pipeline
./checks/security.sh       # TLS and policy checks
./checks/access.sh         # Permission validation
./checks/backup.sh         # Backup system health
./checks/dns.sh            # DNS resolution checks
```

---

## 7. Ephemeral Environment Lifecycle

### 7.1 Preview Environment Management

Preview environments (per-PR) MUST implement 自動清理 (automatic cleanup) mechanisms:

```
PR Opened → Build Preview Env → Run Checks → Review
                                                 │
PR Merged ──────────────────────────────────────►│
                                                 ▼
                                     Auto-Destroy Preview Env
```

**Requirements:**

- Preview environments MUST be automatically destroyed when the PR is merged or closed
- Cleanup MUST include all provisioned resources (compute, storage, DNS records)
- Failed cleanup MUST trigger alerts to the infrastructure team
- Maximum TTL SHOULD be set (e.g., 7 days) as a safety net

### 7.2 Infrastructure as Code

All environment provisioning MUST be documented through infrastructure as code (IaC):

- **建置文件 (Build Documentation)**: Infrastructure definitions MUST be version-controlled
- **驗證清單 (Verification Checklist)**: Each environment MUST have a corresponding verification checklist
- Environments MUST be reproducible from IaC definitions alone

---

## 8. Infrastructure as Code (IaC) Principles

### 8.1 Core Principles

All infrastructure provisioning MUST follow these six IaC core principles:

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Declarative-First (聲明式優先)** | Describe the desired end state rather than procedural steps. Declarative definitions make infrastructure predictable and auditable. |
| 2 | **Idempotency (冪等性)** | Applying the same configuration multiple times MUST produce the same result. No side effects from repeated execution. |
| 3 | **Version Control (版本控制)** | All IaC code MUST be stored in Git. Changes are tracked, reviewed, and auditable through commit history. |
| 4 | **Modularity (模組化)** | Infrastructure SHOULD be composed of reusable modules. Avoid copy-paste duplication across environments. |
| 5 | **Environment Parameterization (環境參數化)** | Use the same modules across environments with different parameter values. Environment-specific values are injected via variables, not hardcoded. |
| 6 | **Immutable Infrastructure (不可變基礎設施)** | When updating infrastructure, replace resources rather than modifying in-place. This ensures consistency and simplifies rollback. |

### 8.2 IaC Code Review Checklist

When a PR contains IaC changes, reviewers MUST evaluate the following four aspects:

| # | Aspect | Check Items |
|---|--------|-------------|
| 1 | **Security (安全性)** | Least privilege applied, no hardcoded secrets, IAM policies scoped correctly, network exposure minimized |
| 2 | **Cost Impact (成本影響)** | New resources identified, instance sizing justified, estimated monthly cost change documented |
| 3 | **Rollback Feasibility (回滾可行性)** | Changes are reversible, destructive operations flagged, backup/snapshot strategy for stateful resources |
| 4 | **Environment Consistency (環境一致性)** | Changes maintain parity across tiers, environment-specific overrides documented, no configuration drift introduced |

### 8.3 Drift Detection

Infrastructure drift occurs when the actual state of resources diverges from the IaC-defined state (e.g., manual changes via console). Teams MUST implement drift detection practices:

**Detection:**
- Run periodic drift detection scans (e.g., `terraform plan`, `pulumi preview`) on a scheduled basis (RECOMMENDED: daily for production)
- Compare actual infrastructure state against the IaC-defined desired state
- Integrate drift checks into CI/CD pipelines

**Notification:**
- Detected drift MUST trigger notifications to the responsible team (via Slack, email, or alerting system)
- Drift reports SHOULD include: affected resources, detected differences, and timestamp

**Remediation:**
- Teams MUST resolve drift using one of two approaches:
  - **Update IaC**: If the manual change was intentional, update the IaC code to reflect the new desired state
  - **Revert Infrastructure**: If the manual change was unauthorized or accidental, revert the infrastructure to match the IaC definition
- Drift remediation SHOULD be tracked as a ticket and resolved within a defined SLA

---

## References

- [The Twelve-Factor App — Config](https://12factor.net/config) — Environment-based configuration principles
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) — Secret handling best practices
- [NIST SP 800-123](https://csrc.nist.gov/publications/detail/sp/800-123/final) — Guide to General Server Security

---

**Related Standards:**
- [Logging Standards](logging-standards.md) — Structured logging per environment
- [Deployment Standards](deployment-standards.md) — CI/CD and deployment pipelines
- [Security Standards](security-standards.md) — Security controls and compliance
- [Observability Standards](observability-standards.md) — Monitoring and alerting

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Environment tiers, configuration hierarchy, parity, secret management, verification checklist, ephemeral environments |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
