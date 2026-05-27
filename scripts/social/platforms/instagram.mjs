/**
 * instagram.mjs
 * Publish a carousel post to Instagram using the Graph API.
 *
 * Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 *
 * Carousel flow:
 *   1. POST /{ig-user-id}/media  (each image, is_carousel_item=true) → container IDs
 *   2. POST /{ig-user-id}/media  (carousel container, children=[...]) → carousel ID
 *   3. POST /{ig-user-id}/media_publish (creation_id=carousel ID)
 *
 * Required env vars:
 *   IG_ACCESS_TOKEN
 *   IG_USER_ID
 */

import { getPublicImageUrl } from '../utils/images.mjs';

const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

function getCredentials() {
  const token = process.env.IG_ACCESS_TOKEN;
  const userId = process.env.IG_USER_ID;
  if (!token) throw new Error('IG_ACCESS_TOKEN is not set');
  if (!userId) throw new Error('IG_USER_ID is not set');
  return { token, userId };
}

async function createItemContainer(token, userId, imageUrl) {
  const params = new URLSearchParams({
    access_token: token,
    image_url: imageUrl,
    is_carousel_item: 'true',
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IG createItemContainer failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.id;
}

async function createCarouselContainer(token, userId, childrenIds, caption) {
  const params = new URLSearchParams({
    access_token: token,
    media_type: 'CAROUSEL',
    children: childrenIds.join(','),
    caption,
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IG createCarouselContainer failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.id;
}

async function publishMedia(token, userId, creationId) {
  const params = new URLSearchParams({
    access_token: token,
    creation_id: creationId,
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IG media_publish failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * Main publish function.
 *
 * @param {object} params
 * @param {string} params.caption   Post caption text
 * @param {string} params.version   Release version (to load carousel images)
 * @param {boolean} [params.dryRun]
 * @returns {Promise<string>}  Posted URL
 */
export async function publishInstagram({ caption, version, dryRun = false }) {
  // Determine image filenames for this version's IG carousel
  const imageFiles = ['ig/01-cover.png', 'ig/02-false-positive.png', 'ig/03-release-todo.png'];
  const imageUrls = imageFiles.map(f => getPublicImageUrl(version, f));

  if (dryRun) {
    console.log('[Instagram] DRY RUN — would post carousel:');
    imageUrls.forEach((u, i) => console.log(`  Image ${i + 1}: ${u}`));
    console.log(`  Caption (${caption.length} chars):\n${caption.slice(0, 200)}...`);
    return 'https://www.instagram.com/p/dry-run-id/';
  }

  const { token, userId } = getCredentials();

  console.log('[Instagram] Creating item containers...');
  const childrenIds = [];
  for (const url of imageUrls) {
    const id = await createItemContainer(token, userId, url);
    childrenIds.push(id);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('[Instagram] Creating carousel container...');
  const carouselId = await createCarouselContainer(token, userId, childrenIds, caption);

  await new Promise(r => setTimeout(r, 2000));

  console.log('[Instagram] Publishing carousel...');
  const mediaId = await publishMedia(token, userId, carouselId);

  const postUrl = `https://www.instagram.com/p/${mediaId}/`;
  console.log(`[Instagram] Posted: ${postUrl}`);
  return postUrl;
}
