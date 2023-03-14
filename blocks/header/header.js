import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';

function buildToolsSection() {
  const companyLinks = document.createElement('div');
  companyLinks.innerHTML = `<div class="company-links"><ul class="mdtopmenu">
  <li><em><i class="fa-briefcase" aria-hidden="true">&nbsp;</i></em><a href="https://jobs.danaher.com/global/en/molecular-devices" class="ext" data-extlink="" target="_blank" rel="noopener noreferrer">Careers</a></li>
  <li class="dropdown"><em><i class="fa-globe" aria-hidden="true">&nbsp;</i></em><a class="dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-toggle="dropdown" role="button">Language &nbsp;</a></li>
  </ul></div>`;
  return companyLinks;
}

function buildRequestQuote() {
  const requestQuote = document.createElement('li');
  requestQuote.innerHTML = `<li class="we-mega-menu-li header-rfq" data-level="0" data-element-type="we-mega-menu-li" 
  description="" data-id="38d3dbfb-400b-4a1a-8c62-23dfc88ea15d" data-submenu="0" data-group="0" data-class="header-rfq">
  <a class="we-mega-menu-li" title="" href="/quote-request?cid=12" target="">Request<br>Quote</a></li>`;
  return requestQuote;
}

// function buildSearchTool() {
//   const searchTool = document.createElement('li');
// searchTool.innerHTML = `<li class="we-mega-menu-li searchlink fa
// fa-search dropdown-menu" data-level="0"
// data-element-type="we-mega-menu-li"
//   description="" data-id="e05dda8b-289a-4c7a-a502-2aeb6c782b1c" data-submenu="1"
//   data-group="0" data-class="searchlink fa fa-search">
//   <a href="#" data-drupal-link-system-path="<front>" class="we-megamenu-nolink">Search</a></li>`
// }

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch nav content
  const navPath = getMetadata('nav') || '/drafts/josec/nav12';
  const resp = await fetch(`${navPath}.plain.html`, window.location.pathname.endsWith('/drafts/josec/nav12') ? { cache: 'reload' } : {});
  if (!resp.ok) return;

  const html = await resp.text();

  const logo = document.createElement('div');
  logo.setAttribute('id', 'header-logo');
  const logoSrc = '/images/moldev-logo.webp';
  logo.innerHTML = `<div class="logo1"><a href="${navPath}"><img src="${logoSrc}" alt="Moleculardevices"/></a></div>`;

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.innerHTML = html;

  // Create wrapper for logo header part
  const navbarHeader = document.createElement('div');
  navbarHeader.classList.add('navbar-header');
  navbarHeader.append(logo);
  navbarHeader.append(buildToolsSection());

  const headerWrapper = document.createElement('div');
  headerWrapper.classList.add('container', 'top-header');
  headerWrapper.append(navbarHeader);

  // ------ Nav ------
  // Create wrapper for nav
  const mainMenuWrapper = document.createElement('div');
  mainMenuWrapper.classList.add('mainmenu-wrapper');

  const container = document.createElement('div');
  container.classList.add('container');

  container.append(nav);
  mainMenuWrapper.append(container);

  // link section
  const navMenuUl = document.createElement('ul');
  navMenuUl.classList.add('nav-tabs');
  const menus = [...nav.querySelectorAll('.nav-menu > div')];
  for (let i = 0; i < menus.length - 1; i += 2) {
    const li = document.createElement('li');
    const menuTitle = menus[i];
    menuTitle.classList.add('menu-nav-category');

    li.append(menuTitle);

    navMenuUl.append(li);
  }

  navMenuUl.append(buildRequestQuote());

  nav.querySelector('.nav-menu').innerHTML = navMenuUl.outerHTML;

  decorateIcons(nav);

  block.append(headerWrapper, mainMenuWrapper);
}
