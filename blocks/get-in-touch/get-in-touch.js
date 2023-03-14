const hubspotUrl = document.querySelector('.get-in-touch-wrapper > div > div > div:first-of-type [href*="https://info.moleculardevices.com"]');
const hubspotIframeWrapper = document.createElement('div');
const hubspotIframe = document.createElement('iframe');
hubspotIframeWrapper.className = 'hubspot-iframe-wrapper';
hubspotIframe.src = hubspotUrl.href;
hubspotIframeWrapper.appendChild(hubspotIframe);
hubspotUrl.parentNode.replaceChild(hubspotIframeWrapper, hubspotUrl);

const map_url = document.querySelector('.get-in-touch-wrapper > div > div > div:last-of-type [href*="https://maps.google.com"]');
const map_iframe = document.createElement('iframe');
map_iframe.src = map_url.href;
map_url.parentNode.replaceChild(map_iframe, map_url);
