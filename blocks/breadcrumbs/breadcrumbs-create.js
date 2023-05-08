import ffetch from '../../scripts/ffetch.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

function prependSlash(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function createBreadcrumbListItem(crumb) {
  const li = document.createElement('li');
  if (crumb.url_path) {
    const a = document.createElement('a');
    a.textContent = crumb.name;
    a.href = crumb.url_path;
    li.appendChild(a);
  } else {
    li.textContent = crumb.name;
  }
  return li;
}

function skipParts(pathSplit) {
  const partsToSkip = ['en', 'assets', 'br', 'img'];
  return pathSplit.filter((item) => !partsToSkip.includes(item));
}

const customBreadcrumbs = {
  'app-note': {
    name: 'App Note',
    url_path: 'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BApplication%20Note%5D',
  },
  ebook: {
    name: 'EBook',
    url_path: 'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BeBook%5D',
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
};

function getCustomUrl(path, part) {
  if (customBreadcrumbs[part]) {
    return customBreadcrumbs[part].url_path;
  }

  return null;
}

function getName(pageIndex, path, part, current) {
  if (customBreadcrumbs[part]) {
    return customBreadcrumbs[part].name;
  }

  const pg = pageIndex.find((page) => page.path === path);
  if (pg && pg.h1 && pg.h1 !== '0') {
    return pg.h1;
  }

  if (pg && pg.title && pg.title !== '0') {
    return pg.title;
  }

  if (current) {
    return document.title;
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
  const urlForIndex = (index) => prependSlash(pathSplit.slice(1, index + 2).join('/'));

  const breadcrumbs = [
    {
      name: 'Home',
      url_path: '/',
    },
    ...pathSplit.slice(1, -1).map((part, index) => {
      const url = urlForIndex(index);
      return {
        name: getName(pageIndex, url, part, false),
        url_path: getCustomUrl(url, part) || url,
      };
    }),
    { name: getName(pageIndex, path, pathSplit[pathSplit.length - 1], true) },
  ];

  const ol = document.createElement('ol');
  breadcrumbs.forEach((crumb) => {
    ol.appendChild(createBreadcrumbListItem(crumb));
  });
  container.appendChild(ol);
  await breadCrumbsCSS;
}
