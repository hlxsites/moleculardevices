import { buildHero } from '../hero/hero.js';
import { getVideoId, buildVideo } from '../vidyard/video-create.js';

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
}
