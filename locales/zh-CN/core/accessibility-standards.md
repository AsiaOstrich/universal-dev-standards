---
source: ../../../core/accessibility-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: 31c9a2ac18c2
status: current
---

# 无障碍标准

> **语言**: [English](../../../core/accessibility-standards.md) | [繁體中文](../../zh-TW/core/accessibility-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-06-18
**适用范围**: 所有包含用户界面的软件项目
**范围**: universal
**行业标准**: WCAG 2.1/2.2, WAI-ARIA 1.2, Section 508
**参考**: [w3.org](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 目的

本标准定义创建无障碍软件的综合指南，使具有不同能力的人都能使用。标准与国际标准（包括 WCAG 2.1）保持对齐，并支持全球无障碍法规的合规性。

**参考标准**:
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - 网页内容无障碍指南
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - 最新 WCAG 版本（2023）
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - 无障碍富互联网应用
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - 可用性 > 无障碍
- [Section 508](https://www.section508.gov/) - 美国联邦无障碍要求
- [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) - 欧洲无障碍标准

---

## 目录

1. [无障碍原则（POUR）](#accessibility-principles-pour)
2. [WCAG 合规级别](#wcag-conformance-levels)
3. [可感知](#perceivable)
4. [可操作](#operable)
5. [可理解](#understandable)
6. [健壮](#robust)
7. [ARIA 指南](#aria-guidelines)
8. [键盘导航](#keyboard-navigation)
9. [颜色与对比度](#color-and-contrast)
10. [表单与输入](#forms-and-inputs)
11. [媒体无障碍](#media-accessibility)
12. [测试与验证](#testing-and-validation)
13. [无障碍检查清单](#accessibility-checklist)

---

## 无障碍原则（POUR）

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

## WCAG 合规级别

### 级别概述

| 级别 | 描述 | 适用要求 |
|-------|-------------|--------------|
| **A** | 最低无障碍 | 所有项目 |
| **AA** | 解决主要障碍 | 法律合规（大多数法律） |
| **AAA** | 最高级别无障碍 | 特定场景 |

### 各地区合规要求

| 地区 | 法律/标准 | 最低级别 |
|--------|--------------|---------------|
| **美国** | Section 508, ADA | WCAG 2.0 AA |
| **欧盟** | EN 301 549 | WCAG 2.1 AA |
| **英国** | Equality Act 2010 | WCAG 2.1 AA |
| **加拿大** | AODA | WCAG 2.0 AA |
| **澳大利亚** | DDA | WCAG 2.0 AA |

### 目标：WCAG 2.1 Level AA

**建议**: 所有项目应将 **WCAG 2.1 Level AA** 作为基准，涵盖：
- 30 项 A 级准则（必须具备）
- 20 项 AA 级准则（应当具备）

---

## 可感知

### 1.1 文本替代

**要求**: 为非文本内容提供文本替代。

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

**Alt 文本指南**:

| 图片类型 | Alt 文本处理方式 |
|------------|-------------------|
| **信息性** | 描述所传达的信息 |
| **功能性** | 描述操作（例如，“提交表单”） |
| **装饰性** | 使用空 alt（`alt=""`） |
| **复杂** | 提供长描述（通过 `aria-describedby`） |
| **图片中的文本** | 在 alt 中包含所有文本 |

### 1.2 基于时间的媒体

| 媒体类型 | 要求 |
|------------|--------------|
| **预录音频** | 文字记录 |
| **预录视频** | 字幕 + 音频描述 |
| **直播音频** | 实时字幕 |
| **直播视频** | 实时字幕 |

### 1.3 可适配内容

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

### 1.4 可区分

**颜色对比度要求**:

| 元素 | 最低比例（AA） | 增强比例（AAA） |
|---------|-------------------|----------------------|
| **普通文本** | 4.5:1 | 7:1 |
| **大文本（18px+ 或 14px+ 粗体）** | 3:1 | 4.5:1 |
| **UI 组件与图形** | 3:1 | 不适用 |

---

## 可操作

### 2.1 键盘可访问

**所有功能必须可通过键盘操作。**

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

### 2.2 充足时间

| 要求 | 实现 |
|------|------|
| **时间可调节** | 允许用户关闭、调整或延长时限 |
| **自动更新内容** | 提供暂停、停止或隐藏控件 |
| **会话超时** | 超时前发出警告，允许延长 |

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

### 2.3 癫痫与身体反应

| 要求 | 限制 |
|------|------|
| **闪烁内容** | 每秒闪烁不超过 3 次 |
| **动画** | 提供减少动态效果的选项 |

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

### 2.4 可导航

**焦点管理**：

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

**跳过链接**：

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

### 2.5 输入方式

| 要求 | 说明 |
|------|------|
| **指针手势** | 复杂手势具备简易替代方案 |
| **指针取消** | 抬起事件激活，具备中止能力 |
| **目标尺寸** | 触控目标至少为 44x44 CSS 像素 |
| **动作驱动** | 可被禁用，具备替代方案 |

---

## 可理解

### 3.1 可读

```html
<!-- ✅ Good: Declare page language -->
<html lang="en">

<!-- ✅ Good: Mark language changes -->
<p>The French phrase <span lang="fr">c'est la vie</span> means "that's life".</p>
```

### 3.2 可预测

| 原则 | 实现 |
|------|------|
| **获得焦点时** | 不得仅因获得焦点而改变上下文 |
| **输入时** | 在自动提交或上下文改变之前发出警告 |
| **一致的导航** | 跨页面保持相同的导航顺序 |
| **一致的标识** | 相同功能使用相同的标签 |

### 3.3 输入协助

**错误识别**：

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

**错误预防**：

| 操作类型 | 必需的预防措施 |
|----------|----------------|
| **法律/财务** | 可逆、可审查或可确认 |
| **数据修改** | 可恢复（撤销）或可确认 |
| **考试/测试提交** | 提交前可审查 |

---

## 健壮

### 4.1 兼容

**有效的 HTML**：

```html
<!-- ✅ Good: Valid, unique IDs -->
<label for="username">Username</label>
<input type="text" id="username" name="username">

<!-- ❌ Bad: Duplicate IDs -->
<input type="text" id="field">
<input type="text" id="field">  <!-- Duplicate! -->
```

**ARIA 用法**：

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

### ARIA 规则

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

### 常见 ARIA 模式

**实时区域**:

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

**对话框/模态框**:

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

**标签页**:

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

## 键盘导航

### 标准键盘交互

| 按键 | 操作 |
|-----|--------|
| **Tab** | 移动到下一个可聚焦元素 |
| **Shift + Tab** | 移动到上一个可聚焦元素 |
| **Enter** | 激活链接或按钮 |
| **Space** | 激活按钮，切换复选框 |
| **方向键** | 在组件内导航（标签页、菜单等） |
| **Escape** | 关闭模态框，取消操作 |
| **Home/End** | 跳到列表中的第一项/最后一项 |

### 焦点顺序

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

### SPA 的焦点管理

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

## 颜色与对比度

### 对比度要求

| 元素 | WCAG AA | WCAG AAA |
|---------|---------|----------|
| **普通文本** | 4.5:1 | 7:1 |
| **大文本** | 3:1 | 4.5:1 |
| **UI 组件** | 3:1 | 3:1 |
| **非文本图形** | 3:1 | 3:1 |

### 色盲注意事项

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

**示例**:

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

## 表单与输入框

### 表单标签

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

### 表单验证

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

### 必填字段

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

## 媒体无障碍

### 图像

| 类型 | 实现方式 |
|------|----------|
| **信息性** | `alt="Description of information"` |
| **装饰性** | `alt="" role="presentation"` |
| **功能性** | `alt="Action description"` |
| **复杂** | `alt="Summary" + aria-describedby` |

### 视频

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

### 音频

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

## 测试与验证

### 自动化测试工具

| 工具 | 类型 | 覆盖范围 |
|------|------|----------|
| **axe-core** | 浏览器扩展、CI | ~57% 的 WCAG 问题 |
| **WAVE** | 浏览器扩展 | 可视化反馈 |
| **Lighthouse** | 浏览器 DevTools | 性能 + 无障碍 |
| **Pa11y** | CI/CD 集成 | 自动化测试 |
| **jest-axe** | 单元测试 | 组件测试 |

### 手动测试检查清单

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

### 屏幕阅读器测试

| 平台 | 屏幕阅读器 |
|------|------------|
| **Windows** | NVDA（免费）、JAWS |
| **macOS** | VoiceOver |
| **iOS** | VoiceOver |
| **Android** | TalkBack |

### CI/CD 集成

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

## 无障碍检查清单

### 开发检查清单

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

### 审查检查清单

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

## 发布阻断阈值

本节定义了在生产发布前必须通过的**最低无障碍质量门禁**（`release-readiness-gate.md` 中的第 3 维度，Tier-2）。

### 自动化门禁（CI — axe-core / Pa11y）

| 严重程度 | 硬性最低要求 | 警告区间 |
|----------|-------------|-----------|
| critical | 0（发布阻断项） | — |
| serious | ≤ 项目配置的阈值（默认值：0） | +1–2 → WARN |
| moderate | 建议性，不阻断 | — |
| minor | 建议性，不阻断 | — |

在发布前针对每个关键用户流程界面运行 axe-core：

```bash
npx axe-cli <url> --tags wcag2a,wcag2aa --exit  # non-zero exit if critical/serious
```

如果 `critical > 0` 或 `serious > configured-threshold`，CI 必须使构建失败。

### 按项目类型的符合性级别

| 项目类型 | 最低符合性 | 说明 |
|-------------|-------------------|-------|
| 通用 Web / SaaS | WCAG 2.1 Level AA | 默认 |
| 金融、医疗、政府 | WCAG 2.1 Level AA + Section 508 | 法律强制 |
| 追求卓越 / 高端品牌 | WCAG 2.2 Level AA | 推荐 |

### 键盘导航门禁（手动，UAT 前）

所有关键用户流程（如 requirement-template §2.4 中所定义）必须完全可仅通过键盘操作：
- Tab / Shift+Tab：导航所有交互元素
- Enter / Space：激活控件
- Escape：关闭模态框 / 遮罩层
- 方向键：导航菜单、选项卡、树形视图

门禁：100% 的关键流程步骤可通过键盘到达；无焦点陷阱。

### 屏幕阅读器抽检（手动，UAT 前）

最低要求：在以下每个环境中测试 1 个关键用户流程：
- **Windows**：NVDA + Chrome
- **macOS**：VoiceOver + Safari

通过标准：所有步骤在无需视觉参考的情况下均可完成；所有表单错误均有读屏朗读；所有动态内容变更均有读屏朗读。

### 发布签核凭证

无障碍门禁计入发布就绪签核的形式为：

```
| 3 | Accessibility | PASS | axe report: 0 critical / 0 serious; keyboard pass; SR spot-check VoiceOver OK | QA Lead |
```

---

## 相关标准

- [文档编写标准](documentation-writing-standards.md) - 无障碍文档
- [代码审查检查清单](code-review-checklist.md) - 无障碍审查
- [测试标准](testing-standards.md) - 无障碍测试
- [安全标准](security-standards.md) - 身份验证无障碍
- [发布就绪门禁](release-readiness-gate.md) - 维度 3：无障碍发布门禁

---

## 参考文献

### 标准
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - 快速参考
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - 最新版本
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - ARIA 规范
- [WAI-ARIA 创作实践](https://www.w3.org/WAI/ARIA/apg/) - 设计模式

### 工具
- [axe DevTools](https://www.deque.com/axe/) - 浏览器扩展
- [WAVE](https://wave.webaim.org/) - Web 无障碍评估
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - 颜色对比度工具
- [NVDA](https://www.nvaccess.org/) - Windows 免费屏幕阅读器

### 学习资源
- [WebAIM](https://webaim.org/) - Web 无障碍资源
- [A11Y Project](https://www.a11yproject.com/) - 社区驱动的资源
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) - 开发者指南

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.1.0 | 2026-06-18 | 新增：会话超时时长的来源 + 可配置说明（WCAG 2.2.1 Timing Adjustable；NIST SP 800-63B AAL2）（XSPEC-292 T8） |
| 1.0.0 | 2026-01-29 | 初始发布：WCAG 2.1 覆盖、POUR 原则、ARIA 指南、键盘导航、表单、测试 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
