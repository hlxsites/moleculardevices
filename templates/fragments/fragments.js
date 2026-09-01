import {
  a, button, div, form, h3, input, li, option, p, select, strong, ul,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { getMetadata, toClassName } from '../../scripts/lib-franklin.min.js';
import { formatDateUTCSeconds, sortDataByDate } from '../../scripts/scripts.min.js';

/* FRAGMENTS LIST START */
const defaultURL = 'https://main--moleculardevices--hlxsites.aem.page';
const pdfResources = ['Brochure', 'Date Sheet', 'eBook', 'Flyer', 'Infographic', 'Scientific Poster', 'Scientific Posters', 'Technical Guide', 'User Guide', 'White Paper'];
function isPdf(type) {
  return pdfResources.includes(type);
}

// HELPER
function sortDataWithTitle(array) {
  return array.filter((item) => !!item).sort((x, y) => {
    if (x.title < y.title) {
      return -1;
    }
    if (x.title > y.title) {
      return 1;
    }
    return 0;
  });
}

function removeOneDuplicate(arr, uniqueKey) {
  const seen = new Map();
  return arr.reduce((result, item) => {
    const identifier = item[uniqueKey];
    if (seen.has(identifier)) {
      if (seen.get(identifier) === true) {
        seen.set(identifier, false);
        return result;
      }
    } else {
      seen.set(identifier, true);
    }

    result.push(item);
    return result;
  }, []);
}

function fetchTabData(fragTabItems, itemsMapping, createFragmentListCallback) {
  itemsMapping.forEach((pageType) => {
    fragTabItems.forEach(async (item) => {
      const content = item.textContent;
      const heading = `${pageType.heading} Content`;

      if (content && content === heading) {
        item.innerHTML = '';
        item.appendChild(createFragmentListCallback(pageType.heading, pageType.data));
      }
    });
  });
}

async function exportDataToCsv(downloadBtn, type, jsonData, previewLink) {
  const fileName = type === '0' ? 'other' : toClassName(type);
  const headers = Object.keys(jsonData[0]).filter((header) => header.trim() !== '');

  // Generate CSV data (remove first empty row)
  const csvData = [
    `\uFEFF ${headers.join(',')}`,
    ...jsonData.map((row) => headers
      .map((header) => {
        const cell = row[header];
        if (Array.isArray(cell)) {
          return `"${cell.join(', ').replace(/\n/g, ' ')}"`; // Handle arrays
        }
        return `"${String(cell).replace(/"/g, '""')}"`; // Escape double quotes
      })
      .join(','),
    ),
  ].join('\n');

  // Create a Blob with UTF-8 encoding
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  if (previewLink) {
    previewLink.innerHTML = '';
    const generatedLink = a({ href: url, download: `${fileName}.csv` }, 'Export CSV of ', strong(fileName), ' pages.');
    previewLink.appendChild(generatedLink);
  } else {
    // Update the download button
    downloadBtn.href = url;
    downloadBtn.textContent = 'Download Sheet';
    downloadBtn.style.pointerEvents = 'auto';
    downloadBtn.classList.add('button', 'primary');
    downloadBtn.classList.remove('secondary');
    downloadBtn.download = `${fileName}.csv`;
  }
}

async function getXMLData(type) {
  let data = [];
  if (type === 'applications') {
    const sheetData = await ffetch('/query-index.json')
      .sheet(type)
      .all();
    data = await ffetch('/query-index.json')
      .filter((page) => page.path.indexOf(type) === 1)
      .all();
    data = removeOneDuplicate([...sheetData, ...data], 'path');
  } else {
    data = await ffetch('/query-index.json')
      .sheet(type)
      .all();
  }
  return data;
}

function getJsonResources(type, resource, item) {
  if (type === 'Products') {
    return resource.relatedProducts.includes(item.identifier);
  }
  if (type === 'Applications') {
    return resource.relatedApplications.includes(item.identifier);
  }
  if (type === 'Technologies') {
    return resource.relatedTechnologies.includes(item.identifier);
  }
  return false;
}

async function exporttResourcesData(downloadBtn, type, withResources) {
  const resourceTypes = ['Application Note', 'Blog', 'Brochure', 'Customer Breakthrough', 'eBook', 'User Guide', 'News', 'Scientific Poster', 'Videos and Webinars', 'Flyer', 'Infographic', 'Publication'];
  const data = await getXMLData(type.toLowerCase());

  if (!downloadBtn.href) {
    downloadBtn.textContent = 'LOADING...';
    downloadBtn.style.pointerEvents = 'none';
  }

  const jsonData = await Promise.all(data.map(async (item) => {
    const rowData = await ffetch('/query-index.json')
      .sheet('resources')
      .filter((resource) => getJsonResources(type, resource, item))
      .all();

    const rowObject = {
      Title: item.h1 || item.title,
      Path: `${defaultURL}${item.path}`,
    };

    if (withResources) {
      resourceTypes.forEach((resource) => {
        const resourceData = rowData.filter((row) => row.type === resource).map((row) => row.title);
        rowObject[resource] = resourceData;
      });
    }

    return rowObject;
  }));
  exportDataToCsv(downloadBtn, type, jsonData);
}

function hasSearchedValue(item, val) {
  if (!item || typeof val !== 'string') {
    return false;
  }
  const {
    identifier = '', title = '', path = '', gatedURL = '',
  } = item;
  const searchValue = val.toLowerCase();

  return identifier.toLowerCase().includes(searchValue)
    || title.toLowerCase().includes(searchValue)
    || path.toLowerCase().includes(searchValue)
    || gatedURL.toLowerCase().includes(searchValue);
}

async function getGatedPageTitle(url) {
  const gatedPage = await ffetch('/query-index.json')
    .sheet('sitemap')
    .filter((item) => item.path.includes(url))
    .all();

  return gatedPage[0]?.title;
}

async function filteredData(type, searchValue, block, resourcesCallback, fragmentCallback) {
  let data;
  block.innerHTML = '';
  const wrapper = div(p({ class: 'text-center', style: 'padding-top: 20px;' }, `Loading ${type}...`));
  block.appendChild(wrapper);

  if (type !== 'Resources') {
    data = await ffetch('/query-index.json')
      .sheet(type.toLowerCase())
      .filter((item) => hasSearchedValue(item, searchValue))
      .all();
  } else {
    data = await ffetch('/query-index.json')
      .sheet(type.toLowerCase())
      .filter((item) => item.type !== 'Newsletter'
        && item.type !== 'Product'
        && item.type !== 'Application'
        && item.type !== 'Technology'
        && (hasSearchedValue(item, searchValue)))
      .all();
    wrapper.innerHTML = '';
    return block.appendChild(resourcesCallback(`${type} Pages(${data.length}): `, data));
  }

  if (data.length > 0) {
    wrapper.innerHTML = '';
    wrapper.appendChild(await fragmentCallback(type, data, true));
    return block.appendChild(wrapper);
  }
  return '';
}

/*  get tagged items */
async function getTaggedItems(arr, type) {
  const data = await getXMLData(type.toLowerCase());
  const identifiers = data.map((item) => item.identifier || item.title);
  const notAddedItems = [];

  const includedTitles = arr.reduce((acc, item) => {
    const normalizedItem = item.trim().replace(/\b(and|&)\b/gi, '(and|&)');
    let match = identifiers
      .find((identifier) => identifier.trim().toLowerCase() === item.trim().toLowerCase());

    if (!match) {
      match = identifiers.find((identifier) => {
        const normalizedIdentifier = identifier.replace(/\b(and|&)\b/gi, '(and|&)');
        const wordsPattern = normalizedItem.split(' ')
          .map((word) => word.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')) // Escape special regex characters
          .join('.*');
        const regex = new RegExp(wordsPattern, 'i');

        return regex.test(normalizedIdentifier);
      });
    }

    if (match && !acc.includes(match)) {
      acc.push(match);
    } else {
      notAddedItems.push(item);
    }
    return acc;
  }, []);

  const result = div({ style: 'margin-top: 20px;width: 100%; padding: 0;border-bottom: 1px solid #ccc;padding-bottom: 10px;' });

  if (includedTitles.length === 0) {
    result.appendChild(p(`No ${type} found.`));
  } else {
    result.appendChild(p(strong(type), ': ', includedTitles.sort().join(', ')));
  }
  if (notAddedItems.length > 0) {
    result.appendChild(p(strong('Not added items: '), notAddedItems.join('; ')));
  }
  document.getElementById('search-tagging-form').parentElement.appendChild(result);
}

/*  download any data type */
async function downloadDataSheet(downloadBtn, type, previewLink, separatePdf = false) {
  let sheetData;
  previewLink.innerHTML = `Loading ${type}...`;
  // const isOnlyGatedChecked = document.querySelector('#only-gated-urls').checked;
  // console.log(isOnlyGatedChecked);
  if (type === 'All PDFs') {
    sheetData = await ffetch('/query-index.json').sheet('resources').filter((data) => data.path.includes('.pdf')).all();
  } else if (separatePdf && isPdf(type)) {
    sheetData = await ffetch('/query-index.json').sheet('resources').filter((data) => data.type === type).all();
  } else if (type === 'Event') {
    sheetData = await ffetch('/query-index.json').sheet('events').all();
  } else if (type === 'News') {
    sheetData = await ffetch('/query-index.json').sheet('news').all();
  } else {
    sheetData = await ffetch('/query-index.json').filter((data) => data.type === type).all();
  }

  if (type === 'Product') {
    sheetData = await getXMLData('products');
  }
  if (type === 'Application') {
    sheetData = await getXMLData('applications');
  }

  if (sheetData.length === 0) {
    previewLink.innerHTML = 'No data found.';
  } else {
    const sortedData = sortDataByDate(sheetData);
    const filename = type === 0 ? 'other' : toClassName(type);
    const jsonData = sortedData.map((item) => ({
      Title: item.title || item.identifier,
      Path: `https://moleculardevices.com${item.path}`,
      Date: formatDateUTCSeconds(item.date),
      'Gated URL': item.gatedURL && item.gatedURL !== '0' ? item.gatedURL : '-',
      // Type: item.type,
    }));

    setTimeout(() => {
      exportDataToCsv(downloadBtn, filename, jsonData, previewLink);
    }, 500);
  }
}

/* create input section */
function createInputSection(heading, sectionId, inputCls, inputPlaceholder, ctaTitle, moreEl = '', ctaClasses = 'primary') {
  return div({ class: 'section no-padding-top no-padding-bottom', style: 'padding-bottom: 20px' },
    h3(heading),
    form({ style: 'display:flex;', id: sectionId },
      input({
        class: inputCls,
        placeholder: inputPlaceholder,
        required: true,
        name: sectionId,
      }),
      moreEl || '',
      button({ type: 'submit', class: `button ${ctaClasses}` }, ctaTitle),
    ),
  );
}

/* get more great resources */
function extractHttpLinks(links) {
  return links.match(/https?:\/\/[^\s]+/g).map((link) => new URL(link).pathname);
}
// HELPER

// CREATE HTML
function createSearchForm() {
  const heading = 'Search Pages/Resources: ';
  const sectionId = 'search-fragment-form';
  const inputCls = 'search-fragment';
  const placeholder = 'Enter title or path...';
  const ctaTitle = 'Find Pages';
  return createInputSection(heading, sectionId, inputCls, placeholder, ctaTitle);
}

function createTaggingForm() {
  const heading = 'Tagging items: ';
  const sectionId = 'search-tagging-form';
  const inputCls = 'search-tagging-input';
  const placeholder = 'Enter colon seperated list of items...';
  const ctaTitle = 'Find Items';
  const selectBox = select(
    { class: 'select-options', style: 'width: unset !important;' },
    option({ value: 'Products' }, 'Products'),
    option({ value: 'Applications' }, 'Applications'),
    option({ value: 'Technologies' }, 'Technologies'),
  );
  return createInputSection(heading, sectionId, inputCls, placeholder, ctaTitle, selectBox);
}

function createResourcesForm() {
  const heading = 'More Great Resources List: ';
  const sectionId = 'search-more-resources-form';
  const inputCls = 'search-more-resources-input';
  const placeholder = 'Enter More Great Resources List...';
  const ctaTitle = 'Find URLs';
  return createInputSection(heading, sectionId, inputCls, placeholder, ctaTitle);
}

function createFragmentList(type, array) {
  const fragmentList = ul({ class: 'fragments-list-block' });
  const sortedFragments = sortDataWithTitle(array);
  const title = `${type} Pages(${array.length}): `;

  let downloadBtn = '';

  if (type === 'Products' || type === 'Applications' || type === 'Technologies') {
    downloadBtn = a({ class: 'download-sheet-btn' }, 'Load Sheet');

    downloadBtn.addEventListener('click', () => {
      exporttResourcesData(downloadBtn, type, true);
    });
  }

  sortedFragments.forEach(async (item) => {
    const identifier = (item.identifier !== undefined && item.identifier !== '0' && item.identifier !== item.title) ? div(strong(item.identifier)) : '';
    fragmentList.appendChild(li(identifier, a({ href: `${defaultURL}${item.path}`, target: '_blank' }, item.title)));
  });

  return div(
    div({ style: 'display:flex;justify-content: space-between;align-items: center;margin-bottom: 20px;' },
      p({ style: 'margin-bottom: 0;' }, title),
      downloadBtn), fragmentList);
}

function createResourcesList(title, array) {
  const fragmentList = ul({ class: 'fragments-list-block' });
  const sortedFragments = sortDataWithTitle(array);

  sortedFragments.forEach(async (item) => {
    let gatedURL = '';
    if (item.gatedURL && item.gatedURL !== '0') {
      let url = item.gatedURL.includes('http') && item.gatedURL.includes('moleculardevices') ? new URL(item.gatedURL).pathname : item.gatedURL;
      url = url.includes('http') ? url : `${defaultURL}${url}`;
      const gatedPageTitle = await getGatedPageTitle(url);
      gatedURL = div({ style: 'margin-bottom: 10px;' }, 'GATED PAGE: ', a({ href: url }, gatedPageTitle || url));
    }
    fragmentList.appendChild(li(div({ style: 'margin-bottom: 10px;' }, strong(item.type)), gatedURL, div('Resource: ', a({ href: `${defaultURL}${item.path}`, target: '_blank' }, item.title))));
  });

  return div(p(title), fragmentList);
}

function fragmentsLists() {
  const block = document.querySelector('main .fragments-list.tagging');
  const search = document.querySelector('#search-fragment-form > input');
  const searchValue = search.value.toLowerCase();

  const pages = ['Products', 'Applications', 'Technologies', 'Resources'];

  pages.forEach(async (page) => {
    await filteredData(page, searchValue, block, createResourcesList, createFragmentList);
  });
}

async function createDataTypesOptions() {
  const resourceTypes = ['All PDFs', 'Application Note', 'Application', 'Blog', 'Brochure', 'Citation', 'Customer Breakthrough', 'Date Sheet', 'eBook', 'Event', 'Flyer', 'Infographic', 'Newsletter', 'News', 'Newsroom', 'Product', 'Publication', 'Scientific Poster', 'Technology', 'Technical Guide', 'User Guide', 'Video Gallery', 'Videos and Webinars', 'White Paper'];
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
  resourceTypes.forEach((dataType) => {
    selectOption.querySelector('select')
      .appendChild(option({ value: dataType }, dataType !== '0' ? dataType : 'Other'));
  });

  const downloadDataSheetBtn = selectOption.querySelector('#download-data-sheet');
  const dataTypeSelect = selectOption.querySelector('#datatype-select');
  downloadDataSheetBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const datatypeSelectValue = dataTypeSelect.value;
    downloadDataSheet(downloadDataSheetBtn, datatypeSelectValue, previewLink, true);
  });

  return selectOption;
}

async function createMoreResourcesList(links, parent) {
  const list = div({ class: 'list', style: 'padding-left: 0; padding-top: 20px;' });
  list.appendChild(p('Loading...'));
  parent.appendChild(list);
  const resoucesLinks = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((item) => links.includes(item.path) || links.includes(item.gatedURL))
    .all();

  const missingLinks = links.filter(
    (link) => !resoucesLinks.find((item) => item.path === link || item.gatedURL === link));

  const otherLinks = await ffetch('/query-index.json')
    .filter((item) => item.path.includes(missingLinks) || item.gatedURL.includes(missingLinks))
    .all();

  const extractedLinks = [...resoucesLinks, ...otherLinks];
  extractedLinks.map((link) => (
    list.appendChild(div(a({ href: `${defaultURL}${link.path}` }, link.title || link.path)))
  ));
  if (parent.querySelector('.list')) parent.querySelector('.list p').remove();
  parent.appendChild(list);
}
// CREATE HTML

const isFragmentPage = getMetadata('theme') === 'Fragments';
if (isFragmentPage) {
  setTimeout(async () => {
    const mainBlock = document.querySelector('.search-box.block');
    const search = createSearchForm();
    const taggingForm = createTaggingForm();
    const resourceList = createResourcesForm();
    const dataTypeOption = await createDataTypesOptions();

    mainBlock.classList.remove('columns');
    mainBlock.append(search);
    mainBlock.parentElement.parentElement.append(taggingForm);
    mainBlock.parentElement.parentElement.append(resourceList);
    mainBlock.parentElement.parentElement.append(dataTypeOption);

    const searchFragmentForm = document.getElementById('search-fragment-form');
    const searchTaggingForm = document.getElementById('search-tagging-form');
    const resourceListForm = document.getElementById('search-more-resources-form');

    searchFragmentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      fragmentsLists();
    });

    searchTaggingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const taggingValues = searchTaggingForm.querySelector('.search-tagging-input').value;
      const selectOptions = searchTaggingForm.querySelector('.select-options').value;
      const tags = taggingValues
        .split(/[;,•‣∙·]|\bo\b|\bO\b|[\r\n]+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '');
      await getTaggedItems(tags, selectOptions);
    });

    resourceListForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const enteredValue = resourceListForm.querySelector('.search-more-resources-input').value;
      const extractedLinks = extractHttpLinks(enteredValue);
      await createMoreResourcesList(extractedLinks, resourceList);
    });

    /* tab data */
    const fragTabItems = document.querySelectorAll('.fragments .tabs-horizontal .embed-fragment > .section');
    const ThankyouFragments = await ffetch('/fragments/query-index.json')
      .filter((fragment) => fragment.path.indexOf('learn-more-thankyou-content') !== -1)
      .all();
    const appFragments = await ffetch('/fragments/query-index.json')
      .sheet('applications')
      .all();

    const itemsMapping = [
      { heading: 'Thank you', data: ThankyouFragments },
      { heading: 'Applications Fragments', data: appFragments },
      { heading: 'Products', data: await getXMLData('products') },
      { heading: 'Applications', data: await getXMLData('applications') },
      { heading: 'Technologies', data: await getXMLData('technologies') },
    ];

    fetchTabData(fragTabItems, itemsMapping, createFragmentList);
  }, 2000);
}
/* FRAGMENTS LIST END */
