import { createOptimizedPicture, loadCSS, toClassName } from './lib-franklin.js';

const classPanelTitle = 'panel-title';
const classListFilter = 'list-filter';
const classFilterOpen = 'open';
const classFilterSelect = 'filter-select';
const classDropdownToggle = 'dropdown-toggle';
const classDropdownMenu = 'dropdown-menu';

function getSelectionFromUrl(field) {
  return (
    toClassName(new URLSearchParams(window.location.search).get(field)) || ''
  );
}

function createPaginationLink(page, current, label) {
  const listElement = document.createElement('li');
  listElement.classList.add('pager-item');
  if (page === current) {
    listElement.classList.add('current');
    listElement.innerText = page;
  } else {
    const newUrl = new URL(window.location);
    const link = document.createElement('a');
    newUrl.searchParams.set('page', page);
    link.href = newUrl.toString();
    link.innerText = label || page;
    listElement.append(link);
  }
  return listElement;
}

export function renderPagination(entries, page, limit, limitForPagination) {
  const listPagination = document.createElement('div');
  listPagination.className = 'list-pagination';

  const navPagination = document.createElement('nav');
  navPagination.className = 'nav-pagination';

  if (entries.length > limit) {
    const maxPages = Math.ceil(entries.length / limit);
    let startIdx = Math.min(page, (maxPages - limitForPagination + 1));
    if (startIdx < 0) startIdx = 1;

    let endIdx = maxPages;
    if ((startIdx + limitForPagination) <= (maxPages)) {
      endIdx = (startIdx + limitForPagination - 1);
    }

    const list = document.createElement('ol');
    list.classList.add('pagination');
    if (page > 1) {
      list.append(createPaginationLink(1, page, '«'));
      list.append(createPaginationLink(page - 1, page, '‹'));
    }
    // eslint-disable-next-line no-plusplus
    for (let i = startIdx; i <= endIdx; i++) {
      list.append(createPaginationLink(i, page));
    }
    if (page < maxPages) {
      list.append(createPaginationLink(page + 1, page, '›'));
    }
    if (page < maxPages) {
      list.append(createPaginationLink(maxPages, page, '»'));
    }

    navPagination.append(list);
    listPagination.append(navPagination);
  }
  return listPagination;
}

function getActiveFilters() {
  const result = {};
  [...new URLSearchParams(window.location.search).entries()]
    // eslint-disable-next-line no-unused-vars
    .filter(([_, value]) => value !== '')
    .forEach(([key, value]) => {
      result[key] = value;
    });
  return result;
}

function renderListItem({
  path, title, image, newsDate,
}) {
  const listItemElement = document.createElement('article');
  listItemElement.classList.add('list-item');

  const hasImage = (!image.startsWith('/default-meta-image.png'));
  if (hasImage) {
    const imageElement = createOptimizedPicture(image, title, false, [
      { width: '500' },
    ]);
    listItemElement.innerHTML = `
      <div class="image">
        <a href="${path}" title="${title}">
          ${imageElement.outerHTML}
        </a>
      </div>`;
  }
  listItemElement.innerHTML += `
      <div class="content">
        <cite>${newsDate}</cite>  
        <h3><a title="${title}" href="${path}">${title}</a></h3>
      </div>
    `;
  return listItemElement;
}

function addItemsToList(data, customListItemRenderer, container) {
  data.forEach((item) => {
    const listItemElement = customListItemRenderer && typeof customListItemRenderer === 'function'
      ? customListItemRenderer(item, renderListItem)
      : renderListItem(item);

    container.appendChild(listItemElement);
  });
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

function createDropdown(options, selected, name, placeholder) {
  const container = document.createElement('div');
  container.classList.add(classFilterSelect);
  if (name) {
    container.setAttribute('name', name);
  }
  if (placeholder) {
    const btn = document.createElement('button');
    btn.classList.add(classDropdownToggle);
    btn.innerText = selected || placeholder;
    btn.value = '';
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-toggle', 'dropdown');
    btn.setAttribute('aria-haspopup', true);
    btn.setAttribute('aria-expanded', false);

    btn.addEventListener('click', toggleFilter, false);

    container.append(btn);

    options.unshift(placeholder);
  }

  const dropDown = document.createElement('div');
  dropDown.classList.add(classDropdownMenu);

  const newUrl = new URL(window.location);

  options.forEach((option) => {
    const optionTag = document.createElement('p');
    optionTag.innerText = option;
    optionTag.value = toClassName(option);
    const link = document.createElement('a');
    if (option === placeholder) {
      // reset all filters
      [...newUrl.searchParams.keys()].forEach((key) => newUrl.searchParams.delete(key));
    } else {
      newUrl.searchParams.set('year', option);
    }
    link.href = newUrl.toString();
    link.append(optionTag);
    dropDown.append(link);
  });
  container.append(dropDown);
  return container;
}

function renderFilters(container, data, createFilters, panelTitle) {
  const filter = document.createElement('div');
  filter.className = classListFilter;

  const filters = createFilters(data, getActiveFilters(), createDropdown);
  if (filters.length > 0) {
    if (panelTitle) {
      const header = document.createElement('h3');
      header.className = classPanelTitle;
      header.innerHTML = panelTitle;
      container.append(header);
    }

    filter.append(
      ...filters,
    );
    return filter;
  }

  return null;
}

export default function createList(
  data,
  filter,
  createFilters,
  limitPerPage,
  limitForPagination,
  root,
  panelTitle,
  customListItemRenderer,
) {
  loadCSS('../styles/list.css', () => {});

  const filteredData = filter(data, getActiveFilters());

  let page = parseInt(getSelectionFromUrl('page'), 10);
  page = Number.isNaN(page) ? 1 : page;

  // get data for display
  const start = (page - 1) * limitPerPage;
  const dataToDisplay = filteredData.slice(start, start + limitPerPage);

  if (dataToDisplay) {
    const container = document.createElement('div');
    container.className = 'list';
    const filterElements = renderFilters(container, data, createFilters, panelTitle);
    container.append(filterElements);
    addItemsToList(dataToDisplay, customListItemRenderer, container);
    const pagination = renderPagination(filteredData, page, limitPerPage, limitForPagination);
    container.append(pagination);
    root.append(container);
  }
}
