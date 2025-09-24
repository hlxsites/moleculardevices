import {
  a, div, h1, h2, p,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import {
  createOptimizedPicture, getMetadata, toClassName,
} from '../../scripts/lib-franklin.js';
import { formatEventDateRange } from '../../scripts/list.js';
import { decorateLinks, formatDate, unixDateToString } from '../../scripts/scripts.js';
import { compareEvents } from '../events/events.js';
import { decorateSocialIcons, socialShareBlock } from '../social-share/social-share.js';

export function createEventBanner(eventObj, isFeaturedBanner = false) {
  const socials = ['facebook', 'linkedin', 'x', 'youtube-play'];
  const bannerClasses = `event-banner event-thumb-${toClassName(eventObj.imageThumbPosition)} ${isFeaturedBanner ? 'featured-event-banner' : ''}`;

  const leftCol = div({ class: 'left-col' },
    isFeaturedBanner ? a({ href: eventObj.path }, createOptimizedPicture(eventObj.image))
      : createOptimizedPicture(eventObj.image));

  const rightCol = div({ class: 'right-col' },
    div({ class: 'event-details' },
      p({ class: 'cite' }, eventObj.eventType),
      isFeaturedBanner ? h2({ class: 'event-title' }, a({ href: eventObj.path }, eventObj.title)) : h1({ class: 'event-title' }, eventObj.title),
      eventObj.eventStart ? p({ class: 'event-date' }, formatEventDateRange(eventObj.eventStart, eventObj.eventEnd)) : '',
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

async function latestEvents() {
  const now = Date.now();
  return ffetch('/query-index.json')
    .sheet('events')
    .filter((event) => (event.eventEnd * 1000 >= now))
    .all();
}

export default async function decorate(block) {
  const imageThumbPosition = getMetadata('image-thumb-position') || 'center';
  const isFeaturedEventBanner = block.classList.contains('featured');
  const featuredEventPath = new URL(block.querySelector('a').href).pathname;
  const currentYearEvents = await latestEvents();
  const sortedEvents = currentYearEvents.sort(compareEvents);
  let featuredEvent;
  featuredEvent = currentYearEvents.find((event) => event.path === featuredEventPath);

  if (!featuredEvent) {
    const { event } = sortedEvents;
    featuredEvent = event;
  }

  if (isFeaturedEventBanner) {
    const startFormatDate = formatDate(unixDateToString(featuredEvent.eventStart));
    const endFormatDate = formatDate(unixDateToString(featuredEvent.eventEnd));
    featuredEvent.eventStart = startFormatDate;
    featuredEvent.eventEnd = endFormatDate;
    featuredEvent.imageThumbPosition = imageThumbPosition;

    const {
      image, title, eventAddress, booth, eventEnd, eventRegion, eventStart, eventType, eventURL,
    } = featuredEvent;

    const eventObj = {
      image,
      imageThumbPosition,
      title,
      eventType,
      booth,
      eventAddress,
      eventStart,
      eventEnd,
      eventRegion,
      eventURL,
    };

    const eventBanner = createEventBanner(eventObj);
    block.replaceWith(eventBanner);
  }
}
