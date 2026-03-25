# Documentation Writing Standards

> **English** | [繁體中文](../locales/zh-TW/core/documentation-writing-standards.md)

**Version**: 1.2.0
**Last Updated**: 2026-03-17
**Applicability**: All software projects (new, refactoring, migration, maintenance)
**Scope**: partial
**Industry Standards**: OpenAPI 3.1, AsyncAPI 2.6, JSON Schema 2020-12
**References**: [openapis.org](https://www.openapis.org/)

---

## Purpose

This standard defines documentation requirements based on project types and provides detailed writing guidelines for each document category.

**Relationship to Other Standards**:
- Complements [documentation-structure.md](documentation-structure.md) which defines file organization
- This standard focuses on **content requirements** and **project type mapping**

---

## Project Types and Required Documents

### Document Requirements Matrix

| Document | New Project | Refactoring | Migration | Maintenance | Description |
|----------|:-----------:|:-----------:|:---------:|:-----------:|-------------|
| **README.md** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | Project entry point |
| **ARCHITECTURE.md** | ✅ Required | ✅ Required | ✅ Required | ⚪ Recommended | System architecture |
| **API.md** | ⚪ If applicable | ✅ Required | ✅ Required | ⚪ Recommended | API specification |
| **DATABASE.md** | ⚪ If applicable | ✅ Required | ✅ Required | ⚪ Recommended | Database schema |
| **DEPLOYMENT.md** | ✅ Required | ✅ Required | ✅ Required | ⚪ Recommended | Deployment guide |
| **MIGRATION.md** | ❌ Not needed | ✅ Required | ✅ Required | ❌ Not needed | Migration plan |
| **ADR/** | ⚪ Recommended | ✅ Required | ✅ Required | ⚪ If applicable | Architecture decisions |
| **CHANGELOG.md** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | Version history |
| **CONTRIBUTING.md** | ⚪ Recommended | ⚪ Recommended | ⚪ Recommended | ⚪ If applicable | Contribution guide |

**Legend**: ✅ Required | ⚪ Recommended/If applicable | ❌ Not needed

---

### Project Type Descriptions

#### 🆕 New Project

Building software from scratch.

**Required Documents**:
- README.md - Project overview, quick start
- ARCHITECTURE.md - Design architecture (pre-development planning)
- DEPLOYMENT.md - Deployment process
- CHANGELOG.md - Version history

**Recommended Documents**:
- API.md - If exposing external APIs
- DATABASE.md - If using databases
- ADR/ - Record important technical decisions

---

#### 🔄 Refactoring Project

Improving existing system's code structure, architecture, or technology stack without changing external behavior.

**Required Documents**:
- README.md - Update technology stack description
- ARCHITECTURE.md - Compare old and new architecture
- API.md - API change documentation (if applicable)
- DATABASE.md - Schema change documentation (if applicable)
- DEPLOYMENT.md - New deployment process
- MIGRATION.md - Refactoring migration plan
- ADR/ - Document refactoring decisions
- CHANGELOG.md - Detailed change records

**Key Points**:
- MIGRATION.md must include rollback plan
- ADR/ must document "why refactor" and "why this approach"

---

#### 🚚 Migration Project

Moving system from one environment/platform to another (e.g., cloud migration, version upgrade).

**Required Documents**:
- README.md - New environment description
- ARCHITECTURE.md - New architecture diagram
- API.md - API compatibility documentation
- DATABASE.md - Data migration documentation
- DEPLOYMENT.md - New environment deployment
- MIGRATION.md - Migration steps and verification
- ADR/ - Migration decision records
- CHANGELOG.md - Migration change records

**Key Points**:
- MIGRATION.md is the core document
- Must include data migration verification, rollback plan, integration partner notification

---

#### 🔧 Maintenance Project

Day-to-day maintenance, bug fixes, minor feature enhancements of existing systems.

**Required Documents**:
- README.md - Keep updated
- CHANGELOG.md - Record every change

**Recommended Documents**:
- Other documents updated based on change scope

---

## Documentation Language Configuration

Documentation language shares the `output_language` setting with [commit-message-guide.md](commit-message-guide.md). This unified setting controls the language of all written outputs in a project.

### Language Options

| Setting Value | Commit Messages | Documentation |
|--------------|----------------|---------------|
| `english` | English only | English only |
| `traditional-chinese` | Traditional Chinese only | Traditional Chinese only |
| `bilingual` | English + Chinese | Tiered bilingual (see below) |

### Document Tiers (Bilingual Mode)

When `output_language` is set to `bilingual`, documents follow a three-tier system:

| Tier | Documents | Behavior | Rationale |
|------|-----------|----------|-----------|
| **L1 — Mandatory** | Commit messages, CHANGELOG.md, PR descriptions | Automatically bilingual | Directly controlled by language setting |
| **L2 — Recommended** | README.md, CONTRIBUTING.md, ADR/ | AI suggests bilingual | Most frequently read by developers |
| **L3 — Unaffected** | ARCHITECTURE.md, API.md, DATABASE.md, DEPLOYMENT.md, MIGRATION.md | Follows display language | Technical specs; bilingual adds excessive redundancy |

### Bilingual Document Format

Use paragraph-level bilingual format, consistent with bilingual commit message body:

- English paragraph first, followed by a blank line, then Chinese paragraph
- Code blocks and tables are written once (not duplicated)
- Section headings use `|` separator: `## Installation | 安裝`

---

## Core Principles

> **Documentation is an extension of code and should be treated with equal importance. Good documentation reduces communication costs, accelerates onboarding, and lowers maintenance risks.**

### Documentation Pyramid

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

## Document Categories and Standards

### 1. Architecture Documentation

#### ARCHITECTURE.md

**Purpose**: Describe overall system architecture, module division, technology choices

**Required Sections**:

| Section | Description | Required |
|---------|-------------|----------|
| System Overview | Purpose, scope, main functions | Required |
| Architecture Diagram | Use Mermaid or ASCII Art | Required |
| Module Description | Responsibilities, dependencies | Required |
| Technology Stack | Frameworks, languages, database versions | Required |
| Data Flow | Main business process data flow | Required |
| Deployment Architecture | Production deployment topology | Recommended |
| Design Decisions | Reasons for key decisions (or link to ADR) | Recommended |

**Template Structure**:

```markdown
# System Architecture

## 1. Overview
[System purpose and scope]

## 2. Architecture Diagram
[Mermaid or ASCII diagram]

## 3. Module Description
### 3.1 Presentation Layer
### 3.2 Business Logic Layer
### 3.3 Data Access Layer

## 4. Technology Stack
| Category | Technology | Version |
|----------|------------|---------|

## 5. Data Flow
[Main business process diagram]

## 6. Deployment Architecture
[Deployment topology diagram]
```

---

### 2. API Documentation

#### API.md

**Purpose**: Document external API interfaces

**Required Sections**:

| Section | Description | Required |
|---------|-------------|----------|
| API Overview | Version, base URL, authentication | Required |
| Authentication | Token acquisition, expiration | Required |
| Endpoint List | All API endpoints | Required |
| Endpoint Specifications | Request/response format for each | Required |
| Error Code Reference | Error codes and descriptions | Required |
| Code Examples | Examples in common languages | Recommended |
| Rate Limiting | API call frequency limits | If applicable |

**Endpoint Specification Format**:

```markdown
### POST /api/v1/resource

Description of what this endpoint does.

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field1 | string | Yes | Description |
| field2 | integer | No | Description |

**Request Example**
```json
{
  "field1": "value",
  "field2": 123
}
```

**Response**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether successful |
| data | object | Response data |

**Response Example**
```json
{
  "success": true,
  "data": {}
}
```

**Error Responses**
| Code | Description |
|------|-------------|
| 400 | Bad request |
| 401 | Unauthorized |
```

---

### 3. Database Documentation

#### DATABASE.md

**Purpose**: Document database structure, relationships, indexing strategy

**Required Sections**:

| Section | Description | Required |
|---------|-------------|----------|
| Database Overview | Type, version, connection info | Required |
| ER Diagram | Entity relationship diagram | Required |
| Table List | All tables with purposes | Required |
| Table Specifications | Column definitions for each table | Required |
| Index Documentation | Indexing strategy and performance | Required |
| Migration Scripts | Script locations and execution order | Required |
| Backup Strategy | Backup frequency, retention | Recommended |

**Table Specification Format**:

```markdown
### TableName

Description of table purpose.

**Column Definition**

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | bigint | No | IDENTITY | Primary key |
| name | varchar(100) | No | - | Name field |
| status | tinyint | No | 0 | Status flag |

**Indexes**

| Index Name | Columns | Type | Description |
|------------|---------|------|-------------|
| PK_TableName | id | CLUSTERED | Primary key |
| IX_Status | status, created_at | NONCLUSTERED | Query optimization |

**Relationships**

| Related Table | Join Columns | Relationship |
|---------------|--------------|--------------|
| OtherTable | id = other_id | 1:N |
```

---

### 4. Deployment Documentation

#### DEPLOYMENT.md

**Purpose**: Document deployment steps, environment configuration, troubleshooting

**Required Sections**:

| Section | Description | Required |
|---------|-------------|----------|
| Environment Requirements | Hardware, software, network | Required |
| Installation Steps | Detailed installation process | Required |
| Configuration | Configuration file parameters | Required |
| Verification | How to confirm successful deployment | Required |
| Troubleshooting | Common issues and solutions | Required |
| Monitoring | Health checks, log locations | Recommended |
| Scaling Guide | How to scale horizontally/vertically | If applicable |

**Configuration Documentation Format**:

```markdown
### config.yaml Settings

| Parameter | Default | Description | Example |
|-----------|---------|-------------|---------|
| db.host | localhost | Database host | `192.168.1.100` |
| db.port | 5432 | Database port | - |
| app.timeout | 300 | Request timeout (seconds) | - |
```

---

### 5. Migration Documentation

#### MIGRATION.md

**Purpose**: Document migration plan, backward compatibility strategy, rollback procedures

**Required Sections**:

| Section | Description | Required |
|---------|-------------|----------|
| Migration Overview | Goals, scope, timeline | Required |
| Prerequisites | Required preparation before migration | Required |
| Migration Steps | Detailed migration process | Required |
| Verification Checklist | Post-migration verification items | Required |
| Rollback Plan | Steps to rollback on failure | Required |
| Backward Compatibility | API/database compatibility notes | Required |
| Integration Partner Notification | External systems to notify | If applicable |

---

### 6. Architecture Decision Records (ADR)

#### docs/ADR/NNN-title.md

**Purpose**: Record important architectural decisions and their rationale

**File Naming**: `NNN-kebab-case-title.md` (e.g., `001-use-postgresql.md`)

**Required Sections**:

| Section | Description | Required |
|---------|-------------|----------|
| Title | Decision name | Required |
| Date | Decision date (YYYY-MM-DD) | Required |
| Status | proposed/accepted/deprecated/superseded | Required |
| Deciders | Who made or participated in the decision | Required |
| Context | Why this decision is needed | Required |
| Decision | Specific decision content | Required |
| Consequences | Impact of decision (positive/negative) | Required |
| Drivers | Key factors driving the decision | Recommended |
| Alternatives | Other options considered | Recommended |
| Related ADRs | Supersedes/superseded-by links | If applicable |

#### ADR Lifecycle

ADRs follow a defined lifecycle with explicit state transitions:

```
proposed → accepted → [deprecated | superseded]
```

| Status | Meaning | Transition |
|--------|---------|------------|
| **proposed** | Under discussion, not yet decided | → accepted or withdrawn |
| **accepted** | Decision is in effect | → deprecated or superseded |
| **deprecated** | Decision is no longer relevant | Terminal state |
| **superseded** | Replaced by a newer ADR | Must link to successor ADR |

When an ADR is superseded, add a `superseded-by` field linking to the new ADR. The new ADR should include a `supersedes` field linking back.

#### When to Write an ADR

Use this decision matrix (impact × reversibility) to determine if an ADR is warranted:

| | Low Impact | High Impact |
|---|:---------:|:----------:|
| **Easily Reversible** | ❌ No ADR needed | ⚪ Optional |
| **Hard to Reverse** | ⚪ Optional | ✅ ADR required |

**Examples of "ADR required" decisions**:
- Choosing a database technology
- Adopting a new framework or language
- Defining API versioning strategy
- Changing authentication mechanism
- Major architectural pattern changes (monolith → microservices)

#### ADR Template (Enhanced)

```markdown
# ADR-001: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded
**Deciders**: [List of people involved]
**Supersedes**: ADR-NNN (if applicable)
**Superseded by**: ADR-NNN (if applicable)

## Drivers

- [Key factor 1 driving this decision]
- [Key factor 2]

## Context

[Why this decision is needed. Include technical, business, and organizational context.]

## Decision

[Specific decision made. Be precise and unambiguous.]

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

### Alternative B: [Name]
- **Pros**: ...
- **Cons**: ...
- **Rejected because**: ...

## References

- [Related documentation or external resources]
```

---

## AI Collaboration Documentation

### Overview

Modern documentation must be optimized for both human readers and AI assistants. This section provides guidelines for writing documentation that AI tools can effectively parse and utilize.

### Token-Aware Document Design

AI models have context window limits. Structure documents for efficient LLM consumption:

**Document Structure Principles**:

| Principle | Description | Example |
|-----------|-------------|---------|
| **Front-load key info** | Put critical information early | Summary before details |
| **Use clear headings** | Hierarchical structure aids navigation | H1 > H2 > H3 progression |
| **Keep sections atomic** | Each section is self-contained | Can be read independently |
| **Minimize redundancy** | Avoid repeating information | Reference instead of copy |
| **Use structured formats** | Tables and lists over prose | Easy to parse and extract |

**Recommended Document Sizes**:

| Document Type | Target Size | Rationale |
|---------------|-------------|-----------|
| README | 500-1000 words | Quick overview |
| API endpoint doc | 200-400 words per endpoint | Focused and scannable |
| Architecture doc | 1000-2000 words per section | Detailed but chunked |
| ADR | 300-600 words | Decision-focused |

### AI-Friendly Documentation Patterns

**Pattern 1: Structured Metadata Block**

Include machine-readable metadata at the top of documents:

```markdown
---
title: User Authentication API
version: 2.1.0
last_updated: 2026-01-24
owner: auth-team
status: stable
dependencies:
  - user-service
  - token-service
---
```

**Pattern 2: Clear Section Markers**

Use consistent section headers that AI can recognize:

```markdown
## Overview
[Brief description of what this component/API does]

## Quick Start
[Minimal steps to get started]

## API Reference
[Detailed API documentation]

## Configuration
[Configuration options and defaults]

## Troubleshooting
[Common issues and solutions]
```

**Pattern 3: Explicit Examples**

Provide complete, runnable examples with clear context:

```markdown
### Example: Create User

**Prerequisites**:
- Valid API key
- Admin role

**Request**:
```bash
curl -X POST https://api.example.com/v1/users \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

**Response** (201 Created):
```json
{
  "id": "usr_123",
  "name": "John",
  "email": "john@example.com",
  "created_at": "2026-01-24T10:30:00Z"
}
```
```

### LLM-Optimized Writing Rules

When writing documentation that will be consumed by LLMs (via RAG, context injection, or direct reading), follow these rules to maximize comprehension accuracy:

| Rule | Description | Example |
|------|-------------|---------|
| **Short paragraphs** | Keep paragraphs to 3-5 lines | Break long explanations into multiple paragraphs |
| **Consistent terminology** | Use the same term for the same concept throughout | Always "user" not sometimes "user" and sometimes "customer" |
| **Language-tagged code** | Always specify language in fenced code blocks | ` ```javascript ` not ` ``` ` |
| **Avoid pronoun ambiguity** | Use explicit nouns instead of "it", "this", "that" when referencing across paragraphs | "The auth service validates..." not "It validates..." |
| **Context self-sufficiency** | Each H2 section should be understandable without reading prior sections | Include necessary context or cross-references |
| **Explicit negation** | State what something is NOT when the distinction matters | "This endpoint creates users but does NOT send welcome emails" |

### Document Chunking Guidelines

For documents consumed by retrieval-augmented generation (RAG) systems, structure content to produce effective chunks:

- **H2 sections ≤ 4K tokens** (~3000 words): Each H2 section should be a self-contained chunk
- **One topic per H2**: Avoid mixing unrelated concepts in a single section
- **Front-load summaries**: Start each section with a 1-2 sentence summary

**Retrieval-Friendly Metadata** (optional YAML frontmatter):

```yaml
---
title: User Authentication API
scope: auth-service
difficulty: intermediate
tags: [authentication, API, OAuth2, JWT]
last_validated: 2026-03-17
---
```

These metadata fields help retrieval systems rank and filter documents for relevance.

### Writing for AI Code Generation

When documentation will be used to generate code:

**Include Explicit Constraints**:

```markdown
## Validation Rules

| Field | Type | Constraints |
|-------|------|-------------|
| email | string | Required, valid email format, max 255 chars |
| age | integer | Required, range 0-150 |
| role | string | Enum: "admin", "user", "guest" |
```

**Specify Error Scenarios**:

```markdown
## Error Responses

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Invalid email | 400 | INVALID_EMAIL | "Email format is invalid" |
| User exists | 409 | DUPLICATE_USER | "User with this email already exists" |
| Missing auth | 401 | UNAUTHORIZED | "Authentication required" |
```

**Clarify Business Logic**:

```markdown
## Discount Calculation Logic

1. Base discount = 0%
2. If customer type is "VIP", add 20%
3. If order total > $100, add 5%
4. If coupon code is valid, add coupon discount
5. Maximum total discount = 50%
6. Apply discount to subtotal (not including tax)
```

### AI Prompt Integration

For documents that define AI-assisted workflows:

**Embedded Prompt Templates**:

```markdown
## AI Code Review Prompt

When reviewing code changes, use this prompt:

```
Review this code change for:
1. Security vulnerabilities (OWASP Top 10)
2. Performance issues
3. Error handling completeness
4. Adherence to [project-conventions.md]

Provide feedback in this format:
- 🔴 Critical: [Must fix before merge]
- 🟡 Important: [Should address]
- 🟢 Suggestion: [Nice to have]
```
```

---

## API Documentation Standards

### OpenAPI 3.1 Compliance

For REST APIs, use OpenAPI 3.1 (fully aligned with JSON Schema draft 2020-12):

**Key OpenAPI 3.1 Features**:

| Feature | Description |
|---------|-------------|
| JSON Schema alignment | Full compatibility with JSON Schema |
| Webhooks support | First-class webhook documentation |
| `type` arrays | Support for `"type": ["string", "null"]` |
| `$ref` alongside properties | Reference and extend in same object |

**Example OpenAPI 3.1 Schema**:

```yaml
openapi: 3.1.0
info:
  title: User API
  version: 2.1.0
paths:
  /users:
    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
components:
  schemas:
    CreateUserRequest:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
```

### AsyncAPI 2.6 for Event-Driven APIs

For message-based/event-driven APIs, use AsyncAPI 2.6:

**Example AsyncAPI Document**:

```yaml
asyncapi: 2.6.0
info:
  title: Order Events
  version: 1.0.0
channels:
  orders/created:
    publish:
      message:
        $ref: '#/components/messages/OrderCreated'
components:
  messages:
    OrderCreated:
      payload:
        type: object
        properties:
          orderId:
            type: string
          customerId:
            type: string
          totalAmount:
            type: number
          createdAt:
            type: string
            format: date-time
```

---

## Translation-Friendly Writing

For projects that maintain multilingual documentation, follow these writing rules in source documents to improve translation quality and reduce translator effort.

### Writing Rules

| Rule | Description | Example |
|------|-------------|---------|
| **Complete sentences** | Avoid sentence fragments and telegraphic style | "The service restarts automatically." not "Auto-restart." |
| **Avoid idioms and slang** | Use literal, internationally understood language | "Easy to use" not "A piece of cake" |
| **Consistent terminology** | Create and follow a glossary for project terms | Always "deployment" not sometimes "deployment" and sometimes "release" |
| **Simple sentence structure** | Prefer SVO (Subject-Verb-Object); avoid nested clauses | "The API returns JSON." not "The JSON that the API, when called correctly, returns..." |
| **Explicit references** | Avoid ambiguous pronouns across sentences | "The server processes the request." not "It processes it." |

### Glossary Template

Maintain a `glossary.md` file for consistent terminology across translations:

```markdown
# Project Glossary

| English Term | Definition | Translation Notes |
|-------------|------------|-------------------|
| deployment | The process of releasing software to production | 部署 (zh-TW) |
| endpoint | A specific URL path in an API | 端點 (zh-TW) |
| rollback | Reverting to a previous version | 回滾 (zh-TW) |
```

### Translation Status Frontmatter

Track translation status in translated document headers:

```yaml
---
translation_status: current | needs_update | in_progress
source_version: 1.2.0
source_hash: abc123
translated_by: human | machine | machine+human-review
last_synced: 2026-03-17
---
```

| Field | Description |
|-------|-------------|
| `translation_status` | Whether the translation matches the current source |
| `source_version` | Which version of the source document was translated |
| `source_hash` | Git hash of the source file at translation time (for precise tracking) |
| `translated_by` | Translation method for quality assessment |
| `last_synced` | Date of last synchronization check |

---

## Quality Standards

### Format Requirements

| Item | Standard |
|------|----------|
| Language | English |
| Encoding | UTF-8 |
| Line Length | Recommended ≤ 120 characters |
| Diagrams | Prefer Mermaid, then ASCII Art |
| Links | Use relative paths for internal links |

### Maintenance Requirements

| Item | Standard |
|------|----------|
| Sync Updates | **Automatic AI behavior**: After completing code changes, AI must check which documents are affected and list them as a reminder. See [AI Behavior: Automatic Documentation Impact Check](#automatic-documentation-impact-check) below |
| Version Marking | Mark version and update date at top |
| Review Inclusion | Include doc changes in code review |
| Periodic Review | Review docs quarterly for staleness |

### Automatic Documentation Impact Check

**This is an automatic AI behavior** — AI assistants MUST perform this check after completing any code modification task, without waiting for the user to ask.

**Workflow:**

1. After finishing code changes, identify which files were modified
2. For each modified file, check if any documents reference it (README, CLI docs, API docs, specs, skills, translations)
3. If affected documents are found, append a reminder block with **suggested commands**:

```
---
📋 **Documentation Impact**
The following documents may need updating:
- `README.md` — describes changed CLI option `--xxx`
  → `/docs readme`
- `docs/CLI-INIT-OPTIONS.md` — references modified function `promptXxx()`
  → manual update or `/docs generate`
- `locales/zh-TW/docs/CLI-INIT-OPTIONS.md` — translation of modified source
  → `/docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW`

Or run `/docs impact` for a full analysis.
---
```

4. If no documents are affected, skip silently
5. **Do not modify documents automatically** — only list the reminder and wait for user confirmation

**Command suggestion mapping:**

| Affected Document | Suggested Command |
|-------------------|-------------------|
| README.md | `/docs readme` |
| API documentation | `/docs api` |
| Generated docs (cheatsheet, reference) | `/docs generate` |
| Translation files (`locales/`) | `/docs translate <source-file> --lang <lang>` |
| Spec files, skill files, other docs | Manual update (suggest specific file path) |
| Multiple docs affected | `/docs impact` for full overview |

**Scope of check:**

| Document Type | Check Against |
|--------------|---------------|
| CLI docs (`docs/`) | Modified functions, CLI options, commands |
| Spec files (`docs/specs/`) | Modified interfaces, schemas, workflows |
| Skills (`skills/`) | Modified behaviors, standards references |
| Translations (`locales/`) | Any modified source file that has translations |
| README, CHANGELOG | Modified public API, features, configuration |

### Review Checklist

Before submitting documentation:

- [ ] Required sections complete
- [ ] No outdated or incorrect information
- [ ] All links working
- [ ] Examples are executable/accurate
- [ ] Format follows standards

### Documentation Quality Metrics

Quantify documentation health with leading and lagging indicators.

#### Leading Indicators (Proactive)

| Metric | Target | How to Measure | Automation |
|--------|--------|----------------|------------|
| **Coverage** | ≥ 90% of public APIs documented | Count documented vs total endpoints | Custom script or API spec diff |
| **Freshness** | All docs updated within 90 days | Check `Last Updated` date in headers | `find` + date comparison script |
| **Link Health** | 100% valid links | Check all internal and external links | markdown-link-check, lychee |
| **Example Validity** | 100% of code examples run successfully | Extract and execute code blocks | doctest, custom CI script |
| **Structure Compliance** | All docs have required sections | Validate against section templates | remark-lint, custom linter |

#### Lagging Indicators (Outcome)

| Metric | Description | How to Measure |
|--------|-------------|----------------|
| **Support ticket reduction** | Fewer questions about documented features | Track support tickets tagged "documentation" |
| **Onboarding time** | Time for new developers to submit first PR | Measure onboarding cohort averages |
| **Doc-related PR comments** | Fewer review comments asking for documentation | Count PR review comments mentioning "docs" |

#### Recommended Automation Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| **markdown-link-check** | Validate links in Markdown files | Pre-commit hook, CI |
| **lychee** | Fast link checker (Rust-based) | CI pipeline |
| **remark-lint** | Markdown style and structure linting | Pre-commit hook |
| **textstat** | Readability scoring (Flesch-Kincaid, etc.) | CI pipeline (advisory) |
| **vale** | Prose linting (style, grammar, terminology) | Pre-commit hook, CI |

---

## File Location Standards

```
project-root/
├── README.md                    # Project entry document
├── CONTRIBUTING.md              # Contribution guide
├── CHANGELOG.md                 # Change log
├── .standards/ or .claude/      # Development standards
│   ├── documentation-writing-standards.md
│   └── ...
└── docs/                        # Documentation directory
    ├── INDEX.md                 # Documentation index
    ├── ARCHITECTURE.md          # Architecture document
    ├── API.md                   # API document
    ├── DATABASE.md              # Database document
    ├── DEPLOYMENT.md            # Deployment document
    ├── MIGRATION.md             # Migration document
    ├── ADR/                     # Architecture decision records
    │   ├── 001-xxx.md
    │   └── ...
    └── DB/                      # Database scripts
```

---

## Recommended Tools

| Purpose | Tools |
|---------|-------|
| Markdown Editing | VS Code + Markdown Preview Enhanced |
| Diagram Drawing | Mermaid / draw.io / PlantUML |
| API Documentation | OpenAPI (Swagger) / Redoc |
| ER Diagram | dbdiagram.io / DBeaver |

---

## Related Standards

- [Documentation Structure Standard](documentation-structure.md)
- [Changelog Standards](changelog-standards.md)

---

## References

- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0) - Latest OpenAPI specification
- [AsyncAPI 2.6 Specification](https://www.asyncapi.com/docs/reference/specification/v2.6.0) - Event-driven API documentation
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) - JSON Schema specification
- [Diátaxis Documentation Framework](https://diataxis.fr/) - Documentation structure methodology
- [Write the Docs](https://www.writethedocs.org/guide/) - Documentation community best practices

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-17 | Added: Enhanced ADR template (lifecycle, decision matrix, supersedes links), LLM-optimized writing rules, document chunking guidelines, Translation-friendly writing standards, Documentation quality metrics (leading/lagging indicators) |
| 1.1.0 | 2026-01-24 | Added: AI Collaboration Documentation section, Token-aware document design, API Documentation Standards (OpenAPI 3.1, AsyncAPI 2.6) |
| 1.0.1 | 2025-12-24 | Added: Related Standards section |
| 1.0.0 | 2025-12-10 | Initial documentation writing standards |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
