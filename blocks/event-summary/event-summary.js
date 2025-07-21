import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import { formatDate } from '../../scripts/scripts.js';
import { div, p } from '../../scripts/dom-helpers.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';

export function formatEventDateRange(startSeconds, endSeconds) {
  const startDate = new Date(0);
  const endDate = new Date(0);
  startDate.setUTCSeconds(startSeconds);
  endDate.setUTCSeconds(endSeconds);

  const startMonth = startDate.toLocaleString('en-US', { month: 'long' });
  const endMonth = endDate.toLocaleString('en-US', { month: 'long' });

  const startDay = startDate.getUTCDate();
  const endDay = endDate.getUTCDate();

  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();

  const sameDay = startDay === endDay
    && startDate.getUTCMonth() === endDate.getUTCMonth()
    && startYear === endYear;

  const sameMonth = startDate.getUTCMonth() === endDate.getUTCMonth();
  const sameYear = startYear === endYear;

  if (sameDay) {
    return `${startMonth} ${startDay}, ${startYear}`;
  } if (sameMonth && sameYear) {
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
}

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
