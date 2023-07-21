import { a, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { loadFragment } from '../fragment/fragment.js';

export function openMediaGallery(mg) {
  const overlay = mg.parentElement.querySelector('.overlay');
  if (overlay) overlay.classList.add('open');
}

export async function buildMediaGallery(mg) {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  const content = document.createElement('div');
  content.classList.add('overlay-content');
  const carousel = document.createElement('div');
  carousel.classList.add('overlay-carousel');
  overlay.appendChild(content);
  content.appendChild(carousel);
  mg.after(overlay);

  const close = a({ class: 'close' }, (span({ class: 'icon icon-close-video' })));
  const right = a({ class: 'right' }, (span({ class: 'icon icon-chevron-right' })));
  const left = a({ class: 'left' }, (span({ class: 'icon icon-chevron-left' })));
  carousel.after(close, right, left);
  decorateIcons(carousel.parentElement);
  const wrapper = carousel.parentElement;
  const scroll = (leftScroll) => {
    let resultingLeftScroll = leftScroll;
    if (leftScroll < -100) {
      resultingLeftScroll = leftScroll + wrapper.offsetWidth * carousel.children.length;
    } else if (leftScroll + wrapper.offsetWidth > wrapper.offsetWidth * carousel.children.length) {
      resultingLeftScroll = 0;
    }
    carousel.scrollTo({ top: 0, left: resultingLeftScroll, behavior: 'smooth' });
  };
  close.addEventListener('click', () => { overlay.classList.remove('open'); });
  right.addEventListener('click', () => { scroll(carousel.scrollLeft + wrapper.offsetWidth); });
  left.addEventListener('click', () => { scroll(carousel.scrollLeft - wrapper.offsetWidth); });

  const url = new URL(mg.href);
  const fragment = await loadFragment(url.pathname);
  [...fragment.children].forEach((section, i) => {
    const h3 = section.querySelector('h3');
    if (h3) h3.textContent = `${i + 1} of ${i + fragment.childElementCount} ${h3.textContent}`;
    carousel.appendChild(section);
  });
}

export default async function decorate(block) {
  const mgLink = block.querySelector('a[href*="/media-gallery"]');
  const mgPictures = block.querySelectorAll('picture');
  if (mgLink) {
    await buildMediaGallery(mgLink);
    mgLink.addEventListener('click', () => { openMediaGallery(mgLink); });
    mgLink.href = '#';
    if (mgPictures.length > 0) {
      mgLink.textContent = '';
      mgPictures.forEach((mgPicture) => mgLink.append(mgPicture));
    }
  }
}
