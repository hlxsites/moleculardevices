const hubspotUrl = document.querySelector('.get-in-touch-wrapper > div > div > div:first-of-type a');
const hubspotIframeWrapper = document.createElement('div');
const hubspotIframe = document.createElement('iframe');
hubspotIframeWrapper.className = 'hubspot-iframe-wrapper';
hubspotIframe.src = hubspotUrl.href;
hubspotIframeWrapper.appendChild(hubspotIframe);
hubspotUrl.parentNode.replaceChild(hubspotIframeWrapper, hubspotUrl);

const mapUrl = document.querySelector('.get-in-touch-wrapper > div > div > div:last-of-type a:nth-child(1)');
const mapIframe = document.createElement('iframe');
mapIframe.src = mapUrl.href;
mapUrl.parentNode.replaceChild(mapIframe, mapUrl);
