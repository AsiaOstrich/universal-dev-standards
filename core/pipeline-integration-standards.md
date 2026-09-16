# Pipeline Integration Standards

<!-- UDS:REFERENCE-ONLY since=6.0.0 -->
> **Reference only — UDS does not install this standard.** Its machine-readable
> `.ai.yaml` was removed in 6.0.0; the document is kept here for the adoption
> layer that implements it, and is **not distributed by `uds init` or
> `uds update`**. The list this notice is checked against is
> [`scripts/reference-only-standards.json`](../scripts/reference-only-standards.json);
> the migration record is [`docs/MIGRATION-v6.md`](../docs/MIGRATION-v6.md) §2.

> **Language**: English | [繁體中文](../locales/zh-TW/core/pipeline-integration-standards.md)

**Applicability**: All software projects using automated development pipelines
**Scope**: universal

---

## Overview

Pipeline Integration Standards define how automated development pipelines should read project configuration, execute development stages, and adapt behavior based on project context. This standard provides a language-agnostic, framework-agnostic model for AI-assisted and CI/CD-driven development workflows.

## References

| Standard/Source | Content |
|----------------|---------|
| ISO/IEC 12207 | Software Lifecycle Processes |
| ISO/IEC 15504 (SPICE) | Process Assessment |
| Continuous Delivery (Jez Humble) | Pipeline design principles |
| DORA Metrics | Deployment frequency, lead time, MTTR, change failure rate |

---

## Configuration Contract

### UDS Configuration Block

Projects using automated pipelines MUST declare their pipeline preferences in a standard configuration block. The configuration block is typically placed in the project's manifest file (e.g., `manifest.json`, `uds.config.json`, or equivalent).

### Standard Toggle Names

| Toggle | Type | Default | Description |
|--------|------|---------|-------------|
| `autoSpecGeneration` | boolean | false | Automatically generate SDD specs from PRD/user stories |
| `autoDerive` | boolean | false | Automatically derive BDD/TDD/ATDD from approved specs |
| `autoTDD` | boolean | false | Automatically enter TDD RED phase after derivation |
| `autoCheckin` | boolean | false | Automatically commit when all quality gates pass |
| `autoBatch` | boolean | false | Automatically batch pending changes before commit |

### Toggle Semantics

Each toggle controls a specific pipeline behavior:

| Toggle | When ON | When OFF |
|--------|---------|----------|
| `autoSpecGeneration` | Pipeline generates spec draft from input, submits for review | Manual spec creation required |
| `autoDerive` | Pipeline runs derivation (BDD/TDD/ATDD) after spec approval | Manual derivation via commands |
| `autoTDD` | Pipeline sets RED state and creates test skeleton after derivation | Developer manually enters TDD |
| `autoCheckin` | Pipeline commits after all gates pass (tests, lint, coverage) | Developer manually commits |
| `autoBatch` | Pipeline accumulates changes and merges at threshold | Each change committed individually |

### Configuration Example

```json
{
  "pipeline": {
    "autoSpecGeneration": true,
    "autoDerive": true,
    "autoTDD": true,
    "autoCheckin": false,
    "autoBatch": false,
    "context": "greenfield"
  }
}
```

### Configuration Reading Rules

1. **Fail-safe defaults**: All toggles default to OFF (manual mode)
2. **Explicit declaration**: Pipeline MUST NOT assume toggle state without reading configuration
3. **Runtime override**: CLI flags or environment variables MAY override file-based configuration
4. **Validation**: Pipeline MUST validate configuration values before execution

---

## Pipeline Stage Model

### Standard 6-Stage Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  1.PLAN  │───▶│  2.SPEC  │───▶│ 3.DERIVE │───▶│ 4.BUILD  │───▶│ 5.REVIEW │───▶│6.CHECKIN │
│ 需求分析  │    │ 規格撰寫  │    │ 測試衍生  │    │ 實作建置  │    │ 審查驗證  │    │ 提交簽入  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Stage Definitions

| Stage | Input | Output | Quality Gate |
|-------|-------|--------|-------------|
| **Plan** | PRD, user stories, requirements | Structured requirements document | Requirements reviewed |
| **Spec** | Requirements | SDD specification with AC | Spec approved |
| **Derive** | Approved spec | BDD scenarios, TDD skeletons, ATDD tables | 1:1 AC mapping verified |
| **Build** | Test skeletons + spec | Implementation code | Tests pass (RED→GREEN) |
| **Review** | Implementation + tests | Review feedback | Review approved |
| **Checkin** | Approved changes | Committed code | All quality gates pass |

### Stage Dependencies

- Each stage's output is the next stage's input
- Stages MUST NOT be skipped without explicit configuration
- Failed quality gates MUST block progression to next stage

---

## Development Context Classification

### Context Types

| Context | Description | Typical Scenario |
|---------|-------------|------------------|
| **Greenfield** | New project or feature with no existing code | Starting a new module, new service, new product |
| **Brownfield** | Existing codebase requiring modification | Adding features to legacy code, refactoring |
| **Adhoc** | Small, isolated changes | Bug fixes, configuration changes, hotfixes |

### Context Strategy Matrix

| Stage | Greenfield | Brownfield | Adhoc |
|-------|-----------|------------|-------|
| **Plan** | Full requirements | Impact analysis first | Quick assessment |
| **Spec** | Complete SDD | Delta SDD (changes only) | Optional (for significant changes) |
| **Derive** | Full derivation | Targeted derivation | Skip (unless complex) |
| **Build** | TDD from scratch | Modify existing + new tests | Direct fix |
| **Review** | Full review | Focused review on changes | Quick review |
| **Checkin** | Standard checkin | Standard checkin | Standard checkin |

### Context Detection Heuristics

Pipelines SHOULD auto-detect context using these signals:

| Signal | Greenfield Indicator | Brownfield Indicator | Adhoc Indicator |
|--------|---------------------|---------------------|-----------------|
| File count | 0 or minimal files | Established codebase | N/A |
| Change scope | New directory/module | Modifications to existing files | 1-3 files changed |
| Test coverage | No existing tests | Existing test suite | Existing tests cover area |
| Spec existence | No specs | Existing specs | May or may not have specs |

### Context Override

Developers can explicitly set context in configuration:

```json
{
  "pipeline": {
    "context": "brownfield"
  }
}
```

Or via CLI flag:
```bash
pipeline run --context=greenfield
```

---

## Integration Verification

### Pipeline Implementor Checklist

Implementors integrating with this standard MUST verify:

| Check | Requirement | Verification Method |
|-------|-------------|-------------------|
| Config reading | Pipeline reads all toggles from configuration | Unit test: mock config → verify behavior |
| Default handling | Unset toggles default to OFF | Unit test: empty config → manual mode |
| Stage execution | All 6 stages execute in order | Integration test: full pipeline run |
| Gate enforcement | Failed gates block next stage | Integration test: inject failure → verify block |
| Context awareness | Pipeline adapts to context type | Integration test: each context → verify stages |
| Override support | CLI flags override file config | Unit test: file + flag → flag wins |

### Validation Rules

1. **Configuration schema**: Validate against known toggle names; warn on unknown keys
2. **Toggle type safety**: All toggles MUST be boolean; reject non-boolean values
3. **Context enum**: Context MUST be one of: `greenfield`, `brownfield`, `adhoc`
4. **Stage completeness**: Pipeline MUST report which stages were executed and which were skipped

---

## Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| Hardcoding pipeline behavior | Cannot adapt to project needs | Read configuration at runtime |
| Ignoring context type | Wrong stages executed | Detect or read context setting |
| Skipping quality gates | Broken code enters codebase | Enforce gates at each stage |
| All-or-nothing automation | Users avoid pipeline entirely | Allow per-toggle granular control |
| Silent stage skipping | Lost traceability | Log and report all skip decisions |

---

## Best Practices

### Do's

- ✅ Read configuration before executing any stage
- ✅ Default all toggles to OFF (safe defaults)
- ✅ Log which toggles are active at pipeline start
- ✅ Report stage execution status (executed/skipped/failed)
- ✅ Allow granular toggle control per stage
- ✅ Validate configuration schema before use
- ✅ Support configuration override via CLI

### Don'ts

- ❌ Assume toggle state without reading configuration
- ❌ Skip stages silently without logging
- ❌ Ignore quality gate failures
- ❌ Hardcode pipeline behavior
- ❌ Mix context strategies (e.g., greenfield spec + adhoc build)

---

## Related Standards

- [Spec-Driven Development](spec-driven-development.md) — Spec stage workflow
- [Forward Derivation Standards](forward-derivation-standards.md) — Derive stage implementation
- [Check-in Standards](checkin-standards.md) — Checkin stage quality gates
- [Change Batching Standards](change-batching-standards.md) — Batch merging before checkin
- [Acceptance Criteria Traceability](acceptance-criteria-traceability.md) — AC tracking across stages

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial version — configuration contract, 6-stage pipeline model, context classification |
