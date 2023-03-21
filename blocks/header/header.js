import { getIdFromString } from '../../scripts/scripts.js';

import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';

function buildBrandLogo(content) {
  const logoWrapper = document.createElement('div');
  logoWrapper.setAttribute('id', 'header-logo');
  const logoImg = content.querySelector('.nav-brand > div > div > picture');
  logoWrapper.innerHTML = logoImg.outerHTML;
  return logoWrapper;
}

function getSubmenuBackgroundImg(content) {
  const backgroundImg = content.querySelector('.submenu-background img');
  return backgroundImg;
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

function buildSearch() {
  const search = document.createElement('li');
  search.classList.add('searchlink', 'header-search', 'fa', 'fa-search');
  search.innerHTML = '<a title="" href="#" target="">Search</a>';
  return search;
}

function buildProductsMegaMenu(navContent, submenuContent) {
  const backgroundImg = getSubmenuBackgroundImg(navContent);
  submenuContent.style.backgroundImage = `url(${backgroundImg.src})`;
}

function createSubmenuBuildersMap() {
  // create map of submenu name to function
  const submenus = new Map();
  submenus.set('products', buildProductsMegaMenu);
  submenus.set('applications', () => { });
  submenus.set('resources', () => { });
  submenus.set('service-support', () => { });
  submenus.set('company', () => { });
  submenus.set('contact-us', () => { });
  return submenus;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch nav content
  const navPath = getMetadata('nav') || '/nav';
  const resp = await fetch(`${navPath}.plain.html`, window.location.pathname.endsWith('/nav') ? { cache: 'reload' } : {});
  if (!resp.ok) return;

  const html = await resp.text();

  // decorate nav DOM
  const content = document.createElement('div');
  content.innerHTML = html;

  // Create wrapper for logo header part
  const navbarHeader = document.createElement('div');
  navbarHeader.classList.add('navbar-header');
  navbarHeader.append(buildBrandLogo(content));
  navbarHeader.append(buildTools(content));

  const headerWrapper = document.createElement('div');
  headerWrapper.classList.add('container');
  headerWrapper.append(navbarHeader);

  // ------ Nav ------
  // Create wrapper for nav
  const mainMenuWrapper = document.createElement('div');
  mainMenuWrapper.classList.add('mainmenu-wrapper');

  const container = document.createElement('div');
  container.classList.add('container');
  const newNav = document.createElement('nav');
  newNav.setAttribute('id', 'nav');

  const navTabs = content.querySelector('.nav-menu');
  newNav.innerHTML = navTabs.outerHTML;
  container.append(newNav);
  mainMenuWrapper.append(container);

  // ------ Submenus ------
  const submenuBuildersMap = createSubmenuBuildersMap();

  // link section
  const navMenuUl = document.createElement('ul');
  navMenuUl.classList.add('nav-tabs');
  const menus = [...mainMenuWrapper.querySelectorAll('.nav-menu > div')];

  // Fetch all submenu content concurrently
  const submenuFetchPromises = [];
  for (let i = 0; i < menus.length - 1; i += 2) {
    const textDiv = menus[i].querySelector('div');
    const submenuId = getIdFromString(textDiv.textContent);
    const submenuPath = getMetadata(`${submenuId}-submenu`) || `/drafts/josec/mega-menu-submenus/${submenuId}`;
    submenuFetchPromises.push(
      fetch(`${submenuPath}.plain.html`, window.location.pathname.endsWith(`/${submenuId}`) ? { cache: 'reload' } : {}),
    );
  }

  // Process all submenu responses
  const submenuResponses = await Promise.all(submenuFetchPromises);

  for (let i = 0; i < menus.length - 1; i += 2) {
    const li = document.createElement('li');
    const menuTitle = menus[i];
    menuTitle.classList.add('menu-nav-category');
    const textDiv = menuTitle.querySelector('div');
    menuTitle.innerHTML = textDiv.innerHTML;

    li.append(menuTitle);

    // Get submenu content
    const submenuContentResp = submenuResponses[i / 2];
    if (submenuContentResp.ok) {
      // eslint-disable-next-line no-await-in-loop
      const submenuHtml = await submenuContentResp.text();
      const submenuContent = document.createElement('div');
      submenuContent.classList.add('menu-nav-submenu');
      submenuContent.innerHTML = submenuHtml;

      // Get submenu builder, and build submenu
      const submenuId = getIdFromString(textDiv.textContent);
      const submenuBuilder = submenuBuildersMap.get(getIdFromString(submenuId));
      submenuBuilder(content, submenuContent);
      li.append(submenuContent);

      navMenuUl.append(li);
    }
  }

  navMenuUl.append(buildSearch());
  navMenuUl.append(buildRequestQuote());

  mainMenuWrapper.querySelector('.nav-menu').innerHTML = navMenuUl.outerHTML;

  decorateIcons(mainMenuWrapper);

  block.append(headerWrapper, mainMenuWrapper);
}
