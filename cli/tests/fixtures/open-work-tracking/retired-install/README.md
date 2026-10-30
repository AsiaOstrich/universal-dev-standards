# Fixture: what the previous UDS wrote for a project that held `open-work-tracking`

`open-work-tracking` stopped being a standard (it became the optional skill `open-work`; dev-platform XSPEC-427, decision 209甲).
These four files are what UDS **just before that change** (commit `c64eedeb`, package version 6.14.1 plus unreleased work) wrote into a
new project. They are **not hand-written and not edited**. They let a test run the *current* CLI against a project that still holds the
standard, which is the situation every existing adopter is in on the day they upgrade.

| File | What it is | sha256 |
|---|---|---|
| `manifest.json` | `.standards/manifest.json`; `standards` lists the id `open-work-tracking`, `fileHashes` holds its file | `050a082a8932c3110d573cb2667aa93ec267e9ac0eee2c0509b70d816989cdc2` |
| `CLAUDE.md` | the project's `CLAUDE.md`, with the UDS block naming `.standards/open-work-tracking.ai.yaml` | `f55aa09809766b0cdf23524955e6922c7633f46498f609a90c7a701efbe2653f` |
| `AGENTS.md` | the project's `AGENTS.md`, same | `1fbbd57ee21b52f1fce513f201e39bb907825153f34254ee32afc64fa2ec2607` |
| `open-work-tracking.ai.yaml` | the standard file, version 1.4.0 (also what `tests/utils/xspec-483.js` uses for the retired file of the `--format both` fixture) | `6034a65da341e48ee16c6659e6a774e517657734606e847de0a20247c98f26c1` |

## How they were produced

```sh
# a clean checkout of c64eedeb (before the downgrade), with cli/node_modules installed
# then, with HOME and every XDG_* variable pointing at an empty directory, git config pointing at an empty file, no network:
mkdir proj && mkdir proj/.claude
node cli/bin/uds.js init --yes --skills-location project      # run in proj/
cp proj/.standards/manifest.json proj/CLAUDE.md proj/AGENTS.md proj/.standards/open-work-tracking.ai.yaml <this directory>
```

(In practice done through the test harness, `tests/utils/staged-cli-harness.js`, which does exactly that isolation.)

## Using them

`tests/e2e/xspec-427-open-work-tracking-becomes-skill.test.js` starts from a project today's `uds init` made, then lays these files over it
and removes the new skill, so what is on disk is what the previous UDS left. Copy them; never point a test at these files themselves
(reading a manifest can rewrite it). To regenerate, repeat the steps with another commit and update the table.
