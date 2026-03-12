/**
 * DA Format Test - Quick diagnostic script
 * Run in browser console at https://da.live/#/jgrosskurth/tsc
 *
 * Tests different HTML formats to find what the AEM pipeline accepts.
 */
(async () => {
  let token;
  try {
    const t = await window.adobeIMS.getAccessToken();
    token = t.token || t;
  } catch (e) {
    console.error('Not signed in', e);
    return;
  }

  const DA = 'https://admin.da.live/source/jgrosskurth/tsc';
  const AEM = 'https://admin.hlx.page/preview/Jgrosskurth/tsc/main';

  async function put(path, html) {
    // Delete first
    await fetch(`${DA}/${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    // Upload
    const form = new FormData();
    form.append('data', new Blob([html], { type: 'text/html' }));
    const r = await fetch(`${DA}/${path}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: form });
    console.log(`PUT ${path}: ${r.status}`);
    return r.ok;
  }

  async function prev(path) {
    const r = await fetch(`${AEM}/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    console.log(`Preview ${path}: ${r.status}`);
    const body = await r.text();
    console.log(`Preview response: ${body.substring(0, 200)}`);
    return r.ok;
  }

  // Test 1: Bare minimum page - just text
  const test1 = `<body><header></header><main><div><p>Hello from DA test</p></div></main><footer></footer></body>`;

  // Test 2: With a table block
  const test2 = `<body><header></header><main><div><h1>Test Page</h1><table><tr><th colspan="2">Columns</th></tr><tr><td>Left side</td><td>Right side</td></tr></table></div></main><footer></footer></body>`;

  // Test 3: With sections (hr)
  const test3 = `<body><header></header><main><div><h1>Section 1</h1><p>Content here</p></div><div><hr></div><div><h2>Section 2</h2><p>More content</p></div></main><footer></footer></body>`;

  console.log('=== Test 1: Bare minimum ===');
  await put('test-page.html', test1);
  await prev('test-page');

  // Wait for pipeline
  await new Promise(r => setTimeout(r, 3000));

  // Check result
  const r1 = await fetch('https://main--tsc--jgrosskurth.aem.page/test-page.plain.html');
  const t1 = await r1.text();
  console.log(`Test 1 result (${t1.length} bytes): ${t1.substring(0, 100)}`);

  console.log('\n=== Test 2: With table block ===');
  await put('test-page2.html', test2);
  await prev('test-page2');

  await new Promise(r => setTimeout(r, 3000));

  const r2 = await fetch('https://main--tsc--jgrosskurth.aem.page/test-page2.plain.html');
  const t2 = await r2.text();
  console.log(`Test 2 result (${t2.length} bytes): ${t2.substring(0, 200)}`);

  console.log('\n=== Test 3: With sections ===');
  await put('test-page3.html', test3);
  await prev('test-page3');

  await new Promise(r => setTimeout(r, 3000));

  const r3 = await fetch('https://main--tsc--jgrosskurth.aem.page/test-page3.plain.html');
  const t3 = await r3.text();
  console.log(`Test 3 result (${t3.length} bytes): ${t3.substring(0, 200)}`);

  console.log('\n=== Done! Cleanup: run del commands if needed ===');
})();
