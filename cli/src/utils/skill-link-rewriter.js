/**
 * Rewrite the relative links of a skill file that point at places which do not exist once the skill is installed
 * (dev-platform #61, decision 214A; #47 fixed one skill by hand).
 *
 * A skill source file links to its neighbours the way the UDS source repo is laid out: `../../core/x.md`,
 * `../../../../skills/y/SKILL.md`, `../../locales/zh-TW/...`. Installed, the skill sits in
 * `<project>/<agent folder>/skills/<name>/` and the repo around it is gone, so most of those links open nothing.
 * This module decides, link by link, whether the link still lands on a file that the same install puts on disk.
 * If it does, the link is kept as written. If it does not, it becomes the GitHub address of the file the author
 * meant (`https://github.com/AsiaOstrich/universal-dev-standards/blob/main/<repo path>`), anchor kept.
 *
 * The source files in the UDS repo are not touched; this runs where the installer writes the file
 * (`resolveSkillFiles`), so installing, planning and `uds check` all see the same content.
 *
 * The module has no file access on purpose: what the install will contain is passed in as a question
 * (`isInstalledSkillFile`), so the answer is the installer's and not a second copy of its rules here.
 *
 * Scope and limits:
 *  - Markdown inline links and images, `[label]: target` definitions. Links inside fenced code blocks and inline
 *    code spans are examples, not links, and are left alone.
 *  - Absolute URLs, `mailto:`, `//host`, `/abs/path` and bare `#anchor` links are not relative links.
 *  - A link whose target leaves the repo root (cannot be mapped to a repo path) is left unchanged and reported.
 *
 * @module utils/skill-link-rewriter
 */

import { posix, join } from 'path';
import { existsSync } from 'fs';

export const UDS_REPO_BLOB_BASE = 'https://github.com/AsiaOstrich/universal-dev-standards/blob/main/';
export const UDS_REPO_TREE_BASE = 'https://github.com/AsiaOstrich/universal-dev-standards/tree/main/';

/** Top-level folders of the UDS repo that the npm package carries (cli/scripts/prepack.mjs): absence there is real. */
const PACKAGED_DIRS = ['core', 'ai', 'locales', 'skills', 'templates', 'extensions'];

/**
 * The "does this repo path exist?" question `rewriteOutsideLinks` asks, answered from one or more folders that hold
 * a copy of the UDS repo layout (the npm package's `bundled/`, a checkout). One definition, used by the installer and
 * by the self-adoption generator, so the two cannot answer differently.
 *
 * `true` when any root has the path. When none has it: `false` for a folder the package carries (the link is
 * dead in the source), `undefined` for the rest (`docs/`, `.standards/`, `LICENSE`: not part of the package, so
 * "not found" says nothing about whether the repo has it).
 *
 * @param {string[]} roots
 * @returns {(repoPath: string) => (boolean|undefined)}
 */
export function createRepoPathProbe(roots) {
  return (repoPath) => {
    const parts = repoPath.split('/');
    if (roots.some((root) => existsSync(join(root, ...parts)))) return true;
    return PACKAGED_DIRS.includes(parts[0]) ? false : undefined;
  };
}

/** A link target that is not a relative file reference (URL with scheme, `//host`, absolute path, bare anchor). */
export function isNotRelativeTarget(target) {
  return target === '' || target.startsWith('#') || target.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(target);
}

// Alternatives are tried left to right at each position, so code is consumed before a link inside it can match.
// A fence that is never closed is NOT treated as code to the end of the file (CommonMark would): in the shipped
// skills that is always a nesting slip of the author's (a ```markdown block holding ```bash blocks), and the
// reference list after it is meant as links.
const FENCED_CODE = '^[ \\t]*(`{3,}|~{3,})[^\\n]*\\n[\\s\\S]*?^[ \\t]*\\2[`~]*[ \\t]*$';
const INLINE_CODE = '(`+)[^`\\n]*?\\4(?!`)';
const LABEL = '\\[(?:[^\\[\\]]|\\[[^\\]]*\\])*\\]';
const INLINE_LINK = `(!?${LABEL})\\(\\s*(<[^>\\n]*>|[^)\\s]+)((?:\\s+(?:"[^"\\n]*"|'[^'\\n]*'))?)\\s*\\)`;
const DEFINITION = '^([ ]{0,3}\\[[^\\]\\n]+\\]:[ \\t]*)(<[^>\\n]*>|\\S+)';

function buildScanner() {
  return new RegExp(`(${FENCED_CODE})|(${INLINE_CODE})|${INLINE_LINK}|${DEFINITION}`, 'gm');
}

/**
 * @typedef {Object} RewriteReport
 * @property {string} text - the file content after rewriting
 * @property {Array<{from: string, to: string, repoPath: string}>} rewritten - links turned into GitHub addresses
 * @property {string[]} kept - relative links that still land on an installed file, left as written
 * @property {string[]} unresolved - relative links that leave the repo root; left unchanged
 * @property {string[]} leftAlone - relative links that do not land on an installed file but name nothing real in the
 *   UDS repo either (placeholders of a template, links that were already dead in the source); left unchanged
 */

/**
 * @param {string} text - markdown content of one file of the skill
 * @param {Object} ctx
 * @param {string} ctx.skillName - the skill the file belongs to (its installed folder name)
 * @param {string} ctx.sourcePath - repo path (posix, relative to the repo root) of the file the content came from,
 *   e.g. `skills/commit-standards/SKILL.md` or `locales/zh-TW/skills/commit-standards/SKILL.md`. Relative links in
 *   the file were written against this location.
 * @param {(skill: string, fileName: string) => boolean} ctx.isInstalledSkillFile - whether the install puts
 *   `<skills folder>/<skill>/<fileName>` on disk
 * @param {(repoPath: string) => (boolean|undefined)} [ctx.repoPathExists] - whether a repo path exists in the UDS
 *   source this install reads from; `undefined` when that cannot be told (the path is not part of the package)
 * @returns {RewriteReport}
 */
export function rewriteOutsideLinks(text, ctx) {
  const rewritten = [];
  const kept = [];
  const unresolved = [];
  const leftAlone = [];

  const decide = (rawTarget) => {
    // `<...>` is the markdown way to write a target that has spaces in it.
    const bracketed = rawTarget.startsWith('<') && rawTarget.endsWith('>');
    const target = bracketed ? rawTarget.slice(1, -1) : rawTarget;
    const hashAt = target.indexOf('#');
    const pathPart = hashAt === -1 ? target : target.slice(0, hashAt);
    const anchor = hashAt === -1 ? '' : target.slice(hashAt);
    if (isNotRelativeTarget(target) || pathPart === '') return null;

    // 1. Does the link still work from the installed folder? Resolved against the skills folder, where the skill is
    //    `<skillName>/`. It works only when it lands on `<skill>/<file>` that this install writes.
    const installed = posix.normalize(posix.join(ctx.skillName, pathPart));
    const parts = installed.split('/');
    if (!installed.startsWith('..') && parts.length === 2 && parts[1] !== '' && ctx.isInstalledSkillFile(parts[0], parts[1])) { // wire:skill-link-keep-if-installed
      kept.push(rawTarget);
      return null;
    }

    // 2. It does not. The author wrote it against the source layout; turn that location into a GitHub address.
    const sourceDir = posix.dirname(ctx.sourcePath);
    const repoPath = posix.normalize(posix.join(sourceDir, pathPart));
    if (repoPath.startsWith('..') || repoPath === '.' || repoPath.startsWith('/')) {
      unresolved.push(rawTarget);
      return null;
    }
    // Only a link that points at something real in the UDS repo gets an address.
    //  - A link that stays inside the skill's own folder (`docs/`, `CONTRIBUTING.md`, in the README and documentation
    //    templates of documentation-guide) is usually a placeholder meant for the adopter's own project: it names
    //    nothing in UDS, and a GitHub address for it would be a new dead link. It is rewritten only when the file
    //    is really there in the source (a subfolder the installer does not copy, for example).
    //  - A link that leaves the skill's folder is rewritten unless UDS can see that the target is not there.
    //    "Cannot see" (undefined) is not "not there": `docs/` and `.standards/` are not in the npm package.
    const exists = ctx.repoPathExists ? ctx.repoPathExists(repoPath.replace(/\/+$/, '')) : undefined;
    const staysInsideSkill = repoPath.startsWith(`${sourceDir}/`);
    if (staysInsideSkill ? exists !== true : exists === false) {
      leftAlone.push(rawTarget);
      return null;
    }
    const base = repoPath.endsWith('/') ? UDS_REPO_TREE_BASE : UDS_REPO_BLOB_BASE;
    const url = `${base}${repoPath}${anchor}`;
    rewritten.push({ from: rawTarget, to: url, repoPath });
    return bracketed ? `<${url}>` : url;
  };

  const scan = (source) => source.replace(buildScanner(), (...args) => {
    const match = args[0];
    // Capture groups: 1 fenced code (2 its fence), 3 inline code (4 its backticks), 5/6/7 inline link, 8/9 definition.
    if (args[1] !== undefined || args[3] !== undefined) return match;
    if (args[5] !== undefined) {
      // The label can hold a link of its own (a badge image inside a link): look inside it too.
      const bang = args[5].startsWith('!') ? '!' : '';
      const inner = args[5].slice(bang.length + 1, -1);
      const scannedInner = scan(inner);
      const replacement = decide(args[6]);
      if (replacement === null && scannedInner === inner) return match;
      return `${bang}[${scannedInner}](${replacement === null ? args[6] : replacement}${args[7] || ''})`;
    }
    if (args[8] !== undefined) {
      const replacement = decide(args[9]);
      return replacement === null ? match : `${args[8]}${replacement}`;
    }
    return match;
  });
  const out = scan(text);

  return { text: out, rewritten, kept, unresolved, leftAlone };
}
