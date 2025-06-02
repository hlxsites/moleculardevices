import ffetch from '../../scripts/ffetch.js';
import { getCookie, fetchFragment } from '../../scripts/scripts.js';
import {
  div, h3, ul, li, img, a, span, i, button,
  p,
} from '../../scripts/dom-helpers.js';
import { sampleRUM } from '../../scripts/lib-franklin.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';
import { getFormId } from '../forms/formHelper.js';

const PREVIEW_DOMAIN = '.aem.page';

const url = '/quote-request/global-rfq.json';
const rfqTypes = await ffetch(url).sheet('types').all();
const rfqCategories = await ffetch(url).sheet('categories').all();

export async function getRFQDataByFamilyID(pid) {
  if (pid) {
    const productRfq = await ffetch('/query-index.json')
      .sheet('rfq')
      .withFetch(fetch)
      .filter(({ familyID }) => familyID === pid)
      .first();
    return productRfq;
  }
  return false;
}

export async function getRFQDataByTitle(name) {
  if (name) {
    const productRfq = await ffetch('/query-index.json')
      .sheet('rfq')
      .withFetch(fetch)
      .filter(({ title }) => title === name)
      .first();
    return productRfq;
  }
  return false;
}

/* CREATE RFQ LIST BOX */
function createRFQListBox(listArr, checkStep) {
  const list = ul({ class: 'rfq-icon-list' });

  listArr.forEach((rfq) => {
    const id = rfq.Type.toLowerCase().replace(',', '').trim();
    const dataTabValue = checkStep === 'step-1' ? rfq.Type : rfq.Category;
    let tabName = dataTabValue;
    const filterData = rfqCategories.filter(({ Type }) => Type.includes(dataTabValue) > 0);
    const hasCateg = checkStep === 'step-1' && filterData.length > 0;
    const hashValue = hasCateg ? '#step-2' : '#step-3';
    // eslint-disable-next-line no-use-before-define
    const callback = hasCateg ? stepTwo : stepThree;

    let classes;
    if (filterData.length > 0 && !rfq.Category) {
      classes = 'rfq-icon-link has-categ';
    } else {
      classes = 'rfq-icon-link no-categ';
    }
    if (rfq.Category) {
      classes = 'rfq-icon-link';
    }

    if (rfq?.DisplayText) {
      tabName = rfq.DisplayText;
    } else if (checkStep === 'step-1') {
      tabName = rfq.Type;
    } else {
      tabName = rfq.Category;
    }

    list.appendChild(
      li(
        { class: 'rfq-icon-item' },
        a(
          {
            class: classes,
            'data-id': id.split(' ').join('-'),
            href: hashValue,
            'data-tab': dataTabValue,
            onclick: callback.bind(null, dataTabValue),
          },
          img({
            class: 'rfq-icon-img',
            src: rfq['RFQ-Image'],
            alt: checkStep === 'step-1' ? rfq.Type : rfq.Category,
          }),
          span({ class: 'rfq-icon-title' }, tabName),
        ),
      ),
    );
  });
  return list;
}
/* CREATE RFQ LIST BOX */

/* CREATE PROGRESS BAR */
function createProgessBar(val, checkStep) {
  return div(
    { class: 'progress-wrapper' },
    checkStep === 'step-1' ? div({ class: 'progress-bullet' }) : '',
    div(
      { class: 'progress-bar' },
      div({ class: 'progress', id: 'progressBar', style: `width: ${val}%` }),
    ),
  );
}
/* CREATE PROGRESS BAR */

function backOneStep(stepNum) {
  const currentTab = document.getElementById(stepNum);
  if (currentTab.classList.contains('no-categ-form')) {
    const rfqTypeTab = document.getElementById('step-1');
    rfqTypeTab.style.display = 'block';
  } else {
    const prevTab = currentTab.previousElementSibling;
    prevTab.style.display = 'block';
  }

  currentTab.style.display = 'none';
}

function createBackBtn(stepNum) {
  return button(
    {
      class: 'back-step-btn',
      onclick: () => {
        backOneStep(stepNum);
      },
    },
    i({ class: 'fa-angle-left fa' }),
  );
}

function prepImageUrl(thumbImage) {
  const thumbImg = thumbImage;
  let thumbImgnew = '';
  if (!thumbImg.startsWith('https')) {
    if (thumbImg.startsWith('.')) {
      thumbImgnew = thumbImage.substring(1);
    }
    thumbImgnew = `https://www.moleculardevices.com${thumbImgnew}`;
  }
  return thumbImgnew;
}

async function loadIframeForm(data, type) {
  const root = document.getElementById('step-3');
  const rfqRUM = { source: 'global' };
  root.innerHTML = '';

  let tab = '';
  let sfdcProductFamily = '';
  let sfdcProductSelection = '';
  let sfdcPrimaryApplication = '';
  let productFamily = '';
  let primaryProductFamily = '';
  let productImage = '';
  let bundleThumbnail = '';
  let productBundle = '';
  const queryParams = new URLSearchParams(window.location.search);
  if (type === 'Product') {
    const typeParam = queryParams && queryParams.get('type');
    rfqRUM.source = 'product';
    if (data.familyID) rfqRUM.target = data.familyID;
    tab = data.title;
    sfdcProductFamily = data.productFamily;
    sfdcProductSelection = data.title;
    sfdcPrimaryApplication = data.title;

    // prepare the product image url
    if (data.thumbnail && data.thumbnail !== '0') {
      productImage = prepImageUrl(data.thumbnail);
    }

    // special handling for bundles and customer breakthrough
    if (typeParam
      && typeParam.toLowerCase() === 'bundle'
      && data.productBundle
      && data.productBundle !== '0'
    ) {
      tab = `${data.productBundle} Bundle`;
      productBundle = data.productBundle;
      // prepare the product bundle thumbnail url
      if (data.bundleThumbnail && data.bundleThumbnail !== '0') {
        bundleThumbnail = prepImageUrl(data.bundleThumbnail);
      }
    } else if (data.type === 'Customer Breakthrough') {
      const fragmentHtml = await fetchFragment(data.path, false);
      if (fragmentHtml) {
        const fragmentElement = div();
        fragmentElement.innerHTML = fragmentHtml;
        const relatedProducts = fragmentElement
          .querySelector('meta[name="related-products"]')
          .getAttribute('content');
        tab = relatedProducts && relatedProducts.trim().length > 0 ? relatedProducts : data.title;
        sfdcPrimaryApplication = tab;

        const mainProduct = await getRFQDataByTitle(relatedProducts.split(',')[0].trim());
        if (mainProduct) {
          sfdcProductFamily = mainProduct.productFamily;
          sfdcProductSelection = mainProduct.productFamily;
        }
      }
    }
  } else {
    tab = data;

    primaryProductFamily = rfqTypes.filter(({ Type }) => Type.includes(tab) > 0);
    if (primaryProductFamily.length > 0) {
      sfdcProductFamily = primaryProductFamily[0].PrimaryProductFamily;
    }

    productFamily = rfqCategories.filter(({ Category }) => Category.includes(tab) > 0);
    if (productFamily.length > 0) {
      sfdcProductFamily = productFamily[0].ProductFamily;
    }

    sfdcProductSelection = tab;
    sfdcPrimaryApplication = tab;
  }

  // get cmp in three steps: mdcmp parameter, cmp cookie, default campaign
  // const mpCmpValue = queryParams && queryParams.get('mdcmp');
  const cmpValue = getCookie('cmp') ? getCookie('cmp') : '701Rn00000S8jXhIAJ'; // old cmp  70170000000hlRa

  // if (mpCmpValue) cmpValue = mpCmpValue;
  const requestTypeParam = queryParams && queryParams.get('request_type');
  const hubSpotQuery = {
    formId: getFormId('rfq'),
    productFamily: sfdcProductFamily,
    productSelection: sfdcProductSelection,
    productPrimaryApplication: sfdcPrimaryApplication,
    cmp: cmpValue,
    googleAnalyticsMedium: getCookie('utm_medium') ? getCookie('utm_medium') : '',
    googleAnalyticsSource: getCookie('utm_source') ? getCookie('utm_source') : '',
    keywordPPC: getCookie('utm_keyword') ? getCookie('utm_keyword') : '',
    gclid: getCookie('gclid') ? getCookie('gclid') : '',
    productImage: productImage || 'NA',
    productBundleImage: bundleThumbnail || 'NA',
    productBundle,
    qdc: requestTypeParam || 'Quote',
    redirectUrl: data.familyID
      ? `https://www.moleculardevices.com/quote-request-success?cat=${data.familyID}`
      : 'https://www.moleculardevices.com/quote-request-success',
  };

  if (data.path) {
    hubSpotQuery.website = `https://www.moleculardevices.com${data.path}`;
  }

  const contactQuoteRequestID = 'contactQuoteRequest';
  const formWrapper = div(
    h3('Request Quote or Information for:'),
    h3(tab),
    p('To ensure the best solution for your application, please complete the form in full. This will enable us to initiate a conversation about your requirements and provide an accurate quote.'),
    div({
      class: 'contact-quote-request',
      id: contactQuoteRequestID,
    }),
  );
  loadHubSpotScript(createHubSpotForm.bind(null, hubSpotQuery, contactQuoteRequestID));
  root.appendChild(formWrapper);
  root.appendChild(createBackBtn('step-3'));
  rfqRUM.type = hubSpotQuery.requested_qdc_discussion__c;
  sampleRUM('rfq', rfqRUM);
}

/* step one */
function stepOne() {
  const stepNum = 'step-1';
  const root = document.getElementById(stepNum);
  const defaultProgessValue = 40;

  const fetchRQFTypes = createRFQListBox(rfqTypes, stepNum);
  const progressBarHtml = createProgessBar(defaultProgessValue, stepNum);

  root.appendChild(h3('What type of product or service are you interested in?'));
  root.appendChild(fetchRQFTypes);
  root.appendChild(progressBarHtml);
}

/* step two */
function stepTwo(tab, event) {
  event.preventDefault();

  const stepNum = 'step-2';
  const prevRoot = document.getElementById('step-1');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';
  const filterData = rfqCategories.filter(({ Type }) => Type.includes(tab) > 0);

  const defaultProgessValue = 70;
  const fetchRQFTypes = createRFQListBox(filterData, stepNum);
  const progressBarHtml = createProgessBar(defaultProgessValue, stepNum);

  if (tab === 'Services') {
    root.appendChild(h3('Please select service of interest'));
  } else {
    root.appendChild(h3('Please select field of interest'));
  }

  root.appendChild(fetchRQFTypes);
  root.appendChild(progressBarHtml);
  root.appendChild(createBackBtn(stepNum));
  root.style.display = 'block';
  prevRoot.style.display = 'none';
}

/* step three */
function stepThree(tab, event) {
  event.preventDefault();

  const stepNum = 'step-3';
  const prevRoot1 = document.getElementById('step-1');
  const prevRoot2 = document.getElementById('step-2');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';

  loadIframeForm(tab, 'Global');

  if (event.target.closest('.rfq-icon-link').classList.contains('no-categ')) {
    root.classList.add('no-categ-form', 'hubspot-form');
  } else {
    root.classList.remove('no-categ-form');
  }

  root.style.display = 'block';
  prevRoot1.style.display = 'none';
  prevRoot2.style.display = 'none';
}

export default async function decorate(block) {
  const isThankyouPage = block.classList.contains('thankyou');
  const htmlContentRoot = block.children[0].children[0].children[0];
  const parentSection = block.parentElement.parentElement;

  if (isThankyouPage) {
    parentSection.prepend(htmlContentRoot.children[0]);
    htmlContentRoot.remove();
    const htmlContent = block.children[0].children[0];
    block.innerHTML = '';
    block.appendChild(
      div(
        {
          class: 'rfq-product-wrapper',
        },
        div({ class: 'rfq-thankyou-msg' }, htmlContent),
      ),
    );
  } else {
    const queryParams = new URLSearchParams(window.location.search);
    const pid = queryParams.get('pid');
    let rfqData = await getRFQDataByFamilyID(queryParams.get('pid'));
    parentSection.prepend(htmlContentRoot);
    block.innerHTML = '';
    if ((rfqData || window.location.host.includes(PREVIEW_DOMAIN)) && pid) {
      block.appendChild(
        div({
          id: 'step-3',
          class: 'rfq-product-wrapper request-quote-form hide-back-btn hubspot-form',
        }),
      );
      if (!rfqData) {
        rfqData = { title: pid, familyId: pid };
      }
      loadIframeForm(rfqData, 'Product');
    } else {
      block.appendChild(
        div(
          div({
            id: 'step-1',
            class: 'rfq-product-wrapper',
          }),
          div({
            id: 'step-2',
            class: 'rfq-product-wrapper',
            style: 'display: none;',
          }),
          div({
            id: 'step-3',
            class: 'rfq-product-wrapper request-quote-form hubspot-form',
            style: 'display: none;',
          }),
        ),
      );
      stepOne(stepTwo);
    }
  }
}
