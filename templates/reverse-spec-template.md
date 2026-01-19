# [SPEC-XXX] [Feature Name] (Reverse Engineered)

**Version**: 1.0.0
**Last Updated**: 2026-01-19

> ⚠️ **This specification was reverse engineered from existing code**
>
> - **Analysis Date**: YYYY-MM-DD
> - **Analyzed Path**: `path/to/code`
> - **Analyzer**: [AI/Human Name]
>
> Sections marked `[Unknown]` require human confirmation before this spec is considered complete.

---

## Human Review Checklist

Before considering this spec complete, verify:

### Accuracy
- [ ] All `[Confirmed]` items verified against actual code
- [ ] Source citations (file:line) are correct
- [ ] No fabricated APIs, configurations, or behaviors

### Inference Validation
- [ ] All `[Inferred]` items reviewed for accuracy
- [ ] Incorrect inferences corrected or removed
- [ ] Reasoning for inferences is sound

### Required Human Input
- [ ] `Motivation` section completed (why this feature exists)
- [ ] `Risks` section completed (potential failure modes)
- [ ] `Out of Scope` section verified (intentional exclusions)
- [ ] `User Story` / business context added

### Final Sign-off
- [ ] Original developer reviewed (if available)
- [ ] Product owner approved business context
- [ ] All `[Unknown]` labels resolved or acknowledged

---

## Summary

[Confirmed] Brief description of what the code does.

- [Source: Code] `primary_file.ts:start-end`

<!-- Example:
[Confirmed] This module provides user authentication via JWT tokens, supporting login, logout, and token refresh operations.

- [Source: Code] src/controllers/AuthController.ts:1-150
- [Source: Code] src/services/AuthService.ts:1-200
-->

---

## Motivation

[Unknown] **Requires human input**

Answer these questions:

1. **Why was this feature built?**
   <!-- What problem does it solve? What was the business driver? -->

2. **Who requested this feature?**
   <!-- Product owner, customer, internal team? -->

3. **What user problem does it address?**
   <!-- User pain points, workflow improvements -->

4. **What was the original timeline/context?**
   <!-- When was it built? Any relevant context? -->

---

## User Story

[Unknown] **Requires human input**

```
As a [user type],
I want to [action/capability],
So that [benefit/value].
```

<!-- Example:
As a registered user,
I want to log in with my email and password,
So that I can access my personal dashboard and data.
-->

---

## Detailed Design

### Architecture Overview

[Confirmed/Inferred] High-level architecture extracted from code.

```
┌─────────────────────────────────────────────────────────────┐
│                     Component Diagram                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Describe the main components and their relationships]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- [Source: Code] `src/architecture/` or inferred from imports

### Component Details

#### Component 1: [Name]

[Confirmed] Description of component responsibility.

- **Location**: `path/to/component`
- **Dependencies**: List of dependencies
- **Key Methods**:
  - `methodName()` - Description
  - `anotherMethod()` - Description

- [Source: Code] `file.ts:lines`

#### Component 2: [Name]

[Confirmed/Inferred] Description.

- [Source: Code] `file.ts:lines`

### Data Models

#### Model: [EntityName]

[Confirmed] Data structure definition.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Primary identifier |
| field1 | type | Yes/No | [Confirmed] Description |
| field2 | type | Yes/No | [Inferred] Description |

- [Source: Code] `src/models/EntityName.ts:lines`

### API / Interface

#### Endpoint/Method 1

[Confirmed] `METHOD /path/to/endpoint`

**Parameters**:
| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| param1 | path/query/body | type | Yes/No | Description |

**Request Body** (if applicable):
```json
{
  "field": "value"
}
```

**Response**:
```json
{
  "result": "value"
}
```

**Error Codes**:
| Code | Description |
|------|-------------|
| 400 | [Inferred] Bad request |
| 401 | [Confirmed] Unauthorized |

- [Source: Code] `src/controllers/Controller.ts:lines`

### Configuration

[Confirmed] Configuration extracted from code.

| Setting | Default | Description | Source |
|---------|---------|-------------|--------|
| SETTING_1 | value | Description | [Source: Code] config.ts:5 |
| SETTING_2 | value | Description | [Source: Code] .env.example:10 |

---

## Acceptance Criteria

### Extracted from Tests

[Inferred] Acceptance criteria derived from test cases:

#### Feature Area 1

- [ ] [Inferred] Criterion from `test_should_do_something` (test_file.ts:10)
- [ ] [Inferred] Criterion from `test_should_handle_error` (test_file.ts:25)

#### Feature Area 2

- [ ] [Inferred] Criterion from test analysis

- [Source: Code] `src/tests/feature.test.ts`

### Coverage Gaps

[Unknown] The following areas lack test coverage:

| Area | Risk Level | Recommendation |
|------|------------|----------------|
| Error handling | 🟡 Medium | Add tests before modification |
| Edge cases | 🔴 High | Requires documentation |

---

## Dependencies

### External Dependencies

[Confirmed] Dependencies from package.json/requirements.txt:

| Package | Version | Purpose |
|---------|---------|---------|
| package1 | ^1.0.0 | Description |
| package2 | ^2.0.0 | Description |

- [Source: Code] `package.json:lines`

### Internal Dependencies

[Confirmed] Internal module dependencies:

| Module | Depends On | Type |
|--------|------------|------|
| AuthService | UserRepository | Runtime |
| UserController | AuthService, UserService | Runtime |

---

## Risks

[Unknown] **Requires human input**

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| <!-- Add technical risks --> | Low/Medium/High | Low/Medium/High | <!-- Mitigation strategy --> |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| <!-- Add business risks --> | Low/Medium/High | Low/Medium/High | <!-- Mitigation strategy --> |

### Known Issues / Tech Debt

[Unknown] Document any known issues discovered during analysis:

| Issue | Severity | Notes |
|-------|----------|-------|
| <!-- Add issues --> | Low/Medium/High | <!-- Additional context --> |

---

## Out of Scope

[Unknown] **Requires human input**

What was intentionally NOT included in this feature?

- [ ] <!-- Item 1 - was this intentionally excluded? -->
- [ ] <!-- Item 2 -->

---

## Historical Context

[Unknown] **Requires human input**

### Design Decisions

| Decision | Rationale | Date | Decided By |
|----------|-----------|------|------------|
| <!-- What was decided --> | <!-- Why --> | <!-- When --> | <!-- Who --> |

### Trade-offs Made

| Trade-off | Chosen Option | Alternative | Reason |
|-----------|---------------|-------------|--------|
| <!-- Trade-off description --> | <!-- What was chosen --> | <!-- What was rejected --> | <!-- Why --> |

---

## Related Resources

### Code References

| Resource | Path | Description |
|----------|------|-------------|
| Main Implementation | `src/path/to/main` | Primary code location |
| Tests | `src/tests/path` | Test files |
| Configuration | `src/config/path` | Config files |

### Documentation

[Unknown] Existing documentation (if any):

- [ ] README: `path/to/readme` (exists/missing)
- [ ] API Docs: `path/to/docs` (exists/missing)
- [ ] Architecture: `path/to/arch` (exists/missing)

### Related Specs

- [ ] [SPEC-XXX] Related feature (if any)

---

## Analysis Metadata

| Attribute | Value |
|-----------|-------|
| **Analyzed By** | [AI Assistant / Human Name] |
| **Analysis Date** | YYYY-MM-DD |
| **Tool/Method** | `/reverse-spec` command |
| **Code Version** | Git commit hash or version |
| **Files Analyzed** | N files |
| **Lines of Code** | N lines |

### Confidence Summary

| Certainty Level | Count | Percentage |
|-----------------|-------|------------|
| [Confirmed] | N | X% |
| [Inferred] | N | X% |
| [Unknown] | N | X% |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | YYYY-MM-DD | Initial reverse-engineered spec | [Name] |

---

## Appendix: Raw Analysis Data

<details>
<summary>Click to expand code analysis output</summary>

```
<!-- Paste raw analysis output here for reference -->
```

</details>
