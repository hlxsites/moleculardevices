import {
  sampleRUM,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  toClassName,
  getMetadata,
  loadCSS,
  loadBlock,
  loadHeader,
  decorateBlock,
  buildBlock,
} from './lib-franklin.js';
import { a, div, p } from './dom-helpers.js';

/**
 * to add/remove a template, just add/remove it in the list below
 */
const TEMPLATE_LIST = ['application-note', 'news', 'publication', 'blog', 'event'];

const LCP_BLOCKS = ['hero', 'hero-advanced']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'molecular-devices'; // add your RUM generation information here

let LAST_SCROLL_POSITION = 0;
let STICKY_ELEMENTS;
let PREV_STICKY_ELEMENTS;
const mobileDevice = window.matchMedia('(max-width: 991px)');

export function loadScript(url, callback, type, async) {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (async) {
    script.async = true;
  }
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
}

/**
 * Summarises the description to maximum character count without cutting words.
 * @param {string} description Description to be summarised
 * @param {number} charCount Max character count
 * @returns summarised string
 */
export function summariseDescription(description, charCount) {
  let result = description;
  if (result.length > charCount) {
    result = result.substring(0, charCount);
    const lastSpaceIndex = result.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      result = result.substring(0, lastSpaceIndex);
    }
  }
  return `${result}…`;
}

/**
 * Will add the 'text-caption' class to the empasised elements from
 * the next sibling to mark them as captions
 * @param {NodeListOf<Element>} elems Elements which are presumed to have a caption attached.
 */
export function styleCaption(elems) {
  elems.forEach((elem) => {
    const checkEm = elem.parentElement.nextElementSibling.querySelector('p > em');
    if (checkEm) {
      const ems = checkEm.parentElement.children;
      [...ems].forEach((em) => {
        em.classList.add('text-caption');
      });
    }
  });
}

/*
* If we have a hero block, move it into its own section, so it can be displayed faster
*/
function optimiseHeroBlock(main) {
  const heroBlock = main.querySelector('.hero, .hero-advanced');
  if (!heroBlock) return;

  const heroSection = document.createElement('div');
  heroSection.appendChild(heroBlock);
  main.prepend(heroSection);
}

/**
 * If breadcrumbs = auto in  Metadata, 1 create space for CLS, 2 load breadcrumbs block
 * Breadcrumb block created at the top of first section
 */
function createBreadcrumbsSpace(main) {
  if (getMetadata('breadcrumbs') === 'auto') {
    const blockWrapper = document.createElement('div');
    blockWrapper.classList.add('breadcrumbs-wrapper');
    main.querySelector('.section').prepend(blockWrapper);
  }
}
async function loadBreadcrumbs(main) {
  if (getMetadata('breadcrumbs') === 'auto') {
    const blockWrapper = main.querySelector('.breadcrumbs-wrapper');
    const block = buildBlock('breadcrumbs', '');
    blockWrapper.append(block);
    decorateBlock(block);
    await loadBlock(block);
  }
}

/**
 * Parse video links and build the markup
 */
export function isVideo(url) {
  let isV = false;
  const hostnames = ['vids.moleculardevices.com', 'share.vidyard.com', 'video.vidyard.com'];
  [...hostnames].forEach((hostname) => {
    if (url.hostname.includes(hostname)) {
      isV = true;
    }
  });
  return isV;
}

export function embedVideo(link, url, type) {
  const videoId = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadScript('https://play.vidyard.com/embed/v4.js');
      link.parentElement.innerHTML = `<img style="width: 100%; margin: auto; display: block;"
      class="vidyard-player-embed"
      src="https://play.vidyard.com/${videoId}.jpg"
      data-uuid="${videoId}"
      data-v="4"
      data-width="${(type === 'lightbox') ? '700' : ''}"
      data-height="${(type === 'lightbox') ? '394' : ''}"
      data-autoplay="${(type === 'lightbox') ? '1' : '0'}"
      data-type="${(type === 'lightbox') ? 'lightbox' : 'inline'}"/>`;
    }
  });
  observer.observe(link.parentElement);
}

function decorateEmbedLinks(main) {
  main.querySelectorAll('a').forEach((link) => {
    const url = new URL(link.href);
    if (isVideo(url) && !link.closest('.block.hero-advanced')) {
      const up = link.parentElement;
      const isInlineBlock = (link.closest('.block.vidyard') && !link.closest('.block.vidyard').classList.contains('lightbox'));
      const type = (up.tagName === 'EM' || isInlineBlock) ? 'inline' : 'lightbox';
      const wrapper = div({ class: 'video-wrapper' }, div({ class: 'video-container' }, a({ href: link.href }, link.textContent)));
      if (link.href !== link.textContent) wrapper.append(p({ class: 'video-title' }, link.textContent));
      up.innerHTML = wrapper.outerHTML;
      embedVideo(up.querySelector('a'), url, type);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * Run named sections for in page navigation.
 * Decroate named sections for in page navigation.
 * @param {Element} main The container element
 */
function decoratePageNav(main) {
  const pageTabsBlock = main.querySelector('.page-tabs');
  if (!pageTabsBlock) return;

  const pageTabSection = pageTabsBlock.closest('div.section');
  let sections = [...main.querySelectorAll('div.section')];
  sections = sections.slice(sections.indexOf(pageTabSection) + 1);

  const namedSections = sections.filter((section) => section.hasAttribute('data-name'));
  if (namedSections) {
    let index = 0;
    sections.forEach((section) => {
      if (index < namedSections.length) {
        section.classList.add('tabs');
        section.setAttribute('aria-labelledby', namedSections[index].getAttribute('data-name'));
        if (section.hasAttribute('data-name')) {
          index += 1;
        }
      }
    });
  }
}

/**
 * Detects if a sidebar section is present and transforms main into a CSS grid
 * @param {Element} main
 */
function detectSidebar(main) {
  const sidebar = main.querySelector('.section.sidebar');
  if (sidebar) {
    main.classList.add('sidebar');

    // Create a CSS grid with the number of rows the number of children
    // minus - 1 (the sidebar section)
    const numSections = main.children.length - 1;
    main.style = `grid-template-rows: repeat(${numSections}, auto);`;

    // By default the sidebar will start with the first section,
    // but can be configured in the document differently
    const sidebarOffset = sidebar.getAttribute('data-start-sidebar-at-section');
    if (sidebarOffset && Number.parseInt(sidebarOffset, 10)) {
      const offset = Number.parseInt(sidebarOffset, 10);
      sidebar.style = `grid-row: ${offset} / infinite;`;
    }
  }
}

/**
 * Wraps images followed by links within a matching <a> tag.
 * @param {Element} container The container element
 */
function decorateLinkedPictures(container) {
  [...container.querySelectorAll('picture + br + a, picture + a')].forEach((link) => {
    const br = link.previousElementSibling;
    let picture = br.previousElementSibling;
    if (br.tagName === 'PICTURE') {
      picture = br;
    }
    if (link.textContent.includes(link.getAttribute('href'))) {
      link.innerHTML = '';
      link.className = '';
      link.appendChild(picture);
    }
  });
}

/**
 * Run template specific decoration code.
 * @param {Element} main The container element
 */
async function decorateTemplates(main) {
  try {
    const template = toClassName(getMetadata('template'));
    const templates = TEMPLATE_LIST;
    if (templates.includes(template)) {
      const mod = await import(`../templates/${template}/${template}.js`);
      loadCSS(`${window.hlx.codeBasePath}/templates/${template}/${template}.css`);
      if (mod.default) {
        await mod.default(main);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export async function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  optimiseHeroBlock(main);
  decorateSections(main);
  decoratePageNav(main);
  decorateBlocks(main);
  detectSidebar(main);
  decorateLinkedPictures(main);
  createBreadcrumbsSpace(main);
  decorateEmbedLinks(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    await decorateTemplates(main);
    await decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href, rel = 'icon') {
  const link = document.createElement('link');
  link.rel = rel;
  link.type = 'image/x-icon';
  link.href = href;
  const existingLink = document.querySelector(`head link[rel="${rel}"]`);
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const parts = dateStr.split(/[/,]/);
  const date = new Date(parts[2], parts[0] - 1, parts[1]);

  if (date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      ...options,
    });
  }
  return dateStr;
}

export function addLinkIcon(elem) {
  const linkIcon = document.createElement('i');
  linkIcon.className = 'fa fa-chevron-circle-right';
  linkIcon.ariaHidden = true;
  elem.append(linkIcon);
}

export async function fetchFragment(path, plain = true) {
  const response = await fetch(path + (plain ? '.plain.html' : ''));
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading fragment details', response);
    return null;
  }
  const text = await response.text();
  if (!text) {
    // eslint-disable-next-line no-console
    console.error('fragment details empty', path);
    return null;
  }
  return text;
}

function getStickyElements() {
  PREV_STICKY_ELEMENTS = STICKY_ELEMENTS;
  if (mobileDevice.matches) {
    STICKY_ELEMENTS = document.querySelectorAll('.sticky-element.sticky-mobile');
  } else {
    STICKY_ELEMENTS = document.querySelectorAll('.sticky-element.sticky-desktop');
  }

  // remove sticky class from elements that are no longer sticky
  if (PREV_STICKY_ELEMENTS) {
    PREV_STICKY_ELEMENTS.forEach((element) => {
      let keepSticky = false;
      STICKY_ELEMENTS.forEach((stickyElement) => {
        if (element === stickyElement) {
          keepSticky = true;
        }
      });

      if (!keepSticky) {
        element.classList.remove('sticky');
        element.style.top = '';
      }
    });
  }
}

/**
 * Enable sticky components
 *
 */
function enableStickyElements() {
  getStickyElements();
  mobileDevice.addEventListener('change', getStickyElements);

  const offsets = [];

  STICKY_ELEMENTS.forEach((element, index) => {
    offsets[index] = element.offsetTop;
  });

  window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    let stackedHeight = 0;
    STICKY_ELEMENTS.forEach((element, index) => {
      if (currentScrollPosition > offsets[index] - stackedHeight) {
        element.classList.add('sticky');
        element.style.top = `${stackedHeight}px`;
        stackedHeight += element.offsetHeight;
      } else {
        element.classList.remove('sticky');
        element.style.top = '';
      }

      if (currentScrollPosition < LAST_SCROLL_POSITION && currentScrollPosition <= offsets[index]) {
        element.style.top = `${Math.max(offsets[index] - currentScrollPosition, stackedHeight - element.offsetHeight)}px`;
      } else {
        element.style.top = `${stackedHeight - element.offsetHeight}px`;
      }
    });

    LAST_SCROLL_POSITION = currentScrollPosition;
  });
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');

  // eslint-disable-next-line no-unused-vars
  const headerBlock = loadHeader(doc.querySelector('header'));

  await loadBlocks(main);

  enableStickyElements();

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const megaMenuModule = await import('../blocks/header/header-megamenu.js');
  megaMenuModule.default(headerBlock);
  loadFooter(doc.querySelector('footer'));
  loadBreadcrumbs(main);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.ico`, 'icon');
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.ico`, 'apple-touch-icon');
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Read query string from url
 */
export function getQueryParameter() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  return params;
}

/**
 * Set a cookie
 * @param cname the name of the cookie
 * @param cvalue the value of the cookie
 * @param exdays the expiration days of a cookie
 */
export function setCookie(cname, cvalue, exdays) {
  const date = new Date();
  let hostName = '';
  let domain = '';
  let expires = '';
  date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
  if (exdays !== 0) {
    expires = `expires=${date.toUTCString()}`;
  }

  domain = window.location.hostname.endsWith('.moleculardevices.com');
  if (domain === true) {
    hostName = 'domain=.moleculardevices.com;';
  }
  document.cookie = `${cname}=${cvalue};secure;${hostName}${expires};path=/`;
}

/**
 * Get a cookie
 * @param cname the name of the cookie
 */
export function getCookie(cname) {
  const cName = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  /* eslint-disable-next-line no-plusplus */
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cName) === 0) {
      return c.substring(cName.length, c.length);
    }
  }
  return '';
}

/**
 * Set a cookie from query string parameters
 */
function setCookieFromQueryParameters(paramName, exdays) {
  const readQuery = getQueryParameter();
  if (readQuery[paramName]) {
    setCookie(paramName, readQuery[paramName], exdays);
  }
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}
const cookieParams = ['cmp', 'utm_medium', 'utm_source', 'utm_keyword', 'gclid'];

cookieParams.forEach((param) => {
  setCookieFromQueryParameters(param, 0);
});

loadPage();
