import {
  a, i, p,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

function renderAddCalendar(evt) {
  const href = '/add/event'
  + `?startDate=${evt.startDate}`
  + `&endDate=${evt.endDate}`
  + `&startTime=${evt.startTime}`
  + `&endTime=${evt.endTime}`
  + `&title=${evt.title}`
  + `&event_type=${evt.eventType}`
  + `&event_region=${evt.eventRegion}`
  + `&event_address=${evt.eventAddress}`;

  return (
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
}

export default function buildAutoBlocks() {
  const title = document.getElementById('event-details');
  if (title) title.classList.add('event-title');

  const moreBtn = document.querySelector('main strong > a:last-of-type');
  if (moreBtn) {
    moreBtn.setAttribute('target', '_blank');
    const par = moreBtn.closest('p');
    par.classList.add('find-out-more');

    const evt = {};
    evt.startDate = '20230218';
    evt.endDate = '20230222';
    evt.startTime = '0000';
    evt.endTime = '0832';
    evt.title = getMetadata('og:title');
    evt.eventType = getMetadata('event-type');
    evt.eventRegion = getMetadata('event-region');
    evt.eventAddress = getMetadata('event-city');

    par.parentElement.append(renderAddCalendar(evt));
  }
}
