# [WORKFLOW-00] Workflow Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: WORKFLOW-00

---

## Summary

The `uds workflow` command group manages workflow definitions, including listing available workflows, installing workflow configurations, and viewing workflow information.

---

## Command Synopsis

```bash
uds workflow <subcommand> [options]

Subcommands:
  list                   List available workflows
  install <workflow>     Install workflow definition
  info <workflow>        Show workflow information

Options:
  --tool <tool>          Target AI tool
  -y, --yes              Non-interactive mode
  -h, --help             Display help
```

---

## Subcommands

### workflow list

List available workflow definitions.

```
📋 Available UDS Workflows

┌──────────────────────┬─────────────────────────────────────────────┬─────────────┐
│ Workflow             │ Description                                 │ Status      │
├──────────────────────┼─────────────────────────────────────────────┼─────────────┤
│ pr-workflow          │ Complete PR review workflow                 │ Not installed│
│ release-workflow     │ Release preparation workflow                │ Installed   │
│ feature-dev          │ Feature development workflow                │ Not installed│
│ bug-fix              │ Bug fixing workflow                         │ Not installed│
└──────────────────────┴─────────────────────────────────────────────┴─────────────┘

4 workflows available, 1 installed
```

### workflow info

Show detailed information about a workflow.

```
📖 Workflow: pr-workflow

Description:
  Complete pull request review workflow including code review,
  test analysis, and comment review.

Execution Mode:
  • Guided (step-by-step prompts)

Steps:
  1. Code Review - Review code changes
  2. Test Analysis - Analyze test coverage
  3. Comment Review - Review PR comments
  4. Summary - Generate review summary

Supported Tools:
  • Claude Code ✓
  • Cline ✓
  • Roo ✓

Installation:
  uds workflow install pr-workflow --tool claude-code
```

### workflow install

Install a workflow definition.

See: [WORKFLOW-01 Workflow Installation](01-workflow-installation.md)

---

## Workflow Definition Structure

```
workflows/
└── pr-workflow/
    ├── WORKFLOW.md           # Main workflow definition
    ├── README.md             # Workflow documentation
    ├── steps/                # Step definitions
    │   ├── 01-code-review.md
    │   ├── 02-test-analysis.md
    │   └── 03-summary.md
    └── templates/            # Output templates
        └── review-template.md
```

### WORKFLOW.md Format

```markdown
# PR Workflow

## Description
Complete pull request review workflow.

## Execution Mode
guided

## Steps
1. code-review: Review code changes for quality
2. test-analysis: Analyze test coverage and gaps
3. summary: Generate comprehensive review summary

## Trigger
When user mentions "PR review" or "pull request".
```

---

## Acceptance Criteria

- [ ] Lists all available workflows with status
- [ ] Shows detailed workflow information including steps
- [ ] Filters by supported tool
- [ ] Displays execution mode (auto/guided)

---

## Related Specifications

- [WORKFLOW-01 Workflow Installation](01-workflow-installation.md)
- [SHARED-06 AI Agent Paths](../shared/ai-agent-paths.md)
