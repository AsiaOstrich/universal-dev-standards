# Shared Resources

Shared templates and utilities for generating AI tool-specific rules from core standards.

## Purpose

This directory contains:
- **Templates**: Common patterns used across different AI tools
- **Utilities**: Scripts for generating tool-specific configurations
- **Mappings**: Standard-to-rule mappings for each AI assistant

## Core Standards Mapping

| Core Standard | Skill Concept | Description |
|---------------|---------------|-------------|
| `anti-hallucination.md` | AI Collaboration | Evidence-based responses, certainty tags |
| `commit-message-guide.md` | Commit Standards | Conventional Commits format |
| `code-review-checklist.md` | Code Review | Review checklists and patterns |
| `git-workflow.md` | Git Workflow | Branching strategies |
| `testing-standards.md` | Testing Guide | Testing pyramid, coverage |
| `versioning.md` | Release Standards | Semantic versioning |
| `documentation-structure.md` | Documentation | README templates, structure |

## AI Tool Compatibility Matrix

| Feature | Claude Code | Cursor | Windsurf | Cline | Copilot |
|---------|-------------|--------|----------|-------|---------|
| Skills/Rules | ✅ SKILL.md | ✅ .cursorrules | ✅ .windsurfrules | ✅ .clinerules | ✅ instructions.md |
| Auto-trigger | ✅ | ❌ | ❌ | ❌ | ❌ |
| Project-level | ✅ | ✅ | ✅ | ✅ | ✅ |
| Global-level | ✅ | ✅ | ✅ | ✅ | ❌ |
| Notepads | ❌ | ✅ | ❌ | ❌ | ❌ |

## Usage

```bash
# Generate rules for a specific tool
./generate.sh cursor

# Generate rules for all tools
./generate.sh all
```

## Contributing

When adding new core standards:
1. Add entry to the mapping table above
2. Create templates in `templates/`
3. Update generation scripts
4. Test with each supported AI tool
