# Supply Chain Attestation Standards

## Overview

Software supply chain attacks (e.g. SolarWinds, Log4Shell propagation) exploit the gap between what was intended to be shipped and what was actually shipped. SBOM + SLSA provenance closes this gap by creating a verifiable chain from source commit to deployed artefact.

## SBOM (Software Bill of Materials)

CycloneDX JSON format is the recommended SBOM standard (also supported by SPDX).

### Generation

```bash
# Install CycloneDX npm plugin
npm install -g @cyclonedx/cyclonedx-npm

# Generate from package-lock.json (NOT package.json)
cyclonedx-npm --output-format JSON \
              --output-file sbom.cdx.json \
              --package-lock-only
```

### Verification

```bash
# Count components
jq '.components | length' sbom.cdx.json

# Check for GPL licences
jq '.components[] | select(.licenses[].license.id | test("GPL"))' sbom.cdx.json
```

## SLSA Provenance

[SLSA (Supply chain Levels for Software Artefacts)](https://slsa.dev) defines four levels:

| Level | Requirements |
|-------|-------------|
| L1 | Provenance exists, self-signed |
| L2 | Provenance hosted, signed by hosted build service (GitHub Actions OIDC) |
| L3 | Provenance from hardened, fully isolated build platform |
| L4 | Two-party review + hermetic builds |

**Recommended minimum: SLSA L1** for internal releases, **L2** for public releases.

### SLSA L1 Provenance (GitHub Actions)

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

### Cosign Signing

```yaml
- name: Sign SBOM and provenance
  run: |
    cosign sign-blob --key env://COSIGN_PRIVATE_KEY --yes sbom.cdx.json > sbom.cdx.json.sig
    cosign sign-blob --key env://COSIGN_PRIVATE_KEY --yes provenance.json > provenance.json.sig
  env:
    COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
    COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
```

### Verification (by end-user)

```bash
# Verify SBOM signature
cosign verify-blob --key cosign.pub --signature sbom.cdx.json.sig sbom.cdx.json

# Verify provenance signature
cosign verify-blob --key cosign.pub --signature provenance.json.sig provenance.json
```

## Release Bundle Structure

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

## Related Standards

- [Supply Chain Security Standards](supply-chain-security-standards.md) — dependency audit policies
- [Container Security Standards](container-security.md) — image hardening
- [Advanced SAST Standards](sast-advanced.md) — static analysis
