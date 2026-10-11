---
source: ../../../../skills/ai-collaboration-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-10-11
source_hash: 88f0d922412f
status: current
description: |
  防止 AI 幻觉，确保分析代码或提出建议时给出以证据为基础的回应。
  Use when: 分析代码、提出建议、提供选项，或用户询问把握度／确定性时。
  Not for: 编写 AI 指令文件本身——请用 /ai-instruction-standards；审查具体的 diff——请用 /code-review。
  Keywords: certainty, assumption, inference, evidence, source, 证据, 假设, 推论, 确定性, 反幻觉.
---

# AI 协作标准

> **语言**: [English](../../../../skills/ai-collaboration-standards/SKILL.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-01-25
**适用范围**: Claude Code Skills

---

## AI 技能层级

此技能是三层 AI 协作体系的一部分：

| 层级 | 技能 | 回答的问题 | 回答的问题（英文） |
|-------|-------|-------------------|-----------|
| **行为**（即时） | `/ai-collaboration`（本技能） | 「AI 如何准确回应？」 | "How should AI respond accurately?" |
| **配置**（会话） | `/ai-instruction-standards` | 「CLAUDE.md 该写什么？」 | "What to write in CLAUDE.md?" |
| **架构**（长期） | `/ai-friendly-architecture` | 「如何让项目对 AI 友好？」 | "How to structure code for AI?" |

## 目的

此技能确保 AI 助理提供准确、基于证据的响应，避免产生幻觉。

## 快速参考

### 统一标签体系

此技能使用两类互补的标签：

**第一类：确定性标签**（用于分析既有内容）

| 标签 | 使用时机 |
|-----|----------|
| `[Confirmed]` | 来自程序码/文件的直接证据 |
| `[Inferred]` | 基于证据的逻辑推论 |
| `[Assumption]` | 基于常见模式（需要验证） |
| `[Unknown]` | 信息不可用 |
| `[Need Confirmation]` | 需要使用者澄清 |

**第二类：推导标签**（用于生成新内容）

| 标签 | 使用时机 |
|-----|----------|
| `[Source]` | 直接来自规格/需求的内容 |
| `[Derived]` | 由来源内容转换而来 |
| `[Generated]` | AI 生成的结构 |
| `[TODO]` | 需要人工实现 |

**何时使用哪一类**：

| 工作流程 | 主要标签 |
|----------|--------------|
| 代码分析 | 确定性标签 |
| 逆向工程 | 确定性标签 |
| 正向推导 | 推导标签 |
| 规格生成 | 推导标签 |

### 来源类型

| 来源类型 | 标签 | 可靠性 |
|-------------|-----|-------------|
| 项目程序码 | `[Source: Code]` | ⭐⭐⭐⭐⭐ 最高 |
| 项目文件 | `[Source: Docs]` | ⭐⭐⭐⭐ 高 |
| 外部文件 | `[Source: External]` | ⭐⭐⭐⭐ 高 |
| 网络搜寻 | `[Source: Search]` | ⭐⭐⭐ 中等 |
| AI 知识 | `[Source: Knowledge]` | ⭐⭐ 低 |
| 使用者提供 | `[Source: User]` | ⭐⭐⭐ 中等 |

### 核心规则

1. **仅基于证据**: 只分析已明确读取的内容
2. **引用来源**: 包含程序码参考的文件路径和行号
3. **分类确定性**: 为所有陈述标记确定性等级
4. **永远提供建议**: 在呈现选项时，包含建议选择及其理由

## 详细指南

完整标准请参阅：
- [防幻觉指南](./anti-hallucination.md)
- [确定性标签参考](./certainty-labels.md)

## 范例

### ✅ 正确响应

```
[Confirmed] src/auth/service.ts:45 - JWT 验证使用 'jsonwebtoken' 函式库
[Inferred] 基于 src/repositories/ 中的储存库模式，可能使用依赖注入
[Need Confirmation] 新功能是否应支援多租户？
```

### ❌ 错误响应

```
系统使用 Redis 进行快取（程序码未审查）
UserService 应该有 authenticate() 方法（API 未验证）
```

### ✅ 正确选项呈现

```
有三个选项：
1. Redis 快取
2. 记忆体快取
3. 文件快取

**建议：选项 1 (Redis)**：鉴于项目已有 Redis 基础设施
且需要跨实例快取共享，Redis 是最合适的选择。
```

### ❌ 错误选项呈现

```
有三个选项：
1. Redis 快取
2. 记忆体快取
3. 文件快取

请选择一个。
```

## 检查清单

在做出任何陈述之前：

- [ ] 来源已验证 - 我是否已读取实际文件/文件？
- [ ] 来源类型已标记 - 我是否指定了 `[Source: Code]`、`[Source: External]` 等？
- [ ] 参考已引用 - 我是否包含了文件路径和行号？
- [ ] 确定性已分类 - 我是否标记为 `[Confirmed]`、`[Inferred]` 等？
- [ ] 无捏造 - 我是否避免了虚构 API、设置或需求？
- [ ] 包含建议 - 在呈现选项时，我是否包含了建议选择？

---

## 设置检测

此技能支援项目特定的确定性标签语言设置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的「Certainty Tag Language」章节
2. 如果找到，使用指定的语言（English / 中文）
3. 如果未找到，**预设使用英文**标签

### 首次设置

如果未找到设置且情境不明确：

1. 询问使用者：「此项目尚未设置确定性标签语言偏好。您想使用哪一种？（English / 中文）」
2. 使用者选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Certainty Tag Language

This project uses **[English / 中文]** certainty tags.
<!-- Options: English | 中文 -->
```

### 设置范例

在项目的 `CONTRIBUTING.md` 中：

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

## 下一步引导

`/ai-collaboration` 完成后，AI 助手应建议：

> **AI 协作行为规范已掌握。建议下一步：**
> - 执行 `/ai-instruction-standards` 建立或更新 CLAUDE.md 等 AI 指令文件 ⭐ **推荐** — 将协作标准写入项目配置
> - 执行 `/ai-friendly-architecture` 设计 AI 友好架构 — 从长期架构层面优化 AI 协作
> - 执行 `/code-review` 运用确定性标签进行代码审查 — 实践基于证据的分析

---

## 相关标准

- [防幻觉标准](../../../../core/anti-hallucination.md)
- [程序码审查检查清单](../../../../core/code-review-checklist.md)
- [测试标准](../../../../core/testing-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.1.0 | 2026-01-25 | 新增：统一标签体系，包含确定性与推导两类标签 |
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

此技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
