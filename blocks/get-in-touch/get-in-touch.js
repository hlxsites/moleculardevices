import { div, iframe } from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { toClassName } from '../../scripts/lib-franklin.js';
import { getCookie, iframeResizeHandler } from '../../scripts/scripts.js';

let DEFAULT_CMP = '';
let REGION = new URLSearchParams(window.location.search).get('region');
const COMMENTS = 'comments';

function getUpdatedHubspotUrl(hubspotUrl, paramName) {
  const hubUrl = new URL(hubspotUrl.href);
  const { searchParams } = hubUrl;
  const cmp = getCookie('cmp') || searchParams.get('cmp');
  const returnURL = new URLSearchParams(decodeURIComponent(searchParams.get('return_url')));
  const queryParams = new URLSearchParams(window.location.search);

  searchParams.delete('cmp');
  searchParams.delete('region');
  searchParams.delete('return_url');

  returnURL.set('region', queryParams.get('region') || REGION);

  if (paramName === 'general') searchParams.delete(COMMENTS);
  if (paramName === COMMENTS) searchParams.set(paramName, 'Sales');

  const paramStr = searchParams.toString() ? `&${searchParams}` : '';
  const queryStr = `?return_url=${returnURL.toString()}${paramStr}&cmp=${cmp || DEFAULT_CMP}`;

  return new URL(`${hubspotUrl.pathname}${queryStr}`, hubspotUrl);
}

function createLazyIframe(wrapperClass, url, block, iframeTitle) {
  const iframeID = toClassName(`${iframeTitle}-iframe`);
  const wrapper = div({ class: wrapperClass });
  const iframeWrapper = iframe({ loading: 'lazy', title: iframeTitle, id: iframeID });
  wrapper.appendChild(iframeWrapper);
  url.parentNode.replaceChild(wrapper, url);
  iframeResizeHandler(url, iframeID, wrapper);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      iframeWrapper.src = url.href;
    }
  });
  observer.observe(block);
  return wrapper;
}

function createForm(block, hubspotUrl) {
  createLazyIframe('hubspot-iframe-wrapper get-in-touch-form', hubspotUrl, block, 'Get in touch');
}

function createMap(block, mapUrl) {
  createLazyIframe('map-iframe-wrapper', mapUrl, block, 'Global Headquarters');
}

function regenerateForm(hubspotUrl, params) {
  const hubspotIframe = document.querySelector('.get-in-touch-form');
  if (hubspotUrl) {
    const hubUrl = getUpdatedHubspotUrl(hubspotUrl, params);
    hubspotUrl.href = hubUrl.href;
    hubspotIframe.querySelector('iframe').setAttribute('src', hubspotUrl.href);
  }
}

function scrollToForm(link, hubspotUrl) {
  const getInTouchBlock = document.getElementById('get-in-touch');
  if (!getInTouchBlock || !hubspotUrl) return;
  // Update URL
  const hubUrlParams = new URLSearchParams(hubspotUrl.href);
  if (!DEFAULT_CMP) DEFAULT_CMP = hubUrlParams.get('cmp');

  const isSales = link?.getAttribute('title') === 'Sales Inquiry Form';
  const param = isSales ? COMMENTS : 'general';
  regenerateForm(hubspotUrl, param);

  window.scroll({
    top: getInTouchBlock.offsetTop - 100,
    behavior: 'smooth',
  });
}

export default async function decorate(block) {
  const queryParams = new URLSearchParams(window.location.search);
  const hubspotUrl = block.querySelector('[href*="https://info.moleculardevices.com"]');
  const mapUrl = block.querySelector('[href*="https://maps.google.com"]');

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
    createForm(block, hubspotUrl);
    createMap(block, mapUrl);
  }

  /* get region on tab click */
  const tabLinks = document.querySelectorAll('.regional-contacts-wrapper .tab-wrapper > a');
  if (tabLinks) {
    tabLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const regionName = link.hash.split('#')[1] || queryParams.get('region');
        REGION = regionName;
        regenerateForm(hubspotUrl, '');
        setTimeout(() => {
          document.getElementById('country').selectedIndex = 1;
        }, 500);
      });
    });
  }

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
      regenerateForm(hubspotUrl, '');
    });
  }

  /* scroll to form on click of inquiry links */
  const inquiryLinks = ['General Inquiry Form', 'Sales Inquiry Form', 'Contact Local Team', 'Service plans/warranty'];
  const links = document.querySelectorAll('a[title]');
  links.forEach((link) => {
    if (inquiryLinks.includes(link.getAttribute('title'))) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToForm(link, hubspotUrl, REGION);
      }, false);
    }
  });
}
