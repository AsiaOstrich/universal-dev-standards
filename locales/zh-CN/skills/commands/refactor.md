---
source: ../../../../skills/commands/refactor.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: a77c9f4d9475
status: current
description: [UDS] Guide refactoring decisions and strategy selection
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[scope: tactical | strategic | legacy | decide | debt]"
status: stable
---

# /refactor 命令

> **语言**: [English](../../../../skills/commands/refactor.md) | 简体中文

引导重构决策，推荐适合的重构策略。

## 使用方式

| 命令 | Purpose | 用途 |
|------|---------|------|
| `/refactor` | Start interactive refactoring guide | 启动互动式重构引导 |
| `/refactor decide` | Run refactor vs. rewrite decision tree | 执行重构 vs 重写决策树 |
| `/refactor tactical` | Suggest tactical (daily) strategies | 建议战术性（日常）策略 |
| `/refactor strategic` | Guide strategic/architectural refactoring | 引导战略性/架构重构 |
| `/refactor legacy` | Legacy code safety strategies | 遗留代码安全策略 |
| `/refactor debt` | Technical debt assessment | 技术债评估 |

## 工作流程

### 1. 评估阶段

- 识别要重构的代码
- 评估测试覆盖率
- 判定范围（战术/战略）

### 2. 策略选择

- 必要时执行决策树
- 根据情境推荐适合的策略

### 3. 执行引导

- 提供步骤式工作流程
- 建议安全措施
- 追踪进度

## 决策树

执行 `/refactor decide` 时：

```
┌─────────────────────────────────────────────────────────────────┐
│              重构 vs 重写决策树                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 代码目前在生产环境运行吗？ [Y/N]                               │
│     └─ N → 考虑重写（风险较低）                                   │
│                                                                 │
│  2. 你了解代码在做什么吗？ [Y/N]                                  │
│     └─ N → 先写特征测试，再决定                                   │
│                                                                 │
│  3. 测试覆盖率 > 60%？ [Y/N]                                      │
│     └─ N → 先补测试，再决定                                       │
│                                                                 │
│  4. 核心架构可以挽救吗？ [Y/N]                                    │
│     └─ N → Strangler Fig（渐进替换）                             │
│     └─ Y → 渐进式重构 ✓                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 策略快速参考

### 战术性策略（日常）

| 策略 | When to Use | 使用时机 |
|------|-------------|---------|
| **预备性重构** | Before adding a blocked feature | 新增被阻挡的功能之前 |
| **童子军规则** | During any maintenance work | 任何维护工作中 |
| **红-绿-重构** | TDD development cycle | TDD 开发循环 |

### 战略性策略（架构级）

| 策略 | When to Use | 使用时机 |
|------|-------------|---------|
| **绞杀榕** | Replacing entire system | 替换整个系统 |
| **防腐层** | Integrating with legacy system | 与遗留系统整合 |
| **抽象分支** | Shared code refactoring on trunk | 在主干上重构共享代码 |
| **平行变更** | Changing widely-used interfaces | 变更广泛使用的接口 |

### 安全防护策略（遗留）

| 策略 | When to Use | 使用时机 |
|------|-------------|---------|
| **特征测试** | Before any legacy refactoring | 任何遗留代码重构之前 |
| **探针式重构** | Understanding black-box code | 理解黑盒代码 |
| **寻找接缝** | Injecting test doubles | 注入测试替身 |
| **Sprout/Wrap** | Adding new logic to legacy | 在遗留代码中新增逻辑 |

## 示例

### 示例 1：功能被混乱代码阻挡

```
用户: /refactor tactical

AI: 让我协助你选择战术性重构策略。

你的情况是？
1. 功能开发被代码结构阻挡 → **预备性重构**
2. 在 Bug 修复中接触代码 → **童子军规则**
3. 用 TDD 编写新代码 → **红-绿-重构**

哪个最符合你的情况？
```

### 示例 2：决策树

```
用户: /refactor decide

AI: 让我协助你决定应该重构还是重写。

**问题 1：** 代码目前在生产环境运行吗？
□ 是 - 继续下一个问题
□ 否 - 考虑重写（没有生产依赖，风险较低）

请回答...
```

### 示例 3：遗留代码

```
用户: /refactor legacy

AI: 处理遗留代码需要安全优先的策略。

**在任何重构之前：**
1. ✅ 编写特征测试以捕获当前行为
2. ✅ 如果不理解代码，使用探针式重构
3. ✅ 寻找接缝以注入测试替身

**新增新逻辑时：**
- 使用 Sprout Method/Class 处理新功能
- 使用 Wrap Method/Class 处理前后行为

需要我协助你开始编写特征测试吗？
```

## 整合

此命令整合：

- **重构助手技能** 提供详细引导
- **方法论系统** 追踪重构进度
- **TDD 助手** 用于红-绿-重构循环

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/refactor` | 询问重构目标和情境，引导选择策略 |
| `/refactor decide` | 直接执行重构 vs 重写决策树 |
| `/refactor tactical` | 列出战术性策略，询问情境后推荐 |
| `/refactor strategic` | 引导架构级重构规划 |
| `/refactor legacy` | 执行遗留代码安全策略引导 |
| `/refactor debt` | 执行技术债评估 |

### 交互脚本

#### `/refactor`（无子命令）
1. 询问重构情境（日常开发 / 架构变更 / 遗留代码）
2. 依回答分派到 tactical / strategic / legacy

#### `/refactor decide`
1. 逐一提出决策树问题（4 题）
2. 等用户回答每一题
3. 根据答案路径给出建议（重构 / 重写 / 先加测试）

🛑 **STOP**: 决策结果展示后等待用户确认方向

#### `/refactor tactical` / `strategic` / `legacy`
1. 评估当前代码状态（测试覆盖率、复杂度）
2. 推荐适合的策略
3. 提供步骤式执行指引

🛑 **STOP**: 策略推荐后等待用户选择，再提供执行引导

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 决策树结果后 | 确认重构方向 |
| 策略推荐后 | 选择策略 |
| 重构计划制定后 | 确认开始执行 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法取得测试覆盖率 | 建议先执行 `/coverage`，或询问用户估计值 |
| 重构范围过大 | 建议分阶段进行，先从最高风险区域开始 |
| 无子命令且无法判断情境 | 默认引导到 decide 决策树 |

## 参考

- [重构标准](../../../../core/refactoring-standards.md) - 核心标准
- [重构助手技能](../refactoring-assistant/SKILL.md) - 完整技能
- [TDD 助手](../tdd-assistant/SKILL.md) - TDD 工作流程
