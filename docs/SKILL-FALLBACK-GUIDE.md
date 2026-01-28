# Skill Fallback Guide

> **Language**: English | [繁體中文](../locales/zh-TW/docs/SKILL-FALLBACK-GUIDE.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-28

---

## Purpose

This guide explains how to maintain UDS functionality when Claude Code Skills are unavailable. Skills provide AI-optimized execution, but Core Standards ensure continuity when Skills cannot be used.

---

## When Skills Are Unavailable

Skills may be unavailable in the following scenarios:

| Scenario | Cause | Fallback Strategy |
|----------|-------|-------------------|
| **Non-Claude Code AI** | Using Cursor, Copilot, other AI tools | Reference Core Standards directly |
| **Claude without Skills** | Skills not loaded or disabled | Embed quick references in CLAUDE.md |
| **Manual Development** | No AI assistance | Use Core Standards as documentation |
| **New Team Onboarding** | Skills not yet adopted | Start with Core Standards |

---

## Architecture Overview: Skills vs Core Standards

The UDS framework uses a **dual-layer architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│  Skills (Execution Layer)                                        │
│  ─────────────────────────────────────────────────────────────  │
│  • Quick reference tables & decision trees                       │
│  • AI-optimized, token-efficient                                 │
│  • Interactive workflows & configuration detection               │
│  • Best for: Daily tasks, quick lookups                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ When depth needed, reference:
┌─────────────────────────────────────────────────────────────────┐
│  Core Standards (Knowledge Base)                                 │
│  ─────────────────────────────────────────────────────────────  │
│  • Complete theory & edge case coverage                          │
│  • Tool configurations & automation guides                       │
│  • "Why" explanations & rationale                                │
│  • Best for: Deep understanding, complex scenarios               │
└─────────────────────────────────────────────────────────────────┘
```

### What Skills Provide (but Core Standards Don't)

| Feature | Skill Capability | Core Standard Alternative |
|---------|------------------|---------------------------|
| YAML format | Token-efficient | Full Markdown (verbose) |
| Config detection | Automatic project scanning | Manual configuration |
| Interactive setup | First-time wizard | Step-by-step documentation |
| Decision trees | Visual quick reference | Detailed section lookup |
| Language detection | Automatic bilingual support | Manual selection |

### What Core Standards Provide (but Skills Don't)

| Feature | Core Standard Content | Skill Coverage |
|---------|----------------------|----------------|
| Theoretical foundation | IEEE, SWEBOK, ISO references | Minimal |
| Edge cases | Comprehensive coverage | Common cases only |
| Tool configuration | commitlint, husky, CI/CD | Reference links |
| Rationale | "Why" explanations | "What" and "How" only |
| Code examples | Multi-language, detailed | Concise snippets |

---

## Fallback Strategies by Scenario

### Scenario 1: Using Non-Claude AI Tools (Cursor, Copilot, etc.)

**Problem**: Claude Code Skills are not available in other AI tools.

**Solution**: Reference Core Standards directly in your prompts.

**Setup Steps**:

1. **Create a project-level AI instruction file**:

   Create `.cursorrules`, `.copilot-rules`, or equivalent:

   ```markdown
   # Project Development Standards

   This project follows Universal Development Standards.

   ## Key Standards to Follow

   1. **Commit Messages**: Follow Conventional Commits
      - Reference: core/commit-message-guide.md

   2. **Testing**: Follow Testing Standards
      - Reference: core/testing-standards.md

   3. **Requirements**: Follow Requirement Engineering Standards
      - Reference: core/requirement-engineering.md

   ## Quick Reference

   ### Commit Format
   <type>(<scope>): <subject>

   Types: feat, fix, docs, chore, test, refactor, style
   ```

2. **Embed quick reference tables**:

   Copy essential tables from Skills into your AI configuration file.

### Scenario 2: Claude Code without Skills Loaded

**Problem**: Claude Code is available but Skills are not loaded.

**Solution**: Reference Core Standards directly in CLAUDE.md or conversation.

**Example CLAUDE.md Addition**:

```markdown
## Development Standards Reference

When Skills are not available, reference these Core Standards:

| Task | Core Standard |
|------|---------------|
| Writing commits | `core/commit-message-guide.md` |
| Writing requirements | `core/requirement-engineering.md` |
| Testing | `core/testing-standards.md` |
| Code review | `core/code-review-checklist.md` |
| Check-in | `core/checkin-standards.md` |
```

### Scenario 3: Manual Development (No AI)

**Problem**: Working without AI assistance.

**Solution**: Use Core Standards as reference documentation.

**Recommended Workflow**:

1. **Before starting work**: Read relevant Core Standard
2. **During development**: Keep standard open for reference
3. **Before commit**: Check against checklist
4. **During review**: Reference Code Review Checklist

---

## Quick Reference Tables for Embedding

When Skills are unavailable, embed these tables in your CLAUDE.md or AI configuration.

### Commit Message Quick Reference

```markdown
## Commit Message Format

<type>(<scope>): <subject>

| Type | Purpose |
|------|---------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| chore | Maintenance |
| test | Testing |
| refactor | Refactoring |
| style | Formatting |

Example: `feat(auth): add OAuth2 login support`
```

### Requirement Writing Quick Reference

```markdown
## User Story Format

As a [role],
I want [feature],
So that [benefit].

## INVEST Criteria

| Criterion | Question |
|-----------|----------|
| Independent | Can be delivered alone? |
| Negotiable | Details flexible? |
| Valuable | Who benefits? |
| Estimable | Can estimate effort? |
| Small | Fits in one sprint? |
| Testable | How to verify? |
```

### Testing Quick Reference

```markdown
## Testing Pyramid (Default)

| Level | Ratio | Focus |
|-------|-------|-------|
| Unit | 70% | Functions/methods |
| Integration | 20% | Components |
| E2E | 10% | Workflows |

## Test Naming

Pattern: should_[expected]_when_[condition]
Example: should_return_error_when_email_invalid
```

### Code Review Quick Reference

```markdown
## Review Comment Prefixes

| Prefix | Meaning |
|--------|---------|
| ❗ BLOCKING | Must fix |
| ⚠️ IMPORTANT | Should fix |
| 💡 SUGGESTION | Nice-to-have |
| ❓ QUESTION | Clarification |
```

---

## Core↔Skill Mapping Reference

When a Skill is unavailable, use its corresponding Core Standard:

| Skill | Core Standard |
|-------|---------------|
| `commit-standards` | `core/commit-message-guide.md` |
| `testing-guide` | `core/testing-standards.md` |
| `code-review-assistant` | `core/code-review-checklist.md` |
| `requirement-assistant` | `core/requirement-engineering.md` |
| `spec-driven-dev` | `core/spec-driven-development.md` |
| `tdd-assistant` | `core/test-driven-development.md` |
| `bdd-assistant` | `core/behavior-driven-development.md` |
| `atdd-assistant` | `core/acceptance-test-driven-development.md` |
| `checkin-assistant` | `core/checkin-standards.md` |
| `documentation-guide` | `core/documentation-writing-standards.md` |
| `changelog-guide` | `core/changelog-standards.md` |
| `git-workflow-guide` | `core/git-workflow.md` |
| `refactoring-assistant` | `core/refactoring-standards.md` |
| `reverse-engineer` | `core/reverse-engineering-standards.md` |
| `forward-derivation` | `core/forward-derivation-standards.md` |
| `ai-instruction-standards` | `core/ai-instruction-standards.md` |
| `ai-friendly-architecture` | `core/ai-friendly-architecture.md` |

### Utility Skills (No Core Standard)

These Skills are tools without corresponding Core Standards:

| Skill | Type | Alternative |
|-------|------|-------------|
| `docs-generator` | UDS-specific tool | Manual template creation |
| `methodology-system` | Cross-domain integration | Reference individual Core Standards |

---

## Alternative Workflows

### Without `commit-standards` Skill

**Manual Workflow**:

1. Read `core/commit-message-guide.md`
2. Use this format:
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
3. Reference the Conventional Commits type table in the Core Standard

### Without `testing-guide` Skill

**Manual Workflow**:

1. Read `core/testing-standards.md`
2. Follow the Testing Pyramid ratios (70/20/10)
3. Use ISTQB terminology from the Core Standard
4. Reference edge case coverage checklist

### Without `requirement-assistant` Skill

**Manual Workflow**:

1. Read `core/requirement-engineering.md`
2. Use INVEST criteria for user stories
3. Follow IEEE 830 SRS structure for formal requirements
4. Apply ISO 25010 for NFR categorization

---

## Embedding Standards in Other AI Tools

### For Cursor (`.cursorrules`)

```markdown
# Cursor Rules

## Development Standards

Follow UDS Core Standards in this project:

### Commits
- Format: <type>(<scope>): <subject>
- Types: feat, fix, docs, chore, test, refactor, style
- Reference: core/commit-message-guide.md

### Testing
- Follow Testing Pyramid (70% unit, 20% integration, 10% E2E)
- Reference: core/testing-standards.md

### Requirements
- Use INVEST criteria for user stories
- Reference: core/requirement-engineering.md
```

### For GitHub Copilot

Add to repository's `.github/copilot-instructions.md`:

```markdown
# Copilot Instructions

When generating code or documentation, follow these standards:

1. Commit messages: Use Conventional Commits format
2. Tests: Follow TDD, include edge cases
3. Requirements: Use INVEST criteria

See `core/` directory for detailed standards.
```

### For Generic AI Tools

Create a `AI-INSTRUCTIONS.md` in project root:

```markdown
# AI Development Instructions

This project follows Universal Development Standards.

## Quick Reference

[Embed quick reference tables here]

## Detailed Standards

For complete guidelines, see:
- core/commit-message-guide.md
- core/testing-standards.md
- core/requirement-engineering.md
```

---

## Best Practices for Fallback Mode

### Do's

- ✅ Keep Core Standards accessible in your workspace
- ✅ Create project-level quick reference in CLAUDE.md or equivalent
- ✅ Reference specific sections when asking AI for help
- ✅ Update quick references when Core Standards change

### Don'ts

- ❌ Assume AI knows the standards without context
- ❌ Copy entire Core Standards (too verbose for AI context)
- ❌ Skip validation just because Skills are unavailable
- ❌ Create divergent local standards that conflict with Core

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial release: Skill fallback strategies, embedding guides, alternative workflows |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
