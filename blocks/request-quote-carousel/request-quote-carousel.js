import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import ffetch from '../../scripts/ffetch.js';
import { sortDataByTitle } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const fragmentPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));
  if (!localStorage.getItem('ipstack:geolocation')) {
    return;
  }

  let fragments;
  let cardRenderer;
  const isCountryCodeUS = JSON.parse(localStorage.getItem('ipstack:geolocation')).country_code === 'US';
  const cardConfig = {
    titleLink: false,
    thumbnailLink: false,
    c2aLinkStyle: true,
  };

  if (isCountryCodeUS) {
    console.log('US');
    fragments = await ffetch('/query-index.json')
      .sheet('applications')
      .filter((frag) => fragmentPaths.includes(frag.path))
      .all();
    cardRenderer = await createCard({
      ...cardConfig,
      isShopifyCard: true,
    });
  } else {
    console.log('IN');
    fragments = await ffetch('/query-index.json')
      .filter((frag) => fragmentPaths.includes(frag.path))
      .all();
    cardRenderer = await createCard({
      ...cardConfig,
      isRequestQuoteCard: true,
    });
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
