// eslint-disable-next-line import/no-cycle
import { createEventBanner } from '../../blocks/event-banner/event-banner.js';
import { div } from '../../scripts/dom-helpers.js';
import { getAllMetadata, getMetadata } from '../../scripts/lib-franklin.min.js';

export function dateOnlyToTimestamp(dateStr) {
  if (!dateStr) return null;

  const d = new Date(dateStr);

  if (Number.isNaN(d.getTime())) return null;

  return Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  );
}

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
    eventStart: dateOnlyToTimestamp(start),
    eventEnd: dateOnlyToTimestamp(end),
    eventRegion: region,
    eventURL: url,
  };

  const eventBanner = div(
    { class: 'section no-padding-top no-padding-bottom' },
    createEventBanner(eventObj),
  );
  main.insertAdjacentElement('afterbegin', eventBanner);
}
