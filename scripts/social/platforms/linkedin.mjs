/**
 * linkedin.mjs
 * Post to LinkedIn using the UGC Posts API.
 *
 * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
 *
 * Required env vars:
 *   LINKEDIN_ACCESS_TOKEN  — OAuth 2.0 bearer token (expires in 60 days)
 *   LINKEDIN_PERSON_ID     — urn:li:person:{id}  OR
 *   LINKEDIN_ORG_ID        — urn:li:organization:{id}  (for company pages)
 */

import { readImage } from '../utils/images.mjs';

const API_BASE = 'https://api.linkedin.com/v2';

function getAuthor() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const personId = process.env.LINKEDIN_PERSON_ID;
  const orgId = process.env.LINKEDIN_ORG_ID;

  if (!token) throw new Error('LINKEDIN_ACCESS_TOKEN is not set');
  if (!personId && !orgId) throw new Error('LINKEDIN_PERSON_ID or LINKEDIN_ORG_ID is not set');

  const author = personId
    ? `urn:li:person:${personId}`
    : `urn:li:organization:${orgId}`;

  return { token, author };
}

/**
 * Step 1: Register an image upload with LinkedIn.
 * Returns { uploadUrl, asset }
 */
async function registerImageUpload(token, author) {
  const res = await fetch(`${API_BASE}/assets?action=registerUpload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: author,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn registerUpload failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  const uploadUrl = data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset = data.value.asset;
  return { uploadUrl, asset };
}

/**
 * Step 2: PUT the image binary to the upload URL.
 */
async function uploadImageBinary(uploadUrl, imageBuffer) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: imageBuffer,
  });

  if (!res.ok && res.status !== 201) {
    throw new Error(`LinkedIn image upload PUT failed ${res.status}`);
  }
}

/**
 * Step 3: Create the UGC post.
 * Returns the post URL.
 */
async function createPost(token, author, text, assetUrn = null) {
  const media = assetUrn
    ? [
        {
          status: 'READY',
          description: { text: '' },
          media: assetUrn,
          title: { text: '' },
        },
      ]
    : [];

  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE',
        media,
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch(`${API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`LinkedIn ugcPosts failed ${res.status}: ${errBody}`);
  }

  // LinkedIn returns the post ID in the X-RestLi-Id header
  const postId = res.headers.get('x-restli-id') || res.headers.get('X-RestLi-Id');
  if (!postId) throw new Error('LinkedIn did not return post ID in headers');

  // Construct post URL (works for person; org pages have different URL pattern)
  const idPart = author.startsWith('urn:li:person:')
    ? author.replace('urn:li:person:', '')
    : null;
  const postUrl = `https://www.linkedin.com/feed/update/${postId}`;
  return postUrl;
}

/**
 * Main publish function.
 *
 * @param {object} params
 * @param {string} params.text     Post text content
 * @param {string} [params.version]  Release version (to load cover image)
 * @param {boolean} [params.dryRun]
 * @returns {Promise<string>}  Posted URL
 */
export async function publishLinkedIn({ text, version, dryRun = false }) {
  if (dryRun) {
    const personId = process.env.LINKEDIN_PERSON_ID || '<LINKEDIN_PERSON_ID>';
    const orgId = process.env.LINKEDIN_ORG_ID;
    const author = personId !== '<LINKEDIN_PERSON_ID>'
      ? `urn:li:person:${personId}`
      : orgId ? `urn:li:organization:${orgId}` : 'urn:li:person:<id>';
    console.log('[LinkedIn] DRY RUN — would post:');
    console.log(`  Author: ${author}`);
    console.log(`  Text (${text.length} chars):\n${text.slice(0, 200)}...`);
    if (version) console.log(`  Image: release-assets/v${version}/images/fb/cover.png (optional)`);
    return 'https://www.linkedin.com/feed/update/dry-run-id';
  }

  const { token, author } = getAuthor();

  let assetUrn = null;

  // Optionally attach the FB cover image (1200×630, reused for LinkedIn)
  if (version) {
    let imgBuffer;
    try {
      imgBuffer = readImage(version, 'fb/cover.png');
    } catch {
      console.warn('[LinkedIn] Cover image not found, posting text-only');
    }

    if (imgBuffer) {
      console.log('[LinkedIn] Uploading cover image...');
      const { uploadUrl, asset } = await registerImageUpload(token, author);
      await uploadImageBinary(uploadUrl, imgBuffer);
      assetUrn = asset;
      console.log(`[LinkedIn] Image uploaded: ${asset}`);
    }
  }

  console.log('[LinkedIn] Creating post...');
  const postUrl = await createPost(token, author, text, assetUrn);
  console.log(`[LinkedIn] Posted: ${postUrl}`);
  return postUrl;
}
