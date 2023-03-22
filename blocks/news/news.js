import {
  readBlockConfig,
  toClassName,
} from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
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
 * Get the list of press release news from the query index.
 *
 * @param {number} limit the number of entries to return
 * @returns the posts as an array
 */
async function getNews() {
  const newsEntries = await ffetch('/query-index.json')
    .sheet('news')
    .all();
  newsEntries.sort((a, b) => b.date - a.date);
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
    createDropdown(date, activeFilters.date, 'date', 'Select Year'),
  ];
}

function formatDate(newsDate) {
  const dateObj = new Date(0);
  dateObj.setUTCSeconds(newsDate);

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatDateFullYear(newsDate) {
  const dateObj = new Date(0);
  dateObj.setUTCSeconds(newsDate);

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
  });
}

function createNewsOverview(news, block) {
  const config = readBlockConfig(block);
  // eslint-disable-next-line radix
  const limit = parseInt(config.limit, 10) || 10;
  block.innerHTML = '';

  // prepare custom date fields
  news.forEach((n) => {
    n.newsDate = formatDate(n.date);
    n.filterDate = formatDateFullYear(n.date);
  });

  createList(news, filterNews, createFilters, limit, block);
}

export default async function decorate(block) {
  const news = await getNews();
  createNewsOverview(news, block);
}
