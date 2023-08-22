import { getCookie } from '../../scripts/scripts.js';

function hubSpotFinalUrl(hubspotUrl, paramName) {
  const hubUrl = new URL(hubspotUrl.href);
  const searchParams = new URLSearchParams(hubUrl.searchParams);
  const queryParams = new URLSearchParams(window.location.search);
  if (paramName === 'comments') {
    searchParams.set(paramName, 'Sales');
  } else {
    const queryStringParam = queryParams.has(paramName) ? queryParams.get(paramName) : '';
    searchParams.set(paramName, queryStringParam);
  }

  const cmp = getCookie('cmp') || searchParams.get('cmp');
  const returnURL = searchParams.get('return_url');
  searchParams.delete('cmp');
  searchParams.delete('return_url');

  const queryStr = `?return_url=${returnURL}%3F${encodeURIComponent(searchParams.toString())}&cmp=${cmp}`;
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

function scrollToForm(link, hubspotUrl) {
  const hubspotIframe = document.querySelector('.hubspot-iframe-wrapper');
  if (hubspotUrl) {
    if (link.getAttribute('title') === 'Sales Inquiry Form') {
      const hubUrl = hubSpotFinalUrl(hubspotUrl, 'comments');
      hubspotUrl.href = hubUrl.href;
    } else {
      const [href] = hubspotUrl.href.split('&');
      hubspotUrl.href = href;
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

  const inquiryLinks = ['General Inquiry Form', 'Sales Inquiry Form', 'Contact Local Team', 'Service plans/warranty'];
  const links = document.querySelectorAll('a[title]');
  links.forEach((link) => {
    if (inquiryLinks.includes(link.getAttribute('title'))) {
      link.addEventListener('click', scrollToForm.bind(null, link, hubspotUrl), false);
    }
  });
}
