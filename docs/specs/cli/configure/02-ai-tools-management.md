# [CONFIG-02] AI Tools Management Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: CONFIG-02

---

## Summary

This specification defines the AI tools management operations including adding, removing, and configuring AI tools.

---

## Detailed Design

### AI Tool Capabilities

| Tool | Integration File | Supports Skills | Supports Commands | Supports Marketplace |
|------|-----------------|-----------------|-------------------|---------------------|
| claude-code | CLAUDE.md | Yes | Yes | Yes |
| opencode | .opencode/rules.md | Yes | Yes | No |
| cursor | .cursorrules | No | No | No |
| windsurf | .windsurfrules | No | No | No |
| cline | .clinerules | Yes | Yes | No |
| roo | .roo/rules.md | Yes | Yes | No |
| aider | .aider/CONVENTIONS.md | No | No | No |
| copilot | .github/copilot-instructions.md | No | No | No |
| antigravity | .antigravity/rules.md | Yes | Yes | No |

### Add Tools Flow

```javascript
async function processAddTools(toolNames, manifest, projectPath) {
  const tools = toolNames.split(',').map(t => t.trim());
  const results = { added: [], skipped: [], errors: [] };

  for (const tool of tools) {
    // Validate tool name
    if (!VALID_TOOLS.includes(tool)) {
      results.errors.push({ tool, error: 'Invalid tool name' });
      continue;
    }

    // Check if already configured
    if (manifest.aiTools.includes(tool)) {
      results.skipped.push({ tool, reason: 'Already configured' });
      continue;
    }

    // Generate integration file
    await writeIntegrationFile({
      projectPath,
      tool,
      targetFile: TOOL_FILES[tool],
      format: TOOL_FORMATS[tool],
      contentMode: manifest.contentMode,
      locale: manifest.locale,
      level: manifest.level
    });

    // Install skills if supported
    const config = getAgentConfig(tool);
    if (config.supportsSkills && !manifest.skills?.skipped) {
      await promptAndInstallSkills(tool, manifest, projectPath);
    }

    // Install commands if supported
    if (config.supportsCommands && !manifest.commands?.skipped) {
      await promptAndInstallCommands(tool, manifest, projectPath);
    }

    manifest.aiTools.push(tool);
    results.added.push(tool);
  }

  return results;
}
```

### Remove Tools Flow

```javascript
async function processRemoveTools(toolNames, manifest, projectPath) {
  const tools = toolNames.split(',').map(t => t.trim());
  const results = { removed: [], skipped: [], errors: [] };

  for (const tool of tools) {
    // Check if configured
    if (!manifest.aiTools.includes(tool)) {
      results.skipped.push({ tool, reason: 'Not configured' });
      continue;
    }

    // Prevent removing last tool
    if (manifest.aiTools.length === 1) {
      results.errors.push({ tool, error: 'Cannot remove last tool' });
      continue;
    }

    // Prompt for file deletion
    const targetFile = TOOL_FILES[tool];
    const fullPath = path.join(projectPath, targetFile);

    if (fs.existsSync(fullPath)) {
      const shouldDelete = await confirm(`Delete ${targetFile}?`);
      if (shouldDelete) {
        fs.unlinkSync(fullPath);
      }
    }

    // Remove from manifest
    manifest.aiTools = manifest.aiTools.filter(t => t !== tool);
    manifest.integrations = manifest.integrations.filter(i => i !== targetFile);
    delete manifest.integrationBlockHashes[targetFile];

    results.removed.push(tool);
  }

  return results;
}
```

---

## Acceptance Criteria

- [ ] Add tools validates tool names
- [ ] Add tools generates correct integration files
- [ ] Add tools installs skills for capable tools
- [ ] Remove tools prompts before file deletion
- [ ] Remove tools prevents removing last tool
- [ ] Manifest is updated correctly for all operations

---

## Related Specifications

- [CONFIG-00 Configure Overview](00-configure-overview.md)
- [SHARED-04 Integration Generation](../shared/integration-generation.md)
- [SHARED-06 AI Agent Paths](../shared/ai-agent-paths.md)
