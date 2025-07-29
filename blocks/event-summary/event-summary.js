import { createOptimizedPicture, getMetadata, toClassName } from '../../scripts/lib-franklin.js';
import { div, p } from '../../scripts/dom-helpers.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';
import { formatEventDateRange } from '../../scripts/list.js';

export default async function decorate(block) {
  const FTImage = getMetadata('og:image');
  const startDate = getMetadata('event-start');
  const endDate = getMetadata('event-end');
  const title = document.querySelector('main h1');
  const type = getMetadata('event-type');
  const region = getMetadata('event-region');
  const address = getMetadata('event-address');
  const imageThumbPosition = getMetadata('image-thumb-position') || 'center';

  const socials = ['facebook', 'linkedin', 'twitter', 'youtube-play'];

  const evenBanner = div({ class: `event-banner event-thumb-${toClassName(imageThumbPosition)}` },
    div({ class: 'left-col' },
      createOptimizedPicture(FTImage)),
    div({ class: 'right-col' },
      div(
        p({ class: 'cite' }, type),
        title,
        p({ class: 'event-date' }, formatEventDateRange(startDate, endDate)),
        p(address),
        p(region),
      ),
      socialShareBlock('Share this event', socials),
    ),
  );
  decorateIcons(evenBanner);
  block.appendChild(evenBanner);
}
