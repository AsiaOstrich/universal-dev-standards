---
source: ../../../../skills/pr-automation-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: |
  引导 Pull Request 创建、审查自动化和合并策略。
  使用时机：创建 PR、自动化审查、配置合并策略。
  关键字：pull request, PR, merge, review, GitHub, GitLab, 合并请求, 审查。
---

# PR 自动化助手

> **语言**: [English](../../../../skills/pr-automation-assistant/SKILL.md) | 简体中文

简化从创建到合并的 Pull Request 生命周期。

## PR 创建检查清单

| 项目 | 规则 |
|------|------|
| 标题 | `<type>(<scope>): <summary>`，70 字符内 |
| 描述 | 使用结构化模板 |
| 标签 | 至少一个分类标签 |
| 审查者 | 依 CODEOWNERS 或领域指派 |
| 分支 | 与基础分支同步 |

## PR 描述模板

```markdown
## 摘要
<1-3 个重点描述变更>

## 变更内容
- 新增 / 修改 / 移除 ...

## 测试计划
- [ ] 单元测试通过
- [ ] 手动验证步骤

## 截图
（如有 UI 变更）
```

## 合并策略决策

| 策略 | 使用时机 |
|------|----------|
| **Squash merge** | 功能分支，提交记录零散 |
| **Merge commit** | 发布分支，保留完整历史 |
| **Rebase** | 线性历史，小幅变更 |

## 自动审查触发条件

| 触发条件 | 阈值 | 动作 |
|----------|------|------|
| PR 大小 | > 400 行变更 | 要求拆分 |
| 无测试 | 0 个测试文件变更 | 阻止合并 |
| CI 失败 | 任何检查失败 | 阻止合并 |
| 过期 PR | > 7 天无活动 | 通知作者 |
| 草稿 PR | 标记为草稿 | 跳过审查者指派 |

## 工作流程

```
CREATE ──► REVIEW ──► APPROVE ──► MERGE ──► CLEANUP
```

## 使用方式

- `/pr` - 引导创建当前分支的 PR
- `/pr create` - 使用模板创建 PR
- `/pr --template` - 显示 PR 描述模板
- `/pr review 123` - 审查特定 PR

## 下一步引导

`/pr` 完成后，AI 助手应建议：

> **PR 操作完成。建议下一步：**
> - 执行 `/review` 进行详细代码审查
> - 执行 `/commit` 修正审查发现的问题
> - 执行 `/changelog` 更新变更日志
> - 检查 CI 状态 → `gh pr checks`

## 参考

- 核心规范：[code-review-checklist.md](../../../../core/code-review-checklist.md)
- 核心规范：[git-workflow.md](../../../../core/git-workflow.md)
