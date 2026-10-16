---
source: ../../../core/accessibility-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: 31c9a2ac18c2
status: current
---

# 無障礙標準

> **語言**: [English](../../../core/accessibility-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-06-18
**適用性**: 所有具有使用者介面的軟體專案
**範圍**: 通用 (universal)
**業界標準**: WCAG 2.1/2.2, WAI-ARIA 1.2, Section 508
**參考**: [w3.org](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 目的

本標準定義建立無障礙軟體的完整指南，確保軟體能被具備不同能力的人士使用。本標準與包含 WCAG 2.1 在內的國際標準一致，並支援符合全球各地的無障礙法規。

**參考標準**：
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - 網頁內容無障礙指南 (Web Content Accessibility Guidelines)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - 最新 WCAG 版本 (2023)
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - 可延伸無障礙網際網路應用程式 (Accessible Rich Internet Applications)
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - 易用性 > 無障礙性 (Usability > Accessibility)
- [Section 508](https://www.section508.gov/) - 美國聯邦無障礙需求
- [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) - 歐洲無障礙標準

---

## 目錄

1. [無障礙原則 (POUR)](#accessibility-principles-pour)
2. [WCAG 合規等級](#wcag-conformance-levels)
3. [可感知 (Perceivable)](#perceivable)
4. [可操作 (Operable)](#operable)
5. [可理解 (Understandable)](#understandable)
6. [穩健 (Robust)](#robust)
7. [ARIA 指南](#aria-guidelines)
8. [鍵盤導航](#keyboard-navigation)
9. [色彩與對比](#color-and-contrast)
10. [表單與輸入](#forms-and-inputs)
11. [媒體無障礙](#media-accessibility)
12. [測試與驗證](#testing-and-validation)
13. [無障礙檢查清單](#accessibility-checklist)

---

## 無障礙原則 (POUR)

```
┌─────────────────────────────────────────────────────────────────┐
│               WCAG 2.1 POUR Principles                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   P - PERCEIVABLE                                               │
│   ├── Users must be able to perceive the information           │
│   ├── Text alternatives for non-text content                   │
│   ├── Captions and alternatives for multimedia                 │
│   └── Content adaptable and distinguishable                    │
│                                                                 │
│   O - OPERABLE                                                  │
│   ├── All functionality available via keyboard                 │
│   ├── Users have enough time to read and use content          │
│   ├── Content doesn't cause seizures                          │
│   └── Users can navigate and find content                     │
│                                                                 │
│   U - UNDERSTANDABLE                                            │
│   ├── Text is readable and understandable                     │
│   ├── Content appears and operates predictably                │
│   └── Users are helped to avoid and correct mistakes          │
│                                                                 │
│   R - ROBUST                                                    │
│   ├── Content compatible with current and future tools        │
│   ├── Works with assistive technologies                       │
│   └── Valid, well-formed markup                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## WCAG 合規等級

### 等級概觀

| 等級 | 說明 | 適用對象 |
|-------|-------------|--------------|
| **A** | 最低無障礙程度 | 所有專案 |
| **AA** | 解決主要障礙 | 法規合規（大多數法律） |
| **AAA** | 最高無障礙程度 | 特殊情境 |

### 各區域合規要求

| 地區 | 法律／標準 | 最低等級 |
|--------|--------------|---------------|
| **美國** | Section 508, ADA | WCAG 2.0 AA |
| **歐盟** | EN 301 549 | WCAG 2.1 AA |
| **英國** | Equality Act 2010 | WCAG 2.1 AA |
| **加拿大** | AODA | WCAG 2.0 AA |
| **澳洲** | DDA | WCAG 2.0 AA |

### 目標：WCAG 2.1 等級 AA

**建議**：所有專案應以 **WCAG 2.1 等級 AA** 為基準目標，涵蓋：
- 30 項等級 A 準則（必須具備）
- 20 項等級 AA 準則（應具備）

---

## 可感知 (Perceivable)

### 1.1 替代文字

**要求**：為非文字內容提供替代文字。

```html
<!-- ✅ Good: Meaningful alt text -->
<img src="chart.png" alt="Sales increased 25% from Q1 to Q2 2025">

<!-- ✅ Good: Decorative image (empty alt) -->
<img src="decorative-border.png" alt="" role="presentation">

<!-- ❌ Bad: Missing or generic alt -->
<img src="chart.png">
<img src="chart.png" alt="image">
<img src="chart.png" alt="chart.png">
```

**替代文字指南**：

| 圖片類型 | 替代文字處理方式 |
|------------|-------------------|
| **資訊型 (Informative)** | 描述所傳達的資訊 |
| **功能型 (Functional)** | 描述其動作（例如：「提交表單」） |
| **裝飾型 (Decorative)** | 使用空的 alt (`alt=""`) |
| **複雜型 (Complex)** | 提供長描述（透過 `aria-describedby`） |
| **圖片中包含文字** | 將所有文字包含在 alt 中 |

### 1.2 時基媒體

| 媒體類型 | 要求 |
|------------|--------------|
| **預錄音訊** | 文字稿 (Transcript) |
| **預錄影片** | 字幕 + 語音旁白描述 (audio description) |
| **即時音訊** | 即時字幕 |
| **即時影片** | 即時字幕 |

### 1.3 可適應內容

```html
<!-- ✅ Good: Semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>

<!-- ❌ Bad: Non-semantic markup -->
<div class="nav">
  <div class="nav-item">Home</div>
  <div class="nav-item">About</div>
</div>
```

### 1.4 可辨別 (Distinguishable)

**色彩對比要求**：

| 元素 | 最低比率 (AA) | 增強比率 (AAA) |
|---------|-------------------|----------------------|
| **一般文字** | 4.5:1 | 7:1 |
| **大型文字（18px+ 或 14px+ 粗體）** | 3:1 | 4.5:1 |
| **UI 元件與圖形** | 3:1 | 不適用 |

---

## 可操作

### 2.1 鍵盤可存取

**所有功能都必須能透過鍵盤操作。**

```html
<!-- ✅ Good: Focusable and keyboard operable -->
<button onclick="submitForm()">Submit</button>

<!-- ❌ Bad: Not keyboard accessible -->
<div onclick="submitForm()">Submit</div>

<!-- ✅ Good: Making div keyboard accessible (if button not possible) -->
<div
  role="button"
  tabindex="0"
  onclick="submitForm()"
  onkeydown="if(event.key === 'Enter' || event.key === ' ') submitForm()">
  Submit
</div>
```

### 2.2 充足時間

| 需求 | 實作方式 |
|------|----------|
| **時間可調整** | 允許使用者關閉、調整或延長時間限制 |
| **自動更新內容** | 提供暫停、停止或隱藏控制項 |
| **工作階段逾時** | 在逾時前發出警告，並允許延長 |

```javascript
// ✅ Good: Session timeout warning
// A warning + a way to extend the session is REQUIRED by WCAG 2.2.1 (Timing
// Adjustable). The specific durations are UDS defaults and are configurable:
// 30 min idle aligns with NIST SP 800-63B AAL2 reauthentication guidance.
const TIMEOUT_WARNING = 5 * 60 * 1000; // 5 min warning before timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min idle (UDS default; configurable)

setTimeout(() => {
  const extend = confirm('Your session will expire in 5 minutes. Extend?');
  if (extend) {
    extendSession();
  }
}, SESSION_TIMEOUT - TIMEOUT_WARNING);
```

### 2.3 癲癇與身體反應

| 需求 | 限制 |
|------|------|
| **閃爍內容** | 每秒閃爍不超過 3 次 |
| **動畫** | 提供減少動態效果的選項 |

```css
/* ✅ Good: Respect user's motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.4 可導航

**焦點管理**：

```css
/* ✅ Good: Visible focus indicator */
:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* ❌ Bad: Removing focus indicator */
:focus {
  outline: none;
}
```

**略過連結**：

```html
<!-- ✅ Good: Skip to main content link -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav><!-- navigation --></nav>

<main id="main-content">
  <!-- main content -->
</main>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background: #000;
  color: #fff;
}
.skip-link:focus {
  top: 0;
}
</style>
```

### 2.5 輸入方式

| 需求 | 說明 |
|------|------|
| **指標手勢** | 複雜手勢具有簡單的替代方式 |
| **指標取消** | 放開事件（Up-event）觸發、具備中止能力 |
| **目標尺寸** | 觸控目標至少為 44x44 CSS 像素 |
| **動作觸發** | 可被停用、具有替代方案 |

---

## 可理解

### 3.1 可讀性

```html
<!-- ✅ Good: Declare page language -->
<html lang="en">

<!-- ✅ Good: Mark language changes -->
<p>The French phrase <span lang="fr">c'est la vie</span> means "that's life".</p>
```

### 3.2 可預測

| 原則 | 實作方式 |
|------|----------|
| **獲得焦點時** | 僅獲得焦點時不改變情境脈絡 |
| **輸入時** | 在自動送出或改變情境脈絡前發出警告 |
| **一致的導航** | 跨頁面保持相同的導航順序 |
| **一致的識別** | 相同功能使用相同的標籤 |

### 3.3 輸入協助

**錯誤識別**：

```html
<!-- ✅ Good: Clear error message with instructions -->
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true">
<span id="email-error" class="error" role="alert">
  Please enter a valid email address (e.g., user@example.com)
</span>

<!-- ❌ Bad: Generic or missing error message -->
<input type="email" class="invalid">
```

**錯誤預防**：

| 操作類型 | 必要預防措施 |
|----------|--------------|
| **法律／財務** | 可回復、可檢查或可確認 |
| **資料修改** | 可復原（undo）或可確認 |
| **測驗／考試送出** | 送出前可檢查 |

---

## 穩健

### 4.1 相容性

**有效的 HTML**：

```html
<!-- ✅ Good: Valid, unique IDs -->
<label for="username">Username</label>
<input type="text" id="username" name="username">

<!-- ❌ Bad: Duplicate IDs -->
<input type="text" id="field">
<input type="text" id="field">  <!-- Duplicate! -->
```

**ARIA 使用**：

```html
<!-- ✅ Good: Valid ARIA attributes -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>
  <li>Item 1</li>
</ul>

<!-- ❌ Bad: Invalid ARIA values -->
<button aria-expanded="yes">  <!-- Should be "true" or "false" -->
```

---

## ARIA 指南

### ARIA 規則

```
┌─────────────────────────────────────────────────────────────────┐
│                    Five Rules of ARIA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Don't use ARIA if native HTML works                        │
│      <button> is better than <div role="button">               │
│                                                                 │
│   2. Don't change native semantics                              │
│      Don't: <h1 role="button">                                 │
│      Do: <h1><button>Click</button></h1>                       │
│                                                                 │
│   3. All interactive ARIA controls must be keyboard usable     │
│      role="button" needs Enter/Space key handling              │
│                                                                 │
│   4. Don't use role="presentation" or aria-hidden="true"       │
│      on focusable elements                                     │
│                                                                 │
│   5. All interactive elements must have accessible names       │
│      Use aria-label, aria-labelledby, or visible label        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 常見 ARIA 模式

**即時區域（Live Regions）**：

```html
<!-- Announce dynamic content changes -->
<div aria-live="polite" aria-atomic="true">
  <!-- Content updates announced to screen readers -->
</div>

<!-- For urgent announcements -->
<div role="alert">
  Error: Please correct the form fields.
</div>
```

**對話方塊／互動視窗（Dialogs/Modals）**：

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-desc">Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**分頁標籤（Tabs）**：

```html
<div role="tablist" aria-label="Product tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    Description
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    Reviews
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Description content...
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  Reviews content...
</div>
```

---

## 鍵盤導航

### 標準鍵盤互動

| 按鍵 | 操作 |
|-----|--------|
| **Tab** | 移至下一個可取得焦點的元素 |
| **Shift + Tab** | 移至上一個可取得焦點的元素 |
| **Enter** | 啟動連結或按鈕 |
| **Space** | 啟動按鈕、切換核取方塊 |
| **方向鍵** | 在元件內導覽（分頁標籤、選單等） |
| **Escape** | 關閉互動視窗、取消操作 |
| **Home/End** | 跳至清單中的第一個／最後一個項目 |

### 焦點順序

```html
<!-- ✅ Good: Logical focus order follows visual order -->
<header>
  <nav><!-- Focus 1, 2, 3 --></nav>
</header>
<main><!-- Focus 4, 5, 6 --></main>
<footer><!-- Focus 7, 8 --></footer>

<!-- ❌ Bad: Tabindex disrupting natural order -->
<button tabindex="3">Third</button>
<button tabindex="1">First</button>
<button tabindex="2">Second</button>
```

### SPA 的焦點管理

```javascript
// ✅ Good: Move focus after route change
function navigateToPage(pageId) {
  // Change page content
  updateContent(pageId);

  // Move focus to main content heading
  const heading = document.querySelector(`#${pageId} h1`);
  heading.setAttribute('tabindex', '-1');
  heading.focus();

  // Announce to screen readers
  announcePageChange(heading.textContent);
}
```

---

## 色彩與對比

### 對比度需求

| 元素 | WCAG AA | WCAG AAA |
|---------|---------|----------|
| **一般文字** | 4.5:1 | 7:1 |
| **大型文字** | 3:1 | 4.5:1 |
| **UI 元件** | 3:1 | 3:1 |
| **非文字圖形** | 3:1 | 3:1 |

### 色盲考量事項

```
┌─────────────────────────────────────────────────────────────────┐
│                Color Vision Deficiency Types                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Type              Affects          Prevalence                 │
│   ─────────────────────────────────────────────────────        │
│   Deuteranomaly     Green            ~6% of males               │
│   Protanomaly       Red              ~1% of males               │
│   Tritanomaly       Blue             <1% of population          │
│   Achromatopsia     All colors       Very rare                  │
│                                                                 │
│   Guidelines:                                                   │
│   ├── Don't rely on color alone to convey information          │
│   ├── Use patterns, icons, or text in addition to color        │
│   ├── Test with color blindness simulators                     │
│   └── Avoid red/green combinations for critical info           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**範例**：

```html
<!-- ❌ Bad: Color alone indicates status -->
<span class="status-green">Available</span>
<span class="status-red">Sold Out</span>

<!-- ✅ Good: Color + icon + text -->
<span class="status-green">
  <span aria-hidden="true">✓</span> Available
</span>
<span class="status-red">
  <span aria-hidden="true">✗</span> Sold Out
</span>
```

---

## 表單與輸入

### 表單標籤

```html
<!-- ✅ Good: Explicit label association -->
<label for="email">Email address</label>
<input type="email" id="email" name="email">

<!-- ✅ Good: Using aria-label for icon-only buttons -->
<button aria-label="Search">
  <svg aria-hidden="true"><!-- search icon --></svg>
</button>

<!-- ✅ Good: Using aria-labelledby for complex labels -->
<span id="label">Quantity</span>
<span id="desc">Maximum 10 items</span>
<input type="number" aria-labelledby="label" aria-describedby="desc">

<!-- ❌ Bad: Placeholder as only label -->
<input type="email" placeholder="Email">
```

### 表單驗證

```html
<!-- ✅ Good: Accessible error handling -->
<form novalidate>
  <div>
    <label for="email">Email *</label>
    <input
      type="email"
      id="email"
      required
      aria-required="true"
      aria-invalid="false"
      aria-describedby="email-hint email-error">
    <span id="email-hint" class="hint">We'll never share your email</span>
    <span id="email-error" class="error" hidden></span>
  </div>
</form>

<script>
function validateEmail(input) {
  const error = document.getElementById('email-error');
  if (!input.validity.valid) {
    input.setAttribute('aria-invalid', 'true');
    error.textContent = 'Please enter a valid email address';
    error.hidden = false;
  } else {
    input.setAttribute('aria-invalid', 'false');
    error.hidden = true;
  }
}
</script>
```

### 必填欄位

```html
<!-- ✅ Good: Multiple indicators for required fields -->
<label for="name">
  Full Name
  <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input type="text" id="name" required aria-required="true">

<p class="form-note" aria-hidden="true">* Required fields</p>
```

---

## 媒體無障礙

### 圖片

| 類型 | 實作 |
|------|------|
| **資訊性** | `alt="Description of information"` |
| **裝飾性** | `alt="" role="presentation"` |
| **功能性** | `alt="Action description"` |
| **複雜** | `alt="Summary" + aria-describedby` |

### 影片

```html
<!-- ✅ Good: Accessible video -->
<figure>
  <video
    controls
    aria-describedby="video-desc">
    <source src="video.mp4" type="video/mp4">
    <track kind="captions" src="captions.vtt" srclang="en" label="English">
    <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Audio Descriptions">
  </video>
  <figcaption id="video-desc">
    Product demonstration showing key features.
  </figcaption>
</figure>
```

### 音訊

```html
<!-- ✅ Good: Audio with transcript -->
<audio controls aria-describedby="audio-desc">
  <source src="podcast.mp3" type="audio/mpeg">
</audio>
<details id="audio-desc">
  <summary>View transcript</summary>
  <p>Full transcript of the podcast episode...</p>
</details>
```

---

## 測試與驗證

### 自動化測試工具

| 工具 | 類型 | 涵蓋範圍 |
|------|------|----------|
| **axe-core** | 瀏覽器擴充功能、CI | ~57% 的 WCAG 問題 |
| **WAVE** | 瀏覽器擴充功能 | 視覺回饋 |
| **Lighthouse** | 瀏覽器 DevTools | 效能 + a11y |
| **Pa11y** | CI/CD 整合 | 自動化測試 |
| **jest-axe** | 單元測試 | 元件測試 |

### 手動測試檢查清單

```
Keyboard Testing:
□ Can reach all interactive elements with Tab
□ Focus indicator visible on all elements
□ Can activate all controls with Enter/Space
□ Can dismiss modals with Escape
□ Focus returns to trigger after modal closes
□ No keyboard traps

Screen Reader Testing:
□ All images have appropriate alt text
□ Form fields have labels
□ Headings structure is logical
□ Live regions announce updates
□ Links have descriptive text
□ Tables have headers

Visual Testing:
□ Text meets contrast requirements
□ Content readable at 200% zoom
□ No horizontal scrolling at 320px width
□ Focus indicators visible
□ Color not sole means of information
□ Content works in high contrast mode
```

### 螢幕閱讀器測試

| 平台 | 螢幕閱讀器 |
|----------|---------------|
| **Windows** | NVDA（免費）、JAWS |
| **macOS** | VoiceOver |
| **iOS** | VoiceOver |
| **Android** | TalkBack |

### CI/CD 整合

```yaml
# Example: GitHub Actions accessibility testing
name: Accessibility

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Run Pa11y
        uses: pa11y/pa11y-ci-action@v1
        with:
          sitemap: https://example.com/sitemap.xml
```

---

## 無障礙檢查清單

### 開發檢查清單

```
Structure:
□ Semantic HTML elements used (header, nav, main, etc.)
□ Heading hierarchy is logical (h1 → h2 → h3)
□ Page has descriptive title
□ Language attribute set on html element

Images:
□ All images have alt attributes
□ Decorative images have empty alt
□ Complex images have extended descriptions

Keyboard:
□ All interactive elements keyboard accessible
□ Visible focus indicators
□ No keyboard traps
□ Skip links provided

Forms:
□ All inputs have associated labels
□ Required fields indicated
□ Error messages clear and specific
□ Form validation accessible

Color:
□ Text meets contrast requirements
□ Information not conveyed by color alone
□ Links distinguishable from text

Multimedia:
□ Videos have captions
□ Audio has transcripts
□ Media controls accessible
```

### 審查檢查清單

```
Before Release:
□ Automated accessibility scan completed (axe, Lighthouse)
□ Keyboard navigation tested
□ Screen reader tested (at least one)
□ Color contrast verified
□ Zoom to 200% tested
□ Mobile accessibility tested
□ Form accessibility verified
□ Error handling tested
```

---

## 發布阻擋門檻

本節定義在正式發布前必須通過的**最低 a11y 關卡**（`release-readiness-gate.md` 中的維度 3，Tier-2）。

### 自動化關卡 (CI — axe-core / Pa11y)

| 嚴重程度 | 硬性最低要求 | 警告區間 |
|----------|-------------|-----------|
| critical | 0（阻擋發布） | — |
| serious | ≤ 專案設定門檻（預設：0） | +1–2 → WARN |
| moderate | 建議性質，不阻擋 | — |
| minor | 建議性質，不阻擋 | — |

在發布前針對每個關鍵使用者流程畫面執行 axe-core：

```bash
npx axe-cli <url> --tags wcag2a,wcag2aa --exit  # non-zero exit if critical/serious
```

若 `critical > 0` 或 `serious > configured-threshold`，CI 必須判定組建失敗。

### 依專案類型的合規等級

| 專案類型 | 最低合規等級 | 備註 |
|-------------|-------------------|-------|
| 一般 Web / SaaS | WCAG 2.1 Level AA | 預設 |
| 金融、醫療保健、政府 | WCAG 2.1 Level AA + Section 508 | 法定強制 |
| 標竿 / 高階品牌 | WCAG 2.2 Level AA | 建議 |

### 鍵盤導航關卡（手動，UAT 前）

所有關鍵使用者流程（如 requirement-template §2.4 所定義）必須能完全僅透過鍵盤操作：
- Tab / Shift+Tab：導航所有互動元素
- Enter / Space：啟動控制項
- Escape：關閉強制回應視窗 / 覆蓋層（modals / overlays）
- 方向鍵：導航選單、分頁標籤、樹狀檢視

關卡標準：關鍵流程步驟 100% 可透過鍵盤到達；無鍵盤陷阱。

### 螢幕閱讀器抽檢（手動，UAT 前）

最低要求：在以下各環境中各測試 1 個關鍵使用者流程：
- **Windows**：NVDA + Chrome
- **macOS**：VoiceOver + Safari

通過標準：所有步驟皆可在不依賴視覺參考的情況下完成；播報所有表單錯誤；播報所有動態內容變更。

### 發布簽核佐證

a11y 關卡納入發布就緒簽核（Release Readiness Sign-off）的形式如下：

```
| 3 | Accessibility | PASS | axe report: 0 critical / 0 serious; keyboard pass; SR spot-check VoiceOver OK | QA Lead |
```

---

## 相關標準

- [文件撰寫標準](documentation-writing-standards.md) - 無障礙文件
- [程式碼審查檢查清單](code-review-checklist.md) - 無障礙審查
- [測試標準](testing-standards.md) - 無障礙測試
- [安全標準](security-standards.md) - 身分驗證無障礙
- [發布就緒關卡](release-readiness-gate.md) - 維度 3：a11y 發布關卡

---

## 參考資料

### 標準
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - 快速參考指南
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - 最新版本
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - ARIA 規格
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - 設計模式

### 工具
- [axe DevTools](https://www.deque.com/axe/) - 瀏覽器擴充功能
- [WAVE](https://wave.webaim.org/) - 網頁無障礙評估工具
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - 色彩對比工具
- [NVDA](https://www.nvaccess.org/) - Windows 免費螢幕閱讀器

### 學習資源
- [WebAIM](https://webaim.org/) - 網頁無障礙資源
- [A11Y Project](https://www.a11yproject.com/) - 社群驅動資源
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) - 開發者指南

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.1.0 | 2026-06-18 | 新增：工作階段逾時時間（session-timeout durations）的來源與可設定性說明（WCAG 2.2.1 Timing Adjustable；NIST SP 800-63B AAL2）（XSPEC-292 T8） |
| 1.0.0 | 2026-01-29 | 初始發布：涵蓋 WCAG 2.1、POUR 原則、ARIA 指南、鍵盤導航、表單、測試 |

---

## 授權條款

本標準採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
