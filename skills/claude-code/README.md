# Claude Code Skills

Claude Code Skills for software development standards.

> Derived from [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) core standards.

## Overview

These skills are automatically triggered based on context when using Claude Code, helping you:

- Prevent AI hallucination with evidence-based responses
- Write consistent, well-formatted commit messages
- Conduct thorough code reviews
- Follow testing best practices
- Manage releases with semantic versioning

## Available Skills

| Skill | Description | Triggers |
|-------|-------------|----------|
| `ai-collaboration-standards` | Prevent AI hallucination | Code analysis, "certainty" |
| `commit-standards` | Conventional Commits format | "commit", git operations |
| `code-review-assistant` | Systematic code review | "review", "PR" |
| `testing-guide` | Testing pyramid | Writing tests |
| `release-standards` | Semantic versioning | Release preparation |
| `git-workflow-guide` | Branching strategies | "branch", "merge" |
| `documentation-guide` | Documentation structure | "README", "docs" |
| `requirement-assistant` | Requirement writing | "requirement", "user story" |

## Installation

### Quick Install (All Skills)

```bash
./install.sh
```

### Manual Install (Select Skills)

```bash
mkdir -p ~/.claude/skills
cp -r ai-collaboration-standards ~/.claude/skills/
cp -r commit-standards ~/.claude/skills/
```

### Project-Level Installation

```bash
mkdir -p .claude/skills
cp -r /path/to/skills/claude-code/* .claude/skills/
```

## Configuration

Skills support project-specific configuration through `CONTRIBUTING.md`.

### Disable Skills

Add to your project's `CONTRIBUTING.md`:

```markdown
## Disabled Skills

- testing-guide
- release-standards
```

### Configuration Template

See [CONTRIBUTING.template.md](CONTRIBUTING.template.md) for complete configuration options.

## Skill Priority

When the same skill exists in both locations:
1. **Project level** (`.claude/skills/`) takes precedence
2. **Global level** (`~/.claude/skills/`) is fallback

## License

Dual-licensed: CC BY 4.0 (documentation) + MIT (code)
