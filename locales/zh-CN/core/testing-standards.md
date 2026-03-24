---
source: ../../../core/testing-standards.md
source_version: 3.1.0
translation_version: 3.1.0
last_synced: 2026-03-25
status: current
---

# 测试标准

> **语言**: [English](../../../core/testing-standards.md) | [繁體中文](../../zh-TW/core/testing-standards.md) | 简体中文

**版本**: 3.1.0
**最后更新**: 2026-03-24
**适用性**: 所有软件项目
**范围**: universal
**行业标准**: ISTQB CTFL v4.0, ISO/IEC/IEEE 29119
**参考**: [istqb.org](https://istqb.org/)

---

## 目的

本标准为 AI 代理和开发者定义可操作的测试规则和约定。如需理论基础、教学内容和详细示例，请参阅[测试理论知识库](../../../skills/testing-guide/testing-theory.md)。

**参考标准**:
- [ISTQB CTFL v4.0](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering)

---

## 术语表

| 缩写 | 全称 | 说明 |
|------|------|------|
| **UT** | Unit Testing | 以隔离方式测试单个函数/方法 |
| **IT** | Integration Testing | 测试组件之间的交互 |
| **ST** | System Testing | 测试完整的集成系统 |
| **AT** | Acceptance Testing | 根据业务验收标准进行测试 |
| **E2E** | End-to-End Testing | 测试完整的用户工作流 |
| **UAT** | User Acceptance Testing | 由最终用户执行的验收测试 |
| **SIT** | System Integration Testing | 多系统之间的集成测试 |

> **注意**: 本文档中的 "IT" 始终指 "Integration Testing"（集成测试），而非 "Information Technology"（信息技术）。

---

## 覆盖率目标（主要指标）

> **覆盖率是测试质量的主要指标。** 更高的覆盖率代表更多代码受到测试保护。
> **覆蓋率是測試品質的主要指標。** 更高的覆蓋率代表更多程式碼受到測試保護。

| 指标 | 最低要求 | 标准 | 理想 |
|------|----------|------|------|
| **行覆盖率** | 80% | 90% | 95%+ |
| **分支覆盖率** | 70% | 85% | 90%+ |
| **函数覆盖率** | 85% | 95% | 100% |
| **变异评分** | — | 80% | 90%+（关键代码） |

**级别定义:**
- **最低要求**: 所有项目的基线——低于此值存在质量风险
- **标准**: 大多数项目的目标——通过规范化测试可以达成
- **理想**: 关键系统和核心业务逻辑的目标——在可行的范围内力争 100%

> **实用指南**: 100% 覆盖率是理想目标。在实践中，行覆盖率超过 95% 后会出现收益递减。最后的 5% 应聚焦于关键路径（身份认证、支付、数据完整性），而非生成的代码或简单的 getter/setter。

---

## 覆盖率与占比——关键区别

> **AI 代理和开发者：请勿混淆这两个概念。**

| 概念 | 含义 | 重要性 |
|------|------|--------|
| **Coverage（覆盖率）** | 测试执行的代码百分比 | **主要指标**——衡量保护程度 |
| **Ratio（占比）** | 各级别测试数量的分布 | 仅供参考——影响执行时间 |

**覆盖率**回答的是: "我的代码有多少被测试覆盖了？"
**占比**回答的是: "我的测试中，单元测试、集成测试、端到端测试各占多少比例？"

---

## 测试框架选择

| 框架 | 级别 | 最适用于 |
|------|------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企业级、合规性、正式 QA |
| **行业金字塔** | UT → IT → ST → E2E | 敏捷、DevOps、CI/CD |

---

## 测试金字塔（测试数量占比——仅供参考）

> **注意**: 以下是测试**数量**占比（各级别有多少测试），而非覆盖率目标。覆盖率要求请参阅上方的[覆盖率目标](#覆盖率目标主要指标)。

| 级别 | 测试数量占比 | 执行时间目标 |
|------|-------------|-------------|
| 单元测试 (UT) | 约 70% 的测试 | 总计 < 10 分钟 |
| 集成测试 (IT) | 约 20% 的测试 | 总计 < 30 分钟 |
| 系统测试 (ST) | 约 7% 的测试 | 总计 < 1 小时 |
| 端到端测试 (E2E) | 约 3% 的测试 | 总计 < 2 小时 |

> 70/20/7/3 的比例是经验性建议（Mike Cohn）。它针对快速反馈进行了优化——大多数测试运行迅速（UT），较少的测试运行缓慢（E2E）。

---

## 测试级别要求

### 单元测试 (UT)

**特征**: 隔离的、快速的（每个 < 100ms）、确定性的

#### 范围

| 包含 | 排除 |
|------|------|
| 单个函数/方法 | 数据库查询 |
| 单个类 | 外部 API 调用 |
| 纯业务逻辑 | 文件 I/O 操作 |
| 数据转换 | 多类交互 |
| 验证规则 | 网络调用 |

#### 命名约定

**文件命名**:
```
[ClassName]Tests.[ext]      # C#
[ClassName].test.[ext]      # TypeScript/JavaScript
[class_name]_test.[ext]     # Python, Go
```

**方法命名**（每个项目选择一种）:

| 风格 | 最适用于 | 示例 |
|------|----------|------|
| `[Method]_[Scenario]_[Result]` | C#, Java | `CalculateTotal_NegativePrice_ThrowsException()` |
| `should_[behavior]_when_[condition]` | JavaScript/TypeScript | `should_reject_login_when_account_locked()` |
| `test_[method]_[scenario]_[expected]` | Python (pytest) | `test_validate_email_invalid_format_returns_false()` |

#### 覆盖率阈值

> 请参阅本文档顶部的[覆盖率目标](#覆盖率目标主要指标)获取权威的覆盖率要求。

---

### 集成测试 (IT)

**特征**: 组件集成、真实依赖（通常使用容器化）、每个 1-10 秒

#### 何时需要

**决策规则**: 如果你的单元测试使用了通配匹配器（`any()`、`It.IsAny<>`、`Arg.Any<>`）来匹配查询/过滤参数，该功能**必须**有一个集成测试。

| 场景 | 原因 |
|------|------|
| 查询谓词 | Mock 无法验证过滤表达式 |
| 实体关系 | 验证外键正确性 |
| 复合键 | 内存数据库可能与实际数据库不同 |
| 字段映射 | DTO ↔ Entity 转换 |
| 分页 | 行排序和计数 |
| 事务 | 回滚行为 |

#### 范围

| 包含 | 排除 |
|------|------|
| 数据库 CRUD 操作 | 完整用户工作流 |
| Repository + Database | 跨服务通信 |
| Service + Repository | UI 交互 |
| API 端点 + Service 层 | |
| 消息队列生产者/消费者 | |
| 缓存读写操作 | |

#### 命名约定

```
[ComponentName]IntegrationTests.[ext]
[ComponentName].integration.test.[ext]
[ComponentName].itest.[ext]
```

---

### 系统测试 (ST)

**特征**: 完整系统、类生产环境、基于需求

#### 范围

| 包含 | 排除 |
|------|------|
| 完整 API 工作流 | UI 视觉测试 |
| 跨服务事务 | 用户旅程模拟 |
| 整个系统的数据流 | A/B 测试场景 |
| 安全需求 | |
| 负载下的性能 | |
| 错误处理与恢复 | |

#### 类型

| 类型 | 说明 |
|------|------|
| 功能测试 | 验证功能按规格运作 |
| 性能测试 | 负载、压力、可扩展性测试 |
| 安全测试 | 渗透测试、漏洞扫描 |
| 可靠性测试 | 故障转移、恢复、稳定性 |
| 兼容性测试 | 跨平台、浏览器兼容性 |

#### 命名约定

```
[Feature]SystemTests.[ext]
[Feature].system.test.[ext]
[Feature]_st.[ext]
```

---

### 端到端测试 (E2E)

**特征**: 用户视角、全栈（UI → API → Database）、最慢（每个 30 秒以上）

#### 范围

| 包含 | 排除 |
|------|------|
| 关键用户旅程 | 所有可能的用户路径 |
| 登录/认证流程 | 边缘情况（使用 UT/IT） |
| 核心业务交易 | 性能基准测试 |
| 跨浏览器功能 | |
| 部署冒烟测试 | |

#### 命名约定

```
[UserJourney].e2e.[ext]
[Feature].e2e.spec.[ext]
e2e/[feature]/[scenario].[ext]
```

---

## 测试替身

| 类型 | 目的 | 何时使用 |
|------|------|----------|
| **Stub** | 返回预定义值 | 固定的 API 响应 |
| **Mock** | 验证交互 | 验证方法被调用 |
| **Fake** | 简化的实现 | 内存数据库 |
| **Spy** | 记录调用，委托给真实对象 | 部分 Mock |
| **Dummy** | 占位符，从不使用 | 填充必需参数 |

### 按测试级别的使用指南

| 级别 | 指南 |
|------|------|
| **UT** | 对所有外部依赖使用 Mock/Stub |
| **IT** | 对数据库使用 Fake，对外部 API 使用 Stub |
| **ST** | 使用真实组件，仅对外部第三方使用 Fake |
| **E2E** | 使用全部真实组件；仅对外部支付/邮件使用 Stub |

---

## Mock 的局限性

**问题**: 通配匹配器（`any()`、`It.IsAny<>`）会忽略实际的查询逻辑，允许不正确的查询通过。

**规则**: 如果 Mock 的方法接受查询/过滤/谓词参数，你**必须**有一个对应的集成测试来验证查询逻辑。

```python
# 示例 - Python
# ❌ 此测试无法验证查询的正确性
mock_repo.find.return_value = users

# ✓ 添加集成测试来验证实际查询
```

---

## 测试数据要求

### 原则

1. **隔离性**: 每个测试管理自己的数据
2. **清理**: 测试在执行后自行清理
3. **确定性**: 测试不依赖共享状态
4. **可读性**: 测试数据清晰地表达意图

### 不同标识符规则

当实体同时具有代理键（自动生成的 ID）和业务标识符时，测试数据**必须**为每个键使用不同的值。

```python
# ❌ 错误: id 等于 business_code — 映射错误不会被检测到
dept = Department(id=1, business_code=1)

# ✓ 正确: 不同的值可以捕获映射错误
dept = Department(id=1, business_code=1001)
```

### 复合键规则

对于具有复合主键的实体，确保每条记录具有唯一的键组合。

```python
# ❌ 键冲突
batch1 = BatchRecord(id=0, send_time=now)
batch2 = BatchRecord(id=0, send_time=now)  # 冲突！

# ✓ 唯一组合
batch1 = BatchRecord(id=0, send_time=now + timedelta(seconds=1))
batch2 = BatchRecord(id=0, send_time=now + timedelta(seconds=2))
```

---

## 测试环境

### 语言特定工具

| 语言 | 版本管理器 | 锁定文件 |
|------|-----------|----------|
| Python | venv, virtualenv, poetry | requirements.txt, poetry.lock |
| Node.js | nvm, fnm | package-lock.json, yarn.lock |
| Ruby | rbenv, rvm | Gemfile.lock |
| Java | SDKMAN, jenv | pom.xml, build.gradle.lock |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |
| Rust | rustup, cargo | Cargo.lock |

### 最佳实践

1. **始终使用虚拟环境**进行开发和测试
2. **提交锁定文件**到版本控制
3. **在 CI/CD 管道中固定版本**
4. **在 README 或 .tool-versions 中记录所需的运行时版本**

### 按测试级别的容器使用

| 级别 | 容器使用 |
|------|----------|
| UT | 不需要 - 使用 Mock |
| IT | 使用 Testcontainers 处理数据库、缓存 |
| ST | 使用 Docker Compose 搭建完整环境 |
| E2E | 完整的容器化堆栈 |

---

## CI/CD 集成

### 测试执行策略

| 阶段 | 何时执行 | 超时 |
|------|----------|------|
| 单元测试 | 每次提交 | 10 分钟 |
| 集成测试 | 每次提交 | 30 分钟 |
| 系统测试 | PR 合并到 main | 2 小时 |
| 端到端测试 | 发布候选版 | 4 小时 |

### 必需指标

| 指标 | UT | IT | ST | E2E |
|------|----|----|----|----|
| 通过/失败计数 | 必需 | 必需 | 必需 | 必需 |
| 执行时间 | 必需 | 必需 | 必需 | 必需 |
| 覆盖率 % | 必需 | 必需 | 可选 | 不需要 |
| 不稳定测试率 | 必需 | 必需 | 必需 | 必需 |
| 截图/视频 | 不需要 | 不需要 | 可选 | 必需 |

---

## 最佳实践

### AAA 模式

```
// Arrange - 设置测试数据和环境
// Act - 执行被测行为
// Assert - 验证结果
```

### FIRST 原则

| 原则 | 说明 |
|------|------|
| **F**ast（快速） | 测试运行迅速 |
| **I**ndependent（独立） | 测试之间互不影响 |
| **R**epeatable（可重复） | 每次结果相同 |
| **S**elf-validating（自验证） | 清晰的通过/失败 |
| **T**imely（及时） | 与生产代码同步编写 |

### 应避免的反模式

- 测试相互依赖（测试必须按特定顺序运行）
- 不稳定测试（有时通过，有时失败）
- 测试实现细节（重构时测试就会失败）
- 过度 Mock（没有真实的东西被测试）
- 缺少断言（测试没有验证任何有意义的内容）
- 魔术数字/字符串（未解释的值）
- 相同的测试 ID（代理键和业务键使用相同的值）

---

## 测试文档结构

### tests/README.md 必需章节

每个 `tests/` 目录**应该**包含一个 README.md，包含以下内容：

#### 1. 测试概览表

| 测试类型 | 数量 | 框架 | 环境 |
|----------|------|------|------|
| 单元测试 | 150 | Jest | Node.js |
| 集成测试 | 45 | Jest | Node.js + TestContainers |
| 端到端测试 | 12 | Playwright | Browser |

#### 2. 当前状态章节

| 指标 | 值 | 目标 | 状态 |
|------|-----|------|------|
| 通过率 | 98.5% | >= 95% | 通过 |
| 行覆盖率 | 82% | >= 80% | 通过 |
| 分支覆盖率 | 75% | >= 70% | 通过 |

#### 3. 报告链接章节

| 报告类型 | 位置 | 说明 |
|----------|------|------|
| 测试结果 | `results/` | 带时间戳的执行报告 |
| 覆盖率 | `coverage/` | 代码覆盖率报告 |
| 差距分析 | `docs/gap-analysis.md` | 缺失覆盖率分析 |

### 测试报告命名约定

| 项目 | 约定 | 示例 |
|------|------|------|
| 报告文件名 | `test-report-YYYYMMDD-HHMMSS.md` | `test-report-20260129-143000.md` |
| 报告目录 | `tests/results/` | |
| 覆盖率目录 | `tests/coverage/` | |

### 目录结构

```
tests/
├── README.md                    # 测试概览和状态
├── results/                     # 测试执行报告
├── coverage/                    # 覆盖率报告
├── docs/                        # 测试文档
├── unit/                        # 单元测试
├── integration/                 # 集成测试
└── e2e/                         # 端到端测试
```

---

---

## 相关标准

- [测试理论知识库](../../../skills/testing-guide/testing-theory.md) - 教学内容、示例、技术
- [测试驱动开发](test-driven-development.md) - TDD/BDD/ATDD 方法论
- [测试完整度维度](test-completeness-dimensions.md) - 8 维度测试覆盖
- [规格驱动开发](spec-driven-development.md) - SDD 工作流集成
- [代码签入标准](checkin-standards.md)
- [代码审查清单](code-review-checklist.md)
- [部署标准](deployment-standards.md) - 部署就绪的测试要求

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 3.1.0 | 2026-03-24 | **覆盖率优先重构**: 将覆盖率目标提升为主要位置，提高阈值（行 80/90/95+、分支 70/85/90+、函数 85/95/100），新增覆盖率与占比的区分，将测试金字塔降级为仅供参考 |
| 3.0.0 | 2026-01-29 | **重大重构**: 拆分为规则（本文件）和理论（testing-theory.md）。从 141KB/3185 行缩减至约 12KB/350 行。所有教学内容迁移至 skills/testing-guide/testing-theory.md。纯规则格式，针对 AI 代理使用进行优化。 |
| 2.2.0 | 2026-01-20 | 新增测试文档结构章节 |
| 2.1.0 | 2026-01-05 | 新增 SWEBOK v4.0 参考、测试基础、测试相关度量 |
| 2.0.0 | 2026-01-05 | 重大更新，对齐 ISTQB CTFL v4.0 和 ISO/IEC/IEEE 29119 |
| 1.3.0 | 2025-12-29 | 新增测试框架选择、IT/SIT 缩写说明 |
| 1.2.0 | 2025-12-19 | 新增 Mock 局限性、集成测试要求、测试数据模式 |
| 1.1.1 | 2025-12-11 | 改进系统测试示例，使用通用领域概念 |
| 1.1.0 | 2025-12-05 | 新增测试环境隔离章节 |
| 1.0.0 | 2025-12-05 | 初始测试标准，包含 UT/IT/ST/E2E 覆盖 |

---

## 许可证

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

---

**维护者**: Development Team
