import ffetch from '../../scripts/ffetch.js';
import { createRecentResourceCarousel } from '../recent-blogs-carousel/recent-blogs-carousel.js';

export default async function decorate(block) {
  let data = [];
  const publications = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Publication' && resource.publicationType === 'Full Article')
    .limit(7)
    .all();

  const blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .limit(7)
    .all();

  data = [...publications, ...blogs];

  data.sort((x, y) => {
    if (x.date > y.date) {
      return -1;
    }
    if (x.date < y.date) {
      return 1;
    }
    return 0;
  });
  data = data.slice(0, 7);

  await createRecentResourceCarousel(block, data);
}
