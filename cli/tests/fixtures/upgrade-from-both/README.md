# Fixtures: the manifest a real UDS writes for `uds init --format both`

Each `manifest.json` here is **not hand-written and not edited**. It is the file `.standards/manifest.json`
that a published npm package produced for a project made with `uds init --yes --format both`. They exist so
tests can run the *current* CLI against a `--format both` project an *older* UDS set up (dev-platform XSPEC-483
R3: such a project's upgrade plan must not delete the AI copy of any standard).

| Directory | Package | Package integrity | `manifest.json` sha256 | Generated |
|---|---|---|---|---|
| `6.11.0/` | `universal-dev-standards@6.11.0` | `sha512-67CIJ56JMmk9zM3/8ADR5CDcLmPBk2alMC775kkvNz65vDXSw8oODApR0s58euFNbhKICvYv9IB7Ujh5Cn7+Sw==` | `a0f1f45446c6e25094b319a68cc7dab4daefe6f85844e3dbcbb064fa8ce7452c` | 2026-10-13 |
| `6.14.0-beta.14/` | `universal-dev-standards@6.14.0-beta.14` | `sha512-wnAGKzf5/+q7uUzbJgble+qaxraJqJIMQymAjq99t68ZKXmWvr4sDXV2sdRptn/GSMXajqBuDbFtIYU8tSe0GA==` | `0d9f7dc3559e62b4d6b0368393040aebf4e5344066c4f50abc4e379565de3f20` | 2026-10-13 |

(The task named 6.14.0-beta.14; the XSPEC-483 text says beta.12, whose manifest has the same shape.)

## How they were produced

```sh
mkdir v && cd v && npm init -y && npm install universal-dev-standards@<version>

mkdir ../proj && cd ../proj && mkdir .claude && git init -q .      # `.claude/` makes Claude Code the detected tool
HOME=<empty dir> node ../v/node_modules/.bin/uds init --yes --format both --skills-location project
cp .standards/manifest.json <this directory>/<version>/manifest.json
```

## What they hold

- `format: "both"`, `version: "3.3.0"` (the form `init` wrote before XSPEC-482 R6), and `standards` in path form: for every
  standard one `ai/standards/<id>.ai.yaml` entry **and** one `core/<name>.md` entry (and the same pair for every option).
  That pair list is what the tests count: it says which files the old install put on disk, independently of the reconciler.
- The `.standards/` files themselves are not stored (about 2 MB each). `tests/utils/xspec-483.js` copies the files the manifest
  names from this repository, so the project looks like an installed one whose version is behind.

## Using them

Copy a manifest into a throwaway project's `.standards/` — never point a test at the file itself: reading a manifest can rewrite
it, and a fixture a test edits is no longer the file the old UDS wrote. To regenerate with another version, repeat the steps above
and update the table.
