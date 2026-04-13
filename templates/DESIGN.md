# DESIGN.md — [專案名稱] 前端設計規格

> **版本**: 1.0.0
> **更新日期**: YYYY-MM-DD
> **標準依據**: UDS `frontend-design-standards` v1.0.0
>
> **說明**: 本文件是給 AI Agent 和人類開發者讀的設計規格書。
> 請填寫所有 9 個段落（`<!-- FILL: ... -->` 標記的地方）並移除所有注釋說明。
> 建立後將本文件放置在專案根目錄，與 README.md 同層。

---

## 1. Visual Theme & Mood

<!-- FILL: 定義整體視覺風格與情感基調。這是 AI Agent 生成 UI 時的最高層次約束。 -->
<!-- 範例：
- **Theme**: Minimal, professional, data-dense
- **Mood**: Calm, focused, trustworthy
- **Inspiration**: Linear app, Stripe dashboard
- **Dark Mode**: Primary (dark-first design)
-->

- **Theme**: [填入一行風格描述，例：Clean, modern, approachable]
- **Mood**: [填入情感品質，例：Friendly, energetic, reliable]
- **Inspiration**: [填入參考產品或設計風格，例：Notion, GitHub, Vercel]
- **Dark Mode**: [primary / secondary / unsupported]

---

## 2. Color Palette

<!-- FILL: 定義語義色彩 token 系統。5 個核心 token 均為必填。
使用 token 名稱而非直接在程式碼中使用 hex 值。
命名規則：kebab-case，與標準完全一致。 -->

### Semantic Tokens（必填，5 個）

- **background**: `#______` — [填入：頁面底色說明]
- **surface**: `#______` — [填入：卡片、面板底色說明]
- **primary-text**: `#______` — [填入：主要文字顏色說明]
- **muted-text**: `#______` — [填入：次要文字、placeholder 說明]
- **accent**: `#______` — [填入：強調色、CTA 按鈕說明（全站只能 1 個 accent）]

### Extended Tokens（選填）

<!-- 選填，如需要可加入以下 token -->
<!-- - **error**: `#______` -->
<!-- - **warning**: `#______` -->
<!-- - **success**: `#______` -->
<!-- - **border**: `#______` -->
<!-- - **overlay**: `rgba(______)` -->

---

## 3. Typography

<!-- FILL: 定義字體家族與排版角色。
重要約束：最多 2 個字體家族（display 系列 + body 系列，可以是同一個）。
4 個角色均為必填。 -->

### Font Families（最多 2 個）

- **Display font**: [字體名稱] — 用於 display、headline 角色
- **Body font**: [字體名稱] — 用於 body、caption 角色（可與 display 相同）

### Typographic Scale（4 個角色，均必填）

- **display**: [填入大小，需 ≥ 48px], weight [700], line-height [1.1] — 英雄標題、Splash 文字
- **headline**: [填入大小，範圍 24–32px], weight [600], line-height [1.3] — 區段標題、卡片標題
- **body**: 16px, weight 400, line-height 1.6 — 段落、主要內容
- **caption**: [填入大小，範圍 12–14px], weight 400, line-height 1.4 — 標籤、Metadata、輔助說明

---

## 4. Component Styling

<!-- FILL: 定義 UI 元件的視覺規則。
邊框圓角、按鈕變體、輸入框、卡片均為必填。 -->

### Border Radius

- **sm**: [填入，建議 4px] — 小型元素、徽章
- **md**: [填入，建議 8px] — 按鈕、輸入框
- **lg**: [填入，建議 12px] — 卡片、Modal
- **full**: 9999px — Pill 徽章、圓形頭像

### Buttons

- **Primary**: `accent` 背景色，白色文字，`md` 圓角
- **Secondary**: `surface` 背景色，`primary-text` 文字，`md` 圓角，1px border
- **Ghost**: 透明背景，`accent` 文字，無邊框

<!-- FILL: 如有其他按鈕變體可在此新增 -->

### Input Fields

- Background: `surface`
- Border: 1px solid `border`（若有定義）
- Focus ring: 2px solid `accent`
- Border radius: `md`
- Placeholder color: `muted-text`

### Cards / Panels

- Background: `surface`
- Border: [填入：1px solid border / none / custom]
- Shadow: [填入：elevation-1 / none]
- Padding: `space-4` (24px)
- Border radius: `lg`

---

## 5. Layout & Spacing

<!-- FILL: 定義間距比例（必須使用 8px 基底的標準步進值）與網格系統。
7 個間距 token 均為必填（注意：沒有 space-7）。 -->

### Spacing Scale（8px 基底，7 個步進值，均必填）

- **space-1**: 4px — 圖示內距、緊湊元素
- **space-2**: 8px — 預設元素內距
- **space-3**: 16px — 元件內部間距
- **space-4**: 24px — 區塊間距、網格欄距
- **space-5**: 32px — 元件之間的間距
- **space-6**: 48px — 主要區段之間
- **space-8**: 64px — 頁面層級分隔

### Grid System

- **Columns**: [填入，建議 12 欄]
- **Gutter**: space-4 (24px)
- **Max content width**: [填入，建議 1280px]
- **Page padding**: space-4 (24px) on mobile / space-6 (48px) on desktop

---

## 6. Depth & Shadow System

<!-- FILL: 定義陰影層次系統，至少需要 3 個 elevation 層級。
陰影用於建立視覺層次，不依賴顏色變化。 -->

- **elevation-0**: no shadow — 扁平元素、緊貼背景的內容
- **elevation-1**: `[填入 CSS shadow]` — 卡片靜止態、懸浮元素
- **elevation-2**: `[填入 CSS shadow]` — 下拉選單、Tooltip
- **elevation-3**: `[填入 CSS shadow]` — Modal、Dialog、Drawer

<!-- 選填：
- **elevation-4**: `[填入 CSS shadow]` — 全畫面 overlay
-->

<!-- 範例（暗色主題）：
- **elevation-1**: `0 1px 2px rgba(0,0,0,0.4)`
- **elevation-2**: `0 4px 8px rgba(0,0,0,0.3)`
- **elevation-3**: `0 8px 24px rgba(0,0,0,0.5)`
-->

---

## 7. Design Guidelines & Anti-patterns

<!-- FILL: UI 硬性約束與禁止模式清單。
這是約束式 prompting 的核心——限制自由度以提升 UI 品質一致性。
硬性約束至少 4 條，反模式至少 5 條（本模板已提供最低要求，請保留）。 -->

### UI Hard Constraints

- 每頁最多 **1 個 H1**
- 頁面區段不超過 **6 個**
- 字體家族最多 **2 個**
- 強調色最多 **1 個**（禁止混用多個 accent 色）
- [填入：其他專案特定的硬性約束]

### Anti-patterns（禁止模式）

- **禁止** floating badge（浮動徽章，脫離內容無歸屬）
- **禁止** generic card layout（完全相同的卡片堆疊作為主要內容）
- **禁止** dashboard grid as homepage（行銷首頁設計成數據儀表板）
- **禁止** competing CTAs（同畫面出現多個等重 CTA 按鈕）
- **禁止** color-only differentiation（僅用顏色區分狀態，無其他提示）
- [填入：其他專案特定的禁止模式]

### Design Principles（選填）

<!-- 可以新增正向指導原則（非禁止事項）
範例：
- 優先使用文字解決，而非堆砌元件（Restraint over complexity）
- 每個設計決定必須有功能理由，裝飾性元素需要明確理由
-->

---

## 8. Responsive Behavior

<!-- FILL: 定義斷點規則與響應式原則。
必須採用 Mobile-first 方式（min-width media queries）。
至少定義 3 個斷點（mobile / tablet / desktop）。 -->

### Breakpoints（Mobile-first）

- **xs** (base): < 480px — 小型手機
- **sm**: ≥ 768px — 平板
- **md**: ≥ 1024px — 筆記型電腦
- **lg**: ≥ 1280px — 桌上型電腦
- **xl**: ≥ 1536px — 寬螢幕（選填）

### Rules

- 採用 Mobile-first CSS（min-width 媒體查詢）
- xs / sm：單欄佈局
- md+：多欄佈局
- 行動裝置觸控目標最小 **44×44px**
- 導覽列在 sm 以下收合為漢堡選單或底部導覽列
- [填入：其他專案特定的響應式規則]

---

## 9. Agent Prompt References

<!-- FILL: AI Agent 快速讀取的設計意圖摘要。
AI Agent 應優先讀取此段落作為生成 UI 的整體定向。
Style Summary 限 1–2 句，Key Constraints 使用條列式。 -->

### Style Summary

[填入 1–2 句描述整體設計意圖。例：
「深色、簡約、以數據為核心的介面。專業美學，優先考慮資訊清晰度而非裝飾性。」]

### Key Constraints for AI Generation

- 所有顏色必須使用語義 token 名稱（background, surface, accent），禁止在元件中硬編碼 hex 值
- 每頁只有 1 個 H1；區段數量 ≤ 6
- `accent` 是唯一允許的強調色
- [填入：其他最關鍵的設計約束]

### Tone

[填入設計應帶給使用者的感受。例：「沉穩、自信、技術感。類似 Linear 或 Vercel 的 Dashboard 美學。」]
