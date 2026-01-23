# [WORKFLOW-01] Workflow Installation Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: WORKFLOW-01

---

## Summary

This specification defines the workflow installation logic for the `uds workflow install` subcommand.

---

## Command Synopsis

```bash
uds workflow install <workflow-name> [options]

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
│                       Workflow Installation Flow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. Validate workflow name                                                  │
│      └── Check workflows/ directory for workflow definition                 │
│                                                                              │
│   2. Check tool support                                                      │
│      └── Tool must support workflows (supportsWorkflows = true)             │
│                                                                              │
│   3. Determine target directory                                              │
│      └── getWorkflowsDirForAgent(tool, location, projectPath)               │
│                                                                              │
│   4. Copy workflow files                                                     │
│      ├── WORKFLOW.md                                                         │
│      ├── steps/*.md                                                          │
│      ├── templates/*.md                                                      │
│      └── Compute file hashes                                                 │
│                                                                              │
│   5. Update manifest                                                         │
│      └── Add to workflows.installed, update workflowHashes                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tool Support Matrix

| Tool | Supports Workflows | Path Pattern |
|------|-------------------|--------------|
| claude-code | ✅ | `.claude/workflows/` |
| cline | ✅ | `.cline/workflows/` |
| roo | ✅ | `.roo/workflows/` |
| antigravity | ✅ | `.antigravity/workflows/` |
| cursor | ❌ | - |
| windsurf | ❌ | - |
| copilot | ❌ | - |
| aider | ❌ | - |
| opencode | ❌ | - |

---

## Implementation

```javascript
async function installWorkflow(workflowName, options, projectPath) {
  const manifest = readManifest(projectPath);
  const tool = options.tool || 'claude-code';
  const location = options.location || 'project';

  // Validate tool supports workflows
  const config = getAgentConfig(tool);
  if (!config.supportsWorkflows) {
    throw new Error(`${tool} does not support workflows`);
  }

  // Get source and target paths
  const sourcePath = path.join(getUDSRoot(), 'workflows', workflowName);
  const targetPath = getWorkflowsDirForAgent(tool, location, projectPath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Workflow not found: ${workflowName}`);
  }

  // Copy files
  await copyDirectory(sourcePath, path.join(targetPath, workflowName));

  // Compute hashes
  const hashes = computeDirectoryHashes(
    path.join(targetPath, workflowName),
    `${tool}/${location}/${workflowName}`
  );

  // Update manifest
  if (!manifest.workflows) {
    manifest.workflows = { installed: [], hashes: {} };
  }
  manifest.workflows.installed.push({
    name: workflowName,
    tool,
    location
  });
  Object.assign(manifest.workflows.hashes, hashes);

  writeManifest(manifest, projectPath);

  return { success: true, workflow: workflowName, tool, location };
}
```

---

## Acceptance Criteria

- [ ] Validates workflow name against available workflows
- [ ] Checks tool support for workflows
- [ ] Copies all workflow files including steps
- [ ] Computes and stores file hashes
- [ ] Updates manifest with installation info
- [ ] Handles existing installations

---

## Related Specifications

- [WORKFLOW-00 Workflow Overview](00-workflow-overview.md)
- [SHARED-06 AI Agent Paths](../shared/ai-agent-paths.md)
