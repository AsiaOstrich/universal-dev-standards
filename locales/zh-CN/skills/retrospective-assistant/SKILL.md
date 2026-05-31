---
source: ../../../../skills/retrospective-assistant/SKILL.md
source_version: 1.0.0
source_hash: 9c883f05ad7b
translation_version: 1.0.0
last_synced: 2026-06-01
status: current
description: |
  [UDS] 引导 Sprint 与 Release 周期的结构化团队回顾。
  使用时机：迭代结束、发布复盘、流程改善。
  关键字：retrospective, retro, 回顾, 复盘, 持续改善。
---

# 回顾助手

> **语言**: [English](../../../../skills/retrospective-assistant/SKILL.md) | 简体中文

引导结构化的团队回顾，识别改善机会并追踪行动项目。支持 Sprint 和 Release 回顾类型，提供多种引导技法。

## 工作流程

```
PREPARE ──► GATHER ──► ANALYZE ──► DECIDE ──► TRACK
  准备数据    搜集意见    分析归纳    决定行动    追踪落实
```

### 阶段 1：PREPARE（准备）

从 git log、指标和 issue tracker 搜集数据作为讨论基础。

### 阶段 2：GATHER（搜集）

使用结构化技法搜集团队观点。

### 阶段 3：ANALYZE（分析）

分组归纳并识别模式。

### 阶段 4：DECIDE（决定）

选出前 1-3 项改善作为行动项目。

### 阶段 5：TRACK（追踪）

回顾过去的行动项目并追踪新项目。

## 回顾类型

| 类型 | 时机 | 时长 | 焦点 |
|------|------|------|------|
| **Sprint** | 迭代结束 | 30-60 分钟 | 流程、协作、工具 |
| **Release** | 发布之后 | 60-90 分钟 | 质量、指标、跨团队 |

## 引导技法

| 技法 | 适用场景 | 结构 |
|------|---------|------|
| **Start-Stop-Continue** | 快速、默认 | 开始 / 停止 / 继续 |
| **Starfish** | 细致分析 | 更多 / 保持 / 减少 / 开始 / 停止 |
| **4Ls** | 团队建设 | 喜欢 / 学到 / 缺少 / 渴望 |
| **Sailboat** | 可视化、创意 | 风 / 锚 / 礁石 / 岛屿 |

## 指令

| 指令 | 说明 |
|------|------|
| `/retrospective` | 交互式 Sprint 回顾（默认） |
| `/retrospective sprint` | Sprint 回顾 |
| `/retrospective release` | Release 回顾（含指标） |
| `/retrospective actions` | 列出未完成行动项目 |
| `/retrospective --technique starfish` | 使用指定技法 |

## 行动项目格式

| 字段 | 说明 |
|------|------|
| **Action** | 具体描述 |
| **Owner** | 单一负责人 |
| **Due Date** | 预计完成日 |
| **Status** | Open → In Progress → Done |

### 追踪规则

1. 每次回顾**开始**先查看未完成项目
2. 每次回顾最多 **3 项**行动项目
3. 陈旧项目（超过 2 个周期未完成）须重新评估
4. 每项须有**单一负责人**

## 存放

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md    # 索引（可选）
```

## 与其他技能的集成

| 技能 | 集成方式 |
|------|---------|
| `/metrics` | 将指标数据引入 Release 回顾 |
| `/incident` | 事故后建议进行团队回顾 |
| `/adr` | 识别架构问题时建议建立 ADR |
| `/commit` | 以 `docs(retro):` 提交回顾报告 |

## 下一步引导

`/retrospective` 完成后：

> **回顾完成。建议下一步：**
> - 提交回顾报告：`/commit`
> - 为识别的架构决策建立 ADR：`/adr`
> - 在 issue tracker 中追踪行动项目
> - 排定下次回顾

## AI 代理行为

当调用 `/retrospective` 时：

1. **确认类型** — Sprint（默认）或 Release
2. **搜集数据** — 扫描 git log，检查 `docs/retrospectives/` 中过去的行动项目
3. **引导技法** — 默认使用 Start-Stop-Continue，或使用指定技法
4. **生成报告** — 写入 `docs/retrospectives/RETRO-YYYY-MM-DD-[type].md`
5. **查看过去项目** — 检查先前回顾中未完成的行动项目
6. **提供下一步** — 显示上方引导

当调用 `/retrospective actions` 时：
1. 扫描 `docs/retrospectives/` 中所有回顾文件
2. 解析各文件中的行动项目
3. 以表格显示未完成／进行中的项目

## 参考

- 核心规范：[retrospective-standards.md](../../core/retrospective-standards.md)
- 详细指南：[guide.md](./guide.md)
