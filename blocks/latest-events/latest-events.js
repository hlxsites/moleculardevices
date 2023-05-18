import ffetch from '../../scripts/ffetch.js';
// eslint-disable-next-line object-curly-newline
import { a, div, p } from '../../scripts/dom-helpers.js';

export function formatDate(startDate, endDate) {
  const startDateObj = new Date(0);
  startDateObj.setUTCSeconds(startDate);
  const endDateObj = new Date(0);
  endDateObj.setUTCSeconds(endDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[startDateObj.getMonth()];
  const endMonth = months[endDateObj.getMonth()];
  const startDay = startDateObj.getDate() + 1;
  const endDay = endDateObj.getDate() + 1;
  const year = startDateObj.getFullYear();
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
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
