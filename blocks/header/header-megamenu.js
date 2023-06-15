import buildRightSubmenu from './header-megamenu-components.js';
import { toClassName, decorateIcons } from '../../scripts/lib-franklin.js';
import buildSearch from './menus/search.js';
import {
  div,
  li,
  a,
  nav,
  ul,
} from '../../scripts/dom-helpers.js';
import {
  reverseElementLinkTagRelation,
  buildBrandLogo,
  buildRequestQuote,
  addCloseMenuButtonListener,
} from './helpers.js';

export function showRightSubmenu(element) {
  document.querySelectorAll('header .right-submenu').forEach((el) => el.setAttribute('aria-expanded', 'false'));
  element.setAttribute('aria-expanded', 'true');
}

function buildContactUs() {
  return li(
    { class: 'menu-expandable' },
    div(
      { class: 'menu-nav-category' },
      a(
        { href: '/contact' },
        'Contact Us',
      ),
    ),
  );
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
    if (title.textContent === 'Contact Us') {
      return;
    }

    // get the h2s in the same parent as title
    const sectionH2s = title.parentElement.querySelectorAll('h2');
    const h2List = ul({ class: 'menu-nav-submenu-sections' });

    // add H2s to list
    sectionH2s.forEach((h2) => {
      const element = reverseElementLinkTagRelation(h2);

      const h2ListItem = li(
        { class: 'menu-nav-submenu-section', 'submenu-id': toClassName(h2.textContent) },
        element,
      );

      if (titlesWithLineDividers.includes(h2.id)) {
        h2List.append(li({ class: 'line-divider' }));
      }

      h2List.append(h2ListItem);
    });

    const menuId = toClassName(title.textContent);
    const submenu = div(
      { class: 'menu-nav-submenu', 'menu-id': menuId },
      div(
        title.cloneNode(true),
        buildRightSubmenu(title, toClassName(title.textContent)),
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
    const menuId = category.getAttribute('menu-id');

    await fetch(`/fragments/megamenu/${menuId}.plain.html`, window.location.pathname.endsWith(`/${menuId}`) ? { cache: 'reload' } : {})
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
            const submenuId = toClassName(h2.textContent);
            const element = reverseElementLinkTagRelation(h2);

            const h2ListItem = document.querySelector(`div[menu-id="${menuId}"] .menu-nav-submenu-sections li[submenu-id="${submenuId}"]`);
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

export function buildNavbar(content) {
  // link section
  const navMenuUl = ul({ class: 'nav-tabs' });

  [...content.querySelectorAll('h1')].forEach((menu) => {
    const text = menu.querySelector('a').textContent;
    const item = li(
      { class: 'menu-expandable', 'aria-expanded': 'false' },
      div(
        { class: 'menu-nav-category', 'menu-id': toClassName(text) },
        text,
      ),
    );
    navMenuUl.append(item);
  });

  navMenuUl.append(buildContactUs());
  navMenuUl.append(buildSearch(content));
  navMenuUl.append(buildRequestQuote('header-rfq'));

  const megaMenu = div(
    { class: 'mainmenu-wrapper sticky-element sticky-desktop' },
    div(
      { class: 'container' },
      buildBrandLogo(content),
      nav(
        { id: 'nav' },
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
