# UDS Core Standards vs Industry Standards Reference
# UDS 核心規範與業界標準對照表

> **Purpose**: This document maps UDS core standards to industry standards, common practices, and authoritative references.
>
> **用途**：本文件對照 UDS 核心規範與業界標準、通用做法及權威參考文獻。

---

## Overview / 總覽

| Statistic | Count |
|-----------|-------|
| Core Standards / 核心標準 | 29 |
| Industry Standards Referenced / 引用業界標準 | 27 |
| Common Practices / 通用做法 | 75+ |
| Reference Books / 參考書籍 | 15 |
| Standards Organizations / 標準組織 | IEEE, ISO, W3C, IETF, OWASP, ETSI, NIST, ISTQB |

---

## Complete Reference Table / 完整對照表

### Level 1 - Essential / 基本

#### 1. Anti-Hallucination Guidelines / 反幻覺指南
**File**: `core/anti-hallucination.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (UDS original AI collaboration standard) |
| **Common Practices** | Evidence-Based Analysis, Source Attribution, Certainty Classification |
| **References** | None |

---

#### 2. Commit Message Guide / 提交訊息指南
**File**: `core/commit-message-guide.md`

| Type | Items |
|------|-------|
| **Industry Standards** | Conventional Commits 1.0.0 |
| **Common Practices** | Angular Commit Guidelines, Semantic Commit Messages |
| **References** | [conventionalcommits.org](https://www.conventionalcommits.org/), [Angular CONTRIBUTING.md](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit), [semver.org](https://semver.org/) |

---

#### 3. Code Check-in Standards / 程式碼簽入標準
**File**: `core/checkin-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | SWEBOK v4.0 Chapter 6 (Software Configuration Management) |
| **Common Practices** | Pre-commit Hooks, Atomic Commits, Quality Gates |
| **References** | [IEEE SWEBOK](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4), [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/), [The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/) |

---

#### 4. Spec-Driven Development / 規格驅動開發
**File**: `core/spec-driven-development.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (Emerging 2025+ AI-era methodology) |
| **Common Practices** | Spec First Code Second, Forward Derivation, Three Maturity Levels |
| **References** | [Thoughtworks SDD](https://www.thoughtworks.com/), [Specmatic](https://specmatic.io/) |

---

#### 5. Security Standards / 安全標準
**File**: `core/security-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | OWASP Top 10 (2021), OWASP ASVS v4.0, NIST SP 800-53 Rev.5 |
| **Common Practices** | Defense in Depth, Principle of Least Privilege, Input Validation |
| **References** | [OWASP Top 10](https://owasp.org/Top10/), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [NIST SP 800-53](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) |

---

### Level 2 - Recommended / 推薦

#### 6. Code Review Checklist / 程式碼審查清單
**File**: `core/code-review-checklist.md`

| Type | Items |
|------|-------|
| **Industry Standards** | SWEBOK v4.0 Chapter 10 (Software Quality) |
| **Common Practices** | Google Engineering Practices, Microsoft Code Review Guidelines |
| **References** | [Google Code Review](https://google.github.io/eng-practices/review/), [Microsoft PR Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-requests), O'Reilly "Making Software" |

---

#### 7. Git Workflow Guide / Git 工作流程指南
**File**: `core/git-workflow.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (Industry common practice) |
| **Common Practices** | GitFlow, GitHub Flow, Trunk-Based Development, Branch Protection |
| **References** | [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials), [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) |

---

#### 8. Semantic Versioning / 語意化版本
**File**: `core/versioning.md`

| Type | Items |
|------|-------|
| **Industry Standards** | Semantic Versioning 2.0.0 |
| **Common Practices** | MAJOR.MINOR.PATCH, Pre-release Tags (alpha/beta/rc), CalVer |
| **References** | [semver.org](https://semver.org/), [calver.org](https://calver.org/), [keepachangelog.com](https://keepachangelog.com/) |

---

#### 9. Changelog Standards / 變更日誌標準
**File**: `core/changelog-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | Keep a Changelog 1.1.0 |
| **Common Practices** | Added/Changed/Deprecated/Removed/Fixed/Security categorization |
| **References** | [keepachangelog.com](https://keepachangelog.com/), [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog), [semantic-release](https://github.com/semantic-release/semantic-release) |

---

#### 10. Testing Standards / 測試標準
**File**: `core/testing-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | ISTQB CTFL v4.0, ISO/IEC/IEEE 29119, SWEBOK v4.0 |
| **Common Practices** | Testing Pyramid (70/20/10), FIRST Principles, AAA Pattern |
| **References** | [ISTQB Syllabus](https://istqb.org/), [ISO 29119](https://www.iso.org/standard/81291.html), [IEEE SWEBOK](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4) |

---

#### 11. AI Instruction Standards / AI 指令檔案規範
**File**: `core/ai-instruction-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (Emerging AI tool practice) |
| **Common Practices** | Universal vs Project-Specific Separation, Token-Aware Design |
| **References** | Claude Code CLAUDE.md, Cursor .cursorrules, GitHub Copilot Instructions |

---

#### 12. AI-Friendly Architecture / AI 友善架構
**File**: `core/ai-friendly-architecture.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (Emerging AI collaboration practice) |
| **Common Practices** | Explicit over Implicit, Layered Context, Semantic Boundaries |
| **References** | .ai-context.yaml configuration format |

---

#### 13. Error Code Standards / 錯誤碼標準
**File**: `core/error-code-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | RFC 7807, RFC 9457 (Problem Details for HTTP APIs) |
| **Common Practices** | HTTP Status Codes, Microsoft REST API Guidelines |
| **References** | [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807), [RFC 9457](https://datatracker.ietf.org/doc/html/rfc9457), [MDN HTTP Status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status), [Microsoft API Guidelines](https://github.com/microsoft/api-guidelines) |

---

#### 14. Logging Standards / 日誌標準
**File**: `core/logging-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | RFC 5424 (Syslog Protocol), OpenTelemetry Logging, W3C Trace Context |
| **Common Practices** | 12 Factor App Logs, Google SRE Alerting, Structured Logging |
| **References** | [RFC 5424](https://datatracker.ietf.org/doc/html/rfc5424), [OpenTelemetry](https://opentelemetry.io/), [W3C Trace Context](https://www.w3.org/TR/trace-context/), [12factor.net/logs](https://12factor.net/logs), [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) |

---

#### 15. Test Completeness Dimensions / 測試完整性維度
**File**: `core/test-completeness-dimensions.md`

| Type | Items |
|------|-------|
| **Industry Standards** | ISTQB AI Testing Syllabus |
| **Common Practices** | 8 Dimensions Model, Mutation Testing |
| **References** | [ISTQB CT-AI](https://istqb.org/certifications/certified-tester-ai-testing-ct-ai/), [Google Mutation Testing Blog](https://testing.googleblog.com/2021/04/mutation-testing.html), Tools: PIT, Stryker, mutmut |

---

#### 16. Test-Driven Development / 測試驅動開發
**File**: `core/test-driven-development.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (1999 Kent Beck practice) |
| **Common Practices** | Red-Green-Refactor, FIRST Principles, Baby Steps |
| **References** | Kent Beck "Test-Driven Development: By Example" (2002) |

---

#### 17. Behavior-Driven Development / 行為驅動開發
**File**: `core/behavior-driven-development.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (2006 Dan North practice) |
| **Common Practices** | Given-When-Then (Gherkin), Three Amigos, Double-Loop TDD (GOOS) |
| **References** | Dan North "Introducing BDD" (2006), Freeman & Pryce "Growing Object-Oriented Software, Guided by Tests" (2009), Tools: Cucumber, Behave, SpecFlow |

---

#### 18. Acceptance Test-Driven Development / 驗收測試驅動開發
**File**: `core/acceptance-test-driven-development.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (2003-2006 practice) |
| **Common Practices** | Three Amigos (PO+Dev+QA), Specification Workshop, Living Documentation |
| **References** | Gojko Adzic "Specification by Example" (2011), Tools: FitNesse, Cucumber, Robot Framework |

---

#### 19. Reverse Engineering Standards / 反向工程標準
**File**: `core/reverse-engineering-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | IEEE 830-1998, SWEBOK v4.0 Chapter 9 (Software Maintenance) |
| **Common Practices** | Certainty Framework ([Confirmed]/[Inferred]/[Assumption]/[Unknown]) |
| **References** | Michael Feathers "Working Effectively with Legacy Code" (2004) |

---

#### 20. Forward Derivation Standards / 正向推演標準
**File**: `core/forward-derivation-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | JSON Schema 2020-12 |
| **Common Practices** | Spec → BDD/TDD/ATDD/Contract Derivation, Design by Contract |
| **References** | Freeman & Pryce "GOOS" (2009), Adzic "Specification by Example" (2011), Bertrand Meyer "Design by Contract" (1986), [Specmatic](https://specmatic.io/) |

---

#### 21. AI Agreement Standards / AI 協議標準
**File**: `core/ai-agreement-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | ISO 12207 §6.1 Agreement Processes |
| **Common Practices** | Context Contract, RFP Structure, Supply Acceptance |
| **References** | [ISO/IEC 12207:2017](https://www.iso.org/standard/63712.html) |

---

#### 22. Refactoring Standards / 重構標準
**File**: `core/refactoring-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | ISO/IEC 25010 Maintainability |
| **Common Practices** | Preparatory Refactoring, Boy Scout Rule, Strangler Fig Pattern, Anti-Corruption Layer, Branch by Abstraction, Parallel Change |
| **References** | Martin Fowler "Refactoring" (2018), Michael Feathers "Working Effectively with Legacy Code" (2004) |

---

#### 23. Requirement Engineering / 需求工程標準
**File**: `core/requirement-engineering.md`

| Type | Items |
|------|-------|
| **Industry Standards** | IEEE 830-1998, IEEE 29148-2018, SWEBOK v4.0, ISO/IEC 25010 |
| **Common Practices** | MoSCoW Priority, P0-P3 Model, Kano Model, INVEST Criteria |
| **References** | [IEEE 830](https://standards.ieee.org/standard/830-1998.html), [IEEE 29148](https://standards.ieee.org/standard/29148-2018.html), [SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering) |

---

#### 24. Performance Standards / 效能標準
**File**: `core/performance-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | ISO/IEC 25010 Performance Efficiency |
| **Common Practices** | RED Method, USE Method, Golden Signals, Core Web Vitals |
| **References** | [ISO/IEC 25010](https://www.iso.org/standard/35733.html), [Google SRE Book](https://sre.google/books/), [Core Web Vitals](https://web.dev/vitals/) |

---

#### 25. Accessibility Standards / 無障礙標準
**File**: `core/accessibility-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | WCAG 2.1/2.2, WAI-ARIA 1.2, ISO/IEC 25010, Section 508, EN 301 549 |
| **Common Practices** | POUR Principles (Perceivable, Operable, Understandable, Robust) |
| **References** | [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/), [WebAIM](https://webaim.org/), [A11Y Project](https://www.a11yproject.com/) |

---

### Level 3 - Enterprise / 企業

#### 26. Documentation Structure / 文件結構
**File**: `core/documentation-structure.md`

| Type | Items |
|------|-------|
| **Industry Standards** | None (Industry convention) |
| **Common Practices** | Diátaxis Framework, ADR (Architecture Decision Records), C4 Model |
| **References** | [Diátaxis](https://diataxis.fr/), [ADR GitHub](https://adr.github.io/), [C4 Model](https://c4model.com/), Tools: Mermaid, PlantUML, Draw.io |

---

#### 27. Documentation Writing Standards / 文件撰寫標準
**File**: `core/documentation-writing-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | OpenAPI 3.1, AsyncAPI 2.6, JSON Schema 2020-12 |
| **Common Practices** | Token-Aware Design, API-First Documentation |
| **References** | [OpenAPI](https://www.openapis.org/), [AsyncAPI](https://www.asyncapi.com/), Tools: Swagger, Docusaurus, Sphinx, JSDoc |

---

#### 28. Project Structure / 專案結構
**File**: `core/project-structure.md`

| Type | Items |
|------|-------|
| **Industry Standards** | Maven Standard Directory Layout |
| **Common Practices** | src-layout (Python), cmd/pkg/internal (Go), Monorepo patterns |
| **References** | [Standard Go Layout](https://github.com/golang-standards/project-layout), [Monorepo.tools](https://monorepo.tools/), Tools: Turborepo, Nx, Lerna, Rush |

---

#### 29. Virtual Organization Standards / 虛擬組織標準
**File**: `core/virtual-organization-standards.md`

| Type | Items |
|------|-------|
| **Industry Standards** | ISO 12207 §6.2 Organizational Project-Enabling Processes |
| **Common Practices** | Skill Management, MCP Tool Integration, QMS Automation |
| **References** | [ISO/IEC 12207:2017](https://www.iso.org/standard/63712.html), [Model Context Protocol](https://modelcontextprotocol.io/) |

---

## Standards Organizations Index / 標準組織索引

| Organization | Standards | Reference Count |
|--------------|-----------|-----------------|
| **IEEE** | SWEBOK v4.0, IEEE 830, IEEE 29148 | 6 |
| **ISO** | ISO/IEC 25010, ISO/IEC 12207, ISO/IEC/IEEE 29119 | 5 |
| **W3C** | WCAG 2.1/2.2, WAI-ARIA, W3C Trace Context | 4 |
| **IETF** | RFC 5424, RFC 7807, RFC 9457 | 3 |
| **OWASP** | Top 10, ASVS v4.0, Logging Cheat Sheet | 3 |
| **NIST** | SP 800-53 | 1 |
| **ETSI** | EN 301 549 | 1 |
| **ISTQB** | CTFL v4.0, AI Testing Syllabus | 2 |

---

## Classic Books Reference / 經典書籍參考

| Book | Author | Year | Related Standards |
|------|--------|------|-------------------|
| Test-Driven Development: By Example | Kent Beck | 2002 | TDD |
| Working Effectively with Legacy Code | Michael Feathers | 2004 | Refactoring, Reverse Engineering |
| Growing Object-Oriented Software, Guided by Tests | Freeman & Pryce | 2009 | BDD, Forward Derivation |
| Specification by Example | Gojko Adzic | 2011 | ATDD, Forward Derivation |
| Refactoring (2nd Edition) | Martin Fowler | 2018 | Refactoring |
| Site Reliability Engineering | Google | 2016 | Logging, Performance |
| Clean Code | Robert C. Martin | 2008 | Code Review, Refactoring |
| The Pragmatic Programmer (20th Anniversary) | Thomas & Hunt | 2019 | Check-in Standards, Code Quality |
| Domain-Driven Design | Eric Evans | 2003 | Project Structure, Architecture |
| Continuous Delivery | Humble & Farley | 2010 | Check-in Standards, Git Workflow |
| Release It! (2nd Edition) | Michael Nygard | 2018 | Performance, Logging |
| The DevOps Handbook | Kim, Humble, Debois, Willis | 2016 | Git Workflow, Testing |
| Accelerate | Forsgren, Humble, Kim | 2018 | Performance, Testing |
| Building Microservices (2nd Edition) | Sam Newman | 2021 | Project Structure, Documentation |
| Object-Oriented Software Construction | Bertrand Meyer | 1988 | Design by Contract, Forward Derivation |

---

## Common Practices Categories / 通用做法分類

### Testing Methodologies / 測試方法論
- Red-Green-Refactor (TDD)
- Given-When-Then (BDD)
- Three Amigos (ATDD)
- Testing Pyramid (70/20/10)
- FIRST Principles
- Mutation Testing

### Version Control / 版本控制
- Conventional Commits
- Semantic Versioning
- Keep a Changelog
- GitFlow / GitHub Flow / Trunk-Based

### Code Quality / 程式碼品質
- Boy Scout Rule
- Preparatory Refactoring
- Strangler Fig Pattern
- Anti-Corruption Layer

### API Design / API 設計
- RFC 7807 Problem Details
- OpenAPI 3.1
- Design by Contract

### Observability / 可觀測性
- 12 Factor App Logs
- OpenTelemetry
- RED/USE/Golden Signals

---

## UDS Original Contributions / UDS 原創貢獻

The following standards are UDS original contributions to the industry:

| Standard | Innovation |
|----------|------------|
| Anti-Hallucination Guidelines | First systematic framework for AI collaboration accuracy |
| Spec-Driven Development | AI-era specification methodology |
| AI Instruction Standards | Systematic AI tool configuration patterns |
| AI-Friendly Architecture | Architecture patterns optimized for AI collaboration |
| AI Agreement Standards | Formal AI task delegation protocols |
| Virtual Organization Standards | AI agent orchestration frameworks |

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-02-02 | Fix: Correct count to 29 standards, add 9 more book references |
| 1.0.0 | 2025-02-02 | Initial release |
