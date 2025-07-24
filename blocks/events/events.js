import {
  createOptimizedPicture,
  fetchPlaceholders, loadCSS, readBlockConfig, toCamelCase, toClassName,
} from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import {
  createList, renderPagination, swapData, toggleFilter,
} from '../../scripts/list.js';
import {
  a,
  div, h2, input, label, p, span,
} from '../../scripts/dom-helpers.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';
import { formatEventDateRange } from '../event-summary/event-summary.js';

const DEFAULT_REGIONS = [
  'Africa',
  'Asia Pacific',
  'Central & South America',
  'Europe',
  'Middle East',
  'North America',
];

let placeholders = {};

function splitByComma(value) {
  return value.split(',').map((s) => s.trim());
}

function prepareEntry(entry, showDescription, viewMoreText) {
  entry.filterEventType = splitByComma(entry.eventType).map(toClassName);
  entry.filterEventRegion = splitByComma(entry.eventRegion).map(toClassName);
  entry.date = '0';
  const keywords = [];
  if (entry.eventType !== '0') keywords[keywords.length] = entry.eventType;
  if (entry.eventRegion !== '0') keywords[keywords.length] = entry.eventRegion;
  if (entry.eventAddress !== '0') keywords[keywords.length] = entry.eventAddress;
  entry.keywords = keywords;
  if (!showDescription) entry.description = '';
  if (viewMoreText) entry.viewMoreText = viewMoreText;
}

function createEventsDropdown(options, selected, name, placeholder) {
  const container = div({ class: 'select' });
  container.setAttribute('name', name);

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

  return container;
}

function createFilters(options) {
  const existingEventRegions = Array.from(new Set(
    options.data.flatMap((n) => splitByComma(n.eventRegion))
      .filter((val) => val !== '0'),
  ));
  return [
    createEventsDropdown(
      Array.from(new Set(
        options.data.flatMap((n) => splitByComma(n.eventType))
          .filter((val) => val !== '0'),
      )),
      options.activeFilters.eventType,
      'event-type',
      placeholders.eventType || 'Event Type',
    ),
    createEventsDropdown(
      DEFAULT_REGIONS.concat(
        existingEventRegions.filter((item) => DEFAULT_REGIONS.indexOf(item) < 0),
      ).sort(),
      options.activeFilters.eventRegion,
      'event-region',
      placeholders.region || 'Region',
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

function createFeaturedEventCard(featuredEvent, root) {
  if (root) {
    loadCSS('/blocks/event-summary/event-summary.css');
    const socials = ['facebook', 'linkedin', 'twitter', 'youtube-play'];
    const featuredBanner = div({ class: 'event-summary' },
      (div({ class: 'event-banner featured-event-banner' },
        div({ class: 'left-col' },
          a({ href: featuredEvent.path },
            createOptimizedPicture(featuredEvent.image, featuredEvent.title))),
        div({ class: 'right-col' },
          div(
            p({ class: 'cite' }, featuredEvent.eventType),
            h2({ class: 'event-title' }, a({ href: featuredEvent.path }, featuredEvent.title)),
            p({ class: 'event-date' }, formatEventDateRange(featuredEvent.eventStart * 1000, featuredEvent.eventEnd * 1000)),
            p(featuredEvent.eventAddress),
            p(featuredEvent.eventRegion),
          ),
          socialShareBlock('Share this event', socials),
        ))));
    decorateIcons(featuredBanner);
    root.appendChild(featuredBanner);
  }
}

async function createOverview(block, options) {
  block.innerHTML = '';
  options.data.forEach(
    (entry) => prepareEntry(entry, options.showDescription, options.viewMoreText),
  );
  if (options.featuredEvent) createFeaturedEventCard(options.featuredEvent, block);
  await createList(createFilters(options), options, block);
}

async function fetchEvents(options) {
  const now = Date.now();
  return ffetch('/query-index.json')
    .sheet('events')
    .filter(({ eventEnd }) => (options.showArchivedEvents && eventEnd * 1000 < now)
      || (options.showFutureEvents && eventEnd * 1000 >= now))
    .all();
}

function eventsFilterData(options) {
  let { data } = options;
  const filters = options.activeFilters;

  filters.forEach((value, type) => {
    if (type !== 'page') {
      const filterAttribute = toCamelCase(`filter_${type}`);
      data = data
        .filter((n) => value.size === 0
          || n[filterAttribute].some((filterValue) => value.has(filterValue)));
    }
  });

  return data;
}

async function updateFilter(event, options) {
  const elem = event.target;
  const filter = elem.closest('.select');
  const filterType = filter.getAttribute('name');

  const elemName = elem.getAttribute('name');
  const currentFilter = options.activeFilters.get(filterType);
  if (event.target.checked) {
    currentFilter.add(elemName);
  } else {
    currentFilter.delete(elemName);
  }

  options.activeFilters.set('page', 1);
  options.filteredData = eventsFilterData(options);

  renderPagination(document.querySelector('.list'), options, true);
  swapData(options);
}

export default async function decorate(block) {
  const featuredEventEl = block.querySelector('.button-container:first-of-type > a');
  const featuredEventLink = block.querySelector('a[title="Featured Events"]');
  const config = readBlockConfig(block);
  const title = block.querySelector('h1');
  const relatedLink = block.querySelector('a');
  const featuredEvent = featuredEventLink.href || featuredEventEl.href;
  const showFutureEvents = document.querySelector('.events.future');
  const showArchivedEvents = document.querySelector('.events.archive');
  const featuredPath = new URL(featuredEvent).pathname;
  placeholders = await fetchPlaceholders();

  const options = {
    limitPerPage: parseInt(config.limitPerPage, 10) || 10,
    limitForPagination: parseInt(config.limitForPagination, 9) || 9,
    title: title ? title.innerHTML : '',
    panelTitle: `${placeholders.filterBy || 'Filter By'} :`,
    noResult: `${placeholders.noEventFound || 'No Event found'} !`,
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

  options.featuredEvent = options.data.find((option) => option.path === featuredPath);
  options.data = options.data.filter((option) => option.path !== featuredPath);
  sortEvents(options.data, showFutureEvents);
  await createOverview(block, options);
}
