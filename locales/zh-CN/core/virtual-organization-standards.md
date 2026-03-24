---
source: ../../../core/virtual-organization-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/virtual-organization-standards.md) | 简体中文

# 虚拟组织标准

**版本**: 1.0.0
**最后更新**: 2026-01-29
**适用范围**: 项目设置和 AI 工具配置
**范围**: universal
**行业标准**: ISO 12207 §6.2
**参考**: [iso.org](https://www.iso.org/standard/63712.html)
**ISO 12207 映射**: 组织项目赋能过程（6.2）

---

## 目的

本标准将 AI 生态系统视为"虚拟组织"。它定义如何将 AI 能力（技能）、基础设施和品质保证作为组织资产来管理，确保"虚拟劳动力"是有能力且合规的。

---

## 1. 虚拟劳动力管理（人力资源）

在 Vibe Coding 中，"人力资源管理"转化为管理 AI 代理的能力。

### 1.1 技能管理

技能是虚拟员工的"资质"。

- **获取**: 技能必须明确安装（如通过 `skills/` 目录或插件）
- **胜任力**: 技能必须在特定项目上下文中验证
- **角色定义**: 代理应被分配"角色"（技能集合），而非通用的

| 角色 | 推荐技能集 |
|------|-----------|
| **架构师代理** | `system-design`、`diagram-generation`、`codebase-analysis` |
| **测试代理** | `test-runner`、`coverage-analyzer`、`mock-generator` |
| **重构代理** | `static-analysis`、`code-metrics`、`refactoring-patterns` |

### 1.2 入职（上下文加载）

"入职"AI 代理意味着加载正确的上下文和配置。

- **项目引导**: 加载 `README.md`、架构文档和标准
- **规则对齐**: 加载 `core/ai-agreement-standards.md`

---

## 2. 基础设施管理（工具）

### 2.1 工具集成

AI 代理的"办公环境"包括：

- **MCP 服务器**: 通过 Model Context Protocol 标准化集成
- **API 访问**: 密钥和端点的安全管理
- **沙箱**: 代码执行的隔离环境（防止系统损坏）

### 2.2 知识库

AI 代理的"企业图书馆"：

- **向量数据库**: 用于大规模文档检索
- **代码片段库**: 可复用的代码模式和模板

---

## 3. 品质管理系统（QMS）

### 3.1 品质策略

| 方面 | 实施方式 |
|------|---------|
| **代码品质** | 自动化 linting、类型检查、代码审查 |
| **测试品质** | 测试覆盖率门槛、测试金字塔比例 |
| **文档品质** | 文档模板、审查流程 |
| **安全品质** | 安全扫描、依赖审计 |

### 3.2 持续改进

- 定期回顾 AI 代理的产出品质
- 根据项目需求更新技能集
- 维护品质指标的趋势分析

---

## 相关标准

- [AI 协议标准](ai-agreement-standards.md)
- [AI 指令标准](../../../core/ai-instruction-standards.md)
- [情境感知加载](context-aware-loading.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
