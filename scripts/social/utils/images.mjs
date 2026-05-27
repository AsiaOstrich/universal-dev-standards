/**
 * images.mjs
 * Read image files from release-assets/v{VERSION}/images/
 * and provide upload helpers for platforms that need hosted URLs.
 *
 * Note: Meta APIs (Threads, IG) require a publicly accessible image URL.
 * Strategy: upload to GitHub releases as assets, then use the raw URL.
 * LinkedIn accepts direct binary upload (registerUpload → PUT).
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');

/**
 * Read an image file as a Buffer.
 * @param {string} version
 * @param {string} relativePath  e.g. 'ig/01-cover.png' or 'fb/cover.png'
 */
export function readImage(version, relativePath) {
  const fullPath = join(REPO_ROOT, 'release-assets', `v${version}`, 'images', relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Image not found: ${fullPath}`);
  }
  return readFileSync(fullPath);
}

/**
 * Return the public GitHub raw URL for a release-assets image.
 * Images committed to the repo are accessible via raw.githubusercontent.com.
 *
 * @param {string} version
 * @param {string} relativePath  e.g. 'ig/01-cover.png'
 * @param {string} [branch]      default: 'main'
 */
export function getPublicImageUrl(version, relativePath, branch = 'main') {
  return [
    'https://raw.githubusercontent.com',
    'AsiaOstrich/universal-dev-standards',
    branch,
    'release-assets',
    `v${version}`,
    'images',
    relativePath,
  ].join('/');
}

/**
 * List all image files for a version + platform subfolder.
 * @param {string} version
 * @param {string} subfolder  'ig' | 'fb' | 'threads'
 * @returns {string[]}  sorted list of filenames
 */
export function listImages(version, subfolder) {
  const dir = join(REPO_ROOT, 'release-assets', `v${version}`, 'images', subfolder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();
}
