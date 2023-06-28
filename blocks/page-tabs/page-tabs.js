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

function findIdTabName(id, block) {
  if (!id) return null;

  const targetTab = block.querySelector(`a[href="#${id}"]`);
  if (targetTab) {
    return id;
  }

  const element = document.getElementById(id);
  if (!element) {
    return null;
  }
  const tab = element.closest('.tabs');
  return tab.getAttribute('aria-labelledby');
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

    const tabName = findIdTabName(active, block);
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

    block.append(createTabList(namedSections, active));

    if (tabName !== active) {
      setTimeout(() => {
        const element = document.getElementById(active);
        if (element) {
          element.scrollIntoView();
        }
      }, 1000);
    }
  }

  window.addEventListener('hashchange', () => {
    const rawActiveHash = window.location.hash;
    const activeHash = rawActiveHash ? rawActiveHash.substring(1) : namedSections[0].getAttribute('data-name');
    if (!activeHash) return;

    const targetTabName = findIdTabName(activeHash, block);

    let targetTab = block.querySelector(`a[href="#${targetTabName}"]`);
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
    if (!targetTab) {
      console.log('not matching tab, hash:', rawActiveHash);
      const hashElement = document.querySelector(rawActiveHash);
      const tab = hashElement.closest('.tabs');
      console.log('not matching tab, tab:', tab, hashElement);
      const tabName = tab.getAttribute('aria-labelledby');
      targetTab = block.querySelector(`a[href="#${tabName}"]`);
      console.log('not matching tab name', tabName, targetTab);

      openTab(targetTab);
      setTimeout(() => {
        hashElement.scrollIntoView();
      }, 1000);

      return;
    }


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
