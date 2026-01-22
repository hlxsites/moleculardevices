/* eslint-disable import/no-cycle */
import ffetch from '../../scripts/ffetch.js';
import { createRecentResourceCarousel } from '../recent-blogs-carousel/recent-blogs-carousel.js';

export async function getBlogsAndPublications() {
  let data = [];
  const publications = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Publication' && resource.publicationType === 'Full Article')
    .all();

  const blogs = await ffetch('/query-index.json')
    .sheet('blog')
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
  return data;
}

export default async function decorate(block) {
  let data = await getBlogAndPublications();
  data = data.slice(0, 7);
  await createRecentResourceCarousel(block, data);
}
