# OpenSpec Integration
# OpenSpec 整合

This directory contains integration files for [OpenSpec](https://github.com/openspec), a specification management tool for spec-driven development.

本目錄包含 [OpenSpec](https://github.com/openspec) 的整合檔案，這是一個用於規格驅動開發的規格管理工具。

## Files | 檔案

| File | Description |
|------|-------------|
| `AGENTS.md` | Comprehensive instructions for AI assistants using OpenSpec |

## Usage | 使用方式

### Manual Installation | 手動安裝

Copy `AGENTS.md` to your project's `openspec/` directory, or include its content in your AI assistant's system instructions.

將 `AGENTS.md` 複製到您專案的 `openspec/` 目錄，或將其內容納入 AI 助手的系統指令中。

### With Claude Code

If using Claude Code, you can reference this file in your `CLAUDE.md`:

```markdown
## Spec-Driven Development

This project uses OpenSpec for specification management. Follow the guidelines in:
- [OpenSpec Instructions](openspec/AGENTS.md)
```

## Related | 相關資源

- [Spec Kit Integration](../spec-kit/) - Alternative lightweight SDD tool
- [Spec-Driven Development Standard](../../core/spec-driven-development.md) - SDD methodology

## Note | 備註

OpenSpec and Spec Kit are **specification-driven development tools**, not AI coding assistants. They are not included in the `uds init` AI tools selection, but can be manually integrated as needed.

OpenSpec 和 Spec Kit 是**規格驅動開發工具**，而非 AI 編程助手。它們不包含在 `uds init` 的 AI 工具選單中，但可依需求手動整合。
