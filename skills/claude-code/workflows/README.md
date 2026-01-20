# UDS Workflows

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/workflows/README.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-20
**Status**: Experimental

---

## Overview

UDS Workflows orchestrate multiple agents to complete complex development tasks. Each workflow defines a sequence of steps, where each step can be executed by an agent or require manual intervention.

## Workflow YAML Format

### Schema

```yaml
name: workflow-name          # Unique identifier (kebab-case)
version: 1.0.0               # Semantic version
description: |               # Multi-line description
  Brief description of the workflow.

# Workflow metadata
metadata:
  author: universal-dev-standards
  category: development       # development | review | testing | documentation
  difficulty: intermediate    # beginner | intermediate | advanced
  estimated_steps: 6          # Approximate number of steps

# Prerequisites
prerequisites:
  - Project initialized with UDS
  - Git repository configured
  - AI tool with Task support (recommended)

# Steps definition
steps:
  - id: step-1
    name: Step Name
    description: What this step does
    type: agent               # agent | manual | conditional
    agent: agent-name         # Required if type=agent
    inputs:                   # Optional: what this step needs
      - user_requirements
    outputs:                  # Optional: what this step produces
      - analysis_report

  - id: step-2
    name: Manual Step
    type: manual
    description: Human intervention required
    instructions: |
      Detailed instructions for the manual step.
    checklist:
      - [ ] Item 1
      - [ ] Item 2

  - id: step-3
    name: Conditional Step
    type: conditional
    condition: analysis_report.has_issues
    then:
      agent: reviewer
      task: Review and fix issues
    else:
      skip: true

# Output artifacts
outputs:
  - name: final_report
    description: Generated documentation
    format: markdown
```

### Step Types

| Type | Description | Execution |
|------|-------------|-----------|
| `agent` | Executed by a UDS agent | Automatic |
| `manual` | Requires human intervention | Interactive |
| `conditional` | Branching based on conditions | Depends on condition |

## Built-in Workflows

| Workflow | Steps | Description |
|----------|-------|-------------|
| [integrated-flow](./integrated-flow.workflow.yaml) | 8 | Complete ATDD → SDD → BDD → TDD cycle |
| [feature-dev](./feature-dev.workflow.yaml) | 6 | Feature development workflow |
| [code-review](./code-review.workflow.yaml) | 4 | Comprehensive code review workflow |

## Usage

### CLI Installation

```bash
# List available workflows
uds workflow list

# Install specific workflow
uds workflow install integrated-flow

# Install all workflows
uds workflow install --all
```

### Execution

Workflows are executed step-by-step. For tools supporting Task tool (Claude Code, OpenCode):

```
User: Start the integrated-flow workflow for user authentication

AI: Starting Integrated Development Flow...

Step 1/8: Specification Workshop (spec-analyst)
[Agent executes analysis...]

Step 2/8: Spec Proposal (spec-analyst)
[Agent drafts proposal...]

Step 3/8: Spec Review (manual)
Please review the specification:
- [ ] Requirements are clear
- [ ] Acceptance criteria defined
- [ ] Risks identified

[User confirms...]

Step 4/8: Discovery (test-specialist)
[Agent identifies test scenarios...]

...continues...
```

### For Tools Without Task Support

Workflows are converted to guided checklists:

```markdown
## Integrated Development Flow

### Step 1: Specification Workshop
**Agent**: spec-analyst
**Task**: Analyze requirements and identify acceptance criteria

[Copy this to your AI assistant]

### Step 2: Spec Proposal
...
```

## Creating Custom Workflows

### 1. Create Workflow File

```bash
mkdir -p .claude/workflows
touch .claude/workflows/my-workflow.workflow.yaml
```

### 2. Define Workflow

```yaml
name: my-custom-workflow
version: 1.0.0
description: Custom workflow for my project

steps:
  - id: analyze
    name: Analyze Requirements
    type: agent
    agent: spec-analyst
    outputs: [requirements_doc]

  - id: implement
    name: Implementation
    type: manual
    description: Implement based on analysis

  - id: review
    name: Code Review
    type: agent
    agent: reviewer
    inputs: [code_changes]
```

## Workflow vs Agent vs Skill

| Aspect | Workflow | Agent | Skill |
|--------|----------|-------|-------|
| **Purpose** | Orchestrate multi-step processes | Execute autonomous tasks | Provide knowledge/context |
| **Composition** | Contains multiple agents | Uses skills as context | Standalone |
| **State** | Tracks progress across steps | Single task state | Stateless |
| **User Involvement** | Can include manual steps | Minimal | None |

## Best Practices

### Do's

- Break complex tasks into discrete steps
- Include manual checkpoints for critical decisions
- Define clear inputs/outputs for each step
- Use conditional steps for error handling
- Document prerequisites clearly

### Don'ts

- Don't create overly long workflows (>10 steps)
- Don't skip review/verification steps
- Don't assume all tools support automatic execution
- Don't make steps too granular

---

## Related Resources

- [Agents Documentation](../agents/README.md)
- [Skills Documentation](../README.md)
- [Methodology System](../methodology-system/SKILL.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-20 | Initial release |

---

## License

This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
