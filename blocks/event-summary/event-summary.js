import { createOptimizedPicture, getMetadata, toClassName } from '../../scripts/lib-franklin.js';
import {
  a, div, h1, h2, p,

} from '../../scripts/dom-helpers.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';
import { formatEventDateRange } from '../../scripts/list.js';

export function createEventBanner(eventObj, isFeaturedBanner = false) {
  const socials = ['facebook', 'linkedin', 'twitter', 'youtube-play'];
  const bannerClasses = `event-banner event-thumb-${toClassName(eventObj.imageThumbPosition)} ${isFeaturedBanner ? 'featured-event-banner' : ''}`;

  const leftCol = div({ class: 'left-col' },
    isFeaturedBanner ? a({ href: eventObj.path }, createOptimizedPicture(eventObj.image))
      : createOptimizedPicture(eventObj.image));

  const rightCol = div({ class: 'right-col' },
    div({ class: 'event-details' },
      p({ class: 'cite' }, eventObj.eventType),
      isFeaturedBanner ? h2({ class: 'event-title' }, a({ href: eventObj.path }, eventObj.title)) : h1({ class: 'event-title' }, eventObj.title),
      p({ class: 'event-date' }, formatEventDateRange(eventObj.eventStart, eventObj.eventEnd)),
      p(eventObj.eventAddress),
      p(eventObj.eventRegion),

    ),
    eventObj.booth ? h2({ class: 'event-sub-title' }, eventObj.booth) : '',
    !isFeaturedBanner ? p(a({ class: 'button primary', href: eventObj.eventURL }, 'See as at the show')) : '',
    socialShareBlock('Share this event', socials),
  );

  const eventBanner = div({ class: bannerClasses });
  eventBanner.appendChild(leftCol);
  eventBanner.appendChild(rightCol);

  decorateIcons(eventBanner);
  return eventBanner;
}

export default async function decorate(block) {
  const image = getMetadata('og:image');
  const eventStart = getMetadata('event-start');
  const eventEnd = getMetadata('event-end');
  const title = document.querySelector('main h1');
  const eventType = getMetadata('event-type') || 'Conference';
  const eventRegion = getMetadata('event-region');
  const eventAddress = getMetadata('event-address');
  const eventURL = getMetadata('event-url');
  const booth = getMetadata('event-booth') || '';
  const imageThumbPosition = getMetadata('image-thumb-position') || 'center';

  const eventObj = {
    image,
    imageThumbPosition,
    eventStart,
    eventEnd,
    title,
    eventType,
    eventRegion,
    eventAddress,
    eventURL,
    booth,
  };

  const eventBanner = createEventBanner(eventObj);
  block.appendChild(eventBanner);
}
