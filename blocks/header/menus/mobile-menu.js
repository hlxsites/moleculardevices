import { reverseElementLinkTagRelation } from '../helpers.js';
import {
  ul,
  li,
  a,
  nav,
  span,
  button,
} from '../../../scripts/dom-helpers.js';
import { buildMobileSearch } from './search.js';

// This function receives the content of one of the mobile menu items (eg. "Products", etc.)
// and builds the <li> element for it.
export function buildMobileMenuItem(itemContent, menuId) {
  // get all the h2s in the itemContent
  const menuItem = li({ class: 'mobile-menu-item' });

  // create first menu item which when clicked will show the other subcategories
  const titleLink = itemContent.querySelector('h1 a');
  menuItem.append(titleLink, span({ class: 'caret' }));

  const h2s = [...itemContent.querySelectorAll('h2')];
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
    titleLink.textContent,
  );
  subCategories.append(parentItem);

  // add H2s to list
  h2s.forEach((h2) => {
    const element = reverseElementLinkTagRelation(h2);
    element.append(span({ class: 'caret' }));

    const h2ListItem = li(
      { class: 'mobile-menu-subcategory-item' },
      element,
    );

    subCategories.append(h2ListItem);
  });

  menuItem.append(subCategories);

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
  hamburger.addEventListener('click', () => {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger.classList.contains('hamburger-open')) {
      // if hamburger is open, close it
      hamburger.classList.remove('hamburger-open');
      hamburger.classList.add('hamburger-close');
      mobileMenu.classList.toggle('mobile-menu-open');
    } else {
      // if hamburger is closed, open it
      hamburger.classList.remove('hamburger-close');
      hamburger.classList.add('hamburger-open');
      mobileMenu.classList.toggle('mobile-menu-open');
    }
  });

  return hamburger;
}
