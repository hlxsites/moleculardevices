/* eslint-disable import/no-cycle */
import ffetch from '../../scripts/ffetch.js';
import { formatDate, unixDateToString } from '../../scripts/scripts.js';
import { a, div, p } from '../../scripts/dom-helpers.js';

export function formatEventDates(startUnixStr, endUnixStr) {
  let eventDates = '';
  if (startUnixStr && endUnixStr) {
    const [startDate] = formatDate(unixDateToString(startUnixStr)).split(',');
    const endDate = formatDate(unixDateToString(endUnixStr));
    eventDates = `${startDate} - ${endDate}`;
  }
  return eventDates;
}

export function buildList(data, block) {
  const list = div({ class: 'list' });
  block.append(list);
  data.forEach((item) => {
    list.append(div({ class: 'item' },
      p({},
        a({ href: item.path, title: item.title },
          item.title,
        ),
      ),
      p({}, `${formatEventDates(item.eventStart, item.eventEnd)} | ${item.eventRegion}`),
    ));
  });
}

export function sortEventsData(events) {
  return events.sort((first, second) => first.eventStart - second.eventStart);
}

export default async function decorate(block) {
  const currentDate = Date.now();

  const events = await ffetch('/query-index.json')
    .sheet('events')
    .filter((item) => item.eventEnd * 1000 > currentDate)
    .all();

  const sortedEvents = sortEventsData(events).slice(0, 4);

  buildList(sortedEvents, block);
}
