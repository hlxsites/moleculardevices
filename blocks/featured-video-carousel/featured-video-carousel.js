import ffetch from '../../scripts/ffetch.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { createCard } from '../card/card.js';
import { createCarousel } from '../carousel/carousel.js';

const placeholders = await fetchPlaceholders();

const cardRenderer = await createCard({
  titleLink: false,
  thumbnailLink: false,
  defaultButtonText: placeholders.learnMore || 'Learn more',
  c2aLinkStyle: true,
  hideDescription: true,
});

export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));
  const pressItems = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => links.includes(resource.path)
      || links.includes(resource.gatedURL)
      || (resource.gatedURL && resource.gatedURL !== '0' && links.includes(new URL(resource.gatedURL, 'https://moleculardevices.com').pathname)),
    )
    .all();

  await createCarousel(
    block,
    pressItems,
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
      cardRenderer,
    },
  );
}
