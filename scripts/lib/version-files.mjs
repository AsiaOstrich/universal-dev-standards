/**
 * The files a version bump rewrites: ONE list, read by `scripts/bump-version.mjs` (which writes them) and by the stable-release
 * gate (`scripts/beta-acceptance/lib/stable-gate.mjs`, which must know which differences between a preview and its stable
 * release are only the version number).
 * 版本升版會改寫的檔案：只有這一份清單。`bump-version.mjs`（寫入者）與正式版閘門（要知道預覽版與正式版之間哪些差異只是版本號）都讀它。
 *
 * Why one list: two hand-written lists of "files that carry the version" drift apart (2026-08-20, 6.8.0: the bump skipped the
 * three SECURITY.md files that `check-version-sync.sh` checked). A gate with its own copy would refuse a release for a file the
 * bump legitimately rewrote, or wave through a file nobody bumps. The test
 * `cli/tests/integration/xspec-498-stable-gate-at-publish.test.js` ("a real bump of a copy of the repository changes no file outside the allowed lists") runs the bump and fails
 * when it touches a file that is in neither this list nor the gate's explicit release-only list.
 *
 * Paths are repo-relative with `/` (git's form); `path.join(root, p)` turns them into native paths on Windows.
 * Standard library only.
 */

/** Files `bump-version.mjs` rewrites itself, with a regex or a JSON edit. */
export const BUMP_WRITES = Object.freeze({
  cliPackage: 'cli/package.json',
  cliLock: 'cli/package-lock.json',
  registry: 'cli/standards-registry.json',
  manifest: 'uds-manifest.json',
  readme: 'README.md',
  readmeZhTw: 'locales/zh-TW/README.md',
  readmeZhCn: 'locales/zh-CN/README.md',
  security: Object.freeze(['SECURITY.md', 'locales/zh-TW/SECURITY.md', 'locales/zh-CN/SECURITY.md']),
  // frontmatter only (source_version, translation_version, last_synced); the entries of these files are the gate's CHANGELOG exception
  changelogZhTw: 'locales/zh-TW/CHANGELOG.md',
  changelogZhCn: 'locales/zh-CN/CHANGELOG.md',
  // stable releases only
  plugin: '.claude-plugin/plugin.json',
  skillsPlugin: 'skills/.claude-plugin/plugin.json',
  marketplace: '.claude-plugin/marketplace.json',
});

/**
 * Files `bump-version.mjs` does not write itself but regenerates by running another script, because they carry the version.
 * Each entry says which script; a script that changes what it writes must be reflected here.
 */
export const BUMP_REGENERATES = Object.freeze([
  'docs/user/SKILLS-INDEX.md', // `npm run docs:generate-index` (scripts/generate-skill-index.ts): "Last regenerated | UDS vX"
  'docs/user/COMMANDS-INDEX.md', // same script
  '.claude/skills/.manifest.json', // `npm run docs:adoption-skills` (scripts/generate-adoption-skills.mjs): carries the CLI version
  '.agents/skills/.manifest.json', // same script
  'llms.txt', // `npm run docs:llms-txt` (scripts/generate-llms-txt.mjs): carries the version
]);

/** Every file that differs between a preview and its stable release only because the version number changed. */
export const VERSION_FILES = Object.freeze([
  ...Object.values(BUMP_WRITES).flat(),
  ...BUMP_REGENERATES,
]);
