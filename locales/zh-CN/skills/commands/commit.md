---
source: ../../../../skills/commands/commit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Generate commit messages following Conventional Commits standard
allowed-tools: Read, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
argument-hint: "[变更描述 | description of changes]"
---

# Commit Message 助手

根据 staged 的变更，生成符合 Conventional Commits 格式的 commit message。

## 前置检查

在生成 commit 前，AI 助手必须执行以下检查：

| 检查 | 命令 | 失败时 |
|------|------|--------|
| Staged 变更存在 | `git diff --cached --stat` | → 引导用户执行 `git add` |
| 无合并冲突 | `grep -r "<<<<<<< " --include="*.{js,ts,md,yaml}" .` | → 先解决冲突 |
| 测试通过 (feat/fix) | `cd cli && npm run test:unit`（或专案测试命令） | → 提交前先修复测试 |
| Spec 引用 (feat/fix) | 检查 `docs/specs/SPEC-*.md` 是否有活跃规格 | → 建议在 footer 加入 `Refs: SPEC-XXX` |

### Spec 追踪闸门

对于 `feat` 和 `fix` 类型的提交：
1. **检查**：`ls docs/specs/SPEC-*.md 2>/dev/null` — 是否有活跃的规格？
2. **如果有规格**：建议在 footer 加入 `Refs: SPEC-XXX`
3. **如果没有规格且变更显著**（>3 个文件或新 API）：建议通过 `/sdd` 创建规格
4. **模式**：这是建议性的（非阻断）— 用户可以不引用规格

---

## 工作流程

1. **检查状态** - 执行 `git status` 和 `git diff --staged` 了解变更
2. **分析变更** - 确定类型（feat, fix, refactor 等）和范围
3. **Spec 追踪评估** - 评估此变更是否需要规格（见下文）
4. **生成消息** - 创建遵循以下格式的提交消息：
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
5. **确认并提交** - 执行 `git commit` 前先请用户确认

## Spec 追踪评估

对于 `feat`/`fix` 提交，评估是否应创建或链接规格。当以下情况时建议创建规格：变更文件较多（>3）、修改了公共 API 签名、或有显著的新功能。对于 `docs`/`style`/`chore`/`test` 类型则跳过。

如果链接了规格，在提交 footer 中加入 `Refs: SPEC-XXX`。这是建议性的 — 用户可以随时忽略。

## 提交类型

| 类型 | 使用时机 |
|------|----------|
| `feat` | 新功能 |
| `fix` | 修复错误 |
| `refactor` | 重构 |
| `docs` | 文档更新 |
| `style` | 格式调整 |
| `test` | 测试相关 |
| `perf` | 性能优化 |
| `chore` | 维护任务 |

## 使用方式

- `/commit` - 自动分析变更并建议提交消息
- `/commit fix login bug` - 根据提供的描述生成消息

## 参考

- 完整规范: [commit-standards](../commit-standards/SKILL.md)
- 核心指南: [commit-message-guide](../../core/commit-message-guide.md)
