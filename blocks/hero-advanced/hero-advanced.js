import { isVideo, videoButton } from '../../scripts/scripts.js';
import { buildHero } from '../hero/hero.js';
import { div, img } from '../../scripts/dom-helpers.js';

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
      const videoIcon = div({ class: 'video-icon' });
      const thumbnail = img({ src: '/images/play_icon.png' });
      videoIcon.append(thumbnail);
      link.parentNode.appendChild(videoIcon);
      videoButton(link.parentElement, thumbnail, url);
      link.remove();
    }
  }); 

  buildHero(block);
}
