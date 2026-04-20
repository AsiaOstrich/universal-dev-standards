---
source: ../../../core/frontend-design-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 前端設計標準

> **語言**: [English](../../../core/frontend-design-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-13
**狀態**: Active
**適用範圍**: 所有具備前端使用者介面的專案
**參考**: DEC-029（awesome-design-md, MIT）、DEC-030（OpenAI Frontend Guide）

---

## 目的

本標準定義一套機器可讀的前端設計規格格式（DESIGN.md），用於 AI 輔助開發。建立 9 段式 DESIGN.md 結構、強制設計 token 詞彙、UI 硬性約束，以及反模式拒絕規則。

目標是透過結構化設計約束（而非自由形式的風格描述）確保 AI Agent 在不同執行情境下產生一致、高品質的 UI。

**核心原則**：
- DESIGN.md 是設計規格的唯一真實來源
- 語意化 token 命名（框架無關）
- 約束式提示：自由度越少 = UI 品質越高
- 與原始碼同步進行版本控制

---

## DESIGN.md 結構

DESIGN.md 是放在專案根目錄的 Markdown 檔案，作為機器可讀的設計規格書。使用結構化 Markdown，人類與 AI Agent 皆可讀取。

```
傳統方式：Figma 設計稿 → 人類開發者 → 程式碼
新方式：DESIGN.md → AI Agent → 程式碼

DESIGN.md = 給 AI 讀的設計規格書
  - 人類可讀（Markdown 格式）
  - AI 可消費（結構化純文字）
  - 版本控制友善（放在 repo 根目錄）
  - 與程式碼同步演進
```

### 必填段落

完整的 DESIGN.md 必須依序包含全部 9 個段落：

| # | 段落鍵值 | 必填 | 說明 |
|---|---------|------|------|
| 1 | `visual-theme` | 是 | 整體風格與氛圍定義 |
| 2 | `color-palette` | 是 | 語意色彩 token 與 hex 值 |
| 3 | `typography` | 是 | 字型家族與字型階層角色 |
| 4 | `component-styling` | 是 | UI 元件的視覺規則 |
| 5 | `layout-spacing` | 是 | 間距尺度與格線定義 |
| 6 | `depth-shadow` | 是 | 層次感與陰影系統 |
| 7 | `design-guidelines` | 是 | 設計規則與反模式清單 |
| 8 | `responsive` | 是 | 斷點與響應式規則 |
| 9 | `agent-prompt-refs` | 是 | AI 可消費的設計意圖摘要 |

---

## 第 1 段：視覺主題與氛圍

**目的**：定義產品的整體美學意圖。AI Agent 在生成 UI 時以此作為高層次約束。

**必填欄位**：
- `theme`: 單行風格描述（如「極簡、專業、資料密集」）
- `mood`: 情感品質（如「沉穩、專注、可信賴」）
- `inspiration`: 參考產品或設計流派（如「Linear、Stripe dashboard」）
- `dark-mode`: 深色模式是 primary / secondary / 不支援

**範例**：
```markdown
## Visual Theme & Mood

- **Theme**: Minimal, professional, data-dense
- **Mood**: Calm, focused, trustworthy
- **Inspiration**: Linear app, Stripe dashboard
- **Dark Mode**: Primary (dark-first design)
```

---

## 第 2 段：色彩系統

**目的**：定義完整的語意色彩系統。所有顏色以語意 token 表示，不直接在程式碼中使用原始 hex 值。

**必填**：全部 5 個語意 token（詳見[語意色彩 Token](#語意色彩-token)）

**選填**：狀態延伸 token（error、warning、success、info）、border、overlay。

**範例**：
```markdown
## Color Palette

### Semantic Tokens（必填）
- **background**: `#0A0A0A` — 頁面背景
- **surface**: `#1A1A1A` — 卡片、面板、Modal
- **primary-text**: `#F5F5F5` — 主要正文
- **muted-text**: `#888888` — 次要文字、placeholder
- **accent**: `#6366F1` — CTA 按鈕、連結、強調

### Extended Tokens（選填）
- **error**: `#EF4444`
- **warning**: `#F59E0B`
- **success**: `#10B981`
- **border**: `#2A2A2A`
```

---

## 第 3 段：字型系統

**目的**：定義字型家族與字型階層角色。約束 AI 最多使用 2 個字型家族。

**必填**：全部 4 個字型角色定義（詳見[字型角色](#字型角色)）

**約束**：最多 2 個字型家族（display + body）。使用 3 個以上屬反模式。

**範例**：
```markdown
## Typography

### Font Families（最多 2 個）
- **Display font**: Inter（標題、展示文字）
- **Body font**: Inter（同一家族，不同字重可接受）

### Typographic Scale
- **display**: 48px+，weight 700，line-height 1.1 — 英雄標題
- **headline**: 24–32px，weight 600，line-height 1.3 — 段落標題
- **body**: 16px，weight 400，line-height 1.6 — 主要內文
- **caption**: 12–14px，weight 400，line-height 1.4 — 標籤、Metadata
```

---

## 第 4 段：元件樣式

**目的**：定義常見 UI 元件（按鈕、卡片、輸入框、徽章）的視覺規則。

**必填欄位**：
- 圓角尺度
- 按鈕變體（primary、secondary、ghost）
- 輸入框樣式
- 卡片 / surface 樣式

**範例**：
```markdown
## Component Styling

### Border Radius
- **sm**: 4px（小元素、徽章）
- **md**: 8px（按鈕、輸入框）
- **lg**: 12px（卡片、Modal）
- **full**: 9999px（圓形徽章、頭像）

### Buttons
- **Primary**: `accent` 背景，`#FFFFFF` 文字，`md` 圓角
- **Secondary**: `surface` 背景，`primary-text` 文字，`md` 圓角，1px border
- **Ghost**: 透明背景，`accent` 文字，無 border

### Inputs
- 背景：`surface`
- Border：1px solid `border`
- Focus：2px ring in `accent`
- 圓角：`md`
```

---

## 第 5 段：版面與間距

**目的**：定義間距尺度與格線系統。以 8px 基礎格線，定義 7 個間距步驟。

**必填**：標準尺度的全部 7 個間距步驟（詳見[間距尺度](#間距尺度)）

**範例**：
```markdown
## Layout & Spacing

### Spacing Scale（8px 基礎）
- **space-1**: 4px
- **space-2**: 8px
- **space-3**: 16px
- **space-4**: 24px
- **space-5**: 32px
- **space-6**: 48px
- **space-8**: 64px

### Grid
- **欄數**：12 欄格線
- **Gutter**：space-4（24px）
- **最大內容寬度**：1280px
- **頁面 padding**：行動端 space-4（24px），桌面端 space-6（48px）
```

---

## 第 6 段：層次感與陰影系統

**目的**：以陰影定義高度層次感，不依賴顏色建立視覺階層。

**必填**：至少 3 個高度層級。

**範例**：
```markdown
## Depth & Shadow System

- **elevation-0**: 無陰影（flat，surface 上的元素）
- **elevation-1**: `0 1px 2px rgba(0,0,0,0.4)`（細微，靜止狀態卡片）
- **elevation-2**: `0 4px 8px rgba(0,0,0,0.3)`（下拉選單、tooltip）
- **elevation-3**: `0 8px 24px rgba(0,0,0,0.5)`（Modal、對話框）
- **elevation-4**: `0 16px 48px rgba(0,0,0,0.6)`（全螢幕 overlay）
```

---

## 第 7 段：設計準則與反模式

**目的**：對 AI Agent 明確列出規則和禁止的 UI 模式。此段落是約束式提示的主要機制。

**必填子段落**：
1. UI 硬性約束（≥4 條規則）
2. 反模式清單（≥5 個禁止模式）

詳見 [UI 硬性約束](#ui-硬性約束)與[反模式](#反模式)。

**範例**：
```markdown
## Design Guidelines & Anti-patterns

### UI Hard Constraints
- 每頁最多 1 個 H1
- 每頁最多 6 個段落
- 最多 2 個字型家族
- 最多 1 個強調色（禁止混用多個強調色）
- 資訊階層：Hero → Support → Detail → CTA

### Anti-patterns（禁止）
- 禁止浮動徽章（floating badges）
- 禁止以通用卡片版面作為主要內容結構
- 禁止將 dashboard 格線用於首頁
- 禁止超過 3 層視覺巢狀
- 禁止純色彩差異（需搭配圖示或文字標籤）
- 禁止不傳遞資訊的裝飾性插圖
- 禁止同一畫面出現視覺權重相同的多個 CTA
```

---

## 第 8 段：響應式行為

**目的**：定義斷點與響應式規則。必須採用 Mobile-first 做法。

**必填**：至少 3 個斷點（mobile、tablet、desktop）。

**範例**：
```markdown
## Responsive Behavior

### Breakpoints（Mobile-first）
- **xs**: < 480px（小螢幕手機）
- **sm**: ≥ 768px（平板）
- **md**: ≥ 1024px（筆電）
- **lg**: ≥ 1280px（桌機）
- **xl**: ≥ 1536px（寬螢幕）

### Rules
- Mobile-first CSS（min-width 媒體查詢）
- xs/sm 單欄，md+ 多欄
- 行動端觸控目標 ≥ 44×44px
- sm 以下導覽收合為漢堡選單 / 底部導覽列
```

---

## 第 9 段：Agent 提示參考

**目的**：設計意圖的精簡 AI 最佳化摘要。AI Agent 應先讀此段作快速定向，再查閱其他段落。

**必填欄位**：
- `style-summary`: 1–2 句設計意圖
- `key-constraints`: 最關鍵規則的條列清單
- `tone`: 設計帶給使用者的「感受」

**範例**：
```markdown
## Agent Prompt References

### Style Summary
深色、極簡、以資料為核心的介面。優先追求清晰的專業美學，而非裝飾。

### Key Constraints for AI Generation
- 一律使用語意 token 名稱（background、surface、accent），元件中禁止直接使用 hex 值
- 每頁只有 1 個 H1；段落 ≤ 6 個
- accent（#6366F1）是唯一允許的強調色
- 偏好文字勝於裝飾性元件；克制勝於複雜

### Tone
沉穩、自信、技術感。類似 Linear 或 Vercel dashboard 的美學。
```

---

## 語意色彩 Token

每個 DESIGN.md **必須**定義以下 5 個語意色彩 token。它們與框架無關，必須使用這些精確名稱。

| Token | 角色 | 對應範例 |
|-------|------|---------|
| `background` | 頁面 / App 背景 | `#0A0A0A`（深色）/ `#FFFFFF`（淺色）|
| `surface` | 卡片、面板、Modal | `#1A1A1A`（深色）/ `#F9FAFB`（淺色）|
| `primary-text` | 主要正文 | `#F5F5F5`（深色）/ `#111827`（淺色）|
| `muted-text` | 次要文字、placeholder | `#888888`（深色）/ `#6B7280`（淺色）|
| `accent` | CTA 按鈕、連結、強調 | `#6366F1`（靛藍範例）|

**規則**：
- Token 名稱為 kebab-case，必須完全相符
- 每個 token 必須定義 hex 值
- `accent` 必須是單一顏色，禁止多個強調色
- 延伸 token（error、warning、success）為選填，但必須遵循相同命名模式

---

## 字型角色

每個 DESIGN.md **必須**定義以下 4 個字型角色：

| 角色 | 大小 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| `display` | 48px+ | 700 | 1.1 | 英雄標題、展示文字 |
| `headline` | 24–32px | 600 | 1.3 | 段落標題、卡片標題 |
| `body` | 16px | 400 | 1.6 | 段落、主要內文 |
| `caption` | 12–14px | 400 | 1.4 | 標籤、Metadata、輔助文字 |

**規則**：
- 角色名稱為小寫，必須完全相符
- 4 個角色最多使用 2 個字型家族
- 字型大小為最小值，響應式縮放可接受
- `display` 和 `headline` 可共用一個字型家族；`body` 和 `caption` 共用另一個（或相同）

---

## 間距尺度

標準間距尺度以 8px 基礎格線，定義 7 個命名步驟：

| Token | 值 | 用途 |
|-------|-----|------|
| `space-1` | 4px | 圖示內距、緊湊元素 |
| `space-2` | 8px | 預設元素內距 |
| `space-3` | 16px | 元件內部間距 |
| `space-4` | 24px | 段落內距、Gutter |
| `space-5` | 32px | 元件之間 |
| `space-6` | 48px | 主要段落之間 |
| `space-8` | 64px | 頁面層級分隔 |

**規則**：
- 所有程式碼中的間距必須使用這些步驟 token，不得使用任意 px 值
- `space-7` 刻意跳過（直接跳到 space-8=64px 維持視覺節奏）
- 響應式調整仍須使用尺度步驟（如行動端用 space-4，桌面端用 space-6）

---

## UI 硬性約束

以下約束適用於本標準下生成的所有 UI。實作約束式提示：限制自由度可產生品質更高、更一致的 UI。

| 約束 | 規則 | 理由 |
|------|------|------|
| H1 數量 | 每頁最多 1 個 H1 | 清晰內容階層 |
| 段落數量 | 每頁最多 6 個段落 | 防止認知過載 |
| 字型家族 | 最多 2 個字型家族 | 視覺一致性 |
| 強調色 | 最多 1 個強調色 | 防止視覺噪音 |
| 巢狀深度 | 最多 3 層視覺巢狀 | 可讀性 |
| 資訊階層 | Hero → Support → Detail → CTA | 敘事結構 |
| 觸控目標 | 行動端最小 44×44px | 無障礙設計 |

---

## 反模式

以下 UI 模式為**禁止**。AI Agent 在生成前端程式碼或設計規格時必須拒絕這些模式。

| 反模式 | 說明 | 建議替代方案 |
|--------|------|------------|
| `floating-badge` | 與內容脫離的浮動徽章 | 行內標籤或狀態指示器 |
| `generic-card-layout` | 以完全相同的卡片堆疊作為主要內容 | 有清晰階層的多元內容結構 |
| `dashboard-grid-as-homepage` | 行銷首頁看起來像資料 dashboard | Hero → Support → CTA 敘事首頁 |
| `competing-ctas` | 同一畫面出現視覺權重相同的多個 CTA | 一個 primary CTA，零或一個 secondary CTA |
| `color-only-differentiation` | 僅用顏色傳達狀態或類別 | 搭配圖示、圖案或文字標籤 |
| `decorative-overload` | 不傳遞資訊的插圖或動畫 | 移除裝飾性元素；偏好功能性視覺 |
| `triple-nesting` | 視覺階層超過 3 層 | 攤平結構；以留白作分隔 |
| `rainbow-accents` | 多個強調 / 高亮色（紫色 CTA、橙色徽章、綠色標籤）| 單一強調色系統 |

每個 DESIGN.md 的第 7 段必須明確列出至少 5 個反模式。

---

## DESIGN.md 檔案位置

DESIGN.md 必須放在**專案根目錄**，與 README.md 同層。

```
my-project/
├── README.md          ← 專案概覽（給人看）
├── DESIGN.md          ← 設計規格（給人 + AI Agent 看）
├── CLAUDE.md          ← AI 助理設定（如適用）
├── src/
│   └── ...
└── package.json
```

**規則**：
- 檔名：`DESIGN.md`（大小寫必須完全相符）
- 位置：僅在專案根目錄（不在 `docs/`、`src/` 或子目錄）
- 格式：使用 `##` 層級段落標題的 Markdown
- 版本：文件標頭包含版本欄位
- 更新政策：設計 token 變更時 DESIGN.md 必須同步更新；視為程式碼，而非文件

---

## 驗證清單

使用此清單驗證 DESIGN.md 是否符合本標準：

### 結構
- [ ] 全部 9 個段落依序存在
- [ ] 檔案位於專案根目錄（與 README.md 同層）
- [ ] 檔名精確為 `DESIGN.md`

### 色彩系統（第 2 段）
- [ ] 定義了全部 5 個語意 token：`background`、`surface`、`primary-text`、`muted-text`、`accent`
- [ ] 所有 token 都有 hex 值
- [ ] 只定義了 1 個強調色

### 字型系統（第 3 段）
- [ ] 定義了全部 4 個角色：`display`、`headline`、`body`、`caption`
- [ ] 最多使用 2 個字型家族
- [ ] 字型大小在指定範圍內

### 間距（第 5 段）
- [ ] 定義了全部 7 個間距步驟：space-1 到 space-8（無 space-7）
- [ ] 值符合 8px 基礎尺度

### 設計準則（第 7 段）
- [ ] 列出至少 4 條 UI 硬性約束
- [ ] 列出至少 5 個反模式
- [ ] 明確禁止 `floating-badge`、`generic-card-layout`、`dashboard-grid-as-homepage`

### Agent 提示參考（第 9 段）
- [ ] 風格摘要存在（1–2 句）
- [ ] 關鍵約束條列清單存在
- [ ] 氛圍（tone）已定義
