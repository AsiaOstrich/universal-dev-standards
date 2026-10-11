---
source: ../../../../skills/commands/docs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 55ff9b202f90
status: current
---

---
name: docs
description: [UDS] Manage, guide, and generate documentation.
argument-hint: "[impact|translate|generate|readme|api] [options]"
---

# /docs 命令

管理、编写和生成专案文档。

## 用法

```bash
/docs [subcommand] [options]
```

### 子命令

| Subcommand | Description |
|------------|-------------|
| `impact` | 分析最近代码变更对文档的影响 |
| `translate` | 检查翻译状态或翻译文档 |
| `generate` | 生成文档产物（速查表、参考手册） |
| `readme` | 审查并更新 README.md |
| `api` | 从代码生成 API 文档 |
| `structure` | 检查文档文件夹结构 |
| `(none)` | 显示文档指南/状态 |

### Impact 选项

与 `/docs impact` 一起使用：

| Option | Description |
|--------|-------------|
| `--staged` | 仅分析已暂存（git add）的变更 |
| `--commit <ref>` | 分析指定 commit 或范围的变更 |
| （默认） | 分析所有未提交的变更 |

### Translate 选项

与 `/docs translate` 一起使用：

| Option | Description |
|--------|-------------|
| `<file>` | 翻译指定的源文件 |
| `--lang <lang>` | 目标语言（`zh-TW`、`zh-CN`） |
| `--check` | 仅检查翻译同步状态（不做修改） |
| `--all` | 翻译所有过时的文件 |
| （默认） | 显示翻译状态摘要 |

### Generate 选项

与 `/docs generate` 一起使用：

| Option | Description |
|--------|-------------|
| `--lang <lang>` | 语言（`en`、`zh-TW`、`zh-CN`） |
| `--cheatsheet` | 仅生成速查表 |
| `--reference` | 仅生成功能参考 |
| `--check` | 检查文档是否不同步 |

## 范例

```bash
# 分析当前变更对文档的影响
/docs impact

# 仅分析已暂存变更对文档的影响
/docs impact --staged

# 检查翻译同步状态
/docs translate --check

# 将指定文件翻译为 zh-TW
/docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW

# 翻译所有过时的文件
/docs translate --all --lang zh-TW

# 生成所有文档
/docs generate

# 更新 README
/docs readme

# 检查文档结构
/docs structure
```

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/docs` | 展示专案文档状态总览（哪些文档存在、是否过时） |
| `/docs impact` | 分析未提交的代码变更对文档的影响，列出受影响文档和建议命令 |
| `/docs impact --staged` | 只分析已 stage 的变更 |
| `/docs impact --commit <ref>` | 分析指定 commit 的变更影响 |
| `/docs translate` | 展示翻译状态摘要（哪些翻译过时、缺失） |
| `/docs translate <file>` | 翻译指定文档，根据 `output_language` 设置和 `locales/` 结构 |
| `/docs translate --check` | 只检查翻译状态，不做修改（等同 `check-translation-sync.sh`） |
| `/docs translate --all` | 翻译所有过时的文件 |
| `/docs generate` | 生成文档产物（速查表、参考手册） |
| `/docs generate --lang <lang>` | 生成指定语言的文档 |
| `/docs readme` | 审查并更新 README.md |
| `/docs api` | 从代码生成 API 文档 |
| `/docs structure` | 检查文档目录结构是否符合规范 |

### 交互脚本

**Decision: 子命令分派**
- IF `impact` → 执行文档影响分析（见下方 Impact 流程）
- IF `translate` → 执行翻译流程（见下方 Translate 流程）
- IF `generate` → 执行 `/docgen` 的生成流程
- IF `readme` → 分析 README 完整性，建议更新
- IF `api` → 扫描代码，生成 API 文档
- IF `structure` → 检查目录结构，报告缺失
- IF 无子命令 → 展示文档状态总览

#### Impact 流程

1. 获取变更清单（`git diff` 或 `git diff --staged` 或 `git diff <ref>`）
2. 对每个变更的文件，扫描哪些文档引用了它
3. 输出影响报告，格式：

```
📋 Documentation Impact Analysis
─────────────────────────────────
Modified: cli/src/commands/init.js, cli/src/prompts/init.js

Affected documents:
  README.md — describes CLI init options
    → /docs readme
  docs/CLI-INIT-OPTIONS.md — references promptOutputLanguage()
    → manual update or /docs generate
  locales/zh-TW/docs/CLI-INIT-OPTIONS.md — translation outdated
    → /docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW

No impact: ARCHITECTURE.md, API.md (not referenced)
```

🛑 **STOP**: 展示报告后等待用户选择要执行哪些更新

#### Translate 流程

1. IF `--check` 或无参数 → 扫描 `locales/` 目录，比对源文件版本
2. 输出翻译状态表：

```
📋 Translation Status (zh-TW)
─────────────────────────────
✅ current     core/commit-message-guide.md (v1.3.0)
⚠️  outdated   docs/CLI-INIT-OPTIONS.md (source v1.5.0, translation v1.4.0)
❌ missing     core/documentation-writing-standards.md (new sections added)
```

3. IF 指定 `<file>` 或 `--all` → 读取源文件和现有翻译，生成更新的翻译内容
4. 根据 `output_language` 设置决定翻译语言和风格

🛑 **STOP**: 展示翻译结果后等待用户确认写入

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| impact 报告展示后 | 选择要执行哪些更新 |
| translate 结果展示后 | 确认翻译内容写入 |
| generate/readme/api 结果展示后 | 确认写入 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 子命令无效 | 列出可用子命令 |
| 目标目录不存在 | 自动创建或询问用户 |
| 无代码可分析（api 子命令） | 告知并建议检查路径 |
| 无 git 历史（impact 子命令） | 告知需要 git 初始化 |
| locales/ 目录不存在（translate 子命令） | 告知专案未设置翻译结构 |
| 源文件未变更（translate 子命令） | 告知翻译已是最新 |

## 参考

*   [文档指南技能](../documentation-guide/SKILL.md)
*   [核心规范](../../core/documentation-writing-standards.md)
