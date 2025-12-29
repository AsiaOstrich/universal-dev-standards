# AI Standards Format Guide

This document explains the file format conventions used in the AI-optimized standards.

## File Format Overview

### English Standards (ai/)

All English AI standards use **YAML format** with `.ai.yaml` extension:

```
ai/
├── standards/
│   ├── testing.ai.yaml
│   ├── commit-message.ai.yaml
│   └── ...
└── options/
    ├── testing/
    │   ├── unit-testing.ai.yaml
    │   └── ...
    └── ...
```

### Localized Standards (locales/)

Localized versions follow the same YAML format:

```
locales/
├── zh-TW/
│   └── ai/
│       ├── standards/
│       │   └── testing.ai.yaml
│       └── options/
│           └── testing/
│               └── unit-testing.ai.yaml
└── zh-CN/
    └── ai/
        └── ...
```

## Format Specification

### Standard File Structure

```yaml
# <Standard Name> - AI Optimized
# Source: core/<standard>.md

id: <standard-id>
meta:
  version: "X.Y.Z"
  updated: "YYYY-MM-DD"
  source: core/<standard>.md
  description: <brief description>

# Main content sections
<section>:
  <subsection>:
    <key>: <value>

# Rules for AI behavior
rules:
  - id: <rule-id>
    trigger: <when to apply>
    instruction: <what to do>
    priority: required|recommended

# Quick reference tables
quick_reference:
  <table_name>:
    columns: [Col1, Col2, Col3]
    rows:
      - [val1, val2, val3]
```

### Option File Structure

```yaml
# <Option Name> - AI Optimized Option
# Parent: <parent-standard>

id: <option-id>
meta:
  parent: <parent-standard-id>
  version: "X.Y.Z"
  description: <brief description>

best_for:
  - <use case 1>
  - <use case 2>

# Option-specific content
<section>:
  <content>

rules:
  - id: <rule-id>
    trigger: <when to apply>
    instruction: <what to do>
    priority: required|recommended
```

## Design Rationale

### Why YAML?

1. **AI-Friendly**: Structured data is easier for AI to parse and apply
2. **Human-Readable**: Clear hierarchy without syntax noise
3. **Tool Support**: Wide ecosystem support for validation and processing
4. **Extensible**: Easy to add new fields without breaking existing parsers

### Why `.ai.yaml` Extension?

1. **Identification**: Clearly marks files as AI-optimized standards
2. **Differentiation**: Distinguishes from regular YAML config files
3. **Tooling**: Enables specialized linting/validation rules
4. **Search**: Easy to find all AI standards with glob patterns

### Why Separate from Core Standards?

1. **Dual Purpose**: Core standards (Markdown) for humans, AI standards (YAML) for AI
2. **Optimization**: AI standards can be structured for efficient token usage
3. **Flexibility**: AI standards can include trigger rules and quick references
4. **Maintenance**: Can update AI format independently of human-readable docs

## Localization Guidelines

### Field Translation

| Field | Translate? | Notes |
|-------|------------|-------|
| id | No | Keep as identifier |
| version | No | Same as source |
| description | Yes | Localize |
| rules.instruction | Yes | Localize |
| quick_reference columns | Yes | Localize headers |
| quick_reference rows | Yes | Localize content |

### Metadata Header

Localized files include translation metadata:

```yaml
# Note: This is included in the file header comment
# source_version: <version of source file>
# translation_version: <version of translation>
# last_synced: <date>
```

## Validation

### Required Fields

Every standard file must have:
- `id`
- `meta.version`
- `meta.description`

### Optional but Recommended

- `rules[]` - AI behavior triggers
- `quick_reference` - Summary tables
- `options` - Sub-options (for parent standards)

## Examples

### Minimal Standard

```yaml
id: example
meta:
  version: "1.0.0"
  description: Example standard

rules:
  - id: basic-rule
    trigger: always
    instruction: Follow this guideline
    priority: required
```

### Full Standard

See [testing.ai.yaml](standards/testing.ai.yaml) for a complete example.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-30 | Initial format guide |
