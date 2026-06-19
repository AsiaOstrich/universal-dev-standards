---
source: options/testing/industry-pyramid.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# 业界测试金字塔

> **语言**: [English](../../../../options/testing/industry-pyramid.md) | 简体中文

**上层标准**: [测试完整性](../../core/test-completeness-dimensions.md)

---

## 概览

业界测试金字塔是一套务实的 4 层测试模型，广为敏捷与 DevOps 团队采用。它强调通过大量的 unit test 取得快速反馈、适量的 integration test、用于子系统验证的 system test，以及最少量的端到端测试。

## 最适用于

- 敏捷／Scrum 开发团队
- 以 CI/CD 为核心的环境
- 中小型项目
- DevOps 实践
- 快速迭代循环

## 金字塔

```
    ┌─────────┐
    │   E2E   │  ←  3% (Slow, expensive)
    ├─────────┤
    │   ST    │  ←  7% (Medium speed)
    ├─────────┤
    │   IT    │  ← 20% (Fast)
    ├─────────┤
    │   UT    │  ← 70% (Very fast, many)
    └─────────┘
```

**目标比例：** 70/20/7/3（UT/IT/ST/E2E）

**注意：** 此为 Mike Cohn 的经验性建议，并非强制标准。

**理由：**
- 较多 unit test = 更快的反馈
- 较少 E2E test = 较低的维护成本
- integration test 能捕捉接口问题
- system test 在 stub 外部依赖的情况下验证子系统行为

## 测试层级

### 单元测试（UT）- 70%

| 方面 | 细节 |
|--------|---------|
| **定义** | 针对单个函数、方法或类的隔离测试 |
| **范围** | 单一函数／方法／类 |
| **速度** | 每个测试 < 100ms |
| **依赖** | 全部 mock |

**特性：**
- 执行快速
- 结果具确定性
- 无 I/O 操作
- 测试单一行为单元

### 集成测试（IT）- 20%

| 方面 | 细节 |
|--------|---------|
| **定义** | 针对组件交互与数据流的测试 |
| **范围** | 多个组件相互作用 |
| **速度** | 每个测试 < 1 秒 |
| **依赖** | 真实与 mock 混合 |

**特性：**
- 测试真实的集成
- 可能使用容器（Testcontainers）
- 验证数据流

### 系统测试（ST）- 7%

| 方面 | 细节 |
|--------|---------|
| **定义** | 在 stub 外部依赖的情况下测试完整子系统 |
| **范围** | 完整子系统验证 |
| **速度** | 每个测试 < 10 秒 |
| **依赖** | 真实内部服务、stub 外部 API |

**特性：**
- 端到端验证子系统行为
- stub 外部依赖
- 在 SIT 环境中测试

### 端到端测试（E2E）- 3%

| 方面 | 细节 |
|--------|---------|
| **定义** | 跨整个系统测试完整用户工作流程 |
| **范围** | 从用户视角的完整用户流程 |
| **速度** | 每个测试 30 秒至数分钟 |
| **依赖** | 全部真实 |

**特性：**
- 模拟真实用户行为
- 仅测试关键路径
- 最高的维护成本

## 覆盖率目标

| 指标 | 最低 | 建议 |
|--------|---------|-------------|
| 行覆盖率（Line Coverage） | 70% | 85% |
| 分支覆盖率（Branch Coverage） | 60% | 80% |
| 函数覆盖率（Function Coverage） | 80% | 90% |

## 各层级工具

### 单元测试

| 语言 | 工具 |
|----------|-------|
| JavaScript | Jest, Vitest, Mocha |
| Python | pytest, unittest |
| Java | JUnit, TestNG |
| C# | xUnit, NUnit, MSTest |
| Go | testing package, testify |

### 集成测试

| 语言 | 工具 |
|----------|-------|
| JavaScript | Supertest, Testcontainers |
| Python | pytest, Testcontainers |
| Java | Spring Boot Test, Testcontainers |
| C# | WebApplicationFactory, Testcontainers |

### E2E 测试

| 语言 | 工具 |
|----------|-------|
| JavaScript | Playwright, Cypress, Puppeteer |
| Python | Playwright, Selenium |
| Java | Selenium, Playwright |

## 何时选择业界金字塔

**选择时机：**
- 实践敏捷／Scrum 方法论
- CI/CD 管线至关重要
- 快速反馈为优先
- 团队规模小且跨职能
- 期望最少的文档负担

**避免时机：**
- 需要正式 QA 认证
- 企业合规需求
- 专职 QA 团队偏好 ISTQB
- 需要审计文档

## 与 ISTQB 的比较

| 业界层级 | ISTQB 对应 | 注意 |
|----------------|------------------|------|
| 单元测试（UT） | Component Testing | 概念相同 |
| 集成测试（IT） | Integration Testing | 概念相同 |
| 系统测试（ST） | System Testing | 概念相同 |
| E2E 测试 | Acceptance Testing | 业界 E2E ≈ ISTQB Acceptance |

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| 遵循金字塔比例 | UT/IT/ST/E2E 目标 70/20/7/3 比例（经验性，非强制） | Required |
| 在最低层级测试 | 在能提供信心的最低层级编写测试 | Recommended |
| 边界情况避免用 E2E | 边界情况使用 unit test，而非 E2E | Recommended |
| 边界用集成测试 | 使用 integration test 验证接口契约 | Recommended |

## 相关选项

- [ISTQB 框架](./istqb-framework.md) - 正式的 4 层测试框架
- [单元测试](./unit-testing.md) - 详细的单元测试实践
- [集成测试](./integration-testing.md) - 集成测试实践
- [E2E 测试](./e2e-testing.md) - 端到端测试实践

---

## 参考资料

- [Martin Fowler's Testing Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [Google Testing Blog](https://testing.googleblog.com)

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
