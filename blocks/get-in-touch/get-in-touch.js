import ffetch from '../../scripts/ffetch.js';
import { getCookie } from '../../scripts/scripts.js';

let DEFAULT_CMP = '';
let REGION = new URLSearchParams(window.location.search).get('region');
const COMMENTS = 'comments';

function hubSpotFinalUrl(hubspotUrl, paramName) {
  const hubUrl = new URL(hubspotUrl.href);
  const { searchParams } = hubUrl;
  const cmp = getCookie('cmp') || searchParams.get('cmp');
  const returnURL = new URLSearchParams(decodeURIComponent(searchParams.get('return_url')));
  const queryParams = new URLSearchParams(window.location.search);

  searchParams.delete('cmp');
  searchParams.delete('region');
  searchParams.delete('return_url');

  returnURL.set('region', queryParams.get('region') || REGION);

  if (paramName === 'general') {
    searchParams.delete(COMMENTS);
  }
  if (paramName === COMMENTS) {
    searchParams.set(paramName, 'Sales');
  }

  const searchPatamsStr = searchParams.toString() ? `&${(searchParams.toString())}` : '';
  const queryStr = `?return_url=${returnURL.toString()}${searchPatamsStr}&cmp=${cmp || DEFAULT_CMP}`;
  return new URL(`${hubspotUrl.pathname}${queryStr}`, hubspotUrl);
}

function createForm(block, hubspotUrl) {
  const hubspotIframeWrapper = document.createElement('div');
  const hubspotIframe = document.createElement('iframe');
  hubspotIframeWrapper.className = 'hubspot-iframe-wrapper get-in-touch-form';
  hubspotIframe.setAttribute('loading', 'lazy');
  hubspotIframeWrapper.appendChild(hubspotIframe);
  hubspotUrl.parentNode.replaceChild(hubspotIframeWrapper, hubspotUrl);

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

function regenerateForm(hubspotUrl, params) {
  const hubspotIframe = document.querySelector('.get-in-touch-form');
  if (hubspotUrl) {
    const hubUrl = hubSpotFinalUrl(hubspotUrl, params);
    hubspotUrl.href = hubUrl.href;
    hubspotIframe.querySelector('iframe').setAttribute('src', hubspotUrl);
  }
}

function scrollToForm(link, hubspotUrl, region) {
  const hubspotIframe = document.querySelector('.get-in-touch-form');
  const getInTouchBlock = document.querySelector('.get-in-touch');
  if (hubspotIframe && hubspotUrl) {
    const url = new URLSearchParams(hubspotUrl.href);
    if (!DEFAULT_CMP) {
      DEFAULT_CMP = url.get('cmp');
    }
    let params = 'general';
    if (link && link.getAttribute('title') === 'Sales Inquiry Form') {
      params = COMMENTS;
    }
    const hubUrl = hubSpotFinalUrl(hubspotUrl, params, region);
    hubspotUrl.href = hubUrl.href;
    hubspotIframe.querySelector('iframe').setAttribute('src', hubspotUrl);
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
