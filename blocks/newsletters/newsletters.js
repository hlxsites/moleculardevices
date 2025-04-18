import {
  fetchPlaceholders,
  readBlockConfig,
  toClassName,
} from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import {
  createList, createDropdown, renderPagination, swapData,
  toggleFilter,
} from '../../scripts/list.js';
import { a } from '../../scripts/dom-helpers.js';
import { toTitleCase } from '../../scripts/scripts.js';

let placeholders = {};

function formatDateFullYear(unixDateString) {
  return new Date(unixDateString * 1000).getFullYear();
}

function formatDateMonthAndYear(unixDateString) {
  const date = new Date(unixDateString * 1000);
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

function createFilters(currentYear, options) {
  const filteredDataByYear = Array.from(new Set(options.data.map((n) => n.filterYear)));
  const filteredDataByMonth = Array.from(new Set(options.data.map((n) => (n.filterYear === currentYear ? toTitleCase(n.filterMonth) : '0'))));
  const monthFilter = filteredDataByMonth.filter((month) => month !== '0');
  return [
    createDropdown(filteredDataByYear, currentYear, 'year', placeholders.selectYear || 'Select Year'),
    createDropdown(monthFilter, options.activeFilters.month, 'month', placeholders.selectMonth || 'Select Month'),
  ];
}

function prepareEntry(entry, showDescription, viewMoreText) {
  entry.filterYear = formatDateFullYear(entry.date).toString();
  entry.filterMonth = toClassName(formatDateMonthAndYear(entry.date));
  if (!showDescription) {
    entry.description = '';
  }
  if (viewMoreText) {
    entry.viewMoreText = viewMoreText;
  }
}

export async function createOverview(block, options) {
  const currentYear = new Date().getFullYear().toString();
  block.innerHTML = '';
  options.data.forEach(
    (entry) => prepareEntry(entry, options.showDescription, options.viewMoreText),
  );

  // Filter data by year initially
  options.filteredData = options.data.filter((entry) => entry.filterYear === currentYear);

  // Create filters
  const yearFilter = createFilters(currentYear, options);
  await createList(yearFilter, options, block);
}

function bindFilterEvents(options) {
  document.querySelectorAll('.filter-item').forEach((el) => {
    el.addEventListener('click', toggleFilter, false);
    el.addEventListener('click', (e) => options.onFilterClick(e, options));
  });
}

function newsletterFilterData(options) {
  let { data } = options;
  const filters = options.activeFilters;
  const year = filters.get('year');
  const month = filters.get('month');

  // Apply filters
  if (year) {
    data = data.filter((item) => item.filterYear === toClassName(year));
  }

  if (month) {
    data = data.filter((item) => item.filterMonth === toClassName(month));
  }

  return data;
}

async function updateFilter(event, options) {
  const elem = event.target;
  if (!elem.classList.contains('filter-item')) return;

  const dropdownMenu = elem.closest('.dropdown-menu');
  const selectWrapper = dropdownMenu.closest('.select');
  const filterType = selectWrapper.getAttribute('name');
  const selectedValue = elem.getAttribute('name');
  const toggle = selectWrapper.querySelector('.dropdown-toggle');
  const valueToSet = selectedValue.startsWith('select-') ? '' : selectedValue;

  toggle.textContent = elem.textContent;
  toggle.setAttribute('value', valueToSet);

  options.activeFilters.set(filterType, valueToSet);

  if (filterType === 'year') {
    options.activeFilters.set('month', '');

    const updatedFilters = createFilters(valueToSet, options);
    const filterContainer = document.querySelector('.filter');
    if (filterContainer) {
      filterContainer.innerHTML = '';
      updatedFilters.forEach((el) => filterContainer.appendChild(el));
      bindFilterEvents(options);
    }
  }

  options.activeFilters.set('page', 1);
  options.filteredData = newsletterFilterData(options);

  renderPagination(document.querySelector('.list'), options, true);
  swapData(options);
}

export async function fetchData() {
  return ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Newsletter')
    .all();
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
  options.activeFilters.set('month', '');
  options.activeFilters.set('page', 1);

  options.data = await fetchData();
  options.onFilterClick = updateFilter;

  /* add button in hero banner */
  const banner = document.querySelector('.hero.newsletters');
  const heading = banner.querySelector('h1');
  const ctaBtn = a({ class: 'button primary', href: options.data[0].gatedURL, target: '_blank' }, 'View Latest Newsletter');
  heading.insertAdjacentElement('afterend', ctaBtn);

  await createOverview(block, options);
  bindFilterEvents(options);
}
