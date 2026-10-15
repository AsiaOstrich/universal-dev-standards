---
source: ../../../core/mutation-testing.md
source_version: 1.1.0
translation_version: 1.0.0
last_synced: 2026-10-15
source_hash: 8eeaea8d9cc3
status: current
---

# 变异测试标准

> **语言**: [English](../../../core/mutation-testing.md) | [繁體中文](../../zh-TW/core/mutation-testing.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-08-14
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

## 归因：kill 记给第一个失败的测试

`Killed` 表示本次运行中*有某个*测试对该变异体断言失败——大多数工具不会记录是*哪个*测试杀死了它，更不会记录是*哪个测试层级*。因此 7/7 的 kill score 验证的是**对该变异体运行过的整套测试**，而不是任何单个测试，也不是任何单个测试层级（unit vs. integration vs. property）。

**后果**：“property suite 验证了 X”并不是一次聚合的 mutation run 所能支持的主张。要支持它，必须*只启用* property suite 重新运行变异测试：

```bash
npx stryker run --mutate 'src/module/**' -- --project=property
```

如果隔离运行杀死的变异体少于聚合运行，这个差距正是 unit/integration 测试原本悄悄覆盖掉的部分。

**规则**：高风险模块（与 80% 阈值适用的同一集合——auth/license/payment/security）在宣称“已被 property 验证”之前，必须先单独针对 property suite 重新运行变异体。

---

## 单边不变式抓不到 fail-closed 缺陷

像“输出永不超出上限”这种性质是单边的：它无法检测到使代码 **fail closed**（拒绝一切，包括合法输入）的变异体——因为 fail-closed 的变异体永远不会产生超过上限的输出。Mutation score 看起来未受影响，而整整一类缺陷（拒绝服务、错误拒绝合法请求）对测试套件完全隐形。

**修复方法**：将每个单边不变式与其相反边界配对。“永不超出上限”需要一个搭档性质——例如“接受上限及以下的一切输入”——以便过度宽容和过度严格的变异体都有一条被检测到的路径。

---

## Equivalent mutant 不是要追杀的存活者

存活的变异体并不自动等同于测试缺口。有些变异体与原始代码**语义等价**——没有任何输入能区分两者的行为——无论测试怎么写都无法杀死它们。用一个仅仅为了推高分数而存在的断言（例如对一个无关紧要的值加上 `expect(x).toBeDefined()`）硬杀，只会制造一个空心测试，而没有真正填补任何缺口。

**每个被审查过的存活者都必须分类**：
- **真实缺口** → 编写一个能触发该可区分行为的测试。
- **`equivalent, because <reason>`** → 连同为了得出此结论而检查过的输入一并记录。

未分类的存活者不等于已分类为 equivalent 的存活者。只有已分类为 equivalent 的变异体，才可以从分母中排除。

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
- 仅凭一次聚合（非隔离）的 mutation run 就宣称“property suite 验证了 X”
- 对具有 fail-closed 失效模式的性质，只使用单边不变式
- 对语义等价的变异体强行杀死，而不是分类为 `equivalent, because <reason>`

---

## 与其他标准的关系

- `test-completeness-dimensions`：维度 8（AI 测试质量）引用 mutation score
- `mock-boundary`：空心测试会让许多变异存活；mock 边界规则防止空心测试
- `testing`：变异测试是测试金字塔顶端的质量门禁
