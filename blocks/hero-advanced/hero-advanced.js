import { buildHero } from '../hero/hero.js';
import { getVideoId, buildVideo } from '../vidyard/video-create.js';
import { loadFragment } from '../fragment/fragment.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { i } from '../../scripts/dom-helpers.js';

function newElement(tagName, className) {
  const element = document.createElement(tagName);
  element.classList.add(className);
  return element;
}

async function openMediaGallery(overlay) {
  const content = newElement('div', 'overlay-content');
  overlay.appendChild(content);
  const carousel = newElement('div', 'overlay-carousel');
  content.appendChild(carousel);

  const closeButton = newElement('a', 'close');
  closeButton.append(i({ class: 'icon icon-close-video' }));
  closeButton.addEventListener('click', () => {
    overlay.classList.remove('open');
  });

  const right = newElement('a', 'right');
  right.append(i({ class: 'fa fa-chevron-circle-right' }));
  right.addEventListener('click', () => {
    carousel.scrollTo({top: 0, left: carousel.parentElement.offsetWidth, behavior: 'smooth'});
  })

  const left = newElement('a', 'left');
  left.append(i({ class: 'fa fa-chevron-circle-left' }));
  left.addEventListener('click', () => {
    carousel.scrollTo({top: 0, left: -carousel.parentElement.offsetWidth, behavior: 'smooth'});
  })

  content.append(closeButton, right, left);
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
    mg.addEventListener('click', (event) => {
      openMediaGallery(overlay);
    });
    mg.removeAttribute('href');
  });
}
