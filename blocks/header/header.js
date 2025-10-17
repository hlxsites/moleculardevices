/* eslint-disable import/no-cycle */
import handleViewportChanges from './header-events.js';
import { buildHamburger, buildMobileMenu } from './menus/mobile-menu.js';
import { fetchHeaderContent, decorateLanguagesTool } from './helpers.js';
import { buildNavbar } from './header-megamenu.js';
import {
  a, div, li, span, i, domEl,
} from '../../scripts/dom-helpers.js';
import { decorateExternalLink, detectStore, getCartItemCount } from '../../scripts/scripts.js';
import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';
import { buildSearchBar } from './menus/search.js';

const SHOP_BASE_URL = 'https://shop.moleculardevices.com';
export const SITE_LOGO_URL = '/images/header-menus/mol-dev-logo.svg';
export const SITE_LOGO_ALT_VALUE = 'Molecular Devices logo';

function renderCart() {
  return (
    li({ class: 'cart-link' },
      i({ class: 'fa fa-shopping-cart' }),
      span({ class: 'cart-count' }, getCartItemCount()),
      a({
        href: `${SHOP_BASE_URL}/cart`,
        target: '_blank',
        name: 'Cart',
        rel: 'noopener noreferrer',
      }, 'CART'),
    )
  );
}

function renderStore() {
  return (
    li({ class: 'store-link' },
      span({ class: 'icon icon-store' }),
      a({
        href: `${SHOP_BASE_URL}/`,
        target: '_blank',
        name: 'Store',
        rel: 'noopener noreferrer',
      }, 'STORE'),
    )
  );
}

function buildTools(content) {
  const toolsList = content.querySelector('div:nth-child(2)');
  const toolsWrapper = div(
    { class: 'company-links' },
  );
  toolsWrapper.innerHTML = toolsList.innerHTML;
  decorateLanguagesTool(toolsWrapper);
  if (detectStore()) {
    const linksList = toolsWrapper.querySelector('ul');
    linksList.prepend(renderStore());
    linksList.prepend(renderCart());
  }

  document.addEventListener('geolocationUpdated', () => {
    if (detectStore()) {
      const linksList = toolsWrapper.querySelector('ul');
      if (linksList.querySelector('.store-link')) {
        return; // store and cart already rendered
      }

      linksList.prepend(renderStore());
      linksList.prepend(renderCart());
    }
  });
  return toolsWrapper;
}

function addIndividualComponents(block) {
  // search for div with menu-id resources
  const resourceEl = block.querySelector('div[menu-id="resources"]');
  if (!resourceEl) return;

  const resources = resourceEl.parentElement;
  const mainMenu = resources.querySelector('.menu-nav-submenu');
  const rightSubMenu = mainMenu.querySelector('div > .right-submenu');

  // add search bar to right submenu
  const searchBar = buildSearchBar('resourcesSearchForm');
  searchBar.classList.add('resources-submenu-search');
  rightSubMenu.appendChild(searchBar);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch nav content
  const content = await fetchHeaderContent();

  // Create wrapper for logo header part
  const hasCustomLogo = content.querySelector('.nav-brand.custom-logo');
  const navbarHeader = domEl('div', { class: 'navbar-header' });
  const navBrand = div({ class: 'nav-brand' },
    a({ href: '/', class: 'site-logo' },
      createOptimizedPicture(SITE_LOGO_URL, SITE_LOGO_ALT_VALUE),
    ));

  navbarHeader.prepend(navBrand);
  navbarHeader.append(buildTools(content));
  navbarHeader.append(buildHamburger(content));

  const headerWrapper = domEl('div', { class: 'container sticky-element sticky-mobile' });
  headerWrapper.append(navbarHeader);

  const hideSearch = hasCustomLogo;
  const hideGlobalRFQ = hasCustomLogo;
  const megaMenu = await buildNavbar(content, hideSearch, hideGlobalRFQ);
  const mobileMenu = await buildMobileMenu(content, hideSearch, hideGlobalRFQ);

  block.append(headerWrapper, megaMenu, mobileMenu);
  decorateIcons();
  block.querySelectorAll('a').forEach(decorateExternalLink);

  addIndividualComponents(block);
  handleViewportChanges(block);
}
