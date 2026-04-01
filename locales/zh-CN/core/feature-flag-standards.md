---
source: ../../../core/feature-flag-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# Feature Flag 管理标准

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文档定义 Feature Flag（又称 Feature Toggle）在整个生命周期中的管理标准。Feature Flag 是控制功能发布、实验和运营安全的强大技术，但缺乏适当管理会累积为技术债。

## 1. Flag 类型

| 类型 | 用途 | 生命周期 |
|------|------|---------|
| **Release** | 控制渐进式功能发布 | 临时性，完全发布后移除 |
| **Experiment** | A/B 测试与数据驱动决策 | 临时性，实验结束后移除 |
| **Ops** | 运营控制（Circuit Breaker、Kill Switch） | 永久，每季审查 |
| **Permission** | 用户/角色访问控制 | 永久，绑定授权模型 |

## 2. 命名惯例

格式：`<type>_<feature>_<context>`

| Flag 名称 | 类型 | 说明 |
|-----------|------|------|
| `release_new_checkout_flow` | Release | 新结账流程发布 |
| `experiment_pricing_page_v2` | Experiment | 定价页面 A/B 测试 |
| `ops_payment_circuit_breaker` | Ops | 支付服务 Circuit Breaker |
| `permission_admin_dashboard` | Permission | 管理后台访问控制 |

## 3. 生命周期阶段

```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (TTL 超过)
```

| 阶段 | 说明 |
|------|------|
| **Created** | Flag 已定义但尚未启用 |
| **Active** | Flag 使用中，控制功能行为 |
| **Validated** | 功能确认正常运作 |
| **Cleanup** | 正在从代码中移除 |
| **Removed** | 完全移除（终态） |
| **Expired** | 超过 TTL 未推进 |

## 4. TTL（存活时间限制）

| 类型 | 默认 TTL | 最大 TTL |
|------|---------|---------|
| Release | 2 周 | 4 周 |
| Experiment | 4 周 | 8 周 |
| Ops | 无限 | 无限（每季审查） |
| Permission | 无限 | 无限（每年审查） |

## 5. 审计（4 个检查维度）

| 维度 | 说明 |
|------|------|
| **存活时间** | Flag 存活时间 vs TTL |
| **使用状态** | Flag 是否正在被评估 |
| **代码引用** | 多少代码位置引用此 Flag |
| **测试影响** | Flag 对测试套件的影响 |

## 6. 腐化检测

Flag 超过 TTL 时，系统必须自动执行：
1. 标记为 Expired
2. 创建技术债登记条目
3. 通知 Owner
4. 加入 Sprint Planning 提醒

## 7. 清理检查表

- [ ] 移除 Flag 判断代码
- [ ] 移除 Flag 配置
- [ ] 更新相关测试
- [ ] 更新文档
- [ ] 验证所有环境

## 8. 测试原则

1. **测试两种状态**：每个 Flag 必须测试 on/off 两种状态
2. **避免组合爆炸**：不测试所有 2^N 组合，只测试实际部署场景
3. **默认值测试**：测试 Flag 默认值的系统行为
4. **环境隔离**：测试中的 Flag 值必须与其他环境隔离

---

**相关标准：**
- [测试标准](testing-standards.md)
- [部署标准](deployment-standards.md)
- [日志标准](logging-standards.md)

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
