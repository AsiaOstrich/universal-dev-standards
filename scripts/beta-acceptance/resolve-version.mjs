#!/usr/bin/env node
/**
 * resolve-version — which published version does the post-publish acceptance test? (dev-platform XSPEC-471 R1)
 *
 * The version is never written into the workflow. It is either
 *   --from-package <package.json>   the version the publish job read from the same commit (a release just published), or
 *   --version <x.y.z[-pre]>         what a person typed when they started the workflow by hand.
 *
 * It must be one exact version. A dist-tag (`beta`), a range or a path would make "the version that was tested" a moving
 * target, and the version later becomes part of a command line and an artifact name, so anything outside
 * [0-9A-Za-z.+-] is refused here, before it can reach either.
 *
 * Usage: node scripts/beta-acceptance/resolve-version.mjs (--from-package <file> | --version <v>) [--tag <git tag>]
 *   Prints `version=<v>` and, when GITHUB_OUTPUT is set, appends the same line to that file.
 *   --tag is only compared: a release tagged `v6.14.0` whose package.json says 6.14.0-beta.8 is published as the
 *   package.json says, so that is what is tested, and the mismatch is reported as a warning.
 *
 * Exit codes: 0 resolved; 2 could not resolve (no source, unreadable file, not an exact version).
 *
 * Standard library only.
 */

import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** An exact semantic version: major.minor.patch, optional pre-release and build parts. */
export const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?(?:\+[0-9A-Za-z.-]+)?$/;

function parse(argv) {
  const out = { fromPackage: null, version: null, tag: null };
  for (let i = 0; i < argv.length; i += 1) {
    const name = argv[i];
    if (!['--from-package', '--version', '--tag'].includes(name)) throw new Error(`unknown option: ${name}`);
    const value = argv[(i += 1)];
    if (value === undefined || value === '') throw new Error(`${name} needs a value`);
    if (name === '--from-package') out.fromPackage = resolve(value);
    else if (name === '--version') out.version = value;
    else out.tag = value;
  }
  return out;
}

export function main(argv, env = process.env) {
  let opts;
  try {
    opts = parse(argv);
  } catch (e) {
    console.error(`[resolve-version] ${e.message}`);
    return 2;
  }
  if (Boolean(opts.fromPackage) === Boolean(opts.version)) {
    console.error('[resolve-version] give exactly one of --from-package <package.json> or --version <x.y.z>');
    return 2;
  }
  let version = opts.version;
  if (opts.fromPackage) {
    try {
      version = JSON.parse(readFileSync(opts.fromPackage, 'utf-8')).version;
    } catch (e) {
      console.error(`[resolve-version] cannot read the version from ${opts.fromPackage}: ${e.message}`);
      return 2;
    }
  }
  if (typeof version !== 'string' || !EXACT_VERSION.test(version)) {
    console.error(`[resolve-version] ${JSON.stringify(version)} is not one exact version such as 6.14.0 or 6.14.0-beta.7. A dist-tag or a range is refused: it would change under the test. 要的是一個確切的版本號，不接受 dist-tag 或範圍。`);
    return 2;
  }
  if (opts.tag && opts.tag.replace(/^v/, '') !== version) {
    const note = `the release tag is ${opts.tag} but the version in package.json is ${version}; testing ${version}, which is what was published`;
    console.error(env.GITHUB_ACTIONS ? `::warning title=Tag and package.json disagree::${note}` : `[resolve-version] WARNING: ${note}`);
  }
  console.log(`version=${version}`);
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `version=${version}\n`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
