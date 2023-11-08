import {
  div, li, ul,
} from '../../scripts/dom-helpers.js';
import { processEmbedFragment } from '../../scripts/scripts.js';

const classActive = 'active';

function handleTabClick(e, idx) {
  e.preventDefault();
  const { target } = e;
  [...target.closest('.tabs-nav').children].forEach((nav) => nav.classList.remove(classActive));
  target.closest('.tabs-nav-item').classList.add(classActive);
  const panes = target.closest('.tabs-horizontal').querySelectorAll('.tab-pane');
  [...panes].forEach((pane) => pane.classList.remove(classActive));
  panes[idx].classList.add(classActive);
}

function redirectedNav() {
  const hashUrl = window.location.hash.split('#')[1];
  setTimeout(() => {
    const tab = document.getElementById(hashUrl);
    const tabSection = tab.closest('.section');
    tab.click();
    window.scroll({
      top: tabSection.getBoundingClientRect().top + window.screenY - 150,
      behavior: 'smooth'
    });
  }, 1000);
}

function buildNav(block) {
  const titles = block.querySelectorAll('.tabs-horizontal > div > div:first-child');
  const elemWidth = Math.floor(100 / titles.length);
  const navList = ul({ class: 'tabs-nav' });
  [...titles].forEach((title, idx) => {
    const tabTitle = title.textContent;
    const listItem = li(
      {
        class: 'tabs-nav-item',
        id: tabTitle.toLowerCase().split(' ').join('-'),
        style: `width: ${elemWidth}%;`,
        onclick: (e) => { handleTabClick(e, idx); },
        'aria-label': tabTitle,
      },
      div(tabTitle),
    );
    navList.append(listItem);
  });
  navList.querySelector('li').classList.add(classActive);
  return navList;
}

async function buildTabs(block) {
  const tabPanes = block.querySelectorAll('.tabs-horizontal > div > div:last-child');
  const tabList = div({ class: 'tabs-list' });
  const decoratedPanes = await Promise.all([...tabPanes].map(async (pane) => {
    pane.classList.add('tab-pane');
    const decoratedPane = await processEmbedFragment(pane);
    return decoratedPane;
  }));
  decoratedPanes.forEach((pane) => { tabList.append(pane); });
  tabList.querySelector('.tab-pane').classList.add(classActive);
  return tabList;
}

export default async function decorate(block) {
  const nav = buildNav(block);
  const tabs = await buildTabs(block);
  block.innerHTML = '';

  block.append(nav);
  block.append(tabs);
  redirectedNav();
  return block;
}
