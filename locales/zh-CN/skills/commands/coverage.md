---
source: ../../../../skills/commands/coverage.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Analyze test coverage and provide recommendations
allowed-tools: Read, Grep, Glob, Bash(npm run test:coverage:*), Bash(npx:*)
argument-hint: "[要分析的文件或模组 | file or module to analyze]"
---

# 测试覆盖率助手

多维度分析测试覆盖率并提供可执行的建议。

## 覆盖率维度

| 维度 | 测量内容 |
|------|----------|
| **Line** | 执行的行数 |
| **Branch** | 决策路径 |
| **Function** | 调用的函数 |
| **Statement** | 执行的语句 |

## 八维度框架

1. **代码覆盖率** - 行、分支、函数
2. **需求覆盖率** - 所有需求已测试
3. **风险覆盖率** - 高风险区域已测试
4. **集成覆盖率** - 组件间交互
5. **边界情况覆盖率** - 边界条件
6. **错误覆盖率** - 错误处理路径
7. **权限覆盖率** - 访问控制场景
8. **AI 生成品质** - AI 生成测试的有效性

## 工作流程

1. **运行覆盖率工具** - 生成覆盖率报告
2. **分析缺口** - 识别未测试区域
3. **优先排序** - 按风险和重要性排序
4. **建议测试** - 建议需要添加的具体测试
5. **追踪进度** - 随时间监控覆盖率

## 覆盖率目标

| 等级 | 覆盖率 | 使用场景 |
|------|--------|----------|
| 最低 | 60% | 遗留代码 |
| 标准 | 80% | 大多数专案 |
| 高 | 90% | 关键系统 |
| 关键 | 95%+ | 安全关键 |

## 使用方式

- `/coverage` - 运行完整覆盖率分析
- `/coverage src/auth` - 分析特定模组
- `/coverage --recommend` - 获取测试建议

## AC 覆盖率（需求层级）

本命令（`/coverage`）分析**代码层级**覆盖率（行/分支/函数）。若需**需求层级**覆盖率 — 追踪哪些 AC 有对应测试 — 请使用 [`/ac-coverage`](./ac-coverage.md)。

| | `/coverage` | `/ac-coverage` |
|-|-------------|----------------|
| **层级** | 代码（行/分支/函数） | 需求（AC 到测试） |
| **问题** | "有多少代码被测试了？" | "哪些 AC 有测试？" |

## 参考

- 完整规范: [test-coverage-assistant](../test-coverage-assistant/SKILL.md)
- 核心指南: [testing-standards](../../core/testing-standards.md)
- AC 覆盖率: [/ac-coverage](./ac-coverage.md) — 需求层级追踪
