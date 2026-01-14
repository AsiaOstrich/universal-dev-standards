# Static vs Dynamic Standards Guide

> **Language**: English | [繁體中文](../locales/zh-TW/adoption/STATIC-DYNAMIC-GUIDE.md)

**Version**: 1.2.0
**Last Updated**: 2026-01-07
**Applicability**: Projects using AI assistants with this standards framework

---

## Purpose

This guide explains how to classify and deploy development standards based on when they should be applied.

---

## Classification Overview

```
┌─────────────────────────────────────────────────────────────┐
│           Pure Static Standards                              │
│           Always active, embedded in project context files   │
├─────────────────────────────────────────────────────────────┤
│  • checkin-standards    → Build, test, coverage gates       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           Hybrid Standards (Static + Dynamic)                │
│           Core rules in context + full guidance on demand    │
├─────────────────────────────────────────────────────────────┤
│  • anti-hallucination   → Basic rules always, details on    │
│                           demand via ai-collaboration-       │
│                           standards skill                    │
│  • project-structure    → Basic conventions always, details │
│                           on demand via project-structure-   │
│                           guide skill                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           Pure Dynamic Standards (15 Skills)                 │
│           Triggered by keywords, loaded on demand            │
├─────────────────────────────────────────────────────────────┤
│  • ai-collaboration-standards ← "certainty", "assumption"   │
│  • changelog-guide      ← "changelog", "release notes"      │
│  • code-review-assistant← "review", "PR"                    │
│  • commit-standards     ← "commit", "git"                   │
│  • documentation-guide  ← "docs", "README"                  │
│  • error-code-guide     ← "error code", "error handling"    │
│  • git-workflow-guide   ← "branch", "merge"                 │
│  • logging-guide        ← "logging", "log level"            │
│  • project-structure-guide ← "structure", "organization"    │
│  • release-standards    ← "version", "release"              │
│  • requirement-assistant← "spec", "SDD"                     │
│  • spec-driven-dev      ← "spec", "proposal"                │
│  • tdd-assistant        ← "TDD", "test first"               │
│  • test-coverage-assistant ← "test coverage", "dimensions"  │
│  • testing-guide        ← "test", "coverage"                │
└─────────────────────────────────────────────────────────────┘
```

---

## Pure Static Standards

### Definition

Standards that should **always be active** during AI interactions, regardless of the specific task. These are mandatory rules with no choices needed.

### Characteristics

- Apply to all interactions (no specific trigger)
- Content is concise (fits in project context file)
- Low token overhead
- Foundational behavioral guidelines
- Mandatory rules, no decision support needed

### Pure Static Standards List

| Standard | Key Rules | Core Purpose |
|----------|-----------|--------------|
| [checkin-standards](../core/checkin-standards.md) | Build passes, tests pass, coverage maintained | Ensure code quality before commits |

### Deployment

Add to your project root as one of:

- `CLAUDE.md` (Claude Code)
- `.cursorrules` (Cursor)
- `.github/copilot-instructions.md` (GitHub Copilot)
- `AI_GUIDELINES.md` (generic)

**Template**: See [CLAUDE.md.template](../templates/CLAUDE.md.template)

---

## Hybrid Standards (Static + Dynamic)

### Definition

Standards that have **both static and dynamic components**:
- **Static component**: Core rules embedded in project context (always active)
- **Dynamic component**: Full Skill with detailed guidance (triggered on demand)

### Characteristics

- Core rules are concise enough for context file
- Detailed guidance would bloat context if always loaded
- Both usage patterns are valid and complementary

### Hybrid Standards List

| Standard | Static Component | Dynamic Skill | Trigger Keywords |
|----------|------------------|---------------|------------------|
| [anti-hallucination](../core/anti-hallucination.md) | Certainty labels, recommendations | ai-collaboration-standards | certainty, assumption, inference |
| [project-structure](../core/project-structure.md) | Directory conventions | project-structure-guide | structure, organization |

### Deployment

1. **Static**: Add core rules summary to `CLAUDE.md`
2. **Dynamic**: Install the corresponding Skill for detailed guidance

---

## Pure Dynamic Standards

### Definition

Standards that are **triggered by specific keywords** or tasks, loaded on demand to provide detailed guidance.

### Characteristics

- Have specific trigger conditions (keywords, commands)
- Content is detailed (would bloat context if always loaded)
- Loaded only when relevant
- Task-specific workflows
- Decision support needed (choices, recommendations)

### Dynamic Standards List (15 Skills)

| Standard | Skill | Trigger Keywords |
|----------|-------|-----------------|
| [anti-hallucination](../core/anti-hallucination.md) | ai-collaboration-standards | certainty, assumption, 確定性 |
| [changelog-standards](../core/changelog-standards.md) | changelog-guide | changelog, release notes, 變更日誌 |
| [code-review-checklist](../core/code-review-checklist.md) | code-review-assistant | review, PR, 審查 |
| [commit-message-guide](../core/commit-message-guide.md) | commit-standards | commit, git, 提交, feat, fix |
| [documentation-structure](../core/documentation-structure.md) | documentation-guide | README, docs |
| [documentation-writing-standards](../core/documentation-writing-standards.md) | documentation-guide | documentation |
| [error-code-standards](../core/error-code-standards.md) | error-code-guide | error code, error handling, 錯誤碼 |
| [git-workflow](../core/git-workflow.md) | git-workflow-guide | branch, merge, 分支 |
| [logging-standards](../core/logging-standards.md) | logging-guide | logging, log level, 日誌 |
| [project-structure](../core/project-structure.md) | project-structure-guide | structure, organization, 結構 |
| [spec-driven-development](../core/spec-driven-development.md) | requirement-assistant | spec, SDD, 規格, 新功能 |
| [spec-driven-development](../core/spec-driven-development.md) | spec-driven-dev | spec, proposal, 提案 |
| [test-driven-development](../core/test-driven-development.md) | tdd-assistant | TDD, test first, 紅綠重構 |
| [test-completeness-dimensions](../core/test-completeness-dimensions.md) | test-coverage-assistant | test coverage, 7 dimensions, 測試覆蓋 |
| [testing-standards](../core/testing-standards.md) | testing-guide | test, 測試, coverage |
| [versioning](../core/versioning.md) | release-standards | version, release, 版本 |

### Deployment

**Recommended: Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**Alternative: Script Installation (macOS / Linux)**
```bash
cd skills/claude-code && ./install.sh

# Or install selectively
cp -r skills/claude-code/commit-standards ~/.claude/skills/
```

**Alternative: Manual Copy (Windows PowerShell)**
```powershell
# Install selectively
Copy-Item -Recurse skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

See [Claude Code Skills README](../skills/claude-code/README.md) for details.

---

## Decision Flowchart

```
                    ┌─────────────────┐
                    │  New Standard   │
                    └────────┬────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │ Does it apply to ALL    │
               │ AI interactions?        │
               └────────────┬────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
             YES                          NO
              │                           │
              ▼                           ▼
    ┌─────────────────┐      ┌─────────────────────────┐
    │ STATIC          │      │ Can it be triggered by  │
    │ Add to project  │      │ keywords?               │
    │ context file    │      └────────────┬────────────┘
    └─────────────────┘                   │
                               ┌──────────┴──────────┐
                               │                     │
                              YES                    NO
                               │                     │
                               ▼                     ▼
                    ┌─────────────────┐   ┌─────────────────┐
                    │ DYNAMIC         │   │ Consider if it  │
                    │ Create as Skill │   │ should be       │
                    │ with keywords   │   │ split or merged │
                    └─────────────────┘   └─────────────────┘
```

---

## Skill Trigger Mechanism

Skills use YAML frontmatter to define triggers:

```yaml
---
name: commit-standards
description: |
  Format commit messages following conventional commits standard.
  Use when: writing commit messages, git commit, reviewing commit history.
  Keywords: commit, git, message, conventional, 提交, 訊息, feat, fix, refactor.
---
```

**Key elements**:
- `Use when:` - Describes trigger scenarios
- `Keywords:` - Lists trigger keywords (supports multiple languages)

---

## Best Practices

### For Static Standards

1. **Keep it concise**: Max 100-200 lines in project context file
2. **Focus on behaviors**: What AI should always do/avoid
3. **Include quick references**: Concise tables, not full documentation
4. **Link to details**: Reference full standards for deep dives

### For Dynamic Standards

1. **Choose clear keywords**: Distinct, commonly used terms
2. **Support multiple languages**: Include Chinese keywords for Chinese-speaking users
3. **Group related standards**: e.g., testing-guide covers both testing-standards and test-completeness
4. **Provide quick references**: Skills should have concise summary at top

---

## Migration Guide

### From Full Rules to Static+Dynamic

If you currently have all rules in one file:

1. **Extract static rules**: Move anti-hallucination, checkin, and structure rules to `CLAUDE.md`
2. **Convert dynamic rules to Skills**: Create or install Skills for task-specific rules
3. **Remove redundant content**: Delete duplicated rules from context file
4. **Test triggers**: Verify Skills activate on expected keywords

---

## Related Resources

- [CLAUDE.md Template](../templates/CLAUDE.md.template) - Ready-to-use static rules template
- [Claude Code Skills](../skills/claude-code/README.md) - Skill installation guide
- [Adoption Guide](./ADOPTION-GUIDE.md) - Overall adoption strategy
- [MAINTENANCE.md](../MAINTENANCE.md) - How to add/update Skills (for maintainers)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-01-07 | Added tdd-assistant skill, updated to 15 Skills |
| 1.1.0 | 2025-12-30 | Added Hybrid Standards category, updated to 14 Skills |
| 1.0.0 | 2025-12-24 | Initial guide |

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
