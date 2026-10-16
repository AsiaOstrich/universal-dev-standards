---
source: ../../../core/frontend-design-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: c9dc85d8ce95
status: current
---

# 前端设计标准

> **语言**: [English](../../../core/frontend-design-standards.md) | [繁體中文](../../zh-TW/core/frontend-design-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-07-10
**适用范围**: 所有具备前端用户界面的项目
**范围**: universal
**参考**: [DEC-029](https://github.com/VoltAgent/awesome-design-md) (awesome-design-md, MIT), DEC-030 (OpenAI Frontend Guide)

---

## 目的

本标准定义一套机器可读的前端设计规格格式（DESIGN.md），用于 AI 辅助开发。建立 9 段式 DESIGN.md 结构、强制设计 token 词汇、UI 硬性约束，以及反模式拒绝规则。

目标是通过提供结构化设计约束——而非自由形式的风格描述——来确保 AI Agent 在不同运行中产生一致、高质量的 UI。

**核心原则**：
- DESIGN.md 作为设计规格的唯一真实来源
- 语义化 token 命名（框架无关）
- 基于约束的提示：自由度越少 = UI 质量越高
- 与源代码一同进行版本控制

---

## 目录

1. [DESIGN.md 结构](#designmd-structure)
2. [第 1 段：视觉主题与氛围](#section-1-visual-theme--mood)
3. [第 2 段：色彩系统](#section-2-color-palette)
4. [第 3 段：字体系统](#section-3-typography)
5. [第 4 段：组件样式](#section-4-component-styling)
6. [第 5 段：版面与间距](#section-5-layout--spacing)
7. [第 6 段：层次感与阴影系统](#section-6-depth--shadow-system)
8. [第 7 段：设计准则与反模式](#section-7-design-guidelines--anti-patterns)
9. [第 8 段：响应式行为](#section-8-responsive-behavior)
10. [第 9 段：Agent 提示参考](#section-9-agent-prompt-references)
11. [语义色彩 Token](#semantic-color-tokens)
12. [字体角色](#typography-roles)
13. [间距尺度](#spacing-scale)
14. [UI 硬性约束](#ui-hard-constraints)
15. [反模式](#anti-patterns)
16. [可选扩展：Token 插值与结构化组件](#optional-extension-token-interpolation--structured-components)
17. [DESIGN.md 文件位置](#designmd-file-placement)
18. [验证清单](#validation-checklist)

---

## DESIGN.md 结构

DESIGN.md 是放在项目根目录的 Markdown 文件，作为机器可读的设计规格书。使用人类与 AI Agent 皆可读取的结构化 Markdown。

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
- `theme`: 单行风格描述（例如“极简、专业、数据密集”）
- `mood`: 情感品质（例如“沉稳、专注、可信赖”）
- `inspiration`: 参考产品或设计流派（例如“Linear、Stripe dashboard”）
- `dark-mode`: 深色模式是 primary / secondary / 不支持

**示例**：
```markdown
## Visual Theme & Mood

- **Theme**: Minimal, professional, data-dense
- **Mood**: Calm, focused, trustworthy
- **Inspiration**: Linear app, Stripe dashboard
- **Dark Mode**: Primary (dark-first design)
```

---

## 第 2 段：色彩系统

**目的**：定义完整的语义色彩系统。所有颜色均表示为具名的语义 token——不直接在代码中使用原始 hex 值。

**必填**：全部 5 个语义 token（参见[语义色彩 Token](#semantic-color-tokens)）

**选填**：状态扩展 token（error、warning、success、info）、border、overlay。

**示例**：
```markdown
## Color Palette

### Semantic Tokens (Required)
- **background**: `#0A0A0A` — Page background
- **surface**: `#1A1A1A` — Cards, panels, modals
- **primary-text**: `#F5F5F5` — Main body text
- **muted-text**: `#888888` — Secondary text, placeholders
- **accent**: `#6366F1` — CTA buttons, links, highlights

### Extended Tokens (Optional)
- **error**: `#EF4444`
- **warning**: `#F59E0B`
- **success**: `#10B981`
- **border**: `#2A2A2A`
```

---

## 第 3 段：字体系统

**目的**：定义字体家族与字体层级角色。约束 AI 最多使用 2 个字体家族。

**必填**：全部 4 个字体角色定义（参见[字体角色](#typography-roles)）

**约束**：最多 2 个字体家族（display + body）。使用 3 个以上属于反模式。

**示例**：
```markdown
## Typography

### Font Families (max 2)
- **Display font**: Inter (headings, display text)
- **Body font**: Inter (same family, different weights acceptable)

### Typographic Scale
- **display**: 48px+, weight 700, line-height 1.1 — Hero titles
- **headline**: 24–32px, weight 600, line-height 1.3 — Section headings
- **body**: 16px, weight 400, line-height 1.6 — Main content
- **caption**: 12–14px, weight 400, line-height 1.4 — Labels, metadata
```

---

## 第 4 段：组件样式

**目的**：定义常见 UI 组件（按钮、卡片、输入框、徽章）的视觉规则。

**必填字段**：
- 圆角尺度
- 按钮变体（primary、secondary、ghost）
- 输入框样式
- 卡片 / surface 样式

**示例**：
```markdown
## Component Styling

### Border Radius
- **sm**: 4px (small elements, badges)
- **md**: 8px (buttons, inputs)
- **lg**: 12px (cards, modals)
- **full**: 9999px (pill badges, avatars)

### Buttons
- **Primary**: `accent` background, `#FFFFFF` text, `md` radius
- **Secondary**: `surface` background, `primary-text` text, `md` radius, 1px border
- **Ghost**: Transparent background, `accent` text, no border

### Inputs
- Background: `surface`
- Border: 1px solid `border`
- Focus: 2px ring in `accent`
- Radius: `md`
```

---

## 第 5 段：版面与间距

**目的**：定义间距尺度与网格系统。基于 8px 基础网格，定义 7 个间距步骤。

**必填**：标准尺度的全部 7 个间距步骤（参见[间距尺度](#spacing-scale)）

**示例**：
```markdown
## Layout & Spacing

### Spacing Scale (8px base)
- **space-1**: 4px
- **space-2**: 8px
- **space-3**: 16px
- **space-4**: 24px
- **space-5**: 32px
- **space-6**: 48px
- **space-8**: 64px

### Grid
- **Columns**: 12-column grid
- **Gutter**: space-4 (24px)
- **Max content width**: 1280px
- **Page padding**: space-4 (24px) on mobile, space-6 (48px) on desktop
```

---

## 第 6 段：层次感与阴影系统

**目的**：以阴影定义高度层级。在不依赖颜色的情况下建立视觉层级。

**必填字段**：至少 3 个高度层级。

**示例**：
```markdown
## Depth & Shadow System

- **elevation-0**: No shadow (flat, on-surface elements)
- **elevation-1**: `0 1px 2px rgba(0,0,0,0.4)` (subtle, cards at rest)
- **elevation-2**: `0 4px 8px rgba(0,0,0,0.3)` (dropdowns, tooltips)
- **elevation-3**: `0 8px 24px rgba(0,0,0,0.5)` (modals, dialogs)
- **elevation-4**: `0 16px 48px rgba(0,0,0,0.6)` (full-screen overlays)
```

---

## 第 7 段：设计准则与反模式

**目的**：为 AI Agent 制定明确的规则和禁止的 UI 模式。此段落是约束式提示的主要机制。

**必填子段落**：
1. UI 硬性约束（≥4 条规则）
2. 反模式清单（≥5 个禁止模式）

标准清单参见 [UI 硬性约束](#ui-hard-constraints) 与 [反模式](#anti-patterns)。

**示例**：
```markdown
## Design Guidelines & Anti-patterns

### UI Hard Constraints
- Maximum 1 H1 per page
- Maximum 6 sections per page
- Maximum 2 font families
- Maximum 1 accent color (never mix multiple accent colors)
- Information hierarchy: Hero → Support → Detail → CTA

### Anti-patterns (Forbidden)
- No floating badges (浮動徽章)
- No generic card layout as primary content structure
- No dashboard grid as homepage
- No more than 3 levels of visual nesting
- No color-only differentiation (always pair with icon or label)
- No decorative illustrations that don't serve information
- No competing CTAs of equal visual weight on the same screen
```

---

## 第 8 段：响应式行为

**目的**：定义断点与响应式规则。必须采用 Mobile-first 方法。

**必填字段**：至少 3 个断点（移动端、平板、桌面端）。

**示例**：
```markdown
## Responsive Behavior

### Breakpoints (Mobile-first)
- **xs**: < 480px (small phones)
- **sm**: ≥ 768px (tablets)
- **md**: ≥ 1024px (laptops)
- **lg**: ≥ 1280px (desktops)
- **xl**: ≥ 1536px (wide screens)

### Rules
- Mobile-first CSS (min-width media queries)
- Single column on xs/sm, multi-column on md+
- Touch targets ≥ 44×44px on mobile
- Navigation collapses to hamburger/bottom bar on sm and below
```

---

## 第 9 段：Agent 提示参考

**目的**：设计意图的精炼、AI 优化摘要。AI Agent 在查阅其他段落之前，应先阅读此段落作为快速定向。

**必填字段**：
- `style-summary`：1–2 句设计意图
- `key-constraints`：最关键规则的项目符号列表
- `tone`：设计带给用户的“感受”

**示例**：
```markdown
## Agent Prompt References

### Style Summary
Dark, minimal, data-focused interface. Professional aesthetic prioritizing clarity over decoration.

### Key Constraints for AI Generation
- Always use semantic token names (background, surface, accent) — never raw hex in components
- Every page has exactly 1 H1; sections ≤ 6
- accent (#6366F1) is the only allowed emphasis color
- Prefer text over decorative components; restraint over complexity

### Tone
Calm, confident, technical. Similar to Linear or Vercel's dashboard aesthetic.
```

---

## 语义色彩 Token

以下 5 个语义色彩 token 在每个 DESIGN.md 中都是**必填**的。它们与框架无关，且必须使用这些完全相同的名称。

| Token | 角色 | 映射至（示例） |
|-------|------|-------------------|
| `background` | 页面/应用背景 | `#0A0A0A`（深色）/ `#FFFFFF`（浅色） |
| `surface` | 卡片、面板、模态框 | `#1A1A1A`（深色）/ `#F9FAFB`（浅色） |
| `primary-text` | 主要正文文本 | `#F5F5F5`（深色）/ `#111827`（浅色） |
| `muted-text` | 次要文本、占位符 | `#888888`（深色）/ `#6B7280`（浅色） |
| `accent` | CTA 按钮、链接、高亮 | `#6366F1`（靛蓝示例） |

**规则**：
- Token 名称为 kebab-case，且必须完全匹配
- 每个 token 必须定义 hex 值
- `accent` 必须是单一颜色——严禁使用多个强调色
- 扩展 token（error、warning、success）为选填，但必须遵循相同的命名模式

---

## 字体角色

以下 4 个字体层级角色在每个 DESIGN.md 中都是**必填**的：

| 角色 | 大小 | 字重 | 行高 | 用途 |
|------|------|--------|-------------|-------|
| `display` | 48px+ | 700 | 1.1 | Hero 标题、展示文字 |
| `headline` | 24–32px | 600 | 1.3 | 小节标题、卡片标题 |
| `body` | 16px | 400 | 1.6 | 段落、主要内容 |
| `caption` | 12–14px | 400 | 1.4 | 标签、元数据、辅助文本 |

**规则**：
- 角色名称为小写，且必须完全匹配
- 全部 4 个角色中最多使用 2 个字体家族
- 字体大小为最小值；允许响应式缩放
- `display` 和 `headline` 可共用一个字体家族；`body` 和 `caption` 共用另一个（或相同）

---

## 间距尺度

标准间距尺度采用 8px 基础网格，包含 7 个命名步骤：

| Token | 值 | 用途 |
|-------|-------|-------|
| `space-1` | 4px | 图标内边距、紧凑元素 |
| `space-2` | 8px | 默认元素内边距 |
| `space-3` | 16px | 组件内部间距 |
| `space-4` | 24px | 小节内边距、槽道（gutters） |
| `space-5` | 32px | 组件之间 |
| `space-6` | 48px | 主要小节之间 |
| `space-8` | 64px | 页面级分隔 |

**规则**：
- 代码中的所有间距必须使用这些步骤 token，不得使用任意像素值
- `space-7` 为刻意跳过（直接跳至 space-8 = 64px 以保持视觉节奏）
- 响应式调整仍必须使用尺度步骤（例如移动端使用 space-4，桌面端使用 space-6）

---

## UI 硬性约束

这些约束适用于本标准下生成的每个 UI。它们践行了约束式提示：限制自由度可产生质量更高、更一致的 UI。

| 约束 | 规则 | 理由 |
|-----------|------|-----------|
| H1 数量 | 每页最多 1 个 H1 | 清晰的内容层级 |
| 小节数量 | 每页最多 6 个小节 | 防止认知过载 |
| 字体家族 | 最多 2 个字体家族 | 视觉连贯性 |
| 强调色 | 最多 1 个强调色 | 防止视觉噪点 |
| 嵌套深度 | 最多 3 层视觉嵌套 | 可读性 |
| 信息层级 | Hero → Support → Detail → CTA | 叙事结构 |
| 触摸目标 | 移动端最小 44×44px | 无障碍设计 |

---

## 反模式

以下 UI 模式为**禁止**。AI Agent 在生成前端代码或设计规格时必须拒绝这些模式。

| 反模式 | 说明 | 推荐替代方案 |
|-------------|-------------|----------------------|
| `floating-badge` | 脱离内容独立浮动的徽章 | 行内标签或状态指示器 |
| `generic-card-layout` | 以完全相同且无差异化的卡片堆叠作为主要内容 | 具有清晰层级的多样化内容结构 |
| `dashboard-grid-as-homepage` | 营销首页看起来像数据仪表盘 | 采用 Hero → Support → CTA 结构的叙事型首页 |
| `competing-ctas` | 同一屏幕上出现视觉权重相同的多个 CTA | 一个主要 CTA，零个或一个次要 CTA |
| `color-only-differentiation` | 仅使用颜色来传达状态或类别 | 将颜色与图标、图案或文本标签搭配使用 |
| `decorative-overload` | 不传达信息的插图或动画 | 移除装饰性元素；优先采用功能性视觉元素 |
| `triple-nesting` | 视觉层级超过 3 层 | 扁平化结构；使用留白进行分隔 |
| `rainbow-accents` | 多种强调/高亮颜色（紫色 CTA、橙色徽章、绿色标签） | 单一强调色系统 |

最低要求：每个 DESIGN.md 的第 7 段中必须明确列出至少 5 个反模式。

---

## 可选扩展：Token 插值与结构化组件

> **状态**：可选、试验性（新增于 v1.1.0，2026-07-10）。**不**替代上述必填的 9 段式结构或经治理收敛的 5-token / 4-角色 / 7-步骤尺度——这是针对希望 DESIGN.md 本身承载结构化 token 引用而不仅是散文叙述的项目所提供的附加机器可解析层。省略此扩展的 DESIGN.md 依然完全合规。
>
> **来源**：2026-07-10 对 [DEC-029](https://github.com/VoltAgent/awesome-design-md) 上游（从 4,385★ 增长到 99,219★，现已正式成为 Google Stitch DESIGN.md 格式）的重新对齐审查发现，上游格式发展出了 YAML frontmatter token 字典和 `{category.token}` 插值语法，以及结构化的 `components:` 绑定块——这些是本标准原有的仅散文段落所不具备的功能。作为选用扩展而非破坏性变更被采纳，与本标准深思熟虑的 5-token 治理收敛保持一致（增加更多 token *不是*目标；让这 5 个 token *可被引用*才是）。

### Token 注册表（YAML Frontmatter）

DESIGN.md 可以选择以一个 YAML frontmatter 块开头，以机器可解析的键值形式声明来自第 2/3/5 段的语义 token（以及第 4 段的圆角尺度），以便工具能够在无需重新解析散文叙述的情况下解析 `{category.token}` 引用。

```yaml
---
colors:
  background: "#0A0A0A"
  surface: "#1A1A1A"
  primary-text: "#F5F5F5"
  muted-text: "#888888"
  accent: "#6366F1"
typography:
  display: { size: "48px", weight: 700, line-height: 1.1 }
  headline: { size: "24px", weight: 600, line-height: 1.3 }
  body: { size: "16px", weight: 400, line-height: 1.6 }
  caption: { size: "13px", weight: 400, line-height: 1.4 }
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "24px"
  lg: "48px"
---
```

**规则**：
- frontmatter 键（`colors`、`typography`、`rounded`、`spacing`）与第 2/3/5 段中已定义的 token 词汇 1:1 映射——此区块以可解析的形式**重申**这些 token，它不会引入新的 token。`colors` 的值必须匹配 5 个必填的语义 token（加上已在使用的任何可选扩展 token）。
- Frontmatter 是可选的。没有它的 DESIGN.md 依然有效；需要插值支持的工具则需要它。

### 插值语法

在散文叙述段落中（特别是第 4 段：组件样式），`{category.token}` 引用 frontmatter 注册表，而不是重申原始值：

```markdown
### Buttons
- **Primary**: `{colors.accent}` background, `{colors.background}` text, `{rounded.md}` radius, `{spacing.sm}` padding
```

**规则**：
- 语法为 `{category.token}`——category 匹配 frontmatter 的顶层键，token 匹配其内部的键。
- 引用 frontmatter 中不存在的 category/token 属于验证错误，而不是静默回退。
- 插值是为了**文档/工具清晰度**，而非运行时模板引擎——DESIGN.md 依然是静态规格文件。

### 结构化组件块（可选）

第 4 段（组件样式）可以选择包含一个 `components:` 块，显式地将组件绑定到其 token 引用，以替代（或并存于）第 4 段示例中已有的散文叙述格式：

```yaml
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
```

**规则**：
- 每个值都必须是 `{category.token}` 引用——`components:` 内部的原始 hex/px 值属于反模式（违背了集中管理 token 的初衷）。
- 此区块是对第 4 段散文描述的补充，而非替代——使用此扩展的项目仍应为人类读者填写第 4 段的散文叙述字段。

### 非目标（明确未从上游采纳）

- **本标准不捆绑 lint CLI**——上游生态系统有一个独立的 `@google/design.md` npm 包用于验证；本标准不强制或捆绑特定的验证器。项目可独立采纳。
- **无特定于框架的导出格式**（React/Vue/CSS-in-JS 生成器）——根据本标准的核心原则（语义化 token 命名，框架无关）保持框架无关。
- **不扩展 5/4/7 token 数量**——插值语法使现有 token 可被引用；它不是添加更多 token 的许可。治理收敛（更少的 token = 更一致的 AI 输出）始终优先于粒度。

---

## DESIGN.md 文件位置

DESIGN.md 必须放在**项目根目录**，与 README.md 同层。

```
my-project/
├── README.md          ← project overview (for humans)
├── DESIGN.md          ← design specification (for humans + AI agents)
├── CLAUDE.md          ← AI assistant config (if applicable)
├── src/
│   └── ...
└── package.json
```

**规则**：
- 文件名：`DESIGN.md`（大小写必须完全相符）
- 位置：仅在项目根目录（不在 `docs/`、`src/` 或子目录）
- 格式：使用 `##` 级别段落标题的 Markdown
- 版本：文档标题包含版本字段
- 更新策略：设计 token 变更时 DESIGN.md 必须同步更新；视为代码，而非文档

---

## 验证清单

使用此清单验证 DESIGN.md 是否符合本标准：

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
- [ ] 字体大小在指定范围内

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

### Token 插值扩展（可选——v1.1.0）
- [ ] 如果使用了 frontmatter token 注册表，所有 `colors` 键均匹配 5 个必填语义 token
- [ ] 如果使用了 `{category.token}` 插值，每个引用都能解析到一个 frontmatter 条目（无悬空引用）
- [ ] 如果使用了 `components:` 块，每个值都为 `{category.token}` 引用（无原始 hex/px 值）
- [ ] 缺少此扩展**不**属于合规失败——它是可选的
