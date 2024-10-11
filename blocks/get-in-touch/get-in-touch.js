// let REGION = new URLSearchParams(window.location.search).get('region');
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

function scrollToForm() {
  const hubspotIframe = document.querySelector('.hubspot-iframe-wrapper');
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
  // const tabLinks = document.querySelectorAll('.regional-contacts-wrapper .tab-wrapper > a');
  // tabLinks.forEach((link) => {
  //   link.addEventListener('click', () => {
  //     const regionName = link.hash.split('#')[1] || queryParams.get('region');
  //     REGION = regionName;
  //   });
  // });

  const inquiryLinks = ['General Inquiry Form', 'Sales Inquiry Form', 'Contact Local Team', 'Service plans/warranty'];
  const links = document.querySelectorAll('a[title]');
  links.forEach((link) => {
    if (inquiryLinks.includes(link.getAttribute('title'))) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToForm();
      }, false);
    }
  });
}
