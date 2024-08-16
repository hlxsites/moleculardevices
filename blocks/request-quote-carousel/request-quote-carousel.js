import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';

export default async function decorate(block) {
  const noDescription = block.classList.contains('no-description');
  const fragmentPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));

  const fragments = await ffetch('/query-index.json')
    .filter((product) => fragmentPaths.includes(product.path))
    .all();

  const sortedFragments = fragments.filter((item) => !!item).sort((x, y) => {
    if (x.title < y.title) {
      return -1;
    }
    if (x.title > y.title) {
      return 1;
    }
    return 0;
  });

  const placeholders = await fetchPlaceholders();

  const cardRenderer = await createCard({
    titleLink: false,
    thumbnailLink: false,
    defaultButtonText: placeholders.requestQuote || 'Request Quote',
    c2aLinkStyle: true,
    hideDescription: noDescription,
    requestQuoteBtn: true,
  });

  await createCarousel(
    block,
    sortedFragments,
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