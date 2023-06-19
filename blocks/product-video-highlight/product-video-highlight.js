import {
  span, button,
} from '../../scripts/dom-helpers.js';

import {
  buildBlock, decorateBlock, decorateIcons, loadBlock,
} from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  block.style = `grid-template-rows: repeat(${Math.max(block.children.length - 1, 3)}, auto);`;

  await Promise.all([...block.children].map(async (child, idx) => {
    child.classList.add(idx ? 'related' : 'main');

    // vidyard video
    if (child.querySelector('a[href*="vidyard.com"], a[href*="vids.moleculardevices.com"]')) {
      return;
    }

    // ceros demo
    if (child.querySelector('a[href*="ceros.com')) {
      const cerosBlock = buildBlock(
        'ceros', [[child.children[0].children[0], child.children[0].children[1]]],
      );
      child.children[0].prepend(cerosBlock);
      decorateBlock(cerosBlock);
      await loadBlock(cerosBlock);
      return;
    }

    // picture with external reference
    if (child.querySelector('picture') && child.querySelector('a')) {
      const picture = child.querySelector('picture');
      const link = child.querySelector('a');

      if (link.children[0] !== picture) {
        picture.parentElement.remove();
        link.innerHTML = '';
        link.appendChild(picture);
      }

      link.className = '';
      link.classList.add('reference-placeholder');
      link.appendChild(
        button({
          class: 'video-icon',
          'aria-label': 'Open in new tab',
          onclick: (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.open(link.href, '_blank');
          },
        }),
      );
    }
  }));

  const seeMoreVideos = block.querySelector('a[title="See more videos"]');
  if (seeMoreVideos) {
    seeMoreVideos.appendChild(span({ class: 'icon icon-chevron-right-outline' }));
    block.parentElement.appendChild(seeMoreVideos.parentElement);
    decorateIcons(seeMoreVideos);
  }
}
