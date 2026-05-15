# UDS User Documentation

> **Language**: English | [繁體中文](../../locales/zh-TW/docs/user/README.md) _(planned)_

Welcome to the UDS (Universal Development Standards) user documentation hub.

---

## For New Users

Just installed UDS? Start here:

1. **[GETTING-STARTED.md](GETTING-STARTED.md)** — 5-minute walkthrough: install → init → first spec → first commit
2. **[GLOSSARY.md](GLOSSARY.md)** — What is a Skill? A Standard? A Tier? Definitions for all UDS terms
3. **[SKILLS-INDEX.md](SKILLS-INDEX.md)** — Browse all 54 skills by Tier and Category

---

## For Daily Users

| I want to... | Go to |
|--------------|-------|
| Find the right command | [SKILLS-INDEX.md → When to Use](SKILLS-INDEX.md#觸發時機速查-when-to-use) |
| See all slash commands | [COMMANDS-INDEX.md](COMMANDS-INDEX.md) |
| Customize which skills are listed | [skill-budget-tuning.md](../skill-budget-tuning.md) |
| Quick reference card | [CHEATSHEET.md](CHEATSHEET.md) |
| Answer a common question | [FAQ.md](FAQ.md) |
| Fix a problem | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

---

## For Maintainers / Contributors

| Topic | Resource |
|-------|----------|
| How UDS is structured | [../../CONTRIBUTING.md](../../CONTRIBUTING.md) |
| CLI reference | [../../cli/README.md](../../cli/README.md) |
| Adoption guide | [../../adoption/ADOPTION-GUIDE.md](../../adoption/ADOPTION-GUIDE.md) |
| Pre-release info | [../PRE-RELEASE.md](../PRE-RELEASE.md) |
| Updating generated docs | Run `npm run docs:generate-index` |

---

## Document Map

```
docs/
├── user/                        ← You are here (user-facing docs)
│   ├── README.md                ← This file — doc hub
│   ├── GETTING-STARTED.md       ← First-time setup guide
│   ├── SKILLS-INDEX.md          ← 54 skills by Tier & Category (auto-generated)
│   ├── COMMANDS-INDEX.md        ← All slash commands (auto-generated)
│   ├── CHEATSHEET.md            ← Quick reference card
│   ├── FAQ.md                   ← Common questions
│   ├── GLOSSARY.md              ← Terminology
│   └── TROUBLESHOOTING.md       ← Problem → solution
├── reference/                   ← Complete reference (auto-generated)
│   └── FEATURE-REFERENCE.md
└── internal/                    ← Maintainer docs (not for end users)
```

> **Note**: Files marked "auto-generated" are rebuilt by `npm run docs:generate-index`.
> Do not edit them manually — changes will be overwritten on the next run.
