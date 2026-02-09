---
description: |
  从项目来源生成使用说明文档。
  使用时机：「生成文档」、「创建速查表」、「使用指南」、「功能参考」、「列出所有功能」
  关键字：documentation, usage, reference, cheatsheet, features, 功能文档, 速查表, 使用说明
source: ../../../../skills/docs-generator/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
---

# 文档生成器技能

> **Language**: [English](../../../../skills/docs-generator/SKILL.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-26
**适用范围**: Claude Code Skills

---

## 用途

自动从项目来源文件生成完整的使用说明文档。此技能会创建：

1. **FEATURE-REFERENCE.md**：包含所有细节的完整功能文档
2. **CHEATSHEET.md**：单页速查表

支持多语言（英文、繁体中文、简体中文），并扫描各种来源：
- CLI 命令
- 斜线命令
- 技能
- 代理
- 工作流程
- 核心规范
- 脚本

## 快速参考

### 生成所有文档

```bash
node scripts/generate-usage-docs.mjs
```

### 生成特定语言

```bash
node scripts/generate-usage-docs.mjs --lang=en       # 仅英文
node scripts/generate-usage-docs.mjs --lang=zh-TW    # 繁体中文
node scripts/generate-usage-docs.mjs --lang=zh-CN    # 简体中文
```

### 生成特定格式

```bash
node scripts/generate-usage-docs.mjs --cheatsheet    # 仅速查表
node scripts/generate-usage-docs.mjs --reference     # 仅参考手册
```

### 检查同步状态

```bash
# 检查文档是否需要更新
node scripts/generate-usage-docs.mjs --check

# 或使用同步检查脚本
./scripts/check-usage-docs-sync.sh         # 检查
./scripts/check-usage-docs-sync.sh --fix   # 需要时修复
```

## 配置

生成器使用项目根目录的 `.usage-docs.yaml` 来定义：

- **输出路径**：文档生成位置
- **语言**：要生成的语言版本
- **来源**：要扫描的内容（CLI、技能、命令等）
- **模板**：文档结构模板

### 配置示例（多语言）

```yaml
# .usage-docs.yaml - 完整 UDS 配置
version: "1.0"
output:
  directory: "docs/"
  formats: [reference, cheatsheet]
  languages: [en, zh-TW, zh-CN]
  paths:
    en: "docs/"
    zh-TW: "locales/zh-TW/docs/"
    zh-CN: "locales/zh-CN/docs/"

sources:
  cli:
    enabled: true
    entry: "cli/bin/uds.js"
  skills:
    enabled: true
    directory: "skills/"
    pattern: "**/SKILL.md"
```

### 单语言项目

仅需要英文文档的项目：

```yaml
# .usage-docs.yaml - 仅英文
version: "1.0"
output:
  directory: "docs/"
  formats: [reference, cheatsheet]
  languages:
    - en
  paths:
    en: "docs/"

sources:
  cli:
    enabled: true
    entry: "src/cli.js"
```

### 自定义语言配置

不同语言需求的项目（例如：英文 + 日文）：

```yaml
# .usage-docs.yaml - 英文 + 日文
version: "1.0"
output:
  directory: "docs/"
  formats: [reference, cheatsheet]
  languages:
    - en
    - ja
  paths:
    en: "docs/"
    ja: "docs/ja/"

templates:
  reference:
    title:
      en: "My Project Reference"
      ja: "プロジェクトリファレンス"
  cheatsheet:
    title:
      en: "My Project Cheatsheet"
      ja: "チートシート"
```

### 配置 Fallback 行为

生成器实现智能 fallback 机制处理标题和路径：

| 优先顺序 | 来源 | 说明 |
|----------|------|------|
| 1 | `config[lang]` | 特定语言的配置值 |
| 2 | `config.en` | 配置中的英文 fallback |
| 3 | 内建默认值 | 支持语言的硬编码默认值 |

**内建支持的语言**：`en`、`zh-TW`、`zh-CN`

对于不支持的语言，您必须在 `templates` 区块中提供自定义标题。

## 输出文件

| 语言 | FEATURE-REFERENCE | CHEATSHEET |
|------|-------------------|------------|
| English | `docs/FEATURE-REFERENCE.md` | `docs/CHEATSHEET.md` |
| 繁體中文 | `locales/zh-TW/docs/FEATURE-REFERENCE.md` | `locales/zh-TW/docs/CHEATSHEET.md` |
| 简体中文 | `locales/zh-CN/docs/FEATURE-REFERENCE.md` | `locales/zh-CN/docs/CHEATSHEET.md` |

## 整合到发布前检查

将使用说明文档同步检查加入 `pre-release-check.sh`：

```bash
# 检查使用说明文档同步
echo "Checking usage documentation sync..."
./scripts/check-usage-docs-sync.sh
```

## 工作流程

```
┌─────────────────────────────────────────────────────────┐
│                      文档生成器                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. 加载配置 (.usage-docs.yaml)                         │
│           │                                              │
│           ▼                                              │
│  2. 扫描来源                                             │
│     ├─ CLI 命令 (uds.js)                                │
│     ├─ 技能 (SKILL.md 文件)                             │
│     ├─ 命令 (斜线命令)                                   │
│     ├─ 代理 (代理定义)                                   │
│     ├─ 工作流程 (工作流程文件)                           │
│     ├─ 核心规范 (core/*.md)                             │
│     └─ 脚本 (scripts/*.sh)                              │
│           │                                              │
│           ▼                                              │
│  3. 生成文档                                             │
│     ├─ FEATURE-REFERENCE.md（详细版）                   │
│     └─ CHEATSHEET.md（速查表）                          │
│           │                                              │
│           ▼                                              │
│  4. 输出各语言版本                                       │
│     ├─ 英文 (docs/)                                      │
│     ├─ 繁体中文 (locales/zh-TW/docs/)                   │
│     └─ 简体中文 (locales/zh-CN/docs/)                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 在其他项目使用

此技能设计为可重用。在你的项目中使用：

1. **复制配置模板**：
   ```bash
   cp .usage-docs.yaml your-project/.usage-docs.yaml
   ```

2. **修改为你的项目结构**：
   - 更新来源目录
   - 调整文件命名模式
   - 配置输出路径

3. **复制生成器脚本**：
   ```bash
   cp scripts/generate-usage-docs.mjs your-project/scripts/
   ```

4. **运行生成器**：
   ```bash
   node scripts/generate-usage-docs.mjs
   ```

## 相关规范

- [文档撰写规范](../../../../core/documentation-writing-standards.md)
- [文档结构规范](../../../../core/documentation-structure.md)
- [AI 友善架构](../../../../core/ai-friendly-architecture.md)

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-26 | 初始发布，支持多语言 |

---

## 授权

此技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
