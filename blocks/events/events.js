import { readBlockConfig, toClassName } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import { createList, toggleFilter } from '../../scripts/list.js';
import { div, input, label, span } from '../../scripts/dom-helpers.js';

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

function createEventsDropdown(options, selected, name, placeholder) {
  const container = div({ class: 'select' });
  if (name) {
    container.setAttribute('name', name);
  }
  const btn = div({
    type: 'button',
    class: 'dropdown-toggle',
    value: '',
  }, selected || placeholder);
  btn.addEventListener('click', toggleFilter, false);
  container.append(btn);

  const dropDown = div({ class: 'dropdown-menu' });
  options.forEach((option) => {
    const fieldName = toClassName(option.toString());
    dropDown.append(label(
      { for: fieldName, class: 'filter-item' },
      input({
        type: 'checkbox',
        name: fieldName,
        id: fieldName,
      }),
      span(option)));
  });
  container.append(dropDown);

  console.log('created dropdown', container, 'options', options, 'selected', selected, name, placeholder);

  return container;
}

function createFilters(options) {
  console.log('filter options');
  return [
    createEventsDropdown(
      Array.from(new Set(options.data.map((n) => n.eventType))).filter((val) => val !== '0'),
      options.activeFilters.eventType,
      'event-type',
      'Event Type',
    ),
    createEventsDropdown(
      Array.from(new Set(options.data.map((n) => n.eventRegion))).filter((val) => val !== '0'),
      options.activeFilters.eventRegion,
      'event-region',
      'Region',
    ),
  ];
}

function compareEvents(eventA, eventB) {
  if (eventA.eventStart < eventB.eventStart) {
    return -1;
  }
  if (eventA.eventStart > eventB.eventStart) {
    return 1;
  }
  return 0;
}

function sortEvents(data, showFutureEvents) {
  data.sort(compareEvents);
  if (!showFutureEvents) {
    data.reverse();
  }
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
    createFilters(options),
    options,
    block);
}

async function fetchEvents(options) {
  const now = Date.now();
  return ffetch('/query-index.json')
    .sheet('events')
    .filter(({ eventEnd }) => (options.showArchivedEvents && eventEnd * 1000 < now)
        || (options.showFutureEvents && eventEnd * 1000 >= now))
    .all();
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const title = block.querySelector('h1');
  const relatedLink = block.querySelector('a');
  const showFutureEvents = document.querySelector('.events.future');
  const showArchivedEvents = document.querySelector('.events.archive');
  const options = {
    limitPerPage: parseInt(config.limitPerPage, 10) || 10,
    limitForPagination: parseInt(config.limitForPagination, 9) || 9,
    title: title ? title.innerHTML : '',
    panelTitle: 'Filter By :',
    noResult: 'No Event found !',
    relatedLink,
    showDescription: false,
    showFutureEvents,
    showArchivedEvents,
  };
  options.activeFilters = new Map();
  options.activeFilters.set('event-type', '');
  options.activeFilters.set('event-region', '');
  options.activeFilters.set('page', 1);

  options.onFilterClick = (event, _options) => {
    console.log('custom filter click', event, _options);
  };

  options.data = await fetchEvents(options);
  sortEvents(options.data, showFutureEvents);
  await createOverview(
    block,
    options);
}
