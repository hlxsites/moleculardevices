import {
  div,
} from '../../scripts/dom-helpers.js';

async function renderDetails(insertAfterElement) {
  const summary = div({ class: 'event-summary' });
  insertAfterElement.parentNode.insertBefore(summary, insertAfterElement.nextSibling);
}

export default async function buildAutoBlocks() {
  const title = document.querySelector('h1');
  if (title) title.classList.add('event-title');
  renderDetails(title);
}
