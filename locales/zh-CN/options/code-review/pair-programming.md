---
source: options/code-review/pair-programming.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Pair Programming

> **语言**: [English](../../../../options/code-review/pair-programming.md) | 简体中文

**上层标准**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## 概览

Pair programming 是一种实时协作的代码审查方式，由两位开发者在同一台工作站上共同作业。一人负责编写代码（Driver），另一人负责审查与引导（Navigator）。此方法能提供即时反馈，并促进知识传递。

## 最适用于

- 需要深入思考的复杂功能
- 知识传递与新人上手
- 关键的代码路径
- 连接质量良好的同地或远程团队
- 资浅开发者的指导

## 角色

### Driver
**编写代码**
- 实现解决方案
- 说明思考过程
- 接纳 navigator 的建议
- 专注于战术层面的实现

### Navigator
**审查与引导**
- 实时审查代码
- 思考更全面的大方向
- 提出改进建议
- 及早抓出错误
- 考虑边界情况

## 配对模式

### Ping Pong

最适合 TDD 工作流程。

1. Driver 编写一个失败的测试
2. 交换角色
3. 新的 driver 让测试通过
4. 新的 driver 编写下一个失败的测试
5. 交换并重复

### Strong-Style

最适合知识传递。

**规则**：“想法要从你的脑袋进到电脑里，必须经过别人的双手”

- Navigator 必须将所有想法说出来
- Driver 只输入 navigator 口述的内容
- 确保完整的知识传递

### Driver-Navigator（传统）

最常见的模式。

1. Driver 专注于战术层面的编码
2. Navigator 进行策略性思考
3. 每 25–30 分钟交换一次
4. 双方都贡献想法

## 会议准则

### 准备
- 为本次会议定义明确目标
- 设置共用的开发环境
- 对配对模式达成共识
- 排除干扰

### 会议进行中
- 每 45–60 分钟休息一次
- 定期交换角色（25–30 分钟）
- 持续沟通
- 保持投入与专注

### 会议结束后
- 简短的回顾
- 记录所做的决策
- Commit 并 push 代码
- 分享学到的心得

## 工具

### 远程配对
| 工具 | 平台 | 功能 |
|------|------|------|
| VS Code Live Share | VS Code | 实时编辑、终端 |
| JetBrains Code With Me | JetBrains IDEs | 完整 IDE 共享 |
| Tuple | macOS | 低延迟、绘图 |
| Screen sharing | 任何平台 | 备援选项 |

### 本地配对
- 一台电脑搭配两组键盘／鼠标
- 大型屏幕或投影机
- 舒适的座位安排

## 规则

| 规则 | 描述 | 优先级 |
|------|------|--------|
| 定期交换 | 每 25–30 分钟交换角色 | Required |
| 口语沟通 | 提出建议前先说明理由 | Required |
| 尊重 driver | 用口语引导，不要抢键盘 | Required |
| 适时休息 | 每 45–60 分钟休息一次 | Recommended |
| 保持投入 | 双方都应保持主动 | Required |

## 与 PR Review 的比较

| 方面 | Pair Programming | PR Review |
|------|------------------|-----------|
| 时机 | 实时 | 异步 |
| 反馈 | 立即 | 延迟 |
| 知识分享 | 高 | 中 |
| 文档化 | 较低 | 较高（PR 评论） |
| 可扩展性 | 受限 | 高 |
| 远程友好度 | 具挑战性 | 容易 |
| 成本 | 较高（2 人） | 较低 |

## 何时使用

### 适合的情境
- 复杂的算法
- 关键的安全性代码
- 新团队成员上手
- 探索不熟悉的代码库
- 设计决策

### 不适合的情境
- 简单、例行的任务
- 个人研究／探索
- 行政性的代码变更
- 任一方感到疲惫时

## 相关选项

- [PR Review](./pr-review.md) - 异步代码审查
- [Automated Review](./automated-review.md) - 工具辅助审查

---

## 参考资料

- [Pair Programming Illuminated](https://www.amazon.com/Pair-Programming-Illuminated-Laurie-Williams/dp/0201745763)
- [Martin Fowler on Pair Programming](https://martinfowler.com/articles/on-pair-programming.html)

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
