import {
  readBlockConfig,
  toClassName,
} from '../../scripts/lib-franklin.js';
import createList from '../../scripts/list.js';

function linkPicture(picture) {
  const checkAndAppendLink = (anchor) => {
    if (anchor && anchor.textContent.trim().startsWith('https://')) {
      anchor.innerHTML = '';
      anchor.className = '';
      anchor.appendChild(picture);
    }
  };

  // Handle case where link is directly after image, or with a <br> between.
  let nextSib = picture.nextElementSibling;
  if (nextSib?.tagName === 'BR') {
    const br = nextSib;
    nextSib = nextSib.nextElementSibling;
    br.remove();
  }

  if (nextSib?.tagName === 'A') {
    checkAndAppendLink(nextSib);
    return;
  }

  // Handle case where link is in a separate paragraph
  const parent = picture.parentElement;
  const parentSibling = parent.nextElementSibling;
  if (parent.tagName === 'P' && parentSibling?.tagName === 'P') {
    const maybeA = parentSibling.children?.[0];
    if (parentSibling.children?.length === 1 && maybeA?.tagName === 'A') {
      checkAndAppendLink(maybeA);
      if (parent.children.length === 0) {
        parent.remove();
      }
    }
  }
}

export function decorateLinkedPictures(block) {
  block.querySelectorAll('picture').forEach((picture) => {
    linkPicture(picture);
  });
}

/**
 * Converts an excel date to human readable date
 *
 * @param {excelDate} the Excel style date
 * @returns the converted date
 */
function convertDate(excelDate) {
  return new Date(Math.round((+excelDate - (1 + 25567 + 1)) * 86400 * 1000)); // excel date
}

async function getIndex(index, indexUrl) {
  window.pageIndex = window.pageIndex || {};
  if (!window.pageIndex[index]) {
    const resp = await fetch(indexUrl);
    if (!resp.ok) {
      // eslint-disable-next-line no-console
      console.error('loading index', resp);
      return []; // do not cache in case of error
    }
    const json = await resp.json();
    window.pageIndex[index] = json.data;
  }
  return window.pageIndex[index];
}

/**
 * Get the list of press release news from the query index.
 *
 * @param {number} limit the number of entries to return
 * @returns the posts as an array
 */
async function getNews(limit) {
  const indexUrl = new URL(
    '/newstermine/query-index-news.json',
    window.location.origin,
  );
  indexUrl.searchParams.set('sheet', 'news');
  let index = 'news';
  if (limit) {
    indexUrl.searchParams.set('limit', limit);
    index = index.concat(`-${limit}`);
  }

  const newsEntries = await getIndex(index, indexUrl.toString());
  return newsEntries;
}

function filterNews(news, activeFilters) {
  let filteredNews = news;

  if (activeFilters.date) {
    filteredNews = filteredNews
      .filter((n) => toClassName(n.filterDate).includes(activeFilters.date));
  }
  return filteredNews;
}

function createFilters(news, activeFilters, createDropdown) {
  const date = Array.from(new Set(news.map((n) => n.filterDate)));

  return [
    createDropdown(date, activeFilters.date, 'date', 'Termine'),
  ];
}

function createNewsOverview(news, block) {
  const config = readBlockConfig(block);
  const limit = parseInt(config.limit, 10) || 10;
  block.innerHTML = '';

  // prepare custom "Month Year" date field
  news.forEach((n) => {
    n.filterDate = convertDate(n.publishDate).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
    });
    n.filterCategory = n.categories.split(',').shift();
  });

  createList(news, filterNews, createFilters, limit, block);
}

export default async function decorate(block) {
  const limit = 10;

  const news = await getNews(limit);
  createNewsOverview(news, block);
}
