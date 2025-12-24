# Skills - AI Coding Assistant Rules

This directory contains skill/rule implementations for various AI coding assistants, all derived from the core standards in this repository.

## Directory Structure

```
skills/
├── _shared/           # Shared templates and generation utilities
├── claude-code/       # Claude Code Skills (SKILL.md format)
├── cursor/            # Cursor Rules (.cursorrules, Notepads)
├── windsurf/          # Windsurf Rules (.windsurfrules)
├── cline/             # Cline Rules (.clinerules)
└── copilot/           # GitHub Copilot (copilot-instructions.md)
```

## Quick Start

### Claude Code

```bash
# Install all skills globally
cd skills/claude-code
./install.sh

# Or copy specific skills
cp -r skills/claude-code/commit-standards ~/.claude/skills/
```

### Cursor

```bash
# Copy rules to your project
cp skills/cursor/.cursorrules .cursorrules
```

### Windsurf

```bash
cp skills/windsurf/.windsurfrules .windsurfrules
```

### Cline

```bash
cp skills/cline/.clinerules .clinerules
```

### GitHub Copilot

```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

## Available Skills

| Skill | Description | Claude Code | Cursor | Windsurf | Cline | Copilot |
|-------|-------------|:-----------:|:------:|:--------:|:-----:|:-------:|
| AI Collaboration | Prevent hallucination | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Commit Standards | Conventional Commits | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Code Review | Review checklists | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Git Workflow | Branching strategies | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Testing Guide | Testing best practices | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Release Standards | Semantic versioning | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Documentation | README templates | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Requirements | User story guidance | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |

Legend: ✅ Complete | 🚧 Planned | ❌ Not Applicable

## Relationship to Core Standards

These skills are **interactive implementations** of the core standards:

```
core/anti-hallucination.md
    ↓ transforms to
skills/claude-code/ai-collaboration-standards/SKILL.md
skills/cursor/.cursorrules (AI section)
```

**Important**: Use Skills OR copy core documents — **never both** for the same standard.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on adding new skills or supporting additional AI tools.
