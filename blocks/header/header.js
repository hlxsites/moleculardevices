import handleViewportChanges from './header-events.js';
import { getMetadata, decorateIcons, toClassName } from '../../scripts/lib-franklin.js';
import { buildHamburger } from './menus/mobile-menu.js';

function buildBrandLogo(content) {
  const logoWrapper = document.createElement('div');
  logoWrapper.setAttribute('id', 'header-logo');
  const logoImg = content.querySelector('.nav-brand > div > div > picture');
  logoWrapper.innerHTML = logoImg.outerHTML;
  return logoWrapper;
}

function buildTools(content) {
  const toolsList = content.querySelector('div:nth-child(2)');
  const toolsWrapper = document.createElement('div');
  toolsWrapper.classList = ('company-links');
  toolsWrapper.innerHTML = toolsList.innerHTML;
  return toolsWrapper;
}

function buildRequestQuote() {
  const requestQuote = document.createElement('li');
  requestQuote.classList.add('header-rfq');
  requestQuote.innerHTML = '<a title="" href="/quote-request?cid=12" target="">Request<br>Quote</a>';
  return requestQuote;
}

function buildSearch(content) {
  const search = document.createElement('li');
  search.classList.add('searchlink', 'header-search', 'fa', 'fa-search');
  search.setAttribute('aria-expanded', 'false');

  const flexContainer = document.createElement('div');

  const searchView = document.createElement('div');
  searchView.classList.add('menu-nav-search-view');

  // get div with class Robot Image with Speach from navContent
  const robotDiv = content.querySelector('.robot-image-with-speech');
  searchView.append(robotDiv);

  const searchBar = document.createElement('div');
  searchBar.classList.add('menu-nav-search-bar');
  searchBar.innerHTML = '<h3>Search</h3>';

  searchBar.innerHTML += `<div class="search-form-group">
    <form action="/search-results" method="GET">
      <input id="search_keyword_search1" class="form-control" type="text" placeholder="moleculardevices.com" name="search" />
      <button class="transparentBtn btn searchbutton" type="submit">Search</button>
    </form>
  </div>
  `;
  searchView.append(searchBar);

  flexContainer.append(searchView);

  const closeButton = document.createElement('div');
  closeButton.classList.add('menu-nav-submenu-close');
  flexContainer.append(closeButton);

  search.append(flexContainer);
  return search;
}

export async function fetchHeaderContent() {
  const navPath = getMetadata('nav') || '/nav';
  const resp = await fetch(`${navPath}.plain.html`, window.location.pathname.endsWith('/nav') ? { cache: 'reload' } : {});
  if (!resp.ok) return {};

  const html = await resp.text();

  const content = document.createElement('div');
  content.innerHTML = html;
  return content;
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

  // ------ Nav ------
  // Create wrapper for nav
  const mainMenuWrapper = document.createElement('div');
  mainMenuWrapper.classList.add('mainmenu-wrapper', 'sticky-element', 'sticky-desktop');

  const container = document.createElement('div');
  container.classList.add('container');
  const newNav = document.createElement('nav');
  newNav.setAttribute('id', 'nav');

  const navTabs = content.querySelector('.nav-menu');
  newNav.innerHTML = navTabs.outerHTML;
  container.append(buildBrandLogo(content));
  container.append(newNav);
  mainMenuWrapper.append(container);

  // link section
  const navMenuUl = document.createElement('ul');
  navMenuUl.classList.add('nav-tabs');
  const menus = [...mainMenuWrapper.querySelectorAll('.nav-menu > div')];

  for (let i = 0; i < menus.length; i += 1) {
    const li = document.createElement('li');
    li.classList.add('menu-expandable');
    li.setAttribute('aria-expanded', 'false');

    const menuTitle = menus[i];
    const textDiv = menuTitle.querySelector('div');
    menuTitle.innerHTML = textDiv.innerHTML;
    menuTitle.classList.add('menu-nav-category');
    menuTitle.setAttribute('menu-id', toClassName(menuTitle.textContent));

    li.innerHTML = menuTitle.outerHTML;
    navMenuUl.append(li);
  }

  navMenuUl.append(buildSearch(content));
  navMenuUl.append(buildRequestQuote());

  mainMenuWrapper.querySelector('.nav-menu').innerHTML = navMenuUl.outerHTML;

  decorateIcons(mainMenuWrapper);

  block.append(headerWrapper, mainMenuWrapper);

  handleViewportChanges(block);
}
