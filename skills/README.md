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

**Recommended: Plugin Marketplace**
```bash
# Add the marketplace (one-time setup)
/plugin marketplace add AsiaOstrich/universal-dev-standards

# Install the plugin with all skills
/plugin install universal-dev-standards@asia-ostrich
```

**Alternative: Manual Copy (macOS / Linux)**
```bash
mkdir -p ~/.claude/skills
cp -r skills/claude-code/commit-standards ~/.claude/skills/
```

**Alternative: Manual Copy (Windows PowerShell)**
```powershell
# Copy specific skills
Copy-Item -Recurse skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

### Cursor

**macOS / Linux:**
```bash
cp skills/cursor/.cursorrules .cursorrules
```

**Windows PowerShell:**
```powershell
Copy-Item skills\cursor\.cursorrules .cursorrules
```

### Windsurf

**macOS / Linux:**
```bash
cp skills/windsurf/.windsurfrules .windsurfrules
```

**Windows PowerShell:**
```powershell
Copy-Item skills\windsurf\.windsurfrules .windsurfrules
```

### Cline

**macOS / Linux:**
```bash
cp skills/cline/.clinerules .clinerules
```

**Windows PowerShell:**
```powershell
Copy-Item skills\cline\.clinerules .clinerules
```

### GitHub Copilot

**macOS / Linux:**
```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path .github
Copy-Item skills\copilot\copilot-instructions.md .github\copilot-instructions.md
```

## Available Skills

| Skill | Description | Claude Code | Cursor | Windsurf | Cline | Copilot |
|-------|-------------|:-----------:|:------:|:--------:|:-----:|:-------:|
| AI Collaboration | Prevent hallucination | ✅ | ✅ | ✅ | ✅ | ✅ |
| Changelog Guide | Changelog writing | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Code Review | Review checklists | ✅ | ✅ | ✅ | ✅ | ✅ |
| Commit Standards | Conventional Commits | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documentation | README templates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Error Code Guide | Error code standards | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Git Workflow | Branching strategies | ✅ | ✅ | ✅ | ✅ | ✅ |
| Logging Guide | Logging best practices | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Project Structure | Directory conventions | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Release Standards | Semantic versioning | ✅ | ✅ | ✅ | ✅ | ✅ |
| Requirements | User story guidance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Spec-Driven Dev | SDD methodology | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Test Coverage | Coverage analysis | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Testing Guide | Testing best practices | ✅ | ✅ | ✅ | ✅ | ✅ |

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
