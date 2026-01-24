# [CONFIG-00] Configure Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: CONFIG-00

---

## Summary

The `uds configure` command modifies the configuration of an existing UDS installation. It allows changing AI tools, adoption level, content mode, and other settings without reinitializing.

---

## Motivation

The configure command provides:
1. **Flexibility**: Change settings after initial setup
2. **Non-Destructive**: Modify config without losing customizations
3. **Incremental Adoption**: Add AI tools or increase level over time
4. **Maintenance**: Update integration file content mode

---

## Command Synopsis

```bash
uds configure [options]

Options:
  --add-tools <tools>    Add AI tools (comma-separated)
  --remove-tools <tools> Remove AI tools (comma-separated)
  --level <level>        Change adoption level (1, 2, or 3)
  --content-mode <mode>  Change content mode (minimal, index, full)
  --locale <locale>      Change locale (en, zh-TW, zh-CN)
  --regen                Regenerate integration files
  --add-skills           Add skills to new agents
  --add-commands         Add commands to new agents
  -y, --yes              Non-interactive mode
  -h, --help             Display help
```

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        uds configure Command Flow                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                                           │
│   │    Entry     │                                                           │
│   │configCommand │                                                           │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                           │
│   │    Load      │                                                           │
│   │   Manifest   │                                                           │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Option Router                                     │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                      │   │
│   │   --add-tools     ──▶  Add AI Tools Flow                            │   │
│   │   --remove-tools  ──▶  Remove AI Tools Flow                         │   │
│   │   --level         ──▶  Change Level Flow                            │   │
│   │   --content-mode  ──▶  Change Content Mode Flow                     │   │
│   │   --locale        ──▶  Change Locale Flow                           │   │
│   │   --regen         ──▶  Regenerate Integrations Flow                 │   │
│   │   --add-skills    ──▶  Add Skills Flow                              │   │
│   │   --add-commands  ──▶  Add Commands Flow                            │   │
│   │   (no options)    ──▶  Interactive Configuration                    │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                           │
│   │   Execute    │                                                           │
│   │   Changes    │                                                           │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                           │
│   │   Update     │                                                           │
│   │   Manifest   │                                                           │
│   └──────────────┘                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Configuration Options

### Add AI Tools (--add-tools)

Add new AI tools to the configuration.

```bash
uds configure --add-tools cursor,windsurf
```

**Flow:**
1. Validate tool names
2. Check if tools already configured
3. Generate integration files for new tools
4. Optionally install skills/commands for new tools
5. Update manifest

### Remove AI Tools (--remove-tools)

Remove AI tools from the configuration.

```bash
uds configure --remove-tools aider
```

**Flow:**
1. Validate tool names
2. Prompt to delete integration files
3. Optionally remove skills/commands for removed tools
4. Update manifest

### Change Level (--level)

Change the adoption level.

```bash
uds configure --level 3
```

**Flow:**
1. Validate level (1, 2, or 3)
2. If increasing level:
   - Copy additional standards
   - Install additional skills
   - Regenerate integrations
3. If decreasing level:
   - Warn about unused standards
   - Update manifest (keep files)

### Change Content Mode (--content-mode)

Change how standards appear in integration files.

```bash
uds configure --content-mode full
```

**Flow:**
1. Validate mode (minimal, index, full)
2. Regenerate all integration files with new mode
3. Update manifest

### Change Locale (--locale)

Change the documentation locale.

```bash
uds configure --locale zh-TW
```

**Flow:**
1. Validate locale (en, zh-TW, zh-CN)
2. Regenerate integration files with new locale
3. Update manifest

### Regenerate Integrations (--regen)

Force regeneration of all integration files.

```bash
uds configure --regen
```

**Flow:**
1. Preserve user content outside UDS blocks
2. Regenerate all integration files
3. Update integration block hashes

See: [CONFIG-01 Option Types](01-option-types.md)

---

## Interactive Mode

When no options are provided, enter interactive configuration.

```
🔧 UDS Configuration

Current configuration:
   • Level: 2 (Standard)
   • AI Tools: claude-code, cursor
   • Content Mode: index
   • Locale: en
   • Skills: Installed (project level)

? What would you like to configure?
   ○ Add AI tools
   ○ Remove AI tools
   ○ Change adoption level
   ○ Change content mode
   ○ Change locale
   ○ Regenerate integration files
   ○ Add skills to agents
   ○ Add commands to agents
   ○ Exit
```

---

## AI Tools Management

### Adding Tools Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Add AI Tools Flow                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. Parse --add-tools argument                                              │
│      └── Split by comma, trim whitespace                                     │
│                                                                              │
│   2. Validate tool names                                                     │
│      └── Must be in supported tools list                                     │
│                                                                              │
│   3. Filter out already configured tools                                     │
│      └── Warn if tool already exists                                         │
│                                                                              │
│   4. Generate integration files                                              │
│      └── writeIntegrationFile() for each new tool                           │
│                                                                              │
│   5. Prompt for skills installation (if applicable)                          │
│      ├── Agent supports skills?                                              │
│      │   ├── Yes → promptSkillsInstallLocation()                            │
│      │   │         └── installSkillsForAgent()                              │
│      │   └── No → Skip                                                       │
│      └── Update skillHashes                                                  │
│                                                                              │
│   6. Prompt for commands installation (if applicable)                        │
│      ├── Agent supports commands?                                            │
│      │   ├── Yes → Install commands                                          │
│      │   └── No → Skip                                                       │
│      └── Update commandHashes                                                │
│                                                                              │
│   7. Update manifest                                                         │
│      └── Add tools to aiTools array                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Removing Tools Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Remove AI Tools Flow                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. Parse --remove-tools argument                                           │
│                                                                              │
│   2. Validate tool names and existence                                       │
│      └── Must be currently configured                                        │
│                                                                              │
│   3. Prompt for file deletion                                                │
│      ┌─────────────────────────────────────────────────────┐                │
│      │ ? Delete .cursorrules integration file?             │                │
│      │   ○ Yes, delete the file                            │                │
│      │   ○ No, keep the file but remove from UDS tracking  │                │
│      └─────────────────────────────────────────────────────┘                │
│                                                                              │
│   4. Remove integration files (if chosen)                                    │
│      └── fs.unlinkSync()                                                     │
│                                                                              │
│   5. Clean up skills (if applicable)                                         │
│      └── Prompt to remove agent-specific skills                              │
│                                                                              │
│   6. Update manifest                                                         │
│      └── Remove tools from aiTools array                                     │
│      └── Remove from integrations array                                      │
│      └── Remove from integrationBlockHashes                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

See: [CONFIG-02 AI Tools Management](02-ai-tools-management.md)

---

## Output Examples

### Adding Tools

```
🔧 Adding AI tools...

Adding: windsurf

✓ Generated .windsurfrules

? Install skills for Windsurf?
   Note: Windsurf uses .windsurfrules format (no skills support)

Skipping skills installation (not supported)

📝 Updating manifest...
   ✓ Added windsurf to aiTools

✅ Configuration updated

New tools added: windsurf
AI Tools now: claude-code, cursor, windsurf
```

### Removing Tools

```
🔧 Removing AI tools...

Removing: aider

? Delete .aider/CONVENTIONS.md? (Y/n) y
✓ Deleted .aider/CONVENTIONS.md

📝 Updating manifest...
   ✓ Removed aider from aiTools

✅ Configuration updated

Tools removed: aider
AI Tools now: claude-code, cursor
```

### Changing Level

```
🔧 Changing adoption level...

Current: Level 2 (Standard)
New: Level 3 (Comprehensive)

Additional standards to install:
   • spec-driven-development.md
   • bdd-standards.md
   • tdd-standards.md
   • atdd-standards.md

? Proceed? (Y/n) y

📋 Copying additional standards...
   ✓ core/spec-driven-development.md
   ✓ core/bdd-standards.md
   ✓ core/tdd-standards.md
   ✓ core/atdd-standards.md

🎯 Installing additional skills...
   ✓ spec-driven-dev
   ✓ bdd-guide

🔧 Regenerating integrations...
   ✓ CLAUDE.md
   ✓ .cursorrules

✅ Level changed to 3 (Comprehensive)
```

### Regenerating Integrations

```
🔧 Regenerating integration files...

   ✓ CLAUDE.md (index mode, en)
   ✓ .cursorrules (index mode, en)

📝 Updating manifest...
   ✓ Updated integrationBlockHashes

✅ Integration files regenerated
```

---

## Error Handling

### Not Initialized

```
❌ Error: UDS is not initialized in this project.

Run 'uds init' first.
```

### Invalid Tool Name

```
❌ Error: Invalid AI tool name: 'invalid-tool'

Valid tools: claude-code, cursor, windsurf, cline, copilot,
             opencode, aider, roo, antigravity
```

### Tool Already Configured

```
⚠️ Warning: 'cursor' is already configured.

Skipping cursor...
```

### Last Tool Removal

```
❌ Error: Cannot remove the last AI tool.

At least one AI tool must be configured.
```

---

## Acceptance Criteria

- [ ] Add AI tools generates correct integration files
- [ ] Remove AI tools handles file deletion correctly
- [ ] Level change installs/warns about standards appropriately
- [ ] Content mode change regenerates integrations
- [ ] Locale change regenerates integrations
- [ ] Regenerate preserves user content outside UDS blocks
- [ ] Skills are installed for newly added tools
- [ ] Manifest is updated correctly for all changes
- [ ] Interactive mode covers all configuration options
- [ ] Error handling for invalid inputs

---

## Dependencies

| Spec ID | Name | Dependency Type |
|---------|------|-----------------|
| SHARED-01 | Manifest Schema | Reading/writing manifest |
| SHARED-04 | Integration Generation | Regenerating files |
| SHARED-05 | Skills Installation | Adding skills |
| SHARED-06 | AI Agent Paths | Agent capabilities |
| SHARED-07 | Prompts | Interactive prompts |

---

## Related Specifications

- [CONFIG-01 Option Types](01-option-types.md)
- [CONFIG-02 AI Tools Management](02-ai-tools-management.md)
- [INIT-00 Init Overview](../init/00-init-overview.md)
- [UPDATE-00 Update Overview](../update/00-update-overview.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
