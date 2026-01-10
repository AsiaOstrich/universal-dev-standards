# UDS Operation Workflow

> **Language**: English | [繁體中文](../locales/zh-TW/docs/OPERATION-WORKFLOW.md) | [简体中文](../locales/zh-CN/docs/OPERATION-WORKFLOW.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-10

This document provides a complete operation workflow for the Universal Development Standards (UDS) project, covering the entire process from core standards to file generation.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Standards Layer](#2-core-standards-layer)
3. [Derived Formats Generation](#3-derived-formats-generation)
4. [Claude Code Skills](#4-claude-code-skills)
5. [AI Tool Integrations](#5-ai-tool-integrations)
6. [CLI Execution Flow](#6-cli-execution-flow)
7. [Maintenance Workflow](#7-maintenance-workflow)
8. [Development Guide](#8-development-guide)
9. [Release Process](#9-release-process)
10. [File Path Reference](#10-file-path-reference)

---

## 1. Overview

### 1.1 Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Core Standards Layer (core/)                  │
│   16 Standards: Essential(6) + Recommended(6) + Enterprise(4)   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  AI Format    │  │  Options      │  │  Localization │
│  ai/standards/│  │  options/     │  │  locales/     │
│  16 YAML      │  │  7 categories │  │  zh-TW/zh-CN  │
└───────┬───────┘  └───────┬───────┘  └───────────────┘
        │                  │
        └────────┬─────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code Skills                            │
│   skills/claude-code/ - 15 Skills                               │
│   Each skill corresponds to 1+ core standards                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AI Tool Integrations                          │
│   integrations/ - 10 tool templates                             │
│   CLI generates: CLAUDE.md, .cursorrules, .windsurfrules, etc. │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 File Relationship Summary

| Source | Derived Formats | Count |
|--------|-----------------|-------|
| `core/*.md` | Human-readable standards | 16 |
| `ai/standards/*.ai.yaml` | AI-optimized standards | 16 |
| `options/*/*.md` | Practice options | 36 |
| `ai/options/*/*.ai.yaml` | AI-optimized options | 36 |
| `skills/claude-code/*/` | Claude Code skills | 15 |
| `integrations/*/` | AI tool templates | 10 |
| `locales/zh-TW/` | Traditional Chinese | ~129 |
| `locales/zh-CN/` | Simplified Chinese | partial |

---

## 2. Core Standards Layer

### 2.1 Standards by Adoption Level

#### Level 1: Essential (6 standards)

| ID | File | Description |
|----|------|-------------|
| anti-hallucination | `core/anti-hallucination.md` | AI collaboration anti-hallucination guide |
| commit-message | `core/commit-message-guide.md` | Conventional Commits specification |
| checkin-standards | `core/checkin-standards.md` | Code check-in standards |
| git-workflow | `core/git-workflow.md` | Git workflow standards |
| changelog | `core/changelog-standards.md` | CHANGELOG format specification |
| versioning | `core/versioning.md` | Semantic versioning specification |

#### Level 2: Recommended (6 standards)

| ID | File | Description |
|----|------|-------------|
| code-review | `core/code-review-checklist.md` | Code review checklist |
| documentation-structure | `core/documentation-structure.md` | Documentation organization |
| documentation-writing | `core/documentation-writing-standards.md` | Documentation writing standards |
| project-structure | `core/project-structure.md` | Project directory structure |
| testing | `core/testing-standards.md` | Testing standards |
| logging | `core/logging-standards.md` | Logging standards |

#### Level 3: Enterprise (4 standards)

| ID | File | Description |
|----|------|-------------|
| tdd | `core/test-driven-development.md` | Test-Driven Development |
| test-completeness | `core/test-completeness-dimensions.md` | Test completeness dimensions |
| spec-driven | `core/spec-driven-development.md` | Spec-Driven Development |
| error-codes | `core/error-code-standards.md` | Error code standards |

### 2.2 Standard Document Template

```markdown
# [Standard Name]

> **Language**: English | [繁體中文](../locales/zh-TW/core/[file].md)

**Version**: X.Y.Z
**Last Updated**: YYYY-MM-DD

---

## Purpose

[Description of the standard's purpose]

## Key Guidelines

[Detailed guidelines]

## Related Standards

- [Related standard links]

## Version History

| Version | Date | Changes |
|---------|------|---------|
| X.Y.Z | YYYY-MM-DD | Description |

## License

This standard is released under [CC BY 4.0](...)
```

---

## 3. Derived Formats Generation

### 3.1 AI-Optimized Format (`ai/`)

**Conversion Rule:**
```
core/commit-message-guide.md (Human-readable)
        ↓ Convert
ai/standards/commit-message.ai.yaml (AI-optimized)
```

**Name Mapping:**
| Core File | AI File |
|-----------|---------|
| `changelog-standards` | `changelog` |
| `code-review-checklist` | `code-review` |
| `commit-message-guide` | `commit-message` |
| `error-code-standards` | `error-codes` |
| `logging-standards` | `logging` |
| `testing-standards` | `testing` |
| Others | Same name |

**AI YAML Structure:**
```yaml
---
name: commit-message
description: Brief description for AI assistants
keywords: [commit, conventional, message]
---

# Commit Message Standards

## Quick Reference
[Concise content]

## Configuration Detection
[Project-specific detection logic]

## Related Standards
- [Links to core standards]

## Version History
[Table]

## License
CC BY 4.0
```

### 3.2 Options Files (`options/`)

| Category | Options | Path |
|----------|---------|------|
| Git Workflow | github-flow, gitflow, trunk-based | `options/git-workflow/` |
| Merge Strategy | squash, merge-commit, rebase-ff | `options/git-workflow/` |
| Commit Language | english, traditional-chinese, bilingual | `options/commit-message/` |
| Testing | unit, integration, e2e, system, etc. | `options/testing/` |
| Code Review | pr-review, pair-programming, automated | `options/code-review/` |
| Documentation | markdown, api-docs, wiki-style | `options/documentation/` |
| Project Structure | nodejs, python, java, go, etc. | `options/project-structure/` |

### 3.3 Localization (`locales/`)

**Sync Hierarchy:**
```
core/*.md (Primary Source)
    ↓
locales/zh-TW/core/*.md (Traditional Chinese)
    ↓
locales/zh-CN/core/*.md (Simplified Chinese)
```

**YAML Front Matter Template:**
```yaml
---
source: ../../core/commit-message-guide.md
source_version: 1.2.0
translation_version: 1.2.0
status: current
last_updated: 2026-01-10
translator: [Name]
---
```

**Status Values:**
- `current` - Translation is up to date
- `outdated` - Source has been updated
- `needs_review` - Needs review

---

## 4. Claude Code Skills

### 4.1 Skills List (15 Skills)

| Skill Name | Core Standard(s) | Path |
|------------|------------------|------|
| ai-collaboration-standards | anti-hallucination | `skills/claude-code/ai-collaboration-standards/` |
| changelog-guide | changelog | `skills/claude-code/changelog-guide/` |
| code-review-assistant | code-review, checkin | `skills/claude-code/code-review-assistant/` |
| commit-standards | commit-message | `skills/claude-code/commit-standards/` |
| documentation-guide | documentation-* | `skills/claude-code/documentation-guide/` |
| error-code-guide | error-codes | `skills/claude-code/error-code-guide/` |
| git-workflow-guide | git-workflow | `skills/claude-code/git-workflow-guide/` |
| logging-guide | logging | `skills/claude-code/logging-guide/` |
| project-structure-guide | project-structure | `skills/claude-code/project-structure-guide/` |
| release-standards | versioning | `skills/claude-code/release-standards/` |
| requirement-assistant | (requirements) | `skills/claude-code/requirement-assistant/` |
| spec-driven-dev | spec-driven | `skills/claude-code/spec-driven-dev/` |
| tdd-assistant | tdd | `skills/claude-code/tdd-assistant/` |
| test-coverage-assistant | test-completeness | `skills/claude-code/test-coverage-assistant/` |
| testing-guide | testing | `skills/claude-code/testing-guide/` |

### 4.2 Skill Directory Structure

```
skills/claude-code/[skill-name]/
├── SKILL.md              # Main skill document (YAML front matter + content)
├── [guide1].md           # Detailed guide
├── [guide2].md           # Detailed guide
└── commands/             # Optional: command files
    └── [command].md
```

### 4.3 SKILL.md Template

```markdown
---
name: skill-name
description: |
  Brief one-line description.
  Use when: When to trigger this skill.
  Keywords: [keyword1, keyword2]
---

# Skill Title

> **Language**: English | [繁體中文](path/to/translation)

**Version**: 1.0.0
**Last Updated**: YYYY-MM-DD
**Applicability**: Claude Code Skills

---

## Purpose
[Clear description]

## Quick Reference
[Quick reference guide]

## Detailed Guidelines
For complete information, see:
- [guide1.md](./guide1.md)

## Configuration Detection
[Project configuration detection]

## Related Standards
- [core/related-standard.md](path)

## Version History
| Version | Date | Changes |
|---------|------|---------|

## License
CC BY 4.0
```

---

## 5. AI Tool Integrations

### 5.1 Supported Tools (10 Tools)

| Tool | Integration File | Format |
|------|------------------|--------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | Plaintext |
| Windsurf | `.windsurfrules` | Plaintext |
| Cline | `.clinerules` | Plaintext |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| Google Antigravity | `INSTRUCTIONS.md` | Markdown |
| OpenAI Codex | `AGENTS.md` | Markdown |
| OpenCode | `AGENTS.md` (shared) | Markdown |
| Gemini CLI | `GEMINI.md` | Markdown |
| OpenSpec | `AGENTS.md` | Markdown |

### 5.2 Integration Directory Structure

```
integrations/[tool-name]/
├── README.md           # Installation and usage guide
├── [config-file]       # Tool-specific config
└── examples/           # Optional: example configurations
```

---

## 6. CLI Execution Flow

### 6.1 Complete Flow Diagram (`uds init`)

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Initialization Check                                    │
│ - Check if .standards/manifest.json exists                      │
│ - If initialized, prompt to use uds update                      │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 2: Project Detection (detector.js)                        │
│ - detectLanguage(): C#, PHP, TypeScript, JavaScript, Python     │
│ - detectFramework(): Fat-Free, React, Vue, Angular, .NET        │
│ - detectAITools(): 9 AI tools detection                         │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 3: Interactive Configuration (prompts/init.js)            │
│ - AI tool selection (1-9 tools)                                 │
│ - Skills install location (marketplace/user/project/none)       │
│ - Adoption level (Essential/Recommended/Enterprise)             │
│ - Format selection (ai/human/both)                              │
│ - Standard options (workflow, commit_language, test_levels)     │
│ - Content mode (minimal/index/full)                             │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 4: Standards Query (registry.js)                          │
│ - Load cli/standards-registry.json                              │
│ - getStandardsByLevel() to filter standards                     │
│ - getStandardSource() to get source paths                       │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 5: File Copying (copier.js)                               │
│ - Core standards → .standards/*.md                              │
│ - AI format → .standards/*.ai.yaml                              │
│ - Options → .standards/options/                                 │
│ - Extensions → .standards/ (language/framework/locale)          │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 6: Integration File Generation (integration-generator.js) │
│ - Dynamically generate based on selected AI tools               │
│ - Adjust content based on contentMode                           │
│ - Support multiple languages (en/zh-tw)                         │
│ Generated files:                                                │
│ - CLAUDE.md (Claude Code)                                       │
│ - .cursorrules (Cursor)                                         │
│ - .windsurfrules (Windsurf)                                     │
│ - .clinerules (Cline)                                           │
│ - .github/copilot-instructions.md (Copilot)                     │
│ - AGENTS.md (Codex/OpenCode)                                    │
│ - GEMINI.md (Gemini CLI)                                        │
│ - INSTRUCTIONS.md (Antigravity)                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 7: Skills Installation (github.js)                        │
│ - User level: ~/.claude/skills/                                 │
│ - Project level: .claude/skills/                                │
│ - Download all 15 skills files                                  │
│ - Write skills-manifest.json                                    │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 8: Hash Calculation (hasher.js)                           │
│ - Calculate SHA-256 hash for all copied files                   │
│ - Used for uds check integrity verification                     │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 9: Manifest Generation                                    │
│ - Write to .standards/manifest.json                             │
│ - Record: version, config, file paths, hashes, timestamps       │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Generated File Structure

```
project-root/
├── .standards/                     # Standards directory
│   ├── manifest.json              # Tracking manifest
│   ├── anti-hallucination.md      # Core standards (Markdown)
│   ├── anti-hallucination.ai.yaml # Core standards (AI YAML)
│   ├── commit-message.md
│   ├── commit-message.ai.yaml
│   ├── ... (other standards)
│   └── options/                   # Options files
│       ├── github-flow.md
│       ├── english.md
│       └── unit-testing.md
│
├── CLAUDE.md                      # Claude Code integration
├── .cursorrules                   # Cursor integration
├── .windsurfrules                 # Windsurf integration
├── .clinerules                    # Cline integration
├── AGENTS.md                      # Codex/OpenCode integration
├── .github/
│   └── copilot-instructions.md    # Copilot integration
│
└── .claude/                       # Claude Code Skills
    └── skills/
        ├── commit-standards/
        ├── code-review-assistant/
        └── ... (other skills)
```

### 6.3 CLI Source Code Structure

```
cli/
├── bin/
│   └── uds.js                    # Entry point
├── src/
│   ├── index.js                  # Main exports
│   ├── commands/                 # Command implementations
│   │   ├── init.js              # init command (~920 lines)
│   │   ├── list.js              # list command
│   │   ├── check.js             # check command
│   │   ├── update.js            # update command
│   │   ├── configure.js         # configure command
│   │   └── skills.js            # skills command
│   ├── prompts/                  # Interactive prompts
│   │   ├── init.js              # init prompts (~1007 lines)
│   │   └── integrations.js      # integration prompts
│   └── utils/                    # Utility modules
│       ├── registry.js          # Standards registry (207 lines)
│       ├── copier.js            # File copying (143 lines)
│       ├── github.js            # GitHub download (508 lines)
│       ├── detector.js          # Project detection (159 lines)
│       ├── hasher.js            # Hash calculation (219 lines)
│       ├── integration-generator.js  # Integration generation (2310 lines)
│       └── reference-sync.js    # Reference sync (189 lines)
├── standards-registry.json       # Standards registry (~1000 lines)
└── package.json                  # Dependencies
```

---

## 7. Maintenance Workflow

### 7.1 Sync Check Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `check-translation-sync.sh` | Check translation sync with source | `./scripts/check-translation-sync.sh [locale]` |
| `check-standards-sync.sh` | Check MD ↔ AI YAML sync | `./scripts/check-standards-sync.sh` |
| `check-version-sync.sh` | Check version consistency | `./scripts/check-version-sync.sh` |
| `check-install-scripts-sync.sh` | Check install scripts sync | `./scripts/check-install-scripts-sync.sh` |
| `pre-release.sh` | Pre-release automation | `./scripts/pre-release.sh --version X.Y.Z` |

### 7.2 Translation Sync Mechanism

**Check Process:**
```bash
# Check zh-TW translations
./scripts/check-translation-sync.sh

# Check zh-CN translations
./scripts/check-translation-sync.sh zh-CN
```

**Output Status:**
- `[CURRENT]` (green) - Translation is up to date
- `[OUTDATED]` (red) - Translation version is outdated
- `[NO META]` (yellow) - Missing YAML Front Matter
- `[MISSING]` (red) - Source file not found

**Update Workflow:**
1. Run sync check
2. Open outdated translation file
3. Update content
4. Update `source_version` and `translation_version` in YAML Front Matter
5. Run sync check again to verify

### 7.3 Standards Sync Mechanism

**Check Process:**
```bash
./scripts/check-standards-sync.sh
```

**Phase 1: core/ ↔ ai/standards/**
```
core/changelog-standards.md ↔ ai/standards/changelog.ai.yaml
core/commit-message-guide.md ↔ ai/standards/commit-message.ai.yaml
...
```

**Phase 2: options/ ↔ ai/options/**
```
options/git-workflow/github-flow.md ↔ ai/options/git-workflow/github-flow.ai.yaml
options/commit-message/english.md ↔ ai/options/commit-message/english.ai.yaml
...
```

### 7.4 Version Sync Mechanism

**Version File Locations (6 places):**

| File | Field | Update Frequency |
|------|-------|------------------|
| `cli/package.json` | `"version"` | Every release |
| `.claude-plugin/plugin.json` | `"version"` | Every release |
| `.claude-plugin/marketplace.json` | `"version"` | Every release |
| `cli/standards-registry.json` | Root `"version"` | Every release |
| `cli/standards-registry.json` | `repositories.standards.version` | Every release |
| `cli/standards-registry.json` | `repositories.skills.version` | Every release |
| `README.md` | `**Version**:` | Stable releases only |

**Check Process:**
```bash
./scripts/check-version-sync.sh
```

---

## 8. Development Guide

### 8.1 Adding a New Core Standard

**Complete Flow (10 steps):**

```
Step 1: Create core/new-standard.md
        ↓
Step 2: Create ai/standards/new-standard.ai.yaml
        ↓
Step 3: Create options/new-standard/*.md (if applicable)
        ↓
Step 4: Create ai/options/new-standard/*.ai.yaml (if applicable)
        ↓
Step 5: Create skills/claude-code/new-skill/ (if applicable)
        ↓
Step 6: Create locales/zh-TW/core/new-standard.md
        ↓
Step 7: Create locales/zh-CN/core/new-standard.md
        ↓
Step 8: Update cli/standards-registry.json
        ↓
Step 9: Update CHANGELOG.md
        ↓
Step 10: Run all sync check scripts
```

**Detailed Steps:**

1. **Create Core Standard**
   ```bash
   # Create the markdown file
   touch core/new-standard.md
   # Follow the standard template structure
   ```

2. **Create AI-Optimized Version**
   ```bash
   touch ai/standards/new-standard.ai.yaml
   # Use concise YAML format
   ```

3. **Create Options (if applicable)**
   ```bash
   mkdir -p options/new-standard
   touch options/new-standard/option-1.md
   touch options/new-standard/option-2.md

   mkdir -p ai/options/new-standard
   touch ai/options/new-standard/option-1.ai.yaml
   touch ai/options/new-standard/option-2.ai.yaml
   ```

4. **Create Skill (if applicable)**
   ```bash
   mkdir -p skills/claude-code/new-standard-skill
   touch skills/claude-code/new-standard-skill/SKILL.md
   touch skills/claude-code/new-standard-skill/guide.md
   ```

5. **Create Translations**
   ```bash
   touch locales/zh-TW/core/new-standard.md
   touch locales/zh-CN/core/new-standard.md
   # Add YAML Front Matter with source tracking
   ```

6. **Update Registry**
   ```json
   // In cli/standards-registry.json
   {
     "standards": [
       {
         "id": "new-standard",
         "name": "New Standard Name",
         "level": 2,
         "category": "reference",
         "source": {
           "ai": "ai/standards/new-standard.ai.yaml",
           "human": "core/new-standard.md"
         }
       }
     ]
   }
   ```

7. **Verify**
   ```bash
   ./scripts/check-standards-sync.sh
   ./scripts/check-translation-sync.sh
   ./scripts/check-translation-sync.sh zh-CN
   cd cli && npm test
   ```

### 8.2 Adding a New Skill

**Complete Flow (7 steps):**

```
Step 1: Create skills/claude-code/new-skill/ directory
        ↓
Step 2: Create SKILL.md with YAML front matter
        ↓
Step 3: Create supporting guide files
        ↓
Step 4: Update install scripts (install.sh, install.ps1)
        ↓
Step 5: Create translations in locales/
        ↓
Step 6: Update documentation (README.md, etc.)
        ↓
Step 7: Run verification scripts
```

### 8.3 Adding a New AI Tool Integration

**Complete Flow (6 steps):**

```
Step 1: Create integrations/[tool-name]/ directory
        ↓
Step 2: Create README.md with installation guide
        ↓
Step 3: Create tool-specific config file
        ↓
Step 4: Update integration-generator.js (if dynamic generation needed)
        ↓
Step 5: Create translations (optional)
        ↓
Step 6: Update documentation
```

---

## 9. Release Process

### 9.1 Pre-release Checklist

**Before Any Release:**
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Version sync check passes (`./scripts/check-version-sync.sh`)
- [ ] CHANGELOG.md is updated
- [ ] Git working directory is clean

**Version Files Checklist (6 files):**
- [ ] `cli/package.json` - `"version": "X.Y.Z"`
- [ ] `.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
- [ ] `.claude-plugin/marketplace.json` - `"version": "X.Y.Z"`
- [ ] `cli/standards-registry.json` - 3 locations
- [ ] `README.md` - `**Version**:` (stable releases only)

### 9.2 Version Types and npm Tags

| Type | Version Format | npm Tag | Purpose |
|------|----------------|---------|---------|
| Stable | `3.3.0` | `@latest` | Production release |
| Beta | `3.3.0-beta.1` | `@beta` | Test new features |
| Alpha | `3.3.0-alpha.1` | `@alpha` | Early internal testing |
| RC | `3.3.0-rc.1` | `@rc` | Final pre-release testing |

### 9.3 Complete Release Workflow

```
Step 1: Pre-release Preparation
        ./scripts/pre-release.sh --version X.Y.Z
        ↓
Step 2: Update CHANGELOG.md
        (Follow Keep a Changelog format)
        ↓
Step 3: Commit Changes
        git add -A
        git commit -m "chore(release): prepare vX.Y.Z"
        ↓
Step 4: Create Git Tag
        git tag vX.Y.Z
        git push origin main --tags
        ↓
Step 5: Create GitHub Release
        (Manual operation in GitHub UI)
        ↓
Step 6: GitHub Actions Auto-publish
        - Detect version type (stable/beta/alpha/rc)
        - npm publish --tag [latest/beta/alpha/rc]
        ↓
Step 7: Verify Release
        npm view universal-dev-standards dist-tags
```

### 9.4 GitHub Actions Workflow

**CI Workflow (`.github/workflows/ci.yml`):**
- Triggered on: Push to main, PR to main
- Jobs: Linting, Tests (multi-matrix), Translation sync check

**Publish Workflow (`.github/workflows/publish.yml`):**
- Triggered on: GitHub Release published
- Auto-detects version type from package.json
- Publishes to npm with appropriate tag

---

## 10. File Path Reference

### 10.1 Core Directories

| Directory | Description | Count |
|-----------|-------------|-------|
| `core/` | Human-readable core standards | 16 files |
| `ai/standards/` | AI-optimized standards | 16 files |
| `ai/options/` | AI-optimized options | 36 files |
| `options/` | Human-readable options | 36 files |
| `skills/claude-code/` | Claude Code skills | 15 directories |
| `integrations/` | AI tool integration templates | 10 directories |
| `locales/zh-TW/` | Traditional Chinese translations | ~129 files |
| `locales/zh-CN/` | Simplified Chinese translations | partial |

### 10.2 Maintenance Scripts

| Script | Path | Purpose |
|--------|------|---------|
| Translation Sync | `scripts/check-translation-sync.sh` | Check translation sync |
| Standards Sync | `scripts/check-standards-sync.sh` | Check MD ↔ YAML sync |
| Version Sync | `scripts/check-version-sync.sh` | Check version consistency |
| Install Scripts Sync | `scripts/check-install-scripts-sync.sh` | Check install scripts |
| Pre-release | `scripts/pre-release.sh` | Pre-release automation |

### 10.3 Configuration Files

| File | Purpose |
|------|---------|
| `cli/package.json` | Main version source, dependencies |
| `cli/standards-registry.json` | Standards registry, version info |
| `.claude-plugin/plugin.json` | Plugin configuration |
| `.claude-plugin/marketplace.json` | Marketplace configuration |
| `cli/.eslintrc.json` | ESLint configuration |
| `cli/vitest.config.js` | Test configuration |

### 10.4 GitHub Actions

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | CI workflow (tests, linting) |
| `.github/workflows/publish.yml` | npm publish workflow |

---

## Appendix: Quick Reference Commands

### Daily Maintenance

```bash
# Run all sync checks
./scripts/check-standards-sync.sh
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh

# Run tests and linting
cd cli && npm test && npm run lint
```

### Pre-release

```bash
# Automated pre-release preparation
./scripts/pre-release.sh --version 3.4.0

# Or with options
./scripts/pre-release.sh --version 3.4.0-beta.1 --skip-translations
```

### Release

```bash
# Commit and tag
git add -A
git commit -m "chore(release): prepare v3.4.0"
git tag v3.4.0
git push origin main --tags

# Verify after GitHub Release
npm view universal-dev-standards dist-tags
```

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
