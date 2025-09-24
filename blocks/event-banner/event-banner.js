import {
  a, div, h1, h2, p,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, toClassName } from '../../scripts/lib-franklin.js';
import { formatEventDateRange } from '../../scripts/list.js';
import { decorateLinks } from '../../scripts/scripts.js';
import { decorateSocialIcons, socialShareBlock } from '../social-share/social-share.js';

export default function decorateEventBanner(eventObj, isFeaturedBanner = false) {
  const socials = ['facebook', 'linkedin', 'x', 'youtube-play'];
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
    div(
      eventObj.booth ? h2({ class: 'event-sub-title' }, eventObj.booth) : '',
      !isFeaturedBanner && eventObj.eventURL ? p(a({ class: 'button primary', href: eventObj.eventURL }, 'See us at the show')) : '',
      socialShareBlock('Share this event', socials),
    ),
  );

  const eventBanner = div({ class: bannerClasses });
  eventBanner.appendChild(leftCol);
  eventBanner.appendChild(rightCol);

  decorateSocialIcons(eventBanner);
  decorateLinks(eventBanner);
  return eventBanner;
}
