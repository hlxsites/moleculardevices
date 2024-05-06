/* eslint-disable linebreak-style */
import buildRightSubmenu from './header-megamenu-components.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import buildSearch from './menus/search.js';
import {
  div, li, nav, ul,
} from '../../scripts/dom-helpers.js';
import {
  reverseElementLinkTagRelation,
  buildBrandLogo,
  buildRequestQuote,
  addCloseMenuButtonListener,
} from './helpers.js';
import { processSectionMetadata } from '../../scripts/scripts.js';

export function showRightSubmenu(element) {
  document.querySelectorAll('header .right-submenu').forEach((el) => el.setAttribute('aria-expanded', 'false'));
  element.setAttribute('aria-expanded', 'true');
}

function menuHasNoDropdown(menu) {
  if (menu.getAttribute('menu-dropdown') === 'false') {
    return true;
  }

  return false;
}

function getTitlesWithLineDividers(content) {
  const titleIds = [];
  const lineDividers = content.querySelectorAll('p');
  lineDividers.forEach((lineDivider) => {
    if (!lineDivider.textContent.includes('--')) {
      return;
    }

    // get the h2 id immediately after the p element
    const h2Id = lineDivider.nextElementSibling.id;
    titleIds.push(h2Id);
  });

  return titleIds;
}

function buildMegaMenu(block, content) {
  const titles = content.querySelectorAll('h1');
  const titlesWithLineDividers = getTitlesWithLineDividers(content);

  // for each title get the h2s in the same section
  titles.forEach((title) => {
    const menuId = title.getAttribute('id');

    const dropdownElement = block.querySelector(`.menu-nav-category[menu-id="${menuId}"]`);
    if (menuHasNoDropdown(dropdownElement)) {
      return;
    }

    // get the h2s in the same parent as title
    const sectionH2s = title.parentElement.querySelectorAll('h2');
    const h2List = ul({ class: 'menu-nav-submenu-sections' });

    // add H2s to list
    sectionH2s.forEach((h2) => {
      const sectionId = h2.id;
      const element = reverseElementLinkTagRelation(h2);

      const h2ListItem = li(
        { class: 'menu-nav-submenu-section', 'submenu-id': sectionId },
        element,
      );

      if (titlesWithLineDividers.includes(sectionId)) {
        h2List.append(li({ class: 'line-divider' }));
      }

      h2List.append(h2ListItem);
    });

    const submenu = div(
      { class: 'menu-nav-submenu', 'menu-id': menuId },
      div(
        title.cloneNode(true),
        buildRightSubmenu(title, menuId),
        h2List,
      ),
    );

    const backgroundImg = content.querySelector('.submenu-background img');
    submenu.style.backgroundImage = `url(${backgroundImg.src})`;

    // Get the list item in the header block that contains a div with attribute menu-id
    // that matches the menuId
    const item = block.querySelector(`div[menu-id="${menuId}"]`).closest('li');

    const closeButton = div({ class: 'menu-nav-submenu-close' });

    submenu.querySelectorAll('.menu-nav-submenu h1').forEach((el) => {
      el.addEventListener('mouseover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rightMenu = e.currentTarget.parentElement.querySelector('.right-submenu');
        showRightSubmenu(rightMenu);
      });
    });

    addCloseMenuButtonListener(closeButton);

    item.append(closeButton);
    item.append(submenu);
  });
}

export async function buildLazyMegaMenus() {
  const categories = document.querySelectorAll('.menu-nav-category');

  // for each category, get the menu-id attribute
  categories.forEach(async (category) => {
    if (menuHasNoDropdown(category)) {
      return;
    }

    const menuId = category.getAttribute('menu-id');

    // replace -- by - in menuId
    const menuIdClean = menuId.replace('--', '-');

    await fetch(`/fragments/megamenu/${menuIdClean}.plain.html`, window.location.pathname.endsWith(`/${menuIdClean}`) ? { cache: 'reload' } : {})
      .then(async (submenuResponse) => {
        if (submenuResponse.ok) {
          // eslint-disable-next-line no-await-in-loop
          const submenuHtml = await submenuResponse.text();

          const submenuContent = div();
          submenuContent.innerHTML = submenuHtml;

          // get all H2s and create a list of them
          const h2s = [...submenuContent.querySelectorAll('h2')];
          const h2List = document.querySelector(`div[menu-id="${menuId}"] .menu-nav-submenu-sections`);

          // add H2s to list
          h2s.forEach((h2) => {
            const submenuId = h2.id;
            const element = reverseElementLinkTagRelation(h2);

            const h2ListItem = document.querySelector(`div[menu-id="${menuId}"] .menu-nav-submenu-sections li[submenu-id*="${submenuId}"]`);
            h2ListItem.appendChild(buildRightSubmenu(element, submenuId));
          });

          h2List.querySelectorAll('.menu-nav-submenu-section').forEach((el) => {
            el.addEventListener('mouseover', (e) => {
              e.preventDefault();
              e.stopPropagation();
              const rightMenu = e.currentTarget.querySelector('.right-submenu');
              showRightSubmenu(rightMenu);
            });
          });
        }
      });
  });

  const body = document.querySelector('body');
  body.setAttribute('built-lazy-megamenus', 'true');
}

export async function buildNavbar(content, hideSearch, hideGlobalRFQ) {
  // link section
  const navMenuUl = ul({ class: 'nav-tabs' });

  [...content.querySelectorAll('h1')].forEach((menu) => {
    const id = menu.getAttribute('id');
    const menuLink = menu.querySelector('a');

    let category = div(
      { class: 'menu-nav-category', 'menu-id': id },
      menuLink.textContent,
    );

    processSectionMetadata(menu.parentElement);
    const dropdownFlag = menu.parentElement.getAttribute('data-dropdown');
    if (dropdownFlag === 'False' || dropdownFlag === 'false') {
      category = div(
        { class: 'menu-nav-category', 'menu-id': id, 'menu-dropdown': 'false' },
        menuLink.cloneNode(true),
      );
    }

    const item = li(
      { class: 'menu-expandable', 'aria-expanded': 'false' },
      category,
    );
    navMenuUl.append(item);
  });

  if (!hideSearch) {
    navMenuUl.append(buildSearch(content));
  }
  if (!hideGlobalRFQ) {
    navMenuUl.append(buildRequestQuote('header-rfq'));
  }

  const megaMenu = div(
    { class: 'mainmenu-wrapper sticky-element sticky-desktop' },
    div(
      { class: 'container' },
      await buildBrandLogo(content),
      nav(
        {
          id: 'nav',
        },
        div(
          { class: 'nav-menu' },
          navMenuUl,
        ),
      ),
    ),
  );

  decorateIcons(megaMenu);

  // Get submenu builder, and build submenu
  buildMegaMenu(navMenuUl, content);
  return megaMenu;
}
