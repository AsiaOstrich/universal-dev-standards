---
name: test-coverage-assistant
description: |
  使用 7 維度框架评估测试完整性。
  使用时机：撰写测试、审查测试覆蓋率、确保测试品质。
  关鍵字：test coverage, completeness, dimensions, 7 dimensions, test quality, 测试覆蓋, 测试完整性, 七維度。
source: ../../../../../skills/claude-code/test-coverage-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 测试覆蓋助手

> **语言**: [English](../../../../../skills/claude-code/test-coverage-assistant/SKILL.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-30
**適用範圍**: Claude Code Skills

---

## 目的

此技能使用 7 維度框架幫助评估和改善测试完整性，确保每个功能都有全面的测试覆蓋。

## 快速參考

### 7 个維度

```
┌─────────────────────────────────────────────────────────────┐
│              测试完整性 = 7 个維度                            │
├─────────────────────────────────────────────────────────────┤
│  1. 正常路徑        正常预期行为                              │
│  2. 邊界条件        最小/最大值、限制                         │
│  3. 错误处理        無效输入、例外状况                        │
│  4. 授权验证        角色存取控制                              │
│  5. 状态变更        前後状态验证                              │
│  6. 验证邏辑        格式、商业規則                            │
│  7. 集成测试        真实查詢验证                              │
└─────────────────────────────────────────────────────────────┘
```

### 維度摘要表

| # | 維度 | 测试内容 | 关鍵問題 |
|---|------|----------|----------|
| 1 | **正常路徑** | 有效输入 → 预期输出 | 正常流程是否运作？ |
| 2 | **邊界条件** | 最小/最大值、限制 | 邊界情况会發生什麼？ |
| 3 | **错误处理** | 無效输入、找不到数据 | 错误如何处理？ |
| 4 | **授权验证** | 角色权限 | 誰可以做什麼？ |
| 5 | **状态变更** | 前後状态 | 状态是否正确变更？ |
| 6 | **验证邏辑** | 格式、商业規則 | 输入是否有验证？ |
| 7 | **集成测试** | 真实 DB/API 呼叫 | 查詢真的有效嗎？ |

### 各功能类型需要的維度

| 功能类型 | 需要的維度 |
|----------|------------|
| CRUD API | 1, 2, 3, 4, 6, 7 |
| 查詢/搜尋 | 1, 2, 3, 4, 7 |
| 状态机 | 1, 3, 4, 5, 6 |
| 验证邏辑 | 1, 2, 3, 6 |
| 背景作业 | 1, 3, 5 |
| 外部集成 | 1, 3, 7 |

## 测试设计检查清单

为每个功能使用此检查清单：

```
功能：___________________

□ 正常路徑
  □ 有效输入产生预期成功
  □ 正确的数据被回传/建立
  □ 预期的副作用發生

□ 邊界条件
  □ 最小有效值
  □ 最大有效值
  □ 空集合
  □ 单一项目集合
  □ 大型集合（如適用）

□ 错误处理
  □ 無效输入格式
  □ 缺少必要欄位
  □ 重複/衝突情况
  □ 找不到数据情况
  □ 外部服务失败（如適用）

□ 授权验证
  □ 每个允許的角色已测试
  □ 每个拒絕的角色已测试
  □ 未认证存取已测试
  □ 跨邊界存取已测试

□ 状态变更
  □ 初始状态已验证
  □ 最終状态已验证
  □ 所有有效的状态转换已测试

□ 验证邏辑
  □ 格式验证（電子郵件、電話等）
  □ 商业規則验证
  □ 跨欄位验证

□ 集成测试（如 UT 使用萬用字元）
  □ 查詢述詞已验证
  □ 实体关联已验证
  □ 分页已验证
  □ 排序/過濾已验证
```

## 详细指南

完整标准請參考：
- [测试完整性維度](../../../core/test-completeness-dimensions.md)
- [测试标准](../../../core/testing-standards.md)

### AI 優化格式（节省 Token）

AI 助手可使用 YAML 格式文件以減少 Token 使用量：
- 基礎标准：`ai/standards/test-completeness-dimensions.ai.yaml`

## 範例

### 1. 正常路徑

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

### 2. 邊界条件

```csharp
[Theory]
[InlineData(0, false)]      // 低於最小值
[InlineData(1, true)]       // 最小有效值
[InlineData(100, true)]     // 最大有效值
[InlineData(101, false)]    // 高於最大值
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
    updatedUser.IsEnabled.Should().BeFalse();  // 验证最終状态
}
```

## 授权矩陣範本

为每个功能建立矩陣：

| 操作 | 管理員 | 經理 | 成員 | 訪客 |
|------|--------|------|------|------|
| 建立 | ✅ | ✅ | ❌ | ❌ |
| 读取全部 | ✅ | ⚠️ 範圍限制 | ❌ | ❌ |
| 更新 | ✅ | ⚠️ 僅自己部門 | ❌ | ❌ |
| 刪除 | ✅ | ❌ | ❌ | ❌ |

每个格子都应該有对应的测试案例。

## 要避免的反模式

- ❌ 只测试正常路徑
- ❌ 多角色系统缺少授权测试
- ❌ 没有验证状态变更
- ❌ 单元测试使用萬用字元但没有对应的集成测试
- ❌ 测试数据中 ID 和业务識别码使用相同值
- ❌ 测试实作細节而非行为

---

## 设置偵测

此技能支援项目特定设置。

### 偵测順序

1. 检查 `CONTRIBUTING.md` 中的「测试标准」區段
2. 检查程序码庫中現有的测试模式
3. 若無找到，**预设使用全部 7 个維度**

### 首次设置

若未找到设置：

1. 建议：「此项目尚未设置测试完整性要求。您要自订需要哪些維度嗎？」
2. 建议在 `CONTRIBUTING.md` 中记录：

```markdown
## 测试完整性

我們使用 7 維度框架來确保测试覆蓋。

### 各功能类型需要的維度
- API 端点：全部 7 个維度
- 工具函式：維度 1, 2, 3, 6
- 背景作业：維度 1, 3, 5
```

---

## 相关标准

- [测试完整性維度](../../../core/test-completeness-dimensions.md)
- [测试标准](../../../core/testing-standards.md)
- [测试指南](../testing-guide/SKILL.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-30 | 初始發布 |

---

## 授权

此技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
