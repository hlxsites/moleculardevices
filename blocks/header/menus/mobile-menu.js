import {
  reverseElementLinkTagRelation,
  getSubmenus,
  getSubmenuIdFromTitle,
  buildRequestQuote,
  decorateLanguagesTool,
} from '../helpers.js';
import { getMetadata } from '../../../scripts/lib-franklin.js';
import {
  h1,
  h2,
  ul,
  li,
  a,
  nav,
  span,
  button,
} from '../../../scripts/dom-helpers.js';
import { buildMobileSearch } from './search.js';

function addHamburgerListener(hamburger) {
  hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const body = document.querySelector('body');
    body.classList.toggle('openmenu');
  });
}

function openSubMenu(menuItem) {
  menuItem.classList.add('submenu-open');
}

function closeSubMenu(menuItem) {
  // get parent that has class mobile-menu-item
  const parentMenuItem = menuItem.closest('.mobile-menu-item');
  parentMenuItem.classList.remove('submenu-open');
}

// This function receives the content of one of the mobile menu items (eg. "Products", etc.)
// and builds the <li> element for it.
export async function buildMobileMenuItem(menuItem, menuId) {
  const menuName = menuItem.querySelector('h1 a').textContent;
  const menuParentLink = menuItem.querySelector('h1 a').href;

  const menuPath = getMetadata(`${menuId}-submenu`) || `/fragments/menu/${menuId}`;
  await fetch(`${menuPath}.plain.html`, window.location.pathname.endsWith(`/${menuId}`) ? { cache: 'reload' } : {}).then(async (response) => {
    if (response.ok) {
      // eslint-disable-next-line no-await-in-loop
      const content = await response.text();
      const subcategoriesContent = [...content.querySelectorAll('h2')];

      const subCategories = ul({ class: 'mobile-menu-subcategories', 'menu-id': menuId });

      // add back to parent button
      const backToParentMenuItem = li(
        { class: 'back-to-parent' },
        a(
          { href: '#' },
          menuName,
        ),
      );
      subCategories.append(backToParentMenuItem);

      // add button to parent directly
      const parentItem = li(
        { class: 'mobile-menu-subcategory-item' },
        a(
          { href: menuParentLink },
          h2(
            menuName,
          ),
        ),
      );
      subCategories.append(parentItem);

      // add H2s to list
      subcategoriesContent.forEach((subcategoryContent) => {
        const element = reverseElementLinkTagRelation(subcategoryContent);
        element.append(span({ class: 'caret' }));

        const subcategory = li(
          { class: 'mobile-menu-subcategory-item' },
          element,
        );

        subCategories.append(subcategory);
      });

      menuItem.append(subCategories);

      const menuItemLink = menuItem.querySelector('a');
      // add listener to toggle subcategories
      menuItemLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSubMenu(menuItem);
      });

      // add listener to close subcategories
      backToParentMenuItem.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSubMenu(menuItem);
      });

      const mobileMenuItems = document.querySelector('.mobile-menu-items');
      mobileMenuItems.append(menuItem);
    }
  });
}

export function buildMobileMenuTools(menuItems, content) {
  // create Contact Us button
  const contactUsItem = li(
    { class: 'mobile-menu-item contact-us' },
    a(
      { href: '/contact' },
      'Contact Us',
    ),
  );
  menuItems.append(contactUsItem);

  // create Request Quote button
  menuItems.append(buildRequestQuote('mobile-menu-item request-quote'));

  // create Tools buttons
  const toolsList = content.querySelector('div:nth-child(2)');
  const toolsWrapper = li(
    { class: 'mobile-menu-item company-links' },
    toolsList,
  );
  decorateLanguagesTool(toolsWrapper);

  menuItems.append(toolsWrapper);
}

export function buildMobileMenu(content) {
  const submenus = getSubmenus();

  const navigation = nav(
    { class: 'mobile-menu' },
    ul(
      { class: 'mobile-menu-items' },
      li(
        { class: 'headersearch-item' },
        buildMobileSearch(),
      ),
    ),
  );

  // add menu items
  submenus.forEach((title) => {
    if (title === 'Contact Us') return;

    const listItem = li(
      { class: 'mobile-menu-item' },
      h1(
        a(title),
      ),
      span({ class: 'caret' }),
    );

    // add listener to toggle subcategories
    listItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const menuId = getSubmenuIdFromTitle(title);
      if (!document.querySelector(`.mobile-menu-subcategories[menu-id="${menuId}"]`)) {
        buildMobileMenuItem(listItem, menuId);
      }
    });

    navigation.querySelector('ul').append(listItem);
  });

  buildMobileMenuTools(navigation.querySelector('ul'), content);
  return navigation;
}

export function buildHamburger() {
  const hamburger = button(
    { class: 'hamburger' },
    span(
      { class: 'sr-only' },
      'Toggle navigation',
    ),
    span(
      { class: 'icon-bar' },
    ),
    span(
      { class: 'icon-bar' },
    ),
    span(
      { class: 'icon-bar' },
    ),
  );

  // add listener to toggle hamburger
  addHamburgerListener(hamburger);

  return hamburger;
}
