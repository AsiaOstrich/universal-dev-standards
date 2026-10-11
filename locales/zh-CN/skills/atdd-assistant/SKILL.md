---
source: ../../../../skills/atdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 97eed4a329dc
status: current
description: |
  [UDS] 验收测试驱动开发（ATDD）的参考资料：INVEST 准则、Gherkin 验收条件格式与 Three Amigos 结构。
  Use when: 与 Product Owner 一起定义验收条件、进行规格工作坊、用 INVEST 检视用户故事。
  Not for: 执行 ATDD 生命周期或强制 PO 签核关卡——该部分已移至采用层（XSPEC-095）；编写单元测试——请用 /tdd。
  Keywords: ATDD, acceptance test, acceptance criteria, INVEST, specification workshop, Three Amigos, 验收测试驱动开发, 验收条件, 规格工作坊.
---

# ATDD 助手

> **语言**: [English](../../../../skills/atdd-assistant/SKILL.md) | 简体中文

> ⚠️ **状态：参考（仅供参考，非可执行流程）** — 5 阶段 ATDD 生命周期协调（WORKSHOP→DISTILLATION→DEVELOPMENT→DEMO→DONE、INVEST 验证、AC→Gherkin 转换、RED/GREEN 执行、PO sign-off gates）已于 2026-04-28 移至 **采用层（adoption layer，XSPEC-095）**。此处保留 INVEST 准则、ATDD 循环图、Gherkin AC 格式、Three Amigos 结构供参考。如需强制执行，请使用采用层的工具链。

引导验收测试驱动开发（ATDD）流程，用于定义和验证用户故事。

## ATDD 循环

```
WORKSHOP ──► DISTILLATION ──► DEVELOPMENT ──► DEMO ──► DONE
    ^                              │              │
    └──────────────────────────────┴──────────────┘
                  (Refinement needed)
```

## 工作流程

> 📖 以下为流程的**参考结构**，非可执行步骤；自动化／强制执行请用采用层工具链（XSPEC-095）。

### 1. WORKSHOP - 定义验收条件
PO 提出用户故事，团队提出澄清问题，共同定义验收条件。

### 2. DISTILLATION - 转换为测试
将验收条件转换为可执行的测试格式，消除歧义，取得 PO 签核。

### 3. DEVELOPMENT - 实现
执行验收测试（初始应失败），使用 BDD/TDD 进行实现，迭代直到全部通过。

### 4. DEMO - 向利害关系人展示
展示通过的验收测试，演示可运作的功能，取得正式验收。

### 5. DONE - 完成
PO 已验收，代码已合并，故事已关闭。

## INVEST 准则

| 准则 | 说明 | Criterion | Description |
|------|------|-----------|-------------|
| **I**ndependent | 可独立开发 | Independent | Can be developed separately |
| **N**egotiable | 可协商细节 | Negotiable | Details can be discussed |
| **V**aluable | 提供商业价值 | Valuable | Delivers business value |
| **E**stimable | 可估算工作量 | Estimable | Can estimate effort |
| **S**mall | 一个 Sprint 可完成 | Small | Fits in one sprint |
| **T**estable | 有明确验收条件 | Testable | Has clear acceptance criteria |

## 用户故事格式

```
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria
- Given [context], when [action], then [result]
```

## 使用方式

- `/atdd` - 启动互动式 ATDD 会话
- `/atdd "user can reset password"` - 针对特定功能进行 ATDD
- `/atdd US-123` - 针对现有用户故事进行 ATDD

## 下一步引导

`/atdd` 完成后，AI 助手应建议：

> **验收测试已定义。建议下一步：**
> - 执行 `/sdd` 建立规格文档 ⭐ **推荐**
> - 执行 `/bdd` 将 AC 转为 Gherkin 场景
> - 执行 `/tdd` 直接实现验收测试

## 参考

- [验收标准撰写指南](./acceptance-criteria-guide.md) — 要撰写或审查验收标准时读它。
- [ATDD 工作流程指南](./atdd-workflow.md) — 要完整跑一轮 ATDD 循环时读它。
- 详细指南：[guide.md](./guide.md)
- 核心规范：[acceptance-test-driven-development.md](../../../../core/acceptance-test-driven-development.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/atdd`](../../../../skills/commands/atdd.md#ai-agent-behavior--ai-代理行為)
