/**
 * Which shipped skills are optional (issue #298). No imports: scripts at the repository root
 * (`scripts/generate-adoption-skills.mjs`) read this list without installing the CLI's packages, and a second
 * copy of the list there would be a second definition of "optional".
 *
 * Skills UDS ships but installs only in a project that asks for them. Folder name -> why it is optional.
 * A skill belongs here when UDS itself says "nothing in UDS requires it" and a project that never wanted it,
 * or already has its own, is worse off with it installed. Adding a name changes what every adopter's next
 * `uds update` plans: the skill stops being installed in projects that do not hold it. Projects that already
 * hold it keep it (see skill-selection.js).
 */
export const OPTIONAL_SKILLS = Object.freeze({
  'open-work-assistant':
    'Help for work that stays open across sessions. Its own text says nothing in UDS requires it, and a person who already keeps such a skill would get two that read alike.'
});

/** @param {string} folder @returns {boolean} */
export function isOptionalSkill(folder) {
  return Object.prototype.hasOwnProperty.call(OPTIONAL_SKILLS, folder);
}
