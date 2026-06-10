---
source: ../../../core/sast-advanced.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: aa3d9f9ad760
status: current
---

# 進階 SAST 標準

> **語言**: [English](../../../core/sast-advanced.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-05-05
**適用範圍**: TypeScript / JavaScript 專案
**Scope**: universal
**參考資料**: [CodeQL 文件](https://codeql.github.com/)、[gitleaks](https://github.com/gitleaks/gitleaks)、[Biome linter](https://biomejs.dev/)

---

## 目的

本標準定義進階靜態應用程式安全測試（SAST）實踐，作為依賴項稽核（`npm audit`）的補充。涵蓋三個獨立但互補的層次：

1. **CodeQL 語意分析** — 找出第一方程式碼中的注入漏洞
2. **Secret 掃描** — 防止提交 API 金鑰與憑證
3. **Biome 安全 lint 規則** — 在編輯器和 CI 層面強制執行安全的程式碼模式

---

## 為什麼 npm audit 不夠用

`npm audit` 會對照 NPM 諮詢資料庫掃描你的 `package-lock.json`，它只能找出**第三方依賴中已知的 CVE**。

它**無法**找出：

| 漏洞類型 | 範例 | 偵測方法 |
|---|---|---|
| **命令注入** | `exec(\`git log ${userInput}\`)` | CodeQL 資料流分析 |
| **路徑穿越** | `fs.readFile(path.join(base, req.params.file))` | CodeQL 資料流分析 |
| **原型污染** | `target[req.body.key] = req.body.value` | CodeQL 污點分析 |
| **XSS（透過 DOM sink）** | `element.innerHTML = userContent` | CodeQL 資料流分析 |
| **SQL 注入** | `db.query("SELECT * FROM users WHERE id = " + id)` | CodeQL 資料流分析 |
| **硬編碼 secret** | `const apiKey = "sk-live-abc123..."` | gitleaks 模式比對 |

---

## 第一層：CodeQL 語意分析

### CodeQL 的作用

CodeQL 會建構你的 TypeScript 程式碼的語意模型，然後執行查詢，追蹤從**來源**（使用者輸入、請求參數、環境變數）到**接收點**（命令執行、檔案系統存取、DOM 操作）的資料流。

### GitHub Actions 工作流程

建立 `.github/workflows/codeql.yml`：

```yaml
# SPDX-License-Identifier: MIT
name: CodeQL Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'   # 每週一 02:00 UTC

jobs:
  analyze:
    name: Analyze TypeScript
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
          queries: security-extended
          query-filters: |
            - include:
                tags contain: security

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:javascript-typescript"
```

### 關鍵設定選項

| 選項 | 值 | 原因 |
|---|---|---|
| `languages` | `javascript-typescript` | 涵蓋 `.ts` 與 `.js` 檔案 |
| `queries` | `security-extended` | 包含預設集中未涵蓋的注入/XSS/路徑穿越查詢 |
| `schedule` | `0 2 * * 1` | 每週抓取 GitHub 發布的新查詢包 |
| `security-events: write` | 必填 | 將 SARIF 結果上傳至 GitHub Security 分頁 |

### 分支保護設定

新增工作流程後，設定分支保護規則：

1. Settings → Branches → Branch protection rules → Edit main
2. 啟用「Require status checks to pass before merging」
3. 將 `CodeQL` 與 `sast` 加入必要檢查項目

---

## 第二層：使用 gitleaks 掃描 Secret

### gitleaks 能偵測什麼

gitleaks 使用模式比對與熵分析來偵測：
- AWS 存取金鑰（`AKIA[0-9A-Z]{16}`）
- GitHub token（`ghp_`、`gho_`、`ghs_`、`ghr_`）
- 私鑰 PEM 區塊（`-----BEGIN RSA PRIVATE KEY-----`）
- 符合憑證模式的高熵字串
- 定義於 `.gitleaks.toml` 的自訂模式

### CI 整合

在你的 CI 工作流程中加入 `sast` 工作：

```yaml
sast:
  name: Secret Scanning
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0   # 完整歷史以確保準確掃描
    - name: Run gitleaks
      uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### `.gitleaks.toml` 設定範例

```toml
title = "Gitleaks Configuration (example)"
version = "8"

[extend]
# 從 gitleaks 基礎設定繼承預設規則
useDefault = true

[[rules]]
id = "app-license-key"
description = "App license key"
regex = '''app[_\-]?license[_\-]?key\s*[:=]\s*["']?([A-Za-z0-9\-]{32,})["']?'''
severity = "CRITICAL"
tags = ["license", "app"]

[[allowlist.commits]]
# 範例：允許已修復的特定 commit hash
# commits = ["abc1234"]

[[allowlist.regexes]]
# 將測試 fixture 值加入白名單
description = "Test fixture placeholder keys"
regex = '''PLACEHOLDER_KEY_FOR_TESTING'''
```

### 處理誤報（False Positives）

當 gitleaks 標記誤報時：

1. 找出觸發比對的確切模式
2. 在 `.gitleaks.toml` 中加入有針對性的 `allowlist.regexes` 條目，並附上說明
3. 在被標記的值旁邊加上程式碼註解，記錄允許原因
4. 每季審查所有白名單條目

---

## 第三層：Biome 安全規則

### 為什麼選擇 Biome 而不是 ESLint

採用 Biome 作為 linter 的專案，無需額外安裝 ESLint 套件，即可獲得內建的安全相關規則。Biome 中的關鍵安全規則：

| 規則 | 類別 | 防止的問題 |
|---|---|---|
| `suspicious/noGlobalEval` | suspicious | 透過 `eval()` 動態執行程式碼 |
| `suspicious/noWith` | suspicious | 透過 `with` 陳述式污染作用域 |
| `suspicious/noConsoleLog` | suspicious | 透過 `console.log` 意外記錄 secret |
| `correctness/noUnusedVariables` | correctness | 可能包含敏感邏輯的廢棄程式碼 |
| `security/noBlankTarget` | security | 未加 `rel="noopener"` 的 `target="_blank"` 分頁劫持 |

### `biome.json` 設定

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noGlobalEval": "error",
        "noWith": "error"
      },
      "security": {
        "noBlankTarget": "error"
      }
    }
  }
}
```

### CI 整合

```yaml
- name: Lint (Biome)
  run: npm run lint   # 對應：biome check .
```

`biome check .` 指令會同時執行格式檢查與 linter 規則。安全規則失敗會產生非零退出碼，阻擋 CI 流程。

---

## 品質閘門門檻

| 嚴重性 | 合併政策 | 修復 SLA |
|---|---|---|
| **CRITICAL** | 阻擋合併，無例外 | 立即處理 |
| **HIGH** | 阻擋合併，main 分支 HIGH 為零 | 立即處理 |
| **MEDIUM** | 不阻擋；建立追蹤 issue | 30 天 |
| **LOW** | 不阻擋；記錄以供查閱 | 選擇性 |

### 設定 GitHub Code Scanning 阻擋政策

在儲存庫安全性設定中：
1. Security → Code scanning → Protection rules
2. 將「Security severity level」設定為「High or higher」
3. 這會在 CodeQL 回報任何 HIGH 或 CRITICAL 問題時阻擋 PR 合併

---

## npm test 整合

在 `package.json` 中加入 `test:sast` 腳本作為開發者入口：

```json
{
  "scripts": {
    "test:sast": "npm audit --audit-level=high"
  }
}
```

這允許透過 `npm run test:sast` 執行本地推送前檢查。注意：此指令只涵蓋依賴項漏洞；完整的 SAST 管線在 CI 中執行。

---

## 總結：縱深防禦安全掃描

```
Commit → pre-push hook (npm audit)
  │
  └─→ CI: sast job (gitleaks secret scan)
  │
  └─→ CI: check job (biome lint — security rules)
  │
  └─→ CI: codeql.yml (semantic analysis — injection/XSS/traversal)
  │
  └─→ GitHub Code Scanning (SARIF results — blocks PR on HIGH+)
```

沒有任何單一掃描器能抓到所有問題。這種分層方式提供：
- **依賴項漏洞**：npm audit（快速，每次推送）
- **提交的 secret**：gitleaks（每次推送，完整歷史）
- **程式碼品質/安全**：Biome 規則（每次提交，編輯器即時回饋）
- **第一方漏洞**：CodeQL（深度分析，PR 及每週）

---

## 相關標準

- [安全標準](../../../core/security-standards.md)
- [Secret 管理標準](../../../core/secret-management-standards.md)
- [Check-in 標準](../../../core/checkin-standards.md)
- [容器安全](../../../core/container-security.md)

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---|---|---|
| 1.0.0 | 2026-05-05 | 初始發布（XSPEC-161） |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
