---
source: ../../../core/branch-completion.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/branch-completion.md) | 简体中文

# 分支完成工作流程

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
git merge feature/my-feature
git branch -d feature/my-feature
```

### 选项 2：创建 Pull Request

推送分支并创建 PR 进行代码审查。

```bash
git push -u origin feature/my-feature
gh pr create --title "功能描述" --body "变更说明"
```

### 选项 3：Squash 合并

将所有提交压缩为单一提交后合并。

```bash
git checkout main
git merge --squash feature/my-feature
git commit -m "feat: 功能描述"
git branch -d feature/my-feature
```

### 选项 4：丢弃分支

安全丢弃不再需要的分支。

⚠️ **丢弃确认**：必须明确输入确认才能删除。

```bash
git branch -D feature/my-feature        # 本地删除
git push origin --delete feature/my-feature  # 远程删除
```

---

## 相关标准

- [Git Worktree 隔离](git-worktree.md)
- [代理派遣与并行协调](agent-dispatch.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
