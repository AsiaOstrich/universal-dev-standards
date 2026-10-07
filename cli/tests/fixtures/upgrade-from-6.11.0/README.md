# Fixture: the manifest a real UDS 6.11.0 `init` writes

`manifest.json` here is **not hand-written and not edited**. It is the file
`.standards/manifest.json` that the published npm package `universal-dev-standards@6.11.0`
produced. It exists so tests can run the *current* CLI against a project that an *older* UDS set up
(dev-platform XSPEC-458 R4: an upgrade test needs a real old manifest, because a hand-written one
contains only what its author remembered to write).

| | |
|---|---|
| Package | `universal-dev-standards@6.11.0` |
| Package integrity | `sha512-67CIJ56JMmk9zM3/8ADR5CDcLmPBk2alMC775kkvNz65vDXSw8oODApR0s58euFNbhKICvYv9IB7Ujh5Cn7+Sw==` |
| Generated | 2026-10-07 |
| File | `manifest.json`, sha256 `35d9e0e6cd7014cead07ef10ade82a0f8a75c4d81c6524b2378e8aa78bae70a3` |

## How it was produced

```sh
mkdir v611 && cd v611 && npm init -y && npm install universal-dev-standards@6.11.0

mkdir ../proj && cd ../proj && mkdir .claude && git init -q .      # `.claude/` makes Claude Code the detected tool
HOME=<empty dir> XDG_CONFIG_HOME=<empty dir>/.config UDS_NO_UPDATE_CHECK=1 \
  node ../v611/node_modules/.bin/uds init --yes --content-mode minimal --skills-location project
cp .standards/manifest.json <this directory>/manifest.json
```

## What it is, and what the report asked for

The user report that led to XSPEC-458 described a project at "level 2, `contentMode: minimal`".
Both are in this file, so the fixture matches the report:

- **`contentMode: minimal`** — top-level field (`--content-mode minimal`). Live: it decides how the
  integration file (CLAUDE.md) is rendered. It does not decide which standards are installed.
- **`level: 2`** — found at `integrationConfigs["CLAUDE.md"].level`. It is a leftover snapshot of the
  tier-derived number used when the file was generated; no code reads it to choose standards, and the
  manifest has no top-level `level`. There is **no `profile` field** anywhere. (See
  `src/utils/available-standards.js` for the R1 finding.)

Contents worth knowing: 73 entries in `standards` (path format, `ai/standards/<id>.ai.yaml`, plus option
paths), `deferred-item-exit` present, **`open-work-tracking` absent** (it was added to the registry after
6.11.0 shipped). That absence is exactly the situation the XSPEC-458 scenarios describe.

## Using it

Copy it into a throwaway project's `.standards/` — never point a test at this file itself. Reading a
manifest can rewrite it (`migrateAndBackfill`), and a fixture that a test edits is no longer the file
6.11.0 wrote. The manifest alone is enough for `uds update --plan` to run; the standard files it names
are not needed for the lists under test (missing ones simply show as "create" in the plan).

To regenerate with another version, repeat the steps above and update the table.
