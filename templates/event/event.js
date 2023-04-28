import { div } from '../../scripts/dom-helpers.js';

export default async function buildAutoBlocks() {
  const title = document.getElementById('event-details');
  if (title) title.classList.add('event-title');

  const moreBtn = document.querySelector('main strong > a:last-of-type');
  if (moreBtn) {
    moreBtn.setAttribute('target', '_blank');
    const par = moreBtn.closest('p');
    par.classList.add('find-out-more');
  }

  const summary = div({ class: 'event-summary' });
  title.parentNode.insertBefore(summary, title.nextSibling);
}
