---
name: docs-generator
description: |
  Generate usage documentation from project sources.
  Use when: "generate docs", "create cheatsheet", "usage guide", "feature reference", "list all features"
  Keywords: documentation, usage, reference, cheatsheet, features, 功能文件, 速查表, 使用說明
---

# Documentation Generator Skill

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/docs-generator/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-26
**Applicability**: Claude Code Skills

---

## Purpose

Automatically generate comprehensive usage documentation from project source files. This skill creates:

1. **FEATURE-REFERENCE.md**: Complete feature documentation with all details
2. **CHEATSHEET.md**: Single-page quick reference table

Supports multiple languages (English, Traditional Chinese, Simplified Chinese) and scans various sources:
- CLI commands
- Slash commands
- Skills
- Agents
- Workflows
- Core standards
- Scripts

## Quick Reference

### Generate All Documentation

```bash
node scripts/generate-usage-docs.mjs
```

### Generate Specific Language

```bash
node scripts/generate-usage-docs.mjs --lang=en       # English only
node scripts/generate-usage-docs.mjs --lang=zh-TW    # Traditional Chinese
node scripts/generate-usage-docs.mjs --lang=zh-CN    # Simplified Chinese
```

### Generate Specific Format

```bash
node scripts/generate-usage-docs.mjs --cheatsheet    # Cheatsheet only
node scripts/generate-usage-docs.mjs --reference     # Reference only
```

### Check Sync Status

```bash
# Check if docs need update
node scripts/generate-usage-docs.mjs --check

# Or use sync check script
./scripts/check-usage-docs-sync.sh         # Check
./scripts/check-usage-docs-sync.sh --fix   # Fix if needed
```

## Configuration

The generator uses `.usage-docs.yaml` in project root to define:

- **Output paths**: Where to generate documents
- **Languages**: Which languages to generate
- **Sources**: What to scan (CLI, skills, commands, etc.)
- **Templates**: Document structure templates

### Configuration Example (Multi-language)

```yaml
# .usage-docs.yaml - Full UDS configuration
version: "1.0"
output:
  directory: "docs/"
  formats: [reference, cheatsheet]
  languages: [en, zh-TW, zh-CN]
  paths:
    en: "docs/"
    zh-TW: "locales/zh-TW/docs/"
    zh-CN: "locales/zh-CN/docs/"

sources:
  cli:
    enabled: true
    entry: "cli/bin/uds.js"
  skills:
    enabled: true
    directory: "skills/claude-code/"
    pattern: "**/SKILL.md"
```

### Single-Language Project

For projects that only need English documentation:

```yaml
# .usage-docs.yaml - English only
version: "1.0"
output:
  directory: "docs/"
  formats: [reference, cheatsheet]
  languages:
    - en
  paths:
    en: "docs/"

sources:
  cli:
    enabled: true
    entry: "src/cli.js"
```

### Custom Language Configuration

For projects with different language requirements (e.g., English + Japanese):

```yaml
# .usage-docs.yaml - English + Japanese
version: "1.0"
output:
  directory: "docs/"
  formats: [reference, cheatsheet]
  languages:
    - en
    - ja
  paths:
    en: "docs/"
    ja: "docs/ja/"

templates:
  reference:
    title:
      en: "My Project Reference"
      ja: "プロジェクトリファレンス"
  cheatsheet:
    title:
      en: "My Project Cheatsheet"
      ja: "チートシート"
```

### Configuration Fallback Behavior

The generator implements smart fallback for titles and paths:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 | `config[lang]` | Configured value for specific language |
| 2 | `config.en` | English fallback from config |
| 3 | Built-in default | Hardcoded default for supported languages |

**Supported built-in languages**: `en`, `zh-TW`, `zh-CN`

For unsupported languages, you must provide custom titles in the `templates` section.

## Output Files

| Language | FEATURE-REFERENCE | CHEATSHEET |
|----------|-------------------|------------|
| English | `docs/FEATURE-REFERENCE.md` | `docs/CHEATSHEET.md` |
| 繁體中文 | `locales/zh-TW/docs/FEATURE-REFERENCE.md` | `locales/zh-TW/docs/CHEATSHEET.md` |
| 简体中文 | `locales/zh-CN/docs/FEATURE-REFERENCE.md` | `locales/zh-CN/docs/CHEATSHEET.md` |

## Integration with Pre-Release Check

Add usage docs sync check to `pre-release-check.sh`:

```bash
# Check usage docs sync
echo "Checking usage documentation sync..."
./scripts/check-usage-docs-sync.sh
```

## Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    Documentation Generator               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Load Configuration (.usage-docs.yaml)               │
│           │                                              │
│           ▼                                              │
│  2. Scan Sources                                         │
│     ├─ CLI commands (uds.js)                            │
│     ├─ Skills (SKILL.md files)                          │
│     ├─ Commands (slash commands)                        │
│     ├─ Agents (agent definitions)                       │
│     ├─ Workflows (workflow files)                       │
│     ├─ Core standards (core/*.md)                       │
│     └─ Scripts (scripts/*.sh)                           │
│           │                                              │
│           ▼                                              │
│  3. Generate Documents                                   │
│     ├─ FEATURE-REFERENCE.md (detailed)                  │
│     └─ CHEATSHEET.md (quick reference)                  │
│           │                                              │
│           ▼                                              │
│  4. Output for Each Language                             │
│     ├─ English (docs/)                                   │
│     ├─ zh-TW (locales/zh-TW/docs/)                      │
│     └─ zh-CN (locales/zh-CN/docs/)                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Extending for Other Projects

This skill is designed to be reusable. To use in your project:

1. **Copy the configuration template**:
   ```bash
   cp .usage-docs.yaml your-project/.usage-docs.yaml
   ```

2. **Modify for your project structure**:
   - Update source directories
   - Adjust patterns for your file naming
   - Configure output paths

3. **Copy the generator script**:
   ```bash
   cp scripts/generate-usage-docs.mjs your-project/scripts/
   ```

4. **Run the generator**:
   ```bash
   node scripts/generate-usage-docs.mjs
   ```

## Related Standards

- [Documentation Writing Standards](../../../core/documentation-writing-standards.md)
- [Documentation Structure](../../../core/documentation-structure.md)
- [AI-Friendly Architecture](../../../core/ai-friendly-architecture.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-26 | Initial release with multi-language support |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
