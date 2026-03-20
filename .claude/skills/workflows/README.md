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

## Wave-Based Parallel Execution (v1.2.0)

Steps within a workflow can be grouped into **waves** for parallel execution. Steps in the same wave are independent and can be executed concurrently by different sub-agents. Waves execute sequentially — all steps in wave N must complete before wave N+1 starts.

### Wave Configuration

```yaml
steps:
  # Wave 1: Independent analysis steps (run in parallel)
  - id: analyze-requirements
    name: Analyze Requirements
    type: agent
    agent: spec-analyst
    wave: 1
    outputs: [requirements_analysis]

  - id: analyze-architecture
    name: Analyze Architecture
    type: agent
    agent: code-architect
    wave: 1
    outputs: [architecture_analysis]

  # Wave 2: Depends on wave 1 outputs (barrier point)
  - id: design
    name: Design Solution
    type: agent
    agent: code-architect
    wave: 2
    inputs: [requirements_analysis, architecture_analysis]
    outputs: [design_doc]

  # Manual steps are automatic barrier points
  - id: review
    name: Review Design
    type: manual
    wave: 3
```

### Wave Rules

| Rule | Description |
|------|-------------|
| **Independence** | Steps in the same wave must not depend on each other |
| **Barrier** | All steps in wave N must complete before wave N+1 starts |
| **Manual barrier** | `manual` type steps are automatic barrier points |
| **Optional field** | The `wave` field is optional; without it, steps execute sequentially |
| **Backward compatible** | Workflows without wave fields work as before |

---

## Step Validation Pipeline (v1.2.0)

Each workflow step can include two layers of validation, inspired by CrewAI's validation pipeline and DSPy's metric functions.

### Two-Layer Validation

```yaml
steps:
  - id: generate-spec
    name: Generate Specification
    type: agent
    agent: spec-analyst
    outputs: [spec_document]
    validation:
      # Layer 1: Deterministic (always runs first)
      deterministic:
        - check: file_exists
          path: "docs/specs/{{spec_id}}.md"
        - check: contains_sections
          sections: [Summary, Motivation, "Acceptance Criteria"]
        - check: ac_format
          pattern: "Given .+, When .+, Then .+"

      # Layer 2: Semantic (only runs if Layer 1 passes)
      semantic:
        - check: consistency
          description: AC covers all requirements mentioned in Motivation
        - check: completeness
          description: No TODO or placeholder sections remain
```

### Validation Rules

| Layer | Type | When to Run | On Failure |
|-------|------|-------------|------------|
| **Layer 1** | Deterministic | Always first | Stop immediately, show fix options |
| **Layer 2** | Semantic | After Layer 1 passes | Warn, suggest improvements |

**Fail-fast principle**: If deterministic validation fails, semantic checks are skipped entirely. This prevents wasting time on quality assessment of fundamentally broken output.

---

## Agent Communication Protocol (v1.2.0)

Defines how agents exchange data within a workflow.

### Three Communication Layers

| Layer | Mechanism | Description |
|-------|-----------|-------------|
| **Artifact passing** | File-based | Steps produce files as output; downstream steps read via file paths |
| **Reducer patterns** | append / replace / merge | How multiple outputs are combined |
| **Context isolation** | Clean start per step | Each agent step starts with clean context, receives only specified inputs |

### Reducer Patterns

```yaml
steps:
  - id: collect-reviews
    type: parallel-agents
    agent: reviewer
    foreach: ${modules}
    outputs: [review_results]
    reducer: append        # Collect all results into array

  - id: merge-configs
    type: agent
    agent: code-architect
    inputs: [review_results]
    reducer: merge         # Deep merge results into single object
```

| Pattern | Description | Use Case |
|---------|-------------|----------|
| `append` | Collect all results into an ordered list | Parallel reviews, multi-module analysis |
| `replace` | Later output overwrites earlier | Config overrides, latest-wins |
| `merge` | Deep merge results into single object | Combining partial analyses |

### Context Isolation

Each agent step starts with a **clean context** containing only:
1. The step's declared `inputs` (from previous step outputs)
2. The agent's skills (from AGENT.md `skills` field)
3. The workflow's shared `prerequisites`

This prevents context pollution and ensures reproducible agent behavior.

---

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
| 1.2.0 | 2026-03-17 | Added wave-based parallel execution, step validation pipeline, agent communication protocol |
| 1.1.0 | 2026-01-21 | Added RLM context configuration, parallel-agents step type, large-codebase-analysis workflow |
| 1.0.0 | 2026-01-20 | Initial release |

---

## License

This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
