/* eslint-disable import/no-cycle */
import { a, li, ul } from '../../scripts/dom-helpers.js';
import { fetchPlaceholders, toCamelCase } from '../../scripts/lib-franklin.js';
import { scrollToHashTarget, activateTab } from '../../scripts/utilities.js';

function handleTabClick(e, sectionName) {
  e.preventDefault();
  const tabLink = e.currentTarget;

  window.history.replaceState(null, '', tabLink.getAttribute('href'));
  activateTab(tabLink);

  requestAnimationFrame(() => {
    document.querySelector('.page-tabs-container')?.scrollIntoView({ behavior: 'smooth' });
  });

  setTimeout(() => scrollToHashTarget(`#${sectionName}`), 100);
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
            onclick: (e) => handleTabClick(e, sectionName),
          },
          section.title,
        ),
      );
    }),
  );
}

export default async function decorate(block) {
  const main = block.closest('main');
  const sections = main.querySelectorAll('div.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));

  if (namedSections.length) {
    const rawHash = window.location.hash?.substring(1);
    const hashKey = rawHash?.toLowerCase();

    let activeTab = rawHash;

    const matchedSection = namedSections
      .find((s) => s.getAttribute('data-name')?.toLowerCase() === hashKey
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
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToHashTarget(`#${rawHash}`);
        }, 150);
      });
    }
  }

  const pageTabsBlock = main.querySelector('.page-tabs-wrapper');
  if (pageTabsBlock) {
    pageTabsBlock.classList.add('sticky-element', 'sticky-desktop');
  }
}
