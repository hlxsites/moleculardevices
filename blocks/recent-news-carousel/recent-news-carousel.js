import { getBlogAndPublications } from '../../templates/blog/blog.js';
import { createRecentResourceCarousel } from '../recent-blogs-carousel/recent-blogs-carousel.js';

export default async function decorate(block) {
  let data = await getBlogAndPublications();
  data = data.slice(0, 7);
  await createRecentResourceCarousel(block, data);
}
