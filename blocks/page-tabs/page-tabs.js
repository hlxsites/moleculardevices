function openTab(e) {
  const { target } = e;
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
    a.href = `#${section.id}`;
    a.id = section.id;
    a.textContent = section.getAttribute('data-name');
    a.addEventListener('click', openTab);
    li.append(a);
    if (section.id === active) {
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
  const activeHash = window.location.hash;
  const active = activeHash ? activeHash.substring(1, activeHash.length) : 'overview';

  sections.forEach((section) => {
    if (active === section.getAttribute('aria-labelledby')) {
      section.setAttribute('aria-hidden', false);
    } else {
      section.setAttribute('aria-hidden', true);
    }
  });

  block.append(createTabList(namedSections, active));
}
