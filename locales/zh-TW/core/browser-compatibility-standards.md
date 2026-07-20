---
source: ../../../core/browser-compatibility-standards.md
source_version: 1.0.2
translation_version: 1.0.2
last_synced: 2026-07-16
source_hash: d4a9c4e89256
status: current
---

# 瀏覽器相容性標準

> **語言**：[English](../../../core/browser-compatibility-standards.md) | 繁體中文

**版本**：1.0.2
**最後更新**：2026-06-18
**適用範圍**：前端專案（網頁應用程式、漸進式網頁應用程式 PWA、Web Components）
**範疇**：universal
**Owning Spec**：XSPEC-293（與 XSPEC-209 路由覆蓋率為正交關係）
**業界標準**：Browserslist、W3C WebDriver、WebDriver BiDi
**參考資料**：[caniuse.com](https://caniuse.com/)、[Playwright 瀏覽器支援矩陣](https://playwright.dev/docs/browsers)

---

## 目的

本標準定義所支援的瀏覽器與裝置矩陣、測試自動化策略，以及瀏覽器相容性的發布閘門（即 `release-readiness-gate.md` 中的第 9 維度，Tier-3）。

瀏覽器相容性問題屬於使用者最容易察覺的缺陷之一，卻因為團隊往往假設「在 Chrome 上能跑就好」而被系統性地測試不足。若缺少明確的支援矩陣與自動化驗證，回歸缺陷便會滲漏到正式環境，影響大量使用者族群。

---

## 支援層級定義

| 層級 | 定義 | 發布閘門 |
|------|-----------|--------------|
| **Tier-1**（完整支援） | 功能完全對等 + 自動化測試覆蓋 | 100% 通過 —— 任一測試失敗即阻擋發布 |
| **Tier-2**（部分支援） | 盡力支援；主要流程必須可運作 | ≥ 95% 通過 —— 低於則 WARN，< 90% 則 FAIL |
| **Tier-3**（盡力而為） | 非正式支援；缺陷會記錄但不阻擋發布 | 僅作為建議參考 |

> **Tier-2「≥95%」／「<90%」門檻 — 依據與可調整性**：這些是 UDS 預設值，可依專案調整。
> Tier-2 定義為「盡力支援，主要流程必須可運作」，因此閘門容許少量非關鍵失敗的尾端：
> `≥95%` = 健康（低於此值則 WARN，以提示分流處理）；`<90%` = 實質回歸（FAIL）。
> 可依你目標市場的瀏覽器覆蓋率調整這些值 —— 例如依 Browserslist 市佔設定
> （`> 0.5%` 等）推導 Tier-2 瀏覽器清單與通過門檻。**例外**：當失敗的 Tier-2
> 案例皆為非關鍵流程（以 Tier-3 風格記錄為缺陷）時，發布負責人可在附上記錄
> 理由的前提下覆寫 WARN/FAIL 判定。

---

## 預設瀏覽器矩陣

團隊**必須**明確宣告其支援矩陣。以下預設值涵蓋了大多數網頁流量（依 2025–2026 年資料）：

### Tier-1（預設）

| 瀏覽器 | 版本 | 平台 |
|---------|----------|---------|
| Chrome | latest、latest-1 | Windows、macOS、Linux、Android |
| Safari | latest、latest-1 | macOS、iOS |
| Firefox | latest | Windows、macOS、Linux |
| Edge | latest | Windows、macOS |

### Tier-2（預設）

| 瀏覽器 | 版本 | 平台 |
|---------|----------|---------|
| Chrome | latest-2、latest-3 | 桌面 |
| Safari | latest-2 | macOS、iOS |
| Samsung Internet | latest | Android |
| Opera | latest | 桌面 |

### Tier-3（預設）

| 瀏覽器 | 備註 |
|---------|-------|
| IE 11 | 已終止支援（EOL）；僅在合約要求時才支援 |
| Chrome < latest-3 | 列為已知限制追蹤 |

### 裝置 / 視窗（Viewport）矩陣

| 類別 | 最小寬度 | 代表性裝置 |
|----------|-----------|-----------------------|
| 行動裝置（小） | 360px | Android（小尺寸） |
| 行動裝置（標準） | 390px | iPhone 14 |
| 平板（直向） | 768px | iPad |
| 平板（橫向） | 1024px | iPad 橫向 |
| 桌面（小） | 1280px | 13 吋筆電 |
| 桌面（標準） | 1440px | 15 吋筆電 / 外接螢幕 |
| 桌面（寬） | 1920px | Full HD 螢幕 |

最低要求：在 **360px、768px、1280px**（行動 / 平板 / 桌面斷點）進行測試。

---

## 自動化測試

### Playwright 矩陣設定

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

### CI 執行策略

```bash
# Run full Tier-1 matrix on release candidate
npx playwright test --project=chromium,firefox,webkit,edge,mobile-chrome,mobile-safari,tablet

# Run Tier-1 only on every PR (fast feedback)
npx playwright test --project=chromium,firefox,webkit

# Run Tier-2 on release candidate (results feed into sign-off as WARN/PASS)
npx playwright test --project=samsung,opera
```

### 雲端瀏覽器測試

針對 Tier-1 的跨作業系統測試（例如在 Windows 主機的 CI 上測試 Safari），請使用雲端服務：

| 服務 | 使用情境 |
|---------|---------|
| BrowserStack Automate | 商業專案；提供最廣泛的 OS + 瀏覽器矩陣 |
| Sauce Labs | 已有既有合約的企業 |
| LambdaTest | 開源 / 對成本敏感的專案 |

**最低雲端測試要求**：在真實 iOS 裝置上測試 Safari latest 與 latest-1（對於 WebKit 的缺陷，模擬器（Simulator）並不足夠）。

---

## 視覺回歸測試（選用但建議）

像素差異（Pixel-diff）測試可偵測跨瀏覽器的版面回歸：

```bash
# Using Playwright visual comparisons
npx playwright test --update-snapshots  # update baseline
npx playwright test                     # compare against baseline; fail if diff > threshold
```

門檻建議值：版面元件 < 0.5% 像素差異；複雜的互動元件 < 2%。

---

## 發布閘門條件

這是 `release-readiness-gate.md` 中的**第 9 維度**（Tier-3：前端 / 網頁專案必填；CLI / 純後端專案則標示為 `N/A`）。

| 閘門 | Pass | Warn | Fail |
|------|------|------|------|
| Tier-1 瀏覽器矩陣 | 100% 測試通過 | — | 任一測試失敗 |
| Tier-2 瀏覽器矩陣 | ≥ 95% 通過 | 90–95% | < 90% |
| 視窗覆蓋（360/768/1280） | 任何 Tier-1 瀏覽器上版面皆無破版 | — | 任一關鍵流程無法使用 |

### 簽核所需的證據

```
| 9 | Browser / Device Compat | PASS | Playwright: 6 browsers × 7 viewports, 100% Tier-1; Tier-2: 97%; [junit report link] | QA Lead |
```

### `N/A` 條件

在以下情況標示為 `N/A`：
- 專案為純 CLI、純後端 API，或行動原生（非網頁）
- 記錄理由：`"N/A — backend API service, no browser UI"`

---

## Browserslist 設定

在 repo 根目錄提交一份 `.browserslistrc`，以確保建置工具（Babel、PostCSS、Autoprefixer）針對相同的瀏覽器：

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

- **只測試 Chrome** —— Chrome 約佔桌面流量的 65%；剩下的 35% 是 Safari / Firefox / Edge 使用者，而你的 bug 會被他們發現
- **使用瀏覽器模擬器測試 iOS Safari** —— 模擬器上的 WebKit 與真實裝置的 WebKit 有所分歧；對於 release candidate，務必在真實 iOS 上測試
- **未指定矩陣** —— 隱含假設「支援所有瀏覽器」是不可能測試的；明確的 Tier-1 矩陣勝過毫無實質的隱含覆蓋
- **將 Tier-3 瀏覽器失敗當作阻擋項** —— Tier-3 是盡力而為；記錄問題才是恰當做法，而非阻擋發布
- **略過行動視窗測試** —— 行動優先（mobile-first）已是標準；缺少 360px 測試將為大多數行動使用者帶來破損的使用體驗

---

## 與其他標準的關係

- **`accessibility-standards.md`** —— 鍵盤導覽與螢幕報讀器測試需跨所有 Tier-1 瀏覽器執行
- **`e2e-testing.md`** —— Playwright 矩陣設定將 E2E 測試擴展為多瀏覽器
- **`release-readiness-gate.md`** —— 第 9 維度（Tier-3）
- **`performance-standards.md`** —— Core Web Vitals 目標適用於每個 Tier-1 瀏覽器

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 1.0.2 | 2026-06-18 | 新增：Tier-2 95%/90% 門檻的依據、可調整性與例外說明（XSPEC-292 T8 / XSPEC-293 AC-293-2） |
| 1.0.1 | 2026-06-18 | 新增：Owning Spec 指標 → XSPEC-293（XSPEC-291 §11） |
| 1.0.0 | 2026-05-05 | 首次發布：Tier-1/2/3 矩陣、Playwright 設定、雲端測試、發布閘門條件 |

---

## 授權

本標準依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
