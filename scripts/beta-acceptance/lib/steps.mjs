/**
 * The acceptance list: shape, validation, platform filter (dev-platform XSPEC-469 R1).
 *
 * `steps.json` is read by three consumers that must agree on its shape: the coverage check
 * (`check-steps.mjs`), the runner (`run.mjs`) and the PRE-RELEASE generator (`generate-pre-release.mjs`).
 * `validateSteps` is the one place that says what a well-formed list is.
 *
 * Standard library only.
 */

export const PLATFORMS = ['all', 'windows', 'macos', 'linux'];
export const STEP_ID = /^[a-z0-9][a-z0-9-]*$/;
/** An exemption has to say why; "n/a" is not a reason. */
export const MIN_REASON_LENGTH = 20;
/** What an exemption can exempt: a CHANGELOG entry (XSPEC-469), a command or an option of the CLI (XSPEC-471 R2), a step's exit-only expectation (XSPEC-471 R3). */
export const EXEMPTION_TARGETS = ['changelog', 'command', 'option', 'step'];

/** The ids of the steps that may check only an exit code: an exemption that names the step and gives a reason. Without a reason it does not count. */
export function exitOnlyExemptions(doc) {
  const list = Array.isArray(doc && doc.exemptions) ? doc.exemptions : [];
  return new Set(list
    .filter((x) => x && typeof x.step === 'string' && typeof x.reason === 'string' && x.reason.trim().length >= MIN_REASON_LENGTH)
    .map((x) => x.step.trim()));
}

/** `process.platform` -> the vocabulary of the list. Anything else (freebsd, ...) is its own name, matched by `all` only. */
export function platformName(nodePlatform = process.platform) {
  if (nodePlatform === 'win32') return 'windows';
  if (nodePlatform === 'darwin') return 'macos';
  if (nodePlatform === 'linux') return 'linux';
  return nodePlatform;
}

export function appliesTo(step, platform = platformName()) {
  return step.platform === 'all' || step.platform === platform;
}

/** Does the step read back an effect: output text it must contain, a pattern, or a file? (`notContains` alone passes for a command that prints nothing, so it does not count.) */
export const checksEffect = (step) => {
  const e = (step && step.expect) || {};
  return (e.contains || []).length + (e.matches || []).length + (e.files || []).length > 0;
};

const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');

/**
 * @param {unknown} doc  the parsed steps.json
 * @returns {string[]}   one message per problem; empty = well formed
 */
export function validateSteps(doc) {
  const errors = [];
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return ['the steps file is not a JSON object'];
  if (doc.schema !== 1) errors.push(`schema must be 1, got ${JSON.stringify(doc.schema)}`);
  if (!Array.isArray(doc.steps)) {
    errors.push('"steps" must be an array');
    return errors;
  }
  const exemptions = doc.exemptions === undefined ? [] : doc.exemptions;
  if (!Array.isArray(exemptions)) {
    errors.push('"exemptions" must be an array');
  } else {
    exemptions.forEach((x, i) => {
      const targets = EXEMPTION_TARGETS.filter((k) => x && typeof x[k] === 'string' && x[k].trim() !== '');
      if (targets.length !== 1) {
        errors.push(`exemptions[${i}] must name exactly one thing it exempts: "changelog" (an entry), "command", "option" or "step"`);
      }
      const label = targets.length === 1 ? `${targets[0]} ${JSON.stringify(x[targets[0]])}` : 'no target';
      if (!x || typeof x.reason !== 'string' || x.reason.trim().length < MIN_REASON_LENGTH) {
        errors.push(`exemptions[${i}] (${label}) needs a "reason" of at least ${MIN_REASON_LENGTH} characters saying why it is exempt`);
      }
    });
  }
  const seen = new Set();
  const exitOnlyOk = exitOnlyExemptions(doc);
  const stepIds = new Set(doc.steps.map((s) => s && s.id));
  (Array.isArray(exemptions) ? exemptions : []).forEach((x, i) => {
    if (x && typeof x.step === 'string' && x.step.trim() !== '' && !stepIds.has(x.step.trim())) errors.push(`exemptions[${i}] (step ${JSON.stringify(x.step)}) names a step that does not exist`);
  });
  doc.steps.forEach((s, i) => {
    const where = `steps[${i}]${s && s.id ? ` (${s.id})` : ''}`;
    if (!s || typeof s !== 'object') {
      errors.push(`${where} is not an object`);
      return;
    }
    if (typeof s.id !== 'string' || !STEP_ID.test(s.id)) errors.push(`${where}: "id" must match ${STEP_ID}`);
    else if (seen.has(s.id)) errors.push(`${where}: duplicate id`);
    else seen.add(s.id);
    if (typeof s.title !== 'string' || s.title.trim() === '') errors.push(`${where}: "title" (English) is required`);
    if (typeof s.titleZh !== 'string' || s.titleZh.trim() === '') errors.push(`${where}: "titleZh" (繁體中文) is required`);
    if (!PLATFORMS.includes(s.platform)) errors.push(`${where}: "platform" must be one of ${PLATFORMS.join(', ')}`);
    if (!isStringArray(s.changelog)) errors.push(`${where}: "changelog" must be an array of CHANGELOG entry anchors`);
    else if (s.changelog.length === 0 && s.smoke !== true) errors.push(`${where}: no CHANGELOG entry and not marked "smoke": true — a step that tests nothing the CHANGELOG promises must say it is a smoke step`);
    const commands = ['uds', 'run', 'shim', 'inspect'].filter((k) => s[k] !== undefined);
    if (commands.length !== 1) errors.push(`${where}: exactly one of "uds" (arguments for the uds binary), "shim" (arguments for the installed uds command itself), "run" (a program and its arguments) or "inspect": true (read files only, no command) is required`);
    else if (commands[0] === 'inspect') {
      if (s.inspect !== true) errors.push(`${where}: "inspect" must be true`);
      else if (!((s.expect || {}).files || []).length) errors.push(`${where}: an "inspect" step has no command, so it needs expect.files to read`);
    } else if (!isStringArray(s[commands[0]]) || s[commands[0]].length === 0) errors.push(`${where}: "${commands[0]}" must be a non-empty array of strings`);
    if (s.prepare !== undefined && !Array.isArray(s.prepare)) errors.push(`${where}: "prepare" must be an array`);
    if (s.expect !== undefined) {
      if (typeof s.expect !== 'object' || s.expect === null) errors.push(`${where}: "expect" must be an object`);
      else {
        for (const k of ['contains', 'notContains', 'matches']) {
          if (s.expect[k] !== undefined && !isStringArray(s.expect[k])) errors.push(`${where}: expect.${k} must be an array of strings`);
        }
        const exit = s.expect.exit;
        if (exit !== undefined && !(Number.isInteger(exit) || (Array.isArray(exit) && exit.length > 0 && exit.every(Number.isInteger)))) {
          errors.push(`${where}: expect.exit must be an integer or a non-empty array of integers`);
        }
        for (const [j, re] of (s.expect.matches || []).entries()) {
          try { new RegExp(re, 'm'); } catch (e) { errors.push(`${where}: expect.matches[${j}] is not a regular expression (${e.message})`); }
        }
      }
    }
    // An exit code alone proves a command ran, not that the feature is there: beta.6 exits 0 for a flag it does not know
    // in several commands. Every step reads back at least one piece of output or one file (XSPEC-471 R3), a person's step
    // included, unless an exemption names the step and says why it cannot (for example its output goes to the person's terminal).
    const checks = checksEffect(s);
    if (!checks && !exitOnlyOk.has(s.id)) errors.push(`${where}: only an exit code is checked — "expect" needs "contains", "matches" or "files" (output text or a file to read back) so the step can tell the feature from its absence, or an "exemptions" item {"step": "${s.id}", "reason": ...} saying why it cannot`);
    else if (checks && exitOnlyOk.has(s.id)) errors.push(`${where}: has an exemption for checking only an exit code, but it checks output or a file: remove the exemption`);
    if (s.human !== undefined) {
      if (!s.human || typeof s.human.prompt !== 'string' || typeof s.human.promptZh !== 'string') errors.push(`${where}: "human" needs "prompt" (English) and "promptZh" (繁體中文) saying what the person should look at`);
    }
  });
  return errors;
}
