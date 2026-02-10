# Core Standard Creation/Update Workflow Specification
# 核心規範建立/更新工作流程規格

**Feature ID**: WORKFLOW-001
**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Approved

> **Language**: English | [繁體中文](#chinese-version)

---

## Overview

This specification defines the complete workflow for creating or updating core standards in the Universal Development Standards (UDS) project. It ensures consistency, completeness, and proper integration across all project components.

本規格定義在 Universal Development Standards (UDS) 專案中建立或更新核心規範的完整工作流程，確保所有專案組件的一致性、完整性和正確整合。

---

## Motivation

### Problem Statement

1. Creating new core standards requires updates across 10+ file types and directories
2. Missing steps lead to sync check failures and incomplete features
3. No standardized checklist exists for AI assistants or human contributors
4. Translation and documentation updates are often forgotten

### Solution

Provide a comprehensive, step-by-step workflow specification that:
- Lists all required files and their purposes
- Defines the correct execution order
- Includes verification checkpoints
- Can be followed by both AI assistants and human developers

---

## User Story

```
As a UDS contributor (AI or human),
I want a clear workflow for creating/updating core standards,
So that I can ensure all components are properly integrated and synchronized.
```

---

## Acceptance Criteria

### AC-1: Compressed Standard (AI YAML) Creation
**Given** a new or updated core standard in `core/[name].md`
**When** the workflow is executed
**Then** a corresponding `ai/standards/[name].ai.yaml` file is created with:
  - Token-optimized format
  - All key concepts preserved
  - Proper YAML structure with rules, quick_reference, and related_standards

### AC-2: Skill Evaluation and Creation
**Given** a core standard
**When** evaluating skill applicability
**Then** create a skill if the standard:
  - Has interactive workflows (e.g., TDD, BDD, SDD)
  - Requires AI guidance during development
  - Benefits from contextual assistance
**And** skip skill creation if the standard is:
  - Pure reference documentation
  - Configuration-only (e.g., versioning, project-structure)

### AC-3: Command Evaluation and Creation
**Given** a skill is being created
**When** evaluating command applicability
**Then** create slash commands if the skill:
  - Has actionable workflows (e.g., `/derive-bdd`, `/commit`)
  - Can be triggered on-demand by users
  - Produces tangible outputs (files, reports, etc.)

### AC-4: Translation to All Locales
**Given** a core standard and its components
**When** the workflow is executed
**Then** translations are created for:
  - `locales/zh-TW/core/[name].md` (Traditional Chinese)
  - `locales/zh-CN/core/[name].md` (Simplified Chinese, if locale exists)
  - Skill translations in `locales/[locale]/skills/[skill]/`
  - With proper frontmatter (source, source_version, translation_version, status)

### AC-5: Documentation Updates
**Given** a new or updated core standard
**When** the workflow is executed
**Then** the following documentation is updated:
  - Related standards (add to "Related Standards" sections)
  - `skills/commands/README.md` (if commands added)
  - `STANDARDS-MAPPING.md` (if standard mapping changes)
  - `docs/OPERATION-WORKFLOW.md` (if workflow-related)
  - Standard's "Version History" section

### AC-6: CLI Integration
**Given** all components are created
**When** the workflow is executed
**Then** CLI integration is completed:
  - `cli/standards-registry.json` → `standards[]` array updated
  - `cli/standards-registry.json` → `skillFiles` mapping updated (if skill)
  - Test files updated if skill count changes
  - Verification scripts pass (`check-standards-sync.sh`, `check-translation-sync.sh`)

### AC-7: Verification Checkpoint
**Given** all steps are completed
**When** verification is run
**Then** all checks pass:
  - `./scripts/check-standards-sync.sh` → All OK
  - `./scripts/check-translation-sync.sh` → All current
  - `cd cli && npm test` → All tests pass

---

## Detailed Design

### Workflow Stages

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Core Standard Creation/Update Workflow                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1️⃣  CORE STANDARD                                                          │
│      ├── Create/update core/[name].md                                       │
│      └── Include: Purpose, Principles, Workflow, Examples, Version History  │
│                                                                              │
│  2️⃣  AI YAML (Compressed)                                                   │
│      ├── Create ai/standards/[name].ai.yaml                                 │
│      └── Include: id, meta, workflow, rules, quick_reference                │
│                                                                              │
│  3️⃣  SKILL EVALUATION                                                       │
│      ├── Is standard interactive/workflow-based? → Create skill             │
│      ├── Is standard reference-only? → Skip skill                           │
│      └── If skill: skills/[skill-name]/SKILL.md                 │
│                                                                              │
│  4️⃣  COMMAND EVALUATION                                                     │
│      ├── Does skill have actionable workflows? → Create commands            │
│      ├── Commands: skills/commands/[command].md                 │
│      └── Update: skills/commands/README.md                      │
│                                                                              │
│  5️⃣  TRANSLATIONS                                                           │
│      ├── locales/zh-TW/core/[name].md                                       │
│      ├── locales/zh-CN/core/[name].md (if exists)                           │
│      └── locales/[locale]/skills/[skill]/SKILL.md               │
│                                                                              │
│  6️⃣  DOCUMENTATION UPDATES                                                  │
│      ├── Update related standards' "Related Standards" sections             │
│      ├── Update commands/README.md (if commands added)                      │
│      ├── Update STANDARDS-MAPPING.md                                        │
│      └── Update docs/OPERATION-WORKFLOW.md (if workflow-related)            │
│                                                                              │
│  7️⃣  CLI INTEGRATION                                                        │
│      ├── cli/standards-registry.json → standards[] array                    │
│      ├── cli/standards-registry.json → skillFiles mapping                   │
│      └── Update test expectations if skill count changes                    │
│                                                                              │
│  8️⃣  VERIFICATION                                                           │
│      ├── ./scripts/check-standards-sync.sh                                  │
│      ├── ./scripts/check-translation-sync.sh                                │
│      └── cd cli && npm test                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### File Checklist

#### Required Files (All Standards)

| # | File | Purpose | Required |
|---|------|---------|----------|
| 1 | `core/[name].md` | Human-readable standard | ✅ Always |
| 2 | `ai/standards/[name].ai.yaml` | AI-optimized format | ✅ Always |
| 3 | `locales/zh-TW/core/[name].md` | Traditional Chinese | ✅ Always |
| 4 | `locales/zh-CN/core/[name].md` | Simplified Chinese | ⚠️ If locale exists |

#### Conditional Files (If Skill Created)

| # | File | Purpose | Required |
|---|------|---------|----------|
| 5 | `skills/[skill]/SKILL.md` | Skill definition | If interactive |
| 6 | `skills/commands/[cmd].md` | Slash commands | If actionable |
| 7 | `locales/zh-TW/skills/[skill]/SKILL.md` | Skill translation | If skill created |

#### Registry and Documentation Updates

| # | File | Action | Required |
|---|------|--------|----------|
| 8 | `cli/standards-registry.json` | Add to `standards[]` | ✅ Always |
| 9 | `cli/standards-registry.json` | Add to `skillFiles` | If skill created |
| 10 | `skills/commands/README.md` | Add command entries | If commands created |
| 11 | Related `core/*.md` files | Update "Related Standards" | ✅ Always |
| 12 | `cli/tests/commands/check.test.js` | Update skill count | If skill count changes |

### Skill Applicability Matrix

| Standard Type | Create Skill? | Create Commands? | Examples |
|---------------|---------------|------------------|----------|
| Interactive Workflow | ✅ Yes | ✅ Yes | TDD, BDD, SDD, Forward Derivation |
| AI Collaboration | ✅ Yes | ⚠️ Maybe | Anti-hallucination, Code Review |
| Reference Document | ❌ No | ❌ No | Versioning, Project Structure |
| Configuration Guide | ❌ No | ❌ No | Logging, Error Codes |
| Testing Standards | ✅ Yes | ⚠️ Maybe | Testing Guide, Coverage |

### Registry Entry Template

```json
{
  "id": "[standard-id]",
  "name": "[Standard Name]",
  "nameZh": "[標準名稱]",
  "source": {
    "human": "core/[name].md",
    "ai": "ai/standards/[name].ai.yaml"
  },
  "category": "skill|reference",
  "skillName": "[skill-name]",  // Only if skill created
  "level": 1|2|3,
  "description": "[Brief description]"
}
```

### Skill Files Mapping Template

```json
"skillFiles": {
  "[skill-name]": [
    "skills/[skill-name]/SKILL.md",
    "skills/[skill-name]/[component].md"
  ]
}
```

### Translation Frontmatter Template

```yaml
---
name: [skill-name]
description: |
  [Translation of description in target language]
source: ../../../../../../skills/[skill]/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-19
status: current
---
```

---

## Execution Order

### Recommended Sequence

1. **Phase 1: Core Creation**
   - Create/update `core/[name].md`
   - Create `ai/standards/[name].ai.yaml`

2. **Phase 2: Skill & Command Creation** (if applicable)
   - Evaluate skill applicability
   - Create `skills/[skill]/SKILL.md`
   - Create command files
   - Update `commands/README.md`

3. **Phase 3: Translation**
   - Create `locales/zh-TW/core/[name].md`
   - Create `locales/zh-CN/core/[name].md` (if exists)
   - Create skill translations (if skill created)

4. **Phase 4: Documentation Integration**
   - Update related standards' "Related Standards" sections
   - Update `STANDARDS-MAPPING.md`
   - Update `docs/OPERATION-WORKFLOW.md` (if applicable)

5. **Phase 5: CLI Integration**
   - Update `cli/standards-registry.json` → `standards[]`
   - Update `cli/standards-registry.json` → `skillFiles` (if skill)
   - Update test expectations (if skill count changes)

6. **Phase 6: Verification**
   - Run `./scripts/check-standards-sync.sh`
   - Run `./scripts/check-translation-sync.sh`
   - Run `cd cli && npm test`

---

## Out of Scope

- CLI code changes (registry handles integration automatically)
- Version bumping (separate release workflow)
- GitHub release creation
- npm publishing

---

## Dependencies

### Requires
- Existing UDS project structure
- Node.js >= 18.0.0 for tests
- Bash scripts in `scripts/` directory

### Integrates With
- `cli/standards-registry.json` - Central registry
- `docs/OPERATION-WORKFLOW.md` - Project workflow documentation
- CI/CD pipeline - Pre-commit hooks run verification

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation | Medium | Medium | Translation sync check in pre-commit |
| Registry mismatch | Low | High | Standards sync check in pre-commit |
| Test count mismatch | Medium | Medium | Pre-commit runs all tests |
| Incomplete documentation | Medium | Low | Checklist in this spec |

---

## Related Specifications

- [Forward Derivation](./forward-derivation.md) - Example of full workflow execution
- [Reverse Engineering Standards](../../../core/reverse-engineering-standards.md) - Another workflow-based standard

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2026-01-25 | Status: Draft → Approved |
| 1.0.0 | 2026-01-19 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

<a id="chinese-version"></a>
# 中文版本

## 概述

本規格定義在 Universal Development Standards (UDS) 專案中建立或更新核心規範的完整工作流程。

## 工作流程階段

1. **核心規範建立** - `core/[name].md`
2. **AI YAML 壓縮** - `ai/standards/[name].ai.yaml`
3. **Skill 評估** - 是否需要建立 Skill?
4. **命令評估** - 是否需要建立斜線命令?
5. **翻譯** - zh-TW, zh-CN
6. **文件更新** - 相關規範、README
7. **CLI 整合** - standards-registry.json
8. **驗證** - 同步檢查腳本

## 檔案清單

### 必要檔案

| 檔案 | 用途 |
|------|------|
| `core/[name].md` | 人類可讀規範 |
| `ai/standards/[name].ai.yaml` | AI 優化格式 |
| `locales/zh-TW/core/[name].md` | 繁體中文翻譯 |

### 條件檔案（如建立 Skill）

| 檔案 | 用途 |
|------|------|
| `skills/[skill]/SKILL.md` | Skill 定義 |
| `skills/commands/[cmd].md` | 斜線命令 |

### 整合更新

| 檔案 | 動作 |
|------|------|
| `cli/standards-registry.json` | 新增至 `standards[]` 和 `skillFiles` |
| `commands/README.md` | 新增命令說明 |
| 相關 `core/*.md` | 更新「Related Standards」章節 |

## 驗證指令

```bash
./scripts/check-standards-sync.sh
./scripts/check-translation-sync.sh
cd cli && npm test
```
