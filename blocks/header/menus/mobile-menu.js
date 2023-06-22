import {
  reverseElementLinkTagRelation,
  getSubmenuIds,
  buildRequestQuote,
  decorateLanguagesTool,
} from '../helpers.js';
import {
  div,
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
import { processSectionMetadata } from '../../../scripts/scripts.js';
import { toClassName } from '../../../scripts/lib-franklin.js';

function openSubMenu(menuItem) {
  menuItem.classList.add('submenu-open');
}

function closeSubMenu(parentMenuItem) {
  // get parent that has class mobile-menu-item
  parentMenuItem.classList.remove('submenu-open');
}

function addOpenMenuListener(element, submenu) {
  element.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      openSubMenu(submenu);
    }
  });
}

function getResponseMetadata(content, metadataField) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const meta = doc.head.querySelector(`meta[name="${metadataField}"]`);

  if (meta !== null) {
    return meta.getAttribute('content');
  }

  return null;
}

// This function receives the content of one of the mobile menu items (eg. "Products", etc.)
// and builds the <li> element for it.
async function buildMobileMenuItem(menuItem, menuId) {
  const menuName = menuItem.querySelector('h1 a').textContent;
  const menuParentLink = menuItem.getAttribute('menu-link');

  await fetch(`/fragments/megamenu/${menuId}`, window.location.pathname.endsWith(`/${menuId}`) ? { cache: 'reload' } : {}).then(async (response) => {
    if (response.ok) {
      // eslint-disable-next-line no-await-in-loop
      const content = await response.text();

      const submenuContent = div();
      submenuContent.innerHTML = content;

      // get all H2s and create a list of them
      const subcategoriesContent = [...submenuContent.querySelectorAll('h2')];

      const subCategories = ul({ class: 'mobile-menu-subcategories', 'menu-id': menuId });

      // add back to parent button
      const backToParentMenuItem = li(
        { class: 'back-to-parent' },
        a(
          { href: '#', 'aria-label': 'Go Back' },
          menuName,
        ),
      );
      subCategories.append(backToParentMenuItem);

      // add button to parent directly. This depends on the mobile-style meta tag
      const mobileStyle = getResponseMetadata(content, 'mobile-style');
      if (mobileStyle !== 'No Parent Link') {
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
      }

      // add H2s to list
      subcategoriesContent.forEach((subcategoryContent) => {
        processSectionMetadata(subcategoryContent.parentElement);
        const mobileMode = subcategoryContent.parentElement.getAttribute('data-mobile-mode');
        const categoryId = subcategoryContent.getAttribute('id');
        let subcategoryItems = [...subcategoryContent.parentElement.querySelectorAll('div div div > p > a')];

        if (subcategoryItems.length === 0) {
          subcategoryItems = [...subcategoryContent.parentElement.querySelectorAll('div div p')];
        }

        // create clone of subcategoryContent to avoid modifying the original
        const element = reverseElementLinkTagRelation(subcategoryContent);
        const caret = span({ class: 'caret' });

        const subcategory = li(
          { class: 'mobile-menu-subcategory-item' },
          element,
        );

        // if mobileMode is null or is not set to "No Expand" then add the caret
        const addSubmenu = mobileMode === null || mobileMode !== 'No Expand';
        if (addSubmenu) {
          element.append(caret);

          const backToParentCategory = li(
            { class: 'back-to-parent' },
            a(
              { href: '#', 'aria-label': 'Go Back' },
              element.textContent,
            ),
          );

          // create the list of items inside this subcategory (3rd menu level)
          const items = ul(
            { class: 'mobile-menu-subcategories', 'menu-id': categoryId },
            backToParentCategory,
          );

          // get subcategory items from the content. This elements are in a div
          // within the same parent as the H2
          subcategoryItems.forEach((item) => {
            const listItem = li(
              { class: 'mobile-menu-subcategory-item' },
              item,
            );
            items.append(listItem);
          });

          subcategory.append(items);

          backToParentCategory.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSubMenu(subcategory);
          });

          addOpenMenuListener(caret, subcategory);
        }

        subCategories.append(subcategory);
      });

      menuItem.append(subCategories);

      // add listener to close subcategories
      backToParentMenuItem.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentMenuItem = menuItem.closest('.mobile-menu-item');
        closeSubMenu(parentMenuItem);
      });
    }
  });
}

function addHamburgerListener(hamburger) {
  hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const body = document.querySelector('body');
    body.classList.toggle('openmenu');

    const submenuIds = getSubmenuIds();

    // check if all submenus exist otherwise create
    submenuIds.forEach((submenuId) => {
      if (submenuId === 'contact-us') return;

      if (!document.querySelector(`.mobile-menu-subcategories[menu-id="${submenuId}"]`)) {
        const submenuListItem = document.querySelector(`.mobile-menu-item[menu-id="${submenuId}"]`);
        buildMobileMenuItem(submenuListItem, submenuId);
      }
    });
  });
}

export function buildMobileMenuTools(menuItems, content) {
  // create Contact Us button
  const contactUsItem = li(
    { class: 'mobile-menu-item contact-us' },
    a(
      { href: '/contact', 'aria-label': 'Contact Us' },
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
  const submenus = content.querySelectorAll('h1');

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
  submenus.forEach((submenu) => {
    const title = submenu.querySelector('a').textContent;
    const link = submenu.querySelector('a').getAttribute('href');

    if (title === 'Contact Us') return;

    const submenuLink = a(
      { href: '#', 'aria-label': title },
      title,
    );

    const caret = span({ class: 'caret' });
    const listItem = li(
      { class: 'mobile-menu-item', 'menu-id': toClassName(title), 'menu-link': link },
      h1(
        submenuLink,
      ),
      caret,
    );

    addOpenMenuListener(submenuLink, listItem);
    addOpenMenuListener(caret, listItem);

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
