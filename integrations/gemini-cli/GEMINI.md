# Universal Development Standards

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/gemini-cli/GEMINI.md) | [简体中文](../../locales/zh-CN/integrations/gemini-cli/GEMINI.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-21

This project follows the Universal Doc Standards to ensure high-quality, hallucination-free code and documentation.

---

## Core Standards Usage Rule

> **Core Standards Usage Rule**:
> When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the concise rules in `core/` (e.g., `core/testing-standards.md`).
> **ONLY** read `core/guides/` or `methodologies/guides/` when explicitly asked for educational content, detailed explanations, or tutorials.
> This ensures token efficiency and focused context.

---

## Spec-Driven Development (SDD) Priority

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like `/openspec` or `/spec`), you MUST prioritize using these commands over manual file editing.

**Detection**:
- OpenSpec: Check for `openspec/` directory or `openspec.json`
- Spec Kit: Check for `specs/` directory or `.speckit` configuration

**Rationale**:
- **Consistency**: Tools ensure spec structure follows strict schemas
- **Traceability**: Commands handle logging, IDs, and linking automatically
- **Safety**: Tools have built-in validation preventing invalid states

Reference: `core/spec-driven-development.md`

---

## Anti-Hallucination Protocol

Reference: `core/anti-hallucination.md`

### 1. Evidence-Based Analysis

- You MUST read files before analyzing them.
- Do NOT guess APIs, class names, or library versions.
- If you haven't seen the code, state: "I need to read [file] to confirm".

### 2. Source Attribution

Every factual claim about the code MUST cite sources:
- Code: `[Source: Code] path/to/file:line`
- External docs: `[Source: External] http://url (Accessed: Date)`

### 3. Certainty Classification

Use tags to indicate confidence level:
- `[Confirmed]` - Verified from source
- `[Inferred]` - Logically deduced
- `[Assumption]` - Reasonable guess
- `[Unknown]` - Cannot determine

### 4. Recommendations

When presenting options, you MUST explicitly state a "Recommended" choice with reasoning.

---

## Documentation & Commits

### Commit Messages

Follow Conventional Commits format (reference: `core/commit-message-guide.md`):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, chore, test, refactor, style

### File Structure

Follow documentation structure guidelines (reference: `core/documentation-structure.md`).

### Quality Gates

Before finishing, verify work against `core/checkin-standards.md`:
- [ ] Code compiles successfully
- [ ] All tests pass
- [ ] No hardcoded secrets
- [ ] Documentation updated if applicable

---

## Workflow Enforcement Gates

**CRITICAL**: Before executing any workflow phase command, you MUST check prerequisites.

### Session Start Protocol
At session start, check for active workflows: `ls .workflow-state/*.yaml 2>/dev/null`
If active workflows found → inform user and offer to resume.

### Phase Gates

| Workflow | Phase | Prerequisite | On Failure |
|---------|-------|-------------|------------|
| SDD | implement | Spec status = Approved | → `/sdd approve` |
| SDD | verify | All ACs have code + tests | → `/sdd implement` |
| TDD | GREEN | Failing test exists | → Stay in RED |
| TDD | REFACTOR | All tests passing | → Stay in GREEN |
| BDD | AUTOMATION | `.feature` file exists | → FORMULATION |
| Commit | feat/fix | Check active specs | → Suggest `Refs: SPEC-XXX` |

**NEVER** write implementation code before a failing test exists (TDD).
**NEVER** write step definitions before `.feature` files exist (BDD).

Reference: `.standards/workflow-enforcement.ai.yaml`

---

## Refactoring Guidelines

Reference: `core/refactoring-standards.md`

### Three-Tier Strategy

| Tier | Strategies | Timescale |
|------|------------|-----------|
| **Tactical** | Boy Scout Rule, Preparatory Refactoring, Red-Green-Refactor | Minutes |
| **Strategic** | Strangler Fig, Anti-Corruption Layer, Branch by Abstraction | Weeks-Months |
| **Safety** | Characterization Tests, Scratch Refactoring, Find Seams | Prerequisite |

### Decision Tree

1. In production? No → Consider rewrite
2. Understood? No → Characterization tests first
3. Coverage >60%? No → Add tests first
4. Architecture salvageable? No → Strangler Fig; Yes → Incremental refactoring

### Quick Reference

| Situation | Strategy |
|-----------|----------|
| Feature blocked by messy code | **Preparatory Refactoring** |
| Bug fix opportunity | **Boy Scout Rule** |
| Replacing legacy system | **Strangler Fig** |
| Coexisting with legacy | **Anti-Corruption Layer** |
| Untested legacy code | **Characterization Tests FIRST** |

---

## AI Response Navigation / AI 回應導航

**Rule**: Every substantive AI response MUST end with a Navigation Footer suggesting next steps.
**規則**：每個實質性的 AI 回應結尾必須包含導航區塊，建議下一步行動。

**Key behaviors / 關鍵行為**:
- Append navigation suggestions after completing tasks, providing analysis, asking questions, or reporting errors
- Mark the recommended option with ⭐ when providing multiple choices
- Use contextual templates (task completed, user question, error/failure, in progress, informational reply)
- Adapt option count to context (1-5, never exceed 5)
- Prefer slash commands in suggestions when applicable

**豁免 / Exemption**: Ultra-short confirmations ("OK", "Done") may omit navigation.

Reference: `.standards/ai-response-navigation.ai.yaml` (or `core/ai-response-navigation.md`)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-21 | Added Refactoring Guidelines section |
| 1.0.0 | 2026-01-09 | Initial Gemini CLI context file |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
