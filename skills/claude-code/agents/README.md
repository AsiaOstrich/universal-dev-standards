# UDS Agents

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/agents/README.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-20
**Status**: Stable

---

## Overview

UDS Agents are specialized AI subagents that can be orchestrated to handle complex development workflows. Unlike Skills (which provide context/knowledge), Agents are autonomous entities that can execute multi-step tasks.

## AGENT.md Format Specification

### Frontmatter Schema

```yaml
---
# === REQUIRED FIELDS ===
name: agent-name              # Unique identifier (kebab-case)
version: 1.0.0                # Semantic version
description: |                # Multi-line description for AI matching
  Brief description of the agent's purpose.
  Keywords: keyword1, keyword2, keyword3.

# === ROLE CONFIGURATION ===
role: specialist              # orchestrator | specialist | reviewer
expertise:                    # Domain expertise areas
  - system-design
  - api-design
  - database-modeling

# === TOOL PERMISSIONS (Claude Code Task tool) ===
# Specify which tools this agent can use
allowed-tools:
  - Read                      # File reading
  - Glob                      # Pattern matching
  - Grep                      # Content search
  - Bash(git:*)               # Git commands only
  - WebFetch                  # Web fetching
  - WebSearch                 # Web search
disallowed-tools:             # Explicitly blocked tools
  - Write                     # No file writing
  - Edit                      # No file editing

# === SKILL DEPENDENCIES ===
# Skills that provide context/knowledge to this agent
skills:
  - spec-driven-dev           # Skill name reference
  - testing-guide

# === MODEL PREFERENCES (Claude Code only) ===
model: claude-sonnet-4-20250514  # Preferred model
temperature: 0.3              # Response creativity (0.0-1.0)

# === TRIGGER CONDITIONS ===
triggers:
  keywords:                   # Auto-activate on these keywords
    - architecture
    - system design
    - 架構設計
  commands:                   # Slash commands that invoke this agent
    - /architect
---
```

### Role Types

| Role | Description | Use Case |
|------|-------------|----------|
| `orchestrator` | Coordinates multiple agents | Complex workflows, feature development |
| `specialist` | Deep expertise in specific domain | Architecture, testing, documentation |
| `reviewer` | Evaluates and provides feedback | Code review, spec review, PR review |

### Tool Permission Patterns

```yaml
# Full tool access (default if not specified)
allowed-tools: [*]

# Read-only agent
allowed-tools: [Read, Glob, Grep]
disallowed-tools: [Write, Edit, Bash]

# Git-only bash access
allowed-tools:
  - Bash(git:*)     # Only git commands
  - Bash(npm:test)  # Only npm test

# Specific file patterns
allowed-tools:
  - Write(*.md)     # Only markdown files
  - Edit(src/**)    # Only src directory
```

### Cross-Tool Execution Modes

| AI Tool | Execution Mode | How It Works |
|---------|---------------|--------------|
| Claude Code | `task` | Uses Task tool to spawn independent subagent |
| OpenCode | `task` | Similar Task tool support |
| Cursor / Windsurf | `inline` | Injects AGENT.md as context prefix |
| Copilot / Gemini | `inline` | Converts to prompt snippets |

## Built-in Agents

| Agent | Role | Description |
|-------|------|-------------|
| [code-architect](./code-architect.md) | specialist | Software architecture and system design |
| [test-specialist](./test-specialist.md) | specialist | Testing strategy and test implementation |
| [reviewer](./reviewer.md) | reviewer | Code review and quality assessment |
| [doc-writer](./doc-writer.md) | specialist | Documentation and technical writing |
| [spec-analyst](./spec-analyst.md) | specialist | Specification analysis and requirement extraction |

## Usage

### CLI Installation

```bash
# List available agents
uds agent list

# Install specific agent to project
uds agent install code-architect

# Install all agents
uds agent install --all

# Install to user directory (global)
uds agent install code-architect --global
```

### Direct Invocation in Claude Code

```
/architect [task description]
```

Or through natural language triggers:

```
Please help me design the architecture for a new authentication system.
```

## Creating Custom Agents

### 1. Create AGENT.md File

```bash
# In your project
mkdir -p .claude/agents
touch .claude/agents/my-agent.md
```

### 2. Define Frontmatter

```yaml
---
name: my-custom-agent
version: 1.0.0
description: |
  Custom agent for specific project needs.
  Keywords: custom, specific, project.

role: specialist
expertise: [domain-specific]

allowed-tools: [Read, Glob, Grep, Edit]
skills: [relevant-skill]

triggers:
  commands: [/myagent]
---
```

### 3. Write Agent Instructions

```markdown
# My Custom Agent

## Purpose

Describe what this agent does.

## Workflow

1. Step one
2. Step two
3. Step three

## Guidelines

- Guideline 1
- Guideline 2
```

## Agent vs Skill Comparison

| Aspect | Skill | Agent |
|--------|-------|-------|
| **Purpose** | Provide knowledge/context | Execute autonomous tasks |
| **Execution** | Loaded as context | Spawned as subagent (or inline) |
| **State** | Stateless | Can maintain task state |
| **Tool Access** | None (context only) | Configurable permissions |
| **Triggers** | Manual loading | Keywords, commands, workflows |
| **Composition** | Referenced by agents | Can use skills as context |

## Integration with Workflows

Agents can be orchestrated through workflow definitions:

```yaml
# workflows/feature-dev.workflow.yaml
name: feature-development
steps:
  - agent: spec-analyst
    task: Analyze requirements
  - agent: code-architect
    task: Design solution
  - agent: test-specialist
    task: Define test strategy
  - manual: Implementation
  - agent: reviewer
    task: Code review
```

See [workflows/README.md](../workflows/README.md) for workflow documentation.

---

## Related Resources

- [Skills Documentation](../README.md)
- [Workflows Documentation](../workflows/README.md)
- [AI Agent Paths Configuration](../../../cli/src/config/ai-agent-paths.js)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-20 | Initial release |

---

## License

This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
