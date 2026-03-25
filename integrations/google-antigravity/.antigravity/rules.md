# Universal Development Standards
# 通用開發標準

This project follows the Universal Doc Standards to ensure high-quality, hallucination-free code and documentation.

本專案遵循通用文件規範，以確保高品質、無幻覺的程式碼與文件。

---

## Spec-Driven Development (SDD) Priority
## 規格驅動開發 (SDD) 優先

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like `/openspec` or `/sdd`), you MUST prioritize using these commands over manual file editing.

**規則**：當專案中整合了 SDD 工具（如 OpenSpec、Spec Kit 等）並提供特定命令時（例如 `/openspec` 或 `/sdd` 等斜線命令），你必須優先使用這些命令，而非手動編輯檔案。

**Detection | 偵測方式**:
- OpenSpec: Check for `openspec/` directory or `openspec.json`
- Spec Kit: Check for `specs/` directory or `.speckit` configuration

**Rationale | 原因**:
- **Consistency**: Tools ensure spec structure follows strict schemas | 工具確保規格結構遵循嚴格的 schema
- **Traceability**: Commands handle logging, IDs, and linking automatically | 命令自動處理日誌、ID 和連結
- **Safety**: Tools have built-in validation preventing invalid states | 工具內建驗證以防止無效狀態

Reference: `core/spec-driven-development.md`

---

## Anti-Hallucination Protocol
## 防幻覺協議

Reference: `core/anti-hallucination.md`

### 1. Evidence-Based Analysis | 證據基礎分析

- You MUST read files before analyzing them.
- Do NOT guess APIs, class names, or library versions.
- If you haven't seen the code, state: "I need to read [file] to confirm".

- 在分析檔案之前，你必須先讀取檔案。
- 不要猜測 API、類別名稱或函式庫版本。
- 如果你還沒看過程式碼，請說明：「我需要讀取 [檔案] 來確認」。

### 2. Source Attribution | 來源標註

Every factual claim about the code MUST cite sources:
- Code: `[Source: Code] path/to/file:line`
- External docs: `[Source: External] http://url (Accessed: Date)`

每個關於程式碼的事實陳述都必須標註來源：
- 程式碼：`[來源: 程式碼] 路徑/檔案:行號`
- 外部文件：`[來源: 外部] http://網址 (存取日期: 日期)`

### 3. Certainty Classification | 確定性分類

Use tags to indicate confidence level:
- `[Confirmed]` - Verified from source | 已從來源驗證
- `[Inferred]` - Logically deduced | 邏輯推論
- `[Assumption]` - Reasonable guess | 合理假設
- `[Unknown]` - Cannot determine | 無法確定

### 4. Recommendations | 建議

When presenting options, you MUST explicitly state a "Recommended" choice with reasoning.

當提供選項時，你必須明確說明「推薦」的選擇及其理由。

---

## Workflow Enforcement Gates
## 工作流程強制閘門

**CRITICAL**: Before executing any workflow phase command, you MUST check prerequisites.
**關鍵規則**：在執行任何工作流程階段命令前，你必須檢查前置條件。

### Session Start Protocol / Session 啟動協議
At session start, check for active workflows: `ls .workflow-state/*.yaml 2>/dev/null`
If active workflows found → inform user and offer to resume.

### Phase Gates / 階段閘門

| Workflow | Phase | Prerequisite | On Failure |
|---------|-------|-------------|------------|
| SDD | implement | Spec status = Approved | → `/sdd approve` |
| SDD | verify | All ACs have code + tests | → `/sdd implement` |
| TDD | GREEN | Failing test exists | → Stay in RED |
| TDD | REFACTOR | All tests passing | → Stay in GREEN |
| BDD | AUTOMATION | `.feature` file exists | → FORMULATION |
| Commit | feat/fix | Check active specs | → Suggest `Refs: SPEC-XXX` |

**NEVER** write implementation code before a failing test exists (TDD).
**NEVER** write step definitions before `.feature` files exist (BDD).

Reference: `.standards/workflow-enforcement.ai.yaml`

---

## AI Response Navigation / AI 回應導航

**Rule**: Every substantive AI response MUST end with a Navigation Footer suggesting next steps.
**規則**：每個實質性的 AI 回應結尾必須包含導航區塊，建議下一步行動。

**Key behaviors / 關鍵行為**:
- Append navigation suggestions after completing tasks, providing analysis, asking questions, or reporting errors
- Mark the recommended option with ⭐ when providing multiple choices
- Use contextual templates (task completed, user question, error/failure, in progress, informational reply)
- Adapt option count to context (1-5, never exceed 5)
- Prefer slash commands in suggestions when applicable

**豁免 / Exemption**: Ultra-short confirmations ("OK", "Done") may omit navigation.

Reference: `.standards/ai-response-navigation.ai.yaml` (or `core/ai-response-navigation.md`)

---

## Documentation & Commits
## 文件與提交

### Commit Messages | Commit 訊息

Follow Conventional Commits format (reference: `core/commit-message-guide.md`):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, chore, test, refactor, style

### File Structure | 檔案結構

Follow documentation structure guidelines (reference: `core/documentation-structure.md`).

### Quality Gates | 品質檢查

Before finishing, verify work against `core/checkin-standards.md`:
- [ ] Code compiles successfully
- [ ] All tests pass
- [ ] No hardcoded secrets
- [ ] Documentation updated if applicable

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-09 | Initial project rules file |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
