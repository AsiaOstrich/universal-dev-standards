---
name: methodology
source: ../../../../skills/dev-methodology/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-09
source_hash: e7e6aae82545
status: current
scope: partial
description: |
  [UDS] /methodology: 选择并追踪开发方法论（SDD/BDD/TDD）。
  Use when: 选择方法论、切换开发模式、查询当前方法论状态。
  若要查询各阶段对应命令请用 /dev-workflow。
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[动作] [参数]"
---

# 方法论系统

> **语言**: [English](../../../../skills/dev-methodology/SKILL.md) | 简体中文

> [!WARNING]
> **实验性功能**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。

选择并管理当前项目启用的开发方法论。本技能专注于**选择使用哪种方法论**（SDD、BDD、TDD），并追踪所选方法论内的阶段进度。

> **相关**：如需查询开发阶段对应的 UDS 命令，请改用 `/dev-workflow`。

### 何时使用 `/methodology` 与 `/dev-workflow`

| 场景 | `/methodology` | `/dev-workflow` |
|------|---------------|-----------------|
| 在 SDD / BDD / TDD 之间选择 | ✅ | ❌ |
| 切换不同方法论 | ✅ | ❌ |
| 追踪当前阶段进度 | ✅ | ❌ |
| 找出某个任务该用的 UDS 命令 | ❌ | ✅ |
| 取得新功能 / Bug 修复的逐步流程 | ❌ | ✅ |
| 浏览 8 个开发阶段 | ❌ | ✅ |

**两个独立系统：**
- **System A：SDD** — 规格驱动开发（AI 时代，spec-first）
- **System B：双循环 TDD** — BDD（外圈）+ TDD（内圈）（传统）

**可选输入：** ATDD — 验收测试驱动开发（可馈入任一系统）

## 动作

| 动作 | 说明 |
|------|------|
| *(无)* / `status` | 显示当前阶段与检查清单 |
| `switch <id>` | 切换到不同方法论 |
| `phase [name]` | 显示或变更当前阶段 |
| `checklist` | 显示当前阶段检查清单 |
| `skip` | 跳过当前阶段（会出现警告） |
| `list` | 列出可用方法论 |
| `create` | 创建自定义方法论 |

## 可用方法论

| 系统 | ID | 工作流程 | 说明 |
|------|-----|----------|------|
| A: SDD | `sdd` | /sdd → 审查 → /derive-all → 实现 | 规格优先 |
| B: BDD | `bdd` | Discovery → Formulation → Automation | 外部循环 |
| B: TDD | `tdd` | Red → Green → Refactor | 内部循环 |
| 输入 | `atdd` | Workshop → Examples → Tests | 验收测试驱动 |

## 使用示例

```bash
/methodology                    # 显示当前状态
/methodology switch sdd         # 切换至规格驱动开发
/methodology phase green        # 移动到 GREEN 阶段（TDD）
/methodology checklist          # 显示当前阶段检查清单
/methodology list               # 列出所有可用方法论
/methodology skip               # 跳过当前阶段（会出现警告）
/methodology create             # 启动自定义方法论向导
```

## 配置

方法论设置存储于 `.standards/manifest.json`：

```json
{
  "methodology": {
    "active": "sdd",
    "available": ["tdd", "bdd", "sdd", "atdd"]
  }
}
```

## 下一步引导

`/methodology` 完成后，AI 助手应依所选方法论建议下一步：

> **方法论已设置。建议下一步：**
> - SDD 方法论 → 执行 `/sdd` 创建规格 ⭐ **推荐**
> - BDD 方法论 → 执行 `/bdd` 开始场景探索
> - TDD 方法论 → 执行 `/tdd` 开始红绿重构
> - ATDD 方法论 → 执行 `/atdd` 定义验收条件

## 参考

- 详细指南：[guide.md](./guide.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/methodology`](../../../../skills/commands/methodology.md#ai-agent-behavior--ai-代理行為)
