# Browser Compatibility Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/browser-compatibility-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-05
**Applicability**: Frontend projects (web apps, progressive web apps, web components)
**Scope**: universal
**Industry Standards**: Browserslist, W3C WebDriver, WebDriver BiDi
**References**: [caniuse.com](https://caniuse.com/), [Playwright browser support matrix](https://playwright.dev/docs/browsers)

---

## Purpose

This standard defines supported browser and device matrices, testing automation strategies, and the release gate for browser compatibility (Dimension 9 in `release-readiness-gate.md`, Tier-3).

Browser compatibility issues are among the most user-visible defects, yet they are systematically under-tested because teams assume "it works in Chrome." Without an explicit supported matrix and automated verification, regressions slip to production and affect large user segments.

---

## Support Tier Definitions

| Tier | Definition | Release Gate |
|------|-----------|--------------|
| **Tier-1** (Supported) | Full feature parity + automated test coverage | 100% pass — blocks release if any test fails |
| **Tier-2** (Partial support) | Best-effort; major flows must work | ≥ 95% pass — WARN if below, FAIL if < 90% |
| **Tier-3** (Best effort) | Not officially supported; defects logged but not blocking | Advisory only |

---

## Default Browser Matrix

Teams MUST declare their supported matrix explicitly. The defaults below cover the majority of web traffic (2025–2026 data):

### Tier-1 (Default)

| Browser | Versions | Platform |
|---------|----------|---------|
| Chrome | latest, latest-1 | Windows, macOS, Linux, Android |
| Safari | latest, latest-1 | macOS, iOS |
| Firefox | latest | Windows, macOS, Linux |
| Edge | latest | Windows, macOS |

### Tier-2 (Default)

| Browser | Versions | Platform |
|---------|----------|---------|
| Chrome | latest-2, latest-3 | Desktop |
| Safari | latest-2 | macOS, iOS |
| Samsung Internet | latest | Android |
| Opera | latest | Desktop |

### Tier-3 (Default)

| Browser | Notes |
|---------|-------|
| IE 11 | EOL; only if contractually required |
| Chrome < latest-3 | Tracked as known limitation |

### Device / Viewport Matrix

| Category | Min Width | Representative Device |
|----------|-----------|-----------------------|
| Mobile (small) | 360px | Android (small) |
| Mobile (standard) | 390px | iPhone 14 |
| Tablet (portrait) | 768px | iPad |
| Tablet (landscape) | 1024px | iPad landscape |
| Desktop (small) | 1280px | Laptop 13" |
| Desktop (standard) | 1440px | Laptop 15" / External monitor |
| Desktop (wide) | 1920px | Full HD monitor |

Minimum: test at **360px, 768px, 1280px** (mobile / tablet / desktop breakpoints).

---

## Automated Testing

### Playwright Matrix Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  projects: [
    // Tier-1 browsers
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "edge", use: { ...devices["Desktop Edge"] } },
    // Mobile Tier-1
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
    // Viewport coverage
    { name: "tablet", use: { ...devices["iPad Pro 11"] } },
  ],
  // Tier-1 failure = build failure
  reporter: [["html"], ["junit", { outputFile: "results/browser-compat.xml" }]],
});
```

### CI Execution Strategy

```bash
# Run full Tier-1 matrix on release candidate
npx playwright test --project=chromium,firefox,webkit,edge,mobile-chrome,mobile-safari,tablet

# Run Tier-1 only on every PR (fast feedback)
npx playwright test --project=chromium,firefox,webkit

# Run Tier-2 on release candidate (results feed into sign-off as WARN/PASS)
npx playwright test --project=samsung,opera
```

### Cloud Browser Testing

For Tier-1 cross-OS testing (e.g., Safari on Windows-hosted CI), use cloud services:

| Service | Use Case |
|---------|---------|
| BrowserStack Automate | Commercial projects; widest OS+browser matrix |
| Sauce Labs | Enterprises with existing contract |
| LambdaTest | Open-source / cost-sensitive projects |

**Minimum cloud testing**: Safari latest + latest-1 on real iOS devices (Simulator is insufficient for WebKit bugs).

---

## Visual Regression (Optional but Recommended)

Pixel-diff testing detects layout regressions across browsers:

```bash
# Using Playwright visual comparisons
npx playwright test --update-snapshots  # update baseline
npx playwright test                     # compare against baseline; fail if diff > threshold
```

Threshold recommendation: < 0.5% pixel diff for layout components; < 2% for complex interactive components.

---

## Release Gate Criteria

This is **Dimension 9** in `release-readiness-gate.md` (Tier-3: required for frontend/web projects; `N/A` for CLI/backend-only).

| Gate | Pass | Warn | Fail |
|------|------|------|------|
| Tier-1 browser matrix | 100% tests pass | — | Any test fails |
| Tier-2 browser matrix | ≥ 95% pass | 90–95% | < 90% |
| Viewport coverage (360/768/1280) | No layout breaks on any Tier-1 browser | — | Any critical flow unusable |

### Evidence for Sign-off

```
| 9 | Browser / Device Compat | PASS | Playwright: 6 browsers × 7 viewports, 100% Tier-1; Tier-2: 97%; [junit report link] | QA Lead |
```

### `N/A` Criteria

Mark as `N/A` when:
- Project is CLI-only, pure backend API, or mobile native (not web)
- Document rationale: `"N/A — backend API service, no browser UI"`

---

## Browserslist Configuration

Commit a `.browserslistrc` to the repo root to ensure build tools (Babel, PostCSS, Autoprefixer) target the same browsers:

```
# .browserslistrc
# Tier-1: production targets
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
last 2 iOS versions
last 2 ChromeAndroid versions

# Tier-2: for reference (not in build targets by default)
# last 4 Chrome versions
# Samsung Internet >= 14
```

---

## Anti-Patterns

- **Testing only Chrome** — Chrome represents ~65% of desktop traffic; the remaining 35% is Safari/Firefox/Edge users who will find your bugs
- **Using browser simulators for iOS Safari testing** — WebKit on Simulator diverges from real device WebKit; always test on real iOS for release candidates
- **Not specifying a matrix** — implicit assumption of "all browsers" is impossible to test; an explicit Tier-1 matrix is better than implicit coverage of none
- **Treating Tier-3 browser failures as blockers** — Tier-3 is best-effort; logging the issue is appropriate, not blocking the release
- **Skipping mobile viewport testing** — mobile-first is standard; missing 360px tests will produce broken UX for the majority of mobile users

---

## Relationship to Other Standards

- **`accessibility-standards.md`** — keyboard nav and screen reader tests run across Tier-1 browsers
- **`e2e-testing.md`** — Playwright matrix config extends E2E tests to multi-browser
- **`release-readiness-gate.md`** — Dimension 9 (Tier-3)
- **`performance-standards.md`** — Core Web Vitals targets apply per Tier-1 browser

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | Initial release: Tier-1/2/3 matrix, Playwright config, cloud testing, release gate criteria |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
