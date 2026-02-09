# Spec Kit Instructions

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/spec-kit/AGENTS.md) | [简体中文](../../locales/zh-CN/integrations/spec-kit/AGENTS.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-30

Instructions for AI coding assistants using Spec Kit for spec-driven development.

## Usage

Copy this file to your project or include in your AI assistant's system instructions.

---

## Spec-Driven Development with Spec Kit

You are required to follow the **Spec-Driven Development (SDD)** methodology when Spec Kit is active in this project.

### Core Principle: Spec First, Code Second

**Rule**: No functional code changes shall be made without a corresponding approved specification.

**Exceptions**:
- Critical hotfixes (restore service immediately, document later)
- Trivial changes (typos, comments, formatting)

---

## Spec Kit Commands

When Spec Kit is available, prioritize using these commands:

| Command | Description |
|---------|-------------|
| `/sdd create <title>` | Create a new specification |
| `/sdd list` | List all active specifications |
| `/sdd show <id>` | Display specification details |
| `/sdd approve <id>` | Mark specification as approved |
| `/sdd close <id>` | Close completed specification |
| `/sdd archive <id>` | Archive specification |

### Command Priority

**Rule**: Always prefer Spec Kit commands over manual file editing.

**Rationale**:
- **Consistency**: Ensures spec structure follows the schema
- **Traceability**: Automatic ID generation and linking
- **Validation**: Built-in checks prevent invalid states

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

| Stage | Description | Action |
|-------|-------------|--------|
| **Proposal** | Define what to change and why | `/sdd create` |
| **Review** | Stakeholder approval | `/sdd approve` |
| **Implementation** | Execute the approved spec | Code changes |
| **Verification** | Confirm implementation matches spec | Testing |
| **Archive** | Close and archive the spec | `/sdd close` |

---

## Before Any Task

**Context Checklist**:
- [ ] Check for active specifications: `/sdd list`
- [ ] Review relevant specs before making changes
- [ ] Verify no conflicting specs exist
- [ ] Create spec if change is non-trivial

**Skip Spec For**:
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes

---

## Spec Document Template

When creating specifications manually, use this structure:

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

## Integration with Universal Doc Standards

### Commit Messages

Reference spec IDs in commit messages:

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### Code Review

Reviewers should verify:
- [ ] Change matches approved spec
- [ ] No scope creep beyond spec
- [ ] Spec acceptance criteria met

---

## Best Practices

### Do's
- Keep specs focused and atomic (one change per spec)
- Include clear acceptance criteria
- Link specs to implementation PRs
- Archive specs after completion

### Don'ts
- Start coding before spec approval
- Modify scope during implementation without updating spec
- Leave specs in limbo (always close or archive)
- Skip verification step

---

## Related Standards

- [Spec-Driven Development](../../core/spec-driven-development.md) - SDD methodology
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit conventions
- [Code Check-in Standards](../../core/checkin-standards.md) - Check-in requirements

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-30 | Initial Spec Kit integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
