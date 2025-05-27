import { div, iframe } from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { toClassName } from '../../scripts/lib-franklin.js';
import { getCookie, iframeResizeHandler } from '../../scripts/scripts.js';

let DEFAULT_CMP = '';
let REGION = new URLSearchParams(window.location.search).get('region');
const COMMENTS = 'comments';

function hubSpotFinalUrl(hubspotUrl, paramName) {
  const hubUrl = new URL(hubspotUrl.href);
  const { searchParams } = hubUrl;
  const cmp = getCookie('cmp') || searchParams.get('cmp');
  const queryParams = new URLSearchParams(window.location.search);
  const returnURL = new URLSearchParams(decodeURIComponent(searchParams.get('return_url')));

  ['cmp', 'region', 'return_url'].forEach((param) => searchParams.delete(param));
  returnURL.set('region', queryParams.get('region') || REGION);

  if (paramName === 'general') searchParams.delete(COMMENTS);
  if (paramName === COMMENTS) searchParams.set(COMMENTS, 'Sales');

  const queryStr = `?return_url=${returnURL.toString()}${searchParams.toString() ? `&${searchParams}` : ''}&cmp=${cmp || DEFAULT_CMP}`;

  return new URL(`${hubUrl.pathname}${queryStr}`, hubUrl);
}

function createForm(block, hubspotUrl) {
  const title = 'Get in touch';
  const hubspotIframeWrapper = div({ class: 'hubspot-iframe-wrapper get-in-touch-form' });
  const hubspotIframe = iframe({ loading: 'lazy;', title, id: toClassName(title) });
  hubspotIframeWrapper.appendChild(hubspotIframe);
  hubspotUrl.parentNode.replaceChild(hubspotIframeWrapper, hubspotUrl);
  iframeResizeHandler(hubspotUrl.href, toClassName(title), block);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      const hubUrl = hubSpotFinalUrl(hubspotUrl, 'region');
      hubspotUrl.href = hubUrl.href;
      hubspotIframe.src = hubspotUrl.href;
    }
  });
  observer.observe(block);
}

function createMap(block, mapUrl) {
  const title = 'Global Headquarters';
  const mapIframeWrapper = div({ class: 'map-iframe-wrapper' });
  const mapIframe = iframe({ loading: 'lazy;', title, id: toClassName(title) });
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

function regenerateForm(hubspotUrl, params = '') {
  const iframeWrapper = document.querySelector('.get-in-touch-form iframe');
  if (!iframeWrapper || !hubspotUrl) return;

  const newUrl = hubSpotFinalUrl(hubspotUrl, params).href;
  hubspotUrl.href = newUrl;
  iframeWrapper.setAttribute('src', newUrl);
}

function scrollToForm(event, hubspotUrl) {
  event.preventDefault();
  event.stopPropagation();

  const block = document.querySelector('.get-in-touch');
  const isSales = event.target?.getAttribute('title') === 'Sales Inquiry Form';
  const param = isSales ? COMMENTS : 'general';

  if (hubspotUrl) {
    const url = new URL(hubspotUrl.href);
    if (!DEFAULT_CMP) DEFAULT_CMP = url.searchParams.get('cmp');
    regenerateForm(hubspotUrl, param);
  }

  window.scroll({ top: block.offsetTop - 100, behavior: 'smooth' });
}

function setRegionByCountry(distributors, country) {
  const selected = distributors.find((dist) => dist.DisplayCountry === country);
  REGION = selected?.Region.toLowerCase();
}

export default async function decorate(block) {
  const queryParams = new URLSearchParams(window.location.search);
  const hubspotUrl = block.querySelector('[href*="https://info.moleculardevices.com"]');
  const mapUrl = block.querySelector('[href*="https://maps.google.com"]');

  /* set success msg */
  if (queryParams.has('msg') && queryParams.get('msg') === 'success') {
    const successMsg = block.lastElementChild.firstElementChild;
    successMsg.classList.add('hubspot-success');
    hubspotUrl.closest('div').replaceWith(successMsg);
    block.lastElementChild.remove();
    createMap(block, mapUrl);

    setTimeout(() => { block?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 1000);
  } else {
    block.lastElementChild.remove(); // success message we don't need for this case
    createForm(block, hubspotUrl);
    createMap(block, mapUrl);
  }

  /* get region on tab click */
  const tabLinks = document.querySelectorAll('.regional-contacts-wrapper .tab-wrapper > a');
  if (tabLinks.length) {
    tabLinks.forEach((link) => {
      link.addEventListener('click', () => {
        REGION = link.hash.slice(1) || queryParams.get('region');
        regenerateForm(hubspotUrl);
        setTimeout(() => { document.getElementById('country').selectedIndex = 1; }, 500);
      });
    });
  }

  /* get region on country change */
  const distributors = await ffetch('/contact/local-distibutors.json').withFetch(fetch).all();
  const searchButton = document.querySelector('#searchButton > button');
  const countrySelect = document.getElementById('country');

  if (window.location.pathname === '/contact-search') {
    setRegionByCountry(distributors, countrySelect.value);
  } else {
    countrySelect.selectedIndex = 1;
  }

  searchButton?.addEventListener('click', (event) => {
    event.preventDefault();
    setRegionByCountry(distributors, countrySelect.value);
    regenerateForm(hubspotUrl);
  });

  searchButton?.addEventListener('click', (event) => {
    event.preventDefault();
    setRegionByCountry(distributors, countrySelect.value);
    regenerateForm(hubspotUrl);
  });

  /* scroll to form on click of inquiry links */
  const inquiryTitles = ['General Inquiry Form', 'Sales Inquiry Form', 'Contact Local Team', 'Service plans/warranty'];
  const links = document.querySelectorAll('a[title]');
  links.forEach((link) => {
    if (inquiryTitles.includes(link.getAttribute('title'))) {
      link.removeAttribute('href');
      link.setAttribute('role', 'button');
      link.setAttribute('aria-label', link.getAttribute('title'));
      link.addEventListener('click', (e) => scrollToForm(e, hubspotUrl));
    }
  });
}
