---
source: ../../../skills/README.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-06-20
status: current
---

# 通用開發 Skills

> **語言**: [English](../../../skills/README.md) | 繁體中文

本目錄收錄通用開發標準（UDS）skill 的參考實作。這些 skill 盡可能設計為與工具無關，作為 AI 程式設計助理的「真實來源（Source of Truth）」。

> 衍生自 [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) 核心標準。

> **完整的索引式 skill 清單**（依 Tier、分類與使用情境）請見 **[docs/user/SKILLS-INDEX.md](../../../docs/user/SKILLS-INDEX.md)**（自動產生）。
> 斜線命令參考請見 **[docs/user/COMMANDS-INDEX.md](../../../docs/user/COMMANDS-INDEX.md)**。

## 目錄結構

```
skills/
├── commands/          # 通用斜線命令定義（.md）
├── agents/            # 通用 Agent 定義（.md）
├── workflows/         # 通用 Workflow 定義（.yaml）
├── tools/             # 工具專屬的 adapter 與設定
│   ├── cline/         # Cline (.clinerules)
│   ├── cursor/        # Cursor (.cursorrules)
│   ├── windsurf/      # Windsurf (.windsurfrules)
│   └── copilot/       # GitHub Copilot (instructions.md)
├── _shared/           # 共用範本與工具
└── [skill-name]/      # 個別 skill 定義（例如 git-workflow-guide/）
```

## 通用 Skills 與命令

這些 skill 提供標準指引與工作流程。在支援的工具中（如 Claude Code、OpenCode）可透過斜線命令存取，也可手動引用。

| Skill（資料夾） | 命令 | 描述 |
|----------------|---------|-------------|
| `guide` | `/guide` | [UDS] 存取所有標準指南 |
| `checkin-assistant` | `/checkin` | [UDS] 提交前品質閘門 |
| `commit-standards` | `/commit` | [UDS] Conventional Commits 格式 |
| `code-review-assistant` | `/code-review` | [UDS] 系統化程式碼審查 |
| `tdd-assistant` | `/tdd` | [UDS] 測試驅動開發 |
| `bdd-assistant` | `/bdd` | [UDS] 行為驅動開發 |
| `atdd-assistant` | `/atdd` | [UDS] 驗收測試驅動開發 |
| `e2e-assistant` | `/e2e` | [UDS] 從 BDD 場景產生 E2E 測試骨架 |
| `journey-test-assistant` | `/journey-test` | [UDS] 連貫使用者旅程測試計畫（TESTPLAN）＋ E2E 骨架產生 |
| `release-standards` | `/release` | [UDS] 發行與 Changelog 管理 |
| `documentation-guide` | `/docs` | [UDS] 文件管理 |
| `requirement-assistant` | `/requirement` | [UDS] 需求撰寫 |
| `reverse-engineer` | `/reverse` | [UDS] 逆向工程程式碼 |
| `spec-derivation` | `/derive` | [UDS] 從 spec 推導 BDD/TDD/ATDD 產物 |
| `spec-driven-dev` | `/sdd` | [UDS] 規格驅動開發 |
| `test-coverage-assistant` | `/coverage` | [UDS] 測試覆蓋率分析 |
| `dev-methodology` | `/methodology` | [UDS] 開發方法論 |
| `refactoring-assistant` | `/refactor` | [UDS] 重構指引 |
| `project-discovery` | `/discover` | [UDS] 評估專案健康度與風險 |
| `brainstorm-assistant` | `/brainstorm` | [UDS] 結構化 AI 輔助發想 |
| `changelog-guide` | `/changelog` | [UDS] 產生 changelog 條目 |
| `dev-workflow-guide` | `/dev-workflow` | [UDS] 將開發階段對應到 UDS 命令 |
| `docs-generator` | `/docgen` | [UDS] 產生使用文件 |
| `security-assistant` | `/security` | [UDS] 安全審查與漏洞評估 |
| `security-scan-assistant` | `/scan` | [UDS] 自動化安全掃描與相依稽核 |
| `api-design-assistant` | `/api-design` | [UDS] API 設計（REST、GraphQL、gRPC）|
| `database-assistant` | `/database` | [UDS] 資料庫設計、遷移、查詢最佳化 |
| `ci-cd-assistant` | `/ci-cd` | [UDS] CI/CD 管線設計與最佳化 |
| `incident-response-assistant` | `/incident` | [UDS] 事故回應與事後檢討 |
| `pr-automation-assistant` | `/pr` | [UDS] Pull request 建立與審查自動化 |
| `metrics-dashboard-assistant` | `/metrics` | [UDS] 開發指標與專案健康度 |
| `durable-execution-assistant` | `/durable` | [UDS] 工作流程故障復原與回滾 |
| `migration-assistant` | `/migrate` | [UDS] 程式碼遷移與框架升級 |
| `audit-assistant` | `/audit` | [UDS] 標準合規稽核 |
| `observability-assistant` | `/observability` | [UDS] 可觀測性設定、指標、告警 🆕 |
| `slo-assistant` | `/slo` | [UDS] SLI 選擇、SLO 設定、Error Budget 🆕 |
| `runbook-assistant` | `/runbook` | [UDS] Runbook 建立、演練、覆蓋率 🆕 |
| `skill-builder` | `/skill-builder` | [UDS] 識別重複流程並以正確的開發深度建立 Skill |

> **注意**：參考型指南（如 Git Workflow、Logging、Error Codes）請使用 `/guide` 命令。

## Skill Tier（列出預算最佳化）

> 背景：Claude Code 透過 `skillListingBudgetFraction` 保留一小部分 context（預設 1%）用於列出 skill。當有 40+ 個 UDS skill 加上採用者安裝的 plugin 時，描述可能被截斷。UDS 將 skill 組織為三個 tier，讓採用者可選擇性抑制較少用的描述，同時保持 skill 仍可透過 `/<name>` 呼叫。
>
> 決策與取捨見 [DEC-061](https://github.com/AsiaOstrich/dev-platform/blob/main/cross-project/decisions/DEC-061-uds-skill-listing-budget.md)。參考設定位於 [`examples/skill-overrides-recommended.json`](../../../examples/skill-overrides-recommended.json)。詳細調整：[`docs/skill-budget-tuning.md`](../../../docs/skill-budget-tuning.md)。

### Tier 1 — Core（每日使用）
**列出預設**：`"on"`（顯示完整描述）。永遠可自動探索。

`commit-standards`、`push`、`git-workflow-guide`、`tdd-assistant`、`bdd-assistant`、`testing-guide`、`code-review-assistant`、`refactoring-assistant`、`requirement-assistant`、`spec-driven-dev`、`adr-assistant`、`dev-workflow-guide`、`checkin-assistant`

### Tier 2 — Advanced（每週使用）
**列出預設**：`"on"`（顯示完整描述）。

`atdd-assistant`、`e2e-assistant`、`journey-test-assistant`、`contract-test-assistant`、`security-assistant`、`deploy-assistant`、`ci-cd-assistant`、`error-code-guide`、`logging-guide`、`documentation-guide`、`api-design-assistant`、`database-assistant`、`project-structure-guide`、`ai-instruction-standards`、`release-standards`、`changelog-guide`、`test-coverage-assistant`、`pr-automation-assistant`、`spec-derivation`、`reverse-engineer`、`project-discovery`、`dev-methodology`、`audit-assistant`、`docs-generator`

### Tier 3 — Specialist（每月或事件驅動）
**列出預設**：在參考覆寫中為 `"name-only"`——節省 token；**仍可透過 `/<name>` 呼叫**。

`incident-response-assistant`、`observability-assistant`、`slo-assistant`、`runbook-assistant`、`retrospective-assistant`、`durable-execution-assistant`、`metrics-dashboard-assistant`、`migration-assistant`、`security-scan-assistant`、`brainstorm-assistant`、`skill-builder`

> Tier 的理由與準則：[`flows/skill-tiering-rationale.md`](../../../flows/skill-tiering-rationale.md)。採用者可自由覆寫參考設定（若每日使用某個 Tier 3 skill 可升為 `"on"`，或將任一 skill 降為 `"name-only"`）。

## Tool Adapters

各種 AI 工具的專屬設定位於 `skills/tools/`。

### Claude Code / OpenCode
`skills/` 根目錄下的檔案（commands、agents、workflows）可直接相容於 Claude Code 與 OpenCode。

**安裝（Plugin Marketplace）：**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### Cursor
位於 `skills/tools/cursor/`。
```bash
cp skills/tools/cursor/.cursorrules .cursorrules
```

### Windsurf
位於 `skills/tools/windsurf/`。
```bash
cp skills/tools/windsurf/.windsurfrules .windsurfrules
```

### Cline
位於 `skills/tools/cline/`。
```bash
cp skills/tools/cline/.clinerules .clinerules
```

### GitHub Copilot
位於 `skills/tools/copilot/`。
```bash
mkdir -p .github
cp skills/tools/copilot/copilot-instructions.md .github/copilot-instructions.md
```

## 貢獻

新增 skill 或支援更多 AI 工具的指引，請見 [CONTRIBUTING.template.md](CONTRIBUTING.template.md)。

## 授權

雙重授權：CC BY 4.0（文件）＋ MIT（程式碼）
