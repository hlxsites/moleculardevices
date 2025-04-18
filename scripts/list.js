import {
  createOptimizedPicture, loadCSS, toCamelCase, toClassName,
} from './lib-franklin.js';
import { formatDate, unixDateToString } from './scripts.js';
import {
  a, article, button, div, h2, h3, nav, p, span, ul, li,
} from './dom-helpers.js';

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

export function toggleFilter(event) {
  const filterSelected = event.target.closest('.select');
  const filterIsOpen = filterSelected.classList.contains('open');
  const menu = filterSelected.querySelector('.dropdown-menu');
  if (filterIsOpen) {
    filterSelected.classList.remove('open');
    menu.classList.remove('open');
  } else {
    filterSelected.classList.add('open');
    menu.classList.add('open');
  }
}

function hasImage(imgPath) {
  return (!imgPath.startsWith('/default-meta-image.png'));
}

function renderListItem(item, idx) {
  let dt = (item.date && item.date !== '0') ? formatDate(unixDateToString(item.date)) : '';
  if (!dt && item.eventStart && item.eventEnd) {
    const startDate = (item.eventStart && item.eventStart !== '0') ? formatDate(unixDateToString(item.eventStart)).split(',')[0] : '';
    const endDate = (item.eventEnd && item.eventEnd !== '0') ? formatDate(unixDateToString(item.eventEnd)) : '';
    dt = (startDate && endDate) ? `${startDate} - ${endDate}` : '';
  }

  const thumbImage = item.thumbnail && item.thumbnail !== '0' ? item.thumbnail : item.image;
  return article({ class: 'item' },
    (hasImage(item.image)) ? div({ class: 'image' },
      a({
        href: item.type === 'Newsletter' ? item.gatedURL : item.path,
        target: item.type === 'Newsletter' ? '_blank' : '',
        title: item.title,
      }, createOptimizedPicture(thumbImage, item.title, (idx === 0), [{ width: '500' }])),
    ) : '',
    div({ class: 'content' },
      p({ class: 'cite' }, (item.publisher && item.publisher !== '0') ? `${dt} | ${item.publisher}` : dt),
      p(
        a({
          class: 'title',
          title: item.title,
          href: item.type === 'Newsletter' ? item.gatedURL : item.path,
          target: item.type === 'Newsletter' ? '_blank' : '',
        }, item.title),
      ),
      (item.keywords && item.keywords !== '0')
        ? ul({ class: 'keyword-list' },
          ...item.keywords.map((keyword) => li({ class: 'item' }, keyword),
          ),
        ) : '',
      (item.description && item.description !== '0') ? span({ class: 'description' }, item.description) : '',
      (item.viewMoreText) ? a({
        class: 'view-more',
        title: item.viewMoreText,
        href: item.type === 'Newsletter' ? item.gatedURL : item.path,
        target: item.type === 'Newsletter' ? '_blank' : '',
      }, ` ${item.viewMoreText}`) : '',
    ),
  );
}

function createListItems(options) {
  const data = options.filteredData || options.data;
  const start = (options.activeFilters.get('page') - 1) * options.limitPerPage;
  const items = data.slice(start, start + options.limitPerPage);

  const itemsContainer = div({ class: 'items' });
  if (options.title) {
    itemsContainer.appendChild(h2({ class: 'event-title' }, options.title));
  }
  items.forEach((item, idx) => {
    itemsContainer.appendChild(renderListItem(item, idx));
  });
  if (items.length === 0) {
    itemsContainer.appendChild(h3({ class: 'no-result' }, options.noResult));
  }
  return itemsContainer;
}

export function swapData(options) {
  const items = document.querySelector('.items');
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

  const pagination = elem.closest('.pagination');
  const current = pagination.querySelector('.pager-item.active');
  if (current) { current.classList.remove('active'); }

  const selected = options.activeFilters.get('page');
  const { maxPages } = options;

  const pagerItem = pagination.querySelectorAll('.pager-item');
  const startIdx = getPaginationStart(options);
  const endIdx = getPaginationEnd(startIdx, options);
  pagerItem.forEach((item) => {
    item.classList.remove('hidden');
    const pager = parseInt(item.getAttribute('name'), 10);
    if (pager < startIdx || pager > endIdx) {
      item.classList.add('hidden');
    }
  });

  const pagerNav = pagination.querySelectorAll('.pager-nav-item');
  pagerNav[1].setAttribute('name', Math.max(selected - 1, 1));
  pagerNav[2].setAttribute('name', Math.min(selected + 1, maxPages));
  pagerNav.forEach((item, idx) => {
    item.classList.remove('hidden');
    if (
      (idx < 2 && selected === 1) // prev nav buttons
      || (idx > 1 && selected > (endIdx - 1)) // next nav buttons
    ) {
      item.classList.add('hidden');
    }
  });

  pagination.querySelector(`.pager-item[name="${selected}"]:not(.pager-nav-item)`).classList.add('active');

  swapData(options);
  document.querySelector('.list').scrollIntoView();
}

export function createDropdown(options, selected, name, placeholder) {
  const container = div({ class: 'select' });
  if (name) {
    container.setAttribute('name', name);
  }
  if (placeholder) {
    const btn = div({
      type: 'button',
      class: 'dropdown-toggle',
      value: '',
    }, selected || placeholder);
    btn.addEventListener('click', toggleFilter, false);
    container.append(btn);

    options.unshift(placeholder);
  }

  const dropDown = div({ class: 'dropdown-menu' });
  options.forEach((option) => {
    const optionTag = p({
      class: 'filter-item',
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
    class: 'pager-item',
    name: page,
  }, label || page);
  const isNavElem = (label);
  if (isNavElem) {
    btn.classList.add('pager-nav-item');
  }
  if (hide) {
    btn.classList.add('hidden');
  }
  if (page === active && !hide && !isNavElem) {
    btn.classList.add('active');
  }
  return btn;
}

export async function renderPagination(container, options, ajaxCall) {
  const data = options.filteredData || options.data;
  options.maxPages = Math.ceil(data.length / options.limitPerPage);
  const page = options.activeFilters.get('page');

  const pageNav = nav({ class: 'pagination' });
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
    container.querySelector('.pagination').remove();
  }
  container.append(pageNav);

  const pagerItems = container.querySelectorAll('.pagination .pager-item');
  pagerItems.forEach((pagerItem) => {
    pagerItem.addEventListener('click', (event) => {
      switchPage(event, options);
    }, false);
  }, false);

  return nav;
}

async function switchFilter(event, options) {
  const elem = event.target;
  const filter = elem.closest('.select');
  const filterType = filter.getAttribute('name');
  if (elem.classList.contains('reset')) {
    options.activeFilters.set(filterType, '');
  } else {
    options.activeFilters.set(filterType, elem.getAttribute('name'));
  }
  options.activeFilters.set('page', 1);
  options.filteredData = filterData(options);

  const selected = filter.querySelector('.dropdown-toggle');
  selected.innerHTML = elem.innerText;

  renderPagination(document.querySelector('.list'), options, true);
  toggleFilter(event);
  swapData(options);
}

function renderFilters(options, filters) {
  const filter = div({ class: 'filter' });

  if (filters.length > 0) {
    if (options.panelTitle) {
      const header = p({ class: 'panel-title' }, options.panelTitle);
      filter.append(header);
    }

    filter.append(
      ...filters,
    );

    if (options.relatedLink) {
      filter.append(p({}, options.relatedLink));
    }

    const onFilterClick = options.onFilterClick ?? switchFilter;

    const menuItems = filter.querySelectorAll('.select .dropdown-menu .filter-item');
    menuItems.forEach((menuItem) => {
      menuItem.addEventListener('click', (event) => {
        onFilterClick(event, options);
      }, false);
    }, false);

    return filter;
  }

  return null;
}

export async function createList(filters, options, root) {
  const listCSSPromise = loadCSS('../styles/list.css');

  if (options.data) {
    const children = [];
    const filtersEl = renderFilters(options, filters);
    if (filtersEl) children.push(filtersEl);
    children.push(createListItems(options));

    const container = div({ class: 'list' }, ...children);
    root.append(container);
    renderPagination(container, options, false);
  }
  await listCSSPromise;
}
