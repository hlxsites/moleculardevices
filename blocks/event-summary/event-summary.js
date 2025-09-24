import { getAllMetadata, getMetadata } from '../../scripts/lib-franklin.js';
import { createEventBanner } from '../../templates/event/event.js';

export default async function decorate(block) {
  const {
    address, booth, end, region, start, type, url,
  } = getAllMetadata('event');
  const image = getMetadata('og:image');
  const title = document.querySelector('main h1');
  const eventType = type || 'Conference';
  const imageThumbPosition = getMetadata('image-thumb-position') || 'center';

  const eventObj = {
    image,
    imageThumbPosition,
    title,
    eventType,
    booth,
    eventAddress: address,
    eventStart: start,
    eventEnd: end,
    eventRegion: region,
    eventURL: url,
  };

  const eventBanner = createEventBanner(eventObj);
  block.appendChild(eventBanner);
}
