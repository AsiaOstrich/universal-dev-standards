# Universal Development Standards - Maintenance Guide

> **Language**: English | [繁體中文](locales/zh-TW/MAINTENANCE.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-07

---

## Purpose

This document defines the complete maintenance workflow for the Universal Development Standards project. It covers all directories, files, and their synchronization relationships.

---

## Project Architecture Overview

```
universal-dev-standards/
├── core/                    ← PRIMARY SOURCE (32 standards)
├── options/                 ← MD options (18 files)
├── ai/                      ← AI-optimized versions (52 YAML files)
│   ├── standards/           ← 32 AI standards
│   ├── options/             ← 36 AI options
│   └── MAINTENANCE.md       ← AI-specific maintenance guide
├── extensions/              ← Language/framework/locale extensions (4 files)
│   ├── languages/           ← Language-specific standards
│   ├── frameworks/          ← Framework-specific patterns
│   └── locales/             ← Locale-specific guidelines
├── skills/                  ← Claude Code skills (38 files)
│   └── claude-code/         ← 26 skill packages
├── adoption/                ← Adoption guides (5 files)
├── templates/               ← Document templates (4 files)
├── integrations/            ← AI tool configs (7 files)
├── cli/                     ← Node.js CLI tool
├── scripts/                 ← Maintenance scripts (sync checks)
├── locales/                 ← Translations (129 files)
│   ├── zh-TW/               ← Traditional Chinese
│   └── zh-CN/               ← Simplified Chinese (⚠️ 需與 EN 同步)
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
| acceptance-test-driven-development.md | 1.1.0 | ATDD methodology |
| accessibility-standards.md | 1.0.0 | Accessibility guidelines |
| ai-agreement-standards.md | 1.0.0 | Human-AI agreement protocol |
| ai-friendly-architecture.md | 1.0.0 | AI-optimized design patterns |
| ai-instruction-standards.md | 1.0.0 | Best practices for AI instructions |
| anti-hallucination.md | 1.5.0 | AI behavior guidelines |
| behavior-driven-development.md | 1.1.0 | BDD methodology |
| changelog-standards.md | 1.0.2 | Changelog format rules |
| checkin-standards.md | 1.4.0 | Code check-in checklist |
| code-review-checklist.md | 1.3.0 | Code review guidelines |
| commit-message-guide.md | 1.2.3 | Commit message format |
| deployment-standards.md | 1.0.0 | Deployment guidelines |
| developer-memory.md | 1.0.0 | Structured AI memory system |
| documentation-structure.md | 1.3.0 | Doc organization |
| documentation-writing-standards.md | 1.1.0 | Writing guidelines |
| error-code-standards.md | 1.1.0 | Error code format |
| forward-derivation-standards.md | 1.1.0 | Auto-derivation principles |
| git-workflow.md | 1.4.0 | Git workflow patterns |
| logging-standards.md | 1.2.0 | Logging guidelines |
| performance-standards.md | 1.1.0 | Performance engineering |
| project-context-memory.md | 1.0.0 | Context-aware memory system |
| project-structure.md | 1.1.0 | Project organization |
| refactoring-standards.md | 2.1.0 | Safe refactoring practices |
| requirement-engineering.md | 1.0.0 | INVEST criteria & storytelling |
| reverse-engineering-standards.md | 1.0.0 | Code-to-spec recovery |
| security-standards.md | 1.1.0 | Security best practices |
| spec-driven-development.md | 2.1.0 | SDD workflow |
| test-completeness-dimensions.md | 1.1.0 | Testing dimensions |
| test-driven-development.md | 1.2.0 | TDD workflow |
| testing-standards.md | 3.0.0 | Testing guidelines |
| versioning.md | 1.2.0 | Semantic versioning |
| virtual-organization-standards.md | 1.0.0 | AI orchestration framework |

**Total**: 32 files

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
| standards/ | 16 | AI-optimized core standards |
| options/changelog/ | 2 | Changelog options |
| options/code-review/ | 3 | Code review options |
| options/commit-message/ | 3 | Commit message options |
| options/documentation/ | 3 | Documentation options |
| options/git-workflow/ | 6 | Git workflow options |
| options/project-structure/ | 10 | Project structure options (5 extra YAML-only) |
| options/testing/ | 9 | Testing options (5 extra YAML-only) |

**Total**: 52 YAML files

---

### 4. skills/ (Claude Code Skills)

Skill packages for Claude Code AI assistant.

| Skill | Files | Related Core Standards |
|-------|-------|------------------------|
| ai-collaboration-standards/ | 3 | anti-hallucination.md |
| ai-friendly-architecture/ | 2 | ai-friendly-architecture.md |
| ai-instruction-standards/ | 2 | ai-instruction-standards.md |
| atdd-assistant/ | 3 | acceptance-test-driven-development.md |
| bdd-assistant/ | 3 | behavior-driven-development.md |
| changelog-guide/ | 2 | changelog-standards.md |
| checkin-assistant/ | 3 | checkin-standards.md |
| code-review-assistant/ | 3 | code-review-checklist.md, checkin-standards.md |
| commit-standards/ | 3 | commit-message-guide.md |
| docs-generator/ | 2 | documentation-writing-standards.md |
| documentation-guide/ | 3 | documentation-structure.md, documentation-writing-standards.md |
| error-code-guide/ | 2 | error-code-standards.md |
| forward-derivation/ | 3 | forward-derivation-standards.md |
| git-workflow-guide/ | 3 | git-workflow.md |
| logging-guide/ | 2 | logging-standards.md |
| methodology-system/ | 3 | methodology-system (cross-standard) |
| project-discovery/ | 2 | project-context-memory.md |
| project-structure-guide/ | 2 | project-structure.md |
| refactoring-assistant/ | 3 | refactoring-standards.md |
| release-standards/ | 4 | changelog-standards.md, versioning.md |
| requirement-assistant/ | 3 | requirement-engineering.md |
| reverse-engineer/ | 3 | reverse-engineering-standards.md |
| spec-driven-dev/ | 2 | spec-driven-development.md |
| tdd-assistant/ | 3 | test-driven-development.md |
| test-coverage-assistant/ | 2 | test-completeness-dimensions.md |
| testing-guide/ | 2 | testing-standards.md |

**Total**: 26 skill packages

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
| zh-CN (Simplified Chinese) | ⚠️ 需與 EN 同步 | ~10% |

**zh-TW Structure** (mirrors English):
```
locales/zh-TW/
├── core/                    ← 16 translated standards
├── options/                 ← 18 translated MD options
├── ai/
│   ├── standards/           ← 16 translated AI standards
│   └── options/             ← 36 translated AI options
├── skills/      ← Translated skills
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
| acceptance-test-driven-development.md | ai/standards, skill, 2x locales | ~6 |
| accessibility-standards.md | ai/standards, 2x locales | ~4 |
| ai-agreement-standards.md | ai/standards, 2x locales | ~4 |
| ai-friendly-architecture.md | ai/standards, skill, 2x locales | ~6 |
| ai-instruction-standards.md | ai/standards, skill, 2x locales | ~6 |
| anti-hallucination.md | ai/standards, skill, 2x locales | ~6 |
| behavior-driven-development.md | ai/standards, skill, 2x locales | ~6 |
| checkin-standards.md | ai/standards, skill, 2x locales | ~6 |
| deployment-standards.md | ai/standards, 2x locales | ~4 |
| developer-memory.md | ai/standards, 2x locales | ~4 |
| documentation-writing-standards.md | ai/standards, skill, 2x locales | ~6 |
| error-code-standards.md | ai/standards, skill, 2x locales | ~4 |
| forward-derivation-standards.md | ai/standards, skill, 2x locales | ~6 |
| logging-standards.md | ai/standards, skill, 2x locales | ~4 |
| performance-standards.md | ai/standards, 2x locales | ~4 |
| project-context-memory.md | ai/standards, skill, 2x locales | ~6 |
| refactoring-standards.md | ai/standards, skill, 2x locales | ~6 |
| requirement-engineering.md | ai/standards, skill, 2x locales | ~6 |
| reverse-engineering-standards.md | ai/standards, skill, 2x locales | ~6 |
| security-standards.md | ai/standards, 2x locales | ~4 |
| spec-driven-development.md | ai/standards, skill, 2x locales | ~4 |
| test-completeness-dimensions.md | ai/standards, skill, 2x locales | ~6 |
| test-driven-development.md | ai/standards, skill, 2x locales | ~6 |
| versioning.md | ai/standards, skill, 2x locales | ~8 |
| virtual-organization-standards.md | ai/standards, 2x locales | ~4 |

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

## Standards Classification: Dynamic vs Static

When deciding whether a core standard should become a Skill or be added to CLAUDE.md, use this classification guide.

> **For adoption decisions**: See [STATIC-DYNAMIC-GUIDE.md](adoption/STATIC-DYNAMIC-GUIDE.md) for detailed decision flowcharts and deployment guidance.

### Dynamic Standards (Suitable for Skills)

Standards with these characteristics should become Skills:
- ✅ Clear trigger timing (events, keywords)
- ✅ Decision support needed (choices, recommendations)
- ✅ Step-by-step workflow
- ✅ Produces concrete output (messages, files)

| Core Standard | Skill | Trigger Keywords |
|---------------|-------|------------------|
| anti-hallucination.md | ai-collaboration-standards | certainty, assumption, inference |
| acceptance-test-driven-development.md | atdd-assistant | ATDD, acceptance tests |
| ai-friendly-architecture.md | ai-friendly-architecture | architecture, design patterns |
| ai-instruction-standards.md | ai-instruction-standards | CLAUDE.md, instructions, rules |
| behavior-driven-development.md | bdd-assistant | BDD, gherkin, scenarios |
| changelog-standards.md | changelog-guide | changelog, release notes |
| code-review-checklist.md | code-review-assistant | review, PR, checklist |
| commit-message-guide.md | commit-standards | commit, git, message |
| documentation-*.md | documentation-guide | README, docs, CONTRIBUTING |
| error-code-standards.md | error-code-guide | error code, error handling |
| forward-derivation-standards.md | forward-derivation | derive, generate, skeleton |
| git-workflow.md | git-workflow-guide | branch, merge, PR |
| logging-standards.md | logging-guide | logging, log level |
| project-structure.md | project-structure-guide | structure, organization |
| refactoring-standards.md | refactoring-assistant | refactor, optimize, debt |
| requirement-engineering.md | requirement-assistant | story, INVEST, requirement |
| reverse-engineering-standards.md | reverse-engineer | reverse, spec recovery |
| spec-driven-development.md | spec-driven-dev | spec, SDD, proposal |
| test-completeness-dimensions.md | test-coverage-assistant | test coverage, 7 dimensions |
| test-driven-development.md | tdd-assistant | TDD, red-green-refactor, test first |
| testing-standards.md | testing-guide | test, unit, integration |
| versioning.md | release-standards | version, release, semver |

### Static Standards (Suitable for CLAUDE.md)

Standards with these characteristics should be added to CLAUDE.md instead of becoming Skills:
- ❌ Globally applicable, no specific trigger
- ❌ Mandatory rules, no choices needed
- ❌ One-time setup
- ❌ Background knowledge

| Core Standard | Location | Reason |
|---------------|----------|--------|
| checkin-standards.md | CLAUDE.md | Mandatory pre-commit checklist, always applicable |
| accessibility-standards.md | Rules | Universal principles, always applicable |
| security-standards.md | Rules | Universal principles, always applicable |
| performance-standards.md | Rules | Universal principles, always applicable |
| developer-memory.md | System | Background persistent storage |
| virtual-organization-standards.md | System | Organizational orchestration |

---

## Update Workflows

### Workflow 0: Documentation & Manifest Sync (New)

Use this workflow whenever core standards, skills, or commands are added, modified, or deleted to keep all multi-language READMEs in sync.

```bash
# 1. Sync metadata from file system to JSON registry
npm run docs:manifest

# 2. Inject latest stats into all README files (EN, zh-TW, zh-CN)
npm run docs:generate

# OR: Run both in one command
npm run docs:sync
```

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
   a. Update skills/{skill}/
   b. Update locales/zh-TW/skills/{skill}/
8. Run ./scripts/check-translation-sync.sh zh-TW
9. Run ./scripts/check-install-scripts-sync.sh (if skills changed)
10. Update CHANGELOG.md if significant
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
   a. Create skills/{skill-name}/
   b. Create locales/zh-TW/skills/{skill-name}/
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
0. Determine if Skill is Appropriate
   Before creating a skill, verify the standard is "dynamic":
   - [ ] Has clear trigger timing (events, keywords)?
   - [ ] Needs decision support (choices, recommendations)?
   - [ ] Has step-by-step workflow?
   - [ ] Produces concrete output (messages, files)?

   If YES to most → Create Skill (continue to step 1)
   If NO to most  → Add to CLAUDE.md instead (see Static Standards)

1. Create skills/{skill-name}/
   - SKILL.md (main skill definition with YAML frontmatter)
   - {topic}.md (supporting documents, optional)
2. Create locales/zh-TW/skills/{skill-name}/
   - SKILL.md (translated version)
3. Update MAINTENANCE.md
   - Add to skills table in section 4
   - Add to Dynamic Standards table
4. Update CHANGELOG.md
```

**SKILL.md Standard Structure**:
```markdown
---
name: skill-name
description: |
  Short description.
  Use when: trigger scenarios.
  Keywords: english, keywords, 中文, 關鍵字.
---

# Skill Title

> **Language**: English | [繁體中文](path/to/zh-TW)

**Version**: 1.0.0
**Last Updated**: YYYY-MM-DD
**Applicability**: Claude Code Skills

---

## Purpose
## Quick Reference
## Detailed Guidelines
## AI-Optimized Format
## Examples
## Configuration Detection
## Related Standards
## Version History
## License
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
   - For beta versions: GitHub Actions automatically tags as @beta
   - For stable versions: GitHub Actions automatically tags as @latest
   - See .github/workflows/publish.yml for automation details
```

**npm dist-tag Strategy**:

| Version Pattern | npm Tag | Install Command | Use Case |
|----------------|---------|-----------------|----------|
| `X.Y.Z` | `latest` | `npm install -g universal-dev-standards` | Stable releases |
| `X.Y.Z-beta.N` | `beta` | `npm install -g universal-dev-standards@beta` | Beta testing |
| `X.Y.Z-alpha.N` | `alpha` | `npm install -g universal-dev-standards@alpha` | Alpha testing |
| `X.Y.Z-rc.N` | `rc` | `npm install -g universal-dev-standards@rc` | Release candidates |

**Manual Tag Correction** (if needed):
```bash
# Correct mistaken tags
npm dist-tag add universal-dev-standards@X.Y.Z latest
npm dist-tag add universal-dev-standards@X.Y.Z-beta.N beta
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

### macOS / Linux

```bash
# Check translation sync status
./scripts/check-translation-sync.sh zh-TW

# Check install scripts sync (skills)
./scripts/check-install-scripts-sync.sh

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

### Windows PowerShell

```powershell
# Check translation sync status
.\scripts\check-translation-sync.ps1 -Locale zh-TW

# Check install scripts sync (skills)
.\scripts\check-install-scripts-sync.ps1

# List all AI standards
Get-ChildItem ai\standards\*.yaml

# List all AI options
Get-ChildItem ai\options -Recurse -Filter "*.yaml" | Sort-Object FullName

# Compare file counts
Write-Host "EN standards: $((Get-ChildItem ai\standards\*.yaml).Count)"
Write-Host "ZH standards: $((Get-ChildItem locales\zh-TW\ai\standards\*.yaml).Count)"

# Count all project files
(Get-ChildItem -Recurse -Filter "*.md" | Where-Object { $_.FullName -notlike "*node_modules*" }).Count
(Get-ChildItem -Recurse -Filter "*.yaml" | Where-Object { $_.FullName -notlike "*node_modules*" }).Count

# CLI tests
Set-Location cli; npm test
```

---

## File Count Summary

| Directory | English | zh-TW | Total |
|-----------|---------|-------|-------|
| core/ | 32 | 32 | 64 |
| options/ | 18 | 18 | 36 |
| ai/standards/ | 32 | 32 | 64 |
| ai/options/ | 36 | 36 | 72 |
| extensions/ | 4 | 0 | 4 |
| skills/ | 60 | 60 | 120 |
| adoption/ | 5 | 5 | 10 |
| templates/ | 4 | 4 | 8 |
| integrations/ | 7 | 0 | 7 |
| Root files | 6 | 3 | 9 |
| **Total** | **204** | **190** | **394** |

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
| 1.1.0 | 2026-01-07 | Add TDD standard and tdd-assistant skill, update to 15 skills |
| 1.0.0 | 2025-12-30 | Initial project-level maintenance guide |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
