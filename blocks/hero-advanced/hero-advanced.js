// eslint-disable-next-line object-curly-newline
import { div, a, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { loadFragment } from '../fragment/fragment.js';
import { getVideoId, buildVideo } from '../vidyard/video-create.js';
import { buildHero } from '../hero/hero.js';

async function openMediaGallery(mg) {
  const overlay = mg.parentElement.querySelector('.overlay');
  if (overlay) overlay.classList.add('open');
}

async function buildMediaGallery(mg) {
  // container
  const overlay = div({ class: 'overlay' });
  const content = div({ class: 'overlay-content' });
  const carousel = div({ class: 'overlay-carousel' });
  mg.after(overlay);
  overlay.appendChild(content);
  content.appendChild(carousel);

  // buttons
  const close = a({ class: 'close' }, (span({ class: 'icon icon-close-video' })));
  close.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  const right = a({ class: 'right' }, (span({ class: 'icon icon-chevron-right' })));
  right.addEventListener('click', () => {
    carousel.scrollTo({ top: 0, left: carousel.scrollLeft + carousel.parentElement.offsetWidth, behavior: 'smooth' });
  });
  const left = a({ class: 'left' }, (span({ class: 'icon icon-chevron-left' })));
  left.addEventListener('click', () => {
    carousel.scrollTo({ top: 0, left: carousel.scrollLeft - carousel.parentElement.offsetWidth, behavior: 'smooth' });
  });
  content.append(close, right, left);
  decorateIcons(content);

  // fragment
  const url = new URL(mg.href);
  const fragment = await loadFragment(url.pathname);
  [...fragment.children].forEach((section) => {
    carousel.appendChild(section);
  });
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

  const mg = block.querySelector('a[href*="/media-gallery"]');
  if (mg) {
    // buildMediaGallery(mg);
    mg.addEventListener('click', () => {
      openMediaGallery(mg);
    });
    mg.href = '#';
  }
}
