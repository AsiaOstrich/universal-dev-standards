# README Template & Best Practices

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/documentation-guide/readme-template.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills

---

## Purpose

This document provides templates and best practices for writing README files.

---

## README Sections Reference

### Essential Sections (Minimum)

| Section | Purpose | Required |
|---------|---------|:--------:|
| Project Name | Identity | ✅ |
| Description | What it does | ✅ |
| Installation | How to install | ✅ |
| Usage | How to use | ✅ |
| License | Legal terms | ✅ |

### Recommended Sections

| Section | Purpose | When to Include |
|---------|---------|-----------------|
| Badges | Status indicators | CI, npm, coverage |
| Features | Key capabilities | Multi-feature projects |
| Quick Start | Fast onboarding | Complex setup |
| API Reference | Technical docs | Libraries/APIs |
| Configuration | Setup options | Configurable tools |
| Contributing | How to help | Open source |
| Changelog | Version history | Versioned projects |
| FAQ | Common questions | User-facing projects |
| Acknowledgments | Credits | Community projects |

---

## README Templates

### Minimal README

```markdown
# Project Name

Brief description of what this project does.

## Installation

```bash
npm install project-name
```

## Usage

```javascript
const lib = require('project-name');
lib.doSomething();
```

## License

MIT
```

### Standard README

```markdown
# Project Name

Brief description of what this project does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install project-name
```

## Usage

```javascript
const { feature } = require('project-name');

// Basic usage
feature.doSomething();

// With options
feature.doSomething({ option: 'value' });
```

## Documentation

See [docs/](docs/) for detailed documentation.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT - see [LICENSE](LICENSE)
```

### Full README

```markdown
# Project Name

[![CI Status](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm version](https://badge.fury.io/js/project-name.svg)](https://www.npmjs.com/package/project-name)
[![Coverage](https://codecov.io/gh/org/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/org/repo)

Brief description of what this project does and why it exists.

## Features

- **Fast**: 10x faster than alternatives
- **Simple**: Easy to learn API
- **Extensible**: Plugin architecture
- **Type-safe**: Full TypeScript support

## Installation

### npm

```bash
npm install project-name
```

### yarn

```bash
yarn add project-name
```

### pnpm

```bash
pnpm add project-name
```

## Quick Start

```javascript
const { Client } = require('project-name');

const client = new Client({ apiKey: 'your-key' });

const result = await client.doSomething();
console.log(result);
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Configuration](docs/configuration.md)
- [Examples](examples/)

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | - | Your API key |
| `timeout` | number | 30000 | Request timeout in ms |
| `retries` | number | 3 | Number of retry attempts |

## Examples

See the [examples/](examples/) directory for complete examples:

- [Basic Usage](examples/basic/)
- [Advanced Features](examples/advanced/)
- [Integration](examples/integration/)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/org/repo.git
cd repo
npm install
npm test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## FAQ

### How do I do X?

Answer to common question.

### Why does Y happen?

Explanation of behavior.

## Support

- [GitHub Issues](https://github.com/org/repo/issues)
- [Documentation](https://docs.example.com)
- [Discord](https://discord.gg/example)

## Acknowledgments

- [Library A](https://example.com) - Used for X
- [Person B](https://github.com/person) - Initial idea

## License

MIT - see [LICENSE](LICENSE) for details.
```

---

## Section Details

### Project Name & Description

**Good**:
```markdown
# FastJSON

A blazing-fast JSON parser for Node.js with streaming support.
```

**Bad**:
```markdown
# my-project

This is a project.
```

### Badges

Common badges:
```markdown
[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm](https://img.shields.io/npm/v/package.svg)](https://www.npmjs.com/package/package)
[![Coverage](https://codecov.io/gh/org/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/org/repo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
```

### Installation

Include multiple package managers if applicable:

```markdown
## Installation

### npm
```bash
npm install package-name
```

### yarn
```bash
yarn add package-name
```
```

### Usage Examples

**Good** - Shows real use case:
```markdown
## Usage

```javascript
const { parseJSON } = require('fast-json');

// Parse a JSON file
const data = parseJSON('./config.json');
console.log(data.settings);

// Parse with options
const strictData = parseJSON('./data.json', { strict: true });
```
```

**Bad** - Too abstract:
```markdown
## Usage

```javascript
const lib = require('lib');
lib.func();
```
```

### Configuration Table

```markdown
## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 30000 | Request timeout (ms) |
| `retries` | number | 3 | Max retry attempts |
| `debug` | boolean | false | Enable debug logging |
```

---

## Common Mistakes

### ❌ Too Vague

```markdown
# Project

A project for doing things.

## Install

Install it.

## Use

Use it.
```

### ❌ No Examples

```markdown
# JSON Parser

A JSON parser library.

See API docs for usage.
```

### ❌ Outdated Information

```markdown
## Requirements

- Node.js 8+  ← Outdated
- npm 5+      ← Outdated

## Installation

```bash
npm install old-package-name  ← Wrong package name
```
```

### ❌ Broken Links

```markdown
See [documentation](docs/old-path.md) for more info.  ← Link doesn't exist
```

---

## README Quality Checklist

- [ ] Project name clearly stated
- [ ] Purpose explained in 1-2 sentences
- [ ] Installation instructions complete
- [ ] Usage example actually works
- [ ] All links verified working
- [ ] Version requirements accurate
- [ ] License clearly stated
- [ ] Contact/support info provided (for user-facing projects)

---

## Related Standards

- [Documentation Structure Reference](./documentation-structure.md)
- [Documentation Writing Standards](../../core/documentation-writing-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
