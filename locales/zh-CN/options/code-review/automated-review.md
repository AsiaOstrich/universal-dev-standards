---
source: options/code-review/automated-review.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 自动化代码审查

> **语言**: [English](../../../../options/code-review/automated-review.md) | 简体中文

**上层标准**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## 概览

自动化代码审查运用工具来分析代码以找出问题、强制执行标准，并在人工审查前拦截常见问题。它通过一致且即时地处理重复性检查，补足人工审查的不足。

## 最适用于

- 及早拦截常见问题
- 一致地强制执行代码标准
- 减轻审查者的负担
- CI/CD 集成
- 大型代码库
- 分布式团队

## 工具类别

### Static Analysis (SAST)

不执行代码即进行分析。

| Tool | 语言 | 重点 |
|------|-----------|-------|
| **ESLint** | JavaScript, TypeScript | 代码质量、风格 |
| **Pylint** | Python | 代码质量、错误 |
| **SonarQube** | 多语言 | 代码质量、安全性 |
| **Checkstyle** | Java | 风格、惯例 |
| **RuboCop** | Ruby | 风格、最佳实践 |
| **golangci-lint** | Go | 多个 linter |

### 安全性扫描

找出安全性漏洞。

| Tool | 重点 |
|------|-------|
| **Snyk** | 依赖包漏洞 |
| **CodeQL** | 语义式代码分析 |
| **Bandit** | Python 安全性问题 |
| **Semgrep** | 自定义安全性规则 |
| **Brakeman** | Ruby on Rails 安全性 |

### 格式化

代码风格强制执行。

| Tool | 语言 |
|------|-----------|
| **Prettier** | JavaScript, TypeScript, CSS, HTML |
| **Black** | Python |
| **gofmt** | Go |
| **rustfmt** | Rust |
| **clang-format** | C, C++ |

### 类型检查

类型安全验证。

| Tool | 语言 |
|------|-----------|
| **TypeScript** | TypeScript, JavaScript |
| **mypy** | Python |
| **Flow** | JavaScript |

### AI 驱动审查

| Tool | 说明 |
|------|-------------|
| **GitHub Copilot** | AI 建议与审查 |
| **CodeRabbit** | AI PR 审查评论 |
| **Sourcery** | Python 代码改进 |

## CI 集成

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

## 规则

| 规则 | 说明 | 优先级 |
|------|-------------|----------|
| 错误时失败 | 对重大问题阻挡合并 | Required |
| 警告作为建议 | 不阻挡的建议 | Recommended |
| 配置置于 repo 中 | 将工具配置存放于仓库 | Required |
| Pre-commit hooks | 于 commit 前执行检查 | Recommended |

## 建议配置

### 最低

- 主要语言的 linter
- 格式化工具（启用自动修正）
- 依赖包漏洞扫描器

### 建议

- 所有最低工具
- 类型检查器（若适用）
- 安全性扫描器
- 代码覆盖率检查

### 全面

- 所有建议工具
- AI 代码审查
- 项目专属的自定义规则
- 指标追踪

## 与人工审查的比较

| 方面 | 自动化 | 人工审查 |
|--------|-----------|---------------|
| 速度 | 即时 | 数小时／数天 |
| 一致性 | 100% | 不一定 |
| 情境理解 | 有限 | 高 |
| 业务逻辑 | 无法验证 | 可验证 |
| 风格强制执行 | 优异 | 不一致 |
| 安全性基础 | 良好 | 可能遗漏 |
| 成本 | 工具授权 | 开发者时间 |

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

## 相关选项

- [PR Review](./pr-review.md) - 传统的 pull request 审查
- [Pair Programming](./pair-programming.md) - 实时协作审查

---

## 参考资料

- [SonarQube](https://www.sonarqube.org/)
- [ESLint](https://eslint.org/)
- [Snyk](https://snyk.io/)
- [Pre-commit](https://pre-commit.com/)

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
