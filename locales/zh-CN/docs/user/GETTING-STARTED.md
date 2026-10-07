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

## 技能怎么装

获取 UDS 技能有两种方式，两种都受支持。主要路径是装进项目；Claude Code 插件市场是有限制的替代方式。

> **请明说你要哪一种。** 目前不带 `--skills-location` 的 `uds init --yes` 不会安装任何技能文件：它把 Claude Code 的技能留给插件。要装进项目，请加 `--skills-location project`（或之后运行 `uds update --apply --skills`）。

| | 装进项目（主要路径） | Claude Code 插件市场（替代方式） |
|---|---|---|
| 指令 | 新项目：`uds init --skills-location project`<br>已设置过的项目：`uds update --apply --skills` | `/plugin marketplace add AsiaOstrich/universal-dev-standards`，再 `/plugin install universal-dev-standards@asia-ostrich` |
| AI 工具 | Claude Code、OpenCode、Cursor、Codex、Copilot、Windsurf 等 | 只支持 Claude Code |
| 技能文本的语言 | 英文、繁体中文、简体中文（缺失的会警告并退回英文） | 只有英文：插件设置没有语言选项 |
| UDS 版本 | 你装的那个版本，包含测试版 | 只跟正式版 |
| 项目内的文件 | 有，例如 `.claude/skills/`；`uds check` 会逐文件验证 | 没有 |
| 更新 | 升级 UDS 后，自己再运行一次 `uds update --apply --skills` | 由 Claude Code 管理插件（`/plugin`） |

**请二选一。** Claude Code 执行插件技能是 `/<插件名>:<技能名>`，执行项目技能是 `/<技能名>`，所以两种都装时每个技能会出现两次（例如 `/commit` 与 `/universal-dev-standards:commit`），而且每个技能的名称与描述每回合都会放进上下文，重复装等于重复占用。`uds check` 发现项目内有 UDS 技能、同时又装了 UDS 插件时，会打印警告；警告只是信息，不改变判定与退出码。要留项目这份，在 Claude Code 执行 `/plugin uninstall universal-dev-standards@asia-ostrich`。要留插件，删掉 `.claude/skills/` 下的 UDS 技能文件夹。

**为什么 `uds check` 与 `uds update` 叫你运行 `uds update --apply --skills`。** `uds check` 在项目里的技能文件缺失或被改过时说这句，`uds update` 在已装的技能版本落后时说这句。只有装进项目的技能有文件，UDS 才能拿它和当初装的内容比对、放回去，所以修法就是那个指令。插件不在你的项目里放文件，`uds check` 没有东西可比对，也就没有这类消息。

`uds skills` 会列出装了什么、装在哪里，并打印同样的两种方式与各自的限制。

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
