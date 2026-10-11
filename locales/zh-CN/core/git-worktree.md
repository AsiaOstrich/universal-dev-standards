---
source: ../../../core/git-worktree.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 12acb15a4884
status: current
---

> **语言**: [English](../../../core/git-worktree.md) | 简体中文

# Git Worktree 隔离

**版本**: 1.1.0
**最后更新**: 2026-06-18
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
   - `.uds/worktrees/` 或类似项目本地目录
   - 询问用户
2. **验证 `.gitignore`** — 运行 `git check-ignore` 确认 worktree 目录被忽略
3. **创建 worktree** — `git worktree add <path> -b <branch-name>`
4. **安装依赖** — 如需要，运行包管理器安装

```bash
# Example setup
git worktree add .worktrees/feature-auth -b feature/auth
cd .worktrees/feature-auth
pnpm install  # or npm install, pip install, etc.
```

### 阶段 2：基准验证

1. **运行测试套件** — 在全新 worktree 中运行
2. **确认所有测试通过** — 这验证了环境是干净的
3. **如果测试失败** — 以退避方式最多重试 2 次，排除暂时性的 flake／超时；若仍失败，中止并报告环境问题（不要继续）

```bash
# Baseline verification
pnpm test  # Must pass before any work begins
```

基准测试失败代表环境有问题，必须中止并报告。

### 阶段 3：执行

1. 把隔离的 worktree 当作一般开发环境来工作
2. 照常提交
3. 变更后运行测试

### 阶段 4：合并

1. **在 worktree 中确认所有测试通过**
2. **合并回去** — 使用 `--no-ff` 保留分支历史
3. **处理冲突**（如果出现）

```bash
git checkout main
git merge --no-ff feature/auth
```

### 阶段 5：清理

1. **删除 worktree** — `git worktree remove <path>`
2. **删除分支** — `git branch -d <branch-name>`
3. **清理过期的 worktree** — `git worktree prune`

```bash
git worktree remove .worktrees/feature-auth
git branch -d feature/auth
git worktree prune
```

**重要**：清理必须在异常退出时也执行，使用 try/finally 模式或清理 hook。

---

## 规则

| ID | 触发条件 | 动作 | 优先级 |
|----|---------|------|--------|
| GW-001 | Worktree 目录不在 `.gitignore` 中 | 自动加入 `.gitignore` | Critical |
| GW-002 | 基准测试失败 | 对暂时性失败最多重试 2 次（指数退避）；若持续失败，中止任务并报告环境问题 | High |
| GW-003 | Worktree 操作期间异常退出 | 确保执行清理 | High |
| GW-004 | 分支合并／删除后 worktree 仍存在 | 清理过期的 worktree 引用 | Medium |

---

## 最佳实践

| 实践 | 理由 |
|------|------|
| 使用一致的 worktree 目录（例如 `.worktrees/`） | 容易加入 `.gitignore` 也容易找到 |
| 一定要运行基准测试 | 避免环境问题造成的误报失败 |
| 合并时使用 `--no-ff` | 在历史中保留分支拓扑 |
| 合并后立即清理 | 避免过期 worktree 累积 |

---

## 参考资料

- **Superpowers**: [using-git-worktrees](https://github.com/obra/superpowers) (MIT)
- **Git 文档**: [git-worktree](https://git-scm.com/docs/git-worktree)
