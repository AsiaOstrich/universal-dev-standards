/**
 * threads.mjs
 * Post a 3-post thread to Threads using the Threads API.
 *
 * Docs: https://developers.facebook.com/docs/threads
 *
 * Flow per post:
 *   1. POST /me/threads        → create media container (text + optional image_url)
 *   2. POST /me/threads_publish → publish the container
 *   3. For post 2/3: use reply_to_id = published post ID
 *
 * Required env vars:
 *   THREADS_ACCESS_TOKEN
 *   THREADS_USER_ID
 */

import { getPublicImageUrl } from '../utils/images.mjs';

const GRAPH_BASE = 'https://graph.threads.net/v1.0';

function getCredentials() {
  const token = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;
  if (!token) throw new Error('THREADS_ACCESS_TOKEN is not set');
  if (!userId) throw new Error('THREADS_USER_ID is not set');
  return { token, userId };
}

/**
 * Create a Threads media container (not yet published).
 */
async function createContainer({ token, userId, text, imageUrl = null, replyToId = null }) {
  const params = new URLSearchParams({
    access_token: token,
    media_type: imageUrl ? 'IMAGE' : 'TEXT',
    text,
  });
  if (imageUrl) params.set('image_url', imageUrl);
  if (replyToId) params.set('reply_to_id', replyToId);

  const res = await fetch(`${GRAPH_BASE}/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Threads createContainer failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.id; // container ID
}

/**
 * Publish a Threads media container.
 * Returns the published post ID.
 */
async function publishContainer(token, userId, containerId) {
  const params = new URLSearchParams({
    access_token: token,
    creation_id: containerId,
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Threads publishContainer failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.id; // published post ID
}

/**
 * Get the public permalink for a Threads post.
 */
async function getPermalink(token, postId) {
  const res = await fetch(
    `${GRAPH_BASE}/${postId}?fields=permalink&access_token=${token}`
  );
  if (!res.ok) return `https://www.threads.net/t/${postId}`;
  const data = await res.json();
  return data.permalink || `https://www.threads.net/t/${postId}`;
}

/**
 * Main publish function.
 *
 * @param {object} params
 * @param {string[]} params.posts   Array of 3 post texts
 * @param {string}  [params.version]  Release version (for images)
 * @param {boolean} [params.dryRun]
 * @returns {Promise<string[]>}  Array of 3 post URLs
 */
export async function publishThreads({ posts, version, dryRun = false }) {
  if (posts.length !== 3) throw new Error(`Expected 3 posts, got ${posts.length}`);

  if (dryRun) {
    console.log('[Threads] DRY RUN — would post 3-post thread:');
    posts.forEach((p, i) => {
      console.log(`\n  Post ${i + 1} (${p.length} chars):\n${p.slice(0, 150)}...`);
    });
    return [
      'https://www.threads.net/t/dry-run-1',
      'https://www.threads.net/t/dry-run-2',
      'https://www.threads.net/t/dry-run-3',
    ];
  }

  const { token, userId } = getCredentials();

  // Image URLs for each post (optional — only if images exist in repo)
  const imageUrls = version
    ? [
        getPublicImageUrl(version, 'threads/post-1.png'),
        getPublicImageUrl(version, 'threads/post-2.png'),
        getPublicImageUrl(version, 'threads/post-3.png'),
      ]
    : [null, null, null];

  const urls = [];
  let previousPostId = null;

  for (let i = 0; i < 3; i++) {
    const postNum = i + 1;
    console.log(`[Threads] Creating post ${postNum}/3...`);

    const containerId = await createContainer({
      token,
      userId,
      text: posts[i],
      imageUrl: imageUrls[i],
      replyToId: previousPostId,
    });

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));

    console.log(`[Threads] Publishing post ${postNum}/3...`);
    const publishedId = await publishContainer(token, userId, containerId);
    const permalink = await getPermalink(token, publishedId);

    console.log(`[Threads] Post ${postNum} published: ${permalink}`);
    urls.push(permalink);
    previousPostId = publishedId;

    // Delay between posts to respect API limits
    if (i < 2) await new Promise(r => setTimeout(r, 2000));
  }

  return urls;
}
