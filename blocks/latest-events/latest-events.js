/* eslint-disable import/no-cycle */
import { formatDate, getData, unixDateToString } from '../../scripts/scripts.js';
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
  const { events } = await getData();
  const sortedEvents = events.slice(0, 4);
  buildList(sortedEvents, block);
}
