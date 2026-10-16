---
source: ../../../core/privacy-standards.md
source_version: 1.1.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 2f216c008c09
status: current
---

# 隐私标准

> **语言**: [English](../../../core/privacy-standards.md) | [繁體中文](../../zh-TW/core/privacy-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-06-18
**适用范围**: 所有处理个人数据的软件项目
**范围**: universal
**行业标准**: GDPR, CCPA, Privacy by Design (Ann Cavoukian)
**参考资料**: [gdpr.eu](https://gdpr.eu/), [ipc.on.ca](https://www.ipc.on.ca/)

---

## 概述

本文件定义在软件生命周期中保护用户数据的隐私标准，基于 Privacy by Design 原则与国际数据保护法规。

---

## Privacy by Design 原则

7 项基础原则（Ann Cavoukian，2009 年）：

| # | 原则 | 说明 |
|---|------|------|
| 1 | **主动而非被动** | 在隐私问题发生前预防 |
| 2 | **默认隐私保护** | 个人数据自动受到保护；无需用户采取操作 |
| 3 | **隐私嵌入设计** | 隐私是系统架构的一部分，非附加组件 |
| 4 | **完整功能 — 正和** | 隐私与功能兼得，非二选一 |
| 5 | **端到端安全** | 数据在整个生命周期中受到保护（从收集到删除） |
| 6 | **可见性与透明度** | 所有实践可文档化、可验证，并公开接受审查 |
| 7 | **尊重用户隐私 — 以用户为中心** | 用户利益至上；提供强默认设置与明确选项 |

---

## 数据分类

按敏感度级别对所有数据进行分类：

| 等级 | 说明 | 处理要求 |
|------|------|---------|
| **公开** | 可自由分享（营销内容、文档） | 无限制 |
| **内部** | 仅供内部使用（内部报告、会议记录） | 访问控制，不得公开分享 |
| **机密** | 敏感商业数据（财务、策略） | 静态/传输中加密、审计日志、需知原则访问 |
| **受限** | 高度敏感 PII、健康、财务（SSN、医疗记录） | 最强加密、严格访问、数据脱敏、合规监管 |

---

## 数据保护影响评估（DPIA）

### 触发条件

DPIA 必须在以下情况执行：
- **大规模**处理个人数据（参见下方的量化标准）
- 系统性监控公共区域
- 具有法律效力的自动化决策
- 处理特殊类别数据（健康、生物识别、基因）
- 合并来自不同来源的数据集
- 处理弱势群体数据（儿童、员工）

> **“大规模” — 量化标准** _（来源：GDPR 第 35 条；WP29 DPIA
> 指南 WP248rev.01）_。没有单一明确的数字可以界定“大规模”；应
> 根据四个因素进行评估：(1) 数据主体数量 — 绝对数量或在相关
> 人群中的比例；(2) 数据项的容量与范围；(3) 处理的持续时间或
> 永久性；(4) 地理范围。当处理在**两个或两个以上**因素上达到显著
> 程度时，即视为大规模处理。**例外**：一次性处理、单个个人的数据或
> 单个从业者的记录不属于“大规模”，仅凭此理由不会触发 DPIA
> （上述其他触发条件仍可能适用）。

### 简化 DPIA 模板

```markdown
## DPIA: [Project/Feature Name]

### 1. Data Processing Description
- What data is collected?
- Why is it collected?
- How is it processed?
- Who has access?

### 2. Necessity Assessment
- Is all collected data necessary for the stated purpose?
- Can the purpose be achieved with less data?

### 3. Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigation measure] |

### 4. Decision
- [ ] Proceed as planned
- [ ] Proceed with mitigations
- [ ] Redesign required
- [ ] Do not proceed
```

---

## 数据最小化

### 核心原则

| 原则 | 说明 |
|------|------|
| **仅收集必要数据** | 每个数据字段须有文档化的用途 |
| **定义保留期限** | 每种数据类型须有明确保留期限 |
| **到期自动删除** | 超过保留期限的数据须自动删除或匿名化 |
| **目的限制** | 为某目的收集的数据不得未经同意用于他途 |
| **存储限制** | 数据保存时间不得超过满足其用途所需的时间 |

### 保留期限指南

| 数据类型 | 建议保留期限 | 理由 |
|---------|------------|------|
| Session 数据 | Session 期间 | 登出后不再需要 |
| 活动日志 | 90 天 | 调试与技术支持 |
| 账号数据 | 账号删除 + 30 天 | 恢复宽限期 |
| 交易记录 | 7 年 | 税务/审计合规 |
| 营销偏好 | 直到撤回同意 | 基于同意 |

---

## 用户权利

支持这 5 项基本用户权利：

| 权利 | 说明 | 实现方式 |
|------|------|---------|
| **访问** | 用户可请求获取其个人数据的副本 | 导出端点、机器可读格式（JSON/CSV） |
| **更正** | 用户可更正不准确的个人数据 | 编辑个人资料、针对非自助服务字段的客服支持渠道 |
| **删除**（被遗忘权） | 用户可请求删除其数据 | 账号删除流程、30 天内级联删除至备份 |
| **数据可携** | 用户可以可携格式接收其数据 | 标准格式导出（JSON、CSV）、用于批量导出的 API |
| **反对** | 用户可反对特定的处理活动 | Opt-out 机制、细粒度同意管理 |

---

## 隐私检查清单

在发布处理个人数据的新功能之前，请验证：

- [ ] **数据盘点**：所有个人数据字段均已文档化其用途与法律依据
- [ ] **最小化**：仅收集必要数据；无“锦上添花”字段
- [ ] **同意**：在需要时已取得用户同意（主动勾选 opt-in，而非预先勾选）
- [ ] **保留期限**：已定义保留期限且已配置自动删除
- [ ] **访问控制**：仅授权人员可访问该数据
- [ ] **加密**：数据在静态与传输中均已加密
- [ ] **用户权利**：用户可访问、更正、删除及导出其数据
- [ ] **第三方**：与第三方的数据共享已记录并合法
- [ ] **DPIA**：已完成影响评估（如符合触发条件）
- [ ] **泄露应对计划**：数据泄露通知流程已就位

---

## 快速参考卡

### 数据处理决策
```
Is it personal data?
├─ No → Standard handling
└─ Yes
   ├─ Is it special category (health, biometric)?
   │  └─ Yes → Restricted + DPIA required
   └─ No
      ├─ Is it identifiable (name, email)?
      │  └─ Yes → Confidential
      └─ No (anonymized/aggregated) → Internal
```

---

## 参考资料

- [GDPR Full Text](https://gdpr.eu/) — 欧洲数据保护法规
- [Privacy by Design — 7 Foundational Principles](https://www.ipc.on.ca/) — Ann Cavoukian
- [CCPA](https://oag.ca.gov/privacy/ccpa) — 加利福尼亚州消费者隐私法案
- [OWASP Privacy Risks](https://owasp.org/www-project-top-10-privacy-risks/) — 十大隐私风险

---

**相关标准：**
- [安全标准](security-standards.md) — 数据保护的安全控制
- [日志标准](logging-standards.md) — 日志中的 PII 处理
- [环境标准](environment-standards.md) — 机密管理
- [测试数据标准](test-data-standards.md) — 用于测试的数据匿名化

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.1.0 | 2026-06-18 | 新增：量化“大规模”DPIA 触发标准（GDPR 第 35 条 / WP29 WP248）+ 例外条款（XSPEC-292 T8） |
| 1.0.0 | 2026-04-01 | 初始发布 |

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
