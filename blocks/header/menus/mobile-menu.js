import { reverseElementLinkTagRelation } from '../helpers.js';
import {
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
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.querySelector('body');
    if (hamburger.classList.contains('hamburger-open')) {
      // if hamburger is open, close it
      hamburger.classList.remove('hamburger-open');
      hamburger.classList.add('hamburger-close');
      mobileMenu.classList.toggle('mobile-menu-open');
      body.classList.toggle('openmenu');
    } else {
      // if hamburger is closed, open it
      hamburger.classList.remove('hamburger-close');
      hamburger.classList.add('hamburger-open');
      mobileMenu.classList.toggle('mobile-menu-open');
      body.classList.toggle('openmenu');
    }
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
export function buildMobileMenuItem(itemContent, menuId) {
  // get all the h2s in the itemContent
  const menuItem = li({ class: 'mobile-menu-item' });

  // create first menu item which when clicked will show the other subcategories
  const titleLink = itemContent.querySelector('h1 a');
  const linkClone = titleLink.cloneNode(true);
  menuItem.append(linkClone, span({ class: 'caret' }));

  const subcategoriesContent = [...itemContent.querySelectorAll('h2')];
  const subCategories = ul({ class: 'mobile-menu-subcategories', 'menu-id': menuId });

  // add back to parent button
  const backToParentMenuItem = li(
    { class: 'back-to-parent' },
    a(
      { href: '#' },
      titleLink.textContent,
    ),
  );
  subCategories.append(backToParentMenuItem);

  // add button to parent directly
  const parentItem = li(
    { class: 'mobile-menu-subcategory-item' },
    a(
      { href: titleLink.href },
      h2(
        titleLink.textContent,
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

export function buildMobileMenuTools(content) {
  const mobileMenuItems = document.querySelector('.mobile-menu-items');

  // create Contact Us button
  const contactUsItem = li(
    { class: 'mobile-menu-item contact-us' },
    a(
      { href: '/contact' },
      'Contact Us',
    ),
  );
  mobileMenuItems.append(contactUsItem);

  // create Request Quote button
  const requestQuoteItem = li(
    { class: 'mobile-menu-item request-quote' },
    a(
      { href: '/quote-request' },
      'Request Quote',
    ),
  );
  mobileMenuItems.append(requestQuoteItem);

  // create Tools buttons
  const toolsList = content.querySelector('div:nth-child(2)');
  const toolsWrapper = li(
    { class: 'mobile-menu-item company-links' },
    toolsList,
  );
  mobileMenuItems.append(toolsWrapper);
}

export function buildMobileMenu() {
  return nav(
    { class: 'mobile-menu' },
    ul(
      { class: 'mobile-menu-items' },
      li(
        { class: 'headersearch-item' },
        buildMobileSearch(),
      ),
    ),
  );
}

export function buildHamburger() {
  const hamburger = button(
    { class: 'hamburger hamburger-open' },
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
