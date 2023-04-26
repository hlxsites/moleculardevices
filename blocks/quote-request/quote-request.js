import ffetch from '../../scripts/ffetch.js';
import { loadScript, getCookie } from '../../scripts/scripts.js';

const url = '/quote-request/global-rfq.json';
const rfqTypes = await ffetch(url).sheet('types').all();
const rfqCategories = await ffetch(url).sheet('categories').all();

/* CREATE RFQ LIST BOX */
function createRFQListBox(listArr, checkStep, callback) {
  const list = document.createElement('ul');
  list.classList.add('rfq-icon-list');
  listArr.forEach((rfq) => {
    const listItem = document.createElement('li');
    const listLink = document.createElement('a');
    const listImg = document.createElement('img');
    const listTitle = document.createElement('span');

    if (checkStep === 'step-1') {
      const id = rfq.Type.toLowerCase().replace(',', '').trim();
      listLink.id = id.split(' ').join('-');
      listLink.href = '#step-2';
      listImg.setAttribute('alt', rfq.Type);
      listLink.setAttribute('data-tab', rfq.Type);
      listTitle.innerHTML = rfq.Type;
    } else {
      listLink.href = '#step-3';
      listImg.setAttribute('alt', rfq.Category);
      listLink.setAttribute('data-tab', rfq.Category);
      listTitle.innerHTML = rfq.Category;
    }

    listLink.addEventListener('click', callback);
    listImg.src = rfq['RFQ-Image'];
    listImg.classList.add('rfq-icon-img');
    listTitle.classList.add('rfq-icon-title');
    listLink.classList.add('rfq-icon-link');
    listItem.classList.add('rfq-icon-item');

    listLink.appendChild(listImg);
    listLink.appendChild(listTitle);
    listItem.appendChild(listLink);
    list.appendChild(listItem);
  });
  return list;
}
/* CREATE RFQ LIST BOX */

/* CREATE PROGRESS BAR */
function createProgessBar(val, checkStep) {
  const progressWrapper = document.createElement('div');
  const progressBullet = document.createElement('div');
  const progressBar = document.createElement('div');
  const progress = document.createElement('div');

  progressWrapper.classList.add('progress-wrapper');
  progressBullet.classList.add('progress-bullet');
  progressBar.classList.add('progress-bar');
  progress.classList.add('progress');
  progress.id = 'progressBar';

  progress.style.width = `${val}%`;

  if (checkStep === 'step-1') {
    progressWrapper.appendChild(progressBullet);
  }

  progressBar.appendChild(progress);
  progressWrapper.appendChild(progressBar);
  return progressWrapper;
}
/* CREATE PROGRESS BAR */

function backOneStep(stepNum) {
  const currentTab = document.getElementById(stepNum);
  const prevTab = currentTab.previousElementSibling;

  currentTab.style.display = 'none';
  prevTab.style.display = 'block';
}

function createBackBtn(stepNum) {
  const backBtn = document.createElement('button');
  const icon = document.createElement('i');

  icon.classList.add('fa-angle-left', 'fa');
  backBtn.classList.add('back-step-btn');
  backBtn.appendChild(icon);

  backBtn.addEventListener('click', backOneStep.bind(null, stepNum, false));

  return backBtn;
}

function loadIframeForm(stepNum, tab) {
  loadScript('/blocks/quote-request/iframeResizer.min.js');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';

  const formUrl = 'https://info.moleculardevices.com/rfq';
  const heading = document.createElement('h3');
  const description = document.createElement('p');
  const productName = document.createElement('span');
  const iframe = document.createElement('iframe');
  iframe.classList.add('contact-quote-request');
  iframe.id = 'contactQuoteRequest';
  heading.textContent = "Got it. Now, let's get in touch.";

  // eslint-disable-next-line
  description.innerHTML =
    'A team member will contact you within 24-business hours regarding your product inquiry for : <br>';
  productName.innerHTML = `<strong>${tab}</strong>`;

  const productFamily = rfqCategories
    .filter(({ Category }) => Category.includes(tab) > 0);
  const sfdcProductFamily = productFamily[0].ProductFamily;

  const cmpValue = getCookie('cmp') ? getCookie('cmp') : '70170000000hlRa';
  const hubSpotQuery = {
    product_family__c: sfdcProductFamily,
    product_selection__c: sfdcProductFamily,
    product_primary_application__c: sfdcProductFamily,
    cmp: cmpValue,
    google_analytics_medium__c: getCookie('utm_medium') ? getCookie('utm_medium') : '',
    google_analytics_source__c: getCookie('utm_source') ? getCookie('utm_source') : '',
    keyword_ppc__c: getCookie('utm_keyword') ? getCookie('utm_keyword') : '',
    gclid__c: getCookie('gclid') ? getCookie('gclid') : '',
    product_image: 'NA',
    return_url: `https://www.moleculardevices.com/quote-request-success?cat=${tab}&cmp=${cmpValue}&requested_qdc_discussion__c=Quote`,
  };
  iframe.src = `${formUrl}?${new URLSearchParams(hubSpotQuery).toString()}`;

  description.appendChild(productName);
  root.appendChild(heading);
  root.appendChild(description);
  root.appendChild(iframe);
  root.appendChild(createBackBtn(stepNum));

  root.querySelector('iframe').addEventListener('load', () => {
    if (formUrl) {
      /* global iFrameResize */
      iFrameResize({ log: false }, '#contactQuoteRequest');
    }
  });
}

/* step one */
function stepOne(callback) {
  const stepNum = 'step-1';
  const root = document.getElementById(stepNum);
  const defaultProgessValue = 40;
  const heading = document.createElement('h3');
  heading.textContent = 'What type of product are you interested in?';

  const fetchRQFTypes = createRFQListBox(rfqTypes, stepNum, callback);
  const progressBarHtml = createProgessBar(defaultProgessValue, stepNum);

  root.appendChild(heading);
  root.appendChild(fetchRQFTypes);
  root.appendChild(progressBarHtml);
}

/* step three */
function stepThree(e) {
  e.preventDefault();
  let tab = '';
  if (e.target.getAttribute('data-tab')) {
    tab = e.target.getAttribute('data-tab');
  } else {
    tab = e.target.closest('.rfq-icon-link').getAttribute('data-tab');
  }

  const stepNum = 'step-3';
  const prevRoot = document.getElementById('step-2');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';

  loadIframeForm(stepNum, tab);

  root.style.display = 'block';
  prevRoot.style.display = 'none';
}

/* step two */
function stepTwo(e) {
  e.preventDefault();

  let tab = '';
  if (e.target.getAttribute('data-tab')) {
    tab = e.target.getAttribute('data-tab');
  } else {
    tab = e.target.closest('.rfq-icon-link').getAttribute('data-tab');
  }

  const stepNum = 'step-2';
  const prevRoot = document.getElementById('step-1');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';
  const filterData = rfqCategories.filter(({ Type }) => Type.includes(tab) > 0);

  const defaultProgessValue = 70;
  const heading = document.createElement('h3');
  heading.textContent = 'Please select the Instrument category';

  const fetchRQFTypes = createRFQListBox(filterData, stepNum, stepThree);
  const progressBarHtml = createProgessBar(defaultProgessValue, stepNum);

  root.appendChild(heading);
  root.appendChild(fetchRQFTypes);
  root.appendChild(progressBarHtml);
  root.appendChild(createBackBtn(stepNum));
  root.style.display = 'block';
  prevRoot.style.display = 'none';
}

export default async function decorate() {
  document.querySelector('.quote-request').innerHTML = `
  <div id="step-1" class="rfq-product-wrapper"></div>
  <div id="step-2" class="rfq-product-wrapper" style="display: none;"></div>
  <div id="step-3" class="rfq-product-wrapper request-quote-form" style="display: none;"></div>`;
  stepOne(stepTwo);
}
