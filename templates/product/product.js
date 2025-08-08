/* eslint-disable linebreak-style */
import { div, h1, p } from '../../scripts/dom-helpers.js';
import { getMetadata, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { getCookie, isAuthorizedUser, loadScript } from '../../scripts/scripts.js';
import ffetch from '../../scripts/ffetch.js';



export async function iframeResizeHandler(id) {
  await new Promise((resolve) => {
    loadScript('/scripts/iframeResizer.min.js', () => { resolve(); }, '', true);
  });

  /* global iFrameResize */
  setTimeout(() => {
    iFrameResize({
      log: false,
    }, `#${id}`);
  }, 1000);
}

function handleEmbed() {
  try {
    const cmpCookieValue = getCookie('cmp');
    if (cmpCookieValue) {
      document.querySelectorAll('.embed a').forEach((link) => {
        const href = link.getAttribute('href');
        const url = new URL(href);
        if (url.searchParams.get('cmp')) {
          url.searchParams.set('cmp', cmpCookieValue);
          link.setAttribute('href', url.toString());
        }
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to change the campaing ID: ${err.message}`);
  }

  /*const observer = new MutationObserver((mutations) => {
    const embed = document.querySelector('main .embed.block.embed-is-loaded');
    if (embed) {
      iframeResizeHandler('iframeContent');

      // adjust parent div's height dynamically
      mutations.forEach((record) => {
        const grandGrandParent = record.target.parentElement.parentElement.parentElement;
        if (record.target.tagName === 'IFRAME'
          && grandGrandParent.classList.contains('embed')
        ) {
          // iframeResizeHandler(iframeURL, iframeID, root);
          const { height } = record.target.style;
          if (height) {
            const parent = record.target.parentElement;
            parent.style.height = height;
          }
        }
      });
    }
  });
  observer.observe(document.querySelector('main'), {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  });*/
}

export default async function buildAutoBlocks() {


  const pageParam = (new URLSearchParams(window.location.search)).get('page');
  

  handleEmbed();

  setTimeout(() => {
   if (pageParam && pageParam === 'thankyou') {
  document.querySelector('.category-form').classList.add('thankyou');

  // Create the DOM elements
  const container = document.createElement('div');

  container.appendClass ='thankyou-img'; 
  container.innerHTML = `
    <span align='center' class='thankyou-head'><h2>Thank you.</h2></span>
    <p align='middle' class='thankyou-message'>
      We have received your request for quote and would like to thank you for contacting us.
      We have sent you an email to confirm your details. A sales rep will be contacting you within 24-business hours.
      If you require immediate attention, please feel free to contact us.
    </p>
      <span align='center'><h2>Have a great day!</h2></span>
  `;

  // Create picture and append separately
  const pictureWrapper = document.createElement('div');
  const spectraImg = createOptimizedPicture('/images/thank-you-email-img.png', 'Thank you Spectra', false, [{ width: '150' }]);
  pictureWrapper.appendChild(spectraImg);
  spectraImg.classList.add('thankyou-image');

  container.appendChild(pictureWrapper);

  // Replace form content
  const form = document.querySelector('.category-form');
  form.innerHTML = ''; // clear old content
  form.appendChild(container);

  // Scroll
  document.querySelector('.thankyou-message').scrollIntoView({ behavior: 'smooth' });
}
    const pdfAnchors = document.querySelectorAll('a[href$=".pdf"]');
    const thankyouUrl = `${window.location.pathname}?page=thankyou`;
    pdfAnchors.forEach((anchor) => {
      const href = new URL(anchor.href).pathname;
      anchor.setAttribute('download', href);
      anchor.addEventListener('click', () => {
        setTimeout(() => {
          window.location.href = thankyouUrl;
        }, 1000);
      });
    });
  }, 800);
}
