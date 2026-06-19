---
source: options/code-review/automated-review.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 自動化程式碼審查

> **語言**: [English](../../../../options/code-review/automated-review.md) | 繁體中文

**上層標準**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## 概觀

自動化程式碼審查運用工具來分析程式碼以找出問題、強制執行標準，並在人工審查前攔截常見問題。它透過一致且即時地處理重複性檢查，補足人工審查的不足。

## 最適用於

- 及早攔截常見問題
- 一致地強制執行程式碼標準
- 減輕審查者的負擔
- CI/CD 整合
- 大型程式庫
- 分散式團隊

## 工具類別

### Static Analysis (SAST)

不執行程式碼即進行分析。

| Tool | 語言 | 重點 |
|------|-----------|-------|
| **ESLint** | JavaScript, TypeScript | 程式碼品質、風格 |
| **Pylint** | Python | 程式碼品質、錯誤 |
| **SonarQube** | 多語言 | 程式碼品質、安全性 |
| **Checkstyle** | Java | 風格、慣例 |
| **RuboCop** | Ruby | 風格、最佳實踐 |
| **golangci-lint** | Go | 多個 linter |

### 安全性掃描

找出安全性漏洞。

| Tool | 重點 |
|------|-------|
| **Snyk** | 相依套件漏洞 |
| **CodeQL** | 語意式程式碼分析 |
| **Bandit** | Python 安全性問題 |
| **Semgrep** | 自訂安全性規則 |
| **Brakeman** | Ruby on Rails 安全性 |

### 格式化

程式碼風格強制執行。

| Tool | 語言 |
|------|-----------|
| **Prettier** | JavaScript, TypeScript, CSS, HTML |
| **Black** | Python |
| **gofmt** | Go |
| **rustfmt** | Rust |
| **clang-format** | C, C++ |

### 型別檢查

型別安全驗證。

| Tool | 語言 |
|------|-----------|
| **TypeScript** | TypeScript, JavaScript |
| **mypy** | Python |
| **Flow** | JavaScript |

### AI 驅動審查

| Tool | 說明 |
|------|-------------|
| **GitHub Copilot** | AI 建議與審查 |
| **CodeRabbit** | AI PR 審查留言 |
| **Sourcery** | Python 程式碼改進 |

## CI 整合

### GitHub Actions

```yaml
name: Code Review
on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master

  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run format:check
```

### GitLab CI

```yaml
lint:
  stage: test
  script:
    - npm run lint

security:
  stage: test
  script:
    - snyk test
```

## 規則

| 規則 | 說明 | 優先級 |
|------|-------------|----------|
| 錯誤時失敗 | 對重大問題阻擋合併 | Required |
| 警告作為建議 | 不阻擋的建議 | Recommended |
| 設定置於 repo 中 | 將工具設定存放於儲存庫 | Required |
| Pre-commit hooks | 於 commit 前執行檢查 | Recommended |

## 建議設定

### 最低

- 主要語言的 linter
- 格式化工具（啟用自動修正）
- 相依套件漏洞掃描器

### 建議

- 所有最低工具
- 型別檢查器（若適用）
- 安全性掃描器
- 程式碼覆蓋率檢查

### 全面

- 所有建議工具
- AI 程式碼審查
- 專案專屬的自訂規則
- 指標追蹤

## 與人工審查的比較

| 面向 | 自動化 | 人工審查 |
|--------|-----------|---------------|
| 速度 | 即時 | 數小時／數天 |
| 一致性 | 100% | 不一定 |
| 情境理解 | 有限 | 高 |
| 商業邏輯 | 無法驗證 | 可驗證 |
| 風格強制執行 | 優異 | 不一致 |
| 安全性基礎 | 良好 | 可能遺漏 |
| 成本 | 工具授權 | 開發者時間 |

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer

  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
```

## 相關選項

- [PR Review](./pr-review.md) - 傳統的 pull request 審查
- [Pair Programming](./pair-programming.md) - 即時協作審查

---

## 參考資料

- [SonarQube](https://www.sonarqube.org/)
- [ESLint](https://eslint.org/)
- [Snyk](https://snyk.io/)
- [Pre-commit](https://pre-commit.com/)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
