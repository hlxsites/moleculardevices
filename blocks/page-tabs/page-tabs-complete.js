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

function createTabList(sections, active) {
  const ul = document.createElement('ul');
  sections.forEach((section) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${section.getAttribute('data-name')}`;
    a.id = section.getAttribute('data-name');
    a.textContent = section.title;
    a.addEventListener('click', (e) => {
      openTab(e.target);
    });
    // a.addEventListener('click', openTab);
    li.append(a);
    if (section.getAttribute('data-name') === active) {
      li.setAttribute('aria-selected', true);
    } else {
      li.setAttribute('aria-selected', false);
    }
    ul.append(li);
  });
  return ul;
}

export default function decorate(block) {
  const main = block.closest('main');
  const sections = main.querySelectorAll('div.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));
  if (namedSections) {
    const activeHash = window.location.hash;
    const active = activeHash ? activeHash.substring(1, activeHash.length) : namedSections[0].getAttribute('data-name');

    sections.forEach((section) => {
      if (active === section.getAttribute('aria-labelledby')) {
        section.setAttribute('aria-hidden', false);
      } else {
        section.setAttribute('aria-hidden', true);
      }
    });

    block.append(createTabList(namedSections, active));
  }
  const heroAnchor = main.querySelector('.hero-inner a[href*="#"]');
  if (heroAnchor) {
    const anchorId = heroAnchor.href.slice(anchor.href.indexOf('#') + 1);
    const heroAnchorTab = document.querySelector(`.page-tabs a[href="#${anchorId}"]`);
    if (heroAnchorTab) {
      heroAnchorTab.addEventListener('click', openTab(heroAnchorTab));
    }
  }

  const pageTabsBlock = main.querySelector('.page-tabs-wrapper');
  pageTabsBlock.classList.add('sticky-element', 'sticky-desktop');
}
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

function createTabList(sections, active) {
  const ul = document.createElement('ul');
  sections.forEach((section) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${section.getAttribute('data-name')}`;
    a.id = section.getAttribute('data-name');
    a.textContent = section.title;
    a.addEventListener('click', (e) => {
      openTab(e.target);
    });
    // a.addEventListener('click', openTab);
    li.append(a);
    if (section.getAttribute('data-name') === active) {
      li.setAttribute('aria-selected', true);
    } else {
      li.setAttribute('aria-selected', false);
    }
    ul.append(li);
  });
  return ul;
}

export default function decorate(block) {
  const main = block.closest('main');
  const sections = main.querySelectorAll('div.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));
  if (namedSections) {
    const activeHash = window.location.hash;
    const active = activeHash ? activeHash.substring(1, activeHash.length) : namedSections[0].getAttribute('data-name');

    sections.forEach((section) => {
      if (active === section.getAttribute('aria-labelledby')) {
        section.setAttribute('aria-hidden', false);
      } else {
        section.setAttribute('aria-hidden', true);
      }
    });

    block.append(createTabList(namedSections, active));
  }
  const heroAnchor = main.querySelector('.hero-inner a[href*="#"]');
  if (heroAnchor) {
    const anchorId = heroAnchor.href.slice(anchor.href.indexOf('#') + 1);
    const heroAnchorTab = document.querySelector(`.page-tabs a[href="#${anchorId}"]`);
    if (heroAnchorTab) {
      heroAnchorTab.addEventListener('click', openTab(heroAnchorTab));
    }
  }

  const pageTabsBlock = main.querySelector('.page-tabs-wrapper');
  pageTabsBlock.classList.add('sticky-element', 'sticky-desktop');
}
