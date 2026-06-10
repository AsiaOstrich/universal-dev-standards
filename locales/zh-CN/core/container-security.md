---
source: ../../../core/container-security.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: a1badc590927
status: current
---

# 容器安全标准

> **语言**：[English](../../../core/container-security.md) | [繁體中文](../../zh-TW/core/container-security.md) | 简体中文

> **版本**：v1.0.0 | **更新日期**：2026-05-04 | **分类**：security
>
> AI 最优化格式：`ai/standards/container-security.ai.yaml`

---

## 概览

本标准涵盖容器与 Kubernetes 环境的完整安全要求，适用于所有使用 Docker 或 K8s 部署的服务，尤其针对 **AI Agent 生产环境**（采用层）提供特化规则。

### 六大安全域

| 域 | 说明 |
|----|------|
| [镜像强化](#1-镜像强化-image-hardening) | distroless/alpine base、non-root USER、multi-stage build |
| [Registry 安全](#2-registry-安全-registry-security) | 私有 Registry、Cosign/Notary 签名、immutable tag、Trivy |
| [Runtime 安全](#3-runtime-安全-runtime-security) | read-only rootfs、drop ALL capabilities、seccompProfile |
| [Secrets 管理](#4-secrets-管理-secrets-management) | 禁止 ENV 传 secret、K8s Secrets、Vault |
| [网络策略](#5-网络策略-network-policy) | K8s NetworkPolicy default-deny、AI Agent 出站白名单 |
| [供应链安全](#6-供应链安全-supply-chain) | SBOM、digest pin、Sigstore keyless、lockfile 验证 |

---

## 1. 镜像强化（Image Hardening）

### 1.1 Base Image 选择

**优先使用**（依安全性排序）：

| Base Image | 适用场景 | 大小 |
|------------|---------|------|
| `gcr.io/distroless/static-debian12` | 静态二进制（Go） | ~2 MB |
| `gcr.io/distroless/base-debian12` | 动态链接二进制 | ~20 MB |
| `gcr.io/distroless/nodejs20-debian12` | Node.js 应用 | ~120 MB |
| `alpine:3.19` | 需要 shell 的构建场景 | ~7 MB |

**禁止**：
- `ubuntu:latest`、`debian:latest`（浮动 tag + 庞大 attack surface）
- 以 `latest` tag 指定任何 base image
- 在 final stage 使用含完整软件包管理器的镜像

### 1.2 Dockerfile 最佳实践

```dockerfile
# ── 构建阶段 ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci --only=production    # 只安装 production 依赖

COPY src/ ./src/
RUN npm run build

# ── 最终阶段（distroless）────────────────────────
FROM gcr.io/distroless/nodejs20-debian12@sha256:<digest>
WORKDIR /app

# 只复制必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 强制 non-root（UID 1000）
USER 1000

EXPOSE 3000
CMD ["dist/index.js"]
```

**规则摘要**：

- `multi-stage build`：构建工具不进入 final image
- `USER 1000`：final stage 必须设定非 root 用户
- `RUN` 禁止在 final stage 执行软件包安装
- `COPY` 只复制特定文件；禁止 `COPY . .` 于 final stage
- base image 固定 digest（`@sha256:<digest>`），非 tag

### 1.3 Kubernetes SecurityContext

```yaml
# Pod 层级
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault

  containers:
    - name: ai-agent
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
          add: []              # 只在有明确需求时加入，并文档化理由
      # AppArmor（Kubernetes annotation）
      # annotations:
      #   container.apparmor.security.beta.kubernetes.io/ai-agent: runtime/default
```

---

## 2. Registry 安全（Registry Security）

### 2.1 私有 Registry 要求

- **生产环境禁止**使用 Docker Hub 公开镜像（未验证来源）
- 必须使用私有 Registry：GHCR、ECR、GCR、Harbor 等
- Registry 访问使用 Service Account + RBAC（不用个人账号密码）

### 2.2 Tag 策略

| 环境 | 要求 |
|------|------|
| 开发 | `<branch>-<git-sha>` |
| Staging | `<semver>-rc.<N>` |
| 生产 | `<semver>`（e.g., `v1.2.3`）+ digest pin |

**禁止**：生产 Deployment 使用 `latest` tag。

### 2.3 镜像签名（Cosign）

```bash
# 构建后签名
IMAGE_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' myimage)
cosign sign "${IMAGE_DIGEST}"

# 验证（在 CI 或 Admission Controller）
cosign verify \
  --certificate-identity-regexp="https://github.com/org/repo/.*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  "${IMAGE_DIGEST}"
```

### 2.4 Trivy 漏洞扫描 Gate

```bash
# CI 强制 gate：critical 或 high CVE → 阻止推送
trivy image \
  --exit-code 1 \
  --severity CRITICAL,HIGH \
  --ignore-unfixed \
  myimage:v1.2.3

# 周期性扫描（已部署镜像）
trivy image --format json --output trivy-report.json myimage@sha256:<digest>
```

**SLA**：

| 严重度 | 允许推送 | 修补期限 |
|--------|---------|---------|
| Critical | 否 | 立即修补 |
| High | 否 | 24 小时内 |
| Medium | 是 | 7 天内 |
| Low | 是 | 下次维护窗口 |

> **Trial / Community Edition 强制启用**：避免 supply chain compromise，所有版本均强制 Trivy gate。

---

## 3. Runtime 安全（Runtime Security）

### 3.1 禁止项目

```yaml
# 以下设定禁止用于生产环境
securityContext:
  privileged: true          # 禁止
spec:
  hostNetwork: true         # 禁止（除非有书面需求核准）
  hostPID: true             # 禁止
  hostIPC: true             # 禁止
```

### 3.2 Seccomp Profile

```yaml
# Pod 层级启用 RuntimeDefault
spec:
  securityContext:
    seccompProfile:
      type: RuntimeDefault   # 封锁 300+ 危险 syscall
```

若服务需要自定义 syscall 清单，使用 `Localhost` profile 并维护 seccomp JSON 文档。

### 3.3 Writable Volume 策略

| 用途 | 允许挂载类型 |
|------|------------|
| 应用程序数据 | PersistentVolumeClaim |
| 临时文件 | `emptyDir`（限 /tmp） |
| Audit Log | hostPath（append-only partition）|
| Secret | K8s Secret volume mount |

**禁止**：将 `emptyDir` 用作 audit log 存放位置（重启后数据消失）。

---

## 4. Secrets 管理（Secrets Management）

### 4.1 禁止模式

```dockerfile
# ❌ 禁止：Secret 硬编码在镜像中
ENV API_KEY=sk-abc123

# ❌ 禁止：Secret 在 build ARG（会残留 layer）
ARG DATABASE_PASSWORD
RUN configure --password=$DATABASE_PASSWORD
```

```yaml
# ❌ 禁止：Secret 以明文存 ConfigMap
apiVersion: v1
kind: ConfigMap
data:
  api_key: "sk-real-key"    # 禁止
```

### 4.2 允许模式

**Staging：K8s Secret + Volume Mount**

```yaml
# K8s Secret（base64 encoded）
apiVersion: v1
kind: Secret
metadata:
  name: ai-agent-secrets
type: Opaque
data:
  anthropic-api-key: <base64-encoded-value>
---
# Pod 挂载
spec:
  containers:
    - name: ai-agent
      volumeMounts:
        - name: secrets
          mountPath: /run/secrets
          readOnly: true
  volumes:
    - name: secrets
      secret:
        secretName: ai-agent-secrets
```

**生产：Vault Agent Injector（推荐）**

```yaml
# 使用 Vault annotation 自动注入 secret
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "ai-agent"
        vault.hashicorp.com/agent-inject-secret-api-key: "secret/ai-agent/anthropic"
```

### 4.3 AI Agent 特殊规则

- LLM API 密钥（Anthropic、OpenAI）**必须**通过 mounted secret volume 注入，不得使用 ENV
- Guardian OPA policy 文件**不是** secret，使用 ConfigMap 即可

---

## 5. 网络策略（Network Policy）

### 5.1 Default Deny 基准策略

```yaml
# 每个 namespace 必须先应用 default-deny
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: ai-agent
spec:
  podSelector: {}     # 应用到所有 Pod
  policyTypes:
    - Ingress
    - Egress
```

### 5.2 AI Agent 出站白名单

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ai-agent-egress-allowlist
  namespace: ai-agent
spec:
  podSelector:
    matchLabels:
      app: ai-agent
  policyTypes:
    - Egress
  egress:
    # DNS（必须）
    - ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    # Anthropic API
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0    # 实际部署时替换为 Anthropic IP range
      ports:
        - protocol: TCP
          port: 443
    # kube-dns / CoreDNS
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
```

**允许出站端点清单**：

| 端点 | 协议 | 端口 | 用途 |
|------|------|-----|------|
| `api.anthropic.com` | HTTPS | 443 | Claude LLM API |
| `api.openai.com` | HTTPS | 443 | OpenAI LLM API |
| `bedrock.*.amazonaws.com` | HTTPS | 443 | AWS Bedrock |
| CoreDNS | UDP/TCP | 53 | DNS 解析 |

### 5.3 Guardian OPA Sidecar 部署

```yaml
# Guardian 作为 sidecar container（同 Pod）
spec:
  containers:
    - name: ai-agent
      image: ai-agent/runtime:v1.2.3@sha256:<digest>
      # ...
    - name: guardian-opa
      image: openpolicyagent/opa:latest-rootless@sha256:<digest>
      args:
        - run
        - --server
        - --addr=localhost:8181
        - /policies
      volumeMounts:
        - name: opa-policies
          mountPath: /policies
          readOnly: true
  volumes:
    - name: opa-policies
      configMap:
        name: guardian-opa-policies
```

---

## 6. 供应链安全（Supply Chain）

### 6.1 SBOM 生成

```bash
# 使用 Syft 生成 CycloneDX 格式 SBOM
syft myimage:v1.2.3 -o cyclonedx-json > sbom-v1.2.3.json

# 使用 Trivy 生成 SPDX 格式 SBOM
trivy image --format spdx-json --output sbom.spdx.json myimage:v1.2.3

# 附加到 OCI Registry（Cosign）
cosign attach sbom --sbom sbom-v1.2.3.json myimage@sha256:<digest>
```

### 6.2 Digest Pinning

```dockerfile
# ✅ 正确：使用 digest 固定
FROM gcr.io/distroless/nodejs20-debian12@sha256:abc123...

# ❌ 错误：浮动 tag
FROM gcr.io/distroless/nodejs20-debian12:latest
```

```yaml
# ✅ 正确：K8s Deployment 使用 digest
spec:
  containers:
    - image: myregistry.io/ai-agent:v1.2.3@sha256:def456...
```

### 6.3 Sigstore Keyless Signing（GitHub Actions）

```yaml
# .github/workflows/build-push.yml
- name: Sign container image
  uses: sigstore/cosign-installer@v3
- name: Sign
  run: |
    cosign sign --yes \
      ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}
  env:
    COSIGN_EXPERIMENTAL: "true"   # Keyless (OIDC)
```

### 6.4 各语言 Lockfile 验证

**Node.js**：
```bash
# 使用 npm ci（严格 lockfile）
npm ci --only=production

# 不允许
npm install    # 可能更新 lockfile
```

**Python**：
```bash
# 使用 hash 验证
pip install --require-hashes -r requirements.txt

# 生成（使用 pip-tools）
pip-compile --generate-hashes requirements.in -o requirements.txt
```

**Go**：
```bash
# 验证 go.sum 完整性
go mod verify

# 下载并验证
GONOSUMCHECK="" GOFLAGS="-mod=mod" go mod download
```

---

## AI Agent 特殊考量

本节补充 AI Agent（采用层）相关的容器安全特化要求：

### 强制要求

| 项目 | 要求 | 说明 |
|------|------|------|
| Container UID | 1000（非 root） | LLM 调用流程不得以 root 执行 |
| 出站白名单 | api.anthropic.com / api.openai.com / bedrock.*.amazonaws.com | NetworkPolicy 明确允许 |
| Guardian OPA Sidecar | 同 Pod 或同 namespace | 才能实施 Veto 决策 |
| Audit Log Volume | append-only partition | 禁止 emptyDir；重启后不可消失 |
| LLM API Key 注入 | Mounted secret volume | 禁止 ENV 注入 |
| Trivy Gate | 强制（含 Trial/Community） | 避免 supply chain compromise |

### Audit Log Volume 配置

```yaml
# ✅ 正确：hostPath 指向 append-only partition
volumes:
  - name: audit-log
    hostPath:
      path: /var/log/ai-agent/audit    # 需事先 chattr +a
      type: DirectoryOrCreate

# ❌ 错误：emptyDir（重启消失）
volumes:
  - name: audit-log
    emptyDir: {}
```

在宿主机设定 append-only：
```bash
# 设定目录为 append-only（需 root）
chattr +a /var/log/ai-agent/audit
lsattr /var/log/ai-agent/audit    # 验证 a 属性
```

---

## 合规对照表

| 标准 | 章节 | 对照到本标准 |
|------|------|------------|
| ISO/IEC 27001:2022 | A.8.9 Configuration Management | Image Hardening、Runtime Security |
| ISO/IEC 27001:2022 | A.8.12 Data Leakage Prevention | Secrets Management |
| ISO/IEC 27001:2022 | A.8.20 Networks Security | Network Policy |
| ISO/IEC 27001:2022 | A.8.22 Web Filtering | Network Policy 出站白名单 |
| ISO/IEC 27001:2022 | A.8.8 Technical Vulnerabilities | Registry Security（Trivy）|
| ISO/IEC 27001:2022 | A.8.24 Use of Cryptography | Secrets Management |
| NIST SP 800-190 | §4.1 Image Vulnerabilities | Image Hardening |
| NIST SP 800-190 | §4.2 Image Configuration Defects | Registry Security |
| NIST SP 800-190 | §4.3 Container Runtime Vulnerabilities | Runtime Security |
| NIST SP 800-190 | §4.4 Image and Registry Vulnerabilities | Supply Chain |
| NIST SP 800-190 | §4.5 Host OS Vulnerabilities | Supply Chain |
| CIS Docker Benchmark v1.6 | §4 Container Images | Image Hardening |
| CIS Docker Benchmark v1.6 | §5 Container Runtime | Runtime Security |
| CIS Kubernetes Benchmark v1.8 | §5.3 Network Policies | Network Policy |
| SLSA Framework | Level 2+ provenance | Supply Chain |

---

## 快速检查清单

```
□ Base image 固定 digest（不用 tag）
□ Multi-stage build；只 COPY 产物到 final stage
□ Final stage：USER 1000（non-root）
□ securityContext：runAsNonRoot、readOnlyRootFilesystem、allowPrivilegeEscalation:false
□ capabilities.drop: [ALL]
□ seccompProfile：RuntimeDefault
□ Trivy scan：0 critical、0 high，才可推送
□ Image 已签名（Cosign / Notary v2）
□ SBOM 已生成（CycloneDX 或 SPDX）
□ Dockerfile 无 ENV secret、无 build-arg secret
□ K8s Secret 或 Vault 注入 secret（非 ENV）
□ NetworkPolicy：default-deny + 明确 allow
□ AI Agent egress：allowlist（Anthropic、OpenAI、Bedrock）
□ Guardian OPA Sidecar：同 Pod 或同 namespace
□ Audit log volume：append-only partition（非 emptyDir）
□ Lockfile 固定（npm ci / pip --require-hashes / go mod verify）
```


**Scope**: universal
