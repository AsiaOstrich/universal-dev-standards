---
source: docs/specs/system/memory-adoption-strategy.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 记忆采用策略

**状态**: Archived

> **语言**: [English](../../../../../docs/specs/system/memory-adoption-strategy.md) | 简体中文

本文档提供策略指引，帮助跨不同团队规模与运营模式采用 Universal Development Standards (UDS) 的记忆系统。它帮助用户决定如何构建自身的 **Project Context Memory (PCM)** 与 **Developer Persistent Memory (DPM)**，以发挥最大效益。

---

## 1. 决策矩阵

选择最适合你运营模式的策略：

| 策略 | 目标对象 | 存储位置 | 知识流向 | 主要效益 |
| :--- | :--- | :--- | :--- | :--- |
| **数字花园 (Digital Garden)** | 独立开发者、自由职业者 | 本机全局 (`~/.uds/memory`) | Project → User | **可携性**：你的经验随你而行。 |
| **仓库中心 (Repo-Centric)** | 初创公司、小型团队 | 项目本地 (`.project-context/`) | User → Project | **一致性**：为新成员提供"开箱即用"的上手体验。 |
| **轴辐式 (Hub-and-Spoke)** | 企业、多项目组织 | Git Submodule／Registry | Hub ↔ Spoke | **标准化**：在严格边界内强制落实合规。 |

---

## 2. 策略 A：数字花园 (独立／自由职业者)

**理念**："我是知识的载体。"

目标是在许多临时项目之间积累个人经验。AI 扮演你的个人结对编程伙伴，学习 *你的* 偏好。

### 配置
- **全局 memory**：启用。将特定技术栈的洞见（例如"React Tips"、"Python Tricks"）存储于 `~/.uds/memory/`。
- **项目 memory**：最小化。仅存储凭证、特定路径或临时性的业务逻辑。

### 工作流程
1.  **遇到问题**：在项目 A 中解决一个棘手的 React 渲染错误。
2.  **提升 (Promote)**：告诉 AI："将这个存成通用的 React 模式到我的全局 memory。"
3.  **重复使用**：打开项目 B。当你编写类似代码时，AI 会立即建议该模式，因为它读取了 `~/.uds/memory`。

### 设置
```bash
# 1. Create global directory
mkdir -p ~/.uds/memory

# 2. (Optional) Initialize as git repo for backup
cd ~/.uds/memory && git init
```

---

## 3. 策略 B：仓库中心 (小型团队)

**理念**："仓库即真实来源 (Source of Truth)。"

目标是确保每位团队成员（以及他们的 AI Agent）拥有完全相同的上下文。个人偏好不应凌驾于项目惯例之上。

### 配置
- **全局 memory**：**停用** 或只读。避免"在我的机器／AI 上可以运行"的问题。
- **项目 memory**：完整。所有架构决策、代码风格与领域术语均存放于 `.project-context/`，并提交至 Git。

### 工作流程
1.  **上手 (Onboarding)**：新成员 clone 仓库。
2.  **即时上下文**：他们的 AI 读取 `.project-context/`，立即得知："我们采用 Hexagonal Architecture"与"变量必须使用 snake_case"。
3.  **共识**：当团队在 Code Review 中对新规则达成共识时，由一人指示 AI："将这条规则加入 Project Context。"
4.  **同步**：新的 `.md` 文件被提交并推送。每个人在下次 `git pull` 时获取更新。

---

## 4. 策略 C：轴辐式 (企业)

**理念**："治理与合规。"

目标是在数百个项目之间共享共通标准，同时允许本地的灵活性。

### 配置
- **核心层（轴 The Hub）**：一个专用的 Git 仓库（例如 `acme-corp/standard-memory`），内含全公司的安全规则与架构模式。
- **项目层（辐 The Spoke）**：本地 `.project-context/`，用于应用程序专属的逻辑。

### 实现：Git Submodules
每个项目将中央 memory 作为 submodule 挂载。

```bash
# In Project A, B, and C:
git submodule add git@github.com:acme-corp/standard-memory.git .standards/shared
```

### 工作流程
1.  **政策更新**：安全团队在 Hub 仓库中更新"Auth Standards"。
2.  **传播 (Propagation)**：各项目更新其 submodule，以拉取新标准。
3.  **验证**：CI/CD 管线检查项目代码是否符合 `.standards/shared` 中更新后的规则。

---

## 5. 总结

| 如果你想要… | 采用策略… |
| :--- | :--- |
| 在不同接单工作之间停止重复造轮子 | **数字花园 (Digital Garden)** |
| 让新进人员在第一天就能产出 | **仓库中心 (Repo-Centric)** |
| 确保 50+ 个微服务遵循安全规格 | **轴辐式 (Hub-and-Spoke)** |
