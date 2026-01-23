# [AGENT-01] Agent Installation Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: AGENT-01

---

## Summary

This specification defines the agent installation logic for the `uds agent install` subcommand.

---

## Command Synopsis

```bash
uds agent install <agent-name> [options]

Options:
  --tool <tool>          Target AI tool (default: claude-code)
  --location <loc>       Installation location (project, user)
  -y, --yes              Non-interactive mode
  -h, --help             Display help
```

---

## Installation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Agent Installation Flow                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. Validate agent name                                                     │
│      └── Check agents/ directory for agent definition                       │
│                                                                              │
│   2. Check tool support                                                      │
│      └── Tool must support agents (supportsAgents = true)                   │
│                                                                              │
│   3. Determine target directory                                              │
│      └── getAgentsDirForAgent(tool, location, projectPath)                  │
│                                                                              │
│   4. Copy agent files                                                        │
│      ├── AGENT.md                                                            │
│      ├── Supporting files                                                    │
│      └── Compute file hashes                                                 │
│                                                                              │
│   5. Update manifest                                                         │
│      └── Add to agents.installed, update agentHashes                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation

```javascript
async function installAgent(agentName, options, projectPath) {
  const manifest = readManifest(projectPath);
  const tool = options.tool || 'claude-code';
  const location = options.location || 'project';

  // Validate tool supports agents
  const config = getAgentConfig(tool);
  if (!config.supportsAgents) {
    throw new Error(`${tool} does not support agents`);
  }

  // Get source and target paths
  const sourcePath = path.join(getUDSRoot(), 'agents', agentName);
  const targetPath = getAgentsDirForAgent(tool, location, projectPath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Agent not found: ${agentName}`);
  }

  // Copy files
  await copyDirectory(sourcePath, path.join(targetPath, agentName));

  // Compute hashes
  const hashes = computeDirectoryHashes(
    path.join(targetPath, agentName),
    `${tool}/${location}/${agentName}`
  );

  // Update manifest
  if (!manifest.agents) {
    manifest.agents = { installed: [], hashes: {} };
  }
  manifest.agents.installed.push({
    name: agentName,
    tool,
    location
  });
  Object.assign(manifest.agents.hashes, hashes);

  writeManifest(manifest, projectPath);

  return { success: true, agent: agentName, tool, location };
}
```

---

## Acceptance Criteria

- [ ] Validates agent name against available agents
- [ ] Checks tool support for agents
- [ ] Copies all agent files correctly
- [ ] Computes and stores file hashes
- [ ] Updates manifest with installation info
- [ ] Handles existing installations (skip or overwrite)

---

## Related Specifications

- [AGENT-00 Agent Overview](00-agent-overview.md)
- [SHARED-06 AI Agent Paths](../shared/ai-agent-paths.md)
