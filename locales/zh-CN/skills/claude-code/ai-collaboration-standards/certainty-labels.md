---
source: skills/claude-code/ai-collaboration-standards/certainty-labels.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 确定性标签参考

> **语言**: [English](../../../../../skills/claude-code/ai-collaboration-standards/certainty-labels.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供 AI 回应中使用的确定性标签和来源类型的参考。

---

## 标签对照表（英文 / 中文）

| English Tag | 中文标签 | 使用时机 |
|-------------|---------|----------|
| `[Confirmed]` | `[已确认]` | 来自程式码/文件的直接证据 |
| `[Inferred]` | `[推论]` | 基于证据的逻辑推论 |
| `[Assumption]` | `[假设]` | 基于常见模式（需要验证） |
| `[Unknown]` | `[未知]` | 资讯不可用 |
| `[Need Confirmation]` | `[待确认]` | 需要使用者澄清 |

---

## 来源类型

| 来源类型 | 标签 | 说明 | 可靠性 |
|-------------|-----|-------------|-------------|
| 专案程式码 | `[Source: Code]` | 直接从程式码库读取 | ⭐⭐⭐⭐⭐ 最高 |
| 专案文件 | `[Source: Docs]` | README、Wiki、行内注解 | ⭐⭐⭐⭐ 高 |
| 外部文件 | `[Source: External]` | 附带 URL 的官方文件 | ⭐⭐⭐⭐ 高 |
| 网路搜寻 | `[Source: Search]` | 搜寻结果（包含日期） | ⭐⭐⭐ 中等 |
| AI 知识 | `[Source: Knowledge]` | AI 训练资料（需要验证） | ⭐⭐ 低 |
| 使用者提供 | `[Source: User]` | 来自使用者对话的资讯 | ⭐⭐⭐ 中等 |

---

## 使用范例

### 在技术文件中

```markdown
## 系统架构分析

`[Confirmed]` 系统使用 ASP.NET Core 8.0 框架 [Source: Code] Program.cs:1
`[Confirmed]` 资料库使用 SQL Server [Source: Code] appsettings.json:12
`[Inferred]` 基于 Repository Pattern 的使用，系统可能采用 DDD 架构
`[Assumption]` 快取机制可能使用 Redis（需要确认设定）
`[Need Confirmation]` 是否应该支援多租户？
```

### 在程式码审查中

```markdown
## 审查意见

`[Confirmed]` src/Services/AuthService.cs:45 - 密码验证缺乏暴力破解防护
`[Inferred]` 这里可能需要速率限制
`[Need Confirmation]` 是否已有其他层级的防护机制？
```

---

## 最佳实践

### 1. 一致性

- 在整个文件中使用相同语言的标签（全中文或全英文）
- 团队应在 `CONTRIBUTING.md` 中指定偏好语言

### 2. 来源引用

- 中文标签仍需要来源引用
- 格式：`[已确认]` 陈述 [Source: Code] file_path:line_number

### 3. 团队协议

- 在专案开始时决定使用中文或英文标签
- 记录在 `CONTRIBUTING.md` 或 `.standards/` 目录中

---

## 快速决策指南

```
你是否读取了实际的程式码/文件？
├── 是 → [Confirmed] / [已确认]
└── 否
    ├── 你能从现有证据推论吗？
    │   ├── 是 → [Inferred] / [推论]
    │   └── 否
    │       ├── 这是常见模式吗？
    │       │   ├── 是 → [Assumption] / [假设]
    │       │   └── 否 → [Unknown] / [未知]
    └── 使用者需要澄清吗？
        └── 是 → [Need Confirmation] / [待确认]
```

---

## 相关标准

- [防幻觉指南](./anti-hallucination.md)
- [防幻觉标准](../../../core/anti-hallucination.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权条款） |

---

## 授权条款

本文件依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 释出。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
