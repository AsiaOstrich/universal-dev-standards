# [INIT-03] Execution Stages Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: INIT-03

---

## Summary

This specification defines the execution stages of the `uds init` command, detailing how standards are copied, integrations are generated, skills are installed, and the manifest is created.

---

## Motivation

Clear execution stages provide:
1. **Predictability**: Users know what will happen
2. **Recoverability**: Failures at specific stages can be retried
3. **Testability**: Each stage can be tested independently
4. **Progress Tracking**: Show meaningful progress to users

---

## Execution Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Init Execution Pipeline                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Configuration Input                                                        │
│         │                                                                    │
│         ▼                                                                    │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │   Stage 1   │───▶│   Stage 2   │───▶│   Stage 3   │───▶│   Stage 4   │  │
│   │   Create    │    │    Copy     │    │  Generate   │    │   Install   │  │
│   │ Directories │    │  Standards  │    │Integrations │    │   Skills    │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                   │          │
│         ┌─────────────────────────────────────────────────────────┘          │
│         │                                                                    │
│         ▼                                                                    │
│   ┌─────────────┐    ┌─────────────┐                                         │
│   │   Stage 5   │───▶│   Stage 6   │                                         │
│   │   Install   │    │   Write     │                                         │
│   │  Commands   │    │  Manifest   │                                         │
│   └─────────────┘    └─────────────┘                                         │
│                             │                                                │
│                             ▼                                                │
│                      ┌─────────────┐                                         │
│                      │   Success   │                                         │
│                      │   Output    │                                         │
│                      └─────────────┘                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: Create Directories

### Purpose

Create the directory structure for UDS files.

### Directories Created

```
<project-root>/
├── .standards/
│   ├── core/
│   └── extensions/
│       ├── languages/
│       └── frameworks/
└── (AI tool directories - created in later stages)
```

### Implementation

```javascript
async function createDirectories(projectPath, config) {
  const dirs = [
    path.join(projectPath, '.standards'),
    path.join(projectPath, '.standards', 'core')
  ];

  if (config.standardsScope === 'full' || config.languages.length > 0) {
    dirs.push(path.join(projectPath, '.standards', 'extensions', 'languages'));
  }

  if (config.frameworks.length > 0) {
    dirs.push(path.join(projectPath, '.standards', 'extensions', 'frameworks'));
  }

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  return { success: true, created: dirs };
}
```

### Progress Output

```
📁 Creating directory structure...
   ✓ .standards/
   ✓ .standards/core/
   ✓ .standards/extensions/languages/
```

---

## Stage 2: Copy Standards

### Purpose

Copy standard files from UDS source to project's `.standards/` directory.

### File Selection Logic

```javascript
function selectStandardsToCopy(config) {
  const standards = [];

  // Core standards based on level
  const coreByLevel = getStandardsByLevel(config.level);
  for (const standard of coreByLevel) {
    const source = getStandardSource(standard, config.format);
    standards.push({
      source,
      target: `core/${path.basename(source)}`,
      category: 'core'
    });
  }

  // Language extensions
  if (config.standardsScope === 'full' || config.languages.length > 0) {
    for (const lang of config.languages) {
      const extPath = `extensions/languages/${lang}-style.md`;
      standards.push({
        source: extPath,
        target: extPath,
        category: 'extension'
      });
    }
  }

  // Framework extensions
  for (const framework of config.frameworks) {
    const extPath = `extensions/frameworks/${framework}-guide.md`;
    standards.push({
      source: extPath,
      target: extPath,
      category: 'extension'
    });
  }

  return standards;
}
```

### Copy Operation

```javascript
async function copyStandards(projectPath, standards) {
  const results = {
    success: [],
    failed: [],
    hashes: {}
  };

  for (const standard of standards) {
    const result = await copyStandard(
      standard.source,
      path.dirname(standard.target),
      projectPath
    );

    if (result.success) {
      results.success.push(standard.target);

      // Compute hash for integrity tracking
      const hash = computeFileHash(result.path);
      const relativePath = `.standards/${standard.target}`;
      results.hashes[relativePath] = {
        ...hash,
        installedAt: new Date().toISOString()
      };
    } else {
      results.failed.push({
        file: standard.target,
        error: result.error
      });
    }
  }

  return results;
}
```

### Progress Output

```
📋 Copying standards...
   ✓ core/anti-hallucination.md
   ✓ core/checkin-standards.md
   ✓ core/commit-message-guide.md
   ✓ core/code-review-checklist.md
   ✓ extensions/languages/typescript-style.md
   ✓ extensions/languages/javascript-style.md

✅ Copied 6 standards (0 failed)
```

---

## Stage 3: Generate Integrations

### Purpose

Generate AI tool integration files (CLAUDE.md, .cursorrules, etc.) based on configuration.

### Integration Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Integration Generation Flow                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   For each selected AI tool:                                                 │
│                                                                              │
│   1. Determine target file path                                              │
│      ├── claude-code → CLAUDE.md                                             │
│      ├── cursor → .cursorrules                                               │
│      ├── windsurf → .windsurfrules                                           │
│      ├── cline → .clinerules                                                 │
│      ├── copilot → .github/copilot-instructions.md                           │
│      └── ... etc                                                             │
│                                                                              │
│   2. Check for existing file                                                 │
│      ├── If exists → Preserve user content outside UDS blocks               │
│      └── If new → Generate fresh file                                        │
│                                                                              │
│   3. Generate content based on contentMode                                   │
│      ├── minimal → References only                                           │
│      ├── index → Standard index with descriptions                            │
│      └── full → Embed full standard content                                  │
│                                                                              │
│   4. Apply locale-specific content                                           │
│      └── Use commit_language for dynamic content                             │
│                                                                              │
│   5. Write file with UDS markers                                             │
│      └── <!-- UDS:START --> ... <!-- UDS:END -->                            │
│                                                                              │
│   6. Compute integration block hash                                          │
│      └── For integrity tracking                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```javascript
async function generateIntegrations(projectPath, config, installedStandards) {
  const results = {
    generated: [],
    failed: [],
    blockHashes: {}
  };

  for (const tool of config.aiTools) {
    const targetFile = TOOL_FILES[tool];
    const format = TOOL_FORMATS[tool];

    try {
      await writeIntegrationFile({
        projectPath,
        tool,
        targetFile,
        format,
        standards: installedStandards,
        contentMode: config.contentMode,
        locale: config.locale,
        language: config.options.commit_language,
        level: config.level
      });

      results.generated.push(targetFile);

      // Compute block hash
      const fullPath = path.join(projectPath, targetFile);
      const blockHash = computeIntegrationBlockHash(fullPath, format);
      if (blockHash) {
        results.blockHashes[targetFile] = blockHash;
      }
    } catch (error) {
      results.failed.push({
        file: targetFile,
        error: error.message
      });
    }
  }

  return results;
}
```

### Progress Output

```
🔧 Generating AI tool integrations...
   ✓ CLAUDE.md (index mode, English)
   ✓ .cursorrules (index mode, English)

✅ Generated 2 integration files
```

---

## Stage 4: Install Skills

### Purpose

Install UDS skills to selected AI agents at specified locations.

### Skills Installation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Skills Installation Flow                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   For each agent installation:                                               │
│                                                                              │
│   1. Determine target directory                                              │
│      ├── project → .{agent}/skills/                                          │
│      ├── user → ~/.{agent}/skills/                                           │
│      └── marketplace → Skip (handled separately)                             │
│                                                                              │
│   2. Get skills to install based on level                                    │
│      ├── Level 1 → commit-standards                                          │
│      ├── Level 2 → Level 1 + testing-guide, code-review                      │
│      └── Level 3 → Level 2 + all other skills                                │
│                                                                              │
│   3. For each skill:                                                         │
│      ├── Create skill directory                                              │
│      ├── Copy SKILL.md                                                       │
│      ├── Copy supporting files                                               │
│      └── Compute file hashes                                                 │
│                                                                              │
│   4. Return installation results                                             │
│      └── { installed, errors, fileHashes }                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```javascript
async function installSkills(projectPath, config) {
  if (!config.skills.enabled) {
    return { skipped: true, reason: 'Skills installation disabled' };
  }

  const skillsToInstall = getSkillsForLevel(config.level);

  const result = await installSkillsToMultipleAgents(
    config.skills.installations,
    skillsToInstall,
    projectPath
  );

  return {
    skipped: false,
    totalInstalled: result.totalInstalled,
    totalErrors: result.totalErrors,
    installations: result.installations,
    fileHashes: result.allFileHashes
  };
}
```

### Skills by Level

| Level | Skills Included |
|-------|-----------------|
| 1 | commit-standards |
| 2 | commit-standards, testing-guide, code-review |
| 3 | All skills (commit-standards, testing-guide, code-review, release-standards, spec-driven-dev, etc.) |

### Progress Output

```
🎯 Installing skills...

   Claude Code (project level):
   ✓ commit-standards
   ✓ testing-guide
   ✓ code-review

   Cursor (project level):
   ✓ commit-standards (via rules)

✅ Installed 4 skills (0 errors)
```

---

## Stage 5: Install Commands

### Purpose

Install UDS slash commands to selected AI agents.

### Commands Installation Flow

```javascript
async function installCommands(projectPath, config) {
  if (!config.commands.enabled) {
    return { skipped: true, reason: 'Commands installation disabled' };
  }

  const commandsToInstall = ['uds-init', 'uds-check', 'uds-update'];

  // Filter agents that support commands
  const commandCapableAgents = config.commands.installations.filter(
    inst => getAgentConfig(inst.agent).supportsCommands
  );

  if (commandCapableAgents.length === 0) {
    return { skipped: true, reason: 'No selected agents support commands' };
  }

  const result = await installCommandsToMultipleAgents(
    commandCapableAgents,
    commandsToInstall,
    projectPath
  );

  return {
    skipped: false,
    totalInstalled: result.totalInstalled,
    totalErrors: result.totalErrors,
    installations: result.installations,
    fileHashes: result.allFileHashes
  };
}
```

### Available Commands

| Command | Description |
|---------|-------------|
| `uds-init` | Initialize UDS in a project |
| `uds-check` | Check UDS adoption status |
| `uds-update` | Update UDS to latest version |

### Progress Output

```
⌨️ Installing slash commands...

   Claude Code:
   ✓ /uds-init
   ✓ /uds-check
   ✓ /uds-update

✅ Installed 3 commands
```

---

## Stage 6: Write Manifest

### Purpose

Create or update the manifest file with all installation details.

### Manifest Assembly

```javascript
function assembleManifest(config, results) {
  const now = new Date().toISOString();

  return {
    version: '3.3.0',
    upstream: {
      repo: 'AsiaOstrich/universal-dev-standards',
      version: getCurrentUDSVersion(),
      installed: now
    },
    level: config.level,
    format: config.format,
    standardsScope: config.standardsScope,
    contentMode: config.contentMode,

    standards: results.standards.success.filter(s => s.startsWith('core/')),
    extensions: results.standards.success.filter(s => s.startsWith('extensions/')),
    integrations: results.integrations.generated,

    options: config.options,
    aiTools: config.aiTools,

    skills: {
      installed: !results.skills.skipped,
      location: config.skills.installations[0]?.level || null,
      names: results.skills.skipped ? [] : getSkillsForLevel(config.level),
      version: getCurrentUDSVersion(),
      installations: config.skills.installations
    },

    commands: {
      installed: !results.commands.skipped,
      names: results.commands.skipped ? [] : ['uds-init', 'uds-check', 'uds-update'],
      installations: config.commands.installations
    },

    fileHashes: results.standards.hashes,
    skillHashes: results.skills.fileHashes || {},
    commandHashes: results.commands.fileHashes || {},
    integrationBlockHashes: results.integrations.blockHashes
  };
}
```

### Write Operation

```javascript
async function writeManifestStage(projectPath, config, results) {
  const manifest = assembleManifest(config, results);

  writeManifest(manifest, projectPath);

  return {
    success: true,
    path: path.join(projectPath, '.standards', 'manifest.json'),
    manifest
  };
}
```

### Progress Output

```
📝 Writing manifest...
   ✓ .standards/manifest.json

Configuration saved:
   • Level: 2 (Standard)
   • Standards: 6 files
   • Extensions: 2 files
   • Integrations: 2 files
   • Skills: 4 installed
   • Commands: 3 installed
```

---

## Error Handling

### Stage-Level Error Handling

```javascript
async function executeInit(projectPath, config) {
  const results = {};

  // Stage 1
  try {
    results.directories = await createDirectories(projectPath, config);
  } catch (error) {
    return { success: false, stage: 'directories', error };
  }

  // Stage 2
  try {
    results.standards = await copyStandards(projectPath, config);
    if (results.standards.failed.length > 0) {
      console.warn(`Warning: ${results.standards.failed.length} standards failed to copy`);
    }
  } catch (error) {
    return { success: false, stage: 'standards', error };
  }

  // Stage 3
  try {
    results.integrations = await generateIntegrations(projectPath, config, results.standards);
  } catch (error) {
    return { success: false, stage: 'integrations', error };
  }

  // Stage 4
  try {
    results.skills = await installSkills(projectPath, config);
  } catch (error) {
    console.warn(`Warning: Skills installation failed: ${error.message}`);
    results.skills = { skipped: true, error: error.message };
  }

  // Stage 5
  try {
    results.commands = await installCommands(projectPath, config);
  } catch (error) {
    console.warn(`Warning: Commands installation failed: ${error.message}`);
    results.commands = { skipped: true, error: error.message };
  }

  // Stage 6
  try {
    results.manifest = await writeManifestStage(projectPath, config, results);
  } catch (error) {
    return { success: false, stage: 'manifest', error };
  }

  return { success: true, results };
}
```

### Recovery Strategies

| Stage | Failure Impact | Recovery |
|-------|----------------|----------|
| Directories | Critical | Retry or check permissions |
| Standards | Critical | Retry failed files |
| Integrations | Partial | Continue, warn user |
| Skills | Non-critical | Continue, warn user |
| Commands | Non-critical | Continue, warn user |
| Manifest | Critical | Retry or manual creation |

---

## Success Output

### Complete Success Message

```
🚀 Initializing Universal Development Standards...

📁 Creating directory structure...
   ✓ .standards/
   ✓ .standards/core/
   ✓ .standards/extensions/languages/

📋 Copying standards...
   ✓ core/anti-hallucination.md
   ✓ core/checkin-standards.md
   ✓ core/commit-message-guide.md
   ✓ core/code-review-checklist.md
   ✓ extensions/languages/typescript-style.md
   ✓ extensions/languages/javascript-style.md

✅ Copied 6 standards

🔧 Generating AI tool integrations...
   ✓ CLAUDE.md (index mode, English)
   ✓ .cursorrules (index mode, English)

✅ Generated 2 integration files

🎯 Installing skills...
   ✓ commit-standards → Claude Code (project)
   ✓ testing-guide → Claude Code (project)

✅ Installed 2 skills

⌨️ Installing slash commands...
   ✓ /uds-init → Claude Code
   ✓ /uds-check → Claude Code
   ✓ /uds-update → Claude Code

✅ Installed 3 commands

📝 Writing manifest...
   ✓ .standards/manifest.json

════════════════════════════════════════════════════════════════════════════════

🎉 UDS initialized successfully!

Summary:
   • Adoption Level: 2 (Standard)
   • AI Tools: Claude Code, Cursor
   • Standards: 6 files
   • Skills: 2 installed (project level)
   • Commands: 3 installed

Next steps:
   1. Review standards in .standards/ directory
   2. Customize CLAUDE.md and .cursorrules as needed
   3. Run 'uds check' to verify installation
   4. Commit changes to version control

════════════════════════════════════════════════════════════════════════════════
```

---

## Acceptance Criteria

- [ ] All 6 stages execute in correct order
- [ ] Directory creation handles existing directories
- [ ] Standard copying computes and stores hashes
- [ ] Integration generation preserves user content
- [ ] Skills installation handles multiple agents
- [ ] Commands installation filters by capability
- [ ] Manifest contains all required fields
- [ ] Progress output is clear and informative
- [ ] Errors at any stage are handled gracefully
- [ ] Partial failures allow continuation where appropriate

---

## Dependencies

| Spec ID | Name | Dependency Type |
|---------|------|-----------------|
| SHARED-01 | Manifest Schema | Output structure |
| SHARED-02 | File Operations | File copying |
| SHARED-03 | Hash Tracking | Integrity hashes |
| SHARED-04 | Integration Generation | Integration files |
| SHARED-05 | Skills Installation | Skills setup |

---

## Related Specifications

- [INIT-00 Init Overview](00-init-overview.md) - Parent specification
- [INIT-02 Configuration Flow](02-configuration-flow.md) - Input configuration
- [CHECK-00 Check Overview](../check/00-check-overview.md) - Verification of results

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
