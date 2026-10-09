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

## After every release | 發布後自動驗收（XSPEC-471 R1）

`.github/workflows/post-publish-acceptance.yml` runs this same program against the **published** package on `ubuntu-latest`, `macos-latest` and `windows-latest` (Windows from PowerShell, cmd and Git Bash, labels `ci-windows`, `ci-windows-cmd`, `ci-windows-gitbash`). It is a separate workflow so that it can never turn a published release red or stop a publish.
`.github/workflows/post-publish-acceptance.yml` 在 `ubuntu-latest`、`macos-latest`、`windows-latest` 對**已發布的套件**跑同一支程式（Windows 從 PowerShell、cmd、Git Bash 各跑一次）。它是獨立的流程，所以不會讓已發布的版本變紅，也不會擋住發布。

- **When it starts | 何時啟動**: after "Publish to npm" finished with `success` for a **release** (a manual start of the publish workflow is ignored: nothing is published then); or by hand — Actions → "Post-publish acceptance" → Run workflow, or `gh workflow run post-publish-acceptance.yml -f version=6.14.0-beta.7`. The version is read from `cli/package.json` of the released commit, or typed; it is never written in the workflow. For an **old** version also pass `-f ref=<its tag>`: the programs still come from the branch, only `steps.json` is taken from that tag (otherwise the branch's list has steps for features that version does not have). Do not pass `ref` for a version that is current on `main`.
- **Waiting for npm | 等 npm**: `wait-for-npm.mjs` asks the registry until the version document and its tarball answer (default limit 20 minutes, every 15 seconds). No fixed wait. If it never appears the job fails with "package not published, not a platform failure | 套件未上架，不是平台失敗"; if the registry itself cannot be asked it says that instead (exit 2), because that is not proof the package is missing.
- **Result | 結果**: each job's summary shows passed / failed / manual items not confirmed and lists every failed step (`ci-summary.mjs`). A failed automated step makes that job red. `human-*` steps are never answered in CI (`--non-interactive`): they are listed as *not confirmed* and are not failures. The report is uploaded as the artifact `acceptance-<label>-<version>` (kept 90 days).
- **Into the repository | 放進 repository**: CI commits nothing. After a run:

```bash
node scripts/beta-acceptance/fetch-ci-reports.mjs --version 6.14.0-beta.7   # needs gh, logged in
git status                                                                  # review, then commit the files yourself
```

It takes the newest artifact of each label for exactly that version, refuses a report that is for another version or was not installed from the npm registry, writes `.json` and `.md` into `reports/<version>/` (the file name gets the job label in front, `ci-windows__uds-beta-acceptance-…`, because three Windows jobs can finish in the same second), and (when the version is the one in `cli/package.json`) regenerates `docs/PRE-RELEASE.md`. Several reports of one platform are possible (Windows has three shells); the PRE-RELEASE generator currently shows the newest one per platform.

## Before a stable release | 升正式版的關卡（XSPEC-471 R5）

`node scripts/bump-version.mjs 6.14.0` (a version with **no** pre-release mark) first runs `lib/stable-gate.mjs`, before it changes any file and before the bundle-parity check. A preview version (`6.14.0-beta.8`) is not checked. If anything below is not true it exits 1 and prints **every** missing item in one list, so one run tells you all of it.
`bump-version.mjs` 遇到**不帶**預覽標記的版號時，在改動任何檔案、也在 bundle-parity 檢查之前，先跑 `lib/stable-gate.mjs`。預覽版號不檢查。下列任何一項不成立就以 1 結束，並一次列出**全部**缺項。

1. **A preview of this x.y.z exists, and it is the newest one.** The newest pre-release of the same `x.y.z` among the `## [x.y.z-beta.N]` headings of `CHANGELOG.md` and the version in `cli/package.json`. CHANGELOG is used because it is the project's own release record: no network, the same answer on every machine. The reports folder alone could not decide it, because a preview nobody ran the acceptance for would be skipped and an older accepted one would stand in. A version with no preview of its own (a patch released without one) is refused: nothing was accepted for it.
2. **`reports/<that preview>/` has a report for Windows, macOS and Linux from the published package** (`uds.installKind` is `npm-registry`, same version). A report made with `--local-bin`, `--source` or an injected installer is never counted; if it is all a platform has, the platform is missing and the report is named. This is `eligibleReports` of `lib/pre-release-doc.mjs`, the rule the "Verified on" table uses.
3. **No automatic step failed, in any shell.** The newest run of each label stands for that label (a re-run replaces it); a platform with several labels (Windows: `ci-windows`, `ci-windows-cmd`, `ci-windows-gitbash`) is judged by **every** label, so the worst one decides. A run that tested nothing, or could not run, is not an acceptance.
4. **`check-cli-coverage.mjs` and `check-steps.mjs` exit 0.** Exit 2 ("could not measure") is a refusal, not a pass.
5. **`coverage-baseline.json` is empty.** The ratchet lets a non-empty baseline pass; a stable release does not.
6. **No exemption in `steps.json` says the feature is known broken.** The wording is **`Known broken: ...`** (or `已知壞掉`) at the start of the `reason`; write it that way when a step cannot be written because the feature does not work (XSPEC-471 R4: a step is never written to fit a broken behaviour). The exemption lets the preview ship and this gate holds the stable release until the feature is fixed or the option is removed.

7. **Every step of the current `steps.json` that applies to a platform is in the counted report of every label of that platform.** A step added after the preview was published has not run against a published package, so a newer preview is needed: publish one, and the post-publish acceptance runs all steps on the three platforms by itself. The refusal says how many steps and the first few ids.

Printed but never blocking: the manual (`human-*`) steps nobody confirmed, per platform, and the report files that were not counted.

**There is no switch to skip the gate**, and `SKIP_BUNDLE_PARITY` does not reach it. Everything it asks for can be produced by the post-publish workflow in minutes (a patch is released as a preview first), and a switch is the thing that was skipped before: the manual Windows run nobody did. To see what it would say without bumping anything: `node scripts/beta-acceptance/check-stable-gate.mjs <x.y.z>` (exit 0 = would pass, 1 = would refuse and why).
**沒有跳過關卡的開關**，`SKIP_BUNDLE_PARITY` 也管不到它。它要的東西都能由發版後的流程在幾分鐘內產生（修補版先以預覽版發出）；而開關正是過去被跳過的那種東西：沒人去跑的手動 Windows 驗收。
