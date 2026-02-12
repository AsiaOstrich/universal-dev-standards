---
scope: partial
description: |
  System archeology — reverse engineer existing systems across Logic, Data, and Runtime dimensions.
  Use when: analyzing legacy code, documenting undocumented systems, creating specs from existing implementations, understanding data models, baselining runtime environments.
  Keywords: reverse engineering, legacy code, documentation, spec extraction, code archaeology, system archeology, data model, runtime baseline, 反向工程, 舊有程式碼, 規格提取, 系統考古.
---

# System Archeology Guide — Reverse Engineering across 3 Dimensions

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/reverse-engineer/SKILL.md)

**Version**: 2.0.0
**Last Updated**: 2026-02-12
**Applicability**: Claude Code Skills

> **Core Standard**: This skill implements [Reverse Engineering Standards](../../core/reverse-engineering-standards.md). For comprehensive methodology documentation accessible by any AI tool, refer to the core standard.

---

## Purpose

This skill provides a **system archeology framework** for reverse engineering existing systems across three dimensions — **Logic**, **Data**, and **Runtime** — producing comprehensive SDD specification documents with strict Anti-Hallucination compliance.

## Quick Reference

### System Archeology Framework

```
┌──────────────────────────────────────────────────────────────────┐
│                   System Archeology Framework                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Dimension 1: DATA (/reverse data)                                │
│      ├─ DB schemas, ORM models, migrations                       │
│      ├─ Entity-relationship mapping                               │
│      └─ Output: Data Model Spec                                   │
│                                                                    │
│  Dimension 2: RUNTIME (/reverse runtime)                          │
│      ├─ Configs, env vars, feature flags                          │
│      ├─ Docker/K8s topology, CI/CD pipelines                     │
│      └─ Output: Runtime Baseline                                  │
│                                                                    │
│  Dimension 3: LOGIC (/reverse spec)                               │
│      ├─ APIs, modules, data flows, tests                          │
│      ├─ Enriched with Data + Runtime context                      │
│      └─ Output: SPEC-XXX.md                                       │
│                                                                    │
│  /reverse (no subcommand) = All 3 dimensions → Full Report       │
│                                                                    │
│  Human Review:                                                     │
│      ├─ Verify [Confirmed] / [Inferred] / [Unknown] labels       │
│      ├─ Add Motivation, Risk Assessment, Business Context         │
│      └─ Approve spec via /sdd                                     │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### What Can vs Cannot Be Extracted

| Aspect | Extractable | Certainty | Notes |
|--------|-------------|-----------|-------|
| **API Endpoints** | ✅ Yes | [Confirmed] | Route definitions, HTTP methods |
| **Data Models** | ✅ Yes | [Confirmed] | Types, interfaces, schemas |
| **Function Signatures** | ✅ Yes | [Confirmed] | Parameters, return types |
| **Test Cases** | ✅ Yes | [Confirmed] | → Acceptance Criteria |
| **Dependencies** | ✅ Yes | [Confirmed] | Package references |
| **Behavior Patterns** | ⚠️ Partial | [Inferred] | From code analysis |
| **Motivation/Why** | ❌ No | [Unknown] | Needs human input |
| **Business Context** | ❌ No | [Unknown] | Needs human input |
| **Risk Assessment** | ❌ No | [Unknown] | Needs domain expertise |
| **Trade-off Decisions** | ❌ No | [Unknown] | Historical context missing |

## Core Principles

### 1. Anti-Hallucination Compliance

**CRITICAL**: This skill MUST strictly follow [Anti-Hallucination Standards](../../core/anti-hallucination.md).

#### Certainty Labels (from Unified Tag System)

This skill uses **Certainty Tags** for analyzing existing code. See [Anti-Hallucination Standards](../../core/anti-hallucination.md#certainty-classification-tags) for the complete tag reference.

| Tag | Use When | Example |
|-----|----------|---------|
| `[Confirmed]` | Direct evidence from code/tests | API endpoint at `src/api/users.ts:15` |
| `[Inferred]` | Logical deduction from patterns | "Likely uses dependency injection based on constructor pattern" |
| `[Unknown]` | Cannot determine from code | Motivation, business requirements |
| `[Need Confirmation]` | Requires human verification | Design intent, edge case handling |

#### Source Attribution

Every extracted item MUST include source attribution:

```markdown
## API Design

### User Authentication
[Confirmed] POST /api/auth/login endpoint accepts email and password
- [Source: Code] src/controllers/AuthController.ts:25-45
- [Source: Code] src/routes/auth.ts:8

### Session Management
[Inferred] Sessions expire after 24 hours based on JWT expiry configuration
- [Source: Code] src/config/auth.ts:12 - TOKEN_EXPIRY=86400
- [Source: Knowledge] Standard JWT expiry interpretation (⚠️ Verify intent)
```

### 2. Progressive Disclosure

Start with high-level architecture, then drill down:

1. **System Overview**: Entry points, main components
2. **Component Details**: Individual modules, their responsibilities
3. **Implementation Specifics**: Algorithms, data flows

### 3. Test-to-Requirement Mapping

Extract acceptance criteria from tests:

```javascript
// Test file: src/tests/auth.test.ts
describe('Authentication', () => {
  it('should return 401 for invalid credentials', () => {...});
  it('should issue JWT token on successful login', () => {...});
  it('should refresh token before expiry', () => {...});
});
```

Becomes:

```markdown
## Acceptance Criteria
[Inferred] From test analysis (src/tests/auth.test.ts):
- [ ] Return 401 status code for invalid credentials
- [ ] Issue JWT token on successful login
- [ ] Support token refresh before expiry
```

## Workflow Stages

### Stage 1: Code Scanning

**Input**: File path or directory
**Output**: Code structure analysis

**Actions**:
1. Identify entry points (main functions, API routes, event handlers)
2. Map module dependencies
3. Extract type definitions and interfaces
4. List configuration sources

### Stage 2: Test Analysis

**Input**: Test files
**Output**: Acceptance criteria candidates

**Actions**:
1. Parse test case names
2. Extract Given-When-Then patterns (if BDD-style)
3. Identify boundary conditions
4. Note coverage gaps

### Stage 3: Gap Identification

**Input**: Code + test analysis
**Output**: List of unknowns requiring human input

**Required Human Input**:
- [ ] Motivation: Why was this feature built?
- [ ] User Story: Who uses this and for what purpose?
- [ ] Risks: What could go wrong?
- [ ] Trade-offs: Why this approach over alternatives?
- [ ] Out of Scope: What was explicitly excluded?

### Stage 4: Spec Generation

**Input**: All analysis results
**Output**: Draft specification document

**Template**: Use [reverse-spec-template.md](../../templates/reverse-spec-template.md)

### Stage 5: Human Review

**Input**: Draft specification
**Output**: Validated specification

**Review Checklist**:
- [ ] All `[Confirmed]` items verified accurate
- [ ] All `[Inferred]` items validated or corrected
- [ ] All `[Unknown]` items filled in by human
- [ ] Source citations checked
- [ ] Business context added

## Examples

### Example 1: API Endpoint Extraction

**Input Code** (`src/controllers/UserController.ts`):
```typescript
export class UserController {
  @Get('/users/:id')
  @Authorize('admin', 'user')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }
}
```

**Extracted Specification**:
```markdown
## API Endpoints

### GET /users/:id
[Confirmed] Retrieves a user by ID
- [Source: Code] src/controllers/UserController.ts:3-7

**Authorization**: [Confirmed] Requires 'admin' or 'user' role
- [Source: Code] @Authorize decorator at line 4

**Parameters**:
- `id` (path, required): User identifier [Confirmed]

**Response**: [Confirmed] Returns User object
- [Source: Code] Return type at line 5

**Error Handling**: [Unknown] Error responses not evident from code
```

### Example 2: Test-to-Criteria Extraction

**Input Test** (`src/tests/cart.test.ts`):
```typescript
describe('Shopping Cart', () => {
  it('should add item to empty cart', () => {...});
  it('should increment quantity for duplicate items', () => {...});
  it('should not exceed maximum quantity of 99', () => {...});
  it('should calculate total with tax', () => {...});
});
```

**Extracted Acceptance Criteria**:
```markdown
## Acceptance Criteria

[Inferred] From test analysis (src/tests/cart.test.ts):
- [ ] Can add item to empty cart (line 2)
- [ ] Increments quantity for duplicate items (line 3)
- [ ] Maximum quantity limit: 99 items (line 4)
- [ ] Total calculation includes tax (line 5)

[Unknown] Tax calculation rules not specified in tests
[Need Confirmation] What happens when cart exceeds 99 items? (reject or cap?)
```

## Integration with Other Skills

### With /sdd (Spec-Driven Development)

1. Generate reverse-engineered spec using `/reverse-sdd`
2. Review and fill in `[Unknown]` sections
3. Use `/sdd review` to validate completeness
4. Proceed with normal SDD workflow for enhancements

### With /tdd (Test-Driven Development)

1. Extract existing test patterns
2. Identify test coverage gaps
3. Use `/tdd` to add missing tests
4. Update spec with new acceptance criteria

### With /bdd (Behavior-Driven Development)

1. Convert extracted acceptance criteria to Gherkin format
2. Use `/bdd` to formalize scenarios
3. Validate scenarios with stakeholders

## Data Dimension Guide (`/reverse data`)

### What to Scan

| Source | What to Look For | Certainty |
|--------|-----------------|-----------|
| `schema.prisma` / `*.schema.*` | Models, fields, relations, enums | [Confirmed] |
| `migrations/` / `*.migration.*` | Schema evolution history | [Confirmed] |
| `models/` / `entities/` | ORM model definitions | [Confirmed] |
| `knexfile.*` / `sequelize` config | DB connection, dialect | [Confirmed] |
| `seeds/` / `fixtures/` | Test data, default values | [Confirmed] |
| `docker-compose.yml` (db services) | DB engine, ports, volumes | [Confirmed] |
| Code patterns (`.findBy`, `.save`) | Implicit relationships | [Inferred] |
| No schema files found | Possible schemaless/NoSQL | [Unknown] |

### Output Template: Data Model Spec

```markdown
# Data Model Spec — [Project Name]

## Entities

### User
[Confirmed] Source: schema.prisma:5-15
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | — |
| email | String | Unique, Not Null | — |
| role | Enum(admin,user) | Default: user | — |

### Order
[Confirmed] Source: models/Order.ts:3-20
...

## Relationships
[Confirmed] User 1:N Order (FK: order.userId → user.id)
[Inferred] Order M:N Product (join table: order_items — from code pattern)

## Migration History
| Version | Date | Description | Source |
|---------|------|-------------|--------|
| 001 | 2024-03-01 | Initial schema | migrations/001_init.ts |
| 002 | 2024-06-15 | Add role to user | migrations/002_add_role.ts |

## Data Flow Paths
- Write: API → Service → Repository → DB
- Read: DB → Repository → Service → Serializer → API
```

---

## Runtime Dimension Guide (`/reverse runtime`)

### What to Scan

| Source | What to Look For | Certainty |
|--------|-----------------|-----------|
| `.env.example` / `.env.template` | Environment variable names | [Confirmed] |
| `docker-compose.yml` | Services, ports, dependencies | [Confirmed] |
| `Dockerfile` | Base image, build steps, exposed ports | [Confirmed] |
| `k8s/` / Helm charts | Deployment topology | [Confirmed] |
| CI/CD files (`.github/`, `.gitlab-ci.yml`) | Build/deploy pipeline | [Confirmed] |
| Config files (`*.config.*`) | Feature flags, settings hierarchy | [Confirmed] |
| Log files (patterns only) | Error patterns, log levels | [Inferred] |
| Monitoring endpoints (`/health`, `/metrics`) | Observability surface | [Confirmed] |

### Security Rules

- **NEVER** output actual values from `.env`, secrets, API keys, or passwords
- Only list variable **names** and infer their **purpose**
- Mark any sensitive config as `[REDACTED]`

### Output Template: Runtime Baseline

```markdown
# Runtime Baseline — [Project Name]

## Environment Variables
| Variable | Purpose | Required | Source |
|----------|---------|----------|--------|
| DATABASE_URL | DB connection string | Yes | .env.example:1 |
| JWT_SECRET | Token signing key | Yes | .env.example:3 |
| REDIS_URL | Cache connection | No | .env.example:5 |
| FEATURE_NEW_UI | Feature flag | No | config/features.ts:12 |

## External Dependencies
| Service | Protocol | Purpose | Source |
|---------|----------|---------|--------|
| PostgreSQL 15 | TCP:5432 | Primary database | docker-compose.yml:8 |
| Redis 7 | TCP:6379 | Session cache | docker-compose.yml:15 |
| Stripe API | HTTPS | Payment processing | [Inferred] src/services/payment.ts:3 |

## Deployment Topology
[Confirmed] Source: docker-compose.yml
- app (Node.js 20) → port 3000
- db (PostgreSQL 15) → port 5432
- redis (Redis 7) → port 6379

## Health & Monitoring
[Confirmed] GET /health → src/routes/health.ts:5
[Inferred] No metrics endpoint found — consider adding /metrics

## CI/CD Pipeline
[Confirmed] Source: .github/workflows/ci.yml
- Trigger: push to main, PR
- Steps: lint → test → build → deploy
```

---

## Complete Reverse Engineering Pipeline

The reverse engineering skill supports a complete SDD → BDD → TDD pipeline:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Complete Reverse Engineering Pipeline                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Code + Tests                                                          │
│        │                                                                │
│        ▼                                                                │
│   /reverse-sdd                                                         │
│        │                                                                │
│        └─→ Generate SPEC-XXX with Acceptance Criteria                   │
│                │                                                        │
│                ▼                                                        │
│   /reverse-bdd                                                          │
│        │                                                                │
│        ├─→ AC → Gherkin scenario conversion                             │
│        ├─→ Auto-transform bullet points to Given-When-Then              │
│        └─→ Generate .feature files                                      │
│                │                                                        │
│                ▼                                                        │
│   /reverse-tdd                                                          │
│        │                                                                │
│        ├─→ Analyze existing unit tests                                  │
│        └─→ Generate coverage report with gaps                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Commands

| Command | Input | Output | Purpose |
|---------|-------|--------|---------|
| `/reverse-sdd` | Code directory | SPEC-XXX.md | Extract requirements from code |
| `/reverse-bdd` | SPEC file | .feature files | Convert AC to Gherkin scenarios |
| `/reverse-tdd` | .feature files | Coverage report | Map scenarios to unit tests |

### Usage Example

```bash
# Step 1: Reverse engineer code to SDD specification
/reverse-sdd src/auth/

# Step 2: Transform acceptance criteria to BDD scenarios
/reverse-bdd specs/SPEC-AUTH.md

# Step 3: Analyze test coverage against BDD scenarios
/reverse-tdd features/auth.feature
```

### Detailed Guides

- [BDD Extraction Workflow](./bdd-extraction.md) - Detailed guide for AC → Gherkin transformation
- [TDD Analysis Workflow](./tdd-analysis.md) - Detailed guide for BDD → TDD coverage analysis

## Anti-Patterns to Avoid

### ❌ Don't Do This

1. **Fabricating Motivation**
   - Wrong: "This feature was built to improve user experience"
   - Right: "[Unknown] Motivation requires human input"

2. **Assuming Requirements**
   - Wrong: "The system requires SSO support"
   - Right: "[Need Confirmation] SSO configuration found in code - is this a requirement?"

3. **Speculating About Unread Code**
   - Wrong: "The PaymentService handles Stripe integration"
   - Right: "[Unknown] PaymentService functionality - need to read src/services/PaymentService.ts"

4. **Presenting Options Without Uncertainty**
   - Wrong: "The code uses Redis for caching"
   - Right: "[Confirmed] Redis client configured in src/config/cache.ts:5"

## Best Practices

### Do's

- ✅ Read all relevant files before making claims
- ✅ Tag every statement with certainty level
- ✅ Include source citations with file:line
- ✅ Clearly list what needs human input
- ✅ Preserve original code comments as context

### Don'ts

- ❌ Assume motivation or business context
- ❌ Present inferences as confirmed facts
- ❌ Skip source attribution
- ❌ Generate specs for unread code
- ❌ Fill in `[Unknown]` sections without human input

---

## Configuration Detection

This skill auto-detects project configuration:

1. Check for existing `specs/` directory
2. Check for SDD tooling (OpenSpec, Spec Kit)
3. Detect test framework for acceptance criteria extraction
4. Identify code patterns (MVC, DDD, etc.)

---

## Related Standards

- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md) - **Core methodology standard (primary reference)**
- [Spec-Driven Development](../../core/spec-driven-development.md) - Output format and review process
- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md) - Evidence-based analysis requirements
- [Code Review Checklist](../../core/code-review-checklist.md) - Review guidelines

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-02-12 | Major: 3-dimension system archeology (Logic + Data + Runtime) |
| 1.2.0 | 2026-01-25 | Added: Reference to Unified Tag System |
| 1.1.0 | 2026-01-19 | Add BDD/TDD pipeline integration; Add core standard reference |
| 1.0.0 | 2026-01-19 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
