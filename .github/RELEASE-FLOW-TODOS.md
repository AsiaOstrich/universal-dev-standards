# Release Flow Improvement TODOs

> Persistent tracking file for release-flow improvements surfaced during dogfood.
> **Auto-included** in weekly `release-reminder.yml` issue body — every Monday 09:00 UTC if reminder conditions met.
> **Edit freely** — add/remove items as flow evolves. Each item should have `id`, `surfaced_during`, `why`, `proposed_action`, `status`.

---

> **社群/release-assets 相關 TODO（原 TODO-002 ~ 005）已遷出公開 repo** → dev-platform `cross-project/business/uds/RELEASE-SOCIAL-TODOS.md`（DEC-072：行銷材料不進公開產品 repo）。本檔僅保留 UDS 產品本身的 release-flow TODO。

（目前無 Open 項目。）

---

## Resolved

## TODO-001 — bump-version.{mjs,sh} 沒自動跑 docs:generate-index

- **Surfaced during**: v5.13.3 dogfood (2026-05-26)
- **Why**: After the bump script, `docs/user/SKILLS-INDEX.md` and `COMMANDS-INDEX.md` still showed the OLD version stamp in their "Last regenerated" header. CI `docs-check.yml` catches this on PRs but NOT on direct release commits, so a stale stamp went to npm.
- **Resolved**: 2026-07-07 — added a `npm run docs:generate-index` step (run from ROOT, after all version-file updates so it picks up the freshly-bumped `uds-manifest.json`) to **both** `scripts/bump-version.mjs` and `scripts/bump-version.sh`; failure aborts the bump. Verified: `docs:generate-index` regenerates both INDEX headers with the new version, and `tests/scripts/bump-version.bats` locks the wiring in (structural grep assertions for both scripts).
- **Landed with**: XSPEC-072 Phase 4.2 (bundle-parity pre-flight gate) in the same change.
