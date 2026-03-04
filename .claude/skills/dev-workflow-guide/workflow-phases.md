# Development Workflow Phases | 開發工作流程階段詳解

> Detailed guide for each software development phase and its corresponding UDS commands.
>
> 每個軟體開發階段及其對應 UDS 指令的詳細指南。

---

## Phase I: Planning & Design | 需求與設計

**Goal**: Transform ideas into actionable specifications before writing any code.

**目標**：在撰寫任何程式碼之前，將想法轉化為可執行的規格。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/brainstorm` | Structured ideation | Starting from a vague idea | 從模糊想法開始 |
| `/requirement` | Write user stories (INVEST) | Defining what to build | 定義要建立什麼 |
| `/sdd` | Create specification document | Before implementation | 實作前 |
| `/reverse` | Reverse engineer existing code | Understanding brownfield codebase | 理解既有程式碼 |

### Typical Flow | 典型流程

```
Idea → /brainstorm → /requirement → /sdd → Ready for Phase II
想法 → /brainstorm → /requirement → /sdd → 準備進入第二階段
```

### When to Use Each | 各指令適用場景

- **`/brainstorm`**: You have an idea but haven't decided on approach yet. Generates HMW questions, evaluates options with SCAMPER or Six Thinking Hats.
- **`/requirement`**: You know what to build but need formal user stories. Outputs INVEST-compliant stories with acceptance criteria.
- **`/sdd`**: You have requirements and need a technical specification. Creates a structured spec document with API design, data models, and acceptance criteria.
- **`/reverse`**: You need to understand existing code before modifying it. Generates specs, BDD scenarios, or TDD coverage maps from existing code.

---

## Phase II: Test-Driven Development | 測試驅動開發

**Goal**: Design and structure tests before writing production code.

**目標**：在撰寫生產程式碼之前設計與建構測試。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/bdd` | Behavior-Driven Development | Writing Gherkin scenarios | 撰寫 Gherkin 場景 |
| `/atdd` | Acceptance Test-Driven Development | Writing acceptance criteria tables | 撰寫驗收標準表 |
| `/tdd` | Test-Driven Development | Red-Green-Refactor cycle | 紅綠重構循環 |
| `/coverage` | Test coverage analysis | Checking coverage gaps | 檢查覆蓋率缺口 |
| `/derive` | Derive tests from specs | Auto-generate test skeletons | 自動產生測試骨架 |

### Typical Flow | 典型流程

```
SDD Spec → /derive → /bdd → /tdd → Tests Ready
SDD 規格 → /derive → /bdd → /tdd → 測試就緒
```

### Derive Sub-commands | Derive 子指令

| Sub-command | Output | 輸出 |
|-------------|--------|------|
| `/derive-bdd` | Gherkin .feature files | Gherkin 場景檔 |
| `/derive-tdd` | Test skeletons (Vitest/Jest/etc.) | 測試骨架 |
| `/derive-atdd` | Acceptance test tables | 驗收測試表 |
| `/derive-all` | All of the above | 以上全部 |

### When to Use Each | 各指令適用場景

- **`/bdd`**: You want to define behavior from the user's perspective using Given/When/Then scenarios.
- **`/atdd`**: You need stakeholder-aligned acceptance criteria in tabular format.
- **`/tdd`**: You're implementing code and want to follow the Red-Green-Refactor cycle.
- **`/coverage`**: You want to identify untested code paths and improve coverage.
- **`/derive`**: You have an SDD spec and want to auto-generate test structures from it.

---

## Phase III: Implementation | 程式碼開發

**Goal**: Write and improve production code with confidence.

**目標**：有信心地撰寫與改善生產程式碼。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/refactor` | Refactoring guidance | Improving code structure | 改善程式碼結構 |
| `/reverse` | Reverse engineer code | Understanding code before changes | 修改前理解程式碼 |

### When to Use Each | 各指令適用場景

- **`/refactor`**: Code works but needs structural improvement. Guides you through extract method, rename, move, and other refactoring patterns with safety checks.
- **`/reverse`**: You're working in unfamiliar code and need to understand data flow, runtime behavior, or module boundaries before making changes.

---

## Phase IV: Quality Gates | 品質保證

**Goal**: Ensure code quality before committing.

**目標**：在提交前確保程式碼品質。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/checkin` | Pre-commit verification | Before every commit | 每次提交前 |
| `/review` | Systematic code review | Before merging PRs | 合併 PR 前 |

### Checkin Verification | 提交前驗證

`/checkin` checks:
- Build compiles successfully
- All tests pass (100% pass rate)
- No hardcoded secrets
- Code follows project standards
- Documentation updated (if applicable)

### Code Review | 程式碼審查

`/review` evaluates 10 dimensions:
1. Functionality
2. Design & Architecture
3. Code Quality
4. Readability
5. Testing
6. Security
7. Performance
8. Error Handling
9. Documentation
10. Dependencies

---

## Phase V: Release & Commit | 版本與提交

**Goal**: Create meaningful commits and manage releases.

**目標**：建立有意義的提交與管理發布。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/commit` | Conventional Commits format | Creating each commit | 建立每次提交 |
| `/changelog` | Generate changelog entries | Before releases | 發布前 |
| `/release` | Release process management | Publishing versions | 發布版本 |

### Commit Message Format | 提交訊息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`

### Release Workflow | 發布流程

```
/changelog → /release → Tag → Push → Publish
```

---

## Phase VI: Documentation & Architecture | 文件與架構

**Goal**: Maintain project documentation and structure.

**目標**：維護專案文件與結構。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/docs` | Documentation management | Creating/updating docs | 建立/更新文件 |
| `/docgen` | Generate usage docs | Auto-generating from code | 從程式碼自動產生 |
| `/struct` | Project structure guide | Organizing directories | 整理目錄結構 |

### When to Use Each | 各指令適用場景

- **`/docs`**: You need to create, update, or organize project documentation following structure standards.
- **`/docgen`**: You want to auto-generate API docs, usage docs, or reference pages from source code.
- **`/struct`**: You need guidance on project directory conventions for your language/framework.

---

## Phase VII: Tools & Standards Reference | 工具與標準參考

**Goal**: Access reference guides and standards.

**目標**：存取參考指南與標準。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/discover` | Project health assessment | Before major changes | 重大變更前 |
| `/guide` | Access all UDS guides | Looking up standards | 查找標準 |
| `/guide testing` | Testing standards | Setting up tests | 設定測試 |
| `/guide error-codes` | Error code standards | Designing error codes | 設計錯誤碼 |
| `/guide logging` | Logging standards | Setting up logging | 設定日誌 |
| `/guide git` | Git workflow guide | Branch/merge decisions | 分支/合併決策 |
| `/guide ai-collab` | AI collaboration standards | Working with AI | 與 AI 協作 |
| `/guide ai-instruction` | AI instruction file standards | Writing CLAUDE.md etc. | 撰寫 CLAUDE.md 等 |
| `/guide ai-arch` | AI-friendly architecture | Designing for AI | 為 AI 設計架構 |

### Discover vs Guide | Discover 與 Guide 的區別

- **`/discover`**: Active analysis of your specific project. Scans code, runs audits, generates health report with scores.
- **`/guide`**: Passive reference lookup. Shows you the standard without analyzing your project.

---

## Phase VIII: Advanced System Analysis | 進階系統分析

**Goal**: Cross-methodology workflows and advanced analysis.

**目標**：跨方法論工作流程與進階分析。

| Command | Purpose | When to Use | 使用時機 |
|---------|---------|-------------|----------|
| `/methodology` | Manage methodology workflows | Complex multi-phase projects | 複雜多階段專案 |

### Methodology System | 方法論系統

The methodology system orchestrates multiple skills together for complex workflows:

- **Integrated Flow**: ATDD → SDD → BDD → TDD in sequence
- **Custom Pipelines**: Define your own methodology combinations

```bash
/methodology               # Show available methodologies
/methodology integrated    # Start integrated ATDD/SDD/BDD/TDD flow
```

---

## Decision Tree: Which Command Should I Use? | 決策樹

```
Start here | 從這裡開始
│
├─ "I have a vague idea"          → /brainstorm
├─ "I know what to build"         → /requirement → /sdd
├─ "I have a spec, need tests"    → /derive
├─ "I'm writing tests"            → /tdd or /bdd
├─ "I'm writing code"             → (just code, or /refactor)
├─ "I'm done coding"              → /checkin → /commit
├─ "I need to review code"        → /review
├─ "I'm preparing a release"      → /changelog → /release
├─ "I need to understand code"    → /reverse or /discover
├─ "I need a reference guide"     → /guide [topic]
└─ "I need a complex workflow"    → /methodology
```
