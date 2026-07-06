# Multi-Environment E2E Testing Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-05-13
> **AI-optimized version**: `ai/standards/multi-environment-e2e-testing.ai.yaml`
> **Spec**: XSPEC-204 (UDS Issue #94, #95)

**Scope**: universal
**Applicability**: Any project whose E2E tests must run against more than one deployment
target (local, local-IIS, UAT, PRD, etc.)

## Overview

This standard defines how to configure E2E tests across multiple deployment targets. Its
core principle is **Executable Environment Documentation**: *the run command IS the
documentation*. Each environment gets one entry-point script that self-checks its own
prerequisites and runs the correct test subset — so the script itself becomes the
authoritative environment setup guide, instead of scattered knowledge in a README, a
wiki page, and verbal tribal knowledge.

> **Anti-pattern**: manually editing `BASE_URL` in `.env` before test runs. This breaks
> other developers' configs and cannot be committed without affecting everyone.

## Test Framework Multi-Environment Config

**Rule**: `BASE_URL` is baked into the test-project config, not read from `.env`. If
`BASE_URL` comes from `.env`, developers must edit `.env` before running against a
specific environment — a race condition in teams, and a source of accidental commits of
the wrong URL.

Playwright — one config, one project per environment:

```ts
// playwright.config.ts
const ENVS = {
  'local-iis':         'http://localhost/corp',
  'local-iis-express': 'http://localhost:18080/lotest',
  'uat':               'http://portal_uat.example.com/app',
  'prd':               'https://app.example.com',
} as const;

export default defineConfig({
  projects: Object.entries(ENVS).map(([name, url]) => ({
    name,
    use: { browserName: 'chromium', baseURL: url },
  })),
});
```

Cypress — pass the target via `--env target=uat`, defaulting to `local`:

```ts
// cypress.config.ts
const ENVS = {
  'local':  { baseUrl: 'http://localhost:3000' },
  'uat':    { baseUrl: 'http://uat.example.com' },
  'prd':    { baseUrl: 'https://app.example.com' },
};
```

Rules:

- One test config file; distinguish environments via project name or a `--project` /
  `--env` flag.
- No environment-specific `playwright.config.*.ts` / `cypress.config.*.ts` files.
- `BASE_URL` is never sourced from `.env` for E2E test configs.

## Runner Script Pattern

**Rule**: each environment has one entry-point script,
`scripts/run-tests-<env>.(ps1|sh)`, that self-checks prerequisites before invoking the
test runner. Prerequisite checks typically cover: Docker/container runtime, application
health endpoint, database connectivity (if separate from the app), and any other
required environment-specific services.

```bash
#!/bin/bash
# scripts/run-tests-local.sh

# 1. Check Docker
if ! docker info > /dev/null 2>&1; then
  echo "ERROR: Docker is not running." >&2
  exit 1
fi

# 2. Check App
if ! curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
  echo "ERROR: App not responding at http://localhost:3000" >&2
  exit 1
fi

npx playwright test --project=local "$@"
```

(The PowerShell equivalent follows the same three steps: check Docker, check the app
health endpoint, then run `npx playwright test --project=<env>`.)

## Environment Capability Matrix

**Rule**: projects with external dependencies (HTTP services, IdP, payment, messaging)
MUST maintain an environment capability matrix committed to the repository —
`docs/testing/environment-capability-matrix.md` or inline in the testing README. Update
it whenever a new external service dependency is added.

```
## Environment Capability Matrix

| Service / Feature | local-dev | local-iis | UAT | PRD |
|-------------------|:---------:|:---------:|:---:|:---:|
| Auth / SAML       | ⚠️ Keycloak stub | ✅ Keycloak local | ✅ Keycloak UAT | ✅ Enterprise IdP |
| SMS Gateway       | ⚠️ stub-server | ⚠️ stub-server | ⚠️ stub-server / ❌ | ✅ Real Gateway + billing |
| Payment / Finance | ⚠️ stub-server | ⚠️ stub-server | ⚠️ partial | ✅ Real + reconciliation |
| Background Jobs   | ✅ in-process | ✅ in-process | ✅ | ✅ |
| File Storage      | ✅ local | ✅ local | ✅ blob | ✅ blob |

Legend: ✅ Full verification possible · ⚠️ Flow passes but through a stub (real-world
dimensions NOT verified) · ❌ Cannot test in this environment

### Dimensions NOT verifiable in UAT (must defer to PRD smoke)
- SMS: billing correctness, carrier delivery confirmation, DR reporting
- Payment: real debit/credit, bank reconciliation, card validation
```

## CI Gate Mapping

**Rule**: map each CI/CD stage to the environment(s) it must pass, and document which
gate must pass before each deployment stage.

```yaml
# .github/workflows/ci.yml or .gitlab-ci.yml
e2e-smoke-gate:       # Must pass → any deployment
  runs-on: ubuntu-latest
  script: scripts/run-tests-local.sh --grep smoke

e2e-uat-gate:         # Must pass → PRD deployment
  environment: uat
  script: scripts/run-tests-uat.sh
  only: [tags, release-branches]

e2e-prd-smoke:        # Must pass → mark release as stable
  environment: prd
  script: scripts/run-tests-prd-smoke.sh
  only: [tags]
```

| Deployment Stage | Required Gates |
|-------------------|-----------------|
| Before staging deploy | unit tests, integration tests, e2e-smoke-gate |
| Before UAT deploy | all staging gates, e2e-uat-gate (if a UAT environment is available) |
| Before PRD deploy | e2e-uat-gate, sign-off from capability-matrix review |
| After PRD deploy | e2e-prd-smoke, within 10 minutes of deploy |

## Credential Handling

**Rule**: separate what goes into git from what stays gitignored.

- **Commit to git**: base URLs per environment (non-secret, team-shared), test
  usernames for non-PRD environments, feature flags and test configuration,
  self-check scripts with no credentials embedded.
- **Gitignore**: passwords and secrets, API keys and tokens, `.env.test.local`
  (personal overrides).
- **CI secrets**: PRD test passwords are passed via CI secret variables (GitHub
  Secrets / GitLab CI Variables) — never committed.

```
# Test credentials
.env.test.local
tests/fixtures/auth-secrets.json
# Base URLs and non-secrets are committed; see playwright.config.ts
```

## Rules

| Rule | Trigger | Instruction | Priority |
|------|---------|--------------|----------|
| `base-url-in-config` | Setting up E2E tests for a project with multiple environments | Define all environment `BASE_URL`s in the test framework config as named projects; do not rely on `.env` for `BASE_URL` | required |
| `one-runner-per-env` | Adding a new deployment target | Create `scripts/run-tests-<env>.(ps1\|sh)` with self-checking prerequisite steps; verify all required services before invoking the test runner | required |
| `capability-matrix-required` | Feature has external service dependencies (SMS, payment, IdP, file storage) | Create or update the environment capability matrix; mark ✅/⚠️/❌ per service × environment; list dimensions not verifiable in UAT as "PRD-only smoke" | required |
| `ci-gate-mapping` | Defining CI/CD pipeline stages | Map each CI gate to the environment(s) it must pass; the E2E gate must specify which environment it targets | required |

## Relationship to Other Standards

- **`deployment-standards`** — extends: adds the environment dimension to CI gates and
  deployment readiness.
- **`test-completeness-dimensions`** — complements: adds dimension 11, Environment
  Verifiability.
- **`verification-evidence`** — complements: evidence must specify which environment it
  was collected from.
- **`mock-boundary`** — complements: the capability matrix references Level 2 stub-server
  usage.

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-05-13 | Initial — executable environment documentation principle, framework config, runner scripts, capability matrix, CI gate mapping, credential handling (XSPEC-204) |
