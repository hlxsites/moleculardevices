// eslint-disable-next-line import/no-cycle
import {
  hideModal,
  initGlobalModal, setModalContent, showModal,
} from '../../blocks/modal/modal.js';
import {
  button, div, h3, p,
} from '../../scripts/dom-helpers.js';

import {
  getCookie, setCookie,
} from '../../scripts/scripts.min.js';

const SERVICE_PLANS_PATH = '/service-support/service-plans';
const REGION_COOKIE = 'service-plans-region';

const REGION_CONFIG = {
  na: { label: 'North America', url: `${SERVICE_PLANS_PATH}/na` },
  europe: { label: 'Europe', url: `${SERVICE_PLANS_PATH}/europe` },
  global: { label: 'Global', url: SERVICE_PLANS_PATH },
};

/**
 * Check whether region is valid.
 *
 * @param {string} region
 * @returns {boolean}
 */
function isValidRegion(region) {
  return Boolean(region && Object.prototype.hasOwnProperty.call(REGION_CONFIG, region));
}

/**
 * Redirect to regional Service Plans page.
 *
 * @param {string} region
 */
function redirectToRegion(region) {
  const config = REGION_CONFIG[region];

  if (!config) return;

  if (window.location.pathname === config.url) {
    hideModal();
  } else {
    window.location.assign(config.url);
  }
}

/**
 * Handle region selection.
 *
 * @param {string} region
 */
function handleRegionSelect(region) {
  if (!isValidRegion(region)) return;

  setCookie(REGION_COOKIE, region, 365);
  redirectToRegion(region);
}

/**
 * Create Service Plans region modal content.
 *
 * @returns {HTMLElement}
 */
function createRegionModalContent() {
  const wrapper = div({ class: 'service-plans-region-modal modal-form' });
  const heading = h3({}, 'Select your region');
  const description = p({}, 'Please select your region to view the relevant Service Plans.');
  const options = div({ class: 'service-plans-region-options' });

  Object.entries(REGION_CONFIG).forEach(
    ([region, config]) => {
      const regionButton = button(
        { class: 'service-plans-region-option', 'data-region': region, type: 'button' },
        config.label,
      );

      regionButton.addEventListener('click', () => handleRegionSelect(region));
      options.append(regionButton);
    },
  );

  wrapper.append(heading, description, options);

  return wrapper;
}

/**
 * Show Service Plans region selection.
 */
function showRegionSelection() {
  initGlobalModal();

  setTimeout(() => {
    const content = createRegionModalContent();

    setModalContent(content, 'service-plans-region-modal-wrapper');
    showModal();
  }, 1000);
}

/**
 * Initialize Service Plans region selection.
 */
export default function initServicePlansRegion() {
  const { pathname } = window.location;

  // Only run on the main Service Plans page.
  if (pathname !== SERVICE_PLANS_PATH) return;

  const savedRegion = getCookie(REGION_COOKIE);

  // Returning visitor.
  if (isValidRegion(savedRegion)) {
    redirectToRegion(savedRegion);
    return;
  }

  // First visit.
  showRegionSelection();
}
