---
source: ../../../core/pipeline-security-gates.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-07
source_hash: a1e0a4792a90
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
- **密钥扫描器自身的行为也要写明**：输出不得打印被匹配到的密钥值；扫描器跑不起来视同闸门失败（见 1.1 节）
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

### 1.1 扫描器自身的三个行为（1.1.0 新增）

上表讲「扫描什么、何时阻断」；本节讲**扫描器本身**必须怎么表现。以下三条都以本标准既有的两条原则为前提：
「安全闸门失败 = pipeline 失败」与「禁止静默跳过安全闸门」。

| 编号 | 强度 | 要求 |
|------|------|------|
| **PSG-1** | 必须（MUST） | 扫描的输出——终端、CI 日志、报告文件——**不得包含被匹配到的密钥值本身**，只能指出文件、行号与规则名称 |
| **PSG-2** | 必须（MUST） | 扫描器**无法执行**视同闸门失败，**必须阻断**提交／pipeline，不得放行 |
| **PSG-3** | 建议（SHOULD） | 团队**自己编写**的检测规则，每一条都有一个应被抓到（红）与一个不应被误报（绿）的测试样本，样本在测试中执行 |

#### PSG-1　输出不得打印被匹配到的密钥值

理由：扫描日志会被贴进聊天室与工单。闸门把密钥值打印在输出里，等于把已被拦下的密钥再泄漏一次。

工具注记（只写已查证的）：

| 工具 | 注记 | 依据 |
|------|------|------|
| gitleaks | 官方 README 的示例输出（`gitleaks git -v`，未加 `--redact`）含 `Secret:` 一行，打印被匹配到的值全文；`--redact` 参数的说明为「redact secrets from logs and stdout」。README 未说明 `--redact` 是否也涵盖 `--report-path` 生成的报告文件，**采用者须自行确认** | gitleaks 官方 README，2026-10-07 读取 |
| detect-secrets | 默认输出行为**本标准未查证，采用者须自行确认** | — |
| trufflehog | 默认输出行为**本标准未查证，采用者须自行确认** | — |

判定程序（示意，三行）：

1. 建一个含**假**密钥的文件（示意记法：`FAKE-SECRET-DO-NOT-USE-0000`；实际样本须是**你自己的闸门会匹配的格式**——例如自写一条 canary 规则，或工具文档列出的测试样式——且必须是假值，不得是任何真实服务的有效凭证），加入 staging 后执行闸门，**先确认闸门确实阻断**。
2. 没阻断代表样本没被匹配，第 3 步不算数——此时输出里当然找不到它，结果是「绿得虚假」。
3. 在终端、CI 日志、报告文件的**全部输出**搜索该假密钥字符串；找到任何一处即不合规。

#### PSG-2　扫描器跑不起来视为闸门失败

「跑不起来」包含：可执行文件不存在、配置文件无法读取或无效、超时、非预期的退出。这些情况必须阻断，**不得**以 `|| true`、`2>/dev/null` 等方式吞掉，也不得让闸门输出「扫描通过」。

UDS 自己的先例：`uds init` 为非 Node 项目写的原生 `.git/hooks/pre-commit`，曾把每个检查接上 `2>/dev/null || true` 后打印「Pre-commit checks passed」——检查坏掉也照样放行，且藏起自己的错误。6.14.0-beta.4 修正（见 CHANGELOG 该版〈Fixed〉）。

工具注记：gitleaks 官方 README 的〈Exit Codes〉一节写 `1 - leaks or error encountered`——发现泄漏与发生错误是**同一个退出码**，所以**区分原因要靠输出，不靠退出码**；对阻断与否，两者的结论相同。README 另说明 `--exit-code` 参数可改写「发现泄漏时」的退出码（2026-10-07 读取）：把它设成 0 会让闸门在发现泄漏时放行，不得这样配置。detect-secrets、trufflehog 的退出码行为**本标准未查证，采用者须自行确认**。

判定程序（示意，三行）：

1. 把扫描器可执行文件改名或移走，或把它的配置文件改成无效内容。
2. 对一个**不含任何密钥**的提交执行闸门（此时若被阻断，原因只可能是扫描器跑不起来）。
3. 提交被阻断（退出码非 0），且输出说明是扫描器无法执行；若提交被放行，或输出看起来像「扫描通过」，即不合规。

#### PSG-3　自己写的检测规则，每条要有红绿样本

适用于团队**自己编写**的规则，包含 `secret-management-standards` 的 REQ-003 所列的最低四种：AWS access key、PEM 私钥头、通用 API token、含密码的连接字符串。只用工具内置规则、不自己写规则的团队不适用。

道理与 `open-work-tracking` 的 OWT-015 相同：没见过失败的检查不算证据。一条从没被红样本匹配过的规则，无法证明它抓得到东西；一条没有绿样本的规则，无法证明它不会把正常代码全部拦下。

判定程序（示意，三行）：

1. 列出团队自写的全部检测规则。
2. 逐条找对应的一个红样本（必被匹配）与一个绿样本（不得匹配）；样本须是假值。
3. 确认样本在测试中真的执行；缺任一个即列为缺口（本条为建议，缺口不阻断）。

#### 范围的诚实注明

UDS **不发布扫描器**。上面三段是采用者在**自己的闸门**上自行验证的程序。UDS 自己的 repo 目前也没有密钥扫描（CI 与 hook 都没有用到上述三种工具）。

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
