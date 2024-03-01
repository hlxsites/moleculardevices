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
  readBlockConfig,
  toCamelCase,
  createOptimizedPicture,
} from './lib-franklin.js';
import {
  a, div, domEl, p,
} from './dom-helpers.js';

/**
 * to add/remove a template, just add/remove it in the list below
 */
const TEMPLATE_LIST = [
  'application-note',
  'news',
  'publication',
  'blog',
  'event',
  'about-us',
  'newsroom',
  'landing-page',
];
window.hlx.templates.add(TEMPLATE_LIST.map((tpl) => `/templates/${tpl}`));

const LCP_BLOCKS = ['hero', 'hero-advanced', 'featured-highlights']; // add your LCP blocks to the list
const SUPPORT_CHANNELS = ['DISTRIBUTOR', 'INTEGRATOR', 'SALES', 'TECH'];
window.hlx.RUM_GENERATION = 'molecular-devices'; // add your RUM generation information here

let LAST_SCROLL_POSITION = 0;
let LAST_STACKED_HEIGHT = 0;
let STICKY_ELEMENTS;
let PREV_STICKY_ELEMENTS;
const mobileDevice = window.matchMedia('(max-width: 991px)');

export function loadScript(url, callback, type, async, forceReload) {
  let script = document.querySelector(`head > script[src="${url}"]`);
  if (forceReload && script) {
    script.remove();
    script = null;
  }

  if (!script) {
    const head = document.querySelector('head');
    script = document.createElement('script');
    script.src = url;
    if (async) {
      script.async = true;
    }
    if (type) {
      script.setAttribute('type', type);
    }
    script.onload = callback;
    head.append(script);
  } else if (typeof callback === 'function') {
    callback('noop');
  }

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

/*
 * If we have a hero block, move it into its own section, so it can be displayed faster
 */
function optimiseHeroBlock(main) {
  const heroBlocks = main.querySelectorAll('.hero, .hero-advanced');
  if (!heroBlocks || heroBlocks.length === 0) return;

  const heroSection = document.createElement('div');
  heroSection.append(...heroBlocks);
  main.prepend(heroSection);
}

/**
 * Append default wave section to pages
 */
function decorateWaveSection(main) {
  const waveImage = createOptimizedPicture('/images/wave-footer-bg-top.png', 'wave', false, [
    { media: '(min-width: 992px)', width: '1663' },
    { width: '900' },
  ]);
  waveImage.querySelector('img').setAttribute('width', '1663');
  waveImage.querySelector('img').setAttribute('height', '180');
  const skipWave = document.querySelector(':scope.fragment > div, .page-tabs, .landing-page, .section.wave:last-of-type, .section:last-of-type div:first-of-type .fragment:only-child');
  const waveSection = document.querySelector('.section.wave:not(.bluegreen):last-of-type');
  if (waveSection && !waveSection.querySelector('picture')) { waveSection.appendChild(waveImage); }
  if (!skipWave) main.appendChild(div({ class: 'section wave', 'data-section-status': 'initialized' }, waveImage));
}

/**
 * Decorate blocks in an embed fragment.
 */
function decorateEmbeddedBlocks(container) {
  container
    .querySelectorAll('div.section > div')
    .forEach(decorateBlock);
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
  const hostnames = ['vids.moleculardevices.com', 'vidyard.com'];
  [...hostnames].forEach((hostname) => {
    if (url.hostname.includes(hostname)) {
      isV = true;
    }
  });
  return isV;
}

export function embedVideo(link, url, type) {
  const videoId = url.pathname.substring(url.pathname.lastIndexOf('/') + 1).replace('.html', '');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadScript('https://play.vidyard.com/embed/v4.js', null, null, null, true);
      link.parentElement.innerHTML = `<img style="width: 100%; margin: auto; display: block;"
      class="vidyard-player-embed"
      src="https://play.vidyard.com/${videoId}.jpg"
      data-uuid="${videoId}"
      data-v="4"
      data-width="${type === 'lightbox' ? '700' : ''}"
      data-height="${type === 'lightbox' ? '394' : ''}"
      data-autoplay="${type === 'lightbox' ? '1' : '0'}"
      data-type="${type === 'lightbox' ? 'lightbox' : 'inline'}"/>`;
    }
  });
  observer.observe(link.parentElement);
}

export function videoButton(container, button, url) {
  const videoId = url.pathname.split('/').at(-1).trim();
  const overlay = div({ id: 'overlay' }, div({
    class: 'vidyard-player-embed', 'data-uuid': videoId, 'dava-v': '4', 'data-type': 'lightbox', 'data-autoplay': '2',
  }));

  container.prepend(overlay);
  button.addEventListener('click', (e) => {
    e.preventDefault();
    loadScript('https://play.vidyard.com/embed/v4.js', () => {
      // eslint-disable-next-line no-undef
      VidyardV4.api.getPlayersByUUID(videoId)[0].showLightbox();
    });
  });
}

export function decorateExternalLink(link) {
  if (!link.href) return;

  const url = new URL(link.href);

  const internalLinks = [
    'https://view.ceros.com',
    'https://share.vidyard.com',
    'https://main--moleculardevices--hlxsites.hlx.page',
    'https://main--moleculardevices--hlxsites.hlx.live',
    'http://molecular-devices.myshopify.com',
    'http://moldev.com',
    'http://go.pardot.com',
    'http://pi.pardot.com',
    'https://drift.me',
  ];

  if (url.origin === window.location.origin
    || url.host.endsWith('moleculardevices.com')
    || internalLinks.includes(url.origin)
    || !url.protocol.startsWith('http')
    || link.closest('.languages-dropdown')
    || link.querySelector('.icon')) {
    return;
  }

  const acceptedTags = ['STRONG', 'EM', 'SPAN', 'H2'];
  const invalidChildren = Array.from(link.children)
    .filter((child) => !acceptedTags.includes(child.tagName));

  if (invalidChildren.length > 0) {
    return;
  }

  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');

  const heading = link.querySelector('h2');
  const externalLinkIcon = domEl('i', { class: 'fa fa-external-link' });
  if (!heading) {
    link.appendChild(externalLinkIcon);
  } else {
    heading.appendChild(externalLinkIcon);
  }
}

export function decorateLinks(main) {
  main.querySelectorAll('a').forEach((link) => {
    const url = new URL(link.href);
    // decorate video links
    if (isVideo(url) && !link.closest('.block.hero-advanced') && !link.closest('.block.hero')) {
      const closestButtonContainer = link.closest('.button-container');
      if (link.closest('.block.cards') || (closestButtonContainer && closestButtonContainer.querySelector('strong,em'))) {
        videoButton(link.closest('div'), link, url);
      } else {
        const up = link.parentElement;
        const isInlineBlock = (link.closest('.block.vidyard') && !link.closest('.block.vidyard').classList.contains('lightbox'));
        const type = (up.tagName === 'EM' || isInlineBlock) ? 'inline' : 'lightbox';
        const wrapper = div({ class: 'video-wrapper' }, div({ class: 'video-container' }, a({ href: link.href }, link.textContent)));
        if (link.href !== link.textContent) wrapper.append(p({ class: 'video-title' }, link.textContent));
        up.innerHTML = wrapper.outerHTML;
        embedVideo(up.querySelector('a'), url, type);
      }
    }

    // decorate RFQ page links with pid parameter
    if (url.pathname.startsWith('/quote-request') && !url.searchParams.has('pid') && getMetadata('family-id')) {
      url.searchParams.append('pid', getMetadata('family-id'));
      link.href = url.toString();
    }

    if (url.pathname.endsWith('.pdf')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }

    // decorate external links
    decorateExternalLink(link);
  });
}

function decorateParagraphs(main) {
  [...main.querySelectorAll('p > picture')].forEach((picturePar) => {
    picturePar.parentElement.classList.add('picture');
  });
  [...main.querySelectorAll('ol > li > em:only-child')].forEach((captionList) => {
    captionList.parentElement.parentElement.classList.add('text-caption');
  });
}

/**
 * Lazy loads all the blocks in the tabs, except for the visible/active one
 * @param {[Element]} sections All sections which belong to the Page Nav
 * @param {string} nameOfFirstSection Exact name of the first section, in case there is no hash
 */
function lazyLoadHiddenPageNavTabs(sections, nameOfFirstSection) {
  const activeHash = window.location.hash;
  const active = activeHash
    ? activeHash.substring(1, activeHash.length).toLowerCase()
    : nameOfFirstSection;

  sections.forEach((section) => {
    if (section.getAttribute('aria-labelledby') !== active) {
      /*
       It marks all the blocks inside the hidden sections as loaded,
       so Franklin lib will skip them.
       This means that the decorate functions of these blocks will not be executed
       and the CSS will not be downloaded
       */
      section.querySelectorAll('.block').forEach((block) => {
        // make the Franklin rendering skip this block
        block.setAttribute('data-block-status', 'loaded');
        // mark them as lazy load, so we can identify them later
        block.setAttribute('data-block-lazy-load', true);
        // hide them, to avoid CLS during lazy load
        block.parentElement.style.display = 'none';
      });

      const loadLazyBlocks = (lazySection) => {
        lazySection.querySelectorAll('.block[data-block-lazy-load]').forEach(async (block) => {
          block.removeAttribute('data-block-lazy-load');
          // Mark them back in the initialised status
          block.setAttribute('data-block-status', 'initialized');
          // Manually load each block: Download CSS, JS, execute the decorate
          await loadBlock(block);
          // Show the block only when everything is ready to avoid CLS
          block.parentElement.style.display = '';
        });

        // force the loaded status of the section
        section.setAttribute('data-section-status', 'loaded');
      };

      // In case the user clicks on the section, quickly render it on the spot,
      // if it happens before the timeout bleow
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          loadLazyBlocks(section);
        }
      });
      observer.observe(section);

      // Render the section with a delay
      setTimeout(() => {
        observer.disconnect();
        loadLazyBlocks(section);
      }, 3500);
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

  lazyLoadHiddenPageNavTabs(sections, namedSections[0].getAttribute('data-name'));
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

function addPageSchema() {
  if (document.querySelector('head > script[type="application/ld+json"]')) return;

  const includedTypes = ['Product', 'Application', 'Category', 'homepage', 'Blog', 'Event', 'Application Note'];
  const type = getMetadata('template');
  const spTypes = (type) ? type.split(',').map((k) => k.trim()) : [];

  const includedPaths = ['/products'];
  const path = window.location.pathname;
  if (!(includedTypes.some((r) => spTypes.indexOf(r) !== -1) || includedPaths.includes(path))) {
    return;
  }

  try {
    const moleculardevicesRootURL = 'https://www.moleculardevices.com/';
    const moleculardevicesLogoURL = 'https://www.moleculardevices.com/images/header-menus/logo.svg';

    const h1 = document.querySelector('main h1');
    const schemaTitle = h1 ? h1.textContent : getMetadata('og:title');

    const heroImage = document.querySelector('.hero img');
    const schemaImage = heroImage
      ? heroImage.src
      : getMetadata('thumbnail') || getMetadata('og:image') || moleculardevicesLogoURL;
    const schemaImageUrl = new URL(schemaImage, moleculardevicesRootURL);

    const keywords = getMetadata('keywords');

    const schema = document.createElement('script');
    schema.setAttribute('type', 'application/ld+json');

    const logo = {
      '@type': 'ImageObject',
      representativeOfPage: 'True',
      url: moleculardevicesLogoURL,
    };

    const brandSameAs = [
      'http://www.linkedin.com/company/molecular-devices',
      'https://www.facebook.com/MolecularDevices',
      'http://www.youtube.com/user/MolecularDevicesInc',
      'https://twitter.com/moldev',
    ];

    const eventStart = getMetadata('event-start');
    const eventEnd = getMetadata('event-end');
    const eventAddress = getMetadata('event-address');

    let schemaInfo = null;
    if (type === 'homepage') {
      const homepageName = 'Molecular Devices';
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            additionalType: 'Organization',
            description: getMetadata('description'),
            name: homepageName,
            sameAs: [
              ...brandSameAs,
              'https://en.wikipedia.org/wiki/Molecular_Devices',
            ],
            url: moleculardevicesRootURL,
            telephone: '+1 877-589-2214',
            logo: {
              '@type': 'ImageObject',
              url: moleculardevicesLogoURL,
            },
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
              ],
              opens: '08:00',
              closes: '17:00',
            },
          },
          {
            '@type': 'WebSite',
            name: homepageName,
            url: moleculardevicesRootURL,
            potentialAction: {
              '@type': 'SearchAction',
              'query-input': 'required name=search_term_string',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.moleculardevices.com/search-results#q={search_term_string}',
              },
            },
          },
        ],
      };
    }

    if (type === 'Application') {
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TechArticle',
            headline: schemaTitle,
            name: schemaTitle,
            description: getMetadata('description'),
            about: keywords ? keywords.split(',').map((k) => k.trim()) : [],
            url: document.querySelector("link[rel='canonical']").href,
            image: {
              '@type': 'ImageObject',
              representativeOfPage: 'True',
              url: schemaImageUrl,
            },
            author: {
              '@type': 'Organization',
              name: 'Molecular Devices',
              url: moleculardevicesRootURL,
              sameAs: brandSameAs,
              logo,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Molecular Devices',
              url: moleculardevicesRootURL,
              sameAs: brandSameAs,
              logo,
            },
          },
          {
            '@type': 'ImageObject',
            name: schemaTitle,
            url: schemaImageUrl,
          },
        ],
      };
    }

    if (type === 'Product' || type.includes('Category') || path === '/products') {
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            name: schemaTitle,
            description: getMetadata('description'),
            url: document.querySelector("link[rel='canonical']").href,
            image: {
              '@type': 'ImageObject',
              representativeOfPage: 'True',
              url: schemaImageUrl,
            },
            author: {
              '@type': 'Organization',
              name: 'Molecular Devices',
              url: moleculardevicesRootURL,
              sameAs: brandSameAs,
              logo,
            },
          },
        ],
      };
    }

    if (type === 'Blog') {
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: schemaTitle,
            name: schemaTitle,
            description: getMetadata('description'),
            about: keywords ? keywords.split(',').map((k) => k.trim()) : [],
            image: {
              '@type': 'ImageObject',
              representativeOfPage: 'True',
              url: schemaImageUrl,
            },
            author: {
              '@type': 'Organization',
              name: 'Molecular Devices',
              url: document.querySelector("link[rel='canonical']").href,
              sameAs: brandSameAs,
              logo,
            },
          },
        ],
      };
    }

    if (type === 'Application Note') {
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TechArticle',
            headline: schemaTitle,
            name: schemaTitle,
            description: getMetadata('description'),
            about: keywords ? keywords.split(',').map((k) => k.trim()) : [],
            author: {
              '@type': 'Organization',
              name: 'Molecular Devices',
              url: document.querySelector("link[rel='canonical']").href,
              sameAs: brandSameAs,
              logo,
            },
          },
        ],
      };
    }

    if (type === 'Event') {
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Event',
            name: schemaTitle,
            url: document.querySelector("link[rel='canonical']").href,
            description: getMetadata('description'),
            eventAttendanceMode: getMetadata('event-type'),
            startDate: (eventStart) ? eventStart.split(',')[0] : '',
            endDate: (eventEnd) ? eventEnd.split(',')[0] : '',
            image: {
              '@type': 'ImageObject',
              representativeOfPage: 'True',
              url: schemaImageUrl,
            },
            location: {
              '@type': 'City',
              name: eventAddress ? eventAddress.split(',').map((k) => k.trim()) : [],
            },
          },
        ],
      };
    }

    if (schemaInfo) {
      schema.appendChild(document.createTextNode(
        JSON.stringify(schemaInfo, null, 2),
      ));

      document.querySelector('head').appendChild(schema);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
}

function addHreflangTags() {
  if (document.querySelectorAll('head link[hreflang]').length > 0) return;

  const includedTypes = ['homepage', 'Product', 'Application', 'Category', 'Technology', 'Customer Breakthrough', 'Video Gallery', 'contact', 'About Us'];
  const type = getMetadata('template');
  const spTypes = (type) ? type.split(',').map((k) => k.trim()) : [];

  const includedPaths = ['/leadership', '/products', '/applications', '/customer-breakthroughs'];
  const path = window.location.pathname;
  if (!(includedTypes.some((r) => spTypes.indexOf(r) !== -1) || includedPaths.includes(path))) {
    return;
  }

  const baseHreflangs = [
    {
      lang: 'x-default',
      href: 'https://www.moleculardevices.com',
    },
    {
      lang: 'de',
      href: 'https://de.moleculardevices.com',
    },
    {
      lang: 'es',
      href: 'https://es.moleculardevices.com',
    },
    {
      lang: 'fr',
      href: 'https://fr.moleculardevices.com',
    },
    {
      lang: 'it',
      href: 'https://it.moleculardevices.com',
    },
    {
      lang: 'ko',
      href: 'https://ko.moleculardevices.com',
    },
    {
      lang: 'zh',
      href: 'https://www.moleculardevices.com.cn',
    },
  ];
  baseHreflangs.forEach((hl) => {
    const ln = document.createElement('link');
    ln.setAttribute('rel', 'alternate');
    ln.setAttribute('hreflang', hl.lang);
    ln.setAttribute('href', hl.href + path);
    document.querySelector('head').appendChild(ln);
  });
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
  decorateWaveSection(main);
  decorateBlocks(main);
  decoratePageNav(main);
  detectSidebar(main);
  decorateLinkedPictures(main);
  decorateLinks(main);
  decorateParagraphs(main);
  addPageSchema();
  addHreflangTags();
}

function isHomepage() {
  return window.location.pathname === '/';
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  // automatic page translators like google translate may change the lang attribute
  // so we store it in an additional attribute, to use the original value for the rendering
  // logic later
  document.documentElement.lang = document.documentElement.lang || 'en';
  document.documentElement.setAttribute('original-lang', document.documentElement.lang);

  if (!isHomepage()) {
    document.originalTitle = document.title;
    document.title = `${document.title ?? ''} | Molecular Devices`;
  }
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    await window.hlx.plugins.run('loadEager');
    await decorateMain(main);
    createBreadcrumbsSpace(main);
    await waitForLCP(LCP_BLOCKS);
  }
  if (window.innerWidth >= 900) loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);

  try {
    if (sessionStorage.getItem('fonts-loaded')) {
      loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Format date expressed as string: mm/dd/yyyy
 * @param {string} dateStr date as string
 * @param {Object} options result string format options
 * @returns new string with the formated date
 */
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

/**
 * Format date expressed in UTC seconds
 * @param {number} date
 * @returns new string with the formated date
 */
export function formatDateUTCSeconds(date, options = {}) {
  const dateObj = new Date(0);
  dateObj.setUTCSeconds(date);

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    ...options,
  });
}

export function unixDateToString(unixDateString) {
  const date = new Date(unixDateString * 1000);
  const day = date.getUTCDate();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
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
        if (!document.querySelector('header .mainmenu-wrapper [aria-expanded="true"]')) {
          element.classList.add('sticky');
          element.style.top = `${stackedHeight}px`;
          stackedHeight += element.offsetHeight;
        }
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
    if (stackedHeight !== LAST_STACKED_HEIGHT) {
      LAST_STACKED_HEIGHT = stackedHeight;
      document.querySelector(':root').style.setProperty('--stacked-height', `${stackedHeight}px`);
    }
  });
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');

  // eslint-disable-next-line no-unused-vars
  loadHeader(doc.querySelector('header'));

  await loadBlocks(main);

  if (!window.location.pathname.startsWith('/cp-request')) {
    enableStickyElements();

    const { hash } = window.location;
    const element = hash ? doc.getElementById(hash.substring(1)) : false;
    if (hash && element) element.scrollIntoView();

    loadFooter(doc.querySelector('footer'));
    loadBreadcrumbs(main);

    loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
    loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`).then(() => {
      try {
        if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
      } catch (e) {
        // do nothing
      }
    });

    window.hlx.plugins.run('loadLazy');

    sampleRUM('lazy');
    sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
    sampleRUM.observe(main.querySelectorAll('picture > img'));
  }
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  if (!window.location.pathname.startsWith('/cp-request')) {
    window.setTimeout(() => {
      window.hlx.plugins.load('delayed');
      window.hlx.plugins.run('loadDelayed');
      // eslint-disable-next-line import/no-cycle
      return import('./delayed.js');
    }, 3000);
  }
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
  date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
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

/**
 * Detect if page has store capability
 */
export function detectStore() {
  if (!localStorage.getItem('ipstack:geolocation')) {
    return false;
  }

  try {
    return JSON.parse(localStorage.getItem('ipstack:geolocation')).country_code === 'US';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not load user information.', err);
    return false;
  }
}

/**
 * Get cart item total count
 */
export function getCartItemCount() {
  return getCookie('cart-item-count') || 0;
}

/**
 * Detect anchor
 */
export function detectAnchor(block) {
  const activeHash = window.location.hash;
  if (!activeHash) return;

  const id = activeHash.substring(1, activeHash.length).toLocaleLowerCase();
  const el = block.querySelector(`#${id}`);
  if (el) {
    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === 'attributes'
          && mutation.attributeName === 'data-block-status'
          && block.attributes.getNamedItem('data-block-status').value === 'loaded') {
          observer.disconnect();
          setTimeout(() => {
            window.dispatchEvent(new Event('hashchange'));
          },
          3500,
          );
        }
      });
    });
    observer.observe(block, { attributes: true });
  }
}

async function loadPage() {
  await window.hlx.plugins.load('eager');
  await loadEager(document);
  await window.hlx.plugins.load('lazy');
  await loadLazy(document);
  loadDelayed();
}
const cookieParams = ['cmp', 'utm_medium', 'utm_source', 'utm_keyword', 'gclid'];

cookieParams.forEach((param) => {
  setCookieFromQueryParameters(param, 0);
});

export function isAuthorizedUser() {
  const supportCookie = getCookie('STYXKEY_PortalUserRole');
  return supportCookie && SUPPORT_CHANNELS.includes(supportCookie) && window.location.hostname.endsWith('moleculardevices.com');
}

/**
 * Check if a resource should be served as gated or original
 */
export function isGatedResource(item) {
  const authorizedUser = isAuthorizedUser();
  return item.gated === 'Yes' && item.gatedURL && item.gatedURL !== '0'
    && (!authorizedUser || item.gatedURL.includes('https://chat.moleculardevices.com'));
}

export function processSectionMetadata(element) {
  const sectionMeta = element.querySelector('.section-metadata');
  if (sectionMeta) {
    const meta = readBlockConfig(sectionMeta);
    const keys = Object.keys(meta);
    keys.forEach((key) => {
      if (key === 'style') element.classList.add(toClassName(meta.style));
      else element.dataset[toCamelCase(key)] = meta[key];
    });
    sectionMeta.remove();
  }
}

export async function processEmbedFragment(element) {
  const block = div({ class: 'embed-fragment' });
  [...element.classList].forEach((className) => { block.classList.add(className); });
  let found = false;
  const link = element.querySelector('a');
  if (link) {
    const linkUrl = new URL(link.href);
    let linkTextUrl;
    try {
      linkTextUrl = new URL(link.textContent);
    } catch {
      // not a url, ignore
    }
    if (linkTextUrl && linkTextUrl.pathname === linkUrl.pathname) {
      const fragmentDomains = ['localhost', 'moleculardevices.com', 'moleculardevices--hlxsites.hlx.page', 'moleculardevices--hlxsites.hlx.live'];
      found = fragmentDomains.find((domain) => linkUrl.hostname.endsWith(domain));
      if (found) {
        block.classList.remove('button-container');
        const fragment = await fetchFragment(linkUrl);
        block.innerHTML = fragment;
        const sections = block.querySelectorAll('.embed-fragment > div');
        [...sections].forEach((section) => {
          section.classList.add('section');
        });
        decorateEmbeddedBlocks(block);
        decorateSections(block);
        loadBlocks(block);
      }
    }
  }

  if (!found) {
    const elementInner = element.innerHTML;
    block.append(div({ class: 'section' }));
    block.querySelector('.section').innerHTML = elementInner;
  }

  decorateButtons(block);
  decorateIcons(block);
  decorateLinks(block);
  decorateParagraphs(block);

  return block;
}

loadPage();
