---
source: ../../../core/pipeline-integration-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
---

# Pipeline 整合标准

> **语言**: [English](../../../core/pipeline-integration-standards.md) | 简体中文

**适用范围**: 所有使用自动化开发 Pipeline 的软件项目
**Scope**: universal

---

## 概述

Pipeline 整合标准定义自动化开发 Pipeline 应如何读取项目配置、执行开发阶段，以及根据项目情境调整行为。本标准为 AI 辅助及 CI/CD 驱动的开发工作流程提供一套与语言、框架无关的通用模型。

## 参考资料

| 标准／来源 | 内容 |
|-----------|------|
| ISO/IEC 12207 | 软件生命周期流程 |
| ISO/IEC 15504 (SPICE) | 流程评估 |
| Continuous Delivery（Jez Humble） | Pipeline 设计原则 |
| DORA Metrics | 部署频率、前置时间、MTTR、变更失败率 |

---

## 配置契约

### UDS 配置区块

使用自动化 Pipeline 的项目必须在标准配置区块中声明其 Pipeline 偏好。配置区块通常放置于项目的 manifest 文件中（例如 `manifest.json`、`uds.config.json` 或等效文件）。

### 标准开关名称

| 开关 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `autoSpecGeneration` | boolean | false | 自动从 PRD／用户故事产生 SDD 规格 |
| `autoDerive` | boolean | false | 规格核准后自动衍生 BDD／TDD／ATDD |
| `autoTDD` | boolean | false | 衍生完成后自动进入 TDD RED 阶段 |
| `autoCheckin` | boolean | false | 所有品质关卡通过后自动提交 |
| `autoBatch` | boolean | false | 自动批次累积待提交的变更 |

### 开关语义

每个开关控制特定的 Pipeline 行为：

| 开关 | 开启时 | 关闭时 |
|------|--------|--------|
| `autoSpecGeneration` | Pipeline 从输入产生规格草稿并提交审查 | 需手动创建规格 |
| `autoDerive` | 规格核准后 Pipeline 自动执行衍生（BDD／TDD／ATDD） | 通过命令手动衍生 |
| `autoTDD` | 衍生完成后 Pipeline 设定 RED 状态并创建测试骨架 | 开发者手动进入 TDD |
| `autoCheckin` | 所有关卡通过（测试、lint、覆盖率）后 Pipeline 自动提交 | 开发者手动提交 |
| `autoBatch` | Pipeline 累积变更并在达到阈值时合并 | 每次变更个别提交 |

### 配置范例

```json
{
  "pipeline": {
    "autoSpecGeneration": true,
    "autoDerive": true,
    "autoTDD": true,
    "autoCheckin": false,
    "autoBatch": false,
    "context": "greenfield"
  }
}
```

### 配置读取规则

1. **安全默认值**：所有开关默认为 OFF（手动模式）
2. **明确声明**：Pipeline 必须在读取配置后才能确定开关状态，不得假设
3. **运行时覆写**：CLI flag 或环境变量可覆写文件式配置
4. **验证**：Pipeline 在执行前必须验证配置值

---

## Pipeline 阶段模型

### 标准六阶段 Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  1.PLAN  │───▶│  2.SPEC  │───▶│ 3.DERIVE │───▶│ 4.BUILD  │───▶│ 5.REVIEW │───▶│6.CHECKIN │
│ 需求分析  │    │ 规格撰写  │    │ 测试衍生  │    │ 实现构建  │    │ 审查验证  │    │ 提交签入  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 阶段定义

| 阶段 | 输入 | 输出 | 品质关卡 |
|------|------|------|---------|
| **Plan（规划）** | PRD、用户故事、需求 | 结构化需求文档 | 需求已审查 |
| **Spec（规格）** | 需求 | 含验收条件的 SDD 规格 | 规格已核准 |
| **Derive（衍生）** | 已核准的规格 | BDD 场景、TDD 骨架、ATDD 表格 | 1:1 验收条件对应已验证 |
| **Build（构建）** | 测试骨架 ＋ 规格 | 实现代码 | 测试通过（RED→GREEN） |
| **Review（审查）** | 实现 ＋ 测试 | 审查意见 | 审查已核准 |
| **Checkin（签入）** | 已核准的变更 | 已提交的代码 | 所有品质关卡通过 |

### 阶段依赖性

- 每个阶段的输出为下一阶段的输入
- 未经明确配置不得跳过任何阶段
- 品质关卡失败必须阻挡进入下一阶段

---

## 开发情境分类

### 情境类型

| 情境 | 描述 | 典型场景 |
|------|------|---------|
| **Greenfield** | 全新项目或功能，无既有代码 | 新增模块、新服务、新产品 |
| **Brownfield** | 需修改的既有代码库 | 为旧有代码新增功能、重构 |
| **Adhoc** | 小型、独立的变更 | Bug 修复、配置变更、Hotfix |

### 情境策略矩阵

| 阶段 | Greenfield | Brownfield | Adhoc |
|------|-----------|------------|-------|
| **Plan** | 完整需求分析 | 优先进行影响分析 | 快速评估 |
| **Spec** | 完整 SDD | Delta SDD（仅变更部分） | 可选（重大变更才需要） |
| **Derive** | 完整衍生 | 针对性衍生 | 跳过（除非复杂） |
| **Build** | 从零开始 TDD | 修改既有代码 ＋ 新测试 | 直接修复 |
| **Review** | 完整审查 | 聚焦于变更的审查 | 快速审查 |
| **Checkin** | 标准签入 | 标准签入 | 标准签入 |

### 情境自动检测启发式规则

Pipeline 应使用下列信号自动检测情境：

| 信号 | Greenfield 指标 | Brownfield 指标 | Adhoc 指标 |
|------|----------------|----------------|-----------|
| 文件数量 | 无文件或极少文件 | 已建立的代码库 | 不适用 |
| 变更范围 | 新目录／模块 | 修改既有文件 | 变更 1–3 个文件 |
| 测试覆盖率 | 无既有测试 | 既有测试套件 | 既有测试已涵盖该区域 |
| 规格是否存在 | 无规格 | 既有规格 | 可能有也可能没有 |

### 情境覆写

开发者可在配置中明确指定情境：

```json
{
  "pipeline": {
    "context": "brownfield"
  }
}
```

或通过 CLI flag 指定：
```bash
pipeline run --context=greenfield
```

---

## 整合验证

### Pipeline 实现者检查清单

实现本标准的整合者必须验证以下项目：

| 检查项目 | 要求 | 验证方式 |
|---------|------|---------|
| 配置读取 | Pipeline 从配置中读取所有开关 | 单元测试：模拟配置 → 验证行为 |
| 默认值处理 | 未配置的开关默认为 OFF | 单元测试：空配置 → 手动模式 |
| 阶段执行 | 6 个阶段依序执行 | 整合测试：完整 Pipeline 执行 |
| 关卡强制执行 | 失败的关卡阻挡下一阶段 | 整合测试：注入失败 → 验证阻挡 |
| 情境感知 | Pipeline 根据情境类型调整 | 整合测试：各情境 → 验证阶段 |
| 覆写支持 | CLI flag 覆写文件配置 | 单元测试：文件 ＋ flag → flag 优先 |

### 验证规则

1. **配置 Schema 验证**：对照已知开关名称进行验证；对未知键值发出警告
2. **开关类型安全**：所有开关必须为 boolean；拒绝非 boolean 值
3. **情境枚举值**：情境必须为以下其中之一：`greenfield`、`brownfield`、`adhoc`
4. **阶段完整性**：Pipeline 必须报告哪些阶段已执行、哪些已跳过

---

## 反模式

| 反模式 | 影响 | 正确做法 |
|--------|------|---------|
| 硬编码 Pipeline 行为 | 无法适应项目需求 | 在运行时读取配置 |
| 忽略情境类型 | 执行错误的阶段 | 检测或读取情境配置 |
| 跳过品质关卡 | 有问题的代码进入代码库 | 在每个阶段强制执行关卡 |
| 全有或全无的自动化 | 用户完全回避 Pipeline | 允许逐开关的细粒度控制 |
| 静默跳过阶段 | 失去可追踪性 | 记录并报告所有跳过决策 |

---

## 最佳实践

### 应做事项

- ✅ 在执行任何阶段前先读取配置
- ✅ 所有开关默认为 OFF（安全默认值）
- ✅ 在 Pipeline 启动时记录哪些开关为启用状态
- ✅ 报告阶段执行状态（已执行／已跳过／失败）
- ✅ 允许逐阶段的细粒度开关控制
- ✅ 在使用前验证配置 Schema
- ✅ 支持通过 CLI 覆写配置

### 不应做事项

- ❌ 未读取配置即假设开关状态
- ❌ 静默跳过阶段而不记录
- ❌ 忽略品质关卡失败
- ❌ 硬编码 Pipeline 行为
- ❌ 混用情境策略（例如：Greenfield 规格 ＋ Adhoc 构建）

---

## 相关标准

- [规格驱动开发（Spec-Driven Development）](spec-driven-development.md) — Spec 阶段工作流程
- [正向衍生标准（Forward Derivation Standards）](forward-derivation-standards.md) — Derive 阶段实现
- [签入标准（Check-in Standards）](checkin-standards.md) — Checkin 阶段品质关卡
- [变更批次标准（Change Batching Standards）](change-batching-standards.md) — 签入前的批次合并
- [验收条件追踪（Acceptance Criteria Traceability）](acceptance-criteria-traceability.md) — 跨阶段验收条件追踪

---

## 版本历程

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.0.0 | 2026-03-18 | 初始版本 — 配置契约、六阶段 Pipeline 模型、情境分类 |
