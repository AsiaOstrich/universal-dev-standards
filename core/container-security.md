# 容器安全標準

> **版本**：v1.0.0 | **更新日期**：2026-05-04 | **分類**：security
>
> AI 最佳化格式：`ai/standards/container-security.ai.yaml`

---

## 概覽

本標準涵蓋容器與 Kubernetes 環境的完整安全要求，適用於所有使用 Docker 或 K8s 部署的服務，尤其針對 **AI Agent 生產環境**（採用層）提供特化規則。

### 六大安全域

| 域 | 說明 |
|----|------|
| [映像強化](#1-映像強化-image-hardening) | distroless/alpine base、non-root USER、multi-stage build |
| [Registry 安全](#2-registry-安全-registry-security) | 私有 Registry、Cosign/Notary 簽章、immutable tag、Trivy |
| [Runtime 安全](#3-runtime-安全-runtime-security) | read-only rootfs、drop ALL capabilities、seccompProfile |
| [Secrets 管理](#4-secrets-管理-secrets-management) | 禁止 ENV 傳 secret、K8s Secrets、Vault |
| [網路策略](#5-網路策略-network-policy) | K8s NetworkPolicy default-deny、AI Agent 出站白名單 |
| [供應鏈安全](#6-供應鏈安全-supply-chain) | SBOM、digest pin、Sigstore keyless、lockfile 驗證 |

---

## 1. 映像強化（Image Hardening）

### 1.1 Base Image 選擇

**優先使用**（依安全性排序）：

| Base Image | 適用場景 | 大小 |
|------------|---------|------|
| `gcr.io/distroless/static-debian12` | 靜態二進位（Go） | ~2 MB |
| `gcr.io/distroless/base-debian12` | 動態連結二進位 | ~20 MB |
| `gcr.io/distroless/nodejs20-debian12` | Node.js 應用 | ~120 MB |
| `alpine:3.19` | 需要 shell 的建置場景 | ~7 MB |

**禁止**：
- `ubuntu:latest`、`debian:latest`（浮動 tag + 龐大 attack surface）
- 以 `latest` tag 指定任何 base image
- 在 final stage 使用含完整套件管理器的映像

### 1.2 Dockerfile 最佳實踐

```dockerfile
# ── 建置階段 ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci --only=production    # 只安裝 production 依賴

COPY src/ ./src/
RUN npm run build

# ── 最終階段（distroless）────────────────────────
FROM gcr.io/distroless/nodejs20-debian12@sha256:<digest>
WORKDIR /app

# 只複製必要檔案
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 強制 non-root（UID 1000）
USER 1000

EXPOSE 3000
CMD ["dist/index.js"]
```

**規則摘要**：

- `multi-stage build`：建置工具不進入 final image
- `USER 1000`：final stage 必須設定非 root 使用者
- `RUN` 禁止在 final stage 執行套件安裝
- `COPY` 只複製特定檔案；禁止 `COPY . .` 於 final stage
- base image 固定 digest（`@sha256:<digest>`），非 tag

### 1.3 Kubernetes SecurityContext

```yaml
# Pod 層級
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
          add: []              # 只在有明確需求時加入，並文件化理由
      # AppArmor（Kubernetes annotation）
      # annotations:
      #   container.apparmor.security.beta.kubernetes.io/ai-agent: runtime/default
```

---

## 2. Registry 安全（Registry Security）

### 2.1 私有 Registry 要求

- **生產環境禁止**使用 Docker Hub 公開映像（未驗證來源）
- 必須使用私有 Registry：GHCR、ECR、GCR、Harbor 等
- Registry 存取使用 Service Account + RBAC（不用個人帳號密碼）

### 2.2 Tag 策略

| 環境 | 要求 |
|------|------|
| 開發 | `<branch>-<git-sha>` |
| Staging | `<semver>-rc.<N>` |
| 生產 | `<semver>`（e.g., `v1.2.3`）+ digest pin |

**禁止**：生產 Deployment 使用 `latest` tag。

### 2.3 映像簽章（Cosign）

```bash
# 建置後簽章
IMAGE_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' myimage)
cosign sign "${IMAGE_DIGEST}"

# 驗證（在 CI 或 Admission Controller）
cosign verify \
  --certificate-identity-regexp="https://github.com/org/repo/.*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  "${IMAGE_DIGEST}"
```

### 2.4 Trivy 弱點掃描 Gate

```bash
# CI 強制 gate：critical 或 high CVE → 阻擋推送
trivy image \
  --exit-code 1 \
  --severity CRITICAL,HIGH \
  --ignore-unfixed \
  myimage:v1.2.3

# 周期性掃描（已部署映像）
trivy image --format json --output trivy-report.json myimage@sha256:<digest>
```

**SLA**：

| 嚴重度 | 允許推送 | 修補期限 |
|--------|---------|---------|
| Critical | 否 | 立即修補 |
| High | 否 | 24 小時內 |
| Medium | 是 | 7 天內 |
| Low | 是 | 下次維護窗口 |

> **Trial / Community Edition 強制啟用**：避免 supply chain compromise，所有版本均強制 Trivy gate。

---

## 3. Runtime 安全（Runtime Security）

### 3.1 禁止項目

```yaml
# 以下設定禁止用於生產環境
securityContext:
  privileged: true          # 禁止
spec:
  hostNetwork: true         # 禁止（除非有書面需求核准）
  hostPID: true             # 禁止
  hostIPC: true             # 禁止
```

### 3.2 Seccomp Profile

```yaml
# Pod 層級啟用 RuntimeDefault
spec:
  securityContext:
    seccompProfile:
      type: RuntimeDefault   # 封鎖 300+ 危險 syscall
```

若服務需要自訂 syscall 清單，使用 `Localhost` profile 並維護 seccomp JSON 文件。

### 3.3 Writable Volume 策略

| 用途 | 允許掛載類型 |
|------|------------|
| 應用程式資料 | PersistentVolumeClaim |
| 暫存檔案 | `emptyDir`（限 /tmp） |
| Audit Log | hostPath（append-only partition）|
| Secret | K8s Secret volume mount |

**禁止**：將 `emptyDir` 用作 audit log 存放位置（重啟後資料消失）。

---

## 4. Secrets 管理（Secrets Management）

### 4.1 禁止模式

```dockerfile
# ❌ 禁止：Secret 硬編碼在映像中
ENV API_KEY=sk-abc123

# ❌ 禁止：Secret 在 build ARG（會殘留 layer）
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

### 4.2 允許模式

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
# Pod 掛載
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

**生產：Vault Agent Injector（推薦）**

```yaml
# 使用 Vault annotation 自動注入 secret
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "ai-agent"
        vault.hashicorp.com/agent-inject-secret-api-key: "secret/ai-agent/anthropic"
```

### 4.3 AI Agent 特殊規則

- LLM API 金鑰（Anthropic、OpenAI）**必須**透過 mounted secret volume 注入，不得使用 ENV
- Guardian OPA policy 檔案**不是** secret，使用 ConfigMap 即可

---

## 5. 網路策略（Network Policy）

### 5.1 Default Deny 基準策略

```yaml
# 每個 namespace 必須先套用 default-deny
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: ai-agent
spec:
  podSelector: {}     # 套用到所有 Pod
  policyTypes:
    - Ingress
    - Egress
```

### 5.2 AI Agent 出站白名單

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
    # DNS（必須）
    - ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    # Anthropic API
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0    # 實際部署時替換為 Anthropic IP range
      ports:
        - protocol: TCP
          port: 443
    # kube-dns / CoreDNS
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
```

**允許出站端點清單**：

| 端點 | 協定 | 埠 | 用途 |
|------|------|-----|------|
| `api.anthropic.com` | HTTPS | 443 | Claude LLM API |
| `api.openai.com` | HTTPS | 443 | OpenAI LLM API |
| `bedrock.*.amazonaws.com` | HTTPS | 443 | AWS Bedrock |
| CoreDNS | UDP/TCP | 53 | DNS 解析 |

### 5.3 Guardian OPA Sidecar 部署

```yaml
# Guardian 作為 sidecar container（同 Pod）
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

## 6. 供應鏈安全（Supply Chain）

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
# ✅ 正確：使用 digest 固定
FROM gcr.io/distroless/nodejs20-debian12@sha256:abc123...

# ❌ 錯誤：浮動 tag
FROM gcr.io/distroless/nodejs20-debian12:latest
```

```yaml
# ✅ 正確：K8s Deployment 使用 digest
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

### 6.4 各語言 Lockfile 驗證

**Node.js**：
```bash
# 使用 npm ci（嚴格 lockfile）
npm ci --only=production

# 不允許
npm install    # 可能更新 lockfile
```

**Python**：
```bash
# 使用 hash 驗證
pip install --require-hashes -r requirements.txt

# 生成（使用 pip-tools）
pip-compile --generate-hashes requirements.in -o requirements.txt
```

**Go**：
```bash
# 驗證 go.sum 完整性
go mod verify

# 下載並驗證
GONOSUMCHECK="" GOFLAGS="-mod=mod" go mod download
```

---

## AI Agent 特殊考量

本節補充 AI Agent（採用層）相關的容器安全特化要求：

### 強制要求

| 項目 | 要求 | 說明 |
|------|------|------|
| Container UID | 1000（非 root） | LLM 呼叫流程不得以 root 執行 |
| 出站白名單 | api.anthropic.com / api.openai.com / bedrock.*.amazonaws.com | NetworkPolicy 明確允許 |
| Guardian OPA Sidecar | 同 Pod 或同 namespace | 才能實施 Veto 決策 |
| Audit Log Volume | append-only partition | 禁止 emptyDir；重啟後不可消失 |
| LLM API Key 注入 | Mounted secret volume | 禁止 ENV 注入 |
| Trivy Gate | 強制（含 Trial/Community） | 避免 supply chain compromise |

### Audit Log Volume 配置

```yaml
# ✅ 正確：hostPath 指向 append-only partition
volumes:
  - name: audit-log
    hostPath:
      path: /var/log/ai-agent/audit    # 需事先 chattr +a
      type: DirectoryOrCreate

# ❌ 錯誤：emptyDir（重啟消失）
volumes:
  - name: audit-log
    emptyDir: {}
```

在宿主機設定 append-only：
```bash
# 設定目錄為 append-only（需 root）
chattr +a /var/log/ai-agent/audit
lsattr /var/log/ai-agent/audit    # 驗證 a 屬性
```

---

## 合規對映表

| 標準 | 章節 | 對映到本標準 |
|------|------|------------|
| ISO/IEC 27001:2022 | A.8.9 Configuration Management | Image Hardening、Runtime Security |
| ISO/IEC 27001:2022 | A.8.12 Data Leakage Prevention | Secrets Management |
| ISO/IEC 27001:2022 | A.8.20 Networks Security | Network Policy |
| ISO/IEC 27001:2022 | A.8.22 Web Filtering | Network Policy 出站白名單 |
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

## 快速檢查清單

```
□ Base image 固定 digest（不用 tag）
□ Multi-stage build；只 COPY 產物到 final stage
□ Final stage：USER 1000（non-root）
□ securityContext：runAsNonRoot、readOnlyRootFilesystem、allowPrivilegeEscalation:false
□ capabilities.drop: [ALL]
□ seccompProfile：RuntimeDefault
□ Trivy scan：0 critical、0 high，才可推送
□ Image 已簽章（Cosign / Notary v2）
□ SBOM 已生成（CycloneDX 或 SPDX）
□ Dockerfile 無 ENV secret、無 build-arg secret
□ K8s Secret 或 Vault 注入 secret（非 ENV）
□ NetworkPolicy：default-deny + 明確 allow
□ AI Agent egress：allowlist（Anthropic、OpenAI、Bedrock）
□ Guardian OPA Sidecar：同 Pod 或同 namespace
□ Audit log volume：append-only partition（非 emptyDir）
□ Lockfile 固定（npm ci / pip --require-hashes / go mod verify）
```
