---
source: /skills/claude-code/git-workflow-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
name: git-workflow-guide
description: |
  指导 Git 分支策略、分支命名与合并操作。
  使用时机：建立分支、合并、Pull Request、Git 工作流程问题。
  关键字：branch, merge, PR, pull request, GitFlow, GitHub Flow, 分支, 合并, 工作流程。
---

# Git 工作流程指南

> **语言**: [English](../../../../../skills/claude-code/git-workflow-guide/SKILL.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

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
| `refactor/` | 程式码重构 | `refactor/extract-service` |
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

## 建立分支前检查清单

建立新分支前：

1. **检查未合并的分支**
   ```bash
   git branch --no-merged main
   ```

2. **同步最新程式码**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **验证测试通过**
   ```bash
   npm test  # 或您专案的测试指令
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

# 2. 在档案中解决冲突
# <<<<<<< HEAD
# 您的变更
# =======
# 传入的变更
# >>>>>>> origin/main

# 3. 暂存已解决的档案
git add resolved-file.js

# 4. 完成合并
git commit -m "chore: resolve merge conflicts with main"

# 5. 测试并推送
npm test
git push origin feature/my-feature
```

---

## 组态侦测

本技能支援专案特定的工作流程组态。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 是否有「Git Workflow」或「Branching Strategy」章节
2. 若找到，使用指定的策略（GitFlow / GitHub Flow / Trunk-Based）
3. 若未找到，**预设使用 GitHub Flow** 以保持简单

### 首次设定

若未找到组态：

1. 询问使用者：「本专案尚未设定 Git 工作流程策略。您偏好哪一种？（GitFlow / GitHub Flow / Trunk-Based）」
2. 选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Git 工作流程

### 分支策略
本专案使用 **[所选选项]**。

### 分支命名
格式：`<type>/<description>`
范例：`feature/oauth-login`、`fix/memory-leak`

### 合并策略
- 功能分支：**[Squash / Merge commit / Rebase]**
```

---

## 相关标准

- [Git 工作流程](../../core/git-workflow.md)
- [提交讯息指南](../../core/commit-message-guide.md)
- [签入标准](../../core/checkin-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本技能采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
