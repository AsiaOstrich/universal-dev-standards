---
source: docs/user/FAQ.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 常见问题

> **语言**: [English](../../../../docs/user/FAQ.md) | 简体中文

---

## 安装与设置

**Q：`uds init` 和 `uds update` 有什么区别？**

`uds init` 用于首次设置：它会复制标准、配置你的 AI 工具，并安装 skill。
`uds update` 则是把已初始化的项目升级到最新的 UDS 版本，过程中不会重新配置。

**Q：不用 Claude Code 也能使用 UDS 吗？**

可以。UDS 支持 Claude Code、Cursor、GitHub Copilot、Windsurf，以及任何会读取指令文件的 AI 工具。运行 `uds init` 并选择你的工具，它就会配置对应的文件（`.cursorrules`、`CLAUDE.md` 等）。Skill 为 Claude Code 专属；对于其他工具，标准与等同 CLAUDE.md 的文件仍然适用。

**Q：我已经有一份 `CLAUDE.md`，`uds init` 会覆盖它吗？**

不会。`uds init` 会把 UDS 内容合并进你既有的文件，以清楚标记的区块追加 UDS 段落。你原有的内容会被保留。

---

## Skill 与命令

**Q：什么是 Skill？**

Skill 是预先构建好的 AI 工作流，当你在 Claude Code 输入 `/command` 时就会激活。例如 `/sdd` 会激活 Spec-Driven Development（规格驱动开发）skill，引导你创建 spec 文件。Skill 存储在 `skills/<name>/SKILL.md`，并由 Claude Code 自动加载。

**Q：Skill 和 Standard 有什么区别？**

**Standard（标准）** 是书面准则（Markdown 或 YAML），说明某件事该怎么做（例如「commit-message」标准定义了 Conventional Commits 格式）。**Skill** 则是运用这些标准来执行某个流程的 AI 工作流。标准是知识库；Skill 是执行层。

**Q：为什么我在 Claude Code 菜单里看不到某个 skill？**

可能有三个原因：
1. **UDS 未初始化**：运行 `uds check` 确认
2. **超出 skill 预算**：当 skill 很多时，Claude Code 会截断列表。请参阅 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md) 调整哪些 skill 会显示
3. **Tier 3 skill**：Tier 3 skill 默认隐藏以节省 context。它们仍可通过 `/<name>` 调用。若要显示，请在你的 `settings.json` 中覆盖——参阅 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)

**Q：菜单里看不到的 skill 还能用吗？**

可以。无论是否出现在菜单中，每个 skill 都能直接输入 `/<name>` 来调用。例如即使 `brainstorm-assistant` 是 Tier 3 而未列出，`/brainstorm` 仍然有效。

**Q：我怎么知道哪个命令会触发哪个 skill？**

完整的「命令对 skill」对照请见 [COMMANDS-INDEX.md](../../../../docs/user/COMMANDS-INDEX.md)，或以 skill 为中心的视图 [SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)。

**Q：我怎么停用一个从不使用的 skill？**

在你的 `.claude/settings.json` 中：
```json
{
  "skillOverrides": {
    "brainstorm-assistant": "disabled"
  }
}
```
所有覆盖选项请见 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)。

---

## 规格驱动开发

**Q：每次变更都得写 spec 吗？**

不用。建议在功能、user story 与较具规模的变更时撰写 spec。对于小型 bug 修正或重构，`/commit` 与 `/code-review` 就足够了。经验法则：若实现会花超过 2 小时，写 spec 会有帮助。

**Q：spec 存放在哪里？**

默认位于项目根目录的 `specs/SPEC-NNN-<slug>.md`。格式遵循 UDS spec-driven-development 标准。

**Q：什么是 AC（Acceptance Criterion，验收条件）？**

验收条件是一条可测试的陈述，用来定义一个功能何时算「完成」。例如：「Given 一位已注册用户，When 他以正确凭证登录，Then 他会取得有效的 session token。」AC 驱动测试覆盖并防止范围蔓延。

---

## 更新与版本

**Q：我要如何把 UDS 更新到最新版？**

```bash
uds update
```

这会下载最新的标准与 skill，同时保留你项目专属的定制化。

**Q：我要如何查看当前的 UDS 版本？**

```bash
uds --version
# 或
cat .standards/manifest.json | grep version
```

**Q：更新 UDS 会破坏我现有的 spec 或 CLAUDE.md 吗？**

不会。标准更新保持向后兼容。Spec 是你的文件，`uds update` 绝不会动它们。CLAUDE.md 只有在你明确运行 `uds init --force` 时才会被修改。

---

## 架构

**Q：什么是「双层架构（Dual-Layer Architecture）」？**

UDS 有两层：
- **Core Standards（核心标准，`.standards/` — Markdown 文件）**：人类可读的准则、完整理论、边界情况
- **AI Standards（AI 标准，`.standards/` — `.ai.yaml` 文件）**：同一份标准的 token 精简、为 AI 优化的版本，专为 Claude Code 的 context window 设计

当 Skill 运行时，它会读取 `.ai.yaml` 文件。当开发者想了解背后理由时，则阅读 `.md` 文件。

**Q：`skills/` 和 `.standards/` 有什么区别？**

`skills/` 包含驱动 Claude Code 中 `/command` 的 SKILL.md 文件，它们是工作流。
`.standards/` 包含底层知识库（Core Standards + AI Standards）。Skill 引用标准；标准不引用 skill。

**Q：什么是 Skill Tier？（DEC-061）**

Tier 控制 Claude Code 的 context 预算有多少用于 skill 描述：
- **Tier 1**：永远以完整描述列出（15 个 skill — 每日使用）
- **Tier 2**：默认以完整描述列出（28 个 skill — 每周使用）
- **Tier 3**：默认仅列出名称（12 个 skill — 专家／事件驱动）

所有 tier 都能通过 `/<name>` 完整调用。Tier 只影响 _列出_ 的行为。
