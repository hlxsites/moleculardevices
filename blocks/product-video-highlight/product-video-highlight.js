import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  block.style = `grid-template-rows: repeat(${block.children.length - 1}, auto);`;

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
}
