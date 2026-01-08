---
source: ../../../../../skills/claude-code/ai-collaboration-standards/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# AI 协作标准

> **语言**: [English](../../../../../skills/claude-code/ai-collaboration-standards/SKILL.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

此技能确保 AI 助理提供准确、基于证据的回应，避免产生幻觉。

## 快速参考

### 确定性标签

| 标签 | 使用时机 |
|-----|----------|
| `[Confirmed]` | 来自程式码/文件的直接证据 |
| `[Inferred]` | 基于证据的逻辑推论 |
| `[Assumption]` | 基于常见模式（需要验证） |
| `[Unknown]` | 资讯不可用 |
| `[Need Confirmation]` | 需要使用者澄清 |

### 来源类型

| 来源类型 | 标签 | 可靠性 |
|-------------|-----|-------------|
| 专案程式码 | `[Source: Code]` | ⭐⭐⭐⭐⭐ 最高 |
| 专案文件 | `[Source: Docs]` | ⭐⭐⭐⭐ 高 |
| 外部文件 | `[Source: External]` | ⭐⭐⭐⭐ 高 |
| 网路搜寻 | `[Source: Search]` | ⭐⭐⭐ 中等 |
| AI 知识 | `[Source: Knowledge]` | ⭐⭐ 低 |
| 使用者提供 | `[Source: User]` | ⭐⭐⭐ 中等 |

### 核心规则

1. **仅基于证据**: 只分析已明确读取的内容
2. **引用来源**: 包含程式码参考的档案路径和行号
3. **分类确定性**: 为所有陈述标记确定性等级
4. **永远提供建议**: 在呈现选项时，包含建议选择及其理由

## 详细指南

完整标准请参阅：
- [防幻觉指南](./anti-hallucination.md)
- [确定性标签参考](./certainty-labels.md)

## 范例

### ✅ 正确回应

```
[Confirmed] src/auth/service.ts:45 - JWT 验证使用 'jsonwebtoken' 函式库
[Inferred] 基于 src/repositories/ 中的储存库模式，可能使用依赖注入
[Need Confirmation] 新功能是否应支援多租户？
```

### ❌ 错误回应

```
系统使用 Redis 进行快取（程式码未审查）
UserService 应该有 authenticate() 方法（API 未验证）
```

### ✅ 正确选项呈现

```
有三个选项：
1. Redis 快取
2. 记忆体快取
3. 档案快取

**建议：选项 1 (Redis)**：鉴于专案已有 Redis 基础设施
且需要跨实例快取共享，Redis 是最合适的选择。
```

### ❌ 错误选项呈现

```
有三个选项：
1. Redis 快取
2. 记忆体快取
3. 档案快取

请选择一个。
```

## 检查清单

在做出任何陈述之前：

- [ ] 来源已验证 - 我是否已读取实际档案/文件？
- [ ] 来源类型已标记 - 我是否指定了 `[Source: Code]`、`[Source: External]` 等？
- [ ] 参考已引用 - 我是否包含了档案路径和行号？
- [ ] 确定性已分类 - 我是否标记为 `[Confirmed]`、`[Inferred]` 等？
- [ ] 无捏造 - 我是否避免了虚构 API、设定或需求？
- [ ] 包含建议 - 在呈现选项时，我是否包含了建议选择？

---

## 设定检测

此技能支援专案特定的确定性标签语言设定。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的「Certainty Tag Language」章节
2. 如果找到，使用指定的语言（English / 中文）
3. 如果未找到，**预设使用英文**标签

### 首次设定

如果未找到设定且情境不明确：

1. 询问使用者：「此专案尚未设定确定性标签语言偏好。您想使用哪一种？（English / 中文）」
2. 使用者选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Certainty Tag Language

This project uses **[English / 中文]** certainty tags.
<!-- Options: English | 中文 -->
```

### 设定范例

在专案的 `CONTRIBUTING.md` 中：

```markdown
## Certainty Tag Language

This project uses **English** certainty tags.

### Tag Reference
- [Confirmed] - Direct evidence from code/docs
- [Inferred] - Logical deduction from evidence
- [Assumption] - Based on common patterns
- [Unknown] - Information not available
- [Need Confirmation] - Requires user clarification
```

---

## 相关标准

- [防幻觉标准](../../core/anti-hallucination.md)
- [程式码审查检查清单](../../core/code-review-checklist.md)
- [测试标准](../../core/testing-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

此技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
