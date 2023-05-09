import {
  createOptimizedPicture, loadCSS, toCamelCase, toClassName,
} from './lib-franklin.js';
import { formatDate, unixDateToString } from './scripts.js';
import {
  a, article, button, div, h2, h3, nav, p, span, ul, li,
} from './dom-helpers.js';

const classList = 'list';
const classListItems = 'items';
const classListItem = 'item';
const classItemCite = 'cite';
const classItemTitle = 'title';
const classItemKeywords = 'keyword-list';
const classItemDescription = 'description';
const classPanelTitle = 'panel-title';
const classFilter = 'filter';
const classFilterItem = 'filter-item';
const classFilterOpen = 'open';
const classFilterSelect = 'select';
const classDropdownToggle = 'dropdown-toggle';
const classDropdownMenu = 'dropdown-menu';
const classNoResult = 'no-result';
const classPagination = 'pagination';
const classPagerItem = 'pager-item';
const classPagerNav = 'pager-nav-item';
const classActive = 'active';
const classHidden = 'hidden';
const defaultImage = '/default-meta-image.png';

function filterData(options) {
  let { data } = options;
  const filters = options.activeFilters;
  filters.forEach((value, type) => {
    if (type !== 'page') {
      const filterAttribute = toCamelCase(`filter_${type}`);
      data = data
        .filter((n) => (!value || n[filterAttribute].toString() === value),
        );
    }
  });
  return data;
}

function toggleFilter(event) {
  const filterSelected = event.target.closest(`.${classFilterSelect}`);
  const filterIsOpen = filterSelected.classList.contains(classFilterOpen);
  const menu = filterSelected.querySelector(`.${classDropdownMenu}`);
  if (filterIsOpen) {
    filterSelected.classList.remove(classFilterOpen);
    menu.classList.remove(classFilterOpen);
  } else {
    filterSelected.classList.add(classFilterOpen);
    menu.classList.add(classFilterOpen);
  }
}

function renderListItem(item, idx) {
  let dt = (item.date && item.date !== '0') ? formatDate(unixDateToString(item.date)) : '';
  if (!dt && item.eventStart && item.eventEnd) {
    const startDate = (item.eventStart && item.eventStart !== '0') ? formatDate(unixDateToString(item.eventStart)).split(',')[0] : '';
    const endDate = (item.eventEnd && item.eventEnd !== '0') ? formatDate(unixDateToString(item.eventEnd)) : '';
    dt = (startDate && endDate) ? `${startDate} - ${endDate}` : '';
  }

  const hasImage = (!item.image.startsWith(defaultImage));
  return article({ class: classListItem },
    (hasImage) ? div({ class: 'image' },
      a({
        href: item.path,
        title: item.title,
      }, createOptimizedPicture(item.image, item.title, (idx === 0), [{ width: '500' }])),
    ) : '',
    div({ class: 'content' },
      p({ class: classItemCite }, (item.publisher && item.publisher !== '0') ? `${dt} | ${item.publisher}` : dt),
      p(
        a({
          class: classItemTitle,
          title: item.title,
          href: item.path,
        }, item.title),
      ),
      (item.keywords && item.keywords !== '0')
        ? ul({ class: classItemKeywords },
          ...item.keywords.map((keyword) => li({ class: classListItem }, keyword),
          ),
        ) : '',
      (item.description && item.description !== '0') ? span({ class: classItemDescription }, item.description) : '',
      (item.viewMoreText) ? a({
        class: 'view-more',
        title: item.viewMoreText,
        href: item.path,
      }, ` ${item.viewMoreText}`) : '',
    ),
  );
}

function createListItems(options) {
  const data = options.filteredData || options.data;
  const start = (options.activeFilters.get('page') - 1) * options.limitPerPage;
  const items = data.slice(start, start + options.limitPerPage);

  const itemsContainer = div({ class: classListItems });
  if (options.title) {
    itemsContainer.appendChild(h2({ class: 'event-title' }, options.title));
  }
  items.forEach((item, idx) => {
    itemsContainer.appendChild(renderListItem(item, idx));
  });
  if (items.length === 0) {
    itemsContainer.appendChild(h3({ class: classNoResult }, options.noResult));
  }
  return itemsContainer;
}

function swapData(options) {
  const items = document.querySelector(`.${classListItems}`);
  items.innerHTML = createListItems(options).innerHTML;
}

function getPaginationStart(options) {
  const page = options.activeFilters.get('page');
  let startIdx = Math.min(page, (options.maxPages - options.limitForPagination + 1));
  if (startIdx === page) startIdx = page - 1;
  if (startIdx < 1) startIdx = 1;
  return startIdx;
}

function getPaginationEnd(startIdx, options) {
  let endIdx = options.maxPages;
  if ((startIdx + options.limitForPagination) <= (options.maxPages)) {
    endIdx = (startIdx + options.limitForPagination - 1);
  }
  return endIdx;
}

async function switchPage(event, options) {
  const elem = event.target;

  options.activeFilters.set('page', parseInt(elem.getAttribute('name'), 10));

  const pagination = elem.closest(`.${classPagination}`);
  const current = pagination.querySelector(`.${classPagerItem}.${classActive}`);
  if (current) { current.classList.remove(`${classActive}`); }

  const selected = options.activeFilters.get('page');
  const { maxPages } = options;

  const pagerItem = pagination.querySelectorAll(`.${classPagerItem}`);
  const startIdx = getPaginationStart(options);
  const endIdx = getPaginationEnd(startIdx, options);
  pagerItem.forEach((item) => {
    item.classList.remove(`${classHidden}`);
    const pager = parseInt(item.getAttribute('name'), 10);
    if (pager < startIdx || pager > endIdx) {
      item.classList.add(`${classHidden}`);
    }
  });

  const pagerNav = pagination.querySelectorAll(`.${classPagerNav}`);
  pagerNav[1].setAttribute('name', Math.max(selected - 1, 1));
  pagerNav[2].setAttribute('name', Math.min(selected + 1, maxPages));
  pagerNav.forEach((item, idx) => {
    item.classList.remove(`${classHidden}`);
    if (
      (idx < 2 && selected === 1) // prev nav buttons
      || (idx > 1 && selected > (endIdx - 1)) // next nav buttons
    ) {
      item.classList.add(`${classHidden}`);
    }
  });

  pagination.querySelector(`.${classPagerItem}[name="${selected}"]:not(.${classPagerNav})`).classList.add(classActive);

  swapData(options);
  document.querySelector(`.${classList}`).scrollIntoView();
}

function createDropdown(options, selected, name, placeholder) {
  const container = div({ class: classFilterSelect });
  if (name) {
    container.setAttribute('name', name);
  }
  if (placeholder) {
    const btn = div({
      type: 'button',
      class: classDropdownToggle,
      value: '',
    }, selected || placeholder);
    btn.addEventListener('click', toggleFilter, false);
    container.append(btn);

    options.unshift(placeholder);
  }

  const dropDown = div({ class: classDropdownMenu });
  options.forEach((option) => {
    const optionTag = p({
      class: classFilterItem,
      name: toClassName(option.toString()),
    }, option,
    );
    if (option === placeholder) {
      optionTag.classList.add('reset');
    }
    dropDown.append(optionTag);
  });
  container.append(dropDown);
  return container;
}

function createPaginationItem(page, active, label, hide) {
  const btn = button({
    class: classPagerItem,
    name: page,
  }, label || page);
  const isNavElem = (label);
  if (isNavElem) {
    btn.classList.add(classPagerNav);
  }
  if (hide) {
    btn.classList.add(classHidden);
  }
  if (page === active && !hide && !isNavElem) {
    btn.classList.add(classActive);
  }
  return btn;
}

export async function renderPagination(container, options, ajaxCall) {
  const data = options.filteredData || options.data;
  options.maxPages = Math.ceil(data.length / options.limitPerPage);
  const page = options.activeFilters.get('page');

  const pageNav = nav({ class: classPagination });
  if (options.maxPages > 1) {
    const startIdx = getPaginationStart(options);
    const endIdx = getPaginationEnd(startIdx, options);

    pageNav.append(createPaginationItem(1, page, '«', page === 1));
    pageNav.append(createPaginationItem(page - 1, page, '‹', page === 1));

    // eslint-disable-next-line no-plusplus
    for (let i = startIdx; i <= endIdx; i++) {
      if (i > 0) {
        pageNav.append(createPaginationItem(i, page, '', false));
      }
    }
    // eslint-disable-next-line no-plusplus
    for (let j = endIdx + 1; j <= options.maxPages; j++) {
      if (j > 0) {
        pageNav.append(createPaginationItem(j, page, '', true));
      }
    }
    pageNav.append(createPaginationItem(page + 1, page, '›', page === options.maxPages));
    pageNav.append(createPaginationItem(options.maxPages, page, '»', page === options.maxPages));
  }
  if (ajaxCall) {
    container.querySelector(`.${classPagination}`).remove();
  }
  container.append(pageNav);

  const pagerItems = container.querySelectorAll(`.${classPagination} .${classPagerItem}`);
  pagerItems.forEach((pagerItem) => {
    pagerItem.addEventListener('click', (event) => {
      switchPage(event, options);
    }, false);
  }, false);

  return nav;
}

async function switchFilter(event, options) {
  const elem = event.target;
  const filter = elem.closest(`.${classFilterSelect}`);
  const filterType = filter.getAttribute('name');
  if (elem.classList.contains('reset')) {
    options.activeFilters.set(filterType, '');
  } else {
    options.activeFilters.set(filterType, elem.getAttribute('name'));
  }
  options.activeFilters.set('page', 1);
  options.filteredData = filterData(options);

  const selected = filter.querySelector(`.${classDropdownToggle}`);
  selected.innerHTML = elem.innerText;

  renderPagination(document.querySelector(`.${classList}`), options, true);
  toggleFilter(event);
  swapData(options);
}

function renderFilters(options, createFilters) {
  const filter = div({ class: classFilter });

  const filters = createFilters(options, createDropdown);
  if (filters.length > 0) {
    if (options.panelTitle) {
      const header = p({ class: classPanelTitle }, options.panelTitle);
      filter.append(header);
    }

    filter.append(
      ...filters,
    );

    if (options.relatedLink) {
      filter.append(p({}, options.relatedLink));
    }

    const menuItems = filter.querySelectorAll(`.${classFilterSelect} .${classDropdownMenu} .${classFilterItem}`);
    menuItems.forEach((menuItem) => {
      menuItem.addEventListener('click', (event) => {
        switchFilter(event, options);
      }, false);
    }, false);

    return filter;
  }

  return null;
}

export default async function createList(
  createFilters,
  options,
  root,
) {
  const listCSSPromise = new Promise((resolve) => {
    loadCSS('../styles/list.css', (e) => resolve(e));
  });

  if (options.data) {
    const container = div({ class: classList },
      renderFilters(options, createFilters),
      createListItems(options),
    );
    root.append(container);
    renderPagination(container, options, false);
  }
  await listCSSPromise;
}
