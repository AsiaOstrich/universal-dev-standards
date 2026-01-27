# [INIT-02] Configuration Flow Specification

**Version**: 1.3.0
**Last Updated**: 2026-01-26
**Status**: Stable
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
| `displayLanguage` | string | `promptDisplayLanguage()` | `--locale` or system detection |
| `level` | 1 \| 2 \| 3 | `promptLevel()` | `--level` |
| `aiTools` | string[] | `promptAITools()` | `--ai-tools` |
| `skillsLocation` | string | `promptSkillsInstallLocation()` | Default: project |
| `standardsScope` | string | `promptStandardsScope()` | Default: minimal |
| `contentMode` | string | `promptContentMode()` | Default: index |
| `format` | string | `promptFormat()` | Default: ai |
| `language` | string[] | `promptLanguage()` | Auto from detection |
| `framework` | string[] | `promptFramework()` | Auto from detection |
| `installSkills` | boolean | `promptCommandsInstallation()` | `!--skip-skills` |
| `installCommands` | boolean | `promptCommandsInstallation()` | `!--skip-commands` |
| `options.display_language` | string | From `displayLanguage` | From `displayLanguage` |
| `options.workflow` | string | Derived from level | Default based on level |
| `options.merge_strategy` | string | Derived from level | Default: squash |
| `options.commit_language` | string | `promptIntegrationConfig()` | Default: english |

> **Note**: The `locale` parameter has been replaced by `displayLanguage`. Locale extensions (zh-tw, zh-cn) are now auto-installed based on the selected display language.

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
│   │ Step 1: Display Language (FIRST PROMPT)                             │   │
│   │                                                                      │   │
│   │ promptDisplayLanguage()                                             │   │
│   │                                                                      │   │
│   │ ? Select display language / 選擇顯示語言:                           │   │
│   │   ○ English (Default for international teams)                       │   │
│   │   ○ 繁體中文 (Traditional Chinese)                                  │   │
│   │   ○ 简体中文 (Simplified Chinese)                                   │   │
│   │                                                                      │   │
│   │ Note: This sets CLI language and determines locale extension        │   │
│   │       installation. All subsequent prompts use selected language.   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 2: AI Tools Selection                                          │   │
│   │                                                                      │   │
│   │ promptAITools(detected.aiTools)                                     │   │
│   │                                                                      │   │
│   │ ? Select AI tools to configure:                                     │   │
│   │   ◉ Claude Code - detected                                          │   │
│   │   ◉ Cursor (.cursorrules) - detected                                │   │
│   │   ○ Windsurf (.windsurfrules)                                       │   │
│   │   ○ Cline (.clinerules)                                             │   │
│   │   ○ GitHub Copilot (.github/copilot-instructions.md)                │   │
│   │   ○ Google Antigravity (INSTRUCTIONS.md)                            │   │
│   │   ○ OpenAI Codex (AGENTS.md)                                        │   │
│   │   ○ OpenCode (AGENTS.md)                                            │   │
│   │   ○ Gemini CLI (GEMINI.md)                                          │   │
│   │                                                                      │   │
│   │ Note: No separators or "None" option. At least one must be selected.│   │
│   │       If none selected, init exits with explanation.                │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                    ┌───────┴───────┐                                        │
│                    │ aiTools.length │                                        │
│                    │    === 0?      │                                        │
│                    └───────┬───────┘                                        │
│                      Yes   │   No                                            │
│                       │    │                                                 │
│          ┌────────────┘    └────────────┐                                   │
│          ▼                              ▼                                    │
│   ┌──────────────────────┐   ┌─────────────────────────────────────────────┐│
│   │ EXIT with message:   │   │ Continue to Step 3...                       ││
│   │                      │   └─────────────────────────────────────────────┘│
│   │ "No AI tools         │                                                  │
│   │  selected.           │                                                  │
│   │  UDS provides        │                                                  │
│   │  standards for AI    │                                                  │
│   │  coding assistants.  │                                                  │
│   │  Without an AI tool, │                                                  │
│   │  there is nothing    │                                                  │
│   │  to install."        │                                                  │
│   │                      │                                                  │
│   │ process.exit(0)      │                                                  │
│   └──────────────────────┘                                                  │
│                                                                              │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 3: Skills Installation Location                                │   │
│   │                                                                      │   │
│   │ promptSkillsInstallLocation(selectedAgents)                         │   │
│   │                                                                      │   │
│   │ ? Where would you like to install skills?                           │   │
│   │   ◉ Project level (.claude/skills/) - Recommended                   │   │
│   │   ○ User level (~/.claude/skills/)                                  │   │
│   │   ○ Via Marketplace (plugin)                                        │   │
│   │                                                                      │   │
│   │ Note: Shows per-agent options if multiple agents selected           │   │
│   │       Only shown for agents that support Skills                     │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 4: Slash Commands Installation                                 │   │
│   │                                                                      │   │
│   │ promptCommandsInstallation(selectedAgents)                          │   │
│   │                                                                      │   │
│   │ ? Install UDS slash commands?                                       │   │
│   │   ◉ Yes - Install /uds-init, /uds-check commands                    │   │
│   │   ○ No - Skip command installation                                  │   │
│   │                                                                      │   │
│   │ Note: Only shown for agents that support Commands                   │   │
│   │       Claude Code uses Skills for commands (v2.1.3+ merged)         │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 5: Adoption Level                                              │   │
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
│   │ Step 6: Standards Scope                                             │   │
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
│   │ Step 7: Format Selection                                            │   │
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
│   │ Step 8: Standard Options                                            │   │
│   │                                                                      │   │
│   │ promptStandardOptions(level)                                        │   │
│   │                                                                      │   │
│   │ Prompts for workflow, merge strategy, commit language, test levels  │   │
│   │ based on selected adoption level.                                   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 9: Language Extensions (Programming Languages)                 │   │
│   │                                                                      │   │
│   │ promptLanguage(detected.languages)                                  │   │
│   │                                                                      │   │
│   │ ? Include language-specific standards for detected languages?       │   │
│   │   ◉ TypeScript (detected)                                           │   │
│   │   ◉ JavaScript (detected)                                           │   │
│   │   ○ C# (csharp extension)                                           │   │
│   │   ○ PHP (php extension)                                             │   │
│   │                                                                      │   │
│   │ Note: This is for PROGRAMMING language extensions (C#, PHP, etc.)   │   │
│   │       NOT display language (which was set in Step 1)                │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Step 10: Framework Extensions (if detected)                         │   │
│   │                                                                      │   │
│   │ promptFramework(detected.frameworks)                                │   │
│   │                                                                      │   │
│   │ ? Include framework-specific standards?                             │   │
│   │   ◉ React (detected)                                                │   │
│   │   ○ Vue                                                             │   │
│   │   ○ Fat-Free (PHP framework)                                        │   │
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
│     displayLanguage: options.locale || detectSystemLanguage() || 'en',      │
│     level: options.level || 2,                                              │
│     aiTools: options.aiTools?.split(',') || detected.aiTools || ['claude-code'],│
│     skillsLocation: 'project',                                              │
│     standardsScope: 'minimal',                                              │
│     contentMode: 'index',                                                   │
│     format: 'ai',                                                           │
│     languages: detected.languages,                                          │
│     frameworks: detected.frameworks,                                        │
│     installSkills: !options.skipSkills,                                     │
│     installCommands: !options.skipCommands,                                 │
│     options: {                                                              │
│       display_language: displayLanguage,                                    │
│       workflow: 'github-flow',                                              │
│       merge_strategy: 'squash',                                             │
│       commit_language: 'english'                                            │
│     }                                                                       │
│   }                                                                         │
│                                                                              │
│   Note: Locale extension (zh-tw.md, zh-cn.md) is auto-installed based on    │
│         displayLanguage selection. No separate locale prompt needed.                                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prompt Functions

### promptDisplayLanguage (NEW - v1.2.0)

```typescript
/**
 * Prompt user to select display language (FIRST PROMPT in init flow)
 *
 * This sets the language for:
 * - CLI messages (all subsequent prompts)
 * - AI Agent instructions language
 * - Auto-installation of locale extension (zh-tw.md, zh-cn.md)
 *
 * @returns Promise<'en' | 'zh-tw' | 'zh-cn'>
 */
async function promptDisplayLanguage(): Promise<'en' | 'zh-tw' | 'zh-cn'>;
```

**Behavior:**
- Uses bilingual prompt text (before language is selected)
- Detects system language for smart default
- Immediately switches CLI language after selection
- Auto-installs corresponding locale extension (zh-tw.md, zh-cn.md)

**Design Rationale:**
- First prompt ensures all subsequent prompts use user's preferred language
- Merges the old `promptLocale()` functionality (locale extension installation)
- Improves UX by reducing number of prompts

### promptAITools

```typescript
/**
 * Prompt user to select AI tools for configuration
 *
 * @param detected - Pre-detected AI tools (will be pre-selected)
 * @returns Promise<string[]> - Selected AI tool IDs (may be empty)
 */
async function promptAITools(detected: string[]): Promise<string[]>;
```

**Behavior:**
- Shows all 9 AI tools as checkboxes in a flat list (no separators)
- Pre-selects detected tools
- Returns empty array if nothing selected (caller handles exit)
- No "None/Skip" option - users simply deselect all to indicate no selection

**Exit on Empty Selection (v1.3.0):**
- If `promptAITools` returns empty array, `initCommand` exits with explanation
- Exit message explains that UDS requires at least one AI tool
- Uses `process.exit(0)` for clean exit

**UI Simplification (v1.3.0):**
- Removed separator lines (previously grouped by capability)
- Removed "(推薦)" / "(Recommended)" tag from Claude Code
- Simplified tool descriptions (removed redundant text like "- Gemini Agent")

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

### ~~promptLocale~~ (DEPRECATED - v1.2.0)

> **DEPRECATED**: This function has been removed. Locale selection is now handled by `promptDisplayLanguage()` which is the first prompt in the init flow. Locale extensions (zh-tw.md, zh-cn.md) are automatically installed based on the display language selection.

```typescript
// REMOVED - replaced by promptDisplayLanguage()
// async function promptLocale(): Promise<'en' | 'zh-TW' | 'zh-CN'>;
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

**Agent-specific behavior:**
- **Claude Code**: Uses Skills instead of Commands (v2.1.3+ merged Commands/Skills). Not shown in Commands installation prompt.
- **Other agents**: Use dedicated Commands directories if supported.

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
  /** Display language for CLI and AI Agent instructions */
  displayLanguage: 'en' | 'zh-tw' | 'zh-cn';

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
| 1.3.0 | 2026-01-26 | **UI Simplification**: Removed separator lines from AI tools prompt, removed "None/Skip" option, exit with explanation when no tools selected |
| 1.2.0 | 2026-01-26 | **Breaking**: Refactored init flow - Display Language now first prompt, removed promptLocale(), locale extensions auto-installed based on display language |
| 1.1.0 | 2026-01-26 | Added note: Claude Code uses Skills for commands (v2.1.3+ merged) |
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
