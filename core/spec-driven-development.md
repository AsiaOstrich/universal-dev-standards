# Spec-Driven Development (SDD) Standards
# 規格驅動開發 (SDD) 標準

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Applicability**: All projects adopting Spec-Driven Development
**適用範圍**: 所有採用規格驅動開發的專案

---

## Purpose | 目的

This standard defines the principles and workflows for Spec-Driven Development (SDD), ensuring that changes are planned, documented, and approved via specifications before implementation.

本標準定義規格驅動開發 (SDD) 的原則與工作流程，確保變更在實作前已經過規劃、記錄並透過規格核准。

---

## Core Principles | 核心原則

### 1. Priority of SDD Tool Commands | SDD 工具命令優先

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated and provides specific commands (e.g., slash commands like `/openspec` or `/spec`), AI assistants MUST prioritize using these commands over manual file editing.

**規則**: 當專案整合了 SDD 工具（如 OpenSpec, Spec Kit 等）且該工具提供特定命令（例如 `/openspec` 或 `/spec` 等斜線命令）時，AI 助手**必須優先使用這些命令**，而非直接手動編輯檔案。

**Rationale | 理由**:
- **Consistency**: Tools ensure the spec structure follows strict schemas.
- **Traceability**: Commands often handle logging, IDs, and linking automatically.
- **Safety**: Tools may have built-in validation preventing invalid states.

**一致性**: 工具確保規格結構遵循嚴格的架構。
**可追溯性**: 命令通常會自動處理日誌、ID 和連結。
**安全性**: 工具可能有內建驗證以防止無效狀態。

**Example | 範例**:
- ✅ Use `/openspec proposal "Add Login"` instead of manually creating `changes/add-login/proposal.md`.
- ✅ 使用 `/openspec proposal "新增登入"` 取代手動建立 `changes/add-login/proposal.md`。

---

## 2. Methodology Over Tooling | 方法論優於工具

**Rule**: SDD is a methodology, not bound to a single tool. While OpenSpec is a common implementation, these standards apply to any SDD tool (e.g., Spec Kit).

**規則**: SDD 是一種方法論，不綁定於單一工具。雖然 OpenSpec 是常見的實作，但本標準適用於任何 SDD 工具（例如 Spec Kit）。

**Guidelines | 指引**:
- **Universal Flow**: Proposal -> Review -> Implementation -> Verification -> Archive.
- **通用流程**: 提案 -> 審查 -> 實作 -> 驗證 -> 歸檔。
- **Tool Adaptation**: Adapt to the specific commands and patterns of the active SDD tool in the workspace.
- **工具適應**: 適應工作區中啟用之 SDD 工具的特定命令與模式。

---

## 3. Spec First, Code Second | 先規格，後程式碼

**Rule**: No functional code changes shall be made without a corresponding approved specification or change proposal.

**規則**: 在沒有經核准的規格或變更提案的情況下，不得進行功能性的程式碼變更。

**Exceptions | 例外**:
- Critical hotfixes (restore service immediately, document later).
- Trivial changes (typos, comments, formatting).

**例外情況**:
- 關鍵熱修復（立即恢復服務，隨後補文件）。
- 瑣碎變更（錯字、註解、格式調整）。

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-23 | Initial SDD standard definition |
