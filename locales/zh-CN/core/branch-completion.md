---
source: ../../../core/branch-completion.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 630cbaa0dc61
status: current
---

> **语言**: [English](../../../core/branch-completion.md) | 简体中文

# 分支完成工作流程

<!-- UDS:REFERENCE-ONLY since=6.0.0 -->
> **仅供参考——UDS 不会安装这条标准。** 它的机器可读文件 `.ai.yaml` 已于 6.0.0 移除；
> 本文档保留在此，供实现它的采用层参考，**不由 `uds init` 或 `uds update` 发布**。
> 本告示所对照的清单是
> [`scripts/reference-only-standards.json`](../../../scripts/reference-only-standards.json)，
> 迁移记录见 [`docs/MIGRATION-v6.md`](../../../docs/MIGRATION-v6.md) §2。

**版本**: 1.0.0
**最后更新**: 2026-03-20
**适用范围**: 所有使用 Git 分支工作流的项目
**范围**: universal
**灵感来源**: [Superpowers](https://github.com/obra/superpowers) — finishing-a-development-branch (MIT)

---

## 目的

定义分支完成的标准化工作流，包含前置检查、四个完成选项与安全丢弃流程。防止过早合并、遗忘分支与意外数据丢失。

---

## 术语表

| 术语 | 定义 |
|------|------|
| 分支完成 | 完成功能/修复分支上工作的过程 |
| 前置条件 | 分支被视为完成前必须满足的条件 |
| 丢弃确认 | 删除工作前需要明确输入的安全机制 |

---

## 核心原则 — 测试优先于讨论

> **所有测试必须通过，才能考虑任何完成选项。**

---

## 前置条件

分支完成前，以下所有检查必须通过：

| 检查项 | 命令（示例） | 必需 |
|--------|-------------|------|
| 所有测试通过 | `pnpm test` | 是 |
| Lint 通过 | `pnpm lint` | 是 |
| 类型检查通过 | `pnpm tsc --noEmit` | 是 |
| 无未提交变更 | `git status --porcelain` | 是 |

如果任何前置条件失败，分支**尚未准备好完成**。先修复问题。

---

## 四个完成选项

### 选项 1：本地合并

在本地机器上将分支合并到目标分支。

```bash
git checkout main
git merge --no-ff feature/my-feature
git branch -d feature/my-feature
# If worktree exists:
git worktree remove .worktrees/my-feature
```

**何时使用**：小型变更、个人工作、无需审查。

### 选项 2：创建 Pull Request

推送分支并创建 Pull Request 进行审查。

```bash
git push -u origin feature/my-feature
gh pr create --title "feat: add my feature" --body "..."
```

**何时使用**：团队项目、需要审查的变更、CI/CD 流水线。

### 选项 3：保持现状

保留分支，不合并也不创建 PR。

- 记录分支状态与延后的原因
- 设置提醒以便日后回顾

**何时使用**：进行中的工作、等待依赖、探索替代方案。

### 选项 4：丢弃

删除分支及其所有变更。

**安全要求**：用户必须通过输入分支名称来**明确确认**。

```
⚠️  You are about to discard branch 'feature/my-feature'.
    This will permanently delete all uncommitted and committed changes on this branch.
    Type the branch name to confirm: feature/my-feature
```

```bash
# After confirmation:
git checkout main
git branch -D feature/my-feature
# If worktree exists:
git worktree remove .worktrees/my-feature
```

**何时使用**：已放弃的实验、已被取代的做法。

丢弃操作需要用户明确确认（输入分支名称），防止误删。

---

## 决策流程

```
Prerequisites pass?
  ├── No → Fix issues first
  └── Yes → Choose completion option:
        ├── 1. Merge locally
        ├── 2. Create PR
        ├── 3. Keep as-is
        └── 4. Discard (requires confirmation)
```

---

## Worktree 整合

若分支有关联的 worktree，必须在完成流程中一并清理该 worktree：

| 完成选项 | Worktree 操作 |
|---------|--------------|
| 本地合并 | 合并后移除 worktree |
| 创建 PR | 保留 worktree 直到 PR 合并 |
| 保持现状 | 保留 worktree |
| 丢弃 | 立即移除 worktree |

---

## 规则

| ID | 触发条件 | 动作 | 优先级 |
|----|---------|------|--------|
| BC-001 | 用户选择丢弃 | 要求输入分支名称确认 | Critical |
| BC-002 | 分支有关联的 worktree | 完成时清理 worktree | High |
| BC-003 | 前置条件未满足 | 阻止完成，显示失败的检查项 | High |
| BC-004 | 分支闲置 14 天以上 | 通知用户完成或丢弃 | Medium |

---

## 参考资料

- **Superpowers**：[finishing-a-development-branch](https://github.com/obra/superpowers) (MIT)
- **Git Flow**：分支生命周期管理
- **Trunk-Based Development**：短生命周期分支模式

---

> **分支完成 ≠ 发布就绪。** 分支完成代表其自身的所有质量关卡都已通过，并不代表产品已可交付。正式部署前必须通过的 16 维度发布关卡，请参阅 `release-readiness-gate.md`。
