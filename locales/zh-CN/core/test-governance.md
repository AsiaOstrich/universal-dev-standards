---
source: ../../../core/test-governance.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-11
source_hash: 45e889042c57
status: current
---

# 测试治理标准

> **语言**: [English](../../../core/test-governance.md) | 简体中文

**版本**: 1.2.0
**最后更新**: 2026-08-14
**适用范围**: 所有软件项目
**范围**: universal

---

## 概述

测试治理标准定义测试活动的策略、完成条件和环境管理策略。本标准将 ISO/IEC/IEEE 29119 正式过程与敏捷/Scrum 实践相结合。

## 参考

| 标准/来源 | 内容 |
|-----------|------|
| ISO/IEC/IEEE 29119-2 | 测试过程 |
| ISO/IEC/IEEE 29119-3 | 测试文档（测试计划/测试用例） |
| ISO/IEC/IEEE 12207 | 验证过程 + 集成过程 |
| 敏捷/Scrum 指南 | 完成定义（DoD） |
| ISTQB 基础教学大纲 | 测试级别、测试类型 |
| Mike Cohn 测试金字塔 | 金字塔经验比例（推荐默认值） |

## 术语

| 术语 | 标准来源 | 描述 |
|------|---------|------|
| 完成定义（DoD） | 敏捷/Scrum | 任务/功能完成的检查清单 |
| 测试完成条件 | ISO 29119-2 | 测试活动的退出条件 |
| 系统集成测试 | ISO 12207 | 非 ISO 正式术语，但为行业标准 |
| 金字塔比例 70/20/7/3 | Mike Cohn（经验值） | 推荐默认值，非强制 |

---

## 测试策略

### 质量目标

| ID | 名称 | 度量 |
|----|------|------|
| QO-1 | 功能正确性 | 测试通过率 >= 95% |
| QO-2 | 回归预防 | CI 中零回归失败 |
| QO-3 | 代码质量 | 零 lint/类型错误，静态分析通过 |

### 级别归属

| 级别 | 负责人 | 环境 | 金字塔比例 |
|------|--------|------|-----------|
| 单元测试（UT） | 开发者 | local | 70% |
| 集成测试（IT） | 开发者 | local / ci | 20% |
| 系统测试（ST） | QA / 开发者 | ci / sit | 7% |
| E2E 测试 | QA | staging | 3% |

### 静态分析

在测试执行前运行静态分析工具：

- `ruff check .`（Python）
- `eslint .`（TypeScript/JavaScript）
- `mypy .`（Python 类型检查）

### 阈值关卡必须失败即关闭（Fail Closed）

一个只打印百分比、却不论该数值是否达到阈值都以 `0` 退出的度量层，是报告，而不是关卡。即使它打印的数值随着提交逐步下滑，它仍保持绿灯，也没有任何机制会阻止下一次合并。

每个带有通过/失败阈值的检查 — 覆盖率、lint、变异分数或任何其他有界度量 — 都必须将"低于阈值"转换为非零退出码，并使用工具自身的强制执行参数，而不是事后再解析打印输出的包装脚本：

| 工具 | 失败即关闭参数 |
|------|-------------------|
| pytest-cov | `--cov-fail-under=<N>` |
| coverage.py | `coverage report --fail-under=<N>` |
| diff-cover | `diff-cover coverage.xml --fail-under=<N>` |
| nyc / Istanbul | `--check-coverage --lines <N>` |
| Stryker Mutator | `stryker.config.json` 中的 `thresholds.break` |
| ESLint | `--max-warnings 0` |

一个计算数值、打印数值、然后总是 `exit 0` 的包装脚本，既不满足本规则，也不满足 `verification-evidence` 的证据有效性（Evidence Validity）规则 1 — 此时工具的退出码已不再携带任何关于其所度量产物的信息。

---

## 完成条件

测试完成条件定义测试活动何时可被视为已完成。
- **ISO 29119** 称之为"测试完成条件"（Test Completion Criteria）或"测试退出条件"（Test Exit Criteria）
- **敏捷/Scrum** 称之为"完成定义（DoD）"

### 任务级别

每个任务的完成条件（每个任务完成后检查）：

| 检查项 | 必需 | 描述 |
|--------|------|------|
| verify_command_passed | 是 | 任务的验证命令或各测试级别全部通过 |
| no_lint_errors | 是 | 变更文件中无 lint 错误 |
| type_check_passed | 是 | 类型检查通过 |

### 功能级别

每个功能的完成条件（在功能边界检查）：

| 检查项 | 必需 | 描述 |
|--------|------|------|
| all_tasks_passed | 是 | 功能中的所有任务均已成功完成 |
| acceptance_criteria_met | 是 | 所有验收条件均已验证 |
| no_regression | 是 | 没有破坏任何现有测试 |

### 发布级别

发布完成条件（在发布前检查）：

| 检查项 | 必需 | 描述 |
|--------|------|------|
| all_features_complete | 是 | 所有计划的功能均已完成 |
| e2e_pass | 是 | 完整 E2E 测试套件通过 |
| static_analysis_clean | 是 | 静态分析报告零问题 |
| documentation_updated | 否 | 文档反映了变更 |

---

## 环境管理

| 环境 | 描述 | 用途 | Mock 策略 |
|------|------|------|-----------|
| local | 开发者工作站 | 单元测试、快速集成测试 | 内存中的 mock 与 stub |
| ci | CI/CD 流水线 | 完整测试套件、lint、类型检查、静态分析 | 容器化依赖（testcontainers） |
| sit | 系统集成测试 | 与真实服务交互的系统测试 | 外部 API 使用 stub，内部服务使用真实服务 |
| staging | 预发布 | E2E 测试、冒烟测试 | 不使用 mock，使用真实外部服务 |

> **注意**：SIT = 系统集成测试（System Integration Testing），与 ISO 12207 验证过程 + 集成过程一致。

---

## 规则

| ID | 触发条件 | 指令 | 优先级 |
|----|---------|------|--------|
| enforce-completion-criteria | 完成任务或功能时 | 在将任务/功能标记为完成之前，验证所有必需的完成条件均已满足 | 必须 |
| pyramid-compliance | 规划测试策略时 | 以 70/20/7/3 金字塔比例作为指导方针。允许偏差，但需有文档记录的理由 | 必须 |
| sit-isolation | 运行系统测试时 | 系统测试应对外部依赖使用 stub，但使用真实的内部服务。使用 SIT 环境进行系统级验证 | 建议 |
| test-execution-continuity | 新增或完成测试用例时 | 测试用例必须连接到自动化执行触发器（CI gate、build hook 或定时执行）。存在但从未执行的测试会带来虚假的信心，比没有测试更糟。在将测试覆盖标记为完成前，请确认存在执行历史。 | 必须 |
| fail-closed-threshold-gate | 配置或审查任何覆盖率/lint/变异/其他阈值检查时 | 该检查必须使用工具的 fail-under（或等效）强制执行参数，使其在未达阈值时以非零退出。只打印数值且总是以 0 退出的脚本是报告而非关卡，不满足本规则 | 必须 |

---

## 模板

- [测试计划模板](../../../templates/test-plan-template.md) — 参考 ISO 29119-3
- [测试用例模板](../../../templates/test-case-template.md) — 参考 ISO 29119-3

---

## 相关标准

- [测试标准](testing-standards.md) — 测试金字塔与覆盖率比例
- [测试完整性维度](test-completeness-dimensions.md) — 8 维度测试覆盖
- [签入标准](checkin-standards.md) — 提交前质量关卡
- [验证证据](verification-evidence.md) — 证据有效性（Evidence Validity）规范退出码产生后应如何*解读*；`fail-closed-threshold-gate` 则规范关卡应如何*构建*，使退出码从一开始就携带真实信息

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-03-11 | 初始版本 — 测试策略、完成条件、环境管理 |
| 1.2.0 | 2026-08-14 | 新增 `fail-closed-threshold-gate` — 覆盖率/lint/变异阈值检查在低于阈值时必须以非零退出，而不只是打印数值 |
