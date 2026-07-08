---
source: ../../../core/pipeline-security-gates.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-08
source_hash: b234d1eb2344
status: current
---

# Pipeline Security Gates（CI Pipeline 安全检查点）

> **Language**: [English](../../../core/pipeline-security-gates.md) | [繁體中文](../../zh-TW/core/pipeline-security-gates.md) | 简体中文

---

## 概述

本标准定义嵌入 CI pipeline 各阶段的安全检查点，涵盖 SAST、DAST、SCA（含 SBOM）、密钥扫描，以及发布前的供应链签名验证，并明确规定各类发现的阻断（Block）、警告（Warn）、记录（Log）行为。

---

## 核心原则

- **密钥扫描在 pre-commit**：所有包含密钥的提交都必须被阻断，不得例外
- **SAST 在构建后**：Critical 和 High 等级发现阻断 pipeline
- **SCA + SBOM 在打包阶段**：追踪依赖组件风险并生成物料清单
- **Attestation 验证在发布前**：打包后、部署前 MUST 验证 artifact 的 checksum、签名与 SLSA provenance（消费 supply-chain-attestation 标准的产出，不得「生成 SBOM 却不验证」）
- **DAST 在 staging 部署后**：对运行中的应用进行动态扫描
- **安全闸门失败 = pipeline 失败**：不得视为可忽略的警告
- **任何绕过都需审计轨迹**：禁止静默跳过安全闸门

---

## 安全闸门位置与配置

### 1. Pre-Commit — 密钥扫描

| 项目 | 说明 |
|------|------|
| 扫描范围 | 所有 staged 文件 |
| 推荐工具 | gitleaks、trufflehog、detect-secrets |
| 阻断条件 | 任何密钥模式匹配 |
| 可跳过 | 否（`never_skip: true`） |

**重要**：此闸门必须在代码进入版本控制前执行，一旦密钥进入 git 历史便需要完整的密钥轮换流程。

---

### 2. Post-Build — SAST（静态应用安全测试）

| 项目 | 说明 |
|------|------|
| 扫描范围 | 源代码 + 构建产出物 |
| 推荐工具 | semgrep、codeql、sonarqube |
| 阻断条件 | Critical、High |
| 警告条件 | Medium |
| 仅记录 | Low、Info |

---

### 3. Package Stage — SCA + SBOM

| 项目 | 说明 |
|------|------|
| 扫描范围 | 依赖组件 + 容器镜像 |
| 推荐工具 | trivy、syft、grype、dependabot |
| 阻断条件 | Critical CVE（有可用修复版本） |
| 警告条件 | High CVE、过时依赖组件 |
| SBOM 格式 | SPDX、CycloneDX |

**SBOM 用途**：上传至 dependency-track 或 grype-db 进行持续监控。

---

### 4. Pre-Deploy — Artifact Attestation Verification（供应链签名验证）

| 项目 | 说明 |
|------|------|
| 验证范围 | 已打包的发布 artifact（文件压缩包 / 容器镜像）|
| 推荐工具 | cosign（`verify-blob` / `verify`）、sha256sum、slsa-verifier |
| 阻断条件 | 签名验证失败、checksum 不符、SLSA provenance 缺失 |
| 警告条件 | SLSA 等级低于目标（公开发布建议 ≥ L2）|

打包阶段（gate 3）生成 SBOM 后，**部署/发布前 MUST 验证** artifact 的完整性与来源证明，
避免「生成了 SBOM/签名却从不验证」的假保证：比对 `checksums.txt` 的 SHA256、以
`cosign verify-blob` 验证 SBOM 与 provenance 签名、确认 SLSA provenance 存在。完整的
生成与验证命令、Release Bundle 结构见
[supply-chain-attestation.md](../../../core/supply-chain-attestation.md)。

---

### 5. Post-Staging Deploy — DAST（动态应用安全测试）

| 项目 | 说明 |
|------|------|
| 扫描范围 | 运行中的 staging 应用程序 |
| 推荐工具 | ZAP、nuclei、BurpSuite Enterprise |
| 阻断条件 | Critical |
| 需审核批准 | High |
| 警告条件 | Medium |

---

## 严重性响应矩阵

| 严重性 | 动作 | 通知对象 | SLA |
|--------|------|---------|-----|
| Critical | 阻断 pipeline | 安全团队 | 立即 |
| High | 阻断 pipeline | 团队负责人 | 当日 |
| Medium | 警告 + 需审核批准 | 开发者 | 下个 Sprint |
| Low | 仅记录 | 无 | Backlog |

---

## 绕过策略

**默认禁止绕过**。

若有特殊情况：
- **例外流程**：需书面安全审核 + 审计日志记录
- **紧急绕过**：有时效性令牌（time-limited token）+ 强制事后审查

---

## 集成点

| 集成项目 | 说明 |
|---------|------|
| 密钥管理 | 集成 HashiCorp Vault 或 AWS Secrets Manager 进行密钥注入 |
| SBOM 注册表 | 上传 SBOM 至 dependency-track 或 grype-db 持续监控 |
| Artifact 签名 | 发布前以 cosign 验证 SBOM/provenance 签名与 checksum（见 supply-chain-attestation）|
| 事故响应 | Critical 发现自动创建事故工单 |

---

## 相关标准

- [security-standards.md](../../../core/security-standards.md) — 应用安全基础标准
- [pipeline-integration-standards.md](../../../core/pipeline-integration-standards.md) — CI 管道集成标准
- [deployment-standards.md](../../../core/deployment-standards.md) — 部署基础原则
- [supply-chain-attestation.md](../../../core/supply-chain-attestation.md) — SBOM / SLSA provenance / cosign 签名的生成与验证（gate 4 消费）
- AI 格式：[pipeline-security-gates.ai.yaml](../../../ai/standards/pipeline-security-gates.ai.yaml)

---

**Scope**: universal
