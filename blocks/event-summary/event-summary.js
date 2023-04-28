import { getMetadata } from '../../scripts/lib-franklin.js';
import {
  div, h3, li, p, ul,
} from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const startDate = getMetadata('start-date');
  const endDate = getMetadata('end-date');
  const title = getMetadata('og:title');
  const type = getMetadata('event-type');
  const region = getMetadata('event-region');
  const address = getMetadata('event-address');

  block.append(p({ class: 'event-date' }, `${startDate} - ${endDate}`));
  block.append(h3({ class: 'event-subtitle' }, title));
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
