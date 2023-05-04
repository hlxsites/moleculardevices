import handleViewportChanges from './header-events.js';
import buildRightSubmenu from './header-megamenu-components.js';
import { getMetadata, toClassName, decorateIcons } from '../../scripts/lib-franklin.js';
import buildSearch from './menus/search.js';
import {
  div,
  li,
  nav,
  a,
  ul,
} from '../../scripts/dom-helpers.js';
import {
  reverseElementLinkTagRelation,
  buildBrandLogo,
  fetchHeaderContent,
} from './helpers.js';
import { buildMobileMenuItem, buildMobileMenuTools } from './menus/mobile-menu.js';

function buildRequestQuote() {
  return li(
    { class: 'header-rfq' },
    a(
      { href: '/quote-request?cid=12' },
      'Request Quote',
    ),
  );
}

function buildMegaMenu(block, content, submenuContent, submenuId) {
  const productsSubmenu = div();
  const title = submenuContent.querySelector('h1');
  productsSubmenu.append(title.cloneNode(true));

  // get div after h1
  const divAfterH1 = submenuContent.querySelector('h1').nextElementSibling;
  productsSubmenu.append(buildRightSubmenu(divAfterH1));

  // get all H2s and create a list of them
  const h2s = [...submenuContent.querySelectorAll('h2')];
  const h2List = ul({ class: 'menu-nav-submenu-sections' });

  // add H2s to list
  h2s.forEach((h2) => {
    const element = reverseElementLinkTagRelation(h2);

    const h2ListItem = li({ class: 'menu-nav-submenu-section' });
    h2ListItem.innerHTML = element.outerHTML;

    h2ListItem.append(buildRightSubmenu(element));
    h2List.append(h2ListItem);
  });

  productsSubmenu.append(h2List);

  submenuContent.innerHTML = productsSubmenu.outerHTML;
  const backgroundImg = content.querySelector('.submenu-background img');
  submenuContent.style.backgroundImage = `url(${backgroundImg.src})`;

  // Get the list item in the header block that contains a div with attribute menu-id
  // that matches the submenuId
  const item = block.querySelector(`div[menu-id="${submenuId}"]`).closest('li');

  const closeButton = div({ class: 'menu-nav-submenu-close' });
  item.append(closeButton);
  item.append(submenuContent);
}

function getSubmenus() {
  return ['products', 'applications', 'resources', 'service-support', 'company', 'contact-us'];
}

export function buildNavbar(content) {
  const megaMenu = div({ class: 'mainmenu-wrapper sticky-element sticky-desktop' });
  const container = div({ class: 'container' });
  const newNav = nav({ id: 'nav' });

  const navTabs = content.querySelector('.nav-menu');

  newNav.innerHTML = navTabs.outerHTML;

  container.append(buildBrandLogo(content));
  container.append(newNav);
  megaMenu.append(container);

  // link section
  const navMenuUl = ul({ class: 'nav-tabs' });
  const menus = [...megaMenu.querySelectorAll('.nav-menu > div')];

  for (let i = 0; i < menus.length; i += 1) {
    const item = li({ class: 'menu-expandable', 'aria-expanded': 'false' });

    const menuTitle = menus[i];
    const textDiv = menuTitle.querySelector('div');
    menuTitle.innerHTML = textDiv.innerHTML;
    menuTitle.classList.add('menu-nav-category');
    menuTitle.setAttribute('menu-id', toClassName(menuTitle.textContent));

    item.innerHTML = menuTitle.outerHTML;
    navMenuUl.append(item);
  }

  navMenuUl.append(buildSearch(content));
  navMenuUl.append(buildRequestQuote());

  megaMenu.querySelector('.nav-menu').innerHTML = navMenuUl.outerHTML;

  decorateIcons(megaMenu);

  return megaMenu;
}

export default async function fetchAndStyleMegamenus(headerBlock) {
  // ------ Submenus ------
  const submenusList = getSubmenus();

  // Fetch all submenu content concurrently
  const submenuFetchPromises = [];
  for (let i = 0; i < submenusList.length - 1; i += 1) {
    const submenuId = submenusList[i];
    const submenuPath = getMetadata(`${submenuId}-submenu`) || `/fragments/menu/${submenuId}`;
    submenuFetchPromises.push(
      fetch(`${submenuPath}.plain.html`, window.location.pathname.endsWith(`/${submenuId}`) ? { cache: 'reload' } : {}),
    );
  }

  // Process all submenu responses
  const submenuResponses = await Promise.all(submenuFetchPromises);

  // fetch the header content, we need it to be able to get the background image
  const headerContent = await fetchHeaderContent();

  // iterate over all submenu responses
  for (let i = 0; i < submenuResponses.length; i += 1) {
    const submenuResponse = submenuResponses[i];
    if (submenuResponse.ok) {
      const submenuId = submenusList[i];

      // eslint-disable-next-line no-await-in-loop
      const submenuHtml = await submenuResponse.text();
      const submenuContent = div({ class: 'menu-nav-submenu' });
      submenuContent.innerHTML = submenuHtml;

      // clone the submenu content to the mobile menu
      const mobileSubmenuContent = submenuContent.cloneNode(true);

      // Get submenu builder, and build submenu
      buildMegaMenu(headerBlock, headerContent, submenuContent, submenuId);

      buildMobileMenuItem(mobileSubmenuContent, submenuId);
    }
  }

  buildMobileMenuTools(headerContent);

  handleViewportChanges(headerBlock);
}
