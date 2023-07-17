import { li, ul, a } from '../../scripts/dom-helpers.js';
import { fetchPlaceholders, toCamelCase } from '../../scripts/lib-franklin.js';

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
          },
          section.title,
          ),
        )
      );
    }),
  );
}

function findIdTabName(id) {
  if (!id) {
    return null;
  }

  const targetTab = document.querySelector(`a[href="#${id}"]`);
  if (!targetTab) {
    return id;
  }

  const element = document.getElementById(id);
  if (!element) {
    return id;
  }
  const tab = element.closest('.tabs');
  return tab.getAttribute('aria-labelledby');
}

export default async function decorate(block) {
  const main = block.closest('main');
  const sections = main.querySelectorAll('div.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));
  if (namedSections) {
    const activeHash = window.location.hash;
    const active = activeHash
      ? activeHash.substring(1, activeHash.length).toLocaleLowerCase()
      : namedSections[0].getAttribute('data-name');

    const tabName = findIdTabName(active);
    let foundSection = false;
    sections.forEach((section) => {
      if (tabName === section.getAttribute('aria-labelledby')) {
        foundSection = true;
        section.setAttribute('aria-hidden', false);
      } else {
        section.setAttribute('aria-hidden', true);
      }
    });
    if (!foundSection) {
      sections[0].setAttribute('aria-hidden', false);
    }

    block.append(await createTabList(namedSections, active));

    if (tabName !== active) {
      setTimeout(() => {
        const element = document.getElementById(active);
        if (element) {
          element.scrollIntoView();
        }
      }, 5000);
    }
  }

  window.addEventListener('hashchange', () => {
    const rawActiveHash = window.location.hash;
    const activeHash = rawActiveHash ? rawActiveHash.substring(1) : namedSections[0].getAttribute('data-name');
    if (!activeHash) return;

    const targetTabName = findIdTabName(activeHash);

    const targetTab = block.querySelector(`a[href="#${targetTabName}"]`);
    if (!targetTab) {
      return;
    }
    openTab(targetTab);

    if (targetTabName !== activeHash) {
      setTimeout(() => {
        document.getElementById(activeHash).scrollIntoView();
      }, 1000);

      return;
    }

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
