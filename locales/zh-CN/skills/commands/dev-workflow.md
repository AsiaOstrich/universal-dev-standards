---
source: ../../../../skills/commands/dev-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 9803ce2cc49f
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
| **I. 规划** | `/brainstorm` `/requirement` `/sdd` `/reverse` `/api-design` `/database` | 需求、规格、API/DB 设计 |
| **II. 测试** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` `/ac-coverage` | 先写测试再写代码 |
| **III. 实作** | `/refactor` `/reverse` `/migrate` `/durable` | 编写、改善与迁移代码 |
| **IV. 质量** | `/checkin` `/code-review` `/security` `/scan` `/incident` | 质量、安全、事故响应 |
| **V. 发布** | `/commit` `/changelog` `/release` `/pr` `/ci-cd` | 版本、提交、PR、CI/CD |
| **VI. 文档** | `/docs` `/docgen` | 文档与专案结构 |
| **VII. 标准** | `/discover` `/guide` `/metrics` `/audit` | 参考指南、指标、审计 |
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

### 安全审查

```
/scan → /security → /checkin → /commit
```

### API 设计

```
/brainstorm → /api-design → /sdd → /derive → /tdd → /pr
```

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/dev-workflow` | 先检查 `.workflow-state/`，有活跃工作流程则显示状态，否则展示全阶段概览 |
| `/dev-workflow <phase>` | 展示指定阶段的详细命令和说明 |
| `/dev-workflow <scenario>` | 展示指定场景的推荐工作流程（new-feature / bug-fix / refactoring） |

### 交互脚本

1. 检查 `.workflow-state/` 和 `docs/specs/` 的活跃状态
2. 依据结果决定展示内容

**Decision: 活跃工作流程**
- IF 有进行中的 workflow → 显示状态摘要，建议 resume 命令
- IF 有活跃 spec → 提示 spec 进度，建议下一步
- ELSE → 展示完整阶段概览或指定内容

**Decision: 场景模式**
- IF 指定场景（new-feature / bug-fix / refactoring） → 展示该场景的推荐命令序列
- ELSE → 展示概览表

### 停止点

此命令为纯查询/导引，无需停止点。

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 指定的 phase/scenario 不存在 | 列出可用的 phase 和 scenario |
| `.workflow-state/` 目录不存在 | 跳过活跃工作流程检查，直接展示概览 |

## 参考

- [开发工作流程技能](../dev-workflow-guide/SKILL.md)
- [详细阶段指南](../../../../skills/dev-workflow-guide/workflow-phases.md)
- [日常工作流程指南](../../adoption/DAILY-WORKFLOW-GUIDE.md)
