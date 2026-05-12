# Feature Manifest Standard

> **Language**: English | 繁體中文

**Applicability**: Migration and refactoring projects where an existing system is being ported or restructured
**Scope**: universal (language-agnostic manifest format)

---

## Overview

The Feature Manifest Standard defines a machine-readable format (`feature-manifest.yaml`) for cataloguing all features of an existing system before migration or refactoring begins. It provides a structured bridge between the legacy system's capabilities and the new system's acceptance criteria, enabling tools (VibeOps `/vo-pipeline --variant migration`) to enforce completeness gates automatically.

## References

| Standard/Source | Content |
|----------------|---------|
| XSPEC-200 | Migration Feature Inventory and Completeness Gate |
| XSPEC-201 | Refactor/Migration Completeness Protocol |
| XSPEC-199 | AC `not_implemented` status extension |

---

## When to Use

Use `feature-manifest.yaml` when:
- Migrating a system from one language/framework to another (e.g., PHP → C# .NET)
- Porting a legacy system to a new architecture
- Starting a major refactoring where existing behavior must be preserved

**Do not use** for greenfield development — the manifest is a reflection of an existing system, not a design document.

---

## Feature Manifest Format

### File Location

```
artifacts/feature-manifest.yaml
```

### Top-Level Structure

```yaml
manifest_version: "1.0"
source_system:
  language: php
  framework: laravel
  scan_date: "2026-05-12"
  scan_coverage: "47/47 routes (100%)"

features:
  - id: FM-001
    name: UserLogin
    # ... (see Feature Entry below)
```

### Feature Entry Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `FM-NNN` (zero-padded) |
| `name` | string | Yes | PascalCase business feature name |
| `description` | string | Yes | Plain language description of business purpose |
| `http_method` | string | No | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`; `null` for CLI/background |
| `route` | string | No | URL path; `null` for CLI/background |
| `controller` | string | Yes | `ClassName::methodName` |
| `confidence` | float | Yes | 0.0–1.0 (see Confidence Scoring) |
| `side_effects` | list | Yes | `DB_READ`, `DB_WRITE`, `EMAIL`, `QUEUE`, `HTTP_CALL`, `FILE` |
| `migration_risks` | list | No | Risk labels (see Migration Risks) |
| `ac_id` | string | No | `null` initially; set by Planner after manifest creation |
| `status` | string | Yes | Always `not_implemented` initially |

### Complete Feature Entry Example

```yaml
features:
  - id: FM-007
    name: OrderCancellation
    description: 取消訂單並觸發退款流程
    http_method: POST
    route: /api/orders/{id}/cancel
    controller: OrderController::cancel
    confidence: 0.9
    side_effects:
      - DB_WRITE
      - QUEUE
    migration_risks:
      - ORM_DIFFERENCES
    ac_id: null
    status: not_implemented
```

---

## Confidence Scoring

| Value | Meaning | Action |
|-------|---------|--------|
| 1.0 | Feature name and business purpose are unambiguous | Proceed to AC generation |
| 0.8 | Feature name is reasonable, purpose requires inference | Proceed with note |
| 0.5 | Likely infrastructure/utility, not primary business feature | Flag for human review |
| 0.3 | Unclear — cannot determine business purpose | **Halt; human must confirm** |

**Rule**: All features with `confidence < 0.5` must be reviewed by a human before Planner generates AC.

---

## Migration Risks

### PHP → C# .NET

| Label | Description |
|-------|-------------|
| `SESSION_HANDLING` | PHP `$_SESSION` → ASP.NET Core Session/Cookie middleware |
| `ORM_DIFFERENCES` | Eloquent ORM vs Entity Framework behavioral differences |
| `TIMEZONE_HANDLING` | PHP timezone functions → .NET `DateTimeOffset` |
| `FILE_UPLOAD_PATH` | PHP `$_FILES` → ASP.NET Core `IFormFile` |
| `REGEX_DIFFERENCES` | PHP PCRE syntax vs .NET `System.Text.RegularExpressions` |
| `ARRAY_FUNCTIONS` | PHP `array_*` functions → LINQ equivalents |
| `EXCEPTION_HIERARCHY` | PHP exception hierarchy vs .NET exception hierarchy |

### Generic

| Label | Description |
|-------|-------------|
| `ASYNC_MODEL` | Sync code → async/await migration |
| `NULL_SEMANTICS` | Null handling differences |
| `STRING_ENCODING` | String encoding/collation differences |

---

## FEATURE_STUB Marker Protocol

When implementing features from the manifest in the target codebase, use `FEATURE_STUB:` markers as placeholders:

### Format

```
// FEATURE_STUB: <FM-ID> <FeatureName> — <AC-ID> pending
```

### Example (C#)

```csharp
// FEATURE_STUB: FM-007 OrderCancellation — AC-007 pending
public async Task<Result<OrderDto>> CancelOrderAsync(string orderId, CancellationReason reason)
{
    throw new NotImplementedException();
}
```

### FEATURE_STUB vs WARNING:STUB

| Marker | Semantic | When to Use |
|--------|----------|-------------|
| `// WARNING: STUB` | Temporary fake logic (code runs but behavior is wrong) | Placeholder with incorrect business logic |
| `// FEATURE_STUB:` | Feature not yet implemented (no logic at all) | Feature from manifest that hasn't been coded yet |

**Both markers block CI** (main branch push and UAT/production deployment).

### Lifecycle

1. Feature added to manifest with `status: not_implemented`
2. Developer adds `FEATURE_STUB:` placeholder in target code
3. Developer implements the feature, removes `FEATURE_STUB:` marker
4. Update manifest `status` → `implemented`
5. Update AC traceability `status` → `uncovered` or `covered`

---

## Completeness Gates

### Gate 1 (Pre-Pipeline)

Before `/vo-pipeline --variant migration` starts:
- `artifacts/feature-manifest.yaml` must exist
- `.snapshots/` directory must exist with at least one JSON file

### Feature Completeness Gate (Pre-UAT)

CI blocks UAT deployment if:
- Any feature in manifest has `status: not_implemented` AND
- Corresponding `FEATURE_STUB:` exists in codebase

---

## Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| Starting migration without manifest | Feature gaps discovered in UAT | Always generate manifest first |
| Skipping low-confidence features | Silent functional omissions | Review and confirm all features |
| Using `uncovered` instead of `not_implemented` | CI doesn't block on missing features | Use `not_implemented` when code doesn't exist |
| Not removing `FEATURE_STUB:` after implementation | False "incomplete" signal in CI | Always clean up markers after implementation |

---

## Related Standards

- [Acceptance Criteria Traceability](acceptance-criteria-traceability.md) — `not_implemented` AC status
- [Behavior Snapshot Standard](behavior-snapshot.md) — HTTP parity baseline recording
- [Refactoring Standards](refactoring-standards.md) — Characterization tests for refactoring
- [Spec-Driven Development](spec-driven-development.md) — AC generation workflow

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | Initial version — FM-NNN schema, confidence scoring, FEATURE_STUB protocol (XSPEC-200) |
