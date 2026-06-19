---
source: options/testing/istqb-framework.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# ISTQB 测试框架

> **语言**: [English](../../../../options/testing/istqb-framework.md) | 简体中文

**上层标准**: [Testing Completeness](../../core/test-completeness-dimensions.md)

---

## 概览

ISTQB（International Software Testing Qualifications Board，国际软件测试认证委员会）测试框架提供标准化的四层测试模型。它具备正式的结构、明确的文档要求，并在企业环境中广泛采用。

## 最适用场景

- 需要正式 QA 流程的企业项目
- 需要认证或合规的项目
- 设有专职 QA 团队的组织
- 瀑布式或混合式开发方法论
- 具备严格审计要求的项目

## 测试级别（Testing Levels）

### 1. 单元测试（Unit Testing, UT）

| 方面 | 说明 |
|--------|---------|
| **ISTQB 术语** | Component Testing（组件测试） |
| **定义** | 隔离地测试单个软件组件 |
| **目的** | 验证代码单元是否正确运行 |
| **执行者** | 开发人员 |

### 2. 集成测试（Integration Testing, IT/SIT）

| 方面 | 说明 |
|--------|---------|
| **ISTQB 术语** | Integration Testing（集成测试） |
| **缩写** | IT 或 SIT |
| **定义** | 测试已集成组件之间的接口与交互 |
| **目的** | 验证组件之间的交互 |
| **执行者** | 开发人员或 QA |

**注意：**
- IT（Integration Testing，集成测试）：常见于 Agile/DevOps 环境
- SIT（System Integration Testing，系统集成测试）：常见于 Enterprise/ISTQB 场景
- 两个术语指的是同一个测试级别

### 3. 系统测试（System Testing, ST）

| 方面 | 说明 |
|--------|---------|
| **ISTQB 术语** | System Testing（系统测试） |
| **定义** | 测试完整集成后的系统，以验证其是否满足需求 |
| **目的** | 验证系统是否满足功能性与非功能性需求 |
| **执行者** | QA 团队 |

### 4. 验收测试（Acceptance Testing, AT/UAT）

| 方面 | 说明 |
|--------|---------|
| **ISTQB 术语** | Acceptance Testing（验收测试） |
| **缩写** | AT 或 UAT |
| **定义** | 进行测试以判定系统是否满足业务需求 |
| **目的** | 验证系统是否符合业务需求 |
| **执行者** | 终端用户或业务利益相关方 |

**子类型：**
- **用户验收测试（User Acceptance Testing, UAT）：** 由实际用户进行验证
- **合同验收测试（Contract Acceptance Testing）：** 对照合同条件进行验证
- **法规验收测试（Regulatory Acceptance Testing）：** 合规性验证

## 测试类型（Test Types）

### 功能性测试（Functional Testing）

- 功能测试（Functional testing）
- 用户界面测试（User interface testing）
- 回归测试（Regression testing）

### 非功能性测试（Non-Functional Testing）

- 性能测试（Performance testing）
- 安全测试（Security testing）
- 可用性测试（Usability testing）
- 可靠性测试（Reliability testing）

## 何时选择 ISTQB

**适合选择的情况：**
- 需要正式的测试文档
- 与 QA 认证机构合作
- 具备合规要求的企业环境
- 团队中包含 ISTQB 认证的专业人员
- 重视审计轨迹（audit trail）

**应避免的情况：**
- 以快速迭代为优先
- 没有专职 QA 的小型团队
- 纯 DevOps／持续交付（Continuous Delivery）导向
- 在意文档开销（documentation overhead）

## 与 Industry Pyramid 的比较

| ISTQB 级别 | 业界对应 | 主要差异 |
|-------------|---------------------|----------------|
| Unit Testing | Unit Testing (UT) | 概念相同 |
| Integration Testing | Integration Testing (IT/SIT) | 概念相同，缩写惯例不同 |
| System Testing | 通常与 E2E 合并 | ISTQB 将系统验证与用户验收分开 |
| Acceptance Testing | E2E 的一部分 | ISTQB 设有专属级别进行业务验证 |

## 规则

| 规则 | 说明 | 优先级 |
|------|-------------|----------|
| 四层结构 | 采用 4 个级别：UT → IT/SIT → ST → AT/UAT，并设有进入／退出条件（entry/exit criteria） | Required |
| 需求可追溯性 | 每个测试用例应可追溯至某项需求 | Required |
| 缺陷分类 | 依 ISTQB 准则按严重性（severity）与优先级（priority）分类缺陷 | Recommended |

## 相关选项

- [Industry Pyramid](./industry-pyramid.md) - Agile 三层测试模型
- [Unit Testing](./unit-testing.md) - 详细的单元测试实践
- [System Testing](./system-testing.md) - 系统测试实践

---

## 参考资料

- [ISTQB Glossary v4.0](https://glossary.istqb.org)
- [ISTQB Foundation Level Syllabus](https://www.istqb.org/certifications/certified-tester-foundation-level)

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
