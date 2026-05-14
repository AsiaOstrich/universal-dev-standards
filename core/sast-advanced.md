# Advanced SAST Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/sast-advanced.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-05
**Applicability**: TypeScript / JavaScript projects
**Scope**: universal
**References**: [CodeQL documentation](https://codeql.github.com/), [gitleaks](https://github.com/gitleaks/gitleaks), [Biome linter](https://biomejs.dev/)

---

## Purpose

This standard defines Advanced Static Application Security Testing (SAST) practices that complement dependency auditing (`npm audit`). It covers three independent but complementary layers:

1. **CodeQL semantic analysis** — finds injection vulnerabilities in first-party code
2. **Secret scanning** — prevents committing API keys and credentials
3. **Biome security lint rules** — enforces safe coding patterns at the editor and CI level

---

## Why npm audit Is Not Enough

`npm audit` scans your `package-lock.json` against the NPM advisory database. It only finds **known CVEs in third-party dependencies**.

It does **not** find:

| Vulnerability | Example | Detection Method |
|---|---|---|
| **Command injection** | `exec(\`git log ${userInput}\`)` | CodeQL data-flow |
| **Path traversal** | `fs.readFile(path.join(base, req.params.file))` | CodeQL data-flow |
| **Prototype pollution** | `target[req.body.key] = req.body.value` | CodeQL taint analysis |
| **XSS via DOM sink** | `element.innerHTML = userContent` | CodeQL data-flow |
| **SQL injection** | `db.query("SELECT * FROM users WHERE id = " + id)` | CodeQL data-flow |
| **Hardcoded secrets** | `const apiKey = "sk-live-abc123..."` | gitleaks pattern matching |

---

## Layer 1: CodeQL Semantic Analysis

### What CodeQL Does

CodeQL builds a semantic model of your TypeScript code, then runs queries that track data flows from **sources** (user input, request parameters, environment variables) to **sinks** (command execution, file system access, DOM manipulation).

### GitHub Actions Workflow

Create `.github/workflows/codeql.yml`:

```yaml
# SPDX-License-Identifier: MIT
name: CodeQL Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'   # Weekly Monday 02:00 UTC

jobs:
  analyze:
    name: Analyze TypeScript
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
          queries: security-extended
          query-filters: |
            - include:
                tags contain: security

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:javascript-typescript"
```

### Key Configuration Options

| Option | Value | Reason |
|---|---|---|
| `languages` | `javascript-typescript` | Covers both `.ts` and `.js` files |
| `queries` | `security-extended` | Includes injection/XSS/path-traversal queries absent from default |
| `schedule` | `0 2 * * 1` | Weekly catch for new query packs published by GitHub |
| `security-events: write` | Required | Uploads SARIF results to GitHub Security tab |

### Branch Protection Configuration

After adding the workflow, configure branch protection:

1. Settings → Branches → Branch protection rules → Edit main
2. Enable "Require status checks to pass before merging"
3. Add `CodeQL` and `sast` as required checks

---

## Layer 2: Secret Scanning with gitleaks

### What gitleaks Detects

gitleaks uses pattern matching and entropy analysis to detect:
- AWS access keys (`AKIA[0-9A-Z]{16}`)
- GitHub tokens (`ghp_`, `gho_`, `ghs_`, `ghr_`)
- Private key PEM blocks (`-----BEGIN RSA PRIVATE KEY-----`)
- Generic high-entropy strings that match credential patterns
- Custom patterns defined in `.gitleaks.toml`

### CI Integration

Add a `sast` job to your CI workflow:

```yaml
sast:
  name: Secret Scanning
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0   # Full history for accurate scanning
    - name: Run gitleaks
      uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### `.gitleaks.toml` Configuration Example

```toml
title = "Gitleaks Configuration (example)"
version = "8"

[extend]
# Extend default rules from gitleaks base config
useDefault = true

[[rules]]
id = "app-license-key"
description = "App license key"
regex = '''app[_\-]?license[_\-]?key\s*[:=]\s*["']?([A-Za-z0-9\-]{32,})["']?'''
severity = "CRITICAL"
tags = ["license", "app"]

[[allowlist.commits]]
# Example: allow a specific commit hash that was remediated
# commits = ["abc1234"]

[[allowlist.regexes]]
# Whitelist test fixture values
description = "Test fixture placeholder keys"
regex = '''PLACEHOLDER_KEY_FOR_TESTING'''
```

### Handling False Positives

When gitleaks flags a false positive:

1. Identify the exact pattern causing the match
2. Add a targeted `allowlist.regexes` entry in `.gitleaks.toml` with a description
3. Document the justification in a code comment adjacent to the flagged value
4. Review all allowlist entries quarterly

---

## Layer 3: Biome Security Rules

### Why Biome Instead of ESLint

Projects that adopt Biome as their linter gain built-in security-relevant rules without additional ESLint plugin installation. Key security rules in Biome:

| Rule | Category | What It Prevents |
|---|---|---|
| `suspicious/noGlobalEval` | suspicious | Dynamic code execution via `eval()` |
| `suspicious/noWith` | suspicious | Scope pollution via `with` statement |
| `suspicious/noConsoleLog` | suspicious | Accidental secret logging via `console.log` |
| `correctness/noUnusedVariables` | correctness | Dead code that may contain sensitive logic |
| `security/noBlankTarget` | security | Tab hijacking via `target="_blank"` without `rel="noopener"` |

### `biome.json` Configuration

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noGlobalEval": "error",
        "noWith": "error"
      },
      "security": {
        "noBlankTarget": "error"
      }
    }
  }
}
```

### CI Integration

```yaml
- name: Lint (Biome)
  run: npm run lint   # Maps to: biome check .
```

The `biome check .` command runs both formatter checks and linter rules. Security rule failures produce a non-zero exit code, blocking CI.

---

## Quality Gate Thresholds

| Severity | Merge Policy | Resolution SLA |
|---|---|---|
| **CRITICAL** | Block merge — no exceptions | Immediate |
| **HIGH** | Block merge — 0 HIGH on main | Immediate |
| **MEDIUM** | Do not block; open tracking issue | 30 days |
| **LOW** | Do not block; log for visibility | Optional |

### Configuring GitHub Code Scanning Block Policy

In the repository security settings:
1. Security → Code scanning → Protection rules
2. Set "Security severity level" to "High or higher"
3. This blocks PR merge when CodeQL reports any HIGH or CRITICAL finding

---

## npm test Integration

Add a `test:sast` script to `package.json` as a developer-facing alias:

```json
{
  "scripts": {
    "test:sast": "npm audit --audit-level=high"
  }
}
```

This allows local pre-push checks via `npm run test:sast`. Note this only covers dependency vulnerabilities; the full SAST pipeline runs in CI.

---

## Summary: Defense-in-Depth Security Scanning

```
Commit → pre-push hook (npm audit)
  │
  └─→ CI: sast job (gitleaks secret scan)
  │
  └─→ CI: check job (biome lint — security rules)
  │
  └─→ CI: codeql.yml (semantic analysis — injection/XSS/traversal)
  │
  └─→ GitHub Code Scanning (SARIF results — blocks PR on HIGH+)
```

No single scanner catches everything. This layered approach provides:
- **Dependency vulnerabilities**: npm audit (fast, every push)
- **Committed secrets**: gitleaks (every push, full history)
- **Code quality/safety**: Biome rules (every commit, editor feedback)
- **First-party vulnerabilities**: CodeQL (deep analysis, PR and weekly)

---

## Related Standards

- [Security Standards](security-standards.md)
- [Secret Management Standards](secret-management-standards.md)
- [Check-in Standards](checkin-standards.md)
- [Container Security](container-security.md)

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-05-05 | Initial release (XSPEC-161) |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
