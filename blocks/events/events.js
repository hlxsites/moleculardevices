import { readBlockConfig, toClassName } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import createList from '../../scripts/list.js';

function prepareEntry(entry, showDescription, viewMoreText) {
  entry.filterTitle = toClassName(entry.title);
  entry.filterPath = toClassName(entry.path);
  entry.date = '0';
  const keywords = [];
  if (entry.eventType !== '0') keywords[keywords.length] = entry.eventType;
  if (entry.eventRegion !== '0') keywords[keywords.length] = entry.eventRegion;
  if (entry.eventAddress !== '0') keywords[keywords.length] = entry.eventAddress;
  entry.keywords = keywords;
  if (!showDescription) {
    entry.description = '';
  }
  if (viewMoreText) {
    entry.viewMoreText = viewMoreText;
  }
}

function createFilters(options, createDropdown) {
  return [
    createDropdown(Array.from(new Set(options.data.map((n) => n.filterTitle))), options.activeFilters.title, 'title', 'Select Title'),
    createDropdown(Array.from(new Set(options.data.map((n) => n.filterPath))), options.activeFilters.path, 'path', 'Select Path'),
  ];
}

async function createOverview(
  block,
  options,
) {
  block.innerHTML = '';
  options.data.forEach(
    (entry) => prepareEntry(entry, options.showDescription, options.viewMoreText),
  );
  await createList(
    createFilters,
    options,
    block);
}

async function fetchEvents() {
  return ffetch('/query-index.json')
    .sheet('events')
    .filter(({ date }) => (new Date(date * 1000) < new Date()))
    .all();
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const options = {
    limitPerPage: parseInt(config.limitPerPage, 10) || 10,
    limitForPagination: parseInt(config.limitForPagination, 9) || 9,
    showDescription: false,
    panelTitle: 'Filter By :',
  };
  options.activeFilters = new Map();
  options.activeFilters.set('title', '');
  options.activeFilters.set('path', '');
  // options.activeFilters.set('region', '');
  options.activeFilters.set('page', 1);

  options.data = await fetchEvents();
  await createOverview(
    block,
    options);
}
