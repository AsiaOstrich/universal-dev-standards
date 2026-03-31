# Privacy Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/privacy-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-01
**Applicability**: All software projects handling personal data
**Scope**: universal
**Industry Standards**: GDPR, CCPA, Privacy by Design (Ann Cavoukian)
**References**: [gdpr.eu](https://gdpr.eu/), [ipc.on.ca](https://www.ipc.on.ca/)

---

## Overview

This document defines privacy standards for protecting user data throughout the software lifecycle, based on Privacy by Design principles and international data protection regulations.

---

## Privacy by Design Principles

The 7 foundational principles (Ann Cavoukian, 2009):

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Proactive not Reactive** | Anticipate and prevent privacy issues before they occur |
| 2 | **Privacy as the Default** | Personal data is automatically protected; no action required from user |
| 3 | **Privacy Embedded into Design** | Privacy is integral to system architecture, not an add-on |
| 4 | **Full Functionality — Positive-Sum** | Privacy AND functionality, not privacy OR functionality |
| 5 | **End-to-End Security** | Data protected throughout its entire lifecycle (collection to deletion) |
| 6 | **Visibility and Transparency** | All practices are documented, verifiable, and open to scrutiny |
| 7 | **Respect for User Privacy — User-Centric** | User interests are paramount; provide strong defaults, clear options |

---

## Data Classification

Classify all data by sensitivity level:

| Level | Description | Handling Requirements |
|-------|-------------|----------------------|
| **Public** | Freely shareable (marketing content, docs) | No restrictions |
| **Internal** | For internal use only (internal reports, meeting notes) | Access control, no public sharing |
| **Confidential** | Sensitive business data (financials, strategies) | Encryption at rest/transit, audit logging, need-to-know access |
| **Restricted** | Highly sensitive PII, health, financial (SSN, medical records) | Strongest encryption, strict access, data masking, regulatory compliance |

---

## Data Protection Impact Assessment (DPIA)

### Trigger Conditions

A DPIA MUST be conducted when:
- Processing personal data at large scale
- Systematic monitoring of public areas
- Automated decision-making with legal effects
- Processing special category data (health, biometric, genetic)
- Combining datasets from different sources
- Processing data of vulnerable individuals (children, employees)

### Simplified DPIA Template

```markdown
## DPIA: [Project/Feature Name]

### 1. Data Processing Description
- What data is collected?
- Why is it collected?
- How is it processed?
- Who has access?

### 2. Necessity Assessment
- Is all collected data necessary for the stated purpose?
- Can the purpose be achieved with less data?

### 3. Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigation measure] |

### 4. Decision
- [ ] Proceed as planned
- [ ] Proceed with mitigations
- [ ] Redesign required
- [ ] Do not proceed
```

---

## Data Minimization

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Collect only what is necessary** | Each data field must have a documented purpose |
| **Define retention periods** | Every data type must have an explicit retention period |
| **Automatic deletion on expiry** | Data past its retention period must be automatically deleted or anonymized |
| **Purpose limitation** | Data collected for one purpose must not be used for another without consent |
| **Storage limitation** | Do not keep data longer than needed for its purpose |

### Retention Period Guidelines

| Data Type | Suggested Retention | Rationale |
|-----------|-------------------|-----------|
| Session data | Duration of session | No longer needed after logout |
| Activity logs | 90 days | Debugging and support |
| Account data | Until account deletion + 30 days | Grace period for recovery |
| Transaction records | 7 years | Tax/audit compliance |
| Marketing preferences | Until withdrawal of consent | Consent-based |

---

## User Rights

Support these 5 fundamental user rights:

| Right | Description | Implementation |
|-------|-------------|---------------|
| **Access** | Users can request a copy of their personal data | Export endpoint, machine-readable format (JSON/CSV) |
| **Rectification** | Users can correct inaccurate personal data | Edit profile, support channel for non-self-service fields |
| **Erasure** (Right to be Forgotten) | Users can request deletion of their data | Account deletion flow, cascade to backups within 30 days |
| **Data Portability** | Users can receive their data in a portable format | Standard format export (JSON, CSV), API for bulk export |
| **Objection** | Users can object to specific processing activities | Opt-out mechanisms, granular consent management |

---

## Privacy Checklist

Before launching a new feature that handles personal data, verify:

- [ ] **Data inventory**: All personal data fields are documented with purpose and legal basis
- [ ] **Minimization**: Only necessary data is collected; no "nice to have" fields
- [ ] **Consent**: User consent is obtained where required (opt-in, not pre-checked)
- [ ] **Retention**: Retention periods are defined and automated deletion is configured
- [ ] **Access control**: Only authorized personnel can access the data
- [ ] **Encryption**: Data is encrypted at rest and in transit
- [ ] **User rights**: Users can access, correct, delete, and export their data
- [ ] **Third parties**: Data sharing with third parties is documented and lawful
- [ ] **DPIA**: Impact assessment completed (if trigger conditions met)
- [ ] **Breach plan**: Data breach notification process is in place

---

## Quick Reference Card

### Data Handling Decision
```
Is it personal data?
├─ No → Standard handling
└─ Yes
   ├─ Is it special category (health, biometric)?
   │  └─ Yes → Restricted + DPIA required
   └─ No
      ├─ Is it identifiable (name, email)?
      │  └─ Yes → Confidential
      └─ No (anonymized/aggregated) → Internal
```

---

## References

- [GDPR Full Text](https://gdpr.eu/) — European data protection regulation
- [Privacy by Design — 7 Foundational Principles](https://www.ipc.on.ca/) — Ann Cavoukian
- [CCPA](https://oag.ca.gov/privacy/ccpa) — California Consumer Privacy Act
- [OWASP Privacy Risks](https://owasp.org/www-project-top-10-privacy-risks/) — Top 10 privacy risks

---

**Related Standards:**
- [Security Standards](security-standards.md) — Security controls for data protection
- [Logging Standards](logging-standards.md) — PII handling in logs
- [Environment Standards](environment-standards.md) — Secret management
- [Test Data Standards](test-data-standards.md) — Data anonymization for testing

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
