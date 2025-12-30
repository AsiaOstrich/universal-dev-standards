# Spec Kit Integration
# Spec Kit 整合

This directory contains integration files for [Spec Kit](https://github.com/spec-kit/spec-kit), a lightweight specification tracking tool for spec-driven development.

本目錄包含 [Spec Kit](https://github.com/spec-kit/spec-kit) 的整合檔案，這是一個用於規格驅動開發的輕量級規格追蹤工具。

## Files | 檔案

| File | Description |
|------|-------------|
| `AGENTS.md` | Instructions for AI assistants using Spec Kit |

## Usage | 使用方式

### Manual Installation | 手動安裝

Copy `AGENTS.md` to your project or include its content in your AI assistant's system instructions.

將 `AGENTS.md` 複製到您的專案，或將其內容納入 AI 助手的系統指令中。

### With Claude Code

If using Claude Code, you can reference this file in your `CLAUDE.md`:

```markdown
## Spec-Driven Development

This project uses Spec Kit for specification management. Follow the guidelines in:
- [Spec Kit Instructions](integrations/spec-kit/AGENTS.md)
```

## Related | 相關資源

- [OpenSpec Integration](../openspec/) - Alternative SDD tool integration
- [Spec-Driven Development Standard](../../core/spec-driven-development.md) - SDD methodology

## Note | 備註

Spec Kit and OpenSpec are **specification-driven development tools**, not AI coding assistants. They are not included in the `uds init` AI tools selection, but can be manually integrated as needed.

Spec Kit 和 OpenSpec 是**規格驅動開發工具**，而非 AI 編程助手。它們不包含在 `uds init` 的 AI 工具選單中，但可依需求手動整合。
