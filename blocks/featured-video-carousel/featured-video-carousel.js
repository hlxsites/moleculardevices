import ffetch from '../../scripts/ffetch.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { createCard } from '../card/card.js';
import { cardStyleConfig, createCarousel } from '../carousel/carousel.js';

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
      ...cardStyleConfig,
      cardRenderer,
    },
  );
}
