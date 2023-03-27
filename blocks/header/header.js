import { getIdFromString } from '../../scripts/scripts.js';

import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';

let elementsWithEventListener = [];
const mql = window.matchMedia('only screen and (min-width: 1024px)');

function collapseAllSubmenus(menu) {
  menu.querySelectorAll('*[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
}

function addEventListenersDesktop() {
  function expandMenu(element) {
    const expanded = element.getAttribute('aria-expanded') === 'true';
    collapseAllSubmenus(element.closest('ul'));
    element.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }

  document.querySelectorAll('.menu-expandable').forEach((linkElement) => {
    elementsWithEventListener.push(linkElement);
    linkElement.setAttribute('tabindex', '0');

    // Add click event listener for desktop devices
    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      expandMenu(linkElement);
    });
  });
}

function addEventListenersMobile() {
  function toggleMenu(element) {
    const expanded = element.getAttribute('aria-expanded') === 'true';
    collapseAllSubmenus(element.closest('ul'));
    element.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }

  document.querySelectorAll('.menu-expandable').forEach((linkElement) => {
    elementsWithEventListener.push(linkElement);

    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(linkElement);
    });
  });
}

function reAttachEventListeners() {
  if (mql.matches) {
    addEventListenersDesktop();
  } else {
    addEventListenersMobile();
  }
}

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

function buildSearch() {
  const search = document.createElement('li');
  search.classList.add('searchlink', 'header-search', 'fa', 'fa-search');
  search.innerHTML = '<a title="" href="#" target="">Search</a>';
  return search;
}

function buildProductsMegaMenu(navContent, submenuContent) {
  const productsSubmenu = document.createElement('div');

  // get H1 title
  const h1 = submenuContent.querySelector('h1');
  // get link from submenuContent. It lives in an a tag inside a p tag in the first div
  const titleLink = submenuContent.querySelector('div > p > a');
  // put the h1 in the link
  titleLink.textContent = h1.textContent;
  productsSubmenu.append(titleLink);

  // get all H2s and create a list of them
  const h2s = [...submenuContent.querySelectorAll('h2')];
  const h2List = document.createElement('ul');
  h2List.classList.add('menu-nav-submenu-sections');

  // add H2s to list
  h2s.forEach((h2) => {
    const h2ListItem = document.createElement('li');
    h2ListItem.classList.add('menu-nav-submenu-section');

    // get the link from a p inside the parent div containing the H2
    const h2Link = h2.parentElement.querySelector('p > a');
    h2Link.textContent = h2.textContent;

    // insert link into list item
    h2ListItem.innerHTML = h2Link.outerHTML;
    h2List.append(h2ListItem);
  });

  productsSubmenu.append(h2List);

  // set inside of submenu to the productsSubmenu
  submenuContent.innerHTML = productsSubmenu.outerHTML;

  const backgroundImg = navContent.querySelector('.submenu-background img');
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
    li.classList.add('menu-expandable');
    li.setAttribute('aria-expanded', 'false');

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

  // Handle different event listeners for mobile/desktop on window resize
  const removeAllEventListeners = () => {
    elementsWithEventListener.forEach((el) => {
      el.replaceWith(el.cloneNode(true));
    });
    elementsWithEventListener = [];
  };

  mql.onchange = () => {
    mainMenuWrapper.setAttribute('aria-expanded', 'false');
    document.querySelector('main').style.visibility = '';
    removeAllEventListeners();
    collapseAllSubmenus(block);
    reAttachEventListeners();
  };

  reAttachEventListeners();
}
