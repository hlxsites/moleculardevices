// eslint-disable-next-line import/no-cycle
import buildRightSubmenu from './header-megamenu-components.js';
import { decorateIcons, geoFriendlyClassName, toClassName } from '../../scripts/lib-franklin.js';
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
  if (menu.getAttribute('menu-dropdown') === 'false') return true;
  return false;
}

function buildMegaMenu(block, content) {
  const titles = content.querySelectorAll('div > div > p:first-child:has(a[href])');
  titles.forEach((title) => {
    const menuId = toClassName(title.querySelector('a').textContent);
    title.id = menuId;
    title.classList.add('menu-nav-heading');

    const dropdownElement = block.querySelector(`.menu-nav-category[menu-id="${menuId}"]`);
    if (menuHasNoDropdown(dropdownElement)) return;

    const sectionListItems = title.parentElement.querySelectorAll('ul > li');
    const listItemList = ul({ class: 'menu-nav-submenu-sections' });

    sectionListItems.forEach((listItem) => {
      if (listItem.textContent === '--') {
        listItemList.append(li({ class: 'line-divider' }));
      } else {
        const sectionId = toClassName(listItem.textContent);
        const element = reverseElementLinkTagRelation(listItem);
        listItem.id = sectionId;

        const listItemListItem = li(
          { class: 'menu-nav-submenu-section', 'submenu-id': sectionId },
          element,
        );
        listItemList.append(listItemListItem);
      }
    });

    const submenu = div(
      { class: 'menu-nav-submenu', 'menu-id': menuId },
      div(
        title.cloneNode(true),
        buildRightSubmenu(title, menuId),
        listItemList,
      ),
    );

    const backgroundImg = content.querySelector('.submenu-background img');
    submenu.style.backgroundImage = `url(${backgroundImg.src})`;

    // Get the list item in the header block that contains a div with attribute menu-id
    // that matches the menuId
    const item = block.querySelector(`div[menu-id="${menuId}"]`).closest('li');

    const closeButton = div({ class: 'menu-nav-submenu-close' });

    submenu.querySelectorAll('.menu-nav-submenu .menu-nav-heading').forEach((el) => {
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
          const submenuHtml = await submenuResponse.text();

          const submenuContent = div();
          submenuContent.innerHTML = submenuHtml;
          const menuHeadings = [...submenuContent.querySelectorAll('div > p:first-child')];
          const menuHeadingList = document.querySelector(`div[menu-id="${menuId}"] .menu-nav-submenu-sections`);

          menuHeadings.forEach((menuHeading) => {
            const submenuId = toClassName(menuHeading.textContent);
            const element = reverseElementLinkTagRelation(menuHeading);

            const menuHeadingSubHeading = document.querySelector(`div[menu-id="${menuId}"] .menu-nav-submenu-sections li[submenu-id*="${submenuId}"]`);
            if (menuHeadingSubHeading) {
              menuHeadingSubHeading.appendChild(buildRightSubmenu(element, submenuId));
            }
          });

          menuHeadingList.querySelectorAll('.menu-nav-submenu-section').forEach((el) => {
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
  const navMenuUl = ul({ class: 'nav-tabs' });
  const menuHeadings = content.querySelectorAll('div > div > p:first-child:has(a[href])');

  menuHeadings.forEach((heading) => {
    const headingLink = heading.querySelector('a');
    const headText = headingLink.textContent;
    const id = geoFriendlyClassName(headText);

    let category = div({ class: 'menu-nav-category', 'menu-id': id }, headText);

    processSectionMetadata(heading.parentElement);
    const dropdownFlag = heading.parentElement.getAttribute('data-dropdown');
    if (dropdownFlag === 'False' || dropdownFlag === 'false') {
      category = div({ class: 'menu-nav-category', 'menu-id': id, 'menu-dropdown': 'false' },
        headingLink.cloneNode(true),
      );
    }

    const item = li({ class: 'menu-expandable', 'aria-expanded': 'false' }, category);
    navMenuUl.append(item);
  });

  if (!hideSearch) navMenuUl.append(buildSearch(content));
  if (!hideGlobalRFQ) navMenuUl.append(buildRequestQuote('header-rfq'));

  const megaMenu = div({ class: 'mainmenu-wrapper sticky-element sticky-desktop' },
    div({ class: 'container' },
      await buildBrandLogo(content),
      nav({ id: 'nav' }, div({ class: 'nav-menu' }, navMenuUl),
      ),
    ),
  );

  decorateIcons(megaMenu);
  buildMegaMenu(navMenuUl, content);
  return megaMenu;
}
