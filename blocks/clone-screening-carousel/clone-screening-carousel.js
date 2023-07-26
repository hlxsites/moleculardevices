import { createCarousel } from '../carousel/carousel.js';

export default async function decorate(block) {
  console.log('carousel screening decorate', block);

  await createCarousel(block);
  block.classList.add('carousel');
  block.parentElement.classList.add('carousel-wrapper');

  // eslint-disable-next-line max-len
  // , [...block.children], { cssFiles: ['/blocks/carousel/carousel.css', '/blocks/clone-screening-carousel/clone-screening-carousel.css'] });
}
