# UDS CLI Specification Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable

---

## Purpose

This document provides a comprehensive overview of the UDS (Universal Development Standards) CLI architecture, serving as the entry point for all CLI-related specifications.

---

## CLI Architecture

### System Overview

```
                         ┌─────────────────────────────────┐
                         │         Manifest Core           │
                         │   .standards/manifest.json      │
                         └──────────────┬──────────────────┘
                                        │
    ┌───────────┬───────────┬───────────┼───────────┬───────────┬───────────┐
    │           │           │           │           │           │           │
    ▼           ▼           ▼           ▼           ▼           ▼           ▼
┌───────┐ ┌─────────┐ ┌───────┐ ┌───────────┐ ┌────────┐ ┌─────────┐ ┌──────┐
│ init  │ │ update  │ │ check │ │ configure │ │ skills │ │  agent  │ │ list │
│ Create│ │ Update  │ │ Verify│ │  Modify   │ │  List  │ │ Agents  │ │ List │
└───┬───┘ └────┬────┘ └───┬───┘ └─────┬─────┘ └────┬───┘ └────┬────┘ └──────┘
    │          │          │           │            │          │
    └──────────┴──────────┴───────────┴────────────┘          │
                          │                                    │
         ┌────────────────┼────────────────┐                  │
         │                │                │                  │
         ▼                ▼                ▼                  ▼
    ┌─────────┐     ┌──────────┐    ┌───────────┐      ┌───────────┐
    │ copier  │     │ hasher   │    │ generator │      │ agents-   │
    │ File I/O│     │ Hash Calc│    │ Integration│     │ installer │
    └─────────┘     └──────────┘    └───────────┘      └───────────┘
         │                │                │                  │
         └────────────────┴────────────────┘                  │
                          │                                    │
                          ▼                                    │
                 ┌───────────────┐                            │
                 │ skills-       │◄───────────────────────────┘
                 │ installer     │
                 │ Skills/Cmds   │
                 └───────────────┘

    ┌───────────────────────────────────────────────────────────────────────┐
    │                      Independent Command Groups                        │
    ├───────────────┬───────────────────┬───────────────────────────────────┤
    │   workflow    │    ai-context     │              (Future)             │
    │  ┌─────────┐  │   ┌───────────┐   │                                   │
    │  │  list   │  │   │   init    │   │                                   │
    │  │ install │  │   │ validate  │   │                                   │
    │  │  info   │  │   │  graph    │   │                                   │
    │  └─────────┘  │   └───────────┘   │                                   │
    └───────────────┴───────────────────┴───────────────────────────────────┘
```

---

## Command Inventory

### Primary Commands (9)

| Command | Complexity | Lines | Description |
|---------|------------|-------|-------------|
| `init` | Very High | 1,140 | Initialize standards in project |
| `update` | Very High | 1,410 | Update standards to latest version |
| `check` | High | 1,513 | Verify adoption status and integrity |
| `configure` | High | 956 | Modify project configuration |
| `list` | Low | 128 | List available standards |
| `skills` | Medium | 282 | List installed skills |
| `agent` | Medium | 417 | Manage AI agent definitions |
| `workflow` | Medium | 425 | Manage workflow definitions |
| `ai-context` | High | 552 | Generate AI context files |

### Subcommands (7)

| Parent | Subcommand | Description |
|--------|------------|-------------|
| `agent` | `list` | List available agents |
| `agent` | `install` | Install agent definitions |
| `agent` | `info` | Show agent information |
| `workflow` | `list` | List available workflows |
| `workflow` | `install` | Install workflow definitions |
| `workflow` | `info` | Show workflow information |
| `ai-context` | `init` | Generate .ai-context.yaml |
| `ai-context` | `validate` | Validate configuration |
| `ai-context` | `graph` | Display module dependency graph |

---

## Shared Module Inventory

| Module | Lines | Used By | Description |
|--------|-------|---------|-------------|
| `copier.js` | 196 | init, update, check, configure | File copy operations |
| `hasher.js` | 413 | init, update, check | SHA-256 hash tracking |
| `integration-generator.js` | 2,634 | init, update, configure | AI tool file generation |
| `skills-installer.js` | 726 | init, update, configure | Multi-agent skill installation |
| `agents-installer.js` | 393 | agent install | Agent definition installation |
| `workflows-installer.js` | 545 | workflow install | Workflow installation |
| `ai-agent-paths.js` | 464 | All | AI agent path configuration |
| `prompts/init.js` | 1,351 | init, update, configure | Interactive prompts |
| `prompts/integrations.js` | 469 | init, update, configure | Integration config prompts |
| `registry.js` | 207 | All | Standards registry access |
| `detector.js` | 164 | init | Project feature detection |

**Total Shared Code**: ~7,562 lines

---

## Specification Structure

### Directory Layout

```
docs/specs/cli/
├── 00-overview.md                    # This file
├── shared/                           # Shared Module Specs (7)
│   ├── manifest-schema.md            # SHARED-01
│   ├── file-operations.md            # SHARED-02
│   ├── hash-tracking.md              # SHARED-03
│   ├── integration-generation.md     # SHARED-04
│   ├── skills-installation.md        # SHARED-05
│   ├── ai-agent-paths.md             # SHARED-06
│   └── prompts.md                    # SHARED-07
│
├── init/                             # Init Command Specs (4)
│   ├── 00-init-overview.md           # INIT-00
│   ├── 01-project-detection.md       # INIT-01
│   ├── 02-configuration-flow.md      # INIT-02
│   └── 03-execution-stages.md        # INIT-03
│
├── update/                           # Update Command Specs (4)
│   ├── 00-update-overview.md         # UPDATE-00
│   ├── 01-version-checking.md        # UPDATE-01
│   ├── 02-standards-update.md        # UPDATE-02
│   └── 03-feature-detection.md       # UPDATE-03
│
├── check/                            # Check Command Specs (4)
│   ├── 00-check-overview.md          # CHECK-00
│   ├── 01-integrity-checking.md      # CHECK-01
│   ├── 02-status-display.md          # CHECK-02
│   └── 03-restore-operations.md      # CHECK-03
│
├── configure/                        # Configure Command Specs (3)
│   ├── 00-configure-overview.md      # CONFIG-00
│   ├── 01-option-types.md            # CONFIG-01
│   └── 02-ai-tools-management.md     # CONFIG-02
│
├── list/                             # List Command Specs (1)
│   └── 00-list-overview.md           # LIST-00
│
├── skills/                           # Skills Command Specs (1)
│   └── 00-skills-overview.md         # SKILLS-00
│
├── agent/                            # Agent Command Group Specs (2)
│   ├── 00-agent-overview.md          # AGENT-00
│   └── 01-agent-installation.md      # AGENT-01
│
├── workflow/                         # Workflow Command Group Specs (2)
│   ├── 00-workflow-overview.md       # WORKFLOW-00
│   └── 01-workflow-installation.md   # WORKFLOW-01
│
└── ai-context/                       # AI-Context Command Group Specs (2)
    ├── 00-ai-context-overview.md     # AICONTEXT-00
    └── 01-config-generation.md       # AICONTEXT-01
```

**Total Specs**: 7 (shared) + 23 (commands) = **30 specifications**

---

## Implementation Phases

### Phase 1: Shared Module Foundation (P0)

Foundation modules that all commands depend on.

| Order | Spec ID | Name | Rationale |
|-------|---------|------|-----------|
| 1 | SHARED-01 | Manifest Schema | Core data structure for all commands |
| 2 | SHARED-02 | File Operations | Basic file I/O operations |
| 3 | SHARED-03 | Hash Tracking | Integrity verification foundation |

### Phase 2: Core Command - Init (P1)

The most complex command that defines initial state.

| Order | Spec ID | Name | Rationale |
|-------|---------|------|-----------|
| 4 | INIT-00 | Overview | Establish overall framework |
| 5 | INIT-01 | Detection | Independent module |
| 6 | INIT-02 | Config Flow | Core business logic |
| 7 | INIT-03 | Execution | Execution details |

### Phase 3: Core Commands - Update/Check/Configure (P2)

Three major operation commands, can be parallelized.

| Order | Spec ID | Name |
|-------|---------|------|
| 8-11 | UPDATE-00 ~ 03 | Update command group |
| 12-15 | CHECK-00 ~ 03 | Check command group |
| 16-18 | CONFIG-00 ~ 02 | Configure command group |

### Phase 4: Advanced Shared Modules (P3)

More complex shared modules.

| Order | Spec ID | Name |
|-------|---------|------|
| 19 | SHARED-04 | Integration Generation |
| 20 | SHARED-05 | Skills Installation |
| 21 | SHARED-06 | AI Agent Paths |
| 22 | SHARED-07 | Prompts |

### Phase 5: Auxiliary Commands (P4)

Simple information display commands.

| Order | Spec ID | Name | Rationale |
|-------|---------|------|-----------|
| 23 | LIST-00 | List Overview | Simple, independent |
| 24 | SKILLS-00 | Skills Overview | Depends on SHARED-05 |

### Phase 6: Extended Command Groups (P5)

Agent, Workflow, AI-Context command groups.

| Order | Spec ID | Name |
|-------|---------|------|
| 25-26 | AGENT-00 ~ 01 | Agent command group |
| 27-28 | WORKFLOW-00 ~ 01 | Workflow command group |
| 29-30 | AICONTEXT-00 ~ 01 | AI-Context command group |

---

## Key Data Structures

### Manifest Schema (v3.3.0)

The manifest file (`.standards/manifest.json`) is the central data store for all UDS state:

```typescript
interface Manifest {
  version: string;                    // Manifest schema version
  upstream: {
    repo: string;                     // Source repository
    version: string;                  // UDS version installed
    installed: string;                // Installation date
  };
  level: 1 | 2 | 3;                   // Adoption level
  format: 'ai' | 'human' | 'both';    // Standard format
  standardsScope: 'minimal' | 'full'; // Scope of standards
  contentMode: 'index' | 'full' | 'minimal'; // Integration content mode

  // Installed items
  standards: string[];                // List of standard paths
  extensions: string[];               // List of extension paths
  integrations: string[];             // List of integration files

  // Configuration options
  options: {
    workflow?: string;
    merge_strategy?: string;
    commit_language?: string;
    test_levels?: string[];
  };

  // AI tools and installations
  aiTools: string[];                  // Selected AI tools
  skills: SkillsConfig;               // Skills configuration
  commands: CommandsConfig;           // Commands configuration

  // Integrity tracking
  fileHashes: Record<string, HashInfo>;
  skillHashes: Record<string, HashInfo>;
  commandHashes: Record<string, HashInfo>;
  integrationBlockHashes: Record<string, HashInfo>;
}
```

### Hash Info Structure

```typescript
interface HashInfo {
  hash: string;       // SHA-256 hash with 'sha256:' prefix
  size: number;       // File size in bytes
  installedAt?: string; // ISO timestamp
}
```

---

## Cross-Cutting Concerns

### Error Handling Pattern

All modules follow a consistent return pattern:

```typescript
interface OperationResult {
  success: boolean;
  error?: string;
  path?: string;
  [key: string]: any;
}
```

### Internationalization

- Supported locales: `en`, `zh-TW`, `zh-CN`
- Message keys defined in `i18n/messages.js`
- All user-facing strings should use i18n

### AI Agent Support Matrix

| Agent | Skills | Commands | Agents | Workflows | Marketplace |
|-------|--------|----------|--------|-----------|-------------|
| Claude Code | ✅ | ✅ | ✅ | ✅ | ✅ |
| OpenCode | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cursor | ❌ | ❌ | ❌ | ❌ | ❌ |
| Windsurf | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cline | ✅ | ✅ | ❌ | ✅ | ❌ |
| Roo | ✅ | ✅ | ❌ | ✅ | ❌ |
| Aider | ❌ | ❌ | ❌ | ❌ | ❌ |
| Copilot | ❌ | ❌ | ❌ | ❌ | ❌ |
| Antigravity | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## Related Documents

- [Manifest Schema Spec](shared/manifest-schema.md) - Detailed manifest structure
- [Core Standards](../../core/) - UDS core standards
- [CLI Source Code](../../../cli/src/) - Implementation reference

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification overview |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
