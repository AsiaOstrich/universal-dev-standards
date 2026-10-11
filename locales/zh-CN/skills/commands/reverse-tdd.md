---
source: ../../../../skills/commands/reverse-tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 63db65495ddc
status: current
---

---
description: [UDS] Analyze BDD-TDD coverage gaps
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[feature file or test directory | Feature 文件或测试目录]"
---

# /reverse-tdd — Analyze BDD-TDD Coverage Gaps | 分析 BDD-TDD 覆盖差距

Analyze gaps between BDD scenarios and TDD test coverage.

分析 BDD 场景与 TDD 测试覆盖之间的差距。

## Workflow | 工作流程

```
.feature + tests/ ──► Map Scenarios ──► Find Gaps ──► Report
```

1. **解析**现有 `.feature` 文件中的场景
2. **扫描**测试文件中对应的单元测试
3. **映射** BDD 场景到 TDD 测试覆盖
4. **识别**覆盖差距（没有单元测试的场景）
5. **生成**差距报告及建议

## Output Format | 输出格式

```markdown
# BDD-TDD Coverage Gap Analysis

## Coverage Summary
- Total BDD Scenarios: 12
- Covered by TDD: 9 (75%)
- Gaps Found: 3

## Gaps
| Scenario | Feature File | Missing TDD |
|----------|-------------|-------------|
| Password reset | auth.feature:15 | No unit test for token validation |
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/reverse-tdd features/` | Analyze all feature files | 分析所有 feature 文件 |
| `/reverse-tdd features/auth.feature` | Analyze specific feature | 分析特定 feature |

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/reverse-tdd` | 询问要分析的 feature 文件或测试目录 |
| `/reverse-tdd <path>` | 直接分析指定路径 |

### Interaction Script | 交互脚本

1. 解析 `.feature` 文件中的所有场景
2. 扫描测试目录寻找对应的单元测试
3. 建立 BDD 场景 → TDD 测试的对应关系
4. 识别覆盖差距（有场景无对应测试）
5. 生成差距报告

**Decision: 差距严重度**
- IF 覆盖率 ≥ 80% → 标记为 ✅ Good，列出剩余差距
- IF 覆盖率 50-79% → 标记为 ⚠️ Needs Improvement，建议优先补测试的场景
- IF 覆盖率 < 50% → 标记为 ❌ Critical，建议系统性补强

🛑 **STOP**: 展示差距报告后等待用户决定下一步

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 差距报告展示后 | 用户决定是否要 AI 协助补测试 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无 `.feature` 文件 | 引导到 `/derive-bdd` 或 `/reverse-bdd` 先生成 |
| 测试目录为空 | 报告 0% 覆盖率，建议从 `/derive-tdd` 生成骨架 |
| 场景与测试命名不一致无法自动对应 | 列出无法对应的项目，询问用户手动确认 |

## Reference | 参考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
