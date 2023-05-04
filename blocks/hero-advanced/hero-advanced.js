import { isVideo, loadScript } from '../../scripts/scripts.js';
// eslint-disable-next-line object-curly-newline
import { div, a, span, img } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { loadFragment } from '../fragment/fragment.js';
import { buildHero } from '../hero/hero.js';

async function openMediaGallery(mg) {
  const overlay = mg.parentElement.querySelector('.overlay');
  if (overlay) overlay.classList.add('open');
}

async function buildMediaGallery(mg) {
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
  const scroll = (leftScroll) => carousel.scrollTo({ top: 0, left: leftScroll, behavior: 'smooth' });
  close.addEventListener('click', () => { overlay.classList.remove('open'); });
  right.addEventListener('click', () => { scroll(carousel.scrollLeft + carousel.parentElement.offsetWidth); });
  left.addEventListener('click', () => { scroll(carousel.scrollLeft - carousel.parentElement.offsetWidth); });

  const url = new URL(mg.href);
  const fragment = await loadFragment(url.pathname);
  [...fragment.children].forEach((section, i) => {
    const h3 = section.querySelector('h3');
    if (h3) h3.textContent = `${i + 1} of ${i + fragment.childElementCount} ${h3.textContent}`;
    carousel.appendChild(section);
  });
}

export function videoButton(container, button, url) {
  const videoId = url.pathname.split('/').at(-1).trim();
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadScript('https://play.vidyard.com/embed/v4.js');
      const overlay = div({ id: 'overlay' }, div({
        class: 'vidyard-player-embed', 'data-uuid': videoId, 'dava-v': '4', 'data-type': 'lightbox', 'data-autoplay': '2',
      }));
      container.prepend(overlay);
      button.addEventListener('click', () => {
        // eslint-disable-next-line no-undef
        VidyardV4.api.getPlayersByUUID(videoId)[0].showLightbox();
      });
    }
  });
  observer.observe(container);
}

export default async function decorate(block) {
  const h1 = block.querySelector('h1');
  const desktop = block.querySelector('div');
  h1.parentNode.insertBefore(desktop.querySelector('div:nth-child(2)'), h1);
  desktop.remove();
  const mobile = block.querySelector('div');
  h1.parentNode.insertBefore(mobile.querySelector('div:nth-child(2)'), h1.nextSibling);
  mobile.remove();
  [...block.querySelectorAll('a')].forEach((link) => {
    const url = new URL(link);
    if (isVideo(url)) {
      const container = link.parentElement;
      container.classList.add('video-column');
      const videoIcon = div({ class: 'video-icon' }, img({ src: '/images/play_icon.png' }));
      container.appendChild(videoIcon);
      videoButton(container, container.querySelector('img'), url);
      link.remove();
    }
  });
  buildHero(block);
  const mg = block.querySelector('a[href*="/media-gallery"]');
  if (mg) {
    buildMediaGallery(mg);
    mg.addEventListener('click', () => { openMediaGallery(mg); });
    mg.href = '#';
  }
}
