import ffetch from '../../scripts/ffetch.js';
import { getMetadata } from '../../scripts/lib-franklin.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';

const relatedResourcesHeaders = {
  Product: 'relatedProducts',
  Technology: 'relatedTechnologies',
  Application: 'relatedApplications',
};
const relatedResourcesExcludedTypes = ['Interactive Demo'];

export default async function decorate(block) {
  const template = getMetadata('template');
  const title = document.querySelector('.hero-advanced .container h1').textContent;

  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource[relatedResourcesHeaders[template]].includes(title)
        && !relatedResourcesExcludedTypes.includes(resource.type))
    .limit(9)
    .all();

  const resourceCard = await createCard({
    defaultButtonText: 'Learn more',
  });
  await createCarousel(
    block,
    resources,
    {
      defaultStyling: true,
      navButtons: true,
      dotButtons: false,
      infiniteScroll: true,
      autoScroll: false,
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
      cardRenderer: resourceCard,
    },
  );
}
