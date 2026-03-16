# Context-Aware Standard Loading

> **Language**: English | [繁體中文](../locales/zh-TW/core/context-aware-loading.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-16
**Applicability**: All projects using AI-optimized standards (.ai.yaml)
**Scope**: universal

---

## Purpose

This standard defines a protocol for AI tools to selectively load development standards based on the current task context. Instead of loading all standards at once, AI tools load a core set always and activate additional standards on demand, reducing token usage and improving focus.

---

## Quick Reference

| Concept | Description |
|---------|-------------|
| **Domain** | A named group of related standards (e.g., `testing`, `quality`) |
| **Always-On** | Standards loaded in every session regardless of task |
| **On-Demand** | Standards loaded only when the task context matches their domain triggers |
| **Manifest Domains** | The single source of truth for domain→standard mappings (`manifest.json`) |

---

## 1. Domain Classification

### 1.1 Always-On Standards

These standards are fundamental to every AI interaction and must always be loaded:

| Standard | Reason |
|----------|--------|
| `anti-hallucination` | Prevents fabrication in every task |
| `commit-message` | Every session may produce commits |
| `checkin-standards` | Quality gates apply to all changes |
| `project-context-memory` | Project decisions must always be respected |
| `developer-memory` | Past insights should always be available |

### 1.2 On-Demand Domains

| Domain | Standards | Activation Triggers |
|--------|-----------|---------------------|
| `testing` | testing, unit-testing, integration-testing, test-completeness-dimensions, tdd, bdd, atdd | Writing tests, test file edits, "test coverage" discussion |
| `specification` | spec-driven-development, forward-derivation, reverse-engineering, requirement-engineering | `/sdd`, `/spec` commands, spec file edits |
| `quality` | code-review, refactoring, security, performance, accessibility | `/review` command, PR review, "refactor" discussion |
| `documentation` | documentation-structure, documentation-writing, ai-instruction, changelog | Writing docs, README/CHANGELOG edits |
| `workflow` | git-workflow, github-flow, squash-merge, versioning, deployment | Branch operations, release preparation, merging |
| `architecture` | ai-friendly-architecture, project-structure, error-codes, logging | Architecture decisions, project setup |

---

## 2. Activation Protocol

### 2.1 Loading Decision Flow

```
Session Start
  ├─ Load all always-on standards
  ├─ Scan user request for trigger keywords
  ├─ Match file patterns if user is editing files
  ├─ Detect slash commands (/sdd, /review, etc.)
  └─ Load matching on-demand standards
```

### 2.2 Manifest Domains Configuration

Projects configure domain mappings in `manifest.json`:

```json
{
  "domains": {
    "always-on": [
      "ai/standards/anti-hallucination.ai.yaml",
      "ai/standards/commit-message.ai.yaml",
      "ai/standards/checkin-standards.ai.yaml",
      "ai/standards/project-context-memory.ai.yaml",
      "ai/standards/developer-memory.ai.yaml"
    ],
    "testing": [
      "ai/standards/testing.ai.yaml",
      "ai/options/testing/unit-testing.ai.yaml",
      "ai/options/testing/integration-testing.ai.yaml",
      "ai/standards/test-completeness-dimensions.ai.yaml",
      "ai/standards/test-driven-development.ai.yaml",
      "ai/standards/behavior-driven-development.ai.yaml",
      "ai/standards/acceptance-test-driven-development.ai.yaml"
    ]
  }
}
```

---

## 3. Implementation Guidelines

### 3.1 For Standard Authors

- Register new standards in `manifest.json` under the appropriate domain
- Choose `always-on` only for standards that genuinely apply to every interaction
- Define specific, actionable triggers in the domain configuration (not vague keywords)
- Assign each standard to exactly one domain

### 3.2 For AI Tool Integrations

- At session start, always load the `always-on` domain
- Parse user's first message for trigger keywords before loading additional standards
- When in doubt, load the standard — false positives are better than missing context
- Cache domain membership for the session duration

### 3.3 Backward Compatibility

- Existing `manifest.json` without `domains` continues to work (all standards loaded)
- The `domains` field is additive — it does not remove existing `standards` list behavior

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-16 | Initial standard definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
