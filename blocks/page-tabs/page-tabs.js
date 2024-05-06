import { a, li, ul } from '../../scripts/dom-helpers.js';
import { fetchPlaceholders, toCamelCase } from '../../scripts/lib-franklin.js';
import { coveoResources } from '../resources/resources.js';

function openTab(target) {
  const parent = target.parentNode;
  const main = parent.closest('main');
  const selected = target.getAttribute('aria-selected') === 'true';
  if (!selected) {
    // close all open tabs
    const openPageNav = parent.parentNode.querySelectorAll('li[aria-selected="true"]');
    const openContent = main.querySelectorAll('div.section[aria-hidden="false"]');
    openPageNav.forEach((tab) => tab.setAttribute('aria-selected', false));
    openContent.forEach((tab) => tab.setAttribute('aria-hidden', true));
    // open clicked tab
    parent.setAttribute('aria-selected', true);
    const tabs = main.querySelectorAll(`div.section[aria-labelledby="${target.getAttribute('href').substring(1)}"]`);
    tabs.forEach((tab) => tab.setAttribute('aria-hidden', false));
  }

  /* COVEO RESOURCES */
  coveoResources(target);
}

async function createTabList(sections, active) {
  const placeholders = await fetchPlaceholders();

  return ul(
    ...sections.map((section) => {
      const sectionName = section.getAttribute('data-name');
      // use placeholders if we have them, to make translations work, otherwise best effort
      section.title = placeholders[toCamelCase(sectionName)] || section.title;

      return (
        li({ 'aria-selected': sectionName === active },
          a({
            href: `#${sectionName}`,
            onclick: (e) => { openTab(e.target); },
          }, section.title),
        )
      );
    }),
  );
}

export default async function decorate(block) {
  const main = block.closest('main');
  const sections = main.querySelectorAll('div.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));
  if (namedSections) {
    const activeHash = window.location.hash;
    const id = activeHash.substring(1, activeHash.length).toLocaleLowerCase();

    const tabExists = namedSections.some((section) => section.getAttribute('data-name') === id);
    let activeTab = id;
    if (!tabExists) {
      const element = document.getElementById(id);
      if (element) {
        activeTab = element.closest('.tabs')?.getAttribute('aria-labelledby');
        setTimeout(() => {
          element.scrollIntoView();
        }, 5000);
      } else {
        activeTab = namedSections[0].getAttribute('data-name');
      }
    }

    sections.forEach((section) => {
      if (activeTab === section.getAttribute('aria-labelledby')) {
        section.setAttribute('aria-hidden', false);
      } else {
        section.setAttribute('aria-hidden', true);
      }
    });

    block.append(await createTabList(namedSections, activeTab));
  }

  window.addEventListener('hashchange', () => {
    let activeHash = window.location.hash;
    activeHash = activeHash ? activeHash.substring(1) : namedSections[0].getAttribute('data-name');
    if (!activeHash) return;

    const element = document.getElementById(activeHash);
    const tab = element?.closest('.tabs');
    if (tab) {
      const targetTabName = tab.getAttribute('aria-labelledby');
      const targetTab = block.querySelector(`a[href="#${targetTabName}"]`);
      if (!targetTab) return;
      openTab(targetTab);
      document.getElementById(activeHash).scrollIntoView();
    }

    const targetTab = block.querySelector(`a[href="#${activeHash}"]`);
    if (!targetTab) return;

    openTab(targetTab);

    // scroll content into view
    const firstVisibleSection = main.querySelector(`div.section[aria-labelledby="${activeHash}"]`);
    if (!firstVisibleSection) return;

    window.scrollTo({
      left: 0,
      top: firstVisibleSection.offsetTop - 10,
      behavior: 'smooth',
    });
  });

  const pageTabsBlock = main.querySelector('.page-tabs-wrapper');
  pageTabsBlock.classList.add('sticky-element', 'sticky-desktop');
}
