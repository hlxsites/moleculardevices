import handleViewportChanges from './header-events.js';
import { buildHamburger, buildMobileMenu } from './menus/mobile-menu.js';
import { buildBrandLogo, fetchHeaderContent, decorateLanguagesTool } from './helpers.js';
import { buildNavbar } from './header-megamenu.js';
import {
  a, div, li, span, i,
} from '../../scripts/dom-helpers.js';
import { detectStore, getCartItemCount } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function renderCart() {
  return (
    li({ class: 'cart-link' },
      i({ class: 'fa fa-shopping-cart' }),
      span({ class: 'cart-count' }, getCartItemCount()),
      a({
        href: 'https://shop.moleculardevices.com/cart',
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
        href: 'https://shop.moleculardevices.com/',
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
  return toolsWrapper;
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
  navbarHeader.append(buildHamburger());

  const headerWrapper = document.createElement('div');
  headerWrapper.classList.add('container', 'sticky-element', 'sticky-mobile');
  headerWrapper.append(navbarHeader);

  const megaMenu = buildNavbar(content);
  const mobileMenu = buildMobileMenu(content);

  block.append(headerWrapper, megaMenu, mobileMenu);
  decorateIcons();

  handleViewportChanges(block);
}
