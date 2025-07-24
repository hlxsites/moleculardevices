import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import { div, p } from '../../scripts/dom-helpers.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';

export function formatEventDateRange(startDateStr, endDateStr) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  console.log(startDate);
  console.log(endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    // eslint-disable-next-line no-console
    console.error('Invalid input date:', { startDateStr, endDateStr });
    return 'Invalid Date';
  }

  const startMonth = startDate.toLocaleString('en-US', { month: 'long' });
  const endMonth = endDate.toLocaleString('en-US', { month: 'long' });

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  const sameDay = startDay === endDay
    && startDate.getMonth() === endDate.getMonth()
    && startYear === endYear;

  const sameMonthAndYear = startDate.getMonth() === endDate.getMonth() && startYear === endYear;

  if (sameDay) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }
  if (sameMonthAndYear) {
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
}

export default async function decorate(block) {
  const FTImage = getMetadata('og:image');
  const startDate = getMetadata('event-start');
  const endDate = getMetadata('event-end');
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
