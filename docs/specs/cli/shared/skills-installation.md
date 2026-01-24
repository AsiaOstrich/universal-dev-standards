# [SHARED-05] Skills Installation Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: SHARED-05

---

## Summary

This specification defines the skills installation module (`skills-installer.js`) which handles installing UDS skills to multiple AI agents at various locations.

---

## Detailed Design

### Module Location

```
cli/src/utils/skills-installer.js
```

### Installation Locations

| Location | Path Pattern | Supported Agents |
|----------|--------------|------------------|
| project | `.{agent}/skills/` | claude-code, opencode, cline, roo, antigravity |
| user | `~/.{agent}/skills/` | claude-code, opencode |
| marketplace | Plugin installation | claude-code only |

### Skills by Level

| Level | Skills |
|-------|--------|
| 1 | commit-standards |
| 2 | commit-standards, testing-guide, code-review |
| 3 | All skills (commit-standards, testing-guide, code-review, release-standards, spec-driven-dev, etc.) |

### Main API

```typescript
interface AgentInstallation {
  agent: string;
  level: 'project' | 'user' | 'marketplace';
}

interface InstallResult {
  success: boolean;
  installed: string[];
  errors: string[];
  fileHashes: Record<string, HashInfo>;
}

async function installSkillsForAgent(
  agent: string,
  level: 'project' | 'user',
  skillNames: string[],
  projectPath: string
): Promise<InstallResult>;

async function installSkillsToMultipleAgents(
  installations: AgentInstallation[],
  skillNames: string[],
  projectPath: string
): Promise<{
  installations: InstallResult[];
  totalInstalled: number;
  totalErrors: number;
  allFileHashes: Record<string, HashInfo>;
}>;
```

### Installation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Skills Installation Flow                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   For each agent installation:                                               │
│                                                                              │
│   1. Determine target directory                                              │
│      └── getSkillsDirForAgent(agent, level, projectPath)                    │
│                                                                              │
│   2. For each skill:                                                         │
│      a. Create skill directory                                               │
│      b. Copy SKILL.md                                                        │
│      c. Copy supporting files (*.yaml, examples/, etc.)                      │
│      d. Compute file hashes                                                  │
│                                                                              │
│   3. Return results                                                          │
│      └── { success, installed, errors, fileHashes }                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Skill Directory Structure

```
.claude/skills/
└── commit-standards/
    ├── SKILL.md              # Main skill file
    ├── commit-message.ai.yaml # AI-optimized content
    └── examples/             # Example files
        └── example.md
```

---

## Acceptance Criteria

- [ ] Installs skills to correct directories per agent
- [ ] Supports project and user level installations
- [ ] Handles marketplace flag for claude-code
- [ ] Computes and returns file hashes
- [ ] Reports errors without stopping batch installation
- [ ] Creates directories as needed

---

## Related Specifications

- [SHARED-06 AI Agent Paths](ai-agent-paths.md)
- [INIT-03 Execution Stages](../init/03-execution-stages.md)
