---
source: ../../../core/testing-standards.md
source_version: 3.0.0
translation_version: 3.0.0
last_synced: 2026-02-10
status: current
---

> **语言**: [English](../../../core/testing-standards.md) | [简体中文](../../zh-TW/core/testing-standards.md) | 简体中文

# 测试标准

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: 所有需要自动化测试的软件项目

---

## 目的

本标准定义测试策略和最佳实践，确保代码质量和可维护性。

---

## 测试金字塔

### 框架选项

根据项目需求选择测试框架：

| 框架 | 最适合 | 级别 |
|------|-------|------|
| ISTQB 标准 | 企业项目、认证需求、正式 QA 流程 | 4 级 |
| 业界金字塔 | 敏捷开发、CI/CD 优化、快速迭代 | 3 级 |

### 业界金字塔（默认）

```
        /\
       /  \        E2E 测试 (10%)
      /----\
     /      \      集成测试 (20%)
    /--------\
   /          \    单元测试 (70%)
  /------------\
```

| 级别 | 缩写 | 比例 | 范围 | 速度 |
|------|-----|------|------|------|
| 单元测试 | UT | 70% | 单一函数/方法 | <100ms |
| 集成测试 | IT/SIT* | 20% | 多个组件 | <1s |
| 端到端测试 | E2E | 10% | 用户流程 | >10s |

*注：IT（敏捷/DevOps）或 SIT（企业/ISTQB）- 两者都指集成测试

### ISTQB 标准框架

| 级别 | 缩写 | 说明 | 负责人 |
|------|-----|------|-------|
| 单元测试 | UT | 验证代码单元 | 开发者 |
| 集成测试 | IT/SIT | 验证组件交互 | 开发者/QA |
| 系统测试 | ST | 验证系统符合需求规格 | QA |
| 验收测试 | AT/UAT | 验证系统符合业务需求 | 用户/业务方 |

---

## FIRST 原则

| 原则 | 说明 |
|------|------|
| **F**ast | 测试执行要快 |
| **I**ndependent | 测试之间相互独立 |
| **R**epeatable | 每次执行结果一致 |
| **S**elf-validating | 自动判断通过/失败 |
| **T**imely | 及时编写测试 |

---

## 测试结构

### AAA 模式

```javascript
describe('UserService', () => {
  it('should return user when valid id provided', () => {
    // Arrange（准备）
    const userId = 1;
    const expectedUser = { id: 1, name: 'John' };

    // Act（执行）
    const result = userService.getUser(userId);

    // Assert（断言）
    expect(result).toEqual(expectedUser);
  });
});
```

### 命名规范

```
should_<expected behavior>_when_<condition>
test_<method>_<condition>_<expected result>
```

**好的示例**:
- `should_return_user_when_valid_id_provided`
- `test_login_fails_with_invalid_credentials`

**差的示例**:
- `test1`
- `testLogin`

---

## 测试替身

| 类型 | 用途 | 使用场景 |
|------|------|---------|
| Stub | 返回预设响应 | 简单依赖 |
| Mock | 验证交互 | 复杂依赖 |
| Fake | 工作中的实现 | 数据库/外部服务 |
| Spy | 记录调用 | 验证行为 |
| Dummy | 填充参数 | 未使用的参数 |

---

## 覆盖率指标

| 指标 | 最低要求 | 建议目标 |
|------|---------|---------|
| 语句覆盖率 | 70% | 80% |
| 分支覆盖率 | 60% | 75% |
| 函数覆盖率 | 80% | 90% |

---

## 测试文档结构

通过在测试目录中维护标准化的文档结构，提升测试可发现性。

### tests/README.md 必要区块

每个 `tests/` 目录应包含 README.md，并具备以下区块以提高可发现性。

#### 1. 测试总览表格

列出所有测试类型、数量、技术栈和执行环境。

```markdown
| 测试类型 | 数量 | 框架 | 环境 |
|----------|------|------|------|
| 单元测试 | 150 | Jest | Node.js |
| 集成测试 | 45 | Jest | Node.js + TestContainers |
| E2E 测试 | 12 | Playwright | 浏览器 |
```

#### 2. 当前状态区块

显示最新测试执行结果，包含清楚的通过/失败指标。

```markdown
## 当前状态

| 指标 | 数值 | 目标 | 状态 |
|------|------|------|------|
| 通过率 | 98.5% | ≥ 95% | ✅ |
| 行覆盖率 | 82% | ≥ 80% | ✅ |
| 分支覆盖率 | 75% | ≥ 70% | ✅ |

**最后执行**: 2026-01-20 14:30 UTC
**报告**: [test-report-20260120-143000.md](results/test-report-20260120-143000.md)
```

#### 3. 报告链接区块

包含测试报告、差距分析和覆盖率摘要的链接。

```markdown
## 报告

| 报告类型 | 位置 | 说明 |
|----------|------|------|
| 测试结果 | `results/` | 带时间戳的测试执行报告 |
| 覆盖率 | `coverage/` | 代码覆盖率报告（HTML、JSON） |
| 差距分析 | `docs/gap-analysis.md` | 缺失的测试覆盖率分析 |
```

### 测试报告命名规范

| 项目 | 规范 | 范例 |
|------|------|------|
| 报告文件名 | `test-report-YYYYMMDD-HHMMSS.md` | `test-report-20260120-143000.md` |
| 报告目录 | `tests/results/` | `tests/results/test-report-*.md` |
| 覆盖率目录 | `tests/coverage/` | `tests/coverage/lcov-report/` |
| 差距分析 | `tests/docs/gap-analysis.md` | - |

### 目录结构范例

```
tests/
├── README.md                    # 测试总览与状态
├── results/                     # 测试执行报告
│   ├── test-report-20260120-143000.md
│   └── test-report-20260119-090000.md
├── coverage/                    # 覆盖率报告
│   ├── lcov-report/
│   └── coverage-summary.json
├── docs/                        # 测试文档
│   └── gap-analysis.md
├── unit/                        # 单元测试
├── integration/                 # 集成测试
└── e2e/                         # 端对端测试
```

### 效益

| 效益 | 说明 |
|------|------|
| **可发现性** | 开发者可快速找到测试状态，无需全面搜索 |
| **透明度** | 当前质量指标一目了然 |
| **可追溯性** | 历史报告支援趋势分析 |
| **新人入门** | 新团队成员可立即理解测试结构 |

---

## 快速参考卡

### 测试类型选择

| 测试什么？ | 使用类型 |
|-----------|---------|
| 单一函数逻辑 | 单元测试 |
| 组件间交互 | 集成测试 |
| 完整用户流程 | E2E 测试 |
| 安全漏洞 | 安全测试 |
| 性能瓶颈 | 性能测试 |
| API 契约 | 契约测试 |

### 检查清单

- [ ] 遵循测试金字塔比例
- [ ] 使用 AAA 模式
- [ ] 测试名称具描述性
- [ ] 测试相互独立
- [ ] 覆盖边界条件

---

## 相关标准

- [代码审查指南](code-review-checklist.md)
- [测试完整性维度](test-completeness-dimensions.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
