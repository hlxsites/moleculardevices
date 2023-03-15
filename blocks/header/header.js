import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';

function buildBrandLogo(content) {
  const logoWrapper = document.createElement('div');
  logoWrapper.setAttribute('id', 'header-logo');
  const logoImg = content.querySelector('.nav-brand > div > div > picture > img');
  logoImg.classList = 'logo1';
  logoWrapper.innerHTML = logoImg.outerHTML;
  return logoWrapper;
}

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
  requestQuote.innerHTML = `<li class="we-mega-menu-li header-rfq">
  <a class="we-mega-menu-li" title="" href="/quote-request?cid=12" target="">Request<br>Quote</a></li>`;
  return requestQuote;
}

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

  // decorate nav DOM
  const content = document.createElement('div');
  content.innerHTML = html;

  // Create wrapper for logo header part
  const navbarHeader = document.createElement('div');
  navbarHeader.classList.add('navbar-header');
  navbarHeader.append(buildBrandLogo(content));
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
  const newNav = document.createElement('nav');
  newNav.setAttribute('id', 'nav');

  const navTabs = content.querySelector('.nav-menu');
  newNav.innerHTML = navTabs.outerHTML;
  container.append(newNav);
  mainMenuWrapper.append(container);

  // link section
  const navMenuUl = document.createElement('ul');
  navMenuUl.classList.add('nav-tabs');
  const menus = [...mainMenuWrapper.querySelectorAll('.nav-menu > div')];
  for (let i = 0; i < menus.length - 1; i += 2) {
    const li = document.createElement('li');
    const menuTitle = menus[i];
    menuTitle.classList.add('menu-nav-category');

    li.append(menuTitle);

    navMenuUl.append(li);
  }

  navMenuUl.append(buildRequestQuote());

  mainMenuWrapper.querySelector('.nav-menu').innerHTML = navMenuUl.outerHTML;

  decorateIcons(mainMenuWrapper);

  block.append(headerWrapper, mainMenuWrapper);
}
