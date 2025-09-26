import {
  a, li, domEl, span,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { loadCSS } from '../../scripts/lib-franklin.js';
import customBreadcrumbs, { customResourcesBreadcrumb } from './customBreadcrumbs.js';

const customResourceTypes = ['Videos and Webinars', 'Application Note', 'Cell Counter', 'Interactive Demo'];

function prependSlash(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function skipParts(pathSplit) {
  const partsToSkip = ['en', 'assets', 'br', 'img', 'citations', 'dd', 'tutorials-videos', 'bpd', 'cns', 'flipr', 'contaminants', 'enzyme'];
  return pathSplit.filter((item) => !partsToSkip.includes(item));
}

function decodeHTMLEntities(str) {
  return new DOMParser().parseFromString(str, 'text/html').body.textContent || '';
}

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
  if (customBreadcrumbs[part]) return customBreadcrumbs[part].name;
  if (customBreadcrumbs[path]) return customBreadcrumbs[path].name;

  const pg = pageIndex.find((page) => page.path === path);
  if (pg && pg.h1 && pg.h1 !== '0') return pg.h1;
  if (pg && pg.title && pg.title !== '0') return pg.title;

  if (current) {
    const headingElement = document.querySelector('main h1');
    const htmlContent = headingElement.innerHTML;

    // Replace <br> with space and remove all other HTML tags
    const heading = htmlContent
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '');

    const breadcrumbTitle = document.originalTitle
      || (document.title.includes('| Molecular Devices') ? heading : document.title);
    return decodeHTMLEntities(breadcrumbTitle);
  }

  return part;
}

export default async function createBreadcrumbs(container) {
  const breadCrumbsCSS = loadCSS('/blocks/breadcrumbs/breadcrumbs.css');

  const path = window.location.pathname;
  const pathSplit = skipParts(path.split('/'));

  const pageIndex = await ffetch('/query-index.json').all();
  const pg = pageIndex.find((page) => page.path === path);

  // default Home breadcrumb
  const breadcrumbs = [
    { name: 'Home', url_path: '/' },
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

  // render to ol list
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
