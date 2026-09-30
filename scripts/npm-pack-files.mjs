// Read the file list out of `npm pack --dry-run --json` stdout.
//
// Why this exists (found 2026-09-30, the 6.14.0-beta.2 publish run): two things
// about that stdout are NOT stable, and the first version of the reader assumed
// both were:
//
//   1. The SHAPE. npm <= 11 prints `[ { files: [...] } ]`. npm 12 (what
//      `npm install -g npm@latest` gives the publish job, which needs it for
//      OIDC) prints `{ "<package-name>": { files: [...] } }`. A reader that
//      slices from the first "[\n" lands on `"files": [` inside the object and
//      parses only that array, then trips on the `,` after it — "Unexpected
//      non-whitespace character after JSON at position 13781".
//   2. The NOISE. Lifecycle scripts (`prepare` prints a husky line) write to
//      stdout before the JSON, and `--ignore-scripts` does not stop `prepare`
//      from running under `npm pack` on npm 10.
//
// So: try every place a top-level JSON document could start (a line that begins
// with `[` or `{`) and stop at the widest one that parses, then accept either
// shape. If nothing parses, throw — never return an empty list, because "no
// files" is a plausible-looking answer that would make a check of the form
// "the package contains X" fail for the wrong reason (or, inverted, pass).

/** @param {string} stdout @returns {string[]} package-relative file paths */
export function parsePackFiles(stdout) {
  const text = String(stdout);
  const starts = [];
  const ends = [];
  const re = /^[[{]|^[\]}][ \t]*$/gm;
  for (let m; (m = re.exec(text)); ) {
    if (m[0] === '[' || m[0] === '{') starts.push(m.index);
    else ends.push(m.index + m[0].length);
  }
  for (const s of starts) {
    for (const e of [...ends].reverse()) {
      if (e <= s) continue;
      let doc;
      try { doc = JSON.parse(text.slice(s, e)); } catch { continue; }
      const files = filesOf(doc);
      if (files) return files;
    }
  }
  throw new Error(`no npm pack JSON with a files list found in stdout (${text.length} chars): ${text.slice(0, 200)}`);
}

function filesOf(doc) {
  const entry = Array.isArray(doc) ? doc[0] : (doc && typeof doc === 'object' ? Object.values(doc)[0] : undefined);
  if (!entry || !Array.isArray(entry.files)) return null;
  return entry.files.map((f) => f.path);
}
