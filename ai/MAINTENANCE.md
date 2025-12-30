# AI Standards Maintenance Guide

> **Language**: English | [繁體中文](../locales/zh-TW/ai/MAINTENANCE.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-30

---

## Purpose

This document defines the maintenance workflow for AI-optimized standards (`.ai.yaml` files), ensuring consistency between source documents and their AI-optimized versions.

---

## Architecture Overview

```
core/                           ← Primary Source (人類可讀 Markdown)
  ├── anti-hallucination.md
  ├── changelog-standards.md
  ├── checkin-standards.md
  ├── ...
  └── versioning.md

ai/                             ← AI-Optimized Version (機器可讀 YAML)
  ├── standards/                ← Core standards → AI format
  │   ├── anti-hallucination.ai.yaml
  │   ├── changelog.ai.yaml
  │   └── ...
  └── options/                  ← Configurable options
      ├── changelog/
      ├── code-review/
      ├── commit-message/
      ├── documentation/
      ├── git-workflow/
      ├── project-structure/
      └── testing/

locales/zh-TW/                  ← Traditional Chinese Translations
  ├── core/                     ← Translated Markdown
  └── ai/
      ├── standards/            ← Translated AI standards
      └── options/              ← Translated options
```

---

## Sync Hierarchy

```
core/*.md                       (Level 1 - Primary Source)
    ↓
ai/standards/*.ai.yaml          (Level 2 - AI Optimized)
    ↓
ai/options/*/*.ai.yaml          (Level 3 - Options, if applicable)
    ↓
locales/zh-TW/ai/standards/     (Level 4 - Translations)
locales/zh-TW/ai/options/
```

**Rule**: Always update from top to bottom. Never modify lower levels without updating the source first.

---

## When to Update

### Trigger Events

| Event | Action Required |
|-------|-----------------|
| `core/*.md` file modified | Update corresponding `ai/standards/*.ai.yaml` |
| `ai/standards/*.ai.yaml` references new options | Create new `ai/options/*/*.ai.yaml` |
| English AI file updated | Update `locales/zh-TW/ai/` translation |
| New `core/*.md` file added | Create new AI standard + translation |

---

## Update Workflow

### Step 1: Check Current Sync Status

```bash
# Run translation sync check
./scripts/check-translation-sync.sh zh-TW
```

### Step 2: Identify Changes in core/

```bash
# Check recent changes
git log --oneline core/ -10

# Compare versions
grep -E "^\*\*Version\*\*:|^version:" core/*.md | head -20
```

### Step 3: Update ai/standards/

For each modified `core/*.md`:

1. **Read the source file** to understand changes
2. **Update the corresponding `ai/standards/*.ai.yaml`**:
   - Update `meta.version` to match source
   - Update `meta.updated` to current date
   - Sync content changes (rules, examples, quick_reference, etc.)
3. **Check if new options are referenced**:
   - If `options:` section references non-existent files, create them

### Step 4: Update ai/options/ (if needed)

When a standard references new options:

```yaml
# Example: ai/standards/testing.ai.yaml references new option
options:
  testing_type:
    choices:
      - id: new-testing-type
        file: options/testing/new-testing-type.ai.yaml  # ← Create this
```

Create the new option file following existing patterns.

### Step 5: Update Translations

For each updated English file:

1. **Update `locales/zh-TW/ai/standards/*.ai.yaml`**
2. **Update `locales/zh-TW/ai/options/*/*.ai.yaml`** (if applicable)
3. **Ensure `meta.version` matches English source**

### Step 6: Verify Sync

```bash
# Run sync check again
./scripts/check-translation-sync.sh zh-TW

# Expected: All files [CURRENT]
```

---

## File Naming Conventions

### Standards

| Source | AI Standard |
|--------|-------------|
| `core/changelog-standards.md` | `ai/standards/changelog.ai.yaml` |
| `core/code-review-checklist.md` | `ai/standards/code-review.ai.yaml` |
| `core/commit-message-guide.md` | `ai/standards/commit-message.ai.yaml` |
| `core/anti-hallucination.md` | `ai/standards/anti-hallucination.ai.yaml` |

**Pattern**: Remove suffixes like `-standards`, `-guide`, `-checklist` for cleaner names.

### Options

```
ai/options/{category}/{option-name}.ai.yaml
```

Examples:
- `ai/options/testing/unit-testing.ai.yaml`
- `ai/options/git-workflow/github-flow.ai.yaml`
- `ai/options/project-structure/nodejs.ai.yaml`

---

## AI Standard File Structure

```yaml
# {Standard Name} - AI Optimized
# Source: core/{source-file}.md

id: {standard-id}
meta:
  version: "{x.y.z}"           # Must match source version
  updated: "{YYYY-MM-DD}"      # Last update date
  source: core/{source}.md     # Source file path
  description: {brief description}

# Optional: If standard has configurable options
options:
  {option_name}:
    description: {description}
    multiSelect: {true|false}
    choices:
      - id: {choice-id}
        file: options/{category}/{choice}.ai.yaml
        best_for: {use case}

# Main content sections (varies by standard)
rules:
  - id: {rule-id}
    trigger: {when to apply}
    instruction: {what to do}
    priority: {required|recommended}

# Quick reference tables
quick_reference:
  {table_name}:
    columns: [{col1}, {col2}, ...]
    rows:
      - [{val1}, {val2}, ...]
```

---

## Translation File Structure

Same as English, with additions:

```yaml
meta:
  version: "{x.y.z}"           # Must match English version
  updated: "{YYYY-MM-DD}"
  source: core/{source}.md
  description: {Chinese description}
  language: zh-TW              # ← Additional field
```

---

## Standards Without Options

These standards are universal rules and do not need configurable options:

| Standard | Reason |
|----------|--------|
| anti-hallucination | Universal AI behavior rules |
| checkin-standards | Universal code check-in rules |
| documentation-writing-standards | Universal documentation rules |
| spec-driven-development | Universal SDD workflow |
| test-completeness-dimensions | Universal testing dimensions |
| versioning | Universal versioning rules |
| error-codes | Universal error code format |
| logging | Universal logging rules |

---

## Standards With Options

| Standard | Option Category | Options Count |
|----------|-----------------|---------------|
| changelog | changelog/ | 2 |
| code-review | code-review/ | 3 |
| commit-message | commit-message/ | 3 |
| documentation-structure | documentation/ | 3 |
| git-workflow | git-workflow/ | 6 |
| project-structure | project-structure/ | 10 |
| testing | testing/ | 9 |

---

## Checklist for Updates

### When Updating a Single Standard

- [ ] Read `core/*.md` source to understand changes
- [ ] Update `ai/standards/*.ai.yaml` version and content
- [ ] Check if new options are referenced → create if needed
- [ ] Update `locales/zh-TW/ai/standards/*.ai.yaml`
- [ ] Update `locales/zh-TW/ai/options/` if applicable
- [ ] Run `./scripts/check-translation-sync.sh zh-TW`
- [ ] Verify all files show `[CURRENT]`

### When Adding a New Standard

- [ ] Create `core/{new-standard}.md`
- [ ] Create `ai/standards/{new-standard}.ai.yaml`
- [ ] Create `ai/options/{category}/` files if needed
- [ ] Create `locales/zh-TW/core/{new-standard}.md`
- [ ] Create `locales/zh-TW/ai/standards/{new-standard}.ai.yaml`
- [ ] Create `locales/zh-TW/ai/options/` translations if needed
- [ ] Run sync check

---

## Common Commands

```bash
# Check sync status
./scripts/check-translation-sync.sh zh-TW

# List all AI standards
ls ai/standards/*.yaml

# List all options
find ai/options -name "*.yaml" | sort

# Compare file counts
echo "EN standards: $(ls ai/standards/*.yaml | wc -l)"
echo "ZH standards: $(ls locales/zh-TW/ai/standards/*.yaml | wc -l)"
echo "EN options: $(find ai/options -name '*.yaml' | wc -l)"
echo "ZH options: $(find locales/zh-TW/ai/options -name '*.yaml' | wc -l)"

# Find options referenced but not existing
grep -rh "file:.*options/" ai/standards/*.yaml | \
  sed 's/.*file: //' | sort -u | \
  while read f; do [ ! -f "ai/$f" ] && echo "Missing: $f"; done
```

---

## Complete Sync Map by Core File

Below is the complete list of files that need to be updated when each `core/*.md` is modified.

---

### 1. anti-hallucination.md

**Complexity**: Simple (no options)

```
core/anti-hallucination.md                          ← SOURCE
├── locales/zh-TW/core/anti-hallucination.md
├── ai/standards/anti-hallucination.ai.yaml
├── locales/zh-TW/ai/standards/anti-hallucination.ai.yaml
└── skills/claude-code/ai-collaboration-standards/
    ├── SKILL.md
    ├── anti-hallucination.md
    └── locales/zh-TW/.../
```

**Files to update**: ~6 files

---

### 2. changelog-standards.md

**Complexity**: Medium (2 YAML options)

```
core/changelog-standards.md                         ← SOURCE
├── locales/zh-TW/core/changelog-standards.md
├── ai/standards/changelog.ai.yaml
├── locales/zh-TW/ai/standards/changelog.ai.yaml
├── ai/options/changelog/
│   ├── keep-a-changelog.ai.yaml
│   └── auto-generated.ai.yaml
├── locales/zh-TW/ai/options/changelog/
│   ├── keep-a-changelog.ai.yaml
│   └── auto-generated.ai.yaml
└── skills/claude-code/release-standards/
    ├── SKILL.md
    ├── changelog-format.md
    └── locales/zh-TW/.../
```

**Files to update**: ~12 files

---

### 3. checkin-standards.md

**Complexity**: Simple (no options)

```
core/checkin-standards.md                           ← SOURCE
├── locales/zh-TW/core/checkin-standards.md
├── ai/standards/checkin-standards.ai.yaml
├── locales/zh-TW/ai/standards/checkin-standards.ai.yaml
└── skills/claude-code/commit-standards/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**Files to update**: ~6 files

---

### 4. code-review-checklist.md

**Complexity**: Medium (3 YAML options)

```
core/code-review-checklist.md                       ← SOURCE
├── locales/zh-TW/core/code-review-checklist.md
├── ai/standards/code-review.ai.yaml
├── locales/zh-TW/ai/standards/code-review.ai.yaml
├── ai/options/code-review/
│   ├── pr-review.ai.yaml
│   ├── pair-programming.ai.yaml
│   └── automated-review.ai.yaml
├── locales/zh-TW/ai/options/code-review/
│   ├── pr-review.ai.yaml
│   ├── pair-programming.ai.yaml
│   └── automated-review.ai.yaml
└── skills/claude-code/code-review-assistant/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**Files to update**: ~14 files

---

### 5. commit-message-guide.md

**Complexity**: High (3 MD options + 3 YAML options)

```
core/commit-message-guide.md                        ← SOURCE
├── locales/zh-TW/core/commit-message-guide.md
├── ai/standards/commit-message.ai.yaml
├── locales/zh-TW/ai/standards/commit-message.ai.yaml
├── options/commit-message/
│   ├── english.md
│   ├── traditional-chinese.md
│   └── bilingual.md
├── locales/zh-TW/options/commit-message/
│   ├── english.md
│   ├── traditional-chinese.md
│   └── bilingual.md
├── ai/options/commit-message/
│   ├── english.ai.yaml
│   ├── traditional-chinese.ai.yaml
│   └── bilingual.ai.yaml
├── locales/zh-TW/ai/options/commit-message/
│   ├── english.ai.yaml
│   ├── traditional-chinese.ai.yaml
│   └── bilingual.ai.yaml
└── skills/claude-code/commit-standards/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**Files to update**: ~20 files

---

### 6. documentation-structure.md

**Complexity**: Medium (3 YAML options)

```
core/documentation-structure.md                     ← SOURCE
├── locales/zh-TW/core/documentation-structure.md
├── ai/standards/documentation-structure.ai.yaml
├── locales/zh-TW/ai/standards/documentation-structure.ai.yaml
├── ai/options/documentation/
│   ├── markdown-docs.ai.yaml
│   ├── api-docs.ai.yaml
│   └── wiki-style.ai.yaml
├── locales/zh-TW/ai/options/documentation/
│   ├── markdown-docs.ai.yaml
│   ├── api-docs.ai.yaml
│   └── wiki-style.ai.yaml
└── skills/claude-code/documentation-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**Files to update**: ~14 files

---

### 7. documentation-writing-standards.md

**Complexity**: Simple (no options)

```
core/documentation-writing-standards.md             ← SOURCE
├── locales/zh-TW/core/documentation-writing-standards.md
├── ai/standards/documentation-writing-standards.ai.yaml
├── locales/zh-TW/ai/standards/documentation-writing-standards.ai.yaml
└── skills/claude-code/documentation-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**Files to update**: ~6 files

---

### 8. error-code-standards.md

**Complexity**: Simple (no options, no skill)

```
core/error-code-standards.md                        ← SOURCE
├── locales/zh-TW/core/error-code-standards.md
├── ai/standards/error-codes.ai.yaml
└── locales/zh-TW/ai/standards/error-codes.ai.yaml
```

**Files to update**: ~4 files

---

### 9. git-workflow.md

**Complexity**: High (6 MD options + 6 YAML options)

```
core/git-workflow.md                                ← SOURCE
├── locales/zh-TW/core/git-workflow.md
├── ai/standards/git-workflow.ai.yaml
├── locales/zh-TW/ai/standards/git-workflow.ai.yaml
├── options/git-workflow/
│   ├── gitflow.md
│   ├── github-flow.md
│   ├── trunk-based.md
│   ├── merge-commit.md
│   ├── squash-merge.md
│   └── rebase-ff.md
├── locales/zh-TW/options/git-workflow/
│   └── (6 translated .md files)
├── ai/options/git-workflow/
│   └── (6 .ai.yaml files)
├── locales/zh-TW/ai/options/git-workflow/
│   └── (6 translated .ai.yaml files)
└── skills/claude-code/git-workflow-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**Files to update**: ~32 files

---

### 10. logging-standards.md

**Complexity**: Simple (no options, no skill)

```
core/logging-standards.md                           ← SOURCE
├── locales/zh-TW/core/logging-standards.md
├── ai/standards/logging.ai.yaml
└── locales/zh-TW/ai/standards/logging.ai.yaml
```

**Files to update**: ~4 files

---

### 11. project-structure.md

**Complexity**: Very High (5 MD options + 10 YAML options)

```
core/project-structure.md                           ← SOURCE
├── locales/zh-TW/core/project-structure.md
├── ai/standards/project-structure.ai.yaml
├── locales/zh-TW/ai/standards/project-structure.ai.yaml
├── options/project-structure/
│   ├── dotnet.md
│   ├── nodejs.md
│   ├── python.md
│   ├── java.md
│   └── go.md
├── locales/zh-TW/options/project-structure/
│   └── (5 translated .md files)
├── ai/options/project-structure/
│   ├── dotnet.ai.yaml
│   ├── nodejs.ai.yaml
│   ├── python.ai.yaml
│   ├── java.ai.yaml
│   ├── go.ai.yaml
│   ├── rust.ai.yaml      ← YAML only (no MD)
│   ├── kotlin.ai.yaml    ← YAML only (no MD)
│   ├── php.ai.yaml       ← YAML only (no MD)
│   ├── ruby.ai.yaml      ← YAML only (no MD)
│   └── swift.ai.yaml     ← YAML only (no MD)
├── locales/zh-TW/ai/options/project-structure/
│   └── (10 translated .ai.yaml files)
└── skills/claude-code/project-structure-guide/ (if exists)
```

**Files to update**: ~38 files

**Note**: 5 languages have both MD and YAML, 5 languages have YAML only.

---

### 12. spec-driven-development.md

**Complexity**: Simple (no options)

```
core/spec-driven-development.md                     ← SOURCE
├── locales/zh-TW/core/spec-driven-development.md
├── ai/standards/spec-driven-development.ai.yaml
└── locales/zh-TW/ai/standards/spec-driven-development.ai.yaml
```

**Files to update**: ~4 files

---

### 13. test-completeness-dimensions.md

**Complexity**: Simple (no options)

```
core/test-completeness-dimensions.md                ← SOURCE
├── locales/zh-TW/core/test-completeness-dimensions.md
├── ai/standards/test-completeness-dimensions.ai.yaml
├── locales/zh-TW/ai/standards/test-completeness-dimensions.ai.yaml
└── skills/claude-code/testing-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**Files to update**: ~6 files

---

### 14. testing-standards.md

**Complexity**: Very High (4 MD options + 9 YAML options)

```
core/testing-standards.md                           ← SOURCE
├── locales/zh-TW/core/testing-standards.md
├── ai/standards/testing.ai.yaml
├── locales/zh-TW/ai/standards/testing.ai.yaml
├── options/testing/
│   ├── unit-testing.md
│   ├── integration-testing.md
│   ├── system-testing.md
│   └── e2e-testing.md
├── locales/zh-TW/options/testing/
│   └── (4 translated .md files)
├── ai/options/testing/
│   ├── unit-testing.ai.yaml
│   ├── integration-testing.ai.yaml
│   ├── system-testing.ai.yaml
│   ├── e2e-testing.ai.yaml
│   ├── istqb-framework.ai.yaml    ← YAML only
│   ├── industry-pyramid.ai.yaml   ← YAML only
│   ├── security-testing.ai.yaml   ← YAML only
│   ├── performance-testing.ai.yaml← YAML only
│   └── contract-testing.ai.yaml   ← YAML only
├── locales/zh-TW/ai/options/testing/
│   └── (9 translated .ai.yaml files)
└── skills/claude-code/testing-guide/
    ├── SKILL.md
    ├── testing-pyramid.md
    └── locales/zh-TW/.../
```

**Files to update**: ~34 files

**Note**: 4 testing types have both MD and YAML, 5 have YAML only.

---

### 15. versioning.md

**Complexity**: Simple (no options)

```
core/versioning.md                                  ← SOURCE
├── locales/zh-TW/core/versioning.md
├── ai/standards/versioning.ai.yaml
├── locales/zh-TW/ai/standards/versioning.ai.yaml
└── skills/claude-code/release-standards/
    ├── SKILL.md
    ├── semantic-versioning.md
    └── locales/zh-TW/.../
```

**Files to update**: ~8 files

---

## Summary: Update Complexity by Standard

| Standard | Complexity | Est. Files | Has Options | Has Skill |
|----------|------------|------------|-------------|-----------|
| anti-hallucination | Simple | ~6 | ❌ | ✅ |
| changelog-standards | Medium | ~12 | ✅ 2 YAML | ✅ |
| checkin-standards | Simple | ~6 | ❌ | ✅ |
| code-review-checklist | Medium | ~14 | ✅ 3 YAML | ✅ |
| commit-message-guide | High | ~20 | ✅ 3 MD + 3 YAML | ✅ |
| documentation-structure | Medium | ~14 | ✅ 3 YAML | ✅ |
| documentation-writing-standards | Simple | ~6 | ❌ | ✅ |
| error-code-standards | Simple | ~4 | ❌ | ❌ |
| git-workflow | High | ~32 | ✅ 6 MD + 6 YAML | ✅ |
| logging-standards | Simple | ~4 | ❌ | ❌ |
| project-structure | Very High | ~38 | ✅ 5 MD + 10 YAML | ❌ |
| spec-driven-development | Simple | ~4 | ❌ | ❌ |
| test-completeness-dimensions | Simple | ~6 | ❌ | ✅ |
| testing-standards | Very High | ~34 | ✅ 4 MD + 9 YAML | ✅ |
| versioning | Simple | ~8 | ❌ | ✅ |

**Total**: ~208 files across all standards

---

## Update Order (Recommended)

When updating a single `core/*.md` file, follow this order:

```
1. core/{standard}.md                    ← Edit source first
2. locales/zh-TW/core/{standard}.md      ← Translate core
3. ai/standards/{standard}.ai.yaml       ← Update AI version
4. locales/zh-TW/ai/standards/...        ← Translate AI version
5. options/{category}/*.md               ← If MD options exist
6. locales/zh-TW/options/{category}/     ← Translate MD options
7. ai/options/{category}/*.ai.yaml       ← If YAML options exist
8. locales/zh-TW/ai/options/{category}/  ← Translate YAML options
9. skills/claude-code/{skill}/           ← Update related skill
10. locales/zh-TW/skills/...             ← Translate skill
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-12-30 | Added complete sync map for all 15 standards |
| 1.0.0 | 2025-12-30 | Initial maintenance guide |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
