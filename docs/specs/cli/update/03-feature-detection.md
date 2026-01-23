# [UPDATE-03] Feature Detection Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
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

### Detection Logic

```javascript
async function detectNewFeatures(manifest, projectPath) {
  const results = {
    agents: [],
    workflows: [],
    skills: []
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
- [ ] Respects declined features list
- [ ] Records newly declined features in manifest

---

## Related Specifications

- [UPDATE-00 Update Overview](00-update-overview.md)
- [AGENT-01 Agent Installation](../agent/01-agent-installation.md)
- [WORKFLOW-01 Workflow Installation](../workflow/01-workflow-installation.md)
