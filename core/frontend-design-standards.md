# Frontend Design Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/frontend-design-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-13
**Applicability**: All projects with frontend user interfaces
**Scope**: universal
**References**: [DEC-029](https://github.com/VoltAgent/awesome-design-md) (awesome-design-md, MIT), DEC-030 (OpenAI Frontend Guide)

---

## Purpose

This standard defines a machine-readable frontend design specification format (DESIGN.md) for AI-assisted development. It establishes the 9-section DESIGN.md structure, mandatory design token vocabulary, UI hard constraints, and anti-pattern rejection rules.

The goal is to ensure AI agents produce consistent, high-quality UI across different runs by providing structured design constraints — not free-form style descriptions.

**Key Principles**:
- DESIGN.md as the single source of truth for design specifications
- Semantic token naming (framework-agnostic)
- Constraint-based prompting: fewer degrees of freedom = better UI quality
- Version-controlled alongside source code

---

## Table of Contents

1. [DESIGN.md Structure](#designmd-structure)
2. [Section 1: Visual Theme & Mood](#section-1-visual-theme--mood)
3. [Section 2: Color Palette](#section-2-color-palette)
4. [Section 3: Typography](#section-3-typography)
5. [Section 4: Component Styling](#section-4-component-styling)
6. [Section 5: Layout & Spacing](#section-5-layout--spacing)
7. [Section 6: Depth & Shadow System](#section-6-depth--shadow-system)
8. [Section 7: Design Guidelines & Anti-patterns](#section-7-design-guidelines--anti-patterns)
9. [Section 8: Responsive Behavior](#section-8-responsive-behavior)
10. [Section 9: Agent Prompt References](#section-9-agent-prompt-references)
11. [Semantic Color Tokens](#semantic-color-tokens)
12. [Typography Roles](#typography-roles)
13. [Spacing Scale](#spacing-scale)
14. [UI Hard Constraints](#ui-hard-constraints)
15. [Anti-patterns](#anti-patterns)
16. [DESIGN.md File Placement](#designmd-file-placement)
17. [Validation Checklist](#validation-checklist)

---

## DESIGN.md Structure

DESIGN.md is a Markdown file placed at the project root, serving as a machine-readable design specification. It uses structured Markdown that both humans and AI agents can read.

```
傳統方式：Figma 設計稿 → 人類開發者 → 程式碼
新方式：DESIGN.md → AI Agent → 程式碼

DESIGN.md = 給 AI 讀的設計規格書
  - 人類可讀（Markdown 格式）
  - AI 可消費（結構化純文字）
  - 版本控制友善（放在 repo 根目錄）
  - 與程式碼同步演進
```

### Required Sections

A complete DESIGN.md must contain all 9 sections in order:

| # | Section Key | Required | Description |
|---|-------------|----------|-------------|
| 1 | `visual-theme` | Yes | Overall style and mood definition |
| 2 | `color-palette` | Yes | Semantic color tokens with hex values |
| 3 | `typography` | Yes | Font families and typographic scale roles |
| 4 | `component-styling` | Yes | Visual rules for UI components |
| 5 | `layout-spacing` | Yes | Spacing scale and grid definition |
| 6 | `depth-shadow` | Yes | Elevation and shadow system |
| 7 | `design-guidelines` | Yes | Design rules and anti-pattern list |
| 8 | `responsive` | Yes | Breakpoints and responsive rules |
| 9 | `agent-prompt-refs` | Yes | AI-consumable design intent summary |

---

## Section 1: Visual Theme & Mood

**Purpose**: Defines the overall aesthetic intent of the product. AI agents use this as a high-level constraint when generating UI.

**Required Fields**:
- `theme`: One-line style descriptor (e.g., "Minimal, professional, data-dense")
- `mood`: Emotional quality (e.g., "Calm, focused, trustworthy")
- `inspiration`: Reference products or design movements (e.g., "Linear, Stripe dashboard")
- `dark-mode`: Whether dark mode is primary/secondary/unsupported

**Example**:
```markdown
## Visual Theme & Mood

- **Theme**: Minimal, professional, data-dense
- **Mood**: Calm, focused, trustworthy
- **Inspiration**: Linear app, Stripe dashboard
- **Dark Mode**: Primary (dark-first design)
```

---

## Section 2: Color Palette

**Purpose**: Defines the complete semantic color system. All colors are expressed as named semantic tokens — not raw hex values used directly in code.

**Required**: All 5 semantic tokens (see [Semantic Color Tokens](#semantic-color-tokens))

**Optional**: Extended tokens for states (error, warning, success, info), borders, overlays.

**Example**:
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

## Section 3: Typography

**Purpose**: Defines font families and typographic role hierarchy. Constrains AI to use at most 2 font families.

**Required**: All 4 typographic role definitions (see [Typography Roles](#typography-roles))

**Constraint**: Maximum 2 font families (display + body). Using 3 or more is an anti-pattern.

**Example**:
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

## Section 4: Component Styling

**Purpose**: Defines visual rules for common UI components (buttons, cards, inputs, badges).

**Required Fields**:
- Border radius scale
- Button variants (primary, secondary, ghost)
- Input field styling
- Card/surface styling

**Example**:
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

## Section 5: Layout & Spacing

**Purpose**: Defines the spacing scale and grid system. Based on an 8px base grid with 7 defined step values.

**Required**: All 7 spacing steps from the standard scale (see [Spacing Scale](#spacing-scale))

**Example**:
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

## Section 6: Depth & Shadow System

**Purpose**: Defines elevation layers using shadows. Creates visual hierarchy without color reliance.

**Required Fields**: At least 3 elevation levels.

**Example**:
```markdown
## Depth & Shadow System

- **elevation-0**: No shadow (flat, on-surface elements)
- **elevation-1**: `0 1px 2px rgba(0,0,0,0.4)` (subtle, cards at rest)
- **elevation-2**: `0 4px 8px rgba(0,0,0,0.3)` (dropdowns, tooltips)
- **elevation-3**: `0 8px 24px rgba(0,0,0,0.5)` (modals, dialogs)
- **elevation-4**: `0 16px 48px rgba(0,0,0,0.6)` (full-screen overlays)
```

---

## Section 7: Design Guidelines & Anti-patterns

**Purpose**: Explicit rules and forbidden UI patterns for AI agents. This section is the primary mechanism for constraint-based prompting.

**Required Sub-sections**:
1. UI hard constraints (≥4 rules)
2. Anti-pattern list (≥5 forbidden patterns)

See [UI Hard Constraints](#ui-hard-constraints) and [Anti-patterns](#anti-patterns) for standard lists.

**Example**:
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

## Section 8: Responsive Behavior

**Purpose**: Defines breakpoints and responsive rules. Mobile-first approach is required.

**Required Fields**: At least 3 breakpoints (mobile, tablet, desktop).

**Example**:
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

## Section 9: Agent Prompt References

**Purpose**: A concise, AI-optimized summary of the design intent. AI agents should read this section first as a quick orientation before consulting other sections.

**Required Fields**:
- `style-summary`: 1–2 sentence design intent
- `key-constraints`: Bullet list of the most critical rules
- `tone`: How the design should "feel" to users

**Example**:
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

## Semantic Color Tokens

The following 5 semantic color tokens are **mandatory** in every DESIGN.md. They are framework-agnostic and must use these exact names.

| Token | Role | Maps To (Example) |
|-------|------|-------------------|
| `background` | Page/app background | `#0A0A0A` (dark) / `#FFFFFF` (light) |
| `surface` | Cards, panels, modals | `#1A1A1A` (dark) / `#F9FAFB` (light) |
| `primary-text` | Main body text | `#F5F5F5` (dark) / `#111827` (light) |
| `muted-text` | Secondary text, placeholders | `#888888` (dark) / `#6B7280` (light) |
| `accent` | CTA buttons, links, highlights | `#6366F1` (indigo example) |

**Rules**:
- Token names are kebab-case and must match exactly
- Every token must have a hex value defined
- `accent` must be a single color — multiple accent colors are forbidden
- Extended tokens (error, warning, success) are optional but must follow the same naming pattern

---

## Typography Roles

The following 4 typographic roles are **mandatory** in every DESIGN.md:

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display` | 48px+ | 700 | 1.1 | Hero titles, splash text |
| `headline` | 24–32px | 600 | 1.3 | Section headings, card titles |
| `body` | 16px | 400 | 1.6 | Paragraphs, main content |
| `caption` | 12–14px | 400 | 1.4 | Labels, metadata, helper text |

**Rules**:
- Role names are lowercase and must match exactly
- Maximum 2 font families across all 4 roles
- Font sizes are minimum values; responsive scaling is permitted
- `display` and `headline` may share one font family; `body` and `caption` share another (or the same)

---

## Spacing Scale

The standard spacing scale uses an 8px base grid with 7 named steps:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon padding, tight elements |
| `space-2` | 8px | Default element padding |
| `space-3` | 16px | Component internal spacing |
| `space-4` | 24px | Section padding, gutters |
| `space-5` | 32px | Between components |
| `space-6` | 48px | Between major sections |
| `space-8` | 64px | Page-level separation |

**Rules**:
- All spacing in code must use these step tokens, not arbitrary pixel values
- `space-7` is intentionally skipped (jump to space-8 = 64px maintains visual rhythm)
- Responsive adjustments must still use scale steps (e.g., mobile uses space-4, desktop uses space-6)

---

## UI Hard Constraints

These constraints apply to every UI generated under this standard. They implement constraint-based prompting: limiting degrees of freedom produces higher-quality, more consistent UI.

| Constraint | Rule | Rationale |
|-----------|------|-----------|
| H1 count | Maximum 1 H1 per page | Clear content hierarchy |
| Section count | Maximum 6 sections per page | Prevents cognitive overload |
| Font families | Maximum 2 font families | Visual coherence |
| Accent colors | Maximum 1 accent color | Prevents visual noise |
| Nesting depth | Maximum 3 levels of visual nesting | Readability |
| Information hierarchy | Hero → Support → Detail → CTA | Narrative structure |
| Touch targets | Minimum 44×44px on mobile | Accessibility |

---

## Anti-patterns

The following UI patterns are **forbidden**. AI agents must reject these patterns when generating frontend code or design specifications.

| Anti-pattern | Description | Preferred Alternative |
|-------------|-------------|----------------------|
| `floating-badge` | Badges that float disconnected from content | Inline labels or status indicators |
| `generic-card-layout` | Identical cards with no differentiation stacked as primary content | Varied content structures with clear hierarchy |
| `dashboard-grid-as-homepage` | Marketing homepage that looks like a data dashboard | Narrative homepage with Hero → Support → CTA structure |
| `competing-ctas` | Multiple CTAs of equal visual weight on the same screen | One primary CTA, one or zero secondary CTAs |
| `color-only-differentiation` | Using only color to convey state or category | Pair color with icon, pattern, or text label |
| `decorative-overload` | Illustrations or animations that don't convey information | Remove decorative elements; prefer functional visuals |
| `triple-nesting` | Visual hierarchy deeper than 3 levels | Flatten structure; use whitespace for separation |
| `rainbow-accents` | Multiple accent/highlight colors (purple CTA, orange badge, green tag) | Single accent color system |

Minimum required: at least 5 anti-patterns must be explicitly listed in every DESIGN.md's Section 7.

---

## DESIGN.md File Placement

DESIGN.md must be placed at the **project root directory**, at the same level as README.md.

```
my-project/
├── README.md          ← project overview (for humans)
├── DESIGN.md          ← design specification (for humans + AI agents)
├── CLAUDE.md          ← AI assistant config (if applicable)
├── src/
│   └── ...
└── package.json
```

**Rules**:
- File name: `DESIGN.md` (exact casing)
- Location: Project root only (not in `docs/`, `src/`, or subdirectories)
- Format: Markdown with section headers using `##` level
- Version: Include a version field in the document header
- Update policy: DESIGN.md must be updated when design tokens change; treat it as code, not documentation

---

## Validation Checklist

Use this checklist to verify a DESIGN.md is compliant with this standard:

### Structure
- [ ] All 9 sections present in correct order
- [ ] File located at project root (same level as README.md)
- [ ] File named exactly `DESIGN.md`

### Color Palette (Section 2)
- [ ] All 5 semantic tokens defined: `background`, `surface`, `primary-text`, `muted-text`, `accent`
- [ ] All tokens have hex values
- [ ] Exactly 1 accent color defined

### Typography (Section 3)
- [ ] All 4 roles defined: `display`, `headline`, `body`, `caption`
- [ ] Maximum 2 font families used
- [ ] Font sizes within specified ranges

### Spacing (Section 5)
- [ ] All 7 spacing steps defined: space-1 through space-8 (no space-7)
- [ ] Values match the 8px base scale

### Design Guidelines (Section 7)
- [ ] At least 4 UI hard constraints listed
- [ ] At least 5 anti-patterns listed
- [ ] `floating-badge`, `generic-card-layout`, `dashboard-grid-as-homepage` are explicitly forbidden

### Agent Prompt References (Section 9)
- [ ] Style summary present (1–2 sentences)
- [ ] Key constraints bullet list present
- [ ] Tone defined
