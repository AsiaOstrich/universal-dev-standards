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
 *   3. `~/.udsrc` `ui.language` (or the project's `.uds/config.yaml`, which the config manager merges over it).
 *      `en` here is the config manager's built-in default, so it cannot be told apart from "not set" and does not
 *      pin the language: the environment still decides, as it did before this function existed.
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
  const rcLanguage = config.get('ui.language');
  if (rcLanguage && rcLanguage !== 'en') return rcLanguage;
  return detectLanguage(null);
}
