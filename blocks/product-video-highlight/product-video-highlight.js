import {
  span,
} from '../../scripts/dom-helpers.js';

import {
  buildBlock, decorateBlock, decorateIcons, loadBlock,
} from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  block.style = `grid-template-rows: repeat(${Math.max(block.children.length - 1, 3)}, auto);`;

  await Promise.all([...block.children].map(async (child, idx) => {
    child.classList.add(idx ? 'related' : 'main');

    if (child.querySelector('a[href*="ceros.com')) {
      const cerosBlock = buildBlock(
        'ceros', [[child.children[0].children[0], child.children[0].children[1]]],
      );
      child.children[0].prepend(cerosBlock);
      decorateBlock(cerosBlock);
      await loadBlock(cerosBlock);
    }
  }));

  const seeMoreVideos = block.querySelector('a[title="See more videos"]');
  if (seeMoreVideos) {
    seeMoreVideos.appendChild(span({ class: 'icon icon-chevron-right-outline' }));
    block.parentElement.appendChild(seeMoreVideos.parentElement);
    decorateIcons(seeMoreVideos);
  }
}
