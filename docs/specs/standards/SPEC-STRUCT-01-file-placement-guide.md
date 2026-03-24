# [SPEC-STRUCT-01] File Placement Decision Guide | 檔案歸檔決策指南

**Priority**: P1
**Status**: Archived
**Created**: 2026-03-04
**Last Updated**: 2026-03-04
**Feature ID**: STD-STRUCT-001
**Scope**: universal
**Dependencies**: core/project-structure.md, core/documentation-structure.md

---

## Summary | 摘要

A decision framework that answers "where should this file go?" for code, documentation, configuration, and assets. Provides a master decision tree, reverse lookup index, terminology disambiguation (utils vs helpers vs shared), and development artifact lifecycle management.

一個回答「這個檔案該放哪裡？」的決策框架，涵蓋程式碼、文件、設定檔和資源。提供主決策樹、反向查詢索引、術語辨析（utils vs helpers vs shared）、以及開發中間產物生命週期管理。

---

## Motivation | 動機

### Problem Statement | 問題陳述

1. **Development artifacts have no home** — Brainstorms, RFCs, POC reports, and technical investigations are created during development but `docs/` only defines formal document types. These artifacts either clutter the root or get lost.

2. **Document placement is ambiguous** — When creating a new document, developers must guess: does an ADR go in `docs/ADR/` or `docs/decisions/`? Does a troubleshooting guide go in `docs/` or alongside the code?

3. **Code directory terminology is confusing** — `utils/`, `helpers/`, `shared/`, `common/`, `lib/`, `internal/` all sound similar. Without clear definitions, teams create inconsistent structures.

4. **No dynamic decision guidance** — Existing standards describe the skeleton (what directories exist) but not the decision process (given a new file, which directory should it go to).

---

1. **開發中間產物無處可歸** — 開發過程中產生的 brainstorm、RFC、POC 報告、技術調查，在 `docs/` 只定義正式文件類型的情況下無處安放，最終散落各處或遺失。

2. **文件歸屬模糊** — 建立新文件時，開發者必須猜測：ADR 放 `docs/ADR/` 還是 `docs/decisions/`？疑難排解指南放 `docs/` 還是程式碼旁邊？

3. **程式碼目錄術語混淆** — `utils/`、`helpers/`、`shared/`、`common/`、`lib/`、`internal/` 聽起來都很相似。缺乏明確定義導致團隊建立不一致的結構。

4. **缺乏動態決策指引** — 現有規範描述骨架（有哪些目錄）但不描述決策過程（給定一個新檔案，應該放到哪個目錄）。

---

## User Stories | 使用者故事

### US-1: Developer places a new feature file | 開發者歸檔新功能檔案

As a developer adding a new feature, I want clear guidance on where to place each file (source, test, config, docs), so that my PR follows project conventions without guesswork.

身為新增功能的開發者，我希望有明確的指引告訴我每個檔案（原始碼、測試、設定、文件）該放哪裡，讓我的 PR 無需猜測即符合專案慣例。

### US-2: Developer places development artifacts | 開發者安置開發中間產物

As a developer who created a brainstorm document, RFC, or POC report, I want a designated location for these working documents, so that they don't clutter formal documentation but remain discoverable.

身為建立了 brainstorm 文件、RFC 或 POC 報告的開發者，我希望這些工作文件有專屬位置，不會弄亂正式文件但仍可被找到。

### US-3: Developer chooses between similar directories | 開發者在相似目錄間做選擇

As a developer creating a utility function, I want to understand the difference between `utils/`, `helpers/`, `shared/`, and `lib/`, so that I choose the correct directory.

身為建立工具函式的開發者，我希望理解 `utils/`、`helpers/`、`shared/` 和 `lib/` 的差異，以選擇正確的目錄。

### US-4: Developer does reverse lookup | 開發者進行反向查詢

As a developer with a specific file type (e.g., Dockerfile, migration script, test fixture), I want to look up where it should go by file type, so that I don't need to read the entire structure standard.

身為擁有特定檔案類型（例如 Dockerfile、migration script、test fixture）的開發者，我希望能按檔案類型查詢歸屬位置，無需閱讀整份結構規範。

---

## Acceptance Criteria | 驗收條件

### AC-1: Master decision tree covers four categories | 主決策樹涵蓋四大類

**Given** a user has a file to place in a project,
**When** they follow the master decision tree,
**Then** the tree guides them through four top-level branches (Code, Documentation, Configuration, Asset) to a specific directory.

**Given** 使用者有一個檔案需要歸檔，
**When** 他們遵循主決策樹，
**Then** 決策樹透過四個頂層分支（程式碼、文件、設定、資源）引導至特定目錄。

### AC-2: Reverse lookup index covers 30+ file types | 反向查詢索引涵蓋 30+ 檔案類型

**Given** a user knows their file type but not its destination,
**When** they consult the reverse lookup index,
**Then** they find their file type mapped to a specific directory with at least 30 common types covered.

**Given** 使用者知道檔案類型但不知目的地，
**When** 他們查閱反向查詢索引，
**Then** 能找到檔案類型對應的特定目錄，至少涵蓋 30 種常見類型。

### AC-3: Development artifacts have lifecycle management | 開發中間產物有生命週期管理

**Given** a working document (brainstorm, RFC, POC, investigation),
**When** it is created,
**Then** it has a designated directory under `docs/working/`, a required status header, and a documented graduation path to formal documentation.

**Given** 一份工作文件（brainstorm、RFC、POC、調查），
**When** 它被建立時，
**Then** 它有 `docs/working/` 下的專屬目錄、必要的狀態標頭、以及通往正式文件的畢業路徑。

### AC-4: Source code terminology is disambiguated | 原始碼術語已辨析

**Given** a developer is unsure whether to use `utils/`, `helpers/`, `shared/`, `common/`, `lib/`, or `internal/`,
**When** they read the terminology disambiguation section,
**Then** they can determine the correct directory based on statelessness, scope, and reusability criteria.

**Given** 開發者不確定該用 `utils/`、`helpers/`、`shared/`、`common/`、`lib/` 還是 `internal/`，
**When** 他們閱讀術語辨析段落，
**Then** 能根據無狀態性、範圍和可重用性標準判斷正確的目錄。

### AC-5: Backward compatible with existing standards | 與現有規範向後相容

**Given** the existing project-structure.md and documentation-structure.md standards,
**When** the new file placement guidance is added,
**Then** it extends (not contradicts) existing directory definitions, and existing projects remain compliant.

**Given** 現有的 project-structure.md 和 documentation-structure.md 規範，
**When** 新增檔案歸檔指引時，
**Then** 它擴展（而非矛盾）現有目錄定義，現有專案仍然合規。

### AC-6: AI YAML standards are synchronized | AI YAML 規範已同步

**Given** the core standards are updated with new sections,
**When** the changes are complete,
**Then** the corresponding `.standards/*.ai.yaml` files include the new rules and structures.

**Given** 核心規範已更新新段落，
**When** 變更完成時，
**Then** 對應的 `.standards/*.ai.yaml` 檔案包含新的規則和結構。

---

## Technical Design | 技術設計

### Deliverables | 產出物

| # | Deliverable | Type | Path |
|---|-------------|------|------|
| 1 | Source Code Organization Terminology | Section in existing standard | `core/project-structure.md` §New |
| 2 | Configuration Files Placement | Section in existing standard | `core/project-structure.md` §New |
| 3 | Generated Code Placement | Section in existing standard | `core/project-structure.md` §New |
| 4 | Development Artifacts Directory | Section in existing standard | `core/documentation-structure.md` §New |
| 5 | Expanded Document Types Matrix | Section in existing standard | `core/documentation-structure.md` §New |
| 6 | File Placement Decision Guide | New guide document | `core/guides/file-placement-guide.md` |
| 7 | AI YAML Updates | Modified YAML files | `.standards/project-structure.ai.yaml`, `.standards/documentation-structure.ai.yaml` |
| 8 | Skill Update | Modified skill | `skills/project-structure-guide/SKILL.md` |

### Modification Scope | 修改範圍

| File | Action | Version Change |
|------|--------|----------------|
| `core/project-structure.md` | Add 3 sections before Anti-Patterns | 1.1.0 → 1.2.0 |
| `core/documentation-structure.md` | Add 2 sections before Related Standards | 1.3.0 → 1.4.0 |
| `core/guides/file-placement-guide.md` | New file | 1.0.0 |
| `.standards/project-structure.ai.yaml` | Add new rules | Update meta.updated |
| `.standards/documentation-structure.ai.yaml` | Add working_documents structure | Update meta.updated |
| `skills/project-structure-guide/SKILL.md` | Add file placement triggers | 1.0.0 → 1.1.0 |

---

## Out of Scope | 不在範圍內

- **Language-specific deep structures** — Already covered by project-structure.md's per-language sections.
- **Monorepo cross-package placement** — Already covered by monorepo section in project-structure.md.
- **File naming conventions** — Already covered by documentation-structure.md's naming section.
- **CI/CD pipeline design** — Deployment standards handle this separately.

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-04 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
