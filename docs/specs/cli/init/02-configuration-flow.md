# [INIT-02] Configuration Flow Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: INIT-02

---

## Summary

This specification defines the configuration collection flow for the `uds init` command, including both interactive prompts and non-interactive CLI options.

---

## Motivation

The configuration flow must:
1. **Guide Users**: Walk through options systematically
2. **Use Defaults**: Leverage detection for smart defaults
3. **Support Automation**: Work in CI/CD with CLI options
4. **Be Flexible**: Allow partial configuration

---

## Detailed Design

### Configuration Parameters

| Parameter | Type | Interactive Source | Non-Interactive Source |
|-----------|------|-------------------|----------------------|
| `level` | 1 \| 2 \| 3 | `promptLevel()` | `--level` |
| `aiTools` | string[] | `promptAITools()` | `--ai-tools` |
| `skillsLocation` | string | `promptSkillsInstallLocation()` | Default: project |
| `standardsScope` | string | `promptStandardsScope()` | Default: minimal |
| `contentMode` | string | `promptContentMode()` | Default: index |
| `locale` | string | `promptLocale()` | `--locale` |
| `format` | string | `promptFormat()` | Default: ai |
| `language` | string[] | `promptLanguage()` | Auto from detection |
| `framework` | string[] | `promptFramework()` | Auto from detection |
| `installSkills` | boolean | `promptCommandsInstallation()` | `!--skip-skills` |
| `installCommands` | boolean | `promptCommandsInstallation()` | `!--skip-commands` |
| `options.workflow` | string | Derived from level | Default based on level |
| `options.merge_strategy` | string | Derived from level | Default: squash |
| `options.commit_language` | string | `promptIntegrationConfig()` | Default: english |

---

## Configuration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Configuration Collection Flow                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Mode Determination                                │   │
│   │                                                                      │   │
│   │   Is --yes flag set?                                                │   │
│   │   ├── Yes → Non-Interactive Mode                                    │   │
│   │   └── No  → Interactive Mode                                        │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ══════════════════════════════════════════════════════════════════════    │
│   INTERACTIVE MODE                                                          │
│   ══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 1: AI Tools Selection                                          │   │
│   │                                                                      │   │
│   │ promptAITools(detected.aiTools)                                     │   │
│   │                                                                      │   │
│   │ ? Select AI tools to configure:                                     │   │
│   │   ◉ Claude Code (CLAUDE.md) - detected                              │   │
│   │   ◉ Cursor (.cursorrules) - detected                                │   │
│   │   ○ Windsurf (.windsurfrules)                                       │   │
│   │   ○ Cline (.clinerules)                                             │   │
│   │   ○ GitHub Copilot                                                  │   │
│   │   ○ OpenCode                                                        │   │
│   │   ○ Aider                                                           │   │
│   │   ○ Roo                                                             │   │
│   │   ○ Antigravity                                                     │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 2: Skills Installation Location                                │   │
│   │                                                                      │   │
│   │ promptSkillsInstallLocation(selectedAgents)                         │   │
│   │                                                                      │   │
│   │ ? Where would you like to install skills?                           │   │
│   │   ◉ Project level (.claude/skills/) - Recommended                   │   │
│   │   ○ User level (~/.claude/skills/)                                  │   │
│   │   ○ Via Marketplace (plugin)                                        │   │
│   │                                                                      │   │
│   │ Note: Shows per-agent options if multiple agents selected           │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 3: Adoption Level                                              │   │
│   │                                                                      │   │
│   │ promptLevel()                                                       │   │
│   │                                                                      │   │
│   │ ? Select adoption level:                                            │   │
│   │   ○ Level 1 (Essential) - Core standards only                       │   │
│   │   ◉ Level 2 (Standard) - Core + workflow standards                  │   │
│   │   ○ Level 3 (Comprehensive) - All standards                         │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 4: Standards Scope                                             │   │
│   │                                                                      │   │
│   │ promptStandardsScope()                                              │   │
│   │                                                                      │   │
│   │ ? Select standards scope:                                           │   │
│   │   ◉ Minimal - Core standards only                                   │   │
│   │   ○ Full - All standards including extensions                       │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 5: Content Mode (Integration Files)                            │   │
│   │                                                                      │   │
│   │ promptContentMode()                                                 │   │
│   │                                                                      │   │
│   │ ? How should standards appear in AI tool files?                     │   │
│   │   ○ Minimal - References only                                       │   │
│   │   ◉ Index - Standard index with descriptions                        │   │
│   │   ○ Full - Embed full content                                       │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 6: Language Extensions (if detected)                           │   │
│   │                                                                      │   │
│   │ promptLanguage(detected.languages)                                  │   │
│   │                                                                      │   │
│   │ ? Include language-specific standards for detected languages?       │   │
│   │   ◉ TypeScript (detected)                                           │   │
│   │   ◉ JavaScript (detected)                                           │   │
│   │   ○ Python                                                          │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 7: Framework Extensions (if detected)                          │   │
│   │                                                                      │   │
│   │ promptFramework(detected.frameworks)                                │   │
│   │                                                                      │   │
│   │ ? Include framework-specific standards?                             │   │
│   │   ◉ React (detected)                                                │   │
│   │   ○ Vue                                                             │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 8: Locale Selection                                            │   │
│   │                                                                      │   │
│   │ promptLocale()                                                      │   │
│   │                                                                      │   │
│   │ ? Select documentation locale:                                      │   │
│   │   ◉ English (en)                                                    │   │
│   │   ○ 繁體中文 (zh-TW)                                                │   │
│   │   ○ 简体中文 (zh-CN)                                                │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 9: Format Selection                                            │   │
│   │                                                                      │   │
│   │ promptFormat()                                                      │   │
│   │                                                                      │   │
│   │ ? Select standard file format:                                      │   │
│   │   ◉ AI-optimized (.ai.yaml)                                         │   │
│   │   ○ Human-readable (.md)                                            │   │
│   │   ○ Both formats                                                    │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 10: Slash Commands Installation                                │   │
│   │                                                                      │   │
│   │ promptCommandsInstallation(selectedAgents)                          │   │
│   │                                                                      │   │
│   │ ? Install UDS slash commands?                                       │   │
│   │   ◉ Yes - Install /uds-init, /uds-check commands                    │   │
│   │   ○ No - Skip command installation                                  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 11: Integration Configuration                                  │   │
│   │                                                                      │   │
│   │ promptIntegrationConfig(aiTools, detected)                          │   │
│   │                                                                      │   │
│   │ ? Commit message language preference:                               │   │
│   │   ◉ English                                                         │   │
│   │   ○ Chinese                                                         │   │
│   │   ○ Bilingual                                                       │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ══════════════════════════════════════════════════════════════════════    │
│   NON-INTERACTIVE MODE (--yes flag)                                         │
│   ══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│   Apply defaults:                                                           │
│   {                                                                         │
│     level: options.level || 2,                                              │
│     aiTools: options.aiTools?.split(',') || detected.aiTools || ['claude-code'],│
│     skillsLocation: 'project',                                              │
│     standardsScope: 'minimal',                                              │
│     contentMode: 'index',                                                   │
│     locale: options.locale || detectSystemLocale() || 'en',                 │
│     format: 'ai',                                                           │
│     languages: detected.languages,                                          │
│     frameworks: detected.frameworks,                                        │
│     installSkills: !options.skipSkills,                                     │
│     installCommands: !options.skipCommands,                                 │
│     options: {                                                              │
│       workflow: 'github-flow',                                              │
│       merge_strategy: 'squash',                                             │
│       commit_language: 'english'                                            │
│     }                                                                       │
│   }                                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prompt Functions

### promptAITools

```typescript
/**
 * Prompt user to select AI tools for configuration
 *
 * @param detected - Pre-detected AI tools (will be pre-selected)
 * @returns Promise<string[]> - Selected AI tool IDs
 */
async function promptAITools(detected: string[]): Promise<string[]>;
```

**Behavior:**
- Shows all 9 AI tools as checkboxes
- Pre-selects detected tools
- Requires at least one selection
- Groups by capability (skills-capable vs integration-only)

### promptSkillsInstallLocation

```typescript
/**
 * Prompt for skills installation location
 *
 * @param agents - Selected AI agents
 * @param projectPath - Project root path
 * @returns Promise<SkillsLocationResult>
 */
async function promptSkillsInstallLocation(
  agents: string[],
  projectPath: string
): Promise<SkillsLocationResult>;

interface SkillsLocationResult {
  /** Per-agent installation decisions */
  installations: AgentInstallation[];
  /** Overall skills enabled flag */
  enabled: boolean;
}

interface AgentInstallation {
  agent: string;
  level: 'project' | 'user' | 'marketplace';
}
```

**Behavior:**
- For single agent: Show simple location choice
- For multiple agents: Allow per-agent location selection
- Filter options by agent capability (marketplace only for claude-code)

### promptLevel

```typescript
/**
 * Prompt for adoption level
 *
 * @returns Promise<1 | 2 | 3>
 */
async function promptLevel(): Promise<1 | 2 | 3>;
```

**Options:**
| Level | Name | Description |
|-------|------|-------------|
| 1 | Essential | Core standards only (anti-hallucination, checkin) |
| 2 | Standard | Level 1 + workflow, testing, code review |
| 3 | Comprehensive | All standards including advanced topics |

### promptStandardsScope

```typescript
/**
 * Prompt for standards scope
 *
 * @returns Promise<'minimal' | 'full'>
 */
async function promptStandardsScope(): Promise<'minimal' | 'full'>;
```

**Options:**
| Scope | Description |
|-------|-------------|
| minimal | Core standards only |
| full | All standards including language/framework extensions |

### promptContentMode

```typescript
/**
 * Prompt for integration file content mode
 *
 * @returns Promise<'minimal' | 'index' | 'full'>
 */
async function promptContentMode(): Promise<'minimal' | 'index' | 'full'>;
```

**Options:**
| Mode | Description | File Size Impact |
|------|-------------|-----------------|
| minimal | Reference links only | ~1KB |
| index | Standard index with descriptions | ~5-10KB |
| full | Embed full standard content | ~50-100KB |

### promptLocale

```typescript
/**
 * Prompt for documentation locale
 *
 * @returns Promise<'en' | 'zh-TW' | 'zh-CN'>
 */
async function promptLocale(): Promise<'en' | 'zh-TW' | 'zh-CN'>;
```

### promptFormat

```typescript
/**
 * Prompt for standard file format
 *
 * @returns Promise<'ai' | 'human' | 'both'>
 */
async function promptFormat(): Promise<'ai' | 'human' | 'both'>;
```

**Options:**
| Format | File Extension | Description |
|--------|---------------|-------------|
| ai | .ai.yaml | Structured YAML for AI consumption |
| human | .md | Markdown for human reading |
| both | Both | Install both formats |

### promptLanguage

```typescript
/**
 * Prompt for language extensions
 *
 * @param detected - Pre-detected languages
 * @returns Promise<string[]>
 */
async function promptLanguage(detected: string[]): Promise<string[]>;
```

### promptFramework

```typescript
/**
 * Prompt for framework extensions
 *
 * @param detected - Pre-detected frameworks
 * @returns Promise<string[]>
 */
async function promptFramework(detected: string[]): Promise<string[]>;
```

### promptCommandsInstallation

```typescript
/**
 * Prompt for slash commands installation
 *
 * @param agents - Selected AI agents
 * @returns Promise<boolean>
 */
async function promptCommandsInstallation(agents: string[]): Promise<boolean>;
```

### promptIntegrationConfig

```typescript
/**
 * Prompt for integration-specific configuration
 *
 * @param aiTools - Selected AI tools
 * @param detected - Detection results
 * @param hasExisting - Whether existing integrations exist
 * @returns Promise<IntegrationConfig>
 */
async function promptIntegrationConfig(
  aiTools: string[],
  detected: DetectionResult,
  hasExisting: boolean
): Promise<IntegrationConfig>;

interface IntegrationConfig {
  /** Categories to include */
  categories: string[];
  /** Detail level */
  detailLevel: 'summary' | 'detailed';
  /** Commit message language */
  language: 'english' | 'chinese' | 'bilingual';
  /** Merge strategy */
  mergeStrategy: 'merge' | 'squash' | 'rebase';
}
```

---

## Validation Rules

### AI Tools Validation

```javascript
function validateAITools(selected) {
  if (!selected || selected.length === 0) {
    return 'At least one AI tool must be selected';
  }

  const valid = [
    'claude-code', 'cursor', 'windsurf', 'cline',
    'copilot', 'opencode', 'aider', 'roo', 'antigravity'
  ];

  for (const tool of selected) {
    if (!valid.includes(tool)) {
      return `Invalid AI tool: ${tool}`;
    }
  }

  return null; // Valid
}
```

### Level Validation

```javascript
function validateLevel(level) {
  if (![1, 2, 3].includes(level)) {
    return 'Level must be 1, 2, or 3';
  }
  return null;
}
```

### Skills Location Validation

```javascript
function validateSkillsLocation(location, agent) {
  const agentConfig = getAgentConfig(agent);

  if (location === 'marketplace' && !agentConfig.supportsMarketplace) {
    return `${agent} does not support marketplace installation`;
  }

  if (location === 'user' || location === 'project') {
    if (!agentConfig.supportsSkills) {
      return `${agent} does not support skills`;
    }
  }

  return null;
}
```

---

## Configuration Result Structure

```typescript
interface InitConfiguration {
  /** Selected AI tools */
  aiTools: string[];

  /** Adoption level (1-3) */
  level: 1 | 2 | 3;

  /** Standard file format */
  format: 'ai' | 'human' | 'both';

  /** Standards scope */
  standardsScope: 'minimal' | 'full';

  /** Integration content mode */
  contentMode: 'minimal' | 'index' | 'full';

  /** Documentation locale */
  locale: 'en' | 'zh-TW' | 'zh-CN';

  /** Language extensions to install */
  languages: string[];

  /** Framework extensions to install */
  frameworks: string[];

  /** Skills configuration */
  skills: {
    enabled: boolean;
    installations: AgentInstallation[];
  };

  /** Commands configuration */
  commands: {
    enabled: boolean;
    installations: AgentInstallation[];
  };

  /** Standard options */
  options: {
    workflow: string;
    merge_strategy: string;
    commit_language: string;
    test_levels?: string[];
  };
}
```

---

## Acceptance Criteria

- [ ] All 11 configuration steps work in interactive mode
- [ ] Non-interactive mode applies correct defaults
- [ ] CLI options override defaults properly
- [ ] Validation catches invalid inputs
- [ ] Detected items are pre-selected
- [ ] Agent-specific options are filtered correctly
- [ ] Configuration result contains all required fields

---

## Dependencies

| Spec ID | Name | Dependency Type |
|---------|------|-----------------|
| INIT-01 | Project Detection | Input data |
| SHARED-06 | AI Agent Paths | Agent capabilities |
| SHARED-07 | Prompts | Prompt implementations |

---

## Related Specifications

- [INIT-00 Init Overview](00-init-overview.md) - Parent specification
- [INIT-01 Project Detection](01-project-detection.md) - Detection input
- [INIT-03 Execution Stages](03-execution-stages.md) - Uses configuration

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
