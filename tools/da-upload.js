/**
 * DA Content Upload Script
 *
 * Run this in the browser console at https://da.live/#/jgrosskurth/tsc
 * while signed in to upload TSC content files.
 *
 * IMPORTANT: Uses TABLE format for blocks in index page content.
 * The AEM page pipeline converts tables with block-name headers into
 * block divs. Regular <div class="blockname"> is stripped by the pipeline.
 *
 * Nav and footer use full HTML wrapper because DA stores full documents.
 * When fetched via .plain.html, only the <main> inner content is returned.
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

  // Helper: delete existing content from DA
  async function del(path) {
    const resp = await fetch(`${DA_SOURCE}/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`Delete ${path}: ${resp.status} ${resp.statusText}`);
    return resp.ok;
  }

  // Helper: upload HTML to DA
  async function upload(path, html) {
    // Delete first to ensure clean overwrite
    await del(path);

    const blob = new Blob([html], { type: 'text/html' });
    const form = new FormData();
    form.append('data', blob);

    const resp = await fetch(`${DA_SOURCE}/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    console.log(`Upload ${path}: ${resp.status} ${resp.statusText}`);
    return resp.ok;
  }

  // Helper: trigger AEM preview
  async function preview(path) {
    const resp = await fetch(`${AEM_ADMIN}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`Preview ${path}: ${resp.status} ${resp.statusText}`);
    return resp.ok;
  }

  // ========================
  // NAV CONTENT (full HTML wrapper for DA storage)
  // ========================
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

  // ========================
  // FOOTER CONTENT (full HTML wrapper for DA storage)
  // ========================
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

  // ========================
  // INDEX (HOMEPAGE) CONTENT
  // Uses TABLE format for blocks (required by AEM page pipeline)
  // Local SVG paths for icons (served from git repo via Code Sync)
  // Sections separated by <hr>
  // ========================
  const indexHtml = `<html>
<body>
  <header></header>
  <main>
    <!-- Section 1: Hero Carousel -->
    <table>
      <tr><th colspan="2">Carousel</th></tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero1-V13-North-D?preferwebp=true&amp;scl=1" alt="Save up to 40 percent off outdoor supplies" loading="eager"></picture></td>
        <td><h2>Spring Favorites</h2><p>Save up to 40% off outdoor supplies</p><p><strong><a href="/tsc/cms/digital-flyer">Shop Now</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero3-V3-D?preferwebp=true&amp;scl=1" alt="Tax refund savings on yard equipment" loading="lazy"></picture></td>
        <td><h2>Tax Refund Savings</h2><p>Turn your refund into yard work</p><p><strong><a href="/tsc/cms/yard">Shop Now</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero4-D-V3?preferwebp=true&amp;scl=1" alt="Save up to 200 dollars on gun safes" loading="lazy"></picture></td>
        <td><h2>Gun Safes Sale</h2><p>Save up to $200 with special financing available</p><p><strong><a href="/tsc/catalog/gun-safes">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 2: Shop Popular Categories -->
    <h2>Shop Popular Categories</h2>
    <table>
      <tr><th colspan="2">Cards (categories)</th></tr>
      <tr><td><picture><img src="/icons/cat-sale.svg" alt="Sale" loading="lazy"></picture></td><td><p><a href="/tsc/sale">Sale</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-chick-days.svg" alt="Chick Days" loading="lazy"></picture></td><td><p><a href="/tsc/cms/chick-days">Chick Days</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-demo-days.svg" alt="Demo Days" loading="lazy"></picture></td><td><p><a href="/tsc/cms/demo-days">Demo Days</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-tools.svg" alt="Tools" loading="lazy"></picture></td><td><p><a href="/tsc/category/tools">Tools</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-pet.svg" alt="Pet" loading="lazy"></picture></td><td><p><a href="/tsc/category/pet">Pet</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-tax-refund.svg" alt="Tax Refund" loading="lazy"></picture></td><td><p><a href="/tsc/cms/yard">Tax Refund</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-ammunition.svg" alt="Ammunition" loading="lazy"></picture></td><td><p><a href="/tsc/catalog/ammunition">Ammunition</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-direct-sales.svg" alt="Direct Sales" loading="lazy"></picture></td><td><p><a href="/tsc/cms/direct-sales">Direct Sales</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-outdoor-power-equipment.svg" alt="Outdoor Power Equipment" loading="lazy"></picture></td><td><p><a href="/tsc/category/outdoor-power-equipment">Outdoor Power Equipment</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-fencing-and-gates.svg" alt="Fencing and Gates" loading="lazy"></picture></td><td><p><a href="/tsc/category/fencing-gates">Fencing &amp; Gates</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-pet-and-animal-pharmacy.svg" alt="Pet and Animal Pharmacy" loading="lazy"></picture></td><td><p><a href="/tsc/category/pet-animal-pharmacy">Pet &amp; Animal Pharmacy</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-clothing.svg" alt="Clothing" loading="lazy"></picture></td><td><p><a href="/tsc/category/clothing">Clothing</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-gift-card.svg" alt="Gift Card" loading="lazy"></picture></td><td><p><a href="/tsc/cms/gift-card">Gift Card</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-boots-and-shoes.svg" alt="Boots and Shoes" loading="lazy"></picture></td><td><p><a href="/tsc/category/boots-shoes">Boots &amp; Shoes</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-trailers-and-towing.svg" alt="Trailers and Towing" loading="lazy"></picture></td><td><p><a href="/tsc/category/trailers-towing">Trailers &amp; Towing</a></p></td></tr>
      <tr><td><picture><img src="/icons/cat-horse.svg" alt="Horse" loading="lazy"></picture></td><td><p><a href="/tsc/category/horse">Horse</a></p></td></tr>
    </table>
    <hr>
    <!-- Section 3: Demo Days Banner -->
    <p><a href="/tsc/cms/demo-days"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-DemoDays-D-V1?scl=1" alt="Demo Days - Try before you buy" loading="lazy"></picture></a></p>
    <hr>
    <!-- Section 4: Pets Feature Tile -->
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-PetEnthusiast-V1?scl=1" alt="Keep your pets happy all Spring" loading="lazy"></picture></td>
        <td><h3>Keep your pets happy all Spring</h3><p>Flea &amp; tick care, grooming and more</p><p><strong><a href="/tsc/vc/get-your-pet-ready-for-spring">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 5: ALPO Banner -->
    <p><a href="/tsc/brand/ALPO"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-ALPO-D-V1?scl=1&amp;fmt=png-alpha" alt="Earn 3 dollars in rewards on Purina ALPO dog food" loading="lazy"></picture></a></p>
    <hr>
    <!-- Section 6: Garden Feature Tile -->
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-CountryDabbler-V1?scl=1" alt="Dig into spring" loading="lazy"></picture></td>
        <td><h3>Dig into spring</h3><p>Time to grow fresh veggies and flowers</p><p><strong><a href="/tsc/category/lawn-garden">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 7: Patio Furniture Banner -->
    <p><a href="/tsc/sale/patio-furniture-decor"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-PatioFurniture-V1-D?scl=1&amp;fmt=png-alpha" alt="Save up to 40 percent off patio furniture and decor" loading="lazy"></picture></a></p>
    <hr>
    <!-- Section 8: Poultry Feature Tile -->
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-BackyardHomesteader-V2?scl=1" alt="Chick Days are here" loading="lazy"></picture></td>
        <td><h3>Chick Days are here</h3><p>Everything you need to grow your flock or start a new one</p><p><strong><a href="/tsc/cms/chick-days">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 9: Credit Card Banner -->
    <p><a href="/tsc/cms/credit"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-Financing-D-V1?scl=1&amp;fmt=png-alpha" alt="Open a TSC Credit Card and earn 50 dollars in rewards" loading="lazy"></picture></a></p>
    <hr>
    <!-- Section 10: Trailers Feature Tile -->
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-HobbyFarmer-V1?scl=1" alt="Exclusive trailers and accessories" loading="lazy"></picture></td>
        <td><h3>Exclusive trailers &amp; accessories</h3><p>Just what you need for the job</p><p><strong><a href="/tsc/category/trailers-towing">Shop Now</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 11: Services Overlay Cards -->
    <table>
      <tr><th colspan="2">Cards (services)</th></tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-BuyInBulk-V1?scl=1" alt="Feed and Food Headquarters" loading="lazy"></picture></td>
        <td><h3>Save when you buy in bulk</h3><p>Fencing projects made easy</p><p><strong><a href="/tsc/cms/bulk-discounts">Learn More</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-NC-V1?scl=1" alt="Neighbors Club" loading="lazy"></picture></td>
        <td><h3>Neighbor\u2019s Club</h3><p>Discover your rewards</p><p><strong><a href="/tsc/cms/neighbors-club">Learn More</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW10-030226-TSC-HP-BigBarn-PetRX-V1?scl=1" alt="Pet Rx" loading="lazy"></picture></td>
        <td><h3>Pet Rx</h3><p>Pet &amp; animal pharmacy</p><p><strong><a href="/tsc/category/pet-animal-pharmacy">Learn More</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 12: Neighbors Club Banner -->
    <p><a href="/tsc/cms/neighbors-club"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/Nonmember%20Desktop?scl=1" alt="Neighbors Club - Free to join, full of rewards" loading="lazy"></picture></a></p>
    <hr>
    <!-- Section 13: Shop Popular Brands -->
    <h2>Shop Popular Brands</h2>
    <table>
      <tr><th colspan="2">Cards (brands)</th></tr>
      <tr><td><picture><img src="/icons/brand-carhartt.svg" alt="Carhartt" loading="lazy"></picture></td><td><p><a href="/tsc/brand/Carhartt">Carhartt</a></p></td></tr>
      <tr><td><picture><img src="/icons/brand-cub-cadet.svg" alt="Cub Cadet" loading="lazy"></picture></td><td><p><a href="/tsc/brand/Cub+Cadet">Cub Cadet</a></p></td></tr>
      <tr><td><picture><img src="/icons/brand-purina.svg" alt="Purina" loading="lazy"></picture></td><td><p><a href="/tsc/brand/Purina">Purina</a></p></td></tr>
      <tr><td><picture><img src="/icons/brand-yeti.svg" alt="YETI" loading="lazy"></picture></td><td><p><a href="/tsc/brand/YETI">YETI</a></p></td></tr>
      <tr><td><picture><img src="/icons/brand-dewalt.svg" alt="DeWALT" loading="lazy"></picture></td><td><p><a href="/tsc/brand/DeWALT">DeWALT</a></p></td></tr>
      <tr><td><picture><img src="/icons/brand-blackstone.svg" alt="Blackstone" loading="lazy"></picture></td><td><p><a href="/tsc/brand/Blackstone">Blackstone</a></p></td></tr>
      <tr><td><picture><img src="/icons/brand-pelpro.svg" alt="Forge and Flame" loading="lazy"></picture></td><td><p><a href="/tsc/brand/Forge+%26+Flame">Forge &amp; Flame</a></p></td></tr>
    </table>
    <hr>
    <!-- Section 14: Smart Supply -->
    <table>
      <tr><th colspan="2">Columns</th></tr>
      <tr>
        <td><picture><img src="https://www.tractorsupply.com/adobe/dynamicmedia/deliver/dm-aid--36063787-a122-4388-a2c9-a9809bb05a99/FW42-101325-TSC-HP-DynamicComponent-PetRX-V1.jpg?preferwebp=true&amp;width=1920&amp;q=75" alt="Smart Supply subscription products" loading="lazy"></picture></td>
        <td><h3>Save up to 35% with Smart Supply</h3><p>Enjoy discounts on delivery and pick up subscriptions, plus free shipping on orders $49+</p><p><em><a href="/tsc/cms/autoship">Learn More</a></em></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 15: Store Services -->
    <h2>Store Services</h2>
    <table>
      <tr><th colspan="2">Cards (store-services)</th></tr>
      <tr>
        <td><picture><img src="/icons/svc-propane-tank-refill.svg" alt="Propane Tank Refill" loading="lazy"></picture></td>
        <td><h3>Propane Tank Refill</h3><p>Refilling your propane tank at your local Tractor Supply is convenient and economical.</p><p><strong><a href="/tsc/services/propane-refill">More Info</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="/icons/svc-trailer-rental.svg" alt="Trailer Rental" loading="lazy"></picture></td>
        <td><h3>Trailer Rental</h3><p>Tough job to tackle? Transporting your purchase home? Rent a trailer and get it done!</p><p><strong><a href="/tsc/services/trailer-rental">More Info</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="/icons/svc-pet-vet-clinic.svg" alt="Pet Vet Clinic" loading="lazy"></picture></td>
        <td><h3>Pet Vet Clinic</h3><p>Get affordable, convenient veterinary care at Tractor Supply\u2019s PetVet Clinics. No appointment needed.</p><p><strong><a href="/tsc/services/petvet">More Info</a></strong></p></td>
      </tr>
      <tr>
        <td><picture><img src="/icons/svc-same-day-delivery.svg" alt="Same Day Delivery" loading="lazy"></picture></td>
        <td><h3>Same Day Delivery</h3><p>Receive Same Day Delivery on eligible items purchased in-store and online.</p><p><strong><a href="/tsc/services/same-day-delivery">More Info</a></strong></p></td>
      </tr>
    </table>
    <hr>
    <!-- Section 16: Disclaimer -->
    <p>\u2021Offer is valid for new accounts opened 2/9/26 \u2013 3/22/26 and is subject to credit approval. To qualify, you must be a member of Neighbor\u2019s Club and make a qualifying Tractor Supply purchase of $50 or more with your new TSC Store Card or TSC Visa Card between 2/9/26 \u2013 3/22/26.</p>
    <p>^Must be a Neighbor\u2019s Club Member to qualify. Offer valid in-store at Tractor Supply, online at TractorSupply.com, and on the Tractor Supply App between 03/02/2026 \u2013 03/15/2026.</p>
    <table>
      <tr><th colspan="2">Section Metadata</th></tr>
      <tr><td>style</td><td>disclaimer</td></tr>
    </table>
    <hr>
    <!-- Metadata -->
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
  // EXECUTE UPLOADS
  // ========================
  console.log('=== Starting DA Content Upload ===');

  const results = [];

  // Upload nav
  console.log('1/3: Uploading nav.html...');
  results.push({ file: 'nav.html', ok: await upload('nav.html', navHtml) });

  // Upload footer
  console.log('2/3: Uploading footer.html...');
  results.push({ file: 'footer.html', ok: await upload('footer.html', footerHtml) });

  // Upload index
  console.log('3/3: Uploading index.html...');
  results.push({ file: 'index.html', ok: await upload('index.html', indexHtml) });

  console.log('');
  console.log('=== Upload Results ===');
  results.forEach((r) => console.log(`${r.ok ? '\u2705' : '\u274c'} ${r.file}`));

  // Trigger AEM preview for all pages
  if (results.every((r) => r.ok)) {
    console.log('');
    console.log('=== Triggering AEM Preview ===');
    await preview('nav');
    await preview('footer');
    await preview('index');
    console.log('');
    console.log('=== All Done! ===');
    console.log('Preview URL: https://main--tsc--jgrosskurth.aem.page/');
  } else {
    console.log('');
    console.log('\u274c Some uploads failed. Fix issues and retry.');
  }
})();
