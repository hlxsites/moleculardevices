import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { p } from '../../scripts/dom-helpers.js';
import createCompareProducts from '../../templates/compare-items/compare-items.js';

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
      navButtons: window.matchMedia('only screen and (max-width: 1200px)').matches || products.length > 3,
      dotButtons: false,
      infiniteScroll: products.length > 3,
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

  const main = document.querySelector('main');
  const compareProducts = await createCompareProducts({
    maxCompareItemsCount: 3,
  });

  const compareBanner = await compareProducts.createBanner();

  // insert compare banner at the bottom of the page
  main.append(compareBanner.render());

  const cards = document.querySelectorAll('.card-caption-notshow');
  cards.forEach((card) => {
    const compareButton = p(
      { class: 'button-container compare' },
      'Compare',
    );

    card.append(
      compareButton,
    );

    compareButton.addEventListener('click', () => {
      const productUrl = card.querySelector('a').getAttribute('href');
      const productTitle = card.querySelector('h3').textContent;

      // check if compare is already active
      if (compareProducts.hasItem(productTitle)) {
        compareButton.classList.remove('active');
        compareProducts.removeItem(productTitle);
        if (compareProducts.isEmpty()) {
          compareProducts.banner.hide();
        }
        return;
      }

      if (compareProducts.isFull()) {
        compareProducts.showItemCountWarning();
        return;
      }

      compareButton.classList.remove('active');
      compareProducts.addItem(productUrl, productTitle);
      compareProducts.banner.show();
    });
  });
}
