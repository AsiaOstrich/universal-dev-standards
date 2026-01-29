---
source: ../../../integrations/github-copilot/README.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-01-13
status: current
---

# GitHub Copilot 集成

本目录提供将通用开发规范与 [GitHub Copilot](https://github.com/features/copilot) 集成的资源。

## 概述

GitHub Copilot 是内置于 GitHub 和主流 IDE 的 AI 编程助手。此集成提供自定义指令，帮助 Copilot 生成更高质量、符合规范的代码与文档。

## 资源

| 文件 | 说明 |
|------|------|
| **[copilot-instructions.md](./copilot-instructions.md)** | Copilot Chat 自定义指令 |
| **[COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md)** | Chat 提示模板 |
| **[skills-mapping.md](./skills-mapping.md)** | Skills 对照表 |

## 快速开始

### 方式一：项目级别（推荐）

将指令文件复制到项目：

```bash
# 创建 .github 目录（如果不存在）
mkdir -p .github

# 复制指令文件
cp integrations/github-copilot/copilot-instructions.md .github/copilot-instructions.md
```

### 方式二：使用 curl 下载

```bash
mkdir -p .github
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/github-copilot/copilot-instructions.md
```

### 方式三：使用 UDS CLI

```bash
# 安装 UDS CLI
npm install -g universal-dev-standards

# 初始化并选择 Copilot 集成
uds init
# 在提示时选择 "GitHub Copilot"
```

## 配置方式

### VS Code

1. 安装 [GitHub Copilot 扩展](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
2. 确保项目根目录有 `.github/copilot-instructions.md`
3. Copilot Chat 会自动使用这些指令

### GitHub Web (github.com)

1. 导航到您的仓库
2. 确保存在 `.github/copilot-instructions.md`
3. 在 GitHub 网页界面使用 Copilot Chat

### JetBrains IDE

1. 安装 GitHub Copilot 插件
2. 确保项目根目录有 `.github/copilot-instructions.md`
3. Copilot Chat 会自动使用这些指令

## 限制说明

GitHub Copilot 相较于其他 AI 编程工具有一些限制：

### 配置层级

| 层级 | 位置 | 支持 |
|------|------|------|
| 项目 | `.github/copilot-instructions.md` | ✅ 支持 |
| 全局 | 用户设置 | ❌ 不支持 |
| 子目录 | N/A | ❌ 不支持 |
| 运行时覆盖 | N/A | ❌ 不支持 |

### 功能比较

| 功能 | Copilot | Claude Code | Gemini CLI |
|------|---------|-------------|------------|
| 项目指令 | ✅ | ✅ | ✅ |
| 全局配置 | ❌ | ✅ | ✅ |
| 斜杠命令 | ❌ | ✅ (18 skills) | ❌ |
| MCP 支持 | ❌ | ✅ | ❌ |
| 自定义 Skills | ❌ | ✅ | ✅ |
| 多文件上下文 | ⚠️ 有限 | ✅ | ✅ |
| 代码生成 | ✅ | ✅ | ✅ |
| Chat 界面 | ✅ | ✅ | ✅ |

### 替代方案

由于 Copilot 不支持斜杠命令，请改用 Chat 提示：

```
Claude Code: /commit
Copilot:     "Generate a commit message following Conventional Commits..."

Claude Code: /review
Copilot:     "Review this code following the code review checklist..."

Claude Code: /tdd
Copilot:     "Help me implement using TDD (Red-Green-Refactor)..."
```

完整提示模板请参阅 [COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md)。

## 包含的规范

`copilot-instructions.md` 文件包含以下规范：

| 规范 | 说明 |
|------|------|
| 防幻觉 | 证据导向分析、来源标注 |
| Commit 规范 | Conventional Commits 格式 |
| 代码审查 | 10 类别检查清单、评论前缀 |
| TDD 指南 | 红绿重构循环、FIRST 原则 |
| 测试覆盖 | 7 维度框架 |
| 签入规范 | 签入前质量关卡 |
| 需求撰写 | INVEST 条件、用户故事格式 |

## 验证集成

验证指令是否已加载：

1. 在 IDE 中打开 Copilot Chat
2. 询问："我应该遵循什么 commit 消息标准？"
3. Copilot 应该参考 Conventional Commits 格式

---

## 相关标准

- [防幻觉标准](../../core/anti-hallucination.md)
- [Commit 消息指南](../../core/commit-message-guide.md)
- [代码审查检查清单](../../core/code-review-checklist.md)
- [测试规范](../../core/testing-standards.md)
- [签入规范](../../core/checkin-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0.0 | 2026-01-13 | 重大增强：新增 README、Chat 参考、skills 对照；增强指令内容 |
| 1.0.1 | 2025-12-24 | 新增：相关标准、版本历史、授权章节 |
| 1.0.0 | 2025-12-23 | 初始 GitHub Copilot 集成 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
