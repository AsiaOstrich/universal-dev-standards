# AI-Friendly Architecture Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/ai-friendly-architecture.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-21
**Applicability**: All software projects collaborating with AI assistants

---

## Purpose

This standard defines architecture and documentation practices that maximize the effectiveness of AI-assisted development. By following these guidelines, projects become more analyzable, understandable, and modifiable by AI tools while maintaining human readability.

**Reference Concepts**:
- RLM (Recursive Language Model) context management principles
- Token-aware documentation design
- Modular architecture for AI comprehension

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Module Design Standards](#module-design-standards)
3. [Context Boundary Markers](#context-boundary-markers)
4. [Documentation Layering](#documentation-layering)
5. [Metadata Standards](#metadata-standards)
6. [Query Interface Design](#query-interface-design)
7. [AI Context Configuration](#ai-context-configuration)
8. [Anti-Patterns](#anti-patterns)
9. [Implementation Checklist](#implementation-checklist)

---

## Core Principles

### 1. Explicit Over Implicit

AI assistants perform best when behavior and structure are explicitly documented rather than implied through convention.

```
┌─────────────────────────────────────────────────────────────┐
│                 Explicit vs Implicit                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ IMPLICIT (Hard for AI)                                  │
│  └── Magic naming conventions                               │
│  └── Undocumented folder structures                         │
│  └── Convention-based routing                               │
│  └── Assumed knowledge of framework behavior                │
│                                                              │
│  ✅ EXPLICIT (AI-Friendly)                                  │
│  └── Documented module responsibilities                     │
│  └── Clear entry point annotations                          │
│  └── Explicit dependency declarations                       │
│  └── Self-documenting configuration files                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Layered Context

Structure documentation in layers so AI can access appropriate detail levels based on task complexity.

```
┌─────────────────────────────────────────────────────────────┐
│               Context Layering Strategy                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Quick Reference (< 500 tokens)                    │
│  └── One-liner descriptions                                 │
│  └── API signatures only                                    │
│  └── Key entry points                                       │
│                                                              │
│  Layer 2: Detailed Guide (< 5,000 tokens)                   │
│  └── Full API documentation                                 │
│  └── Usage examples                                         │
│  └── Configuration options                                  │
│                                                              │
│  Layer 3: Full Examples (unlimited)                         │
│  └── Complete implementation examples                       │
│  └── Edge case documentation                                │
│  └── Migration guides                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Semantic Boundaries

Design clear module boundaries that allow AI to analyze components independently without requiring full project context.

### 4. Discoverable Structure

Ensure project structure can be understood by analyzing configuration files and entry points without reading all source code.

---

## Module Design Standards

### Single Responsibility at Module Level

Each module should have a clearly defined, singular purpose that can be summarized in one sentence.

```
┌─────────────────────────────────────────────────────────────┐
│              Module Header Template                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /**                                                         │
│   * @module auth                                             │
│   * @description Handles user authentication and session    │
│   *              management for the application.            │
│   *                                                          │
│   * @responsibility Authentication and authorization         │
│   * @dependencies [database, crypto, config]                │
│   * @exports {login, logout, verify, refreshToken}          │
│   * @entrypoint ./index.ts                                  │
│   */                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Clear Input/Output Contracts

Every public interface should have explicit type definitions or documentation.

| Element | Requirement | Example |
|---------|-------------|---------|
| Function Parameters | Type + description | `@param {string} email - User's email address` |
| Return Values | Type + possible values | `@returns {Promise<User \| null>}` |
| Side Effects | Documented explicitly | `@sideeffect Writes to database` |
| Error Conditions | All possible errors | `@throws {AuthError} Invalid credentials` |

### Explicit Dependency Declaration

Dependencies should be declared at module level, not hidden in implementation details.

**JavaScript/TypeScript:**
```javascript
// module: src/auth/index.ts
// dependencies: [database, crypto, config]
import { db } from '../database';
import { hash } from '../crypto';
import { config } from '../config';
```

**Python:**
```python
# module: src/auth/__init__.py
# dependencies: [database, crypto, config]
from ..database import db
from ..crypto import hash_password
from ..config import settings
```

---

## Context Boundary Markers

### Module Header Comments

Use standardized header comments that AI can parse for quick module understanding.

```javascript
/**
 * ═══════════════════════════════════════════════════════════
 * MODULE: Payment Processing
 * ═══════════════════════════════════════════════════════════
 *
 * PURPOSE: Handles all payment-related operations including
 *          processing, refunds, and subscription management.
 *
 * DEPENDENCIES:
 *   - stripe: Payment gateway integration
 *   - database: Transaction storage
 *   - events: Payment event publishing
 *
 * EXPORTS:
 *   - processPayment(amount, method): Process single payment
 *   - refund(transactionId): Issue refund
 *   - createSubscription(plan): Start subscription
 *
 * CONFIGURATION:
 *   - STRIPE_SECRET_KEY: Required
 *   - PAYMENT_WEBHOOK_SECRET: Required
 *
 * ═══════════════════════════════════════════════════════════
 */
```

### Section Dividers

Use consistent section dividers within large files:

```javascript
// ============================================================
// SECTION: Validation Helpers
// ============================================================

// ... validation code ...

// ============================================================
// SECTION: API Handlers
// ============================================================

// ... handler code ...
```

---

## Documentation Layering

### Level 1: Quick Reference (< 500 tokens)

Create `QUICK-REF.md` in each major module:

```markdown
# Auth Module - Quick Reference

## Purpose
User authentication and session management.

## Key Functions
- `login(email, password)` → `Promise<Session>`
- `logout(sessionId)` → `void`
- `verify(token)` → `Promise<User | null>`

## Configuration
- `AUTH_SECRET`: JWT signing secret
- `SESSION_DURATION`: Session lifetime (default: 24h)

## Entry Point
`src/auth/index.ts`
```

### Level 2: Detailed Guide (< 5,000 tokens)

Main `README.md` with comprehensive documentation:

```markdown
# Authentication Module

## Overview
[2-3 paragraph description]

## Architecture
[Diagram or description of internal structure]

## API Reference
[Full function signatures with parameters]

## Configuration Options
[All configuration with defaults and descriptions]

## Usage Examples
[Common use cases with code samples]

## Error Handling
[Error types and handling strategies]
```

### Level 3: Full Examples (unlimited)

Separate `examples/` directory with complete implementations:

```
auth/
├── QUICK-REF.md          # Level 1
├── README.md             # Level 2
└── examples/             # Level 3
    ├── basic-login.ts
    ├── oauth-integration.ts
    └── custom-middleware.ts
```

---

## Metadata Standards

### Package Metadata Extensions

Extend standard package files with AI-relevant metadata:

**package.json (JavaScript/TypeScript):**
```json
{
  "name": "my-project",
  "ai-context": {
    "entryPoints": ["src/index.ts", "src/api/index.ts"],
    "modules": {
      "auth": "src/auth/",
      "api": "src/api/",
      "database": "src/db/"
    },
    "ignorePatterns": ["node_modules", "dist", "coverage"],
    "quickRef": "docs/QUICK-REF.md"
  }
}
```

**pyproject.toml (Python):**
```toml
[tool.ai-context]
entry_points = ["src/main.py", "src/api/__init__.py"]
modules = { auth = "src/auth/", api = "src/api/" }
ignore_patterns = ["__pycache__", ".venv", "*.pyc"]
quick_ref = "docs/QUICK-REF.md"
```

### .ai-context.yaml Configuration

Dedicated AI context configuration file:

```yaml
# .ai-context.yaml - AI Context Configuration
version: 1.0.0

project:
  name: my-project
  type: web-app  # web-app | library | cli | api | monorepo
  primary-language: typescript

modules:
  - name: auth
    path: src/auth/
    entry: index.ts
    description: Authentication and authorization
    dependencies: [database, crypto]
    priority: high

  - name: api
    path: src/api/
    entry: routes.ts
    description: REST API endpoints
    dependencies: [auth, database]
    priority: high

  - name: utils
    path: src/utils/
    entry: index.ts
    description: Shared utility functions
    dependencies: []
    priority: low

analysis-hints:
  entry-points:
    - src/main.ts
    - src/index.ts
  ignore-patterns:
    - node_modules
    - dist
    - coverage
    - "*.test.ts"
  architecture-type: layered  # layered | microservices | modular | monolith

documentation:
  quick-ref: docs/QUICK-REF.md
  detailed: docs/ARCHITECTURE.md
  examples: docs/examples/

context-strategy:
  max-chunk-size: 50000
  overlap: 500
  analysis-pattern: hierarchical
```

---

## Query Interface Design

### Structured API Documentation Format

Design API documentation that's easy to query:

```markdown
## API: createUser

**Endpoint**: `POST /api/users`
**Module**: `src/api/users.ts:45`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | Min 8 characters |
| name | string | No | Display name |

### Response
```json
{
  "id": "string",
  "email": "string",
  "createdAt": "ISO8601"
}
```

### Errors
| Code | Condition |
|------|-----------|
| 400 | Invalid email format |
| 409 | Email already exists |

### Example
```javascript
const user = await api.createUser({
  email: 'user@example.com',
  password: 'securePassword123'
});
```
```

### Searchable Code Annotations

Use consistent annotation patterns that AI can search for:

```javascript
// @ai-hint: This function is performance-critical
// @ai-complexity: O(n log n)
// @ai-dependencies: [sortUtils, comparators]
function sortLargeDataset(data) {
  // ...
}

// @ai-security: Validates user input
// @ai-validation: email, password strength
function validateRegistration(input) {
  // ...
}
```

---

## AI Context Configuration

### Recommended Directory Structure

```
project/
├── .ai-context.yaml          # AI context configuration
├── docs/
│   ├── QUICK-REF.md          # Level 1 documentation
│   ├── ARCHITECTURE.md       # Level 2 documentation
│   └── examples/             # Level 3 documentation
├── src/
│   ├── auth/
│   │   ├── index.ts          # Entry point with module header
│   │   ├── QUICK-REF.md      # Module-level quick reference
│   │   └── README.md         # Module documentation
│   ├── api/
│   │   ├── index.ts
│   │   └── README.md
│   └── index.ts              # Application entry point
└── CLAUDE.md / INSTRUCTIONS.md  # AI instruction file
```

### Context Priority Guidelines

When AI context is limited, prioritize:

| Priority | Content Type | Reason |
|----------|--------------|--------|
| 1 | Entry points | Understand application structure |
| 2 | .ai-context.yaml | Module map and dependencies |
| 3 | QUICK-REF files | Rapid API understanding |
| 4 | Modified files | Direct task relevance |
| 5 | Dependency chain | Context for changes |

---

## Anti-Patterns

### ❌ Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Magic strings** | AI can't trace constants | Use typed constants with documentation |
| **Implicit routing** | Hidden behavior | Document route mappings explicitly |
| **Global state** | Unpredictable dependencies | Dependency injection with explicit wiring |
| **Circular dependencies** | Context confusion | Clear hierarchical dependencies |
| **Monolithic files** | Context overflow | Split into focused modules |
| **Convention over documentation** | Assumed knowledge | Explicit documentation |

### ❌ Documentation Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Outdated docs** | Misleading AI | Keep docs in sync with code |
| **Generated only** | Missing context | Add human-written context |
| **No examples** | Ambiguous usage | Include working examples |
| **Wall of text** | Hard to parse | Use structured formats |

---

## Implementation Checklist

### Quick Start (< 1 hour)

- [ ] Create `.ai-context.yaml` with module list
- [ ] Add `QUICK-REF.md` to project root
- [ ] Document entry points in README
- [ ] Add module headers to main files

### Standard Implementation (< 1 day)

- [ ] Complete `.ai-context.yaml` configuration
- [ ] Add `QUICK-REF.md` to each major module
- [ ] Document all public APIs with type information
- [ ] Add section dividers to large files
- [ ] Create dependency documentation

### Full Implementation (< 1 week)

- [ ] Three-layer documentation for all modules
- [ ] Searchable code annotations
- [ ] Examples directory with use cases
- [ ] Architecture diagrams
- [ ] Integration with CI for doc validation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-21 | Initial release |

---

## Related Standards

- [Project Structure](./project-structure.md) - Directory organization
- [Documentation Structure](./documentation-structure.md) - Documentation organization
- [Anti-Hallucination](./anti-hallucination.md) - AI accuracy standards

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
