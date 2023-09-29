import ffetch from '../../scripts/ffetch.js';
import { loadScript, getCookie, fetchFragment } from '../../scripts/scripts.js';
import {
  div, h3, p, ul, li, img, a, span, i, iframe, button,
} from '../../scripts/dom-helpers.js';

const PREVIEW_DOMAIN = 'hlxsites.hlx.page';

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
          span({ class: 'rfq-icon-title' }, checkStep === 'step-1' ? rfq.Type : rfq.Category),
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

function iframeResizehandler(formUrl, id, root) {
  root.querySelector('iframe').addEventListener('load', () => {
    if (formUrl) {
      /* global iFrameResize */
      iFrameResize({ log: false }, id);
    }
  });
}

async function loadIframeForm(data, type) {
  loadScript('../../scripts/iframeResizer.min.js');
  const formUrl = 'https://info.moleculardevices.com/rfq';
  const root = document.getElementById('step-3');
  root.innerHTML = '';

  let tab = '';
  let sfdcProductFamily = '';
  let sfdcProductSelection = '';
  let sfdcPrimaryApplication = '';
  let productFamily = '';
  let primaryProductFamily = '';

  const queryParams = new URLSearchParams(window.location.search);
  if (type === 'Product') {
    const typeParam = queryParams && queryParams.get('type');
    tab = data.title;
    sfdcProductFamily = data.productFamily;
    sfdcProductSelection = data.title;
    sfdcPrimaryApplication = data.title;

    // special handling for bundles and customer breakthrough
    if (typeParam
      && typeParam.toLowerCase() === 'bundle'
      && data.productBundle
      && data.productBundle !== '0'
    ) {
      tab = `${data.productBundle} Bundle`;
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
  const mpCmpValue = queryParams && queryParams.get('mdcmp');
  let cmpValue = getCookie('cmp') ? getCookie('cmp') : '70170000000hlRa';
  if (mpCmpValue) cmpValue = mpCmpValue;
  const requestTypeParam = queryParams && queryParams.get('request_type');

  const hubSpotQuery = {
    product_family__c: sfdcProductFamily,
    product_selection__c: sfdcProductSelection,
    product_primary_application__c: sfdcPrimaryApplication,
    cmp: cmpValue,
    google_analytics_medium__c: getCookie('utm_medium') ? getCookie('utm_medium') : '',
    google_analytics_source__c: getCookie('utm_source') ? getCookie('utm_source') : '',
    keyword_ppc__c: getCookie('utm_keyword') ? getCookie('utm_keyword') : '',
    gclid__c: getCookie('gclid') ? getCookie('gclid') : '',
    product_image: 'NA',
    requested_qdc_discussion__c: requestTypeParam || 'Quote',
    return_url: data.familyID
      ? `https://www.moleculardevices.com/quote-request-success?cat=${data.familyID}`
      : 'https://www.moleculardevices.com/quote-request-success',
  };

  root.appendChild(
    div(
      h3("Got it. Now, let's get in touch."),
      p(
        'A team member will contact you within 24-business hours regarding your product inquiry for: ',
        span({ style: 'display: block;font-weight: bold;' }, tab),
      ),
      iframe({
        class: 'contact-quote-request',
        id: 'contactQuoteRequest',
        src: `${formUrl}?${new URLSearchParams(hubSpotQuery).toString()}`,
      }),
    ),
  );
  root.appendChild(createBackBtn('step-3'));
  iframeResizehandler(formUrl, '#contactQuoteRequest', root);
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

  root.appendChild(h3('Please select field of interest'));
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
    root.classList.add('no-categ-form');
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
          class: 'rfq-product-wrapper request-quote-form hide-back-btn',
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
            class: 'rfq-product-wrapper request-quote-form',
            style: 'display: none;',
          }),
        ),
      );
      stepOne(stepTwo);
    }
  }
}
