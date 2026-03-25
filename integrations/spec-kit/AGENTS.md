# Spec Kit Instructions

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/spec-kit/AGENTS.md) | [简体中文](../../locales/zh-CN/integrations/spec-kit/AGENTS.md)

**Version**: 1.1.0
**Last Updated**: 2026-03-23

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

### CLI Commands

| Command | Description |
|---------|-------------|
| `specify init <project-name>` | Initialize a new SDD project |
| `specify check` | Verify installed tools (git, AI agents) |

**Init Options:**

| Flag | Description |
|------|-------------|
| `--ai <agent>` | Select AI assistant (claude, gemini, copilot, cursor-agent, windsurf, etc.) |
| `--ai-skills` | Install as agent skills instead of slash commands |
| `--here` | Initialize in current directory |
| `--force` | Skip confirmation when merging |
| `--script ps` | PowerShell scripts (Windows/cross-platform) |
| `--no-git` | Skip git repository initialization |
| `--debug` | Enable detailed output |
| `--branch-numbering timestamp` | Use timestamp-based branch names |

### Slash Commands (Workflow)

When Spec Kit is available, use these slash commands for the SDD workflow:

| Command | Stage | Description |
|---------|-------|-------------|
| `/constitution` | Setup | Establish project governing principles |
| `/specify` | Proposal | Define requirements and user stories |
| `/clarify` | Discuss | Resolve specification ambiguities with structured questions |
| `/plan` | Design | Create technical implementation plans |
| `/tasks` | Planning | Generate actionable task breakdowns |
| `/analyze` | Review | Check cross-artifact consistency |
| `/implement` | Implementation | Execute tasks to build features |

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
│ Constitution │───▶│   Specify    │───▶│   Clarify    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                    ┌──────────────┐    ┌───────▼──────┐
                    │  Implement   │◀───│  Plan/Tasks  │
                    └──────────────┘    └──────────────┘
                           │
                    ┌──────▼───────┐
                    │   Analyze    │
                    └──────────────┘
```

### Workflow Stages

| Stage | Description | Command |
|-------|-------------|---------|
| **Constitution** | Define project governing principles | `/constitution` |
| **Specify** | Define requirements and user stories | `/specify` |
| **Clarify** | Resolve ambiguities with structured questions | `/clarify` |
| **Plan** | Create technical implementation plans | `/plan` |
| **Tasks** | Generate actionable task breakdowns | `/tasks` |
| **Implement** | Execute tasks to build features | `/implement` |
| **Analyze** | Check consistency across artifacts | `/analyze` |

---

## Workflow Enforcement Gates

**CRITICAL**: Before executing any workflow phase, you MUST check prerequisites.

### Phase Gates

| Phase | Prerequisite | On Failure |
|-------|-------------|------------|
| Specify | Constitution established (if first time) | → `/constitution` first |
| Plan | Requirements defined via `/specify` | → `/specify` first |
| Implement | Plan approved, tasks generated | → `/plan` then `/tasks` first |
| Commit (feat/fix) | Check active specs | → Suggest `Refs: SPEC-XXX` |

### Session Start Protocol
At session start, check for active workflows: look for `.specify/` directory or active spec files.
If active workflows found → inform user and offer to resume.

Reference: `.standards/workflow-enforcement.ai.yaml`

---

## Before Any Task

**Context Checklist**:
- [ ] Check for active specifications: look for `.specify/` directory
- [ ] Review relevant specs before making changes
- [ ] Verify no conflicting specs exist
- [ ] Create spec if change is non-trivial

**Skip Spec For**:
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes

---

## Directory Structure

```
.specify/
├── templates/                    # Core spec-kit templates
├── extensions/
│   └── <ext-id>/templates/      # Extension templates
├── presets/
│   └── <preset-id>/templates/   # Preset customizations
└── templates/overrides/          # Project-local overrides (highest priority)
```

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

## Integration with Universal Dev Standards

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
- Use `/analyze` to verify consistency
- Archive specs after completion

### Don'ts
- Start coding before spec approval
- Modify scope during implementation without updating spec
- Leave specs in limbo (always close or archive)
- Skip the `/clarify` step when requirements are ambiguous

---

## Related Standards

- [Spec-Driven Development](../../core/spec-driven-development.md) - SDD methodology
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit conventions
- [Code Check-in Standards](../../core/checkin-standards.md) - Check-in requirements

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
| 1.1.0 | 2026-03-23 | Updated to reflect Spec Kit v0.4.0 actual CLI commands and slash commands |
| 1.0.0 | 2025-12-30 | Initial Spec Kit integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
