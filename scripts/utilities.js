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
  const tabSection = main.querySelector(`div.section[aria-labelledby="${tabId}"]`);
  const isAlreadyActive = tabLink.getAttribute('aria-selected') === 'true'
    && tabSection?.getAttribute('aria-hidden') === 'false';

  if (isAlreadyActive) return;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Deactivate existing tabs and hide their sections
  tabItem.parentNode.querySelectorAll('li[aria-selected="true"]')
    .forEach((tab) => tab.setAttribute('aria-selected', false));
  main.querySelectorAll('div.section.tabs[aria-hidden="false"]')
    .forEach((section) => section.setAttribute('aria-hidden', true));

  // Activate the selected tab
  tabItem.setAttribute('aria-selected', true);
  main.querySelectorAll(`div.section[aria-labelledby="${tabId}"]`)
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
  const tabSection = document.querySelector(`div.section[aria-labelledby="${tabId}"]`);

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
