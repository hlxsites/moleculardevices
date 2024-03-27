import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';

export default async function decorate(block) {
  let publications = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Publication')
    .limit(6)
    .all();

  publications = publications.filter(
    (publication) => publication.path !== window.location.pathname).slice(0, 5);
  const publicationCard = await createCard();

  await createCarousel(
    block,
    publications,
    {
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
        }, {
          items: 3,
        },
      ],
      cardRenderer: publicationCard,
    },
  );
}
