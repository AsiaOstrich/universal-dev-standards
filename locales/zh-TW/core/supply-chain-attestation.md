---
source: ../../../core/supply-chain-attestation.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: f2d6deb8373b
status: current
---

# 供應鏈證明（Attestation）標準

> **Language**: [English](../../../core/supply-chain-attestation.md) | 繁體中文

## 概述

軟體供應鏈攻擊（如 SolarWinds、Log4Shell 擴散）利用「原本打算交付的東西」與「實際交付的東西」之間的落差。SBOM + SLSA provenance 透過建立從 source commit 到部署產物之間可驗證的鏈條來彌補這個落差。

## SBOM（Software Bill of Materials，軟體物料清單）

CycloneDX JSON 格式是建議採用的 SBOM 標準（SPDX 亦受支援）。

### 產生

```bash
# Install CycloneDX npm plugin
npm install -g @cyclonedx/cyclonedx-npm

# Generate from package-lock.json (NOT package.json)
cyclonedx-npm --output-format JSON \
              --output-file sbom.cdx.json \
              --package-lock-only
```

### 驗證

```bash
# Count components
jq '.components | length' sbom.cdx.json

# Check for GPL licences
jq '.components[] | select(.licenses[].license.id | test("GPL"))' sbom.cdx.json
```

## SLSA Provenance

[SLSA（Supply chain Levels for Software Artefacts）](https://slsa.dev) 定義了四個等級：

| 等級 | 要求 |
|-------|-------------|
| L1 | Provenance 存在，自我簽署 |
| L2 | Provenance 託管，由託管建置服務簽署（GitHub Actions OIDC） |
| L3 | Provenance 來自強化、完全隔離的建置平台 |
| L4 | 兩方審查 + hermetic builds |

**建議最低標準：內部發布採 SLSA L1**，**公開發布採 L2**。

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

### Cosign 簽署

```yaml
- name: Sign SBOM and provenance
  run: |
    cosign sign-blob --key env://COSIGN_PRIVATE_KEY --yes sbom.cdx.json > sbom.cdx.json.sig
    cosign sign-blob --key env://COSIGN_PRIVATE_KEY --yes provenance.json > provenance.json.sig
  env:
    COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
    COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
```

### 驗證（由終端使用者執行）

```bash
# Verify SBOM signature
cosign verify-blob --key cosign.pub --signature sbom.cdx.json.sig sbom.cdx.json

# Verify provenance signature
cosign verify-blob --key cosign.pub --signature provenance.json.sig provenance.json
```

## 發布套件結構

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

## 相關標準

- [Supply Chain Security Standards](supply-chain-security-standards.md) — 相依套件稽核政策
- [Container Security Standards](container-security.md) — image 強化
- [Advanced SAST Standards](sast-advanced.md) — 靜態分析


**Scope**: universal
