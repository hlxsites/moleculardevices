import {
  div,
} from '../../scripts/dom-helpers.js';

async function renderDetails(insertAfterElement) {
  const summary = div({ class: 'event-summary' });
  insertAfterElement.parentNode.insertBefore(summary, insertAfterElement.nextSibling);
}

export default async function buildAutoBlocks() {
  const title = document.getElementById('event-details');
  if (title) title.classList.add('event-title');

  const moreBtn = document.querySelector('main strong > a:last-of-type');
  if (moreBtn) {
    moreBtn.setAttribute('target', '_blank');
    const par = moreBtn.closest('p');
    par.classList.add('find-out-more');
  }

  renderDetails(title);
}
