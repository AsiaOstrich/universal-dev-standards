---
source: ../../../core/mutation-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 6a5286d76274
status: current
---

# 变异测试标准

> **语言**: [English](../../../core/mutation-testing.md) | [繁體中文](../../zh-TW/core/mutation-testing.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-05-04
**适用性**: 所有具备单元/集成测试的软件项目
**范围**: universal
**行业标准**: ISTQB Foundation Syllabus（测试有效性指标）
**参考**: "Introduction to Software Testing"（Ammann & Offutt）, Stryker Mutator 文档

---

## 目的

变异测试（mutation testing）通过注入人工 bug 并检查测试是否能检测到它们，来评估测试套件的有效性。它回答了行覆盖率无法回答的问题：**「我的测试真的在验证正确行为吗？」**

---

## 核心概念：Mutation Score

```
Mutation Score = Killed Mutants / (Killed + Survived) × 100%
```

- **Killed**：测试套件检测到人工 bug（测试失败）✅
- **Survived**：测试套件漏掉了 bug（测试仍通过）❌

一个只有 `expect(x).toBeDefined()` 的测试可以达到 100% 行覆盖率，却会让许多变异存活（因为 `x` 是 `null`、`0` 或 `"wrong"` 都满足 `.toBeDefined()`）。

---

## 工具

| 语言 | 工具 | 命令 |
|------|------|------|
| TypeScript/JS | Stryker Mutator | `npx stryker run` |
| Python | mutmut | `mutmut run` |
| Java | PIT (Pitest) | `mvn pitest:mutationCoverage` |

---

## 阈值

| 模块类型 | 最低分数 | 强制程度 |
|---------|---------|---------|
| Auth/License/Payment/Security | 80% | 阻断 release |
| 标准业务逻辑 | 70% | 警告；下次 release 前解决 |
| AI 生成的测试 | 50% | 必需；低于即拒绝 |
| 整体项目 | 60% | 跟踪趋势；回归时告警 |

---

## 何时运行

| 触发条件 | 命令 | 强制程度 |
|---------|------|---------|
| Pre-release 门禁 | `npm run test:mutation` | 整体 ≥ 60% |
| 关键模块变更 | `npx stryker run --mutate 'src/auth/**'` | ≥ 80% |
| AI 生成测试评审 | `npx stryker run` | ≥ 50% |

**绝不**把变异测试加入 commit hook——它太慢了（10-60 分钟）。

---

## Stryker 快速上手（TypeScript + Vitest）

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
```

```json
// stryker.config.json
{
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/license/**/*.ts", "!src/**/*.test.ts"],
  "thresholds": { "high": 80, "low": 60, "break": 50 }
}
```

---

## 反模式

- 把行覆盖率当作测试有效性的替代指标
- 在每个 PR 的 CI 中都加入变异测试（太慢）
- 未经 mutation score 验证就接受 AI 生成的测试
- 靠加 `toBeDefined()` 断言来杀死变异

---

## 与其他标准的关系

- `test-completeness-dimensions`：维度 8（AI 测试质量）引用 mutation score
- `mock-boundary`：空心测试会让许多变异存活；mock 边界规则防止空心测试
- `testing`：变异测试是测试金字塔顶端的质量门禁
