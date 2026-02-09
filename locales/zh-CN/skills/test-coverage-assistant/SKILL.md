---
source: ../../../../skills/test-coverage-assistant/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-02-10
status: current
description: |
  多维度分析测试覆盖率并提供可执行的建议。
  使用时机：分析覆盖率、识别测试缺口、制定测试策略。
  关键字：coverage, test, analysis, dimension, 覆盖率, 测试, 分析, 维度。
---

# 测试覆盖率助手

> **语言**: [English](../../../../skills/test-coverage-assistant/SKILL.md) | 简体中文

多维度分析测试覆盖率并提供可执行的建议。

## 覆盖率维度

| 维度 | 测量内容 | Dimension | What it Measures |
|------|----------|-----------|------------------|
| **行覆盖率** | 执行的代码行数 | Line | Lines of code executed |
| **分支覆盖率** | 决策路径覆盖 | Branch | Decision paths taken |
| **函数覆盖率** | 调用的函数 | Function | Functions called |
| **语句覆盖率** | 执行的语句 | Statement | Statements executed |

## 八维度框架

1. **代码覆盖率** - 行、分支、函数
2. **需求覆盖率** - 所有需求都有对应测试
3. **风险覆盖率** - 高风险区域优先测试
4. **集成覆盖率** - 组件交互路径
5. **边界案例覆盖率** - 边界条件测试
6. **错误覆盖率** - 错误处理路径验证
7. **权限覆盖率** - 访问控制场景
8. **AI 生成质量** - AI 生成测试的有效性

## 覆盖率目标

| 等级 | 覆盖率 | 适用场景 | Use Case |
|------|--------|----------|----------|
| 最低要求 | 60% | 遗留代码 | Legacy code |
| 标准 | 80% | 大多数项目 | Most projects |
| 高标准 | 90% | 关键系统 | Critical systems |
| 严格 | 95%+ | 安全关键 | Safety-critical |

## 工作流程

1. **执行覆盖率工具** - 生成覆盖率报告
2. **分析缺口** - 识别未测试的区域
3. **排定优先顺序** - 按风险和重要性排序
4. **建议测试** - 提出具体的测试建议
5. **追踪进度** - 持续监控覆盖率变化

## 使用方式

- `/coverage` - 执行完整覆盖率分析
- `/coverage src/auth` - 分析特定模块
- `/coverage --recommend` - 获取测试建议

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[test-completeness-dimensions.md](../../../../core/test-completeness-dimensions.md)
