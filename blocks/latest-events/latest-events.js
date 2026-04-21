/* eslint-disable import/no-cycle */
import { getData } from '../../scripts/scripts.js';
import { a, div, p } from '../../scripts/dom-helpers.js';
import { formatEventDateRange, unixToDate } from '../../scripts/list.js';

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
      p({}, `${formatEventDateRange(unixToDate(item.eventStart), unixToDate(item.eventEnd))} | ${item.eventRegion}`),
    ));
  });
}

export default async function decorate(block) {
  const { events } = await getData();
  const sortedEvents = events.slice(0, 4);
  buildList(sortedEvents, block);
}
