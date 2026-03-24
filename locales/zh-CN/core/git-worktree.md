---
source: ../../../core/git-worktree.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/git-worktree.md) | 简体中文

# Git Worktree 隔离

**版本**: 1.0.0
**最后更新**: 2026-03-20
**适用范围**: 所有使用 Git 进行版本控制的项目
**范围**: universal
**灵感来源**: [Superpowers](https://github.com/obra/superpowers) — using-git-worktrees (MIT)

---

## 目的

定义 Git Worktree 的完整生命周期管理标准，确保环境干净、安全合并与适当清理。Worktree 允许在多个分支上并行工作，无需 stash 或切换。

---

## 术语表

| 术语 | 定义 |
|------|------|
| Worktree | Git 仓库在不同分支上的链接工作副本 |
| 基准测试 | 在全新 worktree 上运行的测试，验证环境是干净的 |
| Worktree 目录 | 创建 worktree 的文件系统路径 |

---

## 核心原则 — 隔离与问责

> **每个 worktree 必须以干净状态开始（基准测试）、在隔离环境中工作、以合并或明确清理结束。**

---

## 生命周期阶段

### 阶段 1：建立

1. **选择 worktree 位置** — 优先顺序：
   - 已配置的路径
   - `.devap/worktrees/` 或类似项目本地目录
   - 询问用户
2. **验证 `.gitignore`** — 运行 `git check-ignore` 确认 worktree 目录被忽略
3. **创建 worktree** — `git worktree add <path> -b <branch-name>`
4. **安装依赖** — 如需要，运行包管理器安装

```bash
# 示例设置
git worktree add .worktrees/feature-auth -b feature/auth
cd .worktrees/feature-auth
pnpm install  # 或 npm install、pip install 等
```

### 阶段 2：基准验证

1. **运行测试套件** — 在全新 worktree 中运行
2. **记录基准结果** — 确认所有测试通过
3. **如果基准失败** — 不要在此 worktree 上开始工作

### 阶段 3：开发

- 在 worktree 中正常开发
- 定期运行测试确保不破坏基准

### 阶段 4：完成

参照[分支完成工作流程](branch-completion.md)的四个选项完成分支。

### 阶段 5：清理

```bash
# 删除 worktree
git worktree remove .worktrees/feature-auth

# 列出所有 worktree
git worktree list

# 清理过期的 worktree 引用
git worktree prune
```

---

## 相关标准

- [分支完成工作流程](branch-completion.md)
- [代理派遣与并行协调](agent-dispatch.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
