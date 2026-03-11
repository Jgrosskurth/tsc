/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer - removes non-content elements from the page
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  const { document } = payload;

  // Remove dialogs, popups, modals
  element.querySelectorAll('dialog, [role="dialog"], [class*="modal"], [class*="popup"], [class*="overlay"]').forEach((el) => el.remove());

  // Remove cookie/consent banners
  element.querySelectorAll('[class*="cookie"], [class*="consent"], [class*="onetrust"], #onetrust-banner-sdk').forEach((el) => el.remove());

  // Remove feedback buttons
  element.querySelectorAll('[class*="feedback"], button:has(> [class*="feedback"])').forEach((el) => el.remove());

  // Remove tracking/analytics elements
  element.querySelectorAll('[class*="tracking"], [class*="analytics"], [class*="beacon"], noscript').forEach((el) => el.remove());

  // Remove ads (Koddi/RMN ads)
  element.querySelectorAll('[class*="koddi"], [class*="rmn"], [class*="sponsored"]').forEach((el) => {
    el.remove();
  });

  // Remove iframes
  element.querySelectorAll('iframe').forEach((el) => el.remove());

  // Remove hidden textboxes and feedback
  element.querySelectorAll('input[type="hidden"]').forEach((el) => el.remove());

  // Remove the sign-in/membership overlay region at top of main
  const guestRegion = element.querySelector('[class*="guest"], [aria-label*="Guest"], [aria-label*="membership"]');
  if (guestRegion) guestRegion.remove();

  // Remove alert elements
  element.querySelectorAll('[role="alert"]:empty').forEach((el) => el.remove());
}
