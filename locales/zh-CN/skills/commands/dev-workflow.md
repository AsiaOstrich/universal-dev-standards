---
source: ../../../../skills/commands/dev-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
name: dev-workflow
description: "[UDS] Guide for mapping software development phases to UDS commands and features"
argument-hint: "[phase name | scenario | 阶段名称 | 场景]"
---

# 开发工作流程指南

将你目前的开发阶段对应到 UDS 命令。了解在每个阶段应该使用哪些工具。

## 情境感知启动

当调用 `/dev-workflow` 时，AI 助手必须先检查专案的工作流程状态：

### 步骤 1：检查进行中的工作流程

```bash
ls .workflow-state/*.yaml .workflow-state/*.json 2>/dev/null
```

**如果有进行中的工作流程：**

1. 显示进行中的工作流程摘要（名称、阶段、进度）
2. 建议恢复："您有一个进行中的 **{workflow}**，在阶段 **{phase}**。使用 `/{command}` 继续？"
3. 根据当前阶段显示适当的下一步命令

**阶段 → 下一步命令对应：**

| Workflow | Current Phase | Suggested Next Command |
|----------|--------------|----------------------|
| SDD | discuss | `/sdd create` |
| SDD | create | `/sdd review` |
| SDD | review | `/sdd approve` |
| SDD | approve | `/sdd implement` |
| SDD | implement | `/sdd verify` |
| TDD | red | 编写失败测试，然后运行测试 |
| TDD | green | 编写最小代码以通过 |
| TDD | refactor | 清理后使用 `/tdd` 进入下一个循环 |
| BDD | discovery | `/bdd` 以制定场景 |
| BDD | formulation | 编写 `.feature` 文件 |
| BDD | automation | 实作步骤定义 |

**如果没有进行中的工作流程：**

继续显示下方的标准阶段概览。

### 步骤 2：检查活跃规格

```bash
ls docs/specs/SPEC-*.md 2>/dev/null
```

如果存在活跃规格，突出显示并建议适当的工作流程阶段。

---

## 用法

```bash
/dev-workflow                    # 显示完整阶段概览
/dev-workflow planning           # 阶段 I：规划与设计
/dev-workflow testing            # 阶段 II：测试驱动开发
/dev-workflow implementation     # 阶段 III：实作
/dev-workflow quality            # 阶段 IV：质量关卡
/dev-workflow release            # 阶段 V：发布与提交
/dev-workflow docs               # 阶段 VI：文档
/dev-workflow standards          # 阶段 VII：工具与标准
/dev-workflow advanced           # 阶段 VIII：进阶分析
/dev-workflow new-feature        # 场景：新功能工作流程
/dev-workflow bug-fix            # 场景：修复错误工作流程
/dev-workflow refactoring        # 场景：重构工作流程
```

## 快速对照表

| Phase | UDS Commands | 用途 |
|-------|-------------|------|
| **I. 规划** | `/brainstorm` `/requirement` `/sdd` `/reverse` | 需求、规格、逆向工程 |
| **II. 测试** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | 先写测试再写代码 |
| **III. 实作** | `/refactor` `/reverse` | 编写与改善代码 |
| **IV. 质量** | `/checkin` `/review` | 提交前检查与审查 |
| **V. 发布** | `/commit` `/changelog` `/release` | 版本、提交、发布 |
| **VI. 文档** | `/docs` `/docgen` `/struct` | 文档与专案结构 |
| **VII. 标准** | `/discover` `/guide` | 参考指南 |
| **VIII. 进阶** | `/methodology` | 跨方法论工作流程 |

## 常见场景

### 新功能

```
/brainstorm → /requirement → /sdd → /derive → /tdd → /checkin → /commit
```

### 修复错误

```
/discover → /reverse → /tdd → /checkin → /commit
```

### 重构

```
/discover → /reverse → /coverage → /refactor → /checkin → /commit
```

## 参考

- [开发工作流程技能](../dev-workflow-guide/SKILL.md)
- [详细阶段指南](../dev-workflow-guide/workflow-phases.md)
- [日常工作流程指南](../../adoption/DAILY-WORKFLOW-GUIDE.md)
