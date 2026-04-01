---
source: ../../../core/supply-chain-security-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# 供应链安全标准

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文件定义供应链安全标准，涵盖软件物料清单（SBOM）、依赖审计、SLSA 成熟度等级、许可证合规与依赖健康评估。

## 软件物料清单（SBOM）

### 格式比较

| 方面 | SPDX | CycloneDX |
|------|------|-----------|
| **维护者** | Linux Foundation | OWASP |
| **主要焦点** | 许可证合规 + 安全 | 安全 + 组件分析 |
| **格式** | JSON, RDF, YAML, Tag-Value | JSON, XML, Protobuf |
| **ISO 标准** | ISO/IEC 5962:2021 | ECMA-424 |

### 需求

- 每次发布必须包含 SBOM，列出所有直接与间接依赖
- SBOM 必须包含：组件名称、版本、供应商、许可证、已知漏洞
- SBOM 应作为 CI/CD Pipeline 的一部分自动生成

## 依赖审计

### 四大审计维度

| 维度 | 检查项目 | 严重性 |
|------|---------|--------|
| **已知漏洞** | CVE 数据库（NVD, OSV, GitHub Advisory） | Critical: 阻断, High: 警告 |
| **许可证合规** | 许可证与项目许可证的兼容性 | 不兼容: 阻断 |
| **维护状态** | 最后提交日期、开放 Issue、维护者数量 | 超过 2 年未维护: 警告 |
| **版本时效** | 落后最新版本多少个 Major/Minor | 落后 Major > 2: 警告 |

## SLSA 等级

| 等级 | 需求 | 适用场景 |
|------|------|---------|
| **L1 — Provenance** | 构建流程文档化；生成 SBOM | 所有项目（最低基准） |
| **L2 — Build Service** | 在托管服务上构建；签署 Provenance | 有 CI/CD Pipeline 的项目 |
| **L3 — Hardened Builds** | 隔离、短暂的构建环境；不可伪造的 Provenance | 安全关键应用 |
| **L4 — Two-Party Review** | 所有变更需两人审查；密封式构建 | 基础设施、金融系统 |

## 许可证合规

### 许可证类别矩阵

| 类别 | 示例 | 兼容性 | 风险 |
|------|------|--------|------|
| **宽松式** | MIT, Apache-2.0, BSD | 几乎与所有许可证兼容 | 低 |
| **弱 Copyleft** | LGPL-2.1, MPL-2.0 | 作为库使用时兼容 | 中 |
| **强 Copyleft** | GPL-2.0, GPL-3.0 | 衍生作品须使用相同许可证 | 高 |
| **网络 Copyleft** | AGPL-3.0 | Copyleft 延伸至网络交互 | 极高 |
| **专有** | 自定义、无许可证 | 未经明确许可不得使用 | 阻断 |

## 依赖更新策略

| 更新类型 | 策略 | 自动化 |
|---------|------|--------|
| **Patch** (x.y.Z) | CI 通过后自动合并 | 全自动 |
| **Minor** (x.Y.0) | 自动创建 PR，人工审查 | 半自动 |
| **Major** (X.0.0) | 人工评估，迁移计划 | 手动 |

## 快速参考卡

```
新增依赖？   → 检查：许可证兼容？无 CVE？有维护？够普及？
CI 构建？    → 自动扫描漏洞 + 许可证
发布？      → 生成 SBOM，审查所有警告
Critical CVE？ → 48 小时内修补
```

---

**相关标准：**
- [安全标准](security-standards.md) - 应用程序安全
- [容器化标准](containerization-standards.md) - 镜像漏洞扫描

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
