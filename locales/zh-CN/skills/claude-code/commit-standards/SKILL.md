---
source: skills/claude-code/commit-standards/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
name: commit-standards
description: |
  遵循约定式提交标准格式化提交讯息。
  使用时机：撰写提交讯息、git commit、检视提交历史。
  关键字：commit、git、message、conventional、feat、fix、refactor。
---

# 提交讯息标准

> **语言**: [English](../../../../../skills/claude-code/commit-standards/SKILL.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

此技能确保遵循约定式提交标准，撰写一致且有意义的提交讯息。

## 快速参考

### 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型

| English | 使用时机 |
|---------|----------|
| `feat` | 新功能 |
| `fix` | 错误修正 |
| `refactor` | 程式码重构（无功能变更） |
| `docs` | 仅文件变更 |
| `style` | 格式调整（无程式码逻辑变更） |
| `test` | 新增或更新测试 |
| `perf` | 效能改善 |
| `build` | 建置系统或依赖项目 |
| `ci` | CI/CD 流程变更 |
| `chore` | 维护任务 |
| `revert` | 还原先前的提交 |
| `security` | 安全漏洞修正 |

### 主旨行规则

1. **长度**: ≤72 字元（50 为理想）
2. **时态**: 祈使语气（使用 "Add feature" 而非 "Added feature"）
3. **大小写**: 首字母大写
4. **无句点**: 结尾不加句点

## 详细指南

完整标准请参考：
- [约定式提交指南](./conventional-commits.md)
- [语言选项](./language-options.md)

## 范例

### ✅ 良好范例

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
```

### ❌ 不良范例

```
fixed bug                    # 太模糊，无范围
feat(auth): added google login  # 过去式
Update stuff.                # 有句点，模糊
WIP                          # 不具描述性
```

## 主体内容指南

使用主体内容说明变更的**原因（WHY）**：

```
fix(api): Resolve race condition in concurrent user updates

Why this occurred:
- Two simultaneous PUT requests could overwrite each other
- No optimistic locking implemented

What this fix does:
- Add version field to User model
- Return 409 Conflict if version mismatch

Fixes #789
```

## 破坏性变更

务必在页脚记录破坏性变更：

```
feat(api): Change user endpoint response format

BREAKING CHANGE: User API response format changed

Migration guide:
1. Update API clients to remove .data wrapper
2. Use created_at instead of createdAt
```

## 议题参照

```
Closes #123    # 自动关闭议题
Fixes #456     # 自动关闭议题
Refs #789      # 连结但不关闭
```

---

## 配置检测

此技能支援专案特定的语言配置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的「Commit Message Language」区段
2. 若找到，使用指定的选项（English / Traditional Chinese / Bilingual）
3. 若未找到，**预设使用 English** 以获得最大工具相容性

### 首次设定

若未找到配置且情境不明确：

1. 询问使用者：「此专案尚未配置提交讯息语言偏好。您想使用哪个选项？（English / 中文 / Bilingual）」
2. 使用者选择后，建议记录于 `CONTRIBUTING.md`：

```markdown
## Commit Message Language

This project uses **[chosen option]** commit types.
<!-- Options: English | Traditional Chinese | Bilingual -->
```

### 配置范例

在专案的 `CONTRIBUTING.md` 中：

```markdown
## Commit Message Language

This project uses **English** commit types.

### Allowed Types
feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security
```

---

## 相关标准

- [提交讯息指南](../../../../../core/commit-message-guide.md)
- [Git 工作流程](../../../../../core/git-workflow.md)
- [变更日志标准](../../../../../core/changelog-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2025-12-24 | 新增：标准区段（目的、相关标准、版本历史、授权） |

---

## 授权

此技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
