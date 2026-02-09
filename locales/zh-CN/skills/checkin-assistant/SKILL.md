---
source: ../../../../skills/checkin-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  在提交代码前验证品质关卡，确保代码库稳定性。
  使用时机：提交前检查、品质验证、pre-commit 检查。
  关键字：checkin, pre-commit, quality gate, 签入, 品质关卡, 验证。
---

# 签入助手

> **语言**: [English](../../../../skills/checkin-assistant/SKILL.md) | 简体中文

在提交代码前验证品质关卡，确保代码库的稳定性。

## 工作流程

1. **检查 git 状态** - 执行 `git status` 和 `git diff` 了解待提交的变更
2. **执行测试** - 执行 `npm test`（或项目测试指令）验证所有测试通过
3. **执行代码检查** - 执行 `npm run lint` 检查代码风格合规
4. **验证品质关卡** - 根据以下清单逐项检查
5. **报告结果** - 呈现通过/失败摘要并建议后续步骤

## 品质关卡

| 关卡 | 检查项目 | Check |
|------|---------|-------|
| **构建** | 编译零错误 | Code compiles with zero errors |
| **测试** | 所有测试通过（100%） | All existing tests pass |
| **覆盖率** | 覆盖率未下降 | Test coverage not decreased |
| **代码品质** | 符合编码规范、无代码异味 | Follows coding standards |
| **安全性** | 无硬编码密钥或漏洞 | No hardcoded secrets |
| **文档** | API 文档和 CHANGELOG 已更新 | Documentation updated |
| **工作流程** | 分支命名和提交消息格式正确 | Branch naming and commit correct |

## 禁止提交的情况

- 构建有错误 | Build has errors
- 测试失败 | Tests are failing
- 功能不完整会破坏现有功能 | Feature is incomplete and would break functionality
- 关键逻辑中有 WIP/TODO | Contains WIP/TODO in critical logic
- 包含调试代码（console.log、print） | Contains debugging code
- 包含被注释的代码块 | Contains commented-out code blocks

## 使用方式

- `/checkin` - 对目前变更执行完整品质关卡验证
- 验证通过后，使用 `/commit` 建立 commit message

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[checkin-standards.md](../../../../core/checkin-standards.md)
