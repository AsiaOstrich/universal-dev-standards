---
name: dev-workflow
scope: universal
description: "[UDS] Guide for mapping software development phases to UDS commands and features"
allowed-tools: Read, Grep, Glob
argument-hint: "[phase name | scenario | 階段名稱 | 場景]"
---

# Development Workflow Guide | 開發工作流程指南

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/dev-workflow-guide/SKILL.md)

Map your current software development phase to the right UDS commands and skills. Get instant guidance on which tools to use at each stage of development.

將你目前的軟體開發階段對應到正確的 UDS 指令與技能。即時了解在開發的每個階段應該使用哪些工具。

> **Related**: To choose or switch between development methodologies (SDD, BDD, TDD), use `/methodology` instead.
>
> **相關**：如需選擇或切換開發方法論（SDD、BDD、TDD），請改用 `/methodology`。

## Software Development Phases Overview | 軟體開發階段總覽

```
I. Planning ──► II. Testing Design ──► III. Implementation ──► IV. Quality Gates
   需求設計          測試驅動開發            程式碼開發              品質保證

V. Release ──► VI. Documentation ──► VII. Standards ──► VIII. Advanced
   版本提交         文件與架構              工具與標準           進階分析
```

### Quick Reference | 快速對照表

| Phase | UDS Commands | Purpose | 用途 |
|-------|-------------|---------|------|
| **I. Planning & Design** | `/brainstorm` `/requirement` `/sdd` `/reverse` `/api-design` `/database` | Requirements, specs, API/DB design | 需求、規格、API/DB 設計 |
| **II. Test-Driven Development** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` `/ac-coverage` | Design tests before code | 先寫測試再寫程式 |
| **III. Implementation** | `/refactor` `/reverse` `/migrate` `/durable` | Write, improve, and migrate code | 撰寫、改善與遷移程式碼 |
| **IV. Quality Gates** | `/checkin` `/review` `/security` `/scan` `/incident` | Quality, security, incident response | 品質、安全、事故回應 |
| **V. Release & Commit** | `/commit` `/changelog` `/release` `/pr` `/ci-cd` | Version, commit, PR, CI/CD | 版本、提交、PR、CI/CD |
| **VI. Documentation** | `/docs` `/docgen` | Docs and project structure | 文件與專案結構 |
| **VII. Tools & Standards** | `/discover` `/guide` `/metrics` `/audit` | Reference guides, metrics, audit | 參考指南、指標、審計 |
| **VIII. Advanced Analysis** | `/methodology` | Cross-methodology workflows | 跨方法論工作流程 |

## Common Scenarios | 常見場景

### Scenario 1: New Feature (Greenfield) | 新功能開發

Recommended flow for building a new feature from scratch:

從零開始建立新功能的推薦流程：

```
/brainstorm → /requirement → /sdd → /derive → /tdd → /checkin → /commit
```

| Step | Command | What to Do | 做什麼 |
|------|---------|-----------|--------|
| 1 | `/brainstorm` | Explore ideas and approaches | 探索想法與方法 |
| 2 | `/requirement` | Write user stories (INVEST criteria) | 撰寫使用者故事 |
| 3 | `/sdd` | Create specification document | 建立規格文件 |
| 4 | `/derive` | Generate test skeletons from spec | 從規格產生測試骨架 |
| 5 | `/tdd` | Implement with Red-Green-Refactor | 用紅綠重構循環實作 |
| 6 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 7 | `/commit` | Create conventional commit | 建立規範化提交 |

### Scenario 2: Bug Fix | 修復錯誤

Recommended flow for fixing bugs in existing code:

修復既有程式碼錯誤的推薦流程：

```
/discover → /reverse → /tdd → /checkin → /commit
```

| Step | Command | What to Do | 做什麼 |
|------|---------|-----------|--------|
| 1 | `/discover` | Assess affected area health | 評估受影響區域健康度 |
| 2 | `/reverse` | Understand existing code structure | 理解現有程式碼結構 |
| 3 | `/tdd` | Write failing test, then fix | 先寫失敗測試，再修復 |
| 4 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 5 | `/commit` | Create conventional commit | 建立規範化提交 |

### Scenario 3: Refactoring | 重構

Recommended flow for code refactoring:

程式碼重構的推薦流程：

```
/discover → /reverse → /coverage → /refactor → /checkin → /commit
```

| Step | Command | What to Do | 做什麼 |
|------|---------|-----------|--------|
| 1 | `/discover` | Assess project health and risks | 評估專案健康度與風險 |
| 2 | `/reverse` | Document current behavior | 記錄目前行為 |
| 3 | `/coverage` | Ensure test safety net exists | 確保測試安全網存在 |
| 4 | `/refactor` | Apply refactoring strategies | 套用重構策略 |
| 5 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 6 | `/commit` | Create conventional commit | 建立規範化提交 |

### Scenario 4: Security Review | 安全審查

Recommended flow for security review and vulnerability remediation:

安全審查與漏洞修復的推薦流程：

```
/scan → /security → /checkin → /commit
```

| Step | Command | What to Do | 做什麼 |
|------|---------|-----------|--------|
| 1 | `/scan` | Run automated security scans (deps, secrets) | 執行自動化安全掃描 |
| 2 | `/security` | Deep security review (OWASP) | 深入安全審查 |
| 3 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 4 | `/commit` | Create conventional commit | 建立規範化提交 |

### Scenario 5: API Design & Implementation | API 設計與實作

Recommended flow for designing and implementing APIs:

API 設計與實作的推薦流程：

```
/brainstorm → /api-design → /sdd → /derive → /tdd → /pr
```

| Step | Command | What to Do | 做什麼 |
|------|---------|-----------|--------|
| 1 | `/brainstorm` | Explore API approaches | 探索 API 方案 |
| 2 | `/api-design` | Design endpoints and schemas | 設計端點與 schema |
| 3 | `/sdd` | Create specification document | 建立規格文件 |
| 4 | `/derive` | Generate test skeletons | 產生測試骨架 |
| 5 | `/tdd` | Implement with tests | 搭配測試實作 |
| 6 | `/pr` | Create pull request | 建立 Pull Request |

## Usage | 使用方式

```bash
/dev-workflow                    # Show full phase overview
/dev-workflow planning           # Get Phase I guidance
/dev-workflow testing            # Get Phase II guidance
/dev-workflow new-feature        # Get new feature workflow
/dev-workflow bug-fix            # Get bug fix workflow
/dev-workflow refactoring        # Get refactoring workflow
```

### Supported Arguments | 支援的參數

| Argument | Description | 說明 |
|----------|-------------|------|
| `planning` | Phase I: Planning & Design | 需求與設計 |
| `testing` | Phase II: Test-Driven Development | 測試驅動開發 |
| `implementation` | Phase III: Implementation | 程式碼開發 |
| `quality` | Phase IV: Quality Gates | 品質保證 |
| `release` | Phase V: Release & Commit | 版本與提交 |
| `docs` | Phase VI: Documentation | 文件與架構 |
| `standards` | Phase VII: Tools & Standards | 工具與標準 |
| `advanced` | Phase VIII: Advanced Analysis | 進階系統分析 |
| `new-feature` | Scenario: New feature workflow | 場景：新功能開發 |
| `bug-fix` | Scenario: Bug fix workflow | 場景：修復錯誤 |
| `refactoring` | Scenario: Refactoring workflow | 場景：重構 |
| `security` | Scenario: Security review workflow | 場景：安全審查 |
| `api` | Scenario: API design workflow | 場景：API 設計 |

## Workflow Behavior | 工作流程行為

When invoked:

1. **No arguments**: Display the full phase overview table and ask which phase the user is in
2. **Phase argument**: Show detailed guidance for that specific phase, including all relevant commands with examples
3. **Scenario argument**: Show the recommended step-by-step workflow for that scenario

The skill reads from [workflow-phases.md](./workflow-phases.md) for detailed phase information.

呼叫時：

1. **無參數**：顯示完整的階段總覽表，詢問使用者目前在哪個階段
2. **階段參數**：顯示該階段的詳細指引，包含所有相關指令與範例
3. **場景參數**：顯示該場景的推薦逐步工作流程

## Next Steps Guidance | 下一步引導

After `/dev-workflow` completes, the AI assistant should suggest based on user's situation:

> **工作流程已顯示。建議下一步 / Workflow displayed. Suggested next steps:**
> - 新功能開發 → 執行 `/brainstorm` 探索想法 ⭐ **Recommended / 推薦** — New feature → Run `/brainstorm` to explore ideas
> - 修復錯誤 → 執行 `/discover` 評估受影響區域 — Bug fix → Run `/discover` to assess affected area
> - 重構程式碼 → 執行 `/discover` 評估健康度 — Refactoring → Run `/discover` to assess health
> - 遺留系統 → 執行 `/reverse` 進行系統考古 — Legacy system → Run `/reverse` for system archeology
> - 安全審查 → 執行 `/scan` 掃描漏洞 — Security review → Run `/scan` to find vulnerabilities
> - API 開發 → 執行 `/api-design` 設計端點 — API development → Run `/api-design` to design endpoints
> - 事故回應 → 執行 `/incident` 啟動回應流程 — Incident → Run `/incident` to start response

## References | 參考

- [Detailed Phase Guide](./workflow-phases.md) - Complete phase-by-phase reference
- [Daily Workflow Guide](../../adoption/DAILY-WORKFLOW-GUIDE.md) - Comprehensive daily workflow guide
- [Feature Development Workflow](../workflows/feature-dev.yaml) - Automated feature dev workflow
- [Integrated Flow Workflow](../workflows/integrated-flow.yaml) - Full ATDD/SDD/BDD/TDD workflow

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-03-24 | Add 11 new commands, 2 new scenarios (Security Review, API Design) |
| 1.0.0 | 2026-03-04 | Initial: 8 development phases, 3 scenarios, phase-based navigation |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
