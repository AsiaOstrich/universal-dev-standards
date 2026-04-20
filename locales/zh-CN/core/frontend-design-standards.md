---
source: ../../../core/frontend-design-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 前端设计标准

> **语言**: [English](../../../core/frontend-design-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-13
**状态**: Active
**适用范围**: 所有具备前端用户界面的项目
**参考**: DEC-029（awesome-design-md, MIT）、DEC-030（OpenAI Frontend Guide）

---

## 目的

本标准定义一套机器可读的前端设计规格格式（DESIGN.md），用于 AI 辅助开发。建立 9 段式 DESIGN.md 结构、强制设计 token 词汇、UI 硬性约束，以及反模式拒绝规则。

目标是通过结构化设计约束（而非自由形式的风格描述）确保 AI Agent 在不同执行情境下产生一致、高质量的 UI。

**核心原则**：
- DESIGN.md 是设计规格的唯一真实来源
- 语义化 token 命名（框架无关）
- 约束式提示：自由度越少 = UI 质量越高
- 与源代码同步进行版本控制

---

## DESIGN.md 结构

DESIGN.md 是放在项目根目录的 Markdown 文件，作为机器可读的设计规格书。使用结构化 Markdown，人类与 AI Agent 皆可读取。

```
传统方式：Figma 设计稿 → 人类开发者 → 代码
新方式：DESIGN.md → AI Agent → 代码

DESIGN.md = 给 AI 读的设计规格书
  - 人类可读（Markdown 格式）
  - AI 可消费（结构化纯文本）
  - 版本控制友好（放在 repo 根目录）
  - 与代码同步演进
```

### 必填段落

完整的 DESIGN.md 必须依序包含全部 9 个段落：

| # | 段落键值 | 必填 | 说明 |
|---|---------|------|------|
| 1 | `visual-theme` | 是 | 整体风格与氛围定义 |
| 2 | `color-palette` | 是 | 语义色彩 token 与 hex 值 |
| 3 | `typography` | 是 | 字体家族与字体层级角色 |
| 4 | `component-styling` | 是 | UI 组件的视觉规则 |
| 5 | `layout-spacing` | 是 | 间距尺度与网格定义 |
| 6 | `depth-shadow` | 是 | 层次感与阴影系统 |
| 7 | `design-guidelines` | 是 | 设计规则与反模式清单 |
| 8 | `responsive` | 是 | 断点与响应式规则 |
| 9 | `agent-prompt-refs` | 是 | AI 可消费的设计意图摘要 |

---

## 第 1 段：视觉主题与氛围

**目的**：定义产品的整体美学意图。AI Agent 在生成 UI 时以此作为高层次约束。

**必填字段**：
- `theme`: 单行风格描述（如「极简、专业、数据密集」）
- `mood`: 情感品质（如「沉稳、专注、可信赖」）
- `inspiration`: 参考产品或设计流派（如「Linear、Stripe dashboard」）
- `dark-mode`: 深色模式是 primary / secondary / 不支持

---

## 第 2 段：色彩系统

**目的**：定义完整的语义色彩系统。所有颜色以语义 token 表示，不直接在代码中使用原始 hex 值。

**必填**：全部 5 个语义 token（见[语义色彩 Token](#语义色彩-token)）

**选填**：状态扩展 token（error、warning、success、info）、border、overlay。

---

## 第 3 段：字体系统

**目的**：定义字体家族与字体层级角色。约束 AI 最多使用 2 个字体家族。

**必填**：全部 4 个字体角色定义（见[字体角色](#字体角色)）

**约束**：最多 2 个字体家族（display + body）。使用 3 个以上属反模式。

---

## 第 4 段：组件样式

**目的**：定义常见 UI 组件（按钮、卡片、输入框、徽章）的视觉规则。

**必填字段**：
- 圆角尺度
- 按钮变体（primary、secondary、ghost）
- 输入框样式
- 卡片 / surface 样式

---

## 第 5 段：版面与间距

**目的**：定义间距尺度与网格系统。以 8px 基础网格，定义 7 个间距步骤。

**必填**：标准尺度的全部 7 个间距步骤（见[间距尺度](#间距尺度)）

---

## 第 6 段：层次感与阴影系统

**目的**：以阴影定义高度层次感，不依赖颜色建立视觉层级。

**必填**：至少 3 个高度层级。

---

## 第 7 段：设计准则与反模式

**目的**：对 AI Agent 明确列出规则和禁止的 UI 模式。此段落是约束式提示的主要机制。

**必填子段落**：
1. UI 硬性约束（≥4 条规则）
2. 反模式清单（≥5 个禁止模式）

---

## 第 8 段：响应式行为

**目的**：定义断点与响应式规则。必须采用 Mobile-first 做法。

**必填**：至少 3 个断点（mobile、tablet、desktop）。

---

## 第 9 段：Agent 提示参考

**目的**：设计意图的精简 AI 最优化摘要。AI Agent 应先读此段作快速定向，再查阅其他段落。

**必填字段**：
- `style-summary`: 1–2 句设计意图
- `key-constraints`: 最关键规则的列表
- `tone`: 设计带给用户的「感受」

---

## 语义色彩 Token

每个 DESIGN.md **必须**定义以下 5 个语义色彩 token。它们与框架无关，必须使用这些精确名称。

| Token | 角色 | 对应示例 |
|-------|------|---------|
| `background` | 页面 / App 背景 | `#0A0A0A`（深色）/ `#FFFFFF`（浅色）|
| `surface` | 卡片、面板、Modal | `#1A1A1A`（深色）/ `#F9FAFB`（浅色）|
| `primary-text` | 主要正文 | `#F5F5F5`（深色）/ `#111827`（浅色）|
| `muted-text` | 次要文字、placeholder | `#888888`（深色）/ `#6B7280`（浅色）|
| `accent` | CTA 按钮、链接、强调 | `#6366F1`（靛蓝示例）|

**规则**：
- Token 名称为 kebab-case，必须完全相符
- 每个 token 必须定义 hex 值
- `accent` 必须是单一颜色，禁止多个强调色
- 扩展 token（error、warning、success）为选填，但必须遵循相同命名模式

---

## 字体角色

每个 DESIGN.md **必须**定义以下 4 个字体角色：

| 角色 | 大小 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| `display` | 48px+ | 700 | 1.1 | 英雄标题、展示文字 |
| `headline` | 24–32px | 600 | 1.3 | 段落标题、卡片标题 |
| `body` | 16px | 400 | 1.6 | 段落、主要内文 |
| `caption` | 12–14px | 400 | 1.4 | 标签、Metadata、辅助文字 |

**规则**：
- 角色名称为小写，必须完全相符
- 4 个角色最多使用 2 个字体家族
- 字体大小为最小值，响应式缩放可接受

---

## 间距尺度

标准间距尺度以 8px 基础网格，定义 7 个命名步骤：

| Token | 值 | 用途 |
|-------|-----|------|
| `space-1` | 4px | 图标内距、紧凑元素 |
| `space-2` | 8px | 默认元素内距 |
| `space-3` | 16px | 组件内部间距 |
| `space-4` | 24px | 段落内距、Gutter |
| `space-5` | 32px | 组件之间 |
| `space-6` | 48px | 主要段落之间 |
| `space-8` | 64px | 页面级别分隔 |

**规则**：
- 所有代码中的间距必须使用这些步骤 token，不得使用任意 px 值
- `space-7` 刻意跳过（直接跳到 space-8=64px 维持视觉节奏）

---

## UI 硬性约束

| 约束 | 规则 | 理由 |
|------|------|------|
| H1 数量 | 每页最多 1 个 H1 | 清晰内容层级 |
| 段落数量 | 每页最多 6 个段落 | 防止认知过载 |
| 字体家族 | 最多 2 个字体家族 | 视觉一致性 |
| 强调色 | 最多 1 个强调色 | 防止视觉噪音 |
| 嵌套深度 | 最多 3 层视觉嵌套 | 可读性 |
| 信息层级 | Hero → Support → Detail → CTA | 叙事结构 |
| 触控目标 | 移动端最小 44×44px | 无障碍设计 |

---

## 反模式

以下 UI 模式为**禁止**。AI Agent 在生成前端代码或设计规格时必须拒绝这些模式。

| 反模式 | 说明 | 建议替代方案 |
|--------|------|------------|
| `floating-badge` | 与内容脱离的浮动徽章 | 行内标签或状态指示器 |
| `generic-card-layout` | 以完全相同的卡片堆叠作为主要内容 | 有清晰层级的多元内容结构 |
| `dashboard-grid-as-homepage` | 营销首页看起来像数据 dashboard | Hero → Support → CTA 叙事首页 |
| `competing-ctas` | 同一画面出现视觉权重相同的多个 CTA | 一个 primary CTA，零或一个 secondary CTA |
| `color-only-differentiation` | 仅用颜色传达状态或类别 | 搭配图标、图案或文字标签 |
| `decorative-overload` | 不传递信息的插图或动画 | 移除装饰性元素；偏好功能性视觉 |
| `triple-nesting` | 视觉层级超过 3 层 | 扁平化结构；以留白作分隔 |
| `rainbow-accents` | 多个强调/高亮色 | 单一强调色系统 |

每个 DESIGN.md 的第 7 段必须明确列出至少 5 个反模式。

---

## DESIGN.md 文件位置

DESIGN.md 必须放在**项目根目录**，与 README.md 同层。

**规则**：
- 文件名：`DESIGN.md`（大小写必须完全相符）
- 位置：仅在项目根目录（不在 `docs/`、`src/` 或子目录）
- 格式：使用 `##` 级别段落标题的 Markdown
- 版本：文档标题包含版本字段
- 更新策略：设计 token 变更时 DESIGN.md 必须同步更新；视为代码，而非文档

---

## 验证清单

### 结构
- [ ] 全部 9 个段落依序存在
- [ ] 文件位于项目根目录（与 README.md 同层）
- [ ] 文件名精确为 `DESIGN.md`

### 色彩系统（第 2 段）
- [ ] 定义了全部 5 个语义 token：`background`、`surface`、`primary-text`、`muted-text`、`accent`
- [ ] 所有 token 都有 hex 值
- [ ] 只定义了 1 个强调色

### 字体系统（第 3 段）
- [ ] 定义了全部 4 个角色：`display`、`headline`、`body`、`caption`
- [ ] 最多使用 2 个字体家族

### 间距（第 5 段）
- [ ] 定义了全部 7 个间距步骤：space-1 到 space-8（无 space-7）
- [ ] 值符合 8px 基础尺度

### 设计准则（第 7 段）
- [ ] 列出至少 4 条 UI 硬性约束
- [ ] 列出至少 5 个反模式
- [ ] 明确禁止 `floating-badge`、`generic-card-layout`、`dashboard-grid-as-homepage`

### Agent 提示参考（第 9 段）
- [ ] 风格摘要存在（1–2 句）
- [ ] 关键约束列表存在
- [ ] 氛围（tone）已定义
