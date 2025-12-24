---
name: documentation-guide
description: |
  Guide documentation structure, README content, and project documentation best practices.
  Use when: creating README, documentation, docs folder, project setup.
  Keywords: README, docs, documentation, CONTRIBUTING, CHANGELOG, 文件, 說明文件.
---

# Documentation Guide

This skill provides guidance on project documentation structure, README content, and documentation best practices.

## Quick Reference

### Essential Project Files

| File | Required | Purpose |
|------|:--------:|---------|
| `README.md` | ✅ | Project overview, quick start |
| `CONTRIBUTING.md` | Recommended | Contribution guidelines |
| `CHANGELOG.md` | Recommended | Version history |
| `LICENSE` | ✅ (OSS) | License information |

### Documentation Completeness Checklist

- [ ] README.md exists with essential sections
- [ ] Installation instructions are clear
- [ ] Usage examples are provided
- [ ] Contributing guidelines documented
- [ ] License specified

## Detailed Guidelines

For complete standards, see:
- [Documentation Structure](./documentation-structure.md)
- [README Template](./readme-template.md)

## README.md Required Sections

### Minimum Viable README

```markdown
# Project Name

Brief one-liner description.

## Installation

```bash
npm install your-package
```

## Usage

```javascript
const lib = require('your-package');
lib.doSomething();
```

## License

MIT
```

### Recommended README Sections

1. **Project Name & Description**
2. **Badges** (CI status, coverage, npm version)
3. **Features** (bullet list)
4. **Installation**
5. **Quick Start / Usage**
6. **Documentation** (link to docs/)
7. **Contributing** (link to CONTRIBUTING.md)
8. **License**

## docs/ Directory Structure

```
docs/
├── index.md              # Documentation index
├── getting-started.md    # Quick start guide
├── architecture.md       # System architecture
├── api-reference.md      # API documentation
├── deployment.md         # Deployment guide
└── troubleshooting.md    # Common issues
```

## File Naming Conventions

### Root Directory (UPPERCASE)

```
README.md          # ✅ GitHub auto-displays
CONTRIBUTING.md    # ✅ GitHub auto-links in PR
CHANGELOG.md       # ✅ Keep a Changelog convention
LICENSE            # ✅ GitHub auto-detects
```

### docs/ Directory (lowercase-kebab-case)

```
docs/getting-started.md     # ✅ URL-friendly
docs/api-reference.md       # ✅ URL-friendly
docs/GettingStarted.md      # ❌ Case issues
docs/API_Reference.md       # ❌ Inconsistent
```

## Examples

### Good README.md

```markdown
# MyProject

A fast, lightweight JSON parser for Node.js.

[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm version](https://badge.fury.io/js/myproject.svg)](https://www.npmjs.com/package/myproject)

## Features

- 10x faster than standard JSON.parse
- Streaming support
- Type-safe with TypeScript

## Installation

```bash
npm install myproject
```

## Quick Start

```javascript
const { parse } = require('myproject');

const data = parse('{"name": "test"}');
console.log(data.name); // "test"
```

## Documentation

See [docs/](docs/) for full documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT - see [LICENSE](LICENSE)
```

### Good CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature X

## [1.2.0] - 2025-12-15

### Added
- OAuth2 authentication support
- New API endpoint `/users/profile`

### Changed
- Improved error messages

### Fixed
- Memory leak in session cache

## [1.1.0] - 2025-11-01

### Added
- Initial release
```

---

## Configuration Detection

This skill supports project-specific documentation configuration.

### Detection Order

1. Check `CONTRIBUTING.md` for "Disabled Skills" section
   - If this skill is listed, it is disabled for this project
2. Check `CONTRIBUTING.md` for "Documentation Language" section
3. Check existing documentation structure
4. If not found, **default to English**

### Documentation Audit

When reviewing a project, check for:

| Item | How to Check |
|------|--------------|
| README exists | File present at root |
| README complete | Has installation, usage, license sections |
| CONTRIBUTING exists | File present (for team projects) |
| CHANGELOG exists | File present (for versioned projects) |
| docs/ organized | Has index.md, logical structure |
| Links working | Internal links resolve correctly |

### First-Time Setup

If documentation is missing:

1. Ask the user: "This project doesn't have complete documentation. Which language should I use? (English / 中文)"
2. After user selection, suggest documenting in `CONTRIBUTING.md`:

```markdown
## Documentation Language

This project uses **[chosen option]** for documentation.
<!-- Options: English | 中文 -->
```

3. Start with README.md (essential)
4. Add LICENSE (for open source)
5. Add CONTRIBUTING.md (for team projects)
6. Create docs/ structure (for complex projects)

### Configuration Example

In project's `CONTRIBUTING.md`:

```markdown
## Documentation Language

This project uses **English** for documentation.
<!-- Options: English | 中文 -->
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
