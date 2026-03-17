import { cardStyleConfig, createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { getBlogAndPublications } from '../../templates/blog/blog.js';

export async function createRecentResourceCarousel(block, data) {
  const cardRenderer = await createCard({
    isBlogCarousel: true,
  });
  const resources = data
    .filter((resource) => resource.path !== window.location.pathname)
    .slice(0, 6);
  await createCarousel(block, resources, {
    ...cardStyleConfig,
    cardRenderer,
  });
}

export default async function decorate(block) {
  block.classList.add('cards');
  let data = await getBlogAndPublications();
  data = data.slice(0, 7);
  await createRecentResourceCarousel(block, data);
}
