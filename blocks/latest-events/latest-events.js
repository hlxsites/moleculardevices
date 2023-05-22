import ffetch from '../../scripts/ffetch.js';
// eslint-disable-next-line object-curly-newline
import { a, div, p } from '../../scripts/dom-helpers.js';

export function formatDate(startDate, endDate) {
  const startDateObj = new Date(Date.UTC(0, 0, 0, 0, 0, startDate));
  const endDateObj = new Date(Date.UTC(0, 0, 0, 0, 0, endDate));
  return `${startDateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
    - ${endDateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', })}`;
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
      p({}, `${formatDate(item.eventStart, item.eventEnd)} | ${item.eventRegion}`),
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
