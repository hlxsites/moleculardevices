import { getMetadata } from '../../scripts/lib-franklin.js';
import { formatDate } from '../../scripts/scripts.js';
import {
  div, li, p, ul,
} from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  let startDate = getMetadata('event-start');
  if (startDate) {
    startDate = formatDate(startDate);
    // eslint-disable-next-line prefer-destructuring
    startDate = startDate.split(',')[0];
  }
  let endDate = getMetadata('event-end');
  if (endDate) { endDate = formatDate(endDate); }
  const title = document.querySelector('main h1');
  const type = getMetadata('event-type');
  const region = getMetadata('event-region');
  const address = getMetadata('event-address');

  title.classList.add('event-subtitle');
  block.append(p({ class: 'event-date' }, `${startDate} - ${endDate}`));
  block.append(title);
  block.append(
    div({ class: 'event-keywords' },
      ul({ class: 'keyword-list' },
        li({ class: 'item type' }, type),
        li({ class: 'item region' }, region),
        li({ class: 'item address' }, address),
      ),
    ),
  );
}
