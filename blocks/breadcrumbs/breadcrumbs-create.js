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

export default async function createBreadcrumbs(container) {
  const currentPath = window.location.pathname;
  const pageIndex = await ffetch('/query-index.json').all();

  const urlForIndex = (index) => prependSlash(currentPath.split('/').slice(1, index + 2).join('/'));
  const breadcrumbs = [
    {
      name: 'Home',
      url_path: '/',
    },
    ...currentPath.split('/').slice(1, -1).map((part, index) => ({
      name: pageIndex.find((page) => page.path === urlForIndex(index))?.breadcrumbTitle ?? part,
      url_path: urlForIndex(index),
    })),
    { name: pageIndex.find((page) => page.path === currentPath)?.breadcrumbTitle ?? document.title},
  ];

  const ol = document.createElement('ol');
  breadcrumbs.forEach((crumb) => {
    ol.appendChild(createBreadcrumbListItem(crumb));
  });
  container.appendChild(ol);
}
