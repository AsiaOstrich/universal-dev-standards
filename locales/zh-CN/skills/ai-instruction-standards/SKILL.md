---
source: ../../../../skills/ai-instruction-standards/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
scope: partial
description: |
  创建和维护 AI 指令文件（CLAUDE.md、.cursorrules 等）并采用适当结构。
  使用时机：创建 AI 指令文件、区分通用与项目特定规则、配置 AI 工具。
  关键字：CLAUDE.md, cursorrules, windsurfrules, clinerules, AI instructions, system prompt, 指令文件, AI 设定.
---

# AI 指令文件标准指南

> **语言**: [English](../../../../skills/ai-instruction-standards/SKILL.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-25
**适用范围**: Claude Code Skills

---

> **核心标准**: 本技能实现 [AI 指令文件标准](../../../../core/ai-instruction-standards.md)。完整方法论文档请参阅核心标准。

## 目的

本技能协助创建和维护 AI 指令文件，适当区分通用标准与项目特定配置。

## 快速参考

### 支持的 AI 工具

| AI 工具 | 指令文件 | 格式 |
|---------|----------|------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | Markdown |
| Windsurf | `.windsurfrules` | Markdown |
| Cline | `.clinerules` | Markdown |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| OpenCode | `.opencode/instructions.md` | Markdown |

### 核心原则：通用 vs 项目特定

| 类型 | 包含内容 | 示例 |
|------|----------|------|
| **通用** | 通用规则 | 「提交前运行测试」 |
| **项目特定** | 具体命令 | 「提交前运行 `npm test`」 |

### 建议配置

```markdown
# [项目名称] - AI 指令

## 通用标准
<!-- 适用于任何项目的规则 -->
- Commit 消息格式
- 代码审查清单
- 测试标准
- 反幻觉规则

---

## 项目特定配置
<!-- 此项目独有的设置 -->

### 技术栈
[你的技术在此]

### 快速命令
[你的构建/测试/部署命令]

### 文件结构
[你的项目结构]
```

## 详细指南

完整标准请参阅：
- [AI 指令文件标准](../../../../core/ai-instruction-standards.md)

### AI 优化格式（Token 效率）

AI 助手可使用 YAML 格式文件以减少 Token 使用：
- 基础标准：`ai/standards/ai-instruction-standards.ai.yaml`

## 内容指南

### 通用内容（保持通用）

| 类别 | 良好示例 |
|------|----------|
| **提交标准** | 「遵循 Conventional Commits 格式」 |
| **代码审查** | 「使用 BLOCKING、IMPORTANT、SUGGESTION 前缀」 |
| **测试** | 「维持最低 80% 覆盖率」 |
| **AI 行为** | 「分析前务必先读取代码」 |

**通用区段应避免：**
- 特定命令（`npm test`、`pytest`）
- 固定路径（`cli/src/`、`/var/www/`）
- 版本号（`Node.js 18`、`Python 3.11`）
- 项目名称和 URL

### 项目特定内容

| 类别 | 示例 |
|------|------|
| **技术栈** | Node.js 18、React 18、PostgreSQL 15 |
| **命令** | `npm run lint`、`./scripts/deploy.sh` |
| **文件结构** | `src/`、`cli/`、`tests/` |
| **团队惯例** | 繁体中文注释 |

## 标签惯例

### 选项 A：区段标题

```markdown
## 通用标准
[通用内容]

## 项目特定配置
[项目特定内容]
```

### 选项 B：行内标记

```markdown
> ⚠️ **项目特定**：本区段包含此项目独有的配置。

### 技术栈
...
```

### 选项 C：注释标注

```markdown
<!-- 通用：以下适用于所有项目 -->
### Commit 消息格式
...

<!-- 项目特定：为你的项目自定义 -->
### 快速命令
...
```

## 多工具配置

使用多个 AI 工具时，保持一致性：

```
project/
├── CLAUDE.md              # Claude Code 指令
├── .cursorrules           # Cursor 指令（可从 CLAUDE.md 导入）
├── .windsurfrules         # Windsurf 指令
└── .github/
    └── copilot-instructions.md  # Copilot 指令
```

**最佳实践**：创建共用的 `docs/ai-standards.md` 并从各工具文件引用，避免重复。

## 维护检查清单

提交 AI 指令文件变更前：

- [ ] 通用区段不包含项目特定的路径、命令或版本
- [ ] 项目特定区段有明确标记
- [ ] 标准文档的交叉引用正确
- [ ] 格式与现有区段一致

---

## 配置侦测

本技能支持项目特定配置。

### 侦测顺序

1. 检查是否存在 `CLAUDE.md` 或等效文件
2. 分析内容结构是否区分通用/项目特定
3. 若未找到，**建议创建结构化 AI 指令文件**

### 首次设置

若未找到 AI 指令文件：

1. 询问：「此项目没有 AI 指令文件。是否要创建一个？」
2. 确定项目类型和技术栈
3. 生成包含适当区段的模板
4. 若包含敏感信息，添加到 `.gitignore`

---

## 相关标准

- [AI 指令文件标准](../../../../core/ai-instruction-standards.md) - 核心标准
- [文档撰写标准](../../../../core/documentation-writing-standards.md) - 撰写指南
- [反幻觉规范](../../../../core/anti-hallucination.md) - AI 准确性规则
- [AI 友善架构](../../../../core/ai-friendly-architecture.md) - 上下文优化

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-25 | 初始发布 |

---

## 授权

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
