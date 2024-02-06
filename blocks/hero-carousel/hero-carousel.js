import { createCarousel } from '../carousel/carousel.js';

export default async function decorate(block) {
  createCarousel(block, [...block.children], {
    defaultStyling: true,
    navButtons: true,
    autoScroll: false,
  });
}
