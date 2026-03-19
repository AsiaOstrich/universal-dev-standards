---
source: ../../../../skills/commands/docgen.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
name: docgen
description: "[UDS] Generate usage documentation from project sources"
argument-hint: "[config file | 配置文件]"
---

# 文档生成器

从专案原始文件生成使用文档（速查表、参考手册、使用指南）。

## 用法

```bash
/docgen [config file]
```

## 工作流程

1. **读取配置** - 加载 `.usage-docs.yaml`（或指定的配置文件）
2. **扫描来源** - 读取原始文件、命令和技能定义
3. **提取内容** - 从来源中解析描述、选项、范例
4. **生成文档** - 以配置的格式产生输出
5. **写入输出** - 将生成的文件保存到配置的输出目录

## 输出类型

| 类型 | 说明 |
|------|------|
| **cheatsheet** | 速查表，列出命令与快捷方式 |
| **reference** | 完整功能参考手册含所有选项 |
| **usage-guide** | 新手入门的逐步使用指南 |

## 范例

```bash
/docgen                          # 使用默认 .usage-docs.yaml 生成文档
/docgen .usage-docs.yaml         # 从指定配置文件生成文档
/docgen --format cheatsheet      # 仅生成速查表
```

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

## 参考

*   [文档生成器技能](../docs-generator/SKILL.md)
