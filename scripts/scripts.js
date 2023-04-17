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
  decorateBlock,
  buildBlock,
} from './lib-franklin.js';
import loadHeader from './header-utils.js';
import TEMPLATE_LIST from '../templates/config.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

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
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}
*/

/**
 * If breadcrumbs = auto in  Metadata, 1 create space for CLS, 2 load breadcrumbs block
 * Breadcrumb block created at the top of first section
 */
async function createBreadcrumbsSpace(main) {
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
 * Builds all synthetic blocks in a container element.
 * Run named sections for in page navigation.
 * Decroate named sections for in page navigation.
 * @param {Element} main The container element
 */
function decoratePageNav(main) {
  const sections = [...main.querySelectorAll('div.section')].slice(1);
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
  decorateSections(main);
  decoratePageNav(main);
  decorateBlocks(main);
  createBreadcrumbsSpace(main);
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
  const parts = dateStr.split('/');
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

export async function fetchFragment(path) {
  const response = await fetch(`${path}.plain.html`);
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

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');

  loadHeader(doc.querySelector('header'));

  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

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

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
