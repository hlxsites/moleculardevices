import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import ffetch from '../../scripts/ffetch.js';
import { getCountryCode, sortDataByTitle } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));
  const isCountryCodeUS = await getCountryCode() === 'US';
  const cardRenderer = await createCard({
    titleLink: false,
    thumbnailLink: false,
    c2aLinkStyle: true,
    isShopifyCard: isCountryCodeUS,
    isRequestQuoteCard: !isCountryCodeUS,
  });

  let fragments;
  if (isCountryCodeUS) {
    fragments = await ffetch('/query-index.json')
      .sheet('applications')
      .filter((frag) => fragmentPaths.includes(frag.path))
      .all();
  } else {
    fragments = await ffetch('/query-index.json')
      .filter((frag) => fragmentPaths.includes(frag.path))
      .all();
  }

  await createCarousel(
    block,
    sortDataByTitle(fragments),
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
