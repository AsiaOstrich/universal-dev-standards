# [UPDATE-03] Feature Detection Specification

**Version**: 1.1.0
**Last Updated**: 2026-01-26
**Status**: Stable
**Spec ID**: UPDATE-03

---

## Summary

This specification defines the feature detection logic for detecting new agents, workflows, and skills introduced since the last update.

---

## Detailed Design

### Feature Categories

| Feature | Detection Source | Comparison |
|---------|-----------------|------------|
| Agents | `agents/` directory | Compare with `declined.agents` |
| Workflows | `workflows/` directory | Compare with `declined.workflows` |
| Skills | Registry by level | Compare with installed skills |
| Commands | `commands/` directory | Compare with installed commands version |

> **Note (v4.3.0+)**: Claude Code Commands detection is deprecated. Claude Code v2.1.3+ merged Commands and Skills; UDS CLI now uses Skills for Claude Code.

### Marketplace Installation Detection

For Marketplace installations (Claude Code only), detection uses two-phase validation:

```javascript
function getMarketplaceSkillsInfo() {
  // Phase 1: Check installed_plugins.json exists and has UDS entry
  const pluginsFile = join(homedir(), '.claude', 'plugins', 'installed_plugins.json');
  if (!existsSync(pluginsFile)) return null;

  const data = JSON.parse(readFileSync(pluginsFile, 'utf-8'));
  const udsKey = Object.keys(data.plugins).find(k => k.includes('universal-dev-standards'));
  if (!udsKey) return null;

  // Phase 2: Validate cache directory actually exists (prevents stale record false positives)
  // pluginKey format: "universal-dev-standards@asia-ostrich"
  const [pluginName, marketplace] = udsKey.split('@');
  const cacheDir = join(homedir(), '.claude', 'plugins', 'cache', marketplace, pluginName);

  // If cache directory missing, plugin was uninstalled but JSON record not cleaned up
  if (!existsSync(cacheDir)) return null;

  // Return installed info with version from cache directory
  return { installed: true, version: /* from cache */, source: 'marketplace' };
}
```

This two-phase validation ensures:
1. **No false positives**: Stale JSON records (plugin uninstalled but record remains) are correctly detected as "not installed"
2. **Accurate version**: Version is read from actual cache directory, not potentially outdated JSON record

### Detection Logic

```javascript
async function detectNewFeatures(manifest, projectPath) {
  const results = {
    agents: [],
    workflows: [],
    skills: [],
    commands: []          // ← Commands detection added
  };

  // Detect new agents
  const availableAgents = await loadAvailableAgents();
  const installedAgents = manifest.agents?.installed || [];
  const declinedAgents = manifest.declined?.agents || [];

  for (const agent of availableAgents) {
    if (!installedAgents.includes(agent.name) && !declinedAgents.includes(agent.name)) {
      results.agents.push(agent);
    }
  }

  // Detect new workflows
  const availableWorkflows = await loadAvailableWorkflows();
  const installedWorkflows = manifest.workflows?.installed || [];
  const declinedWorkflows = manifest.declined?.workflows || [];

  for (const workflow of availableWorkflows) {
    if (!installedWorkflows.includes(workflow.name) && !declinedWorkflows.includes(workflow.name)) {
      results.workflows.push(workflow);
    }
  }

  // Detect new skills for current level
  const skillsForLevel = getSkillsForLevel(manifest.level);
  const installedSkills = manifest.skills?.names || [];

  for (const skill of skillsForLevel) {
    if (!installedSkills.includes(skill)) {
      results.skills.push(skill);
    }
  }

  return results;
}

/**
 * Detect outdated commands across all agent installations
 * Similar to Skills version checking
 */
async function detectOutdatedCommands(manifest, latestVersion, projectPath) {
  const outdated = [];
  const installations = manifest.commands?.installations || [];

  for (const inst of installations) {
    const info = getInstalledCommandsForAgent(inst.agent, inst.level, projectPath);

    // Skip if not installed or version unknown
    if (!info?.installed || !info?.version) continue;

    // Check if version differs from latest
    if (info.version !== latestVersion) {
      outdated.push({
        agent: inst.agent,
        displayName: getAgentDisplayName(inst.agent),
        currentVersion: info.version,
        latestVersion,
        level: inst.level,
        path: info.path
      });
    }
  }

  return outdated;
}
```

### Declined Features Tracking

When user declines a new feature, record it to avoid re-prompting:

```javascript
function recordDeclinedFeature(manifest, featureType, featureName) {
  if (!manifest.declined) {
    manifest.declined = {};
  }
  if (!manifest.declined[featureType]) {
    manifest.declined[featureType] = [];
  }
  manifest.declined[featureType].push(featureName);
}
```

---

## Acceptance Criteria

- [ ] Detects new agents introduced in latest UDS version
- [ ] Detects new workflows introduced in latest UDS version
- [ ] Detects new skills available for current level
- [ ] Detects outdated commands based on version comparison
- [ ] Respects declined features list
- [ ] Records newly declined features in manifest

---

## Related Specifications

- [UPDATE-00 Update Overview](00-update-overview.md)
- [AGENT-01 Agent Installation](../agent/01-agent-installation.md)
- [WORKFLOW-01 Workflow Installation](../workflow/01-workflow-installation.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-26 | Added Marketplace two-phase validation; deprecated Claude Code Commands detection |
| 1.0.0 | 2026-01-23 | Initial specification |
