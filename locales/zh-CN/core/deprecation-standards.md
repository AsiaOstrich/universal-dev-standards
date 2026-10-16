---
source: ../../../core/deprecation-standards.md
source_version: 1.1.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 23dbc234e1e4
status: current
---

# 弃用与日落标准

> **语言**: [English](../../../core/deprecation-standards.md) | [繁體中文](../../zh-TW/core/deprecation-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-06-24
**适用范围**: 所有软件项目
**范围**: universal
**行业标准**: RFC 8594 (Sunset Header), RFC 8288 (Web Linking)
**参考资料**: [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594), [API Deprecation Best Practices](https://swagger.io/blog/api-strategy/api-versioning-deprecation/)

---

## 概述

本文件定义弃用全生命周期的管理标准——从 API 版本退役与功能日落到系统完全退役。结构化的弃用流程保护消费者、防止数据丢失，并确保基础设施整洁。

---

## API 弃用

### Sunset 时间线

退役 API 版本时，遵循以下 6 阶段时间线：

| 阶段 | 时间点 | 行动 |
|------|--------|------|
| **Announce** | T-6 个月 | 公布退役计划；发布 Sunset 日期；通知所有已知消费者 |
| **Deprecate** | T-3 个月 | 标记为 deprecated；在响应中添加 Deprecation 和 Sunset 请求头 |
| **Migrate** | T-3 到 T-1 个月 | 积极协助消费者迁移；提供迁移指南与工具 |
| **Warn** | T-1 个月 | 发送最终警告；在响应中加入倒计时信息 |
| **Sunset** | T | 停止响应请求；所有端点返回 410 Gone |
| **Archive** | T+1 个月 | 归档文档与数据；移除基础设施 |

### HTTP 弃用 Headers

当 API 版本进入 **Deprecate** 阶段时，所有响应必须包含：

```
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Link: <https://api.example.com/v3/docs>; rel="successor-version"
```

| Header | 用途 | 格式 |
|--------|------|------|
| `Deprecation` | 标明该 API 已弃用 | `true` (boolean) |
| `Sunset` | API 将被移除的日期 | RFC 7231 HTTP-date |
| `Link` | 指向后续版本的文档 | 带有 `rel="successor-version"` 的 URL |

### 版本并行期

当发布新版本时，旧版本必须至少维持到以下两者中较晚者：

- 新版本达到正式发布（GA）后 **6 个月**
- 最后一个活跃消费者完成迁移后 **3 个月**

这可确保消费者有充足的时间进行迁移而不会导致服务中断。

### 按 API 层级的最短弃用期

上述 6 阶段 Sunset 时间线展示了**公共 API 的默认节奏**（从 Announce 到 Sunset 大约有 6 个月的通知期）。*最短*弃用期随 API 的受众群体和关键程度而调整。适用以下层级最低要求与上述版本并行期两者中的**较长者**：

| API 层级 | 最短弃用期 |
|----------|------------|
| **Internal API** | 1 个次要版本 |
| **Partner API** | 2 个次要版本 + 3 个月 |
| **Public API** | 2 个次要版本 + 6 个月 |
| **Critical Infrastructure** | 最短 1 年 |

这些均为最低要求；SLA 或合同承诺可能要求更长的周期（参见[功能日落 → 影响分析](#impact-analysis)）。至于什么*算作*触发弃用的破坏性变更（breaking change），以及 API 版本控制机制本身，均归入 [API 设计标准](api-design-standards.md#api-versioning-strategies)——本标准仅作为弃用时间线与这些通知期的唯一事实来源。

---

## 消费者通知策略

有效的弃用需要通过多种渠道触达消费者。使用至少 5 个通知渠道：

| 渠道 | 时机 | 内容 |
|------|------|------|
| **CHANGELOG / Release Notes** | 宣布阶段 | 退役计划、Sunset 日期、迁移指南链接 |
| **API Response Header** | 弃用阶段起 | Sunset header + successor-version 链接 |
| **Email / 通知** | 宣布 + 警告阶段 | 直接通知已知消费者 |
| **API 文档** | 宣布阶段起 | 明确标记为 deprecated；提供新版本链接 |
| **Dashboard / 监控** | 弃用阶段起 | 追踪剩余消费者数量与流量 |

**最佳实践：**
- 在每次通知中均包含迁移指南链接
- 提供专用的迁移支持渠道（Slack、电子邮件别名）
- 追踪通知的送达率与确认率

---

## 功能日落

### 影响分析

在移除某项功能之前，评估 5 个分析维度：

| 维度 | 关键问题 |
|------|---------|
| **Usage** | 过去 30 天有多少用户使用了此功能？趋势如何？ |
| **Dependency** | 哪些其他功能、服务或集成依赖此功能？ |
| **Data** | 此功能是否产生或管理独特数据？是否需要迁移或归档？ |
| **Contract** | 是否存在与此功能绑定的 SLA 承诺、合同义务或合规要求？ |
| **Alternative** | 是否有替代方案？用户是否知道如何迁移？替代方案功能是否完备？ |

### 功能日落执行检查清单

影响分析完成并确认移除决策后，逐项核对：

- [ ] 通知受影响的用户（至少提前 30 天）
- [ ] 提供替代解决方案或迁移指南
- [ ] 移除功能代码（不留遗留死代码）
- [ ] 移除相关的 Feature Flags
- [ ] 迁移或归档相关数据
- [ ] 更新 API 文档和用户文档
- [ ] 设置重定向（旧 URL → 替代功能或说明页面）
- [ ] 更新 CHANGELOG

---

## 系统退役

### 退役流程

当退役整个系统或服务时，遵循以下 7 个阶段：

| 阶段 | 行动 | 验证 |
|------|------|------|
| **1. Dependency Analysis** | 识别所有上下游依赖 | 依赖图无未解节点 |
| **2. Consumer Migration** | 协助所有消费者迁移至替代服务 | 流量降至 0 |
| **3. Data Archival** | 依照合规与保留要求归档数据 | 归档完整性已验证 |
| **4. DNS/Redirect** | 旧端点返回 410 Gone 或重定向至替代服务 | 响应已验证正确 |
| **5. Infrastructure Cleanup** | 移除服务器、数据库、队列、存储 | 资源释放已确认 |
| **6. Monitoring Removal** | 移除告警、仪表板、Runbook | 无孤立告警残留 |
| **7. Documentation Archival** | 标记文档为已归档 | 文档索引已更新 |

### 数据归档策略

系统退役期间归档数据时，遵循以下保留规则：

| 数据类型 | 保留期限 | 归档方式 |
|----------|----------|----------|
| **User Data** | 依照隐私法规（GDPR：删除；其他：5–7 年） | 加密冷存储 |
| **Transaction Records** | 依照税务/审计要求（通常为 7 年） | 只读归档 |
| **Logs** | 1 年 | 压缩归档 |
| **Config/Code** | 永久（已在 Git 中） | Git 历史 |

**归档原则：**
- 在删除源数据前，使用校验和验证归档完整性
- 记录归档位置及访问程序
- 确保已归档数据仍可用于合规审计

---

## 退役指标

使用以下 4 项指标追踪弃用进度：

| 指标 | 定义 | 目标 |
|------|------|------|
| **Consumer Migration Rate** | 已迁移消费者 / 总消费者 | Sunset 时 100% |
| **Remaining Traffic** | 每日发往已弃用端点的请求数 | Sunset 时 0 |
| **Dependency Cleanup Rate** | 已清理依赖 / 总依赖 | Archive 时 100% |
| **Data Archival Completion** | 已归档数据集 / 需要归档的数据集总数 | Archive 时 100% |

**监控建议：**
- 弃用期间每周审查指标
- 若在中期消费者迁移率低于 50%，进行上报呈报
- 若剩余流量高于阈值，则阻断 Sunset

---

## 快速参考卡

### Sunset Timeline Summary
```
T-6 months   → Announce (publish plan)
T-3 months   → Deprecate (add headers)
T-3 to T-1   → Migrate (assist consumers)
T-1 month    → Warn (final notice)
T             → Sunset (410 Gone)
T+1 month    → Archive (cleanup)
```

### Feature Removal Decision
```
Usage > 0 in 30 days?      → Evaluate carefully
Has dependencies?           → Map and migrate first
Has contractual obligation? → Legal review required
No alternative exists?      → Build alternative first
```

---

## 参考资料

- [RFC 8594 — The Sunset HTTP Header Field](https://www.rfc-editor.org/rfc/rfc8594) — 传达 API 退役日期的标准
- [RFC 8288 — Web Linking](https://www.rfc-editor.org/rfc/rfc8288) — 包含 successor-version 的链接关系类型
- [API Versioning and Deprecation](https://swagger.io/blog/api-strategy/api-versioning-deprecation/) — API 生命周期管理的最佳实践

---

**相关标准：**
- [API 设计标准](api-design-standards.md) — API 设计与版本控制约定
- [Changelog 标准](changelog-standards.md) — 用于弃用公告的 CHANGELOG 格式
- [部署标准](deployment-standards.md) — 部署与基础设施管理

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-06-24 | 新增：按 API 层级的最短弃用期——确立本标准作为弃用期的唯一事实来源，整合自 versioning.md 并与 Sunset 时间线和版本并行期保持一致（XSPEC-298 R8, UDS #126） |
| 1.0.0 | 2026-03-31 | 初始发布：API 弃用、功能日落、系统退役、退役指标 |

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
