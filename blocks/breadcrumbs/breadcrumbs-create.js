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

function getCustomUrl(part) {
  const customUrls = [
    ['app-note', 'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BApplication%20Note%5D'],
    ['ebook', 'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BeBook%5D'],
  ];
  const y = customUrls.findIndex((row) => row.includes(part));
  if (customUrls[y]) return customUrls[y][1];
  return null;
}

function getName(pageIndex, path, current) {
  const pg = pageIndex.find((page) => page.path === path);
  let name;
  if (pg && pg.h1 && pg.h1 !== '0') {
    name = pg.h1;
  } else if (pg && pg.title && pg.title !== '0') {
    name = pg.title;
  } else if (current) {
    name = document.title;
  } else {
    name = path.split('/').at(-1);
  }
  return name;
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
    ...pathSplit.slice(1, -1).map((part, index) => ({
      name: getName(pageIndex, urlForIndex(index), false),
      url_path: getCustomUrl(part) || urlForIndex(index),
    })),
    { name: getName(pageIndex, path, true) },
  ];

  const ol = document.createElement('ol');
  breadcrumbs.forEach((crumb) => {
    ol.appendChild(createBreadcrumbListItem(crumb));
  });
  container.appendChild(ol);
  await breadCrumbsCSS;
}
