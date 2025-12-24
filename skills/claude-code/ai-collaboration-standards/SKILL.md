---
name: ai-collaboration-standards
description: |
  Prevent AI hallucination and ensure evidence-based responses when analyzing code or making suggestions.
  Use when: analyzing code, making recommendations, providing options, or when user asks about confidence/certainty.
  Keywords: certainty, assumption, inference, evidence, source, 確定性, 推測, 假設, 來源, 證據.
---

# AI Collaboration Standards

This skill ensures AI assistants provide accurate, evidence-based responses without hallucination.

## Quick Reference

### Certainty Tags

| Tag | Use When |
|-----|----------|
| `[Confirmed]` / `[已確認]` | Direct evidence from code/docs |
| `[Inferred]` / `[推論]` | Logical deduction from evidence |
| `[Assumption]` / `[假設]` | Based on common patterns (needs verification) |
| `[Unknown]` / `[未知]` | Information not available |
| `[Need Confirmation]` / `[待確認]` | Requires user clarification |

### Source Types

| Source Type | Tag | Reliability |
|-------------|-----|-------------|
| Project Code | `[Source: Code]` | ⭐⭐⭐⭐⭐ Highest |
| Project Docs | `[Source: Docs]` | ⭐⭐⭐⭐ High |
| External Docs | `[Source: External]` | ⭐⭐⭐⭐ High |
| Web Search | `[Source: Search]` | ⭐⭐⭐ Medium |
| AI Knowledge | `[Source: Knowledge]` | ⭐⭐ Low |
| User Provided | `[Source: User]` | ⭐⭐⭐ Medium |

### Core Rules

1. **Evidence-Based Only**: Only analyze content that has been explicitly read
2. **Cite Sources**: Include file path and line number for code references
3. **Classify Certainty**: Tag all statements with certainty level
4. **Always Recommend**: When presenting options, include a recommended choice with reasoning

## Detailed Guidelines

For complete standards, see:
- [Anti-Hallucination Guidelines](./anti-hallucination.md)
- [Certainty Labels Reference](./certainty-labels.md)

## Examples

### ✅ Correct Response

```
[Confirmed] src/auth/service.ts:45 - JWT validation uses 'jsonwebtoken' library
[Inferred] Based on repository pattern in src/repositories/, likely using dependency injection
[Need Confirmation] Should the new feature support multi-tenancy?
```

### ❌ Incorrect Response

```
The system uses Redis for caching (code not reviewed)
The UserService should have an authenticate() method (API not verified)
```

### ✅ Correct Option Presentation

```
There are three options:
1. Redis caching
2. In-memory caching
3. File-based caching

**Recommended: Option 1 (Redis)**: Given the project already has Redis infrastructure
and needs cross-instance cache sharing, Redis is the most suitable choice.
```

### ❌ Incorrect Option Presentation

```
There are three options:
1. Redis caching
2. In-memory caching
3. File-based caching

Please choose one.
```

## Checklist

Before making any statement:

- [ ] Source Verified - Have I read the actual file/document?
- [ ] Source Type Tagged - Did I specify `[Source: Code]`, `[Source: External]`, etc.?
- [ ] Reference Cited - Did I include file path and line number?
- [ ] Certainty Classified - Did I tag as `[Confirmed]`, `[Inferred]`, etc.?
- [ ] No Fabrication - Did I avoid inventing APIs, configs, or requirements?
- [ ] Recommendation Included - When presenting options, did I include a recommended choice?

---

## Configuration Detection

This skill supports project-specific language configuration for certainty tags.

### Detection Order

1. Check `CONTRIBUTING.md` for "Certainty Tag Language" section
2. If found, use the specified language (English / 中文)
3. If not found, **default to English** tags

### First-Time Setup

If no configuration found and context is unclear:

1. Ask the user: "This project hasn't configured certainty tag language preference. Which would you like to use? (English / 中文)"
2. After user selection, suggest documenting in `CONTRIBUTING.md`:

```markdown
## Certainty Tag Language

This project uses **[English / 中文]** certainty tags.
<!-- Options: English | 中文 -->
```

### Configuration Example

In project's `CONTRIBUTING.md`:

```markdown
## Certainty Tag Language

This project uses **English** certainty tags.

### Tag Reference
- [Confirmed] - Direct evidence from code/docs
- [Inferred] - Logical deduction from evidence
- [Assumption] - Based on common patterns
- [Unknown] - Information not available
- [Need Confirmation] - Requires user clarification
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
