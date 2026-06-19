---
source: options/code-review/pr-review.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Pull Request 审查

> **语言**: [English](../../../../options/code-review/pr-review.md) | 简体中文

**上层标准**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## 概览

Pull Request（PR）审查是传统的异步代码审查流程，在合并前先提交变更以供审查。它提供有文档记录的审计轨迹，并且很适合分布式团队。

## 最适用于

- 横跨不同时区的分布式团队
- 异步工作流程
- 需要审计轨迹的项目
- 开源项目
- 合规与法规要求

## 工作流程

### 1. 创建 Pull Request

**作者职责：**
- 撰写清晰、具描述性的 PR 标题
- 加入完整的描述
- 链接相关 issue
- 指派适当的 reviewer
- 确保 CI 检查通过

### 2. 审查

**Reviewer 职责：**
- 检查功能与正确性
- 审查代码质量与风格
- 验证安全考量
- 必要时在本地执行测试
- 提供建设性的反馈

### 3. 回应反馈

**作者职责：**
- 处理所有反馈意见
- 以新的 commit 推送修正
- 回复评论
- 准备好后请求重新审查

### 4. Approve 并合并

**最后步骤：**
- 取得必要的 approval
- 确保所有检查通过
- 使用约定的策略合并
- 删除 feature 分支

## 审查检查清单

### 功能

- [ ] 代码是否正常运作？
- [ ] 是否处理了边界情况？
- [ ] 错误处理是否适当？

### 代码质量

- [ ] 代码是否易读？
- [ ] 函数是否聚焦（单一职责）？
- [ ] 是否有代码重复？
- [ ] 命名是否具描述性？

### 安全

- [ ] 是否有 injection 漏洞？
- [ ] 输入是否经过验证？
- [ ] 是否有凭证泄露？
- [ ] 依赖包是否安全？

### 测试

- [ ] 是否有足够的测试？
- [ ] 测试是否涵盖边界情况？
- [ ] 测试是否易读且易维护？

## 评论惯例

### 前缀风格

| 前缀 | 含义 | 是否阻挡 |
|--------|---------|----------|
| `[REQUIRED]` | 合并前必须修正 | 是 |
| `[SUGGESTION]` | 考虑修改 | 否 |
| `[QUESTION]` | 需要澄清 | 否 |
| `[NIT]` | 细微的风格问题 | 否 |
| `[PRAISE]` | 做得好 | 否 |

### Emoji 风格

| Emoji | 含义 |
|-------|---------|
| ❗ | 阻挡性问题 |
| ⚠️ | 建议 |
| 💡 | 想法 |
| ❓ | 问题 |
| 👍 | 赞赏 |

## PR 模板

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
```

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| 及时审查 | 在 24 小时内审查 | Recommended |
| 建设性反馈 | 说明原因，而不只是说明内容 | Required |
| Approve 前先测试 | 确保所有测试通过 | Required |
| 最少 reviewer 数 | 至少需要一个 approval | Required |

## 与其他方法的比较

| 方面 | PR Review | Pair Programming |
|--------|-----------|------------------|
| 时机 | 异步 | 实时 |
| 反馈 | 延迟 | 立即 |
| 知识分享 | 中等 | 高 |
| 文档记录 | 较高（PR 评论） | 较低 |
| 可扩展性 | 高 | 有限 |
| 远程友好度 | 容易 | 具挑战性 |

## 相关选项

- [Pair Programming](./pair-programming.md) - 实时协作审查
- [Automated Review](./automated-review.md) - 工具辅助审查

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
