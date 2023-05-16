import ffetch from '../../scripts/ffetch.js';
import { buildList } from '../latest-news/latest-news.js';

export default async function decorate(block) {
  const data = await ffetch('/query-index.json')
    .sheet('publications')
    .limit(4)
    .all();
  buildList(data, block);
}
