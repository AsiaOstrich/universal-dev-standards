# Usage Modes Comparison: Skills vs Standards vs Both

> **Language**: English | [繁體中文](../locales/zh-TW/docs/USAGE-MODES-COMPARISON.md)
>
> **Version**: 1.0.0
> **Last Updated**: 2026-01-12

This document compares the effectiveness of three usage modes after installing Universal Development Standards (UDS).

---

## Table of Contents

1. [Overview](#overview)
2. [Mode Comparison](#mode-comparison)
3. [Detailed Comparison](#detailed-comparison)
4. [Use Case Recommendations](#use-case-recommendations)
5. [Feature Coverage](#feature-coverage)
6. [Quantitative Comparison](#quantitative-comparison)
7. [Conclusion](#conclusion)

---

## Overview

### Mode A: Skills Only

**Configuration**:
- Select `standardsScope: minimal` during installation
- Skills Location: Plugin Marketplace (recommended)
- Minimal standards files copied to project

**Includes**:
- 16 Claude Code Skills (interactive commands)
- Minimal standards files (reference category only)

### Mode B: Standards Only

**Configuration**:
- Select `standardsScope: full` during installation
- Skip Skills installation (or select non-Claude Code tools)
- Full standards files copied to `.standards/`

**Includes**:
- 17 core standards files
- Integration files (.cursorrules, CLAUDE.md, etc.)
- No interactive Skills

### Mode C: Skills + Standards (Both)

**Configuration**:
- Select `standardsScope: full` + Skills installation
- Or use `contentMode: full` for complete standards

**Includes**:
- 16 Claude Code Skills
- 17 core standards files
- Integration files

---

## Mode Comparison

### Quick Comparison Table

| Aspect | Skills Only | Standards Only | Skills + Standards |
|--------|-------------|----------------|-------------------|
| Interactive Commands | 16 commands | None | 16 commands |
| Standards Depth | Medium | High | High |
| Token Usage | Low | Medium-High | High |
| Multi-Tool Support | Claude Code only | All 9 AI tools | All 9 AI tools |
| Version Control | External | Git tracked | Mixed |
| Customization | Limited | Full | Full |
| Learning Curve | Low | High | Low |

### Best For

| Mode | Recommended For |
|------|-----------------|
| **Skills Only** | Individual developers using Claude Code exclusively |
| **Standards Only** | Multi-tool teams, enterprise environments, offline use |
| **Skills + Standards** | Complete experience, learning UDS, team onboarding |

---

## Detailed Comparison

### Interactivity & User Experience

| Aspect | Skills Only | Standards Only | Skills + Standards |
|--------|-------------|----------------|-------------------|
| Interactive commands | 16 available | None | 16 available |
| Context awareness | Auto-detect | Manual reading | Auto-detect |
| Workflow guidance | Step-by-step | Self-directed | Step-by-step |
| Learning curve | Low | High | Low |

**Notes**:
- Skills provide commands like `/commit`, `/tdd`, `/review` for interactive guidance
- Standards files require developers to actively read and apply
- Skills can auto-detect context (git status, project language)

### Content Completeness

| Aspect | Skills Only | Standards Only | Skills + Standards |
|--------|-------------|----------------|-------------------|
| Standards depth | Medium | High | High |
| Example count | Condensed | Comprehensive | Comprehensive |
| Decision matrices | Partial | Complete | Complete |
| Version tracking | No | Yes | Yes |
| Cross-language examples | Partial | Complete | Complete |

**Notes**:
- Skills extract the essence of standards but omit some details
- Standards files contain complete decision trees, examples, and edge cases
- Features like large-scale refactoring patterns (`refactoring-standards.md`) have no Skills equivalent

### Tool Support

| Tool | Skills Only | Standards Only | Skills + Standards |
|------|-------------|----------------|-------------------|
| Claude Code | Full | Basic | Full |
| Cursor | Not supported | Supported | Supported |
| Windsurf | Not supported | Supported | Supported |
| Cline | Not supported | Supported | Supported |
| GitHub Copilot | Not supported | Supported | Supported |
| Other AI tools | Not supported | Supported | Supported |

**Notes**:
- Skills only support Claude Code
- Standards files can integrate with all 9 supported AI tools
- Multi-tool teams require standards files

### Maintenance & Updates

| Aspect | Skills Only | Standards Only | Skills + Standards |
|--------|-------------|----------------|-------------------|
| Update method | Plugin auto-update | `uds update` | Mixed |
| Version control | External | Git tracked | Partial |
| Custom extensions | Limited | Full | Full |
| Team sync | Individual install | Git sync | Mixed |

**Notes**:
- Skills are managed centrally in Plugin Marketplace but cannot be version controlled
- Standards files can be committed to Git for team synchronization
- Custom rules require modifying standards files

### Token Efficiency

| Aspect | Skills Only | Standards Only | Skills + Standards |
|--------|-------------|----------------|-------------------|
| Base token usage | Low | Medium-High | High |
| On-demand loading | Yes | No | Partial |
| Duplicate content | None | None | Some |

**Notes**:
- Skills load on-demand, consuming tokens only when invoked
- Standards files integrated into CLAUDE.md are loaded with every conversation
- Using both results in some content overlap

---

## Use Case Recommendations

### Scenario 1: Individual Developer + Claude Code Only

**Recommended Mode**: Skills Only (Mode A)

**Reasons**:
- Lowest token consumption
- Best interactive experience
- No extra files to manage
- `/commit`, `/tdd`, `/review` commands sufficient for daily use

**Configuration**:
```bash
uds init -y --skills-location marketplace
# standardsScope will be set to minimal
```

### Scenario 2: Team Development + Multiple AI Tools

**Recommended Mode**: Skills + Standards (Mode C)

**Reasons**:
- Standards files sync via Git for team consistency
- Non-Claude Code users can use standards files
- Skills provide better experience for Claude Code users

**Configuration**:
```bash
uds init -y --skills-location marketplace --content-mode index
# Select multiple AI tools during prompts
```

### Scenario 3: Enterprise Environment + Strict Compliance

**Recommended Mode**: Standards Only (Mode B)

**Reasons**:
- Full customization of standards content
- Complete version control and audit trail
- No dependency on external Plugin Marketplace
- Suitable for offline environments

**Configuration**:
```bash
uds init -y --skills-location none --content-mode full
```

### Scenario 4: Learning UDS Standards System

**Recommended Mode**: Skills + Standards (Mode C)

**Reasons**:
- Skills provide guided learning
- Standards files provide deep reference
- Compare Skills behavior with standards content

---

## Feature Coverage

### Features Strong in Skills but Weak in Standards

| Feature | Corresponding Skill |
|---------|-------------------|
| Methodology switching | `/methodology switch` |
| Phase checkpoint reminders | `methodology-system` |
| Auto commit message generation | `/commit` |
| Interactive TDD cycle | `/tdd` |

### Features in Standards but Not Covered by Skills

| Feature | Corresponding Standards File |
|---------|----------------------------|
| Large-scale refactoring patterns (Strangler Fig) | `refactoring-standards.md` |
| Technical debt assessment matrix | `refactoring-standards.md` |
| Complete error code taxonomy | `error-code-standards.md` |
| Logging sampling strategies | `logging-standards.md` |
| Project type mapping matrix | `documentation-writing-standards.md` |

### Features Fully Covered by Both

| Feature | Skill | Standards File |
|---------|-------|---------------|
| Conventional Commits | `commit-standards` | `commit-message-guide.md` |
| Testing pyramid | `testing-guide` | `testing-standards.md` |
| Code review checklist | `code-review-assistant` | `code-review-checklist.md` |
| Semantic versioning | `release-standards` | `versioning.md` |
| CHANGELOG format | `changelog-guide` | `changelog-standards.md` |

---

## Quantitative Comparison

### Content Volume

| Metric | Skills Only | Standards Only | Skills + Standards |
|--------|-------------|----------------|-------------------|
| File count | ~16 Skills | ~17 standards | ~33 total |
| Estimated lines | ~3,000 | ~8,000 | ~11,000 |
| Estimated tokens | ~15K | ~40K | ~50K |

### Feature Coverage by Domain

| Domain | Skills Only | Standards Only | Skills + Standards |
|--------|-------------|----------------|-------------------|
| Version management | 90% | 100% | 100% |
| Testing standards | 85% | 100% | 100% |
| Code review | 95% | 100% | 100% |
| Refactoring guidance | 30% | 100% | 100% |
| Error handling | 70% | 100% | 100% |
| Logging standards | 60% | 100% | 100% |

---

## Conclusion

### Summary of Differences

1. **Interactivity**: Skills > Standards (Skills provide proactive guidance)
2. **Completeness**: Standards > Skills (Standards cover more details)
3. **Efficiency**: Skills > Standards (On-demand loading, lower token usage)
4. **Flexibility**: Standards > Skills (Customizable, version-controlled)
5. **Multi-tool support**: Standards > Skills (Skills limited to Claude Code)

### Best Practice Recommendations

```
Individual Developer + Claude Code
  └─ Recommended: Skills Only (Mode A)
     └─ Config: standardsScope: minimal + Plugin Marketplace

Team Development + Mixed Tools
  └─ Recommended: Skills + Standards (Mode C)
     └─ Config: standardsScope: full + Plugin Marketplace
     └─ Commit standards files to Git

Enterprise + Compliance Requirements
  └─ Recommended: Standards Only (Mode B)
     └─ Config: standardsScope: full + No Skills
     └─ Full offline capability
```

### Overall Rating

| Mode | Best For | Rating |
|------|----------|--------|
| Skills Only | Individual rapid development | ★★★★☆ |
| Standards Only | Multi-tool teams / Enterprise | ★★★★☆ |
| Skills + Standards | Complete experience / Learning | ★★★★★ |

**Conclusion**: Each mode has its strengths. The choice depends on team size, tool combination, and compliance requirements. For the most complete experience, we recommend using both Skills and Standards together.

---

## Related Documents

- [CLI Init Options](CLI-INIT-OPTIONS.md) - Complete CLI options guide
- [Adoption Guide](../adoption/ADOPTION-GUIDE.md) - Standards adoption guide
- [Skills README](../skills/README.md) - Claude Code Skills documentation

---

**Maintained by Universal Dev Standards Team**
