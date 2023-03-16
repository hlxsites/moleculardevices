import createCarousel from '../carousel/carousel.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

export default function decorate(block) { 
  loadCSS('/blocks/carousel/carousel.css', () => {});
  createCarousel(block);
}