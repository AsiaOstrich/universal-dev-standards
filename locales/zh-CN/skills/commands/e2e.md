---
source: ../../../../skills/commands/e2e.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 3f1c7685057c
status: experimental
description: "[UDS] 从 BDD 场景生成 E2E 测试骨架，支持框架检测"
---

---
description: "[UDS] 从 BDD 场景生成 E2E 测试骨架，支持框架检测"
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*)
argument-hint: "[feature-file | --analyze] [options]"
status: experimental
---

# E2E 助手

> [!WARNING]
> **实验性功能 / Experimental Feature**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

从 BDD `.feature` 场景生成 E2E 测试骨架。检测项目框架、分析既有测试模式，并产出框架适配的骨架与 `[TODO]` 标记。

## 用法

```bash
/e2e <feature-file>            # 从 BDD 场景生成 E2E 骨架（默认模式）
/e2e <spec-file>               # 从 SDD 规格委派 /derive e2e
/e2e --analyze                 # 扫描所有 feature 的 E2E 覆盖差距
/e2e --analyze <feature-file>  # 分析特定 feature 的 AC 适用性
```

## 选项

| 选项 | 说明 |
|------|------|
| `<feature-file>` | `.feature` 文件路径 |
| `<spec-file>` | `SPEC-XXX.md` 规格路径（委派至 `/derive e2e`） |
| `--analyze` | 执行覆盖差距分析模式 |

## 工作流程

### 生成模式

```
1. 解析 .feature 文件 → 提取场景
2. 分类每个场景 → e2e / integration / unit 适用
3. 检测 E2E 框架 → Playwright / Cypress / Vitest
4. 分析既有 E2E 模式 → imports、helpers、惯例
5. 生成框架适配骨架 → 含 [TODO] 标记
6. 展示结果 → 等待用户确认写入
```

### 分析模式（--analyze）

```
1. 扫描 features 目录 → 列出所有 .feature 文件
2. 扫描 E2E 测试目录 → 列出所有 E2E 测试文件
3. 比对覆盖状况 → 识别缺少 E2E 测试的项目
4. 生成报告 → 建议使用 /ac-coverage-assistant 获取详情
```

## 防幻觉

- **必须**先读取实际的 `.feature` 文件再进行分类，不可猜测场景内容
- **必须**从 `package.json` 或既有测试文件检测框架，不可假设框架
- **必须**参考 `cli/src/utils/e2e-analyzer.js` 和 `cli/src/utils/e2e-detector.js` 的分类逻辑
- **不得**捏造项目中不存在的测试 helper 或 import 路径

## 范例

### 从 feature 文件生成 E2E

```
/e2e tests/features/SPEC-AUTH-001-login.feature
```

输出：
```
📊 AC 适用性分析结果：
┌──────────────────────────────┬──────────────────┬───────────────────────────────┐
│ Scenario                     │ Category         │ Reason                        │
├──────────────────────────────┼──────────────────┼───────────────────────────────┤
│ Successful login             │ e2e-suitable     │ Multi-step user flow          │
│ Failed login                 │ e2e-suitable     │ UI interaction detected       │
│ Password validation          │ unit-suitable    │ Pure validation logic         │
└──────────────────────────────┴──────────────────┴───────────────────────────────┘

🔍 框架检测：Playwright (auto-detected from package.json)
📁 既有模式：3 E2E tests found, using @playwright/test

✅ 已生成 E2E 骨架（2 scenarios, 1 skipped）
```

### 分析覆盖差距

```
/e2e --analyze
```

输出：
```
📊 E2E 覆盖差距报告：
┌──────────────────────────────┬──────────┬───────────────────┐
│ Feature File                 │ E2E Test │ Status            │
├──────────────────────────────┼──────────┼───────────────────┤
│ login.feature                │ ✅       │ Covered           │
│ checkout.feature             │ ❌       │ Missing           │
│ registration.feature         │ ❌       │ Missing           │
└──────────────────────────────┴──────────┴───────────────────┘

覆盖率：1/3 (33%)
建议：执行 /ac-coverage-assistant 获取 AC 层级追踪。
```

## AI 代理行为

> 遵循 [AI 命令行为标准](../../../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/e2e` | 列出 `tests/features/` 中的 `.feature` 文件，询问用户选择 |
| `/e2e <feature-file>` | 直接进入生成模式，解析指定 `.feature` 文件 |
| `/e2e <spec-file>` | 检测到 `SPEC-XXX.md` 格式，委派至 `/derive e2e` |
| `/e2e --analyze` | 进入分析模式，扫描覆盖差距 |
| `/e2e --analyze <feature>` | 分析指定 feature 的 AC 适用性 |

### 交互脚本

#### Phase 1: AC 适用性分析

1. 读取 `.feature` 文件，解析所有 Scenario
2. 使用分类逻辑（E2E/Integration/Unit keywords + step count）分类每个 Scenario
3. 以表格展示分类结果

**Decision: 无 E2E 适合的场景**
- IF 所有场景都非 `e2e-suitable` → 通知用户，建议使用 `/tdd` 或 `/bdd` 替代
- IF 部分适合 → 仅处理 `e2e-suitable` 场景，列出跳过的场景及原因

🛑 **STOP**: 展示分类结果后等待用户确认继续

#### Phase 2: 框架检测与模式分析

1. 检测项目使用的 E2E 框架（package.json dependencies）
2. 扫描既有 E2E 测试目录，提取 import、helper、编码惯例

**Decision: 多框架检测**
- IF 检测到多个框架 → 列出选项，询问用户选择
- IF 未检测到框架 → 询问用户指定，或默认使用 Vitest

#### Phase 3: 骨架生成

1. 使用框架模板生成 E2E 测试骨架
2. 包含 `[TODO]` 标记、traceability tags（`@SPEC-XXX @AC-N`）
3. 包含 fixture/setup 引导（beforeAll/beforeEach）
4. 展示生成的代码

🛑 **STOP**: 展示生成的骨架后等待用户确认写入

#### Phase 4: 完成与下一步

1. 写入文件（经用户确认）
2. 建议下一步操作

### 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| AC 分析 | 分类结果展示后 | 确认继续生成 |
| 骨架生成 | 代码展示后 | 确认写入文件 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| `.feature` 文件不存在 | 列出目录中可用的 `.feature` 文件 |
| `.feature` 无 Scenario | 通知用户，建议先使用 `/bdd` 撰写场景 |
| 输入为 `SPEC-XXX.md` | 识别后委派至 `/derive e2e`，说明原因 |
| 框架未检测到 | 询问用户选择框架（Playwright/Cypress/Vitest） |
| 既有 E2E 目录不存在 | 使用默认模板，不进行模式分析 |

## 参考

- 规格：[SPEC-E2E-001](../../../../docs/specs/skills/SPEC-E2E-001-e2e-skill.md)
- Skill：[e2e-assistant](../e2e-assistant/SKILL.md)
- 工具程序：`cli/src/utils/e2e-analyzer.js`、`cli/src/utils/e2e-detector.js`
- 相关：[/derive](./derive.md)、[/bdd](./bdd.md)、[/tdd](./tdd.md)
