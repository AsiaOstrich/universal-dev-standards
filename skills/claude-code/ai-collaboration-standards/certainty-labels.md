# Certainty Labels Reference

> **Language**: English | [繁體中文](../../../../locales/zh-TW/skills/claude-code/ai-collaboration-standards/certainty-labels.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-25
**Applicability**: Claude Code Skills

---

## Purpose

This document provides reference for certainty labels, derivation tags, and source types used in AI responses.

---

## Unified Tag System Overview

This skill uses two complementary tag categories:

| Category | Purpose | Used In |
|----------|---------|---------|
| **Certainty Tags** | Analyzing existing content | Code analysis, reverse engineering |
| **Derivation Tags** | Generating new content | Forward derivation, spec generation |

---

## Certainty Tags (English / 中文)

| English Tag | 中文標籤 | Use When |
|-------------|---------|----------|
| `[Confirmed]` | `[已確認]` | Direct evidence from code/docs |
| `[Inferred]` | `[推論]` | Logical deduction from evidence |
| `[Assumption]` | `[假設]` | Based on common patterns (needs verification) |
| `[Unknown]` | `[未知]` | Information not available |
| `[Need Confirmation]` | `[待確認]` | Requires user clarification |

---

## Derivation Tags (English / 中文)

Used when generating tests, specifications, or documentation from approved sources.

| English Tag | 中文標籤 | Use When |
|-------------|---------|----------|
| `[Source]` | `[來源]` | Direct content from spec/requirement (verbatim) |
| `[Derived]` | `[推演]` | Transformed from source content (e.g., bullet → GWT) |
| `[Generated]` | `[生成]` | AI-generated structure (test skeleton, TODO comments) |
| `[TODO]` | `[待辦]` | Requires human implementation |

---

## Source Types

| Source Type | Tag | Description | Reliability |
|-------------|-----|-------------|-------------|
| Project Code | `[Source: Code]` | Directly read from codebase | ⭐⭐⭐⭐⭐ Highest |
| Project Docs | `[Source: Docs]` | README, Wiki, inline comments | ⭐⭐⭐⭐ High |
| External Docs | `[Source: External]` | Official documentation with URL | ⭐⭐⭐⭐ High |
| Web Search | `[Source: Search]` | Search results (include date) | ⭐⭐⭐ Medium |
| AI Knowledge | `[Source: Knowledge]` | AI training data (needs verification) | ⭐⭐ Low |
| User Provided | `[Source: User]` | Information from user conversation | ⭐⭐⭐ Medium |

---

## Usage Examples

### In Technical Documents

```markdown
## System Architecture Analysis

`[Confirmed]` System uses ASP.NET Core 8.0 framework [Source: Code] Program.cs:1
`[Confirmed]` Database uses SQL Server [Source: Code] appsettings.json:12
`[Inferred]` Based on Repository Pattern usage, system likely adopts DDD architecture
`[Assumption]` Caching mechanism may use Redis (need to confirm config)
`[Need Confirmation]` Should multi-tenancy be supported?
```

### In Code Review

```markdown
## Review Comments

`[Confirmed]` src/Services/AuthService.cs:45 - Password validation lacks brute force protection
`[Inferred]` Rate limiting may be needed here
`[Need Confirmation]` Are there other layers of protection already in place?
```

---

## Best Practices

### 1. Consistency

- Use the same language tags throughout a document (all Chinese or all English)
- Team should specify preferred language in `CONTRIBUTING.md`

### 2. Source Citation

- Chinese tags still require source citations
- Format: `[已確認]` statement [Source: Code] file_path:line_number

### 3. Team Agreement

- Decide on Chinese or English tags at project start
- Document in `CONTRIBUTING.md` or `.standards/` directory

---

## Quick Decision Guide

```
Did you read the actual code/doc?
├── YES → [Confirmed] / [已確認]
└── NO
    ├── Can you deduce from available evidence?
    │   ├── YES → [Inferred] / [推論]
    │   └── NO
    │       ├── Is it a common pattern?
    │       │   ├── YES → [Assumption] / [假設]
    │       │   └── NO → [Unknown] / [未知]
    └── Does user need to clarify?
        └── YES → [Need Confirmation] / [待確認]
```

---

## Related Standards

- [Anti-Hallucination Guidelines](./anti-hallucination.md)
- [Anti-Hallucination Standards](../../../core/anti-hallucination.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-25 | Added: Unified Tag System, Derivation Tags with Chinese translations |
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
