# UDS Workflows

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/workflows/README.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-21
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

### RLM Context Configuration (v1.1.0)

Workflows can include RLM-inspired context handling for large codebases:

```yaml
# === RLM CONTEXT CONFIGURATION ===
context-strategy:
  enable-rlm: true                    # Enable RLM-aware processing
  max-context-per-step: 100000        # Maximum tokens per step
  context-inheritance: selective      # full | selective | summary

steps:
  - id: parallel-analysis
    type: parallel-agents             # NEW: Execute agent on multiple inputs
    agent: code-architect
    foreach: ${modules}               # Dynamic iteration variable
    context-mode: focused             # minimal | focused | full
    merge-strategy: aggregate         # aggregate | sequential | summary
    outputs: [analysis_results]
```

#### Context Inheritance Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `full` | Pass all previous outputs to next step | Sequential analysis |
| `selective` | Pass only specified outputs | Memory-efficient pipelines |
| `summary` | Pass summarized version of outputs | Large-scale processing |

#### Context Modes for Steps

| Mode | Description | Token Usage |
|------|-------------|-------------|
| `minimal` | Only essential context | Low |
| `focused` | Context relevant to current item | Medium |
| `full` | Complete available context | High |

#### Merge Strategies for Parallel Results

| Strategy | Description | Output Format |
|----------|-------------|---------------|
| `aggregate` | Combine all results into array | Array of results |
| `sequential` | Maintain processing order | Ordered list |
| `summary` | AI-generated summary of all results | Single summary |

### Step Types

| Type | Description | Execution |
|------|-------------|-----------|
| `agent` | Executed by a UDS agent | Automatic |
| `manual` | Requires human intervention | Interactive |
| `conditional` | Branching based on conditions | Depends on condition |
| `parallel-agents` | Execute agent on multiple inputs concurrently | Parallel (v1.1.0) |

#### Parallel-Agents Step Configuration (v1.1.0)

```yaml
- id: parallel-module-analysis
  name: Analyze Modules in Parallel
  type: parallel-agents
  agent: code-architect
  foreach: ${modules}           # Variable containing items to iterate
  context-mode: focused         # minimal | focused | full
  merge-strategy: aggregate     # How to combine results
  max-concurrent: 3             # Optional: limit concurrent executions
  timeout: 300                  # Optional: timeout per item (seconds)
  inputs:                       # Optional: additional inputs
    - project_context
  outputs:
    - module_analysis_results
```

## Built-in Workflows

| Workflow | Steps | Description |
|----------|-------|-------------|
| [integrated-flow](./integrated-flow.workflow.yaml) | 8 | Complete ATDD → SDD → BDD → TDD cycle |
| [feature-dev](./feature-dev.workflow.yaml) | 6 | Feature development workflow |
| [code-review](./code-review.workflow.yaml) | 4 | Comprehensive code review workflow |
| [large-codebase-analysis](./large-codebase-analysis.workflow.yaml) | 4 | RLM-enhanced workflow for analyzing 50+ file projects |

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
| 1.1.0 | 2026-01-21 | Added RLM context configuration, parallel-agents step type, large-codebase-analysis workflow |
| 1.0.0 | 2026-01-20 | Initial release |

---

## License

This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
