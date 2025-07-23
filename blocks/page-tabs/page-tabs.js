import { a, li, ul } from '../../scripts/dom-helpers.js';
import { fetchPlaceholders, toCamelCase } from '../../scripts/lib-franklin.js';
import { enableStickyElements } from '../../scripts/scripts.js';
import { coveoResources } from '../resources/resources.js';

const coveoTabName = 'resources';
const coveoHashName = 't=resources&sort=relevancy';

function openTab(target) {
  const parent = target.parentNode;
  const main = parent.closest('main');
  const selected = target.getAttribute('aria-selected') === 'true';

  if (!selected) {
    const openTabs = parent.parentNode.querySelectorAll('li[aria-selected="true"]');
    const openSections = main.querySelectorAll('div.section[aria-hidden="false"]');

    openTabs.forEach((tab) => tab.setAttribute('aria-selected', false));
    openSections.forEach((section) => section.setAttribute('aria-hidden', true));

    parent.setAttribute('aria-selected', true);

    const targetId = target.getAttribute('href').substring(1);
    const targetSections = main.querySelectorAll(`div.section[aria-labelledby="${targetId}"]`);
    targetSections.forEach((section) => section.setAttribute('aria-hidden', false));
  }

  if (new URL(target.href).hash.slice(1) === coveoTabName) coveoResources(target);
}

function scrollToAnchorWhenReady(rawHash) {
  const main = document.querySelector('main');
  if (!rawHash) return;

  const hash = rawHash.startsWith('#') ? rawHash.slice(1).toLowerCase() : rawHash.toLowerCase();
  const tabId = hash.includes(coveoHashName) ? coveoTabName : hash;

  const tryScroll = () => {
    const tabSection = document.querySelector(`.section.tabs[aria-labelledby="${tabId}"][data-section-status="loaded"]`);
    if (!tabSection) return false;

    const tabLink = main.querySelector(`.page-tabs li > a[href="#${tabId}"]`);
    if (tabLink) openTab(tabLink);

    requestAnimationFrame(() => {
      const y = tabSection.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });

    return true;
  };

  if (!tryScroll()) {
    const section = document.querySelector(`.section.tabs[aria-labelledby="${tabId}"]`);
    if (section) {
      const observer = new MutationObserver(() => {
        if (tryScroll()) observer.disconnect();
      });

      observer.observe(section, {
        attributes: true,
        attributeFilter: ['data-section-status'],
      });
    }
  }
}

function handleTabClick(e, sectionName) {
  e.preventDefault();
  const { target } = e;

  openTab(target);
  window.history.pushState(null, '', target.getAttribute('href'));
  scrollToAnchorWhenReady(sectionName);
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
  enableStickyElements();

  if (namedSections) {
    const hash = window.location.hash?.substring(1).toLowerCase();
    let activeTab = hash;

    const found = namedSections.find(
      (s) => s.getAttribute('data-name') === hash || s.getAttribute('aria-labelledby') === hash,
    );

    if (!found) {
      const fallback = document.getElementById(hash);
      activeTab = fallback?.closest('.tabs')?.getAttribute('aria-labelledby') || namedSections[0].getAttribute('data-name');
    }

    sections.forEach((section) => {
      section.setAttribute('aria-hidden', section.getAttribute('aria-labelledby') !== activeTab);
    });

    block.append(await createTabList(namedSections, activeTab));

    if (hash) scrollToAnchorWhenReady(hash);
  }
  const pageTabsBlock = main.querySelector('.page-tabs-wrapper');
  pageTabsBlock.classList.add('sticky-element', 'sticky-desktop');
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash?.substring(1).toLowerCase();
  if (hash) scrollToAnchorWhenReady(hash);
});
