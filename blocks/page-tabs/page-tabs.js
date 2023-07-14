import { li, a, ul } from '../../scripts/dom-helpers.js';

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
    const tabs = main.querySelectorAll(`div.section[aria-labelledby="${target.id}"]`);
    tabs.forEach((tab) => tab.setAttribute('aria-hidden', false));
  }
}

function createTabList(block, namedSections, active) {
  let list = block.querySelector('ul');
  if (!list) {
    block.append(list = ul());
  }

  // decorate links coming from the word document
  block.querySelectorAll('li > a').forEach((tabLink) => {
    if (!tabLink.getAttribute('href') || !tabLink.getAttribute('href').startsWith('#')) {
      return;
    }

    const name = tabLink.getAttribute('href').substring(1);
    tabLink.id = name;
    tabLink.parentElement.setAttribute('aria-selected', name === active);
    tabLink.addEventListener('click', (e) => {
      openTab(e.target);
    });
  });

  // best effort - if there are named sections which are in the document, but not in the list
  // add them to the tab list, even if they are will not be translated
  if (!namedSections || namedSections.length === 0) {
    return;
  }

  namedSections.forEach((section) => {
    const sectionName = section.getAttribute('data-name');

    // tab already exists in the word document
    if (block.querySelector(`li a[href="#${sectionName}"`)) {
      return;
    }

    list.append(
      li({ 'aria-selected': sectionName === active },
        a({
          id: sectionName,
          href: `#${sectionName}`,
          onclick: (e) => { openTab(e.target); },
        },
        section.title),
      ),
    );
  });
}

export default function decorate(block) {
  const main = block.closest('main');
  const sections = main.querySelectorAll('div.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));

  if (namedSections) {
    const activeHash = window.location.hash;
    const active = activeHash
      ? activeHash.substring(1, activeHash.length).toLocaleLowerCase()
      : namedSections[0].getAttribute('data-name');

    sections.forEach((section) => {
      if (active === section.getAttribute('aria-labelledby')) {
        section.setAttribute('aria-hidden', false);
      } else {
        section.setAttribute('aria-hidden', true);
      }
    });

    createTabList(block, namedSections, active);
  }

  window.addEventListener('hashchange', () => {
    let activeHash = window.location.hash;
    activeHash = activeHash ? activeHash.substring(1) : namedSections[0].getAttribute('data-name');
    if (!activeHash) return;

    const targetTab = block.querySelector(`a[href="#${activeHash}"]`);
    if (!targetTab) return;

    openTab(targetTab);

    // scroll conent into view
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
