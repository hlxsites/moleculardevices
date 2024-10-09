/* eslint-disable max-len */
import { getCookie } from '../../scripts/scripts.js';

let DEFAULT_CMP = '';
let REGION = new URLSearchParams(window.location.search).get('region');
const COMMENTS = 'comments';

function copySearchParamsToReturnURL(searchParams, returnUrl) {
  const targetUrl = new URL(returnUrl);
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.delete(key);
    targetUrl.searchParams.set(key, value);
  });
  targetUrl.searchParams.delete(COMMENTS);
  return targetUrl;
}

function hubSpotFinalUrl(hubspotUrl, paramName) {
  const hubUrl = new URL(hubspotUrl.href);
  const { searchParams } = hubUrl;
  const returnURL = searchParams.get('return_url');
  const cmp = getCookie('cmp') || searchParams.get('cmp');
  const queryParams = new URLSearchParams(window.location.search);

  searchParams.delete('cmp');
  searchParams.delete('region');
  searchParams.delete('return_url');

  if (paramName === COMMENTS) {
    searchParams.set(paramName, 'Sales');
  } else {
    const queryStringParam = queryParams.get(paramName) || '';
    searchParams.set(paramName, queryStringParam);
  }

  const modifiedReturnUrl = copySearchParamsToReturnURL(searchParams, returnURL);
  if (!modifiedReturnUrl.searchParams.has('msg')) {
    modifiedReturnUrl.searchParams.set('msg', 'success');
  }

  const queryStr = `?return_url=${encodeURIComponent(modifiedReturnUrl.href)}&${searchParams.toString()}&cmp=${cmp || DEFAULT_CMP}`;
  return new URL(`${hubspotUrl.pathname}${queryStr}`, hubspotUrl);
}

function createForm(block, hubspotUrl) {
  const hubspotIframeWrapper = document.createElement('div');
  const hubspotIframe = document.createElement('iframe');
  hubspotIframeWrapper.className = 'hubspot-iframe-wrapper';
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

function scrollToForm(link, hubspotUrl, region) {
  const hubspotIframe = document.querySelector('.hubspot-iframe-wrapper');
  if (hubspotUrl) {
    const url = new URLSearchParams(hubspotUrl.href);
    if (!DEFAULT_CMP) {
      DEFAULT_CMP = url.get('cmp');
    }
    if (link.getAttribute('title') === 'Sales Inquiry Form') {
      const hubUrl = hubSpotFinalUrl(hubspotUrl, COMMENTS, region);
      hubspotUrl.href = hubUrl.href;
    } else {
      const [href] = hubspotUrl.href.split('&');
      hubspotUrl.href = href;
    }
    // add region on click of tab links
    if (region) {
      const updatedHubUrl = new URL(hubspotUrl.href);
      const retUrl = new URL(updatedHubUrl.searchParams.get('return_url'));
      retUrl.searchParams.set('region', region);
      updatedHubUrl.searchParams.set('return_url', retUrl.href);
      hubspotUrl.href = updatedHubUrl.href;
    }

    hubspotIframe.querySelector('iframe').setAttribute('src', hubspotUrl);
  }
  window.scroll({
    top: hubspotIframe.offsetTop - 100,
    behavior: 'smooth',
  });
}

export default function decorate(block) {
  const queryParams = new URLSearchParams(window.location.search);
  const hubspotUrl = block.querySelector('[href*="https://info.moleculardevices.com"]');
  const mapUrl = block.querySelector('[href*="https://maps.google.com"]');

  if (queryParams.has('msg') && queryParams.get('msg') === 'success') {
    const successMsg = block.lastElementChild.firstElementChild;
    successMsg.classList.add('hubspot-success');
    hubspotUrl.closest('div').replaceWith(successMsg);
    block.lastElementChild.remove();
    createMap(block, mapUrl);
  } else {
    block.lastElementChild.remove(); // success message we don't need for this case
    createForm(block, hubspotUrl);
    createMap(block, mapUrl);
  }

  /* get region on tab click */
  const tabLinks = document.querySelectorAll('.regional-contacts-wrapper .tab-wrapper > a');
  tabLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const regionName = link.hash.split('#')[1] || queryParams.get('region');
      REGION = regionName;
    });
  });

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
