---
source: ../../../../skills/docs-generator/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  从项目源文件生成使用文档（速查表、参考手册、使用指南）。
  使用时机：生成文档、建立速查表、生成参考手册。
  关键字：docgen, documentation, cheatsheet, reference, 文档生成, 速查表, 参考手册。
---

# 文档生成器

> **语言**: [English](../../../../skills/docs-generator/SKILL.md) | 简体中文

从项目源文件生成使用文档（速查表、参考手册、使用指南）。

## 工作流程

1. **读取配置** - 加载 `.usage-docs.yaml`（或指定的配置文件）
2. **扫描来源** - 读取源代码文件、命令和技能定义
3. **提取内容** - 从源代码解析描述、选项、示例
4. **生成文档** - 以配置的格式生成输出
5. **写入输出** - 将生成的文件保存到配置的输出目录

## 配置文件格式

```yaml
# .usage-docs.yaml
output_dir: docs/generated/
formats:
  - cheatsheet
  - reference
sources:
  - path: skills/commands/
    type: commands
  - path: cli/src/commands/
    type: cli
language: [en, zh-TW]
```

## 输出类型

| 类型 | 说明 |
|------|------|
| **cheatsheet** | 速查表，包含命令和快捷键 |
| **reference** | 完整功能参考手册，包含所有选项 |
| **usage-guide** | 新手入门使用指南 |

## 使用方式

- `/docgen` - 使用默认的 `.usage-docs.yaml` 生成文档
- `/docgen .usage-docs.yaml` - 从指定的配置文件生成文档
- `/docgen --format cheatsheet` - 仅生成速查表

## 参考

- 详细指南：[guide.md](./guide.md)
