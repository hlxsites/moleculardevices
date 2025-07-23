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

export function openTab(tabLink) {
  if (!tabLink) return;

  const tabItem = tabLink.parentNode;
  if (!tabItem || !tabItem.closest) return;
  const main = tabItem.closest('main');

  console.log(tabItem);

  const tabId = tabLink.getAttribute('href').substring(1);
  const isSelected = tabLink.getAttribute('aria-selected') === 'true';
  const tabSection = main.querySelector(`div.section[aria-labelledby="${tabId}"]`);
  main.querySelectorAll(`div.section[aria-labelledby="${tabId}"]`);

  console.log('Trying to open tab:', tabId);
  console.log('Found tab section:', tabSection);

  if (isSelected && tabSection?.getAttribute('aria-hidden') === 'false') return;

  // Reset other tabs
  tabItem.parentNode.querySelectorAll('li[aria-selected="true"]')
    .forEach((tab) => tab.setAttribute('aria-selected', false));
  main.querySelectorAll('div.section.tabs[aria-hidden="false"]')
    .forEach((section) => section.setAttribute('aria-hidden', true));

  // Activate new tab
  tabItem.setAttribute('aria-selected', true);
  main.querySelectorAll(`div.section[aria-labelledby="${tabId}"]`)
    .forEach((section) => section.setAttribute('aria-hidden', false));

  if (tabId === COVEO_TAB_NAME) {
    coveoResources(tabLink);
  }

  console.log('openTab called for:', tabId);
}

export function goToTabSection(tabId, scrollTargetSelector = '.page-tabs-container') {
  const tabLink = document.querySelector(`.page-tabs li > a[href="#${tabId}"]`);
  const scrollTarget = document.querySelector(scrollTargetSelector);

  if (tabLink) {
    openTab(tabLink);
    requestAnimationFrame(() => {
      scrollTarget?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

export function getScrollOffset() {
  const rootStyles = getComputedStyle(document.documentElement);
  const stackedHeight = parseInt(rootStyles.getPropertyValue('--stacked-height'), 10);
  return Number.isNaN(stackedHeight) ? 0 : stackedHeight;
}

export function scrollToElement(target) {
  if (!target) return;
  requestAnimationFrame(() => {
    const offset = getScrollOffset();
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
}

export function scrollToHashTarget(rawHash, callback, retries = 20, delay = 300) {
  const main = document.querySelector('main');
  if (!rawHash || !main) return;

  let attempts = 0;
  const hash = rawHash.startsWith('#') ? rawHash.slice(1).toLowerCase() : rawHash.toLowerCase();

  const isCoveo = hash.includes(COVEO_HASH_NAME);
  const tabId = isCoveo ? COVEO_TAB_NAME : hash;

  const tabLink = document.querySelector(`.page-tabs li > a[href="#${tabId}"]`);

  if (tabLink && document.querySelector(`div.section[aria-labelledby="${tabId}"]`)) {
    goToTabSection(tabId);
    return;
  }

  const fallbackTarget = document.getElementById(hash);
  const containingTab = fallbackTarget?.closest('.section.tabs[aria-labelledby]');
  if (containingTab) {
    const parentTabId = containingTab.getAttribute('aria-labelledby');
    if (parentTabId) goToTabSection(parentTabId);
  }

  const tryScroll = () => {
    const scrollTarget = document.getElementById(hash);
    if (!scrollTarget || !isElementVisible(scrollTarget)) {
      if (import.meta.env?.DEV) console.warn('Scroll target not visible yet:', scrollTarget);
      return false;
    }

    if (isFunction(callback)) callback(scrollTarget);
    scrollToElement(scrollTarget);
    return true;
  };

  if (!tryScroll()) {
    const interval = setInterval(() => {
      attempts += 1;
      if (tryScroll() || attempts >= retries) clearInterval(interval);
    }, delay);
  }
}
