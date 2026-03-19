# Documentation Structure Reference

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/documentation-guide/documentation-structure.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills

---

## Purpose

This document provides reference for project documentation structure and file organization.

---

## Standard Project Structure

```
project-root/
├── README.md                    # Project overview (REQUIRED)
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── LICENSE                      # License file
├── docs/                        # Detailed documentation
│   ├── index.md                 # Documentation index
│   ├── getting-started.md       # Quick start guide
│   ├── architecture.md          # System architecture
│   ├── api-reference.md         # API documentation
│   ├── deployment.md            # Deployment guide
│   └── troubleshooting.md       # Common issues
└── examples/                    # Code examples
    ├── basic-usage/
    └── README.md
```

---

## Document Requirements by Project Type

| Document | New Project | Refactor | Migration | Maintenance |
|----------|:-----------:|:--------:|:---------:|:-----------:|
| **README.md** | ✅ | ✅ | ✅ | ✅ |
| **CONTRIBUTING.md** | ⚪ | ✅ | ✅ | ⚪ |
| **CHANGELOG.md** | ✅ | ✅ | ✅ | ✅ |
| **LICENSE** | ✅ | ✅ | ✅ | ✅ |
| **docs/architecture.md** | ✅ | ✅ | ✅ | ⚪ |
| **docs/api-reference.md** | ⚪ | ✅ | ✅ | ⚪ |
| **docs/deployment.md** | ✅ | ✅ | ✅ | ⚪ |

**Legend**: ✅ Required | ⚪ Recommended | ❌ Not needed

---

## File Naming Conventions

### Root Directory Files

Use **UPPERCASE** for GitHub/GitLab auto-recognition:

| File | Reason |
|------|--------|
| `README.md` | GitHub auto-displays on repo page |
| `CONTRIBUTING.md` | GitHub auto-links in PR creation |
| `CHANGELOG.md` | Keep a Changelog convention |
| `LICENSE` | GitHub auto-detects license type |
| `CODE_OF_CONDUCT.md` | GitHub community standard |
| `SECURITY.md` | GitHub security advisory |

### docs/ Directory Files

Use **lowercase-kebab-case** for URL friendliness:

✅ **Correct**:
```
docs/
├── index.md
├── getting-started.md
├── api-reference.md
└── user-guide.md
```

❌ **Incorrect**:
```
docs/
├── INDEX.md           # Inconsistent casing
├── GettingStarted.md  # PascalCase not URL-friendly
├── API_Reference.md   # snake_case inconsistent
└── User Guide.md      # Spaces cause URL issues
```

---

## Document Templates

### README.md Template

```markdown
# Project Name

Brief one-liner description.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install project-name
```

## Quick Start

```javascript
const lib = require('project-name');
lib.doSomething();
```

## Documentation

See [docs/](docs/) for full documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[License Name](LICENSE)
```

### CONTRIBUTING.md Template

```markdown
# Contributing Guidelines

## Development Setup

```bash
git clone https://github.com/org/repo
cd repo
npm install
```

## Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes following [commit standards](commit-message-format-link)
4. Push branch: `git push origin feature/my-feature`
5. Create pull request

## Coding Standards

- Follow project style guide
- Run `npm run lint` before committing
- Ensure tests pass: `npm test`

## Code Review Process

All submissions require review before merging.
```

### CHANGELOG.md Template

```markdown
# Changelog

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- New feature

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release

[Unreleased]: https://github.com/org/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

---

## docs/ Structure

### index.md - Documentation Hub

```markdown
# Documentation Index

## Getting Started
- [Quick Start](getting-started.md)
- [Installation](installation.md)

## Guides
- [User Guide](user-guide.md)
- [Developer Guide](developer-guide.md)

## Reference
- [API Reference](api-reference.md)
- [Configuration](configuration.md)

## Operations
- [Deployment](deployment.md)
- [Troubleshooting](troubleshooting.md)
```

### getting-started.md Structure

1. Prerequisites
2. Installation
3. Basic Configuration
4. First Example
5. Next Steps

### architecture.md Structure

1. Overview
2. System Components
3. Data Flow
4. Design Decisions
5. Technology Stack
6. Security Architecture

### api-reference.md Structure

1. API Overview
2. Authentication
3. Endpoints (grouped by resource)
4. Request/Response Examples
5. Error Codes
6. Rate Limiting

### deployment.md Structure

1. Prerequisites
2. Environment Setup
3. Configuration
4. Deployment Steps
5. Verification
6. Rollback Procedure
7. Monitoring

### troubleshooting.md Structure

```markdown
## Problem: [Error Name]

**Symptoms**:
- Description of what user sees

**Cause**:
- Why this happens

**Solution**:
- Step-by-step fix

**Prevention**:
- How to avoid in future
```

---

## Documentation Quality Checklist

### Completeness

- [ ] Prerequisites listed
- [ ] All steps documented
- [ ] Expected outcomes described
- [ ] Error scenarios covered

### Readability

- [ ] Clear, concise language
- [ ] Short paragraphs (≤5 sentences)
- [ ] Code examples included
- [ ] Screenshots/diagrams where helpful

### Accuracy

- [ ] Code examples tested
- [ ] Screenshots up-to-date
- [ ] Version numbers correct
- [ ] Links working

### Maintainability

- [ ] Clear section headings
- [ ] Logical organization
- [ ] Easy to update
- [ ] Version aligned with software

---

## Cross-Reference Guidelines

### When to Link

| Situation | Action |
|-----------|--------|
| Mentioning another doc | Add link |
| Referencing API endpoint | Link to api-reference.md |
| Discussing architecture | Link to architecture.md |
| New document added | Update index.md |

### References Section

Every document should end with:

```markdown
## References

- [Related Document](path/to/doc.md)
- [Architecture Overview](architecture.md)
- [API Reference](api-reference.md)
```

---

## Related Standards

- [Documentation Structure](../../core/documentation-structure.md)
- [Documentation Writing Standards](../../core/documentation-writing-standards.md)
- [README Template](./readme-template.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
