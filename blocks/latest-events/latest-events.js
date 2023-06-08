import ffetch from '../../scripts/ffetch.js';
import { formatDateUTCSeconds } from '../../scripts/scripts.js';
// eslint-disable-next-line object-curly-newline
import { a, div, p } from '../../scripts/dom-helpers.js';

export function formatEventDates(startUnixStr, endUnixStr) {
  let eventDates = '';
  if (startUnixStr && endUnixStr) {
    let startDate = formatDateUTCSeconds(startUnixStr);
    // eslint-disable-next-line prefer-destructuring
    startDate = startDate.split(',')[0];
    const endDate = formatDateUTCSeconds(endUnixStr);
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
  const data = await ffetch('/query-index.json')
    .sheet('events')
    .chunks(5)
    .limit(4)
    .all();
  buildList(data, block);
}
