# Universal Development Standards - Maintenance Guide

> **Language**: English | [繁體中文](locales/zh-TW/MAINTENANCE.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-30

---

## Purpose

This document defines the complete maintenance workflow for the Universal Development Standards project. It covers all directories, files, and their synchronization relationships.

---

## Project Architecture Overview

```
universal-dev-standards/
├── core/                    ← PRIMARY SOURCE (15 standards)
├── options/                 ← MD options (18 files)
├── ai/                      ← AI-optimized versions (51 YAML files)
│   ├── standards/           ← 15 AI standards
│   ├── options/             ← 36 AI options
│   └── MAINTENANCE.md       ← AI-specific maintenance guide
├── extensions/              ← Language/framework/locale extensions (4 files)
│   ├── languages/           ← Language-specific standards
│   ├── frameworks/          ← Framework-specific patterns
│   └── locales/             ← Locale-specific guidelines
├── skills/                  ← Claude Code skills (35 files)
│   └── claude-code/         ← 9 skill packages
├── adoption/                ← Adoption guides (5 files)
├── templates/               ← Document templates (4 files)
├── integrations/            ← AI tool configs (7 files)
├── cli/                     ← Node.js CLI tool
├── scripts/                 ← Maintenance scripts
├── locales/                 ← Translations (129 files)
│   ├── zh-TW/               ← Traditional Chinese
│   └── zh-CN/               ← Simplified Chinese (partial)
└── [Root files]             ← README, CHANGELOG, CLAUDE.md, etc.
```

---

## Complete Sync Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRIMARY SOURCE                                │
│                         core/*.md                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   options/*.md  │    │ ai/standards/   │    │ skills/claude-  │
│   (MD options)  │    │   *.ai.yaml     │    │   code/*/       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ locales/zh-TW/  │    │  ai/options/    │    │ locales/zh-TW/  │
│   options/      │    │   *.ai.yaml     │    │   skills/       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────┐
                    │ locales/zh-TW/  │
                    │   ai/           │
                    └─────────────────┘
```

**Golden Rule**: Always update from top to bottom. Never modify downstream files without updating the source first.

---

## Directory Reference

### 1. core/ (Primary Source)

| File | Version | Description |
|------|---------|-------------|
| anti-hallucination.md | 1.3.1 | AI behavior guidelines |
| changelog-standards.md | 1.1.0 | Changelog format rules |
| checkin-standards.md | 1.2.5 | Code check-in checklist |
| code-review-checklist.md | 1.0.0 | Code review guidelines |
| commit-message-guide.md | 1.2.0 | Commit message format |
| documentation-structure.md | 1.0.0 | Doc organization |
| documentation-writing-standards.md | 1.0.1 | Writing guidelines |
| error-code-standards.md | 1.0.0 | Error code format |
| git-workflow.md | 1.1.0 | Git workflow patterns |
| logging-standards.md | 1.0.0 | Logging guidelines |
| project-structure.md | 1.1.0 | Project organization |
| spec-driven-development.md | 1.1.0 | SDD workflow |
| test-completeness-dimensions.md | 1.0.0 | Testing dimensions |
| testing-standards.md | 1.3.0 | Testing guidelines |
| versioning.md | 1.2.0 | Semantic versioning |

**Total**: 15 files

---

### 2. options/ (MD Options)

Human-readable option files for standards that have configurable choices.

| Category | Files | Related Standard |
|----------|-------|------------------|
| commit-message/ | 3 (english, traditional-chinese, bilingual) | commit-message-guide.md |
| git-workflow/ | 6 (gitflow, github-flow, trunk-based, merge-commit, squash-merge, rebase-ff) | git-workflow.md |
| project-structure/ | 5 (dotnet, nodejs, python, java, go) | project-structure.md |
| testing/ | 4 (unit, integration, system, e2e) | testing-standards.md |

**Total**: 18 files

---

### 3. ai/ (AI-Optimized Versions)

Machine-readable YAML format for AI assistants. See [ai/MAINTENANCE.md](ai/MAINTENANCE.md) for detailed sync rules.

| Subdirectory | Files | Description |
|--------------|-------|-------------|
| standards/ | 15 | AI-optimized core standards |
| options/changelog/ | 2 | Changelog options |
| options/code-review/ | 3 | Code review options |
| options/commit-message/ | 3 | Commit message options |
| options/documentation/ | 3 | Documentation options |
| options/git-workflow/ | 6 | Git workflow options |
| options/project-structure/ | 10 | Project structure options (5 extra YAML-only) |
| options/testing/ | 9 | Testing options (5 extra YAML-only) |

**Total**: 51 YAML files

---

### 4. skills/ (Claude Code Skills)

Skill packages for Claude Code AI assistant.

| Skill | Files | Related Core Standards |
|-------|-------|------------------------|
| ai-collaboration-standards/ | 3 | anti-hallucination.md |
| code-review-assistant/ | 3 | code-review-checklist.md, checkin-standards.md |
| commit-standards/ | 3 | commit-message-guide.md, checkin-standards.md |
| documentation-guide/ | 3 | documentation-structure.md, documentation-writing-standards.md |
| git-workflow-guide/ | 3 | git-workflow.md |
| project-structure-guide/ | 2 | project-structure.md |
| release-standards/ | 3 | changelog-standards.md, versioning.md |
| requirement-assistant/ | 3 | spec-driven-development.md |
| testing-guide/ | 2 | testing-standards.md, test-completeness-dimensions.md |

**Total**: 25 skill files + 10 shared/README files = 35 files

---

### 5. adoption/ (Adoption Guides)

| File | Description |
|------|-------------|
| ADOPTION-GUIDE.md | Main adoption guide |
| STATIC-DYNAMIC-GUIDE.md | Static vs dynamic adoption |
| checklists/minimal.md | Minimal adoption checklist |
| checklists/recommended.md | Recommended adoption checklist |
| checklists/enterprise.md | Enterprise adoption checklist |

**Total**: 5 files

---

### 6. templates/ (Document Templates)

| File | Description |
|------|-------------|
| migration-template.md | Migration document template |
| requirement-template.md | Requirement document template |
| requirement-document-template.md | Detailed requirement template |
| requirement-checklist.md | Requirement checklist |

**Total**: 4 files

---

### 7. integrations/ (AI Tool Configurations)

| Tool | File | Description |
|------|------|-------------|
| Cursor | .cursorrules | Cursor AI rules |
| Cline | .clinerules | Cline AI rules |
| Windsurf | .windsurfrules | Windsurf AI rules |
| GitHub Copilot | copilot-instructions.md | Copilot instructions |
| Google Antigravity | INSTRUCTIONS.md, README.md | Antigravity setup |
| OpenSpec | AGENTS.md | OpenSpec agent config |

**Total**: 7 files

---

### 8. extensions/ (Language/Framework/Locale Extensions)

Optional extensions for language-specific, framework-specific, and locale-specific standards.

| Subdirectory | Files | Description |
|--------------|-------|-------------|
| languages/ | 2 | Language coding styles (C#, PHP) |
| frameworks/ | 1 | Framework patterns (Fat-Free) |
| locales/ | 1 | Locale guidelines (Traditional Chinese) |

**Total**: 4 files

**Characteristics**:
- Not part of the core standards sync chain
- No zh-TW translations yet (reserved for future)
- Licensed under CC BY 4.0
- Independently adopted by projects as needed

**Current Files**:
| File | Version | Description |
|------|---------|-------------|
| languages/csharp-style.md | 1.0.1 | C# coding style guide |
| languages/php-style.md | 1.0.0 | PHP 8.1+ coding style guide |
| frameworks/fat-free-patterns.md | 1.0.0 | Fat-Free Framework patterns |
| locales/zh-tw.md | 1.2.0 | Traditional Chinese locale guidelines |

---

### 9. cli/ (CLI Tool)

Node.js command-line tool for adopting standards.

| Component | Files | Description |
|-----------|-------|-------------|
| bin/ | 1 | Entry point (uds.js) |
| src/commands/ | 5 | CLI commands (init, list, check, configure, update) |
| src/prompts/ | 1 | Interactive prompts |
| src/utils/ | 4 | Utilities (copier, detector, github, registry) |
| tests/ | Multiple | Test files |

**Update Trigger**: When core standards or options change significantly.

---

### 10. locales/ (Translations)

| Locale | Status | Coverage |
|--------|--------|----------|
| zh-TW (Traditional Chinese) | Active | ~100% |
| zh-CN (Simplified Chinese) | Partial | ~10% |

**zh-TW Structure** (mirrors English):
```
locales/zh-TW/
├── core/                    ← 15 translated standards
├── options/                 ← 18 translated MD options
├── ai/
│   ├── standards/           ← 15 translated AI standards
│   └── options/             ← 36 translated AI options
├── skills/claude-code/      ← Translated skills
├── adoption/                ← Translated adoption guides
├── templates/               ← Translated templates
├── README.md
├── CLAUDE.md
└── MAINTENANCE.md           ← This file (translated)
```

**Total**: ~129 files in zh-TW

---

### 11. Root Files

| File | Description | Update Trigger |
|------|-------------|----------------|
| README.md | Project overview | Major changes |
| CHANGELOG.md | Version history | Every release |
| CLAUDE.md | AI assistant instructions | Project guidelines change |
| CONTRIBUTING.md | Contribution guide | Process changes |
| STANDARDS-MAPPING.md | Standards quick reference | Standards added/removed |
| MAINTENANCE.md | This file | Maintenance process changes |

---

## Complete File Sync Map

### By Core Standard

Each core standard has a dependency tree. When updating a core file, all downstream files must be updated.

#### Simple Standards (No Options)

| Core Standard | Downstream Files | Total |
|---------------|------------------|-------|
| anti-hallucination.md | ai/standards, skill, 2x locales | ~6 |
| checkin-standards.md | ai/standards, skill, 2x locales | ~6 |
| documentation-writing-standards.md | ai/standards, skill, 2x locales | ~6 |
| spec-driven-development.md | ai/standards, 2x locales | ~4 |
| test-completeness-dimensions.md | ai/standards, skill, 2x locales | ~6 |
| error-code-standards.md | ai/standards, 2x locales | ~4 |
| logging-standards.md | ai/standards, 2x locales | ~4 |
| versioning.md | ai/standards, skill, 2x locales | ~8 |

#### Medium Complexity (YAML Options Only)

| Core Standard | Options | Downstream Files | Total |
|---------------|---------|------------------|-------|
| changelog-standards.md | 2 YAML | ai/standards, ai/options, skill, locales | ~12 |
| code-review-checklist.md | 3 YAML | ai/standards, ai/options, skill, locales | ~14 |
| documentation-structure.md | 3 YAML | ai/standards, ai/options, skill, locales | ~14 |

#### High Complexity (MD + YAML Options)

| Core Standard | MD Opts | YAML Opts | Total Files |
|---------------|---------|-----------|-------------|
| commit-message-guide.md | 3 | 3 | ~20 |
| git-workflow.md | 6 | 6 | ~32 |

#### Very High Complexity

| Core Standard | MD Opts | YAML Opts | Total Files |
|---------------|---------|-----------|-------------|
| project-structure.md | 5 | 10 | ~38 |
| testing-standards.md | 4 | 9 | ~34 |

---

## Update Workflows

### Workflow 1: Update a Core Standard

```
1. Edit core/{standard}.md                    ← Source
2. Update locales/zh-TW/core/{standard}.md    ← Translate
3. Update ai/standards/{standard}.ai.yaml     ← AI version
4. Update locales/zh-TW/ai/standards/...      ← Translate AI
5. If has MD options:
   a. Update options/{category}/*.md
   b. Update locales/zh-TW/options/{category}/
6. If has YAML options:
   a. Update ai/options/{category}/*.ai.yaml
   b. Update locales/zh-TW/ai/options/{category}/
7. If has skill:
   a. Update skills/claude-code/{skill}/
   b. Update locales/zh-TW/skills/claude-code/{skill}/
8. Run ./scripts/check-translation-sync.sh zh-TW
9. Update CHANGELOG.md if significant
```

### Workflow 2: Add a New Core Standard

```
1. Create core/{new-standard}.md
2. Create locales/zh-TW/core/{new-standard}.md
3. Create ai/standards/{new-standard}.ai.yaml
4. Create locales/zh-TW/ai/standards/{new-standard}.ai.yaml
5. If needs options:
   a. Create options/{category}/*.md (if MD options)
   b. Create ai/options/{category}/*.ai.yaml
   c. Create all locale translations
6. If needs skill:
   a. Create skills/claude-code/{skill-name}/
   b. Create locales/zh-TW/skills/claude-code/{skill-name}/
7. Update:
   - README.md (add to standards list)
   - STANDARDS-MAPPING.md
   - CHANGELOG.md
8. Run sync check
```

### Workflow 3: Add a New Option

```
1. Identify the parent standard
2. Create option file:
   - options/{category}/{option}.md (if MD option)
   - ai/options/{category}/{option}.ai.yaml (if YAML option)
3. Update parent ai/standards/{standard}.ai.yaml to reference new option
4. Create all locale translations
5. Run sync check
```

### Workflow 4: Add a New Skill

```
1. Create skills/claude-code/{skill-name}/
   - SKILL.md (main skill definition)
   - {topic}.md (supporting documents)
2. Create locales/zh-TW/skills/claude-code/{skill-name}/
3. Update skills/README.md
4. Update CHANGELOG.md
```

### Workflow 5: Update Integrations

```
1. Identify which standards affect the integration
2. Update integrations/{tool}/{file}
3. No translation needed (tool-specific)
4. Test with the actual AI tool if possible
```

### Workflow 6: Release a New Version

```
1. Ensure all sync checks pass
2. Update version numbers in:
   - package.json (cli/)
   - Modified core standards (meta.version)
   - Modified AI standards (meta.version)
3. Update CHANGELOG.md with all changes
4. Update README.md version badge if exists
5. Create git tag
6. Publish to npm (if cli changes)
```

### Workflow 7: Update Extensions

```
1. Identify the extension type:
   - languages/ → Language-specific coding style
   - frameworks/ → Framework-specific patterns
   - locales/ → Locale-specific guidelines
2. Edit extensions/{type}/{file}.md
3. Update version in file metadata
4. If zh-TW translation exists:
   a. Update locales/zh-TW/extensions/{type}/{file}.md
5. Update CHANGELOG.md if significant
```

**Note**: Extensions are independent of the core sync chain. They are adopted by projects as needed.

### Workflow 8: Update Adoption Guides

```
1. Edit adoption/{file}.md
2. Update locales/zh-TW/adoption/{file}.md
3. If checklist changed:
   a. Verify consistency across minimal/recommended/enterprise
4. Update CHANGELOG.md if significant
```

### Workflow 9: Update Templates

```
1. Edit templates/{template}.md
2. Update locales/zh-TW/templates/{template}.md
3. Verify template placeholders are consistent
4. Update CHANGELOG.md if significant
```

### Workflow 10: Update CLI Tool

```
1. Edit cli/src/{component}
2. Run tests: cd cli && npm test
3. Run linting: cd cli && npm run lint
4. If command behavior changed:
   a. Update cli/README.md
   b. Update help text in source
5. If new command added:
   a. Create cli/src/commands/{command}.js
   b. Register in cli/bin/uds.js
   c. Add tests in cli/tests/
6. Update package.json version if releasing
7. Update CHANGELOG.md
```

---

## Validation Commands

```bash
# Check translation sync status
./scripts/check-translation-sync.sh zh-TW

# List all AI standards
ls ai/standards/*.yaml

# List all AI options
find ai/options -name "*.yaml" | sort

# Compare file counts
echo "EN standards: $(ls ai/standards/*.yaml | wc -l)"
echo "ZH standards: $(ls locales/zh-TW/ai/standards/*.yaml | wc -l)"

# Find missing options (referenced but not existing)
grep -rh "file:.*options/" ai/standards/*.yaml | \
  sed 's/.*file: //' | sort -u | \
  while read f; do [ ! -f "ai/$f" ] && echo "Missing: $f"; done

# Count all project files
find . -name "*.md" -not -path "./node_modules/*" | wc -l
find . -name "*.yaml" -not -path "./node_modules/*" | wc -l

# CLI tests
cd cli && npm test
```

---

## File Count Summary

| Directory | English | zh-TW | Total |
|-----------|---------|-------|-------|
| core/ | 15 | 15 | 30 |
| options/ | 18 | 18 | 36 |
| ai/standards/ | 15 | 15 | 30 |
| ai/options/ | 36 | 36 | 72 |
| extensions/ | 4 | 0 | 4 |
| skills/ | 35 | 25 | 60 |
| adoption/ | 5 | 5 | 10 |
| templates/ | 4 | 4 | 8 |
| integrations/ | 7 | 0 | 7 |
| Root files | 6 | 3 | 9 |
| **Total** | **145** | **121** | **266** |

*Note: cli/ and scripts/ not included (not translated)*

---

## Related Documentation

- [ai/MAINTENANCE.md](ai/MAINTENANCE.md) - AI-specific maintenance guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [STANDARDS-MAPPING.md](STANDARDS-MAPPING.md) - Standards quick reference

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-30 | Initial project-level maintenance guide |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
