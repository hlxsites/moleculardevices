/* eslint-disable import/no-cycle */
import { a, li, ul } from '../../scripts/dom-helpers.js';
import { fetchPlaceholders, toCamelCase } from '../../scripts/lib-franklin.js';
import { activateTab, scrollToHashTarget, scrollToWithOffset } from '../../scripts/utilities.js';

const TAB_SCROLL_OFFSET = 50;

function resetNativeHashScroll() {
  if (window.location.hash) {
    window.scrollTo(0, 0);
  }
}

function scrollToTabsContainer() {
  const target = document.querySelector('.page-tabs-container');
  if (!target) return;

  scrollToWithOffset(target, TAB_SCROLL_OFFSET);
}

function handleTabClick(e) {
  e.preventDefault();
  const tabLink = e.currentTarget;

  window.history.replaceState(null, '', tabLink.getAttribute('href'));
  activateTab(tabLink);
  requestAnimationFrame(scrollToTabsContainer);
}

async function createTabList(sections, active) {
  const placeholders = await fetchPlaceholders();

  return ul(
    ...sections.map((section) => {
      const sectionName = section.getAttribute('data-name');
      section.title = placeholders[toCamelCase(sectionName)] || section.title;

      return li(
        { 'aria-selected': sectionName === active },
        a(
          {
            href: `#${sectionName}`,
            onclick: handleTabClick,
          },
          section.title,
        ),
      );
    }),
  );
}

export default async function decorate(block) {
  const main = block.closest('main');

  const pageTabsBlock = main.querySelector('.page-tabs-wrapper');
  if (pageTabsBlock) {
    pageTabsBlock.classList.add('sticky-element', 'sticky-desktop');
  }

  resetNativeHashScroll();

  const sections = main.querySelectorAll('.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));
  if (!namedSections.length) return;

  const rawHash = window.location.hash?.substring(1);
  const hashKey = rawHash?.toLowerCase();

  let activeTab = rawHash;

  const matchedSection = namedSections.find(
    (s) => s.getAttribute('data-name')?.toLowerCase() === hashKey
      || s.getAttribute('aria-labelledby')?.toLowerCase() === hashKey,
  );

  if (!matchedSection) {
    let fallbackTabId = namedSections[0].getAttribute('data-name');
    const fallbackEl = document.getElementById(rawHash);
    if (fallbackEl) {
      const parentTabs = fallbackEl.closest('.tabs');
      if (parentTabs?.hasAttribute('aria-labelledby')) {
        fallbackTabId = parentTabs.getAttribute('aria-labelledby');
      }
    }
    activeTab = fallbackTabId;
  }

  sections.forEach((section) => {
    const isActive = section.getAttribute('aria-labelledby') === activeTab;
    section.setAttribute('aria-hidden', !isActive);
  });

  const tabList = await createTabList(namedSections, activeTab);
  block.append(tabList);

  if (rawHash) {
    requestAnimationFrame(() => scrollToHashTarget(rawHash));
  }
}
