#!/usr/bin/env node
/**
 * Generates da-upload.js (browser console script) from current content/index.html.
 * Uses base64 encoding to avoid template literal escaping issues with large HTML.
 *
 * Run: node tools/generate-da-upload.js
 * Then copy the output file and paste into browser console at da.live.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = resolve(__dirname, '..');

const htmlPath = resolve(WORKSPACE, 'content/index.html');
const fullHtml = readFileSync(htmlPath, 'utf8');

// Extract <main>...</main> content
const mainMatch = fullHtml.match(/<main>([\s\S]*?)<\/main>/);
if (!mainMatch) {
  console.error('Could not find <main> element in content/index.html');
  process.exit(1);
}

// Replace relative paths with full aem.page URLs for DA
const AEM_PAGE = 'https://main--tsc--jgrosskurth.aem.page';
let mainContent = mainMatch[1].replace(/src="\/icons\//g, `src="${AEM_PAGE}/icons/`);
mainContent = mainContent.replace(/src="\/images\//g, `src="${AEM_PAGE}/images/`);

// Build the DA format body
const daBody = `<body>
  <header></header>
  <main>${mainContent}</main>
  <footer></footer>
</body>`;

// Base64 encode - safe for embedding in JS strings (no escaping needed)
const b64 = Buffer.from(daBody, 'utf8').toString('base64');

// Verify product-carousel blocks are present
const pcCount = (daBody.match(/product-carousel/g) || []).length;
console.log(`Found ${pcCount} product-carousel references in content`);
if (pcCount === 0) {
  console.error('WARNING: No product-carousel blocks found in content!');
}

const script = `/**
 * DA Upload Script - Auto-generated from content/index.html
 * Generated: ${new Date().toISOString()}
 * Content: base64 encoded (${b64.length} chars)
 * Product carousels: ${pcCount} references
 *
 * INSTRUCTIONS:
 * 1. Go to https://da.live/#/jgrosskurth/tsc and sign in
 * 2. Open DevTools Console (F12 or Cmd+Option+J)
 * 3. Paste this ENTIRE script and press Enter
 * 4. Watch the console for status messages
 * 5. Wait ~10s after "Done!" then check the preview site
 */
(async () => {
  // Step 1: Get auth token
  let token;
  try {
    const t = await window.adobeIMS.getAccessToken();
    token = t.token || t;
    console.log('[1/4] Got auth token');
  } catch (e) {
    console.error('ERROR: Sign in to da.live first!', e);
    return;
  }

  // Step 2: Decode content from base64
  const b64 = "${b64}";
  const indexHtml = atob(b64);
  console.log('[2/4] Decoded content: ' + indexHtml.length + ' bytes');

  // Verify content has product-carousel blocks
  const pcCount = (indexHtml.match(/product-carousel/g) || []).length;
  console.log('  Product-carousel references: ' + pcCount);
  if (pcCount === 0) {
    console.error('ERROR: Content has no product-carousel blocks!');
    return;
  }

  const OWNER = 'jgrosskurth';
  const REPO = 'tsc';
  const DA = 'https://admin.da.live/source/' + OWNER + '/' + REPO;
  const AEM = 'https://admin.hlx.page/preview/' + OWNER + '/' + REPO + '/main';

  // Step 3: Upload to DA
  console.log('[3/4] Uploading index.html to DA...');

  // Delete old version first
  const delR = await fetch(DA + '/index.html', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
  console.log('  Delete old: ' + delR.status);

  // Upload new version
  const form = new FormData();
  form.append('data', new Blob([indexHtml], { type: 'text/html' }));
  const putR = await fetch(DA + '/index.html', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token },
    body: form,
  });
  console.log('  Upload new: ' + putR.status);

  if (!putR.ok) {
    const errText = await putR.text();
    console.error('Upload FAILED: ' + errText);
    return;
  }

  // Step 4: Trigger AEM preview
  console.log('[4/4] Triggering AEM preview...');
  const prevR = await fetch(AEM + '/index', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
  });
  console.log('  Preview: ' + prevR.status);

  console.log('');
  console.log('=== DONE! ===');
  console.log('Wait ~10 seconds then check:');
  console.log('https://main--tsc--jgrosskurth.aem.page/');
})();
`;

const outPath = resolve(WORKSPACE, 'tools/da-upload.js');
writeFileSync(outPath, script, 'utf8');
console.log(`Generated: ${outPath}`);
console.log(`Size: ${script.length} bytes`);
console.log(`Base64 payload: ${b64.length} chars`);
console.log('');
console.log('Next: Copy the contents of tools/da-upload.js and paste into browser console at:');
console.log('  https://da.live/#/jgrosskurth/tsc');
