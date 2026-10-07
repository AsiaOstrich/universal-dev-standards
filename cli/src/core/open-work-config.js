/**
 * What an adopting project declares for `uds open-work`, read from the `open_work` section of
 * uds.project.yaml (dev-platform XSPEC-460 R4 and XSPEC-461 R2: one namespace for both).
 *
 *   version: "1"
 *   open_work:
 *     projects:                 # logical project name -> where it lives on THIS machine
 *       uds: ../universal-dev-standards
 *       vibeops: ../vibeops
 *     next_action_words:        # extra words that mean "next action" in this project's carriers
 *       - 待辦
 *     command_words:            # extra program names read as a command in a next action or a draft
 *       - kubectl
 *
 * This file holds no rule. It turns the section into the same `--root NAME=DIR` and
 * `--next-action-word WORD` arguments a person could type, and hands them to the checker, which
 * is self-contained (node builtins only) and therefore cannot read YAML itself. The repository
 * shim `node scripts/check-open-work-tracking.mjs` does not read uds.project.yaml: it takes the
 * flags only.
 *
 * Directories are resolved against the directory holding uds.project.yaml. A relative path keeps
 * the committed file free of a user name and valid on every machine that lays the projects out
 * the same way; an absolute path works but is the machine-specific thing OWT-027 keeps out of a
 * carrier, so it belongs in a file that is not committed.
 *
 * @module core/open-work-config
 */

import { resolve, isAbsolute } from 'path';
import { loadProjectConfig, CONFIG_FILENAME } from './project-config.js';
import { PROJECT_NAME } from '../utils/open-work-tracking.mjs';

/**
 * @returns {{projects: Object<string,string>, nextActionWords: string[], note: string|null, error: string|null}}
 *   `note`: the file exists but could not be read at all (nothing was applied; the command goes on).
 *   `error`: the file is readable and its open_work section is wrong (the command stops with exit 2).
 */
export function readOpenWorkDeclarations(cwd = process.cwd()) {
  const out = { projects: {}, nextActionWords: [], commandWords: [], note: null, error: null };
  let config;
  try {
    config = loadProjectConfig(cwd);
  } catch (e) {
    out.note = `${CONFIG_FILENAME} could not be read (${String(e.message).split('\n')[0]}); the open_work declarations in it were not applied`;
    return out;
  }
  const section = config ? config.open_work : undefined;
  if (section === undefined) return out;
  const bad = (why) => { out.error = `${CONFIG_FILENAME}: open_work ${why}`; return out; };
  if (typeof section !== 'object' || Array.isArray(section)) return bad('must be a mapping with projects and next_action_words');

  if (section.projects !== undefined && section.projects !== null) {
    if (typeof section.projects !== 'object' || Array.isArray(section.projects)) return bad('.projects must be a mapping of project name to directory');
    for (const [name, dir] of Object.entries(section.projects)) {
      if (!PROJECT_NAME.test(name)) return bad(`.projects: "${name}" is not a logical project name (lower-case letters, digits, "-" and "_", starting with a letter, 2 to 32 characters)`);
      if (typeof dir !== 'string' || dir.trim() === '') return bad(`.projects.${name} must be a directory, written as text`);
      out.projects[name] = isAbsolute(dir) ? dir : resolve(cwd, dir);
    }
  }
  if (section.next_action_words !== undefined && section.next_action_words !== null) {
    if (!Array.isArray(section.next_action_words)) return bad('.next_action_words must be a list of words');
    for (const w of section.next_action_words) {
      if (typeof w !== 'string') return bad('.next_action_words must hold text only; write each word as plain text');
      out.nextActionWords.push(w);
    }
  }
  if (section.command_words !== undefined && section.command_words !== null) {
    if (!Array.isArray(section.command_words)) return bad('.command_words must be a list of program names');
    for (const w of section.command_words) {
      if (typeof w !== 'string') return bad('.command_words must hold text only; write each program name as plain text');
      out.commandWords.push(w);
    }
  }
  return out;
}

/**
 * The `--root` arguments for `uds open-work waiting`: what was typed (a plain DIR, and NAME=DIR for other
 * projects), then every project the file declares that was not already named on the command line (the command
 * line wins for a name given in both).
 */
export function rootArguments(cliRoots, declaredProjects = {}) {
  const given = [].concat(cliRoots ?? []);
  const named = new Set(given.map((v) => /^([^\s/\\=]+)=/.exec(String(v))?.[1]).filter(Boolean));
  const argv = [];
  for (const [name, dir] of Object.entries(declaredProjects)) if (!named.has(name)) argv.push('--root', `${name}=${dir}`);
  for (const v of given) argv.push('--root', v);
  return argv;
}

/** The `--command-word` arguments, merged the same way. */
export function commandArguments(cliWords, declaredWords = []) {
  const argv = [];
  for (const w of [].concat(cliWords ?? [], declaredWords)) argv.push('--command-word', w);
  return argv;
}

/** The `--next-action-word` arguments: the command line's words, then the file's. Merged, never either-or. */
export function wordArguments(cliWords, declaredWords = []) {
  const argv = [];
  for (const w of [].concat(cliWords ?? [], declaredWords)) argv.push('--next-action-word', w);
  return argv;
}
