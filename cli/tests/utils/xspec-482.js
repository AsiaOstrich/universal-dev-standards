/**
 * Helpers shared by the XSPEC-482 end-to-end tests (beta.12 untested-items findings).
 * Every test using them spawns the real CLI through tests/utils/staged-cli-harness.js.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stripAnsi } from './staged-cli-harness.js';

export const DOWN = '\x1b[B';
export const ENTER = '\r';

export const readManifest = (dir) => JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'));
export const writeManifest = (dir, manifest) => writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(manifest, null, 2));

/** stdout + stderr of one run, without terminal codes. */
export const out = (run) => stripAnsi(`${run.stdout}\n${run.stderr}`);

/**
 * What a person types. `answers` maps a piece of the question's text to the keys typed when that question is on
 * the screen (each question is answered once, because the screen of the next question starts after our reply);
 * every other prompt gets Enter, i.e. its default.
 */
export function typist(answers = {}) {
  const seen = new Set();
  return (screen) => {
    for (const [pattern, keys] of Object.entries(answers)) {
      if (screen.includes(pattern) && !seen.has(pattern)) {
        seen.add(pattern);
        return keys;
      }
    }
    return ENTER;
  };
}
