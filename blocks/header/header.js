import handleViewportChanges from './header-events.js';
import { buildHamburger, buildMobileMenu } from './menus/mobile-menu.js';
import { buildBrandLogo, fetchHeaderContent } from './helpers.js';
import { buildNavbar } from './header-megamenu.js';

function buildTools(content) {
  const toolsList = content.querySelector('div:nth-child(2)');
  const toolsWrapper = document.createElement('div');
  toolsWrapper.classList = ('company-links');
  toolsWrapper.innerHTML = toolsList.innerHTML;
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
  const mobileMenu = buildMobileMenu();

  block.append(headerWrapper, megaMenu, mobileMenu);

  handleViewportChanges(block);
}
