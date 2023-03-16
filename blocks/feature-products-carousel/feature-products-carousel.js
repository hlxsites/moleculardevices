import createCarousel from '../carousel/carousel.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const cssPromise = new Promise((resolve) => {
    loadCSS('/blocks/carousel/carousel.css', (e) => resolve(e));
  });
  createCarousel(block);
  await cssPromise;
}