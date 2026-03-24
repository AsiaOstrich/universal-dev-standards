---
description: [UDS] Manage development methodology workflow
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
argument-hint: "[action] [argument]"
status: experimental
---

# Methodology Command | 方法論命令

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/commands/methodology.md)

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Manage the active development methodology for the current project.

管理當前專案的開發方法論。

**Two Independent Systems / 兩個獨立系統：**
- **System A: SDD** - Spec-Driven Development (AI-era, spec-first)
- **System B: Double-Loop TDD** - BDD (outer) + TDD (inner) (traditional)

**Optional Input / 可選輸入：**
- **ATDD** - Acceptance Test-Driven Development (workshop method, feeds into either system)

---

## Actions | 動作

| Action | Description | 說明 |
|--------|-------------|------|
| *(none)* | Show current methodology status | 顯示當前方法論狀態 |
| `status` | Show current phase and checklist | 顯示當前階段和檢查清單 |
| `switch <id>` | Switch to different methodology | 切換到不同方法論 |
| `phase [name]` | Show or change current phase | 顯示或變更當前階段 |
| `checklist` | Show current phase checklist | 顯示當前階段檢查清單 |
| `skip` | Skip current phase (with warning) | 跳過當前階段（會有警告） |
| `list` | List available methodologies | 列出可用方法論 |
| `create` | Create custom methodology | 建立自訂方法論 |

---

## Usage | 使用方式

### Show Status | 顯示狀態

```bash
/methodology
/methodology status
```

**Output:**
```
┌────────────────────────────────────────────────┐
│ 📋 Active Methodology: TDD                      │
│ 📍 Current Phase: 🔴 RED (1-5 min)              │
│ ⏱️  Duration: 3 minutes                         │
├────────────────────────────────────────────────┤
│ Checklist:                                     │
│   ✅ Test describes behavior                   │
│   ✅ Test name is clear                        │
│   ⬜ Test follows AAA pattern                  │
│   ⬜ Test fails when run                       │
├────────────────────────────────────────────────┤
│ Next: Complete the checklist, then run test    │
└────────────────────────────────────────────────┘
```

### Switch Methodology | 切換方法論

```bash
/methodology switch sdd
/methodology switch bdd
/methodology switch my-custom-workflow
```

**Output:**
```
Switching methodology: TDD → SDD

⚠️ Warning: You have uncommitted changes.
   Current phase: GREEN
   Files changed: 3

Options:
[1] Commit changes first, then switch
[2] Stash changes and switch
[3] Switch anyway (changes preserved)
[4] Cancel

> 1

Committing changes...
Switched to: SDD (Spec-Driven Development)
Current phase: Proposal
```

### Change Phase | 變更階段

```bash
/methodology phase              # Show current phase
/methodology phase green        # Move to GREEN phase (TDD)
/methodology phase refactor     # Move to REFACTOR phase
```

### Show Checklist | 顯示檢查清單

```bash
/methodology checklist
```

**Output:**
```
📋 RED Phase Checklist (TDD)

Required:
  ⬜ Test describes expected behavior
  ✅ Test name clearly states what is being tested
  ⬜ Test follows AAA pattern (Arrange-Act-Assert)
  ⬜ Test FAILS when run
  ⬜ Failure is for the RIGHT reason

Optional:
  ⬜ Test has exactly ONE assertion

Progress: 1/5 required items complete
```

### Skip Phase | 跳過階段

```bash
/methodology skip
```

**Output:**
```
⚠️ Skip Phase Warning

You are about to skip the RED phase without completing:
  ⬜ Test follows AAA pattern
  ⬜ Test FAILS when run

This is skip #2 of 3 before warning.

Are you sure you want to skip?
[1] Yes, skip this phase
[2] No, continue working on checklist
```

### List Methodologies | 列出方法論

```bash
/methodology list
```

**Output:**
```
📚 Available Methodology Systems

System A: SDD (AI-Era)
  └─ sdd    Spec-Driven Development
            /sdd → Review → /derive-all → Implementation

System B: Double-Loop TDD (Traditional)
  ├─ bdd    BDD Outer Loop (Discovery → Formulation)
  └─ tdd    TDD Inner Loop (Red → Green → Refactor)

Optional Input (feeds into either system):
  └─ atdd   ATDD Workshop (stakeholder collaboration)

Custom (.standards/methodologies/):
  └─ my-team-workflow   Our Team's Development Process

Active: sdd (System A) ✓

Use '/methodology switch <id>' to change.
```

### Create Custom | 建立自訂

```bash
/methodology create
```

Starts the interactive methodology creation wizard. See [create-methodology.md](../methodology-system/create-methodology.md) for details.

---

## Configuration | 配置

Methodology settings are stored in `.standards/manifest.json`:

```json
{
  "methodology": {
    "active": "tdd",
    "available": ["tdd", "bdd", "sdd", "atdd", "my-team-workflow"],
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

### Configuration via /config | 透過 /config 配置

You can also configure methodology settings using:

```bash
/config methodology
```

---

## Examples | 範例

### Start TDD for a Feature | 為功能啟動 TDD

```bash
# Activate TDD methodology
/methodology switch tdd

# Or use the TDD command directly (activates TDD automatically)
/tdd "validate user email format"
```

### Review Progress During Development | 開發過程中檢查進度

```bash
# Check current status
/methodology status

# View checklist
/methodology checklist

# If ready, move to next phase
/methodology phase green
```

### Switch to SDD for Major Change | 為重大變更切換到 SDD

```bash
# Switch to spec-driven for architectural changes
/methodology switch sdd

# This activates the Discuss → Proposal → Review → Implementation flow
```

---

## Related Commands | 相關命令

| Command | System | Description |
|---------|--------|-------------|
| `/sdd` | A: SDD | Start SDD spec proposal |
| `/derive-all` | A: SDD | Generate tests from spec |
| `/bdd` | B: Double-Loop TDD | Start BDD outer loop |
| `/tdd` | B: Double-Loop TDD | Start TDD inner loop |
| `/atdd` | Input (both) | Start ATDD workshop |
| `/config methodology` | - | Configure methodology settings |

---

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action | AI 行為 |
|-------|-----------|--------|
| `/methodology` | 顯示當前方法論狀態和 checklist | Show current status |
| `/methodology status` | 同上 | Same as above |
| `/methodology switch <id>` | 檢查未提交變更 → 切換方法論 | Check uncommitted → switch |
| `/methodology phase` | 顯示當前階段 | Show current phase |
| `/methodology phase <name>` | 移動到指定階段 | Move to specified phase |
| `/methodology checklist` | 顯示當前階段的 checklist | Show phase checklist |
| `/methodology skip` | 跳過當前階段（含警告） | Skip phase with warning |
| `/methodology list` | 列出所有可用方法論 | List available methodologies |
| `/methodology create` | 啟動自訂方法論建立精靈 | Start creation wizard |

### Interaction Script | 互動腳本

#### Status / Checklist

1. 讀取 `.standards/manifest.json` 中的 methodology 配置
2. 顯示狀態面板（方法論、階段、checklist 進度）

#### Switch

1. 檢查是否有未提交變更（`git status`）

**Decision: 未提交變更**
- IF 有未提交變更 → 顯示警告，提供 4 選項：Commit first / Stash / Switch anyway / Cancel
- IF 無變更 → 直接切換

🛑 **STOP**: 有未提交變更時等待使用者選擇處理方式

2. 更新 manifest 中的 active methodology
3. 顯示切換結果和新方法論的第一個階段

#### Skip

1. 檢查當前 checklist 未完成項目
2. 顯示警告（含已跳過次數）

🛑 **STOP**: 顯示跳過警告後等待使用者確認

**Decision: 跳過限制**
- IF 已達跳過上限（skipLimit） → 強制顯示嚴重警告
- ELSE → 記錄跳過，進入下一階段

#### Create

1. 啟動互動式精靈，引導使用者定義自訂方法論

🛑 **STOP**: 定義完成後展示方法論結構，等待確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| Switch 有未提交變更 | 使用者選擇處理方式 |
| Skip 確認 | 使用者確認跳過 |
| Create 完成 | 使用者確認寫入自訂方法論 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 方法論未啟用 | 提示執行 `/methodology switch <id>` |
| 指定的方法論不存在 | 列出可用方法論（`/methodology list`） |
| 指定的階段在當前方法論中不存在 | 列出可用階段 |
| manifest 無 methodology 配置 | 提示透過 `/config methodology` 啟用 |

## Reference | 參考

- [Methodology System Skill](../methodology-system/SKILL.md) - Full skill documentation
- [Runtime Guide](../methodology-system/runtime.md) - AI behavior specification
- [Create Custom](../methodology-system/create-methodology.md) - Custom methodology guide

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-25 | Update to reflect two independent systems architecture |
| 1.0.0 | 2026-01-12 | Initial /methodology command |
