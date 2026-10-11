---
source: ../../../core/knowledge-transfer-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 7d994f996240
status: current
---

# 知识传承标准

> **语言**: [English](../../../core/knowledge-transfer-standards.md) | [繁體中文](../../zh-TW/core/knowledge-transfer-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有软件项目
**范围**: universal
**参考**: [Atlassian Knowledge Transfer](https://www.atlassian.com/work-management/knowledge-sharing)、[Google re:Work](https://rework.withgoogle.com/)

---

## 概述

本文件定义知识传承标准，涵盖 Onboarding、Handoff、Bus Factor 评估及 Code Tour 机制。目标是确保关键知识不会因团队成员离职或角色转换而消失。

---

## Onboarding 路线图

结构化的 30 天 Onboarding 流程能帮助新团队成员快速产出。

### 4 周计划

| 周次 | 主题 | 目标 | 交付物 |
|------|------|------|--------|
| **第 1 周** | 环境与文化 | 完成开发环境设置；理解团队规范与惯例 | 成功构建并运行项目 |
| **第 2 周** | 架构与代码 | 理解系统架构与关键路径 | 完成 Code Tour |
| **第 3 周** | 流程与工具 | 理解 CI/CD、部署与监控流程 | 完成第一个 PR |
| **第 4 周** | 独立贡献 | 独立完成一个小型任务 | 通过 Buddy 评估 |

### Onboarding 检查清单

每位新团队成员应在第一天及第一周内完成以下检查清单：

| 类别 | 项目 |
|------|------|
| **账号访问** | Git 仓库、CI/CD 平台、监控工具、云端控制台、通讯工具（Slack/Teams） |
| **环境设置** | 开发环境、IDE 配置、VPN 访问、数据库访问、本地构建验证 |
| **文档** | README、架构文档、API 文档、CLAUDE.md 或等效 AI 上下文文件 |
| **会议** | 与 Buddy 1:1、团队介绍、架构概览会议 |
| **首要任务** | 分配 Good First Issue、完成 Code Tour、提交第一个小型 PR |

---

## Handoff 流程

当团队成员即将离职或转换角色时，使用此结构化交接流程以防止知识流失。

### 交接检查清单

| 项目 | 说明 | 时程 |
|------|------|------|
| **负责清单** | 列出此人负责的所有模块、服务与流程 | 离职前 4 周 |
| **隐性知识记录** | 使用下方的知识记录格式，记录所有「只有我知道」的操作、技巧与陷阱 | 离职前 3 周 |
| **WIP 交接** | 移交所有进行中的任务、打开的 PR 与事件追踪项目 | 离职前 2 周 |
| **Buddy 配对** | 指定继任者，并针对复杂领域进行 Pair Programming | 离职前 2 周 |
| **账号与权限移交** | 移交 owner 权限、轮换 API 密钥、更新访问控制 | 离职前 1 周 |
| **Runbook 更新** | 审查并更新所有相关 Runbook，确保其为最新且完整 | 离职前 1 周 |

### 知识记录格式

记录隐性知识时，每条记录应（SHOULD）包含以下 5 个字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| **主题** | 捕捉什么知识 | 「支付网关重试逻辑」 |
| **情境** | 在什么情况下需要此知识 | 「支付因超时错误失败时」 |
| **步骤** | 应遵循的具体程序 | 「1. 检查网关状态页 2. 审查重试队列 3. ...」 |
| **陷阱** | 常见错误与注意事项 | 「绝不重试 4xx 错误；只对 5xx 或超时重试」 |
| **资源** | 代码、文档、Runbook 链接 | 「参见 `src/payment/retry.js`，Runbook：payment-recovery」 |

---

## Bus Factor 评估

Bus Factor 衡量需要多少团队成员「被公交车撞到」（意外离开）才会导致关键知识流失。Bus Factor 为 1 表示只要一人离开，就可能使某个系统领域瘫痪。

### 评估指标

针对每个关键领域或系统区域，评估以下 3 项指标：

| 指标 | 定义 | 风险等级 |
|------|------|---------|
| **知识人数** | 可独立处理该领域的人数 | 1 人 = **高**风险、2 人 = **中**、3+ 人 = **低** |
| **文档覆盖率** | 该领域有书面文档覆盖的百分比 | < 30% = **高**风险、30-70% = **中**、> 70% = **低** |
| **最近知识分享** | 最近一次有人学习该领域距今多久 | > 6 个月 = **高**风险、3-6 个月 = **中**、< 3 个月 = **低** |

### 知识扩散策略

识别出 Bus Factor = 1 的领域时，使用以下一种或多种策略扩散知识：

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **Pair Programming** | 专家与学习者一起处理实际任务 | 复杂逻辑、特殊技巧 |
| **Tech Talk** | 专家以结构化会议向团队讲解 | 架构决策、设计理由 |
| **文档化** | 将隐性知识转为书面文档或 Runbook | 操作程序、部署步骤 |
| **Code Review 轮调** | 轮换审查者，让不同的人审查不同领域 | 代码理解、发现知识孤岛 |
| **On-call 轮调** | 在不同服务之间轮换值班 | 运维知识、事件响应 |

---

## Code Tour

Code Tour 提供贯穿代码库的结构化导览路线，帮助新人无需阅读每个文件即可理解系统。

### 导览路线

每个代码库应（SHOULD）至少定义以下导览路线：

| 路线 | 涵盖内容 | 目标对象 |
|------|---------|---------|
| **Quick Start** | 入口点、主要配置、启动流程 | 所有新人 |
| **Request Flow** | 请求从进入到响应的完整路径 | 后端开发者 |
| **Data Flow** | 数据从创建到存储到检索的路径 | 数据相关开发者 |
| **Deploy Flow** | 从 PR 到生产环境的完整路径 | 需要部署的人 |
| **Key Decisions** | 重要架构决策及其 ADR | 需要理解「为什么」的人 |

### Code Tour 维护

发生代码变更时，评估 Code Tour 是否需要更新：

| 变更类型 | 动作 | 理由 |
|---------|------|------|
| 入口点或路由变更 | **必须（MUST）** 更新导览 | 导览引用会失效或产生误导 |
| 内部重构（接口不变） | **无需更新** | 导览描述的是流程，而非实现细节 |
| 新增重大功能 | **应（SHOULD）** 新增导览路线 | 新功能可能值得拥有独立的导览路径 |

---

## 参考资料

- [Atlassian Knowledge Transfer Guide](https://www.atlassian.com/work-management/knowledge-sharing) — 知识分享最佳实践
- [Google re:Work — Onboarding](https://rework.withgoogle.com/guides/hiring-shape-the-candidate-experience/steps/make-onboarding-a-great-experience/) — 以证据为基础的 Onboarding 实践
- [Bus Factor on Wikipedia](https://en.wikipedia.org/wiki/Bus_factor) — 概念定义与缓解方式

---

**相关标准：**
- [文档生命周期](documentation-lifecycle.md) — 文档维护与审查周期
- [Runbook 标准](runbook-standards.md) — 运维 Runbook 格式与要求

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-31 | 初始发布：Onboarding 路线图、Handoff 流程、Bus Factor 评估、Code Tour |

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
