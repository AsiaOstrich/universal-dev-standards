---
source: ../../../core/supply-chain-security-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: 25ea1d1d96a9
status: current
---

# 供应链安全标准

> **语言**: [English](../../../core/supply-chain-security-standards.md) | [繁體中文](../../zh-TW/core/supply-chain-security-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-08-04
**适用范围**: 所有包含外部依赖的软件项目
**范围**: universal
**行业标准**: SLSA, SPDX, CycloneDX, OpenSSF Scorecard
**参考链接**: [slsa.dev](https://slsa.dev/), [spdx.dev](https://spdx.dev/), [cyclonedx.org](https://cyclonedx.org/)

---

## 概述

本文件定义供应链安全标准，涵盖软件物料清单（SBOM）、依赖审计、SLSA 成熟度等级、许可证合规与依赖健康评估。

---

## 软件物料清单（SBOM）

### SBOM 格式比较

| 方面 | SPDX | CycloneDX |
|--------|------|-----------|
| **维护者** | Linux Foundation | OWASP |
| **主要焦点** | 许可证合规 + 安全 | 安全 + 组件分析 |
| **格式** | JSON, RDF, YAML, Tag-Value | JSON, XML, Protobuf |
| **ISO 标准** | ISO/IEC 5962:2021 | ECMA-424 |
| **生态系统** | 在开源治理中表现强劲 | 在 DevSecOps 工具链中表现强劲 |

### 选型指南

- 当许可证合规是首要考量或需要 ISO 认证时，**选择 SPDX**
- 当安全分析与 DevSecOps 集成为优先事项时，**选择 CycloneDX**
- **任一格式**均可接受；组织内部的一致性比具体选择更重要

### SBOM 需求

- 每次发布必须包含 SBOM，列出所有直接与间接依赖
- SBOM 必须包含：组件名称、版本、供应商、许可证以及已知漏洞
- SBOM 应作为 CI/CD 流水线的一部分自动生成

---

## 依赖审计

### 四大审计维度

| 维度 | 检查内容 | 严重性 |
|-----------|--------------|----------|
| **已知漏洞** | CVE 数据库（NVD, OSV, GitHub Advisory） | Critical: 阻断, High: 警告 |
| **许可证合规** | 许可证与项目许可证的兼容性 | 不兼容: 阻断 |
| **维护状态** | 最后提交日期、开放 Issue、维护者数量 | 超过 2 年未维护: 警告 |
| **版本时效** | 落后最新版本多少个 Major/Minor | 落后 Major > 2: 警告 |

### 审计频率

| 触发条件 | 操作 |
|---------|--------|
| 每次 CI 构建 | 漏洞扫描（自动） |
| 每周 | 完整审计报告（自动） |
| 发布前 | 人工审查所有警告 |
| 收到安全通报时 | 立即评估受影响的依赖 |

---

## SLSA 等级

软件产物供应链等级（Supply-chain Levels for Software Artifacts）定义了构建完整性的成熟度等级：

| 等级 | 需求 | 适用场景 |
|-------|-------------|-------------------|
| **L1 — Provenance** | 构建流程文档化；生成 SBOM | 所有项目（最低基准） |
| **L2 — Build Service** | 在托管服务上构建；签署 Provenance | 拥有 CI/CD 流水线的项目 |
| **L3 — Hardened Builds** | 隔离、短暂的构建环境；不可伪造的 Provenance | 安全关键应用 |
| **L4 — Two-Party Review** | 所有变更需两人审查；密封式构建 | 基础设施、金融系统 |

### 演进路径

从 L1 开始，根据风险状况逐步采用更高等级：

```
L1 (All projects) → L2 (CI/CD projects) → L3 (Security-critical) → L4 (High-assurance)
```

---

## 许可证合规

### 许可证类别矩阵

| 类别 | 示例 | 兼容性 | 风险 |
|----------|---------|--------------|------|
| **宽松式** | MIT, Apache-2.0, BSD-2/3 | 几乎与所有许可证兼容 | 低 |
| **弱 Copyleft** | LGPL-2.1, MPL-2.0 | 作为库使用（未修改）时兼容 | 中 |
| **强 Copyleft** | GPL-2.0, GPL-3.0 | 要求衍生作品使用相同许可证 | 高 |
| **网络 Copyleft** | AGPL-3.0 | 将 Copyleft 延伸至网络交互 | 极高 |
| **专有** | 自定义、无许可证 | 未经明确许可不得使用 | 阻断 |

### 合规规则

- **宽松式 + 宽松式**：始终兼容
- **宽松式 + Copyleft**：若遵循 Copyleft 条款则兼容
- **Copyleft + 不同 Copyleft**：通常不兼容——需要法务审查
- **SaaS 中的 AGPL**：会触发整个服务的 Copyleft——需要审慎评估
- **无许可证**：视为专有——未经明确许可不得使用

---

## 依赖更新策略

| 更新类型 | 策略 | 自动化 |
|-------------|----------|-----------|
| **Patch** (x.y.Z) | CI 通过后自动合并 | 全自动（Dependabot/Renovate） |
| **Minor** (x.Y.0) | 自动创建 PR，人工审查 | 半自动 |
| **Major** (X.0.0) | 人工评估，制定迁移计划 | 手动审查变更日志 |
| **锁定策略** | 提交 lock 文件——**若你发布软件包，另须验证消费端会解析到什么**（见下） | lock 文件提交进版本控制；发布时检查消费端解析 |

### 更新规则

- lock 文件必须提交到版本控制中
- Patch 更新应在 7 天内应用
- 安全补丁必须在 48 小时（Critical）或 7 天（High）内应用
- Major 版本升级应每季度评估一次

### lock 文件约束不了你的用户

提交 lock 文件让**你自己的**构建可重现。它触达不到任何安装你软件包的人：发布出去的 npm
tarball、PyPI wheel、Ruby gem 都不带 lock 文件。消费端是**在他们安装的当下、自行解析你
声明的范围**，拿到当时满足该范围的任何版本。

**两者不同时，你的测试套件会对着一个没有人会安装的组合亮绿灯——而那个绿灯与真绿灯
无从分辨。**

这是观察到的失效，不是假设的：某项目声明 `"tree-sitter-c-sharp": "^0.23.1"`。该区间有
三个已发布版本而它们并不共享同一套 API。npm 把 caret 解析到最新匹配版本，于是每一次全新安装
都拿到不兼容的那个，**任何从 registry 安装的人的 C# 文件从未解析成功过**——而 lock 文件
锁着能用的版本、每个测试都通过，横跨该功能的整个生命周期。该项目的源码注释甚至早就记录了
那个不兼容版本；caret 悄悄把它又放了回来。

因此**会发布软件包**的项目另须：

- **知道消费端安装会解析到什么。** 逐一比对每个 runtime 依赖的声明范围、锁定版本，以及
  该范围今天会解析到的版本。**只报告差异**——一份大多一致的表格会被略过，而其中真正
  有问题的那几行也跟着被略过。
- **原生依赖一律声明为精确版本。** 带原生绑定的软件包（有 install 家族脚本，或依赖
  node-gyp / prebuild / node-addon-api / cmake-js 及同类者）**不得**以范围声明。semver 对
  原生 ABI 兼容性没有任何承诺，而这在实践中已被在 minor 范围内打破过。**不论它们当前是否
  正在漂移都要标出**：一个只对应到单一已发布版本的范围，安全是因为上游还没再发布，
  不是因为有任何保障。
- **发版前以消费端解析跑一次测试套件。** 在没有 lock 文件的情况下安装，再对结果跑真正的
  测试。这是本节唯一**不需要事先知道哪个依赖会坏**的检查。
- **查不到的东西记为未知，绝不记为一致。** 一个“没问题”与“我查不到”长得一样的检查，
  会把未知转成安心。

> **适用于发布出去的产物，不适用于应用程序。** 一个部署出去的服务会连同 lock 文件一起
> 发布，因此它的构建与运行看到的是同一组版本。本节谈的是**别人会安装的软件包**。

---

## CI/CD 集成

### 流水线安全关卡

依赖扫描必须集成到 CI/CD 中：

```
PR Created → Dependency Scan → Results
                                  │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              Critical         High           Medium/Low
              → Block PR       → Warn +       → Log only
                               Create Ticket
```

### 必需的流水线步骤

1. **SBOM 生成** — 每次构建均生成 SBOM
2. **漏洞扫描** — 对照 CVE 数据库进行检查
3. **许可证扫描** — 验证许可证兼容性
4. **依赖时效性** — 报告过期的依赖项

---

## 依赖健康评估

### 健康指标

| 指标 | 健康 | 警告 | 不健康 |
|--------|---------|---------|-----------|
| **最后更新日期** | < 6 个月 | 6-24 个月 | > 24 个月 |
| **已知 CVE** | 0 个 Critical/High | 1-2 个 High | 任何未修补的 Critical |
| **维护者数量** | ≥ 3 | 2 | 1（巴士系数风险） |
| **社区活跃度** | 活跃的 Issue/PR | 响应缓慢 | 已废弃 |
| **下载趋势** | 稳定或增长 | 下降 | 接近零 |

### 健康评分

将各项指标综合为整体健康评分：
- **绿色**（健康）：所有指标均无警告
- **黄色**（注意）：存在 1-2 项警告级别的指标
- **红色**（需采取行动）：存在任何不健康指标或 Critical CVE

---

## 快速参考卡

```
新增依赖？   → 检查：许可证兼容？无 CVE？有维护？够普及？
CI 构建？    → 自动扫描漏洞 + 许可证
发布？      → 生成 SBOM，审查所有警告
Critical CVE？ → 48 小时内修补
```

---

## 参考链接

- [SLSA Framework](https://slsa.dev/) — 软件产物供应链等级（Supply-chain Levels for Software Artifacts）
- [SPDX Specification](https://spdx.dev/) — 软件包数据交换（Software Package Data Exchange）
- [CycloneDX](https://cyclonedx.org/) — OWASP 软件物料清单标准
- [OpenSSF Scorecard](https://securityscorecards.dev/) — 自动化安全健康检查

---

**相关标准：**
- [安全标准](security-standards.md) — 应用程序安全
- [容器化标准](containerization-standards.md) — 镜像漏洞扫描
- [废弃标准](deprecation-standards.md) — 依赖弃用通知

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | 初始发布 |

---

## 许可证

本标准基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
