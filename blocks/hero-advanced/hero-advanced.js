import { isVideo, buildVideo } from '../../scripts/scripts.js';
import { buildHero } from '../hero/hero.js';

export default async function decorate(block) {
  const h1 = block.querySelector('h1');

  const desktop = block.querySelector('div');
  h1.parentNode.insertBefore(desktop.querySelector('div:nth-child(2)'), h1);
  desktop.remove();

  const mobile = block.querySelector('div');
  h1.parentNode.insertBefore(mobile.querySelector('div:nth-child(2)'), h1.nextSibling);
  mobile.remove();

  const links = block.querySelectorAll('a');
  [...links].forEach((link) => {
    const url = new URL(link);
    if (isVideo(url)) {
      buildVideo(block, link.parentNode, url);
    }
  }); 

  buildHero(block);
}
