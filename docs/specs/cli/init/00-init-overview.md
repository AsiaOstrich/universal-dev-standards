# [INIT-00] Init Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: INIT-00

---

## Summary

The `uds init` command initializes Universal Development Standards (UDS) in a project. It is the primary entry point for adopting UDS and handles project detection, configuration collection, file installation, and manifest creation.

---

## Motivation

The init command provides:
1. **Guided Setup**: Interactive prompts for configuration
2. **Project Awareness**: Detects existing tech stack and AI tools
3. **Multi-Agent Support**: Installs skills to multiple AI agents
4. **Flexible Adoption**: Supports minimal to full adoption levels

---

## Command Synopsis

```bash
uds init [options]

Options:
  -y, --yes              Non-interactive mode with defaults
  -l, --level <level>    Adoption level (1, 2, or 3)
  -f, --force            Overwrite existing installation
  --locale <locale>      Set locale (en, zh-TW, zh-CN)
  --ai-tools <tools>     Comma-separated AI tools
  --skip-skills          Skip skills installation
  --skip-commands        Skip commands installation
  -h, --help             Display help
```

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           uds init Command Flow                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                                           │
│   │    Entry     │                                                           │
│   │  initCommand │                                                           │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │   Stage 1    │────▶│   Stage 2    │────▶│   Stage 3    │                │
│   │  Detection   │     │Configuration │     │  Execution   │                │
│   └──────────────┘     └──────────────┘     └──────────────┘                │
│          │                    │                    │                         │
│          ▼                    ▼                    ▼                         │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │ detectAll()  │     │ Interactive  │     │ Copy Files   │                │
│   │ - Languages  │     │   Prompts    │     │ Gen Integ.   │                │
│   │ - Frameworks │     │ - AI Tools   │     │ Install Skills│               │
│   │ - AI Tools   │     │ - Level      │     │ Install Cmds │                │
│   │ - CI/CD      │     │ - Options    │     │ Write Manifest│               │
│   └──────────────┘     └──────────────┘     └──────────────┘                │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                        Output Artifacts                               │  │
│   ├──────────────────────────────────────────────────────────────────────┤  │
│   │  .standards/                  AI Tool Integrations                    │  │
│   │  ├── manifest.json            ├── CLAUDE.md                           │  │
│   │  ├── core/                    ├── .cursorrules                        │  │
│   │  │   ├── anti-hallucination.md├── .windsurfrules                      │  │
│   │  │   ├── checkin-standards.md ├── .clinerules                         │  │
│   │  │   └── ...                  ├── .github/copilot-instructions.md     │  │
│   │  └── extensions/              └── ...                                 │  │
│   │      └── languages/                                                   │  │
│   │          └── ...              Skills/Commands                         │  │
│   │                               ├── .claude/skills/                     │  │
│   │                               ├── .claude/commands/                   │  │
│   │                               └── ...                                 │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Execution Stages

### Stage 1: Project Detection

**Purpose**: Analyze project structure to provide intelligent defaults.

| Detection Type | Examples | Used For |
|----------------|----------|----------|
| Languages | JavaScript, TypeScript, Python, Go | Language-specific extensions |
| Frameworks | React, Vue, Express, Django | Framework-specific standards |
| AI Tools | .cursorrules, CLAUDE.md, etc. | Pre-select detected tools |
| CI/CD | GitHub Actions, GitLab CI | CI integration recommendations |
| Package Managers | npm, yarn, pnpm, pip | Install script generation |

See: [INIT-01 Project Detection](01-project-detection.md)

### Stage 2: Configuration Collection

**Purpose**: Gather user preferences through prompts or CLI options.

| Configuration | Interactive | Non-Interactive Default |
|---------------|-------------|------------------------|
| AI Tools | Multi-select prompt | All detected tools |
| Adoption Level | Single-select prompt | Level 2 |
| Skills Location | Single-select prompt | Project level |
| Standards Scope | Single-select prompt | Minimal |
| Content Mode | Single-select prompt | Index |
| Locale | Single-select prompt | System locale or 'en' |
| Format | Single-select prompt | 'ai' |

See: [INIT-02 Configuration Flow](02-configuration-flow.md)

### Stage 3: Execution

**Purpose**: Install files and generate configurations.

| Step | Description | Output |
|------|-------------|--------|
| Copy Standards | Copy core standards based on level | `.standards/core/*.md` |
| Copy Extensions | Copy language/framework extensions | `.standards/extensions/*.md` |
| Generate Integrations | Create AI tool config files | `CLAUDE.md`, `.cursorrules`, etc. |
| Install Skills | Install skills to AI agents | `.claude/skills/`, etc. |
| Install Commands | Install slash commands | `.claude/commands/`, etc. |
| Write Manifest | Create/update manifest.json | `.standards/manifest.json` |

See: [INIT-03 Execution Stages](03-execution-stages.md)

---

## State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Init Command State Machine                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────┐                                                                │
│   │  IDLE   │                                                                │
│   └────┬────┘                                                                │
│        │ init()                                                              │
│        ▼                                                                     │
│   ┌─────────────┐                                                            │
│   │ CHECKING    │──── isInitialized() ────▶ Prompt: Reinitialize?           │
│   │ EXISTING    │                                  │                         │
│   └──────┬──────┘                                  │ --force or yes          │
│          │ not initialized                         ▼                         │
│          │◀────────────────────────────────────────┘                         │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ DETECTING   │                                                            │
│   │ PROJECT     │──── detectAll() ───────▶ detected: { languages, ... }     │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ COLLECTING  │                                                            │
│   │ CONFIG      │──── prompts / CLI opts ──▶ config: { level, aiTools, ... }│
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ COPYING     │                                                            │
│   │ STANDARDS   │──── copyStandard() ────▶ files copied                     │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ GENERATING  │                                                            │
│   │ INTEGRATIONS│──── writeIntegrationFile() ──▶ integration files          │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ INSTALLING  │                                                            │
│   │ SKILLS      │──── installSkillsToMultipleAgents() ──▶ skills installed  │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ INSTALLING  │                                                            │
│   │ COMMANDS    │──── installCommandsToMultipleAgents() ──▶ cmds installed  │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ WRITING     │                                                            │
│   │ MANIFEST    │──── writeManifest() ───▶ manifest.json created            │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────┐                                                                │
│   │ SUCCESS │                                                                │
│   └─────────┘                                                                │
│                                                                              │
│   Error at any stage → ┌─────────┐                                          │
│                        │ FAILED  │ → Display error, exit(1)                 │
│                        └─────────┘                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Configuration Options

### Adoption Levels

| Level | Name | Standards Included |
|-------|------|-------------------|
| 1 | Essential | Core standards (anti-hallucination, checkin) |
| 2 | Standard | Level 1 + workflow, testing standards |
| 3 | Comprehensive | Level 2 + all standards including advanced |

### AI Tools Supported

| Tool ID | Display Name | Integration File |
|---------|--------------|------------------|
| `claude-code` | Claude Code | `CLAUDE.md` |
| `cursor` | Cursor | `.cursorrules` |
| `windsurf` | Windsurf | `.windsurfrules` |
| `cline` | Cline | `.clinerules` |
| `copilot` | GitHub Copilot | `.github/copilot-instructions.md` |
| `opencode` | OpenCode | `.opencode/rules.md` |
| `aider` | Aider | `.aider/CONVENTIONS.md` |
| `roo` | Roo | `.roo/rules.md` |
| `antigravity` | Antigravity | `.antigravity/rules.md` |

### Skills Installation Locations

| Location | Description | Path Example |
|----------|-------------|--------------|
| `project` | Project-level installation | `.claude/skills/` |
| `user` | User-level installation | `~/.claude/skills/` |
| `marketplace` | Via Claude Code marketplace | Plugin installation |

---

## Error Handling

### Error Categories

| Category | Example | Recovery |
|----------|---------|----------|
| Detection Error | Cannot read package.json | Continue with empty detection |
| Permission Error | Cannot write to directory | Display error, suggest fix |
| Network Error | GitHub download failed | Use local fallback or error |
| Validation Error | Invalid level option | Display help, exit |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |

---

## Non-Interactive Mode

When `--yes` flag is used:

```javascript
const defaults = {
  level: options.level || 2,
  aiTools: options.aiTools || detectedAITools || ['claude-code'],
  format: 'ai',
  standardsScope: 'minimal',
  contentMode: 'index',
  locale: options.locale || systemLocale || 'en',
  skillsLocation: 'project',
  installSkills: !options.skipSkills,
  installCommands: !options.skipCommands
};
```

---

## Output Examples

### Successful Initialization

```
🚀 Initializing Universal Development Standards...

📋 Detected project characteristics:
   • Languages: TypeScript, JavaScript
   • Frameworks: React
   • AI Tools: Claude Code, Cursor

✅ Copied 8 core standards
✅ Copied 2 extensions (TypeScript, React)
✅ Generated CLAUDE.md
✅ Generated .cursorrules
✅ Installed 5 skills to Claude Code (project level)
✅ Installed 2 slash commands

📁 Created .standards/manifest.json

🎉 UDS initialized successfully!

Next steps:
   • Review standards in .standards/ directory
   • Customize AI tool configurations
   • Run 'uds check' to verify installation
```

### Existing Installation Warning

```
⚠️  UDS is already initialized in this project.

Current configuration:
   • Level: 2
   • AI Tools: claude-code, cursor
   • Skills: Installed (project level)

? Reinitialize with new settings? (y/N)
```

---

## Acceptance Criteria

- [ ] Detects project languages, frameworks, and AI tools
- [ ] Supports all 3 adoption levels
- [ ] Supports all 9 AI tools
- [ ] Generates valid integration files for each tool
- [ ] Installs skills to specified locations
- [ ] Creates valid manifest.json with all required fields
- [ ] Computes and stores file hashes
- [ ] Works in interactive and non-interactive modes
- [ ] Handles existing installations gracefully
- [ ] Displays clear progress and success messages
- [ ] Returns correct exit codes

---

## Dependencies

| Spec ID | Name | Dependency Type |
|---------|------|-----------------|
| SHARED-01 | Manifest Schema | Data structure |
| SHARED-02 | File Operations | File I/O |
| SHARED-03 | Hash Tracking | Integrity |
| SHARED-04 | Integration Generation | File generation |
| SHARED-05 | Skills Installation | Skill management |
| SHARED-07 | Prompts | User interaction |

---

## Related Specifications

- [INIT-01 Project Detection](01-project-detection.md)
- [INIT-02 Configuration Flow](02-configuration-flow.md)
- [INIT-03 Execution Stages](03-execution-stages.md)
- [UPDATE-00 Update Overview](../update/00-update-overview.md)
- [CHECK-00 Check Overview](../check/00-check-overview.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
