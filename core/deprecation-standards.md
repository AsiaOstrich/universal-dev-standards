# Deprecation & Sunset Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/deprecation-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: RFC 8594 (Sunset Header), RFC 8288 (Web Linking)
**References**: [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594), [API Deprecation Best Practices](https://swagger.io/blog/api-strategy/api-versioning-deprecation/)

---

## Overview

This document defines standards for managing the full lifecycle of deprecation — from API version retirement and feature sunset to complete system decommission. A structured deprecation process protects consumers, prevents data loss, and ensures clean infrastructure.

---

## API Deprecation

### Sunset Timeline

When retiring an API version, follow this 6-stage timeline:

| Stage | Time Point | Actions |
|-------|-----------|---------|
| **Announce** | T-6 months | Announce retirement plan; publish Sunset date; notify all known consumers |
| **Deprecate** | T-3 months | Mark as deprecated; add Deprecation and Sunset headers to responses |
| **Migrate** | T-3 to T-1 months | Actively assist consumers with migration; provide migration guide and tooling |
| **Warn** | T-1 month | Send final warnings; add countdown information to responses |
| **Sunset** | T | Stop serving requests; return 410 Gone for all endpoints |
| **Archive** | T+1 month | Archive documentation and data; remove infrastructure |

### HTTP Deprecation Headers

When an API version enters the **Deprecate** stage, all responses MUST include:

```
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Link: <https://api.example.com/v3/docs>; rel="successor-version"
```

| Header | Purpose | Format |
|--------|---------|--------|
| `Deprecation` | Signals the API is deprecated | `true` (boolean) |
| `Sunset` | Date when the API will be removed | RFC 7231 HTTP-date |
| `Link` | Points to the successor version documentation | URL with `rel="successor-version"` |

### Version Parallel Period

When a new version is released, the old version MUST be maintained for at least the later of:

- **6 months** after the new version reaches General Availability (GA)
- **3 months** after the last active consumer completes migration

This ensures consumers have adequate time to migrate without service disruption.

---

## Consumer Notification Strategy

Effective deprecation requires reaching consumers through multiple channels. Use at least 5 notification channels:

| Channel | Timing | Content |
|---------|--------|---------|
| **CHANGELOG / Release Notes** | Announce stage | Retirement plan, Sunset date, migration guide link |
| **API Response Header** | Deprecate stage onward | Sunset header + successor-version link |
| **Email / Notification** | Announce + Warn stages | Direct notification to known consumers |
| **API Documentation** | Announce stage onward | Clearly mark as deprecated; link to new version |
| **Dashboard / Monitoring** | Deprecate stage onward | Track remaining consumer count and traffic |

**Best practices:**
- Include a migration guide link in every notification
- Provide a dedicated migration support channel (Slack, email alias)
- Track notification delivery and acknowledgment rates

---

## Feature Sunset

### Impact Analysis

Before removing a feature, evaluate 5 analysis dimensions:

| Dimension | Key Questions |
|-----------|--------------|
| **Usage** | How many users used this feature in the past 30 days? What is the trend? |
| **Dependency** | Which other features, services, or integrations depend on this feature? |
| **Data** | Does this feature produce or manage unique data? Does it need migration or archival? |
| **Contract** | Are there SLA commitments, contractual obligations, or compliance requirements tied to this feature? |
| **Alternative** | Is there a replacement? Do users know how to migrate? Is the alternative feature-complete? |

### Feature Sunset Execution Checklist

After impact analysis is complete and the decision to remove is confirmed, verify each item:

- [ ] Notify affected users (at least 30 days in advance)
- [ ] Provide alternative solution or migration guide
- [ ] Remove feature code (no dead code left behind)
- [ ] Remove related Feature Flags
- [ ] Migrate or archive related data
- [ ] Update API documentation and user documentation
- [ ] Set up redirects (old URL → alternative feature or explanation page)
- [ ] Update CHANGELOG

---

## System Decommission

### Decommission Process

When retiring an entire system or service, follow these 7 stages:

| Stage | Action | Verification |
|-------|--------|-------------|
| **1. Dependency Analysis** | Identify all upstream and downstream dependencies | Dependency graph has no unresolved nodes |
| **2. Consumer Migration** | Assist all consumers in migrating to replacement service | Traffic drops to 0 |
| **3. Data Archival** | Archive data per compliance and retention requirements | Archival integrity verified |
| **4. DNS/Redirect** | Old endpoints return 410 Gone or redirect to replacement | Responses verified correct |
| **5. Infrastructure Cleanup** | Remove servers, databases, queues, storage | Resource release confirmed |
| **6. Monitoring Removal** | Remove alerts, dashboards, runbooks | No orphaned alerts remain |
| **7. Documentation Archival** | Mark documentation as archived | Documentation index updated |

### Data Archival Strategy

When archiving data during system retirement, follow these retention rules:

| Data Type | Retention Period | Archival Method |
|-----------|-----------------|-----------------|
| **User Data** | Per privacy regulations (GDPR: delete; others: 5–7 years) | Encrypted cold storage |
| **Transaction Records** | Per tax/audit requirements (typically 7 years) | Read-only archive |
| **Logs** | 1 year | Compressed archive |
| **Config/Code** | Permanent (already in Git) | Git history |

**Archival principles:**
- Verify archival integrity with checksums before deleting source data
- Document the archival location and access procedures
- Ensure archived data remains accessible for compliance audits

---

## Retirement Metrics

Track deprecation progress with these 4 metrics:

| Metric | Definition | Target |
|--------|-----------|--------|
| **Consumer Migration Rate** | Migrated consumers / Total consumers | 100% at Sunset |
| **Remaining Traffic** | Requests per day to deprecated endpoints | 0 at Sunset |
| **Dependency Cleanup Rate** | Cleaned dependencies / Total dependencies | 100% at Archive |
| **Data Archival Completion** | Archived datasets / Total datasets requiring archival | 100% at Archive |

**Monitoring recommendations:**
- Review metrics weekly during the deprecation period
- Escalate if Consumer Migration Rate is below 50% at the midpoint
- Block Sunset if Remaining Traffic is above threshold

---

## Quick Reference Card

### Sunset Timeline Summary
```
T-6 months   → Announce (publish plan)
T-3 months   → Deprecate (add headers)
T-3 to T-1   → Migrate (assist consumers)
T-1 month    → Warn (final notice)
T             → Sunset (410 Gone)
T+1 month    → Archive (cleanup)
```

### Feature Removal Decision
```
Usage > 0 in 30 days?      → Evaluate carefully
Has dependencies?           → Map and migrate first
Has contractual obligation? → Legal review required
No alternative exists?      → Build alternative first
```

---

## References

- [RFC 8594 — The Sunset HTTP Header Field](https://www.rfc-editor.org/rfc/rfc8594) — Standard for communicating API retirement dates
- [RFC 8288 — Web Linking](https://www.rfc-editor.org/rfc/rfc8288) — Link relation types including successor-version
- [API Versioning and Deprecation](https://swagger.io/blog/api-strategy/api-versioning-deprecation/) — Best practices for API lifecycle management

---

**Related Standards:**
- [API Design Standards](api-design-standards.md) — API design and versioning conventions
- [Changelog Standards](changelog-standards.md) — CHANGELOG format for deprecation announcements
- [Deployment Standards](deployment-standards.md) — Deployment and infrastructure management

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: API Deprecation, Feature Sunset, System Decommission, Retirement Metrics |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
