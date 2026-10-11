---
source: ../../../../skills/commands/methodology.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 0850287f7a70
status: experimental
---

---
description: [UDS] Manage development methodology workflow
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
argument-hint: "[action] [argument]"
status: experimental
---

# /methodology 命令

> **Language**: [English](../../../../skills/commands/methodology.md) | 简体中文

> [!WARNING]
> **实验性功能 / Experimental Feature**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

管理当前项目的开发方法论。

**两个独立系统：**
- **系统 A：SDD** - 规格驱动开发（AI 时代，规格优先）
- **系统 B：双循环 TDD** - BDD（外循环）+ TDD（内循环）（传统）

**可选输入：**
- **ATDD** - 验收测试驱动开发（工作坊方法，可作为任一系统的输入）

---

## 动作

| 动作 | Description | 说明 |
|------|-------------|------|
| *(无)* | Show current methodology status | 显示当前方法论状态 |
| `status` | Show current phase and checklist | 显示当前阶段和检查清单 |
| `switch <id>` | Switch to different methodology | 切换到不同方法论 |
| `phase [name]` | Show or change current phase | 显示或变更当前阶段 |
| `checklist` | Show current phase checklist | 显示当前阶段检查清单 |
| `skip` | Skip current phase (with warning) | 跳过当前阶段（会有警告） |
| `list` | List available methodologies | 列出可用方法论 |
| `create` | Create custom methodology | 创建自定义方法论 |

---

## 使用方式

### 显示状态

```bash
/methodology
/methodology status
```

**输出：**
```
┌────────────────────────────────────────────────┐
│ 📋 启用的方法论: TDD                            │
│ 📍 当前阶段: 🔴 红灯 (1-5 分钟)                 │
│ ⏱️  持续时间: 3 分钟                            │
├────────────────────────────────────────────────┤
│ 检查清单：                                      │
│   ✅ 测试描述预期行为                           │
│   ✅ 测试名称清晰                               │
│   ⬜ 测试遵循 AAA 模式                          │
│   ⬜ 测试执行失败                               │
├────────────────────────────────────────────────┤
│ 下一步：完成检查清单，然后执行测试              │
└────────────────────────────────────────────────┘
```

### 切换方法论

```bash
/methodology switch sdd
/methodology switch bdd
/methodology switch my-custom-workflow
```

**输出：**
```
切换方法论：TDD → SDD

⚠️ 警告：您有未提交的变更。
   当前阶段：绿灯
   变更的文件：3

选项：
[1] 先提交变更，然后切换
[2] 暂存变更并切换
[3] 直接切换（保留变更）
[4] 取消

> 1

正在提交变更...
已切换到：SDD（规格驱动开发）
当前阶段：提案
```

### 变更阶段

```bash
/methodology phase              # 显示当前阶段
/methodology phase green        # 移动到绿灯阶段 (TDD)
/methodology phase refactor     # 移动到重构阶段
```

### 显示检查清单

```bash
/methodology checklist
```

**输出：**
```
📋 红灯阶段检查清单 (TDD)

必填：
  ⬜ 测试描述预期行为
  ✅ 测试名称清楚说明测试内容
  ⬜ 测试遵循 AAA 模式（Arrange-Act-Assert）
  ⬜ 测试执行时失败
  ⬜ 失败是正确的原因

选填：
  ⬜ 测试只有一个断言

进度：1/5 必填项目完成
```

### 跳过阶段

```bash
/methodology skip
```

**输出：**
```
⚠️ 跳过阶段警告

您即将跳过红灯阶段，尚未完成：
  ⬜ 测试遵循 AAA 模式
  ⬜ 测试执行时失败

这是警告前的第 2 次跳过（共 3 次）。

确定要跳过吗？
[1] 是，跳过此阶段
[2] 否，继续完成检查清单
```

### 列出方法论

```bash
/methodology list
```

**输出：**
```
📚 可用的方法论系统

系统 A：SDD（AI 时代）
  └─ sdd    规格驱动开发
            /sdd → 审查 → /derive-all → 实作

系统 B：双循环 TDD（传统）
  ├─ bdd    BDD 外循环（探索 → 制定）
  └─ tdd    TDD 内循环（红灯 → 绿灯 → 重构）

可选输入（可作为任一系统的输入）：
  └─ atdd   ATDD 工作坊（利害关系人协作）

自定义（.standards/methodologies/）：
  └─ my-team-workflow   我们团队的开发流程

启用中：sdd（系统 A）✓

使用 '/methodology switch <id>' 来变更。
```

### 创建自定义

```bash
/methodology create
```

启动互动式方法论创建向导。详见 [create-methodology.md](../dev-methodology/create-methodology.md)。

---

## 配置

方法论设置储存在 `.standards/manifest.json`：

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

### 通过 /config 配置

您也可以使用以下命令配置方法论设置：

```bash
/config methodology
```

---

## 范例

### 为功能启动 TDD

```bash
# 启用 TDD 方法论
/methodology switch tdd

# 或直接使用 TDD 命令（自动启用 TDD）
/tdd "验证用户邮箱格式"
```

### 开发过程中检查进度

```bash
# 检查当前状态
/methodology status

# 查看检查清单
/methodology checklist

# 如果准备好了，移动到下一个阶段
/methodology phase green
```

### 为重大变更切换到 SDD

```bash
# 切换到规格驱动以进行架构变更
/methodology switch sdd

# 这会启动 讨论 → 提案 → 审查 → 实作 流程
```

---

## 相关命令

| 命令 | 系统 | 说明 |
|------|------|------|
| `/sdd` | A：SDD | 启动 SDD 规格提案 |
| `/derive-all` | A：SDD | 从规格生成测试 |
| `/bdd` | B：双循环 TDD | 启动 BDD 外循环 |
| `/tdd` | B：双循环 TDD | 启动 TDD 内循环 |
| `/atdd` | 输入（两者皆可） | 启动 ATDD 工作坊 |
| `/config methodology` | - | 配置方法论设置 |

---

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 | 说明 |
|------|---------|------|
| `/methodology` | 显示当前方法论状态和 checklist | 显示当前状态 |
| `/methodology status` | 同上 | 同上 |
| `/methodology switch <id>` | 检查未提交变更 → 切换方法论 | 检查未提交变更 → 切换 |
| `/methodology phase` | 显示当前阶段 | 显示当前阶段 |
| `/methodology phase <name>` | 移动到指定阶段 | 移动到指定阶段 |
| `/methodology checklist` | 显示当前阶段的 checklist | 显示阶段检查清单 |
| `/methodology skip` | 跳过当前阶段（含警告） | 跳过阶段（含警告） |
| `/methodology list` | 列出所有可用方法论 | 列出可用方法论 |
| `/methodology create` | 启动自定义方法论创建向导 | 启动创建向导 |

### 交互脚本

#### Status / Checklist

1. 读取 `.standards/manifest.json` 中的 methodology 配置
2. 显示状态面板（方法论、阶段、checklist 进度）

#### Switch

1. 检查是否有未提交变更（`git status`）

**Decision: 未提交变更**
- IF 有未提交变更 → 显示警告，提供 4 个选项：Commit first / Stash / Switch anyway / Cancel
- IF 无变更 → 直接切换

🛑 **STOP**: 有未提交变更时等待用户选择处理方式

2. 更新 manifest 中的 active methodology
3. 显示切换结果和新方法论的第一个阶段

#### Skip

1. 检查当前 checklist 未完成项目
2. 显示警告（含已跳过次数）

🛑 **STOP**: 显示跳过警告后等待用户确认

**Decision: 跳过限制**
- IF 已达跳过上限（skipLimit）→ 强制显示严重警告
- ELSE → 记录跳过，进入下一阶段

#### Create

1. 启动互动式向导，引导用户定义自定义方法论

🛑 **STOP**: 定义完成后展示方法论结构，等待确认写入

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| Switch 有未提交变更 | 用户选择处理方式 |
| Skip 确认 | 用户确认跳过 |
| Create 完成 | 用户确认写入自定义方法论 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 方法论未启用 | 提示执行 `/methodology switch <id>` |
| 指定的方法论不存在 | 列出可用方法论（`/methodology list`） |
| 指定的阶段在当前方法论中不存在 | 列出可用阶段 |
| manifest 无 methodology 配置 | 提示通过 `/config methodology` 启用 |

## 参考

- [方法论系统 Skill](../dev-methodology/SKILL.md) - 完整 skill 文档
- [运行时指南](../dev-methodology/runtime.md) - AI 行为规格
- [创建自定义方法论](../dev-methodology/create-methodology.md) - 自定义方法论指南

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-25 | 更新为两个独立系统架构 |
| 1.0.0 | 2026-01-12 | 初始 /methodology 命令 |
