import { loadCSS } from '../../scripts/lib-franklin.js';
import createLightboxCarousel from './lightbox-carousel.js';

function createImagePreviewCard(parent) {
  const children = Array.from(parent.children);
  const count = children.length;

  const layoutMap = {
    'showcase-left': 0,
    'showcase-center': Math.floor(count / 2),
    'showcase-right': count - 1,
  };

  Object.entries(layoutMap).forEach(([cls, index]) => {
    if (parent.classList.contains(cls) && children[index]) {
      children[index].classList.add('full-image');
    }
  });

  children.forEach((item, i) => {
    item.classList.add('gallery-image', `gallery-image-${i + 1}`);
    item.querySelector('p:last-child').classList.add('text-caption');
  });

  return parent;
}

export default async function decorate(block) {
  loadCSS('./lightbox-carousel.css');
  const wrapper = createImagePreviewCard(block);
  createLightboxCarousel(wrapper);
}
