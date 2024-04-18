import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';

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
