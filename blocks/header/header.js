import handleViewportChanges from './header-events.js';
import { buildHamburger, buildMobileMenu } from './menus/mobile-menu.js';
import { buildBrandLogo, fetchHeaderContent, decorateLanguagesTool } from './helpers.js';
import { buildNavbar } from './header-megamenu.js';
import {
  a, div, li, span, i,
} from '../../scripts/dom-helpers.js';
import { decorateExternalLink, detectStore, getCartItemCount } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { buildSearchBar } from './menus/search.js';

const SHOP_BASE_URL = 'https://shop.moleculardevices.com';

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
  const resources = block.querySelector('div[menu-id="resources"]').parentElement;
  const rightSubMenu = resources.querySelector('.menu-nav-submenu > div > .right-submenu');

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
  const navbarHeader = document.createElement('div');
  navbarHeader.classList.add('navbar-header');
  navbarHeader.append(buildBrandLogo(content));
  navbarHeader.append(buildTools(content));
  navbarHeader.append(buildHamburger(content));

  const headerWrapper = document.createElement('div');
  headerWrapper.classList.add('container', 'sticky-element', 'sticky-mobile');
  headerWrapper.append(navbarHeader);

  const megaMenu = buildNavbar(content);
  const mobileMenu = buildMobileMenu(content);

  block.append(headerWrapper, megaMenu, mobileMenu);
  decorateIcons();
  block.querySelectorAll('a').forEach(decorateExternalLink);

  addIndividualComponents(block);

  handleViewportChanges(block);
}
