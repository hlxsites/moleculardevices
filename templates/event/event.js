import {
  a, i, p,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

async function renderAddCalendar(container) {
  const evt = {};
  evt.startDate = getMetadata('event-start-date');
  evt.endDate = getMetadata('event-end-date');
  evt.startTime = getMetadata('event-start-time');
  evt.endTime = getMetadata('event-end-time');
  evt.title = getMetadata('og:title');
  evt.eventType = getMetadata('event-type');
  evt.eventRegion = getMetadata('event-region');
  evt.eventAddress = getMetadata('event-city');

  const href = 'https://www.moleculardevices.com/add/event'
  + `?startDate=${evt.startDate}`
  + `&endDate=${evt.endDate}`
  + `&startTime=${evt.startTime}`
  + `&endTime=${evt.endTime}`
  + `&title=${evt.title}`
  + `&event_type=${evt.eventType}`
  + `&event_region=${evt.eventRegion}`
  + `&event_address=${evt.eventAddress}`;

  const cal = (
    p({ class: 'add-to-calendar' },
      a({
        class: 'button',
        href,
      },
      i({ class: 'fa fa-calendar' }),
      'Add to Calendar',
      ),
    )
  );

  container.parentNode.insertBefore(cal, container.nextSibling);
}

export default function buildAutoBlocks() {
  const title = document.getElementById('event-details');
  if (title) title.classList.add('event-title');

  const moreBtn = document.querySelector('main strong > a:last-of-type');
  if (moreBtn) {
    moreBtn.setAttribute('target', '_blank');
    const par = moreBtn.closest('p');
    par.classList.add('find-out-more');

    renderAddCalendar(par);
  }
}
