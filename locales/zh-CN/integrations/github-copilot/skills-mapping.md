---
source: ../../../integrations/github-copilot/skills-mapping.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-02-05
status: current
---

# Skills 迁移指南

本文档将 Claude Code 的 skills 对应到 GitHub Copilot 的等效实现和替代方案。

---

## 概述

Claude Code 提供 25 个 skills 和 17 个斜杠命令。GitHub Copilot 不支持斜杠命令，但大部分功能可通过 Chat 提示和 `copilot-instructions.md` 文件实现。

---

## Skills 对照表

| Claude Code Skill | Copilot 实现 | 状态 |
|-------------------|--------------|------|
| **ai-collaboration-standards** | copilot-instructions.md 第 1 节 | ✅ 完整 |
| **commit-standards** | copilot-instructions.md 第 2 节 | ✅ 完整 |
| **code-review-assistant** | copilot-instructions.md 第 3 节 | ✅ 完整 |
| **tdd-assistant** | copilot-instructions.md 第 4 节 | ✅ 完整 |
| **test-coverage-assistant** | copilot-instructions.md 第 5 节 | ✅ 完整 |
| **checkin-assistant** | copilot-instructions.md 第 6 节 | ✅ 完整 |
| **requirement-assistant** | copilot-instructions.md 第 7 节 | ✅ 完整 |
| **spec-driven-dev** | copilot-instructions.md 第 8 节 | ✅ 完整 |
| **testing-guide** | 通过 copilot-instructions.md | ⚠️ 部分 |
| **release-standards** | 仅 Chat 提示 | ⚠️ 部分 |
| **changelog-guide** | 仅 Chat 提示 | ⚠️ 部分 |
| **git-workflow-guide** | 仅 Chat 提示 | ⚠️ 部分 |
| **documentation-guide** | 仅 Chat 提示 | ⚠️ 部分 |
| **methodology-system** | 不可用 | ❌ 无 |
| **refactoring-assistant** | COPILOT-CHAT-REFERENCE.md §9 | ✅ 完整 |
| **error-code-guide** | 仅 Chat 提示 | ⚠️ 部分 |
| **project-structure-guide** | 仅 Chat 提示 | ⚠️ 部分 |
| **logging-guide** | 仅 Chat 提示 | ⚠️ 部分 |
| **bdd-assistant** | 仅 Chat 提示 | ⚠️ 部分 |
| **atdd-assistant** | 仅 Chat 提示 | ⚠️ 部分 |
| **docs-generator** | 仅 Chat 提示 | ⚠️ 部分 |
| **forward-derivation** | 仅 Chat 提示 | ⚠️ 部分 |
| **reverse-engineer** | 仅 Chat 提示 | ⚠️ 部分 |
| **ai-friendly-architecture** | 仅 Chat 提示 | ⚠️ 部分 |
| **ai-instruction-standards** | 仅 Chat 提示 | ⚠️ 部分 |

### 状态说明

| 状态 | 含义 |
|------|------|
| ✅ 完整 | 完整实现于 copilot-instructions.md |
| ⚠️ 部分 | 可通过 Chat 提示使用，未在指令文件中 |
| ❌ 无 | 无法在 Copilot 中复制 |

---

## 斜杠命令等效提示

| Claude Code | Copilot Chat 等效提示 |
|-------------|----------------------|
| `/commit` | "按照 Conventional Commits 格式生成 commit 消息" |
| `/review` | "按照代码审查检查清单审查此代码" |
| `/tdd` | "使用 TDD（红绿重构）帮我实现" |
| `/coverage` | "使用 7 维度分析测试覆盖" |
| `/requirement` | "按照 INVEST 条件撰写用户故事" |
| `/check` | "验证签入前质量关卡" |
| `/release` | "按照语义化版本准备发布" |
| `/changelog` | "以 Keep a Changelog 格式生成 CHANGELOG 条目" |
| `/docs` | "为此函数/模块撰写文档" |
| `/spec` | "为此功能创建规格文档" |
| `/refactor` | "帮我决定是否应该重构或重写..." |
| `/refactor tactical` | "建议战术重构改进..." |
| `/refactor legacy` | "帮我安全地重构此遗留代码..." |
| `/methodology` | ❌ 不可用 |
| `/bdd` | "帮我用 Gherkin 格式撰写 BDD 场景" |
| `/atdd` | "帮我实现 ATDD 工作流程与验收测试" |
| `/docgen` | "为此模块生成文档" |
| `/derive` | "从此规格推导实现" |
| `/reverse` | "从此代码逆向工程生成文档" |
| `/config` | "为此类型应用程序建议项目结构" |
| `/update` | ❌ 不可用（需手动更新文件） |
| `/init` | ❌ 不可用（请改用 UDS CLI） |

---

## 功能限制

### 无法迁移的功能

1. **自动触发**
   - Claude Code：Skills 根据关键字自动触发
   - Copilot：必须手动使用 Chat 提示

2. **方法论系统**
   - Claude Code：跟踪开发阶段（TDD/BDD/SDD/ATDD）
   - Copilot：会话间无状态跟踪

3. **斜杠命令**
   - Claude Code：`/commit`、`/review` 等
   - Copilot：必须在 Chat 中输入完整提示

4. **MCP 工具集成**
   - Claude Code：可通过 MCP 连接外部工具
   - Copilot：不支持 MCP

5. **全局配置**
   - Claude Code：`~/.claude/CLAUDE.md` 适用于所有项目
   - Copilot：只有项目级别的 `.github/copilot-instructions.md`

6. **子目录规则**
   - Claude Code：每个子目录可有不同规则
   - Copilot：整个项目只有单一指令文件

---

## 建议的替代方案

### 方法论跟踪

改用项目文档：
```markdown
<!-- 在您的 README.md 或 CONTRIBUTING.md 中 -->
## 开发方法论
本项目使用 TDD。当前阶段：实现

### TDD 检查清单
- [x] 写失败的测试
- [ ] 实现最小代码
- [ ] 重构
```

### 全局标准

创建包含预设 `.github/copilot-instructions.md` 的模板仓库：
```bash
# 从模板创建
gh repo create my-project --template my-org/project-template
```

### 自动触发

使用 VS Code 代码片段或快捷键：
```json
// .vscode/snippets.code-snippets
{
  "Commit 消息": {
    "prefix": "commit",
    "body": "按照 Conventional Commits 格式为这些变更生成 commit 消息..."
  }
}
```

---

## 迁移检查清单

从 Claude Code 迁移到 Copilot 时：

```
□ 将 copilot-instructions.md 复制到 .github/
□ 收藏 COPILOT-CHAT-REFERENCE.md 以便参考提示模板
□ 为常用提示创建 VS Code 代码片段
□ 更新团队文档说明 Copilot 的限制
□ 考虑使用 UDS CLI 进行项目初始设置
```

---

## 混合方式

对于同时使用 Claude Code 和 Copilot 的团队：

| 任务 | 建议工具 |
|------|----------|
| 复杂代码生成 | Claude Code |
| 快速行内建议 | Copilot |
| 代码审查 | 皆可 |
| Commit 消息 | 皆可 |
| 项目设置 | Claude Code + UDS CLI |
| IDE 自动完成 | Copilot |

---

## 相关资源

- [copilot-instructions.md](./copilot-instructions.md) - 完整规范
- [COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md) - Chat 提示
- [Claude Code Skills](../../skills/) - 原始 skills

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.0 | 2026-02-05 | 更新 skills 数量（18→25），新增 7 个 skills 和 5 个斜杠命令 |
| 1.1.0 | 2026-01-21 | 更新 refactoring-assistant 为完整状态，新增 /refactor 命令对照 |
| 1.0.0 | 2026-01-13 | 初始发布 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
