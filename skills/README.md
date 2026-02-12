# Universal Development Skills

This directory contains the reference implementations of Universal Development Standards (UDS) skills. These skills are designed to be tool-agnostic where possible, serving as the "Source of Truth" for AI coding assistants.

> Derived from [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) core standards.

## Directory Structure

```
skills/
├── commands/          # Universal Slash Command definitions (.md)
├── agents/            # Universal Agent definitions (.md)
├── workflows/         # Universal Workflow definitions (.yaml)
├── tools/             # Tool-specific adapters and configs
│   ├── cline/         # Cline (.clinerules)
│   ├── cursor/        # Cursor (.cursorrules)
│   ├── windsurf/      # Windsurf (.windsurfrules)
│   └── copilot/       # GitHub Copilot (instructions.md)
├── _shared/           # Shared templates and utilities
└── [skill-name]/      # Individual skill definitions (e.g., git-workflow-guide/)
```

## Universal Skills & Commands

These skills provide standard guidance and workflows. They can be accessed via slash commands in supporting tools (like Claude Code, OpenCode) or referenced manually.

| Skill (Folder) | Command | Description |
|----------------|---------|-------------|
| `guide` | `/guide` | [UDS] Access all standard guides |
| `checkin-assistant` | `/checkin` | [UDS] Pre-commit quality gates |
| `commit-standards` | `/commit` | [UDS] Conventional Commits format |
| `code-review-assistant` | `/review` | [UDS] Systematic code review |
| `tdd-assistant` | `/tdd` | [UDS] Test-Driven Development |
| `bdd-assistant` | `/bdd` | [UDS] Behavior-Driven Development |
| `atdd-assistant` | `/atdd` | [UDS] Acceptance Test-Driven Development |
| `release-standards` | `/release` | [UDS] Release & Changelog management |
| `documentation-guide` | `/docs` | [UDS] Documentation management |
| `requirement-assistant` | `/requirement` | [UDS] Requirement writing |
| `reverse-engineer` | `/reverse` | [UDS] Reverse engineer code |
| `forward-derivation` | `/derive` | [UDS] Derive artifacts from spec |
| `spec-driven-dev` | `/sdd` | [UDS] Spec-Driven Development |
| `test-coverage-assistant` | `/coverage` | [UDS] Test coverage analysis |
| `methodology-system` | `/methodology` | [UDS] Development methodology |
| `refactoring-assistant` | `/refactor` | [UDS] Refactoring guidance |
| `project-discovery` | `/discover` | [UDS] Assess project health and risks |
| `brainstorm-assistant` | `/brainstorm` | [UDS] Structured AI-assisted ideation |
| `changelog-guide` | `/changelog` | [UDS] Generate changelog entries |
| `docs-generator` | `/docgen` | [UDS] Generate usage documentation |

> **Note**: For reference guides (e.g., Git Workflow, Logging, Error Codes), use the `/guide` command.

## Tool Adapters

Specific configurations for various AI tools are located in `skills/tools/`.

### Claude Code / OpenCode
The files in the root of `skills/` (commands, agents, workflows) are directly compatible with Claude Code and OpenCode.

**Installation (Plugin Marketplace):**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### Cursor
Located in `skills/tools/cursor/`.
```bash
cp skills/tools/cursor/.cursorrules .cursorrules
```

### Windsurf
Located in `skills/tools/windsurf/`.
```bash
cp skills/tools/windsurf/.windsurfrules .windsurfrules
```

### Cline
Located in `skills/tools/cline/`.
```bash
cp skills/tools/cline/.clinerules .clinerules
```

### GitHub Copilot
Located in `skills/tools/copilot/`.
```bash
mkdir -p .github
cp skills/tools/copilot/copilot-instructions.md .github/copilot-instructions.md
```

## Contributing

See [CONTRIBUTING.template.md](CONTRIBUTING.template.md) for guidelines on adding new skills or supporting additional AI tools.

## License

Dual-licensed: CC BY 4.0 (documentation) + MIT (code)