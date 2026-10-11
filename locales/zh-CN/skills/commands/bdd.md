---
source: ../../../../skills/commands/bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: f3e5c2af38e5
status: experimental
---

---
description: [UDS] Guide through Behavior-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[要实作的行为或场景 | behavior or scenario to implement]"
status: experimental
---

# BDD 助手

> [!WARNING]
> **实验性功能 / Experimental Feature**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

引导行为驱动开发（BDD）流程，使用 Given-When-Then 格式。

## 前置检查

在执行 BDD 阶段前，AI 助手必须验证前置条件。如果检查失败，停止并引导用户。

### 阶段闸门矩阵

| 目标阶段 | 前置检查 | 失败时 |
|----------|----------|--------|
| `DISCOVERY` | 1. 已明确识别功能/行为 | → 请用户描述期望的行为 |
| | 2. 若为 SDD 项目：规格已存在 | → 引导至 `/sdd` |
| `FORMULATION` | 1. 已有探索产出（范例、边界情况） | → 引导回 DISCOVERY |
| | 2. 至少已收集一个具体范例 | → 先收集范例 |
| `AUTOMATION` | 1. 已存在包含场景的 `.feature` 文件 | → 引导至 FORMULATION |
| | 2. 场景遵循 Given-When-Then 格式 | → 修正场景格式 |
| `LIVING DOCS` | 1. 已实作步骤定义 | → 引导至 AUTOMATION |
| | 2. 所有场景通过 | → 先修复失败的场景 |

### 功能文件优先强制

```
🔍 DISCOVERY: Collect examples → identify edge cases
   ↓ (only proceed with concrete examples)
📝 FORMULATION: Write .feature file → Given/When/Then
   ↓ (only proceed with valid Gherkin scenarios)
🤖 AUTOMATION: Implement step definitions → run
   ↓ (only proceed when all scenarios pass)
📚 LIVING DOCS: Maintain and share
```

**关键规则**：AI 不得在含 Gherkin 场景的 `.feature` 文件存在前撰写步骤定义。探索阶段必须产出具体范例才能进入制定阶段。

---

## 方法论集成

当调用 `/bdd` 时：
1. **自动启用 BDD 方法论**（如果尚未启用）
2. **将当前阶段设为探索**（探索行为）
3. **追踪阶段转换**随着工作进展
4. **在响应中显示阶段指示器**（🔍 探索、📝 制定、🤖 自动化、📚 活文件）

详见 [methodology-system](../dev-methodology/SKILL.md) 了解完整方法论追踪。

## BDD 循环

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  ┌────┐   ┌────┐   ┌──────┐   ┌──────┐               │
│  │探索│ ► │制定│ ► │自动化│ ► │活文件│               │
│  └────┘   └────┘   └──────┘   └──────┘               │
│    ▲                              │                   │
│    └──────────────────────────────┘                   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## 工作流程

### 1. 探索 - 探索行为
- 与利害关系人讨论
- 识别范例和边界情况
- 理解功能背后的「为什么」

### 2. 制定 - 撰写场景
- 撰写 Gherkin 场景（Given-When-Then）
- 使用通用语言
- 让场景具体且明确

### 3. 自动化 - 实作测试
- 实作步骤定义
- 撰写最小程序码以通过
- 在自动化中遵循 TDD 循环

### 4. 活文件 - 维护
- 保持场景最新
- 作为文件使用
- 与利害关系人分享

## Gherkin 格式

```gherkin
功能: 用户登入
  作为一个注册用户
  我想要登入我的帐户
  以便我可以访问我的个人仪表板

  场景: 使用有效凭证成功登入
    假设 我在登入页面
    而且 我有一个注册帐户，邮箱为 "user@example.com"
    当 我输入邮箱 "user@example.com"
    而且 我输入密码 "correctpassword"
    而且 我点击登入按钮
    那么 我应该被重定向到我的仪表板
    而且 我应该看到欢迎消息

  场景: 使用无效密码登入失败
    假设 我在登入页面
    当 我输入邮箱 "user@example.com"
    而且 我输入密码 "wrongpassword"
    而且 我点击登入按钮
    那么 我应该看到错误消息 "无效的凭证"
    而且 我应该留在登入页面
```

## 三剑客会议

BDD 最适合协作：

| 角色 | 关注点 |
|------|--------|
| 业务 | 什么和为什么 |
| 开发 | 如何实现 |
| 测试 | 假设情况 |

## 使用方式

- `/bdd` - 启动互动式 BDD 会话
- `/bdd "用户可以重设密码"` - 针对特定功能的 BDD
- `/bdd login-feature.feature` - 使用现有功能文件

## 阶段检查清单

### 探索阶段
- [ ] 已识别利害关系人
- [ ] 已讨论用户故事
- [ ] 已收集范例
- [ ] 已识别边界情况

### 制定阶段
- [ ] 场景遵循 Given-When-Then
- [ ] 语言是通用的（共享词汇）
- [ ] 场景具体且明确
- [ ] 场景中无实作细节

### 自动化阶段
- [ ] 已实作步骤定义
- [ ] 测试可执行
- [ ] 程序码通过所有场景
- [ ] 重构完成

### 活文件阶段
- [ ] 场景是最新的
- [ ] 文件可访问
- [ ] 利害关系人可阅读和理解

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/bdd` | 询问要探索的行为，进入 🔍 DISCOVERY |
| `/bdd "feature description"` | 以指定功能为目标，进入 🔍 DISCOVERY |
| `/bdd <feature-file>` | 加载现有 `.feature` 文件，判断进入哪个阶段 |

### 交互脚本

#### 🔍 DISCOVERY Phase

1. 与用户讨论功能行为
2. 收集具体范例和边界案例
3. 以 Three Amigos 视角提问（Business / Dev / Testing）

🛑 **STOP**: 收集足够范例后展示摘要，等待确认进入 FORMULATION

#### 📝 FORMULATION Phase

1. 将范例转为 Gherkin 场景（Given-When-Then）
2. 使用领域语言（ubiquitous language）
3. 展示生成的 `.feature` 内容

**Decision: 场景品质**
- IF 场景包含实作细节 → 自动抽离，改用业务语言
- IF 场景过于模糊 → 要求更具体的范例

🛑 **STOP**: 展示 `.feature` 后等待用户确认写入

#### 🤖 AUTOMATION Phase

1. 为每个场景实作 step definitions
2. 执行场景，确认结果
3. 场景内部使用 TDD 循环实作

🛑 **STOP**: 所有场景通过后等待用户确认

#### 📚 LIVING DOCS Phase

1. 确认所有场景是最新状态
2. 建议文件可分享给利害关系人

### 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| DISCOVERY | 范例收集完成后 | 确认进入 FORMULATION |
| FORMULATION | `.feature` 生成后 | 确认写入 |
| AUTOMATION | 所有场景通过后 | 确认进入 LIVING DOCS |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 用户要求跳过 DISCOVERY 直接写场景 | 提醒需要具体范例，但允许 override |
| `.feature` 语法无效 | 自动修正 Gherkin 语法 |
| Step definition 实作失败 | 报告哪个 step 失败，尝试修复，3 次后 STOP |
| 无 BDD 测试框架（Cucumber 等） | 建议安装，或改用 TDD 方式实作场景逻辑 |

## 参考

- 方法论: [bdd.methodology.yaml](../../../../methodologies/bdd.methodology.yaml)
- 方法论系统: [methodology-system](../dev-methodology/SKILL.md)
