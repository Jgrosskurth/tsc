/**
 * DA Content Upload Script - Enhanced with Image Pre-Upload
 *
 * Run this in the browser console at https://da.live/#/jgrosskurth/tsc
 * while signed in to upload TSC content files.
 *
 * This script pre-uploads ALL images to DA storage first, then builds
 * the HTML content referencing those DA-stored images. This bypasses
 * the AEM pipeline's image download which can fail for external CDN URLs.
 *
 * APPROACH:
 * 1. Fetches each image from its source URL (browser can access them)
 * 2. Uploads each image as a media blob to DA storage
 * 3. Builds HTML content using DA media references
 * 4. Uploads HTML documents (nav, footer, index)
 * 5. Triggers AEM preview
 *
 * Usage: Copy and paste this entire script into the browser console.
 */

(async () => {
  // Get fresh token
  let token;
  try {
    const t = await window.adobeIMS.getAccessToken();
    token = t.token || t;
    console.log('Got fresh token');
  } catch (e) {
    console.error('Failed to get token. Make sure you are signed in to da.live first.', e);
    return;
  }

  const OWNER = 'jgrosskurth';
  const REPO = 'tsc';
  const DA_SOURCE = `https://admin.da.live/source/${OWNER}/${REPO}`;
  const AEM_ADMIN = `https://admin.hlx.page/preview/Jgrosskurth/${REPO}/main`;
  const AEM_PAGE = `https://main--tsc--jgrosskurth.aem.page`;

  // ========================
  // HELPER FUNCTIONS
  // ========================

  async function del(path) {
    const resp = await fetch(`${DA_SOURCE}/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  Delete ${path}: ${resp.status}`);
    return resp.ok || resp.status === 404;
  }

  async function uploadHtml(path, html) {
    await del(path);
    const blob = new Blob([html], { type: 'text/html' });
    const form = new FormData();
    form.append('data', blob);
    const resp = await fetch(`${DA_SOURCE}/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    console.log(`  Upload ${path}: ${resp.status}`);
    return resp.ok;
  }

  async function uploadMedia(daPath, imageBlob, contentType) {
    const form = new FormData();
    const ext = daPath.split('.').pop();
    form.append('data', imageBlob, `image.${ext}`);
    const resp = await fetch(`${DA_SOURCE}/${daPath}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    return resp.ok;
  }

  async function preview(path) {
    const resp = await fetch(`${AEM_ADMIN}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  Preview ${path}: ${resp.status}`);
    return resp.ok;
  }

  // Fetch image and upload to DA storage
  async function fetchAndUpload(sourceUrl, daPath) {
    try {
      const resp = await fetch(sourceUrl, { mode: 'cors' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const ok = await uploadMedia(daPath, blob, blob.type);
      return ok;
    } catch (e) {
      // CORS or network error - try no-cors with img element fallback
      try {
        return await fetchViaCanvas(sourceUrl, daPath);
      } catch (e2) {
        console.warn(`  Could not upload ${daPath}: ${e.message}`);
        return false;
      }
    }
  }

  // Fallback: load image via <img> + canvas for CORS-restricted sources
  async function fetchViaCanvas(sourceUrl, daPath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const ok = await uploadMedia(daPath, blob, 'image/png');
              resolve(ok);
            } else {
              resolve(false);
            }
          }, 'image/png');
        } catch (e) {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = sourceUrl;
    });
  }

  // ========================
  // PHASE 1: Pre-upload ALL images to DA storage
  // ========================
  console.log('=== Phase 1: Uploading images to DA storage ===');

  // All images needed for the homepage content
  // Key = DA storage path, Value = source URL
  const images = {
    // Hero carousel images (Scene7 CDN)
    'media/hero-spring.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero1-V13-North-D?preferwebp=true&scl=1',
    'media/hero-taxrefund.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero3-V3-D?preferwebp=true&scl=1',
    'media/hero-gunsafes.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero4-D-V3?preferwebp=true&scl=1',

    // Promotional banners (Scene7 CDN)
    'media/banner-demodays.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-DemoDays-D-V1?scl=1',
    'media/banner-alpo.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-ALPO-D-V1?scl=1&fmt=png-alpha',
    'media/banner-patio.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-PatioFurniture-V1-D?scl=1&fmt=png-alpha',
    'media/banner-financing.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-Financing-D-V1?scl=1&fmt=png-alpha',
    'media/banner-neighborsclub.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/Nonmember%20Desktop?scl=1',

    // Feature tile / Big Box images (Scene7 CDN)
    'media/bigbox-pet.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-PetEnthusiast-V1?scl=1',
    'media/bigbox-garden.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-CountryDabbler-V1?scl=1',
    'media/bigbox-chick.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-BackyardHomesteader-V2?scl=1',
    'media/bigbox-trailers.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-HobbyFarmer-V1?scl=1',

    // Service overlay cards (Scene7 CDN)
    'media/cards-bulkbuy.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-BuyInBulk-V1?scl=1',
    'media/cards-neighborsclub.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-NC-V1?scl=1',
    'media/cards-petrx.png': 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW10-030226-TSC-HP-BigBarn-PetRX-V1?scl=1',

    // Smart Supply image
    'media/smartsupply.png': 'https://www.tractorsupply.com/adobe/dynamicmedia/deliver/dm-aid--36063787-a122-4388-a2c9-a9809bb05a99/FW42-101325-TSC-HP-DynamicComponent-PetRX-V1.jpg?preferwebp=true&width=1920&q=75',

    // Category icons (from git via aem.page)
    'media/cat-sale.svg': `${AEM_PAGE}/icons/cat-sale.svg`,
    'media/cat-chick-days.svg': `${AEM_PAGE}/icons/cat-chick-days.svg`,
    'media/cat-demo-days.svg': `${AEM_PAGE}/icons/cat-demo-days.svg`,
    'media/cat-tools.svg': `${AEM_PAGE}/icons/cat-tools.svg`,
    'media/cat-pet.svg': `${AEM_PAGE}/icons/cat-pet.svg`,
    'media/cat-tax-refund.svg': `${AEM_PAGE}/icons/cat-tax-refund.svg`,
    'media/cat-ammunition.svg': `${AEM_PAGE}/icons/cat-ammunition.svg`,
    'media/cat-direct-sales.svg': `${AEM_PAGE}/icons/cat-direct-sales.svg`,
    'media/cat-outdoor-power-equipment.svg': `${AEM_PAGE}/icons/cat-outdoor-power-equipment.svg`,
    'media/cat-fencing-and-gates.svg': `${AEM_PAGE}/icons/cat-fencing-and-gates.svg`,
    'media/cat-pet-and-animal-pharmacy.svg': `${AEM_PAGE}/icons/cat-pet-and-animal-pharmacy.svg`,
    'media/cat-clothing.svg': `${AEM_PAGE}/icons/cat-clothing.svg`,
    'media/cat-gift-card.svg': `${AEM_PAGE}/icons/cat-gift-card.svg`,
    'media/cat-boots-and-shoes.svg': `${AEM_PAGE}/icons/cat-boots-and-shoes.svg`,
    'media/cat-trailers-and-towing.svg': `${AEM_PAGE}/icons/cat-trailers-and-towing.svg`,
    'media/cat-horse.svg': `${AEM_PAGE}/icons/cat-horse.svg`,

    // Brand icons (from git via aem.page)
    'media/brand-carhartt.svg': `${AEM_PAGE}/icons/brand-carhartt.svg`,
    'media/brand-cub-cadet.svg': `${AEM_PAGE}/icons/brand-cub-cadet.svg`,
    'media/brand-purina.svg': `${AEM_PAGE}/icons/brand-purina.svg`,
    'media/brand-yeti.svg': `${AEM_PAGE}/icons/brand-yeti.svg`,
    'media/brand-dewalt.svg': `${AEM_PAGE}/icons/brand-dewalt.svg`,
    'media/brand-blackstone.svg': `${AEM_PAGE}/icons/brand-blackstone.svg`,
    'media/brand-pelpro.svg': `${AEM_PAGE}/icons/brand-pelpro.svg`,

    // Service icons (from git via aem.page)
    'media/svc-propane-tank-refill.svg': `${AEM_PAGE}/icons/svc-propane-tank-refill.svg`,
    'media/svc-trailer-rental.svg': `${AEM_PAGE}/icons/svc-trailer-rental.svg`,
    'media/svc-pet-vet-clinic.svg': `${AEM_PAGE}/icons/svc-pet-vet-clinic.svg`,
    'media/svc-same-day-delivery.svg': `${AEM_PAGE}/icons/svc-same-day-delivery.svg`,
  };

  const imageEntries = Object.entries(images);
  let uploaded = 0;
  let failed = 0;
  const failedImages = [];

  for (let i = 0; i < imageEntries.length; i++) {
    const [daPath, sourceUrl] = imageEntries[i];
    const shortName = daPath.split('/').pop();
    process.stdout && process.stdout.write
      ? process.stdout.write(`  [${i + 1}/${imageEntries.length}] ${shortName}...`)
      : console.log(`  [${i + 1}/${imageEntries.length}] ${shortName}...`);

    const ok = await fetchAndUpload(sourceUrl, daPath);
    if (ok) {
      uploaded++;
      console.log(`  [${i + 1}/${imageEntries.length}] ${shortName} OK`);
    } else {
      failed++;
      failedImages.push(daPath);
      console.warn(`  [${i + 1}/${imageEntries.length}] ${shortName} FAILED`);
    }
  }

  console.log(`\nImage upload complete: ${uploaded} OK, ${failed} failed`);
  if (failedImages.length > 0) {
    console.warn('Failed images:', failedImages);
    console.log('Continuing with HTML upload - failed images will use original URLs as fallback...');
  }

  // ========================
  // PHASE 2: Build HTML content with DA media references
  // ========================
  console.log('\n=== Phase 2: Uploading HTML content ===');

  // Helper to get DA media path or fallback to original URL
  function img(daPath, originalUrl) {
    if (failedImages.includes(daPath)) return originalUrl;
    return `./${daPath}`;
  }

  // NAV CONTENT
  const navHtml = `<html>
<body>
  <header></header>
  <main>
    <div>
      <p><a href="/">Tractor Supply Co.</a></p>
    </div>
    <div>
      <ul>
        <li>Pet</li>
        <li>Lawn &amp; Garden</li>
        <li>Truck &amp; Automotive</li>
        <li>Clothing</li>
        <li>Poultry</li>
        <li>Heating &amp; Cooling</li>
        <li>Horse</li>
        <li>Sporting Goods</li>
        <li>Outdoor Power Equipment</li>
        <li>Fencing &amp; Gates</li>
        <li>Livestock</li>
      </ul>
    </div>
    <div>
      <ul>
        <li><a href="/tsc/store-locator">Find a Store</a></li>
        <li><a href="/tsc/cart">Cart</a></li>
      </ul>
    </div>
  </main>
  <footer></footer>
</body>
</html>`;

  // FOOTER CONTENT
  const footerHtml = `<html>
<body>
  <header></header>
  <main>
    <div>
      <div class="columns">
        <div>
          <div>
            <h3>Customer Support</h3>
            <ul>
              <li><a href="/OrderLookUpView">Order Status</a></li>
              <li><a href="/tsc/customer-solutions#ProductReturns">Return Policy</a></li>
              <li><a href="/tsc/customer-solutions#DeliveryOptions">Delivery Options</a></li>
              <li><a href="/tsc/cms/policies-information/customer-solutions/tax-exemption">Tax Exemptions</a></li>
              <li><a href="/tsc/customer-solutions#CustomerFAQ">Frequently Asked Questions</a></li>
              <li><a href="/tsc/customer-solutions#contact">Contact Us</a></li>
              <li><a href="/tsc/cms/policies-information/customer-solutions/recall-notices.html">Recall Notices</a></li>
            </ul>
            <p>Call: (877) 718-6750</p>
            <p>Mon - Sat: 7am - 9pm CT</p>
            <p>Sun: 8am - 7pm CT</p>
          </div>
          <div>
            <h3>About Us</h3>
            <ul>
              <li><a href="https://corporate.tractorsupply.com/company-overview/company-profile/default.aspx">Who We Are</a></li>
              <li><a href="https://ir.tractorsupply.com/CorporateProfile">Investor Relations</a></li>
              <li><a href="https://corporate.tractorsupply.com/stewardship/overview/default.aspx">Stewardship</a></li>
              <li><a href="https://ir.tractorsupply.com/Peer">Community</a></li>
              <li><a href="/tsc/cms/military">Military Support</a></li>
              <li><a href="/tsc/store-locator">Tractor Supply Stores</a></li>
            </ul>
          </div>
          <div>
            <h3>Work With Us</h3>
            <ul>
              <li><a href="https://www.tractorsupply.careers/">Careers</a></li>
              <li><a href="/tsc/cms/policies-information/about-tsc/sponsorships">Sponsorship</a></li>
              <li><a href="/tsc/cms/policies-information/affiliate-program">Affiliate Program</a></li>
              <li><a href="/tsc/cms/policies-information/vendor-information/potential-vendor-partners">Potential Vendor Partners</a></li>
              <li><a href="/tsc/cms/policies-information/vendor-information/vendor-center">Vendor Information</a></li>
            </ul>
          </div>
          <div>
            <h3>Neighbor\u2019s Club</h3>
            <ul>
              <li><a href="/tsc/cms/neighbors-club">About</a></li>
              <li><a href="/tsc/cms/neighbors-club-faq">Frequently Asked Questions</a></li>
              <li><a href="/tsc/cms/neighbors-club-terms-and-conditions">Terms &amp; Conditions</a></li>
            </ul>
            <h3>Credit Center</h3>
            <ul>
              <li><a href="/tsc/cms/credit">TSC Credit Card</a></li>
              <li><a href="/tsc/cms/klarna">Klarna</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p>\u00a9 2026, Tractor Supply Co. All Rights Reserved.</p>
      <p><a href="/tsc/cms/policies-information/customer-solutions/privacy-policy.html">Privacy policy</a> | <a href="/tsc/cms/policies-information/customer-solutions/terms-and-conditions-of-use.html">Terms and Conditions</a> | <a href="/tsc/cms/accessibility.html">Accessibility</a></p>
    </div>
  </main>
  <footer></footer>
</body>
</html>`;

  // INDEX (HOMEPAGE) CONTENT - References DA-stored images
  const indexHtml = `<html>
<body>
  <header></header>
  <main>
    <table>
      <tr><th colspan="2">Carousel</th></tr>
      <tr>
        <td><picture><img src="${img('media/hero-spring.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero1-V13-North-D?preferwebp=true&scl=1')}" alt="Save up to 40 percent off outdoor supplies"></picture></td>
        <td><h2>Spring Favorites</h2><p>Save up to 40% off outdoor supplies</p><p><strong><a href="/tsc/cms/digital-flyer">Shop Now</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="${img('media/hero-taxrefund.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero3-V3-D?preferwebp=true&scl=1')}" alt="Tax refund savings on yard equipment"></picture></td>
        <td><h2>Tax Refund Savings</h2><p>Turn your refund into yard work</p><p><strong><a href="/tsc/cms/yard">Shop Now</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="${img('media/hero-gunsafes.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero4-D-V3?preferwebp=true&scl=1')}" alt="Save up to 200 dollars on gun safes"></picture></td>
        <td><h2>Gun Safes Sale</h2><p>Save up to $200 with special financing available</p><p><strong><a href="/tsc/catalog/gun-safes">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <h2>Shop Popular Categories</h2>
    <table>
      <tr><th colspan="2">Cards (categories)</th></tr>
      <tr><td><picture><img src="${img('media/cat-sale.svg', `${AEM_PAGE}/icons/cat-sale.svg`)}" alt="Sale"></picture></td><td><p><a href="/tsc/sale">Sale</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-chick-days.svg', `${AEM_PAGE}/icons/cat-chick-days.svg`)}" alt="Chick Days"></picture></td><td><p><a href="/tsc/cms/chick-days">Chick Days</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-demo-days.svg', `${AEM_PAGE}/icons/cat-demo-days.svg`)}" alt="Demo Days"></picture></td><td><p><a href="/tsc/cms/demo-days">Demo Days</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-tools.svg', `${AEM_PAGE}/icons/cat-tools.svg`)}" alt="Tools"></picture></td><td><p><a href="/tsc/category/tools">Tools</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-pet.svg', `${AEM_PAGE}/icons/cat-pet.svg`)}" alt="Pet"></picture></td><td><p><a href="/tsc/category/pet">Pet</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-tax-refund.svg', `${AEM_PAGE}/icons/cat-tax-refund.svg`)}" alt="Tax Refund"></picture></td><td><p><a href="/tsc/cms/yard">Tax Refund</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-ammunition.svg', `${AEM_PAGE}/icons/cat-ammunition.svg`)}" alt="Ammunition"></picture></td><td><p><a href="/tsc/catalog/ammunition">Ammunition</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-direct-sales.svg', `${AEM_PAGE}/icons/cat-direct-sales.svg`)}" alt="Direct Sales"></picture></td><td><p><a href="/tsc/cms/direct-sales">Direct Sales</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-outdoor-power-equipment.svg', `${AEM_PAGE}/icons/cat-outdoor-power-equipment.svg`)}" alt="Outdoor Power Equipment"></picture></td><td><p><a href="/tsc/category/outdoor-power-equipment">Outdoor Power Equipment</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-fencing-and-gates.svg', `${AEM_PAGE}/icons/cat-fencing-and-gates.svg`)}" alt="Fencing and Gates"></picture></td><td><p><a href="/tsc/category/fencing-gates">Fencing &amp; Gates</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-pet-and-animal-pharmacy.svg', `${AEM_PAGE}/icons/cat-pet-and-animal-pharmacy.svg`)}" alt="Pet and Animal Pharmacy"></picture></td><td><p><a href="/tsc/category/pet-animal-pharmacy">Pet &amp; Animal Pharmacy</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-clothing.svg', `${AEM_PAGE}/icons/cat-clothing.svg`)}" alt="Clothing"></picture></td><td><p><a href="/tsc/category/clothing">Clothing</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-gift-card.svg', `${AEM_PAGE}/icons/cat-gift-card.svg`)}" alt="Gift Card"></picture></td><td><p><a href="/tsc/cms/gift-card">Gift Card</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-boots-and-shoes.svg', `${AEM_PAGE}/icons/cat-boots-and-shoes.svg`)}" alt="Boots and Shoes"></picture></td><td><p><a href="/tsc/category/boots-shoes">Boots &amp; Shoes</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-trailers-and-towing.svg', `${AEM_PAGE}/icons/cat-trailers-and-towing.svg`)}" alt="Trailers and Towing"></picture></td><td><p><a href="/tsc/category/trailers-towing">Trailers &amp; Towing</a></p></td></tr>
      <tr><td><picture><img src="${img('media/cat-horse.svg', `${AEM_PAGE}/icons/cat-horse.svg`)}" alt="Horse"></picture></td><td><p><a href="/tsc/category/horse">Horse</a></p></td></tr>
    </table>
    <hr>
    <p><a href="/tsc/cms/demo-days"><picture><img src="${img('media/banner-demodays.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-DemoDays-D-V1?scl=1')}" alt="Demo Days - Try before you buy"></picture></a></p>
    <hr>
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="${img('media/bigbox-pet.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-PetEnthusiast-V1?scl=1')}" alt="Keep your pets happy all Spring"></picture></td>
        <td><h3>Keep your pets happy all Spring</h3><p>Flea &amp; tick care, grooming and more</p><p><strong><a href="/tsc/vc/get-your-pet-ready-for-spring">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <p><a href="/tsc/brand/ALPO"><picture><img src="${img('media/banner-alpo.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-ALPO-D-V1?scl=1&fmt=png-alpha')}" alt="Earn 3 dollars in rewards on Purina ALPO dog food"></picture></a></p>
    <hr>
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="${img('media/bigbox-garden.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-CountryDabbler-V1?scl=1')}" alt="Dig into spring"></picture></td>
        <td><h3>Dig into spring</h3><p>Time to grow fresh veggies and flowers</p><p><strong><a href="/tsc/category/lawn-garden">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <p><a href="/tsc/sale/patio-furniture-decor"><picture><img src="${img('media/banner-patio.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-PatioFurniture-V1-D?scl=1&fmt=png-alpha')}" alt="Save up to 40 percent off patio furniture and decor"></picture></a></p>
    <hr>
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="${img('media/bigbox-chick.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-BackyardHomesteader-V2?scl=1')}" alt="Chick Days are here"></picture></td>
        <td><h3>Chick Days are here</h3><p>Everything you need to grow your flock or start a new one</p><p><strong><a href="/tsc/cms/chick-days">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <p><a href="/tsc/cms/credit"><picture><img src="${img('media/banner-financing.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-Financing-D-V1?scl=1&fmt=png-alpha')}" alt="Open a TSC Credit Card and earn 50 dollars in rewards"></picture></a></p>
    <hr>
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="${img('media/bigbox-trailers.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-HobbyFarmer-V1?scl=1')}" alt="Exclusive trailers and accessories"></picture></td>
        <td><h3>Exclusive trailers &amp; accessories</h3><p>Just what you need for the job</p><p><strong><a href="/tsc/category/trailers-towing">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <table>
      <tr><th colspan="2">Cards (services)</th></tr>
      <tr>
        <td><picture><img src="${img('media/cards-bulkbuy.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-BuyInBulk-V1?scl=1')}" alt="Feed and Food Headquarters"></picture></td>
        <td><h3>Save when you buy in bulk</h3><p>Fencing projects made easy</p><p><strong><a href="/tsc/cms/bulk-discounts">Learn More</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="${img('media/cards-neighborsclub.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-NC-V1?scl=1')}" alt="Neighbors Club"></picture></td>
        <td><h3>Neighbor\u2019s Club</h3><p>Discover your rewards</p><p><strong><a href="/tsc/cms/neighbors-club">Learn More</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="${img('media/cards-petrx.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW10-030226-TSC-HP-BigBarn-PetRX-V1?scl=1')}" alt="Pet Rx"></picture></td>
        <td><h3>Pet Rx</h3><p>Pet &amp; animal pharmacy</p><p><strong><a href="/tsc/category/pet-animal-pharmacy">Learn More</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <p><a href="/tsc/cms/neighbors-club"><picture><img src="${img('media/banner-neighborsclub.png', 'https://media.tractorsupply.com/is/image/TractorSupplyCompany/Nonmember%20Desktop?scl=1')}" alt="Neighbors Club - Free to join, full of rewards"></picture></a></p>
    <hr>
    <h2>Shop Popular Brands</h2>
    <table>
      <tr><th colspan="2">Cards (brands)</th></tr>
      <tr><td><picture><img src="${img('media/brand-carhartt.svg', `${AEM_PAGE}/icons/brand-carhartt.svg`)}" alt="Carhartt"></picture></td><td><p><a href="/tsc/brand/Carhartt">Carhartt</a></p></td></tr>
      <tr><td><picture><img src="${img('media/brand-cub-cadet.svg', `${AEM_PAGE}/icons/brand-cub-cadet.svg`)}" alt="Cub Cadet"></picture></td><td><p><a href="/tsc/brand/Cub+Cadet">Cub Cadet</a></p></td></tr>
      <tr><td><picture><img src="${img('media/brand-purina.svg', `${AEM_PAGE}/icons/brand-purina.svg`)}" alt="Purina"></picture></td><td><p><a href="/tsc/brand/Purina">Purina</a></p></td></tr>
      <tr><td><picture><img src="${img('media/brand-yeti.svg', `${AEM_PAGE}/icons/brand-yeti.svg`)}" alt="YETI"></picture></td><td><p><a href="/tsc/brand/YETI">YETI</a></p></td></tr>
      <tr><td><picture><img src="${img('media/brand-dewalt.svg', `${AEM_PAGE}/icons/brand-dewalt.svg`)}" alt="DeWALT"></picture></td><td><p><a href="/tsc/brand/DeWALT">DeWALT</a></p></td></tr>
      <tr><td><picture><img src="${img('media/brand-blackstone.svg', `${AEM_PAGE}/icons/brand-blackstone.svg`)}" alt="Blackstone"></picture></td><td><p><a href="/tsc/brand/Blackstone">Blackstone</a></p></td></tr>
      <tr><td><picture><img src="${img('media/brand-pelpro.svg', `${AEM_PAGE}/icons/brand-pelpro.svg`)}" alt="Forge and Flame"></picture></td><td><p><a href="/tsc/brand/Forge+%26+Flame">Forge &amp; Flame</a></p></td></tr>
    </table>
    <hr>
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="${img('media/smartsupply.png', 'https://www.tractorsupply.com/adobe/dynamicmedia/deliver/dm-aid--36063787-a122-4388-a2c9-a9809bb05a99/FW42-101325-TSC-HP-DynamicComponent-PetRX-V1.jpg?preferwebp=true&width=1920&q=75')}" alt="Smart Supply subscription products"></picture></td>
        <td><h3>Save up to 35% with Smart Supply</h3><p>Enjoy discounts on delivery and pick up subscriptions, plus free shipping on orders $49+</p><p><em><a href="/tsc/cms/autoship">Learn More</a></em></p></td>
      </tr>
    </table>
    <hr>
    <h2>Store Services</h2>
    <table>
      <tr><th colspan="2">Cards (store-services)</th></tr>
      <tr>
        <td><picture><img src="${img('media/svc-propane-tank-refill.svg', `${AEM_PAGE}/icons/svc-propane-tank-refill.svg`)}" alt="Propane Tank Refill"></picture></td>
        <td><h3>Propane Tank Refill</h3><p>Refilling your propane tank at your local Tractor Supply is convenient and economical.</p><p><strong><a href="/tsc/services/propane-refill">More Info</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="${img('media/svc-trailer-rental.svg', `${AEM_PAGE}/icons/svc-trailer-rental.svg`)}" alt="Trailer Rental"></picture></td>
        <td><h3>Trailer Rental</h3><p>Tough job to tackle? Transporting your purchase home? Rent a trailer and get it done!</p><p><strong><a href="/tsc/services/trailer-rental">More Info</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="${img('media/svc-pet-vet-clinic.svg', `${AEM_PAGE}/icons/svc-pet-vet-clinic.svg`)}" alt="Pet Vet Clinic"></picture></td>
        <td><h3>Pet Vet Clinic</h3><p>Get affordable, convenient veterinary care at Tractor Supply\u2019s PetVet Clinics. No appointment needed.</p><p><strong><a href="/tsc/services/petvet">More Info</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="${img('media/svc-same-day-delivery.svg', `${AEM_PAGE}/icons/svc-same-day-delivery.svg`)}" alt="Same Day Delivery"></picture></td>
        <td><h3>Same Day Delivery</h3><p>Receive Same Day Delivery on eligible items purchased in-store and online.</p><p><strong><a href="/tsc/services/same-day-delivery">More Info</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <p>\u2021Offer is valid for new accounts opened 2/9/26 \u2013 3/22/26 and is subject to credit approval. To qualify, you must be a member of Neighbor\u2019s Club and make a qualifying Tractor Supply purchase of $50 or more with your new TSC Store Card or TSC Visa Card between 2/9/26 \u2013 3/22/26.</p>
    <p>^Must be a Neighbor\u2019s Club Member to qualify. Offer valid in-store at Tractor Supply, online at TractorSupply.com, and on the Tractor Supply App between 03/02/2026 \u2013 03/15/2026.</p>
    <table>
      <tr><th colspan="2">Section Metadata</th></tr>
      <tr><td>style</td><td>disclaimer</td></tr>
    </table>
    <hr>
    <table>
      <tr><th colspan="2">Metadata</th></tr>
      <tr><td>title</td><td>For Life Out Here | Tractor Supply Co.</td></tr>
      <tr><td>description</td><td>Tractor Supply Co. is the source for farm supplies, pet and animal feed and supplies, clothing, tools, fencing, and so much more. Buy online and pick up in store is available at most locations. Tractor Supply Co. is your source for the Life Out Here lifestyle!</td></tr>
    </table>
  </main>
  <footer></footer>
</body>
</html>`;

  // ========================
  // CLEANUP: Delete stale files
  // ========================
  console.log('Cleaning up stale files...');
  await del('index-da.html');
  await del('index-da.plain.html');

  // ========================
  // EXECUTE HTML UPLOADS
  // ========================
  const results = [];

  console.log('Uploading nav.html...');
  results.push({ file: 'nav.html', ok: await uploadHtml('nav.html', navHtml) });

  console.log('Uploading footer.html...');
  results.push({ file: 'footer.html', ok: await uploadHtml('footer.html', footerHtml) });

  console.log('Uploading index.html...');
  results.push({ file: 'index.html', ok: await uploadHtml('index.html', indexHtml) });

  console.log('\n=== Upload Results ===');
  results.forEach((r) => console.log(`${r.ok ? '\u2705' : '\u274c'} ${r.file}`));

  // ========================
  // PHASE 3: Trigger AEM Preview
  // ========================
  if (results.every((r) => r.ok)) {
    console.log('\n=== Phase 3: Triggering AEM Preview ===');
    await preview('nav');
    await preview('footer');
    await preview('index');
    console.log('\n=== All Done! ===');
    console.log(`Images uploaded: ${uploaded}/${imageEntries.length}`);
    console.log('Preview URL: https://main--tsc--jgrosskurth.aem.page/');
  } else {
    console.log('\n\u274c Some HTML uploads failed. Fix issues and retry.');
  }
})();
