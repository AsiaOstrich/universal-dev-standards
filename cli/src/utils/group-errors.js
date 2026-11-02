/**
 * Print a list of per-file errors with each cause once (board #81).
 *
 * The installers report a failure as one string, `<file>: <cause>`. When one thing is wrong for every file - the folder
 * `.standards/` cannot be created, so every standard fails with the same two-hundred-word message - the list repeated that
 * message 50 and more times (about 64 KB), and the one line that said what was different (the locale pack, the
 * integration file) was lost among them.
 *
 * Errors are grouped by their cause, the text after the first `": "`. Only a cause that is word for word the same is
 * merged: a message that names the file it was about (`Could not copy "a" to "b"`) differs for each file and stays a
 * line of its own, so nothing is hidden that was told apart before. A string without `": "` is never merged.
 */

/** How many file names a merged group shows. The count is always the full count. */
export const SAMPLE_NAMES = 3;

/**
 * @param {Array<string>} errors - `<file>: <cause>` strings, in the order they happened
 * @returns {Array<{cause: string, labels: string[], texts: string[]}>} groups in the order of their first member; a group
 *   with `labels.length === 1` is a single error and `texts[0]` is the string it came as
 */
export function groupErrorsByCause(errors) {
  const groups = new Map();
  errors.forEach((error, index) => {
    const text = String(error);
    const at = text.indexOf(': ');
    const label = at > 0 ? text.slice(0, at) : null;
    const cause = at > 0 ? text.slice(at + 2) : text;
    const key = label === null ? `\u0000unlabelled-${index}` : cause;
    if (!groups.has(key)) groups.set(key, { cause, labels: [], texts: [] });
    const group = groups.get(key);
    group.labels.push(label ?? text);
    group.texts.push(text);
  });
  return [...groups.values()];
}

/** Fill `{name}` placeholders in one pass (a value that contains `{x}` is not filled twice). */
function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (whole, key) => (Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : whole));
}

/**
 * The lines to print: a single error as it came, a merged group as its cause followed by how many files it hit.
 * @param {Array<string>} errors
 * @param {{installErrorsAffectedAll?: string, installErrorsAffectedFirst?: string}} [words] - the two sentences, in the CLI's language (English when missing)
 * @param {string} [indent] - put in front of every line
 * @returns {string[]}
 */
export function formatGroupedErrors(errors, words, indent = '    ') {
  const lines = [];
  for (const group of groupErrorsByCause(errors)) {
    if (group.labels.length === 1) {
      lines.push(`${indent}${group.texts[0]}`);
      continue;
    }
    const shown = group.labels.slice(0, SAMPLE_NAMES);
    const template = shown.length === group.labels.length
      ? (words?.installErrorsAffectedAll || '-> {count} files affected: {names}')
      : (words?.installErrorsAffectedFirst || '-> {count} files affected, the first {shown}: {names}');
    lines.push(`${indent}${group.cause}`);
    lines.push(`${indent}  ${fill(template, { count: group.labels.length, shown: shown.length, names: shown.join(', ') })}`);
  }
  return lines;
}
