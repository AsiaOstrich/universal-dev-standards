# Beta acceptance | 測試版驗收

Maintainer tooling. **Not part of the npm package** (the package ships `cli/` only; `cli/scripts/prepack.mjs` copies nothing from here, and `cli/package.json` `files` does not list this folder). Standard library only, no `npm install` needed.
維護者工具，**不進 npm 套件**；只用 Node 標準庫，不需要 `npm install`。

dev-platform XSPEC-469.

## Run it | 執行

```bash
node scripts/beta-acceptance/run.mjs --version 6.14.0-beta.7
```

The same line works in PowerShell, cmd, Git Bash, zsh and bash (Node 20+, network for the install). It

1. installs `universal-dev-standards@<version>` from npm into a throwaway folder (the **published** package, not the repository source),
2. runs every step of `steps.json` that applies to this OS, each in its own folder with its own throwaway home (the real home folder is never touched),
3. writes `uds-beta-acceptance-<version>-<os>-<time>.md` (to read and paste back) and `.json` (to compare) to `./uds-beta-acceptance-reports/`.

| exit | meaning |
|---|---|
| 0 | at least one step passed and none failed (manual items nobody answered are listed as *unconfirmed* and are not counted as passed) |
| 1 | at least one step failed |
| 2 | could not run (bad arguments, install failed, wrong version installed, unreadable steps file) |
| 3 | **zero steps passed** — nothing was shown to work, which is not a pass |

Items that need a person's eyes (for example Chinese text in a cp950 console) are asked in the terminal. Without a terminal, put the answers in a file: `--answers answers.json` with `{"human-chinese-display": "yes"}`. No answer = *unconfirmed*.

Options are listed at the top of `run.mjs`. Three are for the people who write steps and for the tests, and the report says which was used:
`--source <tarball|folder>` (install that, offline), `--installer <module>` (inject the install step), `--local-bin <uds.js>` (no install at all — **not** the published package; the PRE-RELEASE generator ignores such a report).

## The list | 清單

`steps.json` is the one list. Each step has an id, English and Chinese titles, the CHANGELOG entries it tests (`changelog`: how the entry begins, at least 20 characters), a platform (`all`, `windows`, `macos`, `linux`), one command (`uds`: arguments for the installed uds; `shim`: the installed `uds` command itself; `run`: any program; `inspect`: read files only) and what must hold afterwards (`expect`: exit code, text the output must / must not contain, regular expressions, files to read back). `human` marks a step that also needs a person. `prepare` sets the step up before the command runs: `writeFile` (with `"in": "home"` for the throwaway home, `"executable": true` for a script), `removeFile`, `mkdir`, `gitInit`, `git` (any git command in the step folder), and for a project `uds init` made: `forgetStandard`, `setManifest`, `manifestPush` (make it look like a project set up by an older UDS). Text in a step may use `{work}`, `{home}`, `{pkg}`, `{shipped}` (the standards, skills and locale docs the package ships), `{node}`, `{bin}` and the forward-slash forms `{workPosix}`, `{homePosix}`, `{nodePosix}`, `{binPosix}`. A step that does not test a CHANGELOG entry says `"smoke": true`.

`check-steps.mjs` (CI job *Beta Acceptance Coverage*) fails when an entry under `## [Unreleased]` in `CHANGELOG.md` has no step and no `exemptions` item with a reason, or when a step names an entry that does not exist. **The key is how the entry begins**: rewording the tail of an entry changes nothing; rewording its start turns both the entry and the step red, each named.

```bash
node scripts/beta-acceptance/check-steps.mjs
```

## Every command and option has a step | 每個指令與選項都要有步驟

dev-platform XSPEC-471 R2, R3.

`check-cli-coverage.mjs` (the same CI job) lists **every command, subcommand and option of the real CLI** and fails, naming each one, when no step uses it.

```bash
cd cli && npm ci && cd ..                                    # the check loads cli/bin/uds.js, which imports its dependencies
node scripts/beta-acceptance/check-cli-coverage.mjs
```

- **Where the list comes from.** `dump-cli-tree.mjs` loads `cli/bin/uds.js` with `parse()` replaced by a function that only records the commander program, so the list is what the real binary builds: hidden commands, hidden options and aliases are in it, and so are the commands another module registers (`mcp`, `mcp serve` come from `mcpCommand(program)` and are not named in `bin/uds.js`). Nothing is read from help text or from source text. If `parse()` is never reached it exits 2, never an empty list.
- **Names.** A command is its path (`init`, `spec create`); an option is its owner and its long flag (`init --mode`, `grp sub --deep`; the program's own are owned by `uds`: `uds --ui-lang`). `-h/--help` and the `help` command are not listed: commander adds them to every command.
- **What counts as "a step uses it".** The arguments a step gives the installed uds (`uds`, `shim`, or the words after `{bin}` in a `run` step) name it. An alias uses its command; `-m`, `--mode full` and `--mode=full` use `--mode`; a group is used when a step runs one of its subcommands; `init --help` uses `init` and nothing else. Option *values* and positional arguments are not tracked.
- **Exemptions** go in `steps.json` `exemptions`, with a reason of at least 20 characters (a blank or one-word reason leaves the item missing):
  `{"command": "spec create", "reason": "..."}`, `{"option": "init --mode", "reason": "..."}`.
  They are counted as *exempt*, not as *used*. An exemption for something the CLI does not have, or that a step already uses, fails.
- **The baseline** `coverage-baseline.json` lists the gaps that existed when the check was added. It **only shrinks**: a gap that is in neither a step, an exemption nor the baseline fails as NEW; a baseline entry that a step now uses, an exemption now covers, or the CLI no longer has fails too ("must be removed"), so the file cannot rot. `--shrink-baseline` removes those entries and never adds one; `--baseline-not-larger-than <ref>` (CI passes the branch the change goes into) fails when the file holds an entry the file at `<ref>` did not. R4 empties it; R5 refuses a stable release until it is empty.

R3: `check-steps.mjs` also fails, naming the step, when a step's `expect` has only an exit code (no `contains`, `matches` or `files`; `notContains` alone does not count). A person's (`human`) step is held to the same rule. `{"step": "<id>", "reason": "..."}` in `exemptions` allows one step to check only its exit code, with the same reason rule.

## PRE-RELEASE.md | 發版說明

`generate-pre-release.mjs` writes two blocks of `docs/PRE-RELEASE.md`: "What to test" from `steps.json`, and "Verified on" from the reports in `reports/<version>/*.json` (published package, that version). A platform with no report says "not yet verified". CI runs it with `--check`.

```bash
node scripts/beta-acceptance/generate-pre-release.mjs          # rewrite
node scripts/beta-acceptance/generate-pre-release.mjs --check  # fail if the file differs
```

After a release, copy each machine's `.json` report into `reports/<version>/` and run the generator.
