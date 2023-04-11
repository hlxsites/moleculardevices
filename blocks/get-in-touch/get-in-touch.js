import { queryString } from '../../scripts/scripts.js';

function createFormRoot(hubspotUrl, mapUrl) {
  const hubspotIframeWrapper = document.createElement('div');
  const hubspotIframe = document.createElement('iframe');

  hubspotIframeWrapper.className = 'hubspot-iframe-wrapper';
  hubspotIframe.setAttribute('loading', 'lazy');
  hubspotIframeWrapper.appendChild(hubspotIframe);

  const mapIframeWrapper = document.createElement('div');
  const mapIframe = document.createElement('iframe');

  mapIframeWrapper.className = 'map-iframe-wrapper';
  mapIframe.setAttribute('loading', 'lazy');
  mapIframeWrapper.appendChild(mapIframe);

  hubspotUrl.parentNode.replaceChild(hubspotIframeWrapper, hubspotUrl);
  mapUrl.parentNode.replaceChild(mapIframeWrapper, mapUrl);
}

function hubSpotFinalUrl(hubspotUrl, paramName) {
  const hubUrl = new URL(hubspotUrl.href);
  const hubSearch = new URLSearchParams(hubUrl);
  const searchParams = new URLSearchParams(hubUrl.searchParams.get('return_url'));
  if (paramName === 'comments') {
    searchParams.set(paramName, 'Sales');
  } else {
    const readQuery = queryString(paramName);
    const queryStringParam = readQuery[paramName] ? readQuery[paramName] : '';
    searchParams.set(paramName, queryStringParam);
  }

  hubSearch.set('return_url', searchParams.toString());
  hubUrl.search = hubSearch.toString();
  return hubUrl;
}

function addIframe(hubspotUrl, mapUrl) {
  const hubspotIframeWrapper = document.querySelector('.hubspot-iframe-wrapper');
  const hubspotIframe = hubspotIframeWrapper.querySelector('iframe');
  const mapIframeWrapper = document.querySelector('.map-iframe-wrapper');
  const mapIframe = mapIframeWrapper.querySelector('iframe');
  hubspotIframe.src = hubspotUrl.href;
  mapIframe.src = mapUrl.href;
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
  const hubspotUrl = block.querySelector('[href*="https://info.moleculardevices.com"]');
  const mapUrl = block.querySelector('[href*="https://maps.google.com"]');
  createFormRoot(hubspotUrl, mapUrl);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      // observer.disconnect();
      const hubUrl = hubSpotFinalUrl(hubspotUrl, 'region');
      hubspotUrl.href = hubUrl.href;
      addIframe(hubspotUrl, mapUrl);
    }
  });
  observer.observe(block);

  const inquiryLinks = ['General Inquiry Form', 'Sales Inquiry Form', 'Contact Local Team', 'Service plans/warranty'];
  const links = document.querySelectorAll('a[title]');
  links.forEach((link) => {
    if (inquiryLinks.includes(link.getAttribute('title'))) {
      link.addEventListener('click', scrollToForm.bind(null, link, hubspotUrl), false);
    }
  });
}
