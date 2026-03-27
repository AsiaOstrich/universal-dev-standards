# Documentation Lifecycle Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/documentation-lifecycle.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-27
**Applicability**: All software projects with documentation
**Scope**: universal
**Industry Standards**: ISO/IEC 26514 (Systems and software engineering — Design and development of information for users)
**References**: [documentation-structure.md](documentation-structure.md), [documentation-writing-standards.md](documentation-writing-standards.md)

---

## Purpose

This standard defines **when** to update documentation, **when** to check it, and **who** is responsible. It complements the existing documentation standards:

| Standard | Focus | This Standard Fills |
|----------|-------|---------------------|
| [documentation-structure.md](documentation-structure.md) | Where to put docs (directory layout, naming) | Does not address update timing |
| [documentation-writing-standards.md](documentation-writing-standards.md) | How to write docs (content, style, format) | Does not address update triggers |
| **documentation-lifecycle.md** (this) | **When to update, when to check, who is responsible** | -- |

---

## Core Principles

### Co-update Principle

> **The person who changes the code is responsible for updating the corresponding documentation in the same PR.**

Documentation updates must not be deferred to a separate PR or a later sprint. When code and documentation diverge, users encounter stale information, and the cost of fixing it increases over time.

**Rules:**
- Code changes and documentation changes MUST be in the same pull request
- The code author is the primary responsible party for documentation updates
- Reviewers SHOULD verify documentation completeness during code review

### Shift-left Principle

> **The earlier a documentation issue is detected, the lower the cost to fix it.**

```
Cost to fix
     ^
     |                                          ████ Release
     |                              ████
     |                  ████ PR Review
     |      ████
     | ████ Commit
     +-----------------------------------------> Time
```

Detection at commit time (seconds, automated) is far cheaper than detection at release time (hours, manual). The check pyramid (below) implements this principle by layering checks from fast/automated to comprehensive/manual.

---

## Documentation Update Triggers

### Trigger x Document Type Matrix

Use this matrix to determine which documents need updating for each type of change. Cells indicate obligation level.

| Trigger | README | API Docs | CHANGELOG | Architecture (ADR) | User Guide | Translation |
|---------|:------:|:--------:|:---------:|:------------------:|:----------:|:-----------:|
| **New feature** | SHOULD | MUST | MUST | SHOULD | MUST | SHOULD |
| **API change** | N/A | MUST | MUST | SHOULD | SHOULD | SHOULD |
| **Breaking change** | MUST | MUST | MUST | MUST | MUST | MUST |
| **Bug fix** | N/A | N/A | SHOULD | N/A | SHOULD | N/A |
| **Dependency upgrade** | SHOULD | N/A | SHOULD | SHOULD | N/A | N/A |
| **Configuration change** | SHOULD | N/A | SHOULD | N/A | MUST | SHOULD |
| **Architecture change** | SHOULD | SHOULD | MUST | MUST | SHOULD | SHOULD |

**Legend:**
- **MUST** -- Required. PR should not be merged without this update.
- **SHOULD** -- Recommended. Reviewer flags if missing, but not blocking.
- **N/A** -- Not applicable for this trigger-document combination.

### How to Use This Matrix

1. Identify the type of change you are making (left column)
2. For each document type (top row), check the obligation level
3. Include all MUST updates in the same PR as the code change
4. Include SHOULD updates in the same PR when practical; otherwise, create a follow-up issue

---

## Documentation Check Pyramid

Checks are organized in three levels, from fast/automated to comprehensive/manual.

```
                ┌──────────────────┐
                │  Level 3         │  Release
                │  Comprehensive   │  (hours)
                ├──────────────────┤
            ┌───┴──────────────────┴───┐
            │  Level 2                 │  PR Review
            │  Semi-automated          │  (minutes)
            ├──────────────────────────┤
        ┌───┴──────────────────────────┴───┐
        │  Level 1                         │  Commit
        │  Automated                       │  (seconds)
        └──────────────────────────────────┘
```

### Level 1: Commit (Automated, Seconds)

Runs automatically on every commit via pre-commit hooks or CI.

| Check | Type | Tool Examples |
|-------|------|---------------|
| Internal link validity | Hard | markdown-link-check, lychee |
| Referenced file existence | Hard | Custom script |
| Markdown syntax validity | Hard | markdownlint, remark-lint |
| Version header presence | Hard | Custom script (grep) |

**Goal:** Catch broken links and structural issues instantly.

### Level 2: PR Review (Semi-automated, Minutes)

Runs during pull request review, combining automated checks with human judgment.

| Check | Type | Method |
|-------|------|--------|
| Doc-code change sync | Hard | CI script: detect code changes without corresponding doc updates |
| Trigger matrix compliance | Soft | Reviewer verifies against trigger matrix |
| Content accuracy | Soft | Reviewer reads updated documentation |
| Example code correctness | Soft | Reviewer spot-checks examples |
| Terminology consistency | Soft | Reviewer or linter (vale, textlint) |

**Goal:** Ensure documentation keeps pace with code changes.

### Level 3: Release (Comprehensive)

Runs before each release as part of the release checklist.

| Check | Type | Method |
|-------|------|--------|
| Version number consistency | Hard | Script: verify all version references match |
| Translation sync status | Hard | Script: compare source and translation file hashes |
| Feature-documentation coverage | Hard | Script: count features vs documented features |
| All external link validity | Hard | Link checker with external URL verification |
| CHANGELOG completeness | Soft | Manual review of release notes |
| Migration guide completeness | Soft | Manual review (if applicable) |
| README accuracy | Soft | Manual review of project description, badges, examples |

**Goal:** Ensure documentation is release-ready and complete.

---

## Hard Checks vs Soft Checks

Every check item is classified as either a hard check or a soft check. This distinction determines whether the check can block a workflow.

### Hard Checks (Automated, Blocking)

Hard checks are deterministic, automatable, and produce binary pass/fail results.

| Check | Description | Automation |
|-------|-------------|------------|
| Version consistency | All version references match across files | Script comparison |
| File existence | Referenced files exist at specified paths | File system check |
| Link validity | Internal and external links resolve correctly | Link checker tool |
| Translation sync | Translation files match source file structure | Hash or header comparison |
| Markdown syntax | Files pass markdown linting rules | markdownlint, remark-lint |
| Feature count accuracy | Documented feature count matches actual count | Custom script |

**Properties:**
- Can be implemented as CI/CD pipeline steps
- Produce deterministic pass/fail results
- SHOULD block merging or releasing when they fail

### Soft Checks (Manual, Advisory)

Soft checks require human judgment and cannot be fully automated.

| Check | Description | Method |
|-------|-------------|--------|
| Content correctness | Documentation accurately describes behavior | Human review |
| Example runnability | Code examples execute without errors | Manual testing or doctest |
| Release notes accuracy | CHANGELOG entries accurately describe changes | Human review |
| Migration guide completeness | Migration steps cover all breaking changes | Human review |
| Terminology consistency | Terms are used consistently throughout | Human review or style linter |
| Readability | Documentation is clear and well-organized | Human review |

**Properties:**
- Require human judgment or contextual understanding
- Produce advisory recommendations, not binary results
- SHOULD NOT block merging automatically but SHOULD be part of review checklists

---

## Responsibility Matrix

This matrix defines who is responsible for updating each document type, when the update should happen, and how it should be verified.

| Document Type | Primary Responsible | Update Timing | Verification Method |
|---------------|--------------------:|:-------------:|:--------------------|
| README | Code author | Same PR as code change | PR review (soft) |
| API Docs | Code author | Same PR as API change | PR review + link check (hard + soft) |
| CHANGELOG | Code author (entry) / Release manager (final) | Entry: same PR; Final: release time | Release checklist (soft) |
| Architecture (ADR) | Tech lead / Architect | When architecture decision is made | PR review (soft) |
| User Guide | Code author / Technical writer | Same PR or follow-up issue | PR review (soft) |
| Translation | Translator / Code author | After source file is finalized | Translation sync script (hard) |
| Inline code comments | Code author | Same PR as code change | PR review (soft) |
| Configuration docs | Code author | Same PR as config change | PR review (soft) |

### Role Definitions

| Role | Description |
|------|-------------|
| Code author | The developer who writes the code change |
| Reviewer | The person who reviews the pull request |
| Tech lead / Architect | Senior engineer responsible for architecture decisions |
| Release manager | Person responsible for the release process |
| Translator | Person responsible for translation files |
| Technical writer | Dedicated documentation specialist (if available) |

---

## Integration with Other Standards

This standard works together with the following standards:

| Standard | Relationship |
|----------|-------------|
| [documentation-structure.md](documentation-structure.md) | Defines **where** documents live; this standard defines **when** to update them |
| [documentation-writing-standards.md](documentation-writing-standards.md) | Defines **how** to write documents; this standard defines **when** and **who** |
| [checkin-standards.md](checkin-standards.md) | Includes "documentation updated" as a check-in gate; this standard provides the detailed checklist |
| [code-review-checklist.md](code-review-checklist.md) | Includes "Documentation Updated?" review item; this standard provides the trigger matrix and responsibility assignments |
| [changelog-standards.md](changelog-standards.md) | Defines CHANGELOG format; this standard defines when CHANGELOG updates are required |

---

## Quick Reference

### Decision Flowchart

```
Is this a code change?
├── Yes → Check the Trigger × Document Type Matrix
│         ├── Any MUST cells? → Update in same PR
│         ├── Any SHOULD cells? → Update in same PR if practical
│         └── All N/A? → No documentation update needed
└── No (docs-only change) → Follow documentation-writing-standards.md
```

### Minimum Viable Documentation Checks

For teams adopting this standard incrementally:

| Phase | Checks to Implement | Effort |
|-------|---------------------|--------|
| Phase 1 | Link validity (Level 1) | Low -- add markdown-link-check to CI |
| Phase 2 | Doc-code sync detection (Level 2) | Medium -- CI script to flag code-only PRs |
| Phase 3 | Full trigger matrix compliance (Level 2-3) | High -- reviewer training + release checklist |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial documentation lifecycle standard |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
