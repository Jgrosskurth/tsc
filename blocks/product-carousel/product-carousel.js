/**
 * Product Carousel block – static product card grid with horizontal scrolling.
 * Content model (rows):
 *   Row 0  – heading text (single cell)
 *   Row 1+ – product: image | details
 *             details markup:
 *               <h4><strong>Brand</strong> Product Name</h4>
 *               <p>4.5 (20)</p>        ← rating (reviews)
 *               <p>$44.99</p>          ← price
 *               <p><a href="#">Add to Cart</a></p>
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  /* ---------- heading ---------- */
  const headingRow = rows.shift();
  const headingText = headingRow?.textContent?.trim() || '';

  const content = document.createElement('div');
  content.className = 'product-carousel-content';

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    content.append(h2);
  }

  /* ---------- product cards ---------- */
  const slides = document.createElement('div');
  slides.className = 'product-carousel-slides';

  rows.forEach((row) => {
    const cols = [...row.children];
    const card = document.createElement('div');
    card.className = 'product-card';

    /* image */
    const imgCol = cols[0];
    const picture = imgCol?.querySelector('picture');
    if (picture) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'product-card-image';
      imgWrap.append(picture);
      card.append(imgWrap);
    }

    /* details */
    const detailCol = cols[1];
    if (detailCol) {
      const details = document.createElement('div');
      details.className = 'product-card-details';

      const h4 = detailCol.querySelector('h4');
      const paragraphs = [...detailCol.querySelectorAll('p')];

      /* rating — parse "4.5 (20)" */
      if (paragraphs[0]) {
        const match = paragraphs[0].textContent.trim().match(/^([\d.]+)\s*\((\d+)\)$/);
        if (match) {
          const [, ratingStr, reviews] = match;
          const rating = parseFloat(ratingStr);
          const ratingDiv = document.createElement('div');
          ratingDiv.className = 'product-card-rating';

          const stars = document.createElement('span');
          stars.className = 'stars';
          for (let i = 1; i <= 5; i += 1) {
            const s = document.createElement('span');
            if (i <= Math.floor(rating)) s.className = 'star full';
            else if (i - rating > 0 && i - rating < 1) s.className = 'star half';
            else s.className = 'star empty';
            s.textContent = '\u2605';
            stars.append(s);
          }
          ratingDiv.append(stars);

          const num = document.createElement('strong');
          num.textContent = ratingStr;
          ratingDiv.append(num);

          const cnt = document.createElement('span');
          cnt.className = 'review-count';
          cnt.textContent = `(${reviews})`;
          ratingDiv.append(cnt);

          details.append(ratingDiv);
        }
      }

      /* product name */
      if (h4) {
        const name = document.createElement('h4');
        name.innerHTML = h4.innerHTML;
        details.append(name);
      }

      /* price */
      if (paragraphs[1]) {
        const price = document.createElement('p');
        price.className = 'product-card-price';
        price.textContent = paragraphs[1].textContent.trim();
        details.append(price);
      }

      /* CTA */
      if (paragraphs[2]) {
        const link = paragraphs[2].querySelector('a');
        if (link) {
          const cta = document.createElement('a');
          cta.href = link.href;
          cta.className = 'product-card-cta';
          cta.textContent = link.textContent.trim();
          details.append(cta);
        }
      }

      card.append(details);
    }

    slides.append(card);
  });

  content.append(slides);

  /* ---------- navigation arrows ---------- */
  const nav = document.createElement('div');
  nav.className = 'product-carousel-nav';

  const prev = document.createElement('button');
  prev.className = 'product-carousel-prev';
  prev.setAttribute('aria-label', 'Previous products');
  prev.addEventListener('click', () => {
    slides.scrollBy({ left: -220, behavior: 'smooth' });
  });

  const next = document.createElement('button');
  next.className = 'product-carousel-next';
  next.setAttribute('aria-label', 'Next products');
  next.addEventListener('click', () => {
    slides.scrollBy({ left: 220, behavior: 'smooth' });
  });

  nav.append(prev, next);
  content.append(nav);

  /* replace original content */
  block.textContent = '';
  block.append(content);
}
