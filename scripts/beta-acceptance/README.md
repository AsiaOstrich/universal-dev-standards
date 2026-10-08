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

## PRE-RELEASE.md | 發版說明

`generate-pre-release.mjs` writes two blocks of `docs/PRE-RELEASE.md`: "What to test" from `steps.json`, and "Verified on" from the reports in `reports/<version>/*.json` (published package, that version). A platform with no report says "not yet verified". CI runs it with `--check`.

```bash
node scripts/beta-acceptance/generate-pre-release.mjs          # rewrite
node scripts/beta-acceptance/generate-pre-release.mjs --check  # fail if the file differs
```

After a release, copy each machine's `.json` report into `reports/<version>/` and run the generator.
