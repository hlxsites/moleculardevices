import { a, li, ul } from '../../scripts/dom-helpers.js';
import { fetchPlaceholders, toCamelCase } from '../../scripts/lib-franklin.js';
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

function scrollToAnchorWhenReady(id, retries = 20, delay = 300) {
  let attempts = 0;
  let sectionID = id;
  sectionID = sectionID.includes(coveoHashName) ? coveoTabName : id;

  const tryScroll = () => {
    const target = document.querySelector(`.section.tabs[aria-labelledby="${sectionID}"][data-section-status="loaded"]`);
    if (target) {
      const tabLink = document.querySelector(`.page-tabs a[href="#${sectionID}"]`);
      if (tabLink) openTab(tabLink);

      requestAnimationFrame(() => {
        const y = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
      return true;
    }
    return false;
  };

  if (!tryScroll()) {
    const interval = setInterval(() => {
      attempts += 1;
      if (tryScroll() || attempts >= retries) {
        clearInterval(interval);
      }
    }, delay);
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
  if (block.parentElement.classList.contains('page-tabs-wrapper')) {
    block.parentElement.classList.add('sticky-element', 'sticky-desktop');
  }

  const main = block.closest('main');
  const sections = [...main.querySelectorAll('div.section.tabs')];
  const namedSections = sections.filter((section) => section.hasAttribute('data-name'));
  if (!namedSections.length) return;

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

window.addEventListener('load', () => {
  const hash = window.location.hash?.substring(1);
  if (hash) {
    setTimeout(scrollToAnchorWhenReady(hash), 1500);
  }
});
