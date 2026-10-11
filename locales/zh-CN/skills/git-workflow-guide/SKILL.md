---
source: ../../../../skills/git-workflow-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: a1438a0fe0f2
status: current
name: git-flow
description: |
  引导 Git 分支策略、分支命名与合并操作。
  Use when: 创建分支、合并、pull request、Git 工作流程相关问题。
  Not for: 撰写 commit message——请用 /commit；推送前的安全检查——请用 /push。
  Keywords: branch, merge, PR, pull request, GitFlow, GitHub Flow, 分支, 合并, 工作流程, 分支命名.
---

# Git 工作流程指南

> **语言**: [English](../../../../skills/git-workflow-guide/SKILL.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

> **核心标准**：本技能实现 [Git 工作流程](../../../../core/git-workflow.md)。完整的方法论文档请参阅核心标准。

## 目的

本技能提供 Git 分支策略、分支命名惯例与合并操作的指导。

## 快速参考

### 工作流程策略选择

| 部署频率 | 建议策略 |
|---------|---------|
| 每日多次 | Trunk-Based Development |
| 每周至双周 | GitHub Flow |
| 每月或更长 | GitFlow |

### 分支命名惯例

```
<type>/<short-description>
```

| 类型 | 用途 | 范例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` 或 `bugfix/` | 错误修复 | `fix/memory-leak` |
| `hotfix/` | 紧急生产环境修复 | `hotfix/security-patch` |
| `refactor/` | 程序码重构 | `refactor/extract-service` |
| `docs/` | 仅文件变更 | `docs/api-reference` |
| `test/` | 测试新增 | `test/integration-tests` |
| `chore/` | 维护任务 | `chore/update-dependencies` |
| `release/` | 发布准备 | `release/v1.2.0` |

### 命名规则

1. **使用小写**
2. **使用连字号分隔单字**
3. **描述性但简洁**

## 详细指南

完整标准请参阅：
- [Git 工作流程策略](./git-workflow.md)
- [分支命名参考](./branch-naming.md)

### AI 优化格式（节省 Token）

AI 助手可使用 YAML 格式文件以减少 Token 使用量：
- 基础标准：`ai/standards/git-workflow.ai.yaml`
- 工作流程选项：
  - GitHub Flow：`ai/options/git-workflow/github-flow.ai.yaml`
  - GitFlow：`ai/options/git-workflow/gitflow.ai.yaml`
  - Trunk-Based：`ai/options/git-workflow/trunk-based.ai.yaml`
- 合并策略选项：
  - Squash Merge：`ai/options/git-workflow/squash-merge.ai.yaml`
  - Merge Commit：`ai/options/git-workflow/merge-commit.ai.yaml`
  - Rebase + FF：`ai/options/git-workflow/rebase-ff.ai.yaml`

## 建立分支前检查清单

建立新分支前：

1. **检查未合并的分支**
   ```bash
   git branch --no-merged main
   ```

2. **同步最新程序码**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **验证测试通过**
   ```bash
   npm test  # 或您项目的测试指令
   ```

4. **使用正确命名建立分支**
   ```bash
   git checkout -b feature/description
   ```

## 合并策略快速指南

| 策略 | 使用时机 |
|------|---------|
| **Merge Commit** (`--no-ff`) | 长期功能、GitFlow 发布 |
| **Squash Merge** | 功能分支、干净历史 |
| **Rebase + FF** | Trunk-Based、短期分支 |

## 范例

### 建立功能分支

```bash
# 良好范例
git checkout -b feature/user-authentication
git checkout -b fix/null-pointer-in-payment
git checkout -b hotfix/critical-data-loss

# 不良范例
git checkout -b 123              # 缺乏描述性
git checkout -b Fix-Bug          # 非小写
git checkout -b myFeature        # 缺少类型前缀
```

### 合并工作流程 (GitHub Flow)

```bash
# 1. 从 main 建立分支
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. 进行变更并提交
git add .
git commit -m "feat(profile): add avatar upload"
git push -u origin feature/user-profile

# 3. 透过 GitHub/GitLab UI 建立 PR 并合并

# 4. 合并后删除分支
git checkout main
git pull origin main
git branch -d feature/user-profile
```

### 处理合并冲突

```bash
# 1. 使用 main 更新您的分支
git checkout feature/my-feature
git fetch origin
git merge origin/main

# 2. 在文件中解决冲突
# <<<<<<< HEAD
# 您的变更
# =======
# 传入的变更
# >>>>>>> origin/main

# 3. 暂存已解决的文件
git add resolved-file.js

# 4. 完成合并
git commit -m "chore: resolve merge conflicts with main"

# 5. 测试并推送
npm test
git push origin feature/my-feature
```

---

## 组态侦测

本技能支援项目特定的工作流程组态。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 是否有「Git Workflow」或「Branching Strategy」章节
2. 若找到，使用指定的策略（GitFlow / GitHub Flow / Trunk-Based）
3. 若未找到，**预设使用 GitHub Flow** 以保持简单

### 首次设置

若未找到组态：

1. 询问使用者：「本项目尚未设置 Git 工作流程策略。您偏好哪一种？（GitFlow / GitHub Flow / Trunk-Based）」
2. 选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Git 工作流程

### 分支策略
本项目使用 **[所选选项]**。

### 分支命名
格式：`<type>/<description>`
范例：`feature/oauth-login`、`fix/memory-leak`

### 合并策略
- 功能分支：**[Squash / Merge commit / Rebase]**
```

---

## 下一步引导

`/git-flow` 完成后，AI 助手应建议：

> **Git 工作流程已设置。建议下一步：**
> - 执行 `git checkout -b feature/<描述>` 创建功能分支开始开发 ⭐ **推荐** — 立即套用所选的分支策略
> - 执行 `/commit` 学习提交消息规范 — 确保提交消息格式一致
> - 执行 `/checkin` 了解签入质量门槛 — 在提交前确保代码质量

---

## 相关标准

- [Git 工作流程](../../../../core/git-workflow.md) - 核心 Git 工作流程标准
- [提交消息指南](../../../../core/commit-message-guide.md) - 提交消息规范
- [签入标准](../../../../core/checkin-standards.md) - 提交前质量关卡

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本技能采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
