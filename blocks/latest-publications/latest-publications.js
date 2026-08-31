import { getData } from '../../scripts/scripts.min.js';
import { buildList } from '../latest-news/latest-news.js';

export default async function decorate(block) {
  const data = await getData();
  const publications = data.publications.slice(0, 4);

  buildList(publications, block);
}
