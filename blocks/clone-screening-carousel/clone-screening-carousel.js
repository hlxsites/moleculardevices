import carouselDecorate from '../carousel/carousel.js';

export default async function decorate(block) {
  carouselDecorate(block);
  block.classList.add('carousel');
  block.parentElement.classList.add('carousel-wrapper');
}
