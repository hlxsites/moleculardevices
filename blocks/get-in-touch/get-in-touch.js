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

function createLazyIframe(wrapperClass, url, block, iframeTitle) {
  const iframeID = toClassName(`${iframeTitle}-iframe`);
  const wrapper = div({ class: wrapperClass });
  const iframeEl = iframe({ loading: 'lazy', title: iframeTitle, id: iframeID });
  wrapper.appendChild(iframeEl);
  url.parentNode.replaceChild(wrapper, url);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      iframeEl.src = url.href;

      iframeEl.addEventListener('load', () => {
        iframeResizeHandler(url, iframeID, wrapper);
        setTimeout(() => {
          // eslint-disable-next-line no-undef
          iFrameResize({ log: false }, iframeEl);
        }, 500);
      }, { once: true });
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

function regenerateForm(hubspotUrl, params = '') {
  const hubspotIframe = document.querySelector('.get-in-touch-form iframe');
  if (!hubspotIframe || !hubspotUrl) return;

  const newUrl = hubSpotFinalUrl(hubspotUrl, params).href;
  hubspotUrl.href = newUrl;
  hubspotIframe.removeAttribute('src');

  requestAnimationFrame(() => {
    hubspotIframe.src = newUrl;
    hubspotIframe.addEventListener('load', () => {
      setTimeout(() => {
        // eslint-disable-next-line no-undef
        iFrameResize({ log: false }, hubspotIframe);
      }, 500);
    }, { once: true });
  });
}

function scrollToForm(event, hubspotUrl) {
  event.preventDefault();
  event.stopPropagation();

  const block = document.getElementById('get-in-touch');
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

    window.scroll({ top: block.offsetTop - 100, behavior: 'smooth' });
  } else {
    block.lastElementChild.remove(); // success message we don't need for this case
    createForm(block, hubspotUrl);
    createMap(block, mapUrl);
  }

  /* get region on tab click */
  const tabLinks = document.querySelectorAll('.regional-contacts-wrapper .tab-wrapper > a');
  let previousRegion = REGION;
  if (tabLinks.length) {
    tabLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const newRegion = link.hash.slice(1) || queryParams.get('region');
        if (newRegion !== previousRegion) {
          REGION = newRegion;
          regenerateForm(hubspotUrl);
          setTimeout(() => { document.getElementById('country').selectedIndex = 1; }, 500);
          previousRegion = newRegion;
        }
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

  /* scroll to form on click of inquiry links */
  const inquiryTitles = ['General Inquiry Form', 'Sales Inquiry Form', 'Contact Local Team', 'Service plans/warranty'];
  const links = document.querySelectorAll('a[title]');
  links.forEach((link) => {
    if (inquiryTitles.includes(link.getAttribute('title'))) {
      link.removeAttribute('href');
      link.setAttribute('role', 'button');
      link.setAttribute('tabindex', '0');
      link.setAttribute('aria-label', link.getAttribute('title'));
      link.addEventListener('touchstart', () => { }, { passive: true });
      link.addEventListener('click', (e) => scrollToForm(e, hubspotUrl));
    }
  });
}
