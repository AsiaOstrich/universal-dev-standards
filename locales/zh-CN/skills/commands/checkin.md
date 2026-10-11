---
source: ../../../../skills/commands/checkin.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: e46beebc25e2
---

---
name: checkin
description: "[UDS] Pre-commit quality gates verification"
---

# 签入助手

在提交代码前验证品质关卡，确保代码库的稳定性。

## 用法

```bash
/checkin
```

## 工作流程

1. **检查 git 状态** - 执行 `git status` 和 `git diff` 了解待处理的变更
2. **运行测试** - 执行 `npm test`（或专案测试命令）验证所有测试通过
3. **运行代码检查** - 执行 `npm run lint` 检查代码风格合规性
4. **验证品质关卡** - 根据以下检查清单检查每个关卡
5. **报告结果** - 呈现通过/失败摘要并建议下一步

## 品质关卡

| 关卡 | 检查项目 |
|------|----------|
| **构建** | 编译零错误 |
| **测试** | 所有测试通过（100%） |
| **覆盖率** | 覆盖率未下降 |
| **AC 覆盖率** | AC 到测试覆盖率 ≥ 80%（[`/ac-coverage`](./ac-coverage.md)） |
| **代码品质** | 符合编码规范，无代码异味 |
| **安全性** | 无硬编码密钥或漏洞 |
| **文档** | API 文档和 CHANGELOG 已按需更新 |
| **工作流** | 分支命名和提交消息格式正确 |

## 禁止提交的情况

- 构建有错误
- 测试失败
- 功能不完整会破坏现有功能
- 包含调试代码（console.log, print）
- 包含被注释的代码区块

## 后续步骤

验证通过后，执行 `/commit` 创建提交消息。

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/checkin` | 自动执行所有品质关卡检查 |

### 交互脚本

1. 执行 `git status` 确认有待提交的变更
2. 依序检查每个品质关卡：
   - Build → Tests → Coverage → Code Quality → Security → Documentation → Workflow
3. 为每个关卡标记 ✅ PASS / ❌ FAIL
4. 生成摘要报告

**Decision: 测试命令检测**
- IF 专案有 `package.json` → 使用 `npm test`
- IF 专案有 `pyproject.toml` → 使用 `pytest`
- IF 无法检测 → 询问用户

**Decision: 检查结果**
- IF 全部通过 → 建议执行 `/commit`
- IF 有 FAIL → 列出失败项目和修复建议，不建议 commit

🛑 **STOP**: 报告展示后等待用户决定（修复 or 强制 commit）

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 品质报告展示后 | 用户决定修复或 commit |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无待提交变更 | 告知无变更可检查 |
| 测试命令执行失败 | 报告错误，建议检查测试环境 |
| lint 工具未安装 | 跳过该关卡，标记 ⚠️ SKIP |

## 参考

*   [Check-in Assistant Skill](../checkin-assistant/SKILL.md)
*   [Core Standard](../../core/checkin-standards.md)
*   [AC Coverage Command](./ac-coverage.md) — AC 到测试追踪分析
*   [AC Traceability Standard](../../core/acceptance-criteria-traceability.md)
