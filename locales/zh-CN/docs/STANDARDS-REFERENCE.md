# UDS 核心规范与业界标准对照表
# UDS Core Standards vs Industry Standards Reference

> **用途**：本文档对照 UDS 核心规范与业界标准、通用做法及权威参考文献。
>
> **Purpose**: This document maps UDS core standards to industry standards, common practices, and authoritative references.

---

## 总览 / Overview

| 统计项目 | 数量 |
|----------|------|
| 核心标准 / Core Standards | 29 |
| 引用业界标准 / Industry Standards | 27 |
| 通用做法 / Common Practices | 75+ |
| 参考书籍 / Reference Books | 15 |
| 标准组织 / Standards Orgs | IEEE, ISO, W3C, IETF, OWASP, ETSI, NIST, ISTQB |

---

## 完整对照表 / Complete Reference Table

### Level 1 - 基本 / Essential

#### 1. 反幻觉指南 / Anti-Hallucination Guidelines
**文件**: `core/anti-hallucination.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（UDS 原创 AI 协作标准） |
| **通用做法** | 基于证据分析、来源标注、确定性分类 |
| **参考文献** | 无 |

---

#### 2. 提交信息指南 / Commit Message Guide
**文件**: `core/commit-message-guide.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | Conventional Commits 1.0.0 |
| **通用做法** | Angular Commit Guidelines、语义化提交信息 |
| **参考文献** | [conventionalcommits.org](https://www.conventionalcommits.org/)、[Angular CONTRIBUTING.md](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)、[semver.org](https://semver.org/) |

---

#### 3. 代码签入标准 / Code Check-in Standards
**文件**: `core/checkin-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | SWEBOK v4.0 第六章（软件配置管理） |
| **通用做法** | Pre-commit Hooks、原子提交、质量门 |
| **参考文献** | [IEEE SWEBOK](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4)、[Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)、[The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/) |

---

#### 4. 规格驱动开发 / Spec-Driven Development
**文件**: `core/spec-driven-development.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（2025+ AI 时代新兴方法论） |
| **通用做法** | 规格优先代码其次、正向推演、三层成熟度模型 |
| **参考文献** | [Thoughtworks SDD](https://www.thoughtworks.com/)、[Specmatic](https://specmatic.io/) |

---

#### 5. 安全标准 / Security Standards
**文件**: `core/security-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | OWASP Top 10 (2021)、OWASP ASVS v4.0、NIST SP 800-53 Rev.5 |
| **通用做法** | 纵深防御、最小权限原则、输入验证 |
| **参考文献** | [OWASP Top 10](https://owasp.org/Top10/)、[OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)、[NIST SP 800-53](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) |

---

### Level 2 - 推荐 / Recommended

#### 6. 代码审查清单 / Code Review Checklist
**文件**: `core/code-review-checklist.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | SWEBOK v4.0 第十章（软件质量） |
| **通用做法** | Google 工程实践、Microsoft Code Review Guidelines |
| **参考文献** | [Google Code Review](https://google.github.io/eng-practices/review/)、[Microsoft PR Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-requests)、O'Reilly "Making Software" |

---

#### 7. Git 工作流程指南 / Git Workflow Guide
**文件**: `core/git-workflow.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（业界通用实践） |
| **通用做法** | GitFlow、GitHub Flow、主干开发、分支保护 |
| **参考文献** | [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)、[GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) |

---

#### 8. 语义化版本 / Semantic Versioning
**文件**: `core/versioning.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | Semantic Versioning 2.0.0 |
| **通用做法** | MAJOR.MINOR.PATCH、预发布标签（alpha/beta/rc）、CalVer |
| **参考文献** | [semver.org](https://semver.org/)、[calver.org](https://calver.org/)、[keepachangelog.com](https://keepachangelog.com/) |

---

#### 9. 变更日志标准 / Changelog Standards
**文件**: `core/changelog-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | Keep a Changelog 1.1.0 |
| **通用做法** | Added/Changed/Deprecated/Removed/Fixed/Security 分类 |
| **参考文献** | [keepachangelog.com](https://keepachangelog.com/)、[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)、[semantic-release](https://github.com/semantic-release/semantic-release) |

---

#### 10. 测试标准 / Testing Standards
**文件**: `core/testing-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | ISTQB CTFL v4.0、ISO/IEC/IEEE 29119、SWEBOK v4.0 |
| **通用做法** | 测试金字塔（70/20/10）、FIRST 原则、AAA 模式 |
| **参考文献** | [ISTQB Syllabus](https://istqb.org/)、[ISO 29119](https://www.iso.org/standard/81291.html)、[IEEE SWEBOK](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4) |

---

#### 11. AI 指令文件规范 / AI Instruction Standards
**文件**: `core/ai-instruction-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（新兴 AI 工具实践） |
| **通用做法** | 通用与项目特定分离、Token 感知设计 |
| **参考文献** | Claude Code CLAUDE.md、Cursor .cursorrules、GitHub Copilot Instructions |

---

#### 12. AI 友好架构 / AI-Friendly Architecture
**文件**: `core/ai-friendly-architecture.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（新兴 AI 协作实践） |
| **通用做法** | 显式优于隐式、分层上下文、语义边界 |
| **参考文献** | .ai-context.yaml 配置格式 |

---

#### 13. 错误码标准 / Error Code Standards
**文件**: `core/error-code-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | RFC 7807、RFC 9457（HTTP API 问题详情） |
| **通用做法** | HTTP 状态码、Microsoft REST API Guidelines |
| **参考文献** | [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807)、[RFC 9457](https://datatracker.ietf.org/doc/html/rfc9457)、[MDN HTTP Status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)、[Microsoft API Guidelines](https://github.com/microsoft/api-guidelines) |

---

#### 14. 日志标准 / Logging Standards
**文件**: `core/logging-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | RFC 5424（Syslog 协议）、OpenTelemetry Logging、W3C Trace Context |
| **通用做法** | 12 Factor App Logs、Google SRE Alerting、结构化日志 |
| **参考文献** | [RFC 5424](https://datatracker.ietf.org/doc/html/rfc5424)、[OpenTelemetry](https://opentelemetry.io/)、[W3C Trace Context](https://www.w3.org/TR/trace-context/)、[12factor.net/logs](https://12factor.net/logs)、[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) |

---

#### 15. 测试完整性维度 / Test Completeness Dimensions
**文件**: `core/test-completeness-dimensions.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | ISTQB AI Testing Syllabus |
| **通用做法** | 8 维度模型、变异测试 |
| **参考文献** | [ISTQB CT-AI](https://istqb.org/certifications/certified-tester-ai-testing-ct-ai/)、[Google Mutation Testing Blog](https://testing.googleblog.com/2021/04/mutation-testing.html)、工具：PIT、Stryker、mutmut |

---

#### 16. 测试驱动开发 / Test-Driven Development
**文件**: `core/test-driven-development.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（1999 Kent Beck 实践） |
| **通用做法** | 红-绿-重构、FIRST 原则、小步前进 |
| **参考文献** | Kent Beck "Test-Driven Development: By Example" (2002) |

---

#### 17. 行为驱动开发 / Behavior-Driven Development
**文件**: `core/behavior-driven-development.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（2006 Dan North 实践） |
| **通用做法** | Given-When-Then（Gherkin）、三方会谈、双循环 TDD（GOOS） |
| **参考文献** | Dan North "Introducing BDD" (2006)、Freeman & Pryce "Growing Object-Oriented Software, Guided by Tests" (2009)、工具：Cucumber、Behave、SpecFlow |

---

#### 18. 验收测试驱动开发 / Acceptance Test-Driven Development
**文件**: `core/acceptance-test-driven-development.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（2003-2006 实践） |
| **通用做法** | 三方会谈（PO+Dev+QA）、规格工作坊、活文档 |
| **参考文献** | Gojko Adzic "Specification by Example" (2011)、工具：FitNesse、Cucumber、Robot Framework |

---

#### 19. 反向工程标准 / Reverse Engineering Standards
**文件**: `core/reverse-engineering-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | IEEE 830-1998、SWEBOK v4.0 第九章（软件维护） |
| **通用做法** | 确定性框架（[已确认]/[推论]/[假设]/[未知]） |
| **参考文献** | Michael Feathers "Working Effectively with Legacy Code" (2004) |

---

#### 20. 正向推演标准 / Forward Derivation Standards
**文件**: `core/forward-derivation-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | JSON Schema 2020-12 |
| **通用做法** | 规格 → BDD/TDD/ATDD/契约推演、契约设计 |
| **参考文献** | Freeman & Pryce "GOOS" (2009)、Adzic "Specification by Example" (2011)、Bertrand Meyer "Design by Contract" (1986)、[Specmatic](https://specmatic.io/) |

---

#### 21. AI 协议标准 / AI Agreement Standards
**文件**: `core/ai-agreement-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | ISO 12207 §6.1 协议流程 |
| **通用做法** | 上下文契约、RFP 结构、供应验收 |
| **参考文献** | [ISO/IEC 12207:2017](https://www.iso.org/standard/63712.html) |

---

#### 22. 重构标准 / Refactoring Standards
**文件**: `core/refactoring-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | ISO/IEC 25010 可维护性 |
| **通用做法** | 预备重构、童子军规则、绞杀者模式、防腐层、抽象分支、并行修改 |
| **参考文献** | Martin Fowler "Refactoring" (2018)、Michael Feathers "Working Effectively with Legacy Code" (2004) |

---

#### 23. 需求工程标准 / Requirement Engineering
**文件**: `core/requirement-engineering.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | IEEE 830-1998、IEEE 29148-2018、SWEBOK v4.0、ISO/IEC 25010 |
| **通用做法** | MoSCoW 优先级、P0-P3 模型、Kano 模型、INVEST 准则 |
| **参考文献** | [IEEE 830](https://standards.ieee.org/standard/830-1998.html)、[IEEE 29148](https://standards.ieee.org/standard/29148-2018.html)、[SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering) |

---

#### 24. 性能标准 / Performance Standards
**文件**: `core/performance-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | ISO/IEC 25010 性能效率 |
| **通用做法** | RED 方法、USE 方法、黄金信号、Core Web Vitals |
| **参考文献** | [ISO/IEC 25010](https://www.iso.org/standard/35733.html)、[Google SRE Book](https://sre.google/books/)、[Core Web Vitals](https://web.dev/vitals/) |

---

#### 25. 无障碍标准 / Accessibility Standards
**文件**: `core/accessibility-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | WCAG 2.1/2.2、WAI-ARIA 1.2、ISO/IEC 25010、Section 508、EN 301 549 |
| **通用做法** | POUR 原则（可感知、可操作、可理解、稳健） |
| **参考文献** | [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)、[WCAG 2.2](https://www.w3.org/TR/WCAG22/)、[WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/)、[WebAIM](https://webaim.org/)、[A11Y Project](https://www.a11yproject.com/) |

---

### Level 3 - 企业 / Enterprise

#### 26. 文档结构 / Documentation Structure
**文件**: `core/documentation-structure.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | 无（业界惯例） |
| **通用做法** | Diátaxis 框架、ADR（架构决策记录）、C4 模型 |
| **参考文献** | [Diátaxis](https://diataxis.fr/)、[ADR GitHub](https://adr.github.io/)、[C4 Model](https://c4model.com/)、工具：Mermaid、PlantUML、Draw.io |

---

#### 27. 文档撰写标准 / Documentation Writing Standards
**文件**: `core/documentation-writing-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | OpenAPI 3.1、AsyncAPI 2.6、JSON Schema 2020-12 |
| **通用做法** | Token 感知设计、API 优先文档 |
| **参考文献** | [OpenAPI](https://www.openapis.org/)、[AsyncAPI](https://www.asyncapi.com/)、工具：Swagger、Docusaurus、Sphinx、JSDoc |

---

#### 28. 项目结构 / Project Structure
**文件**: `core/project-structure.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | Maven Standard Directory Layout |
| **通用做法** | src-layout（Python）、cmd/pkg/internal（Go）、Monorepo 模式 |
| **参考文献** | [Standard Go Layout](https://github.com/golang-standards/project-layout)、[Monorepo.tools](https://monorepo.tools/)、工具：Turborepo、Nx、Lerna、Rush |

---

#### 29. 虚拟组织标准 / Virtual Organization Standards
**文件**: `core/virtual-organization-standards.md`

| 类型 | 项目 |
|------|------|
| **业界标准** | ISO 12207 §6.2 组织项目赋能流程 |
| **通用做法** | 技能管理、MCP 工具集成、QMS 自动化 |
| **参考文献** | [ISO/IEC 12207:2017](https://www.iso.org/standard/63712.html)、[Model Context Protocol](https://modelcontextprotocol.io/) |

---

## 标准组织索引 / Standards Organizations Index

| 组织 | 标准 | 引用数 |
|------|------|--------|
| **IEEE** | SWEBOK v4.0、IEEE 830、IEEE 29148 | 6 |
| **ISO** | ISO/IEC 25010、ISO/IEC 12207、ISO/IEC/IEEE 29119 | 5 |
| **W3C** | WCAG 2.1/2.2、WAI-ARIA、W3C Trace Context | 4 |
| **IETF** | RFC 5424、RFC 7807、RFC 9457 | 3 |
| **OWASP** | Top 10、ASVS v4.0、Logging Cheat Sheet | 3 |
| **NIST** | SP 800-53 | 1 |
| **ETSI** | EN 301 549 | 1 |
| **ISTQB** | CTFL v4.0、AI Testing Syllabus | 2 |

---

## 经典书籍参考 / Classic Books Reference

| 书籍 | 作者 | 年份 | 关联标准 |
|------|------|------|----------|
| Test-Driven Development: By Example | Kent Beck | 2002 | TDD |
| Working Effectively with Legacy Code | Michael Feathers | 2004 | 重构、反向工程 |
| Growing Object-Oriented Software, Guided by Tests | Freeman & Pryce | 2009 | BDD、正向推演 |
| Specification by Example | Gojko Adzic | 2011 | ATDD、正向推演 |
| Refactoring（第二版） | Martin Fowler | 2018 | 重构 |
| Site Reliability Engineering | Google | 2016 | 日志、性能 |
| Clean Code | Robert C. Martin | 2008 | 代码审查、重构 |
| The Pragmatic Programmer（20周年纪念版） | Thomas & Hunt | 2019 | 签入标准、代码质量 |
| Domain-Driven Design | Eric Evans | 2003 | 项目结构、架构 |
| Continuous Delivery | Humble & Farley | 2010 | 签入标准、Git 工作流程 |
| Release It!（第二版） | Michael Nygard | 2018 | 性能、日志 |
| The DevOps Handbook | Kim, Humble, Debois, Willis | 2016 | Git 工作流程、测试 |
| Accelerate | Forsgren, Humble, Kim | 2018 | 性能、测试 |
| Building Microservices（第二版） | Sam Newman | 2021 | 项目结构、文档 |
| Object-Oriented Software Construction | Bertrand Meyer | 1988 | 契约设计、正向推演 |

---

## 通用做法分类 / Common Practices Categories

### 测试方法论 / Testing Methodologies
- 红-绿-重构（TDD）
- Given-When-Then（BDD）
- 三方会谈（ATDD）
- 测试金字塔（70/20/10）
- FIRST 原则
- 变异测试

### 版本控制 / Version Control
- Conventional Commits
- Semantic Versioning
- Keep a Changelog
- GitFlow / GitHub Flow / 主干开发

### 代码质量 / Code Quality
- 童子军规则
- 预备重构
- 绞杀者模式
- 防腐层

### API 设计 / API Design
- RFC 7807 Problem Details
- OpenAPI 3.1
- 契约设计

### 可观测性 / Observability
- 12 Factor App Logs
- OpenTelemetry
- RED/USE/黄金信号

---

## UDS 原创贡献 / UDS Original Contributions

以下标准为 UDS 对业界的原创贡献：

| 标准 | 创新点 |
|------|--------|
| 反幻觉指南 | 首个系统化的 AI 协作准确性框架 |
| 规格驱动开发 | AI 时代的规格方法论 |
| AI 指令文件规范 | 系统化的 AI 工具配置模式 |
| AI 友好架构 | 为 AI 协作优化的架构模式 |
| AI 协议标准 | 正式的 AI 任务委派协议 |
| 虚拟组织标准 | AI 代理编排框架 |

---

## 版本历史 / Version History

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.1 | 2025-02-02 | 修正：更正为 29 项标准，补充 9 本书籍参考 |
| 1.0.0 | 2025-02-02 | 初始发布 |
