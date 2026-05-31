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

> **社群/release-assets 相關 TODO（原 TODO-002 ~ 005）已遷出公開 repo** → dev-platform `cross-project/business/uds/RELEASE-SOCIAL-TODOS.md`（DEC-072：行銷材料不進公開產品 repo）。本檔僅保留 UDS 產品本身的 release-flow TODO。

---

## Resolved

(none yet — newly created 2026-05-26)
