# Universal Development Standards

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/codex/AGENTS.md) | [简体中文](../../locales/zh-CN/integrations/codex/AGENTS.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-09

This project follows the Universal Doc Standards to ensure high-quality, hallucination-free code and documentation.

---

## Core Standards Usage Rule

> **Core Standards Usage Rule**:
> When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the concise rules in `core/` (e.g., `core/testing-standards.md`).
> **ONLY** read `core/guides/` or `methodologies/guides/` when explicitly asked for educational content, detailed explanations, or tutorials.
> This ensures token efficiency and focused context.

---

## Spec-Driven Development (SDD) Priority

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like `/openspec` or `/spec`), you MUST prioritize using these commands over manual file editing.

**Detection**:
- OpenSpec: Check for `openspec/` directory or `openspec.json`
- Spec Kit: Check for `specs/` directory or `.speckit` configuration

**Rationale**:
- **Consistency**: Tools ensure spec structure follows strict schemas
- **Traceability**: Commands handle logging, IDs, and linking automatically
- **Safety**: Tools have built-in validation preventing invalid states

Reference: `core/spec-driven-development.md`

---

## Anti-Hallucination Protocol

Reference: `core/anti-hallucination.md`

### 1. Evidence-Based Analysis

- You MUST read files before analyzing them.
- Do NOT guess APIs, class names, or library versions.
- If you haven't seen the code, state: "I need to read [file] to confirm".

### 2. Source Attribution

Every factual claim about the code MUST cite sources:
- Code: `[Source: Code] path/to/file:line`
- External docs: `[Source: External] http://url (Accessed: Date)`

### 3. Certainty Classification

Use tags to indicate confidence level:
- `[Confirmed]` - Verified from source
- `[Inferred]` - Logically deduced
- `[Assumption]` - Reasonable guess
- `[Unknown]` - Cannot determine

### 4. Recommendations

When presenting options, you MUST explicitly state a "Recommended" choice with reasoning.

---

## Documentation & Commits

### Commit Messages

Follow Conventional Commits format (reference: `core/commit-message-guide.md`):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, chore, test, refactor, style

### File Structure

Follow documentation structure guidelines (reference: `core/documentation-structure.md`).

### Quality Gates

Before finishing, verify work against `core/checkin-standards.md`:
- [ ] Code compiles successfully
- [ ] All tests pass
- [ ] No hardcoded secrets
- [ ] Documentation updated if applicable

---

## Code Review Standards

Reference: `core/code-review-checklist.md`

When reviewing code, check:
1. **Functionality** - Does it work as intended?
2. **Security** - No vulnerabilities (OWASP Top 10)?
3. **Performance** - Efficient algorithms and queries?
4. **Maintainability** - Clean, readable code?
5. **Tests** - Adequate test coverage?

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial OpenAI Codex integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
