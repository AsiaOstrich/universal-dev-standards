#!/usr/bin/env node
/**
 * publish.mjs — Social media auto-publish entry point
 *
 * Usage:
 *   node scripts/social/publish.mjs [options]
 *
 * Options:
 *   --version  <ver>     Release version (e.g. 5.14.0). Auto-detected if omitted.
 *   --platform <name>    all | linkedin | threads | instagram | facebook  (default: all)
 *   --dry-run            Print what would be posted without calling any API
 *   --check-schedule     Only run if publish_at is within the ±15 min window (for cron)
 *
 * Env vars consumed (per platform):
 *   LinkedIn:  LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_ID (or LINKEDIN_ORG_ID)
 *   Threads:   THREADS_ACCESS_TOKEN, THREADS_USER_ID
 *   Instagram: IG_ACCESS_TOKEN, IG_USER_ID
 *   Facebook:  FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID
 */

import { readMeta, markPosted, findPendingVersion } from './utils/meta.mjs';
import { readCaptions } from './utils/captions.mjs';
import { isWithinWindow, isPastDue, toTaiwanTime } from './utils/scheduler.mjs';
import { publishLinkedIn } from './platforms/linkedin.mjs';
import { publishThreads } from './platforms/threads.mjs';
import { publishInstagram } from './platforms/instagram.mjs';
import { publishFacebook } from './platforms/facebook.mjs';

// ── Parse CLI args ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
}

function hasFlag(flag) {
  return args.includes(flag);
}

const DRY_RUN = hasFlag('--dry-run') || process.env.DRY_RUN === 'true';
const CHECK_SCHEDULE = hasFlag('--check-schedule');
const PLATFORM = getArg('--platform') || process.env.PLATFORM || 'all';
let VERSION = getArg('--version') || process.env.VERSION || null;

// ── Resolve version ───────────────────────────────────────────────────────────

if (!VERSION) {
  VERSION = findPendingVersion();
  if (!VERSION) {
    console.log('No pending release found (no meta.json with publish_schedule.status = pending).');
    process.exit(0);
  }
  console.log(`Auto-detected pending version: ${VERSION}`);
}

// ── Load meta.json ────────────────────────────────────────────────────────────

const meta = readMeta(VERSION);
const schedule = meta.publish_schedule;

// ── Schedule gate ─────────────────────────────────────────────────────────────

if (CHECK_SCHEDULE) {
  if (!schedule?.publish_at) {
    console.log(`[${VERSION}] No publish_at set — skipping.`);
    process.exit(0);
  }

  if (schedule.status === 'done') {
    console.log(`[${VERSION}] Already published — skipping.`);
    process.exit(0);
  }

  if (isPastDue(schedule.publish_at)) {
    console.warn(`[${VERSION}] publish_at ${schedule.publish_at} is past due (missed window). Proceeding anyway.`);
  } else if (!isWithinWindow(schedule.publish_at)) {
    const twTime = toTaiwanTime(schedule.publish_at);
    console.log(`[${VERSION}] Not yet time to publish (scheduled: ${twTime} TW). Skipping.`);
    process.exit(0);
  }
}

// ── Determine platforms ───────────────────────────────────────────────────────

const allPlatforms = schedule?.platforms ?? ['linkedin', 'threads', 'instagram', 'facebook'];
const platformsToRun = PLATFORM === 'all' ? allPlatforms : [PLATFORM];

console.log(`\n📣 Publishing v${VERSION} to: ${platformsToRun.join(', ')}${DRY_RUN ? ' [DRY RUN]' : ''}\n`);

// ── Publish ───────────────────────────────────────────────────────────────────

const errors = [];

for (const platform of platformsToRun) {
  // Skip already posted platforms (unless dry-run)
  if (!DRY_RUN && meta.social_posts?.[platform]?.posted_at) {
    console.log(`[${platform}] Already posted at ${meta.social_posts[platform].posted_at} — skipping.`);
    continue;
  }

  try {
    let url;

    switch (platform) {
      case 'linkedin': {
        const { text } = readCaptions(VERSION, 'linkedin');
        url = await publishLinkedIn({ text, version: VERSION, dryRun: DRY_RUN });
        break;
      }

      case 'threads': {
        const { posts } = readCaptions(VERSION, 'threads');
        const urls = await publishThreads({ posts, version: VERSION, dryRun: DRY_RUN });
        if (!DRY_RUN) markPosted(VERSION, 'threads', urls);
        console.log(`[threads] ✅ Done`);
        continue; // markPosted already called with array
      }

      case 'instagram': {
        const { caption } = readCaptions(VERSION, 'instagram');
        url = await publishInstagram({ caption, version: VERSION, dryRun: DRY_RUN });
        break;
      }

      case 'facebook': {
        const { text } = readCaptions(VERSION, 'facebook');
        url = await publishFacebook({ text, version: VERSION, dryRun: DRY_RUN });
        break;
      }

      default:
        console.warn(`[${platform}] Unknown platform — skipping.`);
        continue;
    }

    if (!DRY_RUN && url) {
      markPosted(VERSION, platform, url);
    }
    console.log(`[${platform}] ✅ Done${url ? `: ${url}` : ''}`);

  } catch (err) {
    console.error(`[${platform}] ❌ Failed: ${err.message}`);
    errors.push({ platform, error: err.message });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n── Summary ──────────────────────────────────────────');
if (errors.length === 0) {
  console.log(DRY_RUN ? '✅ Dry run complete — no changes made.' : '✅ All platforms published successfully.');
} else {
  console.log(`⚠️  ${errors.length} platform(s) failed:`);
  for (const { platform, error } of errors) {
    console.log(`  • ${platform}: ${error}`);
  }
  process.exit(1);
}

// Commit updated meta.json (handled by workflow, not here)
