# Architecture Decision Records (ADR)

> **Language**: English | [繁體中文](../locales/zh-TW/core/adr-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-26
**Applicability**: All software projects making architectural decisions
**Scope**: universal
**Industry Standards**: ISO/IEC/IEEE 42010 (Architecture Description), TOGAF ADR
**References**: [Michael Nygard's ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), [MADR](https://adr.github.io/madr/)

---

## Purpose

Architecture Decision Records capture the context, options, and rationale behind significant technical decisions. They serve as a decision log that helps current and future team members understand why the architecture is the way it is.

---

## When to Write an ADR

| Write an ADR | Skip ADR |
|-------------|----------|
| Choosing a framework, library, or platform | Routine dependency updates |
| Defining API contracts or data formats | Bug fixes within existing architecture |
| Changing deployment strategy | Code style or formatting decisions |
| Establishing coding patterns or conventions | Trivial implementation choices |
| Making trade-offs with long-term consequences | Decisions already documented elsewhere |
| Deviating from established patterns | Following existing ADR guidance |

**Rule of thumb**: If someone might ask "why did we do it this way?" in 6 months, write an ADR.

---

## ADR Template

```markdown
# ADR-NNN: [Decision Title]

- **Status**: [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]
- **Date**: YYYY-MM-DD
- **Deciders**: [People involved in the decision]
- **Technical Story**: [Related SPEC-ID, Issue, or PR]

## Context

[Describe the technical or business context that prompted this decision.
What is the problem or opportunity? What constraints exist?]

## Decision Drivers

- [Driver 1: e.g., performance requirements]
- [Driver 2: e.g., team expertise]
- [Driver 3: e.g., budget constraints]

## Considered Options

1. [Option 1]
2. [Option 2]
3. [Option 3]

## Decision Outcome

Chosen option: **[Option N]**, because [justification].

### Consequences

**Good:**
- [Positive outcome 1]
- [Positive outcome 2]

**Bad:**
- [Negative outcome or trade-off 1]
- [Accepted risk 1]

**Neutral:**
- [Side effect that is neither good nor bad]

## Links

- [Related ADRs, SPECs, PRs, or external references]
```

---

## ADR Numbering

- Use sequential numbering: `ADR-001`, `ADR-002`, etc.
- Numbers are never reused, even if an ADR is deprecated.
- Prefix with project identifier for multi-project organizations: `[PROJECT]-ADR-001`.

---

## Status Lifecycle

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

| Status | Description |
|--------|-------------|
| **Proposed** | Under discussion, not yet decided |
| **Accepted** | Decision is active and should be followed |
| **Deprecated** | Decision is no longer relevant (e.g., feature removed) |
| **Superseded** | Replaced by a newer ADR (include link) |

### Rules

1. A **Proposed** ADR can become **Accepted** or be deleted (if rejected).
2. An **Accepted** ADR can become **Deprecated** or **Superseded**.
3. **Deprecated** and **Superseded** are terminal states.
4. Never revert an **Accepted** ADR to **Proposed**. Instead, create a new ADR that supersedes it.

---

## Storage Convention

```
docs/adr/
├── ADR-001-use-postgresql.md
├── ADR-002-adopt-event-sourcing.md
├── ADR-003-migrate-to-kubernetes.md
└── README.md          # ADR index (optional)
```

### File Naming

- Format: `ADR-NNN-short-description.md`
- Use kebab-case for the description part.
- Keep descriptions under 5 words.

### Index File (Optional)

Maintain a `README.md` in `docs/adr/` listing all ADRs:

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-use-postgresql.md) | Use PostgreSQL | Accepted | 2026-01-15 |
| [ADR-002](ADR-002-adopt-event-sourcing.md) | Adopt Event Sourcing | Superseded by ADR-005 | 2026-02-01 |
```

---

## Superseding an ADR

When a decision is replaced:

1. Create a new ADR with the updated decision.
2. In the new ADR, add: `Supersedes [ADR-NNN](ADR-NNN-old-title.md)`.
3. Update the old ADR's status to: `Superseded by [ADR-NNN](ADR-NNN-new-title.md)`.
4. Keep the old ADR's content intact for historical context.

---

## Integration with Other Artifacts

| Artifact | Integration |
|----------|-------------|
| **SDD Specs** | Reference ADRs in Technical Design section |
| **Code Comments** | Link to ADR when implementing a non-obvious pattern: `// See ADR-003` |
| **PR Descriptions** | Reference relevant ADRs for architectural changes |
| **Commit Messages** | Include `ADR-NNN` in footer for traceability |

---

## Quality Checklist

Before accepting an ADR, verify:

- [ ] **Context** clearly explains the problem or opportunity
- [ ] At least **2 options** were considered
- [ ] **Decision drivers** are explicitly listed
- [ ] **Consequences** include both positive and negative outcomes
- [ ] **Status** is set correctly
- [ ] **Links** to related artifacts are included
- [ ] File is stored in `docs/adr/` with correct naming

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| ADR after the fact | Missing real context and alternatives | Write ADR before or during the decision |
| Too many ADRs | Decision fatigue, noise | Only record significant decisions |
| Too few ADRs | Lost knowledge, repeated debates | Follow "6-month rule" above |
| No consequences | Incomplete analysis | Always list good and bad outcomes |
| Vague context | Useless for future readers | Include specific constraints and drivers |
| Editing accepted ADRs | Lost history | Supersede instead of editing |

---

## Best Practices

1. **Write ADRs at decision time** — not weeks later when context is forgotten.
2. **Keep them short** — 1-2 pages maximum. Brevity encourages writing and reading.
3. **Include rejected options** — knowing what was not chosen is as valuable as what was.
4. **Link bidirectionally** — ADRs reference code; code references ADRs.
5. **Review periodically** — mark outdated ADRs as deprecated during architecture reviews.
6. **Store in version control** — ADRs should live alongside the code they govern.
