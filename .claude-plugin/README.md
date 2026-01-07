# Claude Code Plugin Configuration

This directory contains the configuration files for distributing Universal Development Standards as a Claude Code Plugin via Marketplace.

## Files

- **[plugin.json](plugin.json)** - Plugin manifest with metadata
- **[marketplace.json](marketplace.json)** - Marketplace configuration for plugin distribution

## Plugin Information

- **Name**: `universal-dev-standards`
- **Version**: `3.2.0` (synced with CLI version)
- **Skills Included**: 15 comprehensive development skills
- **Source**: `./skills/claude-code`

## Installation for Users

### Via Marketplace (Recommended)

```bash
# Add the marketplace (one-time)
/plugin marketplace add AsiaOstrich/universal-dev-standards

# Install the plugin
/plugin install universal-dev-standards@universal-dev-standards
```

### Local Testing (Developers)

```bash
# Test plugin locally during development
cd /path/to/universal-dev-standards
claude --plugin-dir ./skills/claude-code
```

## Plugin Contents

The plugin includes 15 skills covering the full development lifecycle:

| Skill | Description |
|-------|-------------|
| `ai-collaboration-standards` | Anti-hallucination guidelines |
| `changelog-guide` | Changelog writing standards |
| `code-review-assistant` | Code review checklists |
| `commit-standards` | Conventional commits format |
| `documentation-guide` | Documentation structure |
| `error-code-guide` | Error code design |
| `git-workflow-guide` | Git branching strategies |
| `logging-guide` | Logging best practices |
| `project-structure-guide` | Project directory conventions |
| `release-standards` | Semantic versioning |
| `requirement-assistant` | Requirement writing |
| `spec-driven-dev` | Specification-driven development |
| `tdd-assistant` | Test-driven development workflow |
| `test-coverage-assistant` | Test coverage analysis |
| `testing-guide` | Testing pyramid and strategies |

## Version Management

Plugin version is synchronized with [cli/package.json](../cli/package.json):

```json
{
  "version": "3.2.0"
}
```

When bumping versions:
1. Update `cli/package.json`
2. Update `.claude-plugin/plugin.json`
3. Update `.claude-plugin/marketplace.json`
4. Update `.claude-plugin/README.md` (this file)

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
claude --plugin-dir ./skills/claude-code
```

## License

- Plugin configuration: MIT
- Skills content: CC BY 4.0

See [LICENSE](../LICENSE) for details.

## Related Documentation

- [Skills README](../skills/claude-code/README.md) - Detailed skill documentation
- [INTEGRATION-GUIDE.md](../skills/INTEGRATION-GUIDE.md) - Skill interaction workflows
- [CLAUDE.md](../CLAUDE.md) - Project development guidelines
