# Release Flow Improvement TODOs

> Persistent tracking file for release-flow improvements surfaced during dogfood.
> **Auto-included** in weekly `release-reminder.yml` issue body — every Monday 09:00 UTC if reminder conditions met.
> **Edit freely** — add/remove items as flow evolves. Each item should have `id`, `surfaced_during`, `why`, `proposed_action`, `status`.

---

## TODO-001 — bump-version.mjs 沒自動跑 docs:generate-index

- **Surfaced during**: v5.13.3 dogfood (2026-05-26)
- **Why**: After `bump-version.mjs`, `docs/user/SKILLS-INDEX.md` and `COMMANDS-INDEX.md` still show the OLD version stamp in their "Last regenerated" header. CI `docs-check.yml` catches this on PRs but NOT on direct release commits, so stale stamp goes to npm.
- **Proposed action**: Add `npm run docs:generate-index` step inside `scripts/bump-version.mjs` after the version-file updates. Verify by running `bump-version.mjs 5.14.0-test` and confirming both INDEX files auto-update.
- **Status**: 🔲 Open
- **Effort estimate**: ~15 min

---

## TODO-002 — FB / Threads prompts 未捕獲

- **Surfaced during**: v5.13.3 dogfood (2026-05-26)
- **Why**: `release-assets/v5.13.3/prompts.md` only captured the 5 IG carousel prompts. The 1 FB landscape image and 3 Threads portrait images were generated in separate ChatGPT sessions whose prompts weren't recorded — making those images NOT reproducible.
- **Proposed action**: Update `release-assets/_template/prompts.md.template` to include placeholder sections for "Facebook all-in-one" and "Threads post-1/2/3". Make it a habit to paste each prompt into the file immediately after each ChatGPT session.
- **Status**: 🔲 Open
- **Effort estimate**: ~10 min (template update); discipline change for capture habit

---

## TODO-003 — release-assets/_template/ 未實際用過

- **Surfaced during**: v5.13.3 dogfood (2026-05-26)
- **Why**: The `_template/` skeleton was created during retroactive snapshot work but never bootstrapped a real release. May contain unused placeholders, missing fields, or wrong structure that only surfaces when a maintainer follows it from scratch.
- **Proposed action**: On next release (v5.14.0), strictly bootstrap from `_template/` and treat any friction point or missing field as a template bug to fix. Document any deviations in the `_template/README.md` (or create one).
- **Status**: 🔲 Open
- **Effort estimate**: ~0 extra (just discipline during next release); ~30 min for template fixes if friction found

---

## TODO-004 — Phase 1.5 social-assets hard gate not implemented

- **Surfaced during**: v5.13.3 dogfood (2026-05-26) Phase 1 design
- **Why**: `release-assets/` Phase 1 (directory + retroactive snapshot) is done, but Phase 1.5 (pre-release-check.sh step 22.6 verifying social assets exist before release) is not yet wired. Without this gate, a maintainer could release without preparing `release-assets/v{X.Y.Z}/`, defeating the SSOT pattern.
- **Proposed action**: Add step 22.6 to `scripts/pre-release-check.sh` (analogous to step 22.5 CHANGELOG gate): verify `release-assets/v${VERSION}/` exists with `captions/{ig,threads,fb}.md` non-empty and `images/` containing at least 1 PNG. Honor `--skip-social` flag for trivial patch releases.
- **Status**: 🔲 Open
- **Effort estimate**: ~30 min

---

## TODO-005 — Phase 2 Meta API auto-publish workflow not started

- **Surfaced during**: v5.13.3 dogfood (2026-05-26) Phase 1 design
- **Why**: Social posts for v5.13.3 were created manually after npm publish. Phase 2 of release-assets pattern (auto-cross-post via Meta Graph API) is the actual goal that makes Phase 1's structure worth its disk space.
- **Proposed action**: (a) Apply for Meta Developer App (5-7 day review). (b) Write `scripts/publish/{ig,threads,fb}.mjs` consuming `release-assets/v${VERSION}/`. (c) Add `.github/workflows/social-publish.yml` triggered on `release: types: [published]`. (d) Store 6 secrets: FB_PAGE_TOKEN / FB_PAGE_ID / IG_USER_ID / IG_TOKEN / THREADS_USER_ID / THREADS_TOKEN.
- **Status**: 🔲 Open (blocked on Meta App review)
- **Effort estimate**: 8-16 hours (excluding Meta App review wait)

---

## Resolved

(none yet — newly created 2026-05-26)
