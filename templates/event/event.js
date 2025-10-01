import { createEventBanner } from '../../blocks/event-banner/event-banner.js';
import { div } from '../../scripts/dom-helpers.js';
import { getAllMetadata, getMetadata } from '../../scripts/lib-franklin.js';

export default async function buildAutoBlocks() {
  const {
    address, booth, end, region, start, type, url,
  } = getAllMetadata('event');
  const image = getMetadata('og:image');
  const title = document.querySelector('main h1');
  const eventType = type || 'Conference';
  const main = document.getElementsByTagName('main')[0];

  const eventObj = {
    image,
    title,
    eventType,
    booth,
    eventAddress: address,
    eventStart: start,
    eventEnd: end,
    eventRegion: region,
    eventURL: url,
  };

  const eventBanner = div(
    { class: 'section no-padding-top no-padding-bottom' },
    createEventBanner(eventObj),
  );
  main.insertAdjacentElement('afterbegin', eventBanner);
}
