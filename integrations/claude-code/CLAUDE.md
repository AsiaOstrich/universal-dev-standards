# Project Guidelines for Claude Code

> **Language**: English | [繁體中文](CLAUDE.md) (See bilingual content below)

**Version**: 1.0.0
**Last Updated**: 2026-01-29

This document defines the development standards and AI interaction guidelines for this project.

---

## Core Standards Usage Rule
## 核心標準使用規則

> **Core Standards Usage Rule**:
> When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the concise rules in `core/` (e.g., `core/testing-standards.md`).
> **ONLY** read `core/guides/` or `methodologies/guides/` when explicitly asked for educational content, detailed explanations, or tutorials.
> This ensures token efficiency and focused context.

**核心標準使用規則**：
> 當驗證標準、檢查程式碼或執行任務時，**優先**讀取 `core/` 中的精簡規則（例如 `core/testing-standards.md`）。
> 只有在被明確要求提供教育內容、詳細解釋或教學時，才讀取 `core/guides/` 或 `methodologies/guides/`。
> 這確保了 Token 效率和上下文聚焦。

---

## Conversation Language / 對話語言

- **All conversations should be conducted in Traditional Chinese (繁體中文)** unless otherwise requested.
- AI 助手應以繁體中文回覆使用者的問題與請求。

---

## Development Standards / 開發標準

### 1. Spec-Driven Development (SDD) Priority / 規格驅動開發優先

**Rule**: When an SDD tool (OpenSpec, Spec Kit) is integrated, prioritize using its commands over manual file editing.
**規則**：當整合了 SDD 工具時，優先使用其命令而非手動編輯檔案。

Reference: `core/spec-driven-development.md`

### 2. Anti-Hallucination / 防幻覺規範

**Protocol**:
1. **Read First**: Always read files before analyzing code.
2. **Cite Sources**: `[Source: path/file:line]`
3. **Certainty Tags**: `[Confirmed]`, `[Inferred]`, `[Assumption]`

Reference: `core/anti-hallucination.md`

### 3. Testing Standards / 測試規範

Follow the testing pyramid defined in `core/testing-standards.md`.

- **Unit Tests (70%)**: Fast, isolated
- **Integration Tests (20%)**: Component interaction
- **E2E Tests (10%)**: User flows

### 4. Code Review / 程式碼審查

Verify work against `core/code-review-checklist.md` before finishing tasks.

### 5. Dual-Layer Workflow (UDS v2) / 雙層工作流

**Protocol**:
1. **Simulate**: Before acting, try `uds simulate -s <id> -i <content>` (e.g., commit message).
2. **Implement**: Write code or documentation.
3. **Validate**: Run `uds check --standard <id>` (or rely on pre-commit hook) to ensure compliance.

**協議**：
1. **模擬**：行動前，嘗試 `uds simulate -s <id> -i <content>`（例如提交訊息）。
2. **實作**：撰寫程式碼或文件。
3. **驗證**：執行 `uds check --standard <id>`（或依賴 pre-commit hook）確保合規。

---

## Quick Commands / 快速指令

```bash
# Run tests
npm test

# Linting
npm run lint
```

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
