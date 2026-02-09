---
source: ../../../../skills/methodology-system/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  管理当前项目的开发方法论，支持 SDD 和双循环 TDD 两个独立系统。
  使用时机：切换方法论、查看当前阶段、管理开发流程。
  关键字：methodology, SDD, TDD, BDD, ATDD, 方法论, 开发流程。
---

# 方法论系统

> **语言**: [English](../../../../skills/methodology-system/SKILL.md) | 简体中文

> [!WARNING]
> **实验性功能**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。

管理当前项目的开发方法论，支持两个独立系统。

**两个独立系统：**
- **系统 A：SDD** - 规格驱动开发（AI 时代、规格优先）
- **系统 B：双循环 TDD** - BDD（外部循环）+ TDD（内部循环）（传统）

**可选输入：** ATDD - 验收测试驱动开发（可作为任一系统的输入）

## 动作

| 动作 | 说明 |
|------|------|
| *(无)* / `status` | 显示当前阶段和检查清单 |
| `switch <id>` | 切换到不同方法论 |
| `phase [name]` | 显示或变更当前阶段 |
| `checklist` | 显示当前阶段检查清单 |
| `skip` | 跳过当前阶段（会有警告） |
| `list` | 列出可用方法论 |
| `create` | 建立自定方法论 |

## 可用方法论

| 系统 | ID | 工作流程 |
|------|-----|---------|
| A：SDD | `sdd` | /sdd -> 审查 -> /derive-all -> 实现 |
| B：BDD | `bdd` | 探索 -> 制定 -> 自动化 |
| B：TDD | `tdd` | 红 -> 绿 -> 重构 |
| 输入 | `atdd` | 工作坊 -> 示例 -> 测试 |

## 使用示例

```
/methodology                    # 显示当前状态
/methodology switch sdd         # 切换到规格驱动开发
/methodology phase green        # 移至 GREEN 阶段（TDD）
/methodology checklist          # 显示当前阶段检查清单
/methodology list               # 列出所有可用方法论
/methodology skip               # 跳过当前阶段（会有警告）
/methodology create             # 启动自定方法论向导
```

## 配置

方法论设置存储在 `.standards/manifest.json`：

```json
{
  "methodology": {
    "active": "sdd",
    "available": ["tdd", "bdd", "sdd", "atdd"]
  }
}
```

## 参考

- 详细指南：[guide.md](./guide.md)
