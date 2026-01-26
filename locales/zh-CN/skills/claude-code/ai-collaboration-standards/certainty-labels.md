---
source: skills/claude-code/ai-collaboration-standards/certainty-labels.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-25
status: current
---

# 确定性标签參考

> **语言**: [English](../../../../../skills/claude-code/ai-collaboration-standards/certainty-labels.md) | 简体中文

**版本**: 1.1.0
**最後更新**: 2026-01-25
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供 AI 响应中使用的确定性标签和來源类型的參考。

---

## 标签对照表（英文 / 中文）

| English Tag | 中文标签 | 使用时机 |
|-------------|---------|----------|
| `[Confirmed]` | `[已确认]` | 來自程序码/文件的直接证据 |
| `[Inferred]` | `[推論]` | 基於证据的邏辑推論 |
| `[Assumption]` | `[假设]` | 基於常見模式（需要验证） |
| `[Unknown]` | `[未知]` | 信息不可用 |
| `[Need Confirmation]` | `[待确认]` | 需要使用者澄清 |

---

## 來源类型

| 來源类型 | 标签 | 说明 | 可靠性 |
|-------------|-----|-------------|-------------|
| 项目程序码 | `[Source: Code]` | 直接從程序码庫读取 | ⭐⭐⭐⭐⭐ 最高 |
| 项目文件 | `[Source: Docs]` | README、Wiki、行內註解 | ⭐⭐⭐⭐ 高 |
| 外部文件 | `[Source: External]` | 附帶 URL 的官方文件 | ⭐⭐⭐⭐ 高 |
| 网络搜尋 | `[Source: Search]` | 搜尋結果（包含日期） | ⭐⭐⭐ 中等 |
| AI 知識 | `[Source: Knowledge]` | AI 訓练数据（需要验证） | ⭐⭐ 低 |
| 使用者提供 | `[Source: User]` | 來自使用者对话的信息 | ⭐⭐⭐ 中等 |

---

## 使用範例

### 在技術文件中

```markdown
## 系统架構分析

`[Confirmed]` 系统使用 ASP.NET Core 8.0 框架 [Source: Code] Program.cs:1
`[Confirmed]` 数据庫使用 SQL Server [Source: Code] appsettings.json:12
`[Inferred]` 基於 Repository Pattern 的使用，系统可能採用 DDD 架構
`[Assumption]` 快取机制可能使用 Redis（需要确认设置）
`[Need Confirmation]` 是否应該支援多租戶？
```

### 在程序码审查中

```markdown
## 审查意見

`[Confirmed]` src/Services/AuthService.cs:45 - 密码验证缺乏暴力破解防護
`[Inferred]` 这里可能需要速率限制
`[Need Confirmation]` 是否已有其他层级的防護机制？
```

---

## 最佳实踐

### 1. 一致性

- 在整个文件中使用相同语言的标签（全中文或全英文）
- 团队应在 `CONTRIBUTING.md` 中指定偏好语言

### 2. 來源引用

- 中文标签仍需要來源引用
- 格式：`[已确认]` 陳述 [Source: Code] file_path:line_number

### 3. 团队協議

- 在项目開始时决定使用中文或英文标签
- 记录在 `CONTRIBUTING.md` 或 `.standards/` 目录中

---

## 快速决策指南

```
你是否读取了实际的程序码/文件？
├── 是 → [Confirmed] / [已确认]
└── 否
    ├── 你能從現有证据推論嗎？
    │   ├── 是 → [Inferred] / [推論]
    │   └── 否
    │       ├── 这是常見模式嗎？
    │       │   ├── 是 → [Assumption] / [假设]
    │       │   └── 否 → [Unknown] / [未知]
    └── 使用者需要澄清嗎？
        └── 是 → [Need Confirmation] / [待确认]
```

---

## 相关标准

- [防幻覺指南](./anti-hallucination.md)
- [防幻覺标准](../../../core/anti-hallucination.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权条款） |

---

## 授权条款

本文件依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
