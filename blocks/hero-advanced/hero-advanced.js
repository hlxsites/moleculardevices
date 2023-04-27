import { decorateIcons } from '../../scripts/lib-franklin.js';
import { i, div, a } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../fragment/fragment.js';
import { getVideoId, buildVideo } from '../vidyard/video-create.js';
import { buildHero } from '../hero/hero.js';

async function openMediaGallery(overlay) {
  const content = div({ class: 'overlay-content' });
  const carousel = div({ class: 'overlay-carousel' });
  overlay.appendChild(content);
  content.appendChild(carousel);

  const close = a({ class: 'close' }, (i({ class: 'fa fa-close' })));
  close.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  const right = a({ class: 'right' }, (i({ class: 'fa fa-chevron-circle-right' })));
  right.addEventListener('click', () => {
    carousel.scrollTo({ top: 0, left: carousel.scrollLeft + carousel.parentElement.offsetWidth, behavior: 'smooth' });
  });
  const left = a({ class: 'left' }, (i({ class: 'fa fa-chevron-circle-left' })));
  left.addEventListener('click', () => {
    carousel.scrollTo({ top: 0, left: carousel.scrollLeft - carousel.parentElement.offsetWidth, behavior: 'smooth' });
  });
  content.append(close, right, left);
  decorateIcons(content);

  const fragment = await loadFragment('/fragments/media-gallery/products/spectramax-i3x-readers');
  [...fragment.children].forEach((section) => {
    carousel.appendChild(section);
  });

  overlay.classList.add('open');
}

export default async function decorate(block) {
  const h1 = block.querySelector('h1');

  const desktop = block.querySelector('div');
  h1.parentNode.insertBefore(desktop.querySelector('div:nth-child(2)'), h1);
  desktop.remove();

  const mobile = block.querySelector('div');
  h1.parentNode.insertBefore(mobile.querySelector('div:nth-child(2)'), h1.nextSibling);
  mobile.remove();

  const rightCol = block.querySelector('div > div:nth-child(2)');
  if (getVideoId(rightCol.textContent)) {
    rightCol.classList.add('video-column');
    buildVideo(block, rightCol, getVideoId(rightCol.textContent));
  }

  buildHero(block);

  const mgs = block.querySelectorAll('a[href*="/media-gallery"]');
  [...mgs].forEach((mg) => {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    mg.parentElement.appendChild(overlay);
    mg.addEventListener('click', () => {
      openMediaGallery(overlay);
    });
    mg.href = '#';
  });
}
