# GitHub Copilot Instructions

GitHub Copilot instructions derived from universal-dev-standards.

## Status

✅ **Complete** - Ready to use

## Quick vs Full Version

| Version | Location | Content |
|---------|----------|---------|
| **Quick** (this folder) | `skills/copilot/` | Essential standards only |
| **Full** | `integrations/github-copilot/` | Complete standards + Chat reference + Skills mapping |

**Recommendation**: Use the Full version from `integrations/github-copilot/` for comprehensive coverage.

## Installation

### Option 1: Quick Version (This Folder)

```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

### Option 2: Full Version (Recommended)

```bash
mkdir -p .github
cp integrations/github-copilot/copilot-instructions.md .github/copilot-instructions.md
```

### Option 3: Download via curl

```bash
mkdir -p .github
# Full version (recommended)
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/github-copilot/copilot-instructions.md
```

## What's Included

### Quick Version (This Folder)

- Commit Messages - Conventional Commits format
- Code Quality - Naming and structure guidelines
- Security - Input validation and injection prevention
- Testing - AAA pattern and FIRST principles
- Documentation - API documentation standards
- Git - Branch naming conventions
- AI Collaboration - Best practices

### Full Version (integrations/github-copilot/)

All of the above, plus:

- **TDD Guidelines** - Red-Green-Refactor cycle, FIRST principles
- **Test Coverage** - 7 dimensions framework
- **Code Review** - 10-category checklist, comment prefixes
- **Pre-commit Checklist** - Quality gates
- **Requirement Writing** - INVEST criteria, user story format
- **SDD Priority** - Spec-Driven Development rules
- **Chat Reference** - Prompt templates for Copilot Chat
- **Skills Mapping** - Claude Code skills equivalents

## Additional Resources

See `integrations/github-copilot/` for:

- `README.md` - Complete documentation
- `copilot-instructions.md` - Full version instructions
- `COPILOT-CHAT-REFERENCE.md` - Chat prompt templates
- `skills-mapping.md` - Claude Code skills mapping

## Structure

```
skills/copilot/
├── copilot-instructions.md  # Quick version instructions
└── README.md                # This file

integrations/github-copilot/
├── README.md                # Full documentation
├── copilot-instructions.md  # Full version instructions
├── COPILOT-CHAT-REFERENCE.md # Chat prompts
└── skills-mapping.md        # Skills mapping
```

## Version

- **Version**: 2.0.0
- **Last Updated**: 2026-01-13
- **Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)

## License

CC BY 4.0
