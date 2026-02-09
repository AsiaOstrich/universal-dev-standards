---
source: ../../../../skills/commands/methodology.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-12
status: experimental
---

---
description: 管理开发方法論工作流 | Manage development methodology workflow
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
argument-hint: "[action] [argument]"
status: experimental
---

# /methodology 命令

> **Language**: [English](../../../../skills/commands/methodology.md) | 简体中文

> [!WARNING]
> **实驗性功能 / Experimental Feature**
>
> 此功能正在積極开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

管理當前项目的开发方法論。支援 TDD、BDD、SDD、ATDD 和自订方法論。

---

## 动作

| 动作 | 说明 |
|------|------|
| *(無)* | 顯示當前方法論状态 |
| `status` | 顯示當前阶段和检查清单 |
| `switch <id>` | 切换到不同方法論 |
| `phase [name]` | 顯示或变更當前阶段 |
| `checklist` | 顯示當前阶段检查清单 |
| `skip` | 跳過當前阶段（会有警告） |
| `list` | 列出可用方法論 |
| `create` | 建立自订方法論 |

---

## 使用方式

### 顯示状态

```bash
/methodology
/methodology status
```

**输出：**
```
┌────────────────────────────────────────────────┐
│ 📋 啟用的方法論: TDD                            │
│ 📍 當前阶段: 🔴 紅燈 (1-5 分鐘)                 │
│ ⏱️  持續时间: 3 分鐘                            │
├────────────────────────────────────────────────┤
│ 检查清单：                                      │
│   ✅ 测试描述预期行为                           │
│   ✅ 测试名称清晰                               │
│   ⬜ 测试遵循 AAA 模式                          │
│   ⬜ 测试执行失败                               │
├────────────────────────────────────────────────┤
│ 下一步：完成检查清单，然後执行测试              │
└────────────────────────────────────────────────┘
```

### 切换方法論

```bash
/methodology switch sdd
/methodology switch bdd
/methodology switch my-custom-workflow
```

**输出：**
```
切换方法論：TDD → SDD

⚠️ 警告：您有未提交的变更。
   當前阶段：綠燈
   变更的文件：3

选项：
[1] 先提交变更，然後切换
[2] 暫存变更并切换
[3] 直接切换（保留变更）
[4] 取消

> 1

正在提交变更...
已切换到：SDD（規格驅动开发）
當前阶段：提案
```

### 变更阶段

```bash
/methodology phase              # 顯示當前阶段
/methodology phase green        # 移动到綠燈阶段 (TDD)
/methodology phase refactor     # 移动到重構阶段
```

### 顯示检查清单

```bash
/methodology checklist
```

**输出：**
```
📋 紅燈阶段检查清单 (TDD)

必填：
  ⬜ 测试描述预期行为
  ✅ 测试名称清楚说明测试内容
  ⬜ 测试遵循 AAA 模式（Arrange-Act-Assert）
  ⬜ 测试执行时失败
  ⬜ 失败是正确的原因

選填：
  ⬜ 测试只有一个斷言

进度：1/5 必填项目完成
```

### 跳過阶段

```bash
/methodology skip
```

**输出：**
```
⚠️ 跳過阶段警告

您即將跳過紅燈阶段，尚未完成：
  ⬜ 测试遵循 AAA 模式
  ⬜ 测试执行时失败

这是警告前的第 2 次跳過（共 3 次）。

确定要跳過嗎？
[1] 是，跳過此阶段
[2] 否，繼續完成检查清单
```

### 列出方法論

```bash
/methodology list
```

**输出：**
```
📚 可用的方法論

內建：
  ├─ tdd    测试驅动开发（紅燈 → 綠燈 → 重構）
  ├─ bdd    行为驅动开发（Given-When-Then）
  ├─ sdd    規格驅动开发（規格優先、程序码其次）
  └─ atdd   驗收测试驅动开发

自订（.standards/methodologies/）：
  └─ my-team-workflow   我們团队的开发流程

啟用中：tdd ✓

使用 '/methodology switch <id>' 來变更。
```

### 建立自订

```bash
/methodology create
```

啟动互动式方法論建立精靈。詳見[建立自订方法論](../methodology-system/create-methodology.md)。

---

## 配置

方法論设置储存在 `.standards/manifest.json`：

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

### 透過 /config 配置

您也可以使用以下命令配置方法論设置：

```bash
/config methodology
```

---

## 範例

### 为功能啟动 TDD

```bash
# 啟用 TDD 方法論
/methodology switch tdd

# 或直接使用 TDD 命令（自动啟用 TDD）
/tdd "验证用戶郵箱格式"
```

### 开发過程中检查进度

```bash
# 检查當前状态
/methodology status

# 檢视检查清单
/methodology checklist

# 如果准备好了，移动到下一个阶段
/methodology phase green
```

### 为重大变更切换到 SDD

```bash
# 切换到規格驅动以进行架構变更
/methodology switch sdd

# 这会啟动 提案 → 审查 → 实作 流程
```

---

## 相关命令

| 命令 | 说明 |
|------|------|
| `/tdd` | 啟动 TDD 工作流（啟用 TDD 方法論） |
| `/sdd` | 啟动 SDD 工作流（啟用 SDD 方法論） |
| `/config methodology` | 配置方法論设置 |

---

## 參考

- [方法論系统 Skill](../methodology-system/SKILL.md) - 完整 skill 文档
- [执行时引導](../methodology-system/runtime.md) - AI 行为規格
- [建立自订方法論](../methodology-system/create-methodology.md) - 自订方法論指南

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初始 /methodology 命令 |
