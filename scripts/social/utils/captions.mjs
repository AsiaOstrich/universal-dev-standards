/**
 * captions.mjs
 * Read and parse platform captions from release-assets/v{VERSION}/captions/{platform}.md
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');

/**
 * Extract the raw text content from inside the first ```...``` fenced block
 * that appears after a given heading (e.g. "## Post 1").
 */
function extractFencedBlock(content, afterHeading) {
  const headingIdx = content.indexOf(afterHeading);
  if (headingIdx === -1) return null;
  const afterHead = content.slice(headingIdx);
  const fenceStart = afterHead.indexOf('```\n');
  if (fenceStart === -1) return null;
  const bodyStart = fenceStart + 4;
  const fenceEnd = afterHead.indexOf('\n```', bodyStart);
  if (fenceEnd === -1) return null;
  return afterHead.slice(bodyStart, fenceEnd).trim();
}

/**
 * Read captions for a specific platform.
 *
 * Returns platform-specific structure:
 *   threads  → { posts: [string, string, string] }
 *   x        → { tweets: [string, string, string] }
 *   instagram → { caption: string, slides: Array<{headline, subheadline}> }
 *   facebook  → { text: string }
 *   linkedin  → { text: string }
 */
export function readCaptions(version, platform) {
  const captionPath = join(
    REPO_ROOT,
    'release-assets',
    `v${version}`,
    'captions',
    `${platform}.md`
  );

  if (!existsSync(captionPath)) {
    throw new Error(`Caption file not found: ${captionPath}`);
  }

  const content = readFileSync(captionPath, 'utf-8');

  switch (platform) {
    case 'threads': {
      const posts = [
        extractFencedBlock(content, '## Post 1'),
        extractFencedBlock(content, '## Post 2'),
        extractFencedBlock(content, '## Post 3'),
      ];
      if (posts.some(p => p === null)) {
        throw new Error(`threads caption missing Post 1/2/3 fenced blocks in ${captionPath}`);
      }
      return { posts };
    }

    case 'x': {
      const tweets = [
        extractFencedBlock(content, '## Tweet 1'),
        extractFencedBlock(content, '## Tweet 2'),
        extractFencedBlock(content, '## Tweet 3'),
      ];
      if (tweets.some(t => t === null)) {
        throw new Error(`x caption missing Tweet 1/2/3 fenced blocks in ${captionPath}`);
      }
      return { tweets };
    }

    case 'instagram': {
      // Extract main caption block and slide table
      const caption = extractFencedBlock(content, '## Post caption');
      if (!caption) throw new Error(`instagram caption missing "## Post caption" block`);

      // Parse slide table  |  Slide | Headline | Subheadline |
      const slides = [];
      const tableRows = content.match(/^\|.*\|.*\|.*\|$/gm) || [];
      for (const row of tableRows) {
        const cells = row.split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length === 3 && !cells[0].startsWith('-') && !cells[0].toLowerCase().startsWith('slide')) {
          slides.push({ slide: cells[0], headline: cells[1], subheadline: cells[2] });
        }
      }
      return { caption, slides };
    }

    case 'facebook':
    case 'linkedin': {
      // Grab the first fenced block in the file
      const match = content.match(/```[^\n]*\n([\s\S]*?)\n```/);
      const finalText = match ? match[1].trim() : null;
      if (!finalText) throw new Error(`${platform} caption missing fenced block in ${captionPath}`);
      return { text: finalText };
    }

    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * List all versions that have caption files for a given platform.
 */
export function listVersionsWithCaptions(platform) {
  const releaseAssetsDir = join(REPO_ROOT, 'release-assets');
  return readdirSync(releaseAssetsDir)
    .filter(name => name.startsWith('v'))
    .filter(name => existsSync(join(releaseAssetsDir, name, 'captions', `${platform}.md`)))
    .map(name => name.slice(1)); // strip leading 'v'
}
