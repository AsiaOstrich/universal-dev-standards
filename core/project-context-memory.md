# Project Context Memory Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/project-context-memory.md)

**Version**: 1.0.0
**Last Updated**: 2026-02-09
**Applicability**: All software projects using AI assistants
**Scope**: uds-specific

---

## Purpose

This standard defines a structured system for capturing, retrieving, and enforcing **project-specific** context, architectural decisions, and domain knowledge. Unlike Developer Memory (which is universal and transferable), Project Context Memory acts as the "long-term brain" for a specific codebase, ensuring AI assistants adhere to local conventions and historical decisions.

---

## Quick Reference

### Memory Entry Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (`PRJ-YYYY-NNNN`) |
| `type` | enum | `decision` / `convention` / `structure` / `glossary` |
| `summary` | string | One-sentence summary of the context |
| `status` | enum | `active` / `proposed` / `deprecated` |
| `scope` | list | Files or directories this applies to |

### Storage Location

Entries are stored in **Markdown with YAML Frontmatter** to ensure both human readability (documentation) and machine parsability.

- **Directory**: `.project-context/`
- **Format**: `.md` files

---

## 1. Memory Schema

### 1.1 Full Schema Definition

```markdown
---
id: "PRJ-2026-0001"              # Required: Unique ID
type: decision                   # Required: Category
status: active                   # Required: active | proposed | deprecated
created_at: "2026-02-09"         # Required: ISO date
confidence: 1.0                  # Required: 0.0–1.0 (Project facts usually start high)
authors: ["user-name", "ai-assistant"]

# Scope & Triggers (Context Awareness)
scope:                           # Where this rule applies
  - "src/api/**"
  - "src/services/**"
triggers:                        # Keywords/patterns to wake up this memory
  - "error handling"
  - "API response"
  - "try-catch"

# Relationships
related: ["PRJ-2026-0004"]       # Related project memories
supersedes: []                   # IDs of decisions this replaces
---

# Unified API Error Handling

## Context
We previously handled errors inconsistently across controllers, leading to frontend parsing issues.

## Decision
All API endpoints must return errors in the `StandardErrorResponse` format defined in `src/types/api.ts`.
Do not throw raw exceptions in controllers; wrap them in `ApiError` class.

## Constraint
- Forbidden: `res.status(500).json({ error: err.message })`
- Required: `next(new ApiError(500, 'internal_error', err.message))`
```

### 1.2 ID Format

| Component | Format | Example |
|-----------|--------|---------|
| Prefix | `PRJ` | `PRJ` |
| Year | `YYYY` | `2026` |
| Sequence | `NNNN` | `0001` |
| Full | `PRJ-YYYY-NNNN` | `PRJ-2026-0001` |

---

## 2. Memory Categories (Taxonomy)

| Category | Description | Example |
|----------|-------------|---------|
| `decision` | Architectural Decision Records (Lightweight ADRs) | "Use Hexagonal Architecture for core domain" |
| `convention` | Mandatory coding styles or patterns | "All interface names must start with 'I'" |
| `structure` | Directory responsibilities and boundaries | "`src/shared` must not import from `src/features`" |
| `glossary` | Ubiquitous Language / Domain Terms | "'User' refers to Admin; 'Customer' is the end-user" |
| `constraint` | Hard technical limits or bans | "No usage of `lodash` (use native ES6+)" |
| `workflow` | Process-specific rules | "Migrations must be generated via CLI, not manual SQL" |

---

## 3. Operations Protocol

### 3.1 Proactive Extraction (Record)

The AI must actively listen for "Consensus Moments" in the conversation.

**Triggers:**
*   "Let's agree to..."
*   "From now on, we use..."
*   "The architecture should be..."
*   Repeatedly correcting the AI on the same project-specific rule.

**Workflow:**
1.  AI detects a consensus or rule.
2.  AI proposes: "This seems like a project-level decision. Should I save it to Project Context?"
3.  User confirms.
4.  AI generates a `.project-context/topic-name.md` file.

### 3.2 Context Injection (Query)

**Triggers:**
*   **Planning Phase**: When the user asks to "build a feature", scan `structure` and `decision` memories.
*   **Coding Phase**: When editing a file in `scope`, scan `convention` memories.
*   **Review Phase**: Check if code violates `constraint` memories.

**Behavior:**
*   AI must **read** relevant context files *before* generating code.
*   AI must **cite** the memory ID when enforcing a rule (e.g., "Per PRJ-2026-0012, I'm using the factory pattern here").

### 3.3 Lifecycle Management (Review)

**Staleness Detection:**
*   If a file path mentioned in `scope` no longer exists.
*   If a code pattern mentioned in `Constraint` is nowhere to be found.
*   AI should proactively ask: "Is PRJ-2025-0045 still active?"

**Deprecation:**
*   When a new `decision` contradicts an old one, the old one's `status` changes to `deprecated`, and `supersedes` field is updated in the new one.

---

## 4. Comparison with Developer Memory

| Feature | Developer Memory (`core/developer-memory.md`) | Project Context Memory (`core/project-context-memory.md`) |
| :--- | :--- | :--- |
| **Scope** | Universal / Cross-Project | **Local / Project-Specific** |
| **Privacy** | De-identified (Strict) | **Identified** (Specific paths/names allowed) |
| **Content** | "How to use React useEffect" | "How WE use React in THIS app" |
| **Storage** | `.memory/` (Global/User) | `.project-context/` (Repo) |
| **Goal** | Skill Acquisition | **Consistency & Compliance** |

---

## 5. Architecture Decision

### 5.1 "Always-On" Protocol
Like Developer Memory, Project Context is an **Always-On Protocol**. The AI does not need explicit commands to use it. It is part of the "Physics" of the agent's environment.

### 5.2 Storage Strategy
We use **Split-File Storage** (one Markdown file per topic) rather than a single huge `GEMINI.md` or JSON file.
*   **Reason 1**: Git-friendly diffs.
*   **Reason 2**: Lower token usage (AI only reads relevant files based on `scope/triggers`).
*   **Reason 3**: Human-readable documentation.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-09 | Initial standard definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
