/**
 * DA Content Upload Script - Using correct DA div format
 *
 * Run this in the browser console at https://da.live/#/jgrosskurth/tsc
 * while signed in to upload TSC homepage content.
 *
 * KEY FIX: DA uses div-based blocks (not table-based).
 * The content structure matches the local content/index.html format.
 * The AEM pipeline will download and optimize all images automatically.
 *
 * Usage: Copy and paste this entire script into the browser console.
 */

(async () => {
  let token;
  try {
    const t = await window.adobeIMS.getAccessToken();
    token = t.token || t;
    console.log('Got fresh token');
  } catch (e) {
    console.error('Sign in to da.live first.', e);
    return;
  }

  const OWNER = 'jgrosskurth';
  const REPO = 'tsc';
  const DA = `https://admin.da.live/source/${OWNER}/${REPO}`;
  const AEM = `https://admin.hlx.page/preview/${OWNER}/${REPO}/main`;

  async function del(path) {
    const r = await fetch(`${DA}/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  Delete ${path}: ${r.status}`);
  }

  async function upload(path, html) {
    await del(path);
    const form = new FormData();
    form.append('data', new Blob([html], { type: 'text/html' }));
    const r = await fetch(`${DA}/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    console.log(`  Upload ${path}: ${r.status}`);
    return r.ok;
  }

  async function preview(path) {
    const r = await fetch(`${AEM}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  Preview ${path}: ${r.status}`);
    return r.ok;
  }

  // ========================
  // CLEANUP: Remove stale/duplicate files
  // ========================
  console.log('=== Cleaning up stale files ===');
  await del('index-da.html');
  await del('test-page.html');
  await del('test-page2.html');
  await del('test-page3.html');

  // ========================
  // INDEX PAGE - DA div format (matches local content/index.html)
  // ========================
  // SVG icons use full aem.page URLs so the pipeline can download them
  // Photo images use original CDN URLs - pipeline will download and create media_ blobs
  const P = `https://main--tsc--jgrosskurth.aem.page`;

  const indexHtml = `<body>
  <header></header>
  <main>
    <div>
      <div class="carousel">
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero1-V13-North-D?preferwebp=true&amp;scl=1" alt="Save up to 40 percent off outdoor supplies" loading="eager">
            </picture>
          </div>
          <div>
            <h2>Spring Favorites</h2>
            <p>Save up to 40% off outdoor supplies</p>
            <p><strong><a href="/tsc/cms/digital-flyer">Shop Now</a></strong></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero3-V3-D?preferwebp=true&amp;scl=1" alt="Tax refund savings on yard equipment" loading="lazy">
            </picture>
          </div>
          <div>
            <h2>Tax Refund Savings</h2>
            <p>Turn your refund into yard work</p>
            <p><strong><a href="/tsc/cms/yard">Shop Now</a></strong></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Hero4-D-V3?preferwebp=true&amp;scl=1" alt="Save up to 200 dollars on gun safes" loading="lazy">
            </picture>
          </div>
          <div>
            <h2>Gun Safes Sale</h2>
            <p>Save up to $200 with special financing available</p>
            <p><strong><a href="/tsc/catalog/gun-safes">Shop Now</a></strong></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h2>Shop Popular Categories</h2>
      <div class="cards categories">
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-sale.svg" alt="Sale" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/sale">Sale</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-chick-days.svg" alt="Chick Days" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/cms/chick-days">Chick Days</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-demo-days.svg" alt="Demo Days" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/cms/demo-days">Demo Days</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-tools.svg" alt="Tools" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/tools">Tools</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-pet.svg" alt="Pet" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/pet">Pet</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-tax-refund.svg" alt="Tax Refund" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/cms/yard">Tax Refund</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-ammunition.svg" alt="Ammunition" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/catalog/ammunition">Ammunition</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-direct-sales.svg" alt="Direct Sales" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/cms/direct-sales">Direct Sales</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-outdoor-power-equipment.svg" alt="Outdoor Power Equipment" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/outdoor-power-equipment">Outdoor Power Equipment</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-fencing-and-gates.svg" alt="Fencing and Gates" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/fencing-gates">Fencing &amp; Gates</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-pet-and-animal-pharmacy.svg" alt="Pet and Animal Pharmacy" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/pet-animal-pharmacy">Pet &amp; Animal Pharmacy</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-clothing.svg" alt="Clothing" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/clothing">Clothing</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-gift-card.svg" alt="Gift Card" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/cms/gift-card">Gift Card</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-boots-and-shoes.svg" alt="Boots and Shoes" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/boots-shoes">Boots &amp; Shoes</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-trailers-and-towing.svg" alt="Trailers and Towing" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/trailers-towing">Trailers &amp; Towing</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/cat-horse.svg" alt="Horse" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/category/horse">Horse</a></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p><a href="/tsc/cms/demo-days"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-DemoDays-D-V1?scl=1" alt="Demo Days - Try before you buy" loading="lazy"></picture></a></p>
    </div>
    <div>
      <div class="columns">
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-PetEnthusiast-V1?scl=1" alt="Keep your pets happy all Spring" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Keep your pets happy all Spring</h3>
            <p>Flea &amp; tick care, grooming and more</p>
            <p><strong><a href="/tsc/vc/get-your-pet-ready-for-spring">Shop Now</a></strong></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p><a href="/tsc/brand/ALPO"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-ALPO-D-V1?scl=1&amp;fmt=png-alpha" alt="Earn 3 dollars in rewards on Purina ALPO dog food" loading="lazy"></picture></a></p>
    </div>
    <div>
      <div class="columns">
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-CountryDabbler-V1?scl=1" alt="Dig into spring" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Dig into spring</h3>
            <p>Time to grow fresh veggies and flowers</p>
            <p><strong><a href="/tsc/category/lawn-garden">Shop Now</a></strong></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p><a href="/tsc/sale/patio-furniture-decor"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-PatioFurniture-V1-D?scl=1&amp;fmt=png-alpha" alt="Save up to 40 percent off patio furniture and decor" loading="lazy"></picture></a></p>
    </div>
    <div>
      <div class="columns">
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-BackyardHomesteader-V2?scl=1" alt="Chick Days are here" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Chick Days are here</h3>
            <p>Everything you need to grow your flock or start a new one</p>
            <p><strong><a href="/tsc/cms/chick-days">Shop Now</a></strong></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p><a href="/tsc/cms/credit"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-Banner-Financing-D-V1?scl=1&amp;fmt=png-alpha" alt="Open a TSC Credit Card and earn 50 dollars in rewards" loading="lazy"></picture></a></p>
    </div>
    <div>
      <div class="columns">
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW11-030926-TSC-HP-BigBox-HobbyFarmer-V1?scl=1" alt="Exclusive trailers and accessories" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Exclusive trailers &amp; accessories</h3>
            <p>Just what you need for the job</p>
            <p><strong><a href="/tsc/category/trailers-towing">Shop Now</a></strong></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="cards services">
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-BuyInBulk-V1?scl=1" alt="Feed and Food Headquarters" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Save when you buy in bulk</h3>
            <p>Fencing projects made easy</p>
            <p><strong><a href="/tsc/cms/bulk-discounts">Learn More</a></strong></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW09-022326-TSC-HP-BigBarn-NC-V1?scl=1" alt="Neighbors Club" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Neighbor\u2019s Club</h3>
            <p>Discover your rewards</p>
            <p><strong><a href="/tsc/cms/neighbors-club">Learn More</a></strong></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/FW10-030226-TSC-HP-BigBarn-PetRX-V1?scl=1" alt="Pet Rx" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Pet Rx</h3>
            <p>Pet &amp; animal pharmacy</p>
            <p><strong><a href="/tsc/category/pet-animal-pharmacy">Learn More</a></strong></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p><a href="/tsc/cms/neighbors-club"><picture><img src="https://media.tractorsupply.com/is/image/TractorSupplyCompany/Nonmember%20Desktop?scl=1" alt="Neighbors Club - Free to join, full of rewards" loading="lazy"></picture></a></p>
    </div>
    <div>
      <h2>Shop Popular Brands</h2>
      <div class="cards brands">
        <div>
          <div>
            <picture>
              <img src="${P}/icons/brand-carhartt.svg" alt="Carhartt" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/brand/Carhartt">Carhartt</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/brand-cub-cadet.svg" alt="Cub Cadet" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/brand/Cub+Cadet">Cub Cadet</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/brand-purina.svg" alt="Purina" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/brand/Purina">Purina</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/brand-yeti.svg" alt="YETI" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/brand/YETI">YETI</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/brand-dewalt.svg" alt="DeWALT" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/brand/DeWALT">DeWALT</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/brand-blackstone.svg" alt="Blackstone" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/brand/Blackstone">Blackstone</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/brand-pelpro.svg" alt="Forge and Flame" loading="lazy">
            </picture>
          </div>
          <div>
            <p><a href="/tsc/brand/Forge+%26+Flame">Forge &amp; Flame</a></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="columns">
        <div>
          <div>
            <picture>
              <img src="https://www.tractorsupply.com/adobe/dynamicmedia/deliver/dm-aid--36063787-a122-4388-a2c9-a9809bb05a99/FW42-101325-TSC-HP-DynamicComponent-PetRX-V1.jpg?preferwebp=true&amp;width=1920&amp;q=75" alt="Smart Supply subscription products" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Save up to 35% with Smart Supply</h3>
            <p>Enjoy discounts on delivery and pick up subscriptions, plus free shipping on orders $49+</p>
            <p><em><a href="/tsc/cms/autoship">Learn More</a></em></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h2>Store Services</h2>
      <div class="cards store-services">
        <div>
          <div>
            <picture>
              <img src="${P}/icons/svc-propane-tank-refill.svg" alt="Propane Tank Refill" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Propane Tank Refill</h3>
            <p>Refilling your propane tank at your local Tractor Supply is convenient and economical.</p>
            <p><strong><a href="/tsc/services/propane-refill">More Info</a></strong></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/svc-trailer-rental.svg" alt="Trailer Rental" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Trailer Rental</h3>
            <p>Tough job to tackle? Transporting your purchase home? Rent a trailer and get it done!</p>
            <p><strong><a href="/tsc/services/trailer-rental">More Info</a></strong></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/svc-pet-vet-clinic.svg" alt="Pet Vet Clinic" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Pet Vet Clinic</h3>
            <p>Get affordable, convenient veterinary care at Tractor Supply\u2019s PetVet Clinics. No appointment needed.</p>
            <p><strong><a href="/tsc/services/petvet">More Info</a></strong></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="${P}/icons/svc-same-day-delivery.svg" alt="Same Day Delivery" loading="lazy">
            </picture>
          </div>
          <div>
            <h3>Same Day Delivery</h3>
            <p>Receive Same Day Delivery on eligible items purchased in-store and online.</p>
            <p><strong><a href="/tsc/services/same-day-delivery">More Info</a></strong></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="section-metadata">
        <div>
          <div>style</div>
          <div>disclaimer</div>
        </div>
      </div>
      <p><small>\u2021Offer is valid for new accounts opened 2/9/26 \u2013 3/22/26 and is subject to credit approval. To qualify, you must be a member of Neighbor\u2019s Club and make a qualifying Tractor Supply purchase of $50 or more with your new TSC Store Card or TSC Visa Card between 2/9/26 \u2013 3/22/26.</small></p>
      <p><small>^Must be a Neighbor\u2019s Club Member to qualify. Offer valid in-store at Tractor Supply, online at TractorSupply.com, and on the Tractor Supply App between 03/02/2026 \u2013 03/15/2026.</small></p>
    </div>
    <div class="metadata">
      <div>
        <div>title</div>
        <div>For Life Out Here | Tractor Supply Co.</div>
      </div>
      <div>
        <div>description</div>
        <div>Tractor Supply Co. is the source for farm supplies, pet and animal feed and supplies, clothing, tools, fencing, and so much more. Buy online and pick up in store is available at most locations. Tractor Supply Co. is your source for the Life Out Here lifestyle!</div>
      </div>
    </div>
  </main>
  <footer></footer>
</body>`;

  // ========================
  // UPLOAD INDEX PAGE
  // ========================
  console.log('=== Uploading index.html (DA div format) ===');
  const ok = await upload('index.html', indexHtml);

  if (ok) {
    console.log('=== Triggering AEM Preview ===');
    await preview('index');
    console.log('\n=== Done! ===');
    console.log('Wait ~10 seconds then check: https://main--tsc--jgrosskurth.aem.page/');
    console.log('Verify with: https://main--tsc--jgrosskurth.aem.page/index.plain.html');
  } else {
    console.log('Upload failed. Check errors above.');
  }
})();
