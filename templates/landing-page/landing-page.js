// eslint-disable-next-line object-curly-newline
import { div, h1, p } from '../../scripts/dom-helpers.js';
import { getMetadata, createOptimizedPicture } from '../../scripts/lib-franklin.js';

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
}
