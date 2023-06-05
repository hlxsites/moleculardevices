import { img, div, h1, p } from '../../scripts/dom-helpers.js';

export default function buildAutoBlocks() {
  const pageParam = (new URLSearchParams(window.location.search)).get('page');
  if (pageParam && pageParam === 'thankyou') {
    document.body.classList.add('thankyou');
    document.querySelector('.hero > div:nth-of-type(2)').replaceWith(
      div(
        div(h1( 'Thank you.'), p( 'Your document is on its way.')),
        div(img({ src: '/images/thank-you-spectra.png' }))
      )
    );
  }
}