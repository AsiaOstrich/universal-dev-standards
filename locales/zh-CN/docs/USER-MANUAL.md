---
source: docs/USER-MANUAL.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 用户手册

**Version**: 1.0.0
**Last Updated**: 2026-03-24

> **Language**: [English](../../../docs/USER-MANUAL.md) | [繁體中文](../../zh-TW/docs/USER-MANUAL.md) | 简体中文

本手册引导软件开发者从安装到日常高效使用 Universal Development Standards (UDS)。

---

## 目录

- [什么是 UDS？](#什么是-uds)
- [为什么要用 UDS？](#为什么要用-uds)
- [架构](#架构)
- [安装](#安装)
- [安装后验证](#安装后验证)
- [你的第一个指令：/discover](#你的第一个指令discover)
- [日常开发流程地图](#日常开发流程地图)
- [工作流程 A：规格驱动开发 (SDD)](#工作流程-a规格驱动开发-sdd)
- [工作流程 B：TDD 红绿重构](#工作流程-btdd-红绿重构)
- [选择正确的工作流程](#选择正确的工作流程)
- [Legacy Code 策略](#legacy-code-策略)
- [质量指令](#质量指令)
- [所有 Slash Commands 参考](#所有-slash-commands-参考)
- [渐进式导入策略](#渐进式导入策略)
- [UDS 的一天](#uds-的一天)
- [支持的 AI 工具](#支持的-ai-工具)
- [常见问题](#常见问题)
- [下一步与资源](#下一步与资源)

---

## 什么是 UDS？

Universal Development Standards 是一套为 AI 时代设计的**语言无关、框架无关**开发标准框架。它提供一组统一的标准、技能和指令，适用于任何技术栈。

| 类别 | 数量 | 说明 |
|------|------|------|
| **Core Standards** | 53 | 通用开发准则（Markdown） |
| **AI Skills** | 43 | 交互式技能（YAML） |
| **Slash Commands** | 30 | 日常开发快速操作指令 |
| **CLI Commands** | 6 | 命令行工具 |

**三大特性：**

1. **语言无关** — JavaScript、Python、Go、Rust、Java 等任何语言都适用
2. **框架无关** — React、Vue、Spring、Django 等任何框架都适用
3. **AI 原生** — 专为 AI 辅助开发工作流程设计

---

## 为什么要用 UDS？

| 问题 | UDS 解决方案 |
|------|-------------|
| 团队 commit message 格式不一致 | 通过 `/commit` 标准化 Conventional Commits |
| Code review 漏看关键问题 | 通过 `/review` 执行 8 维度系统性审查 |
| AI 工具给出不一致的建议 | 统一标准让 AI 工具读取并遵循 |
| 新人加入团队需要数周上手 | 清晰的标准和引导式工作流程 |
| 测试覆盖率期望不明确 | 测试金字塔定义明确比例（70/20/7/3） |
| 开发流程不清楚 | 两套方法论系统（SDD 和双回圈 TDD） |

### 设计哲学

**"碰一点，保护一点"** — 你不需要一次导入全部 48 个标准。UDS 专为渐进式导入设计：

- 先只用 `/commit` — 零成本，立即见效
- 接着加入 `/review` — 在合并前捕捉问题
- 团队适应后，逐步引入 `/tdd` 和 `/sdd`

> **Boy Scout Rule**：让代码比你找到它时更好。每次碰到代码，顺手加一点保护（测试、文档）。

---

## 架构

UDS 采用**双层执行模型**：

```
       AI Agent / 开发者
              |
        ┌─────┴─────┐
        |           |
   Skills Layer   Standards Layer
   (.ai.yaml)       (.md)
        |              |
   省 Token         完整理论
   交互式向导       工具配置
   日常开发用       深度参考用
```

| 方面 | Skills（执行层） | Standards（知识层） |
|------|-----------------|-------------------|
| 格式 | YAML 优化 | 完整 Markdown |
| 用途 | 高速交互查询 | 深度理解与依据 |
| Token 用量 | 最少（AI 友好） | 详尽（参考用） |
| 使用时机 | 日常开发任务 | 学习概念、深度审查 |

实际使用中，AI 工具会自动加载 Skills 层。只有当你想了解某条规则的「为什么」时，才需要阅读 Standards 层。

---

## 安装

### 方法一：全局安装（推荐）

```bash
npm install -g universal-dev-standards
cd your-project
uds init
```

### 方法二：免安装

```bash
npx universal-dev-standards init
```

### `uds init` 做了什么

交互式初始化会：

1. **检测**你的项目类型（Node.js、Python 等）
2. **询问**你使用的 AI 工具（Claude Code、Cursor 等）
3. **安装**标准到 `.standards/` 目录
4. **配置**你的 AI 工具配置文件（CLAUDE.md、.cursorrules 等）

---

## 安装后验证

运行 `uds init` 后，你的项目会多出这些文件：

```
your-project/
├── .standards/           # 48 个 AI 标准（.ai.yaml 文件）
│   ├── testing.ai.yaml
│   ├── commit-message.ai.yaml
│   ├── code-review.ai.yaml
│   └── ...
├── CLAUDE.md             # Claude Code 配置（若选择）
├── .cursorrules          # Cursor 配置（若选择）
└── ...你原有的文件完全不动
```

**验证安装：**

```bash
uds check    # 检查采用状态和文件完整性
uds skills   # 列出已安装技能
```

---

## 你的第一个指令：/discover

在修改现有代码库之前，先用 `/discover` 评估健康度：

```bash
/discover              # 全项目健康度评估
/discover auth         # 聚焦认证模块评估
/discover payments     # 评估新增支付功能的风险
```

### 输出示例

```
Project Health Report
=====================
Overall Score: 7.2 / 10

| 维度             | 分数  | 状态    | 关键发现                |
|-----------------|-------|---------|------------------------|
| Architecture    | 8/10  | Good    | 模块边界清晰            |
| Dependencies    | 6/10  | Warning | 5 个过时, 1 个严重      |
| Test Coverage   | 7/10  | Fair    | 72% 行覆盖率            |
| Security        | 8/10  | Good    | 无严重漏洞              |
| Technical Debt  | 6/10  | Warning | 23 个 TODO, 3 个热点    |

Verdict: CONDITIONAL
Recommendations:
1. [HIGH] 更新 lodash 以修复 CVE-2024-XXXX
2. [MED]  为 src/payments/ 新增测试（0% 覆盖率）
3. [LOW]  清理 src/utils/ 中的 TODO 积压
```

### 评估维度

| 维度 | 检查项目 |
|------|---------|
| **Architecture** | 模块结构、依赖图、入口点 |
| **Dependencies** | 过时包、已知漏洞、许可证风险 |
| **Test Coverage** | 现有测试套件、覆盖率缺口、测试质量 |
| **Security** | npm audit 发现、硬编码密钥、暴露端点 |
| **Technical Debt** | TODO 标记、代码重复、复杂度热点 |

---

## 日常开发流程地图

用这个决策树选择正确的工作流程：

```
第一次接触这个 Codebase？
│
├─ 是 → /discover（先评估）
│
└─ 否（已熟悉）
   │
   ├─ 全新功能？
   │   └─ 是 → SDD 流程：/sdd → /derive-all → 实现
   │
   ├─ Bug 修复？
   │   └─ 是 → 写失败测试 → 修复 → /commit
   │
   ├─ 修改现有代码？
   │   ├─ 有测试？ → 直接 /tdd 循环
   │   └─ 没测试？ → 先写 characterization test
   │
   └─ 纯重构？
       └─ 确保测试覆盖 → 重构 → 测试通过
```

> **关键原则**：选对工作流程，而非记住所有指令。

---

## 工作流程 A：规格驱动开发 (SDD)

SDD 针对**新功能**和 **AI 辅助开发**进行优化。核心理念：**规格先行，代码随后**。

### 五大阶段

```
Phase 1        Phase 2        Phase 3         推演            Phase 4         Phase 5
创建规格  →   审查规格  →   批准规格   →   生成测试   →    实现    →     验证
/sdd          /sdd review    /sdd approve    /derive-all     /sdd implement  /sdd verify
```

| 阶段 | 指令 | 输入 | 输出 |
|------|------|------|------|
| 1. 创建 | `/sdd user-auth` | 需求描述 | `SPEC-001.md` |
| 2. 审查 | `/sdd review` | SPEC 文件 | 审查意见 |
| 3. 批准 | `/sdd approve` | SPEC 文件 | 状态更新 |
| 推演 | `/derive-all` | SPEC 文件 | `.feature` + `.test.ts` |
| 4. 实现 | `/sdd implement` | SPEC 文件 | 进度追踪 |
| 5. 验证 | `/sdd verify` | SPEC 文件 | 验证报告 |

### 示例：新增双因素认证

**步骤 1 — 创建规格：**

```bash
/sdd two-factor-authentication
```

AI 会引导你定义：
- **用户故事**：作为用户，我希望启用 2FA 以提高账户安全性
- **验收条件（AC）**：
  - AC-1: 用户可以生成 TOTP 密钥
  - AC-2: 用户可以扫描 QR Code
  - AC-3: 系统验证 6 位数 OTP
  - AC-4: 提供备份代码

输出：`docs/specs/SPEC-001.md`

**步骤 2 — 从批准的规格推演测试：**

```bash
/derive-all docs/specs/SPEC-001.md
```

自动生成：

**BDD 场景（.feature）：**
```gherkin
@SPEC-001 @AC-1
Scenario: 用户生成 TOTP 密钥
  Given 用户已登录
  When 用户启用双因素认证
  Then 系统应生成 TOTP 密钥
  And 显示 QR Code 供扫描
```

**TDD 测试骨架（.test.ts）：**
```typescript
describe('SPEC-001: 双因素认证', () => {
  describe('AC-1: 生成 TOTP 密钥', () => {
    it('should generate valid TOTP secret when user enables 2FA', () => {
      // Arrange - [TODO]
      // Act - [TODO]
      // Assert - [TODO]
    });
  });
});
```

> 每个验收条件 1:1 对应一组测试 — 规格就是测试的蓝图。

---

## 工作流程 B：TDD 红绿重构

TDD 最适合 **Bug 修复**、**小功能**和**修改现有代码**。

### 三大阶段

```
    ┌──────────────────────────────────┐
    │                                  │
    │   RED         GREEN      REFACTOR│
    │   /tdd red    /tdd green /tdd refactor
    │     │           │           │    │
    │     v           v           v    │
    │   写失败测试  最少代码    改善质量 │
    │     │           │           │    │
    │     └───────────┴───────────┘    │
    │            重复循环               │
    └──────────────────────────────────┘
```

| 阶段 | 指令 | 规则 |
|------|------|------|
| RED | `/tdd red` | 只写测试，不写实现。测试必须失败。 |
| GREEN | `/tdd green` | 写最少代码让测试通过。不多不少。 |
| REFACTOR | `/tdd refactor` | 改善代码质量。测试必须持续通过。 |

### 示例：实现 `isValidEmail()`

**步骤 1：`/tdd red` — 写失败测试**

```javascript
// tests/email.test.js
test('should return true for valid email', () => {
  expect(isValidEmail('user@example.com')).toBe(true);
});

test('should return false for invalid email', () => {
  expect(isValidEmail('not-an-email')).toBe(false);
});
```

**步骤 2：`/tdd green` — 最少实现**

```javascript
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**步骤 3：`/tdd refactor` — 改善质量**

```javascript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}
```

---

## 选择正确的工作流程

| 场景 | 推荐工作流程 |
|------|-------------|
| 全新项目 + AI 辅助 | `/sdd` → `/derive-all` → 实现 |
| 全新功能（明确需求） | `/sdd` → `/derive-all` → 实现 |
| Legacy 系统修改 | `/bdd` → `/tdd` 循环 |
| 快速原型 | 直接 `/tdd` |
| 复杂业务逻辑 | `/bdd discovery` → `/tdd` |
| Bug 修复 | 写失败测试 → 修复 → `/commit` |
| 模糊构想，需要探索 | `/brainstorm` → `/requirement` → `/sdd` |
| 多方利益相关者需对齐 | `/atdd` → `/sdd` 或 `/bdd` |

> **简单记法**：新东西用 SDD，改旧的用 TDD，不确定就先 `/discover`。

---

## Legacy Code 策略

### 三步安全修改法

```
Step 1: 写 Characterization Test（记录现有行为）
        ↓
Step 2: /tdd 循环加入新行为
        ↓
Step 3: 逐步重构
```

### 什么是 Characterization Test？

一种记录代码*当前行为*的测试 — 不管对错。它是你在修改前的安全网。

```javascript
// 记录当前行为，即使是 bug
test('characterization: login validates email format', () => {
  const result = login('invalid-email', 'password');
  // 观察：当前代码接受无效 email（这是 bug）
  expect(result.success).toBe(true); // 记录现状
});
```

### 反向工程指令

用于较大规模的 Legacy Code 理解：

```bash
/reverse spec          # 将现有代码反向工程为规格
/reverse-bdd           # 转换为 BDD 场景
/reverse-tdd           # 分析 BDD-TDD 覆盖差距
```

> **关键原则**：先保护再修改。不要在没有测试的情况下改 Legacy Code。

---

## 质量指令

### `/commit` — 标准化提交

完成代码后，用 `/commit` 生成格式规范的 commit message：

```bash
/commit                     # 自动分析 staged changes
/commit 修正登录验证逻辑     # 附上描述
```

**生成格式：**

```
feat(auth): 新增双因素认证支持

实现 TOTP 密钥生成、QR Code 显示和 OTP 验证。
用户可在账户设置中启用 2FA，并获取备份代码。

Refs: SPEC-001
```

**Commit 类型：**

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 新增 2FA` |
| `fix` | 修 Bug | `fix(login): 修正密码验证` |
| `refactor` | 重构 | `refactor(utils): 提取共用函数` |
| `docs` | 文档 | `docs(api): 更新 API 文档` |
| `test` | 测试 | `test(auth): 新增登录测试` |
| `chore` | 维护 | `chore(deps): 更新依赖包` |

### `/review` — 代码审查

提交前，用 `/review` 进行系统性审查：

```bash
/review                    # 审查当前分支所有变更
/review src/auth.js        # 审查特定文件
/review feature/login      # 审查特定分支
```

**8 个审查维度：**

| # | 维度 | 检查重点 |
|---|------|---------|
| 1 | Functionality | 功能是否正确？ |
| 2 | Design | 架构是否合理？ |
| 3 | Quality | 代码是否干净？ |
| 4 | Readability | 是否容易理解？ |
| 5 | Tests | 测试覆盖是否足够？ |
| 6 | Security | 有无安全漏洞？ |
| 7 | Performance | 是否有效率？ |
| 8 | Error Handling | 错误处理是否完善？ |

**评论前缀系统：**

| 前缀 | 意义 | 动作 |
|------|------|------|
| **BLOCKING** | 必须修复才能合并 | 必要 |
| **IMPORTANT** | 应该修复 | 建议 |
| **SUGGESTION** | 可以更好 | 可选 |
| **QUESTION** | 需要厘清 | 讨论 |

### `/checkin` — 提交前质量闸门

提交前运行 `/checkin` 验证所有质量闸门通过（测试、linting、标准合规）。

---

## 所有 Slash Commands 参考

| 家族 | 指令 | 用途 |
|------|------|------|
| **探索** | `/discover`, `/dev-workflow` | 评估项目、引导工作流程 |
| **规格** | `/sdd`, `/requirement`, `/brainstorm` | 规格驱动开发 |
| **推演** | `/derive-all`, `/derive-bdd`, `/derive-tdd`, `/derive-atdd` | 从规格生成测试 |
| **开发** | `/tdd`, `/bdd`, `/atdd` | 方法论工作流程 |
| **质量** | `/commit`, `/review`, `/checkin`, `/coverage`, `/ac-coverage` | 日常质量管理 |
| **文档** | `/docs`, `/docgen`, `/changelog`, `/release` | 文档与发布 |
| **反向** | `/reverse`, `/reverse-sdd`, `/reverse-bdd`, `/reverse-tdd` | Legacy Code 反向工程 |
| **重构** | `/refactor` | 重构指导 |
| **工具** | `/init`, `/check`, `/update`, `/config`, `/methodology`, `/guide` | 设置与配置 |

> 不需要记住全部。输入 `/dev-workflow`，它会引导你到正确的指令。

---

## 渐进式导入策略

不需要一次学会所有指令。分阶段导入：

### 第 1 周：零成本起步

```bash
/commit     # 标准化 commit message
/review     # 提交前自我审查
```

> 只需要这两个指令，就能立即提升代码质量。

### 第 2-3 周：加入测试保护

```bash
/discover   # 了解项目健康度
/tdd        # 用 TDD 写新功能
```

### 第 4 周起：完整工作流程

```bash
/sdd        # 规格驱动开发
/derive-all # 自动生成测试
/bdd        # 行为驱动开发
```

> **关键心态**：每周多用一个指令，一个月后自然上手。

---

## UDS 的一天

```
09:00  /discover auth          # 评估要修改的认证模块
       → 健康分数 7.2/10, CONDITIONAL

09:15  /sdd add-2fa           # 创建双因素认证规格
       → 产出 SPEC-001.md

09:30  /sdd review            # 审查规格完整性
       → 确认 4 个 AC 无遗漏

09:45  /derive-all            # 从规格生成 BDD + TDD
       → 产出 4 个 .feature + 4 组 .test.ts

10:00  /tdd red               # 开始 TDD 循环
10:30  /tdd green             # 实现最少代码
11:00  /tdd refactor          # 改善质量
       → 重复循环直到所有 AC 完成

12:00  /commit                # 标准化提交
       → feat(auth): 新增双因素认证

12:05  /review                # 最终审查
       → 0 BLOCKING, 1 SUGGESTION
```

---

## 支持的 AI 工具

| AI 工具 | 状态 | Skills | Slash Commands | 配置文件 |
|---------|------|--------|----------------|---------|
| **Claude Code** | 完整支持 | 26 | 30 | `CLAUDE.md` |
| **OpenCode** | 完整支持 | 26 | 30 | `AGENTS.md` |
| **Gemini CLI** | Preview | 18+ | 20+ | `GEMINI.md` |
| **Cursor** | 完整支持 | Core | Simulated | `.cursorrules` |
| **Cline / Roo Code** | 部分支持 | Core | Workflow | `.clinerules` |
| **Windsurf** | 部分支持 | 有 | Rulebook | `.windsurfrules` |

> **一套标准，多工具通用** — 换 AI 工具不需要重学标准。

---

## 常见问题

**Q: UDS 会限制我的技术选择吗？**
A: 不会。UDS 是语言无关、框架无关的。它定义的是流程和质量标准，不是技术选择。

**Q: 一定要用 AI 工具吗？**
A: 不用。核心标准是 Markdown 文件，人类直接阅读也完全适用。AI 工具只是让流程更顺畅。

**Q: 团队中只有我用可以吗？**
A: 可以。渐进式导入的设计就是为了这个场景。先自己用 `/commit` 和 `/review`，等团队看到效果再推广。

**Q: 和 ESLint / Prettier 冲突吗？**
A: 互补关系。ESLint/Prettier 处理代码格式，UDS 处理更高层次的开发流程和质量标准。

**Q: 什么都需要写规格吗？**
A: 不用。UDS 遵循「碰一点，保护一点」原则。只在重大新功能时用 `/sdd`。Bug 修复和小变更只需 `/tdd` 和 `/commit`。

**Q: 如何更新到 UDS 新版本？**
A: 在项目目录运行 `uds update`。它会更新标准同时保留你的自定义配置。

---

## 下一步与资源

### 现在就开始

```bash
npm install -g universal-dev-standards
cd your-project
uds init
```

### 推荐学习路径

1. 先用 `/commit` + `/review` 养成习惯
2. 遇到新功能时试试 `/sdd`
3. 不确定下一步时，输入 `/dev-workflow`

### 参考文档

| 资源 | 说明 |
|------|------|
| [Daily Workflow Guide](../../../adoption/DAILY-WORKFLOW-GUIDE.md) | 日常工作流程完整指南 |
| [Command Family Overview](../../../skills/commands/COMMAND-FAMILY-OVERVIEW.md) | 指令家族架构与场景 |
| [Cheatsheet](CHEATSHEET.md) | 所有功能速查表 |
| [Feature Reference](FEATURE-REFERENCE.md) | 完整功能目录（182 个功能） |
| [README](../../../README.md) | 项目总览 |

### 获取帮助

- 输入 `/dev-workflow` 获得引导式工作流程选择
- 输入 `/guide <标准名称>` 查阅特定标准参考
- 访问 [GitHub repository](https://github.com/AsiaOstrich/universal-dev-standards) 提交 issue 或参与讨论

---

## 许可证

- 文档（Markdown）：CC BY 4.0
- 代码（JavaScript）：MIT
