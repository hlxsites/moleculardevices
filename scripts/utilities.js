/* eslint-disable import/no-cycle, no-console */
import { coveoResources } from '../blocks/resources/resources.js';

export const COVEO_TAB_NAME = 'resources';
export const COVEO_HASH_NAME = 't=resources&sort=relevancy';

export function isElementVisible(el) {
  return el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function scrollToElement(target) {
  if (!target) return;

  requestAnimationFrame(() => {
    const y = target.offsetTop;
    window.scrollTo({ top: y - 200, behavior: 'smooth' });
  });
}

export function debounce(fn, delay = 300) {
  let timerId;
  return function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Activates a tab and shows the corresponding content section.
 * @param {HTMLElement} tabLink - The <a> element inside the tab.
 */
export function activateTab(tabLink, scrollTarget = null) {
  if (!tabLink) return;

  const tabItem = tabLink.closest('li');
  const main = tabItem.closest('main');
  const tabId = tabLink.getAttribute('href').substring(1);
  const tabSection = main.querySelector(`.section[aria-labelledby="${tabId}"]`);
  const isAlreadyActive = tabLink.getAttribute('aria-selected') === 'true'
    && tabSection?.getAttribute('aria-hidden') === 'false';

  if (isAlreadyActive) return;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Deactivate existing tabs and hide their sections
  tabItem.parentNode.querySelectorAll('li[aria-selected="true"]')
    .forEach((tab) => tab.setAttribute('aria-selected', false));
  main.querySelectorAll('.section.tabs[aria-hidden="false"]')
    .forEach((section) => section.setAttribute('aria-hidden', true));

  // Activate the selected tab
  tabItem.setAttribute('aria-selected', true);
  main.querySelectorAll(`.section[aria-labelledby="${tabId}"]`)
    .forEach((section) => section.setAttribute('aria-hidden', false));

  if (tabId === COVEO_TAB_NAME) {
    coveoResources(tabLink);
  }

  if (scrollTarget) {
    requestAnimationFrame(() => scrollToElement(scrollTarget));
  }
}

/**
 * Scrolls to the given tab and activates it.
 */
export function goToTabSection(tabId, scrollTargetSelector = '.page-tabs-container') {
  const tabLink = document.querySelector(`.page-tabs li > a[href="#${tabId}"]`);
  const scrollTarget = document.querySelector(scrollTargetSelector);
  if (tabLink) {
    activateTab(tabLink);
    scrollToElement(scrollTarget);
  }
}

export function getScrollOffset() {
  const rootStyles = getComputedStyle(document.documentElement);
  const stackedHeight = parseInt(rootStyles.getPropertyValue('--stacked-height'), 10);
  return Number.isNaN(stackedHeight) ? 0 : stackedHeight;
}

/**
 * Attempts to scroll to a hashed target and open its tab context if needed.
 */
export function scrollToHashTarget(rawHash, retries = 20, delay = 300) {
  const main = document.querySelector('main');
  if (!rawHash || !main) return;

  let attempts = 0;
  const hash = (rawHash.startsWith('#') ? rawHash.slice(1) : rawHash).toLowerCase();

  const isCoveo = hash.includes(COVEO_HASH_NAME);
  const tabId = isCoveo ? COVEO_TAB_NAME : hash;

  const tabLink = document.querySelector(`.page-tabs li > a[href="#${tabId}"]`);
  const tabSection = document.querySelector(`.section[aria-labelledby="${tabId}"]`);

  if (tabLink && tabSection) {
    activateTab(tabLink, tabSection);
    return;
  }

  const fallbackTarget = document.getElementById(hash);
  const containingTab = fallbackTarget?.closest('.section.tabs[aria-labelledby]');
  if (containingTab) {
    const parentTabId = containingTab.getAttribute('aria-labelledby');
    if (parentTabId) goToTabSection(parentTabId);
  }

  const tryScroll = () => {
    const hashEl = document.getElementById(hash);
    if (hashEl && isElementVisible(hashEl)) {
      const scrollTarget = hashEl.closest('.block[data-block-status="loaded"], .section') || hashEl;
      scrollToElement(scrollTarget);
      return true;
    }

    if (!hashEl) {
      const observer = new MutationObserver(() => {
        const lateEl = document.getElementById(hash);
        if (lateEl && isElementVisible(lateEl)) {
          const scrollTarget = lateEl.closest('.block[data-block-status="loaded"], .section') || lateEl;
          scrollToElement(scrollTarget);
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return false;
  };

  if (!tryScroll()) {
    const interval = setInterval(() => {
      attempts += 1;
      if (tryScroll() || attempts >= retries) clearInterval(interval);
    }, delay);
  }
}

/**
 * Scrolls to a Franklin section by selector or element
 * Handles lazy loading, fragments, and dynamic height changes
 *
 * @param {string|HTMLElement} target - Selector or section element
 * @param {number} offset - Pixels to offset (positive pushes scroll up)
 * @param {boolean} smooth - Whether to use smooth scrolling
 */
export function scrollToFranklinSection(target, offset = -100, smooth = true) {
  const sectionSelector = typeof target === 'string' ? target : null;
  let sectionEl = typeof target === 'string' ? document.querySelector(target) : target;

  const doScroll = () => {
    if (!sectionEl) return;
    const y = sectionEl.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
  };

  const onSectionLoaded = () => {
    // Use ResizeObserver to adjust if height changes
    const resizeObs = new ResizeObserver(() => doScroll());
    resizeObs.observe(sectionEl);

    // Scroll once content is visible
    requestAnimationFrame(() => doScroll());
    setTimeout(() => resizeObs.disconnect(), 2000); // stop after 2s
  };

  const waitForSection = () => {
    if (!sectionEl) sectionEl = document.querySelector(sectionSelector);
    if (!sectionEl) return;

    if (sectionEl.dataset.sectionStatus === 'loaded') {
      onSectionLoaded();
    } else {
      const attrObs = new MutationObserver((mutations, obs) => {
        if (sectionEl.dataset.sectionStatus === 'loaded') {
          obs.disconnect();
          onSectionLoaded();
        }
      });
      attrObs.observe(sectionEl, { attributes: true, attributeFilter: ['data-section-status'] });
    }
  };

  // Case 1: Section already exists in DOM
  if (sectionEl) {
    waitForSection();
  } else if (sectionSelector) {
    // Case 2: Wait for section to appear in DOM
    const domObs = new MutationObserver(() => {
      sectionEl = document.querySelector(sectionSelector);
      if (sectionEl) {
        domObs.disconnect();
        waitForSection();
      }
    });
    domObs.observe(document.body, { childList: true, subtree: true });
  }
}

/**
 * Waits until a section's data-section-status becomes "loaded"
 * @param {HTMLElement} section
 * @returns {Promise<void>}
 */
export function waitForSectionLoad(section) {
  return new Promise((resolve) => {
    if (section.dataset.sectionStatus === 'loaded') {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (section.dataset.sectionStatus === 'loaded') {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(section, { attributes: true, attributeFilter: ['data-section-status'] });
  });
}

/**
 * Scroll smoothly to a section
 */
const SCROLL_OFFSET = -100;
export async function scrollToSection(section, offset = SCROLL_OFFSET) {
  if (!section) return;
  await waitForSectionLoad(section);

  const intervalId = setInterval(() => {
    if (section.getAttribute('data-section-status') === 'loaded') {
      setTimeout(() => {
        const rect = section.getBoundingClientRect();
        const y = rect.top + window.scrollY + offset;

        window.scrollTo({ top: y, behavior: 'smooth' });
        clearInterval(intervalId);
      }, 1000);
    }
  }, 100);
}

/* check if css var is dark or light */
export function isCssVarDark(bgColor) {
  let color = bgColor;

  if (color.includes('gradient')) {
    const match = color.match(/(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|rgb\([^)]+\))/);
    color = match ? match[1] : '#ffffff';
  }

  let r = 255;
  let g = 255;
  let b = 255;
  let opacity = 1;

  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((char) => char + char).join('');
    }

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const parts = color.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      [r, g, b] = parts.slice(0, 3).map(Number);
      opacity = parts.length === 4 ? parseFloat(parts[3]) : 1;
      const opacityMatch = color.match(/\/\s*([\d.]+)%/);
      if (opacityMatch) {
        opacity = parseFloat(opacityMatch[1]) / 100;
      }
    }
  }

  if (opacity < 0.5) return false;

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

export function applyAdaptiveTextColor(el, bgVar) {
  el.style.color = isCssVarDark(bgVar) ? 'var(--color-white)' : 'var(--color-black)';
}
