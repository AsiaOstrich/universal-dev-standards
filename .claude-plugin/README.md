# Claude Code Plugin Configuration

This directory contains the configuration files for distributing Universal Development Standards as a Claude Code Plugin via Marketplace.

## Files

- **[plugin.json](plugin.json)** - Plugin manifest with metadata
- **[marketplace.json](marketplace.json)** - Marketplace configuration for plugin distribution

## Plugin Information

- **Name**: `universal-dev-standards`
- **Version**: the `version` field of [plugin.json](plugin.json) (stable releases only; the marketplace never carries a beta)
- **Skills**: every folder under `skills/` that holds a `SKILL.md` (run `uds skills` or read [skills/README.md](../skills/README.md) for the list; no number is written here because a number written here goes stale)
- **Language**: English skill texts only (the plugin settings have no language choice)
- **Tool**: Claude Code only
- **Source**: `./skills`

## Installation for Users

The plugin is one of two ways to install UDS skills. The main path is into the project
(`uds update --apply --skills`), which works with many AI tools, has Traditional and Simplified Chinese skill
texts and follows the UDS version you installed. See [How to install skills](../docs/user/GETTING-STARTED.md#how-to-install-skills).

### Via Marketplace (an alternative, with limits)

```bash
# Add the marketplace (one-time)
/plugin marketplace add AsiaOstrich/universal-dev-standards

# Install the plugin
/plugin install universal-dev-standards@asia-ostrich
```

If the same project also holds UDS skills (`.claude/skills/`), each skill shows up twice in Claude Code
(`/commit` and `/universal-dev-standards:commit`). Pick one; `uds check` warns when it finds both.

### Local Testing (Developers)

```bash
# Test plugin locally during development
cd /path/to/universal-dev-standards
claude --plugin-dir ./skills
```

## Version Management

The `version` of [plugin.json](plugin.json) and [marketplace.json](marketplace.json) moves only on a stable
release (`scripts/bump-version.mjs` skips both for a pre-release). When bumping a stable version:
1. Update `cli/package.json`
2. Update `.claude-plugin/plugin.json`
3. Update `.claude-plugin/marketplace.json`

The descriptions must not claim a number of skills that differs from `skills/`:
`node cli/scripts/check-plugin-manifest.mjs` (also `npm run check:plugin-manifest` in `cli/`) fails when they do.

## Maintenance

### Updating Plugin Metadata

Edit [plugin.json](plugin.json) to update:
- Description
- Keywords
- Author information
- Repository URLs

### Updating Marketplace Listing

Edit [marketplace.json](marketplace.json) to update:
- Plugin description
- Owner information
- Metadata

### Testing Changes

```bash
# Validate JSON syntax
python3 -m json.tool plugin.json > /dev/null
python3 -m json.tool marketplace.json > /dev/null

# Test local installation
claude --plugin-dir ./skills
```

## License

- Plugin configuration: MIT
- Skills content: CC BY 4.0

See [LICENSE](../LICENSE) for details.

## Related Documentation

- [Skills README](../skills/README.md) - Detailed skill documentation
- [INTEGRATION-GUIDE.md](../skills/INTEGRATION-GUIDE.md) - Skill interaction workflows
- [CLAUDE.md](../CLAUDE.md) - Project development guidelines
