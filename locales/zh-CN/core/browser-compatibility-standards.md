---
source: ../../../core/browser-compatibility-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 56b7d0fbf522
status: stale
---

# 浏览器兼容性标准

> **语言**: [English](../../../core/browser-compatibility-standards.md) | [繁體中文](../../zh-TW/core/browser-compatibility-standards.md) | 简体中文

**版本**：1.0.0
**最后更新**：2026-05-05
**适用范围**：前端项目（Web 应用、渐进式 Web 应用 PWA、Web Components）
**范围**：universal
**行业标准**：Browserslist、W3C WebDriver、WebDriver BiDi
**参考资料**：[caniuse.com](https://caniuse.com/)、[Playwright 浏览器支持矩阵](https://playwright.dev/docs/browsers)

---

## 目的

本标准定义所支持的浏览器与设备矩阵、测试自动化策略，以及浏览器兼容性的发布门禁（即 `release-readiness-gate.md` 中的第 9 维度，Tier-3）。

浏览器兼容性问题属于用户最容易察觉的缺陷之一，却因为团队往往假设「在 Chrome 上能跑就好」而被系统性地测试不足。若缺少明确的支持矩阵与自动化验证，回归缺陷便会渗漏到生产环境，影响大量用户群体。

---

## 支持层级定义

| 层级 | 定义 | 发布门禁 |
|------|-----------|--------------|
| **Tier-1**（完整支持） | 功能完全对等 + 自动化测试覆盖 | 100% 通过 —— 任一测试失败即阻断发布 |
| **Tier-2**（部分支持） | 尽力支持；主要流程必须可运行 | ≥ 95% 通过 —— 低于则 WARN，< 90% 则 FAIL |
| **Tier-3**（尽力而为） | 非正式支持；缺陷会记录但不阻断发布 | 仅作为建议参考 |

---

## 默认浏览器矩阵

团队**必须**明确声明其支持矩阵。以下默认值涵盖了大多数 Web 流量（依 2025–2026 年数据）：

### Tier-1（默认）

| 浏览器 | 版本 | 平台 |
|---------|----------|---------|
| Chrome | latest、latest-1 | Windows、macOS、Linux、Android |
| Safari | latest、latest-1 | macOS、iOS |
| Firefox | latest | Windows、macOS、Linux |
| Edge | latest | Windows、macOS |

### Tier-2（默认）

| 浏览器 | 版本 | 平台 |
|---------|----------|---------|
| Chrome | latest-2、latest-3 | 桌面 |
| Safari | latest-2 | macOS、iOS |
| Samsung Internet | latest | Android |
| Opera | latest | 桌面 |

### Tier-3（默认）

| 浏览器 | 备注 |
|---------|-------|
| IE 11 | 已终止支持（EOL）；仅在合同要求时才支持 |
| Chrome < latest-3 | 列为已知限制跟踪 |

### 设备 / 视口（Viewport）矩阵

| 类别 | 最小宽度 | 代表性设备 |
|----------|-----------|-----------------------|
| 移动设备（小） | 360px | Android（小尺寸） |
| 移动设备（标准） | 390px | iPhone 14 |
| 平板（竖屏） | 768px | iPad |
| 平板（横屏） | 1024px | iPad 横屏 |
| 桌面（小） | 1280px | 13 英寸笔记本 |
| 桌面（标准） | 1440px | 15 英寸笔记本 / 外接显示器 |
| 桌面（宽） | 1920px | Full HD 显示器 |

最低要求：在 **360px、768px、1280px**（移动 / 平板 / 桌面断点）进行测试。

---

## 自动化测试

### Playwright 矩阵配置

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

### CI 执行策略

```bash
# Run full Tier-1 matrix on release candidate
npx playwright test --project=chromium,firefox,webkit,edge,mobile-chrome,mobile-safari,tablet

# Run Tier-1 only on every PR (fast feedback)
npx playwright test --project=chromium,firefox,webkit

# Run Tier-2 on release candidate (results feed into sign-off as WARN/PASS)
npx playwright test --project=samsung,opera
```

### 云端浏览器测试

针对 Tier-1 的跨操作系统测试（例如在 Windows 主机的 CI 上测试 Safari），请使用云服务：

| 服务 | 使用场景 |
|---------|---------|
| BrowserStack Automate | 商业项目；提供最广泛的 OS + 浏览器矩阵 |
| Sauce Labs | 已有既有合同的企业 |
| LambdaTest | 开源 / 对成本敏感的项目 |

**最低云端测试要求**：在真实 iOS 设备上测试 Safari latest 与 latest-1（对于 WebKit 的缺陷，模拟器（Simulator）并不足够）。

---

## 视觉回归测试（可选但建议）

像素差异（Pixel-diff）测试可检测跨浏览器的布局回归：

```bash
# Using Playwright visual comparisons
npx playwright test --update-snapshots  # update baseline
npx playwright test                     # compare against baseline; fail if diff > threshold
```

阈值建议值：布局组件 < 0.5% 像素差异；复杂的交互组件 < 2%。

---

## 发布门禁条件

这是 `release-readiness-gate.md` 中的**第 9 维度**（Tier-3：前端 / Web 项目必填；CLI / 纯后端项目则标记为 `N/A`）。

| 门禁 | Pass | Warn | Fail |
|------|------|------|------|
| Tier-1 浏览器矩阵 | 100% 测试通过 | — | 任一测试失败 |
| Tier-2 浏览器矩阵 | ≥ 95% 通过 | 90–95% | < 90% |
| 视口覆盖（360/768/1280） | 任何 Tier-1 浏览器上布局皆无破版 | — | 任一关键流程无法使用 |

### 签核所需的证据

```
| 9 | Browser / Device Compat | PASS | Playwright: 6 browsers × 7 viewports, 100% Tier-1; Tier-2: 97%; [junit report link] | QA Lead |
```

### `N/A` 条件

在以下情况标记为 `N/A`：
- 项目为纯 CLI、纯后端 API，或移动原生（非 Web）
- 记录理由：`"N/A — backend API service, no browser UI"`

---

## Browserslist 配置

在 repo 根目录提交一份 `.browserslistrc`，以确保构建工具（Babel、PostCSS、Autoprefixer）针对相同的浏览器：

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

## 反模式

- **只测试 Chrome** —— Chrome 约占桌面流量的 65%；剩下的 35% 是 Safari / Firefox / Edge 用户，而你的 bug 会被他们发现
- **使用浏览器模拟器测试 iOS Safari** —— 模拟器上的 WebKit 与真实设备的 WebKit 有所分歧；对于 release candidate，务必在真实 iOS 上测试
- **未指定矩阵** —— 隐含假设「支持所有浏览器」是不可能测试的；明确的 Tier-1 矩阵胜过毫无实质的隐含覆盖
- **将 Tier-3 浏览器失败当作阻断项** —— Tier-3 是尽力而为；记录问题才是恰当做法，而非阻断发布
- **跳过移动视口测试** —— 移动优先（mobile-first）已是标准；缺少 360px 测试将为大多数移动用户带来损坏的使用体验

---

## 与其他标准的关系

- **`accessibility-standards.md`** —— 键盘导航与屏幕阅读器测试需跨所有 Tier-1 浏览器执行
- **`e2e-testing.md`** —— Playwright 矩阵配置将 E2E 测试扩展为多浏览器
- **`release-readiness-gate.md`** —— 第 9 维度（Tier-3）
- **`performance-standards.md`** —— Core Web Vitals 目标适用于每个 Tier-1 浏览器

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | 首次发布：Tier-1/2/3 矩阵、Playwright 配置、云端测试、发布门禁条件 |

---

## 授权

本标准依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
