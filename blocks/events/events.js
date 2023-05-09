import { readBlockConfig, toClassName } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import createList from '../../scripts/list.js';

function prepareEntry(entry, showDescription, viewMoreText) {
  entry.filterEventType = toClassName(entry.eventType);
  entry.filterEventRegion = toClassName(entry.eventRegion);
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
    createDropdown(
      Array.from(new Set(options.data.map((n) => n.eventType))).filter((val) => val !== '0'),
      options.activeFilters.eventType,
      'event-type',
      'Select Event Type',
    ),
    createDropdown(
      Array.from(new Set(options.data.map((n) => n.eventRegion))).filter((val) => val !== '0'),
      options.activeFilters.eventRegion,
      'event-region',
      'Select Region',
    ),
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
  const showFutureEvents = document.querySelector('.events.future');
  const showArchivedEvents = document.querySelector('.events.archive');
  const now = Date.now();
  return ffetch('/query-index.json')
    .sheet('events')
    .filter(({ eventEnd }) => (showArchivedEvents && eventEnd * 1000 < now)
        || (showFutureEvents && eventEnd * 1000 >= now))
    .all();
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const title = block.querySelector('h1');
  const relatedLink = block.querySelector('a');
  const options = {
    limitPerPage: parseInt(config.limitPerPage, 10) || 10,
    limitForPagination: parseInt(config.limitForPagination, 9) || 9,
    title: title ? title.innerHTML : '',
    panelTitle: 'Filter By :',
    noResult: 'No Event found !',
    relatedLink,
    showDescription: false,
  };
  options.activeFilters = new Map();
  options.activeFilters.set('event-type', '');
  options.activeFilters.set('event-region', '');
  options.activeFilters.set('page', 1);

  options.data = await fetchEvents();
  await createOverview(
    block,
    options);
}
