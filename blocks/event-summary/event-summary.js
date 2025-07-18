import { buildBlock, createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import { formatDate } from '../../scripts/scripts.js';
import {
  div, h1, li, p, ul,
} from '../../scripts/dom-helpers.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';

export default async function decorate(block) {
  const FTImage = getMetadata('og:image');
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

  const socials = ['facebook', 'linkedin', 'twitter', 'youtube-play'];

  const evenBanner = div({ class: 'event-banner' },
    div({ class: 'left-col' },
      createOptimizedPicture(FTImage)),
    div({ class: 'right-col' },
      div(
        p({ class: 'cite' }, type),
        title,
        p({ class: 'event-date' }, `${startDate} - ${endDate}`),
        p(address),
        p(region),
      ),
      socialShareBlock('social-share', socials),
    ),
  );
  decorateIcons(evenBanner);
  block.appendChild(evenBanner);
}
