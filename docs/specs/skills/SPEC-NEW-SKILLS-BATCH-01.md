# [SPEC-NEW-SKILLS-BATCH-01] New Skills Batch: Security, API Design, Database, CI/CD, Incident, PR, Scan, Metrics, Durable, Migration

**Priority**: P1
**Status**: Implemented
**Last Updated**: 2026-03-24
**Feature ID**: SKILL-BATCH-001
**Dependencies**: Corresponding core standards (security-standards.md, api-design-standards.md, database-standards.md, pipeline-integration-standards.md, deployment-standards.md)

---

## Summary / 摘要

Add 10 new AI skills to fill the gap between existing core standards and interactive AI-guided workflows. These skills provide structured guidance for security review, API design, database management, CI/CD pipeline design, incident response, PR automation, security scanning, development metrics, durable execution, and code migration.

新增 10 個 AI 技能，填補現有核心標準與互動式 AI 引導工作流程之間的缺口。這些技能提供安全審查、API 設計、資料庫管理、CI/CD 管線設計、事故回應、PR 自動化、安全掃描、開發指標、持久執行與程式碼遷移的結構化引導。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. UDS has 56 core standards but only 30 skills — 11 standards lack corresponding interactive skills.
2. Users cannot get AI-guided workflows for security, API design, database, CI/CD, or incident response.
3. WORKFLOW-GAPS.md identified CI/CD (GAP-001) and Incident Response (GAP-002) as CRITICAL gaps.
4. No skills exist for PR lifecycle management, security scanning automation, development metrics tracking, workflow failure recovery, or code migration guidance.

### Solution / 解決方案

Create 10 new skills, each with 5 platform files (canonical + Claude + Gemini + zh-TW + zh-CN = 50 files total):

| # | Skill | Command | Scope | Core Standard |
|---|-------|---------|-------|---------------|
| 1 | Security Assistant | `/security` | universal | security-standards.md |
| 2 | API Design Assistant | `/api-design` | universal | api-design-standards.md |
| 3 | Database Assistant | `/database` | universal | database-standards.md |
| 4 | CI/CD Pipeline Assistant | `/ci-cd` | universal | pipeline-integration-standards.md |
| 5 | Incident Response Assistant | `/incident` | universal | deployment-standards.md |
| 6 | PR Automation Assistant | `/pr` | universal | code-review-checklist.md |
| 7 | Security Scan Assistant | `/scan` | universal | security-standards.md |
| 8 | Metrics Dashboard Assistant | `/metrics` | universal | — (new capability) |
| 9 | Durable Execution Assistant | `/durable` | partial | — (new capability) |
| 10 | Migration Assistant | `/migrate` | universal | refactoring-standards.md |

---

## Acceptance Criteria / 驗收條件

### AC-1: Each Skill Has 5 Platform Files

**Given** a new skill is created
**When** the files are checked
**Then** each skill has exactly 5 files:
- `skills/{name}/SKILL.md` (canonical, bilingual EN + zh-TW)
- `.claude/skills/{name}/SKILL.md` (zh-TW with source frontmatter)
- `.gemini/skills/{name}/SKILL.md` (zh-TW with source frontmatter)
- `locales/zh-TW/skills/{name}/SKILL.md` (zh-TW locale)
- `locales/zh-CN/skills/{name}/SKILL.md` (zh-CN locale)

### AC-2: Consistent Skill Structure

**Given** any new skill SKILL.md
**When** its content is examined
**Then** it contains: YAML frontmatter (name, scope, description, allowed-tools, argument-hint), Purpose section, Quick Reference/Checklist, Workflow section, Usage examples, Next Steps Guidance, Reference links, Version History, and License.

### AC-3: Standards-with-Skills Gap Reduced

**Given** the 10 new skills are created
**When** the gap analysis is re-run
**Then** the number of "standards without skills" is reduced from 11 to ≤ 4.

### AC-4: GAP-001 and GAP-002 Addressed

**Given** `/ci-cd` and `/incident` skills are created
**When** the WORKFLOW-GAPS.md is reviewed
**Then** GAP-001 (CI/CD Pipeline) and GAP-002 (Incident Response) are addressed with interactive AI skills.

### AC-5: Correct Scope Classification

**Given** each new skill
**When** scope is checked
**Then** skills implementing universal standards are marked `scope: universal`, and skills with UDS-specific implementation details are marked `scope: partial`.

---

## Technical Design / 技術設計

### File Structure Per Skill

```
skills/{skill-name}/SKILL.md          # Canonical (bilingual)
.claude/skills/{skill-name}/SKILL.md  # Claude (zh-TW + source tracking)
.gemini/skills/{skill-name}/SKILL.md  # Gemini (zh-TW + source tracking)
locales/zh-TW/skills/{skill-name}/SKILL.md  # zh-TW locale
locales/zh-CN/skills/{skill-name}/SKILL.md  # zh-CN locale
```

### Frontmatter Convention

Canonical:
```yaml
---
name: {command-name}
scope: universal|partial
description: |
  {English multi-line description with keywords}
allowed-tools: Read, Grep, Glob
argument-hint: "[hint EN | hint zh-TW]"
---
```

Claude/Gemini translations:
```yaml
---
source: ../../../../skills/{skill-name}/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
name: {command-name}
scope: universal|partial
description: "[UDS] {zh-TW description}"
allowed-tools: Read, Grep, Glob
argument-hint: "[hint EN | hint zh-TW]"
---
```

---

## Test Plan / 測試計畫

- [ ] Verify all 50 files exist (10 skills × 5 platforms)
- [ ] Verify YAML frontmatter is valid in all files
- [ ] Verify cross-references (Next Steps → existing skills) are correct
- [ ] Verify `check-scope-sync.sh` passes
- [ ] Verify `check-translation-sync.sh` detects no missing translations

---

## Implementation Status / 實作狀態

| Skill | Status | Files Created |
|-------|--------|---------------|
| `/security` | ✅ Implemented | 5/5 |
| `/api-design` | ✅ Implemented | 5/5 |
| `/database` | ✅ Implemented | 5/5 |
| `/ci-cd` | ✅ Implemented | 5/5 |
| `/incident` | ✅ Implemented | 5/5 |
| `/pr` | ✅ Implemented | 5/5 |
| `/scan` | ✅ Implemented | 5/5 |
| `/metrics` | ✅ Implemented | 5/5 |
| `/durable` | ✅ Implemented | 5/5 |
| `/migrate` | ✅ Implemented | 5/5 |

**Total**: 50 files created, 2026-03-24
