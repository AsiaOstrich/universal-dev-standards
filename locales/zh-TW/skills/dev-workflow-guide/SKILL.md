---
name: dev-workflow-guide
source: ../../../../skills/dev-workflow-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 5bf83f0db544
status: current
description: "[UDS] 將軟體開發階段對應到 UDS 指令與功能的指南"
---

# 開發工作流程指南

> **語言**: [English](../../../../skills/dev-workflow-guide/SKILL.md) | 繁體中文

將你目前的軟體開發階段對應到正確的 UDS 指令與技能。即時了解在開發的每個階段應該使用哪些工具。

> **相關**：如需選擇或切換開發方法論（SDD、BDD、TDD），請改用 `/methodology`。

## 軟體開發階段總覽

```
I. Planning ──► II. Testing Design ──► III. Implementation ──► IV. Quality Gates
   需求設計          測試驅動開發            程式碼開發              品質保證

V. Release ──► VI. Documentation ──► VII. Standards ──► VIII. Advanced
   版本提交         文件與架構              工具與標準           進階分析
```

### 快速對照表

| 階段 | UDS 指令 | 目的 | 用途 |
|------|----------|------|------|
| **I. 規劃與設計** | `/brainstorm` `/requirement` `/sdd` `/reverse` `/api-design` `/database` | Requirements, specs, API/DB design | 需求、規格、API/DB 設計 |
| **II. 測試驅動開發** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` `/ac-coverage` | Design tests before code | 先寫測試再寫程式 |
| **III. 實作** | `/refactor` `/reverse` `/migrate` `/durable` | Write, improve, and migrate code | 撰寫、改善與遷移程式碼 |
| **IV. 品質關卡** | `/checkin` `/code-review` `/security` `/scan` `/incident` | Quality, security, incident response | 品質、安全、事故回應 |
| **V. 發布與提交** | `/commit` `/changelog` `/release` `/pr` `/ci-cd` | Version, commit, PR, CI/CD | 版本、提交、PR、CI/CD |
| **VI. 文件** | `/docs` `/docgen` | Docs and project structure | 文件與專案結構 |
| **VII. 工具與標準** | `/discover` `/guide` `/metrics` `/audit` | Reference guides, metrics, audit | 參考指南、指標、審計 |
| **VIII. 進階分析** | `/methodology` | Cross-methodology workflows | 跨方法論工作流程 |

## 常見場景

### 場景 1：新功能開發（Greenfield）

從零開始建立新功能的推薦流程：

```
/brainstorm → /requirement → /sdd → /derive → /tdd → /checkin → /commit
```

| 步驟 | 指令 | 做什麼 | 做什麼 |
|------|------|--------|--------|
| 1 | `/brainstorm` | Explore ideas and approaches | 探索想法與方法 |
| 2 | `/requirement` | Write user stories (INVEST criteria) | 撰寫使用者故事 |
| 3 | `/sdd` | Create specification document | 建立規格文件 |
| 4 | `/derive` | Generate test skeletons from spec | 從規格產生測試骨架 |
| 5 | `/tdd` | Implement with Red-Green-Refactor | 用紅綠重構循環實作 |
| 6 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 7 | `/commit` | Create conventional commit | 建立規範化提交 |

### 場景 2：修復錯誤

修復既有程式碼錯誤的推薦流程：

```
/discover → /reverse → /tdd → /checkin → /commit
```

| 步驟 | 指令 | 做什麼 | 做什麼 |
|------|------|--------|--------|
| 1 | `/discover` | Assess affected area health | 評估受影響區域健康度 |
| 2 | `/reverse` | Understand existing code structure | 理解現有程式碼結構 |
| 3 | `/tdd` | Write failing test, then fix | 先寫失敗測試，再修復 |
| 4 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 5 | `/commit` | Create conventional commit | 建立規範化提交 |

### 場景 3：重構

程式碼重構的推薦流程：

```
/discover → /reverse → /coverage → /refactor → /checkin → /commit
```

| 步驟 | 指令 | 做什麼 | 做什麼 |
|------|------|--------|--------|
| 1 | `/discover` | Assess project health and risks | 評估專案健康度與風險 |
| 2 | `/reverse` | Document current behavior | 記錄目前行為 |
| 3 | `/coverage` | Ensure test safety net exists | 確保測試安全網存在 |
| 4 | `/refactor` | Apply refactoring strategies | 套用重構策略 |
| 5 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 6 | `/commit` | Create conventional commit | 建立規範化提交 |

### 場景 4：安全審查

安全審查與漏洞修復的推薦流程：

```
/scan → /security → /checkin → /commit
```

| 步驟 | 指令 | 做什麼 | 做什麼 |
|------|------|--------|--------|
| 1 | `/scan` | Run automated security scans (deps, secrets) | 執行自動化安全掃描 |
| 2 | `/security` | Deep security review (OWASP) | 深入安全審查 |
| 3 | `/checkin` | Verify quality gates | 驗證品質關卡 |
| 4 | `/commit` | Create conventional commit | 建立規範化提交 |

### 場景 5：API 設計與實作

API 設計與實作的推薦流程：

```
/brainstorm → /api-design → /sdd → /derive → /tdd → /pr
```

| 步驟 | 指令 | 做什麼 | 做什麼 |
|------|------|--------|--------|
| 1 | `/brainstorm` | Explore API approaches | 探索 API 方案 |
| 2 | `/api-design` | Design endpoints and schemas | 設計端點與 schema |
| 3 | `/sdd` | Create specification document | 建立規格文件 |
| 4 | `/derive` | Generate test skeletons | 產生測試骨架 |
| 5 | `/tdd` | Implement with tests | 搭配測試實作 |
| 6 | `/pr` | Create pull request | 建立 Pull Request |

## 使用方式

```bash
/dev-workflow                    # Show full phase overview
/dev-workflow planning           # Get Phase I guidance
/dev-workflow testing            # Get Phase II guidance
/dev-workflow new-feature        # Get new feature workflow
/dev-workflow bug-fix            # Get bug fix workflow
/dev-workflow refactoring        # Get refactoring workflow
```

### 支援的參數

| 參數 | 說明 | 說明 |
|------|------|------|
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

## 工作流程行為

呼叫時：

1. **無參數**：顯示完整的階段總覽表，詢問使用者目前在哪個階段
2. **階段參數**：顯示該階段的詳細指引，包含所有相關指令與範例
3. **場景參數**：顯示該場景的推薦逐步工作流程

此技能會從 [workflow-phases.md](./workflow-phases.md) 讀取詳細的階段資訊。

## 下一步引導

`/dev-workflow` 完成後，AI 助手應根據使用者情況建議：

> **工作流程已顯示。建議下一步 / Workflow displayed. Suggested next steps:**
> - 新功能開發 → 執行 `/brainstorm` 探索想法 ⭐ **Recommended / 推薦** — New feature → Run `/brainstorm` to explore ideas
> - 修復錯誤 → 執行 `/discover` 評估受影響區域 — Bug fix → Run `/discover` to assess affected area
> - 重構程式碼 → 執行 `/discover` 評估健康度 — Refactoring → Run `/discover` to assess health
> - 遺留系統 → 執行 `/reverse` 進行系統考古 — Legacy system → Run `/reverse` for system archeology
> - 安全審查 → 執行 `/scan` 掃描漏洞 — Security review → Run `/scan` to find vulnerabilities
> - API 開發 → 執行 `/api-design` 設計端點 — API development → Run `/api-design` to design endpoints
> - 事故回應 → 執行 `/incident` 啟動回應流程 — Incident → Run `/incident` to start response

## 參考

- [詳細階段指引](./workflow-phases.md) - 完整的逐階段參考
- [每日工作流程指南](../../adoption/DAILY-WORKFLOW-GUIDE.md) - 完整的每日工作流程指南
- [功能開發工作流程](../workflows/feature-dev.workflow.yaml) - 自動化功能開發工作流程
- [整合流程工作流程](../workflows/integrated-flow.workflow.yaml) - 完整的 ATDD/SDD/BDD/TDD 工作流程

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.1.0 | 2026-03-24 | 新增 11 個指令、2 個新場景（安全審查、API 設計） |
| 1.0.0 | 2026-03-04 | 初版：8 個開發階段、3 個場景、以階段為基礎的導覽 |

---

## 授權

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
