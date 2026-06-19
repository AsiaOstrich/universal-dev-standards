---
source: docs/user/TROUBLESHOOTING.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 疑难排解指南

> **语言**: [English](../../../../docs/user/TROUBLESHOOTING.md) | 简体中文

找到你的问题 → 照着修法做。

---

## 安装问题

**问题：`npm install -g` 之后出现 `uds: command not found`**

```bash
# 检查 npm 全局 bin 是否在你的 PATH 中
npm config get prefix
# 在 ~/.zshrc 或 ~/.bashrc 把 <prefix>/bin 加入 PATH
export PATH="$(npm config get prefix)/bin:$PATH"
```

**问题：`uds init` 因权限错误而失败**

```bash
# 改用 Node 版本管理器（nvm/fnm），而非系统内建的 Node
# 或修正 npm 全局目录：https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

---

## Claude Code 中未显示 Skill

**问题：我在 Claude Code 菜单中看不到 `/sdd`、`/tdd` 或其他 UDS skill。**

步骤 1 — 验证 UDS 已初始化：
```bash
uds check
```
若报告文件遗失，重新运行 `uds init`。

步骤 2 — 验证 `.claude/` 配置存在：
```bash
ls .claude/settings.json
```
若遗失，`uds init` 应会创建它。试试 `uds init --force`。

步骤 3 — 可能超出 skill 预算（skill 太多 → 描述被截断）：
参阅 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)，将少用的 skill 降为 Tier 3。

步骤 4 — 强制重新加载 Claude Code：
关闭并重新打开正在运行 Claude Code 的 IDE／终端窗口。

**问题：有些 skill 看得到，有些却看不到。**

这对 Tier 3 skill 而言是预期行为。Tier 3 skill 只显示名称（无描述）以节省 context 预算，而某些 AI 客户端可能根本不列出它们。

**Tier 3 skill 仍可直接调用**：输入 `/<name>` 并按 Enter。

若要让某个 Tier 3 skill 显示，加入你的 `.claude/settings.json`：
```json
{
  "skillOverrides": {
    "brainstorm-assistant": "on"
  }
}
```

---

## Skill 行为不如预期

**问题：Skill 有激活，但给的是通用回应，而非 UDS 专属的指引。**

可能原因：`.standards/` 目录为空或过时。
```bash
uds check       # 检查安装了什么
uds update      # 更新到最新标准
```

**问题：`/commit` 生成的 commit 消息不符合 Conventional Commits。**

commit-standards skill 会读取你既有的 commit 来学习项目风格。若你先前没有 Conventional Commits 格式的 commit，它可能会偏离。

在 `CLAUDE.md` 加入明确指引：
```markdown
## Commit Format
Always use Conventional Commits: `<type>(<scope>): <subject>`
Types: feat, fix, docs, chore, test, refactor, style, build, ci
```

**问题：`/sdd` 创建了 spec，但我想要不同的格式。**

在你的 `CLAUDE.md` 加入内容来自定义 spec 模板：
```markdown
## Spec Format
When creating specs with /sdd, use this template:
[paste your preferred template here]
```

---

## 不使用 Claude Code 而使用 UDS

**问题：我用的是 Cursor / GitHub Copilot / Windsurf——skill 无法运作。**

Skill（`/command` 系统）为 Claude Code 专属。对于其他 AI 工具：

1. 运行 `uds init` 并选择你的工具——它会配置 `.cursorrules`、`.github/copilot-instructions.md` 等
2. `.standards/` 中的 Core Standards 与工具无关，能为任何读取它们的 AI 提供 context
3. 在你的 AI 指令文件中使用下方的快速参考表

**可嵌入任何 AI 工具的快速参考：**

```markdown
## Commit Messages
Format: <type>(<scope>): <subject>
Types: feat, fix, docs, chore, test, refactor, style

## Testing Pyramid
Unit: 70% | Integration: 20% | System: 7% | E2E: 3%

## User Stories
As a [role], I want [feature], so that [benefit].
INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable
```

**Skill → Core Standard 对照**（当 skill 无法使用时）：

| Skill | 要参考的 Core Standard |
|-------|------------------------|
| `commit-standards` | `.standards/commit-message.md` |
| `testing-guide` | `.standards/testing.md` |
| `code-review-assistant` | `.standards/code-review.md` |
| `requirement-assistant` | `.standards/requirement-engineering.md` |
| `spec-driven-dev` | `.standards/spec-driven-development.md` |
| `tdd-assistant` | `.standards/test-driven-development.md` |
| `bdd-assistant` | `.standards/behavior-driven-development.md` |
| `git-workflow-guide` | `.standards/git-workflow.md` |
| `refactoring-assistant` | `.standards/refactoring-standards.md` |

---

## 更新问题

**问题：`uds update` 失败。**

```bash
# 检查网络／npm registry 连接
npm ping
# 试试指定 registry
npm install -g universal-dev-standards@latest
# 然后重新初始化
uds init --force
```

**问题：更新后，我的 skill 看起来坏掉了。**

更新可能变更了 skill 格式。试试：
```bash
uds check
uds init --force   # 重新安装 skill 配置
```

---

## 一般诊断

运行 `uds check` 取得完整健康报告：
```
uds check
```

它会检查：
- 标准安装状态
- Skill 配置
- AI 工具兼容性
- 版本对齐

---

## 还是卡住？

- **GitHub Issues**：[github.com/AsiaOstrich/universal-dev-standards/issues](https://github.com/AsiaOstrich/universal-dev-standards/issues)
- **FAQ**：[FAQ.md](FAQ.md)
- **Skill 预算调整**：[skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)
