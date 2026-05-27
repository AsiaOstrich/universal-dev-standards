/**
 * facebook.mjs
 * Post to a Facebook Page using the Pages API.
 *
 * Docs: https://developers.facebook.com/docs/pages-api/
 *
 * Flow:
 *   1. POST /{page-id}/photos (attach cover image) → photo_id
 *   2. POST /{page-id}/feed   (message + attached_media) → post_id
 *
 * Required env vars:
 *   FB_PAGE_ACCESS_TOKEN
 *   FB_PAGE_ID
 */

import { getPublicImageUrl } from '../utils/images.mjs';

const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

function getCredentials() {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  if (!token) throw new Error('FB_PAGE_ACCESS_TOKEN is not set');
  if (!pageId) throw new Error('FB_PAGE_ID is not set');
  return { token, pageId };
}

async function uploadPhoto(token, pageId, imageUrl) {
  const params = new URLSearchParams({
    access_token: token,
    url: imageUrl,
    published: 'false', // upload without posting
  });

  const res = await fetch(`${GRAPH_BASE}/${pageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FB uploadPhoto failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.id; // photo ID
}

async function createPost(token, pageId, message, photoId = null) {
  const body = {
    access_token: token,
    message,
  };

  if (photoId) {
    body.attached_media = JSON.stringify([{ media_fbid: photoId }]);
  }

  const params = new URLSearchParams(body);

  const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`FB createPost failed ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  return data.id; // post ID (format: pageId_postId)
}

/**
 * Main publish function.
 *
 * @param {object} params
 * @param {string} params.text      Post message
 * @param {string} [params.version]  Release version (for cover image)
 * @param {boolean} [params.dryRun]
 * @returns {Promise<string>}  Posted URL
 */
export async function publishFacebook({ text, version, dryRun = false }) {
  const imageUrl = version ? getPublicImageUrl(version, 'fb/cover.png') : null;

  if (dryRun) {
    console.log('[Facebook] DRY RUN — would post:');
    if (imageUrl) console.log(`  Image: ${imageUrl}`);
    console.log(`  Text (${text.length} chars):\n${text.slice(0, 200)}...`);
    return 'https://www.facebook.com/dry-run-post-id';
  }

  const { token, pageId } = getCredentials();

  let photoId = null;
  if (imageUrl) {
    console.log('[Facebook] Uploading cover image...');
    photoId = await uploadPhoto(token, pageId, imageUrl);
    console.log(`[Facebook] Photo uploaded: ${photoId}`);
  }

  console.log('[Facebook] Creating post...');
  const postId = await createPost(token, pageId, text, photoId);
  const postUrl = `https://www.facebook.com/${postId.replace('_', '/posts/')}`;
  console.log(`[Facebook] Posted: ${postUrl}`);
  return postUrl;
}
