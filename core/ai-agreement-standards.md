# AI Agreement Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/ai-agreement-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Applicability**: All AI-assisted development sessions
**Scope**: universal
**ISO 12207 Mapping**: Agreement Processes (6.1)

---

## Purpose

This standard formalizes the interaction between Human (Acquirer) and AI (Supplier) as a verifiable agreement. In "Vibe Coding," the prompt context serves as the legal contract that governs the AI's behavior and deliverables.

---

## 1. The Context Contract (上下文合約)

Every AI session MUST begin with a clear Context Contract. This is typically implemented via system prompt files (e.g., `CLAUDE.md`, `.cursorrules`).

### 1.1 Contract Components

A valid Context Contract must define:

| Component | Description | Example |
|-----------|-------------|---------|
| **Role Definition** | Who represents the User vs. AI | "You are a Senior Backend Engineer..." |
| **Scope of Work** | Operational boundaries | "Only modify files in `src/utils/`. Do not touch `config/`." |
| **Constraint Laws** | Non-negotiable rules | "Never hardcode secrets. Always use TypeScript." |
| **Acceptance Criteria** | Definition of Done | "Code must pass `npm test` and `npm run lint`." |

---

## 2. Request for Proposal (RFP) Standard

Complex tasks should be structured as an "RFP" (Request for Proposal) rather than a simple chat message.

### 2.1 RFP Prompt Structure

When requesting complex features or refactoring, use this structure:

```markdown
# Objective
[One-line summary of the task]

# Context & Constraints
- **Current State**: [Describe existing code/architecture]
- **Target State**: [Describe desired outcome]
- **Constraints**: [e.g., "Must use library X", "Max complexity N"]

# Input Data
[List relevant files or paste JSON schemas]

# Deliverable Requirements
1. [Requirement A]
2. [Requirement B]

# Verification Plan
- [ ] [Test case 1]
- [ ] [Test case 2]
```

---

## 3. Supply Acceptance (交付驗收)

### 3.1 AI Self-Verification
Before outputting code, the AI (Supplier) MUST verify its own output against the Context Contract:
- Does this code violate any Constraint Laws?
- Does it meet all Acceptance Criteria?

### 3.2 Human Sign-off
The User (Acquirer) MUST strictly review the "Supply" (AI output) before applying it:
- **Review**: Read the code (do not just trust).
- **Verify**: Run the Verification Plan.
- **Accept**: Commit the changes only after validation.

---

## Related Standards

- [Anti-Hallucination Protocol](anti-hallucination.md)
- [Requirement Engineering](requirement-engineering.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial release mapping to ISO 12207 Agreement Processes |
