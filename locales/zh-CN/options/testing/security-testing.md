---
source: options/testing/security-testing.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# 安全测试（Security Testing）

> **语言**: [English](../../../../options/testing/security-testing.md) | 简体中文

**上层标准**: [测试完整性（Testing Completeness）](../../core/test-completeness-dimensions.md)

---

## 概览

安全测试（security testing）在漏洞被利用之前，先找出应用程序中的弱点。它涵盖静态分析（static analysis）、动态测试（dynamic testing）、依赖扫描（dependency scanning）与渗透测试（penetration testing），以确保全面的安全覆盖。

## 最适用于

- 处理敏感数据的应用程序
- 金融服务
- 医疗健康应用程序
- 电子商务平台
- 任何对外公开的应用程序

## 测试类型

### 静态应用程序安全测试（SAST）

不执行程序的情况下分析源代码。

| 方面 | 细节 |
|--------|---------|
| **何时使用** | 开发早期、CI/CD pipeline |

**工具：**

| 工具 | 语言 |
|------|-----------|
| SonarQube | 多语言 |
| Semgrep | 多语言 |
| CodeQL | 多语言 |
| Bandit | Python |
| Brakeman | Ruby |
| ESLint security plugins | JavaScript/TypeScript |

### 动态应用程序安全测试（DAST）

针对运行中的应用程序测试漏洞。

| 方面 | 细节 |
|--------|---------|
| **何时使用** | Staging 环境、预上线（pre-production） |

**工具：**

| 工具 | 类型 |
|------|------|
| OWASP ZAP | 开源 |
| Burp Suite | 商业 |
| Nuclei | 开源 |
| Nikto | 开源 |

### 软件成分分析（SCA）

检查依赖项是否存在已知漏洞。

| 方面 | 细节 |
|--------|---------|
| **何时使用** | 每次构建、持续监控 |

**工具：**

| 工具 | 类型 |
|------|------|
| Snyk | SaaS/CLI |
| Dependabot | GitHub 集成 |
| npm audit | CLI |
| OWASP Dependency-Check | 开源 |

### 渗透测试（Penetration Testing）

由安全专业人员执行的模拟攻击。

| 方面 | 细节 |
|--------|---------|
| **何时使用** | 重大发布前、每年一次 |

**类型：**
- **黑盒（Black box）：** 无事先信息
- **白盒（White box）：** 完整访问权限
- **灰盒（Grey box）：** 部分信息

### 密钥扫描（Secret Scanning）

检测泄露的凭证与密钥信息。

**工具：**

| 工具 | 类型 |
|------|------|
| GitLeaks | 开源 |
| TruffleHog | 开源 |
| GitHub Secret Scanning | GitHub 集成 |

## OWASP Top 10（2021）

| ID | 风险 | 测试重点 |
|----|------|------------|
| A01 | 失效的访问控制（Broken Access Control） | 授权检查、权限提升 |
| A02 | 加密失效（Cryptographic Failures） | 加密、密钥管理、数据泄露 |
| A03 | 注入（Injection） | SQL、NoSQL、OS、LDAP injection |
| A04 | 不安全的设计（Insecure Design） | 安全需求、威胁建模（threat modeling） |
| A05 | 安全配置错误（Security Misconfiguration） | 默认配置、不必要的功能 |
| A06 | 易受攻击的组件（Vulnerable Components） | 过时的依赖项、已知 CVE |
| A07 | 身份验证失效（Authentication Failures） | Session 管理、凭证填充（credential stuffing） |
| A08 | 软件与数据完整性失效（Software and Data Integrity Failures） | CI/CD pipeline 安全、序列化（serialization） |
| A09 | 安全日志与监控失效（Security Logging and Monitoring Failures） | 审计日志、告警 |
| A10 | 服务器端请求伪造（Server-Side Request Forgery） | URL 验证、网络分段（network segmentation） |

## CI 集成

### GitHub Actions 示例

```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
```

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| CI 中的 SAST | 在每条构建 pipeline 中纳入 SAST | 必需 |
| 依赖扫描 | 扫描所有依赖项的漏洞 | 必需 |
| 密钥扫描 | 在 push 之前扫描泄露的密钥信息 | 必需 |
| DAST staging | 针对 staging 环境执行 DAST | 推荐 |
| 年度渗透测试 | 至少每年进行一次渗透测试 | 推荐 |
| OWASP 检查清单 | 在测试计划中涵盖所有 OWASP Top 10 风险 | 必需 |

## 快速参考

| 类型 | 缩写 | 何时 | 工具 |
|------|--------------|------|-------|
| 静态分析 | SAST | CI/CD | SonarQube, Semgrep |
| 动态分析 | DAST | Staging | OWASP ZAP, Burp |
| 依赖扫描 | SCA | 每次构建 | Snyk, Dependabot |
| 渗透测试 | Pentest | 每年 | 手动／专业人员 |
| 密钥扫描 | - | Pre-commit | GitLeaks, TruffleHog |

## 相关选项

- [性能测试（Performance Testing）](./performance-testing.md) - 性能测试实践
- [单元测试（Unit Testing）](./unit-testing.md) - 单元测试实践

---

## 参考资料

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST SP 800-115](https://csrc.nist.gov/publications/detail/sp/800-115/final)

---

## 许可

本文件依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
