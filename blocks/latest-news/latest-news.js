import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
// eslint-disable-next-line object-curly-newline
import { article, a, div, p } from '../../scripts/dom-helpers.js';

export function formatDate(date) {
  const dateObj = new Date(0);
  dateObj.setUTCSeconds(date);
  const year = dateObj.getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate() + 1;
  return `${month} ${day}, ${year}`;
}

export function buildList(data, block) {
  data.forEach((item, idx) => {
    block.append(article({},
      div({},
        a({ href: item.path, title: item.title },
          createOptimizedPicture(item.image, item.title, (idx === 0), [{ width: '500' }]),
        ),
      ),
      div({},
        p({}, formatDate(item.date)),
        p({}, a({ href: item.path, title: item.title }, item.title)),
      ),
    ));
  });
}

export default async function decorate(block) {
  const data = await ffetch('/query-index.json')
    .sheet('news')
    .limit(3)
    .all();
  buildList(data, block);
}
