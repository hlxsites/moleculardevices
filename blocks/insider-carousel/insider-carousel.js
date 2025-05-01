// import { addLinkIcon } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';

const styleConfig = {
  defaultStyling: true,
  autoScroll: false,
  visibleItems: [
    {
      items: 1,
    },
  ],
};

export default async function decorate(block) {
  createCarousel(block, [...block.children], styleConfig);
}
