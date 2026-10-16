---
source: ../../../core/environment-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: d96f447e1080
status: current
---

# 环境管理标准

> **语言**: [English](../../../core/environment-standards.md) | [繁體中文](../../zh-TW/core/environment-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有软件项目
**范畴**: universal
**行业标准**: The Twelve-Factor App, NIST SP 800-123, CIS Benchmarks
**参考资料**: [12factor.net](https://12factor.net/), [NIST](https://csrc.nist.gov/)

---

## 概述

本文档定义应用程序环境在整个生命周期中的管理标准——从本地开发到生产部署。涵盖环境层级、配置管理、环境一致性、密钥处理及验证程序。

---

## 1. 环境层级

### 1.1 标准层级 (MUST)

每个项目必须 (MUST) 定义至少四个标准环境层级：

| 层级 | 用途 | 受众 | 数据 |
|------|------|------|------|
| **Local** | 个人开发工作站 | 单一开发者 | 合成 / 种子数据 |
| **Dev** | 共享开发与集成 | 开发团队 | 合成测试数据 |
| **Staging** | 上线前验证与 QA | QA 团队、利益相关者 | 匿名化的类生产数据 |
| **Production** | 服务终端用户的正式系统 | 终端用户 | 真实用户数据 |

### 1.2 可选层级 (MAY)

项目可以 (MAY) 根据特殊需求定义额外层级：

| 层级 | 用途 | 生命周期 |
|------|------|-----------|
| **Preview** | 每个 PR 用于审查的临时环境 | PR 打开时创建，PR 合并时自动清理 |
| **Sandbox** | 隔离的实验环境 | 按需创建，手动或定时清理 |
| **DR** (Disaster Recovery) | 业务连续性故障转移环境 | 热备或冷备，发生事故时激活 |

---

## 2. 配置优先层级

### 2.1 五层优先级 (MUST)

配置值必须 (MUST) 按照以下优先级顺序解析（由高到低）：

| 优先级 | 来源 | 说明 | 示例 |
|----------|--------|-------------|---------|
| 1 (最高) | **环境变量 (Environment Variables)** | 运行时环境变量 | `DATABASE_URL=postgres://...` |
| 2 | **命令行参数 (Command-line Arguments)** | CLI 标志与参数 | `--port 3000` |
| 3 | **环境配置文件 (Environment Config Files)** | 每个环境的配置文件 | `.env.staging`, `config/staging.yaml` |
| 4 | **应用配置文件 (Application Config Files)** | 共享的应用默认值 | `config/default.yaml`, `application.yml` |
| 5 (最低) | **硬编码默认值 (Hardcoded Defaults)** | 代码内置的回退值 | `const PORT = config.port ?? 3000` |

### 2.2 解析规则

- 较高优先级的来源必须 (MUST) 覆盖较低优先级的来源
- 较高层级缺失的值必须 (MUST) 向下穿透至下一层级
- 应用程序在启动时应该 (SHOULD) 记录使用了哪个配置源（无需记录密钥值）

---

## 3. 环境一致性

### 3.1 六大一致性维度

为最大限度减少“在我的机器上能跑”的问题，环境必须 (MUST) 在以下维度保持一致性：

| 维度 | 要求 | 理由 |
|--------|-------------|-----------|
| **技术栈 (Tech Stack)** | **必须 (MUST)** 相同 | 所有层级使用相同的语言版本、框架和运行时 |
| **架构拓扑 (Architecture Topology)** | **应该 (SHOULD)** 相同 | 相同的服务拓扑；偏差必须 (MUST) 记录成文 |
| **配置结构 (Configuration Structure)** | **必须 (MUST)** 相同 | 相同的配置键与模式（schema）；各环境的值不同 |
| **数据结构 (Data Structure)** | **必须 (MUST)** 相同 | 相同的数据库模式（schema），所有层级均应用迁移 |
| **规模 (Scale)** | **可以 (MAY)** 不同 | 生产环境可以有更多副本、更大的实例规格 |
| **数据内容 (Data Content)** | **必须 (MUST)** 不同 | 非生产环境必须 (MUST) 使用匿名化或合成数据；切勿复制原始生产数据 |

### 3.2 一致性验证

团队应该 (SHOULD) 在 CI/CD 中自动化一致性检查：

- Staging 与 Production 之间的 Schema 比对
- 基础设施即代码（Infrastructure-as-Code）diff 报告
- 跨层级的依赖版本审计

---

## 4. 密钥管理

### 4.1 核心原则

所有项目必须 (MUST) 遵循以下五大密钥管理原则：

#### 原则 1: 不入版控 (No Version Control)

密钥绝不能 (MUST never) 提交到版本控制。这包括 API 密钥、密码、令牌、证书和连接字符串。

#### 原则 2: 模板化 (Template-Based)

项目必须 (MUST) 提供一个 `.env.example` 模板文件，记录所有必需的环境变量，且不包含实际密钥值：

```bash
# .env.example — commit this file
DATABASE_URL=postgres://user:password@localhost:5432/mydb
API_KEY=your-api-key-here
SECRET_KEY=generate-with-openssl-rand-hex-32
```

#### 原则 3: 集中管理 (Centralized Management)

生产环境密钥应该 (SHOULD) 存储在集中式密钥管理器中：

- AWS Secrets Manager / SSM Parameter Store
- HashiCorp Vault
- Azure Key Vault
- Google Cloud Secret Manager
- 1Password / Doppler（适用于较小团队）

#### 原则 4: 最小权限 (Least Privilege)

密钥访问必须 (MUST) 遵循最小权限原则：

- 每个服务仅获取其所需的密钥
- 每个环境使用独立的凭据
- 避免共享服务账户

#### 原则 5: 定期轮替 (Regular Rotation)

密钥必须 (MUST) 按照定期计划进行轮替：

| 密钥类型 | 轮替频率 |
|-------------|-------------------|
| API 密钥 | 每 90 天 |
| 数据库密码 | 每 90 天 |
| TLS 证书 | 到期前（使用 ACME 自动化） |
| 服务账户密钥 | 每 180 天 |

---

## 5. 密钥相关的 .gitignore 规则

### 5.1 最低要求规则 (MUST)

每个项目必须 (MUST) 在 `.gitignore` 中至少包含以下模式，以防止意外泄露密钥：

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Certificates and keys
*.pem
*.key

# Cloud credentials
credentials.json
service-account.json
```

### 5.2 额外推荐规则 (SHOULD)

```gitignore
# Additional secret patterns
*.p12
*.pfx
*.jks
.env.production
.env.staging
*-secret.yaml
*-secret.json
```

---

## 6. 环境验证检查清单

### 6.1 八大验证检查类别

在将部署晋级至新环境之前，团队必须 (MUST) 验证以下八个类别：

| # | 类别 | 检查项目 |
|---|----------|-------------|
| 1 | **连接性 (Connectivity)** | 数据库连接、API 端点可达、消息队列连通性、缓存可用性 |
| 2 | **认证 (Authentication)** | SSO/OAuth 流程正常运作、API 密钥有效性、服务间认证、证书到期时间 |
| 3 | **数据 (Data)** | Schema 迁移已应用、种子数据已加载、数据完整性约束有效 |
| 4 | **监控 (Monitoring)** | 指标收集已激活、日志聚合正常工作、告警规则已部署、仪表盘可访问 |
| 5 | **安全 (Security)** | TLS 已配置、CORS 策略已设置、速率限制已激活、WAF 规则已应用 |
| 6 | **访问 (Access)** | 团队访问权限、部署凭据、管理控制台访问权限、VPN 连通性 |
| 7 | **备份 (Backup)** | 备份计划已配置、恢复程序已测试、保留策略已设置 |
| 8 | **DNS** | 域名记录正确、SSL 证书有效、CDN 配置、健康检查端点 |

### 6.2 验证自动化

团队应该 (SHOULD) 创建自动化验证脚本（冒烟测试）来验证各个类别：

```bash
# Example: verify-environment.sh
./checks/connectivity.sh   # Test all service endpoints
./checks/auth.sh           # Validate authentication flows
./checks/data.sh           # Run schema validation
./checks/monitoring.sh     # Confirm metrics pipeline
./checks/security.sh       # TLS and policy checks
./checks/access.sh         # Permission validation
./checks/backup.sh         # Backup system health
./checks/dns.sh            # DNS resolution checks
```

---

## 7. 临时环境生命周期

### 7.1 Preview 环境管理

Preview 环境（每个 PR）必须实现自动清理（automatic cleanup）机制：

```
PR Opened → Build Preview Env → Run Checks → Review
                                                 │
PR Merged ──────────────────────────────────────►│
                                                 ▼
                                     Auto-Destroy Preview Env
```

**要求：**

- 当 PR 合并或关闭时，Preview 环境必须自动销毁
- 清理必须包含所有已配置的资源（计算、存储、DNS 记录）
- 清理失败必须向基础设施团队发出告警
- 应该设置最大 TTL（例如 7 天）作为安全防线

### 7.2 基础设施即代码

所有环境的配置均必须通过基础设施即代码（IaC）进行记录：

- **构建文档 (Build Documentation)**：基础设施定义必须纳入版本控制
- **验证清单 (Verification Checklist)**：每个环境必须有相应的验证清单
- 环境必须仅凭 IaC 定义即可重现

---

## 8. 基础设施即代码（IaC）原则

### 8.1 核心原则

所有基础设施配置必须遵循以下六项 IaC 核心原则：

| # | 原则 | 描述 |
|---|------|------|
| 1 | **Declarative-First（声明式优先）** | 描述期望的最终状态而非过程步骤。声明式定义使基础设施具有可预测性且可被审计。 |
| 2 | **Idempotency（幂等性）** | 多次应用相同的配置必须产生相同的结果。重复执行不会产生副作用。 |
| 3 | **Version Control（版本控制）** | 所有 IaC 代码必须存储在 Git 中。变更通过提交历史进行跟踪、审查和审计。 |
| 4 | **Modularity（模块化）** | 基础设施应该由可重用的模块组成。避免在各环境之间复制粘贴造成重复。 |
| 5 | **Environment Parameterization（环境参数化）** | 在各环境中以不同的参数值使用相同的模块。环境特定值通过变量注入，而非硬编码。 |
| 6 | **Immutable Infrastructure（不可变基础设施）** | 更新基础设施时，替换资源而非就地修改。这可确保一致性并简化回滚。 |

### 8.2 IaC 代码审查检查清单

当 PR 包含 IaC 变更时，审查者必须评估以下四个方面：

| # | 方面 | 检查项目 |
|---|--------|-------------|
| 1 | **Security（安全性）** | 应用最小权限、无硬编码密钥、IAM 策略范围正确、网络暴露最小化 |
| 2 | **Cost Impact（成本影响）** | 新资源已识别、实例规格合理、预估每月成本变化已记录 |
| 3 | **Rollback Feasibility（回滚可行性）** | 变更可逆、破坏性操作已标记、有状态资源具有备份/快照策略 |
| 4 | **Environment Consistency（环境一致性）** | 变更维持各层级间的一致性、环境特定覆写已记录、未引入配置漂移 |

### 8.3 漂移检测

当资源的实际状态与 IaC 定义的状态发生偏离时（例如通过控制台手动变更），即会发生基础设施漂移。团队必须实施漂移检测实践：

**检测：**
- 按计划定期运行漂移检测扫描（例如 `terraform plan`、`pulumi preview`）（推荐：生产环境每日运行）
- 将实际基础设施状态与 IaC 定义的期望状态进行对比
- 将漂移检查集成至 CI/CD 流水线

**通知：**
- 检测到的漂移必须向负责团队发出通知（通过 Slack、电子邮件或告警系统）
- 漂移报告应该包含：受影响的资源、检测到的差异以及时间戳

**修复：**
- 团队必须使用以下两种方法之一解决漂移：
  - **更新 IaC**：如果手动变更为有意为之，更新 IaC 代码以反映新的期望状态
  - **还原基础设施**：如果手动变更为未授权或意外变更，还原基础设施以匹配 IaC 定义
- 漂移修复应该作为工单进行跟踪，并在定义的 SLA 内解决

---

## 参考资料

- [The Twelve-Factor App — Config](https://12factor.net/config) — 基于环境的配置原则
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) — 密钥处理最佳实践
- [NIST SP 800-123](https://csrc.nist.gov/publications/detail/sp/800-123/final) — 通用服务器安全指南

---

**相关标准：**
- [日志标准](logging-standards.md) — 按环境划分的结构化日志
- [部署标准](deployment-standards.md) — CI/CD 与部署流水线
- [安全标准](security-standards.md) — 安全控制与合规
- [可观测性标准](observability-standards.md) — 监控与告警

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：环境层级、配置层级、一致性、密钥管理、验证清单、临时环境 |

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
