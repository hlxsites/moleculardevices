import { readBlockConfig, toCamelCase, toClassName } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import {
  createList, renderPagination, swapData, toggleFilter,
} from '../../scripts/list.js';
import {
  div, input, label, span,
} from '../../scripts/dom-helpers.js';

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
      { for: fieldName },
      input({
        type: 'checkbox',
        name: fieldName,
        id: fieldName,
        class: 'filter-item',
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

export function customToggleFilter(event) {
  const filterSelected = event.target.closest('.select');
  const filterIsOpen = filterSelected.classList.contains('open');
  if (filterIsOpen) {
    filterSelected.classList.remove('open');
  } else {
    filterSelected.classList.add('open');
  }
}

function eventsFilterData(options) {
  let { data } = options;
  const filters = options.activeFilters;

  filters.forEach((value, type) => {
    if (type !== 'page') {
      const filterAttribute = toCamelCase(`filter_${type}`);
      data = data
        .filter((n) => value.size === 0 || value.has(n[filterAttribute]));
    }
  });

  return data;
}

async function updateFilter(event, options) {
  const elem = event.target;
  const filter = elem.closest('.select');
  const filterType = filter.getAttribute('name');

  const elemName = elem.getAttribute('name');

  console.log('element clicked:', elem, 'name', elemName);

  const currentFilter = options.activeFilters.get(filterType);
  if (event.target.checked) {
    currentFilter.add(elemName);
    console.log('Checkbox is checked');
  } else {
    currentFilter.delete(elemName);
    console.log('Checkbox is unchecked');
  }
  options.activeFilters.set(filterType, currentFilter);

  options.activeFilters.set('page', 1);
  options.filteredData = eventsFilterData(options);

  console.log('filtered data', options.filteredData);

  // const selected = filter.querySelector('.dropdown-toggle');
  // selected.innerHTML = elem.innerText;

  renderPagination(document.querySelector('.list'), options, true);
  // customToggleFilter(event);
  swapData(options);
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
  options.activeFilters.set('event-type', new Set());
  options.activeFilters.set('event-region', new Set());
  options.activeFilters.set('page', 1);

  options.onFilterClick = updateFilter;

  options.data = await fetchEvents(options);
  sortEvents(options.data, showFutureEvents);
  await createOverview(
    block,
    options);
}
