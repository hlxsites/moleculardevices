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

  const observer = new MutationObserver((mutations) => {
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
  });
}

export default async function buildAutoBlocks() {
  if (isAuthorizedUser()) {
    const path = window.location.pathname;
    const pageIndex = await ffetch('/query-index.json').sheet('gated-resources').all();
    const foundPage = pageIndex.find((page) => page.gatedURL === path || page.gatedURL.endsWith(`moleculardevices.com${path}`));
    if (foundPage) {
      window.location.replace(foundPage.path);
    }
  }

  const pageParam = (new URLSearchParams(window.location.search)).get('page');
  if (pageParam && pageParam === 'thankyou') {
    document.body.classList.add('thankyou');
    const isThankyouBanner = document.querySelector('.hero.thankyou-banner');
    if (!isThankyouBanner) {
      const thankyouHeading = getMetadata('thankyou-heading') || 'Thank you.';
      const thankyouSubHeading = getMetadata('thankyou-sub-heading') || `Your ${getMetadata('download-title') || 'document'} is on its way.`;
      document.querySelector('.hero > div:nth-of-type(2)').replaceWith(div(
        div(h1(thankyouHeading), p(thankyouSubHeading)),
        div(createOptimizedPicture('/images/thank-you-spectra.png', 'Thank you Spectra', false, [{ width: '750' }])),
      ));
    } else {
      document.querySelector('.thankyou-banner > div:nth-of-type(2)').replaceWith(div(
        div(h1('Thank you for your inquiry'), p('An expert from our team will be in touch shortly!')),
        div(createOptimizedPicture('/images/thank-you-spectra.png', 'Thank you Spectra', false, [{ width: '750' }])),
      ));
    }
  }

  handleEmbed();

  setTimeout(() => {
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
