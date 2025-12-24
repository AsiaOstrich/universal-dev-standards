# Contributing Guidelines Template

> Copy this file to your project as `CONTRIBUTING.md` and customize as needed.
> This template includes configuration sections for [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills).

---

## Disabled Skills

<!--
All skills are enabled by default.
Uncomment and list skills you want to DISABLE for this project.
-->

<!--
- testing-guide
- release-standards
-->

---

## Development Standards

### Commit Message Language

This project uses **English** commit types.
<!-- Options: English | Traditional Chinese | Bilingual -->

#### Allowed Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring |
| `docs` | Documentation |
| `style` | Formatting |
| `test` | Tests |
| `perf` | Performance |
| `build` | Build system |
| `ci` | CI/CD changes |
| `chore` | Maintenance |
| `revert` | Revert commit |
| `security` | Security fix |

#### Allowed Scopes

- `auth` - Authentication module
- `api` - API layer
- `ui` - User interface
- `db` - Database
- `core` - Core functionality
<!-- Add your project-specific scopes -->

---

### Certainty Tag Language

This project uses **English** certainty tags.
<!-- Options: English | 中文 -->

#### Tag Reference

| Tag | Use When |
|-----|----------|
| `[Confirmed]` | Direct evidence from code/docs |
| `[Inferred]` | Logical deduction from evidence |
| `[Assumption]` | Based on common patterns |
| `[Unknown]` | Information not available |
| `[Need Confirmation]` | Requires user clarification |

---

### Git Workflow

#### Branching Strategy

This project uses **GitHub Flow**.
<!-- Options: GitFlow | GitHub Flow | Trunk-Based Development -->

#### Branch Naming

Format: `<type>/<description>`

| Type | Usage | Example |
|------|-------|---------|
| `feature/` | New functionality | `feature/oauth-login` |
| `fix/` | Bug fixes | `fix/memory-leak` |
| `hotfix/` | Urgent fixes | `hotfix/security-patch` |
| `refactor/` | Code refactoring | `refactor/extract-service` |
| `docs/` | Documentation | `docs/api-reference` |
| `chore/` | Maintenance | `chore/update-deps` |
| `release/` | Release prep | `release/v1.2.0` |

#### Merge Strategy

- Feature branches: **Squash Merge**
<!-- Options: Merge Commit | Squash Merge | Rebase -->

---

## Code Review

### Comment Prefixes

| Prefix | Action Required |
|--------|-----------------|
| **BLOCKING** | Must fix before merge |
| **IMPORTANT** | Should fix |
| **SUGGESTION** | Optional improvement |
| **QUESTION** | Need clarification |
| **NOTE** | Informational |

---

## Testing

### Minimum Coverage

| Level | Target |
|-------|--------|
| Unit Tests | 80% |
| Integration Tests | 60% |
| E2E Tests | Critical paths |

---

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request
5. Address review comments
6. Merge after approval

---

## License

By contributing to this project, you agree that your contributions will be licensed under the project's license.
