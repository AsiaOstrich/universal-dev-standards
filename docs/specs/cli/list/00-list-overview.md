# [LIST-00] List Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: LIST-00

---

## Summary

The `uds list` command displays available UDS standards, filtering by level, category, and format.

---

## Command Synopsis

```bash
uds list [options]

Options:
  -l, --level <level>    Filter by level (1, 2, or 3)
  -c, --category <cat>   Filter by category (core, extension, skill)
  --format <format>      Output format (table, json, simple)
  --locale <locale>      Display in locale (en, zh-TW)
  -h, --help             Display help
```

---

## Output Format

### Table Format (Default)

```
📚 Universal Development Standards

Level 1 - Essential (5 standards)
┌──────────────────────────────────┬──────────────┬─────────────────────────────────┐
│ Name                             │ Category     │ Description                     │
├──────────────────────────────────┼──────────────┼─────────────────────────────────┤
│ anti-hallucination.md            │ core         │ Prevent AI hallucinations       │
│ checkin-standards.md             │ core         │ Code check-in requirements      │
│ commit-message-guide.md          │ core         │ Commit message conventions      │
│ code-review-checklist.md         │ core         │ Code review guidelines          │
│ ai-instruction-standards.md      │ core         │ AI instruction best practices   │
└──────────────────────────────────┴──────────────┴─────────────────────────────────┘

Level 2 - Standard (8 standards)
...

Level 3 - Comprehensive (10 standards)
...

Total: 23 standards available
```

### JSON Format

```json
{
  "standards": [
    {
      "name": "anti-hallucination.md",
      "level": 1,
      "category": "core",
      "description": "Prevent AI hallucinations"
    }
  ],
  "total": 23
}
```

---

## Implementation

```javascript
async function listCommand(options) {
  const registry = loadRegistry();
  let standards = getAllStandards();

  // Apply filters
  if (options.level) {
    standards = standards.filter(s => s.level === parseInt(options.level));
  }

  if (options.category) {
    standards = standards.filter(s => s.category === options.category);
  }

  // Format output
  switch (options.format) {
    case 'json':
      console.log(JSON.stringify({ standards, total: standards.length }, null, 2));
      break;
    case 'simple':
      standards.forEach(s => console.log(s.name));
      break;
    default:
      displayTable(standards, options.locale);
  }
}
```

---

## Acceptance Criteria

- [ ] Lists all available standards
- [ ] Filters by level correctly
- [ ] Filters by category correctly
- [ ] Supports table, json, and simple output formats
- [ ] Displays descriptions in correct locale

---

## Related Specifications

- [00-overview](../00-overview.md) - CLI overview
