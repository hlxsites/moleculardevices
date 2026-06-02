import {
  fetchPlaceholders, readBlockConfig,
} from '../../scripts/lib-franklin.min.js';
import { createList, createDropdown } from '../../scripts/list.js';
import { getData } from '../../scripts/scripts.js';

let placeholders = {};

function formatDateFullYear(unixDateString) {
  return new Date(unixDateString * 1000).getFullYear();
}

function createFilters(options) {
  const date = Array.from(new Set(options.data.map((n) => n.filterYear)));
  return [
    createDropdown(date, options.activeFilters.year, 'year', placeholders.selectYear || 'Select Year'),
  ];
}

function prepareEntry(entry, showDescription, viewMoreText) {
  entry.filterYear = formatDateFullYear(entry.date);
  if (!showDescription) {
    entry.description = '';
  }
  if (viewMoreText) {
    entry.viewMoreText = viewMoreText;
  }
}

export async function createOverview(
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

export default async function decorate(block) {
  const config = readBlockConfig(block);
  placeholders = await fetchPlaceholders();
  const options = {
    limitPerPage: parseInt(config.limitPerPage, 10) || 10,
    limitForPagination: parseInt(config.limitForPagination, 9) || 9,
    showDescription: false,
    viewMoreText: '',
    panelTitle: `${placeholders.filterBy || 'Filter By'} :`,
  };
  options.activeFilters = new Map();
  options.activeFilters.set('year', '');
  options.activeFilters.set('page', 1);

  const { news } = await getData();
  options.data = news;

  await createOverview(
    block,
    options);
}
