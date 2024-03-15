import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
// eslint-disable-next-line object-curly-newline
import { article, a, div, p } from '../../scripts/dom-helpers.js';
import { formatDate, unixDateToString } from '../../scripts/scripts.js';

export function buildList(data, block) {
  data.forEach((item, idx) => {
    let dateLine = formatDate(unixDateToString(item.date));
    if (item.publisher) dateLine += ` | ${item.publisher}`;
    block.append(article({},
      div({ class: 'image' },
        a({ href: item.path, title: item.title },
          createOptimizedPicture(item.image, item.title, (idx === 0), [{ width: '500' }]),
        ),
      ),
      div({ class: 'title' },
        p({}, dateLine),
        p({}, a({ href: item.path, title: item.title }, item.title)),
      ),
    ));
  });
}

export default async function decorate(block) {
  const data = await ffetch('/query-index.json')
    .sheet('news')
    .chunks(5)
    .limit(3)
    .all();
  buildList(data, block);
}
