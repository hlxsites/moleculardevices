import ffetch from '../../scripts/ffetch.js';

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

export default async function createBreadcrumbs(container) {
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
      name: pageIndex.find((page) => page.path === urlForIndex(index))?.h1 ?? part,
      url_path: getCustomUrl(part) || urlForIndex(index),
    })),
    { name: pageIndex.find((page) => page.path === path)?.h1 ?? document.title },
  ];

  const ol = document.createElement('ol');
  breadcrumbs.forEach((crumb) => {
    ol.appendChild(createBreadcrumbListItem(crumb));
  });
  container.appendChild(ol);
}
