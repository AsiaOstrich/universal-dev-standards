# Translations / 翻譯

This directory contains translations of the Universal Development Standards documentation.

本目錄包含通用開發規範文件的翻譯版本。

---

## Available Languages / 可用語言

| Language | Directory | Status |
|----------|-----------|--------|
| English | `../core/`, `../skills/`, etc. | Primary (canonical source) |
| 繁體中文 (Traditional Chinese) | `zh-TW/` | Complete |
| 简体中文 (Simplified Chinese) | `zh-CN/` | ⚠️ 需與 EN 同步 |

---

## Structure / 結構

Each language directory mirrors the main repository structure:

```
locales/
├── zh-TW/                    # Traditional Chinese
│   ├── README.md             # Chinese entry point
│   ├── CHANGELOG.md          # Changelog translation
│   ├── core/                 # Core standards translations
│   ├── skills/claude-code/   # Skills translations
│   ├── templates/            # Templates translations
│   └── adoption/             # Adoption guide translations
└── zh-CN/                    # Simplified Chinese
    ├── README.md             # Chinese entry point
    ├── CHANGELOG.md          # Changelog translation
    └── docs/                 # Documentation translations
```

---

## Translation Metadata / 翻譯元資料

Each translated file includes a YAML front matter with synchronization metadata:

```yaml
---
source: ../../../core/example.md      # Path to English source
source_version: 1.2.0                 # Version of English source
translation_version: 1.2.0            # Version this translation matches
last_synced: 2025-12-24               # Last synchronization date
status: current | outdated | needs-review
---
```

### Status Values / 狀態值

| Status | Meaning | 說明 |
|--------|---------|------|
| `current` | Translation matches source version | 翻譯與源文件版本一致 |
| `outdated` | Source has been updated | 源文件已更新，翻譯待同步 |
| `needs-review` | Translation needs review | 翻譯需要審閱 |

---

## Contributing Translations / 貢獻翻譯

1. **New Language**: Create a new directory (e.g., `ja/` for Japanese)
2. **Update Translation**: Update `translation_version` and `last_synced`
3. **Mark Outdated**: When updating English source, translations become `outdated`

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

---

## AI Tool Usage / AI 工具使用

When using AI tools (Claude Code, Cursor, etc.):

- **Default (English)**: Reference `core/`, `skills/`, etc. directly
- **Chinese**: Reference `locales/zh-TW/core/`, etc.

Example Claude Code skill installation:
```bash
# English (default)
cp skills/claude-code/commit-standards/SKILL.md ~/.claude/skills/

# Traditional Chinese
cp locales/zh-TW/skills/claude-code/commit-standards/SKILL.md ~/.claude/skills/
```
