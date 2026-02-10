---
source: ../../../../integrations/openspec/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenSpec 集成

本目录包含 [OpenSpec](https://github.com/openspec) 的集成文件，这是一个用于规格驱动开发的规格管理工具。

## 文件

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | 使用 OpenSpec 的 AI 助手完整指令 |

## 使用方式

### 手动安装

将 `AGENTS.md` 复制到项目的 `openspec/` 目录，或将其内容包含在 AI 助手的系统指令中。

### 搭配 Claude Code

如果使用 Claude Code，您可以在 `CLAUDE.md` 中引用此文件：

```markdown
## 规格驱动开发

本项目使用 OpenSpec 进行规格管理。请遵循以下指南：
- [OpenSpec 指令](openspec/AGENTS.md)
```

## 相关资源

- [Spec Kit 集成](../spec-kit/) - 替代的轻量级 SDD 工具
- [规格驱动开发规范](../../../../core/spec-driven-development.md) - SDD 方法论

## 注意事项

OpenSpec 和 Spec Kit 是**规格驱动开发工具**，不是 AI 编码助手。它们不包含在 `uds init` 的 AI 工具选择中，但可以根据需要手动集成。
