import ffetch from '../../scripts/ffetch.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';

async function getFeaturedResources(paths) {
  return ffetch('/query-index.json')
    .sheet('resources')
    .chunks(2000)
    .filter(
      (resource) => (
        paths.includes(resource.path)
        || paths.includes(resource.gatedURL)
        || (resource.gatedURL
          && resource.gatedURL !== '0'
          && paths.includes(new URL(resource.gatedURL, 'https://moleculardevices.com').pathname))
      ))
    .limit(9)
    .all();
}

export default async function decorate(block) {
  const blockLinks = block.querySelectorAll('a');
  let resources = [];

  if (blockLinks.length !== 0) {
    resources = await getFeaturedResources(
      [...blockLinks].map((link) => link.getAttribute('href')),
    );
  }

  const placeholders = await fetchPlaceholders();

  const cardRenderer = await createCard({
    titleLink: false,
    thumbnailLink: false,
    defaultButtonText: placeholders.learnMore || 'Learn more',
    descriptionLength: 180,
  });

  await createCarousel(
    block,
    resources,
    {
      defaultStyling: true,
      cardStyling: true,
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
