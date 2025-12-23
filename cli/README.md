# Universal Documentation Standards CLI

CLI tool for adopting Universal Documentation Standards in your projects.

## Installation

### Option 1: Clone and Run Locally (Recommended)

```bash
# Clone the repository
git clone https://github.com/AsiaOstrich/universal-doc-standards.git

# Navigate to CLI directory
cd universal-doc-standards/cli

# Install dependencies
npm install

# Run directly
node bin/uds.js list
node bin/uds.js init
```

### Option 2: Global Link (for frequent use)

```bash
# In the cli directory
cd universal-doc-standards/cli
npm link

# Now available globally
uds list
uds init
```

### Option 3: npx (when published to npm)

```bash
# Not yet published - use Option 1 or 2 for now
npx universal-doc-standards init
```

## Commands

### `uds list`

List all available standards.

```bash
# List all standards
uds list

# Filter by level
uds list --level 2

# Filter by category
uds list --category skill
```

**Options:**
- `-l, --level <1|2|3>` - Filter by adoption level
- `-c, --category <name>` - Filter by category (skill, reference, extension, integration, template)

### `uds init`

Initialize standards in your project.

```bash
# Interactive mode (recommended)
uds init

# Non-interactive with defaults
uds init --yes

# Specify options
uds init --level 2 --lang php --locale zh-tw
```

**Options:**
- `-l, --level <1|2|3>` - Adoption level (1=Essential, 2=Recommended, 3=Enterprise)
- `--lang <language>` - Language extension (csharp, php)
- `--framework <name>` - Framework extension (fat-free)
- `--locale <locale>` - Locale extension (zh-tw)
- `--no-skills` - Skip Claude Code Skills installation prompt
- `-y, --yes` - Use defaults, skip interactive prompts

**What it does:**
1. Detects your project's language and framework
2. Asks which standards to adopt
3. Copies reference documents to `.standards/`
4. Copies AI tool integrations (Cursor, Copilot, etc.)
5. Creates `.standards/manifest.json` for tracking

### `uds check`

Check adoption status of current project.

```bash
uds check
```

**Output includes:**
- Installed version and level
- File integrity check
- Skills installation status
- Coverage summary
- Update availability

### `uds update`

Update standards to the latest version.

```bash
# Interactive update
uds update

# Skip confirmation
uds update --yes
```

**Options:**
- `-y, --yes` - Skip confirmation prompts

## Adoption Levels

| Level | Name | Description |
|-------|------|-------------|
| 1 | Essential | Minimum viable standards for any project |
| 2 | Recommended | Professional quality for team projects |
| 3 | Enterprise | Comprehensive standards for enterprise |

## Categories

| Category | Description |
|----------|-------------|
| `skill` | Standards with Claude Code Skills |
| `reference` | Reference documents (no Skills) |
| `extension` | Language/framework-specific |
| `integration` | AI tool configurations |
| `template` | Document templates |

## Example Workflow

```bash
# 1. Clone and setup CLI (one-time)
git clone https://github.com/AsiaOstrich/universal-doc-standards.git
cd universal-doc-standards/cli && npm install && npm link
cd ~

# 2. Navigate to your project
cd my-project

# 3. Initialize standards (interactive)
uds init
# ? Select adoption level: Level 2: Recommended
# ? Detected PHP project. Select style guides: PHP Style Guide
# ? Select AI tool integrations: Cursor, GitHub Copilot
# ? Install Claude Code Skills? Yes

# 4. Review what was created
ls .standards/
# checkin-standards.md
# spec-driven-development.md
# manifest.json

# 5. Check status anytime
uds check

# 6. Update when new version is available
uds update
```

## File Structure

After initialization, your project will have:

```
your-project/
├── .standards/
│   ├── manifest.json        # Tracks what was installed
│   ├── checkin-standards.md # Reference documents
│   ├── spec-driven-development.md
│   └── (other standards...)
├── .cursorrules             # AI tool integrations
├── .github/
│   └── copilot-instructions.md
└── ...
```

## Manifest File

The `.standards/manifest.json` tracks your adoption:

```json
{
  "version": "1.0.0",
  "upstream": {
    "repo": "AsiaOstrich/universal-doc-standards",
    "version": "1.3.1",
    "installed": "2025-12-23"
  },
  "level": 2,
  "standards": ["core/checkin-standards.md", ...],
  "extensions": ["extensions/languages/php-style.md"],
  "integrations": [".cursorrules"],
  "skills": {
    "installed": true,
    "version": "1.1.0"
  }
}
```

## Integration with Claude Code Skills

This CLI works alongside [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills):

- **Skills** provide interactive AI assistance (commit messages, code review, etc.)
- **Reference documents** provide guidelines for manual reference

**Important**: For standards with Skills available, use the Skill OR copy the source document — never both.

## Related

- [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards) - Source repository
- [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) - Claude Code Skills
- [Adoption Guide](https://github.com/AsiaOstrich/universal-doc-standards/blob/main/adoption/ADOPTION-GUIDE.md) - Complete guidance

## License

This project uses a **dual-license** model:

| Content Type | License |
|-------------|---------|
| Documentation (`*.md`) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Code (`*.js`, etc.) | [MIT](https://opensource.org/licenses/MIT) |
