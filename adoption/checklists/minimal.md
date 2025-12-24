# Level 1: Essential Adoption Checklist

> **Language**: English | [繁體中文](../../locales/zh-TW/adoption/checklists/minimal.md)

> Minimum viable standards for any project
>
> Setup time: ~30 minutes

---

## Prerequisites

- [ ] Git repository initialized
- [ ] Claude Code installed (for Skills)

---

## Skills Installation

### Option A: Install All Skills (Recommended)

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation
```

### Option B: Install Specific Skills Only

```bash
# Copy only Level 1 skills
cp -r universal-dev-skills/skills/ai-collaboration-standards ~/.claude/skills/
cp -r universal-dev-skills/skills/commit-standards ~/.claude/skills/
```

**Checklist**:
- [ ] ai-collaboration-standards skill installed
- [ ] commit-standards skill installed

---

## Reference Documents

Copy these documents to your project:

```bash
# In your project root
mkdir -p .standards

# Copy Level 1 reference documents
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/
```

**Checklist**:
- [ ] `.standards/` directory created
- [ ] `checkin-standards.md` copied
- [ ] `spec-driven-development.md` copied

---

## Verification

### Test Skills

1. Open Claude Code in your project
2. Try: "Help me write a commit message" → Should follow Conventional Commits
3. Ask about code changes → Should provide evidence-based responses

### Review Reference Documents

- [ ] Read `checkin-standards.md` and understand quality gates
- [ ] Read `spec-driven-development.md` and understand the methodology

---

## Final Checklist

| Item | Status |
|------|--------|
| ai-collaboration-standards skill | [ ] |
| commit-standards skill | [ ] |
| .standards/checkin-standards.md | [ ] |
| .standards/spec-driven-development.md | [ ] |

---

## Next Steps

When ready to upgrade to Level 2 (Recommended):
- See [recommended.md](recommended.md)

---

## Related Standards

- [Recommended Adoption Checklist](recommended.md) - Level 2 upgrade guide
- [Enterprise Adoption Checklist](enterprise.md) - Level 3 upgrade guide
- [Checkin Standards](../../core/checkin-standards.md) - Quality gate standards
- [Spec-Driven Development](../../core/spec-driven-development.md) - Development methodology

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## License

This checklist is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
