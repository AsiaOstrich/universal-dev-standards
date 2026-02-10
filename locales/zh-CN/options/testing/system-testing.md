---
source: ../../../../options/testing/system-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 系统测试

> **语言**: [English](../../../../options/testing/system-testing.md) | 繁体中文

**上层标准**: [测试指南](../../../../core/testing-standards.md)

---

## 概述

系统测试针对指定需求验证完整、整合的系统。它在接近生产环境的环境中测试整个应用程式，验证功能性和非功能性需求。

## 特性

| 属性 | 值 |
|------|------|
| 范围 | 整个应用系统 |
| 相依性 | 所有真实元件 |
| 执行速度 | 分钟到小时 |
| 环境 | 类生产环境 |
| 数量 | 精选的测试集 |

## 适用情境

- 验证完整使用者流程
- 测试系统级需求
- 效能和负载测试
- 安全性测试
- 发布前回归测试

## 系统测试类型

### 1. 功能测试

验证系统符合功能需求：

```gherkin
# 行为驱动规格
Feature: 使用者注册

  Scenario: 使用有效资料成功注册
    Given 我在注册页面
    When 我输入有效的注册资料
    And 我提交注册表单
    Then 我应该收到确认邮件
    And 我的帐户应该在资料库中建立
    And 我应该被重导到欢迎页面
```

### 2. 效能测试

验证系统在负载下的效能：

```javascript
// k6 负载测试范例
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // 升温
    { duration: '5m', target: 100 },  // 维持 100 使用者
    { duration: '2m', target: 200 },  // 尖峰到 200
    { duration: '5m', target: 200 },  // 维持 200
    { duration: '2m', target: 0 },    // 降温
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 低于 500ms
    http_req_failed: ['rate<0.01'],    // 错误率低于 1%
  },
};
```

### 3. 安全性测试

测试系统安全控制：

```yaml
# 安全测试情境
security_tests:
  authentication:
    - test: "暴力破解保护"
      steps:
        - 尝试 5 次失败登入
        - 验证帐户锁定
        - 验证锁定通知邮件

    - test: "Session 管理"
      steps:
        - 登入并取得 session token
        - 验证 token 在逾时后过期
        - 验证登出时 token 失效
```

### 4. 可靠性测试

测试系统在不利条件下的行为：

```python
# 混沌工程测试
class ReliabilityTest:
    def test_database_failover(self):
        """系统应优雅处理资料库故障转移。"""
        # 安排
        app = TestApplication()
        app.start()

        # 执行：模拟主资料库故障
        app.database.simulate_failure('primary')

        # 验证：系统使用副本继续运作
        response = app.client.get('/api/health')
        assert response.status_code == 200
        assert response.json()['database'] == 'degraded'
```

## 测试环境

### 环境需求

| 面向 | 需求 |
|------|------|
| 基础设施 | 镜像生产拓扑 |
| 资料 | 真实、匿名化的生产资料 |
| 规模 | 至少生产环境 10% 容量 |
| 隔离 | 与开发/测试环境分离 |
| 监控 | 启用完整可观测性 |

## 测试报告

### 报告结构

```markdown
# 系统测试报告

## 摘要
- **日期**: 2024-01-15
- **版本**: v2.3.0
- **环境**: system-test-01
- **时长**: 4 小时 32 分钟

## 结果总览
| 类别 | 通过 | 失败 | 跳过 |
|------|------|------|------|
| 功能 | 145 | 3 | 2 |
| 效能 | 12 | 0 | 0 |
| 安全 | 28 | 1 | 0 |

## 效能指标
- 平均回应时间: 234ms
- 95 百分位: 456ms
- 错误率: 0.02%
- 吞吐量: 1,200 req/sec
```

## 最佳实践

1. **在类生产环境测试**
2. **使用真实资料量**
3. **包含非功能性需求**
4. **自动化回归测试**
5. **清楚记录测试情境**
6. **执行期间监控**
7. **执行后清理测试资料**

## 相关选项

- [单元测试](./unit-testing.md) - 测试个别元件
- [整合测试](./integration-testing.md) - 测试元件互动
- [E2E 测试](./e2e-testing.md) - 测试使用者流程

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
