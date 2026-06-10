---
source: ../../../core/sast-advanced.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: aa3d9f9ad760
status: current
---

# 高级 SAST 标准

> **语言**: [English](../../../core/sast-advanced.md) | [繁體中文](../../zh-TW/core/sast-advanced.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-05-05
**适用范围**: TypeScript / JavaScript 项目
**Scope**: universal
**参考资料**: [CodeQL 文档](https://codeql.github.com/)、[gitleaks](https://github.com/gitleaks/gitleaks)、[Biome linter](https://biomejs.dev/)

---

## 目的

本标准定义高级静态应用程序安全测试（SAST）实践，作为依赖项审计（`npm audit`）的补充。涵盖三个独立但互补的层次：

1. **CodeQL 语义分析** — 找出第一方代码中的注入漏洞
2. **Secret 扫描** — 防止提交 API 密钥与凭证
3. **Biome 安全 lint 规则** — 在编辑器和 CI 层面强制执行安全的代码模式

---

## 为什么 npm audit 不够用

`npm audit` 会对照 NPM 咨询数据库扫描你的 `package-lock.json`，它只能找出**第三方依赖中已知的 CVE**。

它**无法**找出：

| 漏洞类型 | 示例 | 检测方法 |
|---|---|---|
| **命令注入** | `exec(\`git log ${userInput}\`)` | CodeQL 数据流分析 |
| **路径穿越** | `fs.readFile(path.join(base, req.params.file))` | CodeQL 数据流分析 |
| **原型污染** | `target[req.body.key] = req.body.value` | CodeQL 污点分析 |
| **XSS（通过 DOM sink）** | `element.innerHTML = userContent` | CodeQL 数据流分析 |
| **SQL 注入** | `db.query("SELECT * FROM users WHERE id = " + id)` | CodeQL 数据流分析 |
| **硬编码 secret** | `const apiKey = "sk-live-abc123..."` | gitleaks 模式匹配 |

---

## 第一层：CodeQL 语义分析

### CodeQL 的作用

CodeQL 会构建你的 TypeScript 代码的语义模型，然后执行查询，追踪从**来源**（用户输入、请求参数、环境变量）到**接收点**（命令执行、文件系统访问、DOM 操作）的数据流。

### GitHub Actions 工作流程

创建 `.github/workflows/codeql.yml`：

```yaml
# SPDX-License-Identifier: MIT
name: CodeQL Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'   # 每周一 02:00 UTC

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

### 关键配置选项

| 选项 | 值 | 原因 |
|---|---|---|
| `languages` | `javascript-typescript` | 覆盖 `.ts` 与 `.js` 文件 |
| `queries` | `security-extended` | 包含默认集中未涵盖的注入/XSS/路径穿越查询 |
| `schedule` | `0 2 * * 1` | 每周抓取 GitHub 发布的新查询包 |
| `security-events: write` | 必填 | 将 SARIF 结果上传至 GitHub Security 标签页 |

### 分支保护配置

添加工作流程后，配置分支保护规则：

1. Settings → Branches → Branch protection rules → Edit main
2. 启用「Require status checks to pass before merging」
3. 将 `CodeQL` 与 `sast` 加入必要检查项目

---

## 第二层：使用 gitleaks 扫描 Secret

### gitleaks 能检测什么

gitleaks 使用模式匹配与熵分析来检测：
- AWS 访问密钥（`AKIA[0-9A-Z]{16}`）
- GitHub token（`ghp_`、`gho_`、`ghs_`、`ghr_`）
- 私钥 PEM 块（`-----BEGIN RSA PRIVATE KEY-----`）
- 符合凭证模式的高熵字符串
- 定义于 `.gitleaks.toml` 的自定义模式

### CI 集成

在你的 CI 工作流程中添加 `sast` 任务：

```yaml
sast:
  name: Secret Scanning
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0   # 完整历史以确保准确扫描
    - name: Run gitleaks
      uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### `.gitleaks.toml` 配置示例

```toml
title = "Gitleaks Configuration (example)"
version = "8"

[extend]
# 从 gitleaks 基础配置继承默认规则
useDefault = true

[[rules]]
id = "app-license-key"
description = "App license key"
regex = '''app[_\-]?license[_\-]?key\s*[:=]\s*["']?([A-Za-z0-9\-]{32,})["']?'''
severity = "CRITICAL"
tags = ["license", "app"]

[[allowlist.commits]]
# 示例：允许已修复的特定 commit hash
# commits = ["abc1234"]

[[allowlist.regexes]]
# 将测试 fixture 值加入白名单
description = "Test fixture placeholder keys"
regex = '''PLACEHOLDER_KEY_FOR_TESTING'''
```

### 处理误报（False Positives）

当 gitleaks 标记误报时：

1. 找出触发匹配的确切模式
2. 在 `.gitleaks.toml` 中添加有针对性的 `allowlist.regexes` 条目，并附上说明
3. 在被标记的值旁边添加代码注释，记录允许原因
4. 每季度审查所有白名单条目

---

## 第三层：Biome 安全规则

### 为什么选择 Biome 而不是 ESLint

采用 Biome 作为 linter 的项目，无需额外安装 ESLint 插件，即可获得内置的安全相关规则。Biome 中的关键安全规则：

| 规则 | 类别 | 防止的问题 |
|---|---|---|
| `suspicious/noGlobalEval` | suspicious | 通过 `eval()` 动态执行代码 |
| `suspicious/noWith` | suspicious | 通过 `with` 语句污染作用域 |
| `suspicious/noConsoleLog` | suspicious | 通过 `console.log` 意外记录 secret |
| `correctness/noUnusedVariables` | correctness | 可能包含敏感逻辑的废弃代码 |
| `security/noBlankTarget` | security | 未加 `rel="noopener"` 的 `target="_blank"` 标签劫持 |

### `biome.json` 配置

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

### CI 集成

```yaml
- name: Lint (Biome)
  run: npm run lint   # 对应：biome check .
```

`biome check .` 命令会同时执行格式检查与 linter 规则。安全规则失败会产生非零退出码，阻止 CI 流程。

---

## 质量闸门阈值

| 严重性 | 合并策略 | 修复 SLA |
|---|---|---|
| **CRITICAL** | 阻止合并，无例外 | 立即处理 |
| **HIGH** | 阻止合并，main 分支 HIGH 为零 | 立即处理 |
| **MEDIUM** | 不阻止；创建追踪 issue | 30 天 |
| **LOW** | 不阻止；记录以供查阅 | 可选 |

### 配置 GitHub Code Scanning 阻止策略

在仓库安全性设置中：
1. Security → Code scanning → Protection rules
2. 将「Security severity level」设置为「High or higher」
3. 这会在 CodeQL 报告任何 HIGH 或 CRITICAL 问题时阻止 PR 合并

---

## npm test 集成

在 `package.json` 中添加 `test:sast` 脚本作为开发者入口：

```json
{
  "scripts": {
    "test:sast": "npm audit --audit-level=high"
  }
}
```

这允许通过 `npm run test:sast` 执行本地推送前检查。注意：此命令只覆盖依赖项漏洞；完整的 SAST 管道在 CI 中执行。

---

## 总结：纵深防御安全扫描

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

没有任何单一扫描器能抓到所有问题。这种分层方式提供：
- **依赖项漏洞**：npm audit（快速，每次推送）
- **提交的 secret**：gitleaks（每次推送，完整历史）
- **代码质量/安全**：Biome 规则（每次提交，编辑器实时反馈）
- **第一方漏洞**：CodeQL（深度分析，PR 及每周）

---

## 相关标准

- [安全标准](../../../core/security-standards.md)
- [Secret 管理标准](../../../core/secret-management-standards.md)
- [Check-in 标准](../../../core/checkin-standards.md)
- [容器安全](../../../core/container-security.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---|---|---|
| 1.0.0 | 2026-05-05 | 初始发布（XSPEC-161） |

---

## 许可证

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
