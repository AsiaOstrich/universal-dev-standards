---
source: ../../../../skills/dev-workflow-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: |
  将软件开发阶段对应到 UDS 命令与技能。
  使用时机：查找适用的 UDS 命令、规划开发流程、新手入门。
  关键字：workflow, development-phases, commands, 工作流程, 开发阶段。
---

# 开发工作流程指南

> **语言**: [English](../../../../skills/dev-workflow-guide/SKILL.md) | 简体中文

将你目前的软件开发阶段对应到正确的 UDS 命令与技能。即时了解在开发的每个阶段应该使用哪些工具。

> **相关**：如需选择或切换开发方法论（SDD、BDD、TDD），请改用 `/methodology`。

## 软件开发阶段总览

```
I. Planning ──► II. Testing Design ──► III. Implementation ──► IV. Quality Gates
   需求设计          测试驱动开发            代码开发              品质保证

V. Release ──► VI. Documentation ──► VII. Standards ──► VIII. Advanced
   版本提交         文档与架构              工具与标准           进阶分析
```

### 快速对照表

| 阶段 | UDS 命令 | 用途 |
|------|---------|------|
| **I. 规划与设计** | `/brainstorm` `/requirement` `/sdd` `/reverse` | 需求、规格、逆向工程 |
| **II. 测试驱动开发** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | 先写测试再写代码 |
| **III. 实现** | `/refactor` `/reverse` | 撰写与改善代码 |
| **IV. 品质关卡** | `/checkin` `/review` | 提交前检查与代码审查 |
| **V. 发布与提交** | `/commit` `/changelog` `/release` | 版本、提交、发布 |
| **VI. 文档** | `/docs` `/docgen` `/struct` | 文档与项目结构 |
| **VII. 工具与标准** | `/discover` `/testing` `/guide` `/git` | 参考指南 |
| **VIII. 进阶分析** | `/methodology` | 跨方法论工作流程 |

## 常见场景

### 场景 1：新功能开发

从零开始构建新功能的推荐流程：

```
/brainstorm → /requirement → /sdd → /derive → /tdd → /checkin → /commit
```

| 步骤 | 命令 | 做什么 |
|------|------|--------|
| 1 | `/brainstorm` | 探索想法与方法 |
| 2 | `/requirement` | 撰写用户故事 |
| 3 | `/sdd` | 创建规格文件 |
| 4 | `/derive` | 从规格产生测试骨架 |
| 5 | `/tdd` | 用红绿重构循环实现 |
| 6 | `/checkin` | 验证品质关卡 |
| 7 | `/commit` | 创建规范化提交 |

### 场景 2：修复错误

修复既有代码错误的推荐流程：

```
/discover → /reverse → /tdd → /checkin → /commit
```

| 步骤 | 命令 | 做什么 |
|------|------|--------|
| 1 | `/discover` | 评估受影响区域健康度 |
| 2 | `/reverse` | 理解现有代码结构 |
| 3 | `/tdd` | 先写失败测试，再修复 |
| 4 | `/checkin` | 验证品质关卡 |
| 5 | `/commit` | 创建规范化提交 |

### 场景 3：重构

代码重构的推荐流程：

```
/discover → /reverse → /coverage → /refactor → /checkin → /commit
```

| 步骤 | 命令 | 做什么 |
|------|------|--------|
| 1 | `/discover` | 评估项目健康度与风险 |
| 2 | `/reverse` | 记录目前行为 |
| 3 | `/coverage` | 确保测试安全网存在 |
| 4 | `/refactor` | 套用重构策略 |
| 5 | `/checkin` | 验证品质关卡 |
| 6 | `/commit` | 创建规范化提交 |

## 使用方式

```bash
/dev-workflow                    # 显示完整阶段总览
/dev-workflow planning           # 获取第一阶段指引
/dev-workflow testing            # 获取第二阶段指引
/dev-workflow new-feature        # 获取新功能工作流程
/dev-workflow bug-fix            # 获取修复错误工作流程
/dev-workflow refactoring        # 获取重构工作流程
```

### 支持的参数

| 参数 | 说明 |
|------|------|
| `planning` | 第一阶段：规划与设计 |
| `testing` | 第二阶段：测试驱动开发 |
| `implementation` | 第三阶段：实现 |
| `quality` | 第四阶段：品质关卡 |
| `release` | 第五阶段：发布与提交 |
| `docs` | 第六阶段：文档 |
| `standards` | 第七阶段：工具与标准 |
| `advanced` | 第八阶段：进阶系统分析 |
| `new-feature` | 场景：新功能开发 |
| `bug-fix` | 场景：修复错误 |
| `refactoring` | 场景：重构 |

## 工作流程行为

调用时：

1. **无参数**：显示完整的阶段总览表，询问用户目前在哪个阶段
2. **阶段参数**：显示该阶段的详细指引，包含所有相关命令与示例
3. **场景参数**：显示该场景的推荐逐步工作流程

## 下一步引导

`/dev-workflow` 完成后，AI 助手应根据用户情况建议：

> **工作流程已显示。建议下一步：**
> - 新功能开发 → 执行 `/brainstorm` 探索想法
> - 修复错误 → 执行 `/discover` 评估受影响区域
> - 重构代码 → 执行 `/discover` 评估健康度
> - 遗留系统 → 执行 `/reverse` 进行系统考古

## 参考

- [详细阶段指南](./workflow-phases.md) - 完整的阶段参考
- [日常工作流程指南](../../../../adoption/DAILY-WORKFLOW-GUIDE.md) - 综合日常工作流程指南
