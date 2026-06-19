---
source: ../../../../skills/dev-methodology/guide.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-06-10
source_hash: cf9cbf22df6f
status: current
scope: partial
description: |
  管理並引導開發者完成當前的開發方法論（methodology）工作流程。
  使用時機：需要 TDD、BDD、SDD、ATDD 或自訂方法論工作流程時。
  關鍵字：methodology、workflow、TDD、BDD、SDD、ATDD、phase、checkpoint、開發流程。
---

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

# Methodology System Skill

> **語言**：[English](../../../../skills/dev-methodology/guide.md) | 繁體中文

**版本**：2.0.0
**最後更新**：2026-01-25

---

## 概觀

Methodology System 為採用 Universal Development Standards 的專案提供一套統一的開發方法論管理框架。

### 兩套獨立系統

```
┌────────────────────────────────────────────────────────────────────────────┐
│                  Two Independent Methodology Systems                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  System A: SDD (AI-Era Methodology)                                        │
│  ─────────────────────────────────────                                     │
│  /sdd → Review → /derive-all → Implementation → Verification               │
│  Best for: New projects, AI-assisted development, greenfield features     │
│                                                                            │
│  System B: Double-Loop TDD (Traditional)                                   │
│  ─────────────────────────────────────                                     │
│  /bdd (Outer Loop) → /tdd (Inner Loop) → Demo                              │
│  Best for: Legacy systems, manual development, established codebases      │
│                                                                            │
│  Optional Input: ATDD Workshop                                             │
│  ─────────────────────────────────────                                     │
│  Stakeholder collaboration that feeds into EITHER system                   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 支援的方法論

**System A：SDD（Spec-Driven Development）**
- Discuss → Proposal → Review → Forward Derivation → Implementation → Verification → Archive
- 以規格（spec）作為權威來源的 AI 原生工作流程

**System B：Double-Loop TDD**
- **BDD**（外迴圈 Outer Loop）- Discovery → Formulation → Automation
- **TDD**（內迴圈 Inner Loop）- Red → Green → Refactor

**選用輸入**
- **ATDD** - Acceptance Test-Driven Development 工作坊（可饋入任一系統）

**Custom** - 使用者自訂的方法論

---

## 功能

### 1. 階段感知引導（Phase-Aware Guidance）

AI 會自動追蹤當前階段，並提供符合情境的引導：

```
┌─────────────────────────────────────────────┐
│ 📋 Current Methodology: TDD                  │
│ 📍 Current Phase: 🔴 RED (1-5 min)           │
│                                             │
│ Checklist:                                  │
│   ✅ Test describes behavior                │
│   ✅ Test name is clear                     │
│   ⬜ Test follows AAA pattern               │
│   ⬜ Test fails when run                    │
│                                             │
│ Next: Write the test following AAA pattern  │
└─────────────────────────────────────────────┘
```

### 2. 檢查點提醒（Checkpoint Reminders）

依據方法論觸發條件自動提醒：

- **Phase Transition（階段轉換）**：階段完成時建議提交（commit）
- **Accumulation Warning（累積警告）**：變更超過門檻時提出警告
- **Skip Warning（略過警告）**：連續略過 check-in 後提出警示

### 3. 方法論切換（Methodology Switching）

隨著專案需求變化，在不同方法論之間切換：

```
/methodology switch bdd
```

### 4. 自訂方法論支援（Custom Methodology Support）

在 `.standards/methodologies/` 中定義團隊專屬的工作流程：

```yaml
id: my-team-workflow
name: My Team Workflow
phases:
  - id: plan
    name: Planning
    checklist:
      - id: requirements-clear
        text: Requirements understood
        required: true
```

---

## 指令

| 指令 | 說明 |
|---------|-------------|
| `/methodology` | 顯示當前方法論狀態 |
| `/methodology switch <id>` | 切換至不同的方法論 |
| `/methodology phase [phase]` | 顯示或變更當前階段 |
| `/methodology checklist` | 顯示當前階段的檢查清單 |
| `/methodology skip` | 略過當前階段（附帶警告） |
| `/methodology list` | 列出可用的方法論 |
| `/methodology create` | 建立自訂方法論 |

---

## 設定

方法論設定儲存於 `.standards/manifest.json`：

```json
{
  "methodology": {
    "active": "tdd",
    "available": ["tdd", "bdd", "sdd", "atdd"],
    "config": {
      "tdd": {
        "checkpointsEnabled": true,
        "reminderIntensity": "suggest",
        "skipLimit": 3
      }
    }
  }
}
```

### 設定選項

| 選項 | 值 | 說明 |
|--------|--------|-------------|
| `active` | methodology id | 當前啟用的方法論 |
| `checkpointsEnabled` | `true`/`false` | 啟用檢查點提醒 |
| `reminderIntensity` | `suggest`/`warning`/`strict` | 強制執行檢查點的強度 |
| `skipLimit` | 數字 | 提出警告前可連續略過的次數 |

---

## AI 行為

### 偵測（Detection）

1. 檢查 `.standards/manifest.json` 中的 `methodology.active`
2. 從以下位置載入方法論定義：
   - 內建：`methodologies/{id}.methodology.yaml`
   - 自訂：`.standards/methodologies/{id}.methodology.yaml`

### 階段追蹤（Phase Tracking）

- 依據觸發條件追蹤當前階段
- 在符合退出條件時更新階段
- 提供階段專屬的引導與檢查清單

### 情境關鍵字（Context Keywords）

當偵測到下列關鍵字時，AI 會自動啟用對應的方法論情境：

| 系統 | 方法論 | 關鍵字 |
|--------|-------------|----------|
| A: SDD | SDD | specification, spec first, proposal, derive tests, forward derivation |
| B: Double-Loop | BDD（外迴圈） | given when then, gherkin, cucumber, scenario, discovery |
| B: Double-Loop | TDD（內迴圈） | test first, red green refactor, failing test |
| Input | ATDD | acceptance test, user story, product owner, workshop |

---

## 與其他標準的整合

### Check-in Standards

當某階段完成時，方法論系統會與 `checkin-standards.md` 整合：

```
Phase GREEN completed.

Changes:
- Files: 3
- Lines: +45 / -2

Suggested commit:
  test(auth): add login validation test
  feat(auth): implement login validation

[1] Commit now  [2] Continue working  [3] View changes
```

### Code Review

依據當前啟用的方法論，會加入額外的審查檢查項目：

- **TDD**：測試遵循命名慣例、每個測試只驗證單一行為
- **BDD**：宣告式風格、可重用的步驟
- **SDD**：變更符合規格、無範疇蔓延（scope creep）
- **ATDD**：所有驗收條件都有對應測試

---

## 相關技能

- [TDD Assistant](../tdd-assistant/SKILL.md) - 詳細的 TDD 引導
- [Spec-Driven Dev](../spec-driven-dev/SKILL.md) - SDD 工作流程
- [Code Review Assistant](../code-review-assistant/SKILL.md) - 審查整合

---

## 檔案

- [integrated-flow.md](../../../../skills/dev-methodology/integrated-flow.md) - 兩套系統的完整工作流程指南
- [runtime.md](./runtime.md) - AI 行為與執行期（runtime）指南
- [create-methodology.md](./create-methodology.md) - 自訂方法論建立精靈

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 2.0.0 | 2026-01-25 | 重構為兩套獨立系統的架構 |
| 1.0.0 | 2026-01-12 | 初版方法論系統 |
