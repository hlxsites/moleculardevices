import { div } from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { getCookie } from '../../scripts/scripts.js';
import { getFormId } from '../forms/formHelper.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';

// const CONTACT_CMP_ID = getCookie('cmp') || new URLSearchParams(window.location.search).get('cmp')
//  || '701Rn00000S2zk6IAB';
const CONTACT_CMP_ID = getCookie('cmp') || new URLSearchParams(window.location.search).get('cmp') || '701Rn00000OJ0zYIAT';
const formType = 'get-in-touch';
const pathName = window.location.origin + window.location.pathname;
let REGION = new URLSearchParams(window.location.search).get('region');

const formConfig = {
  formId: getFormId(formType),
  cmp: CONTACT_CMP_ID,
  qdc: 'Call',
  productPrimaryApplication: 'General Inquiry Form Submission',
  redirectUrl: new URL(`?msg=success&region=${REGION}`, pathName),
};

function updateParams(params) {
  const returnUrlInput = document.querySelector("input[name='return_url']");
  const baseRedirectUrl = new URL(formConfig.redirectUrl, pathName);

  Object.entries(params).forEach(([key, value]) => {
    if (value || value === 'sales') {
      baseRedirectUrl.searchParams.set(key, value);
    } else if (value === 'general') {
      baseRedirectUrl.searchParams.delete(key);
    } else {
      baseRedirectUrl.searchParams.delete(key);
    }
  });

  baseRedirectUrl.searchParams.delete('comments');
  // baseRedirectUrl.searchParams.delete('cmp');

  formConfig.redirectUrl = baseRedirectUrl.pathname + baseRedirectUrl.search;
  returnUrlInput.value = new URL(formConfig.redirectUrl, pathName);
}

/* create form */
function createForm(block) {
  const contactFormID = 'get-in-touch-form';
  const hubspotIframeWrapper = div(
    { class: 'hubspot-form-wrapper' },
    div({
      class: 'show-label',
      id: contactFormID,
    }));

  loadHubSpotScript(createHubSpotForm.bind(null, formConfig, contactFormID, formType));
  block.firstElementChild.firstElementChild.appendChild(hubspotIframeWrapper);
}

/* create google map */
function createMap(block, mapUrl) {
  const mapIframeWrapper = document.createElement('div');
  const mapIframe = document.createElement('iframe');
  mapIframeWrapper.className = 'map-iframe-wrapper';
  mapIframe.setAttribute('loading', 'lazy');
  mapIframeWrapper.appendChild(mapIframe);
  mapUrl.parentNode.replaceChild(mapIframeWrapper, mapUrl);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      mapIframe.src = mapUrl.href;
    }
  });
  observer.observe(block);
}

function scrollToForm(link, region) {
  const hubspotFormWrapper = document.getElementById('get-in-touch-form');
  const getInTouchBlock = document.querySelector('.get-in-touch');
  const getInTouchInterestsSelect = hubspotFormWrapper.querySelector("select[name='get_in_touch_interests']");

  if (hubspotFormWrapper) {
    let params = 'general';
    if (link && link.getAttribute('title') === 'Sales Inquiry Form') {
      params = 'sales';
      getInTouchInterestsSelect.value = 'Sales';
      getInTouchInterestsSelect.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      getInTouchInterestsSelect.selectedIndex = 0;
    }
    updateParams({ comments: params, region });
  }

  window.scroll({
    top: getInTouchBlock.offsetTop - 100,
    behavior: 'smooth',
  });
}

export default async function decorate(block) {
  const queryParams = new URLSearchParams(window.location.search);
  const hubspotUrl = block.querySelector('[href*="https://info.moleculardevices.com"]');
  const mapUrl = block.querySelector('[href*="https://maps.google.com"]');
  // block.querySelector('p:last-child').remove();
  // console.log(block);

  /* set success msg */
  if (queryParams.has('msg') && queryParams.get('msg') === 'success') {
    const getInTouchBlock = document.querySelector('.get-in-touch');
    const successMsg = block.lastElementChild.firstElementChild;
    successMsg.classList.add('hubspot-success');
    hubspotUrl.closest('div').replaceWith(successMsg);
    block.lastElementChild.remove();
    createMap(block, mapUrl);
    setTimeout(() => {
      if (getInTouchBlock) {
        window.scroll({
          top: getInTouchBlock.offsetTop - 100,
          behavior: 'smooth',
        });
      }
    }, 1000);
  } else {
    block.lastElementChild.remove(); // success message we don't need for this case
    createForm(block);
    createMap(block, mapUrl);
  }

  /* get region on tab click */
  const tabLinks = document.querySelectorAll('.regional-contacts-wrapper .tab-wrapper > a');
  if (tabLinks) {
    tabLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const regionName = link.hash.split('#')[1] || queryParams.get('region');
        REGION = regionName;

        // update region
        updateParams({ region: REGION });

        // set default country value to FIND A LOCAL DISTRIBUTOR
        setTimeout(() => {
          document.getElementById('country').selectedIndex = 1;
        }, 500);
      });
    });
  }

  /* scroll to form on click of inquiry links */
  const inquiryLinks = ['General Inquiry Form', 'Sales Inquiry Form', 'Contact Local Team', 'Service plans/warranty'];
  const links = document.querySelectorAll('a[title]');
  links.forEach((link) => {
    if (inquiryLinks.includes(link.getAttribute('title'))) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToForm(link, REGION);
      }, false);
    }
  });

  /* get region on country change */
  const distributors = await ffetch('/contact/local-distibutors.json').withFetch(fetch).all();
  const searchButton = document.querySelector('#searchButton > button');
  const countrySelect = document.getElementById('country');

  if (window.location.pathname === '/contact-search') {
    REGION = distributors.filter(
      (dist) => dist.DisplayCountry === countrySelect.value)[0].Region.toLowerCase();
  } else {
    document.getElementById('country').selectedIndex = 1;
  }

  if (searchButton) {
    searchButton.addEventListener('click', (event) => {
      event.preventDefault();
      const countryObj = distributors.filter(
        (dist) => dist.DisplayCountry === countrySelect.value)[0].Region.toLowerCase();
      REGION = countryObj || queryParams.get('region');
      updateParams();
    });
  }
}
