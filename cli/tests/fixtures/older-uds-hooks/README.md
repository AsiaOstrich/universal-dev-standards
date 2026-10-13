# Fixture: the pre-commit hooks that real older UDS releases write

These three files are **not hand-written and not edited**. Each is the hook file that a published npm package
produced, copied byte for byte. They exist so tests can run the *current* CLI against a project that an *older*
UDS set up (dev-platform XSPEC-482 R3 and R5: a hook that lets every commit through must be recognised by the
exact text the old release wrote, and a hand-written copy contains only what its author remembered).

| File | Written by | Package integrity | sha256 |
|---|---|---|---|
| `native-6.11.0.pre-commit` | `universal-dev-standards@6.11.0`, `uds init` in a git repo with no `package.json` | `sha512-67CIJ56JMmk9zM3/8ADR5CDcLmPBk2alMC775kkvNz65vDXSw8oODApR0s58euFNbhKICvYv9IB7Ujh5Cn7+Sw==` | `ad58d48277155c99518e9b6f78237146965f277acf50353a8d8bc28f8a091267` |
| `native-6.14.0-beta.12.pre-commit` | `universal-dev-standards@6.14.0-beta.12`, same command | `sha512-WKJ++e5SYCL5Lo5C5pqDrOVYRcJkjx33Axfx9O8e01P1XqiR5NdgsCcCViM3tHFUFrK+nP8+9wvLM3ahF8YjEQ==` | `7a6b4c8ce4648029563b47ec905fc6fa2e817b9ffc38e68a9a02e08918ba5255` |
| `husky-6.14.0-beta.12.pre-commit` | `universal-dev-standards@6.14.0-beta.12`, `uds init` in a git repo with a `package.json` | (same as above) | `ebd0fb98ac66ac86a797aa90c914a3b66f95c55610f5e233ae1353d300120f38` |

Generated 2026-10-13 with:

```sh
mkdir v && cd v && npm init -y && npm install universal-dev-standards@<version>
mkdir ../proj && cd ../proj && git init -q . && node ../v/node_modules/.bin/uds init --yes --skills-location project
cp .git/hooks/pre-commit <this directory>/native-<version>.pre-commit      # no package.json
# for the husky file: put {"name":"x","version":"1.0.0"} in package.json before `uds init`, then copy .husky/pre-commit
```
(HOME, XDG_* and GIT_CONFIG_GLOBAL pointed at an empty directory, `UDS_NO_UPDATE_CHECK=1`.)

## What each one does

- `native-6.11.0.pre-commit` ends in `uds check 2>/dev/null || true`: the `uds` that PATH happens to find, errors
  thrown away, "Pre-commit checks passed" printed whatever happened. The same text is written by 6.12.0 and 6.13.x
  (`git show v6.13.1:cli/src/commands/init.js`).
- `native-6.14.0-beta.12.pre-commit` and the `# UDS Standard Check` block of `husky-6.14.0-beta.12.pre-commit`
  run `universal-dev-standards check` without `--ci`: the installed CLI, but `check` exits 0 when a standard file
  was edited, so the commit goes through.
