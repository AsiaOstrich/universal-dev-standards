# Accessibility Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/accessibility-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Applicability**: All software projects with user interfaces
**Scope**: universal

---

## Purpose

This standard defines comprehensive guidelines for creating accessible software that can be used by people with diverse abilities. It aligns with international standards including WCAG 2.1 and supports compliance with accessibility laws worldwide.

**Reference Standards**:
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - Latest WCAG version (2023)
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - Accessible Rich Internet Applications
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - Usability > Accessibility
- [Section 508](https://www.section508.gov/) - US Federal accessibility requirements
- [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) - European accessibility standard

---

## Table of Contents

1. [Accessibility Principles (POUR)](#accessibility-principles-pour)
2. [WCAG Conformance Levels](#wcag-conformance-levels)
3. [Perceivable](#perceivable)
4. [Operable](#operable)
5. [Understandable](#understandable)
6. [Robust](#robust)
7. [ARIA Guidelines](#aria-guidelines)
8. [Keyboard Navigation](#keyboard-navigation)
9. [Color and Contrast](#color-and-contrast)
10. [Forms and Inputs](#forms-and-inputs)
11. [Media Accessibility](#media-accessibility)
12. [Testing and Validation](#testing-and-validation)
13. [Accessibility Checklist](#accessibility-checklist)

---

## Accessibility Principles (POUR)

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

## WCAG Conformance Levels

### Level Overview

| Level | Description | Required For |
|-------|-------------|--------------|
| **A** | Minimum accessibility | All projects |
| **AA** | Addresses major barriers | Legal compliance (most laws) |
| **AAA** | Highest level of accessibility | Specialized contexts |

### Compliance Requirements by Region

| Region | Law/Standard | Minimum Level |
|--------|--------------|---------------|
| **USA** | Section 508, ADA | WCAG 2.0 AA |
| **EU** | EN 301 549 | WCAG 2.1 AA |
| **UK** | Equality Act 2010 | WCAG 2.1 AA |
| **Canada** | AODA | WCAG 2.0 AA |
| **Australia** | DDA | WCAG 2.0 AA |

### Target: WCAG 2.1 Level AA

**Recommendation**: All projects should target **WCAG 2.1 Level AA** as the baseline, which covers:
- 30 Level A criteria (must have)
- 20 Level AA criteria (should have)

---

## Perceivable

### 1.1 Text Alternatives

**Requirement**: Provide text alternatives for non-text content.

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

**Alt Text Guidelines**:

| Image Type | Alt Text Approach |
|------------|-------------------|
| **Informative** | Describe the information conveyed |
| **Functional** | Describe the action (e.g., "Submit form") |
| **Decorative** | Use empty alt (`alt=""`) |
| **Complex** | Provide long description (via `aria-describedby`) |
| **Text in image** | Include all text in alt |

### 1.2 Time-Based Media

| Media Type | Requirements |
|------------|--------------|
| **Pre-recorded Audio** | Transcript |
| **Pre-recorded Video** | Captions + audio description |
| **Live Audio** | Real-time captions |
| **Live Video** | Real-time captions |

### 1.3 Adaptable Content

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

### 1.4 Distinguishable

**Color Contrast Requirements**:

| Element | Minimum Ratio (AA) | Enhanced Ratio (AAA) |
|---------|-------------------|----------------------|
| **Normal text** | 4.5:1 | 7:1 |
| **Large text (18px+ or 14px+ bold)** | 3:1 | 4.5:1 |
| **UI components & graphics** | 3:1 | N/A |

---

## Operable

### 2.1 Keyboard Accessible

**All functionality must be operable via keyboard.**

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

### 2.2 Enough Time

| Requirement | Implementation |
|-------------|----------------|
| **Timing adjustable** | Allow users to turn off, adjust, or extend time limits |
| **Auto-updating content** | Provide pause, stop, or hide controls |
| **Session timeout** | Warn before timeout, allow extension |

```javascript
// ✅ Good: Session timeout warning
const TIMEOUT_WARNING = 5 * 60 * 1000; // 5 minutes before timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

setTimeout(() => {
  const extend = confirm('Your session will expire in 5 minutes. Extend?');
  if (extend) {
    extendSession();
  }
}, SESSION_TIMEOUT - TIMEOUT_WARNING);
```

### 2.3 Seizures and Physical Reactions

| Requirement | Limit |
|-------------|-------|
| **Flashing content** | No more than 3 flashes per second |
| **Animation** | Provide option to reduce motion |

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

### 2.4 Navigable

**Focus Management**:

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

**Skip Links**:

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

### 2.5 Input Modalities

| Requirement | Description |
|-------------|-------------|
| **Pointer gestures** | Complex gestures have simple alternatives |
| **Pointer cancellation** | Up-event activation, ability to abort |
| **Target size** | Minimum 44x44 CSS pixels for touch targets |
| **Motion actuation** | Can be disabled, has alternatives |

---

## Understandable

### 3.1 Readable

```html
<!-- ✅ Good: Declare page language -->
<html lang="en">

<!-- ✅ Good: Mark language changes -->
<p>The French phrase <span lang="fr">c'est la vie</span> means "that's life".</p>
```

### 3.2 Predictable

| Principle | Implementation |
|-----------|----------------|
| **On focus** | Don't change context on focus alone |
| **On input** | Warn before auto-submit or context change |
| **Consistent navigation** | Same navigation order across pages |
| **Consistent identification** | Same labels for same functions |

### 3.3 Input Assistance

**Error Identification**:

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

**Error Prevention**:

| Action Type | Required Prevention |
|-------------|---------------------|
| **Legal/financial** | Reversible, reviewable, or confirmable |
| **Data modification** | Recoverable (undo) or confirmable |
| **Exam/test submission** | Reviewable before submission |

---

## Robust

### 4.1 Compatible

**Valid HTML**:

```html
<!-- ✅ Good: Valid, unique IDs -->
<label for="username">Username</label>
<input type="text" id="username" name="username">

<!-- ❌ Bad: Duplicate IDs -->
<input type="text" id="field">
<input type="text" id="field">  <!-- Duplicate! -->
```

**ARIA Usage**:

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

## ARIA Guidelines

### ARIA Rules

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

### Common ARIA Patterns

**Live Regions**:

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

**Dialogs/Modals**:

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

**Tabs**:

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

## Keyboard Navigation

### Standard Keyboard Interactions

| Key | Action |
|-----|--------|
| **Tab** | Move to next focusable element |
| **Shift + Tab** | Move to previous focusable element |
| **Enter** | Activate link or button |
| **Space** | Activate button, toggle checkbox |
| **Arrow keys** | Navigate within components (tabs, menus, etc.) |
| **Escape** | Close modal, cancel action |
| **Home/End** | Jump to first/last item in list |

### Focus Order

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

### Focus Management for SPAs

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

## Color and Contrast

### Contrast Requirements

| Element | WCAG AA | WCAG AAA |
|---------|---------|----------|
| **Normal text** | 4.5:1 | 7:1 |
| **Large text** | 3:1 | 4.5:1 |
| **UI components** | 3:1 | 3:1 |
| **Non-text graphics** | 3:1 | 3:1 |

### Color Blindness Considerations

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

**Examples**:

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

## Forms and Inputs

### Form Labeling

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

### Form Validation

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

### Required Fields

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

## Media Accessibility

### Images

| Type | Implementation |
|------|----------------|
| **Informative** | `alt="Description of information"` |
| **Decorative** | `alt="" role="presentation"` |
| **Functional** | `alt="Action description"` |
| **Complex** | `alt="Summary" + aria-describedby` |

### Video

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

### Audio

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

## Testing and Validation

### Automated Testing Tools

| Tool | Type | Coverage |
|------|------|----------|
| **axe-core** | Browser extension, CI | ~57% of WCAG issues |
| **WAVE** | Browser extension | Visual feedback |
| **Lighthouse** | Browser DevTools | Performance + a11y |
| **Pa11y** | CI/CD integration | Automated testing |
| **jest-axe** | Unit testing | Component testing |

### Manual Testing Checklist

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

### Screen Reader Testing

| Platform | Screen Reader |
|----------|---------------|
| **Windows** | NVDA (free), JAWS |
| **macOS** | VoiceOver |
| **iOS** | VoiceOver |
| **Android** | TalkBack |

### CI/CD Integration

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

## Accessibility Checklist

### Development Checklist

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

### Review Checklist

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

## Related Standards

- [Documentation Writing Standards](documentation-writing-standards.md) - Accessible documentation
- [Code Review Checklist](code-review-checklist.md) - Accessibility review
- [Testing Standards](testing-standards.md) - Accessibility testing
- [Security Standards](security-standards.md) - Authentication accessibility

---

## References

### Standards
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Quick reference
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - Latest version
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - ARIA specification
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - Design patterns

### Tools
- [axe DevTools](https://www.deque.com/axe/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Color contrast tool
- [NVDA](https://www.nvaccess.org/) - Free screen reader for Windows

### Learning Resources
- [WebAIM](https://webaim.org/) - Web accessibility resources
- [A11Y Project](https://www.a11yproject.com/) - Community-driven resources
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) - Developer guide

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial release: WCAG 2.1 coverage, POUR principles, ARIA guidelines, keyboard navigation, forms, testing |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
