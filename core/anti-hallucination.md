# AI Collaboration Anti-Hallucination Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/anti-hallucination.md)

**Version**: 1.5.0
**Last Updated**: 2026-01-29
**Applicability**: All software projects using AI assistants
**Scope**: universal
**Industry Standards**: None (UDS original)

> **For detailed examples and case studies, see [Anti-Hallucination Guide](guides/anti-hallucination-guide.md)**

---

## Purpose

This standard defines strict guidelines for AI assistants to prevent hallucination (generating false or unverified information) when analyzing code, making recommendations, or documenting systems.

---

## Core Mandates

### 1. Evidence-Based Analysis Only

| DO | DO NOT |
|----|--------|
| ✅ Analyze code files that have been read | ❌ Speculate about APIs, functions, or configs not seen |
| ✅ Reference documentation that has been fetched | ❌ Assume framework behavior without verification |
| ✅ Cite configuration files that have been inspected | ❌ Fabricate requirement details |

### 2. Explicit Source Attribution

**Format for Code References**:
```
[Source: Code] file_path:line_number - Description
```

**Format for External Documentation**:
```
[Source: External] URL - Description (Version: x.x.x, Accessed: YYYY-MM-DD)
```

**Format for AI Knowledge**:
```
[Source: Knowledge] Topic - Description (⚠️ Requires verification)
```

### 3. Source Type Reliability

| Source Type | Tag | Reliability |
|-------------|-----|-------------|
| Project Code | `[Source: Code]` | ⭐⭐⭐⭐⭐ Highest |
| Project Docs | `[Source: Docs]` | ⭐⭐⭐⭐ High |
| External Docs | `[Source: External]` | ⭐⭐⭐⭐ High |
| Web Search | `[Source: Search]` | ⭐⭐⭐ Medium |
| User Provided | `[Source: User]` | ⭐⭐⭐ Medium |
| AI Knowledge | `[Source: Knowledge]` | ⭐⭐ Low |

---

## Certainty Classification Tags

| Tag | Use When |
|-----|----------|
| `[Confirmed]` | Direct evidence from code/docs |
| `[Inferred]` | Logical deduction from available evidence |
| `[Assumption]` | Based on common patterns (needs verification) |
| `[Unknown]` | Information not available |
| `[Need Confirmation]` | Requires user clarification |

---

## Derivation Tags (for generating content)

| Tag | Purpose | Example Context |
|-----|---------|-----------------|
| `[Source]` | Direct content from spec/requirement | SPEC title, AC text verbatim |
| `[Derived]` | Transformed from source content | GWT from bullet AC |
| `[Generated]` | AI-generated structure | Test skeleton, TODO comments |
| `[TODO]` | Requires human implementation | Step definitions, assertions |

---

## Prohibited Behaviors

| # | Prohibition | Instead |
|---|-------------|---------|
| 1 | **Fabricate APIs or Function Signatures** | Read the actual source code or ask the user |
| 2 | **Assume Requirements** | Ask clarifying questions when requirements are ambiguous |
| 3 | **Speculate About Unread Code** | State "Need to read [file] to confirm" |
| 4 | **Invent Configuration** | Review actual configuration files |
| 5 | **Hallucinate Errors or Bugs** | Analyze actual code and cite specific lines |
| 6 | **Present Options Without Recommendation** | Always include a recommended choice with reasoning |
| 7 | **Implement Without Side Effect Analysis** | List at least 3 potential side effects before implementing |

---

## Recommendation Requirements

**Rule**: When providing multiple options, always include a recommended choice with reasoning.

| Scenario | Requirement |
|----------|-------------|
| 2+ options presented | Must indicate recommended option with reasoning |
| Clear winner exists | Directly recommend best option with reasoning |
| Trade-offs exist | Recommend based on current context, explain trade-offs |
| Cannot determine | Explain what information is needed to make a recommendation |

---

## Next Step Suggestions

**Rule**: Upon completing a task or subtask, suggest logical next steps and identify the most recommended one.

**Guidelines**:
- **Proactive**: Don't wait for the user to ask "what now?"
- **Contextual**: Suggestions should follow the project's workflow
- **Clear Winner**: Use `[Recommended]` to mark the best path

---

## Implementation Checklist

Before making any statement about code, requirements, or architecture:

- [ ] **Source Verified**: Have I read the actual file/document?
- [ ] **Source Type Tagged**: Did I specify the source type?
- [ ] **Reference Cited**: Did I include file path and line number (for code)?
- [ ] **Version Specified**: Did I include library/framework version when applicable?
- [ ] **Certainty Classified**: Did I tag as [Confirmed], [Inferred], etc.?
- [ ] **AI Knowledge Flagged**: Did I mark `[Source: Knowledge]` with ⚠️ warning?
- [ ] **No Fabrication**: Did I avoid inventing APIs, configs, or requirements?
- [ ] **User Clarification**: Did I ask for clarification on ambiguous points?
- [ ] **Recommendation Included**: When presenting options, did I include a recommended choice?
- [ ] **Side Effects Identified**: Did I list potential side effects before implementing?

---

## Version Sensitivity

**Rule**: When referencing libraries, frameworks, or APIs, always include version information when available.

| ✅ Good | ❌ Bad |
|---------|--------|
| `[Source: External] Next.js App Router (v14.x) - Server Components are the default` | "Next.js uses Server Components" |
| `[Source: Code] package.json:12 - Using "express": "^4.18.2"` | "Express handles routing" |

---

## Conversation Language Guidelines

| Context | Guideline |
|---------|-----------|
| Conversation | Use project's specified language |
| Certainty Tags | Use project's specified language |
| Error Explanation | Use project's specified language |
| Technical Terms | Preserve original (JWT, BCrypt, API, Token) |
| Code Comments | Follow project convention |
| Commit Messages | Follow project convention |

---

## Related Standards

- [Testing Standards](testing-standards.md) - Ensure verification of AI analysis results
- [Code Review Checklist](code-review-checklist.md) - Review AI-generated content
- [Code Check-in Standards](checkin-standards.md) - AI collaboration check-in process
- [Reverse Engineering Standards](reverse-engineering-standards.md) - Certainty tags usage
- [Forward Derivation Standards](forward-derivation-standards.md) - Derivation tags usage

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.5.0 | 2026-01-29 | Refactored: Split into Rules + Guide, moved examples to guide |
| 1.4.0 | 2026-01-19 | Added: Side Effect Analysis rule |
| 1.3.1 | 2025-12-24 | Added: Related Standards section |
| 1.3.0 | 2025-12-22 | Enhanced: Prohibited Behaviors with detailed examples |
| 1.2.0 | 2025-12-15 | Added AI Assistant Interaction Standards |
| 1.1.0 | 2025-12-10 | Enhanced source attribution with source types |
| 1.0.0 | 2025-11-12 | Initial standard published |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
