---
description: Manage development methodology workflow
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
argument-hint: [action] [argument]
status: experimental
---

# Methodology Command | 方法論命令

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/commands/methodology.md)

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Manage the active development methodology for the current project. Supports TDD, BDD, SDD, ATDD, and custom methodologies.

管理當前專案的開發方法論。支援 TDD、BDD、SDD、ATDD 和自訂方法論。

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
📚 Available Methodologies

Built-in:
  ├─ tdd    Test-Driven Development (Red → Green → Refactor)
  ├─ bdd    Behavior-Driven Development (Given-When-Then)
  ├─ sdd    Spec-Driven Development (Spec First, Code Second)
  └─ atdd   Acceptance Test-Driven Development

Custom (.standards/methodologies/):
  └─ my-team-workflow   Our Team's Development Process

Active: tdd ✓

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

# This activates the Proposal → Review → Implementation flow
```

---

## Related Commands | 相關命令

| Command | Description |
|---------|-------------|
| `/tdd` | Start TDD workflow (activates TDD methodology) |
| `/spec` | Start SDD workflow (activates SDD methodology) |
| `/config methodology` | Configure methodology settings |

---

## Reference | 參考

- [Methodology System Skill](../methodology-system/SKILL.md) - Full skill documentation
- [Runtime Guide](../methodology-system/runtime.md) - AI behavior specification
- [Create Custom](../methodology-system/create-methodology.md) - Custom methodology guide

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | Initial /methodology command |
