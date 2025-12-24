# Spec-Driven Development (SDD) Standards
# 規格驅動開發 (SDD) 標準

**Version**: 1.1.0
**Last Updated**: 2025-12-24
**Applicability**: All projects adopting Spec-Driven Development
**適用範圍**: 所有採用規格驅動開發的專案

---

## Purpose | 目的

This standard defines the principles and workflows for Spec-Driven Development (SDD), ensuring that changes are planned, documented, and approved via specifications before implementation.

本標準定義規格驅動開發 (SDD) 的原則與工作流程，確保變更在實作前已經過規劃、記錄並透過規格核准。

**Key Benefits | 主要效益**:
- Reduced miscommunication between stakeholders and developers
- Clear audit trail for all changes
- Easier onboarding for new team members
- 減少利害關係人與開發者之間的溝通誤解
- 為所有變更提供清晰的審計軌跡
- 新成員更容易上手

---

## SDD Workflow | SDD 工作流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Proposal   │───▶│    Review    │───▶│Implementation│
│     提案     │    │     審查     │    │     實作     │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
                    ┌──────────────┐    ┌──────────────┐
                    │   Archive    │◀───│ Verification │
                    │     歸檔     │    │     驗證     │
                    └──────────────┘    └──────────────┘
```

### Workflow Stages | 工作流程階段

| Stage | Description | Artifacts | 說明 |
|-------|-------------|-----------|------|
| **Proposal** | Define what to change and why | `proposal.md` | 定義變更內容與原因 |
| **Review** | Stakeholder approval | Review comments, approval record | 利害關係人核准 |
| **Implementation** | Execute the approved spec | Code, tests, docs | 執行已核准的規格 |
| **Verification** | Confirm implementation matches spec | Test results, review | 確認實作符合規格 |
| **Archive** | Close and archive the spec | Archived spec with links to commits/PRs | 關閉並歸檔規格 |

---

## Core Principles | 核心原則

### 1. Priority of SDD Tool Commands | SDD 工具命令優先

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated and provides specific commands (e.g., slash commands like `/openspec` or `/spec`), AI assistants MUST prioritize using these commands over manual file editing.

**規則**: 當專案整合了 SDD 工具（如 OpenSpec, Spec Kit 等）且該工具提供特定命令（例如 `/openspec` 或 `/spec` 等斜線命令）時，AI 助手**必須優先使用這些命令**，而非直接手動編輯檔案。

**Rationale | 理由**:
- **Consistency**: Tools ensure the spec structure follows strict schemas.
- **Traceability**: Commands often handle logging, IDs, and linking automatically.
- **Safety**: Tools may have built-in validation preventing invalid states.

- **一致性**: 工具確保規格結構遵循嚴格的架構。
- **可追溯性**: 命令通常會自動處理日誌、ID 和連結。
- **安全性**: 工具可能有內建驗證以防止無效狀態。

**Example | 範例**:
- ✅ Use `/openspec proposal "Add Login"` instead of manually creating `changes/add-login/proposal.md`.
- ✅ 使用 `/openspec proposal "新增登入"` 取代手動建立 `changes/add-login/proposal.md`。

---

### 2. Methodology Over Tooling | 方法論優於工具

**Rule**: SDD is a methodology, not bound to a single tool. While OpenSpec is a common implementation, these standards apply to any SDD tool (e.g., Spec Kit).

**規則**: SDD 是一種方法論，不綁定於單一工具。雖然 OpenSpec 是常見的實作，但本標準適用於任何 SDD 工具（例如 Spec Kit）。

**Guidelines | 指引**:
- **Universal Flow**: Proposal -> Review -> Implementation -> Verification -> Archive.
- **通用流程**: 提案 -> 審查 -> 實作 -> 驗證 -> 歸檔。
- **Tool Adaptation**: Adapt to the specific commands and patterns of the active SDD tool in the workspace.
- **工具適應**: 適應工作區中啟用之 SDD 工具的特定命令與模式。

---

### 3. Spec First, Code Second | 先規格，後程式碼

**Rule**: No functional code changes shall be made without a corresponding approved specification or change proposal.

**規則**: 在沒有經核准的規格或變更提案的情況下，不得進行功能性的程式碼變更。

**Exceptions | 例外**:
- Critical hotfixes (restore service immediately, document later).
- Trivial changes (typos, comments, formatting).

**例外情況**:
- 關鍵熱修復（立即恢復服務，隨後補文件）。
- 瑣碎變更（錯字、註解、格式調整）。

---

## Spec Document Template | 規格文件範本

### Proposal Template | 提案範本

```markdown
# [SPEC-ID] Feature Title | 功能標題

## Summary | 摘要
Brief description of the proposed change.
簡述提議的變更。

## Motivation | 動機
Why is this change needed? What problem does it solve?
為何需要此變更？解決什麼問題？

## Detailed Design | 詳細設計
Technical approach, affected components, data flow.
技術方法、影響的元件、資料流程。

## Acceptance Criteria | 驗收條件
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies | 相依性
List any dependencies on other specs or external systems.
列出對其他規格或外部系統的相依性。

## Risks | 風險
Potential risks and mitigation strategies.
潛在風險及緩解策略。
```

---

## Integration with Other Standards | 與其他標準整合

### With Commit Message Guide | 與 Commit 訊息指南整合

When implementing an approved spec, reference the spec ID in commit messages:

實作已核准的規格時，在 commit 訊息中引用規格 ID：

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### With Check-in Standards | 與簽入標準整合

Before checking in code for a spec:
在為規格簽入程式碼前：

1. ✅ Spec is approved | 規格已核准
2. ✅ Implementation matches spec | 實作符合規格
3. ✅ Tests cover acceptance criteria | 測試涵蓋驗收條件
4. ✅ Spec ID referenced in PR | PR 中引用規格 ID

### With Code Review Checklist | 與程式碼審查清單整合

Reviewers should verify:
審查者應驗證：

- [ ] Change matches approved spec | 變更符合已核准的規格
- [ ] No scope creep beyond spec | 無超出規格範圍的變更
- [ ] Spec acceptance criteria met | 規格驗收條件已達成

---

## Common SDD Tools | 常見 SDD 工具

| Tool | Description | Command Examples |
|------|-------------|------------------|
| **OpenSpec** | Specification management | `/openspec proposal`, `/openspec approve` |
| **Spec Kit** | Lightweight spec tracking | `/spec create`, `/spec close` |
| **Manual** | No tool, file-based | Create `specs/SPEC-XXX.md` manually |

---

## Best Practices | 最佳實踐

### Do's | 應該做的

- ✅ Keep specs focused and atomic (one change per spec)
- ✅ Include clear acceptance criteria
- ✅ Link specs to implementation PRs
- ✅ Archive specs after completion
- ✅ 保持規格專注且原子化（每個規格一個變更）
- ✅ 包含明確的驗收條件
- ✅ 將規格連結到實作 PR
- ✅ 完成後歸檔規格

### Don'ts | 不應該做的

- ❌ Start coding before spec approval
- ❌ Modify scope during implementation without updating spec
- ❌ Leave specs in limbo (always close or archive)
- ❌ Skip verification step
- ❌ 在規格核准前開始編碼
- ❌ 實作期間修改範圍而不更新規格
- ❌ 讓規格處於懸而未決狀態（始終關閉或歸檔）
- ❌ 跳過驗證步驟

---

## Related Standards | 相關標準

- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範
- [Code Check-in Standards](checkin-standards.md) - 程式碼簽入標準
- [Code Review Checklist](code-review-checklist.md) - 程式碼審查清單
- [Documentation Structure](documentation-structure.md) - 文件結構標準

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-12-24 | Added: Workflow diagram, Spec template, Integration guide, Best practices, Related standards, License |
| 1.0.0 | 2025-12-23 | Initial SDD standard definition |

---

## References | 參考資料

- [OpenSpec Documentation](https://github.com/openspec)
- [Design Documents Best Practices](https://www.industrialempathy.com/posts/design-docs-at-google/)
- [ADR (Architecture Decision Records)](https://adr.github.io/)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
