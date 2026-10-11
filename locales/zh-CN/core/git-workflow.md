---
source: ../../../core/git-workflow.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-10-11
source_hash: dbbce0815e5e
status: current
---

> **语言**: [English](../../../core/git-workflow.md) | [繁體中文](../../zh-TW/core/git-workflow.md) | 简体中文

# Git 工作流程标准

**版本**: 1.4.0
**最后更新**: 2026-01-29
**适用范围**: 所有使用 Git 进行版本控制的项目
**范围**: 通用 (universal)
**业界标准**: 无（业界通用实践）
**参考资料**: [atlassian.com](https://www.atlassian.com/git/tutorials)

> **详细说明与教程，请参阅 [Git 工作流程指南](../../../core/guides/git-workflow-guide.md)**

---

## 目的

本标准定义 Git 分支策略和工作流程，确保团队与项目之间具有一致且可预期的协作模式。

---

## 工作流程策略选择

**项目必须选择一种**工作流程策略并清楚记录。

| 因素 | GitFlow | GitHub Flow | Trunk-Based |
|------|---------|-------------|-------------|
| **发布频率** | 每月以上 | 每周 | 每天多次 |
| **团队规模** | 大型（10+） | 中型（5-15） | 中小型（3-10） |
| **CI/CD 成熟度** | 基础 | 中级 | 高级 |
| **功能开关** | 可选 | 可选 | 必需 |
| **复杂度** | 高 | 低 | 中 |

---

## 分支类型

### GitFlow 分支类型

| 分支类型 | 用途 | 基础分支 | 合并目标 | 生命周期 |
|----------|------|----------|----------|----------|
| `main` | 生产代码 | - | - | 永久 |
| `develop` | 集成分支 | - | - | 永久 |
| `feature/*` | 新功能 | `develop` | `develop` | 临时 |
| `release/*` | 发布准备 | `develop` | `main` + `develop` | 临时 |
| `hotfix/*` | 紧急修复 | `main` | `main` + `develop` | 临时 |

### GitHub Flow 分支类型

| 分支类型 | 用途 | 基础分支 | 合并目标 | 生命周期 |
|----------|------|----------|----------|----------|
| `main` | 生产代码 | - | - | 永久 |
| `feature/*` | 新功能 | `main` | `main` | 临时 |
| `bugfix/*` | Bug 修复 | `main` | `main` | 临时 |
| `hotfix/*` | 紧急修复 | `main` | `main` | 临时 |

### Trunk-Based 分支类型

| 分支类型 | 用途 | 基础分支 | 合并目标 | 生命周期 |
|----------|------|----------|----------|----------|
| `main` | 主干 | - | - | 永久 |
| `feature/*` | 小型变更 | `main` | `main` | ≤2 天 |

---

## 分支命名规范

### 标准格式

```
<type>/<short-description>
```

### 类型

| 类型 | 用途 | 示例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` 或 `bugfix/` | Bug 修复 | `fix/memory-leak` |
| `hotfix/` | 紧急生产修复 | `hotfix/security-patch` |
| `refactor/` | 代码重构 | `refactor/extract-service` |
| `docs/` | 仅文档 | `docs/api-reference` |
| `test/` | 新增测试 | `test/integration-tests` |
| `chore/` | 维护任务 | `chore/update-dependencies` |
| `release/` | 发布准备（GitFlow） | `release/v1.2.0` |

### 命名规则

1. **使用小写**
2. **使用连字符代替空格**
3. **具描述性但保持简洁**
4. **避免仅以 issue 编号作为标识**

---

## 合并策略

每种分支类型**项目必须选择一种**策略。

| 策略 | 命令 | 最适合 | 优点 | 缺点 |
|------|------|--------|------|------|
| **Merge Commit** | `git merge --no-ff` | GitFlow、长期功能分支 | 完整历史，易于还原 | 日志杂乱 |
| **Squash Merge** | `git merge --squash` | GitHub Flow、功能分支 | 历史干净，每个功能一个提交 | 丢失细节 |
| **Rebase + FF** | `git rebase && git merge --ff-only` | Trunk-Based、短期分支 | 线性历史，保留提交 | 改写历史 |

---

## 创建分支前检查清单

创建新分支前，请完成以下检查：

### 适用于 GitFlow 与 GitHub Flow

- [ ] 检查未合并的分支：`git branch --no-merged main`
- [ ] 同步最新代码：`git checkout main && git pull origin main`
- [ ] 确认测试通过：运行项目测试套件
- [ ] 创建分支：`git checkout -b feature/description`

### 适用于 Trunk-Based Development

- [ ] 同步最新代码：`git checkout main && git pull origin main`（关键）
- [ ] 确认测试通过（关键）
- [ ] 创建短期分支：`git checkout -b feature/description`

---

## 冲突解决

### 预防检查清单

- [ ] 经常与基础分支同步
- [ ] 保持分支小型化（避免长期存在的功能分支）
- [ ] 重大重构需告知团队

### 解决步骤

```bash
git checkout main && git pull origin main
git checkout feature/my-feature && git merge main
# Resolve conflicts in marked files
git add resolved-file.js
git commit -m "chore: resolve merge conflicts with main"
npm test  # Verify
git push origin feature/my-feature
```

---

## 标签与发布

### 语义化版本

```
MAJOR.MINOR.PATCH
```

| 组成部分 | 何时递增 | 示例 |
|----------|----------|------|
| **MAJOR** | 破坏性变更 | v2.0.0 |
| **MINOR** | 新功能（向后兼容） | v1.2.0 |
| **PATCH** | Bug 修复（向后兼容） | v1.2.1 |

### 预发布版本

| 类型 | 格式 | 示例 |
|------|------|------|
| Alpha | `X.Y.Z-alpha.N` | v1.2.0-alpha.1 |
| Beta | `X.Y.Z-beta.N` | v1.2.0-beta.2 |
| RC | `X.Y.Z-rc.N` | v1.2.0-rc.1 |

### 创建标签

```bash
git tag -a v1.2.0 -m "Release version 1.2.0: Add OAuth2 support"
git push origin v1.2.0
```

---

## 受保护分支

### `main`/`develop` 建议保护设置

| 设置 | 必需 |
|------|------|
| 要求 Pull Request 审查 | ✅（1-2 位审查者） |
| 要求状态检查通过 | ✅（CI 测试、lint） |
| 要求分支保持最新 | ✅ |
| 包含管理员 | ✅ |
| 允许强制推送 | ❌ |
| 允许删除 | ❌ |

---

## Pull Request 工作流程

### PR 创建检查清单

- [ ] **标题遵循提交规范**（例如 `feat(auth): add OAuth2`）
- [ ] **描述说明原因**（不只是做了什么）
- [ ] **关联 issue**（例如 "Closes #123"）
- [ ] **新功能包含测试**
- [ ] **必要时更新文档**
- [ ] **在描述中标明破坏性变更**
- [ ] **UI 变更附上截图/GIF**

### PR 类型参考

| 类型 | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add OAuth2 login` |
| `fix` | Bug 修复 | `fix(api): handle null response` |
| `docs` | 文档 | `docs(readme): update install steps` |
| `refactor` | 代码重构 | `refactor(utils): extract validation` |
| `test` | 新增测试 | `test(auth): add login unit tests` |
| `chore` | 维护 | `chore(deps): update lodash` |
| `perf` | 性能 | `perf(query): optimize user lookup` |

---

## 相关标准

- [提交信息指南](commit-message-guide.md)
- [代码签入标准](checkin-standards.md)
- [版本控制标准](versioning.md)
- [变更日志标准](changelog-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.4.0 | 2026-01-29 | 重构：拆分为规则 + 指南，将教程移至指南 |
| 1.3.0 | 2026-01-24 | 新增：Trunk-Based + 功能开关整合、Ship/Show/Ask 决策模型、Stacked PRs 工作流程 |
| 1.2.1 | 2025-12-24 | 新增：相关标准章节 |
| 1.2.0 | 2025-12-16 | 新增：决策树、选择矩阵 |
| 1.1.0 | 2025-12-08 | 新增创建分支前检查清单章节 |
| 1.0.0 | 2025-11-12 | 初始 Git 工作流程标准 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
