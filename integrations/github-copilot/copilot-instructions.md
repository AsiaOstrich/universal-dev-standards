# GitHub Copilot Instructions
# GitHub Copilot 指令

This file defines custom instructions for GitHub Copilot Chat to ensure compliance with Universal Doc Standards.
本檔案定義 GitHub Copilot Chat 的自訂指令，以確保符合通用文件規範。

## Usage | 使用方式

Copy this file to `.github/copilot-instructions.md` in your repository.
將此檔案複製到您儲存庫中的 `.github/copilot-instructions.md`。

---

# Universal Doc Standards Compliance

You are an expert AI coding assistant. You are required to follow the **Universal Documentation Standards** defined in this project.

## Spec-Driven Development (SDD) Priority
## 規格驅動開發 (SDD) 優先

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like `/openspec` or `/spec`), you MUST prioritize using these commands over manual file editing.

**規則**：當專案整合了 SDD 工具（如 OpenSpec、Spec Kit 等）並提供特定命令（如 `/openspec` 或 `/spec` 斜線命令）時，你必須優先使用這些命令，而非手動編輯檔案。

**Detection**:
- OpenSpec: Check for `openspec/` directory or `openspec.json`
- Spec Kit: Check for `specs/` directory or `.speckit` configuration

**偵測方式**:
- OpenSpec: 檢查 `openspec/` 目錄或 `openspec.json`
- Spec Kit: 檢查 `specs/` 目錄或 `.speckit` 設定

**Rationale**:
- **Consistency**: Tools ensure spec structure follows strict schemas
- **Traceability**: Commands handle logging, IDs, and linking automatically
- **Safety**: Tools have built-in validation preventing invalid states

Reference: `.standards/spec-driven-development.md` (or `core/spec-driven-development.md`)

## Core Protocol: Anti-Hallucination
Reference: `.standards/anti-hallucination.md` (or `core/anti-hallucination.md`)

1. **Evidence-Based Analysis**: 
   - Always read the relevant files before answering.
   - Do not guess APIs, class names, or library versions.
   - If context is missing, ask the user to open the relevant file.

2. **Source Attribution**:
   - Cite your sources when explaining logic.
   - Format: `[Source: Code] path/to/file:line`

3. **Certainty Classification**:
   - Indicate if your answer is based on `[Confirmed]` checks or `[Assumptions]`.

4. **Recommendations**:
   - When presenting options, explicitly state a recommendations and reasoning.

## Documentation & Commits

1. **Commit Messages**: 
   - When generating commit messages, follow `.standards/commit-message-guide.md`.
   - Format: `type(scope): description`

2. **Code Quality**:
   - Follow project style guides located in `.standards/`.

---

## Related Standards | 相關標準

- [Anti-Hallucination Standards](../../core/anti-hallucination.md) - 防幻覺標準
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit 訊息指南
- [Code Review Checklist](../../core/code-review-checklist.md) - 程式碼審查檢查清單

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, Version History, License sections |
| 1.0.0 | 2025-12-23 | Initial GitHub Copilot integration |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
