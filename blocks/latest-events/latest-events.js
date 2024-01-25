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

export default async function decorate(block) {
  const currentDate = Date.now();

  let events = await ffetch('/query-index.json')
    .sheet('events')
    .all();

  const sortedEvents = events.sort((x, y) => {
    if (x.eventEnd < y.eventEnd) {
      return -1;
    }
    if (x.eventEnd > y.eventEnd) {
      return 1;
    }
    return 0;
  });

  const upcomingEvents = sortedEvents.filter((item) => item.eventEnd * 1000 > currentDate);

  if (upcomingEvents.length > 5) {
    events = upcomingEvents;
  }

  buildList(events.slice(0, 4), block);
}
