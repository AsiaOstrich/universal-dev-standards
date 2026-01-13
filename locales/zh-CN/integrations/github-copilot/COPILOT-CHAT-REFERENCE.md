---
source: ../../../../integrations/github-copilot/COPILOT-CHAT-REFERENCE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Copilot Chat 参考指南

本文档提供 GitHub Copilot Chat 的提示模板，以实现类似 Claude Code 斜杠命令的功能。

---

## 为什么需要这份文档？

GitHub Copilot 不支持像 Claude Code 那样的斜杠命令。此参考提供标准化提示，让您在 Copilot Chat 中实现类似效果。

---

## 提示模板

### 1. 生成 Commit 消息

**Claude Code**：`/commit`

**Copilot Chat 提示**：
```
为这些变更生成 commit 消息，遵循 Conventional Commits 格式：
- 类型：feat, fix, docs, style, refactor, test 或 chore
- 格式：type(scope): description
- 主题行保持在 50 字符以内
```

**示例**：
```
为我刚才对认证模块的变更生成 commit 消息。
使用 Conventional Commits 格式：type(scope): description
```

---

### 2. 代码审查

**Claude Code**：`/review`

**Copilot Chat 提示**：
```
按照代码审查检查清单审查此代码：

1. 功能 - 是否正确运行？
2. 设计 - 架构正确？
3. 质量 - 代码干净，无坏味道？
4. 安全 - 无漏洞？
5. 测试 - 覆盖率足够？
6. 性能 - 高效？

使用这些评论前缀：
- ❗ 阻塞：必须修复
- ⚠️ 重要：应该修复
- 💡 建议：可有可无
- ❓ 问题：需要澄清
```

---

### 3. TDD 指导

**Claude Code**：`/tdd`

**Copilot Chat 提示**：
```
使用 TDD（测试驱动开发）帮我实现 [功能]：

1. 红灯：先写失败的测试
   - 测试应描述行为，非实现
   - 使用 AAA 模式（Arrange-Act-Assert）

2. 绿灯：写最小代码通过测试
   - "假实现"可接受
   - 不要过度设计

3. 重构：保持测试通过的同时清理代码
   - 每次变更后运行测试

遵循 FIRST 原则：快速、独立、可重复、自验证、及时
```

---

### 4. 测试覆盖分析

**Claude Code**：`/coverage`

**Copilot Chat 提示**：
```
使用 7 维度分析 [功能] 的测试覆盖：

1. 正常路径 - 正常预期行为
2. 边界 - 最小/最大值、限制
3. 错误处理 - 无效输入、异常
4. 授权 - 角色访问控制
5. 状态变更 - 前/后验证
6. 验证 - 格式、业务规则
7. 集成 - 真实 DB/API 查询

哪些维度缺失？我应该新增什么测试？
```

---

### 5. 需求撰写

**Claude Code**：`/requirement`

**Copilot Chat 提示**：
```
帮我按照 INVEST 条件撰写用户故事：

格式：
作为一个 [角色]，
我想要 [功能]，
以便 [效益]。

INVEST 检查清单：
- 独立：可单独交付？
- 可协商：细节可讨论？
- 有价值：提供用户价值？
- 可估计：可估算工作量？
- 小：一个 Sprint 内完成？
- 可测试：有明确验收条件？

包含具体、可衡量的验收条件。
```

---

### 6. 签入前检查

**Claude Code**：`/check`

**Copilot Chat 提示**：
```
在我提交前，验证这些质量关卡：

□ 构建：代码编译无错误？
□ 测试：所有测试通过？
□ 质量：代码遵循标准？有机密吗？
□ 文档：已更新文档？
□ 工作流程：分支命名和 commit 消息正确？

如果有以下情况，我不应该提交：
- 构建错误
- 测试失败
- 功能不完整
- 含有调试代码（console.log）
- 含有注释掉的代码
```

---

### 7. 发布准备

**Claude Code**：`/release`

**Copilot Chat 提示**：
```
帮我按照语义化版本准备发布：

版本格式：MAJOR.MINOR.PATCH
- MAJOR：破坏性变更
- MINOR：新功能（向后兼容）
- PATCH：错误修复

任务：
1. 这应该是什么版本？
2. 生成 CHANGELOG 条目，包含：
   - Added：新功能
   - Changed：既有功能变更
   - Fixed：错误修复
   - Deprecated：即将移除的功能
   - Removed：已移除的功能
   - Security：安全修复
```

---

### 8. 文档撰写

**Claude Code**：`/docs`

**Copilot Chat 提示**：
```
帮我为这个 [函数/模块/API] 撰写文档：

包含：
1. 目的 - 它做什么？
2. 参数 - 输入参数与类型
3. 返回值 - 它返回什么
4. 示例 - 使用示例
5. 错误 - 可能的错误情况
6. 相关 - 相关函数/模块
```

---

## 快速参考卡

| 任务 | Copilot Chat 提示开头 |
|------|----------------------|
| Commit | "生成 commit 消息，遵循 Conventional Commits..." |
| 审查 | "按照检查清单审查此代码..." |
| TDD | "使用 TDD 帮我实现..." |
| 覆盖 | "使用 7 维度分析测试覆盖..." |
| 需求 | "按照 INVEST 撰写用户故事..." |
| 签入前 | "在提交前验证这些质量关卡..." |
| 发布 | "按照语义化版本准备发布..." |
| 文档 | "为此撰写文档..." |

---

## 最佳实践

### 1. 具体明确

```
❌ "审查此代码"
✅ "审查此认证模块的安全漏洞和测试覆盖"
```

### 2. 提供上下文

```
❌ "写测试"
✅ "为 calculateDiscount 函数写单元测试，涵盖边界值和错误情况"
```

### 3. 参考标准

```
"遵循项目的防幻觉标准，先阅读实际代码再验证你的建议"
```

### 4. 要求说明理由

```
"用 [已确认] 或 [假设] 标签解释你为什么做这个建议"
```

---

## 相关资源

- [copilot-instructions.md](./copilot-instructions.md) - 完整规范参考
- [skills-mapping.md](./skills-mapping.md) - Claude Code skills 对照

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-13 | 初始发布 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
