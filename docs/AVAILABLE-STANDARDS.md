# Available Standards: what UDS ships and your project does not have

> **Language**: English | [繁體中文](../locales/zh-TW/docs/AVAILABLE-STANDARDS.md) | [简体中文](../locales/zh-CN/docs/AVAILABLE-STANDARDS.md)

A project that was set up with an older UDS keeps the standards it was set up with. Standards added to UDS
since then are **not** installed by `uds update --apply`, because the update only maintains what the project's
manifest (`.standards/manifest.json`) lists. Before this page's feature existed, nothing told you they were
there. Now three commands tell you, and one lets you pick.

## The one rule

A standard is **available but not installed** when all three hold:

1. its category is one `uds init` installs (`reference` or `skill`, see the table below),
2. it has a source file in your project's `format` (`ai` by default; a skill-only entry has no file), and
3. no file of that name is already listed in `manifest.standards`.

The rule lives in one function (`getAvailableStandards`, `cli/src/utils/available-standards.js`). The older
interactive path of `uds update`, `uds update --plan`/`--apply`, `uds check` and `uds audit --friction` all
ask it, so they cannot disagree.

## Categories

| Category | Offered as "available"? | Why |
|---|---|---|
| `reference` | yes | `uds init` installs it into `.standards/`. |
| `skill` | yes | `uds init` installs it into `.standards/`. |
| `core` | **no, but counted and installable by id** | Added to the registry (March 2026) after the installer's "reference or skill" filter was written (December 2025). `uds init` has never installed it, so for a project it was never "new". This is a historical accident, not a design decision. |
| `testing`, `security`, `deployment`, `operations` | **no, but counted and installable by id** | Same as `core`: added later, never installed by init. |
| `extension` | no, and **not installable with `--add-standard`** | Installed through a language / framework / locale choice at init (`--lang`, `--framework`, `--locale`). |
| `integration` | no, and not installable with `--add-standard` | A per-tool integration file, installed through the AI-tool choice at init. |
| `template` | no, and not installable with `--add-standard` | A document template to copy, not a standard file. |

The other categories are never dropped silently: `uds update --plan` ends with a line saying how many there
are and in which categories, and any of the installable ones can be chosen by id (below). Whether they should
be *listed* the way `reference`/`skill` are is an open decision (XSPEC-458 OQ1), not a settled one.

## Manifest fields that do not matter here

| Field | Status | What it does |
|---|---|---|
| `level` | dead | A manifest written by 6.11.0 carries it only as a leftover inside `integrationConfigs[<file>].level`. No code reads it to decide what to install. The registry's "level system" is a deprecated stub. |
| `profile` | does not exist | Appears nowhere in the CLI or in any manifest. |
| `contentMode` | live, but not for this | Decides how `CLAUDE.md` is rendered (`minimal` or `index`). It never decides which standards are installed. |

## The commands

```sh
uds update --plan            # the plan, then "Available upstream, not installed (N)" grouped by category
uds update --apply           # applies the plan; at the end prints how many are available and how to install one
uds update --apply --add-standard open-work-tracking     # install one, and record it in the manifest
uds update --apply --add-standard a --add-standard b     # several
uds update --plan --add-standard open-work-tracking      # preview that
uds check                    # one line: "N upstream standard(s) not installed"
uds audit --friction         # one low-severity finding (not part of --report, not part of --score)
```

- Everything above except `--add-standard` is **information only**: the plan's actions, `uds check`'s verdict and
  exit code, and `uds audit --score` are exactly what they were. `uds audit --score` does not read the finding.
- `--add-standard` needs `--plan` or `--apply`. It is recorded in `manifest.standards`, so a later `uds update
  --apply` keeps it (a file the manifest does not list is treated as surplus). A second `--plan` shows no change,
  and `uds update --rollback` removes it again (the manifest goes back with it).
- An unknown id exits non-zero and lists the closest ids. An id that is already installed says so and exits 0.
  `extension`, `integration` and `template` ids are refused with the reason.
