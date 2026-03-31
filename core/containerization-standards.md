# Containerization Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/containerization-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects using containers
**Scope**: universal
**Industry Standards**: OCI Image Spec, Docker Best Practices, CIS Docker Benchmark
**References**: [docs.docker.com](https://docs.docker.com/), [opencontainers.org](https://opencontainers.org/)

---

## Overview

This document defines containerization standards for building secure, efficient, and reproducible container images. It covers Dockerfile best practices, multi-stage builds, image security, tagging strategy, registry management, and `.dockerignore` configuration.

For deployment strategies including rollback, feature flags, and environment management, see [Deployment Standards](deployment-standards.md).

---

## Dockerfile Best Practices

### Base Image Selection

Choose base images carefully — they form the foundation of your container's security and size.

| Principle | Description | Example |
|-----------|-------------|---------|
| **Use official images** | Prefer officially maintained base images from trusted sources | `node:20-slim` not `random/node` |
| **Use slim/alpine variants** | Choose slim or alpine variants to reduce attack surface and image size | `python:3.12-slim` not `python:3.12` |
| **Pin fixed versions** | Specify exact version tags to ensure reproducible builds | `golang:1.22.1` not `golang:latest` |
| **Regular updates** | Regularly update base images to patch known vulnerabilities | Monthly review cycle recommended |

**Decision guide:**
```
Need a language runtime?
├─ Yes → Use official slim variant (e.g., node:20-slim, python:3.12-slim)
└─ No, just need OS?
   ├─ Minimal footprint? → alpine:3.19
   └─ Compatibility needed? → debian:bookworm-slim
```

### Layer Optimization

Optimize Dockerfile layers to maximize build cache efficiency and minimize image size.

| Principle | Description |
|-----------|-------------|
| **Least-changing layers first** | Order: system deps → app deps → source code (leverages build cache) |
| **Merge RUN instructions** | Combine related commands in a single RUN to reduce layer count and image size |
| **Clean temporary files** | Remove caches and temp files in the same RUN instruction that creates them |
| **Use .dockerignore** | Exclude node_modules, .git, .env, and other unnecessary files from build context |
| **COPY precise files first** | `COPY package.json .` before `COPY . .` to leverage dependency cache |

**Example — Good layer ordering:**
```dockerfile
# Layer 1: System dependencies (rarely changes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Layer 2: Application dependencies (changes occasionally)
COPY package.json package-lock.json ./
RUN npm ci --production

# Layer 3: Source code (changes frequently)
COPY . .
```

### .dockerignore

Every project using Docker MUST have a `.dockerignore` file to exclude unnecessary files from the build context.

**Standard .dockerignore template:**

```
.git
.gitignore
node_modules
.env
.env.*
*.md
tests/
docs/
.dockerignore
Dockerfile
docker-compose*.yml
.github/
.vscode/
coverage/
.nyc_output/
```

> The template above contains 14 entries. Adjust based on your project's specific needs, but always include at minimum: `.git`, `node_modules`, `.env`, `tests/`, and `docs/`.

---

## Multi-stage Build

### Standard Pattern (builder → production)

Use multi-stage builds to separate build-time dependencies from the runtime image.

| Stage | Purpose | Contains | Excludes |
|-------|---------|----------|----------|
| **builder** | Compile, bundle, test | Dev tools, source code, build artifacts | — |
| **production** | Run application | Runtime only, compiled artifacts | Source code, dev tools, tests |

**Example:**
```dockerfile
# Stage 1: builder
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-slim AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Dev vs Production Images

Maintain separate image configurations for development and production:

| Aspect | Development Image | Production Image |
|--------|------------------|-----------------|
| **Base** | Full image with dev tools | Slim/alpine variant |
| **Dependencies** | All (including devDependencies) | Production only |
| **Tools** | Debugger, hot-reload, test framework | None |
| **Size** | Larger (acceptable) | Minimized |
| **User** | May use root for convenience | MUST use non-root |

---

## Image Security

### Security Checklist

Before pushing an image to any registry, verify the following:

| Check | Description |
|-------|-------------|
| **Non-root execution** | Use `USER` directive to switch to a non-root user |
| **No known vulnerabilities** | Scan passes with Critical/High = 0 |
| **No hardcoded secrets** | No API keys, passwords, or credentials in image layers |
| **Minimal privileges** | Only expose necessary ports; avoid `--privileged` |
| **Read-only filesystem** | Run with `--read-only` flag where possible |
| **No unnecessary tools** | Production images must not contain curl, wget, ssh, or similar utilities |

### Vulnerability Scanning Integration

Integrate vulnerability scanning into your CI/CD pipeline:

| Severity | Action | Example |
|----------|--------|---------|
| **Critical** | **Block** pipeline — image MUST NOT be deployed | CVE with CVSS >= 9.0 |
| **High** | **Warn** and create remediation ticket — deploy with approval | CVE with CVSS 7.0-8.9 |
| **Medium/Low** | **Log** for tracking — deploy normally | CVE with CVSS < 7.0 |

**Recommended scanners:**
- Trivy (open source, CI-friendly)
- Snyk Container
- Docker Scout

**Pipeline integration example:**
```yaml
# GitHub Actions
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    severity: CRITICAL,HIGH
    exit-code: 1  # Fail on Critical/High
```

---

## Image Tagging Strategy

### Tag Types

Use a consistent tagging strategy to ensure traceability and reproducibility:

| Tag Type | Format | Purpose | Example |
|----------|--------|---------|---------|
| **Semantic version** | `vX.Y.Z` | Official releases | `myapp:v1.2.3` |
| **Commit SHA** | `sha-<short>` | Build traceability | `myapp:sha-a1b2c3d` |
| **Branch** | `<branch-name>` | Development/testing | `myapp:feature-auth` |
| **Environment** | `<env>-latest` | Environment tracking | `myapp:staging-latest` |

### Production Tag Requirements

> **MUST NOT** use the `latest` tag for production deployments. The `latest` tag is mutable and provides no traceability.

**Production rules:**
- MUST use a fixed tag: semantic version (`vX.Y.Z`) or commit SHA (`sha-<short>`)
- MUST NOT use `latest` or any mutable tag
- SHOULD tag with both semantic version and commit SHA for maximum traceability

**Example:**
```bash
# Good: Fixed, traceable tags
docker tag myapp:build myapp:v1.2.3
docker tag myapp:build myapp:sha-a1b2c3d

# Bad: Mutable, untraceable
docker tag myapp:build myapp:latest  # PROHIBITED in production
```

---

## Registry Management

### Cleanup Policies

Define retention policies to manage registry storage:

| Tag Type | Retention Rule |
|----------|---------------|
| **Semantic version tags** | Retain permanently (all official releases) |
| **Environment tags** | Retain most recent N versions (e.g., last 5) |
| **Branch tags** | Clean up 7 days after branch deletion |
| **Commit SHA tags** | Retain for 30 days |
| **Dangling (untagged)** | Clean up immediately |

### Access Control

Follow the principle of least privilege for registry access:

| Role | Permissions | Scope |
|------|------------|-------|
| **CI/CD** | Push + Pull | Build registry |
| **Developers** | Pull only | Production registry |
| **Production** | Pull only | Production registry |
| **Admin** | Full access | All registries |

### Registry Best Practices

- Use separate registries (or repositories) for dev and production images
- Enable image signing for production images
- Set up automated cleanup jobs based on retention policies
- Monitor registry storage usage and set alerts
- Use registry mirrors for frequently pulled base images

---

## Quick Reference Card

### Base Image Selection
```
Official image available?     → Use official (e.g., node, python)
Need minimal size?            → Use alpine variant
Need broader compatibility?   → Use slim variant
Always                        → Pin exact version, never use latest
```

### Multi-stage Build Decision
```
Has build/compile step?       → Use multi-stage (builder → production)
Static files only?            → Multi-stage with nginx final stage
Interpreted language?         → Multi-stage to exclude dev deps
```

### Security Quick Check
```
Running as root?              → Add USER directive
Contains dev tools?           → Use multi-stage build
Has known CVEs?               → Update base image
Contains secrets?             → Use build args or secrets mount
```

---

## References

- [Docker Official Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) — Dockerfile authoring guidelines
- [OCI Image Specification](https://github.com/opencontainers/image-spec) — Container image standard
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker) — Security configuration guidelines
- [Trivy](https://trivy.dev/) — Open-source vulnerability scanner
- [Snyk Container](https://snyk.io/product/container-vulnerability-management/) — Commercial vulnerability scanner

---

**Related Standards:**
- [Deployment Standards](deployment-standards.md) — Deployment strategies, rollback, feature flags
- [Security Standards](security-standards.md) — Application security requirements
- [Performance Standards](performance-standards.md) — Performance targets and benchmarks

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Dockerfile best practices, multi-stage build, image security, tagging strategy, registry management, .dockerignore |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
