---
name: methodology
scope: partial
description: "[UDS] Manage development methodology workflow"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[action] [argument]"
---

# Methodology System | 方法論系統

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Select and manage the active development methodology for the current project. This skill focuses on **choosing which methodology to use** (SDD, BDD, TDD) and tracking phase progress within the chosen methodology.

選擇並管理當前專案的開發方法論。此技能專注於**選擇使用哪種方法論**（SDD、BDD、TDD）並追蹤所選方法論內的階段進度。

> **Related**: For navigating development phases and finding the right UDS command at each stage, use `/dev-workflow` instead.
>
> **相關**：如需查詢開發階段對應的 UDS 指令，請改用 `/dev-workflow`。

### When to Use `/methodology` vs `/dev-workflow` | 何時使用

| Scenario | `/methodology` | `/dev-workflow` |
|----------|---------------|-----------------|
| Choose SDD vs BDD vs TDD | ✅ | ❌ |
| Switch between methodologies | ✅ | ❌ |
| Track current phase progress | ✅ | ❌ |
| Find the right UDS command for a task | ❌ | ✅ |
| Get step-by-step workflow for new feature / bug fix | ❌ | ✅ |
| Navigate 8 development phases | ❌ | ✅ |

**Two Independent Systems / 兩個獨立系統：**
- **System A: SDD** - Spec-Driven Development (AI-era, spec-first)
- **System B: Double-Loop TDD** - BDD (outer) + TDD (inner) (traditional)

**Optional Input:** ATDD - Acceptance Test-Driven Development (feeds into either system)

## Actions | 動作

| Action | Description | 說明 |
|--------|-------------|------|
| *(none)* / `status` | Show current phase and checklist | 顯示當前階段和檢查清單 |
| `switch <id>` | Switch to different methodology | 切換到不同方法論 |
| `phase [name]` | Show or change current phase | 顯示或變更當前階段 |
| `checklist` | Show current phase checklist | 顯示當前階段檢查清單 |
| `skip` | Skip current phase (with warning) | 跳過當前階段（會有警告） |
| `list` | List available methodologies | 列出可用方法論 |
| `create` | Create custom methodology | 建立自訂方法論 |

## Available Methodologies | 可用方法論

| System | ID | Workflow | 工作流程 |
|--------|-----|---------|---------|
| A: SDD | `sdd` | /sdd -> Review -> /derive-all -> Implementation | 規格優先 |
| B: BDD | `bdd` | Discovery -> Formulation -> Automation | 外部迴圈 |
| B: TDD | `tdd` | Red -> Green -> Refactor | 內部迴圈 |
| Input | `atdd` | Workshop -> Examples -> Tests | 驗收測試驅動 |

## Usage Examples | 使用範例

```bash
/methodology                    # Show current status
/methodology switch sdd         # Switch to Spec-Driven Development
/methodology phase green        # Move to GREEN phase (TDD)
/methodology checklist          # Show current phase checklist
/methodology list               # List all available methodologies
/methodology skip               # Skip current phase (with warning)
/methodology create             # Start custom methodology wizard
```

## Configuration | 配置

Methodology settings are stored in `.standards/manifest.json`:

```json
{
  "methodology": {
    "active": "sdd",
    "available": ["tdd", "bdd", "sdd", "atdd"]
  }
}
```

## Next Steps Guidance | 下一步引導

After `/methodology` completes, the AI assistant should suggest based on the selected methodology:

> **方法論已設定。建議下一步 / Methodology configured. Suggested next steps:**
> - SDD 方法論 → 執行 `/sdd` 建立規格 ⭐ **Recommended / 推薦** — SDD → Run `/sdd` to create spec
> - BDD 方法論 → 執行 `/bdd` 開始場景探索 — BDD → Run `/bdd` to start discovery
> - TDD 方法論 → 執行 `/tdd` 開始紅綠重構 — TDD → Run `/tdd` to start Red-Green-Refactor
> - ATDD 方法論 → 執行 `/atdd` 定義驗收條件 — ATDD → Run `/atdd` to define AC

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/methodology`](../commands/methodology.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/methodology`](../commands/methodology.md#ai-agent-behavior--ai-代理行為)
