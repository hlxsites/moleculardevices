import ffetch from '../../scripts/ffetch.js';
import {
  div, h4, select, label, option, span,
} from '../../scripts/dom-helpers.js';
import { decorateIcons, fetchPlaceholders } from '../../scripts/lib-franklin.js';

const PRODUCT_FINDER_URL = '/product-finder/product-finder.json';
let placeholders = {};

let products = [];
let filteredProducts = [];
let filterDropdowns = [];

function addOptionsToSelect(selectPicker, optionsArray) {
  // delete whats in the select
  selectPicker.innerHTML = '';

  const defaultOpt = option(
    { value: '' },
    placeholders.pleaseSelect || 'Please Select',
  );
  defaultOpt.selected = true;
  selectPicker.appendChild(defaultOpt);

  optionsArray.forEach((_option) => {
    selectPicker.appendChild(
      option(
        { value: _option },
        _option,
      ),
    );
  });
}

function updateFilterOptions(filterNumber) {
  const filterOptions = new Set();
  // we should exclude filters with value 0
  filteredProducts.forEach((product) => {
    const filters = product[`productFinderFilter${filterNumber}`].split(',');
    filters.forEach((filter) => {
      if (filter.trim() !== '0') {
        filterOptions.add(filter.trim());
      }
    });
  });

  // Clear the current filter options
  const dropdown = filterDropdowns[filterNumber - 1];
  dropdown.innerHTML = `<option value="">${placeholders.pleaseSelect || 'Please Select'}</option>`;

  // Add the new filter options
  addOptionsToSelect(dropdown, Array.from(filterOptions));
}

function filterChange(filterNumber) {
  const selectedFilter = filterDropdowns[filterNumber - 1].value;

  // Reset all filters that come after the one changed and disable them
  for (let i = filterNumber; i < filterDropdowns.length; i += 1) {
    filterDropdowns[i].innerHTML = `<option value="">${placeholders.pleaseSelect || 'Please Select'}</option>`;
    filterDropdowns[i].disabled = true;
  }

  // start from the original product list
  filteredProducts = products;

  // filter based on the selection of each dropdown until the current one
  for (let i = 1; i <= filterNumber; i += 1) {
    const selected = filterDropdowns[i - 1].value;
    if (selected !== '') {
      filteredProducts = filteredProducts.filter((product) => {
        const filters = product[`productFinderFilter${i}`].split(',');
        return filters.map((filter) => filter.trim()).includes(selected);
      });
    }
  }

  if (filterNumber < filterDropdowns.length && selectedFilter !== '') {
    updateFilterOptions(filterNumber + 1);
    filterDropdowns[filterNumber].disabled = false;
  }

  // Remove from the div with class .product-finder-list any card that contains a link
  // to a product that is not in the filteredProducts[n].path
  let productsCount = 0;
  const productFinderList = document.querySelector('#step-3 .product-finder-list');
  const productFinderListCards = productFinderList.querySelectorAll('.card');
  productFinderListCards.forEach((card) => {
    const cardPath = card.attributes['data-product-path'].value;
    const product = filteredProducts.find((p) => p.path === cardPath);
    if (!product) {
      card.style.display = 'none';
    } else {
      card.style.display = 'flex';
      productsCount += 1;
    }
  });

  // Update the products count
  const totalCount = document.querySelector('#step-3 .result-count');
  totalCount.innerHTML = `${productsCount} ${placeholders.results || 'Results'}`;

  const compareButtons = document.querySelectorAll('.compare-button');
  let compareButtonsDisplay;
  if (productsCount === 1) {
    compareButtonsDisplay = 'none';
  } else {
    compareButtonsDisplay = 'flex';
  }

  compareButtons.forEach((button) => {
    button.style.display = compareButtonsDisplay;
  });
}

function createFilterDropdown(filterID, filterOptionsArray, disabled) {
  const selectPicker = select(
    { id: filterID, class: 'form-control' },
  );
  if (disabled) {
    // disable this select dropdown
    selectPicker.disabled = true;
  }

  addOptionsToSelect(selectPicker, filterOptionsArray);

  selectPicker.addEventListener('change', () => filterChange(filterID));
  filterDropdowns.push(selectPicker);

  const chevron = span({ class: 'fa fa-chevron-down' });
  decorateIcons(chevron);

  return div(
    { class: 'select-wrapper' },
    selectPicker,
    chevron,
  );
}

function initializeFilters(filterDict) {
  const filters = div(
    { class: 'row result-filters' },
  );

  // create a filter for each filter name, if it exists in the filterDict
  for (let i = 1; i <= 3; i += 1) {
    const filterName = filterDict[`productFinderFilter${i}`];
    if (filterName) {
      let disabled = false;
      // if the id is bigger than 1, disable it
      if (i > 1) {
        disabled = true;
      }

      const selection = createFilterDropdown(i, [], disabled);

      const filterForm = div(
        { class: 'form-group', id: `filter${i}Container` },
        label(
          { class: 'filter-label' },
          filterName,
        ),
        selection,
      );

      filters.appendChild(filterForm);
    }
  }

  return filters;
}

async function getCategoryFilterDict(_category, _type) {
  const categories = await ffetch(PRODUCT_FINDER_URL).sheet('categories').all();

  // filter categories by the ones that have the same category and type
  const productsCategory = categories.filter(
    (category) => category.category === _category && category.type === _type,
  );
  if (productsCategory.length === 0) {
    return null;
  }

  // create a dictionary of productFinderFilter1, productFinderFilter2, productFinderFilter3
  const filterNames = {};
  let filtersCount = 0;
  for (let i = 1; i <= 3; i += 1) {
    const filterData = productsCategory[0][`productFinderFilter${i}`];
    if (filterData) {
      const filterName = productsCategory[0][`productFinderFilter${i}`];
      filterNames[`productFinderFilter${i}`] = filterName;
      if (filterName !== '') {
        filtersCount += 1;
      }
    }
  }

  // if there are no filters, return null
  if (filtersCount === 0) {
    return null;
  }

  return filterNames;
}

export default async function renderFiltersRow(category, type, finderProducts, dataCardType) {
  products = finderProducts;
  filteredProducts = products;
  filterDropdowns = [];

  placeholders = await fetchPlaceholders();

  const filtersDict = await getCategoryFilterDict(category, type);
  if (!filtersDict) {
    return null;
  }

  const filters = initializeFilters(filtersDict);

  updateFilterOptions(1);

  const finderFilters = div(
    { class: 'finder-filters' },
    div(
      { class: 'row' },
      div(
        { class: 'filters-title-container' },
        h4(
          { class: 'filters-row-title' },
          'Refine Products:',
        ),
      ),
      div(
        { class: 'filters-container' },
        filters,
      ),
    ),
  );

  finderFilters.setAttribute('data-card-type', dataCardType);
  return finderFilters;
}
