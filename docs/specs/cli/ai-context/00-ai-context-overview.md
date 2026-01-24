# [AICONTEXT-00] AI-Context Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: AICONTEXT-00

---

## Summary

The `uds ai-context` command group manages `.ai-context.yaml` files for defining AI-friendly project architecture, including module definitions, boundaries, and dependency graphs.

---

## Command Synopsis

```bash
uds ai-context <subcommand> [options]

Subcommands:
  init                   Generate .ai-context.yaml
  validate               Validate configuration
  graph                  Display module dependency graph

Options:
  --format <format>      Output format (yaml, json)
  --depth <depth>        Graph depth level
  -h, --help             Display help
```

---

## Subcommands

### ai-context init

Generate `.ai-context.yaml` from project structure.

See: [AICONTEXT-01 Config Generation](01-config-generation.md)

### ai-context validate

Validate existing `.ai-context.yaml` configuration.

```
🔍 Validating .ai-context.yaml...

✓ Schema valid
✓ All referenced paths exist
✓ No circular dependencies
⚠ Module 'utils' has no boundary definition

Result: Valid with warnings (1 warning)
```

### ai-context graph

Display module dependency graph.

```
🔗 Module Dependency Graph

src/
├── core/
│   ├── manifest.js ──────┐
│   ├── hasher.js ◄───────┤
│   └── copier.js ◄───────┘
│       │
│       ▼
├── commands/
│   ├── init.js ◄─────────┐
│   ├── check.js ◄────────┤
│   └── update.js ◄───────┘
│       │
│       ▼
└── prompts/
    └── init.js

Legend: ──▶ depends on
```

---

## .ai-context.yaml Structure

```yaml
version: "1.0"
project:
  name: "my-project"
  description: "Project description"

modules:
  - name: "core"
    path: "src/core/"
    description: "Core utilities and shared logic"
    boundary: "internal"
    exports:
      - manifest.js
      - hasher.js
      - copier.js
    dependencies:
      - "config"

  - name: "commands"
    path: "src/commands/"
    description: "CLI command implementations"
    boundary: "internal"
    dependencies:
      - "core"
      - "prompts"

boundaries:
  internal:
    description: "Internal modules, not for external use"
    access: "private"
  public:
    description: "Public API modules"
    access: "public"
```

---

## Validation Rules

| Rule | Description |
|------|-------------|
| Schema | YAML must match expected schema |
| Paths | All referenced paths must exist |
| Dependencies | Referenced modules must be defined |
| Circular | No circular dependencies allowed |
| Boundaries | All modules should have boundary definitions |

---

## Acceptance Criteria

- [ ] Generates valid .ai-context.yaml from project
- [ ] Validates configuration against schema
- [ ] Detects circular dependencies
- [ ] Displays dependency graph
- [ ] Warns about missing definitions

---

## Related Specifications

- [AICONTEXT-01 Config Generation](01-config-generation.md)
