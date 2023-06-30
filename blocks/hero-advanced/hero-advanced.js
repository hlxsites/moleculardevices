// eslint-disable-next-line object-curly-newline
import { buildHero } from '../hero/hero.js';
import { buildMediaGallery, openMediaGallery } from '../media-gallery/media-gallery.js';

export default async function decorate(block) {
  const h1 = block.querySelector('h1');
  const desktop = block.querySelector('div');
  h1.parentNode.insertBefore(desktop.querySelector('div:nth-child(2)'), h1);
  desktop.remove();
  const mobile = block.querySelector('div');
  h1.parentNode.insertBefore(mobile.querySelector('div:nth-child(2)'), h1.nextSibling);
  mobile.remove();
  buildHero(block);
  const mg = block.querySelector('a[href*="/media-gallery"]');
  if (mg) {
    block.classList.add('media-gallery');
    await buildMediaGallery(mg);
    mg.addEventListener('click', () => { openMediaGallery(mg); });
    mg.href = '#';
  }
}
