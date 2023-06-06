import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';

export default async function decorate(block) {
  const productPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));
  const products = await ffetch('/query-index.json')
    .sheet('products')
    .filter((product) => productPaths.includes(product.path))
    .all();

  const cardRenderer = await createCard({
    titleLink: false,
    thumbnailLink: false,
    defaultButtonText: 'Details',
    c2aLinkStyle: true,
  });

  await createCarousel(
    block,
    products,
    {
      defaultStyling: true,
      navButtons: window.matchMedia('only screen and (max-width: 767px)').matches || products.length > 3,
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
