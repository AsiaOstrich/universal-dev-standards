# [AGENT-00] Agent Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: AGENT-00

---

## Summary

The `uds agent` command group manages AI agent definitions, including listing available agents, installing agent configurations, and viewing agent information.

---

## Command Synopsis

```bash
uds agent <subcommand> [options]

Subcommands:
  list                   List available agents
  install <agent>        Install agent definition
  info <agent>           Show agent information

Options:
  --location <loc>       Installation location (project, user)
  --tool <tool>          Target AI tool
  -y, --yes              Non-interactive mode
  -h, --help             Display help
```

---

## Subcommands

### agent list

List available agent definitions.

```
📋 Available UDS Agents

┌──────────────────────┬─────────────────────────────────────────────┬─────────────┐
│ Agent                │ Description                                 │ Status      │
├──────────────────────┼─────────────────────────────────────────────┼─────────────┤
│ code-reviewer        │ Reviews code for bugs and best practices    │ Not installed│
│ pr-reviewer          │ Comprehensive PR review agent               │ Installed   │
│ test-writer          │ Generates test cases for code               │ Not installed│
│ doc-writer           │ Generates documentation                     │ Not installed│
└──────────────────────┴─────────────────────────────────────────────┴─────────────┘

4 agents available, 1 installed
```

### agent info

Show detailed information about an agent.

```
📖 Agent: code-reviewer

Description:
  Reviews code for bugs, security vulnerabilities, and adherence to
  project standards. Uses confidence-based filtering to report only
  high-priority issues.

Supported Tools:
  • Claude Code ✓
  • OpenCode ✗ (no agent support)

Files:
  • AGENT.md (main definition)
  • examples/review-output.md
  • templates/review-template.md

Installation:
  uds agent install code-reviewer --tool claude-code
```

### agent install

Install an agent definition.

See: [AGENT-01 Agent Installation](01-agent-installation.md)

---

## Agent Definition Structure

```
agents/
└── code-reviewer/
    ├── AGENT.md              # Main agent definition
    ├── README.md             # Agent documentation
    └── examples/             # Example usage
        └── example.md
```

### AGENT.md Format

```markdown
# Code Reviewer Agent

## Description
Reviews code for bugs, security vulnerabilities, and best practices.

## Trigger
When user asks to review code or mentions "code review".

## Capabilities
- Bug detection
- Security analysis
- Style checking
- Performance suggestions

## Instructions
[Detailed agent instructions...]
```

---

## Acceptance Criteria

- [ ] Lists all available agents with status
- [ ] Shows detailed agent information
- [ ] Filters by supported tool
- [ ] Handles missing agents gracefully

---

## Related Specifications

- [AGENT-01 Agent Installation](01-agent-installation.md)
- [SHARED-06 AI Agent Paths](../shared/ai-agent-paths.md)
