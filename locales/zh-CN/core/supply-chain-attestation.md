---
source: ../../../core/supply-chain-attestation.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: f2d6deb8373b
status: current
---

# 供应链证明（Attestation）标准

> **语言**: [English](../../../core/supply-chain-attestation.md) | [繁體中文](../../zh-TW/core/supply-chain-attestation.md) | 简体中文

## 概述

软件供应链攻击（如 SolarWinds、Log4Shell 扩散）利用「原本打算交付的内容」与「实际交付的内容」之间的差距。SBOM + SLSA provenance 通过建立从 source commit 到部署制品之间可验证的链条来弥合这一差距。

## SBOM（Software Bill of Materials，软件物料清单）

CycloneDX JSON 格式是推荐采用的 SBOM 标准（SPDX 也受支持）。

### 生成

```bash
# Install CycloneDX npm plugin
npm install -g @cyclonedx/cyclonedx-npm

# Generate from package-lock.json (NOT package.json)
cyclonedx-npm --output-format JSON \
              --output-file sbom.cdx.json \
              --package-lock-only
```

### 验证

```bash
# Count components
jq '.components | length' sbom.cdx.json

# Check for GPL licences
jq '.components[] | select(.licenses[].license.id | test("GPL"))' sbom.cdx.json
```

## SLSA Provenance

[SLSA（Supply chain Levels for Software Artefacts）](https://slsa.dev) 定义了四个等级：

| 等级 | 要求 |
|-------|-------------|
| L1 | Provenance 存在，自签名 |
| L2 | Provenance 托管，由托管构建服务签名（GitHub Actions OIDC） |
| L3 | Provenance 来自加固、完全隔离的构建平台 |
| L4 | 双方评审 + hermetic builds |

**推荐最低标准：内部发布采用 SLSA L1**，**公开发布采用 L2**。

### SLSA L1 Provenance（GitHub Actions）

```yaml
- name: Generate SLSA L1 provenance
  run: |
    IMAGE_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "your-app:commercial-${VERSION}" 2>/dev/null || echo "N/A")
    cat > provenance.json << PROVEOF
    {
      "_type": "https://in-toto.io/Statement/v0.1",
      "predicateType": "https://slsa.dev/provenance/v0.2",
      "subject": [{"name": "app-commercial-${VERSION}", "digest": {"sha256": "$(sha256sum app-commercial-${VERSION}.tar.gz | cut -d' ' -f1)"}}],
      "predicate": {
        "buildType": "https://github.com/Attestations/GitHubActionsWorkflow@v1",
        "builder": {"id": "https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"},
        "invocation": {
          "configSource": {
            "uri": "git+https://github.com/${GITHUB_REPOSITORY}",
            "digest": {"sha1": "${GITHUB_SHA}"},
            "entryPoint": ".github/workflows/release-commercial.yml"
          }
        },
        "metadata": {
          "buildInvocationId": "${GITHUB_RUN_ID}/${GITHUB_RUN_ATTEMPT}",
          "buildStartedOn": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
          "completeness": {"environment": false, "materials": true, "parameters": false}
        }
      }
    }
    PROVEOF
```

### Cosign 签名

```yaml
- name: Sign SBOM and provenance
  run: |
    cosign sign-blob --key env://COSIGN_PRIVATE_KEY --yes sbom.cdx.json > sbom.cdx.json.sig
    cosign sign-blob --key env://COSIGN_PRIVATE_KEY --yes provenance.json > provenance.json.sig
  env:
    COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
    COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
```

### 验证（由最终用户执行）

```bash
# Verify SBOM signature
cosign verify-blob --key cosign.pub --signature sbom.cdx.json.sig sbom.cdx.json

# Verify provenance signature
cosign verify-blob --key cosign.pub --signature provenance.json.sig provenance.json
```

## 发布包结构

```
app-commercial-v1.3.0/
├── app-commercial-v1.3.0.docker.tar.gz   # Primary artefact
├── sbom.cdx.json                              # CycloneDX SBOM
├── sbom.cdx.json.sig                          # cosign signature
├── provenance.json                            # SLSA L1 provenance
├── provenance.json.sig                        # cosign signature
├── checksums.txt                              # SHA-256 of all artefacts
├── checksums.txt.sig                          # cosign signature
└── install.sh / docker-compose.yml / ...
```

## 相关标准

- [Supply Chain Security Standards](supply-chain-security-standards.md) — 依赖审计策略
- [Container Security Standards](container-security.md) — 镜像加固
- [Advanced SAST Standards](sast-advanced.md) — 静态分析


**范围**: universal
