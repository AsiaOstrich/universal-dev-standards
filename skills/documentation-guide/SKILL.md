---
scope: universal
description: |
  Guide documentation structure, content requirements, and project documentation best practices.
  Use when: creating README, documentation, docs folder, project setup, technical docs.
  Keywords: README, docs, documentation, CONTRIBUTING, CHANGELOG, ARCHITECTURE, API docs, 文件, 說明文件, 技術文件.
---

# Documentation Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/documentation-guide/SKILL.md)

**Version**: 2.1.0
**Last Updated**: 2026-03-17
**Applicability**: Claude Code Skills

---

## Purpose

This skill provides comprehensive guidance on project documentation, including:
- Documentation structure and file organization
- Content requirements by project type
- Writing standards for technical documents
- Templates for common documentation types

---

## Quick Reference (YAML Compressed)

```yaml
# === PROJECT TYPE → DOCUMENT REQUIREMENTS ===
document_matrix:
  #           README  ARCH   API    DB     DEPLOY MIGRATE ADR    CHANGE CONTRIB
  new:        [REQ,   REQ,   if_app, if_app, REQ,   NO,     REC,   REQ,   REC]
  refactor:   [REQ,   REQ,   REQ,    REQ,    REQ,   REQ,    REQ,   REQ,   REC]
  migration:  [REQ,   REQ,   REQ,    REQ,    REQ,   REQ,    REQ,   REQ,   REC]
  maintenance:[REQ,   REC,   REC,    REC,    REC,   NO,     if_app, REQ,   if_app]
  # REQ=Required, REC=Recommended, if_app=If applicable, NO=Not needed

# === DOCUMENTATION PYRAMID ===
pyramid:
  level_1: "README.md → Entry point, quick overview"
  level_2: "ARCHITECTURE.md → System overview"
  level_3: "API.md, DATABASE.md, DEPLOYMENT.md → Technical details"
  level_4: "ADR/, MIGRATION.md, CHANGELOG.md → Change history"

# === ESSENTIAL FILES ===
root_files:
  README.md: {required: true, purpose: "Project overview, quick start"}
  CONTRIBUTING.md: {required: "recommended", purpose: "Contribution guidelines"}
  CHANGELOG.md: {required: "recommended", purpose: "Version history"}
  LICENSE: {required: "for OSS", purpose: "License information"}

docs_structure:
  INDEX.md: "Documentation index"
  ARCHITECTURE.md: "System architecture"
  API.md: "API documentation"
  DATABASE.md: "Database schema"
  DEPLOYMENT.md: "Deployment guide"
  MIGRATION.md: "Migration plan (if applicable)"
  ADR/: "Architecture Decision Records"

# === FILE NAMING ===
naming:
  root: "UPPERCASE.md (README.md, CONTRIBUTING.md, CHANGELOG.md)"
  docs: "lowercase-kebab-case.md (getting-started.md, api-reference.md)"

# === QUALITY STANDARDS ===
quality:
  format:
    language: "English (or project-specified)"
    encoding: "UTF-8"
    line_length: "≤120 characters recommended"
    diagrams: "Mermaid preferred, then ASCII Art"
    links: "Relative paths for internal links"
  maintenance:
    sync: "Update docs when code changes"
    version: "Mark version and date at top"
    review: "Include docs in code review"
    periodic: "Review quarterly for staleness"

# === DIÁTAXIS CLASSIFICATION ===
diataxis:
  tutorial: "Learning-oriented (getting-started.md)"
  how_to: "Task-oriented (deployment.md, migration.md)"
  reference: "Information-oriented (api-reference.md, CHANGELOG.md)"
  explanation: "Understanding-oriented (architecture.md, ADR/)"
  header: "Add **Document Type**: Tutorial | How-to | Reference | Explanation"

# === LLM DISCOVERY ===
llm_discovery:
  llms_txt: "Structured index at project root for LLM retrieval"
  llms_full_txt: "Optional full concatenated docs"
  when: "Public projects, public APIs, projects using AI tools"

# === QUALITY METRICS ===
quality_metrics:
  leading: ["Coverage ≥90%", "Freshness ≤90d", "Link Health 100%", "Example Validity 100%"]
  lagging: ["Support ticket reduction", "Onboarding time", "Doc-related PR comments"]
  tools: [markdown-link-check, lychee, remark-lint, vale, textstat]

# === ADR ENHANCED ===
adr_enhanced:
  new_fields: [Date, Deciders, Drivers, "supersedes/superseded-by"]
  lifecycle: "proposed → accepted → [deprecated | superseded]"
  decision_matrix: "impact × reversibility → ADR required?"

# === TRANSLATION-FRIENDLY ===
translation_friendly:
  rules: ["Complete sentences", "No idioms", "Consistent terminology", "Simple SVO", "Explicit references"]
  glossary: "Maintain glossary.md for term consistency"
  status_tracking: "YAML frontmatter with translation_status, source_version"
```

---

## Project Type Document Requirements

### Document Requirements Matrix

| Document | New Project | Refactoring | Migration | Maintenance |
|----------|:-----------:|:-----------:|:---------:|:-----------:|
| **README.md** | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **ARCHITECTURE.md** | ✅ Required | ✅ Required | ✅ Required | ⚪ Recommended |
| **API.md** | ⚪ If applicable | ✅ Required | ✅ Required | ⚪ Recommended |
| **DATABASE.md** | ⚪ If applicable | ✅ Required | ✅ Required | ⚪ Recommended |
| **DEPLOYMENT.md** | ✅ Required | ✅ Required | ✅ Required | ⚪ Recommended |
| **MIGRATION.md** | ❌ Not needed | ✅ Required | ✅ Required | ❌ Not needed |
| **ADR/** | ⚪ Recommended | ✅ Required | ✅ Required | ⚪ If applicable |
| **CHANGELOG.md** | ✅ Required | ✅ Required | ✅ Required | ✅ Required |

### Project Type Quick Reference

```
🆕 New Project     → README + ARCHITECTURE + DEPLOYMENT + CHANGELOG
🔄 Refactoring     → All documents + MIGRATION + ADR (document "why refactor")
🚚 Migration       → All documents + MIGRATION (core document) + data verification
🔧 Maintenance     → README + CHANGELOG (update based on change scope)
```

---

## Documentation Pyramid

```
                    ┌─────────────┐
                    │   README    │  ← Entry point, quick overview
                    ├─────────────┤
                 ┌──┴─────────────┴──┐
                 │   ARCHITECTURE    │  ← System overview
                 ├───────────────────┤
              ┌──┴───────────────────┴──┐
              │  API / DATABASE / DEPLOY │  ← Technical details
              ├─────────────────────────┤
           ┌──┴─────────────────────────┴──┐
           │    ADR / MIGRATION / CHANGELOG │  ← Change history
           └───────────────────────────────┘
```

---

## Document Templates (YAML Compressed)

```yaml
# === README.md ===
readme:
  minimum:
    - "# Project Name"
    - "Brief one-liner description"
    - "## Installation"
    - "## Usage"
    - "## License"
  recommended:
    - "# Project Name + Badges"
    - "## Features (bullet list)"
    - "## Installation"
    - "## Quick Start / Usage"
    - "## Documentation (link to docs/)"
    - "## Contributing (link to CONTRIBUTING.md)"
    - "## License"

# === ARCHITECTURE.md ===
architecture:
  required:
    - system_overview: "Purpose, scope, main functions"
    - architecture_diagram: "Mermaid or ASCII Art"
    - module_description: "Responsibilities, dependencies"
    - technology_stack: "Frameworks, languages, versions"
    - data_flow: "Main business process"
  recommended:
    - deployment_architecture: "Production topology"
    - design_decisions: "Key decisions (or link to ADR)"

# === API.md ===
api:
  required:
    - api_overview: "Version, base URL, authentication"
    - authentication: "Token acquisition, expiration"
    - endpoint_list: "All API endpoints"
    - endpoint_specs: "Request/response format"
    - error_codes: "Error codes and descriptions"
  recommended:
    - code_examples: "Examples in common languages"
    - rate_limiting: "API call frequency limits"
  endpoint_format: |
    ### POST /api/v1/resource
    **Request**: | Field | Type | Required | Description |
    **Response**: | Field | Type | Description |
    **Errors**: | Code | Description |

# === DATABASE.md ===
database:
  required:
    - db_overview: "Type, version, connection info"
    - er_diagram: "Entity relationship diagram"
    - table_list: "All tables with purposes"
    - table_specs: "Column definitions"
    - index_docs: "Indexing strategy"
    - migration_scripts: "Script locations"
  recommended:
    - backup_strategy: "Frequency, retention"
  table_format: |
    ### TableName
    **Columns**: | Column | Type | Nullable | Default | Description |
    **Indexes**: | Name | Columns | Type |
    **Relations**: | Related | Join | Relationship |

# === DEPLOYMENT.md ===
deployment:
  required:
    - environment_requirements: "Hardware, software, network"
    - installation_steps: "Detailed process"
    - configuration: "Config file parameters"
    - verification: "Confirm successful deployment"
    - troubleshooting: "Common issues and solutions"
  recommended:
    - monitoring: "Health checks, log locations"
    - scaling_guide: "Horizontal/vertical scaling"

# === MIGRATION.md ===
migration:
  required:
    - overview: "Goals, scope, timeline"
    - prerequisites: "Required preparation"
    - migration_steps: "Detailed process"
    - verification_checklist: "Post-migration checks"
    - rollback_plan: "Steps on failure"
    - backward_compatibility: "API/DB compatibility"
  recommended:
    - partner_notification: "External systems to notify"

# === ADR (Architecture Decision Record) ===
adr:
  filename: "NNN-kebab-case-title.md (e.g., 001-use-postgresql.md)"
  required:
    - title: "Decision name"
    - status: "proposed | accepted | deprecated | superseded"
    - context: "Why this decision is needed"
    - decision: "Specific decision content"
    - consequences: "Impact (positive/negative)"
  recommended:
    - alternatives: "Other options considered"
```

---

## File Location Standards

```
project-root/
├── README.md                    # Project entry document
├── CONTRIBUTING.md              # Contribution guide
├── CHANGELOG.md                 # Change log
├── LICENSE                      # License file
└── docs/                        # Documentation directory
    ├── INDEX.md                 # Documentation index
    ├── ARCHITECTURE.md          # Architecture document
    ├── API.md                   # API document
    ├── DATABASE.md              # Database document
    ├── DEPLOYMENT.md            # Deployment document
    ├── MIGRATION.md             # Migration document (if needed)
    └── ADR/                     # Architecture decision records
        ├── 001-xxx.md
        └── ...
```

---

## README.md Required Sections

### Minimum Viable README

```markdown
# Project Name

Brief one-liner description.

## Installation

```bash
npm install your-package
```

## Usage

```javascript
const lib = require('your-package');
lib.doSomething();
```

## License

MIT
```

### Recommended README Sections

1. **Project Name & Description**
2. **Badges** (CI status, coverage, npm version)
3. **Features** (bullet list)
4. **Installation**
5. **Quick Start / Usage**
6. **Documentation** (link to docs/)
7. **Contributing** (link to CONTRIBUTING.md)
8. **License**

---

## ADR Template

```markdown
# ADR-001: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded
**Deciders**: [List of people involved]
**Supersedes**: ADR-NNN (if applicable)
**Superseded by**: ADR-NNN (if applicable)

## Drivers

- [Key factor 1]
- [Key factor 2]

## Context
[Why this decision is needed...]

## Decision
[Specific decision...]

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
- Drawback 2

## Alternatives Considered

### Alternative A: [Name]
- **Pros**: ...
- **Cons**: ...
- **Rejected because**: ...
```

**When to write ADR** (impact × reversibility):
- **High impact + Hard to reverse** → ADR required
- **High impact + Easy to reverse** → Optional
- **Low impact + Hard to reverse** → Optional
- **Low impact + Easy to reverse** → No ADR needed

---

## Documentation Audit Checklist

When reviewing a project's documentation:

```
□ README.md exists with essential sections
□ Installation instructions are clear and tested
□ Usage examples are provided and work
□ License specified
□ ARCHITECTURE.md exists (for non-trivial projects)
□ API.md exists (if APIs exposed)
□ DATABASE.md exists (if databases used)
□ DEPLOYMENT.md exists (for deployed projects)
□ ADR/ exists for major decisions
□ CHANGELOG.md follows Keep a Changelog format
□ All internal links working
□ Diagrams are up to date
□ No outdated information
```

---

## Configuration Detection

### Detection Order

1. Check `CONTRIBUTING.md` for "Disabled Skills" section
2. Check `CONTRIBUTING.md` for "Documentation Language" section
3. Check existing documentation structure
4. If not found, **default to English**

### First-Time Setup

If documentation is missing:

1. Ask: "This project doesn't have complete documentation. Which language should I use? (English / 中文)"
2. Determine project type (new/refactor/migrate/maintain)
3. Create required documents based on matrix
4. Suggest documenting in `CONTRIBUTING.md`:

```markdown
## Documentation Standards

### Language
This project uses **English** for documentation.

### Required Documents
Based on project type, we maintain:
- README.md
- ARCHITECTURE.md
- DEPLOYMENT.md
- CHANGELOG.md
```

---

## Detailed Guidelines

For complete standards, see:
- [Documentation Writing Standards](../../core/documentation-writing-standards.md)
- [Documentation Structure](../../core/documentation-structure.md)
- [README Template](./readme-template.md)

---

## Next Steps Guidance | 下一步引導

After `/docs-guide` completes, the AI assistant should suggest:

> **文件結構與需求已釐清。建議下一步 / Documentation structure and requirements clarified. Suggested next steps:**
> - 執行 `/docs` 根據指南直接產生專案文件 ⭐ **Recommended / 推薦** — 立即將文件指南化為行動 / Turn documentation guidelines into action immediately
> - 執行 `/changelog` 建立或更新 CHANGELOG.md — 確保變更歷史完整 / Ensure change history is complete
> - 執行 `/sdd` 將文件需求納入規格驅動開發 — 確保文件與功能同步 / Ensure docs stay in sync with features

---

## Related Standards

- [Documentation Writing Standards](../../core/documentation-writing-standards.md) - Content requirements
- [Documentation Structure](../../core/documentation-structure.md) - File organization
- [Changelog Standards](../../core/changelog-standards.md) - CHANGELOG format
- [Changelog Guide Skill](../changelog-guide/SKILL.md) - CHANGELOG skill

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-03-17 | Added: Diátaxis classification, LLM discovery, quality metrics, enhanced ADR template, translation-friendly writing |
| 2.0.0 | 2026-01-12 | Added: Project type matrix, document templates, documentation pyramid |
| 1.0.0 | 2025-12-24 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
