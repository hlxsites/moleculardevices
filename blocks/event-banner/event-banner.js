import {
  a, div, h1, h2, p,
} from '../../scripts/dom-helpers.js';
import {
  decorateLinks, formatDate, unixDateToString,
} from '../../scripts/scripts.js';
import { createOptimizedPicture, getMetadata, toClassName } from '../../scripts/lib-franklin.js';
import { decorateSocialIcons, socialShareBlock } from '../social-share/social-share.js';
import { formatEventDateRange } from '../../scripts/list.js';
import { compareEvents } from '../events/events.js';
import ffetch from '../../scripts/ffetch.js';

/* get latest events */
async function latestEvents() {
  const now = Date.now();
  const events = await ffetch('/query-index.json')
    .sheet('events')
    .filter((event) => (event.eventEnd * 1000 >= now))
    .all();
  return events.sort(compareEvents);
}

/* html of event banner */
export function createEventBanner(eventObj, isFeaturedBanner = false) {
  const socials = ['facebook', 'linkedin', 'x', 'youtube-play'];
  const imageThumbPosition = getMetadata('image-thumb-position') || 'center';
  const bannerClasses = `event-banner event-thumb-${toClassName(imageThumbPosition)} ${isFeaturedBanner ? 'featured-event-banner' : ''}`;

  const leftCol = div({ class: 'left-col' },
    isFeaturedBanner ? a({ href: eventObj?.path }, createOptimizedPicture(eventObj?.image))
      : createOptimizedPicture(eventObj?.image));

  const rightCol = div({ class: 'right-col' },
    div({ class: 'event-details' },
      p({ class: 'cite' }, eventObj?.eventType),
      isFeaturedBanner ? h2({ class: 'event-title' }, a({ href: eventObj?.path }, eventObj?.title)) : h1({ class: 'event-title' }, eventObj?.title),
      eventObj?.eventStart ? p({ class: 'event-date' }, formatEventDateRange(eventObj?.eventStart, eventObj?.eventEnd)) : '',
      p(eventObj?.eventAddress),
      p(eventObj?.eventRegion),
    ),
    div(
      eventObj?.booth ? h2({ class: 'event-sub-title' }, eventObj?.booth) : '',
      !isFeaturedBanner && eventObj?.eventURL ? p(a({ class: 'button primary', href: eventObj?.eventURL }, 'See us at the show')) : '',
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

export default async function decorate(block) {
  block.parentElement.parentElement.classList.add('no-padding-top', 'no-padding-bottom');
  const featuredEventPath = new URL(block.querySelector('a').href).pathname;
  const isFeaturedEventBanner = block?.classList?.contains('featured');
  let eventObj;

  if (isFeaturedEventBanner) {
    const currentYearEvents = await latestEvents();
    eventObj = currentYearEvents.find((event) => event.path === featuredEventPath);

    if (!eventObj) {
      const [ftEvent] = currentYearEvents;
      eventObj = ftEvent;
    }

    const startFormatDate = formatDate(unixDateToString(eventObj?.eventStart));
    const endFormatDate = formatDate(unixDateToString(eventObj?.eventEnd));
    eventObj.eventStart = startFormatDate;
    eventObj.eventEnd = endFormatDate;
    const blockClasses = block?.classList?.value;
    const eventBanner = createEventBanner(eventObj, isFeaturedEventBanner);

    eventBanner.classList.value = blockClasses;
    block.replaceWith(eventBanner);
  }
}
