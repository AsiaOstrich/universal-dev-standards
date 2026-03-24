---
source: ../../../core/project-context-memory.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/project-context-memory.md) | 简体中文

# 项目情境记忆标准

**版本**: 1.1.0
**最后更新**: 2026-03-16
**适用范围**: 所有使用 AI 助手的软件项目
**范围**: uds-specific

---

## 目的

本标准定义一个结构化系统，用于捕获、检索和执行**项目特定的**上下文、架构决策和领域知识。与开发者记忆（通用且可迁移的）不同，项目情境记忆充当特定代码库的"长期大脑"，确保 AI 助手遵守本地惯例和历史决策。

---

## 快速参考

### 记忆条目模式

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | string | 唯一标识符（`PRJ-YYYY-NNNN`） |
| `type` | enum | `decision` / `convention` / `structure` / `glossary` |
| `summary` | string | 上下文的单行摘要 |
| `status` | enum | `active` / `proposed` / `deprecated` |
| `scope` | list | 此规则适用的文件或目录 |

### 存储位置

条目存储为**带有 YAML Frontmatter 的 Markdown**，确保人类可读性（文档）和机器可解析性。

- **目录**: `.project-context/`
- **格式**: `.md` 文件

---

## 1. 记忆模式

### 1.1 完整模式定义

```markdown
---
id: "PRJ-2026-0001"              # 必需：唯一 ID
type: decision                   # 必需：类别
status: active                   # 必需：active | proposed | deprecated
created_at: "2026-02-09"         # 必需：ISO 日期
confidence: 1.0                  # 必需：0.0–1.0

# 范围与触发器（情境感知）
scope:                           # 此规则适用的位置
  - "src/api/**"
  - "src/services/**"
triggers:                        # 唤醒此记忆的关键字/模式
  - "错误处理"
  - "API 响应"
---

# [摘要标题]

## 决策
[描述决策内容]

## 原因
[为什么做出这个决策]

## 影响
[这个决策影响什么]
```

---

## 2. 记忆类型

| 类型 | 描述 | 示例 |
|------|------|------|
| `decision` | 架构或技术决策 | "使用 PostgreSQL 而非 MongoDB" |
| `convention` | 编码惯例或风格 | "所有 API 返回包含 `data` 和 `error` 字段" |
| `structure` | 项目结构规则 | "测试文件与源文件在同一目录" |
| `glossary` | 领域术语定义 | "用户 = 付费客户，访客 = 未注册用户" |

---

## 3. 记忆检索

### 3.1 自动激活

AI 助手在处理请求时，应自动检查：

1. 当前编辑文件是否在某条记忆的 `scope` 范围内
2. 用户请求中是否包含某条记忆的 `triggers` 关键字
3. 任务类型是否与某条记忆的 `type` 匹配

### 3.2 手动查询

```bash
# 查看所有活跃记忆
ls .project-context/*.md

# 搜索特定主题
grep -l "API" .project-context/*.md
```

---

## 相关标准

- [情境感知加载](context-aware-loading.md)
- [开发者记忆](../../../core/developer-memory.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
