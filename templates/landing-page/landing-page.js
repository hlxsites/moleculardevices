// eslint-disable-next-line object-curly-newline
import { div, h1, p } from '../../scripts/dom-helpers.js';
import { getMetadata, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';

async function iframeResizeHandler() {
  await new Promise((resolve) => {
    loadScript('/scripts/iframeResizer.min.js', () => { resolve(); });
  });

  /* global iFrameResize */
  iFrameResize({ log: false });
}

export default function buildAutoBlocks() {
  const pageParam = (new URLSearchParams(window.location.search)).get('page');
  if (pageParam && pageParam === 'thankyou') {
    document.body.classList.add('thankyou');
    document.querySelector('.hero > div:nth-of-type(2)').replaceWith(div(
      div(h1('Thank you.'), p(`Your ${getMetadata('download-title') || 'document'} is on its way.`)),
      div(createOptimizedPicture('/images/thank-you-spectra.png', 'Thank you Spectra', false, [{ width: '750' }])),
    ));
    [...document.querySelectorAll('.columns')].forEach((column, i) => {
      if (i % 2 > 0) column.classList.add('odd');
    });
  }

  const observer = new MutationObserver((mutations, obs) => {
    const embed = document.querySelector('main .embed.block.embed-is-loaded');
    if (embed) {
      const iframe = embed.querySelector('iframe');
      obs.disconnect();
      setTimeout(() => {
        if (iframe) {
          iframeResizeHandler(embed);
        }
      },
      10000,
      );
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}
