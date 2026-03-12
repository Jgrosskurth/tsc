import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('.icon'))) {
        div.className = 'cards-card-image';
      } else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // Skip external CDN images (already optimized) and SVG images (vector, no raster optimization)
    const isExternal = img.src.startsWith('http') && !img.src.startsWith(window.location.origin);
    const isSvg = new URL(img.src).pathname.endsWith('.svg');
    if (!isExternal && !isSvg) {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    }
  });
  block.replaceChildren(ul);
}
