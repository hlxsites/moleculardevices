const hubspot_url = document.querySelector('.get-in-touch-wrapper > div > div > div:first-of-type [href*="https://info.moleculardevices.com"]');
const hubspot_iframe_wrapper = document.createElement('div');
const hubspot_iframe = document.createElement('iframe');
hubspot_iframe_wrapper.className = "hubspot-iframe-wrapper";
hubspot_iframe.src = hubspot_url.href;
hubspot_iframe_wrapper.appendChild(hubspot_iframe);
hubspot_url.parentNode.replaceChild(hubspot_iframe_wrapper, hubspot_url);


const map_url = document.querySelector('.get-in-touch-wrapper > div > div > div:last-of-type [href*="https://maps.google.com"]');
const map_iframe = document.createElement('iframe');
map_iframe.src = map_url.href;
map_url.parentNode.replaceChild(map_iframe, map_url);