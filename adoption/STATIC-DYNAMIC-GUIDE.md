# Static vs Dynamic Standards Guide

> **Language**: English | [繁體中文](../locales/zh-TW/adoption/STATIC-DYNAMIC-GUIDE.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Projects using AI assistants with this standards framework

---

## Purpose

This guide explains how to classify and deploy development standards based on when they should be applied.

---

## Classification Overview

```
┌─────────────────────────────────────────────────────────────┐
│           Static Standards                                   │
│           Always active, embedded in project files           │
├─────────────────────────────────────────────────────────────┤
│  • anti-hallucination   → Certainty labels, evidence-based  │
│  • checkin-standards    → Build, test, coverage gates       │
│  • project-structure    → Directory conventions             │
└─────────────────────────────────────────────────────────────┘
                              ↑
                     Always in context
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Dynamic Standards                                  │
│           Triggered by keywords, loaded on demand            │
├─────────────────────────────────────────────────────────────┤
│  • commit-standards     ← "commit", "git"                   │
│  • code-review-assistant← "review", "PR"                    │
│  • git-workflow-guide   ← "branch", "merge"                 │
│  • testing-guide        ← "test", "coverage"                │
│  • release-standards    ← "version", "release"              │
│  • documentation-guide  ← "docs", "README"                  │
│  • requirement-assistant← "spec", "SDD", "新功能"            │
└─────────────────────────────────────────────────────────────┘
```

---

## Static Standards

### Definition

Standards that should **always be active** during AI interactions, regardless of the specific task.

### Characteristics

- Apply to all interactions (no specific trigger)
- Content is concise (fits in project context file)
- Low token overhead
- Foundational behavioral guidelines

### Static Standards List

| Standard | Key Rules | Core Purpose |
|----------|-----------|--------------|
| [anti-hallucination](../core/anti-hallucination.md) | Certainty labels, source citation, recommendations | Prevent AI from making unverified claims |
| [checkin-standards](../core/checkin-standards.md) | Build passes, tests pass, coverage maintained | Ensure code quality before commits |
| [project-structure](../core/project-structure.md) | Directory conventions, gitignore rules | Maintain consistent project organization |

### Deployment

Add to your project root as one of:

- `CLAUDE.md` (Claude Code)
- `.cursorrules` (Cursor)
- `.github/copilot-instructions.md` (GitHub Copilot)
- `AI_GUIDELINES.md` (generic)

**Template**: See [CLAUDE.md.template](../templates/CLAUDE.md.template)

---

## Dynamic Standards

### Definition

Standards that are **triggered by specific keywords** or tasks, loaded on demand to provide detailed guidance.

### Characteristics

- Have specific trigger conditions (keywords, commands)
- Content is detailed (would bloat context if always loaded)
- Loaded only when relevant
- Task-specific workflows

### Dynamic Standards List

| Standard | Skill | Trigger Keywords |
|----------|-------|-----------------|
| [commit-message-guide](../core/commit-message-guide.md) | commit-standards | commit, git, 提交, feat, fix |
| [code-review-checklist](../core/code-review-checklist.md) | code-review-assistant | review, PR, 審查 |
| [git-workflow](../core/git-workflow.md) | git-workflow-guide | branch, merge, 分支 |
| [testing-standards](../core/testing-standards.md) | testing-guide | test, 測試, coverage |
| [test-completeness-dimensions](../core/test-completeness-dimensions.md) | testing-guide | test completeness |
| [versioning](../core/versioning.md) | release-standards | version, release, 版本 |
| [changelog-standards](../core/changelog-standards.md) | release-standards | changelog, 變更日誌 |
| [documentation-structure](../core/documentation-structure.md) | documentation-guide | README, docs |
| [documentation-writing-standards](../core/documentation-writing-standards.md) | documentation-guide | documentation |
| [spec-driven-development](../core/spec-driven-development.md) | requirement-assistant | spec, SDD, 規格, 新功能 |

### Deployment

Install as Claude Code Skills:

```bash
# Install all skills
cd skills/claude-code && ./install.sh

# Or install selectively
cp -r skills/claude-code/commit-standards ~/.claude/skills/
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

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Initial guide |

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
