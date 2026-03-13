import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/* ---- Inline SVG icons for utility bar ---- */
const ICONS = {
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>',
  deliver: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="1" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/><line x1="12" y1="18" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
};

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';

  // Extract content from fragment (brand, sections, tools)
  const fragmentChildren = [...fragment.children];
  const categoryList = fragmentChildren[1]?.querySelector('ul');

  // === Tier 1: Announcement bar ===
  const announcement = document.createElement('div');
  announcement.className = 'nav-announcement';
  announcement.innerHTML = `
    <div class="nav-announcement-inner">
      <div class="nav-announcement-left">
        <span>Get ready for the season ahead</span>
        <span class="nav-announcement-sep">|</span>
        <a href="/tsc/cms/digital-flyer">Shop Now ›</a>
      </div>
      <div class="nav-announcement-right">
        <a href="/tsc/cms/order-status">Order status</a>
        <a href="/tsc/cms/credit">TSC Credit Cards</a>
        <a href="/tsc/whatsnew">What&apos;s new</a>
        <a href="https://www.petsense.com/">Petsense</a>
        <a href="/tsc/cms/digital-flyer">Weekly Ad</a>
      </div>
    </div>`;

  // === Tier 2: Main header row (logo + utility + search) ===
  const nav = document.createElement('nav');
  nav.id = 'nav';

  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;

  // Logo
  const logo = document.createElement('a');
  logo.href = '/';
  logo.className = 'nav-logo';
  logo.setAttribute('aria-label', 'Tractor Supply Co.');
  logo.innerHTML = '<img src="/icons/tsc-logo.svg" alt="Tractor Supply Co." loading="eager">';

  // Utility items container
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  utility.innerHTML = `
    <button class="nav-util-btn nav-store-locator" type="button" aria-label="Store Locator">
      <span class="nav-util-icon">${ICONS.store}</span>
      <span class="nav-util-text">
        <span class="nav-util-primary">Find a Store</span>
        <span class="nav-util-secondary">Near You</span>
      </span>
    </button>
    <button class="nav-util-btn nav-deliver-to" type="button" aria-label="Deliver to">
      <span class="nav-util-icon">${ICONS.deliver}</span>
      <span class="nav-util-text">
        <span class="nav-util-primary">Deliver to</span>
        <span class="nav-util-secondary">20147</span>
      </span>
    </button>
    <div class="nav-search">
      <span class="nav-search-icon">${ICONS.search}</span>
      <input type="text" placeholder="What can we help you find?" aria-label="Search">
      <button class="nav-mic-btn" type="button" aria-label="Voice search">${ICONS.mic}</button>
    </div>
    <a href="/tsc/cms/neighbors-club" class="nav-util-btn nav-sign-in" aria-label="Sign In">
      <span class="nav-util-icon nav-user-icon">${ICONS.user}</span>
      <span class="nav-util-text">
        <span class="nav-util-primary">Sign In / Enroll</span>
        <span class="nav-util-secondary nav-reward">Get Rewarded!</span>
      </span>
    </a>
    <a href="/tsc/cart" class="nav-cart-link" aria-label="Cart">
      <span class="nav-cart-icon">${ICONS.cart}</span>
    </a>`;

  navBrand.append(hamburger, logo, utility);
  nav.append(navBrand);

  // === Tier 3: Category nav ===
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (categoryList) {
    const wrapper = document.createElement('div');
    wrapper.className = 'default-content-wrapper';
    wrapper.append(categoryList);
    navSections.append(wrapper);
  }
  nav.append(navSections);

  // Set up section interactions
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));

  // Assemble wrapper
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(announcement, nav);
  block.append(navWrapper);

  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
}
