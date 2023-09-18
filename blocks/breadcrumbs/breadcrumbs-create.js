import {
  a, li, domEl, span,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

const customResourceTypes = ['Videos and Webinars', 'Application Note', 'Cell Counter', 'Interactive Demo'];
const customResourcesBreadcrumb = {
  name: 'Resources',
  url_path: '/search-results',
};

function prependSlash(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function skipParts(pathSplit) {
  const partsToSkip = ['en', 'assets', 'br', 'img', 'citations', 'dd', 'tutorials-videos', 'bpd', 'cns', 'flipr', 'contaminants', 'enzyme'];
  return pathSplit.filter((item) => !partsToSkip.includes(item));
}

const customBreadcrumbs = {
  'app-note': {
    name: 'App Note',
    url_path:
      'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BApplication%20Note%5D',
  },
  ebook: {
    name: 'EBook',
    url_path:
      'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BeBook%5D',
  },
  'lab-notes': {
    name: 'Lab Notes',
    url_path: '/lab-notes',
  },
  '/lab-notes/general': {
    name: 'General',
    url_path: '/lab-notes/blog#General',
  },
  '/lab-notes/clone-screening': {
    name: 'Clone Screening',
    url_path: '/lab-notes/blog#Clone-Screening',
  },
  '/lab-notes/cellular-imaging-systems': {
    name: 'Cellular Imaging Systems',
    url_path: '/lab-notes/blog#Cellular-Imaging-Systems',
  },
  '/lab-notes/microplate-readers': {
    name: 'Microplate Readers',
    url_path: '/lab-notes/blog#Microplate-Readers',
  },
  'service-support': {
    name: 'Service and Support',
    url_path: '/service-support',
  },
  technology: {
    name: 'Technology and Innovation',
    url_path: '/technology',
  },
  'accessories-consumables': {
    name: 'Accessories and Consumables',
    url_path: '/products/accessories-consumables',
  },
  'customer-breakthrough': {
    name: 'Customer Breakthrough',
    url_path: '/customer-breakthroughs',
  },
  'acquisition-and-analysis-software': {
    name: 'Acquisition and Analysis Software',
  },
  'igg-quantification-assays': {
    name: 'IgG quantitation',
  },
  'dna-quantitation': {
    name: 'DNA Quantitation',
  },
  elisa: {
    name: 'ELISA',
  },
  'cell-viability': {
    name: 'Cell Viability',
  },
  cardiotox: {
    name: 'Cardiotox',
  },
  gpcrs: {
    name: 'GPCR',
  },
  'ion-channel': {
    name: 'Ion Channel',
  },
  'reporter-gene-assays': {
    name: 'Reporter Gene',
  },
  'western-blot': {
    name: 'Western Blot',
  },
  transporters: {
    name: 'Transporter',
  },
  'mammalian-screening': {
    name: 'Mammalian Screening',
  },
  'microbial-screening': {
    name: 'Microbial Screening',
  },
  'high-content-imaging': {
    name: 'High-Content Imaging',
  },
  digitizers: {
    name: 'Digitizers',
  },
  amplifiers: {
    name: 'Amplifiers',
  },
  resources: customResourcesBreadcrumb,
  events: {
    name: 'Events',
    url_path: '/events',
  },
  brochures: customResourcesBreadcrumb,
};

function getCustomUrl(path, part) {
  if (customBreadcrumbs[part]) {
    return customBreadcrumbs[part].url_path;
  }

  if (customBreadcrumbs[path]) {
    return customBreadcrumbs[path].url_path;
  }

  return path;
}

function getName(pageIndex, path, part, current) {
  if (customBreadcrumbs[part]) {
    return customBreadcrumbs[part].name;
  }

  if (customBreadcrumbs[path]) {
    return customBreadcrumbs[path].name;
  }

  const pg = pageIndex.find((page) => page.path === path);
  if (pg && pg.h1 && pg.h1 !== '0') {
    return pg.h1;
  }

  if (pg && pg.title && pg.title !== '0') {
    return pg.title;
  }

  if (current) {
    return document.originalTitle ? document.originalTitle : document.title;
  }

  return part;
}

export default async function createBreadcrumbs(container) {
  const breadCrumbsCSS = new Promise((resolve) => {
    loadCSS('/blocks/breadcrumbs/breadcrumbs.css', (e) => resolve(e));
  });

  const path = window.location.pathname;
  const pathSplit = skipParts(path.split('/'));

  const pageIndex = await ffetch('/query-index.json').all();
  const pg = pageIndex.find((page) => page.path === path);
  // default Home breadcrumb
  const breadcrumbs = [
    {
      name: 'Home',
      url_path: '/',
    },
  ];
  // custom resource types restricting breadcrumb to Home > Resources
  if (pg && customResourceTypes.includes(pg.type)) {
    breadcrumbs.push(customResourcesBreadcrumb);
  } else {
    // for Customer Breakthrough breadcrumb is Home > Resources > Customer Breakthrough > Title
    if (pg && pg.type === 'Customer Breakthrough') {
      breadcrumbs.push(customResourcesBreadcrumb);
    }
    // resolve rest of the path
    const urlForIndex = (index) => prependSlash(pathSplit.slice(1, index + 2).join('/'));
    breadcrumbs.push(
      ...pathSplit.slice(1, -1).map((part, index) => {
        const url = urlForIndex(index);
        return {
          name: getName(pageIndex, url, part, false),
          url_path: getCustomUrl(url, part),
        };
      }),
      { name: getName(pageIndex, path, pathSplit[pathSplit.length - 1], true) },
    );
  }
  const ol = container.querySelector('ol');
  ol.setAttribute('itemscope', '');
  ol.setAttribute('itemtype', 'http://schema.org/BreadcrumbList');

  breadcrumbs.forEach((crumb, idx) => {
    ol.appendChild(
      li({ itemprop: 'itemListElement', itemscope: '', itemtype: 'http://schema.org/ListItem' },
        crumb.url_path
          ? a({ itemprop: 'item', href: crumb.url_path }, span({ itemprop: 'name' }, crumb.name))
          : span({ itemprop: 'name' }, crumb.name),
        domEl('meta', { itemprop: 'position', content: `${idx + 1}` }),
      ),
    );
  });
  await breadCrumbsCSS;
}
