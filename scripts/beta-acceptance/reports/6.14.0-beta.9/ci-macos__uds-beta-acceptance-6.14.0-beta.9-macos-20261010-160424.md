# UDS beta acceptance report | 測試版驗收報告

**Result | 結果：PASS (automated steps only; some manual items unconfirmed) — 自動步驟通過；有人工項目尚未確認**

| | |
|---|---|
| UDS version 版本 | `6.14.0-beta.9` (asked for 要求：`6.14.0-beta.9`) |
| Install source 安裝來源 | npm-registry (the published package 已發布的套件) |
| Label 標籤 | ci-macos |
| OS 作業系統 | macos — Darwin 25.6.0 (arm64); Darwin Kernel Version 25.6.0: Fri Jul 31 19:16:43 PDT 2026; root:xnu-12377.161.14~5/RELEASE_ARM64_VMAPPLE |
| Shell 殼層 | bash (SHELL variable) |
| Node / npm | v20.20.2 / 10.8.2 |
| Windows code page 編碼頁 | 不適用（非 Windows） |
| Started 開始 | 2026-10-10T16:03:05.236Z (79 s) |

**Counts 數量**：planned 246; passed 238; failed 0; skipped (other platform) 1; manual confirmed 0; **manual NOT confirmed 7** (not counted as passed 不計入通過)

## Steps | 各步驟

| # | step 步驟 | result 結果 | exit |
|---|---|---|---|
| 1 | `smoke-version` — The installed uds command starts and prints its version | pass 通過 | 0 |
| 2 | `smoke-shim` — The `uds` command that npm put on the path (uds.cmd on Windows) starts | pass 通過 | 0 |
| 3 | `available-init` — uds init sets up a project (the project the next steps use) | pass 通過 | 0 |
| 4 | `std-open-work-states` — The installed open-work-tracking standard defines the two waiting states and the hand-written-fact rules (OWT-020 to OWT-026) | pass 通過 | 0 |
| 5 | `std-open-work-cross-project` — The installed open-work-tracking standard lets a wait name an object in another project (OWT-027 to OWT-029) | pass 通過 | 0 |
| 6 | `std-open-work-waiting-on-reply` — The installed open-work-tracking standard is 1.4.0 and names waiting-on-reply | pass 通過 | 0 |
| 7 | `std-open-work-summary` — The installed open-work-tracking standard explains who produces the OWT-007 summary | pass 通過 | 0 |
| 8 | `std-memory-boundary` — The installed developer-memory and project-context-memory standards carry the boundary section | pass 通過 | 0 |
| 9 | `error-exit-hint-init` — uds init --yes in a project with source code (prepares the error-exit hint steps) | pass 通過 | 0 |
| 10 | `error-exit-hint-in-english` — uds check in an English project says the missing error-exit gate in English, not Chinese | pass 通過 | 0 |
| 11 | `available-check-line` — uds check prints one line when UDS ships a standard the project does not have | pass 通過 | 0 |
| 12 | `available-audit-friction` — uds audit --friction lists the missing standard as one low-severity finding | pass 通過 | 0 |
| 13 | `available-audit-report-held-back` — uds audit --report does not send the missing-standard finding to the maintainers | pass 通過 | 0 |
| 14 | `available-plan` — uds update --plan ends with the standards available upstream and not installed | pass 通過 | 0 |
| 15 | `available-unknown-id` — uds update --add-standard with an unknown id exits 1 and offers the nearest ids | pass 通過 | 1 |
| 16 | `available-add-standard` — uds update --apply --add-standard installs the standard and records it in the manifest | pass 通過 | 0 |
| 17 | `available-clean-after-add` — uds check --ci then reports nothing left to install, and the standard survives the next apply | pass 通過 | 0 |
| 18 | `available-rollback` — One uds update --rollback takes the added standard out again | pass 通過 | 0 |
| 19 | `psg-add-standard` — pipeline-security-gates 1.1.0 installs with the scanner behaviours PSG-1 to PSG-3 | pass 通過 | 0 |
| 20 | `legacy-update-init` — uds init sets up a project (the project the next step uses) | pass 通過 | 0 |
| 21 | `legacy-update-messages` — uds update on a project from an older UDS says "upstream has them, this project does not" (no "level"), and tells how to update skills | pass 通過 | 0 |
| 22 | `skills-two-ways` — uds skills ends with the two ways to install UDS skills side by side and calls neither deprecated | pass 通過 | 0 |
| 23 | `personal-skill-init` — uds init --skills-location project ends by naming a personal skill that covers a UDS skill | pass 通過 | 0 |
| 24 | `personal-skill-check` — uds check names the same collision, says how to fix it, and still reports the project as compliant | pass 通過 | 0 |
| 25 | `personal-skill-update` — uds update --apply --skills ends with the same warning | pass 通過 | 0 |
| 26 | `double-install-init` — uds init sets up a project with the UDS skills in it | pass 通過 | 0 |
| 27 | `double-install-check` — uds check warns that the UDS skills are installed twice (project and plugin) without changing the verdict | pass 通過 | 0 |
| 28 | `docs-install-skills` — The shipped Traditional Chinese getting-started guide has the "how to install skills" section | pass 通過 | 0 |
| 29 | `docs-personal-skill` — The shipped guide and the skill naming rules explain which skill runs when two share a name | pass 通過 | 0 |
| 30 | `owt-self-test` — uds open-work self-test passes (its own red and green samples) | pass 通過 | 0 |
| 31 | `owt-waiting-states` — uds open-work waiting tells "not yet asked" from "asked, awaiting a reply" and shows the age | pass 通過 | 0 |
| 32 | `owt-waiting-violation` — uds open-work waiting exits 1 for a not-yet-asked item that names no draft | pass 通過 | 1 |
| 33 | `owt-observations` — uds open-work observations counts unknown apart, shows every age and marks an old observation stale | pass 通過 | 0 |
| 34 | `owt-cross-project-root` — uds open-work waiting --root NAME=DIR reads a wait on another project: released, or not yet released | pass 通過 | 0 |
| 35 | `owt-cross-project-config` — open_work.projects in uds.project.yaml says where the other project lives, without --root | pass 通過 | 0 |
| 36 | `owt-next-action-words` — uds open-work next-action reads the column headed 下一個動作 | pass 通過 | 0 |
| 37 | `owt-next-action-declared-word` — uds open-work next-action --next-action-word adds a word of your own | pass 通過 | 0 |
| 38 | `owt-next-action-exit-2-explains` — uds open-work next-action exits 2 and says why when no field was found | pass 通過 | 2 |
| 39 | `owt-next-action-glab` — uds open-work next-action reads `glab mr merge 486` as a command | pass 通過 | 0 |
| 40 | `owt-waiting-on-reply` — uds open-work next-action accepts a complete asked-awaiting row as waiting-on-reply and exits 0 | pass 通過 | 0 |
| 41 | `owt-blank-field-waiting` — uds open-work waiting does not read a blank release as filled by the Next action line under it | pass 通過 | 1 |
| 42 | `owt-blank-field-next-action` — The same list item is still a violation for uds open-work next-action (exit 1) | pass 通過 | 1 |
| 43 | `beta6-init` — uds init sets up a project (the project the next steps use) | pass 通過 | 0 |
| 44 | `beta6-simulate-no-verdict` — uds simulate -s anti-hallucination: no simulator, exit 2, and not called "Simulation Failed" | pass 通過 | 2 |
| 45 | `beta6-simulate-pass` — uds simulate -s commit-message on a compliant message exits 0 | pass 通過 | 0 |
| 46 | `beta6-simulate-fail` — uds simulate -s commit-message on a non-compliant message exits 1 and says what is wrong | pass 通過 | 1 |
| 47 | `beta6-skills-all` — uds skills lists every installed skill: the two numbers in "N / N" are equal | pass 通過 | 0 |
| 48 | `beta6-update-drops-ghost-names` — uds update --apply removes skill and command names UDS cannot vouch for from the manifest, and keeps its backup in the one .uds-backups folder | pass 通過 | 0 |
| 49 | `beta6-run-trailing-comment` — uds run test shows and runs the command without the trailing "# comment" of uds.project.yaml | pass 通過 | 0 |
| 50 | `beta6-run-dry-run` — uds run test --dry-run prints the command without the comment | pass 通過 | 0 |
| 51 | `beta6-spec-list-sdd` — uds spec list reads the status and title of an SDD spec instead of calling it a draft with an empty title | pass 通過 | 0 |
| 52 | `beta6-deps-needs-package-json` — uds deps with no package.json still exits 1 | pass 通過 | 1 |
| 53 | `beta6-deps-if-present` — uds deps --if-present exits 0 and says nothing was checked | pass 通過 | 0 |
| 54 | `commit-warning-init` — uds init sets up a project with the git pre-commit hook | pass 通過 | 0 |
| 55 | `commit-warning-hook` — A commit that changes code and no test prints the test-change warning from the git hook and still goes through | pass 通過 | 0 |
| 56 | `human-commit-warning-display` — The commit-time warning reads correctly in this shell (Git Bash on Windows: no garbled characters) | unconfirmed 待人確認（未確認） | 0 |
| 57 | `human-chinese-display` — Traditional Chinese text is readable in this console (no ???? or empty boxes) | unconfirmed 待人確認（未確認） | 0 |
| 58 | `init-default-skills-into-project` — uds init --yes installs the UDS skills into the project (.claude/skills) by default, with no word of the plugin as the way | pass 通過 | 0 |
| 59 | `init-default-skills-check` — uds check --ci finds the skill files that uds init --yes installed intact | pass 通過 | 0 |
| 60 | `init-plugin-writes-no-skill-files` — uds init --yes --skills-location marketplace writes no skill file and says the skills come from the plugin and how to move them into the project | pass 通過 | 0 |
| 61 | `init-chinese-skill-texts-no-tool-marker` — uds init --yes --locale zh-tw in a folder with no AI tool marker installs the Chinese skill texts from the package, with no locale warning | pass 通過 | 0 |
| 62 | `init-help-default-is-project` — uds init --help names the project as the default of --skills-location | pass 通過 | 0 |
| 63 | `init-locale-pack-missing-is-said` — A copy of UDS without the zh-TW skill texts installs English for --locale zh-tw and says so, names the fix, and does not blame the network | pass 通過 | 0 |
| 64 | `human-init-enter-installs-skills` — Run uds init in your own terminal and press Enter at every question: the skills end up in the project | unconfirmed 待人確認（未確認） | 0 |
| 65 | `human-init-keeps-open-work` — uds init that updates an existing uds.project.yaml keeps the open_work section exactly as it was | unconfirmed 待人確認（未確認） | 0 |
| 66 | `transient-lock-copy-retries` — uds init finishes when one file is locked for a moment (two EBUSY errors, then free): the copy is retried and the file lands intact | pass 通過 | 0 |
| 67 | `transient-lock-gives-up-in-plain-words` — uds init stops after a bounded number of tries (at most ten) when a file stays locked, rolls back, and names the file, the likely cause (antivirus) and what to do | pass 通過 | 1 |
| 68 | `tautology-init` — uds init sets up a project with the fake-test scanner in scripts/ | pass 通過 | 0 |
| 69 | `tautology-scan` — The scanner names a test whose expected value is the same call or is re-added from the same input, and leaves a hand-computed example alone | pass 通過 | 1 |
| 70 | `std-merge-danger` — The installed code-review standard asks for the merge danger (door and blast radius) and names the one-way door rule | pass 通過 | 0 |
| 71 | `audit-init` — a project set up for the audit steps | pass 通過 | 0 |
| 72 | `audit-health-only` — uds audit --health runs the health layer only and reports intact files | pass 通過 | 0 |
| 73 | `audit-format-json` — uds audit --format json prints the audit result as JSON | pass 通過 | 0 |
| 74 | `audit-quiet` — uds audit --quiet prints the one-line summary | pass 通過 | 0 |
| 75 | `audit-score` — uds audit --score prints the health score with its four dimensions | pass 通過 | 0 |
| 76 | `audit-score-self` — uds audit --score --self runs in self mode | pass 通過 | 0 |
| 77 | `audit-score-format-json` — uds audit --score --format json prints the score as JSON | pass 通過 | 0 |
| 78 | `audit-score-ci-threshold-met` — uds audit --score --ci --threshold 0 prints only the score and exits 0 | pass 通過 | 0 |
| 79 | `audit-score-ci-threshold-missed` — uds audit --score --ci --threshold 101 prints only the score and exits 1 (no score reaches it) | pass 通過 | 1 |
| 80 | `audit-score-save` — uds audit --score --save writes a score snapshot under .uds/health-scores | pass 通過 | 0 |
| 81 | `audit-score-trend` — uds audit --score --trend lists the saved snapshot with its date and score | pass 通過 | 0 |
| 82 | `audit-patterns-only` — uds audit --patterns names the standards a project's folders and files suggest | pass 通過 | 0 |
| 83 | `audit-effects-finding` — uds audit --effects --effects-config <file> exits 1 and names an implementation that reaches nothing outside the process | pass 通過 | 1 |
| 84 | `audit-effects-clean-json` — uds audit --effects --format json exits 0 with exitCode 0 in the JSON when every implementation reaches the outside | pass 通過 | 0 |
| 85 | `audit-effects-config-missing` — uds audit --effects --effects-config <missing file> exits 2 and names that file (not "clean") | pass 通過 | 2 |
| 86 | `audit-health-missing-file` — uds audit --health reports a standard file that the manifest lists and the folder lacks | pass 通過 | 0 |
| 87 | `config-set-project` — uds config set <key> <value> writes the project configuration file | pass 通過 | 0 |
| 88 | `config-get` — uds config get <key> reads the value a later process wrote | pass 通過 | 0 |
| 89 | `config-list` — uds config list prints the merged configuration as JSON | pass 通過 | 0 |
| 90 | `config-yes-shows-configuration` — uds config --yes (no action) prints the configuration without asking | pass 通過 | 0 |
| 91 | `config-set-global` — uds config set <key> <value> --global writes the user-level file, not the project file | pass 通過 | 0 |
| 92 | `config-get-reads-global` — uds config get finds the value that --global wrote in an earlier run | pass 通過 | 0 |
| 93 | `hitl-check-blocks-in-noninteractive` — uds hitl check denies an operation above the threshold when no one can answer (exit 1, not a crash with exit 0) | pass 通過 | 1 |
| 94 | `hitl-check-requires-op` — uds hitl check without --op says it is required and exits 2 (not 0) | pass 通過 | 2 |
| 95 | `hitl-config-raises-threshold` — uds config set hitl.threshold 4 --global is the setting uds hitl check reads next | pass 通過 | 0 |
| 96 | `hitl-check-approves-under-raised-threshold` — uds hitl check approves the same operation once the threshold is raised (exit 0) | pass 通過 | 0 |
| 97 | `config-init-vibe-mode` — uds config init --vibe-mode --yes applies the balanced preset to the project configuration | pass 通過 | 0 |
| 98 | `config-init-project` — a project whose skills are not installed yet (skills location none) | pass 通過 | 0 |
| 99 | `config-type-skills` — uds config --type skills --ai-tool claude-code --skills-location project --yes installs the skills into the project | pass 通過 | 0 |
| 100 | `config-experimental` — uds config -E shows the experimental methodology line of the current configuration | pass 通過 | 0 |
| 101 | `configure-init-project` — a project whose skills are not installed yet (for uds configure) | pass 通過 | 0 |
| 102 | `configure-type-skills` — uds configure --type skills --ai-tool claude-code --skills-location project --yes installs the skills into the project | pass 通過 | 0 |
| 103 | `configure-experimental` — uds configure -E shows the experimental methodology line of the current configuration | pass 通過 | 0 |
| 104 | `agent-list` — uds agent list names the five shipped agents with a description line and their expertise | pass 通過 | 0 |
| 105 | `agent-info` — uds agent info <name> shows the agent's description, expertise, tools and skills | pass 通過 | 0 |
| 106 | `agent-install-project` — uds agent install <name> --yes copies the agent into .claude/agents of the project | pass 通過 | 0 |
| 107 | `agent-install-tool` — uds agent install <name> --tool opencode --yes copies the agent to the folder that tool reads | pass 通過 | 0 |
| 108 | `agent-install-global` — uds agent install <name> --global --yes installs to the user level, not into the project | pass 通過 | 0 |
| 109 | `agent-list-installed` — uds agent list --installed counts the agents installed at project and user level for each tool | pass 通過 | 0 |
| 110 | `ai-context-init` — uds ai-context init --yes writes .ai-context.yaml with the modules found under src/ | pass 通過 | 0 |
| 111 | `ai-context-init-keeps-existing` — uds ai-context init --yes leaves an existing .ai-context.yaml alone | pass 通過 | 0 |
| 112 | `ai-context-init-force` — uds ai-context init --force --yes overwrites an existing .ai-context.yaml | pass 通過 | 0 |
| 113 | `ai-context-validate-valid` — uds ai-context validate accepts a configuration whose modules and documents exist | pass 通過 | 0 |
| 114 | `ai-context-validate-verbose` — uds ai-context validate --verbose also prints the whole configuration | pass 通過 | 0 |
| 115 | `ai-context-validate-invalid` — uds ai-context validate names what is wrong with a configuration | pass 通過 | 0 |
| 116 | `ai-context-graph` — uds ai-context graph lists the modules with their dependencies | pass 通過 | 0 |
| 117 | `ai-context-graph-mermaid` — uds ai-context graph --mermaid also prints a Mermaid diagram of the dependencies | pass 通過 | 0 |
| 118 | `release-help-manual` — uds release lists its subcommands in a project set to manual release mode | pass 通過 | 0 |
| 119 | `release-promote` — uds release promote <version> says it creates no promotion record and no tag, and lists the next steps for the person to run | pass 通過 | 0 |
| 120 | `release-promote-creates-no-tag` — After uds release promote, git tag --list in the project is still empty (the command creates no tag) | pass 通過 | 0 |
| 121 | `release-deploy-staging` — uds release deploy <env> records the deployment in deployments.yaml (config as uds generates it) | pass 通過 | 0 |
| 122 | `release-deploy-result` — uds release deploy <env> --result passed updates that deployment's recorded result | pass 通過 | 0 |
| 123 | `release-manifest-checksum` — uds release manifest --checksum <hash> writes build-manifest.json with the version, commit and checksum | pass 通過 | 0 |
| 124 | `release-verify-artifact` — uds release verify --artifact <file> checks the file against the recorded checksum and the commit, and shows the staging result | pass 通過 | 0 |
| 125 | `release-verify-wrong-artifact` — uds release verify --artifact <another file> reports the checksum mismatch and ends with exit code 1 | pass 通過 | 1 |
| 126 | `release-verify-missing-artifact` — uds release verify --artifact <a file that is not there> ends with exit code 2 (could not verify), not 0 | pass 通過 | 2 |
| 127 | `mcp-serve-answers-requests` — uds mcp serve starts, answers initialize, tools/list and the three design tools, and ends when its input ends | pass 通過 | 0 |
| 128 | `mcp-serve-root-option-is-refused` — uds mcp serve --root <path> is refused as an unknown option with exit code 1 (the option was removed) | pass 通過 | 1 |
| 129 | `list-every-counted-standard-is-shown` — The standards uds list shows add up to the Total it prints (it used to count 163 and show 81) | pass 通過 | 0 |
| 130 | `list-shows-every-category` — uds list has a heading for each of the ten categories, the five that used to be left out included | pass 通過 | 0 |
| 131 | `list-category-core` — uds list --category core lists the core standards (it used to refuse "core" as an unknown category) and nothing from the other categories | pass 通過 | 0 |
| 132 | `list-category-skill-filters` — uds list --category skill lists only the skill standards | pass 通過 | 0 |
| 133 | `list-category-unknown` — uds list --category with a name that is not a category exits 1 and names the valid ones, core included | pass 通過 | 1 |
| 134 | `lint-text-report` — uds lint names the spec with a broken depends_on and the spec that is too long, and exits 1 | pass 通過 | 1 |
| 135 | `lint-json-report` — uds lint --json prints the summary and one result per spec in the shape VibeOps reads | pass 通過 | 1 |
| 136 | `lint-no-specs-folder` — uds lint without a specs folder says nothing was scanned, in words | pass 通過 | 0 |
| 137 | `fix-standard-applies-fixer` — uds fix -s repairs a project that breaks a standard: the fixer's file appears and the standard then passes | pass 通過 | 0 |
| 138 | `fix-json-reports-fixed` — uds fix --json says "fixed" and the fixer's file is there | pass 通過 | 0 |
| 139 | `fix-needs-standard` — uds fix without --standard exits 1 and writes nothing | pass 通過 | 1 |
| 140 | `r4a-init` — uds init sets up a project (the project the simulate step uses) | pass 通過 | 0 |
| 141 | `simulate-json-pass` — uds simulate --json on a compliant commit message says success and exits 0 | pass 通過 | 0 |
| 142 | `simulate-json-fail` — uds simulate --json on a non-compliant commit message says what is wrong and exits 1 | pass 通過 | 1 |
| 143 | `report-adoption-table` — uds report turns hook telemetry into a per-standard table (executions, pass rate, average duration) and skips a damaged line | pass 通過 | 0 |
| 144 | `report-no-telemetry` — uds report with no telemetry file says there is no data instead of printing an empty table | pass 通過 | 0 |
| 145 | `deps-path-reports-drift` — uds deps --path reads another folder's package.json and names the dependency whose tested version is behind what its range resolves to | pass 通過 | 1 |
| 146 | `deps-json-output` — uds deps --json prints the measurement as JSON: examined, drifted (with locked and resolved) and clean | pass 通過 | 1 |
| 147 | `deps-concurrency-limits-lookups` — uds deps --concurrency 1 looks the dependencies up one at a time, not all at once | pass 通過 | 1 |
| 148 | `deps-default-looks-up-in-parallel` — uds deps without --concurrency looks the four dependencies up in parallel (the control for the step above) | pass 通過 | 1 |
| 149 | `spec-create-yes-confirms` — uds spec new (alias of create) --scope --output --yes writes a confirmed micro-spec with that scope into that folder | pass 通過 | 0 |
| 150 | `spec-list-status-filter` — uds spec ls --status draft --output lists only the draft micro-specs of that folder | pass 通過 | 0 |
| 151 | `spec-show-prints-spec` — uds spec show --output prints the micro-spec, and exits 1 for an id that is not there | pass 通過 | 0 |
| 152 | `spec-show-unknown-id` — uds spec show for an id that is not there exits 1 and names it | pass 通過 | 1 |
| 153 | `spec-confirm-marks-confirmed` — uds spec confirm --output turns a draft micro-spec into a confirmed one in its file | pass 通過 | 0 |
| 154 | `spec-archive-moves-to-archive` — uds spec archive --output moves the micro-spec into archive/ marked archived and records it in archive/index.json | pass 通過 | 0 |
| 155 | `spec-delete-yes-removes-file` — uds spec rm (alias of delete) --yes --output removes that micro-spec and leaves the other one | pass 通過 | 0 |
| 156 | `spec-delete-unknown-id` — uds spec delete --yes for an id that is not there exits 1 and deletes nothing | pass 通過 | 1 |
| 157 | `spec-delete-unknown-id-does-not-ask` — uds spec delete without --yes for an id that is not there says so and exits 1 without asking first | pass 通過 | 1 |
| 158 | `spec-search-finds-active-and-archived` — uds spec search --output finds the active micro-spec and the archived one by title and leaves the others out | pass 通過 | 0 |
| 159 | `spec-search-archived-only` — uds spec search --archived looks only in the archive | pass 通過 | 0 |
| 160 | `spec-split-too-few-criteria` — uds spec split --output refuses a micro-spec with fewer than two acceptance criteria and leaves it as it was | pass 通過 | 0 |
| 161 | `spec-split-unknown-id` — uds spec split --output for an id that is not there exits 1 | pass 通過 | 1 |
| 162 | `human-spec-split-in-a-terminal` — Split a micro-spec in your own terminal: choose which criteria move, and both specs end up pointing at each other | unconfirmed 待人確認（未確認） | 0 |
| 163 | `quickstart-without-terminal-shows-every-workflow` — uds quickstart with no terminal prints all four workflows with their commands (it used to end on a stack trace and exit 0) | pass 通過 | 0 |
| 164 | `spec-create-without-terminal-keeps-a-draft` — uds spec create without --yes and with no terminal leaves the spec as a draft and says how to confirm it | pass 通過 | 0 |
| 165 | `spec-delete-without-terminal-deletes-nothing` — uds spec delete without --yes and with no terminal deletes nothing, says why and exits 2 | pass 通過 | 2 |
| 166 | `spec-split-without-terminal-changes-nothing` — uds spec split with three criteria and no terminal changes nothing, says why and exits 2 | pass 通過 | 2 |
| 167 | `human-quickstart-pick-a-workflow` — Run uds quickstart in your own terminal and pick one workflow with the arrow keys: only that workflow is printed | unconfirmed 待人確認（未確認） | 0 |
| 168 | `human-spec-create-and-delete-prompts` — In your own terminal uds spec create asks what to do with the new spec, and uds spec delete asks before it deletes | unconfirmed 待人確認（未確認） | 0 |
| 169 | `open-work-next-action-root` — uds open-work next-action --root looks a named path up under that folder | pass 通過 | 0 |
| 170 | `open-work-next-action-without-root` — uds open-work next-action without --root looks that same path up under the current folder and does not find it (the control for the step above) | pass 通過 | 0 |
| 171 | `open-work-next-action-id-pattern` — uds open-work next-action --id-pattern lets a team's own ticket format count as a named next action | pass 通過 | 0 |
| 172 | `open-work-next-action-id-unrecognised` — uds open-work next-action without --id-pattern does not know that ticket format and exits 1 (the control for the step above) | pass 通過 | 1 |
| 173 | `open-work-next-action-command-word` — uds open-work next-action --command-word kubectl reads "kubectl rollout restart" as a command | pass 通過 | 0 |
| 174 | `open-work-next-action-command-unrecognised` — uds open-work next-action without --command-word does not know kubectl and exits 1 (the control for the step above) | pass 通過 | 1 |
| 175 | `open-work-next-action-stale-after` — uds open-work next-action --stale-after 2 marks a reply asked four days ago as STALE, where the default of seven days does not | pass 通過 | 0 |
| 176 | `open-work-next-action-default-not-stale` — uds open-work next-action with the default threshold does not call a four-day-old reply STALE (the control for the step above) | pass 通過 | 0 |
| 177 | `open-work-revision-before-after-violation` — uds open-work revision --before --after exits 1 when the acceptance section changed and no new revision record was added | pass 通過 | 1 |
| 178 | `open-work-revision-before-after-recorded` — uds open-work revision --before --after exits 0 when the same change comes with a new, complete revision record | pass 通過 | 0 |
| 179 | `open-work-revision-file-base` — uds open-work revision --file --base compares the file with its committed version | pass 通過 | 1 |
| 180 | `open-work-separation-default-words` — uds open-work separation exits 1 for a carrier that holds both a Goal section and a Next action section | pass 通過 | 1 |
| 181 | `open-work-separation-declared-word` — uds open-work separation --next-action-word Todo counts a "Todo" section as the progress section | pass 通過 | 1 |
| 182 | `open-work-separation-word-not-declared` — uds open-work separation without the word does not know "Todo" and exits 0 (the control for the step above) | pass 通過 | 0 |
| 183 | `open-work-waiting-id-pattern` — uds open-work waiting --id-pattern lets a not-yet-asked item name its draft by the team's own ticket format | pass 通過 | 0 |
| 184 | `open-work-waiting-id-unrecognised` — uds open-work waiting without --id-pattern finds no draft in that ticket format and exits 1 (the control for the step above) | pass 通過 | 1 |
| 185 | `open-work-waiting-command-word` — uds open-work waiting --command-word kubectl lets a not-yet-asked item name its action as a kubectl command | pass 通過 | 0 |
| 186 | `open-work-waiting-command-unrecognised` — uds open-work waiting without --command-word does not know kubectl and exits 1 (the control for the step above) | pass 通過 | 1 |
| 187 | `open-work-observations-stale-after` — uds open-work observations --stale-after 3 marks an observation made six days ago as stale and not confirmed | pass 通過 | 0 |
| 188 | `open-work-observations-default-threshold` — uds open-work observations with the default threshold keeps a six-day-old observation confirmed (the control for the step above) | pass 通過 | 0 |
| 189 | `r4b-init-standard-choices` — uds init --workflow --merge-strategy --output-lang --test-levels records the choices in the manifest and installs the matching option files, not the defaults | pass 通過 | 0 |
| 190 | `r4b-init-extensions` — uds init --lang --framework installs the language and framework extension files, and --no-agents-md writes no AGENTS.md | pass 通過 | 0 |
| 191 | `r4b-init-claude-local-index-agents` — uds init --claude-target local writes the Claude Code block to CLAUDE.local.md and not CLAUDE.md; --content-mode index and --agents-md are honoured | pass 通過 | 0 |
| 192 | `r4b-init-layered-with-hooks` — uds init --content-layout layered writes a CLAUDE.md in the matching sub-folder, and --with-hooks installs the enforcement hook scripts and wires them into .claude/settings.json | pass 通過 | 0 |
| 193 | `r4b-self-adoption-init-refused` — uds init in a folder that is the UDS source repository is refused: exit 1, says to use --force, and writes nothing | pass 通過 | 1 |
| 194 | `r4b-self-adoption-init-force` — uds init --force bypasses the self-adoption guard, warns, and installs | pass 通過 | 0 |
| 195 | `r4b-self-adoption-check-refused` — uds check in a folder that is the UDS source repository is refused: exit 1 and says to use --force | pass 通過 | 1 |
| 196 | `r4b-self-adoption-check-force` — uds check --force bypasses the self-adoption guard, warns, and runs the integrity check | pass 通過 | 0 |
| 197 | `r4b-compile-init` — uds init sets up a project for the compile steps | pass 通過 | 0 |
| 198 | `r4b-compile-dry-run` — uds compile --dry-run prints the hook configuration it would write and writes nothing | pass 通過 | 0 |
| 199 | `r4b-compile-target` — uds compile --target claude-code writes the hooks into .claude/settings.json and keeps the settings that were already there | pass 通過 | 0 |
| 200 | `r4b-compile-unknown-target` — uds compile --target with a platform it does not know exits 1 and names the supported one | pass 通過 | 1 |
| 201 | `r4b-check-standard-fails` — uds check --standard <id> validates the project against that standard's physical spec and fails, naming what is missing | pass 通過 | 1 |
| 202 | `r4b-check-standard-json-passes` — uds check --standard <id> --json prints the verdict as JSON and exits 0 when the project matches | pass 通過 | 0 |
| 203 | `r4b-check-i18n-reports-violation` — uds check --i18n reports a canonical skill whose description is not English and exits 1 | pass 通過 | 1 |
| 204 | `r4b-check-i18n-json` — uds check --i18n --json prints the findings and their counts as JSON, and exits 1 on an error | pass 通過 | 1 |
| 205 | `r4b-check-i18n-clean` — uds check --i18n finds no violation once the description is English, and exits 0 | pass 通過 | 0 |
| 206 | `r4b-check-drift-init` — uds init sets up a project whose standards the next steps change | pass 通過 | 0 |
| 207 | `r4b-check-migrate` — uds check --migrate rebuilds the file hashes of a manifest that has none (an old manifest) | pass 通過 | 0 |
| 208 | `r4b-check-summary` — uds check --summary prints the compact status and counts the standard file that was edited | pass 通過 | 0 |
| 209 | `r4b-check-diff` — uds check --diff shows the difference between the edited standard file and the original | pass 通過 | 0 |
| 210 | `r4b-check-no-interactive` — uds check --no-interactive lists the edited file and the ways to restore it, without asking | pass 通過 | 0 |
| 211 | `r4b-check-restore-missing` — uds check --restore-missing puts back a deleted standard file and leaves the edited one as it is | pass 通過 | 0 |
| 212 | `r4b-check-restore` — uds check --restore puts the edited standard file back to the original | pass 通過 | 0 |
| 213 | `r4b-check-shipped-standard-macos` — uds check --standard commit-message --json runs the physical spec of a shipped standard found through the manifest, and passes once the config file it asks for exists | pass 通過 | 0 |
| 214 | `r4b-check-shipped-standard-linux` — uds check --standard commit-message --json runs the physical spec of a shipped standard found through the manifest, and passes once the config file it asks for exists | skip 略過 — step is for linux; this machine is macos | - |
| 215 | `r4b-check-standard-without-spec` — uds check --standard names a shipped standard that has no physical spec and says validation was skipped | pass 通過 | 0 |
| 216 | `r4b-uninstall-partial-init` — uds init sets up a project that also holds the adopter's own files (README.md, text in CLAUDE.md, a skill of their own) | pass 通過 | 0 |
| 217 | `r4b-uninstall-dry-run` — uds uninstall --dry-run lists what it would remove and changes nothing | pass 通過 | 0 |
| 218 | `r4b-uninstall-skills-only` — uds uninstall --skills-only --yes removes the UDS skills, keeps the skill the adopter wrote and the UDS skill file they edited, and leaves the standards and the integration files | pass 通過 | 0 |
| 219 | `r4b-uninstall-integrations-only` — uds uninstall --integrations-only --yes removes the UDS block from CLAUDE.md and keeps the text around it, deletes the AGENTS.md UDS generated, and leaves the standards | pass 通過 | 0 |
| 220 | `r4b-uninstall-standards-only` — uds uninstall --standards-only --yes removes what UDS wrote into .standards/ and leaves the adopter's own files, the file they added there, and their skill | pass 通過 | 0 |
| 221 | `r4b-uninstall-all-init` — uds init --with-hooks sets up a project whose .claude/settings.json already holds a hook of the adopter's own | pass 通過 | 0 |
| 222 | `r4b-uninstall-yes-everything` — uds uninstall --yes removes everything UDS installed (standards, skills, hooks and their scripts, integration files) and keeps the adopter's own files, skill, hook and the notes file they put in .standards/ | pass 通過 | 0 |
| 223 | `r4b-uninstall-user-level-init` — uds init --skills-location user puts the skills in the user's home folder, not in the project | pass 通過 | 0 |
| 224 | `r4b-uninstall-user-level-present` — Control: the user-level skills are in the home folder before the uninstall | pass 通過 | 0 |
| 225 | `r4b-uninstall-user-level-skipped` — uds uninstall --skills-only --dry-run says the user-level skills are skipped without --all, and removes nothing | pass 通過 | 0 |
| 226 | `r4b-uninstall-all-flag` — uds uninstall --all --yes also removes the skills installed in the user's home folder | pass 通過 | 0 |
| 227 | `r4b-uninstall-user-level-gone` — The user-level skills are gone from the home folder after uds uninstall --all | pass 通過 | 0 |
| 228 | `r4b-update-init` — uds init sets up a Claude Code project (CLAUDE.md, AGENTS.md, skills) for the uds update steps | pass 通過 | 0 |
| 229 | `r4b-update-standards-only` — uds update --standards-only brings the standards up to the installed version and leaves the integration files alone | pass 通過 | 0 |
| 230 | `r4b-update-regenerates-integration` — Without --standards-only the same update also regenerates the UDS block in CLAUDE.md and keeps the text around it | pass 通過 | 0 |
| 231 | `r4b-update-integrations-only` — uds update --integrations-only regenerates the UDS block in CLAUDE.md and does not touch the standards | pass 通過 | 0 |
| 232 | `r4b-update-keeps-edited-standard` — A plain uds update on a project that is already up to date leaves an edited standard file as it is | pass 通過 | 0 |
| 233 | `r4b-update-force` — uds update --force overwrites the edited standard file with the shipped one, ignoring the hash comparison | pass 通過 | 0 |
| 234 | `r4b-update-sync-refs` — uds update --sync-refs rewrites the standards list in CLAUDE.md after a standard left the manifest | pass 通過 | 0 |
| 235 | `r4b-update-debug` — uds update --debug prints how it decided which skills and commands are missing or outdated | pass 通過 | 0 |
| 236 | `r4b-update-keeps-retired-standard` — uds update lists a standard file UDS wrote and no longer ships, and keeps it unless --prune is given | pass 通過 | 0 |
| 237 | `r4b-update-prune` — uds update --prune deletes the standard file UDS wrote and no longer ships | pass 通過 | 0 |
| 238 | `r4b-update-locale` — uds update --skills --locale zh-tw reinstalls the skills in Traditional Chinese and records the locale | pass 通過 | 0 |
| 239 | `r4b-update-with-hooks-ai-tool` — uds update --with-hooks --ai-tool codex installs the hook for Codex only, not for the tool the project already uses | pass 通過 | 0 |
| 240 | `r4b-update-with-hooks` — uds update --with-hooks installs the hooks that are missing for the detected tool and leaves the one that is already there | pass 通過 | 0 |
| 241 | `r4b-update-claude-target-local` — uds update --claude-target local moves the UDS block from CLAUDE.md to CLAUDE.local.md and keeps the text around it | pass 通過 | 0 |
| 242 | `r4b-update-commands-init` — uds init in a Cursor project installs the slash commands next to the skills | pass 通過 | 0 |
| 243 | `r4b-update-commands` — uds update --commands puts back a deleted slash command and an edited one | pass 通過 | 0 |
| 244 | `r4b-update-beta-init` — uds init sets up a project for the uds update --beta steps | pass 通過 | 0 |
| 245 | `r4b-update-beta-ignored` — Control: without --beta, uds update ignores a newer beta on npm (the registry here says latest 6.0.0, beta 99.0.0-beta.1) | pass 通過 | 0 |
| 246 | `r4b-update-beta` — uds update --beta reports the newer beta that npm has | pass 通過 | 0 |

## Waiting for a person | 待人確認（尚未確認，不計入通過）

- `human-commit-warning-display` — Look at the warning printed above, the one that starts with "test-change". Is it readable, with the warning sign and the dash showing, not question marks or boxes? Run this in the shell you normally commit from (Git Bash on Windows). | 請看上面印出的警告（以 test-change 開頭的那一段）：警告符號與破折號是否正常顯示，而不是問號或方框？請在你平常提交用的殼層（Windows 上的 Git Bash）執行。
- `human-chinese-display` — Look at the text above. Is the Chinese readable (not ???? or boxes)? On a Traditional Chinese Windows console (code page 950) this is the line that breaks. | 請看上面的文字：中文是否正常顯示（不是 ???? 或方框）？繁體中文 Windows 主控台（字碼頁 950）最容易在這裡出問題。
- `human-init-enter-installs-skills` — In a NEW empty folder that has a .claude folder inside it (mkdir -p demo/.claude on macOS/Linux; md demo\.claude on Windows), run `uds init` in your own terminal and press Enter at every question. At the skills question the line "Claude Code - Project Level (.claude/skills/)" must already be ticked. When it ends, does demo/.claude/skills/ hold many folders (commit-standards, tdd-assistant, ...)? | 在一個全新的空資料夾（裡面有 .claude 資料夾；macOS/Linux：mkdir -p demo/.claude，Windows：md demo\.claude），於你自己的終端機執行 `uds init`，每一題都只按 Enter。技能那一題的「Claude Code - Project Level (.claude/skills/)」必須已經是勾選狀態。結束後，demo/.claude/skills/ 底下是否有很多資料夾（commit-standards、tdd-assistant……）？
- `human-init-keeps-open-work` — In a NEW empty folder with a .claude folder, create uds.project.yaml with exactly these lines: `version: "1"`, `open_work:`, `  roots:`, `    other: ../other   # sibling checkout`, `commands:`, `  test: old-test`. Run `uds init` and press Enter at every question, EXCEPT: answer "y" at "Update the commands (test, lint, build, security) in the existing uds.project.yaml?" (the question lists the sections that are kept; open_work must be one of them) and type `npm run my-test` for the test command. Afterwards: is `test: npm run my-test` there, and are the open_work lines (including the comment) unchanged? Also run `uds init` again in a copy of the file and answer Enter at that question: the file must not change. | 在一個全新、含 .claude 資料夾的空資料夾，建立 uds.project.yaml，內容恰好是這幾行：`version: "1"`、`open_work:`、`  roots:`、`    other: ../other   # sibling checkout`、`commands:`、`  test: old-test`。執行 `uds init`，每一題都按 Enter，只有兩處例外：「Update the commands (test, lint, build, security) in the existing uds.project.yaml?」答 y（問題必須寫出保留的區段名稱，包含 open_work），測試指令輸入 `npm run my-test`。結束後：`test: npm run my-test` 是否已寫入，open_work 的幾行（含註解）是否原封不動？另外在檔案的副本上再執行一次 `uds init`，那一題直接按 Enter：檔案不得有任何變動。
- `human-spec-split-in-a-terminal` — In a NEW empty folder, create specs/SPEC-001-big.md holding "## Micro-Spec: Big", "**Depends On**: none", "**Type**: feature" and three lines "- [ ] AC-1: first", "- [ ] AC-2: second", "- [ ] AC-3: third" (each on its own line). Run `uds spec split SPEC-001-big` in your own terminal, tick AC-3 with the space bar, press Enter, answer y. Afterwards: are there two spec files, does the original lack AC-3 and name the new spec after "Depends On", does the new one hold AC-3 and name SPEC-001-big, is there an empty line between AC-3 and "**Confirmed**" in the new spec, and is specs/.backup/SPEC-001-big-pre-split.md the untouched original? | 在一個全新的空資料夾建立 specs/SPEC-001-big.md，內容有「## Micro-Spec: Big」、「**Depends On**: none」、「**Type**: feature」，以及三行（各佔一行）「- [ ] AC-1: first」、「- [ ] AC-2: second」、「- [ ] AC-3: third」。在你自己的終端機執行 `uds spec split SPEC-001-big`，用空白鍵勾選 AC-3，按 Enter，回答 y。結束後：是否有兩份規格檔？原本那份是否已沒有 AC-3、且「Depends On」寫著新規格？新的那份是否有 AC-3、且指向 SPEC-001-big？新的那份裡 AC-3 與「**Confirmed**」之間是否有一行空行？specs/.backup/SPEC-001-big-pre-split.md 是否為未經改動的原檔？
- `human-quickstart-pick-a-workflow` — In your own terminal run `uds quickstart`, press the Down arrow once and Enter. Is only the second workflow ("Full SDD Spec Flow (Boost)") printed, with its four numbered commands, and no other workflow? | 在你自己的終端機執行 `uds quickstart`，按一次向下鍵再按 Enter。是否只印出第二個流程（「Full SDD Spec Flow (Boost)」）和它的四個編號指令，而沒有其他流程？
- `human-spec-create-and-delete-prompts` — In a NEW empty folder run `uds spec create "Add login page"` in your own terminal and choose "Confirm and proceed": is specs/SPEC-001-add-login-page.md written with "**Status**: confirmed"? Then run `uds spec delete SPEC-001-add-login-page`, answer n: is the file still there? Run it again and answer y: is it gone? | 在一個全新的空資料夾，於你自己的終端機執行 `uds spec create "Add login page"` 並選「Confirm and proceed」：specs/SPEC-001-add-login-page.md 是否寫出且有「**Status**: confirmed」？再執行 `uds spec delete SPEC-001-add-login-page` 並回答 n：檔案是否還在？再執行一次並回答 y：檔案是否已消失？

Answer with `--answers <file>` (JSON: `{"step-id": "yes"|"no"}`) or run in a terminal and answer when asked. 用 `--answers <檔案>` 回答，或在終端機直接執行並依提示回答。

<details><summary>Output of the passed steps | 通過步驟的輸出摘要</summary>

**smoke-version** — `uds --version`

```text
6.14.0-beta.9
```

**smoke-shim** — `uds --version`

```text
6.14.0-beta.9
```

**available-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/available/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/available/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**std-open-work-states** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**std-open-work-cross-project** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**std-open-work-waiting-on-reply** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**std-open-work-summary** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**std-memory-boundary** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**error-exit-hint-init** — `uds init --yes --skills-location none`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  76 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**error-exit-hint-in-english** — `uds check --offline`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:

  Summary: 74 unchanged, 0 modified, 0 missing

Integration UDS Block Integrity
  ✓ All UDS blocks intact (2 files)
    User customizations outside UDS blocks are preserved

Reference Sync Status:
  ℹ CLAUDE.md:
    Standards with no "Reference:"/"參考:" line in this file (optional):
      - developer-memory.ai.yaml
      - documentation-structure.ai.yaml
      - git-workflow.ai.yaml
      - project-context-memory.ai.yaml
      - project-structure.ai.yaml
      - refactoring-standards.ai.yaml
      - requirement-engineering.ai.yaml
      - spec-driven-development.ai.yaml

AI Tool Integration Status:
  ✓ CLAUDE.md:
    Standards index present
    74/74 standards referenced

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  Claude Code:
    ○ Skills: Not installed

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    74 via copied documents

Upstream standards not installed: none
  ⚠ [error-exit] No single-exit check for error messages (scripts/check-error-exit.mjs).
    This gate stops every caller from turning an error response into its own human-readable string —
    the first one is the implementation; from the second on they drift apart, and the screen shows only "Bad Request".
    To install it: `uds update` shows its content and asks before writing it.

  ⚠ [test-change] could not read the staged changes (error: unknown option `cached'); the code-without-test check did not run.
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

✓ Project is compliant with standards

Tip: Run `uds update` to install missing Skills/Commands
```

**available-check-line** — `uds check --offline`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:

  Summary: 73 unchanged, 0 modified, 0 missing

Skills File Integrity
  ✓ All skill files intact (116 files)

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

Reference Sync Status:
  ✗ AGENTS.md:
    mentions paths that do not exist in this project:
      - .standards/open-work-tracking.ai.yaml
    These are usually outside the UDS block, left by an older install. UDS does not rewrite text it did not write — correct them by hand or delete the line.
  ℹ AGENTS.md:
    Standards with no "Reference:"/"參考:" line in this file (optional):
      - anti-hallucination.ai.yaml
      - checkin-standards.ai.yaml
      - developer-memory.ai.yaml
      - documentation-structure.ai.yaml
      - git-workflow.ai.yaml
      - project-context-memory.ai.yaml
      - project-structure.ai.yaml
      - refactoring-standards.ai.yaml
      - requirement-engineering.ai.yaml
      - spec-driven-development.ai.yaml

  Run `uds update --integrations-only` to regenerate integration files.

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (70/70)

Skills Status:
  No AI tools configured

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    73 via copied documents

1 upstream standard(s) not installed — run `uds update --plan` to see them
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

✓ Project is compliant with standards
```

**available-audit-friction** — `uds audit --friction --offline`

```text
UDS Audit Report
══════════════════════════════════════════════════

Friction Points (1)
────────────────────────────────────────
  [LOW] 1 available standard(s) not installed — Not-installed
         open-work-tracking
         Run `uds update --plan` to see them; install one with `uds update --apply --add-standard <id>`
```

**available-audit-report-held-back** — `uds audit --report --yes --dry-run --offline`

```text
UDS Audit Report
══════════════════════════════════════════════════

Health Check
────────────────────────────────────────
  ✓ All files intact

Friction Points (1)
────────────────────────────────────────
  [LOW] 1 available standard(s) not installed — Not-installed
         open-work-tracking
         Run `uds update --plan` to see them; install one with `uds update --apply --add-standard <id>`

Nothing to send: the "available standards" finding above is for you to act on, not feedback for the UDS maintainers.
```

**available-plan** — `uds update --plan --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
- Calculating reconciliation plan...
=== Reconciliation Plan ===

~ Migrate Block (1):
  ~ AGENTS.md (integration content differs from what would be generated)

Summary:
  Create: 0
  Update: 0
  Migrate Block: 1
  Delete: 0
  Unchanged: 129

Run `uds update --apply` to apply exactly these changes.
Run `uds update --force` to rewrite every managed file (a larger plan than the one above).


Available upstream, not installed (1)
  reference (1)
    open-work-tracking — Downstream of deferred-item-exit: once an item has an exit, its carrier must stay trustworthy.
  Install one: uds update --apply --add-standard <id>   (repeat the flag for several; add --plan to preview first)
Not listed above: 95 more standard(s) in categories `uds init` never installs (core 59, testing 15, integration 7, extension 5, security 5, deployment 2, operations 1, template 1). Any of them can still be installed by id with --add-standard.
```

**available-unknown-id** — `uds update --plan --offline --add-standard no-such-standard-xyz`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Unknown standard id "no-such-standard-xyz": it is not in the registry. Closest ids:
    push-standards
    logging-standards
    privacy-standards
    rollback-standards
    slo-standards
```

**available-add-standard** — `uds update --apply --yes --offline --add-standard open-work-tracking`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Running declarative state reconciliation...

=== Reconciliation Plan ===

+ Create (1):
  + .standards/open-work-tracking.ai.yaml (standard not found on disk)

~ Migrate Block (1):
  ~ AGENTS.md (integration content differs from what would be generated)

Summary:
  Create: 1
  Update: 0
  Migrate Block: 1
  Delete: 0
  Unchanged: 129

- Applying reconciliation plan...
✔ Reconciliation complete: 2 succeeded
  Backup: .uds-backups/2026-10-10T16-03-11-246Z-0001
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.

Available upstream, not installed: none. Every standard UDS installs by default is already in this project.
Not listed above: 95 more standard(s) in categories `uds init` never installs (core 59, testing 15, integration 7, extension 5, security 5, deployment 2, operations 1, template 1). Any of them can still be installed by id with --add-standard.
```

**available-clean-after-add** — `uds check --ci --offline`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:

  Summary: 74 unchanged, 0 modified, 0 missing

Skills File Integrity
  ✓ All skill files intact (116 files)

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  No AI tools configured

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    74 via copied documents

Upstream standards not installed: none
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

✓ Project is compliant with standards
```

**available-rollback** — `uds update --rollback --yes`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Rolling back from: .uds-backups/2026-10-10T16-03-11-246Z-0001
  Created: 2026-10-10T16:03:11.281Z

.uds-backups/2026-10-10T16-03-11-246Z-0001 (reconcile)
  Restored 2 file(s), removed 1 file(s) the update had created.
  ← AGENTS.md
  ← .standards/manifest.json
  ✕ .standards/open-work-tracking.ai.yaml

Rollback successful. Restored 2 file(s), removed 1.
```

**psg-add-standard** — `uds update --apply --yes --offline --add-standard pipeline-security-gates`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Running declarative state reconciliation...

=== Reconciliation Plan ===

+ Create (1):
  + .standards/pipeline-security-gates.ai.yaml (standard not found on disk)

~ Migrate Block (1):
  ~ AGENTS.md (integration content differs from what would be generated)

Summary:
  Create: 1
  Update: 0
  Migrate Block: 1
  Delete: 0
  Unchanged: 129

- Applying reconciliation plan...
✔ Reconciliation complete: 2 succeeded
  Backup: .uds-backups/2026-10-10T16-03-12-104Z-0001
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.

1 standard(s) UDS ships are not installed in this project (no file was changed for them).
  See them: uds update --plan    Install one: uds update --apply --add-standard <id>
Not listed above: 94 more standard(s) in categories `uds init` never installs (core 58, testing 15, integration 7, extension 5, security 5, deployment 2, operations 1, template 1). Any of them can still be installed by id with --add-standard.
```

**legacy-update-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/legacy-update/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/legacy-update/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**legacy-update-messages** — `uds update --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.0.0
Latest version:  6.14.0-beta.9

Update available: 6.0.0 → 6.14.0-beta.9

Files to update:
  .standards/acceptance-criteria-traceability.ai.yaml
  .standards/acceptance-test-driven-development.ai.yaml
  .standards/accessibility-standards.ai.yaml
  .standards/adr-standards.ai.yaml
  .standards/agent-dispatch.ai.yaml
  .standards/ai-agreement-standards.ai.yaml
  .standards/ai-command-behavior.ai.yaml
  .standards/ai-friendly-architecture.ai.yaml
  .standards/ai-instruction-standards.ai.yaml
  .standards/ai-response-navigation.ai.yaml
  .standards/anti-hallucination.ai.yaml
  .standards/api-design-standards.ai.yaml
  .standards/behavior-driven-development.ai.yaml
  .standards/behavior-snapshot.ai.yaml
  .standards/changelog.ai.yaml
  .standards/checkin-standards.ai.yaml
  .standards/class-level-fix.ai.yaml
  .standards/code-review.ai.yaml
  .standards/commit-message.ai.yaml
  .standards/context-aware-loading.ai.yaml
  .standards/database-standards.ai.yaml
  .standards/deferred-item-exit.ai.yaml
  .standards/deployment-standards.ai.yaml
  .standards/developer-memory.ai.yaml
  .standards/documentation-lifecycle.ai.yaml
  .standards/documentation-structure.ai.yaml
  .standards/documentation-writing-standards.ai.yaml
  .standards/error-codes.ai.yaml
  .standards/feature-discovery-standards.ai.yaml
  .standards/feature-manifest-standard.ai.yaml
  .standards/flow-based-testing.ai.yaml
  .standards/forward-derivation-standards.ai.yaml
  .standards/full-coverage-testing.ai.yaml
  .standards/git-workflow.ai.yaml
  .standards/git-worktree.ai.yaml
  .standards/knowledge-graph-memory.ai.yaml
  .standards/logging.ai.yaml
  .standards/mock-boundary.ai.yaml
  .standards/model-selection.ai.yaml
  .standards/mutation-testing.ai.yaml
  .standards/packaging-standards.ai.yaml
  .standards/performance-standards.ai.yaml
  .standards/project-context-memory.ai.yaml
  .standards/
... (1249 characters omitted) ...
 AGENTS.md

1 new standard(s) available (upstream has them, this project does not):
  + .standards/open-work-tracking.ai.yaml


- Updating standards...
✔ Updated 73 standard files
- Installing new standards...
✔ Installed 1 new standard(s)
- Syncing integration files...
✔ Synced 1 integration files

  .standards/ examined: 75 file(s) — 74 written by UDS, 0 not ours, 0 ownership unknown, 1 excluded
    excluded .standards/manifest.json (the manifest itself)
    first run with ownership tracking: files installed before this release cannot be attributed yet, so none will be removed.

✓ Standards updated successfully!
  Version: 6.0.0 → 6.14.0-beta.9
  Integration files synced: 1

Skills update available:
  Current: 0.0.1
  Latest: 6.14.0-beta.9

  Update them with: uds update --apply --skills
```

**skills-two-ways** — `uds skills`

```text
Universal Dev Standards - Installed Skills
──────────────────────────────────────────────────

No Universal Dev Standards skills installed.

Two ways to install UDS skills

  ● Into the project (the main path)
      uds init --skills-location project   (new project)
      uds update --apply --skills          (project already set up)
      - Works with many AI tools: Claude Code, OpenCode, Cursor, Codex, Copilot, Windsurf and more.
      - Has Traditional and Simplified Chinese skill texts (a missing one falls back to English with a warning).
      - Follows the UDS version you installed, beta releases included.
      - You update it yourself: run the same command again after upgrading UDS.

  ● Claude Code plugin marketplace (an alternative, with limits)
      /plugin marketplace add AsiaOstrich/universal-dev-standards
      /plugin install universal-dev-standards@asia-ostrich
      - Claude Code only.
      - English skill texts only: the plugin settings have no language choice.
      - Follows stable releases only, so a beta of UDS gets no beta skills.
      - Puts no files in the project, so `uds check` cannot compare them file by file.

  Installing both lists every skill twice in Claude Code (for example /commit and /universal-dev-standards:commit). Pick one; `uds check` warns when it finds both.
```

**personal-skill-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/personal-skill/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/personal-skill/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
⚠ 1 UDS skill(s) installed in this project share a name with a personal skill, and Claude Code runs the personal one without any error:
    /plan: your ~/.claude/skills/plan/ replaces the UDS skill .claude/skills/plan/
    Personal skills rank above project skills, so the UDS skill is never run under that name.
    Pick one:
      Keep both: rename your personal skill (its folder name, and `name:` in its SKILL.md).
      Keep yours only: delete the UDS skill folder under .claude/skills/ (`uds uninstall --skills-only` removes the skills and commands of every tool in this project).
    This check does not see skills your organization deploys at enterprise level (they rank above personal skills), or personal skills added after this run. No warning is not proof of no collision; `uds check` looks again every time.

Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**personal-skill-check** — `uds check --offline`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:

  Summary: 74 unchanged, 0 modified, 0 missing

Skills File Integrity
  ✓ All skill files intact (116 files)

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  No AI tools configured

⚠ 1 UDS skill(s) installed in this project share a name with a personal skill, and Claude Code runs the personal one without any error:
    /plan: your ~/.claude/skills/plan/ replaces the UDS skill .claude/skills/plan/
    Personal skills rank above project skills, so the UDS skill is never run under that name.
    Pick one:
      Keep both: rename your personal skill (its folder name, and `name:` in its SKILL.md).
      Keep yours only: delete the UDS skill folder under .claude/skills/ (`uds uninstall --skills-only` removes the skills and commands of every tool in this project).
    This check does not see skills your organization deploys at enterprise level (they rank above personal skills), or personal skills added after this run. No warning is not proof of no collision; `uds check` looks again every time.

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    74 via copied documents

Upstream standards not installed: none
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

✓ Project is compliant with standards
```

**personal-skill-update** — `uds update --apply --yes --offline --skills`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Running declarative state reconciliation...

=== Reconciliation Plan ===

~ Migrate Block (1):
  ~ AGENTS.md (integration content differs from what would be generated)

Summary:
  Create: 0
  Update: 0
  Migrate Block: 1
  Delete: 0
  Unchanged: 130

- Applying reconciliation plan...
✔ Reconciliation complete: 1 succeeded
  Backup: .uds-backups/2026-10-10T16-03-13-773Z-0001
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.

Available upstream, not installed: none. Every standard UDS installs by default is already in this project.
Not listed above: 95 more standard(s) in categories `uds init` never installs (core 59, testing 15, integration 7, extension 5, security 5, deployment 2, operations 1, template 1). Any of them can still be installed by id with --add-standard.

Updating Skills for all AI Agents...

Current Skills status:
  Claude Code (project): v6.14.0-beta.9 ✓

- Installing Skills...
✔ Updated Skills for 1 AI tools
  Backup: .uds-backups/2026-10-10T16-03-13-780Z-0002
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.

⚠ 1 UDS skill(s) installed in this project share a name with a personal skill, and Claude Code runs the personal one without any error:
    /plan: your ~/.claude/skills/plan/ replaces the UDS skill .claude/skills/plan/
    Personal skills rank above project skills, so the UDS skill is never run under that name.
    Pick one:
      Keep both: rename your personal skill (its folder name, and `name:` in its SKILL.md).
      Keep yours only: delete the UDS skill folder under .claude/skills/ (`uds uninstall --skills-only` removes the skills and commands of every tool in this project).
    This check does not see skills your organization deploys at enterprise level (they rank above personal skills), or personal skills added after this run. No warning is not proof of no collision; `uds check` looks again every time.
```

**double-install-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/double-install/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/double-install/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**double-install-check** — `uds check --offline`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:

  Summary: 74 unchanged, 0 modified, 0 missing

Skills File Integrity
  ✓ All skill files intact (116 files)

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  No AI tools configured

⚠ UDS skills are installed twice: 56 in this project (.claude/skills/) and the plugin universal-dev-standards@asia-ostrich.
    Claude Code runs plugin skills as /<plugin>:<skill> and project skills as /<skill>, so each skill shows up twice (for example /commit and /universal-dev-standards:commit).
    Every skill's name and description is put into context on every turn, so the duplicate takes that space twice.
    Keep one:
      Keep the project copy: in Claude Code run /plugin uninstall universal-dev-standards@asia-ostrich
      Keep the plugin: delete the UDS skill folders under .claude/skills/ (`uds uninstall --skills-only` removes the skills and commands of every tool in this project).

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    74 via copied documents

Upstream standards not installed: none
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

✓ Project is compliant with standards
```

**docs-install-skills** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**docs-personal-skill** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**owt-self-test** — `uds open-work self-test`

```text
[owt] self-test: OK
```

**owt-waiting-states** — `uds open-work waiting w.md --now 2026-01-12`

```text
[owt] OWT-020/021/022 walked 2 record(s) with a status field in 1 carrier(s) (today 2026-01-12); 0 carrier(s) had none
[owt]   not-yet-asked=1 asked-awaiting=1 waiting-unspecified=0 done=0 other=0 undecidable-table-rows=0
[owt]   asked-awaiting       w.md table row (line 3, row "quote"): quote  (asked 2d ago)
[owt]   not-yet-asked        w.md table row (line 4, row "mail"): mail
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**owt-waiting-violation** — `uds open-work waiting bad.md --now 2026-01-12`

```text
[owt] OWT-020/021/022 walked 1 record(s) with a status field in 1 carrier(s) (today 2026-01-12); 0 carrier(s) had none
[owt]   not-yet-asked=1 asked-awaiting=0 waiting-unspecified=0 done=0 other=0 undecidable-table-rows=0
[owt]   not-yet-asked        bad.md table row (line 3, row "mail"): mail
[owt] VIOLATION OWT-021: bad.md table row (line 3, row "mail") is not-yet-asked but names no draft or action: no file path, command, test name or requirement identifier
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**owt-observations** — `uds open-work observations facts.md --now 2026-10-07`

```text
[owt] OWT-023/024/025/026 walked 4 observation(s) in 1 carrier(s) (today 2026-10-07); stale after 7 day(s) (default, UNCALIBRATED); 0 carrier(s) had none
[owt]   yes=2 no=1 unknown=1 invalid=0 | stale=1 | confirmed=1 (yes, well formed, not stale) | undecidable-table-rows=0
[owt]   value=yes age=2d by=albert at=2026-10-05  facts.md table row (line 5, row "mail sent"): mail sent
[owt]   value=yes age=36d by=albert at=2026-09-01  facts.md table row (line 6, row "legal replied"): legal replied
[owt]   value=unknown age=1d by=albert at=2026-10-06  facts.md table row (line 7, row "approved"): approved
[owt]   value=no age=3d by=albert at=2026-10-04  facts.md table row (line 8, row "quote accepted"): quote accepted
[owt] UNKNOWN (counted apart, never complete): facts.md table row (line 7, row "approved"): approved
[owt] STALE (observed 36d ago, older than 7d; counted apart, not confirmed): facts.md table row (line 6, row "legal replied"): legal replied
[owt] LIMIT: the check decides that the fields exist, are well formed, and how old the stamp is. It cannot decide that an observation is true, or that it is still true now (OWT-014): a stamp says who saw it and when, never that it still holds.
[owt] COVERAGE UNKNOWN (OWT-011): a table is read as an observation carrier only if it has an observed-by or observed-at column (or a list item such a label); the "derivable subject" test is a short word list. A clean pass does not mean no hand-written fact is unstamped or derivable.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**owt-cross-project-root** — `uds open-work waiting w.md --now 2026-10-07 --root other={workPosix}/other`

```text
[owt] OWT-020/021/022 walked 2 record(s) with a status field in 1 carrier(s) (today 2026-10-07); 0 carrier(s) had none
[owt]   not-yet-asked=0 asked-awaiting=0 waiting-unspecified=0 done=0 other=0 waiting-cross-project=2 undecidable-table-rows=0
[owt]   waiting-cross-project w.md table row (line 3, row "wait a"): wait a
[owt]   waiting-cross-project w.md table row (line 4, row "wait b"): wait b
[owt] OWT-027/028 2 release condition(s) name an object in another project (looked up on this machine only; no network): released=1 not-yet-released=1 not-visible-from-here=0 needs-a-person=0
[owt]   RELEASED              other:docs/a.md (path, machine-observable) w.md table row (line 3, row "wait a"): the path exists there
[owt]   NOT YET RELEASED      other:docs/b.md (path, machine-observable) w.md table row (line 4, row "wait b"): the path does not exist there
[owt] RESOLUTION: project "other" is looked up under <sandbox>/work/owt-cross-project-root/other (from --root NAME=DIR or open_work.projects). Only a path or a version-control tag is looked up; nothing leaves this machine.
[owt] NOT VISIBLE FROM HERE is counted apart: it is not released and it is not zero. NEEDS A PERSON is counted apart and is never released. RELEASED says the object exists there now, never that it is the right object (OWT-014).
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**owt-cross-project-config** — `uds open-work waiting w.md --now 2026-10-07`

```text
[owt] OWT-020/021/022 walked 2 record(s) with a status field in 1 carrier(s) (today 2026-10-07); 0 carrier(s) had none
[owt]   not-yet-asked=0 asked-awaiting=0 waiting-unspecified=0 done=0 other=0 waiting-cross-project=2 undecidable-table-rows=0
[owt]   waiting-cross-project w.md table row (line 3, row "wait a"): wait a
[owt]   waiting-cross-project w.md table row (line 4, row "wait b"): wait b
[owt] OWT-027/028 2 release condition(s) name an object in another project (looked up on this machine only; no network): released=1 not-yet-released=1 not-visible-from-here=0 needs-a-person=0
[owt]   RELEASED              other:docs/a.md (path, machine-observable) w.md table row (line 3, row "wait a"): the path exists there
[owt]   NOT YET RELEASED      other:docs/b.md (path, machine-observable) w.md table row (line 4, row "wait b"): the path does not exist there
[owt] RESOLUTION: project "other" is looked up under <sandbox>/work/owt-cross-project-config/other (from --root NAME=DIR or open_work.projects). Only a path or a version-control tag is looked up; nothing leaves this machine.
[owt] NOT VISIBLE FROM HERE is counted apart: it is not released and it is not zero. NEEDS A PERSON is counted apart and is never released. RELEASED says the object exists there now, never that it is the right object (OWT-014).
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**owt-next-action-words** — `uds open-work next-action n.md`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=1 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (1): path-missing=0 not-resolvable=1
[owt] RESOLUTION: a path is looked up under <sandbox>/work/owt-next-action-words (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/owt-next-action-words, not against where the file is; pass --root to say where its paths start
[owt]   named-unresolved n.md table column "下一個動作" (line 3, row "a"): run npm test  <- command:npm test
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**owt-next-action-declared-word** — `uds open-work next-action n.md --next-action-word 待辦`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=1 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (1): path-missing=0 not-resolvable=1
[owt] RESOLUTION: a path is looked up under <sandbox>/work/owt-next-action-declared-word (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/owt-next-action-declared-word, not against where the file is; pass --root to say where its paths start
[owt]   named-unresolved n.md table column "待辦" (line 3, row "a"): run npm test  <- command:npm test
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**owt-next-action-exit-2-explains** — `uds open-work next-action n.md`

```text
[owt] OWT-019 walked 0 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 1 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=0 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/owt-next-action-exit-2-explains (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/owt-next-action-exit-2-explains, not against where the file is; pass --root to say where its paths start
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
[owt] CANNOT DECIDE: no next-action field found in any carrier (walked 0). Exit 2 is not a pass.
[owt] WHY: no carrier had a next-action field. What each one showed:
[owt]   n.md: has 1 table(s), but no table header matches a recognised word; if one of them is your next-action column, declare its word
[owt]     table headers (2 distinct): "item", "待辦"
[owt] WORDS RECOGNISED (a heading, a table header or an inline "word: ..." label that contains one of these, any case): built in: next action, next step (also "next-action", "next steps") | 下一步 | 下一動 | 回來要做什麼 | 下一個動作 | 下一個步驟 | 接下來要做什麼
[owt]   declared by you: none
[owt] TO ADD A WORD: pass --next-action-word <word> (repeat it for several), or list it under open_work: next_action_words: in uds.project.yaml. It is plain text, not a pattern, and it is added to the same list for headings, table headers and labels.
```

**owt-next-action-glab** — `uds open-work next-action n.md`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=1 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (1): path-missing=0 not-resolvable=1
[owt] RESOLUTION: a path is looked up under <sandbox>/work/owt-next-action-glab (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/owt-next-action-glab, not against where the file is; pass --root to say where its paths start
[owt]   named-unresolved n.md table column "Next action" (line 3, row "a"): glab mr merge 486  <- command:glab mr
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**owt-waiting-on-reply** — `uds open-work next-action w.md --now 2026-01-12`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=0 unnamed=0 undecidable-table-rows=0 waiting-on-reply=1
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/owt-waiting-on-reply (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: w.md is outside any git repository, so its paths are resolved against <sandbox>/work/owt-waiting-on-reply, not against where the file is; pass --root to say where its paths start
[owt]   waiting-on-reply w.md table column "Next action" (line 3, row "vendor quote"): wait for the vendor reply
[owt] WAITING-ON-REPLY 1 row(s) are asked-awaiting and carry everything OWT-022 asks for, so OWT-019 is not applied to them (counted apart: not named, not resolved, not complete; 0 older than 7 day(s), UNCALIBRATED):
[owt]   w.md table column "Next action" (line 3, row "vendor quote"): asked 2d ago (2026-01-10); waiting for: the quote; released by: the quote arrives
[owt] WAITING-ON-REPLY LIMIT: the check decides that asked-at, what is waited for and the release event are present and well formed (OWT-022). It cannot decide that the request was really sent or that it is still unanswered (OWT-014, as for OWT-023). A row without all of them is judged by OWT-019 as before.
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**owt-blank-field-waiting** — `uds open-work waiting bad.md --now 2026-01-12`

```text
[owt] OWT-020/021/022 walked 1 record(s) with a status field in 1 carrier(s) (today 2026-01-12); 0 carrier(s) had none
[owt]   not-yet-asked=0 asked-awaiting=1 waiting-unspecified=0 done=0 other=0 undecidable-table-rows=0
[owt]   asked-awaiting       bad.md list item (line 1, "vendor quote"): vendor quote  (asked 2d ago)
[owt] VIOLATION OWT-022: bad.md list item (line 1, "vendor quote") is asked-awaiting but does not state what event releases it (OWT-002)
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**owt-blank-field-next-action** — `uds open-work next-action bad.md --now 2026-01-12`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=0 unnamed=1 undecidable-table-rows=0
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/owt-blank-field-next-action (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: bad.md is outside any git repository, so its paths are resolved against <sandbox>/work/owt-blank-field-next-action, not against where the file is; pass --root to say where its paths start
[owt]   unnamed          bad.md label (line 6): wait for the vendor reply
[owt] VIOLATION OWT-019: bad.md label (line 6) names no file path, test name, command or requirement identifier: "wait for the vendor reply"
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**beta6-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/beta6/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/beta6/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**beta6-simulate-no-verdict** — `uds simulate -s anti-hallucination -i test`

```text
Simulating compliance for: anti-hallucination
Input: test
──────────────────────────────────────────────────
⚠  Cannot simulate: no verdict was reached, so this is neither a pass nor a fail
   Standard 'anti-hallucination' does not support simulation (no 'simulator' spec defined).

Details:
Standards that can be simulated in this project: commit-message.
```

**beta6-simulate-pass** — `uds simulate -s commit-message -i "feat(api): add dept endpoint"`

```text
Simulating compliance for: commit-message
Input: feat(api): add dept endpoint
──────────────────────────────────────────────────
✓  Simulation Passed
Checked: header format <type>(<scope>): <subject>; type is one of: feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security (from .standards/options); rule scope-lowercase; rule subject-max-length
Not checked: rule imperative-mood (the standard gives no machine-checkable pattern); rule no-mixed-changes and the commit language option
```

**beta6-simulate-fail** — `uds simulate -s commit-message -i "add new dept api"`

```text
Simulating compliance for: commit-message
Input: add new dept api
──────────────────────────────────────────────────
✗  Simulation Failed: the input does not comply

Details:
- The first line is not in the form <type>(<scope>): <subject> (scope is optional).
Checked: header format <type>(<scope>): <subject>; rule subject-max-length
Not checked: rule imperative-mood (the standard gives no machine-checkable pattern); rule no-mixed-changes and the commit language option
```

**beta6-skills-all** — `uds skills`

```text
Universal Dev Standards - Installed Skills
──────────────────────────────────────────────────

● Project Level
  Version: 6.14.0-beta.9
  Path: <sandbox>/work/beta6/.claude/skills

  Skills (56):
    ✓ ac-coverage
    ✓ adr-assistant
    ✓ ai-collaboration-standards
    ✓ ai-friendly-architecture
    ✓ ai-instruction-standards
    ✓ api-design-assistant
    ✓ atdd-assistant
    ✓ audit-assistant
    ✓ bdd-assistant
    ✓ brainstorm-assistant
    ✓ changelog-guide
    ✓ checkin-assistant
    ✓ ci-cd-assistant
    ✓ code-review-assistant
    ✓ commit-standards
    ✓ comprehension-ladder
    ✓ contract-test-assistant
    ✓ database-assistant
    ✓ deploy-assistant
    ✓ dev-methodology
    ✓ dev-workflow-guide
    ✓ docs-generator
    ✓ documentation-guide
    ✓ durable-execution-assistant
    ✓ e2e-assistant
    ✓ error-code-guide
    ✓ git-workflow-guide
    ✓ incident-response-assistant
    ✓ journey-test-assistant
    ✓ knowledge-graph
    ✓ logging-guide
    ✓ metrics-dashboard-assistant
    ✓ migration-assistant
    ✓ observability-assistant
    ✓ orchestrate
    ✓ plan
    ✓ pr-automation-assistant
    ✓ project-discovery
    ✓ project-structure-guide
    ✓ push
    ✓ refactoring-assistant
    ✓ release-standards
    ✓ requirement-assistant
    ✓ retrospective-assistant
    ✓ reverse-engineer
    ✓ runbook-assistant
    ✓ security-assistant
    ✓ security-scan-assistant
    ✓ skill-builder
    ✓ slo-assistant
    ✓ spec-derivation
    ✓ spec-driven-dev
    ✓ sweep
    ✓ tdd-assistant
    ✓ test-coverage-assistant
    ✓ testing-guide

──────────────────────────────────────────────────
Total unique skills: 56 / 56
`uds check` tracks 116 skill files for these skills (it counts files across every tool, not skills).

Two ways to install UDS skills

  ● Into the project (the main path)
      uds init --skills-location project   (new project)
      uds update --apply --skills          (project already set up)
      - Works with many AI tools: Claude Code, OpenCode, Cur
... (127 characters omitted) ...
 English with a warning).
      - Follows the UDS version you installed, beta releases included.
      - You update it yourself: run the same command again after upgrading UDS.

  ● Claude Code plugin marketplace (an alternative, with limits)
      /plugin marketplace add AsiaOstrich/universal-dev-standards
      /plugin install universal-dev-standards@asia-ostrich
      - Claude Code only.
      - English skill texts only: the plugin settings have no language choice.
      - Follows stable releases only, so a beta of UDS gets no beta skills.
      - Puts no files in the project, so `uds check` cannot compare them file by file.

  Installing both lists every skill twice in Claude Code (for example /commit and /universal-dev-standards:commit). Pick one; `uds check` warns when it finds both.
```

**beta6-update-drops-ghost-names** — `uds update --apply --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Running declarative state reconciliation...

=== Reconciliation Plan ===

~ Migrate Block (1):
  ~ AGENTS.md (integration content differs from what would be generated)

Summary:
  Create: 0
  Update: 0
  Migrate Block: 1
  Delete: 0
  Unchanged: 130

- Applying reconciliation plan...
✔ Reconciliation complete: 1 succeeded
  Backup: .uds-backups/2026-10-10T16-03-18-410Z-0001
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.

Available upstream, not installed: none. Every standard UDS installs by default is already in this project.
Not listed above: 95 more standard(s) in categories `uds init` never installs (core 59, testing 15, integration 7, extension 5, security 5, deployment 2, operations 1, template 1). Any of them can still be installed by id with --add-standard.
```

**beta6-run-trailing-comment** — `uds run test`

```text
uds run test  ← uds.project.yaml
$ node "<sandbox>/work/beta6-run-trailing-comment/probe.js" "<sandbox>/work/beta6-run-trailing-comment/received.json" Tests.csproj
```

**beta6-run-dry-run** — `uds run test --dry-run`

```text
uds run test  ← uds.project.yaml
$ node "<sandbox>/work/beta6-run-trailing-comment/probe.js" "<sandbox>/work/beta6-run-trailing-comment/received.json" Tests.csproj

(dry-run mode — 未實際執行)
```

**beta6-spec-list-sdd** — `uds spec list`

```text
Micro-Specs

──────────────────────────────────────────────────────────────────────────────────────────
ID                                 Status                          Type      Title
──────────────────────────────────────────────────────────────────────────────────────────
SPEC-004-bare                      format: SDD (status not parsed) -         Bare Spec
SPEC-001-dept-api                  approved                        -         Department API Specificat
──────────────────────────────────────────────────────────────────────────────────────────
Total: 2
```

**beta6-deps-needs-package-json** — `uds deps`

```text
uds deps: no package.json at <sandbox>/work/beta6-deps-needs-package-json
```

**beta6-deps-if-present** — `uds deps --if-present`

```text
Not applicable: there is no package.json, so nothing was checked
```

**commit-warning-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/commit-warning/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/commit-warning/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**commit-warning-hook** — `git commit -m "feat: add app"`

```text
[master (root-commit) 7e84dfb] feat: add app
 1 file changed, 1 insertion(+)
 create mode 100644 src/app.js

Running UDS pre-commit checks...

Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

- Checking for CLI updates...
File Integrity:

  Summary: 74 unchanged, 0 modified, 0 missing

Skills File Integrity
  ✓ All skill files intact (116 files)

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  No AI tools configured

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    74 via copied documents

Upstream standards not installed: none
  ⚠ [error-exit] No single-exit check for error messages (scripts/check-error-exit.mjs).
    This gate stops every caller from turning an error response into its own human-readable string —
    the first one is the implementation; from the second on they drift apart, and the screen shows only "Bad Request".
    To install it: `uds update` shows its content and asks before writing it.

  ⚠ [test-change] This commit changes 1 code file(s) and touches no test file (XSPEC-444 R2). Warning only — the commit is not blocked.
    code files changed without a test change:
      - src/app.js
    A change to behavior needs a test that fails without it. Not a behavior change (generated code, a rename with edits)?
    Record the exemption with its reason in .standards/test-policy.json:  "exempt": [{ "pattern": "<glob>", "reason": "<why>" }]
    To make this block the commit instead: set "mode": "block" in .standards/test-policy.json.

  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found in the staged files
  ✓ [stub] scripts/check-stubs.mjs: nothing found in the staged files

✓ Project is compliant with standards

Pre-commit checks passed
```

**init-default-skills-into-project** — `uds init --yes`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/init-default/.claude/skills/)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/init-default/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**init-default-skills-check** — `uds check --ci`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

- Checking for CLI updates...
File Integrity:

  Summary: 74 unchanged, 0 modified, 0 missing

Skills File Integrity
  ✓ All skill files intact (116 files)

Integration UDS Block Integrity
  ✓ All UDS blocks intact (2 files)
    User customizations outside UDS blocks are preserved

Reference Sync Status:
  ℹ CLAUDE.md:
    Standards with no "Reference:"/"參考:" line in this file (optional):
      - developer-memory.ai.yaml
      - documentation-structure.ai.yaml
      - git-workflow.ai.yaml
      - project-context-memory.ai.yaml
      - project-structure.ai.yaml
      - refactoring-standards.ai.yaml
      - requirement-engineering.ai.yaml
      - spec-driven-development.ai.yaml

AI Tool Integration Status:
  ✓ CLAUDE.md:
    Standards index present
    74/74 standards referenced

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  Claude Code:
    ✓ Skills Installed:
      - Project: <sandbox>/work/init-default/.claude/skills/
        Version: 6.14.0-beta.9

  Tracked installations:
    - claude-code: project

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    37 via Skills
    74 via copied documents

Upstream standards not installed: none
  ⚠ [test-change] could not read the staged changes (error: unknown option `cached'); the code-without-test check did not run.
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

✓ Project is compliant with standards
```

**init-plugin-writes-no-skill-files** — `uds init --yes --skills-location marketplace`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: Plugin Marketplace (managed by Claude Code)
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  76 files copied to project
  Skills: Using Plugin Marketplace installation
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)

Skills: provided by the Claude Code plugin (no skill file was written to this project).
  Install the plugin in Claude Code: /plugin marketplace add AsiaOstrich/universal-dev-standards, then /plugin install universal-dev-standards@asia-ostrich
  The plugin works in Claude Code only, loads English skill texts only, follows stable releases only, and puts no files in the project.
  To put the skills into this project instead (many AI tools, Chinese texts): uds config --type skills --ai-tool claude-code --skills-location project --yes
```

**init-chinese-skill-texts-no-tool-marker** — `uds init --yes --locale zh-tw`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: 繁體中文
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Copying extensions...
✔ Copied 1 extension files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/init-zh-tw/.claude/skills/)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/init-zh-tw/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**init-help-default-is-project** — `uds init --help`

```text
Usage: uds init [options]

Initialize standards in current project

Options:
  -m, --mode <mode>             Installation mode (skills, full)
  -f, --format <format>         Standards format (ai, human, both)
  --workflow <workflow>         Git workflow (github-flow, gitflow, trunk-based)
  --merge-strategy <strategy>   Merge strategy (squash, merge-commit, rebase-ff)
  --output-lang <lang>          Output language (english, traditional-chinese,
                                bilingual)
  --test-levels <levels>        Test levels, comma-separated
                                (unit-testing,integration-testing,...)
  --lang <language>             Language extension (csharp, php)
  --framework <framework>       Framework extension (fat-free)
  --locale <locale>             Locale extension (zh-tw)
  --skills-location <location>  Skills location (project, user, marketplace,
                                none) [default: project]
  --content-mode <mode>         Content mode for integration files (minimal,
                                index) [default: index]; full is retired and
                                resolves to index
  --agents-md                   Generate AGENTS.md universal summary
  --no-agents-md                Skip AGENTS.md generation
  --with-hooks                  Install enforcement hooks declared by the
                                installed standards
  --content-layout <layout>     Content layout (flat, layered) [default: flat]
  --claude-target <target>      Claude Code integration target: project
                                (default, writes CLAUDE.md) or local (writes
                                CLAUDE.local.md — not committed to git;
                                gitignore it yourself)
  -y, --yes                     Use defaults, skip interactive prompts
  -E, --experimental            Enable experimental features (methodology)
  --force                       Bypass UDS source-repo self-adoption guard
                                (DEC-044 / XSPEC-071)
  -h, --help                    display help for command
```

**init-locale-pack-missing-is-said** — `{node} without-zh-tw.cjs {pkg} {work}`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: 繁體中文
  AI Tools: Claude Code
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Copying extensions...
✔ Copied 1 extension files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...

⚠ The zh-TW skill texts are not in this copy of UDS, so the skills were installed in English.
    The Traditional and Simplified Chinese texts ship inside the UDS npm package (the locales/ folder), so this is not about your network: this copy of UDS is incomplete or damaged.
    To get the zh-TW texts, reinstall UDS (npm install -g universal-dev-standards), then run: uds update --apply --skills --locale zh-tw
✔ Installed 56 Skills to Claude Code (<sandbox>/work/init-no-pack/proj/.claude/skills/)

✓ Standards initialized successfully!

  77 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/init-no-pack/proj/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)

CHINESE-SKILL-TEXT=false
```

**transient-lock-copy-retries** — `{node} --require {work}/lock-copy.cjs {bin} init --yes --skills-location project`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/transient-lock-copy-retries/.claude/skills/)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/transient-lock-copy-retries/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**transient-lock-gives-up-in-plain-words** — `{node} --require {work}/lock-copy.cjs {bin} init --yes --skills-location project`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 73 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/transient-lock-gives-up-in-plain-words/.claude/skills/)

Installation failed and was rolled back: Transaction verification failed for uds init
    ai/standards/error-codes.ai.yaml: Could not copy "<sandbox>/install/node_modules/universal-dev-standards/bundled/ai/standards/error-codes.ai.yaml" to "<sandbox>/work/transient-lock-gives-up-in-plain-words/.standards/error-codes.ai.yaml": the file is locked by another program (EBUSY). UDS tried 10 times over 3.3 s and the lock did not clear. Likely causes: antivirus real-time scanning, the Windows search indexer, a cloud-sync client (OneDrive, Dropbox) or an editor that has the file open. Close whatever is using the file or add the project folder to the antivirus exclusions, then run the command again. (Original error: EBUSY: resource busy or locked, copyfile)
```

**tautology-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/tautology/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/tautology/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**tautology-scan** — `{node} scripts/check-anti-fake-tests.mjs`

```text
check-anti-fake-tests: scanned 1 test file(s), 3 test case(s) (whole project)
  ✗ tests/cart.test.js:1  tautology  "totals: one call written on both sides" — its only assertion(s) are not independent of the code under test: the expected value is the same call as the code under test (same function, same arguments) (see verification-oracle)
  ✗ tests/cart.test.js:4  tautology  "totals: the expected value re-adds the items" — its only assertion(s) are not independent of the code under test: the expected value is recomputed from the same input as the code under test (reduce/map/filter with a callback that uses only its own parameters), so it is not an independent oracle (see verification-oracle)
RESULT: 2 finding(s)
```

**std-merge-danger** — `(read the files; no command | 讀檔，不執行指令)`

```text
(no output)
```

**audit-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/r4c-audit/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/r4c-audit/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**audit-health-only** — `uds audit --health`

```text
UDS Audit Report
══════════════════════════════════════════════════

Health Check
────────────────────────────────────────
  ✓ All files intact

No issues found. Your UDS installation is healthy!
```

**audit-format-json** — `uds audit --format json`

```text
{
  "timestamp": "2026-10-10T16:03:28.650Z",
  "udsVersion": "6.14.0-beta.9",
  "nodeVersion": "v20.20.2",
  "health": {
    "status": "OK",
    "issues": [
      {
        "severity": "INFO",
        "component": ".standards/",
        "message": "74 files tracked: 74 intact, 0 modified, 0 missing"
      }
    ]
  },
  "patterns": [],
  "frictions": [],
  "reportUrl": "https://github.com/AsiaOstrich/universal-dev-standards/issues/new?title=%5BAudit%5D+No+issues&body=%23%23+UDS+Audit+Feedback+%7C+UDS+%E5%AF%A9%E8%A8%88%E5%9B%9E%E9%A5%8B%0A%0A**UDS+Version**%3A+6.14.0-beta.9%0A**Node+Version**%3A+v20.20.2%0A**OS**%3A+darwin+arm64%0A&labels="
}
```

**audit-quiet** — `uds audit --quiet`

```text
Health: OK | Patterns: 0 | Frictions: 0
```

**audit-score** — `uds audit --score`

```text
Standards Health Score
══════════════════════════════════════════════════

  Overall: 75/100
  Mode:    consumer

  Completeness: 86/100
  Freshness: 100/100
  Consistency: 95/100
  Coverage: 0/100
```

**audit-score-self** — `uds audit --score --self`

```text
Standards Health Score
══════════════════════════════════════════════════

  Overall: 75/100
  Mode:    self

  Completeness: 86/100
  Freshness: 100/100
  Consistency: 95/100
  Coverage: 0/100
```

**audit-score-format-json** — `uds audit --score --format json`

```text
{
  "score": 75,
  "mode": "consumer",
  "dimensions": {
    "completeness": {
      "score": 86,
      "details": {
        "ai_yaml": 64,
        "total": 74
      }
    },
    "freshness": {
      "score": 100,
      "details": {
        "recent_30d": 64,
        "aging_90d": 0,
        "stale_180d": 0,
        "outdated": 0,
        "outdated_list": []
      }
    },
    "consistency": {
      "score": 95,
      "details": {
        "manifest_valid": true,
        "declared": 74,
        "present": 67,
        "total_checkable": 74
      }
    },
    "coverage": {
      "score": 0,
      "details": {
        "has_check_script": 0,
        "total": 74
      }
    }
  },
  "timestamp": "2026-10-10T16:03:29.492Z"
}
```

**audit-score-ci-threshold-met** — `uds audit --score --ci --threshold 0`

```text
75
```

**audit-score-ci-threshold-missed** — `uds audit --score --ci --threshold 101`

```text
75
```

**audit-score-save** — `uds audit --score --save`

```text
Standards Health Score
══════════════════════════════════════════════════

  Overall: 75/100
  Mode:    consumer

  Completeness: 86/100
  Freshness: 100/100
  Consistency: 95/100
  Coverage: 0/100
```

**audit-score-trend** — `uds audit --score --trend`

```text
Standards Health Score
══════════════════════════════════════════════════

  Overall: 75/100
  Mode:    consumer

  Completeness: 86/100
  Freshness: 100/100
  Consistency: 95/100
  Coverage: 0/100

Trend
────────────────────────────────────────
  2026-10-10: 75
```

**audit-patterns-only** — `uds audit --patterns`

```text
UDS Audit Report
══════════════════════════════════════════════════

Patterns Detected (2)
────────────────────────────────────────
  [MEDIUM]   monitoring
           Evidence: monitoring/
           Suggested: New "monitoring" standard
  [MEDIUM]   containerization
           Evidence: Dockerfile
           Suggested: New "containerization" standard

Submit feedback: uds audit --report
```

**audit-effects-finding** — `uds audit --effects --effects-config effects.json`

```text
[effect-boundary] Boundary surface derived from this runtime (not a hand-written allowlist):
                 4 module form(s)  [process-spawn]  roots=child_process,cluster — starts another OS process — the clearest possible cross-process effect
                 4 module form(s)  [filesystem]  roots=fs — reads or writes state that outlives this process
                 6 module form(s)  [network-socket]  roots=net,dgram,tls — opens a socket to something outside this process
                 6 module form(s)  [network-protocol]  roots=http,https,http2 — HTTP family — the usual shape of "call the platform API"
                 4 module form(s)  [name-resolution]  roots=dns — a DNS lookup is itself a round trip out of the process
                 2 module form(s)  [thread-boundary]  roots=worker_threads — worker_threads crosses a scheduling boundary and can hold its own handles
               2 import-free global API(s) present in this runtime: fetch, process.dlopen
               2 global candidate(s) absent here, so not counted: WebSocket, EventSource
               native addon entry is not a builtin family; detected via: a specifier ending in .node / process.dlopen
               total: 26 boundary module forms out of 68 builtins
  ✓ control (positive): a known-real implementation reports 2 boundary hit(s)
  ✓ control (negative): a known-pure computation reports 0 boundary hit(s)
  ✓ control (type-only imports): 2/2 skipped, 0 boundary hit(s) counted
  ✓ control (domain extractor): known concatenated domains extracted 2/2 → *.api.probe-fixture.invalid, *.probe-fixture.invalid
  ✓ control (boundary surface): 26 module forms derived from 68 builtins; every family rule matched at least one
[effect-boundary] Walked 2 source file(s) under <sandbox>/work/r4c-audit-effects
[effect-boundary] 1 declared family/families → 2 member(s), 0 excluded by the families' own exclude globs
               family 'deploy-adapters': include=["src/adapters/*.adapter.js"] matched 2, exclud
... (34 characters omitted) ...
0.5
[effect-boundary] R7-c domain audit: NOT RUN — config declares no `ownedDomains` source.
               This is an opt-in gap, stated loudly on purpose: no domain in this codebase was checked against anything.

[effect-boundary] ✗ 1 effect implementation(s) reach nothing outside this process:
  ✗ [deploy-adapters] src/adapters/pure.adapter.js
      zero boundary hits across its whole reachable graph (1 file(s)) — and its family median is 0.5, so siblings in the same family do reach the outside world
      (corroboration: siblings in this family do reach the outside)

  Three ways out: implement the effect; make it fail honestly (see R7-b — a NOT_IMPLEMENTED
  marker with no success-shaped return is legal and needs no allowlist); or add a baseline row
  with an expiry date and a reason.
```

**audit-effects-clean-json** — `uds audit --effects --effects-config effects.json --format json`

```text
{
  "exitCode": 0,
  "report": [
    "[effect-boundary] Boundary surface derived from this runtime (not a hand-written allowlist):",
    "                 4 module form(s)  [process-spawn]  roots=child_process,cluster — starts another OS process — the clearest possible cross-process effect",
    "                 4 module form(s)  [filesystem]  roots=fs — reads or writes state that outlives this process",
    "                 6 module form(s)  [network-socket]  roots=net,dgram,tls — opens a socket to something outside this process",
    "                 6 module form(s)  [network-protocol]  roots=http,https,http2 — HTTP family — the usual shape of \"call the platform API\"",
    "                 4 module form(s)  [name-resolution]  roots=dns — a DNS lookup is itself a round trip out of the process",
    "                 2 module form(s)  [thread-boundary]  roots=worker_threads — worker_threads crosses a scheduling boundary and can hold its own handles",
    "               2 import-free global API(s) present in this runtime: fetch, process.dlopen",
    "               2 global candidate(s) absent here, so not counted: WebSocket, EventSource",
    "               native addon entry is not a builtin family; detected via: a specifier ending in .node / process.dlopen",
    "               total: 26 boundary module forms out of 68 builtins",
    "  ✓ control (positive): a known-real implementation reports 2 boundary hit(s)",
    "  ✓ control (negative): a known-pure computation reports 0 boundary hit(s)",
    "  ✓ control (type-only imports): 2/2 skipped, 0 boundary hit(s) counted",
    "  ✓ control (domain extractor): known concatenated domains extracted 2/2 → *.api.probe-fixture.invalid, *.probe-fixture.invalid",
    "  ✓ control (boundary surface): 26 module forms derived from 68 builtins; every family rule matched at least one",
    "[effect-boundary] Walked 1 source file(s) under <sandbox>/work/r4c-audit-effects-clean",
    "[effect-boundary] 1 declared family/f
... (4038 characters omitted) ...
        "declaresNotImplemented": false,
              "claimsSuccess": false
            },
            "domains": [
              {
                "host": "example.invalid",
                "registrable": "example.invalid",
                "decidable": true,
                "dynamic": false,
                "why": null,
                "file": "src/adapters/net.adapter.js"
              }
            ],
            "verdict": "GREEN",
            "reason": "1 boundary hit(s) across 1 file(s)"
          }
        ],
        "median": 1,
        "hasControlGroup": true
      }
    ],
    "domainAudit": {
      "requested": false,
      "owned": {
        "ok": false,
        "reason": "not-declared"
      },
      "extracted": 1,
      "violations": [],
      "undecidable": []
    }
  }
}
```

**audit-effects-config-missing** — `uds audit --effects --effects-config no-such-config.json`

```text
[effect-boundary] FATAL: no effect-family config at <sandbox>/work/r4c-audit-effects-missing/no-such-config.json
  This gate asks whether each implementation of an effect interface reaches
  anything outside this process. It cannot answer that without being told
  which implementations form a family.

  Declare them by glob in .uds/effect-boundary.json (or pass --effects-config <path>):
    { "families": [ { "name": "deploy-adapters",
                      "include": ["src/**/adapters/*.adapter.ts"] } ] }

  Declared by glob, not by a list of filenames: a glob keeps matching the
  adapter nobody has written yet, which is the one this gate exists to catch.

  Exiting 2 (cannot measure), not 0. A gate with nothing to check must not print a green tick.
```

**audit-health-missing-file** — `uds audit --health`

```text
UDS Audit Report
══════════════════════════════════════════════════

Health Check
────────────────────────────────────────
  ⚠ anti-hallucination.ai.yaml: Standard file listed in manifest but missing from .standards/
       Fix: Run `uds check --restore-missing` to restore
  ⚠ .standards/anti-hallucination.ai.yaml: File missing (tracked in manifest)
       Fix: Run `uds check --restore-missing` to restore

Submit feedback: uds audit --report
```

**config-set-project** — `uds config set demo.flag hello`

```text
Configuration updated (project): demo.flag = hello
```

**config-get** — `uds config get demo.flag`

```text
hello
```

**config-list** — `uds config list`

```text
Current Configuration:
{
  "ui": {
    "language": "en",
    "emoji": true
  },
  "hitl": {
    "threshold": 2
  },
  "vibe-coding": {
    "enabled": false
  },
  "updateCheck": {
    "enabled": true,
    "intervalMs": 86400000
  },
  "demo": {
    "flag": "hello"
  }
}
```

**config-yes-shows-configuration** — `uds config --yes`

```text
Current Configuration:
{
  "ui": {
    "language": "en",
    "emoji": true
  },
  "hitl": {
    "threshold": 2
  },
  "vibe-coding": {
    "enabled": false
  },
  "updateCheck": {
    "enabled": true,
    "intervalMs": 86400000
  },
  "demo": {
    "flag": "hello"
  }
}
```

**config-set-global** — `uds config set demo.scope from-global --global`

```text
Configuration updated (global): demo.scope = from-global
```

**config-get-reads-global** — `uds config get demo.scope`

```text
from-global
```

**hitl-check-blocks-in-noninteractive** — `uds hitl check --op "npm install left-pad"`

```text
HITL Checkpoint triggered in non-interactive mode.
   Operation: npm install left-pad
   Action: Blocked (Safety First)
❌ Denied
```

**hitl-check-requires-op** — `uds hitl check`

```text
Error: --op <operation> is required
```

**hitl-config-raises-threshold** — `uds config set hitl.threshold 4 --global`

```text
Configuration updated (global): hitl.threshold = 4
```

**hitl-check-approves-under-raised-threshold** — `uds hitl check --op "npm install left-pad"`

```text
✅ Approved
```

**config-init-vibe-mode** — `uds config init --vibe-mode --yes`

```text
Vibe Coding Configuration
Configure UDS for natural language-driven development


Applying preset: Balanced (Recommended)
──────────────────────────────────────────────────
  hitl.threshold: 2
  vibe-coding.enabled: true
  vibe-coding.micro-specs.require-confirmation: true
  vibe-coding.auto-sweep.enabled: true
  vibe-coding.auto-sweep.trigger: session-end
  vibe-coding.standards-injection.mode: soft
──────────────────────────────────────────────────

Vibe Coding mode enabled!

Next steps:
  • Generate specs: uds spec create "your idea"
  • Clean up code: /sweep (AI assistant skill)
  • Explore recipes: uds quickstart
```

**config-init-project** — `uds init -y --skills-location none --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  75 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**config-type-skills** — `uds config --type skills --ai-tool claude-code --skills-location project --yes`

```text
Universal Development Standards - Configure
──────────────────────────────────────────────────

Current Configuration:
  Display Language: English
  Format: ai
  Content Mode: minimal
  AI Tools: none
  Git Workflow: github-flow
  Release Mode: CI/CD
  Merge Strategy: squash
  Output Language: english
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing

- Installing Skills for Claude Code (project level)...
Skills installed for Claude Code
```

**config-experimental** — `uds config --type skills --ai-tool claude-code --skills-location project --yes -E`

```text
Universal Development Standards - Configure
──────────────────────────────────────────────────

Current Configuration:
  Display Language: English
  Format: ai
  Content Mode: minimal
  AI Tools: none
  Methodology: TDD [Experimental]
  Git Workflow: github-flow
  Release Mode: CI/CD
  Merge Strategy: squash
  Output Language: english
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing

- Installing Skills for Claude Code (project level)...
Skills installed for Claude Code
```

**configure-init-project** — `uds init -y --skills-location none --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  75 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**configure-type-skills** — `uds configure --type skills --ai-tool claude-code --skills-location project --yes`

```text
Universal Development Standards - Configure
──────────────────────────────────────────────────

Current Configuration:
  Display Language: English
  Format: ai
  Content Mode: minimal
  AI Tools: none
  Git Workflow: github-flow
  Release Mode: CI/CD
  Merge Strategy: squash
  Output Language: english
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing

- Installing Skills for Claude Code (project level)...
Skills installed for Claude Code
```

**configure-experimental** — `uds configure --type skills --ai-tool claude-code --skills-location project --yes -E`

```text
Universal Development Standards - Configure
──────────────────────────────────────────────────

Current Configuration:
  Display Language: English
  Format: ai
  Content Mode: minimal
  AI Tools: none
  Methodology: TDD [Experimental]
  Git Workflow: github-flow
  Release Mode: CI/CD
  Merge Strategy: squash
  Output Language: english
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing

- Installing Skills for Claude Code (project level)...
Skills installed for Claude Code
```

**agent-list** — `uds agent list`

```text
📦 UDS Agents
──────────────────────────────────────────────────

Available Agents:

  ● code-architect
    Software architecture specialist for system design and te...
    Expertise: system-design, api-design, database-modeling, design-patterns, scalability, microservices

  ● doc-writer
    Documentation specialist for technical writing, API docs,...
    Expertise: technical-writing, api-documentation, user-guides, readme-creation, changelog-writing, architecture-docs

  ◇ reviewer
    Code review specialist for quality assessment, security a...
    Expertise: code-review, security-analysis, best-practices, performance-review, maintainability

  ● spec-analyst
    Specification analysis specialist for requirement extract...
    Expertise: requirement-analysis, specification-writing, user-stories, acceptance-criteria, reverse-engineering, domain-modeling

  ● test-specialist
    Testing strategy specialist for test design, coverage ana...
    Expertise: test-strategy, tdd, bdd, unit-testing, integration-testing, e2e-testing, coverage-analysis

──────────────────────────────────────────────────
Supported AI Tools:

  ● Claude Code [task]
  ● OpenCode [task]
  ○ Cursor [inline]
  ○ Cline [inline]
  ● Roo Code [task]
  ○ OpenAI Codex [inline]
  ○ GitHub Copilot [inline]
  ○ Windsurf [inline]
  ○ Gemini CLI [inline]

Legend:
  ● Full Task tool support (subagent execution)
  ○ Inline mode (context injection)
```

**agent-info** — `uds agent info code-architect`

```text
📦 Agent: code-architect
──────────────────────────────────────────────────

Name: code-architect
Role: specialist
Version: 1.1.0

Description:
Software architecture specialist for system design and technical planning. Use when: designing systems, planning architecture, evaluating patterns, creating technical proposals. Keywords: architecture, system design, design patterns, technical design, API design, database modeling, 架構, 系統設計, 技術設計.

Expertise:
  • system-design
  • api-design
  • database-modeling
  • design-patterns
  • scalability
  • microservices

Allowed Tools:
  ✓ Read
  ✓ Glob
  ✓ Grep
  ✓ Bash(git:*)
  ✓ WebFetch
  ✓ WebSearch

Disallowed Tools:
  ✗ Write
  ✗ Edit

Skill Dependencies:
  • spec-driven-dev
  • project-structure-guide

Triggers:
  Keywords: architecture, system design, design pattern, scalability, API design, database schema, 架構設計, 系統設計
  Commands: /architect
```

**agent-install-project** — `uds agent install code-architect --yes`

```text
📦 Install UDS Agents
──────────────────────────────────────────────────

Installing agents for Claude Code...

✓ Installed 1 agent(s)
  ✓ code-architect

Location: <sandbox>/work/r4c-agent/.claude/agents/

Agents will be executed as subagents using Task tool.
```

**agent-install-tool** — `uds agent install test-specialist --tool opencode --yes`

```text
📦 Install UDS Agents
──────────────────────────────────────────────────

Installing agents for OpenCode...

✓ Installed 1 agent(s)
  ✓ test-specialist

Location: <sandbox>/work/r4c-agent/.opencode/agents/

Agents will be executed as subagents using Task tool.
```

**agent-install-global** — `uds agent install doc-writer --global --yes`

```text
📦 Install UDS Agents
──────────────────────────────────────────────────

Installing agents for Claude Code...

✓ Installed 1 agent(s)
  ✓ doc-writer

Location: <sandbox>/home/r4c-agent/.claude/agents

Agents will be executed as subagents using Task tool.
```

**agent-list-installed** — `uds agent list --installed`

```text
📦 UDS Agents
──────────────────────────────────────────────────

Available Agents:

  ● code-architect
    Software architecture specialist for system design and te...
    Expertise: system-design, api-design, database-modeling, design-patterns, scalability, microservices

  ● doc-writer
    Documentation specialist for technical writing, API docs,...
    Expertise: technical-writing, api-documentation, user-guides, readme-creation, changelog-writing, architecture-docs

  ◇ reviewer
    Code review specialist for quality assessment, security a...
    Expertise: code-review, security-analysis, best-practices, performance-review, maintainability

  ● spec-analyst
    Specification analysis specialist for requirement extract...
    Expertise: requirement-analysis, specification-writing, user-stories, acceptance-criteria, reverse-engineering, domain-modeling

  ● test-specialist
    Testing strategy specialist for test design, coverage ana...
    Expertise: test-strategy, tdd, bdd, unit-testing, integration-testing, e2e-testing, coverage-analysis

──────────────────────────────────────────────────
Installation Status:

  Claude Code [task]
    ✓ Project: 1 agents
    ✓ User: 1 agents

  OpenCode [task]
    ✓ Project: 1 agents

──────────────────────────────────────────────────
Supported AI Tools:

  ● Claude Code [task]
  ● OpenCode [task]
  ○ Cursor [inline]
  ○ Cline [inline]
  ● Roo Code [task]
  ○ OpenAI Codex [inline]
  ○ GitHub Copilot [inline]
  ○ Windsurf [inline]
  ○ Gemini CLI [inline]

Legend:
  ● Full Task tool support (subagent execution)
  ○ Inline mode (context injection)
```

**ai-context-init** — `uds ai-context init --yes`

```text
🤖 AI Context Configuration Generator
──────────────────────────────────────────────────


✅ Created .ai-context.yaml
   <sandbox>/work/r4c-ai-context-init/.ai-context.yaml

Configuration Summary:
  Project: r4c-ai-context-init
  Type: web-app
  Language: typescript
  Modules: 2 detected

Detected Modules:
  • api - src/api/
  • db - src/db/

Next steps:
  1. Review and customize .ai-context.yaml
  2. Add module descriptions
  3. Create QUICK-REF.md files for key modules
```

**ai-context-init-keeps-existing** — `uds ai-context init --yes`

```text
🤖 AI Context Configuration Generator
──────────────────────────────────────────────────

⚠️  .ai-context.yaml already exists.
   Use --force to overwrite.
```

**ai-context-init-force** — `uds ai-context init --force --yes`

```text
🤖 AI Context Configuration Generator
──────────────────────────────────────────────────


✅ Created .ai-context.yaml
   <sandbox>/work/r4c-ai-context-force/.ai-context.yaml

Configuration Summary:
  Project: r4c-ai-context-force
  Type: web-app
  Language: typescript
  Modules: 0 detected

Next steps:
  1. Review and customize .ai-context.yaml
  2. Add module descriptions
  3. Create QUICK-REF.md files for key modules
```

**ai-context-validate-valid** — `uds ai-context validate`

```text
🔍 Validating .ai-context.yaml
──────────────────────────────────────────────────

✅ Configuration is valid!
```

**ai-context-validate-verbose** — `uds ai-context validate --verbose`

```text
🔍 Validating .ai-context.yaml
──────────────────────────────────────────────────

✅ Configuration is valid!

Configuration:
version: 1.0.0
project:
  name: acme
  type: web-app
  primary-language: typescript
modules:
  - name: api
    path: src/api/
    description: HTTP layer
    dependencies:
      - db
    priority: high
  - name: db
    path: src/db/
    description: storage
    dependencies: []
    priority: low
documentation:
  quick-ref: QUICK-REF.md
context-strategy:
  max-chunk-size: 50000
  analysis-pattern: hierarchical
```

**ai-context-validate-invalid** — `uds ai-context validate`

```text
🔍 Validating .ai-context.yaml
──────────────────────────────────────────────────

❌ 3 error(s):
   • Missing project.name
   • Module 0: missing path
   • context-strategy.analysis-pattern must be one of: hierarchical, parallel, sequential
```

**ai-context-graph** — `uds ai-context graph`

```text
📊 Module Dependency Graph
──────────────────────────────────────────────────

Modules:
  ● api
    Path: src/api/
    Desc: HTTP layer
    Deps: db

  ● db
    Path: src/db/
    Desc: storage
```

**ai-context-graph-mermaid** — `uds ai-context graph --mermaid`

```text
📊 Module Dependency Graph
──────────────────────────────────────────────────

Modules:
  ● api
    Path: src/api/
    Desc: HTTP layer
    Deps: db

  ● db
    Path: src/db/
    Desc: storage

──────────────────────────────────────────────────
Mermaid Diagram:

'''mermaid
graph TD
    api[api] --> db[db]
    db[db]
'''
```

**release-help-manual** — `uds release`

```text
uds release — 版本發布管理
────────────────────────────────────────
  目前模式: manual

  可用子命令:
    promote <version>     RC → Stable 晉升
    deploy <env>          記錄部署紀錄
    deploy <env> --result  更新測試結果
    manifest              產生 build-manifest.json
    verify [--artifact <path>]  驗證 manifest 一致性（含 checksum 比對）
```

**release-promote** — `uds release promote 1.2.0`

```text
Release Promote: RC → Stable
────────────────────────────────────────
  目前版本: 1.2.0-rc.1
  晉升目標: 1.2.0

這個指令不會建立晉升紀錄，也不會建立 Git tag；它只列出下一步要執行的事。

下一步（由你執行）:
  1. 更新版本檔案為 1.2.0
  2. git tag v1.2.0
  3. 從此 commit 重新打包
  4. 執行 uds release deploy production 記錄部署
```

**release-promote-creates-no-tag** — `{node} tag-count.mjs`

```text
tags: 0
```

**release-deploy-staging** — `uds release deploy staging`

```text
✓ 已記錄部署: 1.2.0-rc.1 → staging
  部署者: unknown
  時間: 2026-10-10T16:03:38.199Z

後續步驟:
  測試完成後執行:
  uds release deploy staging --result passed
```

**release-deploy-result** — `uds release deploy staging --result passed`

```text
✓ 已更新 1.2.0-rc.1 在 staging 的結果: passed
```

**release-manifest-checksum** — `uds release manifest --checksum e45f458d1f60c197d80e68c904a2bfe5ba90f7f439d01423977f72a458c8c5cb`

```text
✓ build-manifest.json 已產生
  版本: 1.2.0-rc.1
  Commit: 11fce01
  分支: master
  建置者: unknown
  時間: 2026-10-10T16:03:38.587Z
```

**release-verify-artifact** — `uds release verify --artifact app.bin`

```text
✓ Manifest 驗證通過
  版本: 1.2.0-rc.1
  Commit: 11fce01 (一致)
  Checksum: e45f458d1f60c197d80e68c904a2bfe5ba90f7f439d01423977f72a458c8c5cb (一致)
  Staging: 已通過 ✓
```

**release-verify-wrong-artifact** — `uds release verify --artifact other.bin`

```text
✗ Manifest 驗證失敗
  - checksum mismatch: manifest records "e45f458d1f60c197d80e68c904a2bfe5ba90f7f439d01423977f72a458c8c5cb", artefact computes to "2141a1a59aa3d27d0ee1df3c1bc8f13c9f838b3f64738df0b2809223d2414f44"
  Staging: 已通過 ✓
```

**release-verify-missing-artifact** — `uds release verify --artifact not-there.bin`

```text
找不到 artifact：not-there.bin
```

**mcp-serve-answers-requests** — `uds mcp serve`

```text
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"uds-design-standards","version":"1.0.0"}}}
{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"get_design_token","description":"Get the DESIGN.md content for a project, or return the UDS DESIGN.md template if not found","inputSchema":{"type":"object","properties":{"project_path":{"type":"string","description":"Absolute or relative path to the project root"}},"required":["project_path"]}},{"name":"get_design_standards","description":"Get the UDS frontend design standards (frontend-design-standards.ai.yaml)","inputSchema":{"type":"object","properties":{}}},{"name":"validate_design_token","description":"Validate a DESIGN.md file against UDS frontend design standards","inputSchema":{"type":"object","properties":{"design_md_path":{"type":"string","description":"Path to the DESIGN.md file to validate"}},"required":["design_md_path"]}}]}}
{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"# Frontend Design Standards - AI Optimized\n# Source: core/frontend-design-standards.md\n# Based on: DEC-029 (awesome-design-md, MIT), DEC-030 (OpenAI Frontend Guide)\n# Version: 1.1.0\n\nid: frontend-design-standards\nmeta:\n  version: \"1.1.0\"\n  updated: \"2026-07-10\"\n  source: core/frontend-design-standards.md\n  description: |\n    DESIGN.md 前端設計標準：9 段結構、語義色彩 token、字體角色、\n    間距比例、UI 硬性約束與 anti-pattern 清單。\n    適用所有含前端介面的專案。\n    v1.1.0 新增選填擴充：YAML frontmatter token 註冊表 +\n    {category.token} 內插語法 + components 結構化綁定\n    （借鑑 DEC-029 上游演化，Trial，不影響既有 5-token 治理收斂）。\n\n# DESIGN.md 必填 9 段結構\ndesign_md_sections:\n  - id: visual-theme\n    name: Visual Theme & Mood\n    required: true\n    fields:\n      theme: \"一行風格描述（例：Minimal, professional, data-dense）\"\n      mood: \"情感品質（例：Calm, focused, trustworthy）\"\n      inspiration: \"參考產品或設計風格（例：Linear, Stripe dashboard）\"\n      dark_mode: \"primary | secondary | unsupported\"\n\n  - id: color-palette\n    
... (15179 characters omitted) ...
 / sm：單欄佈局\n- md+：多欄佈局\n- 行動裝置觸控目標最小 **44×44px**\n- 導覽列在 sm 以下收合為漢堡選單或底部導覽列\n- [填入：其他專案特定的響應式規則]\n\n---\n\n## 9. Agent Prompt References\n\n<!-- FILL: AI Agent 快速讀取的設計意圖摘要。\nAI Agent 應優先讀取此段落作為生成 UI 的整體定向。\nStyle Summary 限 1–2 句，Key Constraints 使用條列式。 -->\n\n### Style Summary\n\n[填入 1–2 句描述整體設計意圖。例：\n「深色、簡約、以數據為核心的介面。專業美學，優先考慮資訊清晰度而非裝飾性。」]\n\n### Key Constraints for AI Generation\n\n- 所有顏色必須使用語義 token 名稱（background, surface, accent），禁止在元件中硬編碼 hex 值\n- 每頁只有 1 個 H1；區段數量 ≤ 6\n- `accent` 是唯一允許的強調色\n- [填入：其他最關鍵的設計約束]\n\n### Tone\n\n[填入設計應帶給使用者的感受。例：「沉穩、自信、技術感。類似 Linear 或 Vercel 的 Dashboard 美學。」]\n"}]}}
{"jsonrpc":"2.0","id":5,"result":{"content":[{"type":"text","text":"{\n  \"valid\": true,\n  \"missing_sections\": [],\n  \"warnings\": []\n}"}]}}

UDS MCP Design Standards Server started (stdio)
```

**mcp-serve-root-option-is-refused** — `uds mcp serve --root elsewhere`

```text
error: unknown option '--root'
```

**list-every-counted-standard-is-shown** — `{node} list-total.mjs {bin}`

```text
listed 163 of 163 standards
```

**list-shows-every-category** — `uds list`

```text
Universal Development Standards
──────────────────────────────────────────────────
Version: 6.14.0-beta.9

Skill (41)
  Anti-Hallucination Guidelines → ai-collaboration-standards
       core/anti-hallucination.md
  AI-Friendly Architecture → ai-friendly-architecture
       core/ai-friendly-architecture.md
  Commit Message Guide → commit-standards
       core/commit-message-guide.md
  Code Check-in Standards → checkin-assistant
       core/checkin-standards.md
  Spec-Driven Development → spec-driven-dev
       core/spec-driven-development.md
  Code Review Checklist → code-review-assistant
       core/code-review-checklist.md
  Git Workflow Guide → git-workflow-guide
       core/git-workflow.md
  Semantic Versioning → release-standards
       core/versioning.md
  Changelog Standards → release-standards
       core/changelog-standards.md
  Testing Standards → testing-guide
       core/testing-standards.md
  Full Coverage Testing Standards → testing-guide
       core/full-coverage-testing.md
  Documentation Structure → documentation-guide
       core/documentation-structure.md
  AI Instruction File Standards → ai-instruction-standards
       core/ai-instruction-standards.md
  Project Structure → project-structure-guide
       core/project-structure.md
  Error Code Standards → error-code-guide
       core/error-code-standards.md
  Logging Standards → logging-guide
       core/logging-standards.md
  Test Completeness Dimensions → test-coverage-assistant
       core/test-completeness-dimensions.md
  Flow-Based Testing → e2e-assistant
       core/flow-based-testing.md
  Mock Boundary Standards → testing-guide
       core/mock-boundary.md
  Security Testing Standards → security-scan-assistant
       core/security-testing.md
  Mutation Testing Standards → test-coverage-assistant
       core/mutation-testing.md
  Test-Driven Development → tdd-assistant
       core/test-driven-development.md
  Behavior-Driven Development → bdd-assistant
       core/behavior-driven-development.m
... (9487 characters omitted) ...
ructions
       integrations/github-copilot/copilot-instructions.md
  Cursor Rules
       integrations/cursor/.cursorrules
  Windsurf Rules
       integrations/windsurf/.windsurfrules
  Cline Rules
       integrations/cline/.clinerules
  Google Antigravity Instructions
       integrations/google-antigravity/AGENTS.md
  OpenSpec Integration
       integrations/openspec/
  Spec Kit Integration
       integrations/spec-kit/

Template (1)
  Migration Plan Template
       templates/migration-template.md
       Applies to: Migration projects

──────────────────────────────────────────────────
Total: 163 standards (37 with Skills, 126 reference-only)

Run `uds init` to adopt standards in your project.
See: https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md
```

**list-category-core** — `uds list --category core`

```text
Universal Development Standards
──────────────────────────────────────────────────
Version: 6.14.0-beta.9

Category: Core Standard
Core development standards that apply across projects: governance, agent behavior, observability, workflow discipline. Not installed by uds init.

Core Standard (59)
  Governance Layer Standard
       core/governance-layer.md
  Anti-Sycophancy Prompting Standards
       core/anti-sycophancy-prompting.md
  Agent Behavior Discipline
       core/agent-behavior-discipline.md
  Turn Completion Integrity
       core/turn-completion-integrity.md
  Observability Standards
       core/observability-standards.md
  SLO Standards
       core/slo-standards.md
  Alerting Standards
       core/alerting-standards.md
  Runbook Standards
       core/runbook-standards.md
  Postmortem Standards
       core/postmortem-standards.md
  Tech Debt Management Standards
       core/tech-debt-standards.md
  Feature Flag Standards
       core/feature-flag-standards.md
  Environment Standards
       core/environment-standards.md
  Containerization Standards
       core/containerization-standards.md
  Deprecation & Sunset Standards
       core/deprecation-standards.md
  Knowledge Transfer Standards
       core/knowledge-transfer-standards.md
  Test Data Management Standards
       core/test-data-standards.md
  Chaos Engineering Standards
       core/chaos-engineering-standards.md
  Supply Chain Security Standards
       core/supply-chain-security-standards.md
  Estimation Standards
       core/estimation-standards.md
  Design Document Standards
       core/design-document-standards.md
  Privacy Standards
       core/privacy-standards.md
  Frontend Design Standards
       core/frontend-design-standards.md
  Dual-Phase LLM Output Standard
       core/dual-phase-output.md
  Circuit Breaker Standard
       core/circuit-breaker.md
  Token Budget Zone Standard
       core/token-budget.md
  Security Decision Standard
       core/security-decision.md
  Capability Declaration S
... (1689 characters omitted) ...
ontract.md
  Data Pipeline Standards
       core/data-pipeline.md
  Infrastructure as Code Design Principles
       core/iac-design-principles.md
  Container Image Build and Security Standards
       core/container-image-standards.md
  Secret Management and Credential Hygiene Standards
       core/secret-management-standards.md
  Product Requirements Document Standards
       core/prd-standards.md
  Product Metrics Framework Standards
       core/product-metrics-standards.md
  User Story Mapping Standards
       core/user-story-mapping.md

──────────────────────────────────────────────────
Total: 59 standards (0 with Skills, 59 reference-only)

Run `uds init` to adopt standards in your project.
See: https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md
```

**list-category-skill-filters** — `uds list --category skill`

```text
Universal Development Standards
──────────────────────────────────────────────────
Version: 6.14.0-beta.9

Category: Skill
Standards implemented as Claude Code Skills. Install the skill for interactive AI assistance.

Skill (41)
  Anti-Hallucination Guidelines → ai-collaboration-standards
       core/anti-hallucination.md
  AI-Friendly Architecture → ai-friendly-architecture
       core/ai-friendly-architecture.md
  Commit Message Guide → commit-standards
       core/commit-message-guide.md
  Code Check-in Standards → checkin-assistant
       core/checkin-standards.md
  Spec-Driven Development → spec-driven-dev
       core/spec-driven-development.md
  Code Review Checklist → code-review-assistant
       core/code-review-checklist.md
  Git Workflow Guide → git-workflow-guide
       core/git-workflow.md
  Semantic Versioning → release-standards
       core/versioning.md
  Changelog Standards → release-standards
       core/changelog-standards.md
  Testing Standards → testing-guide
       core/testing-standards.md
  Full Coverage Testing Standards → testing-guide
       core/full-coverage-testing.md
  Documentation Structure → documentation-guide
       core/documentation-structure.md
  AI Instruction File Standards → ai-instruction-standards
       core/ai-instruction-standards.md
  Project Structure → project-structure-guide
       core/project-structure.md
  Error Code Standards → error-code-guide
       core/error-code-standards.md
  Logging Standards → logging-guide
       core/logging-standards.md
  Test Completeness Dimensions → test-coverage-assistant
       core/test-completeness-dimensions.md
  Flow-Based Testing → e2e-assistant
       core/flow-based-testing.md
  Mock Boundary Standards → testing-guide
       core/mock-boundary.md
  Security Testing Standards → security-scan-assistant
       core/security-testing.md
  Mutation Testing Standards → test-coverage-assistant
       core/mutation-testing.md
  Test-Driven Development → tdd-assistant
       core/tes
... (1043 characters omitted) ...
 Debugging Workflow
       core/systematic-debugging.md
  AI Model Selection Strategy
       core/model-selection.md
  Agent Dispatch & Parallel Coordination
       core/agent-dispatch.md
  Class-Level Fix Standard
       core/class-level-fix.md
  Verification Evidence Standard
       core/verification-evidence.md
  Architecture Decision Records → adr-assistant
       core/adr-standards.md
  Retrospective Standards → retrospective-assistant
       core/retrospective-standards.md
  Git Push Safety Gates → push
       core/push-standards.md

──────────────────────────────────────────────────
Total: 41 standards (36 with Skills, 5 reference-only)

Run `uds init` to adopt standards in your project.
See: https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md
```

**list-category-unknown** — `uds list --category no-such-category`

```text
Universal Development Standards
──────────────────────────────────────────────────
Version: 6.14.0-beta.9

Error: Unknown category 'no-such-category'
Valid categories: skill, reference, core, testing, security, deployment, operations, extension, integration, template
```

**lint-text-report** — `uds lint`

```text
Spec Lint
──────────────────────────────────────────────────
  掃描 3 份 spec（./specs/）

  ✓ SPEC-001-alpha: 17 effective lines (pass)
  ✗ SPEC-002-beta: 1 broken dependency: SPEC-999-missing; 17 effective lines (pass)
  ⚠ SPEC-003-long: 323 effective lines (warn)

  1 pass, 1 warn, 1 fail
```

**lint-json-report** — `uds lint --json`

```text
{
  "summary": {
    "pass": 1,
    "warn": 1,
    "fail": 1
  },
  "results": [
    {
      "specId": "SPEC-001-alpha",
      "status": "pass",
      "message": "17 effective lines (pass)"
    },
    {
      "specId": "SPEC-002-beta",
      "status": "fail",
      "message": "1 broken dependency: SPEC-999-missing; 17 effective lines (pass)"
    },
    {
      "specId": "SPEC-003-long",
      "status": "warn",
      "message": "323 effective lines (warn)"
    }
  ]
}
```

**lint-no-specs-folder** — `uds lint`

```text
Spec Lint
──────────────────────────────────────────────────
  查無 spec 目錄（./specs/ 不存在）
  沒有東西被掃描——這不代表沒有問題，代表沒有檢查。
```

**fix-standard-applies-fixer** — `uds fix -s demo-structure`

```text
Attempting to fix violations for: demo-structure
──────────────────────────────────────────────────
✓  Fix applied successfully!
```

**fix-json-reports-fixed** — `uds fix -s demo-structure --json`

```text
{
  "success": true,
  "message": "Fix applied and verified successfully.",
  "status": "fixed"
}
```

**fix-needs-standard** — `uds fix`

```text
Error: --standard is required
```

**r4a-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/r4a-simulate/.claude/skills/)

✓ Standards initialized successfully!

  75 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/r4a-simulate/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
Configuring Pre-commit Hook (native git hook)...
  ✓ Installed .git/hooks/pre-commit (native git hook)
```

**simulate-json-pass** — `uds simulate -s commit-message -i "feat(api): add dept endpoint" --json`

```text
{
  "status": "pass",
  "success": true,
  "message": "Simulation passed",
  "details": "Checked: header format <type>(<scope>): <subject>; type is one of: feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security (from .standards/options); rule scope-lowercase; rule subject-max-length\nNot checked: rule imperative-mood (the standard gives no machine-checkable pattern); rule no-mixed-changes and the commit language option"
}
```

**simulate-json-fail** — `uds simulate -s commit-message -i "add new dept api" --json`

```text
{
  "status": "fail",
  "success": false,
  "message": "Simulation failed: the input does not comply",
  "details": "- The first line is not in the form <type>(<scope>): <subject> (scope is optional).\nChecked: header format <type>(<scope>): <subject>; rule subject-max-length\nNot checked: rule imperative-mood (the standard gives no machine-checkable pattern); rule no-mixed-changes and the commit language option"
}
```

**report-adoption-table** — `uds report`

```text
UDS Hook Telemetry Report
══════════════════════════════════════════════════
Total executions: 3

Standard                 Executions  Pass Rate  Avg Duration
──────────────────────────────────────────────────
commit-message           2           50.0%      20ms
testing                  1           100.0%     100ms
```

**report-no-telemetry** — `uds report`

```text
No telemetry data available. Run hooks to generate data.
```

**deps-path-reports-drift** — `{node} stub-registry.mjs {bin} deps --path proj`

```text
demo — 4 runtime dependencies checked

  1 tested ≠ resolves:
    alpha  ^1.0.0  tested=1.0.0  resolves=1.2.0

  Your lockfile pins the tested column.
  If you publish this package, that column reaches nobody — a published
  package ships no lockfile, so consumers resolve the ranges themselves.
  If instead you ship the lockfile with the artifact (a container image,
  a deployed service), the third column is what the next lockfile
  regeneration pulls in — unreviewed, and by whoever happens to run it.

stand-in registry: most requests at once = 4
```

**deps-json-output** — `{node} stub-registry.mjs {bin} deps --path proj --json`

```text
{
  "root": "proj",
  "packageName": "demo",
  "hasLockfile": true,
  "workspaces": [],
  "examined": 4,
  "consistent": 3,
  "drifted": [
    {
      "name": "alpha",
      "range": "^1.0.0",
      "kind": "dependencies",
      "workspace": "demo",
      "workspaceDir": null,
      "locked": "1.0.0",
      "resolved": "1.2.0",
      "native": {
        "native": false,
        "reasons": []
      },
      "error": null
    }
  ],
  "unverifiable": [],
  "unpinnedNative": [],
  "foreignLockfile": null,
  "clean": false
}
stand-in registry: most requests at once = 4
```

**deps-concurrency-limits-lookups** — `{node} stub-registry.mjs {bin} deps --path proj --concurrency 1`

```text
demo — 4 runtime dependencies checked

  1 tested ≠ resolves:
    alpha  ^1.0.0  tested=1.0.0  resolves=1.2.0

  Your lockfile pins the tested column.
  If you publish this package, that column reaches nobody — a published
  package ships no lockfile, so consumers resolve the ranges themselves.
  If instead you ship the lockfile with the artifact (a container image,
  a deployed service), the third column is what the next lockfile
  regeneration pulls in — unreviewed, and by whoever happens to run it.

stand-in registry: most requests at once = 1
```

**deps-default-looks-up-in-parallel** — `{node} stub-registry.mjs {bin} deps --path proj`

```text
demo — 4 runtime dependencies checked

  1 tested ≠ resolves:
    alpha  ^1.0.0  tested=1.0.0  resolves=1.2.0

  Your lockfile pins the tested column.
  If you publish this package, that column reaches nobody — a published
  package ships no lockfile, so consumers resolve the ranges themselves.
  If instead you ship the lockfile with the artifact (a container image,
  a deployed service), the third column is what the next lockfile
  regeneration pulls in — unreviewed, and by whoever happens to run it.

stand-in registry: most requests at once = 4
```

**spec-create-yes-confirms** — `uds spec new "Add login page" --scope backend --output docs/specs --yes`

```text
Micro-Spec Generation
Analyzing your intent...

- Generating micro-spec...
✔ Micro-spec generated

──────────────────────────────────────────────────
## Micro-Spec: Add login page

**Status**: draft
**Created**: 2026-10-10
**Type**: feature
**Spec Mode**: standard
**Depends On**: none

**Intent**: Add login page

**Scope**: backend

**Acceptance**:
- [ ] Feature implemented as described
- [ ] No regressions introduced
- [ ] Add login page

**Confirmed**: No

──────────────────────────────────────────────────

Spec auto-confirmed.

Saved to: <sandbox>/work/spec-create-yes-confirms/docs/specs/SPEC-001-add-login-page.md
Spec ID: SPEC-001-add-login-page
```

**spec-list-status-filter** — `uds spec ls --status draft --output docs/specs`

```text
Micro-Specs

──────────────────────────────────────────────────────────────────────
ID                                 Status      Type      Title
──────────────────────────────────────────────────────────────────────
SPEC-001-login-page                draft       feature   Login page
──────────────────────────────────────────────────────────────────────
Total: 1
```

**spec-show-prints-spec** — `uds spec show SPEC-002-export-report --output docs/specs`

```text
## Micro-Spec: Export report

**Status**: confirmed
**Created**: 2026-10-01
**Type**: feature
**Spec Mode**: standard
**Depends On**: none

**Intent**: Export report

**Scope**: backend

**Acceptance**:

**Confirmed**: Yes
```

**spec-show-unknown-id** — `uds spec show SPEC-404-nothing --output docs/specs`

```text
Spec not found: SPEC-404-nothing
```

**spec-confirm-marks-confirmed** — `uds spec confirm SPEC-001-login-page --output docs/specs`

```text
Spec confirmed and ready for implementation!
Spec ID: SPEC-001-login-page
```

**spec-archive-moves-to-archive** — `uds spec archive SPEC-002-export-report --output docs/specs`

```text
Spec archived successfully.
```

**spec-delete-yes-removes-file** — `uds spec rm SPEC-001-login-page --yes --output docs/specs`

```text
Spec deleted.
```

**spec-delete-unknown-id** — `uds spec delete SPEC-404-nothing --yes --output docs/specs`

```text
Spec not found: SPEC-404-nothing
```

**spec-delete-unknown-id-does-not-ask** — `uds spec delete SPEC-404-nothing --output docs/specs`

```text
Spec not found: SPEC-404-nothing
```

**spec-search-finds-active-and-archived** — `uds spec search login --output docs/specs`

```text
Found 2 spec(s) matching "login":

  SPEC-000-old-login [archived] Old login flow
  SPEC-001-login-page [draft] Login page
```

**spec-search-archived-only** — `uds spec search login --archived --output docs/specs`

```text
Found 1 spec(s) matching "login":

  SPEC-000-old-login [archived] Old login flow
```

**spec-split-too-few-criteria** — `uds spec split SPEC-001-small --output docs/specs`

```text
Spec SPEC-001-small has 1 AC(s) — too few to split.
```

**spec-split-unknown-id** — `uds spec split SPEC-404-nothing --output docs/specs`

```text
Error: Spec SPEC-404-nothing not found
```

**quickstart-without-terminal-shows-every-workflow** — `uds quickstart`

```text
UDS Quickstart Guide

Select a workflow to see the recommended commands:

? Which workflow do you want to follow?
❯ Quick Spec → Implement (Micro-Spec)
  Full SDD Spec Flow (Boost)
  Test-Driven Development (TDD)
  Check Project Health

Lightweight spec for simple features/fixes
↑↓ navigate • ⏎ select[?25l[23G
[G[?25hNothing here can answer the question (not a terminal), so every workflow is shown.

Quick Spec → Implement (Micro-Spec)

Lightweight spec for simple features/fixes

  1. uds spec create "your feature"
     Create micro-spec from intent

  2. uds spec confirm SPEC-XXX
     Confirm spec for implementation

  3. # Implement in your editor
     Write code following the spec

  4. uds spec archive SPEC-XXX
     Archive completed spec


Full SDD Spec Flow (Boost)

Complete spec-driven development for complex features

  1. # Use the /sdd skill
     Full spec lifecycle with review (see `uds spec --help`)

  2. uds spec create "your feature" --scope fullstack
     Create the spec, scoped

  3. uds spec confirm SPEC-XXX
     Confirm after review

  4. # Implement with /derive → /tdd
     Use forward derivation and TDD


Test-Driven Development (TDD)

Red-Green-Refactor cycle

  1. # Drive TDD with the /tdd skill
     Red-Green-Refactor from your AI assistant

  2. # Write failing test (RED)
     Define expected behavior

  3. # Make it pass (GREEN)
     Minimal implementation

  4. # Improve (REFACTOR)
     Clean up without breaking tests


Check Project Health

Audit standards compliance and spec quality

  1. uds check
     Check standards file integrity

  2. uds check --i18n
     Run i18n lint rules across canonical + locale variants

  3. uds audit
     Deep health diagnosis

Tip: Run "uds quickstart" in a terminal to pick one workflow.
```

**spec-create-without-terminal-keeps-a-draft** — `uds spec create "Add login page" --output docs/specs`

```text
Micro-Spec Generation
Analyzing your intent...

- Generating micro-spec...
✔ Micro-spec generated

──────────────────────────────────────────────────
## Micro-Spec: Add login page

**Status**: draft
**Created**: 2026-10-10
**Type**: feature
**Spec Mode**: standard
**Depends On**: none

**Intent**: Add login page

**Scope**: frontend

**Acceptance**:
- [ ] Feature implemented as described
- [ ] No regressions introduced
- [ ] Add login page

**Confirmed**: No

──────────────────────────────────────────────────

? How would you like to proceed?
❯ Confirm and proceed
  Edit the spec
  Skip (keep as draft)
  Discard

↑↓ navigate • ⏎ select[?25l[23G
[G[?25h
Nothing here can answer the question, so the spec stays a draft.
Run `uds spec confirm <id>` to confirm it, or create it with --yes.
Spec saved as draft.

Saved to: <sandbox>/work/spec-create-without-terminal-keeps-a-draft/docs/specs/SPEC-001-add-login-page.md
Spec ID: SPEC-001-add-login-page
```

**spec-delete-without-terminal-deletes-nothing** — `uds spec delete SPEC-001-login-page --output docs/specs`

```text
? Are you sure you want to delete this spec? (y/N)[52G
[G[?25hCannot ask for confirmation: there is nothing attached to answer the prompt (non-interactive shell, CI, or a pipe).
Re-run with --yes to delete. Nothing has been deleted.
```

**spec-split-without-terminal-changes-nothing** — `uds spec split SPEC-001-big --output docs/specs`

```text
Splitting SPEC-001-big (3 ACs found):

  AC-1: first
  AC-2: second
  AC-3: third

? Select ACs to move to a NEW spec (remaining stay in original):
❯◯ AC-1: first
 ◯ AC-2: second
 ◯ AC-3: third

↑↓ navigate • space select • a all • i invert • ⏎ submit[?25l[57G
[G[?25h
Cannot ask which ACs to move: there is nothing attached to answer the prompt (non-interactive shell, CI, or a pipe).
  Run `uds spec split SPEC-001-big` in a terminal. Nothing has been changed.
```

**open-work-next-action-root** — `uds open-work next-action n.md --root proj`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=1 named-unresolved=0 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-root/proj (from --root). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt]   named-resolved   n.md table column "Next action" (line 3, row "a"): edit docs/plan.md  <- path:docs/plan.md
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-next-action-without-root** — `uds open-work next-action n.md`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=1 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (1): path-missing=1 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-without-root (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/open-work-next-action-without-root, not against where the file is; pass --root to say where its paths start
[owt]   named-unresolved n.md table column "Next action" (line 3, row "a"): edit docs/plan.md  <- path:docs/plan.md
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-next-action-id-pattern** — `uds open-work next-action n.md --id-pattern INC\d{7}`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=1 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (1): path-missing=0 not-resolvable=1
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-id-pattern (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/open-work-next-action-id-pattern, not against where the file is; pass --root to say where its paths start
[owt]   named-unresolved n.md table column "Next action" (line 3, row "a"): close INC0012345  <- id:INC0012345
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-next-action-id-unrecognised** — `uds open-work next-action n.md`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=0 unnamed=1 undecidable-table-rows=0
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-id-unrecognised (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/open-work-next-action-id-unrecognised, not against where the file is; pass --root to say where its paths start
[owt]   unnamed          n.md table column "Next action" (line 3, row "a"): close INC0012345
[owt] VIOLATION OWT-019: n.md table column "Next action" (line 3, row "a") names no file path, test name, command or requirement identifier: "close INC0012345"
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-next-action-command-word** — `uds open-work next-action n.md --command-word kubectl`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=1 unnamed=0 undecidable-table-rows=0
[owt]   of the named-unresolved (1): path-missing=0 not-resolvable=1
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-command-word (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/open-work-next-action-command-word, not against where the file is; pass --root to say where its paths start
[owt] RESOLUTION: read as commands in addition to the built-in list: kubectl
[owt]   named-unresolved n.md table column "Next action" (line 3, row "a"): kubectl rollout restart  <- command:kubectl rollout
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-next-action-command-unrecognised** — `uds open-work next-action n.md`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=0 unnamed=1 undecidable-table-rows=0
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-command-unrecognised (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: n.md is outside any git repository, so its paths are resolved against <sandbox>/work/open-work-next-action-command-unrecognised, not against where the file is; pass --root to say where its paths start
[owt]   unnamed          n.md table column "Next action" (line 3, row "a"): kubectl rollout restart
[owt] VIOLATION OWT-019: n.md table column "Next action" (line 3, row "a") names no file path, test name, command or requirement identifier: "kubectl rollout restart"
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-next-action-stale-after** — `uds open-work next-action w.md --now 2026-01-14 --stale-after 2`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=0 unnamed=0 undecidable-table-rows=0 waiting-on-reply=1
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-stale-after (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: w.md is outside any git repository, so its paths are resolved against <sandbox>/work/open-work-next-action-stale-after, not against where the file is; pass --root to say where its paths start
[owt]   waiting-on-reply w.md table column "Next action" (line 3, row "vendor quote"): wait for the vendor reply
[owt] WAITING-ON-REPLY 1 row(s) are asked-awaiting and carry everything OWT-022 asks for, so OWT-019 is not applied to them (counted apart: not named, not resolved, not complete; 1 older than 2 day(s), UNCALIBRATED):
[owt]   w.md table column "Next action" (line 3, row "vendor quote"): asked 4d ago (2026-01-10) STALE (older than 2d); waiting for: the quote; released by: the quote arrives
[owt] WAITING-ON-REPLY LIMIT: the check decides that asked-at, what is waited for and the release event are present and well formed (OWT-022). It cannot decide that the request was really sent or that it is still unanswered (OWT-014, as for OWT-023). A row without all of them is judged by OWT-019 as before.
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-next-action-default-not-stale** — `uds open-work next-action w.md --now 2026-01-14`

```text
[owt] OWT-019 walked 1 next-action field(s) in 1 carrier(s); 0 empty/done field(s) not evaluated; 0 carrier(s) had no next-action field
[owt]   named-resolved=0 named-unresolved=0 unnamed=0 undecidable-table-rows=0 waiting-on-reply=1
[owt]   of the named-unresolved (0): path-missing=0 not-resolvable=0
[owt] RESOLUTION: a path is looked up under <sandbox>/work/open-work-next-action-default-not-stale (the current directory: no --root was given). Only a PATH is looked up. A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path. path-missing is a path that was looked up and is not there.
[owt] RESOLUTION: w.md is outside any git repository, so its paths are resolved against <sandbox>/work/open-work-next-action-default-not-stale, not against where the file is; pass --root to say where its paths start
[owt]   waiting-on-reply w.md table column "Next action" (line 3, row "vendor quote"): wait for the vendor reply
[owt] WAITING-ON-REPLY 1 row(s) are asked-awaiting and carry everything OWT-022 asks for, so OWT-019 is not applied to them (counted apart: not named, not resolved, not complete; 0 older than 7 day(s), UNCALIBRATED):
[owt]   w.md table column "Next action" (line 3, row "vendor quote"): asked 4d ago (2026-01-10); waiting for: the quote; released by: the quote arrives
[owt] WAITING-ON-REPLY LIMIT: the check decides that asked-at, what is waited for and the release event are present and well formed (OWT-022). It cannot decide that the request was really sent or that it is still unanswered (OWT-014, as for OWT-023). A row without all of them is judged by OWT-019 as before.
[owt] COVERAGE UNKNOWN (OWT-011): recognising a path/command/test name/identifier is pattern matching; an unrecognised format is reported as unnamed. A clean pass does not mean every next action is specific.
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-revision-before-after-violation** — `uds open-work revision --before before.md --after after.md`

```text
[owt] OWT-018 after.md: changed-no-record (changed: Acceptance)
[owt] VIOLATION OWT-018: intent changed and no new revision record exists [Acceptance]
[owt] HAND-BACK (OWT-018 -> OWT-007) — list these when control returns to a human; this listing never blocks (OWT-008):
[owt]   edit to Acceptance in after.md: no approver: there is no revision record at all
[owt] LIMIT: the check decides that intent changed, that a NEW record exists, that it is complete and whether an approver is filled in. It cannot decide that the record describes the change honestly (OWT-014).
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-revision-before-after-recorded** — `uds open-work revision --before before.md --after after.md`

```text
[owt] OWT-018 after.md: changed-recorded (changed: Acceptance)
[owt] LIMIT: the check decides that intent changed, that a NEW record exists, that it is complete and whether an approver is filled in. It cannot decide that the record describes the change honestly (OWT-014).
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-revision-file-base** — `uds open-work revision --file spec.md --base HEAD`

```text
[owt] OWT-018 spec.md: changed-no-record (changed: Acceptance)
[owt] VIOLATION OWT-018: intent changed and no new revision record exists [Acceptance]
[owt] HAND-BACK (OWT-018 -> OWT-007) — list these when control returns to a human; this listing never blocks (OWT-008):
[owt]   edit to Acceptance in spec.md: no approver: there is no revision record at all
[owt] LIMIT: the check decides that intent changed, that a NEW record exists, that it is complete and whether an approver is filled in. It cannot decide that the record describes the change honestly (OWT-014).
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-separation-default-words** — `uds open-work separation plan.md`

```text
[owt] OWT-017 walked 1 carrier(s); 1 had a recognised intent or progress section
[owt] VIOLATION OWT-017: plan.md holds intent (Goal) and progress (Next action) in one carrier
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-separation-declared-word** — `uds open-work separation plan.md --next-action-word Todo`

```text
[owt] OWT-017 walked 1 carrier(s); 1 had a recognised intent or progress section
[owt] VIOLATION OWT-017: plan.md holds intent (Goal) and progress (Todo) in one carrier
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-separation-word-not-declared** — `uds open-work separation plan.md`

```text
[owt] OWT-017 walked 1 carrier(s); 1 had a recognised intent or progress section
[owt] UNCALIBRATED (OWT-016): heading vocabulary, command list, extension list and identifier pattern are initial judgments.
```

**open-work-waiting-id-pattern** — `uds open-work waiting w.md --now 2026-10-07 --id-pattern INC\d{7}`

```text
[owt] OWT-020/021/022 walked 1 record(s) with a status field in 1 carrier(s) (today 2026-10-07); 0 carrier(s) had none
[owt]   not-yet-asked=1 asked-awaiting=0 waiting-unspecified=0 done=0 other=0 undecidable-table-rows=0
[owt]   not-yet-asked        w.md table row (line 3, row "mail"): mail
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**open-work-waiting-id-unrecognised** — `uds open-work waiting w.md --now 2026-10-07`

```text
[owt] OWT-020/021/022 walked 1 record(s) with a status field in 1 carrier(s) (today 2026-10-07); 0 carrier(s) had none
[owt]   not-yet-asked=1 asked-awaiting=0 waiting-unspecified=0 done=0 other=0 undecidable-table-rows=0
[owt]   not-yet-asked        w.md table row (line 3, row "mail"): mail
[owt] VIOLATION OWT-021: w.md table row (line 3, row "mail") is not-yet-asked but names no draft or action: no file path, command, test name or requirement identifier
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**open-work-waiting-command-word** — `uds open-work waiting w.md --now 2026-10-07 --command-word kubectl`

```text
[owt] OWT-020/021/022 walked 1 record(s) with a status field in 1 carrier(s) (today 2026-10-07); 0 carrier(s) had none
[owt]   not-yet-asked=1 asked-awaiting=0 waiting-unspecified=0 done=0 other=0 undecidable-table-rows=0
[owt]   not-yet-asked        w.md table row (line 3, row "mail"): mail
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**open-work-waiting-command-unrecognised** — `uds open-work waiting w.md --now 2026-10-07`

```text
[owt] OWT-020/021/022 walked 1 record(s) with a status field in 1 carrier(s) (today 2026-10-07); 0 carrier(s) had none
[owt]   not-yet-asked=1 asked-awaiting=0 waiting-unspecified=0 done=0 other=0 undecidable-table-rows=0
[owt]   not-yet-asked        w.md table row (line 3, row "mail"): mail
[owt] VIOLATION OWT-021: w.md table row (line 3, row "mail") is not-yet-asked but names no draft or action: no file path, command, test name or requirement identifier
[owt] A waiting item that is neither not-yet-asked nor asked-awaiting is named above, one by one; it is never folded into a total and never counted as done.
[owt] COVERAGE UNKNOWN (OWT-011): state words and field names are matched by vocabulary. A waiting item written in words the vocabulary does not hold is read as "other", not as waiting. A clean pass does not mean nothing is waiting unasked.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**open-work-observations-stale-after** — `uds open-work observations o.md --now 2026-10-07 --stale-after 3`

```text
[owt] OWT-023/024/025/026 walked 1 observation(s) in 1 carrier(s) (today 2026-10-07); stale after 3 day(s) (UNCALIBRATED); 0 carrier(s) had none
[owt]   yes=1 no=0 unknown=0 invalid=0 | stale=1 | confirmed=0 (yes, well formed, not stale) | undecidable-table-rows=0
[owt]   value=yes age=6d by=albert at=2026-10-01  o.md table row (line 5, row "mail sent"): mail sent
[owt] STALE (observed 6d ago, older than 3d; counted apart, not confirmed): o.md table row (line 5, row "mail sent"): mail sent
[owt] LIMIT: the check decides that the fields exist, are well formed, and how old the stamp is. It cannot decide that an observation is true, or that it is still true now (OWT-014): a stamp says who saw it and when, never that it still holds.
[owt] COVERAGE UNKNOWN (OWT-011): a table is read as an observation carrier only if it has an observed-by or observed-at column (or a list item such a label); the "derivable subject" test is a short word list. A clean pass does not mean no hand-written fact is unstamped or derivable.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**open-work-observations-default-threshold** — `uds open-work observations o.md --now 2026-10-07`

```text
[owt] OWT-023/024/025/026 walked 1 observation(s) in 1 carrier(s) (today 2026-10-07); stale after 7 day(s) (default, UNCALIBRATED); 0 carrier(s) had none
[owt]   yes=1 no=0 unknown=0 invalid=0 | stale=0 | confirmed=1 (yes, well formed, not stale) | undecidable-table-rows=0
[owt]   value=yes age=6d by=albert at=2026-10-01  o.md table row (line 5, row "mail sent"): mail sent
[owt] LIMIT: the check decides that the fields exist, are well formed, and how old the stamp is. It cannot decide that an observation is true, or that it is still true now (OWT-014): a stamp says who saw it and when, never that it still holds.
[owt] COVERAGE UNKNOWN (OWT-011): a table is read as an observation carrier only if it has an observed-by or observed-at column (or a list item such a label); the "derivable subject" test is a short word list. A clean pass does not mean no hand-written fact is unstamped or derivable.
[owt] UNCALIBRATED (OWT-016): the state words, field names (English and Chinese), the derivable-subject word list and the stale-after threshold are initial judgments, none measured against real usage.
```

**r4b-init-standard-choices** — `uds init -y --skills-location none --workflow gitflow --merge-strategy rebase-ff --output-lang bilingual --test-levels unit-testing,e2e-testing`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: Gitflow
  Release Mode: CI/CD
  Merge Strategy: Rebase + FF
  Output Language: Bilingual
  Test Levels: unit-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 72 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  73 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-init-extensions** — `uds init -y --skills-location none --lang php --framework fat-free --content-mode minimal --no-agents-md`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: php
  Frameworks: fat-free
  Content Mode: Minimal


- Copying standards...
✔ Copied 74 standard files
- Copying extensions...
✔ Copied 2 extension files

✓ Standards initialized successfully!

  76 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-init-claude-local-index-agents** — `uds init -y --skills-location none --claude-target local --content-mode index --agents-md`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: Standard


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  76 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-init-layered-with-hooks** — `uds init -y --skills-location none --content-layout layered --with-hooks`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  76 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ Layered CLAUDE.md generated (2 files)
  ✓ Enforcement hooks installed (4 scripts, PreToolUse, PostToolUse, Stop)
    · check-turn-completion.mjs reads prose, and ships:
        en (English)
        zh-TW (繁體中文)
        
        This check reads prose. If you work in a language not listed above,
        it is installed and running but cannot fire. See turn-completion-integrity R8.
  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-self-adoption-init-refused** — `uds init -y --skills-location none`

```text
偵測到 UDS source repo。此指令（uds init）僅供採用專案使用。
Source repo 維護請使用 scripts/bump-version.sh 或 npm run docs:sync。
詳見 DEC-044。

Detected UDS source repo. This command (uds init) is for
adopter projects only. For source-repo maintenance use
scripts/bump-version.sh or npm run docs:sync. See DEC-044.

Override with --force if you know what you are doing
（若確定要執行可加上 --force 旗標繞過）.
Matched signals: .uds-source-repo
```

**r4b-self-adoption-init-force** — `uds init -y --skills-location none --force`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  75 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)

警告：偵測到 UDS source repo，但 --force 已指定，繼續執行 uds init。
Warning: UDS source repo detected; --force was passed, continuing uds init.
若非預期操作，請立即 Ctrl+C 並改用 scripts/bump-version.sh。
If unintended, abort now (Ctrl+C) and use scripts/bump-version.sh.
Matched signals: .uds-source-repo
```

**r4b-self-adoption-check-refused** — `uds check --offline`

```text
偵測到 UDS source repo。此指令（uds check）僅供採用專案使用。
Source repo 維護請使用 scripts/bump-version.sh 或 npm run docs:sync。
詳見 DEC-044。

Detected UDS source repo. This command (uds check) is for
adopter projects only. For source-repo maintenance use
scripts/bump-version.sh or npm run docs:sync. See DEC-044.

Override with --force if you know what you are doing
（若確定要執行可加上 --force 旗標繞過）.
Matched signals: .uds-source-repo
```

**r4b-self-adoption-check-force** — `uds check --offline --force`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:

  Summary: 74 unchanged, 0 modified, 0 missing

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  No AI tools configured

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    74 via copied documents

Upstream standards not installed: none
  ⚠ [test-change] could not read the staged changes (error: unknown option `cached'); the code-without-test check did not run.
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

✓ Project is compliant with standards


警告：偵測到 UDS source repo，但 --force 已指定，繼續執行 uds check。
Warning: UDS source repo detected; --force was passed, continuing uds check.
若非預期操作，請立即 Ctrl+C 並改用 scripts/bump-version.sh。
If unintended, abort now (Ctrl+C) and use scripts/bump-version.sh.
Matched signals: .uds-source-repo
```

**r4b-compile-init** — `uds init -y --skills-location none`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  75 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-compile-dry-run** — `uds compile --dry-run`

```text
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/hooks/validate-commit-msg.mjs"
          }
        ]
      },
      {
        "matcher": {
          "tool": "Bash"
        },
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/hooks/check-dangerous-cmd.mjs"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": {
          "tool": "Write",
          "path": "src/**/*.ts"
        },
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/hooks/check-logging-standard.mjs"
          }
        ]
      }
    ]
  }
}
```

**r4b-compile-target** — `uds compile --target claude-code`

```text
Compiled 3 enforcement standard(s) for claude-code
```

**r4b-compile-unknown-target** — `uds compile --target no-such-platform`

```text
Unknown target: no-such-platform. Supported: claude-code
```

**r4b-check-standard-fails** — `uds check --standard proj-layout`

```text
Checking compliance with standard: proj-layout
──────────────────────────────────────────────────
✗  Validation Failed
   Missing required directories: src, docs
```

**r4b-check-standard-json-passes** — `uds check --standard proj-layout --json`

```text
{
  "success": true,
  "message": "Project structure matches required schema."
}
```

**r4b-check-i18n-reports-violation** — `uds check --i18n`

```text
UDS i18n Lint (XSPEC-239)
──────────────────────────────────────────────────

  ✗ [canonical:description-must-be-ascii]
    <sandbox>/work/r4b-check-i18n/skills/demo/SKILL.md:3
    Canonical `description` must be ASCII-only (English). Found non-ASCII characters; move translation to locale variant.

──────────────────────────────────────────────────
  Errors: 1    Warnings: 0    Info: 0
```

**r4b-check-i18n-json** — `uds check --i18n --json`

```text
{
  "summary": {
    "errors": 1,
    "warnings": 0,
    "infos": 0
  },
  "findings": [
    {
      "rule": "canonical:description-must-be-ascii",
      "severity": "error",
      "line": 3,
      "file": "<sandbox>/work/r4b-check-i18n/skills/demo/SKILL.md",
      "message": "Canonical `description` must be ASCII-only (English). Found non-ASCII characters; move translation to locale variant."
    }
  ]
}
```

**r4b-check-i18n-clean** — `uds check --i18n`

```text
UDS i18n Lint (XSPEC-239)
──────────────────────────────────────────────────

  ✓ No i18n violations found.
```

**r4b-check-drift-init** — `uds init -y --skills-location none`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  75 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-check-migrate** — `uds check --offline --migrate`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

Migrating to hash-based integrity checking...

✓ Migrated 75 files to hash-based tracking
  Manifest version upgraded to 3.1.0
```

**r4b-check-summary** — `uds check --offline --summary`

```text
UDS Status Summary
──────────────────────────────────────────────────
  Version: 6.14.0-beta.9 ✓
  Files: 73 ✓ | 1 modified | 0 missing
  Workflow: No active workflows ✓
──────────────────────────────────────────────────
```

**r4b-check-diff** — `uds check --offline --diff`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:
  ⚠ .standards/anti-hallucination.ai.yaml (modified)

  Summary: 73 unchanged, 1 modified, 0 missing

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

Comparing against the original files in the installed UDS package (version 6.14.0-beta.9); no network is used. To see what UDS itself changed since, run `uds update --plan`.

Diff for: .standards/anti-hallucination.ai.yaml
──────────────────────────────────────────────────

--- Original
+++ Current

-1: # AI Collaboration Anti-Hallucination Standards - AI Optimized
+1: # tampered by the acceptance step
-2: # Source: core/anti-hallucination.md
+2: 
-3: 
-4: id: anti-hallucination
-5: meta:
-6:   version: "1.4.0"
-7:   updated: "2026-04-13"
-8:   source: core/anti-hallucination.md
-9:   guide: core/guides/anti-hallucination-guide.md
-10:   description: Protocols to prevent AI hallucination through evidence-based analysis and strict verification tags
-11: 
-12: principles:
-13:   evidence_based:
-14:     rule: Only analyze and reference content that has been explicitly provided or read
-15:     do:
-16:       - Analyze code files that have been read using file reading tools
-17:       - Reference documentation that has been fetched
-18:       - Cite configuration files that have been inspected
-19:     do_not:
-20:       - Speculate about APIs, functions, or configurations not seen
-21:       - Assume framework behavior without verification
... (diff truncated, showing first 20 changes)
```

**r4b-check-no-interactive** — `uds check --offline --no-interactive`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:
  ⚠ .standards/anti-hallucination.ai.yaml (modified)

  Summary: 73 unchanged, 1 modified, 0 missing

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

Actions available:
  • Run `uds check --restore` to restore all modified/missing files
  • Run `uds check --diff` to view changes
  • Run `uds check` for file-by-file decisions (interactive by default)

AGENTS.md Standards Sync
  ✓ AGENTS.md standards synced (71/71)

Skills Status:
  No AI tools configured

Coverage Summary:
  Total: 163 standards
    37 with Skills (interactive AI assistance)
    126 reference documents
  Your coverage:
    0 via Skills
    74 via copied documents

Upstream standards not installed: none
  ⚠ [test-change] could not read the staged changes (error: unknown option `cached'); the code-without-test check did not run.
  ✓ [anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found
    · no test files found — nothing was measured
  ✓ [stub] scripts/check-stubs.mjs: nothing found

⚠ Some issues detected. Review above for details.
```

**r4b-check-restore-missing** — `uds check --offline --restore-missing`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:
  ⚠ .standards/anti-hallucination.ai.yaml (modified)
  ✗ .standards/changelog.ai.yaml (missing)

  Summary: 72 unchanged, 1 modified, 1 missing

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

Restoring files...
  ✓ .standards/changelog.ai.yaml: Restored

✓ Restored 1 file(s)
  Manifest updated.
```

**r4b-check-restore** — `uds check --offline --restore`

```text
Universal Documentation Standards - Check
──────────────────────────────────────────────────
✓ Standards initialized

Adoption Status:
  Installed: 2026-10-10
  Version: 6.14.0-beta.9

File Integrity:
  ⚠ .standards/anti-hallucination.ai.yaml (modified)

  Summary: 73 unchanged, 1 modified, 0 missing

Integration UDS Block Integrity
  ✓ All UDS blocks intact (1 files)
    User customizations outside UDS blocks are preserved

Restoring files...
  ✓ .standards/anti-hallucination.ai.yaml: Restored

✓ Restored 1 file(s)
  Manifest updated.
```

**r4b-check-shipped-standard-macos** — `uds check --standard commit-message --json`

```text
{
  "success": true,
  "message": "Passed rule: commitlint_config_exists",
  "details": ""
}
```

**r4b-check-standard-without-spec** — `uds check --standard anti-hallucination --json`

```text
{
  "success": true,
  "message": "Standard 'anti-hallucination' does not have a Physical Spec defined. Skipped validation.",
  "skipped": true
}
```

**r4b-uninstall-partial-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/r4b-uninstall-partial/.claude/skills/)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/r4b-uninstall-partial/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-uninstall-dry-run** — `uds uninstall --dry-run`

```text
UDS Uninstall
──────────────────────────────────────────────────

  (dry-run mode — no files will be modified)

The following changes will be made:

  ✓ Remove: scripts/check-anti-fake-tests.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/check-stubs.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ⚠ Skip: .husky/pre-commit (not found)
  ✓ Remove: skills/claude-code [project] → <sandbox>/work/r4b-uninstall-partial/.claude/skills/ (116 file(s) UDS wrote)
  ✓ Remove: CLAUDE.md (remove UDS block, keep user content)
  ✓ Remove: AGENTS.md (delete file — everything outside the UDS block was generated by UDS)
  ⚠ Skip: CLAUDE.md (kept: the text outside the UDS block — no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this)
  ✓ Remove: .standards/ (75 file(s) UDS wrote; folder kept: it still holds files that are not UDS's)
  ⚠ Skip: .standards/ — kept 1 file(s) UDS did not write or that changed since: .standards/my-notes.md
  ✓ Remove: scripts/ (empty folder created by UDS, removed)

Dry-run complete. Run without --dry-run to apply.
```

**r4b-uninstall-skills-only** — `uds uninstall --skills-only --yes`

```text
UDS Uninstall
──────────────────────────────────────────────────

The following changes will be made:

  ✓ Remove: skills/claude-code [project] → <sandbox>/work/r4b-uninstall-partial/.claude/skills/ (115 file(s) UDS wrote)
  ⚠ Skip: skills/claude-code [project] — would keep 1 file(s) changed since UDS wrote them

  ✓ skills/claude-code [project] → <sandbox>/work/r4b-uninstall-partial/.claude/skills/ (115 file(s) UDS wrote; folder kept: it still holds files that are not UDS's)
  ⚠ skills/claude-code [project] — kept 1 file(s) changed since UDS wrote them

✓ Uninstall complete.
  Removed: 1  Skipped: 1  Errors: 0
```

**r4b-uninstall-integrations-only** — `uds uninstall --integrations-only --yes`

```text
UDS Uninstall
──────────────────────────────────────────────────

The following changes will be made:

  ✓ Remove: CLAUDE.md (remove UDS block, keep user content)
  ✓ Remove: AGENTS.md (delete file — everything outside the UDS block was generated by UDS)
  ⚠ Skip: CLAUDE.md (kept: the text outside the UDS block — no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this)

  ✓ CLAUDE.md (UDS block removed)
  ✓ AGENTS.md (deleted — everything outside the UDS block was generated by UDS and is unchanged)
  ⚠ CLAUDE.md (kept: the text outside the UDS block — no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this)

✓ Uninstall complete.
  Removed: 2  Skipped: 1  Errors: 0
```

**r4b-uninstall-standards-only** — `uds uninstall --standards-only --yes`

```text
UDS Uninstall
──────────────────────────────────────────────────

The following changes will be made:

  ✓ Remove: .standards/ (75 file(s) UDS wrote; folder kept: it still holds files that are not UDS's)
  ⚠ Skip: .standards/ — kept 1 file(s) UDS did not write or that changed since: .standards/my-notes.md

  ✓ .standards/ (75 file(s) UDS wrote; folder kept: it still holds files that are not UDS's)
  ⚠ .standards/ — kept 1 file(s) UDS did not write or that changed since: .standards/my-notes.md

✓ Uninstall complete.
  Removed: 1  Skipped: 1  Errors: 0
```

**r4b-uninstall-all-init** — `uds init -y --skills-location project --mode skills --format ai --with-hooks`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/r4b-uninstall-everything/.claude/skills/)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/r4b-uninstall-everything/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ Enforcement hooks installed (4 scripts, PreToolUse, PostToolUse, Stop)
    · check-turn-completion.mjs reads prose, and ships:
        en (English)
        zh-TW (繁體中文)
        
        This check reads prose. If you work in a language not listed above,
        it is installed and running but cannot fire. See turn-completion-integrity R8.
  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-uninstall-yes-everything** — `uds uninstall --yes`

```text
UDS Uninstall
──────────────────────────────────────────────────

The following changes will be made:

  ✓ Remove: .claude/settings.json (4 UDS hook entries)
  ✓ Remove: scripts/check-anti-fake-tests.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/check-stubs.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/check-dangerous-cmd.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/check-logging-standard.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/check-turn-completion-agy.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/check-turn-completion-codex.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/check-turn-completion-gemini.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/check-turn-completion.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/inject-standards.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/telemetry-wrapper.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/turn-completion/detect.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/turn-completion/engine.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/turn-completion/locales/en.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/turn-completion/locales/zh-TW.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/hooks/validate-commit-msg.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ⚠ Skip: .husky/pre-commit (not found)
  ✓ Remove: skills/claude-code [project] → <sandbox>/work/r4b-uninstall-everything/.claude/skills/ (116 file(s) UDS wrote)
  ✓ Remove: CLAU
... (2584 characters omitted) ...
's)
  ✓ CLAUDE.md (UDS block removed)
  ✓ AGENTS.md (deleted — everything outside the UDS block was generated by UDS and is unchanged)
  ⚠ CLAUDE.md (kept: the text outside the UDS block — no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this)
  ✓ .standards/ (75 file(s) UDS wrote; folder kept: it still holds files that are not UDS's)
  ⚠ .standards/ — kept 1 file(s) UDS did not write or that changed since: .standards/my-notes.md
  ✓ scripts/hooks/turn-completion/locales/ (empty folder created by UDS, removed)
  ✓ scripts/hooks/turn-completion/ (empty folder created by UDS, removed)
  ✓ scripts/hooks/ (empty folder created by UDS, removed)
  ✓ scripts/ (empty folder created by UDS, removed)

✓ Uninstall complete.
  Removed: 24  Skipped: 3  Errors: 0
```

**r4b-uninstall-user-level-init** — `uds init -y --skills-location user --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: install/update to user
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/home/r4b-uninstall-user-level/.claude/skills)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Claude Code: <sandbox>/home/r4b-uninstall-user-level/.claude/skills
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-uninstall-user-level-present** — `{node} -e "const fs=require('fs'),p=require('path');const d=p.join(process.env.HOME||process.env.USERPROFILE,'.claude','skills');console.log('USER-SKILLS-LEFT='+(fs.existsSync(d)?fs.readdirSync(d).length:0))"`

```text
USER-SKILLS-LEFT=57
```

**r4b-uninstall-user-level-skipped** — `uds uninstall --skills-only --dry-run`

```text
UDS Uninstall
──────────────────────────────────────────────────

  (dry-run mode — no files will be modified)

The following changes will be made:

  ⚠ Skip: skills/claude-code [user] (user-level, use --all to include)

Dry-run complete. Run without --dry-run to apply.
```

**r4b-uninstall-all-flag** — `uds uninstall --all --yes`

```text
UDS Uninstall
──────────────────────────────────────────────────

The following changes will be made:

  ✓ Remove: scripts/check-anti-fake-tests.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ Remove: scripts/check-stubs.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ⚠ Skip: .husky/pre-commit (not found)
  ✓ Remove: skills/claude-code [user] → <sandbox>/home/r4b-uninstall-user-level/.claude/skills (116 file(s) UDS wrote)
  ✓ Remove: CLAUDE.md (delete file — everything outside the UDS block was generated by UDS)
  ✓ Remove: AGENTS.md (delete file — everything outside the UDS block was generated by UDS)
  ✓ Remove: .standards/ (75 file(s) UDS wrote)
  ✓ Remove: scripts/ (empty folder created by UDS, removed)

  ✓ scripts/check-anti-fake-tests.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ✓ scripts/check-stubs.mjs (deleted — installed by UDS, unchanged since UDS wrote it)
  ⚠ .husky/pre-commit (not found)
  ✓ skills/claude-code [user] → <sandbox>/home/r4b-uninstall-user-level/.claude/skills (116 file(s) UDS wrote)
  ✓ CLAUDE.md (deleted — everything outside the UDS block was generated by UDS and is unchanged)
  ✓ AGENTS.md (deleted — everything outside the UDS block was generated by UDS and is unchanged)
  ✓ .standards/ (75 file(s) UDS wrote)
  ✓ scripts/ (empty folder created by UDS, removed)

✓ Uninstall complete.
  Removed: 7  Skipped: 1  Errors: 0
```

**r4b-uninstall-user-level-gone** — `{node} -e "const fs=require('fs'),p=require('path');const d=p.join(process.env.HOME||process.env.USERPROFILE,'.claude','skills');console.log('USER-SKILLS-LEFT='+(fs.existsSync(d)?fs.readdirSync(d).length:0))"`

```text
USER-SKILLS-LEFT=0
```

**r4b-update-init** — `uds init -y --skills-location project --mode skills --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: claudeCode

Configuration Summary:
  Display Language: English
  AI Tools: Claude Code
  Skills: install/update to project
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Claude Code (<sandbox>/work/r4b-update/.claude/skills/)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Claude Code: <sandbox>/work/r4b-update/.claude/skills/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Claude Code to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-update-standards-only** — `uds update --standards-only --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.9.0
Latest version:  6.14.0-beta.9

Update available: 6.9.0 → 6.14.0-beta.9

Files to update:
  .standards/acceptance-criteria-traceability.ai.yaml
  .standards/acceptance-test-driven-development.ai.yaml
  .standards/accessibility-standards.ai.yaml
  .standards/adr-standards.ai.yaml
  .standards/agent-dispatch.ai.yaml
  .standards/ai-agreement-standards.ai.yaml
  .standards/ai-command-behavior.ai.yaml
  .standards/ai-friendly-architecture.ai.yaml
  .standards/ai-instruction-standards.ai.yaml
  .standards/ai-response-navigation.ai.yaml
  .standards/anti-hallucination.ai.yaml
  .standards/api-design-standards.ai.yaml
  .standards/behavior-driven-development.ai.yaml
  .standards/behavior-snapshot.ai.yaml
  .standards/changelog.ai.yaml
  .standards/checkin-standards.ai.yaml
  .standards/class-level-fix.ai.yaml
  .standards/code-review.ai.yaml
  .standards/commit-message.ai.yaml
  .standards/context-aware-loading.ai.yaml
  .standards/database-standards.ai.yaml
  .standards/deferred-item-exit.ai.yaml
  .standards/deployment-standards.ai.yaml
  .standards/developer-memory.ai.yaml
  .standards/documentation-lifecycle.ai.yaml
  .standards/documentation-structure.ai.yaml
  .standards/documentation-writing-standards.ai.yaml
  .standards/error-codes.ai.yaml
  .standards/feature-discovery-standards.ai.yaml
  .standards/feature-manifest-standard.ai.yaml
  .standards/flow-based-testing.ai.yaml
  .standards/forward-derivation-standards.ai.yaml
  .standards/full-coverage-testing.ai.yaml
  .standards/git-workflow.ai.yaml
  .standards/git-worktree.ai.yaml
  .standards/knowledge-graph-memory.ai.yaml
  .standards/logging.ai.yaml
  .standards/mock-boundary.ai.yaml
  .standards/model-selection.ai.yaml
  .standards/mutation-testing.ai.yaml
  .standards/open-work-tracking.ai.yaml
  .standards/packaging-standards.ai.yaml
  .standards/performance-standards.ai.yaml
  .standards/proj
... (896 characters omitted) ...
nce.ai.yaml
  .standards/versioning.ai.yaml
  .standards/virtual-organization-standards.ai.yaml
  .standards/options/english.ai.yaml
  .standards/options/github-flow.ai.yaml
  .standards/options/squash-merge.ai.yaml
  .standards/options/unit-testing.ai.yaml
  .standards/options/integration-testing.ai.yaml
  .standards/options/system-testing.ai.yaml
  .standards/options/e2e-testing.ai.yaml


- Updating standards...
✔ Updated 74 standard files

  .standards/ examined: 75 file(s) — 74 written by UDS, 0 not ours, 0 ownership unknown, 1 excluded
    excluded .standards/manifest.json (the manifest itself)
    first run with ownership tracking: files installed before this release cannot be attributed yet, so none will be removed.

✓ Standards updated successfully!
  Version: 6.9.0 → 6.14.0-beta.9
```

**r4b-update-regenerates-integration** — `uds update --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.9.0
Latest version:  6.14.0-beta.9

Update available: 6.9.0 → 6.14.0-beta.9

Files to update:
  .standards/acceptance-criteria-traceability.ai.yaml
  .standards/acceptance-test-driven-development.ai.yaml
  .standards/accessibility-standards.ai.yaml
  .standards/adr-standards.ai.yaml
  .standards/agent-dispatch.ai.yaml
  .standards/ai-agreement-standards.ai.yaml
  .standards/ai-command-behavior.ai.yaml
  .standards/ai-friendly-architecture.ai.yaml
  .standards/ai-instruction-standards.ai.yaml
  .standards/ai-response-navigation.ai.yaml
  .standards/anti-hallucination.ai.yaml
  .standards/api-design-standards.ai.yaml
  .standards/behavior-driven-development.ai.yaml
  .standards/behavior-snapshot.ai.yaml
  .standards/changelog.ai.yaml
  .standards/checkin-standards.ai.yaml
  .standards/class-level-fix.ai.yaml
  .standards/code-review.ai.yaml
  .standards/commit-message.ai.yaml
  .standards/context-aware-loading.ai.yaml
  .standards/database-standards.ai.yaml
  .standards/deferred-item-exit.ai.yaml
  .standards/deployment-standards.ai.yaml
  .standards/developer-memory.ai.yaml
  .standards/documentation-lifecycle.ai.yaml
  .standards/documentation-structure.ai.yaml
  .standards/documentation-writing-standards.ai.yaml
  .standards/error-codes.ai.yaml
  .standards/feature-discovery-standards.ai.yaml
  .standards/feature-manifest-standard.ai.yaml
  .standards/flow-based-testing.ai.yaml
  .standards/forward-derivation-standards.ai.yaml
  .standards/full-coverage-testing.ai.yaml
  .standards/git-workflow.ai.yaml
  .standards/git-worktree.ai.yaml
  .standards/knowledge-graph-memory.ai.yaml
  .standards/logging.ai.yaml
  .standards/mock-boundary.ai.yaml
  .standards/model-selection.ai.yaml
  .standards/mutation-testing.ai.yaml
  .standards/open-work-tracking.ai.yaml
  .standards/packaging-standards.ai.yaml
  .standards/performance-standards.ai.yaml
  .standards/proj
... (884 characters omitted) ...
cation-evidence.ai.yaml
  .standards/versioning.ai.yaml
  .standards/virtual-organization-standards.ai.yaml
  .standards/options/english.ai.yaml
  .standards/options/github-flow.ai.yaml
  .standards/options/squash-merge.ai.yaml
  .standards/options/unit-testing.ai.yaml
  .standards/options/integration-testing.ai.yaml
  .standards/options/system-testing.ai.yaml
  .standards/options/e2e-testing.ai.yaml
  CLAUDE.md
  AGENTS.md


- Updating standards...
✔ Updated 74 standard files
- Syncing integration files...
✔ Synced 2 integration files

  .standards/ examined: 75 file(s) — 74 written by UDS, 0 not ours, 0 ownership unknown, 1 excluded
    excluded .standards/manifest.json (the manifest itself)

✓ Standards updated successfully!
  Version: 6.9.0 → 6.14.0-beta.9
  Integration files synced: 2
```

**r4b-update-integrations-only** — `uds update --integrations-only --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Updating integration files only...

- Regenerating integration files...
✔ Regenerated 2 integration files

✓ Integration files updated successfully!
  Files updated: CLAUDE.md, AGENTS.md
```

**r4b-update-keeps-edited-standard** — `uds update --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.14.0-beta.9
Latest version:  6.14.0-beta.9

✓ Standards are up to date.
```

**r4b-update-force** — `uds update --force --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Running declarative state reconciliation (force mode)...

=== Reconciliation Plan ===

~ Update (130):
  ~ .standards/acceptance-criteria-traceability.ai.yaml (forced update (--force))
  ~ .standards/acceptance-test-driven-development.ai.yaml (forced update (--force))
  ~ .standards/accessibility-standards.ai.yaml (forced update (--force))
  ~ .standards/adr-standards.ai.yaml (forced update (--force))
  ~ .standards/agent-dispatch.ai.yaml (forced update (--force))
  ~ .standards/ai-agreement-standards.ai.yaml (forced update (--force))
  ~ .standards/ai-command-behavior.ai.yaml (forced update (--force))
  ~ .standards/ai-friendly-architecture.ai.yaml (forced update (--force))
  ~ .standards/ai-instruction-standards.ai.yaml (forced update (--force))
  ~ .standards/ai-response-navigation.ai.yaml (forced update (--force))
  ~ .standards/anti-hallucination.ai.yaml (forced update (--force))
  ~ .standards/api-design-standards.ai.yaml (forced update (--force))
  ~ .standards/behavior-driven-development.ai.yaml (forced update (--force))
  ~ .standards/behavior-snapshot.ai.yaml (forced update (--force))
  ~ .standards/changelog.ai.yaml (forced update (--force))
  ~ .standards/checkin-standards.ai.yaml (forced update (--force))
  ~ .standards/class-level-fix.ai.yaml (forced update (--force))
  ~ .standards/code-review.ai.yaml (forced update (--force))
  ~ .standards/commit-message.ai.yaml (forced update (--force))
  ~ .standards/context-aware-loading.ai.yaml (forced update (--force))
  ~ .standards/database-standards.ai.yaml (forced update (--force))
  ~ .standards/deferred-item-exit.ai.yaml (forced update (--force))
  ~ .standards/deployment-standards.ai.yaml (forced update (--force))
  ~ .standards/developer-memory.ai.yaml (forced update (--force))
  ~ .standards/documentation-lifecycle.ai.yaml (forced update (--force))
  ~ .standards/documentation-structure.ai.yaml (forced update 
... (6918 characters omitted) ...
(2):
  ~ CLAUDE.md (forced integration update (--force))
  ~ AGENTS.md (forced integration update (--force))

Summary:
  Create: 0
  Update: 130
  Migrate Block: 2
  Delete: 0
  Unchanged: 0

- Applying reconciliation plan...
✔ Reconciliation complete: 132 succeeded
  Backup: .uds-backups/2026-10-10T16-04-21-043Z-0001
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.

Available upstream, not installed: none. Every standard UDS installs by default is already in this project.
Not listed above: 95 more standard(s) in categories `uds init` never installs (core 59, testing 15, integration 7, extension 5, security 5, deployment 2, operations 1, template 1). Any of them can still be installed by id with --add-standard.
```

**r4b-update-sync-refs** — `uds update --sync-refs --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Syncing integration references...

Expected categories from manifest.standards:
  anti-hallucination, code-review, commit-standards, developer-memory, documentation, error-handling, git-workflow, project-context-memory, project-structure, refactoring, requirement, spec-driven-development, testing

  ✓ Updated CLAUDE.md
    Categories: anti-hallucination, code-review, commit-standards → anti-hallucination, code-review, commit-standards, developer-memory, documentation, error-handling, git-workflow, project-context-memory, project-structure, refactoring, requirement, spec-driven-development, testing

✓ Updated 1 integration file(s)
```

**r4b-update-debug** — `uds update --yes --offline --debug`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.9.0
Latest version:  6.14.0-beta.9

Update available: 6.9.0 → 6.14.0-beta.9

Files to update:
  .standards/acceptance-criteria-traceability.ai.yaml
  .standards/acceptance-test-driven-development.ai.yaml
  .standards/accessibility-standards.ai.yaml
  .standards/adr-standards.ai.yaml
  .standards/agent-dispatch.ai.yaml
  .standards/ai-agreement-standards.ai.yaml
  .standards/ai-command-behavior.ai.yaml
  .standards/ai-friendly-architecture.ai.yaml
  .standards/ai-instruction-standards.ai.yaml
  .standards/ai-response-navigation.ai.yaml
  .standards/anti-hallucination.ai.yaml
  .standards/api-design-standards.ai.yaml
  .standards/behavior-driven-development.ai.yaml
  .standards/behavior-snapshot.ai.yaml
  .standards/changelog.ai.yaml
  .standards/checkin-standards.ai.yaml
  .standards/class-level-fix.ai.yaml
  .standards/code-review.ai.yaml
  .standards/commit-message.ai.yaml
  .standards/context-aware-loading.ai.yaml
  .standards/database-standards.ai.yaml
  .standards/deferred-item-exit.ai.yaml
  .standards/deployment-standards.ai.yaml
  .standards/developer-memory.ai.yaml
  .standards/documentation-lifecycle.ai.yaml
  .standards/documentation-structure.ai.yaml
  .standards/documentation-writing-standards.ai.yaml
  .standards/error-codes.ai.yaml
  .standards/feature-discovery-standards.ai.yaml
  .standards/feature-manifest-standard.ai.yaml
  .standards/flow-based-testing.ai.yaml
  .standards/forward-derivation-standards.ai.yaml
  .standards/full-coverage-testing.ai.yaml
  .standards/git-workflow.ai.yaml
  .standards/git-worktree.ai.yaml
  .standards/knowledge-graph-memory.ai.yaml
  .standards/logging.ai.yaml
  .standards/mock-boundary.ai.yaml
  .standards/model-selection.ai.yaml
  .standards/mutation-testing.ai.yaml
  .standards/packaging-standards.ai.yaml
  .standards/performance-standards.ai.yaml
  .standards/project-context-memory.ai.yaml
  .standards/
... (2020 characters omitted) ...
ls: []
  declinedFeatures.commands: []
  manifest.skills.location: project

  Checking tool: claude-code
    config.supportsSkills: true
    config.skills: defined
    config.commands: null
    Skills check:
      projectInfo?.installed: true
      userInfo?.installed: false
      manifest.skills.location: project (may be stale)
      marketplaceInfo?.installed: false (actual status)
      usingMarketplace: false (only true if marketplace actually installed)
      hasSkills: true
      declinedSkills.includes('claude-code'): false
    - Skills already installed (hasSkills=true)
    Commands: not supported

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Result: 0 missing Skills, 0 outdated Skills, 0 missing Commands, 0 outdated Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**r4b-update-keeps-retired-standard** — `{node} prune-case.cjs {bin} update --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.9.0
Latest version:  6.14.0-beta.9

Update available: 6.9.0 → 6.14.0-beta.9

Files to update:
  .standards/acceptance-criteria-traceability.ai.yaml
  .standards/acceptance-test-driven-development.ai.yaml
  .standards/accessibility-standards.ai.yaml
  .standards/adr-standards.ai.yaml
  .standards/agent-dispatch.ai.yaml
  .standards/ai-agreement-standards.ai.yaml
  .standards/ai-command-behavior.ai.yaml
  .standards/ai-friendly-architecture.ai.yaml
  .standards/ai-instruction-standards.ai.yaml
  .standards/ai-response-navigation.ai.yaml
  .standards/anti-hallucination.ai.yaml
  .standards/api-design-standards.ai.yaml
  .standards/behavior-driven-development.ai.yaml
  .standards/behavior-snapshot.ai.yaml
  .standards/changelog.ai.yaml
  .standards/checkin-standards.ai.yaml
  .standards/class-level-fix.ai.yaml
  .standards/code-review.ai.yaml
  .standards/commit-message.ai.yaml
  .standards/context-aware-loading.ai.yaml
  .standards/database-standards.ai.yaml
  .standards/deferred-item-exit.ai.yaml
  .standards/deployment-standards.ai.yaml
  .standards/developer-memory.ai.yaml
  .standards/documentation-lifecycle.ai.yaml
  .standards/documentation-structure.ai.yaml
  .standards/documentation-writing-standards.ai.yaml
  .standards/error-codes.ai.yaml
  .standards/feature-discovery-standards.ai.yaml
  .standards/feature-manifest-standard.ai.yaml
  .standards/flow-based-testing.ai.yaml
  .standards/forward-derivation-standards.ai.yaml
  .standards/full-coverage-testing.ai.yaml
  .standards/git-workflow.ai.yaml
  .standards/git-worktree.ai.yaml
  .standards/knowledge-graph-memory.ai.yaml
  .standards/logging.ai.yaml
  .standards/mock-boundary.ai.yaml
  .standards/model-selection.ai.yaml
  .standards/mutation-testing.ai.yaml
  .standards/open-work-tracking.ai.yaml
  .standards/packaging-standards.ai.yaml
  .standards/performance-standards.ai.yaml
  .standards/proj
... (1107 characters omitted) ...
yaml
  .standards/options/unit-testing.ai.yaml
  .standards/options/integration-testing.ai.yaml
  .standards/options/system-testing.ai.yaml
  .standards/options/e2e-testing.ai.yaml
  CLAUDE.md
  AGENTS.md


- Updating standards...
✔ Updated 74 standard files
- Syncing integration files...
✔ Synced 2 integration files

  .standards/ examined: 76 file(s) — 75 written by UDS, 0 not ours, 0 ownership unknown, 1 excluded
    excluded .standards/manifest.json (the manifest itself)

  1 file(s) are no longer shipped by UDS:
    - .standards/retired-by-uds.ai.yaml  (UDS-owned and no longer shipped by the registry)
    Not deleted. Re-run with --prune to remove them.

✓ Standards updated successfully!
  Version: 6.9.0 → 6.14.0-beta.9
  Integration files synced: 2


RETIRED-STANDARD-FILE-EXISTS=true
```

**r4b-update-prune** — `{node} prune-case.cjs {bin} update --yes --offline --prune`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.9.0
Latest version:  6.14.0-beta.9

Update available: 6.9.0 → 6.14.0-beta.9

Files to update:
  .standards/acceptance-criteria-traceability.ai.yaml
  .standards/acceptance-test-driven-development.ai.yaml
  .standards/accessibility-standards.ai.yaml
  .standards/adr-standards.ai.yaml
  .standards/agent-dispatch.ai.yaml
  .standards/ai-agreement-standards.ai.yaml
  .standards/ai-command-behavior.ai.yaml
  .standards/ai-friendly-architecture.ai.yaml
  .standards/ai-instruction-standards.ai.yaml
  .standards/ai-response-navigation.ai.yaml
  .standards/anti-hallucination.ai.yaml
  .standards/api-design-standards.ai.yaml
  .standards/behavior-driven-development.ai.yaml
  .standards/behavior-snapshot.ai.yaml
  .standards/changelog.ai.yaml
  .standards/checkin-standards.ai.yaml
  .standards/class-level-fix.ai.yaml
  .standards/code-review.ai.yaml
  .standards/commit-message.ai.yaml
  .standards/context-aware-loading.ai.yaml
  .standards/database-standards.ai.yaml
  .standards/deferred-item-exit.ai.yaml
  .standards/deployment-standards.ai.yaml
  .standards/developer-memory.ai.yaml
  .standards/documentation-lifecycle.ai.yaml
  .standards/documentation-structure.ai.yaml
  .standards/documentation-writing-standards.ai.yaml
  .standards/error-codes.ai.yaml
  .standards/feature-discovery-standards.ai.yaml
  .standards/feature-manifest-standard.ai.yaml
  .standards/flow-based-testing.ai.yaml
  .standards/forward-derivation-standards.ai.yaml
  .standards/full-coverage-testing.ai.yaml
  .standards/git-workflow.ai.yaml
  .standards/git-worktree.ai.yaml
  .standards/knowledge-graph-memory.ai.yaml
  .standards/logging.ai.yaml
  .standards/mock-boundary.ai.yaml
  .standards/model-selection.ai.yaml
  .standards/mutation-testing.ai.yaml
  .standards/open-work-tracking.ai.yaml
  .standards/packaging-standards.ai.yaml
  .standards/performance-standards.ai.yaml
  .standards/proj
... (1146 characters omitted) ...
ai.yaml
  .standards/options/integration-testing.ai.yaml
  .standards/options/system-testing.ai.yaml
  .standards/options/e2e-testing.ai.yaml
  CLAUDE.md
  AGENTS.md


- Updating standards...
✔ Updated 74 standard files
- Syncing integration files...
✔ Synced 2 integration files

  .standards/ examined: 76 file(s) — 75 written by UDS, 0 not ours, 0 ownership unknown, 1 excluded
    excluded .standards/manifest.json (the manifest itself)

  1 file(s) are no longer shipped by UDS and will be removed:
    - .standards/retired-by-uds.ai.yaml  (UDS-owned and no longer shipped by the registry)
    Removing now (--prune). Files UDS did not write are never touched.

✓ Standards updated successfully!
  Version: 6.9.0 → 6.14.0-beta.9
  Integration files synced: 2


RETIRED-STANDARD-FILE-EXISTS=false
```

**r4b-update-locale** — `uds update --skills --locale zh-tw --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Updating Skills for all AI Agents...

Current Skills status:
  Claude Code (project): v6.14.0-beta.9 ✓

- Installing Skills...
✔ Updated Skills for 1 AI tools
  Backup: .uds-backups/2026-10-10T16-04-22-185Z-0001
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.
```

**r4b-update-with-hooks-ai-tool** — `uds update --with-hooks --ai-tool codex --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Hooks
  codex: --ai-tool
  ✓ codex: installed — .codex/hooks.json
    ⚠ Codex will not run it until you trust it: open Codex in this project, trust the project, then run /hooks and trust this hook.
```

**r4b-update-with-hooks** — `uds update --with-hooks --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Hooks
  claude-code: manifest, detected in the project
  codex: detected in the project
  ✓ claude-code: installed — .claude/settings.json
  · codex: already installed, not touched — .codex/hooks.json
```

**r4b-update-claude-target-local** — `uds update --claude-target local --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
  Switching claude-code integration target: CLAUDE.md → CLAUDE.local.md
    CLAUDE.md: UDS block removed, your content kept
  ✓ claude-code now targets CLAUDE.local.md
```

**r4b-update-commands-init** — `uds init -y --skills-location project --format ai`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete
  AI Tools: cursor

Configuration Summary:
  Display Language: English
  AI Tools: Cursor
  Skills: install/update to project
  Slash Commands: 1 locations
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating integration files...
✔ Generated 1 integration files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)
- Installing Skills...
✔ Installed 56 Skills to Cursor (<sandbox>/work/r4b-update-cmds/.cursor/skills/)
- Installing slash commands...
✔ Installed 51 commands to: Cursor (<sandbox>/work/r4b-update-cmds/.cursor/commands/)

✓ Standards initialized successfully!

  76 files copied to project
  56 Skills installed to Cursor: <sandbox>/work/r4b-update-cmds/.cursor/skills/
  Commands (51): Cursor: <sandbox>/work/r4b-update-cmds/.cursor/commands/
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Restart Cursor to load new Skills
  4. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-update-commands** — `uds update --commands --yes --offline`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Updating slash commands for all AI Agents...

Current commands status:
  Cursor (project): 50 commands in <sandbox>/work/r4b-update-cmds/.cursor/commands/

- Installing commands...
✔ Updated 51 commands for 1 AI tool(s): Cursor (project): <sandbox>/work/r4b-update-cmds/.cursor/commands/
  Backup: .uds-backups/2026-10-10T16-04-23-555Z-0001
  Use `uds update --rollback` to undo.
  Tools that do not read .gitignore (indexers, IDE search, grep): exclude `.uds-backups`.
```

**r4b-update-beta-init** — `uds init -y --skills-location none`

```text
Universal Development Standards - Initialize
──────────────────────────────────────────────────
- Detecting project characteristics...
✔ Project analysis complete

Configuration Summary:
  Display Language: English
  AI Tools: none
  Format: Compact
  Git Workflow: GitHub Flow
  Release Mode: CI/CD
  Merge Strategy: Squash
  Output Language: English
  Test Levels: unit-testing, integration-testing, system-testing, e2e-testing
  Languages: none
  Frameworks: none
  Content Mode: auto


- Copying standards...
✔ Copied 74 standard files
- Generating AGENTS.md (universal summary)...
✔ Generated AGENTS.md (universal summary)

✓ Standards initialized successfully!

  75 files copied to project
  Manifest created at .standards/manifest.json

Next steps:
  1. Review .standards/ directory
  2. Add .standards/ to version control
  3. Run `uds check` to verify adoption status

  ✓ scripts/check-anti-fake-tests.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
  ✓ scripts/check-stubs.mjs (fake-test / stub scanner — `uds check` runs it and warns; edit it freely)
```

**r4b-update-beta-ignored** — `{node} --require {work}/fake-npm.cjs {bin} update --yes`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
Current version: 6.14.0-beta.9
Latest version:  6.14.0-beta.9

✓ Standards are up to date.
```

**r4b-update-beta** — `{node} --require {work}/fake-npm.cjs {bin} update --beta --yes`

```text
Universal Documentation Standards - Update
──────────────────────────────────────────────────
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ New CLI version available!
  Your bundled version: 6.14.0-beta.9
  Latest on npm: 99.0.0-beta.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current version: 6.14.0-beta.9
Latest version:  6.14.0-beta.9

✓ Standards are up to date.
```

</details>
