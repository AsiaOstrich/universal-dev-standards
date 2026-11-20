import { detectLanguage } from './messages.js';
import { config } from '../utils/config-manager.js';

/**
 * The ONE chain that decides a language for the CLI, used both for the interface language (bin/uds.js) and for
 * the language `uds init -y` installs (src/commands/init.js). They used to be two chains that differed by one
 * step: the interface read ~/.udsrc and `init -y` did not, so a machine with `ui.language: zh-tw` showed
 * Chinese screens and installed English standards (dev-platform XSPEC-533 R2).
 *
 * The order, first value that is set wins:
 *   1. `explicit`  - what the user typed for this run (`--locale`), if the caller has one
 *   2. `project`   - what the project recorded: the caller says which record (the interface asks the manifest's
 *                    `options.display_language`, `init -y` asks `.uds/install.yaml` `locale:`)
 *   3. `~/.udsrc` `ui.language` (or the project's `.uds/config.yaml`, which the config manager merges over it),
 *      see udsrcLanguage(): `en` there does not pin the language, the environment still decides.
 *   4. UDS_LOCALE, then LANG / LC_ALL / LC_MESSAGES (`detectLanguage`)
 *   5. `en` (`detectLanguage` ends here)
 *
 * Values are returned as they were written; the caller validates them (`setLanguage` falls back to English,
 * `normalizeRequestedLocale` says an unsupported one out loud).
 *
 * @param {{ explicit?: string|null, project?: string|null }} [sources]
 * @returns {string}
 */
export function resolveLanguage({ explicit = null, project = null } = {}) {
  if (explicit) return explicit;
  if (project) return project;
  return udsrcLanguage() || detectLanguage(null);
}

/**
 * The language `~/.udsrc` (or the project's `.uds/config.yaml`) says, or null when it says nothing that counts.
 * `en` is the config manager's built-in default, so it cannot be told apart from "not set" and does not count.
 * One definition, used by resolveLanguage() and by `uds update`, whose own order reads it but not LANG
 * (see resolveLocale() in src/commands/update.js).
 *
 * @returns {string|null}
 */
export function udsrcLanguage() {
  const rcLanguage = config.get('ui.language');
  return rcLanguage && rcLanguage !== 'en' ? rcLanguage : null;
}
