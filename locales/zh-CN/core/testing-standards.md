---
source: ../../../core/testing-standards.md
source_version: 2.1.0
translation_version: 2.1.0
last_synced: 2026-01-08
status: current
---

> **语言**: [English](../../../core/testing-standards.md) | [繁體中文](../../zh-TW/core/testing-standards.md) | 简体中文

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

- [代码审查指南](code-review-guide.md)
- [测试完整性维度](test-completeness-dimensions.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
