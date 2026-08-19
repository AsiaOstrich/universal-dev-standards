---
source: ../../../../skills/reverse-engineer/tdd-analysis.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-19
status: current
---

# TDD 分析工作流程指南

**版本**: 1.0.0
**最后更新**: 2026-01-19

> **语言**: [English](../../../../skills/reverse-engineer/tdd-analysis.md) | [繁體中文](../../../zh-TW/skills/reverse-engineer/tdd-analysis.md) | 简体中文

本指南提供针对 BDD 场景分析测试覆盖率并识别缺口的详细工作流程。

---

## 概览

TDD 分析将 BDD 场景映射到现有的单元测试，计算覆盖率并识别缺口。这确保验收标准在单元测试层级得到验证。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TDD 分析管道                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│  │  Feature  │──▶│   解析    │──▶│   扫描    │──▶│   匹配    │        │
│  │   文件    │   │   场景    │   │   测试    │   │   算法  │        │
│  └───────────┘   └───────────┘   └───────────┘   └─────┬─────┘        │
│                                                        │               │
│                                                        ▼               │
│                       ┌───────────────────────────────────┐            │
│                       │         计算信心度               │            │
│                       │   [已确认] [推断] [无]           │            │
│                       └─────────────────┬─────────────────┘            │
│                                         │                              │
│                                         ▼                              │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                        │
│  │   动作    │◀──│  覆盖率   │◀──│   缺口    │                        │
│  │   项目    │   │   报告    │   │   分析    │                        │
│  └───────────┘   └───────────┘   └───────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 阶段 1：场景解析

### 1.1 从 Feature 文件提取场景

将 Gherkin 场景解析为可分析的结构：

```markdown
## 已解析的场景

### features/auth.feature

| ID | 场景名称 | 步骤数 | 标签 |
|----|----------|--------|------|
| S1 | 成功登入 | 4 | @confirmed |
| S2 | 登入失败-密码错误 | 3 | @inferred |
| S3 | 帐号锁定 | 4 | @edge-case |

### 提取的关键字

| 场景 | 关键字 | 领域 |
|------|--------|------|
| S1: 成功登入 | login, success, credentials | auth |
| S2: 登入失败 | login, failure, password, error | auth |
| S3: 帐号锁定 | account, lock, attempts, security | auth |
```

### 1.2 建立场景索引

建立可搜寻的索引用于匹配：

```json
{
  "scenarios": [
    {
      "id": "auth.feature:S1",
      "name": "成功登入",
      "keywords": ["login", "success", "credentials", "user", "password"],
      "domain": "auth",
      "steps": [
        { "type": "Given", "text": "用户在登入页面" },
        { "type": "When", "text": "用户输入正确的 email 和密码" },
        { "type": "Then", "text": "用户应该看到首页" }
      ],
      "tags": ["@confirmed"],
      "source": "features/auth.feature:12-18"
    }
  ]
}
```

---

## 阶段 2：测试文件扫描

### 2.1 侦测测试框架

从专案识别测试框架：

| 指标 | 框架 | 语言 |
|------|------|------|
| `jest.config.js` | Jest | JS/TS |
| `vitest.config.ts` | Vitest | JS/TS |
| `pytest.ini`、`pyproject.toml` | pytest | Python |
| `pom.xml` with JUnit | JUnit | Java |
| `*_test.go` | Go testing | Go |
| `Cargo.toml` with test | Rust testing | Rust |

### 2.2 扫描测试文件

定位并解析测试文件：

```markdown
## 测试文件发现

### 侦测到的框架：Vitest

### 找到的文件
| 路径 | 测试数 | 领域（推断） |
|------|--------|--------------|
| tests/auth.test.ts | 12 | auth |
| tests/cart.test.ts | 8 | cart |
| tests/checkout.test.ts | 15 | checkout |

### 测试结构分析

#### tests/auth.test.ts
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return token for valid credentials', () => {...});
    it('should throw error for invalid password', () => {...});
    it('should lock account after 5 attempts', () => {...});
  });
  describe('logout', () => {
    it('should invalidate session', () => {...});
  });
});
```

### 提取的测试索引
| 测试 ID | 测试名称 | 关键字 | 路径 |
|---------|----------|--------|------|
| T1 | should return token for valid credentials | token, valid, credentials | auth.test.ts:5 |
| T2 | should throw error for invalid password | error, invalid, password | auth.test.ts:12 |
| T3 | should lock account after 5 attempts | lock, account, attempts | auth.test.ts:20 |
```

---

## 阶段 3：匹配算法

### 3.1 匹配策略

套用多个策略并合并分数：

#### 策略 1：名称相似度（权重：40%）

比较场景名称与测试名称：

```
场景: 成功登入 (关键字: 成功, 登入)
测试: should return token for valid credentials

翻译映射:
- 成功 → success, valid
- 登入 → login, credentials

相似度计算:
- "valid" 匹配 "成功" 翻译 → +20%
- "credentials" 匹配 "登入" 脉络 → +15%
- 名称相似度分数: 35%
```

#### 策略 2：关键字重叠（权重：30%）

匹配提取的关键字：

```
场景关键字: [login, success, credentials, user, password]
测试关键字: [token, valid, credentials, return]

重叠: [credentials]
重叠分数: 1/5 = 20%
加权: 20% × 0.30 = 6%
```

#### 策略 3：步骤-断言映射（权重：20%）

匹配 Then 步骤到测试断言：

```gherkin
Then 用户应该看到首页
```

```typescript
expect(response.redirect).toBe('/home');
expect(response.status).toBe(200);
```

断言分析:
- "/home" 建议首页 → 匹配 "首页"
- 状态 200 建议成功 → 匹配场景意图
- 步骤-断言分数: 70%
- 加权: 70% × 0.20 = 14%

#### 策略 4：文件邻近度（权重：10%）

测试文件在相同领域：

```
场景领域: auth
测试文件: tests/auth.test.ts

领域匹配: ✅
邻近度分数: 100%
加权: 100% × 0.10 = 10%
```

### 3.2 信心度计算

合并加权分数：

```markdown
## 匹配结果: S1 → T1

| 策略 | 分数 | 权重 | 加权 |
|------|------|------|------|
| 名称相似度 | 35% | 0.40 | 14% |
| 关键字重叠 | 20% | 0.30 | 6% |
| 步骤-断言 | 70% | 0.20 | 14% |
| 文件邻近度 | 100% | 0.10 | 10% |
| **总计** | - | - | **44%** |

信心度等级: [推断] (中等)
```

### 3.3 信心度门槛

| 总分 | 信心度等级 | 标签 |
|------|------------|------|
| 85-100% | 高 | `[已确认]` |
| 60-84% | 中高 | `[推断]` (高) |
| 40-59% | 中等 | `[推断]` (中) |
| 20-39% | 低 | `[推断]` (低) |
| 0-19% | 无 | `[未知]` |

---

## 阶段 4：缺口分析

### 4.1 识别缺少的覆盖

列出没有匹配测试的场景：

```markdown
## 覆盖缺口分析

### ❌ 无测试覆盖

| 场景 | 功能 | 优先级 | 缺口原因 |
|------|------|--------|----------|
| 帐号锁定 | auth.feature:45 | 🔴 高 | 找不到匹配的测试 |
| 购物车上限 | cart.feature:32 | 🟡 中 | 仅部分匹配 |

### 缺口分类

| 类型 | 数量 | 范例 |
|------|------|------|
| 完全没有测试 | 2 | 帐号锁定, 购物车上限 |
| 缺少边界情况 | 3 | 空购物车, 无效 email, 逾时 |
| 缺少错误处理 | 4 | 登入错误, 付款失败 |
```

### 4.2 优先级分配

根据以下因素决定测试优先级：

```markdown
## 优先级计算

| 因素 | 权重 | 高 | 中 | 低 |
|------|------|------|------|------|
| 安全影响 | 30% | 认证, 付款 | 用户数据 | 显示 |
| 用户频率 | 25% | 核心流程 | 常见 | 罕见 |
| 商业风险 | 25% | 营收 | 留存 | 次要 |
| 复杂度 | 20% | 高逻辑 | 中等 | 简单 |

### 优先级结果

| 场景 | 安全 | 频率 | 风险 | 复杂度 | 总计 | 优先级 |
|------|------|------|------|--------|------|--------|
| 帐号锁定 | 90% | 20% | 80% | 60% | 62.5% | 🔴 高 |
| 购物车上限 | 30% | 60% | 40% | 40% | 42.5% | 🟡 中 |
```

### 4.3 测试建议

生成可执行的测试建议：

```markdown
## 建议的测试

### 🔴 高优先级

#### 1. 帐号锁定测试
**场景**：帐号锁定
**建议文件**：tests/auth.test.ts
**建议测试**：
```typescript
describe('AuthService', () => {
  describe('account lockout', () => {
    it('should lock account after 5 failed attempts', async () => {
      // Arrange
      const user = await createTestUser();

      // Act - 5 次失败尝试
      for (let i = 0; i < 5; i++) {
        await authService.login(user.email, 'wrong-password');
      }

      // Assert
      const status = await authService.getAccountStatus(user.id);
      expect(status).toBe('locked');
    });

    it('should reset attempt count after successful login', async () => {
      // ...
    });
  });
});
```

**涵盖**：S3 (帐号锁定) 来自 auth.feature:45
**优先级**：🔴 高 (安全关键)
```

---

## 阶段 5：覆盖率报告生成

### 5.1 报告结构

```markdown
# BDD → TDD 覆盖率报告

> 生成时间: 2026-01-19 14:30
> Feature 文件: 3 个已分析
> 测试文件: 5 个已扫描
> 匹配算法: v1.0

---

## 📊 执行摘要

| 指标 | 值 | 状态 |
|------|------|------|
| 总场景数 | 18 | - |
| 覆盖 [已确认] | 10 (56%) | ✅ |
| 覆盖 [推断] | 5 (28%) | ⚠️ |
| 无覆盖 | 3 (17%) | ❌ |
| **有效覆盖率** | **83%** | - |

### 趋势（如有历史数据）
| 日期 | 覆盖率 |
|------|--------|
| 2026-01-12 | 75% |
| 2026-01-19 | 83% ↑ |

---

## 📈 依功能覆盖率

| 功能 | 场景数 | 已覆盖 | 覆盖率 |
|------|--------|--------|--------|
| auth.feature | 8 | 7 | 88% ✅ |
| cart.feature | 6 | 5 | 83% ✅ |
| checkout.feature | 4 | 3 | 75% ⚠️ |

---

## ✅ 已覆盖场景

### [已确认] 直接匹配 (56%)

| BDD 场景 | 单元测试 | 信心度 | 来源 |
|----------|----------|--------|------|
| 成功登入 | test_login_success | 92% | auth.test.ts:25 |
| 登入失败-密码错误 | test_login_invalid_pwd | 88% | auth.test.ts:45 |
| 新增商品到购物车 | test_add_to_cart | 95% | cart.test.ts:12 |

### [推断] 可能匹配 (28%)

| BDD 场景 | 单元测试 | 信心度 | 需要审查 |
|----------|----------|--------|----------|
| 更新购物车数量 | test_update_quantity | 65% | ⚠️ 验证 |
| 移除购物车商品 | test_remove_item | 58% | ⚠️ 验证 |

> ⚠️ [推断] 项目应由开发人员审查

---

## ❌ 缺少覆盖 (17%)

### 高优先级 🔴

| 场景 | 来源 | 建议测试 | 原因 |
|------|------|----------|------|
| 帐号锁定 | auth.feature:45 | test_account_lockout | 安全关键 |

### 中优先级 🟡

| 场景 | 来源 | 建议测试 | 原因 |
|------|------|----------|------|
| 购物车超过上限 | cart.feature:32 | test_cart_max_limit | 边界条件 |
| 结帐逾时处理 | checkout.feature:78 | test_checkout_timeout | 错误处理 |

---

## 📋 建议动作

### 立即（本 Sprint）
1. [ ] 新增 `test_account_lockout` 到 auth.test.ts
   - 安全关键功能
   - 估计工作量：2 小时

### 下个 Sprint
2. [ ] 与领域专家验证 [推断] 测试映射
3. [ ] 新增购物车上限的边界测试
4. [ ] 新增逾时处理测试

### 待办清单
5. [ ] 改善测试命名以利更好的自动匹配
6. [ ] 为复杂流程新增整合测试

---

## 🔗 可追溯性矩阵

| SPEC → BDD → TDD |
|------------------|
| SPEC-AUTH.md:42 → auth.feature:12 (成功登入) → auth.test.ts:25 ✅ |
| SPEC-AUTH.md:48 → auth.feature:24 (登入失败) → auth.test.ts:45 ✅ |
| SPEC-AUTH.md:52 → auth.feature:45 (帐号锁定) → ❌ 缺少 |
```

### 5.2 机器可读输出

```json
{
  "reportMeta": {
    "generated": "2026-01-19T14:30:00Z",
    "version": "1.0",
    "featureFiles": 3,
    "testFiles": 5
  },
  "summary": {
    "totalScenarios": 18,
    "coveredConfirmed": 10,
    "coveredInferred": 5,
    "noCoverage": 3,
    "effectiveCoverage": 0.83
  },
  "mappings": [
    {
      "scenario": {
        "id": "auth.feature:S1",
        "name": "成功登入",
        "source": "features/auth.feature:12"
      },
      "test": {
        "id": "auth.test.ts:T1",
        "name": "test_login_success",
        "source": "tests/auth.test.ts:25"
      },
      "confidence": 0.92,
      "level": "confirmed"
    }
  ],
  "gaps": [
    {
      "scenario": {
        "id": "auth.feature:S3",
        "name": "帐号锁定",
        "source": "features/auth.feature:45"
      },
      "priority": "high",
      "reason": "security_critical",
      "suggestion": {
        "testName": "test_account_lockout",
        "file": "tests/auth.test.ts"
      }
    }
  ]
}
```

---

## 阶段 6：动作项目生成

### 6.1 Sprint 就绪任务

生成可执行的任务：

```markdown
## 生成的 Sprint 任务

### 任务 1：新增帐号锁定测试
- **类型**：单元测试
- **文件**：tests/auth.test.ts
- **涵盖**：S3 (帐号锁定)
- **优先级**：🔴 高
- **估计**：2 小时
- **验收标准**：
  - [ ] 测试 5 次失败尝试后锁定帐号
  - [ ] 测试成功登入后重设计数
  - [ ] 测试锁定持续时间（如适用）

### 任务 2：验证购物车更新测试
- **类型**：审查
- **动作**：确认 test_update_quantity 涵盖 BDD 场景
- **优先级**：🟡 中
- **估计**：30 分钟
```

### 6.2 与问题追踪器整合

```markdown
## GitHub Issues（草稿）

### Issue 1
**标题**：为帐号锁定功能新增单元测试
**标签**：test, security, high-priority
**内容**：
BDD 场景 `帐号锁定` (auth.feature:45) 缺少单元测试覆盖。

**验收标准**：
- [ ] 新增 test_account_lockout 到 auth.test.ts
- [ ] 涵盖 5 次失败尝试 → 锁定
- [ ] 涵盖成功后锁定重设

**参考**：SPEC-AUTH.md:52, BDD 覆盖率报告 2026-01-19
```

---

## 处理挑战

### 挑战 1：不同的测试命名惯例

```markdown
# 问题
场景: 用户可以登入
测试: it('verifies authentication flow')

# 解决方案
1. 从两者提取语意关键字
2. 对多语言使用翻译映射
3. 降低信心度但仍然匹配
4. 标记供人类审查
```

### 挑战 2：表格驱动测试

```typescript
test.each([
  ['valid', true],
  ['invalid', false],
])('login with %s credentials', (type, expected) => {...});
```

```markdown
# 分析
单一测试涵盖多个场景：
- 成功登入 → 表格行 'valid'
- 登入失败 → 表格行 'invalid'

将两个场景标记为 [推断]，引用共用测试
```

### 挑战 3：整合 vs 单元测试

```markdown
# 分类
| 测试类型 | 覆盖类型 | 权重 |
|----------|----------|------|
| 单元测试 | 直接 | 100% |
| 整合测试 | 部分 | 50% |
| E2E | 间接 | 25% |

# 分别报告但合并计算总覆盖率
```

---

## CI/CD 整合

### GitHub Actions —— 目前无法脚本化

`uds reverse-tdd` 这个 CLI 指令不存在。覆盖率缺口分析是以 **`reverse-tdd`
AI agent**（`uds agent install reverse-tdd`）提供——由你的 AI 工具交互式执行，
不是会吐出 `coverage.json` 的确定性脚本。本文件先前版本示范了一个调用不存在
CLI 指令的 GitHub Actions 步骤（XSPEC-383 R4，2026-08-19）。

下方仅为**示意**——展示若未来真的做出可脚本化的分析器，CI 整合可能长什么样，
不是现在就能贴进 workflow 使用的东西：

```yaml
# 示意用途——目前没有可脚本化的等价物。
# 现况：改用 reverse-tdd agent 从你的 AI 工具交互式执行。
name: BDD Coverage Check

on: [pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run BDD Coverage Analysis (尚未实现)
        run: |
          echo "目前没有 CLI 等价物——交互式用法请见 reverse-tdd agent"
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-19 | 初始版本 |
