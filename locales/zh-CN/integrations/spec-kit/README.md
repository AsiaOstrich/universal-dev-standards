---
source: ../../../../integrations/spec-kit/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Spec Kit 集成

本目录包含 [Spec Kit](https://github.com/spec-kit/spec-kit) 的集成文件，这是一个用于规格驱动开发的轻量级规格追踪工具。

## 文件

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | 使用 Spec Kit 的 AI 助手指令 |

## 使用方式

### 手动安装

将 `AGENTS.md` 复制到您的项目，或将其内容包含在 AI 助手的系统指令中。

### 搭配 Claude Code

如果使用 Claude Code，您可以在 `CLAUDE.md` 中引用此文件：

```markdown
## 规格驱动开发

本项目使用 Spec Kit 进行规格管理。请遵循以下指南：
- [Spec Kit 指令](integrations/spec-kit/AGENTS.md)
```

## 相关资源

- [OpenSpec 集成](../openspec/) - 替代的 SDD 工具集成
- [规格驱动开发规范](../../../../core/spec-driven-development.md) - SDD 方法论

## 注意事项

Spec Kit 和 OpenSpec 是**规格驱动开发工具**，不是 AI 编码助手。它们不包含在 `uds init` 的 AI 工具选择中，但可以根据需要手动集成。
