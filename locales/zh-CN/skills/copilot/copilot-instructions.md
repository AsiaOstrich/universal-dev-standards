---
source: ../../../../skills/copilot/copilot-instructions.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitHub Copilot 指示
<!-- 来源：https://github.com/AsiaOstrich/universal-dev-standards -->
<!-- 版本：1.0.0 -->

## 开发标准

生成程式码建议时遵循这些标准。

### 提交讯息

使用 Conventional Commits 格式：
```
<类型>(<范围>): <主题>
```

**类型：**
- `feat` - 新功能
- `fix` - 错误修正
- `refactor` - 程式码重构
- `docs` - 文件
- `test` - 测试
- `chore` - 维护

**范例：**
- `feat(auth): add OAuth2 login`
- `fix(api): handle null user`

### 程式码品质

生成程式码时：
- 使用描述性的变数/函式名称
- 遵循单一职责原则
- 避免程式码重复
- 适当处理错误
- 验证输入

### 安全

始终包含：
- 输入验证
- 参数化查询（防 SQL 注入）
- 输出编码（防 XSS）
- 不硬编码凭证

### 测试

生成测试时遵循：
- AAA 模式：Arrange → Act → Assert
- FIRST 原则：Fast、Independent、Repeatable、Self-validating、Timely
- 边界案例覆盖

### 文件

对于公开 API：
- 包含 JSDoc/docstring 注解
- 记录参数和回传值
- 提供使用范例

### Git

分支命名：
- `feature/*` - 新功能
- `fix/*` - 错误修正
- `hotfix/*` - 紧急修正

### AI 协作

当不确定时：
- 询问厘清问题
- 明确说明假设
- 适时提供多个选项
