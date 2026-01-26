---
name: test-coverage-assistant
description: |
  使用 8 维度框架评估测试完整性。
  使用时机：撰写测试、审查测试覆盖率、确保测试品质。
  关键字：test coverage, completeness, dimensions, 8 dimensions, test quality, 测试覆盖, 测试完整性, 八维度。
source: ../../../../../skills/claude-code/test-coverage-assistant/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-25
status: current
---

# 测试覆盖助手

> **语言**: [English](../../../../../skills/claude-code/test-coverage-assistant/SKILL.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-01-25
**适用范围**: Claude Code Skills

---

## 目的

此技能使用 8 维度框架帮助评估和改善测试完整性，确保每个功能都有全面的测试覆盖。

## 快速参考

### 8 个维度

```
┌─────────────────────────────────────────────────────────────┐
│              测试完整性 = 8 个维度                            │
├─────────────────────────────────────────────────────────────┤
│  1. 正常路径        正常预期行为                              │
│  2. 边界条件        最小/最大值、限制                         │
│  3. 错误处理        无效输入、例外状况                        │
│  4. 授权验证        角色存取控制                              │
│  5. 状态变更        前后状态验证                              │
│  6. 验证逻辑        格式、商业规则                            │
│  7. 集成测试        真实查询验证                              │
│  8. AI 生成质量     AI 生成测试的质量 (新增)                  │
└─────────────────────────────────────────────────────────────┘
```

### 维度摘要表

| # | 维度 | 测试内容 | 关键问题 |
|---|------|----------|----------|
| 1 | **正常路径** | 有效输入 → 预期输出 | 正常流程是否运作？ |
| 2 | **边界条件** | 最小/最大值、限制 | 边界情况会发生什么？ |
| 3 | **错误处理** | 无效输入、找不到数据 | 错误如何处理？ |
| 4 | **授权验证** | 角色权限 | 谁可以做什么？ |
| 5 | **状态变更** | 前后状态 | 状态是否正确变更？ |
| 6 | **验证逻辑** | 格式、商业规则 | 输入是否有验证？ |
| 7 | **集成测试** | 真实 DB/API 调用 | 查询真的有效吗？ |
| 8 | **AI 生成质量** | AI 生成测试的质量 | AI 测试是否有意义？ |

### 各功能类型需要的维度

| 功能类型 | 需要的维度 |
|----------|------------|
| CRUD API | 1, 2, 3, 4, 6, 7, 8* |
| 查询/搜索 | 1, 2, 3, 4, 7, 8* |
| 状态机 | 1, 3, 4, 5, 6, 8* |
| 验证逻辑 | 1, 2, 3, 6, 8* |
| 后台作业 | 1, 3, 5, 8* |
| 外部集成 | 1, 3, 7, 8* |

## 测试设计检查清单

为每个功能使用此检查清单：

```
功能：___________________

□ 正常路径
  □ 有效输入产生预期成功
  □ 正确的数据被回传/建立
  □ 预期的副作用发生

□ 边界条件
  □ 最小有效值
  □ 最大有效值
  □ 空集合
  □ 单一项目集合
  □ 大型集合（如适用）

□ 错误处理
  □ 无效输入格式
  □ 缺少必要字段
  □ 重复/冲突情况
  □ 找不到数据情况
  □ 外部服务失败（如适用）

□ 授权验证
  □ 每个允许的角色已测试
  □ 每个拒绝的角色已测试
  □ 未认证存取已测试
  □ 跨边界存取已测试

□ 状态变更
  □ 初始状态已验证
  □ 最终状态已验证
  □ 所有有效的状态转换已测试

□ 验证逻辑
  □ 格式验证（电子邮件、电话等）
  □ 商业规则验证
  □ 跨字段验证

□ 集成测试（如 UT 使用通配符）
  □ 查询谓词已验证
  □ 实体关联已验证
  □ 分页已验证
  □ 排序/过滤已验证
```

## 详细指南

完整标准请参考：
- [测试完整性维度](../../../core/test-completeness-dimensions.md)
- [测试标准](../../../core/testing-standards.md)

### AI 优化格式（节省 Token）

AI 助手可使用 YAML 格式文件以减少 Token 使用量：
- 基础标准：`ai/standards/test-completeness-dimensions.ai.yaml`

## 示例

### 1. 正常路径

```csharp
[Fact]
public async Task CreateUser_WithValidData_ReturnsSuccess()
{
    // Arrange
    var request = new CreateUserRequest
    {
        Username = "newuser",
        Email = "user@example.com"
    };

    // Act
    var result = await _service.CreateUserAsync(request);

    // Assert
    result.Success.Should().BeTrue();
    result.Data.Username.Should().Be("newuser");
}
```

### 2. 边界条件

```csharp
[Theory]
[InlineData(0, false)]      // 低于最小值
[InlineData(1, true)]       // 最小有效值
[InlineData(100, true)]     // 最大有效值
[InlineData(101, false)]    // 高于最大值
public void ValidateQuantity_BoundaryValues_ReturnsExpected(
    int quantity, bool expected)
{
    var result = _validator.IsValidQuantity(quantity);
    result.Should().Be(expected);
}
```

### 4. 授权验证

```csharp
[Fact]
public async Task DeleteUser_AsAdmin_Succeeds()
{
    var adminContext = CreateContext(role: "Admin");
    var result = await _service.DeleteUserAsync(userId, adminContext);
    result.Success.Should().BeTrue();
}

[Fact]
public async Task DeleteUser_AsMember_ReturnsForbidden()
{
    var memberContext = CreateContext(role: "Member");
    var result = await _service.DeleteUserAsync(userId, memberContext);
    result.ErrorCode.Should().Be("FORBIDDEN");
}
```

### 5. 状态变更

```csharp
[Fact]
public async Task DisableUser_UpdatesStateCorrectly()
{
    // Arrange
    var user = await CreateEnabledUser();
    user.IsEnabled.Should().BeTrue();  // 验证初始状态

    // Act
    await _service.DisableUserAsync(user.Id);

    // Assert
    var updatedUser = await _repository.GetByIdAsync(user.Id);
    updatedUser.IsEnabled.Should().BeFalse();  // 验证最终状态
}
```

## 授权矩阵模板

为每个功能建立矩阵：

| 操作 | 管理员 | 经理 | 成员 | 访客 |
|------|--------|------|------|------|
| 建立 | ✅ | ✅ | ❌ | ❌ |
| 读取全部 | ✅ | ⚠️ 范围限制 | ❌ | ❌ |
| 更新 | ✅ | ⚠️ 仅自己部门 | ❌ | ❌ |
| 删除 | ✅ | ❌ | ❌ | ❌ |

每个格子都应该有对应的测试案例。

## 要避免的反模式

- ❌ 只测试正常路径
- ❌ 多角色系统缺少授权测试
- ❌ 没有验证状态变更
- ❌ 单元测试使用通配符但没有对应的集成测试
- ❌ 测试数据中 ID 和业务标识码使用相同值
- ❌ 测试实现细节而非行为

---

## 设置检测

此技能支持项目特定设置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的「测试标准」部分
2. 检查代码库中现有的测试模式
3. 如未找到，**默认使用全部 8 个维度**

### 首次设置

如未找到设置：

1. 建议：「此项目尚未设置测试完整性要求。您要自定需要哪些维度吗？」
2. 建议在 `CONTRIBUTING.md` 中记录：

```markdown
## 测试完整性

我们使用 8 维度框架来确保测试覆盖。

### 各功能类型需要的维度
- API 端点：全部 8 个维度
- 工具函式：维度 1, 2, 3, 6
- 背景作业：维度 1, 3, 5
```

---

## 相关标准

- [测试完整性维度](../../../core/test-completeness-dimensions.md)
- [测试标准](../../../core/testing-standards.md)
- [测试指南](../testing-guide/SKILL.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-25 | 新增第 8 维度：AI 生成质量 |
| 1.0.0 | 2025-12-30 | 初始发布 |

---

## 授权

此技能采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
