# UDS 核心規範與業界標準對照表
# UDS Core Standards vs Industry Standards Reference

> **用途**：本文件對照 UDS 核心規範與業界標準、通用做法及權威參考文獻。
>
> **Purpose**: This document maps UDS core standards to industry standards, common practices, and authoritative references.

---

## 總覽 / Overview

| 統計項目 | 數量 |
|----------|------|
| 核心標準 / Core Standards | 29 |
| 引用業界標準 / Industry Standards | 27 |
| 通用做法 / Common Practices | 75+ |
| 參考書籍 / Reference Books | 15 |
| 標準組織 / Standards Orgs | IEEE, ISO, W3C, IETF, OWASP, ETSI, NIST, ISTQB |

---

## 完整對照表 / Complete Reference Table

### Level 1 - 基本 / Essential

#### 1. 反幻覺指南 / Anti-Hallucination Guidelines
**檔案**: `core/anti-hallucination.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（UDS 原創 AI 協作標準） |
| **通用做法** | 基於證據分析、來源標注、確定性分類 |
| **參考文獻** | 無 |

---

#### 2. 提交訊息指南 / Commit Message Guide
**檔案**: `core/commit-message-guide.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | Conventional Commits 1.0.0 |
| **通用做法** | Angular Commit Guidelines、語意化提交訊息 |
| **參考文獻** | [conventionalcommits.org](https://www.conventionalcommits.org/)、[Angular CONTRIBUTING.md](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)、[semver.org](https://semver.org/) |

---

#### 3. 程式碼簽入標準 / Code Check-in Standards
**檔案**: `core/checkin-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | SWEBOK v4.0 第六章（軟體配置管理） |
| **通用做法** | Pre-commit Hooks、原子提交、品質閘門 |
| **參考文獻** | [IEEE SWEBOK](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4)、[Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)、[The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/) |

---

#### 4. 規格驅動開發 / Spec-Driven Development
**檔案**: `core/spec-driven-development.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（2025+ AI 時代新興方法論） |
| **通用做法** | 規格優先程式碼其次、正向推演、三層成熟度模型 |
| **參考文獻** | [Thoughtworks SDD](https://www.thoughtworks.com/)、[Specmatic](https://specmatic.io/) |

---

#### 5. 安全標準 / Security Standards
**檔案**: `core/security-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | OWASP Top 10 (2021)、OWASP ASVS v4.0、NIST SP 800-53 Rev.5 |
| **通用做法** | 縱深防禦、最小權限原則、輸入驗證 |
| **參考文獻** | [OWASP Top 10](https://owasp.org/Top10/)、[OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)、[NIST SP 800-53](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) |

---

### Level 2 - 推薦 / Recommended

#### 6. 程式碼審查清單 / Code Review Checklist
**檔案**: `core/code-review-checklist.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | SWEBOK v4.0 第十章（軟體品質） |
| **通用做法** | Google 工程實踐、Microsoft Code Review Guidelines |
| **參考文獻** | [Google Code Review](https://google.github.io/eng-practices/review/)、[Microsoft PR Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-requests)、O'Reilly "Making Software" |

---

#### 7. Git 工作流程指南 / Git Workflow Guide
**檔案**: `core/git-workflow.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（業界通用實踐） |
| **通用做法** | GitFlow、GitHub Flow、主幹開發、分支保護 |
| **參考文獻** | [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)、[GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) |

---

#### 8. 語意化版本 / Semantic Versioning
**檔案**: `core/versioning.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | Semantic Versioning 2.0.0 |
| **通用做法** | MAJOR.MINOR.PATCH、預發布標籤（alpha/beta/rc）、CalVer |
| **參考文獻** | [semver.org](https://semver.org/)、[calver.org](https://calver.org/)、[keepachangelog.com](https://keepachangelog.com/) |

---

#### 9. 變更日誌標準 / Changelog Standards
**檔案**: `core/changelog-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | Keep a Changelog 1.1.0 |
| **通用做法** | Added/Changed/Deprecated/Removed/Fixed/Security 分類 |
| **參考文獻** | [keepachangelog.com](https://keepachangelog.com/)、[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)、[semantic-release](https://github.com/semantic-release/semantic-release) |

---

#### 10. 測試標準 / Testing Standards
**檔案**: `core/testing-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | ISTQB CTFL v4.0、ISO/IEC/IEEE 29119、SWEBOK v4.0 |
| **通用做法** | 測試金字塔（70/20/10）、FIRST 原則、AAA 模式 |
| **參考文獻** | [ISTQB Syllabus](https://istqb.org/)、[ISO 29119](https://www.iso.org/standard/81291.html)、[IEEE SWEBOK](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4) |

---

#### 11. AI 指令檔案規範 / AI Instruction Standards
**檔案**: `core/ai-instruction-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（新興 AI 工具實踐） |
| **通用做法** | 通用與專案特定分離、Token 感知設計 |
| **參考文獻** | Claude Code CLAUDE.md、Cursor .cursorrules、GitHub Copilot Instructions |

---

#### 12. AI 友善架構 / AI-Friendly Architecture
**檔案**: `core/ai-friendly-architecture.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（新興 AI 協作實踐） |
| **通用做法** | 顯式優於隱式、分層上下文、語意邊界 |
| **參考文獻** | .ai-context.yaml 配置格式 |

---

#### 13. 錯誤碼標準 / Error Code Standards
**檔案**: `core/error-code-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | RFC 7807、RFC 9457（HTTP API 問題詳情） |
| **通用做法** | HTTP 狀態碼、Microsoft REST API Guidelines |
| **參考文獻** | [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807)、[RFC 9457](https://datatracker.ietf.org/doc/html/rfc9457)、[MDN HTTP Status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)、[Microsoft API Guidelines](https://github.com/microsoft/api-guidelines) |

---

#### 14. 日誌標準 / Logging Standards
**檔案**: `core/logging-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | RFC 5424（Syslog 協議）、OpenTelemetry Logging、W3C Trace Context |
| **通用做法** | 12 Factor App Logs、Google SRE Alerting、結構化日誌 |
| **參考文獻** | [RFC 5424](https://datatracker.ietf.org/doc/html/rfc5424)、[OpenTelemetry](https://opentelemetry.io/)、[W3C Trace Context](https://www.w3.org/TR/trace-context/)、[12factor.net/logs](https://12factor.net/logs)、[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) |

---

#### 15. 測試完整性維度 / Test Completeness Dimensions
**檔案**: `core/test-completeness-dimensions.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | ISTQB AI Testing Syllabus |
| **通用做法** | 8 維度模型、變異測試 |
| **參考文獻** | [ISTQB CT-AI](https://istqb.org/certifications/certified-tester-ai-testing-ct-ai/)、[Google Mutation Testing Blog](https://testing.googleblog.com/2021/04/mutation-testing.html)、工具：PIT、Stryker、mutmut |

---

#### 16. 測試驅動開發 / Test-Driven Development
**檔案**: `core/test-driven-development.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（1999 Kent Beck 實踐） |
| **通用做法** | 紅-綠-重構、FIRST 原則、小步前進 |
| **參考文獻** | Kent Beck "Test-Driven Development: By Example" (2002) |

---

#### 17. 行為驅動開發 / Behavior-Driven Development
**檔案**: `core/behavior-driven-development.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（2006 Dan North 實踐） |
| **通用做法** | Given-When-Then（Gherkin）、三方會談、雙迴圈 TDD（GOOS） |
| **參考文獻** | Dan North "Introducing BDD" (2006)、Freeman & Pryce "Growing Object-Oriented Software, Guided by Tests" (2009)、工具：Cucumber、Behave、SpecFlow |

---

#### 18. 驗收測試驅動開發 / Acceptance Test-Driven Development
**檔案**: `core/acceptance-test-driven-development.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（2003-2006 實踐） |
| **通用做法** | 三方會談（PO+Dev+QA）、規格工作坊、活文件 |
| **參考文獻** | Gojko Adzic "Specification by Example" (2011)、工具：FitNesse、Cucumber、Robot Framework |

---

#### 19. 反向工程標準 / Reverse Engineering Standards
**檔案**: `core/reverse-engineering-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | IEEE 830-1998、SWEBOK v4.0 第九章（軟體維護） |
| **通用做法** | 確定性框架（[已確認]/[推論]/[假設]/[未知]） |
| **參考文獻** | Michael Feathers "Working Effectively with Legacy Code" (2004) |

---

#### 20. 正向推演標準 / Forward Derivation Standards
**檔案**: `core/forward-derivation-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | JSON Schema 2020-12 |
| **通用做法** | 規格 → BDD/TDD/ATDD/契約推演、契約設計 |
| **參考文獻** | Freeman & Pryce "GOOS" (2009)、Adzic "Specification by Example" (2011)、Bertrand Meyer "Design by Contract" (1986)、[Specmatic](https://specmatic.io/) |

---

#### 21. AI 協議標準 / AI Agreement Standards
**檔案**: `core/ai-agreement-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | ISO 12207 §6.1 協議流程 |
| **通用做法** | 上下文契約、RFP 結構、供應驗收 |
| **參考文獻** | [ISO/IEC 12207:2017](https://www.iso.org/standard/63712.html) |

---

#### 22. 重構標準 / Refactoring Standards
**檔案**: `core/refactoring-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | ISO/IEC 25010 可維護性 |
| **通用做法** | 預備重構、童子軍規則、絞殺者模式、防腐層、抽象分支、平行修改 |
| **參考文獻** | Martin Fowler "Refactoring" (2018)、Michael Feathers "Working Effectively with Legacy Code" (2004) |

---

#### 23. 需求工程標準 / Requirement Engineering
**檔案**: `core/requirement-engineering.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | IEEE 830-1998、IEEE 29148-2018、SWEBOK v4.0、ISO/IEC 25010 |
| **通用做法** | MoSCoW 優先級、P0-P3 模型、Kano 模型、INVEST 準則 |
| **參考文獻** | [IEEE 830](https://standards.ieee.org/standard/830-1998.html)、[IEEE 29148](https://standards.ieee.org/standard/29148-2018.html)、[SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering) |

---

#### 24. 效能標準 / Performance Standards
**檔案**: `core/performance-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | ISO/IEC 25010 效能效率 |
| **通用做法** | RED 方法、USE 方法、黃金信號、Core Web Vitals |
| **參考文獻** | [ISO/IEC 25010](https://www.iso.org/standard/35733.html)、[Google SRE Book](https://sre.google/books/)、[Core Web Vitals](https://web.dev/vitals/) |

---

#### 25. 無障礙標準 / Accessibility Standards
**檔案**: `core/accessibility-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | WCAG 2.1/2.2、WAI-ARIA 1.2、ISO/IEC 25010、Section 508、EN 301 549 |
| **通用做法** | POUR 原則（可感知、可操作、可理解、穩健） |
| **參考文獻** | [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)、[WCAG 2.2](https://www.w3.org/TR/WCAG22/)、[WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/)、[WebAIM](https://webaim.org/)、[A11Y Project](https://www.a11yproject.com/) |

---

### Level 3 - 企業 / Enterprise

#### 26. 文件結構 / Documentation Structure
**檔案**: `core/documentation-structure.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | 無（業界慣例） |
| **通用做法** | Diátaxis 框架、ADR（架構決策記錄）、C4 模型 |
| **參考文獻** | [Diátaxis](https://diataxis.fr/)、[ADR GitHub](https://adr.github.io/)、[C4 Model](https://c4model.com/)、工具：Mermaid、PlantUML、Draw.io |

---

#### 27. 文件撰寫標準 / Documentation Writing Standards
**檔案**: `core/documentation-writing-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | OpenAPI 3.1、AsyncAPI 2.6、JSON Schema 2020-12 |
| **通用做法** | Token 感知設計、API 優先文件 |
| **參考文獻** | [OpenAPI](https://www.openapis.org/)、[AsyncAPI](https://www.asyncapi.com/)、工具：Swagger、Docusaurus、Sphinx、JSDoc |

---

#### 28. 專案結構 / Project Structure
**檔案**: `core/project-structure.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | Maven Standard Directory Layout |
| **通用做法** | src-layout（Python）、cmd/pkg/internal（Go）、Monorepo 模式 |
| **參考文獻** | [Standard Go Layout](https://github.com/golang-standards/project-layout)、[Monorepo.tools](https://monorepo.tools/)、工具：Turborepo、Nx、Lerna、Rush |

---

#### 29. 虛擬組織標準 / Virtual Organization Standards
**檔案**: `core/virtual-organization-standards.md`

| 類型 | 項目 |
|------|------|
| **業界標準** | ISO 12207 §6.2 組織專案賦能流程 |
| **通用做法** | 技能管理、MCP 工具整合、QMS 自動化 |
| **參考文獻** | [ISO/IEC 12207:2017](https://www.iso.org/standard/63712.html)、[Model Context Protocol](https://modelcontextprotocol.io/) |

---

## 標準組織索引 / Standards Organizations Index

| 組織 | 標準 | 引用數 |
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

## 經典書籍參考 / Classic Books Reference

| 書籍 | 作者 | 年份 | 關聯標準 |
|------|------|------|----------|
| Test-Driven Development: By Example | Kent Beck | 2002 | TDD |
| Working Effectively with Legacy Code | Michael Feathers | 2004 | 重構、反向工程 |
| Growing Object-Oriented Software, Guided by Tests | Freeman & Pryce | 2009 | BDD、正向推演 |
| Specification by Example | Gojko Adzic | 2011 | ATDD、正向推演 |
| Refactoring（第二版） | Martin Fowler | 2018 | 重構 |
| Site Reliability Engineering | Google | 2016 | 日誌、效能 |
| Clean Code | Robert C. Martin | 2008 | 程式碼審查、重構 |
| The Pragmatic Programmer（20週年紀念版） | Thomas & Hunt | 2019 | 簽入標準、程式碼品質 |
| Domain-Driven Design | Eric Evans | 2003 | 專案結構、架構 |
| Continuous Delivery | Humble & Farley | 2010 | 簽入標準、Git 工作流程 |
| Release It!（第二版） | Michael Nygard | 2018 | 效能、日誌 |
| The DevOps Handbook | Kim, Humble, Debois, Willis | 2016 | Git 工作流程、測試 |
| Accelerate | Forsgren, Humble, Kim | 2018 | 效能、測試 |
| Building Microservices（第二版） | Sam Newman | 2021 | 專案結構、文件 |
| Object-Oriented Software Construction | Bertrand Meyer | 1988 | 契約設計、正向推演 |

---

## 通用做法分類 / Common Practices Categories

### 測試方法論 / Testing Methodologies
- 紅-綠-重構（TDD）
- Given-When-Then（BDD）
- 三方會談（ATDD）
- 測試金字塔（70/20/10）
- FIRST 原則
- 變異測試

### 版本控制 / Version Control
- Conventional Commits
- Semantic Versioning
- Keep a Changelog
- GitFlow / GitHub Flow / 主幹開發

### 程式碼品質 / Code Quality
- 童子軍規則
- 預備重構
- 絞殺者模式
- 防腐層

### API 設計 / API Design
- RFC 7807 Problem Details
- OpenAPI 3.1
- 契約設計

### 可觀測性 / Observability
- 12 Factor App Logs
- OpenTelemetry
- RED/USE/黃金信號

---

## UDS 原創貢獻 / UDS Original Contributions

以下標準為 UDS 對業界的原創貢獻：

| 標準 | 創新點 |
|------|--------|
| 反幻覺指南 | 首個系統化的 AI 協作準確性框架 |
| 規格驅動開發 | AI 時代的規格方法論 |
| AI 指令檔案規範 | 系統化的 AI 工具配置模式 |
| AI 友善架構 | 為 AI 協作優化的架構模式 |
| AI 協議標準 | 正式的 AI 任務委派協議 |
| 虛擬組織標準 | AI 代理編排框架 |

---

## 版本歷史 / Version History

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.1 | 2025-02-02 | 修正：更正為 29 項標準，補充 9 本書籍參考 |
| 1.0.0 | 2025-02-02 | 初始發布 |
