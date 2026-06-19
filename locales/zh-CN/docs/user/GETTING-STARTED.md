---
source: docs/user/GETTING-STARTED.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 入门指南

> **语言**: [English](../../../../docs/user/GETTING-STARTED.md) | 简体中文

本指南带你走过 UDS 从零开始，直到完成第一份 AI 辅助的 spec 与 commit。
预估时间：**5 分钟**。

---

## 先决条件

- Node.js ≥ 20.0.0（`node --version`）
- 一个 AI 编程助手：Claude Code（建议）、Cursor、GitHub Copilot 或类似工具

---

## 步骤 1 — 安装

```bash
npm install -g universal-dev-standards
uds --version
```

> **不想全局安装？** 使用 `npx universal-dev-standards init` 即可不安装直接运行。

---

## 步骤 2 — 初始化你的项目

在你的项目目录内运行 `uds init`：

```bash
cd your-project
uds init
```

交互式向导将会：
1. 检测你的 AI 工具（Claude Code、Cursor 等）
2. 复制标准到 `.standards/`
3. 配置你 AI 工具的指令文件（例如 `CLAUDE.md`）
4. 安装你所选择的 skill

初始化后，你应该会看到：
```
.standards/          ← AI 可读的标准
CLAUDE.md            ← 已更新 UDS 指引（Claude Code）
```

> **已经有 CLAUDE.md？** `uds init` 会采合并方式——不会覆盖你既有的内容。

---

## 步骤 3 — 你的第一份 Spec（`/sdd`）

在写代码之前，先创建一份 spec：

1. 在你的项目中打开 Claude Code
2. 输入：`/sdd` 并按 Enter
3. 描述你想要构建的东西（例如「新增用户以 email + 密码登录」）
4. Claude 会在 `specs/SPEC-NNN-*.md` 创建一份 spec 文件

这份 spec 会记录：
- **Background（背景）** — 为什么需要这个功能
- **Acceptance Criteria（验收条件，AC）** — 可测试的结果
- **Out of Scope（范围外）** — 明确的边界

> **为什么要先写 spec？** AC 驱动的开发能减少范围蔓延，并让 review 更快。
> `/sdd` 遵循 UDS Spec-Driven Development（规格驱动开发）标准。

---

## 步骤 4 — 编写代码（搭配 TDD 或 BDD）

有了 spec 之后，选择你的工作流：

| 工作流 | 命令 | 适用时机 |
|--------|------|----------|
| 测试驱动开发 | `/tdd` | 编写单元／集成测试 |
| 行为驱动开发 | `/bdd` | 编写功能场景 |
| 直接实现 | — | 简单、已充分理解的任务 |

TDD 示例：
```
/tdd specs/SPEC-001-user-login.md
```
Claude 会引导你走过 RED → GREEN → REFACTOR 循环。

---

## 步骤 5 — Commit（`/commit`）

准备好要 commit 时：

```
/commit
```

Claude Code 将会：
1. 审查你已 stage 的变更
2. 生成一则符合 [Conventional Commits](https://www.conventionalcommits.org/) 格式的消息
3. 在 commit 前把消息显示给你确认

> **安全推送？** 在 `git push` 前使用 `/push` 取得额外的质量门禁。

---

## 常用命令速览

| 任务 | 命令 |
|------|------|
| 浏览所有 skill | `/dev-workflow` |
| 创建 spec | `/sdd` |
| TDD 工作流 | `/tdd` |
| BDD 工作流 | `/bdd` |
| 生成 commit | `/commit` |
| 安全推送 | `/push` |
| 架构决策 | `/adr` |
| 代码审查 | `/code-review` |

完整列表请见 [SKILLS-INDEX.md → 触发时机速查](../../../../docs/user/SKILLS-INDEX.md#觸發時機速查-when-to-use)。

---

## 疑难排解

- **找不到 skill**：输入 `uds check` 验证安装状态
- **CLAUDE.md 未更新**：重新运行 `uds init --force`
- **Claude Code 菜单中未显示 skill**：见 [TROUBLESHOOTING.md](../../../../docs/user/TROUBLESHOOTING.md)

---

## 后续步骤

- **探索所有 skill**：[SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)
- **自定义 skill 显示**：[skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)
- **每日工作流模式**：[DAILY-WORKFLOW-GUIDE.md](../../adoption/DAILY-WORKFLOW-GUIDE.md)
- **理解架构**：[GLOSSARY.md](../../../../docs/user/GLOSSARY.md)
