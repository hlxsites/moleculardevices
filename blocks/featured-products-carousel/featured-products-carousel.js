import { addLinkIcon } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';

const miniStyleConfig = {
  defaultStyling: true,
  navButtons: false,
  dotButtons: false,
  infiniteScroll: true,
  autoScroll: false,
  counter: true,
  counterText: 'Product',
  visibleItems: [
    {
      items: 1,
    },
  ],
};

export default async function decorate(block) {
  const miniStyle = block.classList.contains('mini');
  if (miniStyle) {
    [...block.querySelectorAll('.featured-products-carousel.mini .button-container a')].map((linkItem) => addLinkIcon(linkItem));
    await createCarousel(block, [...block.children], miniStyleConfig);
    return;
  }
  createCarousel(block, [...block.children], {
    defaultStyling: true,
    autoScroll: false,
  });
}
