# Feature Flag Management Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/feature-flag-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: Martin Fowler Feature Toggles, LaunchDarkly Best Practices
**References**: [martinfowler.com/articles/feature-toggles.html](https://martinfowler.com/articles/feature-toggles.html)

---

## Overview

This document defines standards for managing feature flags (also known as feature toggles) throughout their lifecycle. Feature flags are a powerful technique for controlling feature rollout, experimentation, and operational safety, but without proper management they accumulate as technical debt and increase system complexity.

---

## 1. Flag Types / Flag 類型

All feature flags MUST be classified into one of four types, each with its own management strategy:

| Type | Purpose | 管理策略 (Management Strategy) | Lifetime |
|------|---------|-------------------------------|----------|
| **Release** | Control gradual feature rollout | Short-lived; remove after full rollout | Temporary |
| **Experiment** | A/B testing and data-driven decisions | Time-boxed; remove after experiment concludes | Temporary |
| **Ops** | Operational controls (circuit breakers, kill switches) | Long-lived; review quarterly | Permanent with review |
| **Permission** | User/role-based access control | Long-lived; tied to authorization model | Permanent |

### Type Details

- **Release**: Used to decouple deployment from release. Enable features progressively (canary, percentage rollout). Must be removed once the feature is fully rolled out.
- **Experiment**: Used for A/B tests and multivariate experiments. Must have clear success metrics defined before creation. Remove after data is collected and decision is made.
- **Ops**: Used for operational safety such as circuit breakers, rate limiters, and graceful degradation. Can remain indefinitely but must undergo quarterly review.
- **Permission**: Used to gate features by user role, subscription tier, or entitlement. Lifetime is tied to the business authorization model.

---

## 2. Naming Conventions / 命名慣例

### Pattern

All flag names MUST follow the pattern: `<type>_<feature>_<context>`

| Component | Description | Examples |
|-----------|-------------|---------|
| `type` | Flag type prefix | `release`, `experiment`, `ops`, `permission` |
| `feature` | Feature or system name | `new_checkout`, `pricing_page`, `payment` |
| `context` | Specific context or variant | `flow`, `v2`, `circuit_breaker`, `dashboard` |

### Positive Examples (✅)

| Flag Name | Type | Description |
|-----------|------|-------------|
| `release_new_checkout_flow` | Release | New checkout flow rollout |
| `experiment_pricing_page_v2` | Experiment | Pricing page A/B test |
| `ops_payment_circuit_breaker` | Ops | Payment service circuit breaker |
| `permission_admin_dashboard` | Permission | Admin dashboard access control |

### Negative Examples (❌)

| Bad Name | Problem |
|----------|---------|
| `flag1` | No type prefix, no meaningful name |
| `new_feature` | Missing type prefix and context |
| `test_thing_temp` | Vague, no type prefix, suggests temporary without lifecycle |

---

## 3. Lifecycle Stages / 生命週期階段

Every feature flag progresses through 6 lifecycle stages:

```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (if TTL exceeded)
```

| Stage | Description | Entry Criteria | Exit Criteria |
|-------|-------------|---------------|--------------|
| **Created** | Flag is defined in configuration but not yet enabled | Flag definition merged to codebase | Flag is turned on for any environment |
| **Active** | Flag is in use, controlling feature behavior | Flag enabled in at least one environment | Feature decision is made (rollout complete or experiment concluded) |
| **Validated** | Feature behind the flag is confirmed working | Rollout at 100% or experiment data collected | Cleanup ticket created |
| **Cleanup** | Flag is being removed from codebase | Cleanup work has started | All flag references removed |
| **Removed** | Flag is fully removed from all code and configuration | No references remain in codebase | Terminal state |
| **Expired** | Flag has exceeded its TTL without progressing | TTL exceeded while in Created, Active, or Validated stage | Must transition to Cleanup or be renewed with justification |

---

## 4. TTL (Time-To-Live) / 存活時間限制

Each flag type has a defined TTL to prevent flag accumulation:

| Type | Default TTL | Max TTL | 超過 TTL 時的動作 |
|------|-------------|---------|-------------------|
| **Release** | 2 週 | 4 週 | 自動標記為 Expired，觸發清理流程 |
| **Experiment** | 4 週 | 8 週 | 自動標記為 Expired，要求結論報告 |
| **Ops** | 無限 | 無限（季度審查） | 每季審查，未審查者標記為待確認 |
| **Permission** | 無限 | 無限（年度審查） | 年度審查，確認是否仍需要 |

### TTL Enforcement

- When a flag exceeds its TTL, the system MUST automatically mark it as **Expired**
- 過期的 Flag 必須在下一個 Sprint 內處理
- Extensions require explicit approval with documented justification

---

## 5. Audit / 審計

### 4 Audit Dimensions / 4 個審計檢查維度

Regular audits MUST check each flag across these four dimensions:

| Dimension | Description | Check Method |
|-----------|-------------|-------------|
| **存活時間** | How long the flag has been alive vs. its TTL | Compare creation date with TTL policy |
| **使用狀態** | Whether the flag is actively being evaluated | Check runtime evaluation logs |
| **程式碼參考** | How many code locations reference the flag | Static analysis / code search |
| **測試影響** | How the flag affects test suite behavior | Analyze test configurations and branches |

### Audit Report Format / 審計報告格式

Every audit report MUST include the following sections:

| Section | Description |
|---------|-------------|
| **Flag 總數**（按類型分組） | Total count of flags grouped by type (Release, Experiment, Ops, Permission) |
| **過期 Flag 清單** | List of all flags that have exceeded their TTL |
| **本季清理 Flag 數** | Number of flags cleaned up in the current quarter |
| **Flag 趨勢（增減）** | Trend showing net change in flag count over time |

---

## 6. Decay Detection / 腐化偵測

When a flag exceeds its TTL or shows signs of decay (unused, unreferenced), the system MUST perform the following automatic actions:

| # | Action | Description |
|---|--------|-------------|
| 1 | **標記為 Expired** | Automatically transition the flag to Expired lifecycle stage |
| 2 | **技術債登記（建立條目）** | Create a technical debt registry entry with flag details, owner, and recommended action |
| 3 | **通知 Owner** | Send notification to the flag owner via configured channel (email, Slack, etc.) |
| 4 | **Sprint Planning 提醒** | Add the expired flag to the next Sprint Planning agenda for prioritization |

---

## 7. Cleanup Checklist / 清理檢查表

When removing a feature flag, follow this 5-step checklist:

- [ ] **Step 1: 移除 Flag 判斷程式碼** — Remove all conditional code branches that reference the flag. Keep the winning code path.
- [ ] **Step 2: 移除 Flag 配置** — Remove the flag definition from all configuration files, environment variables, and feature flag service.
- [ ] **Step 3: 更新相關測試** — Update or remove tests that specifically test flag-on/flag-off behavior. Ensure remaining tests reflect the permanent state.
- [ ] **Step 4: 更新文件** — Update any documentation, runbooks, or architecture diagrams that reference the flag.
- [ ] **Step 5: 驗證所有環境** — Verify that the flag has been removed from all environments (dev, staging, production) and that no references remain.

---

## 8. Testing Principles / 測試原則

When working with feature flags, follow these 4 testing principles:

### Principle 1: 測試兩種狀態 (Test Both States: on/off)

Every feature flag MUST have tests covering both the enabled (on) and disabled (off) states. This ensures the system behaves correctly regardless of the flag's value.

### Principle 2: 避免組合爆炸 (Avoid Combination Explosion)

When multiple flags exist, do NOT test all possible combinations (2^N grows exponentially). Instead:
- Test each flag independently in on/off states
- Only test specific combinations that represent real deployment scenarios
- Use risk-based testing to identify critical combinations

### Principle 3: 預設值測試 (Test Default Values)

Always test the system's behavior with the flag's default value. This is the state new users or environments will experience. Ensure defaults are safe and well-documented.

### Principle 4: 環境隔離 (Environment Isolation)

Flag values in tests MUST be isolated from other environments:
- Tests should not depend on external feature flag services
- Use test-local flag configurations
- Ensure flag state changes in one test do not affect other tests

---

## Quick Reference Card

### Flag Type Selection
```
Gradual feature rollout?         → Release
A/B testing or experiment?       → Experiment
Operational safety control?      → Ops
User/role access control?        → Permission
```

### Lifecycle Flow
```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (TTL exceeded)
```

### TTL Quick Reference
```
Release:    2 weeks default, 4 weeks max
Experiment: 4 weeks default, 8 weeks max
Ops:        Unlimited (quarterly review)
Permission: Unlimited (annual review)
```

---

## References

- [Martin Fowler — Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) — Comprehensive guide to feature toggle types and patterns
- [LaunchDarkly — Feature Flag Best Practices](https://launchdarkly.com/blog/feature-flag-best-practices/) — Industry best practices for flag management
- [Pete Hodgson — Feature Toggles (aka Feature Flags)](https://www.martinfowler.com/articles/feature-toggles.html) — Detailed categorization of toggle types

---

**Related Standards:**
- [Testing Standards](testing-standards.md) — Testing requirements and patterns
- [Deployment Standards](deployment-standards.md) — Deployment strategies including canary and blue-green
- [Logging Standards](logging-standards.md) — Logging feature flag decisions for observability

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Flag types, naming conventions, lifecycle, TTL, audit, decay detection, cleanup checklist, testing principles |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
