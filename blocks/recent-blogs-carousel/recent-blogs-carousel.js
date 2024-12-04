import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { getBlogAndPublications } from '../../templates/blog/blog.js';

export async function createRecentResourceCarousel(block, data) {
  const cardRenderer = await createCard();
  const resources = data
    .filter((resource) => resource.path !== window.location.pathname)
    .slice(0, 6);
  await createCarousel(block, resources, {
    navButtons: true,
    dotButtons: false,
    infiniteScroll: true,
    autoScroll: false,
    defaultStyling: true,
    visibleItems: [
      {
        items: 1,
        condition: () => window.screen.width < 768,
      },
      {
        items: 2,
        condition: () => window.screen.width < 1200,
      },
      {
        items: 3,
      },
    ],
    cardRenderer,
  });
}

export default async function decorate(block) {
  let data = await getBlogAndPublications();
  data = data.slice(0, 7);
  await createRecentResourceCarousel(block, data);
}
