# UDS Workflow Gaps Tracker / 工作流缺口追蹤

**Version**: 1.0.0
**Last Updated**: 2026-02-12

---

## Overview / 總覽

This document tracks identified gaps in the UDS workflow ecosystem — standards, skills, or integrations that are recognized as needed but not yet implemented. Each gap includes priority, rationale, and planned approach.

本文件追蹤 UDS 工作流生態系統中已識別的缺口——已確認需要但尚未實作的標準、技能或整合。

---

## Gap Priority Definitions / 優先級定義

| Priority | Criteria | 標準 |
|----------|----------|------|
| **CRITICAL** | Blocks common real-world workflows; teams routinely need this | 阻礙常見實際工作流 |
| **HIGH** | Addresses frequent pain points; improves adoption significantly | 解決常見痛點，顯著提升採用率 |
| **MEDIUM** | Enhances completeness; useful for enterprise adoption | 增強完整性，適用於企業採用 |
| **LOW** | Nice-to-have; addresses edge cases or advanced scenarios | 錦上添花，涵蓋邊緣案例 |

---

## Gap Registry / 缺口清單

### CRITICAL Priority / 關鍵優先

| ID | Gap | Category | Description | Status | Target |
|----|-----|----------|-------------|--------|--------|
| GAP-001 | CI/CD Pipeline Standards | Core Standard | No standard for CI/CD pipeline configuration, stages, and quality gates. Teams deploying code lack guidance on pipeline structure. | Planned | TBD |
| GAP-002 | Incident Response Workflow | Skill | No workflow for handling production incidents: triage → fix → postmortem → prevention. Current `/tdd` doesn't cover the urgency and coordination aspects of incident response. | Planned | TBD |

### HIGH Priority / 高優先

| ID | Gap | Category | Description | Status | Target |
|----|-----|----------|-------------|--------|--------|
| GAP-003 | Database Migration Standards | Core Standard | No guidance on database schema migration strategies, rollback procedures, or data migration testing. Critical for teams with stateful services. | Planned | TBD |
| GAP-004 | Feature Flag Lifecycle Skill | Skill | No workflow for feature flag management: creation → rollout → cleanup. Feature flags often become technical debt without lifecycle management. | Planned | TBD |
| GAP-005 | Infrastructure as Code Standards | Core Standard | No standards for IaC practices (Terraform, CloudFormation, Pulumi). Modern deployment requires IaC but UDS doesn't cover it. | Planned | TBD |

### MEDIUM Priority / 中優先

| ID | Gap | Category | Description | Status | Target |
|----|-----|----------|-------------|--------|--------|
| GAP-006 | Observability Standards | Core Standard | No guidance on logging, metrics, tracing, and alerting standards. Teams need consistent observability practices. | Planned | TBD |
| GAP-007 | API Design Standards | Core Standard | No API design guidelines (REST conventions, versioning, error format). Existing standards focus on implementation, not API contracts. | Planned | TBD |
| GAP-008 | Dependency Management | Core Standard | No standards for dependency update cadence, vulnerability response SLA, or version pinning strategy. `npm audit` is mentioned in `/discover` but lacks formal guidance. | Planned | TBD |
| GAP-009 | Monorepo Coordination | Skill | No workflow for coordinating changes across monorepo packages. Release and testing workflows assume single-package repos. | Planned | TBD |

### LOW Priority / 低優先

| ID | Gap | Category | Description | Status | Target |
|----|-----|----------|-------------|--------|--------|
| GAP-010 | Pair Programming Standards | Core Standard | No guidance on pair/mob programming practices, rotation, and remote collaboration. | Planned | TBD |
| GAP-011 | Technical Debt Tracking | Skill | Beyond `/discover`'s one-time assessment, no ongoing debt tracking or burn-down workflow. | Planned | TBD |
| GAP-012 | Environment Management | Core Standard | No standards for dev/staging/production environment parity, configuration management, or secrets rotation. | Planned | TBD |

---

## Integration Gap Analysis / 整合缺口分析

These are gaps in how existing workflows connect to each other:

| From → To | Current State | Desired State | Status |
|-----------|--------------|---------------|--------|
| `/discover` → `/sdd` | No automatic guidance | Discovery report suggests next steps | **Fixed (v1.0.0)** |
| `/reverse` → `/sdd` | No automatic guidance | Reverse output suggests SDD review | **Fixed (v1.0.0)** |
| `/release` → Deploy | No deployment guidance | Release links to deployment standards | Planned (needs GAP-001) |
| `/derive` prerequisite | No pre-check | Prerequisite check warns if no SPEC | **Fixed (v1.0.0)** |
| `/sdd` → `/atdd` | ATDD mentioned but no bidirectional link | SDD suggests ATDD for complex business logic | Planned |
| `/coverage` → `/tdd` | No guided flow | Coverage gaps feed into TDD priorities | Planned |

---

## Contributing a Gap Fix / 貢獻缺口修復

When implementing a gap fix:

1. Update the gap's `Status` to `In Progress`
2. Follow the `/sdd` workflow for new standards or skills
3. After implementation, update `Status` to `Resolved` with the version number
4. Remove resolved gaps after 2 release cycles

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-12 | Initial gap analysis with 12 identified gaps |
