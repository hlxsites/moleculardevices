import {
  a, button, div, form, h3, i, input, label, li, option, p, select, strong, ul,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { toClassName } from '../../scripts/lib-franklin.min.js';
import { formatDateUTCSeconds, sortDataByDate } from '../../scripts/scripts.min.js';

const PDF_RESOURCES = ['Brochure', 'Date Sheet', 'eBook', 'Flyer', 'Infographic', 'Scientific Poster', 'Scientific Posters', 'Technical Guide', 'User Guide', 'White Paper'];
const EXPORT_RESOURCES = ['Application Note', 'Blog', 'Brochure', 'Customer Breakthrough', 'Data Sheet', 'eBook', 'Flyer', 'Infographic', 'Interactive Demo', 'News', 'Publication', 'Scientific Poster', 'Technical Guide', 'Technical Note', 'User Guide', 'Videos and Webinars'];
const PAGE_TYPES = ['All PDFs', 'Application Note', 'Application', 'Blog', 'Brochure', 'Citation', 'Customer Breakthrough', 'Date Sheet', 'eBook', 'Event', 'Flyer', 'Infographic', 'Newsletter', 'News', 'Newsroom', 'Product', 'Publication', 'Scientific Poster', 'Technology', 'Technical Guide', 'Technical Note', 'User Guide', 'Video Gallery', 'Videos and Webinars', 'White Paper'];
const SEARCH_PAGE_TYPES = ['Products', 'Applications', 'Technologies', 'Resources'];
const EXCLUDED_RESOURCE_TYPES = ['Newsletter', 'Product', 'Application', 'Technology'];

/* -------------------------------------------------------------------------- */
/*  Generic Data Helpers                                                      */
/* -------------------------------------------------------------------------- */

function sortByTitle(array) {
  return array.filter((item) => !!item).sort((x, y) => {
    if (x.title < y.title) return -1;
    if (x.title > y.title) return 1;
    return 0;
  });
}

function removeDuplicatesByKey(items, uniqueKey) {
  const seen = new Set();

  return items.filter((item) => {
    const value = item[uniqueKey];

    if (seen.has(value)) return false;

    seen.add(value);
    return true;
  });
}

/* -------------------------------------------------------------------------- */
/* Data fetching and caching                                                  */
/* -------------------------------------------------------------------------- */

let sitemapDataCache;
const searchDataCache = new Map();

async function getSitemapData() {
  if (sitemapDataCache) return sitemapDataCache;

  sitemapDataCache = await ffetch('/query-index.json')
    .sheet('sitemap')
    .all();

  return sitemapDataCache;
}

function getSearchSheetData(sheetName) {
  if (!searchDataCache.has(sheetName)) {
    const dataPromise = ffetch('/query-index.json')
      .sheet(sheetName)
      .all()
      .catch((error) => {
        searchDataCache.delete(sheetName);
        throw error;
      });

    searchDataCache.set(sheetName, dataPromise);
  }

  return searchDataCache.get(sheetName);
}

async function getPagesByType(type) {
  if (type !== 'applications') {
    return ffetch('/query-index.json').sheet(type).all();
  }

  const [sheetData, applicationPages] = await Promise.all([
    ffetch('/query-index.json').sheet('applications').all(),
    ffetch('/query-index.json').filter((page) => page.path.indexOf(type) === 1).all(),
  ]);

  return removeDuplicatesByKey([...sheetData, ...applicationPages], 'path');
}

/* -------------------------------------------------------------------------- */
/* Search Helpers                                                             */
/* -------------------------------------------------------------------------- */

function normalizeSearchInput(value = '') {
  const normalizedValue = value.trim().replace(/\s+/g, ' ');

  try {
    return new URL(normalizedValue).pathname.toLowerCase();
  } catch {
    return normalizedValue.toLowerCase();
  }
}

function normalizeSearchText(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

function matchesSearch(item, searchValue) {
  if (!item || !searchValue?.trim()) return false;

  const normalizedSearchValue = normalizeSearchInput(searchValue);

  const searchableFields = [
    item.identifier,
    item.title,
    item.path,
    item.gatedURL,
  ];

  return searchableFields.some((value) => (
    normalizeSearchText(value).includes(normalizedSearchValue)
  ));
}

async function getSearchResults(type, searchValue) {
  const sheetName = type.toLowerCase();
  const sheetData = await getSearchSheetData(sheetName);

  const results = sheetData.filter((item) => {
    if (!matchesSearch(item, searchValue)) return false;

    return type !== 'Resources'
      || !EXCLUDED_RESOURCE_TYPES.includes(item.type);
  });

  return removeDuplicatesByKey(results, 'path');
}

async function searchPagesAndResources(searchValue) {
  const results = await Promise.allSettled(
    SEARCH_PAGE_TYPES.map(async (type) => ({
      type,
      data: await getSearchResults(type, searchValue),
    })),
  );

  return results
    .filter(({ status }) => status === 'fulfilled')
    .map(({ value }) => value);
}

/* -------------------------------------------------------------------------- */
/* CSV export and Data download                                               */
/* -------------------------------------------------------------------------- */

function exportToCsv(downloadBtn, type, jsonData, previewLink) {
  const fileName = type === '0' ? 'other' : toClassName(type);

  if (!jsonData.length) return;

  const headers = Object.keys(jsonData[0]).filter((header) => header.trim() !== '');

  // Generate CSV data (remove first empty row)
  const csvData = [
    `\uFEFF${headers.join(',')}`,
    ...jsonData.map((row) => (
      headers.map((header) => {
        const cell = row[header];

        if (Array.isArray(cell)) {
          return `"${cell.join(', ').replace(/\n/g, ' ')}"`; // Handle arrays
        }

        return `"${String(cell ?? '').replace(/"/g, '""')}"`; // Escape double quotes
      }).join(',')
    )),
  ].join('\n');

  // Create a Blob with UTF-8 encoding
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  if (previewLink) {
    const generatedLink = a({ href: url, download: `${fileName}.csv` }, 'Export CSV of ', strong(fileName), ' pages.');
    previewLink.replaceChildren(generatedLink);
    return;
  }

  // Update the download button
  downloadBtn.href = url;
  downloadBtn.textContent = 'Download Sheet';
  downloadBtn.style.pointerEvents = 'auto';
  downloadBtn.classList.add('button', 'primary');
  downloadBtn.classList.remove('secondary');
  downloadBtn.download = `${fileName}.csv`;
}

function isResourceRelated(type, resource, item) {
  if (type === 'Products') {
    return resource.relatedProducts?.includes(item.identifier);
  }

  if (type === 'Applications') {
    return resource.relatedApplications?.includes(item.identifier);
  }

  if (type === 'Technologies') {
    return resource.relatedTechnologies?.includes(item.identifier);
  }

  return false;
}

async function exportItemsWithResources(downloadBtn, type, withResources) {
  const normalizedType = type.toLowerCase();

  const [data, resources] = await Promise.all([
    getPagesByType(normalizedType),
    withResources
      ? ffetch('/query-index.json').sheet('resources').all()
      : Promise.resolve([]),
  ]);

  if (!downloadBtn.href) {
    downloadBtn.textContent = 'LOADING...';
    downloadBtn.style.pointerEvents = 'none';
  }

  const jsonData = data.map((item) => {
    const rowObject = {
      Title: item.h1 || item.title,
      Path: item.path,
    };

    if (!withResources) return rowObject;

    const relatedResources = resources.filter((resource) => (
      isResourceRelated(type, resource, item)
    ));

    EXPORT_RESOURCES.forEach((resourceType) => {
      rowObject[resourceType] = relatedResources
        .filter((resource) => resource.type === resourceType)
        .map((resource) => resource.title);
    });

    return rowObject;
  });
  exportToCsv(downloadBtn, type, jsonData);
}

async function prepareDataSheetDownload(downloadBtn, type, previewLink, separatePdf = false) {
  let sheetData;

  previewLink.innerHTML = `Loading ${type}...`;
  // const isOnlyGatedChecked = document.querySelector('#only-gated-urls').checked;
  // console.log(isOnlyGatedChecked);

  if (type === 'Product') {
    sheetData = await getPagesByType('products');
  } else if (type === 'Application') {
    sheetData = await getPagesByType('applications');
  } else if (type === 'All PDFs') {
    sheetData = await ffetch('/query-index.json')
      .sheet('resources')
      .filter((data) => data.path.includes('.pdf'))
      .all();
  } else if (separatePdf && PDF_RESOURCES.includes(type)) {
    sheetData = await ffetch('/query-index.json')
      .sheet('resources')
      .filter((data) => data.type === type)
      .all();
  } else if (type === 'Event') {
    sheetData = await ffetch('/query-index.json')
      .sheet('events')
      .all();
  } else if (type === 'News') {
    sheetData = await ffetch('/query-index.json')
      .sheet('news')
      .all();
  } else {
    sheetData = await ffetch('/query-index.json')
      .filter((data) => data.type === type)
      .all();
  }

  if (!sheetData.length) {
    previewLink.textContent = 'No data found.';
    return;
  }

  const sortedData = sortDataByDate(sheetData);
  const filename = type === 0 ? 'other' : toClassName(type);

  const jsonData = sortedData.map((item) => ({
    Title: item.title || item.identifier,
    Path: `https://moleculardevices.com${item.path}`,
    Date: formatDateUTCSeconds(item.date),
    'Gated URL': item.gatedURL && item.gatedURL !== '0' ? item.gatedURL : '-',
  }));

  exportToCsv(downloadBtn, filename, jsonData, previewLink);
}

/* -------------------------------------------------------------------------- */
/* Tag Matching                                                               */
/* -------------------------------------------------------------------------- */

function normalizeTag(value = '') {
  return String(value)
    .trim()
    .replace(/\band\b|&/gi, 'and')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function findMatchingTags(value, identifiers) {
  const normalizedValue = normalizeTag(value);

  const exactMatches = identifiers.filter(
    (identifier) => normalizeTag(identifier) === normalizedValue,
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const wordsPattern = normalizedValue
    .split(' ')
    .map((word) => word.replace(/([.*+?^${}()|[\]\\])/g, '\\$1'))
    .join('.*');

  const regex = new RegExp(wordsPattern, 'i');

  return identifiers.filter((identifier) => (
    regex.test(normalizeTag(identifier))
  ));
}

/* -------------------------------------------------------------------------- */
/* Resource URL Helpers                                                       */
/* -------------------------------------------------------------------------- */

async function getGatedPageTitle(url) {
  const sitemap = await getSitemapData();
  const gatedPage = sitemap.find((item) => item.path === url);

  return gatedPage?.title;
}

function normalizeGatedURL(gatedURL) {
  if (!gatedURL || gatedURL === '0') return null;

  try {
    const url = new URL(gatedURL);

    if (url.hostname.includes('moleculardevices')) {
      return { path: url.pathname, url: gatedURL };
    }

    return { path: gatedURL, url: gatedURL };
  } catch {
    return { path: gatedURL, url: gatedURL };
  }
}

async function createGatedPageLink(gatedURL) {
  if (!gatedURL || gatedURL === '0') return '';

  const gatedPage = normalizeGatedURL(gatedURL);

  if (!gatedPage) return '';

  const gatedPageTitle = await getGatedPageTitle(gatedPage.path);

  return div({ style: 'margin-bottom: 10px;' },
    'GATED PAGE: ',
    a({ href: gatedPage.url }, gatedPageTitle || gatedPage.url));
}

function extractUrls(value = '') {
  const matches = value.match(/https?:\/\/[^\s]+/g) || [];

  return matches.map((link) => {
    const cleanLink = link.replace(/[),.;]+$/, '');
    return new URL(cleanLink).pathname;
  });
}

/* -------------------------------------------------------------------------- */
/* Resource Rendering                                                         */
/* -------------------------------------------------------------------------- */

async function createResourceList(title, array) {
  const fragmentList = ul({ class: 'fragments-list-block' });
  const sortedFragments = sortByTitle(array);

  const resourceItems = await Promise.all(
    sortedFragments.map(async (resource) => {
      const gatedPage = await createGatedPageLink(resource.gatedURL);

      return li(
        div({ style: 'margin-bottom: 10px;' }, strong(resource.type || 'Resource')),
        gatedPage,
        div('Resource: ',
          a({ href: resource.path, target: '_blank' }, resource.title || resource.path)));
    }));

  resourceItems.forEach((resourceItem) => {
    fragmentList.appendChild(resourceItem);
  });

  return div(p(title), fragmentList);
}

async function createResourceLinksList(links, parent) {
  const list = div({ class: 'list', style: 'padding-left: 0; padding-top: 20px;' });

  list.appendChild(p('Loading...'));
  parent.appendChild(list);

  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((item) => links.includes(item.gatedURL) || links.includes(item.path))
    .all();

  resources.forEach((resource) => {
    const pageURL = resource.gatedURL && resource.gatedURL !== '0'
      ? resource.gatedURL
      : resource.path;
    list.appendChild(
      div(a({ href: pageURL }, resource.title || resource.path)),
    );
  });

  list.querySelector('p')?.remove();
}

/* -------------------------------------------------------------------------- */
/* Form & DOM Creation                                                        */
/* -------------------------------------------------------------------------- */

function createFormSection(heading, sectionId, inputCls, inputPlaceholder, ctaTitle, moreEl = '', ctaClasses = 'primary') {
  return div({ class: 'section no-padding-top', style: 'padding-bottom: 20px' },
    h3(heading),
    form({ style: 'display:flex;', id: sectionId },
      input({
        class: inputCls,
        placeholder: inputPlaceholder,
        required: true,
        name: sectionId,
      }),
      moreEl,
      button({ type: 'submit', class: `button ${ctaClasses}` }, ctaTitle),
    ),
  );
}

function createSearchForm() {
  const heading = 'Search Pages/Resources: ';
  const sectionId = 'search-fragment-form';
  const inputCls = 'search-fragment';
  const placeholder = 'Enter title or path...';
  const ctaTitle = 'Find Pages';
  return createFormSection(heading, sectionId, inputCls, placeholder, ctaTitle);
}

function createTaggingForm() {
  const heading = 'Tagging items: ';
  const sectionId = 'search-tagging-form';
  const inputCls = 'search-tagging-input';
  const placeholder = 'Enter list of items...';
  const ctaTitle = 'Find Items';
  const selectBox = select(
    { class: 'select-options', style: 'width: unset !important;' },
    option({ value: 'Products' }, 'Products'),
    option({ value: 'Applications' }, 'Applications'),
    option({ value: 'Technologies' }, 'Technologies'),
  );
  return createFormSection(heading, sectionId, inputCls, placeholder, ctaTitle, selectBox);
}

function createResourcesForm() {
  const heading = 'More Great Resources List: ';
  const sectionId = 'search-more-resources-form';
  const inputCls = 'search-more-resources-input';
  const placeholder = 'Enter More Great Resources List...';
  const ctaTitle = 'Find URLs';
  return createFormSection(heading, sectionId, inputCls, placeholder, ctaTitle);
}

function createDataTypeSelector() {
  const selectOption = div({ class: 'section no-padding-top' },
    h3('Select page type'),
    // div({ style: 'display:flex; padding: 0; width: 100%; margin-bottom: 4px;' },
    //   label({ for: 'only-gated-urls' },
    //     input({ type: 'checkbox', id: 'only-gated-urls' }),
    //     'Only Gated URLs'),
    // ),
    div({ style: 'display:flex; padding: 0; width: 100%; ' },
      select({ class: 'select-options', id: 'datatype-select' }),
      button({ id: 'download-data-sheet', class: 'button primary' }, 'Load Sheet'),
    ));
  const previewLink = p();
  selectOption.appendChild(previewLink);
  PAGE_TYPES.forEach((dataType) => {
    selectOption.querySelector('select')
      .appendChild(option({ value: dataType }, dataType !== '0' ? dataType : 'Other'));
  });

  const downloadDataSheetBtn = selectOption.querySelector('#download-data-sheet');
  const dataTypeSelect = selectOption.querySelector('#datatype-select');

  downloadDataSheetBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const datatypeSelectValue = dataTypeSelect.value;
    prepareDataSheetDownload(downloadDataSheetBtn, datatypeSelectValue, previewLink, true);
  });

  return selectOption;
}

/* -------------------------------------------------------------------------- */
/* Fragment Rendering                                                         */
/* -------------------------------------------------------------------------- */

function createFragmentList(type, array) {
  const fragmentList = ul({ class: 'fragments-list-block' });
  const sortedFragments = sortByTitle(array);
  const title = `${type} Pages(${array.length}): `;

  let downloadBtn = '';

  if (['Products', 'Applications', 'Technologies'].includes(type)) {
    downloadBtn = a({ class: 'download-sheet-btn' }, 'Load Sheet');
    downloadBtn.addEventListener('click', () => {
      exportItemsWithResources(downloadBtn, type, true);
    });
  }

  sortedFragments.forEach((fragment) => {
    const hasIdentifier = (
      fragment.identifier !== undefined
      && fragment.identifier !== '0'
      && fragment.identifier !== fragment.title
    );

    const identifier = hasIdentifier ? div(strong(fragment.identifier)) : '';

    fragmentList.appendChild(
      li(identifier, a({ href: fragment.path, target: '_blank' }, fragment.title)),
    );
  });

  return div(
    div({ style: 'display:flex;justify-content: space-between;align-items: center;margin-bottom: 20px;' },
      p({ style: 'margin-bottom: 0;' }, title),
      downloadBtn),
    fragmentList);
}

// Replaces matching tab placeholders with the corresponding fragment list.
function populateFragmentTabs(fragTabItems, itemsMapping, createFragmentListCallback) {
  itemsMapping.forEach((pageType) => {
    fragTabItems.forEach((item) => {
      const content = item.textContent;
      const heading = `${pageType.heading} Content`;

      if (content && content === heading) {
        item.innerHTML = '';
        item.appendChild(createFragmentListCallback(pageType.heading, pageType.data));
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Search & Tagging Rendering                                                 */
/* -------------------------------------------------------------------------- */

async function findTaggedItems(values, type) {
  const data = await getPagesByType(type.toLowerCase());
  const identifiers = data.map((item) => item.identifier || item.title);

  const unmatchedValues = [];
  const selectedItems = new Map();

  const result = div({
    class: `tagging-results tagging-results-${type.toLowerCase()}`,
    style: 'margin-top: 20px;width: 100%;padding: 0;border-bottom: 1px solid #ccc;padding-bottom: 10px;',
  });

  const resultText = p();
  const matchSections = div();

  // Updates the displayed comma-separated list of selected identifiers.
  const updateResult = () => {
    const selectedIdentifiers = [...selectedItems.values()];
    resultText.replaceChildren(strong(type), ': ', selectedIdentifiers.join(', '));
  };

  values.forEach((item) => {
    const matches = findMatchingTags(item, identifiers);

    if (matches.length === 0) {
      unmatchedValues.push(item);
      return;
    }

    if (matches.length === 1) {
      selectedItems.set(item, matches[0]);
      return;
    }

    const matchSection = div({ class: 'tagging-match-section' });
    const matchDescription = div(
      p(strong(`Multiple possible identifiers found for "${item}"`)),
      p({ style: 'margin-top: 0; margin-bottom: 1rem' }, 'Please select the identifier you want to use:'));

    matchSection.appendChild(matchDescription);

    matches.forEach((identifier, index) => {
      const radioId = `tagging-${type}-${index}-${item}`;

      const radio = input({
        type: 'radio', name: `tagging-${type}-${item}`, value: identifier, id: radioId,
      });

      radio.addEventListener('change', () => {
        selectedItems.set(item, identifier);
        updateResult();

        matchSection.style.display = 'none';

        const editButton = button(
          {
            type: 'button',
            class: 'edit-tagging-match',
            title: `Edit ${type} selection`,
            'aria-label': `Edit ${type} selection for ${item}`,
            style: 'padding: 0; margin-right: 1rem',
          },
          identifier,
          i({ class: 'fa-solid fa-pencil', style: 'margin-left: 0.5rem;' }),
        );

        editButton.addEventListener('click', () => {
          matchSection.style.display = '';
          editButton.remove();
        });

        matchSection.parentElement.appendChild(editButton);
      });

      matchSection.appendChild(
        div(radio, label({ for: radioId }, identifier)),
      );
    });

    matchSections.appendChild(matchSection);
  });

  updateResult();
  result.appendChild(resultText);

  if (matchSections.children.length > 0) {
    result.appendChild(matchSections);
  }

  if (unmatchedValues.length > 0) {
    result.appendChild(p(strong('Unmatched Values: '), unmatchedValues.join('; ')));
  }

  const resultsContainer = document.querySelector('.tagging-results-container');
  const previousResult = resultsContainer.querySelector(`.tagging-results-${type.toLowerCase()}`);

  previousResult?.remove();
  resultsContainer.appendChild(result);
}

async function renderSearchResults() {
  const block = document.querySelector('main .fragments-list.tagging');
  const search = document.querySelector('#search-fragment-form > input');
  const searchValue = search.value.trim();

  if (!searchValue) {
    block.innerHTML = '';
    block.appendChild(p('Enter a page title or path to search.'));
    return;
  }

  block.innerHTML = '';
  const loading = p({ style: 'padding-top: 20px;' }, `Searching for "${searchValue}"...`);
  block.appendChild(loading);

  try {
    const results = await searchPagesAndResources(searchValue);
    const resultsWithData = results.filter(({ data }) => data.length > 0);

    loading.remove();

    if (!resultsWithData.length) {
      block.appendChild(p(`No pages or resources found for "${searchValue}".`));
      return;
    }

    const resultLists = await Promise.all(
      resultsWithData.map(({ type, data }) => (
        type === 'Resources'
          ? createResourceList(`${type} Pages (${data.length}):`, data)
          : createFragmentList(type, data)
      )),
    );

    resultLists.forEach((resultList) => {
      block.appendChild(resultList);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Search failed:', error);

    loading.remove();
    block.appendChild(p('Unable to search pages. Please try again.'));
  }
}

/* -------------------------------------------------------------------------- */
/* Page Initialization                                                        */
/* -------------------------------------------------------------------------- */

async function initializeFragmentTabs() {
  const fragTabItems = document.querySelectorAll('.fragments .tabs-horizontal .embed-fragment > .section');

  const thankyouFragments = await ffetch('/fragments/query-index.json')
    .filter((fragment) => (fragment.path.indexOf('learn-more-thankyou-content') !== -1))
    .all();

  const appFragments = await ffetch('/fragments/query-index.json')
    .sheet('applications')
    .all();

  const itemsMapping = [
    { heading: 'Thank you', data: thankyouFragments },
    { heading: 'Applications Fragments', data: appFragments },
    { heading: 'Products', data: await getPagesByType('products') },
    { heading: 'Applications', data: await getPagesByType('applications') },
    { heading: 'Technologies', data: await getPagesByType('technologies') },
  ];

  populateFragmentTabs(fragTabItems, itemsMapping, createFragmentList);
}

async function initializeFragmentsPage() {
  const mainBlock = document.querySelector('.search-box.block');

  const searchForm = createSearchForm();
  const taggingForm = createTaggingForm();
  const resourcesForm = createResourcesForm();
  const dataTypeOption = createDataTypeSelector();

  mainBlock.classList.remove('columns');

  mainBlock.append(searchForm);

  const parentContainer = mainBlock.parentElement.parentElement;
  parentContainer.append(taggingForm);
  parentContainer.append(resourcesForm);
  parentContainer.append(dataTypeOption);

  const searchFragmentForm = document.getElementById('search-fragment-form');
  const searchTaggingForm = document.getElementById('search-tagging-form');
  const resourceListForm = document.getElementById('search-more-resources-form');

  const taggingResults = div({ class: 'tagging-results-container' });

  searchTaggingForm.parentElement.appendChild(taggingResults);

  searchFragmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderSearchResults();
  });

  searchTaggingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const taggingValues = searchTaggingForm.querySelector('.search-tagging-input').value;
    const selectOptions = searchTaggingForm.querySelector('.select-options').value;

    const tags = taggingValues
      .split(/[;,•‣∙·]|\bo\b|[\r\n]+/i)
      .map((tag) => tag.trim())
      .filter(Boolean);

    await findTaggedItems(tags, selectOptions);
  });

  resourceListForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const enteredValue = resourceListForm.querySelector('.search-more-resources-input').value;
    const extractedLinks = extractUrls(enteredValue);
    await createResourceLinksList(extractedLinks, resourcesForm);
  });

  await initializeFragmentTabs();
}

setTimeout(() => {
  initializeFragmentsPage().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Fragments page:', error);
  });
}, 2000);
