# Documentation Writing Standards

> **English** | [繁體中文](../locales/zh-TW/core/documentation-writing-standards.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-24
**Applicability**: All software projects (new, refactoring, migration, maintenance)

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
| Status | proposed/accepted/deprecated/superseded | Required |
| Context | Why this decision is needed | Required |
| Decision | Specific decision content | Required |
| Consequences | Impact of decision (positive/negative) | Required |
| Alternatives | Other options considered | Recommended |

**Template**:

```markdown
# ADR-001: [Decision Title]

## Status
Accepted

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
1. Alternative A - Rejected because...
2. Alternative B - Rejected because...
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
| Sync Updates | Update docs when code changes |
| Version Marking | Mark version and update date at top |
| Review Inclusion | Include doc changes in code review |
| Periodic Review | Review docs quarterly for staleness |

### Review Checklist

Before submitting documentation:

- [ ] Required sections complete
- [ ] No outdated or incorrect information
- [ ] All links working
- [ ] Examples are executable/accurate
- [ ] Format follows standards

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
| 1.1.0 | 2026-01-24 | Added: AI Collaboration Documentation section, Token-aware document design, API Documentation Standards (OpenAPI 3.1, AsyncAPI 2.6) |
| 1.0.1 | 2025-12-24 | Added: Related Standards section |
| 1.0.0 | 2025-12-10 | Initial documentation writing standards |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
