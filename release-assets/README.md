# Release Assets

Single source of truth for release-time social media assets (images + captions per platform). Designed to feed an automated `social-publish.yml` workflow (planned Phase 2) that triggers on `release: types: [published]` and cross-posts to Facebook Page, Instagram, and Threads via Meta Graph API.

> Current state (2026-05-26): **Phase 1** — directory structure + captions stored, images placed manually, social publishing still manual.
> Future: **Phase 2** adds the workflow + Meta API integration so a single `git tag` triggers npm publish + 3-platform social cross-post.

---

## Directory layout

```
release-assets/
├── README.md                       ← this file
├── _template/                      ← copy from here for each new release
│   ├── prompts.md.template
│   └── captions/
│       ├── ig.md.template
│       ├── threads.md.template
│       └── fb.md.template
└── v{X.Y.Z}/                       ← per-release assets
    ├── images/
    │   ├── README.md               ← per-release notes on image strategy/style
    │   ├── ig/                     ← IG carousel slides (1080x1080, N images)
    │   │   ├── 01-cover.png
    │   │   ├── 02-{feature}.png
    │   │   └── ...
    │   ├── fb/                     ← FB single post image(s) (landscape OK)
    │   │   └── cover.png
    │   └── threads/                ← optional; Threads usually reuses ig/01-cover.png
    ├── prompts.md                  ← exact prompts used to generate images (reproducibility)
    ├── captions/
    │   ├── ig.md                   ← IG carousel caption + hashtags
    │   ├── threads.md              ← Threads thread, posts separated by `---`
    │   └── fb.md                   ← FB single post caption with inline links
    └── meta.json                   ← release metadata + social post URLs once posted
```

**Per-platform image strategy** (since v5.13.3):
- **IG**: 6-image carousel — each card focuses on one feature (best for algorithm + saves)
- **FB**: single landscape all-in-one infographic — readers scroll fast, dense visual works better than carousel
- **Threads**: text-first; reuse IG cover as Post 1 attachment (no separate file needed)

---

## Workflow (manual today, automated in Phase 2)

### Pre-release (T-1 day, ~30 min)

```bash
# 1. Bootstrap from template
cp -r release-assets/_template release-assets/v$VERSION
# (rename .template suffix from each file, fill {VERSION} placeholders)

# 2. Edit captions to match the version's CHANGELOG entries
$EDITOR release-assets/v$VERSION/captions/{ig,threads,fb}.md

# 3. Generate 5 images via ChatGPT using prompts.md (or DALL-E API in Phase 3)
# Place under images/

# 4. Stage + commit
git add release-assets/v$VERSION
git commit -m "release-assets: prepare v$VERSION social bundle"
```

### Release (T-0)

Currently manual:
1. Promote CHANGELOG, bump version, tag, push, create GitHub Release (existing flow)
2. After npm publish succeeds, manually post to IG / Threads / FB using files in `release-assets/v$VERSION/`

Future (Phase 2): GitHub Action reads `release-assets/v$VERSION/` and auto-posts via Meta APIs.

---

## Hard gate (Phase 1.5, planned)

`scripts/pre-release-check.sh` will gain a new step verifying:
- `release-assets/v$VERSION/` exists
- `captions/{ig,threads,fb}.md` all present and non-empty
- `images/` has at least 1 PNG
- `--skip-social` flag available for trivial patch releases

Same pattern as the existing CHANGELOG hard gate (step 22.5).

---

## Phase roadmap

| Phase | Scope | Effort | Status |
|---|---|---|---|
| **1** | Directory structure + retroactively store v5.13.3 | 30 min | **Done 2026-05-26** |
| **1.5** | `pre-release-check.sh` step 22.6 social-assets hard gate | 30 min | Not started |
| **2** | Meta Developer App + `scripts/publish/{ig,threads,fb}.mjs` + `social-publish.yml` workflow | 8-16 hr (incl. Meta App review 5-7 days) | Not started |
| **3** | AI auto-generate captions from CHANGELOG + AI auto-generate images via gpt-image-1 API | 1-2 weeks | Not started |

---

## v5.13.3 retroactive snapshot

`release-assets/v5.13.3/` was populated **after** the actual release on 2026-05-26 as the first reference implementation. The social posts on IG/Threads/FB for v5.13.3 were created manually before this directory existed — see `v5.13.3/meta.json` for links.
