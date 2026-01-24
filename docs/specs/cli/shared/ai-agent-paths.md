# [SHARED-06] AI Agent Paths Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: SHARED-06

---

## Summary

This specification defines the AI agent paths configuration module (`ai-agent-paths.js`) which provides centralized path configuration for all supported AI agents.

---

## Detailed Design

### Module Location

```
cli/src/config/ai-agent-paths.js
```

### Agent Configuration Structure

```typescript
interface AgentPathConfig {
  name: string;
  skills?: {
    project: string;
    user: string;
  };
  commands?: {
    project: string;
    user: string;
  };
  agents?: {
    project: string;
    user: string;
  };
  workflows?: {
    project: string;
    user: string;
  };
  supportsSkills: boolean;
  supportsCommands: boolean;
  supportsAgents: boolean;
  supportsWorkflows: boolean;
  supportsMarketplace: boolean;
  supportsTask: boolean;
}
```

### Agent Configurations

| Agent | Skills | Commands | Agents | Workflows | Marketplace | Task |
|-------|--------|----------|--------|-----------|-------------|------|
| claude-code | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| opencode | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| cursor | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| windsurf | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| cline | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| roo | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| aider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| copilot | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| antigravity | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

### Main API

```typescript
function getAgentConfig(agent: string): AgentPathConfig;
function getAgentDisplayName(agent: string): string;
function getSkillsDirForAgent(agent: string, level: string, projectPath: string): string;
function getCommandsDirForAgent(agent: string, level: string, projectPath: string): string;
function getAgentsDirForAgent(agent: string, level: string, projectPath: string): string;
function getWorkflowsDirForAgent(agent: string, level: string, projectPath: string): string;
```

### Path Resolution

```javascript
function getSkillsDirForAgent(agent, level, projectPath) {
  const config = AI_AGENT_PATHS[agent];
  if (!config?.skills) {
    throw new Error(`Agent ${agent} does not support skills`);
  }

  const pathTemplate = level === 'user' ? config.skills.user : config.skills.project;
  return pathTemplate.startsWith('~')
    ? pathTemplate.replace('~', os.homedir())
    : path.join(projectPath, pathTemplate);
}
```

---

## Acceptance Criteria

- [ ] All 9 agents have correct configurations
- [ ] Path resolution handles ~ for user directories
- [ ] Capability flags are accurate per agent
- [ ] Functions throw for unsupported operations

---

## Related Specifications

- [SHARED-07 AI Agent Paths Update](ai-agent-paths-update.md) - January 2026 configuration updates
- [SHARED-05 Skills Installation](skills-installation.md)
- [INIT-02 Configuration Flow](../init/02-configuration-flow.md)
