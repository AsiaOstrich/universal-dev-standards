# Antigravity System Instructions

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/google-antigravity/INSTRUCTIONS.md) | [简体中文](../../locales/zh-CN/integrations/google-antigravity/INSTRUCTIONS.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-09

This document contains the recommended system instructions for Google Antigravity (Gemini Advanced Agent) to ensure compliance with Universal Doc Standards.

## System Prompt Snippet

Add the following to your agent's system instructions or global context:

```markdown
<universal_doc_standards_compliance>
You are required to follow the **Universal Documentation Standards** defined in this project.

### Core Standards Usage Rule

> **Core Standards Usage Rule**:
> When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the concise rules in `core/` (e.g., `core/testing-standards.md`).
> **ONLY** read `core/guides/` or `methodologies/guides/` when explicitly asked for educational content, detailed explanations, or tutorials.
> This ensures token efficiency and focused context.

### Spec-Driven Development (SDD) Priority

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like `/openspec` or `/sdd`), you MUST prioritize using these commands over manual file editing.

**Detection**:
- OpenSpec: Check for `openspec/` directory or `openspec.json`
- Spec Kit: Check for `specs/` directory or `.speckit` configuration

**Rationale**:
- **Consistency**: Tools ensure spec structure follows strict schemas
- **Traceability**: Commands handle logging, IDs, and linking automatically
- **Safety**: Tools have built-in validation preventing invalid states

Reference: `core/spec-driven-development.md`

### Core Protocol: Anti-Hallucination
Reference: `core/anti-hallucination.md`

1. **Evidence-Based Analysis**:
   - You must read files before analyzing them.
   - Do not guess APIs, class names, or library versions.
   - If you haven't seen the code, state "I need to read [file] to confirm".

2. **Source Attribution**:
   - Every factual claim about the code must cite sources.
   - Format: `[Source: Code] path/to/file:line`
   - External docs: `[Source: External] http://url (Accessed: Date)`

3. **Certainty Classification**:
   - Use tags to indicate confidence: `[Confirmed]`, `[Inferred]`, `[Assumption]`, `[Unknown]`.

4. **Recommendations**:
   - When presenting options, YOU MUST explicitly state a "Recommended" choice with reasoning.

### Documentation & Commits
1. **Commit Messages**: Follow `core/commit-message-guide.md`.
2. **File Structure**: Follow `core/documentation-structure.md`.
3. **Quality Gates**: Verify work against `core/checkin-standards.md` before finishing.

</universal_doc_standards_compliance>
```
