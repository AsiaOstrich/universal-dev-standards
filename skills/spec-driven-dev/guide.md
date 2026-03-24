---
scope: universal
description: |
  Guide Spec-Driven Development (SDD) workflow for planning changes before implementation.
  Use when: creating specs, proposals, planning features, using OpenSpec or similar tools.
  Keywords: spec, specification, SDD, proposal, openspec, spec-kit, design doc, 規格, 提案, 設計文件.
---

# Spec-Driven Development Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/spec-driven-dev/SKILL.md)

**Version**: 1.2.0
**Last Updated**: 2026-03-23
**Applicability**: Claude Code Skills

---

## Purpose

This skill guides you through Spec-Driven Development (SDD), ensuring changes are planned, documented, and approved before implementation.

## Session Start Protocol

At the start of each session:

1. **Check for active specs**: Search `docs/specs/`, `specs/`, `openspec/changes/`, or `.specify/` for in-progress work
2. **If active specs found** → Inform user and offer to resume
3. **Review context** before starting new work

## Quick Reference

### SDD Workflow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Discuss    │───▶│   Proposal   │───▶│    Review    │───▶│Implementation│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                   │
                                                                   ▼
                                        ┌──────────────┐    ┌──────────────┐
                                        │   Archive    │◀───│ Verification │
                                        └──────────────┘    └──────────────┘
```

### Workflow Stages

| Stage | Description | Output |
|-------|-------------|--------|
| **Discuss** | Capture gray areas, lock scope, build read_first list | Scope definition, canonical refs |
| **Proposal** | Define what to change and why | `proposal.md` |
| **Review** | Stakeholder approval | Approval record |
| **Implementation** | Execute approved spec | Code, tests, docs |
| **Verification** | Confirm implementation matches spec (max 3 iterations) | Test results, traceability matrix |
| **Archive** | Close and archive | Archived spec with links |

### Workflow Enforcement Gates

**CRITICAL**: Before executing any workflow phase, you MUST check prerequisites.

| Phase | Prerequisite | On Failure |
|-------|-------------|------------|
| Proposal | Discuss completed, scope locked | → Complete Discuss stage first |
| Implementation | Spec status = Approved | → Get approval first |
| Verification | All ACs have code + tests | → Complete implementation first |
| Commit (feat/fix) | Check active specs | → Suggest spec reference (Refs: SPEC-XXX) |
| Archive | All tasks completed, verified | → Complete remaining tasks |

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Evaluate First** | Assess scope and sync needs before creating spec |
| **Spec First** | No functional changes without approved spec |
| **Tool Priority** | Use SDD tool commands when available |
| **Methodology > Tooling** | SDD works with any tool or manual process |
| **Bidirectional Sync** | Changes propagate to all related artifacts |
| **Simplicity First** | Choose the simplest solution that works |

### Pre-Spec Evaluation

Before creating a specification, answer these questions:

| Question | Options | Result |
|----------|---------|--------|
| **Scope?** | Project-specific / Universal | Determines if Core Standard needed |
| **Interactive?** | Yes / No | Determines if Skill needed |
| **User-triggered?** | Yes / No | Determines if Command needed |

### Before Creating Specs

- Always check if a similar spec already exists in the project
- Search existing specs directory before creating new ones
- Prefer modifying existing specs over creating duplicates
- If request is ambiguous, ask 1-2 clarifying questions before proceeding

### Exceptions to "Spec First"

- Critical hotfixes (restore service immediately, document later)
- Trivial changes (typos, comments, formatting)
- Dependency updates (non-breaking)
- Configuration changes

## Detailed Stage Guidelines

### Discuss Stage

The Discuss stage ensures all ambiguities are resolved before writing a spec.

#### 1. Establish Governing Principles

Define project conventions, constraints, and non-negotiables upfront:

- What are the project's core architectural decisions?
- What are the non-negotiable constraints (performance, security, compatibility)?
- Document in `project.md`, `CONTRIBUTING.md`, or equivalent

#### 2. Structured Clarification

List all ambiguous points as explicit questions and resolve each before proceeding:

```markdown
## Clarification Log

| # | Question | Options | Decision | Rationale |
|---|----------|---------|----------|-----------|
| 1 | Auth method? | OAuth2 / JWT / Session | OAuth2 | Industry standard, SSO support |
| 2 | Token storage? | Cookie / LocalStorage | HttpOnly Cookie | XSS protection |
```

#### 3. Lock Scope

- Define what is IN scope and what is OUT of scope
- Identify related specs that may be affected
- Build a `read_first` list of files/specs to review

### Implementation Stage

Follow a structured approach during implementation:

1. **Read proposal/spec thoroughly** — Understand all requirements and AC
2. **Create tasks checklist** — Break down into sequential tasks (in `tasks.md` or within the spec)
3. **Implement tasks sequentially** — Complete each task in order
4. **Update checklist after each completion** — Mark tasks as done
5. **Do NOT skip to next phase** until all tasks are completed

### Requirement Wording

Use precise language in specifications:

| Keyword | Meaning | Usage |
|---------|---------|-------|
| **SHALL/MUST** | Mandatory requirement | "The system SHALL validate input" |
| **SHOULD** | Recommended practice | "The API SHOULD return within 200ms" |
| **MAY** | Optional feature | "The UI MAY display a loading spinner" |

Avoid ambiguous words: "should try", "might need", "could possibly"

## Simplicity First

### Default Principles

- Default to <100 lines of new code per change
- Single-file implementations until proven insufficient
- Avoid frameworks without clear justification
- Choose boring, proven patterns over novel approaches

### Complexity Triggers

Only add complexity when you have concrete evidence:

| Trigger | Evidence Required |
|---------|-------------------|
| Performance optimization | Profiling data showing bottleneck |
| Abstraction layer | 3+ concrete use cases requiring it |
| External dependency | Clear justification over built-in solution |
| Multi-service split | Scale requirements (>1000 users, >100MB data) |

## Naming Conventions

### Spec IDs

- Format: `SPEC-NNN` (e.g., `SPEC-001`, `SPEC-042`)
- Sequential within the project

### Change IDs

- Format: kebab-case, verb-led
- Prefixes: `add-`, `update-`, `remove-`, `refactor-`
- Examples: `add-two-factor-auth`, `update-payment-flow`, `remove-legacy-api`

### Capability Names

- Format: verb-noun (e.g., `user-auth`, `payment-capture`)
- Single purpose per capability
- 10-minute understandability rule: if it takes longer to understand, split it
- Split if description needs "AND"

## Proposal Template

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

## Detailed Guidelines

For complete standards, see:
- [Spec-Driven Development Standards](../../core/spec-driven-development.md)

### AI-Optimized Format (Token-Efficient)

For AI assistants, use the YAML format files for reduced token usage:
- Base standard: `ai/standards/spec-driven-development.ai.yaml`

## Integration with Other Standards

### With Commit Messages

Reference spec ID in commit messages:

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### With Check-in Standards

Before checking in code for a spec:

- [ ] Spec is approved
- [ ] Implementation matches spec
- [ ] Tests cover acceptance criteria
- [ ] Spec ID referenced in PR

### With Code Review

Reviewers should verify:

- [ ] Change matches approved spec
- [ ] No scope creep beyond spec
- [ ] Spec acceptance criteria met

## Examples

### Good Practices

```markdown
# SPEC-001 Add OAuth2 Login

## Summary
Add Google OAuth2 login to allow users to sign in with their Google accounts.

## Motivation
- Reduce friction for new users
- Improve security by not storing passwords

## Acceptance Criteria
- [ ] Users can click "Sign in with Google" button
- [ ] New users are automatically registered
- [ ] Existing users are linked to Google account
```

### Bad Practices

```markdown
# Add login

Adding login.
```
- Missing spec ID
- No motivation
- No acceptance criteria

## Common SDD Tools

| Tool | Description | Key Commands |
|------|-------------|--------------|
| **OpenSpec** | Specification management CLI | `openspec list`, `openspec show`, `openspec validate`, `openspec archive` |
| **Spec Kit** | Slash-command-driven SDD | `specify init`, `/specify`, `/clarify`, `/plan`, `/tasks`, `/implement` |
| **Manual** | No tool, file-based | Create `specs/SPEC-XXX.md` manually |

> **Note**: When an SDD tool is detected in the project, prioritize using its native commands over manual file editing for consistency and traceability.

## Sync Verification

After completing a spec, verify synchronization:

### Sync Checklist

```markdown
## Sync Status

### Scope: [Universal|Project|Utility]

- [ ] Core Standard: [Created|Updated|N/A]
- [ ] Skill: [Created|Updated|N/A]
- [ ] Command: [Created|Updated|N/A]
- [ ] Translations: [Synced|Pending|N/A]
```

### Sync Matrix

| Change Origin | Sync To |
|---------------|---------|
| Core Standard | → Skills, Commands, Translations |
| Skill | → Core Standard, Commands, Translations |
| Command | → Skill, Translations |

## Best Practices

### Do's

- Evaluate scope before creating spec
- Check for existing specs before creating new ones
- Keep specs focused and atomic (one change per spec)
- Include clear acceptance criteria with Given/When/Then
- Use SHALL/MUST for normative requirements
- Link specs to implementation PRs
- Archive specs after completion
- Verify sync status before closing

### Don'ts

- Start coding before spec approval
- Skip scope evaluation or the Discuss stage
- Modify scope during implementation without updating spec
- Leave specs in limbo (always close or archive)
- Skip verification step
- Forget to sync related artifacts
- Add complexity without concrete evidence of need

---

## Configuration Detection

This skill supports project-specific configuration.

### Detection Order

1. Check for SDD tool in workspace:
   - `openspec/` directory → OpenSpec detected
   - `.specify/` directory → Spec Kit detected
   - `specs/` or `docs/specs/` → Manual file-based workflow
2. Check `CONTRIBUTING.md` for spec workflow documentation
3. If not found, **default to manual file-based workflow**

### First-Time Setup

If no configuration found:

1. Ask the user: "This project hasn't configured SDD. Would you like to set up a specs directory?"
2. Suggest documenting in `CONTRIBUTING.md`:

```markdown
## Spec-Driven Development

We use Spec-Driven Development for all non-trivial changes.

### Process
1. Create proposal in `specs/` directory
2. Get approval from team lead
3. Implement and reference spec in PR
4. Archive spec after merge

### Spec Template
See `specs/TEMPLATE.md`
```

---

## Related Standards

- [Spec-Driven Development Standards](../../core/spec-driven-development.md)
- [Commit Message Guide](../../core/commit-message-guide.md)
- [Code Review Checklist](../../core/code-review-checklist.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-23 | Added: Session Start Protocol, Workflow Enforcement Gates, Discuss Stage (Constitution + Clarify), Simplicity First, Naming Conventions, Implementation Stage enhancement, Requirement Wording, Search Guidance, updated Common SDD Tools |
| 1.1.0 | 2026-01-26 | Added: Pre-Spec Evaluation, Sync Verification, Sync Matrix, enhanced best practices |
| 1.0.0 | 2025-12-30 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
