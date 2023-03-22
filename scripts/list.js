import { createOptimizedPicture, loadCSS, toClassName } from './lib-franklin.js';

function getSelectionFromUrl(field) {
  return (
    toClassName(new URLSearchParams(window.location.search).get(field)) || ''
  );
}

function createPaginationLink(page, label) {
  const newUrl = new URL(window.location);
  const listElement = document.createElement('li');
  const link = document.createElement('a');
  newUrl.searchParams.set('page', page);
  link.href = newUrl.toString();
  link.innerText = label || page;
  listElement.append(link);
  return listElement;
}

export function renderPagination(entries, page, limit) {
  const listPagination = document.createElement('div');
  listPagination.className = 'pagination';

  if (entries.length > limit) {
    const maxPages = Math.ceil(entries.length / limit);

    const listSize = document.createElement('div');
    listSize.classList.add('size');
    if (entries.length > 10) {
      listSize.textContent = `Seite ${page} von ${maxPages}`;
    }

    const listPageLinks = document.createElement('div');
    listPageLinks.classList.add('pages');
    const list = document.createElement('ol');
    listPageLinks.append(list);
    if (page > 1) {
      list.append(createPaginationLink(page - 1, 'Prev'));
      list.append(createPaginationLink(1));
    }
    if (page > 3) {
      const dots = document.createElement('li');
      dots.innerText = '...';
      list.append(dots);
    }
    if (page === maxPages) {
      list.append(createPaginationLink(page - 2));
    }
    if (page > 2) {
      list.append(createPaginationLink(page - 1));
    }

    const currentPage = document.createElement('li');
    currentPage.classList.add('current');
    currentPage.innerText = page;
    list.append(currentPage);

    if (page < maxPages - 1) {
      list.append(createPaginationLink(page + 1));
    }
    if (page === 1) {
      list.append(createPaginationLink(page + 2));
    }
    if (page + 2 < maxPages) {
      const dots = document.createElement('li');
      dots.innerText = '...';
      list.append(dots);
    }
    if (page < maxPages) {
      list.append(createPaginationLink(maxPages));
      list.append(createPaginationLink(page + 1, 'Next'));
    }

    listPagination.append(listSize, listPageLinks);
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
  path, title, description, image, newsDate,
}) {
  const imageElement = createOptimizedPicture(image, title, false, [
    { width: '500' },
  ]);

  const listItemElement = document.createElement('article');
  listItemElement.classList.add('list-item');
  listItemElement.innerHTML = `
      <div class="image">
        <a href="${path}" title="${title}">
          ${imageElement.outerHTML}
        </a>
      </div>    
      <div class="content">
        <p>${newsDate}</p>
        <h3><a title="${title}" href="${path}">${title}</a></h3>
        <p>${description}</p>
      </div>
      <div class="details">
        <a href="${path}">Details</a>
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

function createButton(label) {
  const container = document.createElement('div');
  const buttons = document.createElement('p');
  buttons.classList.add('button-container');
  const button = document.createElement('button');
  button.type = 'submit';
  button.innerText = label;
  button.className = 'button primary';
  buttons.append(button);
  container.append(buttons);
  return container;
}

function createDropdown(options, selected, name, placeholder) {
  const container = document.createElement('div');
  const input = document.createElement('select');
  input.name = name;
  if (placeholder) {
    const optionTag = document.createElement('option');
    optionTag.innerText = placeholder;
    optionTag.value = '';
    if (!selected) {
      optionTag.selected = true;
    }
    input.append(optionTag);
  }

  options.forEach((option) => {
    const optionTag = document.createElement('option');
    optionTag.innerText = option;
    optionTag.value = toClassName(option);
    if (optionTag.value === selected) {
      optionTag.selected = true;
    }
    input.append(optionTag);
  });
  container.append(input);
  return container;
}

function renderFilters(data, createFilters) {
  // render filters
  const filter = document.createElement('div');
  filter.className = 'list-filter';
  const form = document.createElement('form');
  form.method = 'get';
  form.name = 'list-filter';
  const formFieldSet = document.createElement('fieldset');

  const filters = createFilters(data, getActiveFilters(), createDropdown);

  formFieldSet.append(
    ...filters,
  );

  if (filters.length > 0) {
    formFieldSet.append(createButton('Suche starten'));
    form.append(formFieldSet);
    filter.append(form);
    return filter;
  }

  return null;
}

export default function createList(
  data,
  filter,
  createFilters,
  limitPerPage,
  root,
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
    const filterElements = renderFilters(data, createFilters);
    const paginationElements = renderPagination(filteredData, page, limitPerPage);
    container.append(filterElements, paginationElements);
    addItemsToList(dataToDisplay, customListItemRenderer, container);
    container.append(paginationElements.cloneNode(true));
    root.append(container);
  }
}
