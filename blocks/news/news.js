import {
  readBlockConfig,
  toClassName,
} from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import createList from '../../scripts/list.js';

function formatDateFullYear(unixDateString) {
  return new Date(unixDateString * 1000).getFullYear();
}

function filterEntries(entries, activeFilters) {
  let filteredEntries = entries;
  if (activeFilters.year) {
    filteredEntries = filteredEntries
      .filter((n) => toClassName(n.filterDate.toString()).includes(activeFilters.year));
  }
  return filteredEntries;
}

function createFilters(entries, activeFilters, createDropdown) {
  const date = Array.from(new Set(entries.map((n) => n.filterDate)));
  return [
    createDropdown(date, activeFilters.year, 'select-year', 'Select Year'),
  ];
}

function prepareEntry(entry, showDescription, viewMoreText) {
  entry.filterDate = formatDateFullYear(entry.date);
  if (!showDescription) {
    entry.description = '';
  }
  if (viewMoreText) {
    entry.viewMoreText = viewMoreText;
  }
}

export async function createOverview(
  block,
  entries,
  limit,
  paginationLimit,
  showDescription,
  viewMoreText,
) {
  block.innerHTML = '';

  entries.forEach((entry) => prepareEntry(entry, showDescription, viewMoreText));

  const panelTitle = 'Filter By :';
  await createList(
    entries,
    filterEntries,
    createFilters,
    limit,
    paginationLimit,
    block,
    panelTitle);
}

export async function fetchEntries(type) {
  const entries = await ffetch('/query-index.json')
    .sheet(type)
    .all();
  return entries;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const limit = parseInt(config.limit, 10) || 10;
  const paginationLimit = parseInt(config.paginationLimit, 9) || 9;
  const entries = await fetchEntries('news');
  const showDescription = false;
  const viewMoreText = '';
  // console.log(`found ${entries.length} entries`);
  await createOverview(block, entries, limit, paginationLimit, showDescription, viewMoreText);
}
