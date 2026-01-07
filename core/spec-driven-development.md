# Spec-Driven Development (SDD) Standards

**Version**: 1.2.0
**Last Updated**: 2026-01-05
**Applicability**: All projects adopting Spec-Driven Development

> **Language**: [English](../core/spec-driven-development.md) | [繁體中文](../locales/zh-TW/core/spec-driven-development.md)

---

## Purpose

This standard defines the principles and workflows for Spec-Driven Development (SDD), ensuring that changes are planned, documented, and approved via specifications before implementation.

**Key Benefits**:
- Reduced miscommunication between stakeholders and developers
- Clear audit trail for all changes
- Easier onboarding for new team members

---

## SDD Workflow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Proposal   │───▶│    Review    │───▶│Implementation│
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
                    ┌──────────────┐    ┌──────────────┐
                    │   Archive    │◀───│ Verification │
                    └──────────────┘    └──────────────┘
```

### Workflow Stages

| Stage | Description | Artifacts |
|-------|-------------|-----------|
| **Proposal** | Define what to change and why | `proposal.md` |
| **Review** | Stakeholder approval | Review comments, approval record |
| **Implementation** | Execute the approved spec | Code, tests, docs |
| **Verification** | Confirm implementation matches spec | Test results, review |
| **Archive** | Close and archive the spec | Archived spec with links to commits/PRs |

---

## Core Principles

### 1. Priority of SDD Tool Commands

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated and provides specific commands (e.g., slash commands like `/openspec` or `/spec`), AI assistants MUST prioritize using these commands over manual file editing.

**Rationale**:
- **Consistency**: Tools ensure the spec structure follows strict schemas.
- **Traceability**: Commands often handle logging, IDs, and linking automatically.
- **Safety**: Tools may have built-in validation preventing invalid states.

**Example**:
- ✅ Use `/openspec proposal "Add Login"` instead of manually creating `changes/add-login/proposal.md`.

---

### 2. Methodology Over Tooling

**Rule**: SDD is a methodology, not bound to a single tool. While OpenSpec is a common implementation, these standards apply to any SDD tool (e.g., Spec Kit).

**Guidelines**:
- **Universal Flow**: Proposal -> Review -> Implementation -> Verification -> Archive.
- **Tool Adaptation**: Adapt to the specific commands and patterns of the active SDD tool in the workspace.

---

### 3. Spec First, Code Second

**Rule**: No functional code changes shall be made without a corresponding approved specification or change proposal.

**Exceptions**:
- Critical hotfixes (restore service immediately, document later).
- Trivial changes (typos, comments, formatting).

---

## Spec Document Template

### Proposal Template

```markdown
# [SPEC-ID] Feature Title

## Summary
Brief description of the proposed change.

## Motivation
Why is this change needed? What problem does it solve?

## Detailed Design
Technical approach, affected components, data flow.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies
List any dependencies on other specs or external systems.

## Risks
Potential risks and mitigation strategies.
```

---

## Integration with Other Standards

### With Commit Message Guide

When implementing an approved spec, reference the spec ID in commit messages:

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### With Check-in Standards

Before checking in code for a spec:

1. ✅ Spec is approved
2. ✅ Implementation matches spec
3. ✅ Tests cover acceptance criteria
4. ✅ Spec ID referenced in PR

### With Code Review Checklist

Reviewers should verify:

- [ ] Change matches approved spec
- [ ] No scope creep beyond spec
- [ ] Spec acceptance criteria met

---

## Common SDD Tools

| Tool | Description | Command Examples |
|------|-------------|------------------|
| **OpenSpec** | Specification management | `/openspec proposal`, `/openspec approve` |
| **Spec Kit** | Lightweight spec tracking | `/spec create`, `/spec close` |
| **Manual** | No tool, file-based | Create `specs/SPEC-XXX.md` manually |

---

## Best Practices

### Do's

- ✅ Keep specs focused and atomic (one change per spec)
- ✅ Include clear acceptance criteria
- ✅ Link specs to implementation PRs
- ✅ Archive specs after completion

### Don'ts

- ❌ Start coding before spec approval
- ❌ Modify scope during implementation without updating spec
- ❌ Leave specs in limbo (always close or archive)
- ❌ Skip verification step

---

## Related Standards

- [Test-Driven Development](test-driven-development.md) - TDD workflow and SDD integration
- [Testing Standards](testing-standards.md) - Testing framework and best practices
- [Test Completeness Dimensions](test-completeness-dimensions.md) - 7-dimension test coverage
- [Commit Message Guide](commit-message-guide.md) - Commit message conventions
- [Code Check-in Standards](checkin-standards.md) - Code check-in requirements
- [Code Review Checklist](code-review-checklist.md) - Code review guidelines
- [Documentation Structure](documentation-structure.md) - Documentation structure standards

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-01-05 | Added: IEEE 830-1998 and SWEBOK v4.0 Chapter 1 (Software Requirements) to References |
| 1.1.0 | 2025-12-24 | Added: Workflow diagram, Spec template, Integration guide, Best practices, Related standards, License |
| 1.0.0 | 2025-12-23 | Initial SDD standard definition |

---

## References

- [OpenSpec Documentation](https://github.com/openspec)
- [Design Documents Best Practices](https://www.industrialempathy.com/posts/design-docs-at-google/)
- [ADR (Architecture Decision Records)](https://adr.github.io/)
- [IEEE 830-1998 - Software Requirements Specifications](https://standards.ieee.org/ieee/830/1222/) - Requirements documentation standard
- [SWEBOK v4.0 - Chapter 1: Software Requirements](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
