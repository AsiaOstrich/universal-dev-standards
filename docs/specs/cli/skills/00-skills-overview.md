# [SKILLS-00] Skills Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: SKILLS-00

---

## Summary

The `uds skills` command lists installed UDS skills across all configured AI agents and installation locations.

---

## Command Synopsis

```bash
uds skills [options]

Options:
  --agent <agent>        Filter by agent
  --location <loc>       Filter by location (project, user, marketplace)
  --check                Check skill integrity
  -h, --help             Display help
```

---

## Output Format

```
🎯 Installed UDS Skills

Claude Code:
   📁 Project Level (.claude/skills/)
   ├── commit-standards (v4.1.0)
   ├── testing-guide (v4.1.0)
   └── code-review (v4.1.0)

   🌐 Marketplace
   └── all-via-plugin (UDS Plugin installed)

OpenCode:
   📁 Project Level (.opencode/skill/)
   ├── commit-standards (v4.1.0)
   └── testing-guide (v4.1.0)

Summary:
   • 5 skills installed across 2 agents
   • Last updated: 2026-01-20
```

---

## Implementation

```javascript
async function skillsCommand(options, projectPath) {
  const manifest = readManifest(projectPath);

  if (!manifest) {
    console.log('UDS is not initialized. Run "uds init" first.');
    return;
  }

  const installations = manifest.skills?.installations || [];

  for (const installation of installations) {
    const { agent, level } = installation;

    if (options.agent && agent !== options.agent) continue;
    if (options.location && level !== options.location) continue;

    const skillsDir = getSkillsDirForAgent(agent, level, projectPath);
    const installedSkills = await scanInstalledSkills(skillsDir);

    displayAgentSkills(agent, level, installedSkills);

    if (options.check) {
      const integrityResults = await checkSkillsIntegrity(
        agent,
        level,
        manifest.skillHashes,
        projectPath
      );
      displayIntegrityResults(integrityResults);
    }
  }
}
```

---

## Multi-Location Scanning

```javascript
async function scanAllSkillLocations(agent, projectPath) {
  const locations = [];

  // Check project level
  const projectDir = getSkillsDirForAgent(agent, 'project', projectPath);
  if (fs.existsSync(projectDir)) {
    locations.push({ level: 'project', skills: await scanInstalledSkills(projectDir) });
  }

  // Check user level
  const userDir = getSkillsDirForAgent(agent, 'user', projectPath);
  if (fs.existsSync(userDir)) {
    locations.push({ level: 'user', skills: await scanInstalledSkills(userDir) });
  }

  // Check marketplace (claude-code only)
  if (agent === 'claude-code') {
    const hasPlugin = await checkMarketplacePlugin();
    if (hasPlugin) {
      locations.push({ level: 'marketplace', skills: ['all-via-plugin'] });
    }
  }

  return locations;
}
```

---

## Acceptance Criteria

- [ ] Lists skills for all configured agents
- [ ] Shows installation location (project/user/marketplace)
- [ ] Filters by agent and location
- [ ] Checks integrity when --check flag used
- [ ] Handles missing installations gracefully

---

## Related Specifications

- [SHARED-05 Skills Installation](../shared/skills-installation.md)
- [SHARED-06 AI Agent Paths](../shared/ai-agent-paths.md)
