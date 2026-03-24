# SPEC-SDD-ALIGN: /sdd Skill 功能對齊 OpenSpec + Spec Kit

**Status**: Archived
**Created**: 2026-03-23 (retroactive)
**Implemented**: 2026-03-23

---

## Summary

強化 UDS 的 `/sdd` skill，將 OpenSpec（v1.2.0）和 Spec Kit（v0.4.0）兩套外部 SDD 工具的功能優點吸收到 UDS 自有的 SDD 體驗中，確保 UDS 功能不缺。同時更新整合檔案以反映外部工具的實際 CLI。

## Motivation

- UDS 的 `/sdd` skill 缺少 OpenSpec 和 Spec Kit 各自擁有的多項功能特性
- 在 5.0.0 正式版發布前，需確保 UDS 的 SDD 體驗完整、功能不遺漏
- 整合檔案中 Spec Kit 的指令（`/sdd create` 等）與實際工具 CLI 完全不符，存在誤導

## Requirements

### Requirement: SDD Workflow 擴展
UDS 的 SDD 工作流程 SHALL 從 5 階段（Create→Review→Approve→Implement→Verify）擴展為 7 階段（Discuss→Create→Review→Approve→Implement→Verify→Archive）。

#### Scenario: 使用者啟動 /sdd
- **GIVEN** 使用者在任何 UDS 專案中
- **WHEN** 執行 `/sdd`
- **THEN** 看到包含 Discuss 和 Archive 階段的 7 階段工作流程

### Requirement: Decision Tree 指引
/sdd skill SHALL 提供決策樹，幫助使用者判斷何時需要建立 spec、何時可直接修改。

#### Scenario: Bug fix 不需要 spec
- **GIVEN** 使用者遇到恢復規格行為的 Bug
- **WHEN** 參考決策樹
- **THEN** 被引導直接修復，無需建立 spec

#### Scenario: 新功能需要 spec
- **GIVEN** 使用者要新增功能
- **WHEN** 參考決策樹
- **THEN** 被引導建立提案

### Requirement: Discuss 階段包含治理原則與結構化釐清
Discuss 階段 SHALL 引導使用者建立治理原則（inspired by Spec Kit /constitution）並使用結構化釐清流程（inspired by Spec Kit /clarify）。

#### Scenario: 首次建立專案規格
- **GIVEN** 專案尚未定義治理原則
- **WHEN** 進入 Discuss 階段
- **THEN** 引導使用者定義專案慣例、約束和不可妥協事項

#### Scenario: 需求不明確
- **GIVEN** 需求存在歧義
- **WHEN** 進入 Discuss 階段
- **THEN** 使用結構化釐清表（Question→Options→Decision→Rationale）逐一解決

### Requirement: Simplicity First 原則
guide.md SHALL 包含 Simplicity First 原則和複雜度觸發條件，防止過度工程。

#### Scenario: 評估是否需要抽象層
- **GIVEN** 開發者考慮加入抽象層
- **WHEN** 參考 Simplicity First 指引
- **THEN** 看到需要 3+ 個具體使用案例的證據要求

### Requirement: Scenario 格式規範
SKILL.md SHALL 定義 Scenario 的撰寫格式規範，確保跨專案一致性。

#### Scenario: 撰寫場景
- **GIVEN** 使用者在規格中撰寫場景
- **WHEN** 參考格式規範
- **THEN** 使用 `#### Scenario:` (h4 header) 和 GIVEN/WHEN/THEN 格式

### Requirement: Delta Operations
SKILL.md SHALL 提供 Delta Operations 說明，用於修改現有規格時的結構化變更描述。

#### Scenario: 修改現有規格
- **GIVEN** 需要修改已存在的規格
- **WHEN** 使用 Delta Operations
- **THEN** 使用 ADDED/MODIFIED/REMOVED/RENAMED Requirements 區段

### Requirement: Session Start Protocol 與 Workflow Gates
guide.md SHALL 包含 Session Start Protocol（檢查進行中工作）和 Workflow Enforcement Gates（階段先決條件檢查）。

#### Scenario: 會話開始
- **GIVEN** AI 助手開始新會話
- **WHEN** 執行 Session Start Protocol
- **THEN** 檢查 `docs/specs/`、`specs/`、`openspec/changes/` 或 `.specify/` 中的進行中工作

#### Scenario: 未核准就嘗試實作
- **GIVEN** 規格狀態不是 Approved
- **WHEN** 嘗試進入 Implementation 階段
- **THEN** 被 Workflow Gate 攔截，要求先取得核准

### Requirement: 命名規範
guide.md SHALL 定義 Spec ID、Change ID 和 Capability 的命名規範。

#### Scenario: 建立新的 Change ID
- **GIVEN** 使用者要建立新變更
- **WHEN** 參考命名規範
- **THEN** 使用 kebab-case、動詞開頭格式（如 `add-two-factor-auth`）

### Requirement: 整合檔案反映實際工具 CLI
OpenSpec 和 Spec Kit 的 AGENTS.md SHALL 反映各自外部工具的實際 CLI 指令。

#### Scenario: 使用 OpenSpec
- **GIVEN** 專案使用 OpenSpec
- **WHEN** 參考 AGENTS.md
- **THEN** 看到 `openspec view`、`openspec status`、`openspec schemas` 等 v1.2.0 完整指令

#### Scenario: 使用 Spec Kit
- **GIVEN** 專案使用 Spec Kit
- **WHEN** 參考 AGENTS.md
- **THEN** 看到 `specify init`、`/specify`、`/clarify`、`/plan`、`/tasks`、`/implement` 等實際指令，而非虛構的 `/sdd` 指令

## Acceptance Criteria

- [x] AC-1: SKILL.md 包含 TL;DR Quick Checklist
- [x] AC-2: SKILL.md 包含 Decision Tree
- [x] AC-3: Workflow 擴展為 7 階段（含 Discuss 和 Archive）
- [x] AC-4: SKILL.md 包含 Scenario 格式規則
- [x] AC-5: SKILL.md 包含 Delta Operations
- [x] AC-6: guide.md 包含 Session Start Protocol
- [x] AC-7: guide.md 包含 Workflow Enforcement Gates
- [x] AC-8: guide.md 包含 Discuss 階段（治理原則 + 結構化釐清）
- [x] AC-9: guide.md 包含 Simplicity First + Complexity Triggers
- [x] AC-10: guide.md 包含命名規範
- [x] AC-11: guide.md 包含 Implementation 階段強化
- [x] AC-12: guide.md 包含 Requirement Wording 規範
- [x] AC-13: guide.md 修正 Common SDD Tools 表格
- [x] AC-14: .claude/ 和 .gemini/ 版本同步
- [x] AC-15: zh-TW 和 zh-CN 翻譯同步
- [x] AC-16: OpenSpec AGENTS.md 更新至 v1.2.0 CLI
- [x] AC-17: Spec Kit AGENTS.md 更新至實際 specify CLI
- [x] AC-18: 翻譯同步檢查通過（0 outdated）
- [x] AC-19: 標準同步檢查通過

## Technical Design

### 修改的檔案

| 類別 | 檔案 | 變更 |
|------|------|------|
| 英文源檔 | `skills/spec-driven-dev/SKILL.md` | 新增 6 個區塊 |
| 英文源檔 | `skills/spec-driven-dev/guide.md` | 新增 9 個區塊，版本 1.1.0→1.2.0 |
| Claude Code | `.claude/skills/spec-driven-dev/SKILL.md` | zh-TW 同步 |
| Claude Code | `.claude/skills/spec-driven-dev/guide.md` | zh-TW 同步 |
| Gemini | `.gemini/skills/spec-driven-dev/SKILL.md` | zh-TW 同步 |
| Gemini | `.gemini/skills/spec-driven-dev/guide.md` | zh-TW 同步 |
| 翻譯 | `locales/zh-TW/skills/spec-driven-dev/SKILL.md` | zh-TW 同步 |
| 翻譯 | `locales/zh-TW/skills/spec-driven-dev/guide.md` | zh-TW 同步 |
| 翻譯 | `locales/zh-CN/skills/spec-driven-dev/SKILL.md` | zh-CN 同步 |
| 翻譯 | `locales/zh-CN/skills/spec-driven-dev/guide.md` | zh-CN 同步 |
| 整合 | `integrations/openspec/AGENTS.md` | 新增 CLI 指令 + flags |
| 整合 | `integrations/spec-kit/AGENTS.md` | 完整重寫 |
| 翻譯 | `locales/zh-TW/integrations/openspec/AGENTS.md` | 同步更新 |
| 翻譯 | `locales/zh-CN/integrations/openspec/AGENTS.md` | 同步更新 |
| 翻譯 | `locales/zh-TW/integrations/spec-kit/AGENTS.md` | 完整重寫 |
| 翻譯 | `locales/zh-CN/integrations/spec-kit/AGENTS.md` | 完整重寫 |

### 功能來源追溯

| 功能 | 來自 OpenSpec | 來自 Spec Kit | UDS 原有 |
|------|:---:|:---:|:---:|
| TL;DR Quick Checklist | ✅ | | |
| Decision Tree | ✅ | | |
| 7 階段 Workflow | ✅ | ✅ | 部分 |
| Scenario 格式規範 | ✅ | | |
| Delta Operations | ✅ | | |
| Session Start Protocol | ✅ | ✅ | |
| Workflow Gates | ✅ | ✅ | |
| 治理原則 (Constitution) | | ✅ | |
| 結構化釐清 (Clarify) | | ✅ | |
| Simplicity First | ✅ | | |
| 命名規範 | ✅ | | |
| Implementation 強化 | | ✅ | |
| Requirement Wording | ✅ | | |

## Verification

- [x] `./scripts/check-translation-sync.sh` — 0 outdated, 0 missing
- [x] `./scripts/check-standards-sync.sh` — All consistent

## Notes

- 此為 retroactive spec，實作已於 2026-03-23 完成
- 外部工具資訊（OpenSpec v1.2.0、Spec Kit v0.4.0）來自網路搜尋，已標記 [UNVERIFIED]
- 未修改 `core/spec-driven-development.md` 和 `.standards/spec-driven-development.ai.yaml`，因為新增的功能屬於 skill 層級的實作細節，非核心方法論變更
