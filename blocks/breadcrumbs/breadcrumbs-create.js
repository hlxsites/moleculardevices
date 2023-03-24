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
    {
      name: 'Home',
      url_path: '/',
    },
    ...window.location.pathname.split('/').slice(1, -1).map((part, index) => ({
      name: newsItems.find((page) => page.path === urlForIndex(index))?.title ?? part,
      url_path: urlForIndex(index),
    })),
    { name: document.title },
  ];

  const ol = document.createElement('ol');
  breadcrumbs.forEach((crumb) => {
    const li = document.createElement('li');
    if (crumb.url_path) {
      const a = document.createElement('a');
      a.textContent = crumb.name;
      a.href = crumb.url_path;
      li.appendChild(a);
    } else {
      li.textContent = crumb.name;
    }
    ol.appendChild(li);
  });
  container.appendChild(ol);
}
