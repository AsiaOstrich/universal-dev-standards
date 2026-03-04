# UDS Development Workflow Mapping

> Map software development lifecycle phases to UDS commands and features.
>
> 將軟體開發生命週期階段對應到 UDS 指令與功能。

**Language**: English | [繁體中文](../locales/zh-TW/docs/DEV-WORKFLOW-MAPPING.md)

---

## Overview | 概覽

Universal Development Standards (UDS) provides **20+ slash commands** that cover the entire software development lifecycle. This document maps each development phase to the corresponding UDS commands, helping developers quickly find the right tool for their current task.

UDS 提供 **20+ 斜線指令**，涵蓋整個軟體開發生命週期。本文件將每個開發階段對應到對應的 UDS 指令，幫助開發者快速找到適合目前任務的工具。

### Quick Access | 快速存取

- **Interactive guide**: Use `/dev-workflow` in Claude Code
- **Daily workflow**: See [DAILY-WORKFLOW-GUIDE.md](../adoption/DAILY-WORKFLOW-GUIDE.md)

---

## Software Development Lifecycle × UDS Commands

### Complete Mapping Table | 完整對照表

| # | Phase | UDS Commands | Description |
|---|-------|-------------|-------------|
| I | **Planning & Design** | `/brainstorm` `/requirement` `/sdd` `/reverse` | From idea to specification |
| II | **Test-Driven Development** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | Design tests before code |
| III | **Implementation** | `/refactor` `/reverse` | Write and improve code |
| IV | **Quality Gates** | `/checkin` `/review` | Pre-commit and code review |
| V | **Release & Commit** | `/commit` `/changelog` `/release` | Version, commit, publish |
| VI | **Documentation** | `/docs` `/docgen` `/struct` | Docs and project structure |
| VII | **Tools & Standards** | `/discover` `/guide` | Health checks and reference |
| VIII | **Advanced Analysis** | `/methodology` | Cross-methodology workflows |

---

## Phase Details | 階段詳解

### I. Planning & Design | 需求與設計

Transform ideas into actionable specifications.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/brainstorm` | Structured ideation with HMW, SCAMPER, Six Hats | Vague idea or problem | Evaluated proposals with recommendations |
| `/requirement` | Write INVEST-compliant user stories | Feature concept | User stories with acceptance criteria |
| `/sdd` | Create specification document | Requirements | Technical spec with API, data models, ACs |
| `/reverse` | Reverse engineer existing code | Code path or module | Specs, diagrams, or coverage maps |

### II. Test-Driven Development | 測試驅動開發

Design and structure tests before writing production code.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/bdd` | Behavior-Driven Development | User stories | Gherkin Given/When/Then scenarios |
| `/atdd` | Acceptance Test-Driven Development | Acceptance criteria | Structured acceptance test tables |
| `/tdd` | Test-Driven Development | Feature to implement | Red-Green-Refactor guided workflow |
| `/coverage` | Analyze test coverage | Test suite | Coverage report with gap analysis |
| `/derive` | Auto-derive tests from specs | SDD specification | BDD, TDD, or ATDD test structures |

### III. Implementation | 程式碼開發

Write and improve production code.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/refactor` | Guided refactoring strategies | Code to improve | Refactoring plan with safety checks |
| `/reverse` | Understand code before changes | Code path | Data flow, runtime behavior analysis |

### IV. Quality Gates | 品質保證

Ensure code quality before committing.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/checkin` | Pre-commit quality verification | Staged changes | Pass/fail checklist (build, tests, secrets, style) |
| `/review` | Systematic code review (10 dimensions) | Code diff or PR | Review comments with severity prefixes |

### V. Release & Commit | 版本與提交

Create meaningful commits and manage releases.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/commit` | Conventional Commits format | Staged changes | Formatted commit message |
| `/changelog` | Generate changelog entries | Version range | CHANGELOG.md entries |
| `/release` | Release process management | Version number | Release checklist and automation |

### VI. Documentation & Architecture | 文件與架構

Maintain project documentation and structure.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/docs` | Documentation management | Doc needs | Structured documentation |
| `/docgen` | Auto-generate usage docs | Source code | API docs, usage reference |
| `/struct` | Project structure guide | Project type | Directory conventions |

### VII. Tools & Standards Reference | 工具與標準參考

Access reference guides and project health checks.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/discover` | Project health assessment | Project path | Health score (0-10) with risks |
| `/guide [topic]` | Access any UDS standard | Topic name | Standard reference content |

Available `/guide` topics: `testing`, `error-codes`, `logging`, `git`, `ai-collab`, `ai-instruction`, `ai-arch`

### VIII. Advanced System Analysis | 進階系統分析

Cross-methodology workflows for complex projects.

| Command | What It Does | Input | Output |
|---------|-------------|-------|--------|
| `/methodology` | Orchestrate multi-methodology flows | Workflow type | Guided ATDD→SDD→BDD→TDD pipeline |

---

## Scenario Workflows | 場景化工作流程

### 1. Complete New Feature Development | 完整新功能開發

A full 15-step workflow from idea to release:

```
Step 1:  /brainstorm         Explore ideas and approaches
Step 2:  /requirement        Write user stories
Step 3:  /sdd               Create specification
Step 4:  /derive-bdd        Generate BDD scenarios from spec
Step 5:  /derive-tdd        Generate TDD skeletons from spec
Step 6:  /bdd               Refine BDD scenarios
Step 7:  /tdd               Implement with Red-Green-Refactor
Step 8:  /coverage           Check test coverage
Step 9:  /refactor           Improve code quality
Step 10: /checkin            Verify quality gates
Step 11: /commit             Create conventional commit
Step 12: /review             Code review (if PR)
Step 13: /docs               Update documentation
Step 14: /changelog          Update CHANGELOG
Step 15: /release            Publish release
```

### 2. Bug Fix | 修復錯誤

```
Step 1:  /discover           Assess affected area
Step 2:  /reverse            Understand existing behavior
Step 3:  /tdd               Write failing test → fix → verify
Step 4:  /checkin            Verify quality gates
Step 5:  /commit             Commit with "fix(...)" prefix
```

### 3. Code Refactoring | 程式碼重構

```
Step 1:  /discover           Assess project health
Step 2:  /reverse            Document current behavior
Step 3:  /coverage           Ensure test safety net
Step 4:  /refactor           Apply refactoring strategies
Step 5:  /checkin            Verify nothing broke
Step 6:  /commit             Commit with "refactor(...)" prefix
```

### 4. Brownfield Feature Addition | 既有專案新增功能

```
Step 1:  /discover           Assess project health and risks
Step 2:  /reverse spec       Reverse engineer existing code to specs
Step 3:  /sdd               Write spec for new feature
Step 4:  /derive             Generate tests from spec
Step 5:  /tdd               Implement with test protection
Step 6:  /checkin            Verify quality gates
Step 7:  /commit             Create conventional commit
```

---

## Relationship to Other Guides | 與其他指南的關係

| Document | Focus | Audience |
|----------|-------|----------|
| **This document** (DEV-WORKFLOW-MAPPING.md) | Phase-to-command mapping, quick reference | Developers looking for the right command |
| [DAILY-WORKFLOW-GUIDE.md](../adoption/DAILY-WORKFLOW-GUIDE.md) | Detailed daily workflow with decision trees | Developers learning UDS adoption patterns |
| [CHEATSHEET.md](CHEATSHEET.md) | All UDS features in one page | Quick lookup |
| `/dev-workflow` skill | Interactive guide in Claude Code | AI-assisted development |

---

## Quick Decision Guide | 快速決策指南

**"I need to..."**

| Need | Command |
|------|---------|
| Start from a vague idea | `/brainstorm` |
| Write requirements | `/requirement` |
| Create a technical spec | `/sdd` |
| Understand existing code | `/reverse` or `/discover` |
| Generate tests from a spec | `/derive` |
| Write tests (BDD style) | `/bdd` |
| Write tests (TDD style) | `/tdd` |
| Check test coverage | `/coverage` |
| Improve code structure | `/refactor` |
| Check before committing | `/checkin` |
| Create a commit message | `/commit` |
| Review code quality | `/review` |
| Update documentation | `/docs` or `/docgen` |
| Prepare a release | `/changelog` then `/release` |
| Look up a standard | `/guide [topic]` |
| Run a full methodology | `/methodology` |

---

📖 [Full Feature Reference](FEATURE-REFERENCE.md) | 🔗 [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)
