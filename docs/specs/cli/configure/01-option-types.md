# [CONFIG-01] Option Types Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: CONFIG-01

---

## Summary

This specification defines the 11 configuration option types supported by the `uds configure` command.

---

## Detailed Design

### Configuration Options Matrix

| Option | CLI Flag | Type | Requires Regeneration |
|--------|----------|------|----------------------|
| Add AI Tools | `--add-tools` | string[] | Yes |
| Remove AI Tools | `--remove-tools` | string[] | No (delete files) |
| Change Level | `--level` | number | Yes |
| Change Content Mode | `--content-mode` | string | Yes |
| Change Locale | `--locale` | string | Yes |
| Regenerate | `--regen` | boolean | Yes |
| Add Skills | `--add-skills` | boolean | No |
| Add Commands | `--add-commands` | boolean | No |

### Option Processing Flow

```javascript
async function processConfigureOptions(options, manifest, projectPath) {
  const changes = [];

  if (options.addTools) {
    changes.push(await processAddTools(options.addTools, manifest, projectPath));
  }

  if (options.removeTools) {
    changes.push(await processRemoveTools(options.removeTools, manifest, projectPath));
  }

  if (options.level) {
    changes.push(await processLevelChange(options.level, manifest, projectPath));
  }

  if (options.contentMode) {
    changes.push(await processContentModeChange(options.contentMode, manifest, projectPath));
  }

  if (options.locale) {
    changes.push(await processLocaleChange(options.locale, manifest, projectPath));
  }

  if (options.regen) {
    changes.push(await processRegenerate(manifest, projectPath));
  }

  if (options.addSkills) {
    changes.push(await processAddSkills(manifest, projectPath));
  }

  if (options.addCommands) {
    changes.push(await processAddCommands(manifest, projectPath));
  }

  return changes;
}
```

### Level Change Impact

| From | To | Action |
|------|-----|--------|
| 1 | 2 | Add Level 2 standards and skills |
| 1 | 3 | Add Level 2 and 3 standards and skills |
| 2 | 3 | Add Level 3 standards and skills |
| 2 | 1 | Warn about unused standards (keep files) |
| 3 | 2 | Warn about unused standards (keep files) |
| 3 | 1 | Warn about unused standards (keep files) |

---

## Acceptance Criteria

- [ ] All 11 option types are processed correctly
- [ ] Options that require regeneration trigger it
- [ ] Level changes install/warn appropriately
- [ ] Options can be combined in a single command
- [ ] Validation prevents invalid configurations

---

## Related Specifications

- [CONFIG-00 Configure Overview](00-configure-overview.md)
- [CONFIG-02 AI Tools Management](02-ai-tools-management.md)
