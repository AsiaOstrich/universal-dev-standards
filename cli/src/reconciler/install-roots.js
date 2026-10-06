/**
 * Where `uds update` writes Skills and Commands, in the terms a backup needs (XSPEC-454 R1):
 * project-relative directories it can copy, and targets outside the project it cannot.
 *
 * A user-level target (`~/.claude/skills`) is shared by every project on the machine. Copying it into
 * one project's backup, and writing it back on that project's rollback, would undo other projects'
 * updates — so it is listed as "not backed up" and the rollback says so, rather than touching it.
 *
 * @module reconciler/install-roots
 */

import { relative, isAbsolute } from 'path';
import { getSkillsDirForAgent, getCommandsDirForAgent } from '../config/ai-agent-paths.js';
import { getAvailableSkillNames, getAvailableCommandNames } from '../utils/skills-installer.js';

const normalizeInstallation = (inst) =>
  typeof inst === 'string' ? { agent: inst, level: 'project' } : { agent: inst.agent, level: inst.level || 'project' };

/** Project-relative posix path when `abs` is inside the project, else null. */
function insideProject(projectPath, abs) {
  if (!abs) return null;
  const rel = relative(projectPath, abs).replace(/\\/g, '/');
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) return null;
  return rel;
}

/**
 * @param {string} projectPath
 * @param {Array<string|{agent: string, level?: string}>} installations
 * @param {'skills'|'commands'} kind
 * @returns {{ dirs: string[], outside: Array<{path: string, reason: string}> }}
 */
export function installRoots(projectPath, installations, kind) {
  const dirs = [];
  const outside = [];
  for (const raw of installations || []) {
    const { agent, level } = normalizeInstallation(raw);
    if (level === 'marketplace') continue; // nothing on disk
    const abs = kind === 'skills'
      ? getSkillsDirForAgent(agent, level, projectPath)
      : getCommandsDirForAgent(agent, level, projectPath);
    if (!abs) continue;
    const rel = insideProject(projectPath, abs);
    if (rel) {
      dirs.push(rel);
    } else {
      outside.push({
        path: abs,
        reason: `${kind} installed at user level for ${agent}; shared by every project on this machine, so it is not backed up and not rolled back`
      });
    }
  }
  return { dirs: [...new Set(dirs)], outside };
}

/**
 * The bookkeeping file every Skills/Commands install rewrites, for each project-level target.
 * A reconciler plan names skill and command files, never these, yet they change on every run.
 */
export function bookkeepingFiles(projectPath, manifest, { skills, commands }) {
  const out = [];
  if (skills) out.push(...installRoots(projectPath, manifest?.skills?.installations, 'skills').dirs.map((d) => `${d}/.manifest.json`));
  if (commands) out.push(...installRoots(projectPath, manifest?.commands?.installations, 'commands').dirs.map((d) => `${d}/.manifest.json`));
  return out;
}

/**
 * What a `--skills` / `--commands` step is going to write, as paths a backup can copy: the skill folders
 * (or command files) UDS ships, and the bookkeeping file, inside each project-level target.
 *
 * Deliberately not the whole target folder. That folder also holds the adopter's own skills and commands;
 * a backup that copied them would let a rollback write them back — undoing an edit the adopter made
 * after the update, to a file UDS never touched. A shipped name that is not on disk yet is still listed:
 * the backup records it as absent, which is what lets a rollback remove it again.
 *
 * @param {string} projectPath
 * @param {Array<string|{agent: string, level?: string}>} installations
 * @param {'skills'|'commands'} kind
 * @returns {{ paths: string[], outside: Array<{path: string, reason: string}> }}
 */
export function stepWritePaths(projectPath, installations, kind) {
  const { dirs, outside } = installRoots(projectPath, installations, kind);
  const names = kind === 'skills' ? getAvailableSkillNames() : getAvailableCommandNames();
  const paths = [];
  for (const dir of dirs) {
    paths.push(`${dir}/.manifest.json`);
    for (const name of names) paths.push(kind === 'skills' ? `${dir}/${name}` : `${dir}/${name}.md`);
  }
  return { paths, outside };
}
