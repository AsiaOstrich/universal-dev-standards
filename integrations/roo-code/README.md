# Roo Code Integration

> Roo Code (formerly "Roo-Cline") is an open-source fork of [Cline](https://github.com/cline/cline) maintained by the Roo Code community. Roo Code adds custom modes, multiple-file rule directories, and a richer workflow system on top of the original Cline rules engine.
>
> This integration upgrades Roo Code to UDS **Complete** tier with a dedicated configuration directory while preserving full backward compatibility with the legacy `.clinerules` mechanism that ships with Cline.

## Status / 狀態

| Aspect | Value |
| :--- | :--- |
| **Tier** | Complete |
| **Skills support** | Yes (`.roo/skills/`) |
| **Slash commands** | Yes (`.roo/commands/`) |
| **Custom modes** | Yes (`.roomodes`) |
| **Workflows** | Yes (`.roo/workflows/`) |
| **Backward compatibility** | `.clinerules` and `.roorules` |

## How Roo Code Loads Rules

Roo Code reads instruction files in the following precedence (most specific first):

1. **`.roo/rules/`** — directory of multiple Markdown rule files (modern, recommended)
2. **`.roo/rules-{mode}/`** — mode-specific rules (loaded only when in that mode)
3. **`.roomodes`** — JSON file declaring custom modes with inline `customInstructions`
4. **`.roorules`** — single-file rules (legacy, still supported)
5. **`.clinerules`** — Cline-compatible single-file rules (full backward compatibility)

UDS provides files for path **(1)** and path **(5)** so Roo Code users can pick whichever fits their workflow without any migration friction.

## Files in This Integration

```
integrations/roo-code/
├── README.md                          # This file
├── .roo/
│   └── rules/
│       └── uds-standards.md           # Modern multi-file rules entry point
└── .clinerules                        # Legacy / Cline-compatible rules
```

## Quick Start

Pick **one** of the configuration paths below. You do not need both — they describe the same UDS rules to Roo Code.

### Option A — Modern (recommended)

Copy the `.roo/rules/uds-standards.md` file to your project root:

```bash
mkdir -p .roo/rules
cp integrations/roo-code/.roo/rules/uds-standards.md .roo/rules/uds-standards.md
```

You can drop additional rule files into `.roo/rules/` later (for example `.roo/rules/team-conventions.md`) and Roo Code will load all of them in alphabetical order.

### Option B — Legacy (Cline-compatible)

If you are migrating from a Cline setup, drop the `.clinerules` file at your project root:

```bash
cp integrations/roo-code/.clinerules .clinerules
```

Roo Code will read `.clinerules` natively. This is the lowest-friction path for Cline users moving to Roo Code.

### Option C — Custom modes (`.roomodes`)

If you maintain custom modes, you can reference UDS rules from `.roomodes` `customInstructions`:

```json
{
  "customModes": [
    {
      "slug": "uds-engineer",
      "name": "UDS Engineer",
      "roleDefinition": "Senior engineer following Universal Dev Standards.",
      "groups": ["read", "edit", "command"],
      "customInstructions": "Follow all rules in .roo/rules/uds-standards.md."
    }
  ]
}
```

## CLI Installation (recommended)

The UDS CLI installs the right files for you:

```bash
npx universal-dev-standards init --agent roo-code
```

This drops `.roo/rules/uds-standards.md` (and `.clinerules` for backward compatibility) into your project root.

## Skills, Commands, Agents, Workflows

Because Roo Code supports the full UDS extension surface, you can also install:

| Asset | Path |
| :--- | :--- |
| Skills | `.roo/skills/` |
| Slash commands | `.roo/commands/` |
| Subagents | `.roo/agents/` |
| Workflows | `.roo/workflows/` |

Use `npx universal-dev-standards install <skill\|command\|agent\|workflow>` to populate these directories.

## Differences from Cline

Roo Code is a Cline fork and remains fully compatible at the rules layer. The differences relevant to UDS users:

- **Multi-file rules** — Roo Code loads every Markdown file under `.roo/rules/`, while Cline loads a single `.clinerules` file.
- **Custom modes** — Roo Code's `.roomodes` allows declaring per-mode role definitions; Cline does not.
- **Workflows** — Both support workflow files; Roo Code's live under `.roo/workflows/`, Cline's under `.cline/workflows/`.

## Reference

- Roo Code project: https://github.com/RooCodeInc/Roo-Code
- Roo Code rules documentation: https://docs.roocode.com/features/custom-rules
- UDS registry entry: `integrations/REGISTRY.json` → `agents.roo-code`
- UDS path configuration: `cli/src/config/ai-agent-paths.js` → `roo-code`
