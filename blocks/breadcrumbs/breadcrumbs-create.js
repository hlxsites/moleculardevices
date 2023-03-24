import ffetch from '../../scripts/ffetch.js';

function prependSlash(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

export default async function createBreadcrumbs(container) {
  const newsUrls = [window.location.pathname];
  const newsItems = await ffetch('/query-index.json')
    .filter(({ path }) => newsUrls.find((newsUrl) => newsUrl.indexOf(path) >= 0))
    .all();
  const urlForIndex = (index) => prependSlash(window.location.pathname.split('/').slice(1, index + 2).join('/'));
  const breadcrumbs = [
    // Home link
    {
      name: 'Home',
      url_path: '/',
    },
    // Sub-page links
    ...window.location.pathname.split('/').slice(1, -1).map((part, index) => ({
      name: newsItems.find((page) => page.path === urlForIndex(index))?.title ?? part,
      // name: 'Home',
      // url_path: urlForIndex(index),
      url_path: '/',
    })),
    // Current page
    { name: document.title },
  ];

  const ol = document.createElement('ol');
  breadcrumbs.forEach((crumb) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = crumb.name;
    a.href = crumb.url_path;
    li.appendChild(a);
    ol.appendChild(li);
  });
  container.appendChild(ol);
}
